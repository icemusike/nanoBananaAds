import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication
router.use(verifyAdminToken);

// Get costs summary
router.get('/summary', async (req, res) => {
  try {
    // Get total number of ads generated and users
    const totalUsers = await prisma.user.count().catch(() => 0);
    const adsAgg = await prisma.user.aggregate({
      _sum: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    }).catch(() => ({ _sum: { adsGenerated: 0, promptsGenerated: 0, anglesGenerated: 0 } }));

    const totalAds = adsAgg._sum.adsGenerated || 0;
    const totalPrompts = adsAgg._sum.promptsGenerated || 0;
    const totalAngles = adsAgg._sum.anglesGenerated || 0;
    const totalRequests = totalAds + totalPrompts + totalAngles;

    // Estimated costs based on typical usage
    // Gemini Flash: ~$0.0002 per image
    // GPT-4: ~$0.005 per ad copy generation
    // These are estimates - actual tracking would require logging API costs
    const estimatedImageCost = 0.0002;
    const estimatedCopyCost = 0.005;
    const estimatedPromptCost = 0.003;
    const estimatedAngleCost = 0.003;

    const estimatedTotal =
      (totalAds * (estimatedImageCost + estimatedCopyCost)) +
      (totalPrompts * estimatedPromptCost) +
      (totalAngles * estimatedAngleCost);

    // Get current month stats
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const usersThisMonth = await prisma.user.findMany({
      where: {
        createdAt: { gte: firstDayOfMonth }
      },
      select: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    }).catch(() => []);

    const thisMonthAds = usersThisMonth.reduce((sum, u) => sum + (u.adsGenerated || 0), 0);
    const thisMonthPrompts = usersThisMonth.reduce((sum, u) => sum + (u.promptsGenerated || 0), 0);
    const thisMonthAngles = usersThisMonth.reduce((sum, u) => sum + (u.anglesGenerated || 0), 0);

    const estimatedThisMonth =
      (thisMonthAds * (estimatedImageCost + estimatedCopyCost)) +
      (thisMonthPrompts * estimatedPromptCost) +
      (thisMonthAngles * estimatedAngleCost);

    res.json({
      success: true,
      summary: {
        total: estimatedTotal,
        thisMonth: estimatedThisMonth,
        avgCostPerRequest: totalRequests > 0 ? estimatedTotal / totalRequests : 0,
        totalRequests: totalRequests
      }
    });
  } catch (error) {
    console.error('❌ Costs summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

// Get costs by provider
router.get('/by-provider', async (req, res) => {
  try {
    const adsAgg = await prisma.user.aggregate({
      _sum: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    }).catch(() => ({ _sum: { adsGenerated: 0, promptsGenerated: 0, anglesGenerated: 0 } }));

    const totalAds = adsAgg._sum.adsGenerated || 0;
    const totalPrompts = adsAgg._sum.promptsGenerated || 0;
    const totalAngles = adsAgg._sum.anglesGenerated || 0;

    // Gemini is used for images
    const geminiRequests = totalAds;
    const geminiCost = geminiRequests * 0.0002;
    const geminiTokens = geminiRequests * 1000; // Estimated tokens per image

    // OpenAI is used for copy, prompts, and angles
    const openaiRequests = totalAds + totalPrompts + totalAngles;
    const openaiCost = (totalAds * 0.005) + (totalPrompts * 0.003) + (totalAngles * 0.003);
    const openaiTokens = openaiRequests * 500; // Estimated tokens per request

    const providerData = [
      {
        provider: 'Google Gemini',
        cost: geminiCost,
        requests: geminiRequests,
        tokens: geminiTokens
      },
      {
        provider: 'OpenAI',
        cost: openaiCost,
        requests: openaiRequests,
        tokens: openaiTokens
      }
    ];

    res.json({
      success: true,
      data: providerData
    });
  } catch (error) {
    console.error('❌ Costs by provider error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

// Get costs by model
router.get('/by-model', async (req, res) => {
  try {
    const adsAgg = await prisma.user.aggregate({
      _sum: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    }).catch(() => ({ _sum: { adsGenerated: 0, promptsGenerated: 0, anglesGenerated: 0 } }));

    const totalAds = adsAgg._sum.adsGenerated || 0;
    const totalPrompts = adsAgg._sum.promptsGenerated || 0;
    const totalAngles = adsAgg._sum.anglesGenerated || 0;

    const modelData = [
      {
        provider: 'Google',
        model: 'Gemini 2.5 Flash',
        cost: totalAds * 0.0002,
        requests: totalAds
      },
      {
        provider: 'OpenAI',
        model: 'GPT-4o',
        cost: totalAds * 0.005,
        requests: totalAds
      },
      {
        provider: 'OpenAI',
        model: 'GPT-4o (Prompts)',
        cost: totalPrompts * 0.003,
        requests: totalPrompts
      },
      {
        provider: 'OpenAI',
        model: 'GPT-4o (Angles)',
        cost: totalAngles * 0.003,
        requests: totalAngles
      }
    ];

    res.json({
      success: true,
      data: modelData
    });
  } catch (error) {
    console.error('❌ Costs by model error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

// Get costs by feature
router.get('/by-feature', async (req, res) => {
  try {
    const adsAgg = await prisma.user.aggregate({
      _sum: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    }).catch(() => ({ _sum: { adsGenerated: 0, promptsGenerated: 0, anglesGenerated: 0 } }));

    const totalAds = adsAgg._sum.adsGenerated || 0;
    const totalPrompts = adsAgg._sum.promptsGenerated || 0;
    const totalAngles = adsAgg._sum.anglesGenerated || 0;

    const featureData = [
      {
        feature: 'Ad Generation (Full)',
        cost: totalAds * 0.0052, // Image + Copy
        requests: totalAds
      },
      {
        feature: 'Creative Prompts',
        cost: totalPrompts * 0.003,
        requests: totalPrompts
      },
      {
        feature: 'Ad Angles',
        cost: totalAngles * 0.003,
        requests: totalAngles
      }
    ];

    res.json({
      success: true,
      data: featureData
    });
  } catch (error) {
    console.error('❌ Costs by feature error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

export default router;
