import express from 'express';
import prisma from '../../utils/prisma.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Get cost summary
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCosts, todayCosts, weekCosts, monthCosts, totalUsers] = await Promise.all([
      prisma.apiUsageLog.aggregate({
        _sum: { estimatedCost: true, totalTokens: true },
        _count: { id: true }
      }),
      prisma.apiUsageLog.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { estimatedCost: true }
      }),
      prisma.apiUsageLog.aggregate({
        where: { createdAt: { gte: thisWeekStart } },
        _sum: { estimatedCost: true }
      }),
      prisma.apiUsageLog.aggregate({
        where: { createdAt: { gte: thisMonthStart } },
        _sum: { estimatedCost: true }
      }),
      prisma.user.count()
    ]);

    const avgCostPerUser = totalUsers > 0
      ? (totalCosts._sum.estimatedCost || 0) / totalUsers
      : 0;

    const avgCostPerRequest = totalCosts._count.id > 0
      ? (totalCosts._sum.estimatedCost || 0) / totalCosts._count.id
      : 0;

    res.json({
      success: true,
      summary: {
        total: totalCosts._sum.estimatedCost || 0,
        today: todayCosts._sum.estimatedCost || 0,
        thisWeek: weekCosts._sum.estimatedCost || 0,
        thisMonth: monthCosts._sum.estimatedCost || 0,
        totalTokens: totalCosts._sum.totalTokens || 0,
        totalRequests: totalCosts._count.id || 0,
        avgCostPerUser: avgCostPerUser.toFixed(4),
        avgCostPerRequest: avgCostPerRequest.toFixed(6)
      }
    });
  } catch (error) {
    console.error('Cost summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch cost summary',
      message: error.message
    });
  }
});

// Get costs by provider
router.get('/by-provider', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const providerCosts = await prisma.apiUsageLog.groupBy({
      by: ['provider'],
      where: {
        createdAt: { gte: daysAgo }
      },
      _sum: {
        estimatedCost: true,
        totalTokens: true
      },
      _count: {
        id: true
      }
    });

    const data = providerCosts.map(p => ({
      provider: p.provider,
      cost: p._sum.estimatedCost || 0,
      tokens: p._sum.totalTokens || 0,
      requests: p._count.id
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Cost by provider error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs by provider',
      message: error.message
    });
  }
});

// Get costs by model
router.get('/by-model', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const modelCosts = await prisma.apiUsageLog.groupBy({
      by: ['provider', 'model'],
      where: {
        createdAt: { gte: daysAgo }
      },
      _sum: {
        estimatedCost: true,
        totalTokens: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          estimatedCost: 'desc'
        }
      }
    });

    const data = modelCosts.map(m => ({
      provider: m.provider,
      model: m.model,
      cost: m._sum.estimatedCost || 0,
      tokens: m._sum.totalTokens || 0,
      requests: m._count.id
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Cost by model error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs by model',
      message: error.message
    });
  }
});

// Get costs by feature
router.get('/by-feature', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const featureCosts = await prisma.apiUsageLog.groupBy({
      by: ['feature'],
      where: {
        createdAt: { gte: daysAgo }
      },
      _sum: {
        estimatedCost: true,
        totalTokens: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          estimatedCost: 'desc'
        }
      }
    });

    const data = featureCosts.map(f => ({
      feature: f.feature,
      cost: f._sum.estimatedCost || 0,
      tokens: f._sum.totalTokens || 0,
      requests: f._count.id
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Cost by feature error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs by feature',
      message: error.message
    });
  }
});

// Get cost trend over time
router.get('/trend', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const logs = await prisma.apiUsageLog.findMany({
      where: {
        createdAt: { gte: daysAgo }
      },
      select: {
        createdAt: true,
        estimatedCost: true,
        provider: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date and provider
    const dailyData = {};

    logs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, total: 0, gemini: 0, openai: 0 };
      }
      const cost = log.estimatedCost || 0;
      dailyData[date].total += cost;
      dailyData[date][log.provider] += cost;
    });

    const chartData = Object.values(dailyData).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Cost trend error:', error);
    res.status(500).json({
      error: 'Failed to fetch cost trend',
      message: error.message
    });
  }
});

// Get detailed API usage logs with pagination
router.get('/logs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      provider = '',
      model = '',
      feature = '',
      userId = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (provider) where.provider = provider;
    if (model) where.model = model;
    if (feature) where.feature = feature;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.apiUsageLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }),
      prisma.apiUsageLog.count({ where })
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error.message
    });
  }
});

// Get top users by cost
router.get('/top-users', async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const userCosts = await prisma.apiUsageLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: daysAgo },
        userId: { not: null }
      },
      _sum: {
        estimatedCost: true,
        totalTokens: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          estimatedCost: 'desc'
        }
      },
      take: parseInt(limit)
    });

    // Get user details
    const userIds = userCosts.map(uc => uc.userId).filter(id => id);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = u;
    });

    const data = userCosts.map(uc => ({
      user: usersMap[uc.userId],
      cost: uc._sum.estimatedCost || 0,
      tokens: uc._sum.totalTokens || 0,
      requests: uc._count.id
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Top users error:', error);
    res.status(500).json({
      error: 'Failed to fetch top users',
      message: error.message
    });
  }
});

export default router;
