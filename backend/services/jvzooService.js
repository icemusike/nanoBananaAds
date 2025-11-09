/**
 * AdGenius AI - JVZoo Integration Service
 *
 * Handles JVZoo IPN (Instant Payment Notifications) for license management
 */

import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import {
  createLicense,
  upgradeLicense,
  addLicenseAddon,
  handleRefund,
  handleChargeback,
  handleRecurringPayment,
  handleCancellation
} from './licenseService.js';
import {
  getProductConfig,
  isLicenseProduct,
  isAddonProduct,
  isEliteBundle
} from '../config/productMapping.js';
import { LICENSE_TIERS } from '../config/licenseConfig.js';

// ============================================
// IPN VERIFICATION
// ============================================

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

// ============================================
// USER MANAGEMENT
// ============================================

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

// ============================================
// TRANSACTION PROCESSING
// ============================================

/**
 * Process SALE transaction
 */
async function processSale(ipnData) {
  const {
    ctransaction,
    ctransreceipt,
    cproditem,
    ccustemail,
    ctransamount
  } = ipnData;

  // Get product configuration
  const productConfig = getProductConfig(cproditem);

  if (!productConfig) {
    throw new Error(`Unknown JVZoo product ID: ${cproditem}`);
  }

  console.log(`Processing SALE for product: ${productConfig.name}`);

  // Create or find user
  const user = await createOrFindUser(ipnData);

  let license = null;
  let addon = null;

  // Handle different product types
  if (productConfig.type === 'license') {
    // New license (Starter or Elite Bundle)
    license = await createLicense({
      userId: user.id,
      licenseTier: productConfig.tier,
      jvzooTransactionId: ctransaction,
      jvzooReceiptId: ctransreceipt,
      jvzooProductId: cproditem,
      transactionType: 'SALE',
      purchaseAmount: parseFloat(ctransamount),
      productId: cproditem,
      isRecurring: false
    });

    // If Elite Bundle, also add all addons
    if (isEliteBundle(cproditem) && productConfig.includes_addons) {
      for (const addonType of productConfig.includes_addons) {
        await addLicenseAddon({
          licenseId: license.id,
          addonType,
          jvzooProductId: cproditem,
          jvzooTransactionId: `${ctransaction}-${addonType}`,
          jvzooReceiptId: ctransreceipt,
          purchaseAmount: 0 // Included in bundle
        });
      }
      console.log(`Elite Bundle: Added all addons to license ${license.id}`);
    }

  } else if (productConfig.type === 'upgrade') {
    // Upgrade existing license (Starter -> Pro Unlimited)
    license = await upgradeLicense(user.id, productConfig.tier, ctransaction);

  } else if (productConfig.type === 'addon') {
    // Add addon to existing license
    const userLicense = await prisma.license.findFirst({
      where: {
        userId: user.id,
        status: 'active'
      }
    });

    if (!userLicense) {
      throw new Error('No active license found for addon purchase');
    }

    // Check addon requirements
    if (productConfig.requires) {
      // If requires specific tier
      if (Object.values(LICENSE_TIERS).includes(productConfig.requires)) {
        if (userLicense.licenseTier !== productConfig.requires) {
          throw new Error(
            `Addon ${productConfig.addon_type} requires ${productConfig.requires} license`
          );
        }
      }

      // If requires another addon
      const existingAddons = await prisma.licenseAddon.findMany({
        where: {
          licenseId: userLicense.id,
          status: 'active'
        }
      });

      const hasRequiredAddon = existingAddons.some(
        a => a.addonType === productConfig.requires
      );

      if (!hasRequiredAddon) {
        throw new Error(
          `Addon ${productConfig.addon_type} requires ${productConfig.requires} addon first`
        );
      }
    }

    addon = await addLicenseAddon({
      licenseId: userLicense.id,
      addonType: productConfig.addon_type,
      jvzooProductId: cproditem,
      jvzooTransactionId: ctransaction,
      jvzooReceiptId: ctransreceipt,
      purchaseAmount: parseFloat(ctransamount)
    });

    license = userLicense;
  }

  return { user, license, addon };
}

