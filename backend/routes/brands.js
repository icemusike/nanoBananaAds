import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * POST /api/brands
 * Create a new brand
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      tagline,
      logo,
      logoMimeType,
      primaryColor,
      secondaryColor,
      accentColor,
      colorPalette,
      industry,
      targetAudience,
      brandVoice,
      tone,
      valueProposition,
      keyMessages,
      brandGuidelines,
      websiteUrl,
      socialMediaLinks,
      metadata
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Brand name and description are required'
      });
    }

    const brand = await prisma.brand.create({
      data: {
        userId: req.userId,
        name,
        description,
        tagline,
        logo,
        logoMimeType,
        primaryColor,
        secondaryColor,
        accentColor,
        colorPalette,
        industry,
        targetAudience,
        brandVoice,
        tone: tone || 'professional yet approachable',
        valueProposition,
        keyMessages,
        brandGuidelines,
        websiteUrl,
        socialMediaLinks,
        metadata
      }
    });

    res.json({
      success: true,
      brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create brand',
      error: error.message
    });
  }
});

/**
 * GET /api/brands
 * Get all brands for the user
 */
router.get('/', async (req, res) => {
  try {
    const { search, industry } = req.query;

    const where = {
      userId: req.userId
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (industry && industry !== 'all') {
      where.industry = industry;
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      brands,
      count: brands.length
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
});

/**
 * GET /api/brands/:id
 * Get a single brand by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand',
      error: error.message
    });
  }
});

/**
 * PUT /api/brands/:id
 * Update a brand
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // First verify the brand belongs to the user
    const existingBrand = await prisma.brand.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found or access denied'
      });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      brand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand',
      error: error.message
    });
  }
});

/**
 * DELETE /api/brands/:id
 * Delete a brand
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the brand belongs to the user
    const brand = await prisma.brand.findFirst({
      where: { id, userId: req.userId }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found or access denied'
      });
    }

    // Check if this is the default brand
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user?.defaultBrandId === id) {
      // Unset as default first
      await prisma.user.update({
        where: { id: req.userId },
        data: { defaultBrandId: null }
      });
    }

    await prisma.brand.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Brand deleted successfully',
      brand
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete brand',
      error: error.message
    });
  }
});

/**
 * PUT /api/brands/:id/set-default
 * Set a brand as the default
 */
router.put('/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify brand exists and belongs to user
    const brand = await prisma.brand.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found or access denied'
      });
    }

    // Update user's default brand
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { defaultBrandId: id }
    });

    res.json({
      success: true,
      message: 'Default brand set successfully',
      defaultBrandId: id
    });
  } catch (error) {
    console.error('Error setting default brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default brand',
      error: error.message
    });
  }
});

/**
 * PUT /api/brands/:id/use
 * Increment usage count when brand is used
 */
router.put('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify brand belongs to user
    const existingBrand = await prisma.brand.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found or access denied'
      });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date()
      }
    });

    res.json({
      success: true,
      brand
    });
  } catch (error) {
    console.error('Error updating brand usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand usage',
      error: error.message
    });
  }
});

/**
 * GET /api/brands/stats/summary
 * Get statistics about brands
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalBrands = await prisma.brand.count({
      where: { userId: req.userId }
    });

    const mostUsed = await prisma.brand.findMany({
      where: { userId: req.userId },
      orderBy: { usageCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        usageCount: true,
        industry: true,
        lastUsed: true
      }
    });

    const industries = await prisma.brand.findMany({
      where: {
        userId: req.userId,
        industry: { not: null }
      },
      select: { industry: true },
      distinct: ['industry']
    });

    res.json({
      success: true,
      stats: {
        total: totalBrands,
        mostUsed,
        industries: industries.map(i => i.industry).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Error fetching brand stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand stats',
      error: error.message
    });
  }
});

export default router;
