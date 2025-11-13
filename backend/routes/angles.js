import express from 'express';
import prisma from '../utils/prisma.js';
import openaiService from '../services/openai.js';
import { authenticateUser } from '../middleware/auth.js';
import { getAdminApiKeys } from '../utils/systemSettings.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * POST /api/angles/generate
 * Generate creative ad angles from business description
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      businessName,
      businessDescription,
      industry,
      targetAudience,
      currentApproach,
      saveToLibrary = false
    } = req.body;

    if (!businessName || !businessDescription) {
      return res.status(400).json({
        success: false,
        message: 'Business name and description are required'
      });
    }

    // Load user's OpenAI API key from database
    let userOpenaiKey = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { openaiApiKey: true }
      });
      userOpenaiKey = user?.openaiApiKey;
    } catch (err) {
      console.log('⚠️ Could not load user OpenAI key:', err.message);
    }

    // Get admin default API keys from database
    const adminKeys = await getAdminApiKeys();

    // API Key Priority: Headers > User DB > Admin Database > Environment Variables
    const openaiApiKey = req.headers['x-openai-api-key'] || userOpenaiKey || adminKeys.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return res.status(401).json({
        success: false,
        error: 'OpenAI API key not configured',
        message: 'No OpenAI API key found. Please contact your administrator or add your own key in Settings.'
      });
    }

    // Generate angles using OpenAI
    const result = await openaiService.generateAdAngles({
      businessName,
      businessDescription,
      industry,
      targetAudience,
      currentApproach,
      apiKey: openaiApiKey
    });

    // Optionally save all angles to database
    let savedAngles = [];
    if (saveToLibrary && result.success && result.angles) {
      savedAngles = await Promise.all(
        result.angles.map(angle =>
          prisma.angle.create({
            data: {
              userId: req.userId,
              businessName,
              businessDescription,
              industry: industry || null,
              targetAudience: targetAudience || null,
              currentApproach: currentApproach || null,
              angleName: angle.angleName,
              angleDescription: angle.angleDescription,
              whyItWorks: angle.whyItWorks,
              targetEmotion: angle.targetEmotion,
              exampleHeadline: angle.exampleHeadline,
              visualStyle: angle.visualStyle,
              copyFramework: angle.copyFramework || null,
              metadata: {
                generationMetadata: result.metadata,
                insights: result.insights
              }
            }
          })
        )
      );

      // Increment user usage counter by the number of angles saved
      try {
        await prisma.user.update({
          where: { id: req.userId },
          data: { anglesGenerated: { increment: savedAngles.length } }
        });
        console.log(`✅ User angles counter incremented by ${savedAngles.length}`);
      } catch (counterError) {
        console.log('⚠️ Failed to increment angles counter:', counterError.message);
      }
    }

    res.json({
      success: true,
      angles: result.angles,
      insights: result.insights,
      savedAngles,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error generating angles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate angles',
      error: error.message
    });
  }
});

/**
 * POST /api/angles/save
 * Save a single angle to the library
 */
router.post('/save', async (req, res) => {
  try {
    const {
      businessName,
      businessDescription,
      industry,
      targetAudience,
      currentApproach,
      angleName,
      angleDescription,
      whyItWorks,
      targetEmotion,
      exampleHeadline,
      visualStyle,
      copyFramework,
      metadata
    } = req.body;

    if (!businessName || !businessDescription || !angleName) {
      return res.status(400).json({
        success: false,
        message: 'Business name, description, and angle name are required'
      });
    }

    const angle = await prisma.angle.create({
      data: {
        userId: req.userId,
        businessName,
        businessDescription,
        industry: industry || null,
        targetAudience: targetAudience || null,
        currentApproach: currentApproach || null,
        angleName,
        angleDescription,
        whyItWorks,
        targetEmotion,
        exampleHeadline,
        visualStyle,
        copyFramework: copyFramework || null,
        metadata: metadata || {}
      }
    });

    // Increment user usage counter
    try {
      await prisma.user.update({
        where: { id: req.userId },
        data: { anglesGenerated: { increment: 1 } }
      });
      console.log('✅ User angles counter incremented');
    } catch (counterError) {
      console.log('⚠️ Failed to increment angles counter:', counterError.message);
    }

    res.json({
      success: true,
      angle
    });
  } catch (error) {
    console.error('Error saving angle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save angle',
      error: error.message
    });
  }
});

