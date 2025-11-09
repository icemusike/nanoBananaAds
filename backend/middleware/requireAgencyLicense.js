import prisma from '../utils/prisma.js';

/**
 * Middleware to verify that the user has an active Agency License
 *
 * This middleware checks if the user has purchased the Agency License addon
 * and that it's currently active (not refunded or expired).
 *
 * Usage:
 *   router.get('/agency/clients', requireAgencyLicense, async (req, res) => { ... });
 */
export async function requireAgencyLicense(req, res, next) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access agency features'
      });
    }

    const userId = req.user.id;

    // Check if user has an active Agency License addon
    const agencyLicense = await prisma.licenseAddon.findFirst({
      where: {
        license: {
          userId: userId,
          status: 'active' // License itself must be active
        },
        addonType: 'agency_license',
        status: 'active' // Addon must be active (not refunded)
      },
      include: {
        license: {
          select: {
            licenseTier: true,
            licenseKey: true,
            productId: true
          }
        }
      }
    });

    if (!agencyLicense) {
      return res.status(403).json({
        error: 'Agency License required',
        message: 'You need to upgrade to the Agency License to access this feature',
        upgradeUrl: '/upgrade/agency-license', // Frontend upgrade page
        details: {
          feature: 'Agency License',
          price: '$197',
          benefits: [
            'Unlimited clients',
            'Client dashboard',
            'White-label branding',
            'Ad approval workflow',
            'Message center',
            'File sharing'
          ]
        }
      });
    }

    // Attach license info to request for use in route handlers
    req.agencyLicense = {
      id: agencyLicense.id,
      licenseId: agencyLicense.licenseId,
      licenseTier: agencyLicense.license.licenseTier,
      licenseKey: agencyLicense.license.licenseKey,
      productId: agencyLicense.license.productId,
      purchaseDate: agencyLicense.purchaseDate,
      isActive: true
    };

    // User has valid agency license, proceed
    next();

  } catch (error) {
    console.error('❌ Agency license verification error:', error);
    return res.status(500).json({
      error: 'License verification failed',
      message: 'Unable to verify your agency license. Please try again.'
    });
  }
}

/**
 * Check if user has agency license (doesn't block, just sets flag)
 * Useful for optional agency features or conditional UI rendering
 */
export async function checkAgencyLicense(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      req.hasAgencyLicense = false;
      return next();
    }

    const userId = req.user.id;

    const agencyLicense = await prisma.licenseAddon.findFirst({
      where: {
        license: {
          userId: userId,
          status: 'active'
        },
        addonType: 'agency_license',
        status: 'active'
      }
    });

    req.hasAgencyLicense = !!agencyLicense;

    if (agencyLicense) {
      req.agencyLicense = {
        id: agencyLicense.id,
        licenseId: agencyLicense.licenseId,
        isActive: true
      };
    }

    next();

  } catch (error) {
    console.error('⚠️ Agency license check error:', error);
    req.hasAgencyLicense = false;
    next();
  }
}

/**
 * Verify client belongs to the agency user
 * Used to protect client-specific routes
 */
export async function verifyClientOwnership(req, res, next) {
  try {
    const userId = req.user.id;
    const clientId = req.params.clientId || req.params.id;

    if (!clientId) {
      return res.status(400).json({
        error: 'Client ID required',
        message: 'No client ID provided in request'
      });
    }

    // Check if client belongs to this agency user
    const client = await prisma.clientAccount.findFirst({
      where: {
        id: clientId,
        agencyUserId: userId
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: 'This client does not exist or does not belong to your agency'
      });
    }

    // Attach client to request
    req.client = client;

    next();

  } catch (error) {
    console.error('❌ Client ownership verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify client ownership'
    });
  }
}

export default {
  requireAgencyLicense,
  checkAgencyLicense,
  verifyClientOwnership
};
