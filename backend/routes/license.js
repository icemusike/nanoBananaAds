/**
 * AdGenius AI - License API Endpoints
 *
 * Handles all license-related API requests
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import {
  validateUserLicense,
  validateLicense,
  checkFeatureAccess,
  checkCreditsAvailable,
  consumeCredits,
  getUserLicenseStats
} from '../services/licenseService.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================
// MIDDLEWARE: Extract User ID from JWT
// ============================================

async function getUserIdFromToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new Error('No authentication token provided');
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

// ============================================
// LICENSE VALIDATION ENDPOINTS
// ============================================

/**
 * GET /api/license/me
 * Get current user's license information
 */
router.get('/me', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);

    const validation = await validateUserLicense(userId);

    if (!validation.valid) {
      return res.status(403).json({
        success: false,
        error: validation.reason
      });
    }

    return res.json({
      success: true,
      license: {
        tier: validation.license.licenseTier,
        licenseKey: validation.license.licenseKey,
        status: validation.license.status,
        purchaseDate: validation.license.purchaseDate,
        expiryDate: validation.license.expiryDate
      },
      addons: validation.addons,
      features: validation.features
    });
  } catch (error) {
    console.error('Get license error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get license information'
    });
  }
});

/**
 * POST /api/license/validate
 * Validate a license key and email
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

// ============================================
// FEATURE ACCESS ENDPOINTS
// ============================================

/**
 * POST /api/license/check-feature
 * Check if user has access to a specific feature
 */
router.post('/check-feature', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    const { feature } = req.body;

    if (!feature) {
      return res.status(400).json({
        success: false,
        error: 'Feature name is required'
      });
    }

    const hasAccess = await checkFeatureAccess(userId, feature);

    return res.json({
      success: true,
      feature,
      hasAccess
    });
  } catch (error) {
    console.error('Check feature error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check feature access'
    });
  }
});

// ============================================
// CREDIT MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/license/credits
 * Get user's credit balance and info
 */
router.get('/credits', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);

    const creditsInfo = await checkCreditsAvailable(userId);

    return res.json({
      success: true,
      ...creditsInfo
    });
  } catch (error) {
    console.error('Get credits error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get credit information'
    });
  }
});

/**
 * POST /api/license/consume-credits
 * Consume credits for an action
 */
router.post('/consume-credits', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    const { actionType, metadata = {} } = req.body;

    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'Action type is required'
      });
    }

    // Add request metadata
    const fullMetadata = {
      ...metadata,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await consumeCredits(userId, actionType, fullMetadata);

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Consume credits error:', error);

    if (error.message.includes('Insufficient credits')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        upgradeRequired: true
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to consume credits'
    });
  }
});

// ============================================
// LICENSE STATS ENDPOINT
// ============================================

/**
 * GET /api/license/stats
 * Get user's license stats (credits, features, etc.)
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);

    const stats = await getUserLicenseStats(userId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No active license found'
      });
    }

    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get license stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get license stats'
    });
  }
});

// ============================================
// LICENSE DETAILS ENDPOINTS (Legacy Support)
// ============================================

/**
 * GET /api/license/:licenseKey
 * Get license details by license key
 * Requires authentication
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
        },
        addons: {
          where: { status: 'active' }
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
      licenseTier: license.licenseTier,
      productId: license.productId,
      status: license.status,
      purchaseDate: license.purchaseDate,
      expiryDate: license.expiryDate,
      isRecurring: license.isRecurring,
      creditsTotal: license.creditsTotal,
      creditsUsed: license.creditsUsed,
      creditsResetDate: license.creditsResetDate,
      addons: license.addons.map(a => ({
        addonType: a.addonType,
        purchaseDate: a.purchaseDate
      })),
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
 * GET /api/license/user/:email
 * Get all licenses for a user
 * Requires authentication
 */
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify that the requesting user is either the email owner or an admin
    const userId = await getUserIdFromToken(req);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.email !== email) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userWithLicenses = await prisma.user.findUnique({
      where: { email },
      include: {
        licenses: {
          orderBy: { createdAt: 'desc' },
          include: {
            addons: {
              where: { status: 'active' }
            }
          }
        }
      }
    });

    if (!userWithLicenses) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
      success: true,
      licenses: userWithLicenses.licenses
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
 * POST /api/license/check
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
      tier: license.licenseTier,
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
 * POST /api/license/activate
 * Activate a license (increment activation count)
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
