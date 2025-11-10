import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/index.js';
import { createLicense, handleRefund, handleChargeback, handleRecurringPayment, handleCancellation } from './licenseService.js';

const prisma = new PrismaClient();

/**
 * Verify JVZoo IPN authenticity using SHA-1 hash
 */
export function verifyJVZooIPN(ipnData, secretKey) {
  const {
    ctransaction,
    cproditem,
    ccustcc,
    ctransaffiliate,
    ctransamount,
    cverify
  } = ipnData;

  // Build verification string
  const verificationString = [
    secretKey,
    ctransaction,
    cproditem,
    ccustcc,
    ctransaffiliate || '',
    ctransamount
  ].join('|');

  // Calculate SHA-1 hash
  const calculatedHash = crypto
    .createHash('sha1')
    .update(verificationString)
    .digest('hex')
    .toUpperCase();

  // Compare with provided hash
  const isValid = calculatedHash === cverify.toUpperCase();

  console.log('IPN Verification:', {
    calculatedHash,
    providedHash: cverify.toUpperCase(),
    isValid
  });

  return isValid;
}

/**
 * Map JVZoo product ID to internal product identifier
 */
export function mapProductId(jvzooProductId) {
  // TODO: Update these mappings with your actual JVZoo product IDs
  const productMapping = {
    // Example mappings - replace with your actual JVZoo product IDs
    '123456': 'adgenius-frontend',      // Front-end offer
    '123457': 'adgenius-pro',           // OTO 1: Pro Unlimited
    '123458': 'adgenius-pro-lite',      // OTO 1 Downsell: Pro Lite
    '123459': 'adgenius-templates',     // OTO 2: Template Library
    '123460': 'adgenius-elite',         // OTO 3: Elite Bundle
    '123461': 'adgenius-agency',        // OTO 4: Agency License
  };

  return productMapping[jvzooProductId] || 'adgenius-default';
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
    ctransaction,
    ctransreceipt,
    cproditem,
    ctransaction_type,
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
      where: { jvzooTransactionId: ctransaction }
    });

    if (existingTransaction) {
      console.log('Transaction already processed:', ctransaction);
      return { alreadyProcessed: true, transaction: existingTransaction };
    }

    // Map product ID
    const productId = mapProductId(cproditem);

    // Determine if recurring
    const isRecurring = ctransaction_type === 'SALE' && productId.includes('recurring');

    let user;
    let license;

    // Handle different transaction types
    switch (ctransaction_type) {
      case 'SALE':
        // Create/find user
        user = await createOrFindUser(ipnData);

        // Create license
        license = await createLicense({
          userId: user.id,
          jvzooTransactionId: ctransaction,
          jvzooReceiptId: ctransreceipt,
          jvzooProductId: cproditem,
          transactionType: ctransaction_type,
          customerEmail: ccustemail,
          purchaseAmount: parseFloat(ctransamount),
          productId,
          isRecurring
        });

        console.log('License created:', license.licenseKey);
        break;

      case 'RFND':
        // Handle refund
        license = await handleRefund(ctransaction);
        console.log('Refund processed for transaction:', ctransaction);
        break;

      case 'CGBK':
        // Handle chargeback
        license = await handleChargeback(ctransaction);
        console.log('Chargeback processed for transaction:', ctransaction);
        break;

      case 'INSTAL':
        // Handle recurring payment
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        license = await handleRecurringPayment(ctransaction, nextBillingDate);
        console.log('Recurring payment processed for transaction:', ctransaction);
        break;

      case 'CANCEL-REBILL':
        // Handle subscription cancellation
        license = await handleCancellation(ctransaction);
        console.log('Subscription cancelled for transaction:', ctransaction);
        break;

      default:
        console.warn('Unknown transaction type:', ctransaction_type);
    }

    // Save transaction to audit log
    const transaction = await prisma.jVZooTransaction.create({
      data: {
        jvzooTransactionId: ctransaction,
        jvzooReceiptId: ctransreceipt,
        transactionType: ctransaction_type,
        jvzooProductId: cproditem,
        customerEmail: ccustemail,
        customerName: ccustname,
        customerCountry: ccustcc,
        customerState: ccuststate,
        amount: ctransamount ? parseFloat(ctransamount) : null,
        affiliateCommission: ctransaffiliate ? parseFloat(ctransaffiliate) : null,
        vendorEarnings: cvendthru ? parseFloat(cvendthru) : null,
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

    // Save failed transaction to audit log
    try {
      await prisma.jVZooTransaction.create({
        data: {
          jvzooTransactionId: ctransaction,
          jvzooReceiptId: ctransreceipt,
          transactionType: ctransaction_type,
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
 * Send welcome email to new JVZoo customer
 */
export async function sendWelcomeEmail(user, license) {
  try {
    // Import email service
    const { sendWelcomeEmail: sendEmail } = await import('./emailService.js');

    // Generate temporary password (since user was created via JVZoo)
    const tempPassword = generateTempPassword();

    // Hash and update password in database
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Map product ID to friendly name
    const productNames = {
      '427079': 'Starter License',
      '427343': 'Pro Unlimited License',
      '427357': 'Elite Bundle License',
      '427368': 'Agency License'
    };

    const productName = productNames[license.productId] || 'AdGenius AI License';

    // Send welcome email
    await sendEmail({
      to: user.email,
      name: user.name,
      email: user.email,
      password: tempPassword,
      productName: productName,
      licenseKey: license.licenseKey
    });

    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Generate a temporary password
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
