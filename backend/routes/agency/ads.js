import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireAgencyLicense, verifyClientOwnership } from '../../middleware/requireAgencyLicense.js';

const router = express.Router();

// Apply authentication and agency license middleware to all routes
router.use(authenticateUser);
router.use(requireAgencyLicense);

/**
 * GET /api/agency/ads
 * Get all ads across all agency clients
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      clientId,
      projectId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause - only get ads for this agency's clients
    const where = {
      clientAccount: {
        agencyUserId: userId
      }
    };

    // Filter by specific client if provided
    if (clientId) {
      where.clientAccountId = clientId;
    }

    // Filter by project if provided
    if (projectId) {
      where.projectId = projectId;
    }

    // Get ads with client and project info
    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          clientAccount: {
            select: {
              id: true,
              clientName: true,
              clientEmail: true,
              clientCompany: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      }),
      prisma.ad.count({ where })
    ]);

    // Transform ads to include only necessary data
    const transformedAds = ads.map(ad => ({
      id: ad.id,
      headline: ad.headline,
      description: ad.description,
      primaryText: ad.primaryText,
      callToAction: ad.callToAction,
      imageData: ad.imageData,
      imageMimeType: ad.imageMimeType,
      industry: ad.industry,
      category: ad.category,
      template: ad.template,
      aspectRatio: ad.aspectRatio,
      createdAt: ad.createdAt,
      client: ad.clientAccount ? {
        id: ad.clientAccount.id,
        name: ad.clientAccount.clientName || ad.clientAccount.clientEmail,
        company: ad.clientAccount.clientCompany
      } : null,
      project: ad.project ? {
        id: ad.project.id,
        name: ad.project.name,
        status: ad.project.status
      } : null
    }));

    res.json({
      success: true,
      ads: transformedAds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching agency ads:', error);
    res.status(500).json({
      error: 'Failed to fetch ads',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/clients/:clientId/ads
 * Get all ads for a specific client
 */
router.get('/clients/:clientId/ads', verifyClientOwnership, async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      page = 1,
      limit = 20,
      projectId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      clientAccountId: clientId
    };

    // Filter by project if provided
    if (projectId) {
      where.projectId = projectId;
    }

    // Get ads for this client (exclude imageData to reduce response size)
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
          imageMimeType: true,
          industry: true,
          category: true,
          template: true,
          aspectRatio: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      }),
      prisma.ad.count({ where })
    ]);

    res.json({
      success: true,
      ads: ads.map(ad => ({
        id: ad.id,
        headline: ad.headline,
        description: ad.description,
        primaryText: ad.primaryText,
        callToAction: ad.callToAction,
        imageMimeType: ad.imageMimeType,
        industry: ad.industry,
        category: ad.category,
        template: ad.template,
        aspectRatio: ad.aspectRatio,
        createdAt: ad.createdAt,
        project: ad.project ? {
          id: ad.project.id,
          name: ad.project.name,
          status: ad.project.status
        } : null
      })),
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
      error: 'Failed to fetch client ads',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/ads/:adId
 * Get a single ad with full image data
 */
router.get('/ads/:adId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { adId } = req.params;

    // Get ad and verify it belongs to this agency user's client
    const ad = await prisma.ad.findFirst({
      where: {
        id: adId,
        clientAccount: {
          agencyUserId: userId
        }
      },
      include: {
        clientAccount: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true,
            clientCompany: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({
        error: 'Ad not found',
        message: 'This ad does not exist or does not belong to your agency'
      });
    }

    res.json({
      success: true,
      ad: {
        id: ad.id,
        headline: ad.headline,
        description: ad.description,
        primaryText: ad.primaryText,
        callToAction: ad.callToAction,
        imageData: ad.imageData, // Include full image data
        imageMimeType: ad.imageMimeType,
        industry: ad.industry,
        category: ad.category,
        template: ad.template,
        aspectRatio: ad.aspectRatio,
        createdAt: ad.createdAt,
        client: ad.clientAccount ? {
          id: ad.clientAccount.id,
          name: ad.clientAccount.clientName || ad.clientAccount.clientEmail,
          company: ad.clientAccount.clientCompany
        } : null,
        project: ad.project ? {
          id: ad.project.id,
          name: ad.project.name,
          status: ad.project.status
        } : null
      }
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
 * GET /api/agency/projects/:projectId/ads
 * Get all ads for a specific project
 */
router.get('/projects/:projectId/ads', async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify project belongs to this agency user
    const project = await prisma.clientProject.findFirst({
      where: {
        id: projectId,
        clientAccount: {
          agencyUserId: userId
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'This project does not exist or does not belong to your agency'
      });
    }

    // Get ads for this project
    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where: { projectId },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.ad.count({ where: { projectId } })
    ]);

    res.json({
      success: true,
      ads: ads.map(ad => ({
        id: ad.id,
        headline: ad.headline,
        description: ad.description,
        primaryText: ad.primaryText,
        callToAction: ad.callToAction,
        imageData: ad.imageData,
        imageMimeType: ad.imageMimeType,
        industry: ad.industry,
        category: ad.category,
        template: ad.template,
        aspectRatio: ad.aspectRatio,
        createdAt: ad.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching project ads:', error);
    res.status(500).json({
      error: 'Failed to fetch project ads',
      message: error.message
    });
  }
});

export default router;
