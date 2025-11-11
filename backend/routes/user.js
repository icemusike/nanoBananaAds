import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// SECURITY: Admin's default API keys (used for masking)
const ADMIN_GEMINI_KEY = process.env.GEMINI_API_KEY;
const ADMIN_OPENAI_KEY = process.env.OPENAI_API_KEY;

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * GET /api/user/settings
 * Get user settings (or create default if doesn't exist)
 */
router.get('/settings', async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        geminiApiKey: true,
        openaiApiKey: true,
        preferredImageModel: true,
        imageQuality: true,
        defaultIndustry: true,
        defaultTone: true,
        defaultAspectRatio: true,
        defaultBrandId: true,
        theme: true,
        themeMode: true,
        settings: true,
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        createdVia: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // SECURITY: Never expose admin's default API keys to users
    // If user's keys match admin keys from environment, return empty strings
    if (user.geminiApiKey === ADMIN_GEMINI_KEY) {
      user.geminiApiKey = '';
    }
    if (user.openaiApiKey === ADMIN_OPENAI_KEY) {
      user.openaiApiKey = '';
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/user/settings
 * Update user settings
 */
router.put('/settings', async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      geminiApiKey,
      openaiApiKey,
      preferredImageModel,
      imageQuality,
      defaultIndustry,
      defaultTone,
      defaultAspectRatio,
      theme,
      themeMode,
      settings
    } = req.body;

    // Build update data
    const updateData = {};

    // SECURITY: Prevent users from saving admin's API keys to their account
    // If they try to save admin keys, treat as empty (they'll use admin keys via fallback)
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;

    // Only save user's custom API keys, not admin keys
    if (geminiApiKey !== undefined) {
      updateData.geminiApiKey = (geminiApiKey === ADMIN_GEMINI_KEY || geminiApiKey === '') ? null : geminiApiKey;
    }
    if (openaiApiKey !== undefined) {
      updateData.openaiApiKey = (openaiApiKey === ADMIN_OPENAI_KEY || openaiApiKey === '') ? null : openaiApiKey;
    }
    if (preferredImageModel !== undefined) updateData.preferredImageModel = preferredImageModel;
    if (imageQuality !== undefined) updateData.imageQuality = imageQuality;
    if (defaultIndustry !== undefined) updateData.defaultIndustry = defaultIndustry;
    if (defaultTone !== undefined) updateData.defaultTone = defaultTone;
    if (defaultAspectRatio !== undefined) updateData.defaultAspectRatio = defaultAspectRatio;
    if (theme !== undefined) updateData.theme = theme;
    if (themeMode !== undefined) updateData.themeMode = themeMode;
    if (settings !== undefined) updateData.settings = settings;

    // Update the authenticated user
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        geminiApiKey: true,
        openaiApiKey: true,
        preferredImageModel: true,
        imageQuality: true,
        defaultIndustry: true,
        defaultTone: true,
        defaultAspectRatio: true,
        defaultBrandId: true,
        theme: true,
        themeMode: true,
        settings: true,
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // SECURITY: Never expose admin's default API keys to users
    // If user's keys match admin keys from environment, return empty strings
    if (user.geminiApiKey === ADMIN_GEMINI_KEY) {
      user.geminiApiKey = '';
    }
    if (user.openaiApiKey === ADMIN_OPENAI_KEY) {
      user.openaiApiKey = '';
    }

    res.json({
      success: true,
      user,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user settings',
      error: error.message
    });
  }
});

/**
 * POST /api/user/increment-usage
 * Increment usage counters
 */
router.post('/increment-usage', async (req, res) => {
  try {
    const { type } = req.body; // 'ads', 'prompts', or 'angles'

    // Increment appropriate counter for authenticated user
    const incrementField =
      type === 'ads' ? 'adsGenerated' :
      type === 'prompts' ? 'promptsGenerated' :
      'anglesGenerated';

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        [incrementField]: {
          increment: 1
        }
      },
      select: {
        id: true,
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment usage',
      error: error.message
    });
  }
});

/**
 * GET /api/user/stats
 * Get user statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      adsGenerated: user.adsGenerated || 0,
      promptsGenerated: user.promptsGenerated || 0,
      anglesGenerated: user.anglesGenerated || 0,
      memberSince: user.createdAt
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
});

export default router;
