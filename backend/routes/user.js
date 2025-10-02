import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// For demo purposes, we'll use a single user ID
// In production, this would come from authentication
const DEFAULT_USER_ID = 'default-user';

/**
 * GET /api/user/settings
 * Get user settings (or create default if doesn't exist)
 */
router.get('/settings', async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    });

    // Create default user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          preferredImageModel: 'gemini',
          imageQuality: 'standard',
          defaultTone: 'professional yet approachable',
          defaultAspectRatio: 'square',
          theme: 'solar-dusk',
          themeMode: 'dark'
        }
      });
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

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          name,
          email,
          company,
          geminiApiKey,
          openaiApiKey,
          preferredImageModel: preferredImageModel || 'gemini',
          imageQuality: imageQuality || 'standard',
          defaultIndustry,
          defaultTone: defaultTone || 'professional yet approachable',
          defaultAspectRatio: defaultAspectRatio || 'square',
          theme: theme || 'solar-dusk',
          themeMode: themeMode || 'dark',
          settings
        }
      });
    } else {
      // Update existing user
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (company !== undefined) updateData.company = company;
      if (geminiApiKey !== undefined) updateData.geminiApiKey = geminiApiKey;
      if (openaiApiKey !== undefined) updateData.openaiApiKey = openaiApiKey;
      if (preferredImageModel !== undefined) updateData.preferredImageModel = preferredImageModel;
      if (imageQuality !== undefined) updateData.imageQuality = imageQuality;
      if (defaultIndustry !== undefined) updateData.defaultIndustry = defaultIndustry;
      if (defaultTone !== undefined) updateData.defaultTone = defaultTone;
      if (defaultAspectRatio !== undefined) updateData.defaultAspectRatio = defaultAspectRatio;
      if (theme !== undefined) updateData.theme = theme;
      if (themeMode !== undefined) updateData.themeMode = themeMode;
      if (settings !== undefined) updateData.settings = settings;

      user = await prisma.user.update({
        where: { id: DEFAULT_USER_ID },
        data: updateData
      });
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

    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    });

    if (!user) {
      // Create user with initial count
      const incrementData = {
        id: DEFAULT_USER_ID,
        adsGenerated: type === 'ads' ? 1 : 0,
        promptsGenerated: type === 'prompts' ? 1 : 0,
        anglesGenerated: type === 'angles' ? 1 : 0
      };

      user = await prisma.user.create({
        data: incrementData
      });
    } else {
      // Increment appropriate counter
      const incrementField =
        type === 'ads' ? 'adsGenerated' :
        type === 'prompts' ? 'promptsGenerated' :
        'anglesGenerated';

      user = await prisma.user.update({
        where: { id: DEFAULT_USER_ID },
        data: {
          [incrementField]: {
            increment: 1
          }
        }
      });
    }

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
      where: { id: DEFAULT_USER_ID }
    });

    const stats = {
      adsGenerated: user?.adsGenerated || 0,
      promptsGenerated: user?.promptsGenerated || 0,
      anglesGenerated: user?.anglesGenerated || 0,
      memberSince: user?.createdAt || new Date()
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
