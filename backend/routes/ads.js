import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * GET /api/ads
 * Get all ads with optional filtering and search
 */
router.get('/', async (req, res) => {
  try {
    const { search, industry, limit } = req.query;

    const where = {
      userId: req.userId
    };

    // Add search filter
    if (search) {
      where.OR = [
        { headline: { contains: search, mode: 'insensitive' } },
        { primaryText: { contains: search, mode: 'insensitive' } },
        { productDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add industry filter
    if (industry && industry !== 'all') {
      where.industry = industry;
    }

    const queryOptions = {
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        headline: true,
        description: true,
        primaryText: true,
        callToAction: true,
        alternativeHeadlines: true,
        keyBenefits: true,
        toneAnalysis: true,
        productDescription: true,
        targetAudience: true,
        industry: true,
        category: true,
        template: true,
        tone: true,
        colorPalette: true,
        aspectRatio: true,
        valueProposition: true,
        imageMimeType: true,
        imageMetadata: true,
        createdAt: true,
        updatedAt: true,
        // imageData excluded - fetch individually via GET /api/ads/:id
      },
    };

    // Add limit only if specified (otherwise fetch all)
    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const ads = await prisma.ad.findMany(queryOptions);

    res.json({
      success: true,
      ads,
      count: ads.length,
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads',
      error: error.message,
    });
  }
});

/**
 * GET /api/ads/:id
 * Get a single ad by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await prisma.ad.findFirst({
      where: {
        id,
        userId: req.userId
      },
    });

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found',
      });
    }

    res.json({
      success: true,
      ad,
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ad',
      error: error.message,
    });
  }
});

/**
 * POST /api/ads
 * Create a new ad
 */
router.post('/', async (req, res) => {
  try {
    const {
      imageData,
      imageMimeType,
      imageMetadata,
      headline,
      description,
      primaryText,
      callToAction,
      alternativeHeadlines,
      keyBenefits,
      toneAnalysis,
      productDescription,
      targetAudience,
      industry,
      category,
      template,
      tone,
      colorPalette,
      aspectRatio,
      valueProposition,
    } = req.body;

    // Validate required fields
    if (!imageData || !imageMimeType || !headline || !description || !primaryText || !callToAction) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const ad = await prisma.ad.create({
      data: {
        userId: req.userId,
        imageData,
        imageMimeType,
        imageMetadata,
        headline,
        description,
        primaryText,
        callToAction,
        alternativeHeadlines,
        keyBenefits,
        toneAnalysis,
        productDescription,
        targetAudience,
        industry,
        category,
        template,
        tone,
        colorPalette,
        aspectRatio,
        valueProposition,
      },
    });

    res.json({
      success: true,
      ad,
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ad',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/ads/:id
 * Delete an ad
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ad belongs to user
    const existingAd = await prisma.ad.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingAd) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found or access denied'
      });
    }

    const ad = await prisma.ad.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Ad deleted successfully',
      ad,
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad',
      error: error.message,
    });
  }
});

/**
 * GET /api/ads/stats
 * Get statistics about ads
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalAds = await prisma.ad.count({
      where: { userId: req.userId }
    });

    // Get ads from this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthAds = await prisma.ad.count({
      where: {
        userId: req.userId,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Get unique industries
    const industries = await prisma.ad.findMany({
      where: { userId: req.userId },
      select: {
        industry: true,
      },
      distinct: ['industry'],
    });

    res.json({
      success: true,
      stats: {
        total: totalAds,
        thisMonth: thisMonthAds,
        industries: industries.map(i => i.industry),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message,
    });
  }
});

export default router;
