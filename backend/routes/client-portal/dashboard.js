import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateClient } from '../../middleware/clientAuth.js';

const router = express.Router();

// Apply client authentication to all routes
router.use(authenticateClient);

/**
 * GET /api/client-portal/dashboard
 * Get comprehensive dashboard data for client
 */
router.get('/dashboard', async (req, res) => {
  try {
    const clientId = req.client.id;

    // Get all relevant stats in parallel
    const [
      clientAccount,
      totalAds,
      totalProjects,
      totalApprovals,
      pendingApprovals,
      approvedAds,
      recentAds,
      recentApprovals,
      projects
    ] = await Promise.all([
      // Client account info
      prisma.clientAccount.findUnique({
        where: { id: clientId },
        include: {
          agencyUser: {
            select: {
              name: true,
              email: true,
              company: true
            }
          }
        }
      }),

      // Total ads
      prisma.ad.count({
        where: { clientAccountId: clientId }
      }),

      // Total projects
      prisma.clientProject.count({
        where: { clientAccountId: clientId }
      }),

      // Total approvals
      prisma.clientAdApproval.count({
        where: { clientAccountId: clientId }
      }),

      // Pending approvals
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'pending'
        }
      }),

      // Approved ads
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'approved'
        }
      }),

      // Recent ads (last 5)
      prisma.ad.findMany({
        where: { clientAccountId: clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          headline: true,
          createdAt: true,
          imageMimeType: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),

      // Recent approval requests (last 5)
      prisma.clientAdApproval.findMany({
        where: { clientAccountId: clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          ad: {
            select: {
              id: true,
              headline: true,
              imageData: true,
              imageMimeType: true
            }
          }
        }
      }),

      // Active projects
      prisma.clientProject.findMany({
        where: {
          clientAccountId: clientId,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: {
            select: {
              ads: true
            }
          }
        }
      })
    ]);

    // Calculate approval rate
    const approvalRate = totalApprovals > 0
      ? Math.round((approvedAds / totalApprovals) * 100)
      : 0;

    res.json({
      success: true,
      dashboard: {
        client: {
          id: clientAccount.id,
          email: clientAccount.clientEmail,
          name: clientAccount.clientName,
          company: clientAccount.clientCompany,
          status: clientAccount.status,
          creditsAllocated: clientAccount.creditsAllocated,
          creditsUsed: clientAccount.creditsUsed,
          creditsRemaining: clientAccount.creditsAllocated
            ? clientAccount.creditsAllocated - clientAccount.creditsUsed
            : null,
          createdAt: clientAccount.createdAt,
          lastAccess: clientAccount.lastAccess
        },
        agency: {
          name: clientAccount.agencyUser.name,
          email: clientAccount.agencyUser.email,
          company: clientAccount.agencyUser.company
        },
        stats: {
          totalAds,
          totalProjects,
          totalApprovals,
          pendingApprovals,
          approvedAds,
          approvalRate
        },
        recentActivity: {
          ads: recentAds,
          approvals: recentApprovals
        },
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          adsCount: p._count.ads,
          startDate: p.startDate,
          endDate: p.endDate,
          deadline: p.deadline
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching client dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard',
      message: error.message
    });
  }
});

/**
 * GET /api/client-portal/projects
 * Get all projects for this client
 */
router.get('/projects', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { status } = req.query;

    const where = {
      clientAccountId: clientId
    };

    if (status) {
      where.status = status;
    }

    const projects = await prisma.clientProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            ads: true
          }
        }
      }
    });

    res.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        budget: p.budget,
        currency: p.currency,
        startDate: p.startDate,
        endDate: p.endDate,
        deadline: p.deadline,
        adsCount: p._count.ads,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        metadata: p.metadata
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching client projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

/**
 * GET /api/client-portal/projects/:projectId
 * Get single project details with ads
 */
router.get('/projects/:projectId', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { projectId } = req.params;

    const project = await prisma.clientProject.findFirst({
      where: {
        id: projectId,
        clientAccountId: clientId
      },
      include: {
        ads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            headline: true,
            description: true,
            imageData: true,
            imageMimeType: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            ads: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'This project does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        currency: project.currency,
        startDate: project.startDate,
        endDate: project.endDate,
        deadline: project.deadline,
        adsCount: project._count.ads,
        recentAds: project.ads,
        metadata: project.metadata,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      message: error.message
    });
  }
});

export default router;
