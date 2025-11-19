import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/index.js';
import { PRODUCT_MAPPING } from '../config/productMapping.js';

const prisma = new PrismaClient();

/**
 * Generate a secure license key
 * Format: XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(email, transactionId, productId) {
  const secret = process.env.LICENSE_SECRET || 'default-license-secret-change-me';
  const timestamp = Date.now();
  const data = `${email}|${transactionId}|${productId}|${timestamp}`;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .toUpperCase();

  // Format as XXXX-XXXX-XXXX-XXXX
  const key = hash.substring(0, 16).match(/.{1,4}/g).join('-');
  return key;
}

/**
 * Create a new license from JVZoo transaction
 */
export async function createLicense({
  userId,
  jvzooTransactionId,
  jvzooReceiptId,
  jvzooProductId,
  transactionType,
  customerEmail,
  purchaseAmount,
  productId,
  isRecurring = false
}) {
  // Generate unique license key
  const licenseKey = generateLicenseKey(customerEmail, jvzooTransactionId, jvzooProductId);

  // Get credit allocation from config
  const creditsAllocated = getCreditsForProduct(productId);

  try {
    const license = await prisma.license.create({
      data: {
        licenseKey,
        productId,
        status: 'active',
        jvzooTransactionId,
        jvzooReceiptId,
        jvzooProductId,
        transactionType,
        purchaseDate: new Date(),
        purchaseAmount,
        isRecurring,
        userId,
        maxActivations: getMaxActivations(productId),
        expiryDate: getExpiryDate(productId, isRecurring),
        creditsAllocated: creditsAllocated
      }
    });

    return license;
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
}

/**
 * Validate a license key
 */
export async function validateLicense(licenseKey, email) {
  try {
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { user: true }
    });

    if (!license) {
      return { valid: false, reason: 'License key not found' };
    }

    if (license.user.email !== email) {
      return { valid: false, reason: 'License key does not match email' };
    }

    if (license.status !== 'active') {
      return { valid: false, reason: `License is ${license.status}` };
    }

    if (license.expiryDate && new Date() > license.expiryDate) {
      return { valid: false, reason: 'License has expired' };
    }

    // Update last validated timestamp
    await prisma.license.update({
      where: { id: license.id },
      data: { lastValidated: new Date() }
    });

    return {
      valid: true,
      license: {
        productId: license.productId,
        purchaseDate: license.purchaseDate,
        expiryDate: license.expiryDate,
        isRecurring: license.isRecurring
      }
    };
  } catch (error) {
    console.error('Error validating license:', error);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Handle refund - deactivate license
 */
export async function handleRefund(jvzooTransactionId) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for refund: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: 'refunded',
        refundedAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

/**
 * Handle chargeback - deactivate license
 */
export async function handleChargeback(jvzooTransactionId) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for chargeback: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: 'chargeback',
        chargebackAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling chargeback:', error);
    throw error;
  }
}

/**
 * Handle recurring payment
 */
export async function handleRecurringPayment(jvzooTransactionId, nextBillingDate) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for recurring payment: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        lastPaymentDate: new Date(),
        paymentCount: { increment: 1 },
        nextBillingDate,
        status: 'active' // Ensure it's active
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling recurring payment:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 */
export async function handleCancellation(jvzooTransactionId) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for cancellation: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling cancellation:', error);
    throw error;
  }
}

/**
 * Get max activations based on product tier
 */
function getMaxActivations(productId) {
  const activationLimits = {
    'frontend': 1,            // Base license - 1 activation
    'pro_license': 3,         // Pro - 3 activations
    'templates_license': 1,   // Templates - 1 activation
    'agency_license': 10,     // Agency - 10 activations
    'reseller_license': 50,   // Reseller - 50 activations
    'fastpass_bundle': 10,    // FastPass Bundle - 10 activations
    'elite_bundle': 10,       // Elite Bundle Deal - 10 activations
    'default': 1
  };

  return activationLimits[productId] || activationLimits['default'];
}

