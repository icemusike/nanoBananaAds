import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateClient } from '../../middleware/clientAuth.js';

const router = express.Router();

// Apply client authentication to all routes
router.use(authenticateClient);

/**
 * GET /api/client-portal/ads
 * Get all ads for this client
 */
router.get('/ads', async (req, res) => {
  try {
    const clientId = req.client.id;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      projectId,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      clientAccountId: clientId
    };

    if (projectId) {
      where.projectId = projectId;
    }

    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        { headline: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { primaryText: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    // Get ads with project info (exclude imageData for performance)
    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          headline: true,
          description: true,
          primaryText: true,
          callToAction: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          clientAccountId: true,
          projectId: true,
          // Exclude imageData from list view for performance
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          approvals: {
            where: {
              clientAccountId: clientId
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      }),
      prisma.ad.count({ where })
    ]);

    res.json({
      success: true,
      ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching client ads:', error);
    res.status(500).json({
      error: 'Failed to fetch ads',
      message: error.message
    });
  }
});

/**
 * GET /api/client-portal/ads/:adId
 * Get a single ad with full details
 */
router.get('/ads/:adId', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { adId } = req.params;

    const ad = await prisma.ad.findFirst({
      where: {
        id: adId,
        clientAccountId: clientId
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true
          }
        },
        approvals: {
          where: {
            clientAccountId: clientId
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({
        error: 'Ad not found',
        message: 'This ad does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      ad
    });

  } catch (error) {
    console.error('❌ Error fetching ad:', error);
    res.status(500).json({
      error: 'Failed to fetch ad',
      message: error.message
    });
  }
});

/**
 * GET /api/client-portal/ads/stats/summary
 * Get ad statistics for the client dashboard
 */
router.get('/ads/stats/summary', async (req, res) => {
  try {
    const clientId = req.client.id;

    const [totalAds, adsByProject, recentAds] = await Promise.all([
      // Total ads count
      prisma.ad.count({
        where: { clientAccountId: clientId }
      }),

      // Ads grouped by project
      prisma.ad.groupBy({
        by: ['projectId'],
        where: { clientAccountId: clientId },
        _count: true
      }),

      // Recent ads (last 7 days)
      prisma.ad.count({
        where: {
          clientAccountId: clientId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get project details for grouped data
    const projectIds = adsByProject
      .filter(item => item.projectId)
      .map(item => item.projectId);

    const projects = await prisma.clientProject.findMany({
      where: {
        id: { in: projectIds }
      },
      select: {
        id: true,
        name: true
      }
    });

    const projectMap = Object.fromEntries(
      projects.map(p => [p.id, p.name])
    );

    const adsByProjectWithNames = adsByProject.map(item => ({
      projectId: item.projectId,
      projectName: item.projectId ? projectMap[item.projectId] : 'No Project',
      count: item._count
    }));

    res.json({
      success: true,
      stats: {
        totalAds,
        recentAds,
        adsByProject: adsByProjectWithNames
      }
    });

  } catch (error) {
    console.error('❌ Error fetching ad stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

export default router;
