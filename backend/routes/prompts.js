import express from 'express';
import prisma from '../utils/prisma.js';
import openaiService from '../services/openai.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * POST /api/prompts/generate
 * Generate optimized image prompt from simple idea
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      idea,
      industry,
      style,
      aspectRatio,
      colorPalette,
      apiKey,
      saveToLibrary = true
    } = req.body;

    if (!idea) {
      return res.status(400).json({
        success: false,
        message: 'Idea is required'
      });
    }

    // Generate prompt using OpenAI
    const result = await openaiService.generateImagePrompt({
      idea,
      industry,
      style,
      aspectRatio,
      colorPalette,
      apiKey
    });

    // Save to database if requested
    let savedPrompt = null;
    if (saveToLibrary && result.success) {
      savedPrompt = await prisma.prompt.create({
        data: {
          userId: req.userId,
          idea,
          generatedPrompt: result.prompt.generatedPrompt,
          industry: industry || null,
          style: result.prompt.style || style || null,
          aspectRatio: result.prompt.aspectRatio || aspectRatio || null,
          metadata: {
            suggestedColors: result.prompt.suggestedColors,
            promptType: result.prompt.promptType,
            generationMetadata: result.metadata
          }
        }
      });

      // Increment user usage counter
      try {
        await prisma.user.update({
          where: { id: req.userId },
          data: { promptsGenerated: { increment: 1 } }
        });
        console.log('✅ User prompts counter incremented');
      } catch (counterError) {
        console.log('⚠️ Failed to increment prompts counter:', counterError.message);
      }
    }

    res.json({
      success: true,
      prompt: result.prompt,
      savedPrompt,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prompt',
      error: error.message
    });
  }
});

/**
 * GET /api/prompts
 * Get all prompts with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { industry, style, search, limit = 50 } = req.query;

    const where = {
      userId: req.userId
    };

    if (search) {
      where.OR = [
        { idea: { contains: search, mode: 'insensitive' } },
        { generatedPrompt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (industry && industry !== 'all') {
      where.industry = industry;
    }

    if (style && style !== 'all') {
      where.style = style;
    }

    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit), 50)
    });

    res.json({
      success: true,
      prompts,
      count: prompts.length
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompts',
      error: error.message
    });
  }
});

/**
 * GET /api/prompts/:id
 * Get a single prompt by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await prisma.prompt.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompt',
      error: error.message
    });
  }
});

/**
 * PUT /api/prompts/:id/use
 * Increment usage count when prompt is used in an ad
 */
router.put('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify prompt belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingPrompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found or access denied'
      });
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error updating prompt usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prompt usage',
      error: error.message
    });
  }
});

/**
 * DELETE /api/prompts/:id
 * Delete a prompt
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify prompt belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existingPrompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found or access denied'
      });
    }

    const prompt = await prisma.prompt.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Prompt deleted successfully',
      prompt
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prompt',
      error: error.message
    });
  }
});

/**
 * GET /api/prompts/stats/summary
 * Get statistics about prompts
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalPrompts = await prisma.prompt.count();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthPrompts = await prisma.prompt.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    const styles = await prisma.prompt.findMany({
      select: {
        style: true
      },
      distinct: ['style'],
      where: {
        style: {
          not: null
        }
      }
    });

    const industries = await prisma.prompt.findMany({
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

    const mostUsed = await prisma.prompt.findMany({
      orderBy: {
        usageCount: 'desc'
      },
      take: 5,
      select: {
        id: true,
        idea: true,
        usageCount: true,
        style: true
      }
    });

    res.json({
      success: true,
      stats: {
        total: totalPrompts,
        thisMonth: thisMonthPrompts,
        styles: styles.map(s => s.style).filter(Boolean),
        industries: industries.map(i => i.industry).filter(Boolean),
        mostUsed
      }
    });
  } catch (error) {
    console.error('Error fetching prompt stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompt stats',
      error: error.message
    });
  }
});

export default router;