/**
 * Process RFND (refund) transaction
 */
async function processRefund(ipnData) {
  const { ctransaction } = ipnData;

  console.log(`Processing REFUND for transaction: ${ctransaction}`);

  // Find the original transaction
  const originalTransaction = await prisma.jVZooTransaction.findFirst({
    where: {
      jvzooTransactionId: ctransaction,
      transactionType: 'SALE'
    }
  });

  if (!originalTransaction) {
    console.warn('Original transaction not found for refund');
    return null;
  }

  // Handle refund
  await handleRefund(ctransaction);

  return { refunded: true };
}

/**
 * Process CGBK (chargeback) transaction
 */
async function processChargeback(ipnData) {
  const { ctransaction } = ipnData;

  console.log(`Processing CHARGEBACK for transaction: ${ctransaction}`);

  await handleChargeback(ctransaction);

  return { chargeback: true };
}

/**
 * Process INSTAL (recurring payment) transaction
 */
async function processRecurringPayment(ipnData) {
  const { ctransaction } = ipnData;

  console.log(`Processing RECURRING PAYMENT for transaction: ${ctransaction}`);

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  await handleRecurringPayment(ctransaction, nextBillingDate);

  return { recurring: true };
}

/**
 * Process CANCEL-REBILL (subscription cancellation) transaction
 */
async function processCancellation(ipnData) {
  const { ctransaction } = ipnData;

  console.log(`Processing CANCELLATION for transaction: ${ctransaction}`);

  await handleCancellation(ctransaction);

  return { cancelled: true };
}

/**
 * Main transaction processor
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

    if (existingTransaction && existingTransaction.processed) {
      console.log('Transaction already processed:', ctransaction);
      return { alreadyProcessed: true, transaction: existingTransaction };
    }

    let result = {};

    // Route to appropriate handler based on transaction type
    switch (ctransaction_type) {
      case 'SALE':
        result = await processSale(ipnData);
        break;

      case 'RFND':
        result = await processRefund(ipnData);
        break;

      case 'CGBK':
        result = await processChargeback(ipnData);
        break;

      case 'INSTAL':
        result = await processRecurringPayment(ipnData);
        break;

      case 'CANCEL-REBILL':
        result = await processCancellation(ipnData);
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
        userId: result.user?.id || null
      }
    });

    console.log('Transaction saved to audit log:', transaction.id);

    return {
      success: true,
      transaction,
      ...result
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

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

/**
 * Send welcome email to new JVZoo customer
 */
export async function sendWelcomeEmail(user, license) {
  // TODO: Implement email sending with your email service
  console.log('=== WELCOME EMAIL ===');
  console.log('To:', user.email);
  console.log('Name:', user.name);
  console.log('License Key:', license.licenseKey);
  console.log('License Tier:', license.licenseTier);
  console.log('===================');

  // Integration points:
  // - SendGrid, AWS SES, Mailgun, or your email service
  // - Include license key
  // - Include login link
  // - Include getting started guide
  // - Include support contact info

  // Example template:
  /*
  Subject: Welcome to AdGenius AI - Your License Key Inside

  Hi ${user.name},

  Welcome to AdGenius AI! Your purchase has been confirmed.

  License Details:
  - License Key: ${license.licenseKey}
  - Plan: ${license.licenseTier}
  - Purchase Date: ${license.purchaseDate}

  Get Started:
  1. Go to https://adgeniusai.com/login
  2. Sign in with: ${user.email}
  3. Set your password
  4. Start creating amazing ads!

  Need Help?
  Visit our support center: https://adgeniusai.com/support

  Best regards,
  The AdGenius AI Team
  */
}

// ============================================
// EXPORTS
// ============================================

export default {
  verifyJVZooIPN,
  createOrFindUser,
  processTransaction,
  sendWelcomeEmail
};
