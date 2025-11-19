import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/index.js';
import { createLicense, handleRefund, handleChargeback, handleRecurringPayment, handleCancellation } from './licenseService.js';
import { getInternalProductId, getProductDetails } from '../config/productMapping.js';
import { sendWelcomeEmail, sendUpgradeEmail } from './emailService.js';

const prisma = new PrismaClient();

/**
 * Verify JVZoo IPN authenticity using SHA-1 hash
 */
export function verifyJVZooIPN(ipnData, secretKey) {
  const { cverify, ...otherFields } = ipnData;

  // JVZoo Verification Algorithm:
  // 1. Take all POST parameters EXCEPT cverify
  // 2. Sort field names alphabetically
  // 3. Concatenate all values with "|" separator
  // 4. Append secret key at the END
  // 5. Calculate SHA1 hash
  // 6. Take first 8 characters uppercase

  // Sort field names alphabetically
  const sortedKeys = Object.keys(otherFields).sort();

  // Build verification string: value1|value2|...|valueN|secretKey
  const values = sortedKeys.map(key => otherFields[key] || '');
  const verificationString = values.join('|') + '|' + secretKey;

  // Calculate SHA-1 hash
  const fullHash = crypto
    .createHash('sha1')
    .update(verificationString, 'utf8')
    .digest('hex')
    .toUpperCase();

  // JVZoo uses only the FIRST 8 characters of the hash
  const calculatedHash = fullHash.substring(0, 8);

  // Compare with provided hash
  const isValid = calculatedHash === cverify.toUpperCase();

  console.log('IPN Verification:', {
    sortedKeys,
    verificationString: verificationString.substring(0, 100) + '...',
    fullHash,
    calculatedHash,
    providedHash: cverify.toUpperCase(),
    isValid
  });

  return isValid;
}

/**
 * Create or find user from JVZoo purchase
 */
export async function createOrFindUser(ipnData) {
  const {
    ccustemail,
    ccustname,
    ccustcc,
    ctransaction
  } = ipnData;

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: ccustemail }
    });

    if (user) {
      console.log('Existing user found:', user.email);

      // Update JVZoo info if not set
      if (!user.jvzooCustomerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            jvzooCustomerId: ccustemail, // Use email as customer ID
            jvzooTransactionId: user.jvzooTransactionId || ctransaction,
            createdVia: user.createdVia || 'jvzoo'
          }
        });
      }

      return user;
    }

    // Create new user
    const nameParts = (ccustname || 'Customer').split(' ');
    const firstName = nameParts[0] || 'Customer';
    const fullName = ccustname || 'JVZoo Customer';

    user = await prisma.user.create({
      data: {
        email: ccustemail,
        name: fullName,
        password: null, // Will set on first login
        createdVia: 'jvzoo',
        jvzooCustomerId: ccustemail,
        jvzooTransactionId: ctransaction,
        emailVerified: true, // Auto-verify JVZoo purchases
        // Set default preferences
        preferredImageModel: 'gemini',
        imageQuality: 'standard',
        defaultTone: 'professional yet approachable',
        defaultAspectRatio: 'square',
        defaultModel: 'gpt-4o-2024-08-06',
        theme: 'clean-slate',
        themeMode: 'light'
      }
    });

    console.log('New user created from JVZoo purchase:', user.email);
    return user;
  } catch (error) {
    console.error('Error creating/finding user:', error);
    throw error;
  }
}

/**
 * Process JVZoo IPN transaction
 */
