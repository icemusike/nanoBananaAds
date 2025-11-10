import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication
router.use(verifyAdminToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts with error handling
    const totalUsers = await prisma.user.count().catch(() => 0);
    const adsAgg = await prisma.user.aggregate({
      _sum: { adsGenerated: true }
    }).catch(() => ({ _sum: { adsGenerated: 0 } }));
    const totalPrompts = await prisma.prompt.count().catch(() => 0);
    const totalAngles = await prisma.angle.count().catch(() => 0);
    const totalBrands = await prisma.brand.count().catch(() => 0);
    const totalLicenses = await prisma.license.count().catch(() => 0);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        adsGenerated: true
      }
    }).catch(() => []);

    // Get license breakdown
    const licenseBreakdown = await prisma.license.groupBy({
      by: ['licenseTier'],
      _count: true
    }).catch(() => []);

    // Get user activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    }).catch(() => 0);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          newLast30Days: newUsersLast30Days || 0
        },
        content: {
          totalAds: adsAgg._sum.adsGenerated || 0,
          totalPrompts,
          totalAngles,
          totalBrands
        },
        licenses: {
          total: totalLicenses,
          breakdown: licenseBreakdown
        }
      },
      recentUsers
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch dashboard stats',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Get user growth over time
router.get('/user-growth', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: daysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const growthData = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      growthData[date] = (growthData[date] || 0) + 1;
    });

    res.json({
      success: true,
      growthData
    });
  } catch (error) {
    console.error('User growth error:', error);
    res.status(500).json({
      error: 'Failed to fetch user growth',
      message: error.message
    });
  }
});

// Get content generation stats
router.get('/content-stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get prompts created in timeframe
    const promptsCount = await prisma.prompt.count({
      where: {
        createdAt: {
          gte: daysAgo
        }
      }
    });

    // Get angles created in timeframe
    const anglesCount = await prisma.angle.count({
      where: {
        createdAt: {
          gte: daysAgo
        }
      }
    });

    // Get most active users
    const activeUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        adsGenerated: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    });

    res.json({
      success: true,
      stats: {
        promptsLast30Days: promptsCount,
        anglesLast30Days: anglesCount
      },
      activeUsers
    });
  } catch (error) {
    console.error('Content stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch content stats',
      message: error.message
    });
  }
});

export default router;
