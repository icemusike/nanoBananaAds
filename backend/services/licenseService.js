/**
 * AdGenius AI - License Service
 *
 * Core license validation, feature access control, and credit management
 */

import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import {
  LICENSE_TIERS,
  ADDON_TYPES,
  buildFeatureSet,
  getLicenseConfig,
  getCreditCost,
  hasFeature as checkFeature
} from '../config/licenseConfig.js';

// ============================================
// LICENSE KEY GENERATION
// ============================================

/**
 * Generate a secure license key
 * Format: AG-XXXXXXXXXXXXXXXXXXXX (AG- prefix + 20 hex characters)
 */
export function generateLicenseKey() {
  const secret = process.env.LICENSE_SECRET || 'default-license-secret-change-me';
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const data = `${timestamp}|${random}`;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .toUpperCase();

  return `AG-${hash.substring(0, 20)}`;
}

// ============================================
// LICENSE CREATION & MANAGEMENT
// ============================================

/**
 * Create a new license from JVZoo transaction
 */
export async function createLicense({
  userId,
  licenseTier,
  jvzooTransactionId,
  jvzooReceiptId,
  jvzooProductId,
  transactionType,
  purchaseAmount,
  productId,
  isRecurring = false
}) {
  try {
    // Get tier configuration
    const tierConfig = getLicenseConfig(licenseTier);

    // Generate unique license key
    const licenseKey = generateLicenseKey();

    // Calculate credits and reset date
    const creditsTotal = tierConfig.credits_monthly;
    const creditsResetDate = creditsTotal
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      : null;

    // Create license
    const license = await prisma.license.create({
      data: {
        userId,
        licenseTier,
        licenseKey,
        productId,
        status: 'active',

        // Credits
        creditsTotal,
        creditsUsed: 0,
        creditsResetDate,

        // JVZoo info
        jvzooTransactionId,
        jvzooReceiptId,
        jvzooProductId,
        transactionType,

        // Purchase info
        purchaseDate: new Date(),
        purchaseAmount,
        isRecurring,

        // Activation limits
        maxActivations: getMaxActivations(licenseTier),
        expiryDate: getExpiryDate(isRecurring)
      }
    });

    console.log(`License created: ${license.licenseKey} (${licenseTier})`);
    return license;
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
}

/**
 * Upgrade existing license to new tier
 */
export async function upgradeLicense(userId, newTier, jvzooTransactionId) {
  try {
    // Get user's current license
    const currentLicense = await prisma.license.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!currentLicense) {
      throw new Error('No active license found to upgrade');
    }

    // Get new tier config
    const newTierConfig = getLicenseConfig(newTier);

    // Update license
    const updated = await prisma.license.update({
      where: { id: currentLicense.id },
      data: {
        licenseTier: newTier,
        creditsTotal: newTierConfig.credits_monthly,
        creditsResetDate: newTierConfig.credits_monthly
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
        maxActivations: getMaxActivations(newTier)
      }
    });

    console.log(`License upgraded: ${currentLicense.licenseKey} -> ${newTier}`);
    return updated;
  } catch (error) {
    console.error('Error upgrading license:', error);
    throw error;
  }
}

/**
 * Add addon to existing license
 */
export async function addLicenseAddon({
  licenseId,
  addonType,
  jvzooProductId,
  jvzooTransactionId,
  jvzooReceiptId,
  purchaseAmount
}) {
  try {
    // Check if addon already exists
    const existing = await prisma.licenseAddon.findUnique({
      where: {
        licenseId_addonType: {
          licenseId,
          addonType
        }
      }
    });

    if (existing) {
      console.log(`Addon ${addonType} already exists for license ${licenseId}`);
      return existing;
    }

    // Create addon
    const addon = await prisma.licenseAddon.create({
      data: {
        licenseId,
        addonType,
        jvzooProductId,
        jvzooTransactionId,
        jvzooReceiptId,
        purchaseAmount,
        status: 'active'
      }
    });

    console.log(`Addon added: ${addonType} to license ${licenseId}`);
    return addon;
  } catch (error) {
    console.error('Error adding license addon:', error);
    throw error;
  }
}

// ============================================
// LICENSE VALIDATION
// ============================================

/**
 * Validate user's license and return complete license info with features
 */