/**
 * Get expiry date based on product
 */
function getExpiryDate(productId, isRecurring) {
  if (isRecurring) {
    // Recurring subscriptions expire after 1 month + grace period
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 day grace period
    return expiryDate;
  }

  // Lifetime licenses don't expire (return null)
  return null;
}

/**
 * Get credits allocated based on product tier
 * Uses the imported PRODUCT_MAPPING configuration
 */
function getCreditsForProduct(productId) {
  // 1. Search by Internal ID in the mapping values
  const productByInternalId = Object.values(PRODUCT_MAPPING).find(p => p.id === productId);
  if (productByInternalId) {
    return productByInternalId.credits;
  }

  // 2. Search by JVZoo ID (if passed directly, though we usually pass internal ID)
  if (PRODUCT_MAPPING[productId]) {
    return PRODUCT_MAPPING[productId].credits;
  }
  
  // 3. Fallback defaults
  const creditLimits = {
    'frontend': 500,
    'pro_license': -1,
    'templates_license': 0,
    'agency_license': 0,
    'reseller_license': 0,
    'fastpass_bundle': -1,
    'elite_bundle': -1,
    'default': 0
  };

  return creditLimits[productId] !== undefined ? creditLimits[productId] : creditLimits['default'];
}

/**
 * Get user's aggregated entitlements from all active licenses
 */
export async function getUserEntitlements(userId) {
  const licenses = await prisma.license.findMany({
    where: {
      userId,
      status: 'active'
    }
  });

  let creditLimit = 0;
  let isUnlimited = false;
  let features = new Set();
  let tier = 'free';
  
  const tierRank = { 'free': 0, 'frontend': 1, 'pro': 2, 'elite': 3 };

  // Default free tier if no licenses
  if (licenses.length === 0) {
    creditLimit = 50; // Free tier
  }

  const productArray = Object.values(PRODUCT_MAPPING);

  licenses.forEach(license => {
    // Sum credits (using what's stored in DB which is the source of truth for that license)
    if (license.creditsAllocated === -1) {
      isUnlimited = true;
    } else {
      creditLimit += license.creditsAllocated;
    }

    // Find product config for features
    const config = productArray.find(p => p.id === license.productId);
    if (config) {
      config.features.forEach(f => features.add(f));
      if (tierRank[config.tier] > tierRank[tier]) {
        tier = config.tier;
      }
    }
  });

  if (isUnlimited) creditLimit = -1;

  return {
    creditLimit,
    isUnlimited,
    features: Array.from(features),
    tier
  };
}

/**
 * Check and consume credits for a user
 */
export async function consumeCredits(userId, amount = 1) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('User not found');

    // 1. Check for Monthly Reset
    const now = new Date();
    let nextReset = user.nextCreditReset;
    
    if (!nextReset || now >= nextReset) {
      // Reset credits
      nextReset = new Date(now);
      nextReset.setDate(1);
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setHours(0, 0, 0, 0);

      await prisma.user.update({
        where: { id: userId },
        data: { 
          creditsUsedPeriod: 0,
          nextCreditReset: nextReset
        }
      });
      user.creditsUsedPeriod = 0;
    }

    // 2. Check Entitlements
    const { creditLimit, isUnlimited } = await getUserEntitlements(userId);

    if (isUnlimited) {
      return { success: true, remaining: 999999, unlimited: true };
    }

    const creditsUsed = user.creditsUsedPeriod || 0;

    if (creditsUsed + amount > creditLimit) {
      return { 
        success: false, 
        error: 'Insufficient credits', 
        remaining: Math.max(0, creditLimit - creditsUsed) 
      };
    }

    // 3. Consume
    await prisma.user.update({
      where: { id: userId },
      data: { creditsUsedPeriod: { increment: amount } }
    });

    return { 
      success: true, 
      remaining: creditLimit - (creditsUsed + amount),
      unlimited: false
    };

  } catch (error) {
    console.error('Error consuming credits:', error);
    throw error;
  }
}