/**
 * GET /api/angles
 * Get all angles with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { industry, targetEmotion, search, sortBy = 'createdAt', limit = 50 } = req.query;

    const where = {
      userId: req.userId
    };

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { angleName: { contains: search, mode: 'insensitive' } },
        { angleDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (industry && industry !== 'all') {
      where.industry = industry;
    }

    if (targetEmotion && targetEmotion !== 'all') {
      where.targetEmotion = targetEmotion;
    }

    // Determine sort order
    const orderBy = {};
    if (sortBy === 'usageCount') {
      orderBy.usageCount = 'desc';
    } else if (sortBy === 'performanceRating') {
      orderBy.performanceRating = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const angles = await prisma.angle.findMany({
      where,
      orderBy,
      take: Math.min(parseInt(limit), 100),
      include: {
        _count: {
          select: {
            prompts: true,
            ads: true
          }
        }
      }
    });

    res.json({
      success: true,
      angles,
      count: angles.length
    });
  } catch (error) {
    console.error('Error fetching angles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch angles',
      error: error.message
    });
  }
});

/**
 * GET /api/angles/:id
 * Get a single angle by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const angle = await prisma.angle.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        prompts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        ads: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!angle) {
      return res.status(404).json({
        success: false,
        message: 'Angle not found'
      });
    }

    res.json({
      success: true,
      angle
    });
  } catch (error) {
    console.error('Error fetching angle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch angle',
      error: error.message
    });
  }
});

/**
 * PUT /api/angles/:id/use
 * Increment usage count when angle is used
 */
router.put('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'prompt' or 'ad'

    // Verify angle belongs to user
    const existingAngle = await prisma.angle.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingAngle) {
      return res.status(404).json({
        success: false,
        message: 'Angle not found or access denied'
      });
    }

    const updateData = {
      usageCount: { increment: 1 }
    };

    if (type === 'prompt') {
      updateData.promptsGenerated = { increment: 1 };
    } else if (type === 'ad') {
      updateData.adsGenerated = { increment: 1 };
    }

    const angle = await prisma.angle.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      angle
    });
  } catch (error) {
    console.error('Error updating angle usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update angle usage',
      error: error.message
    });
  }
});

/**
 * PUT /api/angles/:id
 * Update an angle (for rating, notes, etc.)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { performanceRating, performanceNotes } = req.body;

    // Verify angle belongs to user
    const existingAngle = await prisma.angle.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingAngle) {
      return res.status(404).json({
        success: false,
        message: 'Angle not found or access denied'
      });
    }

    const updateData = {};
    if (performanceRating !== undefined) {
      updateData.performanceRating = performanceRating;
    }
    if (performanceNotes !== undefined) {
      updateData.performanceNotes = performanceNotes;
    }

    const angle = await prisma.angle.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      angle
    });
  } catch (error) {
    console.error('Error updating angle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update angle',
      error: error.message
    });
  }
});

/**
 * DELETE /api/angles/:id
 * Delete an angle
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify angle belongs to user
    const existingAngle = await prisma.angle.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingAngle) {
      return res.status(404).json({
        success: false,
        message: 'Angle not found or access denied'
      });
    }

    const angle = await prisma.angle.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Angle deleted successfully',
      angle
    });
  } catch (error) {
    console.error('Error deleting angle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete angle',
      error: error.message
    });
  }
});

/**
 * GET /api/angles/stats/summary
 * Get statistics about angles
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalAngles = await prisma.angle.count();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthAngles = await prisma.angle.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    // Get unique emotions
    const emotions = await prisma.angle.findMany({
      select: {
        targetEmotion: true
      },
      distinct: ['targetEmotion']
    });

    // Get unique industries
    const industries = await prisma.angle.findMany({
      select: {
        industry: true
      },
      distinct: ['industry'],
      where: {
        industry: {
          not: null
        }
      }
    });

    // Most used angles
    const mostUsed = await prisma.angle.findMany({
      orderBy: {
        usageCount: 'desc'
      },
      take: 5,
      select: {
        id: true,
        angleName: true,
        businessName: true,
        usageCount: true,
        targetEmotion: true,
        promptsGenerated: true,
        adsGenerated: true
      }
    });

    // Top rated angles
    const topRated = await prisma.angle.findMany({
      where: {
        performanceRating: {
          not: null
        }
      },
      orderBy: {
        performanceRating: 'desc'
      },
      take: 5,
      select: {
        id: true,
        angleName: true,
        businessName: true,
        performanceRating: true,
        usageCount: true
      }
    });

    // Emotion distribution
    const emotionStats = await prisma.angle.groupBy({
      by: ['targetEmotion'],
      _count: {
        targetEmotion: true
      }
    });

    res.json({
      success: true,
      stats: {
        total: totalAngles,
        thisMonth: thisMonthAngles,
        emotions: emotions.map(e => e.targetEmotion).filter(Boolean),
        industries: industries.map(i => i.industry).filter(Boolean),
        mostUsed,
        topRated,
        emotionDistribution: emotionStats
      }
    });
  } catch (error) {
    console.error('Error fetching angle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch angle stats',
      error: error.message
    });
  }
});

export default router;