export async function validateUserLicense(userId) {
  try {
    // Get user's active license
    const license = await prisma.license.findFirst({
      where: {
        userId,
        status: 'active'
      },
      include: {
        addons: {
          where: { status: 'active' }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!license) {
      return {
        valid: false,
        reason: 'No active license found',
        license: null,
        features: null,
        addons: []
      };
    }

    // Check if license is expired
    if (license.expiryDate && new Date(license.expiryDate) < new Date()) {
      return {
        valid: false,
        reason: 'License expired',
        license,
        features: null,
        addons: []
      };
    }

    // Get addon types
    const addonTypes = license.addons.map(a => a.addonType);

    // Build complete feature set
    const features = buildFeatureSet(license.licenseTier, addonTypes);

    // Update last validated timestamp
    await prisma.license.update({
      where: { id: license.id },
      data: { lastValidated: new Date() }
    });

    return {
      valid: true,
      license,
      features,
      addons: addonTypes
    };
  } catch (error) {
    console.error('Error validating user license:', error);
    return {
      valid: false,
      reason: 'Validation error',
      license: null,
      features: null,
      addons: []
    };
  }
}

/**
 * Validate license key and email
 */
export async function validateLicense(licenseKey, email) {
  try {
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        user: true,
        addons: true
      }
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
        licenseTier: license.licenseTier,
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

// ============================================
// FEATURE ACCESS CONTROL
// ============================================

/**
 * Check if user has access to specific feature
 */
export async function checkFeatureAccess(userId, featureName) {
  const { valid, features } = await validateUserLicense(userId);

  if (!valid || !features) {
    return false;
  }

  return checkFeature(features, featureName);
}

/**
 * Require feature access (throws error if not available)
 */
export async function requireFeature(userId, featureName) {
  const hasAccess = await checkFeatureAccess(userId, featureName);

  if (!hasAccess) {
    throw new Error(
      `Feature not available: ${featureName}. Please upgrade your license.`
    );
  }

  return true;
}

// ============================================
// CREDIT MANAGEMENT
// ============================================

/**
 * Check if user has credits available
 */
export async function checkCreditsAvailable(userId, creditsNeeded = 1) {
  const { valid, license, features } = await validateUserLicense(userId);

  if (!valid) {
    return {
      available: false,
      reason: 'No active license'
    };
  }

  // Check if unlimited credits
  if (features.unlimited_credits) {
    return {
      available: true,
      unlimited: true,
      remaining: null
    };
  }

  // Check credit limit
  const remaining = license.creditsTotal - license.creditsUsed;

  if (remaining < creditsNeeded) {
    // Check if credits should reset
    if (license.creditsResetDate && new Date(license.creditsResetDate) <= new Date()) {
      // Reset credits
      await resetCredits(license.id);
      return {
        available: true,
        unlimited: false,
        remaining: license.creditsTotal
      };
    }

    return {
      available: false,
      reason: 'Insufficient credits',
      remaining: 0
    };
  }

  return {
    available: true,
    unlimited: false,
    remaining
  };
}

/**
 * Consume credits for an action
 */
export async function consumeCredits(userId, actionType, metadata = {}) {
  const { valid, license, features } = await validateUserLicense(userId);

  if (!valid) {
    throw new Error('No active license');
  }

  // Calculate credit cost
  const creditCost = getCreditCost(actionType, metadata);

  // Check if unlimited (still log usage but don't decrement)
  if (features.unlimited_credits) {
    await logUsage(userId, license.id, actionType, creditCost, metadata);
    return {
      success: true,
      unlimited: true,
      consumed: 0,
      remaining: null
    };
  }

  // Check credits available
  const creditsCheck = await checkCreditsAvailable(userId, creditCost);
  if (!creditsCheck.available) {
    throw new Error('Insufficient credits. Please upgrade to Pro Unlimited for unlimited credits.');
  }

  // Decrement credits
  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      creditsUsed: {
        increment: creditCost
      }
    }
  });

  // Log usage
  await logUsage(userId, license.id, actionType, creditCost, metadata);

  return {
    success: true,
    unlimited: false,
    consumed: creditCost,
    remaining: license.creditsTotal - updated.creditsUsed
  };
}

/**
 * Reset monthly credits
 */
export async function resetCredits(licenseId) {
  try {
    await prisma.license.update({
      where: { id: licenseId },
      data: {
        creditsUsed: 0,
        creditsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      }
    });
    console.log(`Credits reset for license ${licenseId}`);
  } catch (error) {
    console.error('Error resetting credits:', error);
    throw error;
  }
}

/**
 * Reset all monthly credits (cron job)
 */
export async function resetAllMonthlyCredits() {
  try {
    const result = await prisma.license.updateMany({
      where: {
        status: 'active',
        creditsTotal: { not: null }, // Only limited credit licenses
        creditsResetDate: { lte: new Date() } // Reset date has passed
      },
      data: {
        creditsUsed: 0,
        creditsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    console.log(`Reset credits for ${result.count} licenses`);
    return result.count;
  } catch (error) {
    console.error('Error resetting all monthly credits:', error);
    throw error;
  }
}

// ============================================
// USAGE LOGGING
// ============================================

/**
 * Log usage for analytics and billing
 */
export async function logUsage(userId, licenseId, actionType, creditsConsumed, metadata = {}) {
  try {
    await prisma.usageLog.create({
      data: {
        userId,
        licenseId,
        actionType,
        creditsConsumed,
        aiModel: metadata.aiModel,
        templateId: metadata.templateId,
        exportFormat: metadata.exportFormat,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: metadata.additionalData || null
      }
    });
  } catch (error) {
    console.error('Error logging usage:', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

/**
 * Get user's license stats
 */
export async function getUserLicenseStats(userId) {
  const { valid, license, features, addons } = await validateUserLicense(userId);

  if (!valid) {
    return null;
  }

  const stats = {
    tier: license.licenseTier,
    tierName: getLicenseConfig(license.licenseTier).name,
    status: license.status,
    purchaseDate: license.purchaseDate,

    // Credits
    creditsTotal: license.creditsTotal,
    creditsUsed: license.creditsUsed,
    creditsRemaining: license.creditsTotal
      ? license.creditsTotal - license.creditsUsed
      : null,
    creditsUnlimited: features.unlimited_credits,
    creditsResetDate: license.creditsResetDate,

    // Addons
    addons,

    // Features (just the enabled ones)
    features: Object.keys(features).filter(key => features[key] === true),

    // Limits
    maxProjects: features.max_projects,
    maxBrands: features.max_brands,
    watermark: features.watermark,

    // Support
    supportLevel: features.support_level
  };

  return stats;
}

// ============================================
// REFUND & CHARGEBACK HANDLING
// ============================================

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

    // Also refund any addons with this transaction
    await prisma.licenseAddon.updateMany({
      where: { jvzooTransactionId },
      data: {
        status: 'refunded',
        refundedAt: new Date()
      }
    });

    console.log(`License refunded: ${license.licenseKey}`);
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

    console.log(`License chargeback: ${license.licenseKey}`);
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

    console.log(`Recurring payment processed: ${license.licenseKey}`);
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

    console.log(`Subscription cancelled: ${license.licenseKey}`);
    return updated;
  } catch (error) {
    console.error('Error handling cancellation:', error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get max activations based on product tier
 */
function getMaxActivations(licenseTier) {
  const activationLimits = {
    [LICENSE_TIERS.STARTER]: 1,
    [LICENSE_TIERS.PRO_UNLIMITED]: 3,
    [LICENSE_TIERS.ELITE_BUNDLE]: 10
  };

  return activationLimits[licenseTier] || 1;
}

/**
 * Get expiry date based on product
 */
function getExpiryDate(isRecurring) {
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

// ============================================
// EXPORTS
// ============================================

export default {
  // License creation
  generateLicenseKey,
  createLicense,
  upgradeLicense,
  addLicenseAddon,

  // Validation
  validateUserLicense,
  validateLicense,

  // Feature access
  checkFeatureAccess,
  requireFeature,

  // Credits
  checkCreditsAvailable,
  consumeCredits,
  resetCredits,
  resetAllMonthlyCredits,

  // Usage
  logUsage,
  getUserLicenseStats,

  // Refunds/Chargebacks
  handleRefund,
  handleChargeback,
  handleRecurringPayment,
  handleCancellation
};
