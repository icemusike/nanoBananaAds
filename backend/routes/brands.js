import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// For demo purposes, we'll use a single user ID
const DEFAULT_USER_ID = 'default-user';

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
        userId: DEFAULT_USER_ID,
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
      userId: DEFAULT_USER_ID
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

    const brand = await prisma.brand.findUnique({
      where: { id }
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

    // Check if this is the default brand
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    });

    if (user?.defaultBrandId === id) {
      // Unset as default first
      await prisma.user.update({
        where: { id: DEFAULT_USER_ID },
        data: { defaultBrandId: null }
      });
    }

    const brand = await prisma.brand.delete({
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

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Update user's default brand
    const user = await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
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
      where: { userId: DEFAULT_USER_ID }
    });

    const mostUsed = await prisma.brand.findMany({
      where: { userId: DEFAULT_USER_ID },
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
        userId: DEFAULT_USER_ID,
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
