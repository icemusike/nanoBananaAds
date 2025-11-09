/**
 * AdGenius AI - License Middleware
 *
 * Middleware for protecting routes with license and feature checks
 */

import jwt from 'jsonwebtoken';
import {
  validateUserLicense,
  checkFeatureAccess,
  checkCreditsAvailable,
  requireFeature as requireFeatureService
} from '../services/licenseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract user ID from JWT token
 */
function getUserIdFromRequest(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Require active license
 * Use this middleware to ensure user has any active license
 */
export async function requireLicense(req, res, next) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const validation = await validateUserLicense(userId);

    if (!validation.valid) {
      return res.status(403).json({
        success: false,
        error: validation.reason,
        requiresLicense: true
      });
    }

    // Attach license info to request
    req.license = validation.license;
    req.features = validation.features;
    req.addons = validation.addons;

    next();
  } catch (error) {
    console.error('License middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'License validation failed'
    });
  }
}

/**
 * Require specific feature
 * Use this middleware to ensure user has access to a specific feature
 *
 * Example: requireFeature('bulk_generation')
 */
export function requireFeature(featureName) {
  return async (req, res, next) => {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const hasAccess = await checkFeatureAccess(userId, featureName);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: `Feature not available: ${featureName}`,
          missingFeature: featureName,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Feature check middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Feature validation failed'
      });
    }
  };
}

/**
 * Require sufficient credits
 * Use this middleware to ensure user has enough credits for an action
 *
 * Example: requireCredits(1)
 */
export function requireCredits(amount = 1) {
  return async (req, res, next) => {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const creditsCheck = await checkCreditsAvailable(userId, amount);

      if (!creditsCheck.available) {
        return res.status(403).json({
          success: false,
          error: creditsCheck.reason || 'Insufficient credits',
          creditsRequired: amount,
          creditsRemaining: creditsCheck.remaining || 0,
          upgradeRequired: true
        });
      }

      // Attach credits info to request
      req.creditsAvailable = creditsCheck;

      next();
    } catch (error) {
      console.error('Credits check middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Credits validation failed'
      });
    }
  };
}

/**
 * Require minimum tier
 * Use this middleware to ensure user has at least a specific license tier
 *
 * Example: requireTier('pro_unlimited')
 */
export function requireTier(minTier) {
  const tierHierarchy = {
    'starter': 1,
    'pro_unlimited': 2,
    'elite_bundle': 3
  };

  return async (req, res, next) => {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const validation = await validateUserLicense(userId);

      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          error: validation.reason,
          requiresLicense: true
        });
      }

      const userTierLevel = tierHierarchy[validation.license.licenseTier] || 0;
      const requiredTierLevel = tierHierarchy[minTier] || 0;

      if (userTierLevel < requiredTierLevel) {
        return res.status(403).json({
          success: false,
          error: `Requires ${minTier} license or higher`,
          currentTier: validation.license.licenseTier,
          requiredTier: minTier,
          upgradeRequired: true
        });
      }

      // Attach license info to request
      req.license = validation.license;
      req.features = validation.features;
      req.addons = validation.addons;

      next();
    } catch (error) {
      console.error('Tier check middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Tier validation failed'
      });
    }
  };
}

/**
 * Require addon
 * Use this middleware to ensure user has a specific addon
 *
 * Example: requireAddon('template_library')
 */
export function requireAddon(addonType) {
  return async (req, res, next) => {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const validation = await validateUserLicense(userId);

      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          error: validation.reason,
          requiresLicense: true
        });
      }

      if (!validation.addons.includes(addonType)) {
        return res.status(403).json({
          success: false,
          error: `Requires ${addonType} addon`,
          missingAddon: addonType,
          upgradeRequired: true
        });
      }

      // Attach license info to request
      req.license = validation.license;
      req.features = validation.features;
      req.addons = validation.addons;

      next();
    } catch (error) {
      console.error('Addon check middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Addon validation failed'
      });
    }
  };
}

/**
 * Check license (non-blocking)
 * Use this middleware to attach license info without blocking request
 * Useful for routes that work differently based on license tier
 */
export async function checkLicense(req, res, next) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      // No user, continue without license
      req.hasLicense = false;
      return next();
    }

    const validation = await validateUserLicense(userId);

    if (validation.valid) {
      req.hasLicense = true;
      req.license = validation.license;
      req.features = validation.features;
      req.addons = validation.addons;
    } else {
      req.hasLicense = false;
    }

    next();
  } catch (error) {
    console.error('License check middleware error:', error);
    req.hasLicense = false;
    next();
  }
}

// ============================================
// COMBINED MIDDLEWARE
// ============================================

/**
 * Require license with feature and credits
 * Combines multiple checks into one middleware
 *
 * Example: requireLicenseWithFeatureAndCredits({ feature: 'bulk_generation', credits: 5 })
 */
export function requireLicenseWithFeatureAndCredits(options = {}) {
  const { feature, credits = 1, tier, addon } = options;

  return async (req, res, next) => {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Validate license
      const validation = await validateUserLicense(userId);

      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          error: validation.reason,
          requiresLicense: true
        });
      }

      // Check tier if required
      if (tier) {
        const tierHierarchy = {
          'starter': 1,
          'pro_unlimited': 2,
          'elite_bundle': 3
        };

        const userTierLevel = tierHierarchy[validation.license.licenseTier] || 0;
        const requiredTierLevel = tierHierarchy[tier] || 0;

        if (userTierLevel < requiredTierLevel) {
          return res.status(403).json({
            success: false,
            error: `Requires ${tier} license or higher`,
            currentTier: validation.license.licenseTier,
            requiredTier: tier,
            upgradeRequired: true
          });
        }
      }

      // Check addon if required
      if (addon && !validation.addons.includes(addon)) {
        return res.status(403).json({
          success: false,
          error: `Requires ${addon} addon`,
          missingAddon: addon,
          upgradeRequired: true
        });
      }

      // Check feature if required
      if (feature) {
        const hasAccess = await checkFeatureAccess(userId, feature);

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: `Feature not available: ${feature}`,
            missingFeature: feature,
            upgradeRequired: true
          });
        }
      }

      // Check credits if required
      if (credits > 0) {
        const creditsCheck = await checkCreditsAvailable(userId, credits);

        if (!creditsCheck.available) {
          return res.status(403).json({
            success: false,
            error: creditsCheck.reason || 'Insufficient credits',
            creditsRequired: credits,
            creditsRemaining: creditsCheck.remaining || 0,
            upgradeRequired: true
          });
        }

        req.creditsAvailable = creditsCheck;
      }

      // Attach license info to request
      req.license = validation.license;
      req.features = validation.features;
      req.addons = validation.addons;

      next();
    } catch (error) {
      console.error('Combined license middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'License validation failed'
      });
    }
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  requireLicense,
  requireFeature,
  requireCredits,
  requireTier,
  requireAddon,
  checkLicense,
  requireLicenseWithFeatureAndCredits
};
