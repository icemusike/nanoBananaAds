import express from 'express';
import { validateLicense } from '../services/licenseService.js';
import { PrismaClient } from '../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

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
