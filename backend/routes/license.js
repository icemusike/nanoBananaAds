import express from 'express';
import { validateLicense, consumeCredits, getUserEntitlements } from '../services/licenseService.js';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get current user's license information
 * GET /api/license/me
 * Requires authentication
 */
router.get('/me', authenticateUser, async (req, res) => {
  try {
    // Get entitlements which aggregates all active licenses
    const { tier, features, isUnlimited } = await getUserEntitlements(req.userId);

    // Get active licenses for display
    const licenses = await prisma.license.findMany({
      where: {
        userId: req.userId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });

    // If no licenses, return free tier
    if (licenses.length === 0) {
      return res.json({
        success: true,
        license: null,
        tier: 'free',
        addons: [],
        features: {
          unlimited_credits: false,
          agency_license: false,
          agency_features: false
        }
      });
    }

    const primaryLicense = licenses[0];
    const productIds = licenses.map(l => l.productId);

    // Construct features object for frontend
    const featureMap = {
      unlimited_credits: isUnlimited,
      pro_license: features.includes('unlimited') || features.includes('bulk'),
      templates_library: features.includes('templates') || features.includes('all'),
      agency_license: features.includes('agency') || features.includes('all'),
      agency_features: features.includes('agency') || features.includes('all'),
      reseller_license: features.includes('reseller') || features.includes('all'),
      white_label: features.includes('white_label') || features.includes('all'),
      all_features: features.includes('all')
    };

    return res.json({
      success: true,
      license: {
        id: primaryLicense.id,
        licenseKey: primaryLicense.licenseKey,
        productId: primaryLicense.productId,
        tier: tier,
        status: primaryLicense.status,
        purchaseDate: primaryLicense.purchaseDate,
        expiryDate: primaryLicense.expiryDate,
        isRecurring: primaryLicense.isRecurring
      },
      tier: tier,
      licenses: productIds,
      features: featureMap
    });
  } catch (error) {
    console.error('Error fetching user license:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Get current user's credits information
 * GET /api/license/credits
 * Requires authentication
 */
router.get('/credits', authenticateUser, async (req, res) => {
  try {
    const { creditLimit, isUnlimited } = await getUserEntitlements(req.userId);
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        creditsUsedPeriod: true,
        nextCreditReset: true
      }
    });

    // Check if reset is needed (display purpose only, actual reset happens on consume)
    let creditsUsed = user?.creditsUsedPeriod || 0;
    let resetDate = user?.nextCreditReset;
    const now = new Date();
    
    if (!resetDate) {
      resetDate = new Date();
      resetDate.setDate(1);
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setHours(0, 0, 0, 0);
    } else if (now >= resetDate) {
      creditsUsed = 0;
      // Visual reset date update
      resetDate = new Date(now);
      resetDate.setDate(1);
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setHours(0, 0, 0, 0);
    }

    if (isUnlimited) {
      return res.json({
        success: true,
        total: 999999,
        used: creditsUsed,
        remaining: 999999,
        unlimited: true,
        resetDate: null
      });
    }

    const remaining = Math.max(0, creditLimit - creditsUsed);

    return res.json({
      success: true,
      total: creditLimit,
      used: creditsUsed,
      remaining: remaining,
      unlimited: false,
      resetDate: resetDate
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Consume credits
 * POST /api/license/consume-credits
 */
router.post('/consume-credits', authenticateUser, async (req, res) => {
  try {
    const { amount = 1, actionType } = req.body;
    // actionType is optional but good for auditing in future
    
    const result = await consumeCredits(req.userId, amount);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(403).json(result);
    }
  } catch (error) {
    console.error('Error consuming credits:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * Check feature access
 * POST /api/license/check-feature
 */
router.post('/check-feature', authenticateUser, async (req, res) => {
  try {
    const { feature } = req.body;
    const { features, isUnlimited } = await getUserEntitlements(req.userId);
    
    // Map internal feature names to frontend feature names
    const frontendFeatureMap = {
      'bulk_generation': features.includes('bulk') || features.includes('all') || isUnlimited,
      'premium_templates': features.includes('templates') || features.includes('all'),
      'agency_dashboard': features.includes('agency') || features.includes('all'),
      'client_accounts': features.includes('agency') || features.includes('all'),
      'reseller_dashboard': features.includes('reseller') || features.includes('all')
    };

    // Also allow direct internal feature check
    const hasDirectAccess = features.includes(feature) || features.includes('all');

    const hasAccess = frontendFeatureMap[feature] || hasDirectAccess || false;

    return res.json({ hasAccess });
  } catch (error) {
    console.error('Error checking feature:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * Get license stats
 * GET /api/license/stats
 */
router.get('/stats', authenticateUser, async (req, res) => {
  // Reuse credits logic
  try {
    const creditsData = await getUserEntitlements(req.userId);
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { creditsUsedPeriod: true, nextCreditReset: true }
    });

    return res.json({ 
      success: true, 
      stats: {
        ...creditsData,
        creditsUsed: user?.creditsUsedPeriod || 0,
        resetDate: user?.nextCreditReset
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * Validate a license key
 * POST /api/license/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const { licenseKey, email } = req.body;

    if (!licenseKey || !email) {
      return res.status(400).json({
        valid: false,
        error: 'License key and email are required'
      });
    }

    const result = await validateLicense(licenseKey, email);

    if (result.valid) {
      return res.json({
        valid: true,
        message: 'License is valid',
        license: result.license
      });
    } else {
      return res.json({
        valid: false,
        reason: result.reason
      });
    }
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Validation error'
    });
  }
});

/**
 * Get license details
 * GET /api/license/:licenseKey
 */
router.get('/:licenseKey', async (req, res) => {
  try {
    const { licenseKey } = req.params;

    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        error: 'License not found'
      });
    }

    const safeLicense = {
      licenseKey: license.licenseKey,
      productId: license.productId,
      status: license.status,
      purchaseDate: license.purchaseDate,
      expiryDate: license.expiryDate,
      isRecurring: license.isRecurring,
      activations: license.activations,
      maxActivations: license.maxActivations,
      lastValidated: license.lastValidated,
      user: license.user
    };

    return res.json({
      success: true,
      license: safeLicense
    });
  } catch (error) {
    console.error('Error fetching license:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Get all licenses for a user
 * GET /api/license/user/:email
 */
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        licenses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
      success: true,
      licenses: user.licenses
    });
  } catch (error) {
    console.error('Error fetching user licenses:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Check license status
 * POST /api/license/check
 */
router.post('/check', async (req, res) => {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        error: 'License key is required'
      });
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (!license) {
      return res.json({
        success: true,
        status: 'not_found'
      });
    }

    return res.json({
      success: true,
      status: license.status,
      expiryDate: license.expiryDate,
      isRecurring: license.isRecurring
    });
  } catch (error) {
    console.error('License check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Activate a license
 * POST /api/license/activate
 */
router.post('/activate', async (req, res) => {
  try {
    const { licenseKey, email, deviceId } = req.body;

    if (!licenseKey || !email) {
      return res.status(400).json({
        success: false,
        error: 'License key and email are required'
      });
    }

    const validation = await validateLicense(licenseKey, email);

    if (!validation.valid) {
      return res.json({
        success: false,
        error: validation.reason
      });
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (license.activations >= license.maxActivations) {
      return res.json({
        success: false,
        error: `Maximum activations (${license.maxActivations}) reached`
      });
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        activations: { increment: 1 },
        lastValidated: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'License activated successfully',
      activations: updated.activations,
      maxActivations: updated.maxActivations,
      remainingActivations: updated.maxActivations - updated.activations
    });
  } catch (error) {
    console.error('License activation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Activation error'
    });
  }
});

export default router;
