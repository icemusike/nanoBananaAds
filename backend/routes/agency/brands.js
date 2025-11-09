import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireAgencyLicense, verifyClientOwnership } from '../../middleware/requireAgencyLicense.js';

const router = express.Router();

// Apply authentication and agency license middleware to all routes
router.use(authenticateUser);
router.use(requireAgencyLicense);

/**
 * GET /api/agency/clients/:clientId/brands
 * Get all brands for a specific client
 */
router.get('/clients/:clientId/brands', verifyClientOwnership, async (req, res) => {
  try {
    const { clientId } = req.params;

    const brands = await prisma.brand.findMany({
      where: {
        clientAccountId: clientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      brands
    });

  } catch (error) {
    console.error('❌ Error fetching client brands:', error);
    res.status(500).json({
      error: 'Failed to fetch client brands',
      message: error.message
    });
  }
});

/**
 * POST /api/agency/clients/:clientId/brands/:brandId/assign
 * Assign an existing brand to a client
 */
router.post('/clients/:clientId/brands/:brandId/assign', verifyClientOwnership, async (req, res) => {
  try {
    const userId = req.user.id;
    const { clientId, brandId } = req.params;

    // Verify the brand belongs to this agency user
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        userId: userId
      }
    });

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found',
        message: 'This brand does not exist or does not belong to your account'
      });
    }

    // Assign the brand to the client
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        clientAccountId: clientId
      }
    });

    res.json({
      success: true,
      brand: updatedBrand,
      message: 'Brand assigned to client successfully'
    });

  } catch (error) {
    console.error('❌ Error assigning brand to client:', error);
    res.status(500).json({
      error: 'Failed to assign brand to client',
      message: error.message
    });
  }
});

/**
 * POST /api/agency/clients/:clientId/brands/:brandId/unassign
 * Remove brand assignment from a client
 */
router.post('/clients/:clientId/brands/:brandId/unassign', verifyClientOwnership, async (req, res) => {
  try {
    const userId = req.user.id;
    const { brandId } = req.params;

    // Verify the brand belongs to this agency user
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        userId: userId
      }
    });

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found',
        message: 'This brand does not exist or does not belong to your account'
      });
    }

    // Remove the client assignment
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        clientAccountId: null
      }
    });

    res.json({
      success: true,
      brand: updatedBrand,
      message: 'Brand unassigned from client successfully'
    });

  } catch (error) {
    console.error('❌ Error unassigning brand from client:', error);
    res.status(500).json({
      error: 'Failed to unassign brand from client',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/brands/available
 * Get all brands available for assignment (agency user's brands not assigned to any client)
 */
router.get('/brands/available', async (req, res) => {
  try {
    const userId = req.user.id;

    const availableBrands = await prisma.brand.findMany({
      where: {
        userId: userId,
        clientAccountId: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      brands: availableBrands
    });

  } catch (error) {
    console.error('❌ Error fetching available brands:', error);
    res.status(500).json({
      error: 'Failed to fetch available brands',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/brands/all
 * Get all brands owned by the agency user (for selection)
 */
router.get('/brands/all', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔵 API: Fetching all brands for user:', userId);

    const allBrands = await prisma.brand.findMany({
      where: {
        userId: userId
      },
      include: {
        clientAccount: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`🔵 API: Found ${allBrands.length} brands for user ${userId}`);

    res.json({
      success: true,
      brands: allBrands
    });

  } catch (error) {
    console.error('❌ Error fetching all brands:', error);
    res.status(500).json({
      error: 'Failed to fetch brands',
      message: error.message
    });
  }
});

export default router;
