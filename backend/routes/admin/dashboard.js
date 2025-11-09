import express from 'express';
import prisma from '../../utils/prisma.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Get overview statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // User statistics
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsersLast7Days,
      activeUsersLast30Days
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: thisWeekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
      // Note: "active" would need last login tracking - using creation as placeholder
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.count({ where: { createdAt: { gte: last30Days } } })
    ]);

    // Usage statistics
    const usageStats = await prisma.user.aggregate({
      _sum: {
        adsGenerated: true,
        promptsGenerated: true,
        anglesGenerated: true
      }
    });

    const [totalBrands, totalAds, totalPrompts, totalAngles] = await Promise.all([
      prisma.brand.count(),
      prisma.ad.count(),
      prisma.prompt.count(),
      prisma.angle.count()
    ]);

    // License statistics
    const [
      totalLicenses,
      activeLicenses,
      refundedLicenses,
      chargebackLicenses
    ] = await Promise.all([
      prisma.license.count(),
      prisma.license.count({ where: { status: 'active' } }),
      prisma.license.count({ where: { status: 'refunded' } }),
      prisma.license.count({ where: { status: 'chargeback' } })
    ]);

    // Revenue statistics (from transactions)
    const revenueStats = await prisma.jVZooTransaction.aggregate({
      where: {
        transactionType: 'SALE',
        verified: true,
        processed: true
      },
      _sum: {
        vendorEarnings: true
      }
    });

    const thisMonthRevenue = await prisma.jVZooTransaction.aggregate({
      where: {
        transactionType: 'SALE',
        verified: true,
        processed: true,
        createdAt: { gte: thisMonthStart }
      },
      _sum: {
        vendorEarnings: true
      }
    });

    // API usage and cost statistics (if available)
    const apiCostStats = await prisma.apiUsageLog.aggregate({
      _sum: {
        estimatedCost: true,
        totalTokens: true
      },
      _count: {
        id: true
      }
    });

    const thisMonthApiCost = await prisma.apiUsageLog.aggregate({
      where: {
        createdAt: { gte: thisMonthStart }
      },
      _sum: {
        estimatedCost: true
      }
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          activeLast7Days: activeUsersLast7Days,
          activeLast30Days: activeUsersLast30Days
        },
        usage: {
          totalAds: usageStats._sum.adsGenerated || 0,
          totalPrompts: usageStats._sum.promptsGenerated || 0,
          totalAngles: usageStats._sum.anglesGenerated || 0,
          totalBrands: totalBrands,
          adsInLibrary: totalAds,
          promptsInLibrary: totalPrompts,
          anglesInLibrary: totalAngles
        },
        licenses: {
          total: totalLicenses,
          active: activeLicenses,
          refunded: refundedLicenses,
          chargebacks: chargebackLicenses
        },
        revenue: {
          total: revenueStats._sum.vendorEarnings || 0,
          thisMonth: thisMonthRevenue._sum.vendorEarnings || 0
        },
        costs: {
          total: apiCostStats._sum.estimatedCost || 0,
          thisMonth: thisMonthApiCost._sum.estimatedCost || 0,
          totalApiCalls: apiCostStats._count.id || 0,
          totalTokens: apiCostStats._sum.totalTokens || 0
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Get user growth data for charts
router.get('/user-growth', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get daily user registrations
    const users = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: daysAgo }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date (truncate to day)
    const dailyData = {};
    users.forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + user._count.id;
    });

    const chartData = Object.entries(dailyData).map(([date, count]) => ({
      date,
      users: count
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('User growth data error:', error);
    res.status(500).json({
      error: 'Failed to fetch user growth data',
      message: error.message
    });
  }
});

// Get revenue trend data
router.get('/revenue-trend', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const transactions = await prisma.jVZooTransaction.findMany({
      where: {
        transactionType: 'SALE',
        verified: true,
        processed: true,
        createdAt: { gte: daysAgo }
      },
      select: {
        createdAt: true,
        vendorEarnings: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const dailyData = {};
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + (tx.vendorEarnings || 0);
    });

    const chartData = Object.entries(dailyData).map(([date, revenue]) => ({
      date,
      revenue: revenue.toFixed(2)
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Revenue trend data error:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue trend data',
      message: error.message
    });
  }
});

// Get usage statistics trend
router.get('/usage-stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get daily generation counts
    const [ads, prompts, angles] = await Promise.all([
      prisma.ad.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: daysAgo } },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.prompt.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: daysAgo } },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.angle.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: daysAgo } },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Combine data by date
    const dailyData = {};

    ads.forEach(ad => {
      const date = new Date(ad.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { date, ads: 0, prompts: 0, angles: 0 };
      dailyData[date].ads += ad._count.id;
    });

    prompts.forEach(prompt => {
      const date = new Date(prompt.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { date, ads: 0, prompts: 0, angles: 0 };
      dailyData[date].prompts += prompt._count.id;
    });

    angles.forEach(angle => {
      const date = new Date(angle.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { date, ads: 0, prompts: 0, angles: 0 };
      dailyData[date].angles += angle._count.id;
    });

    const chartData = Object.values(dailyData).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage statistics',
      message: error.message
    });
  }
});

export default router;
