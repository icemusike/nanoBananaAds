import express from 'express';
import { validateLicense } from '../services/licenseService.js';
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
    // Get active licenses for the authenticated user
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
        tier: null,
        addons: [],
        features: {
          unlimited_credits: false,
          agency_license: false,
          agency_features: false
        }
      });
    }

    // Get the primary (most recent active) license
    const primaryLicense = licenses[0];

    // Determine tier from productId
    const tierMapping = {
      'starter': 'starter',
      'pro_unlimited': 'pro_unlimited',
      'pro-unlimited': 'pro_unlimited',
      'elite_bundle': 'elite_bundle',
      'elite-bundle': 'elite_bundle',
      'agency_license': 'agency_license',
      'agency-license': 'agency_license'
    };

    const tier = tierMapping[primaryLicense.productId] || primaryLicense.productId;

    // Check for addons (additional licenses)
    const addons = licenses
      .filter(l => l.id !== primaryLicense.id)
      .map(l => l.productId);

    // Determine features based on licenses
    const hasAgencyLicense = licenses.some(l =>
      l.productId === 'agency_license' || l.productId === 'agency-license'
    );

    const hasUnlimitedCredits = licenses.some(l =>
      l.productId === 'pro_unlimited' ||
      l.productId === 'pro-unlimited' ||
      l.productId === 'elite_bundle' ||
      l.productId === 'elite-bundle'
    );

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
      addons: addons,
      features: {
        unlimited_credits: hasUnlimitedCredits,
        agency_license: hasAgencyLicense,
        agency_features: hasAgencyLicense
      }
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
    // Get active licenses for the authenticated user
    const licenses = await prisma.license.findMany({
      where: {
        userId: req.userId,
        status: 'active'
      }
    });

    // Check if user has unlimited credits
    const hasUnlimitedCredits = licenses.some(l =>
      l.productId === 'pro_unlimited' ||
      l.productId === 'pro-unlimited' ||
      l.productId === 'elite_bundle' ||
      l.productId === 'elite-bundle'
    );

    // If unlimited, return large number
    if (hasUnlimitedCredits) {
      return res.json({
        success: true,
        total: 999999,
        used: 0,
        remaining: 999999,
        unlimited: true,
        resetDate: null
      });
    }

    // For free/starter tier, calculate from usage
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true,
        createdAt: true
      }
    });

    // Free tier: 50 credits/month
    // Starter tier: 500 credits/month
    const hasStarterLicense = licenses.some(l => l.productId === 'starter');
    const monthlyLimit = hasStarterLicense ? 500 : 50;

    // Rough estimate: 1 ad = 1 credit, 1 prompt/angle = 0.1 credit
    const creditsUsed = (user?.adsGenerated || 0) +
                        Math.floor((user?.promptsGenerated || 0) * 0.1) +
                        Math.floor((user?.anglesGenerated || 0) * 0.1);

    const remaining = Math.max(0, monthlyLimit - creditsUsed);

    // Calculate next reset date (first of next month)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    return res.json({
      success: true,
      total: monthlyLimit,
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
 * Validate a license key
 * POST /api/license/validate
 *
 * Body:
 * {
 *   "licenseKey": "XXXX-XXXX-XXXX-XXXX",
 *   "email": "customer@example.com"
 * }
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
 *
 * Requires authentication or admin access in production
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

    // Don't expose sensitive information
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
 *
 * Requires authentication in production
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
 *
 * Simple status check without full validation
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
 * Activate a license (increment activation count)
 * POST /api/license/activate
 *
 * Body:
 * {
 *   "licenseKey": "XXXX-XXXX-XXXX-XXXX",
 *   "email": "customer@example.com",
 *   "deviceId": "optional-device-identifier"
 * }
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

    // First validate the license
    const validation = await validateLicense(licenseKey, email);

    if (!validation.valid) {
      return res.json({
        success: false,
        error: validation.reason
      });
    }

    // Get the license
    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    // Check activation limit
    if (license.activations >= license.maxActivations) {
      return res.json({
        success: false,
        error: `Maximum activations (${license.maxActivations}) reached`
      });
    }

    // Increment activation count
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