export async function processTransaction(ipnData) {
  const {
    ctransaction,        // This is the transaction TYPE (SALE, RFND, etc.)
    ctransreceipt,       // This is the transaction ID
    cproditem,
    ccustemail,
    ccustname,
    ccustcc,
    ccuststate,
    ctransamount,
    ctransaffiliate,
    caffitid,
    cvendthru
  } = ipnData;

  try {
    // Check if already processed (idempotency)
    const existingTransaction = await prisma.jVZooTransaction.findUnique({
      where: { jvzooTransactionId: ctransreceipt }
    });

    if (existingTransaction) {
      console.log('Transaction already processed:', ctransreceipt);
      return { alreadyProcessed: true, transaction: existingTransaction };
    }

    // Map product ID
    const productId = getInternalProductId(cproditem);

    // Determine if recurring
    const isRecurring = ctransaction === 'SALE' && productId.includes('recurring');

    let user;
    let license;

    // Handle different transaction types
    switch (ctransaction) {
      case 'SALE':
        // Create/find user
        user = await createOrFindUser(ipnData);

        // Create license
        license = await createLicense({
          userId: user.id,
          jvzooTransactionId: ctransreceipt,
          jvzooReceiptId: ctransreceipt,
          jvzooProductId: cproditem,
          transactionType: ctransaction,
          customerEmail: ccustemail,
          purchaseAmount: parseFloat(ctransamount),
          productId,
          isRecurring
        });

        console.log('License created:', license.licenseKey);
        
        // Send appropriate email (Welcome vs Upgrade)
        if (!user.password) {
           await sendWelcomeEmail(user, license);
        } else {
           await sendUpgradeEmail({
             to: user.email,
             name: user.name,
             productName: getProductDetails(license.productId)?.name,
             licenseKey: license.licenseKey
           });
        }
        
        break;

      case 'RFND':
        // Handle refund
        license = await handleRefund(ctransreceipt);
        console.log('Refund processed for transaction:', ctransreceipt);
        break;

      case 'CGBK':
        // Handle chargeback
        license = await handleChargeback(ctransreceipt);
        console.log('Chargeback processed for transaction:', ctransreceipt);
        break;

      case 'INSTAL':
        // Handle recurring payment
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        license = await handleRecurringPayment(ctransreceipt, nextBillingDate);
        console.log('Recurring payment processed for transaction:', ctransreceipt);
        break;

      case 'CANCEL-REBILL':
        // Handle subscription cancellation
        license = await handleCancellation(ctransreceipt);
        console.log('Subscription cancelled for transaction:', ctransreceipt);
        break;

      default:
        console.warn('Unknown transaction type:', ctransaction);
    }

    // Parse vendorEarnings
    let vendorEarnings = null;
    if (cvendthru) {
      if (typeof cvendthru === 'number') {
        vendorEarnings = cvendthru;
      } else if (typeof cvendthru === 'string') {
        const numMatch = cvendthru.match(/[\d.]+/);
        if (numMatch) {
          vendorEarnings = parseFloat(numMatch[0]);
        }
      }
    }

    // Save transaction to audit log
    const transaction = await prisma.jVZooTransaction.create({
      data: {
        jvzooTransactionId: ctransreceipt,
        jvzooReceiptId: ctransreceipt,
        transactionType: ctransaction,
        jvzooProductId: cproditem,
        customerEmail: ccustemail,
        customerName: ccustname,
        customerCountry: ccustcc,
        customerState: ccuststate,
        amount: ctransamount ? parseFloat(ctransamount) : null,
        affiliateCommission: ctransaffiliate ? parseFloat(ctransaffiliate) : null,
        vendorEarnings: vendorEarnings,
        verificationHash: ipnData.cverify,
        verified: true,
        processed: true,
        processedAt: new Date(),
        rawIpnData: ipnData,
        userId: user?.id || null
      }
    });

    return {
      success: true,
      transaction,
      user,
      license
    };
  } catch (error) {
    console.error('Error processing transaction:', error);

    try {
      await prisma.jVZooTransaction.create({
        data: {
          jvzooTransactionId: ctransreceipt,
          jvzooReceiptId: ctransreceipt,
          transactionType: ctransaction,
          jvzooProductId: cproditem,
          customerEmail: ccustemail,
          customerName: ccustname,
          customerCountry: ccustcc,
          customerState: ccuststate,
          amount: ctransamount ? parseFloat(ctransamount) : null,
          verificationHash: ipnData.cverify,
          verified: true,
          processed: false,
          processingError: error.message,
          rawIpnData: ipnData
        }
      });
    } catch (auditError) {
      console.error('Error saving failed transaction to audit log:', auditError);
    }

    throw error;
  }
}

/**
 * Export email functions
 */
export { sendWelcomeEmail, sendUpgradeEmail };
