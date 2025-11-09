import express from 'express';
import { nanoid } from 'nanoid';
import prisma from '../../utils/prisma.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireAgencyLicense, verifyClientOwnership } from '../../middleware/requireAgencyLicense.js';

const router = express.Router();

// Apply authentication and agency license middleware to all routes
router.use(authenticateUser);
router.use(requireAgencyLicense);

/**
 * GET /api/agency/clients
 * List all clients for the authenticated agency user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status = 'all',
      search = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      agencyUserId: userId
    };

    // Filter by status
    if (status !== 'all') {
      where.status = status;
    }

    // Search by name, email, or company
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientEmail: { contains: search, mode: 'insensitive' } },
        { clientCompany: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get clients with counts
    const [clients, total] = await Promise.all([
      prisma.clientAccount.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              projects: true,
              ads: true,
              brands: true
            }
          }
        }
      }),
      prisma.clientAccount.count({ where })
    ]);

    res.json({
      success: true,
      clients: clients.map(client => ({
        id: client.id,
        clientName: client.clientName,
        clientEmail: client.clientEmail,
        clientCompany: client.clientCompany,
        status: client.status,
        creditsAllocated: client.creditsAllocated,
        creditsUsed: client.creditsUsed,
        lastAccess: client.lastAccess,
        createdAt: client.createdAt,
        stats: {
          projects: client._count.projects,
          ads: client._count.ads,
          brands: client._count.brands
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    res.status(500).json({
      error: 'Failed to fetch clients',
      message: error.message
    });
  }
});

/**
 * POST /api/agency/clients
 * Create a new client account
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      clientEmail,
      clientName,
      clientCompany,
      creditsAllocated
    } = req.body;

    // Validation
    if (!clientEmail) {
      return res.status(400).json({
        error: 'Client email is required'
      });
    }

    // Check for duplicate email for this agency
    const existingClient = await prisma.clientAccount.findFirst({
      where: {
        agencyUserId: userId,
        clientEmail: clientEmail.toLowerCase()
      }
    });

    if (existingClient) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client with this email already exists in your agency'
      });
    }

    // Generate unique access token
    const accessToken = `client_${nanoid(32)}`;

    // Create client
    const client = await prisma.clientAccount.create({
      data: {
        agencyUserId: userId,
        clientEmail: clientEmail.toLowerCase(),
        clientName: clientName || null,
        clientCompany: clientCompany || null,
        accessToken,
        creditsAllocated: creditsAllocated || null,
        status: 'active'
      }
    });

    console.log('✅ New client created:', client.id);

    // TODO: Send invitation email to client
    // await sendClientInvitationEmail(client);

    res.status(201).json({
      success: true,
      client: {
        id: client.id,
        clientEmail: client.clientEmail,
        clientName: client.clientName,
        clientCompany: client.clientCompany,
        accessToken: client.accessToken,
        status: client.status,
        createdAt: client.createdAt
      },
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating client:', error);
    res.status(500).json({
      error: 'Failed to create client',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/clients/:clientId
 * Get a specific client's details
 */
router.get('/:clientId', verifyClientOwnership, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const client = await prisma.clientAccount.findUnique({
      where: { id: clientId },
      include: {
        _count: {
          select: {
            projects: true,
            ads: true,
            brands: true,
            messages: true,
            files: true,
            approvals: true
          }
        },
        projects: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      client: {
        id: client.id,
        clientEmail: client.clientEmail,
        clientName: client.clientName,
        clientCompany: client.clientCompany,
        accessToken: client.accessToken,
        status: client.status,
        creditsAllocated: client.creditsAllocated,
        creditsUsed: client.creditsUsed,
        lastAccess: client.lastAccess,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        stats: {
          projects: client._count.projects,
          ads: client._count.ads,
          brands: client._count.brands,
          messages: client._count.messages,
          files: client._count.files,
          pendingApprovals: client._count.approvals
        },
        recentProjects: client.projects
      }
    });

  } catch (error) {
    console.error('❌ Error fetching client:', error);
    res.status(500).json({
      error: 'Failed to fetch client',
      message: error.message
    });
  }
});

/**
 * PATCH /api/agency/clients/:clientId
 * Update a client's information
 */
router.patch('/:clientId', verifyClientOwnership, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const {
      clientName,
      clientEmail,
      clientCompany,
      status,
      creditsAllocated
    } = req.body;

    // Build update data
    const updateData = {};

    if (clientName !== undefined) updateData.clientName = clientName;
    if (clientEmail !== undefined) updateData.clientEmail = clientEmail.toLowerCase();
    if (clientCompany !== undefined) updateData.clientCompany = clientCompany;
    if (status !== undefined) updateData.status = status;
    if (creditsAllocated !== undefined) updateData.creditsAllocated = creditsAllocated;

    // Update client
    const updatedClient = await prisma.clientAccount.update({
      where: { id: clientId },
      data: updateData
    });

    console.log('✅ Client updated:', clientId);

    res.json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating client:', error);
    res.status(500).json({
      error: 'Failed to update client',
      message: error.message
    });
  }
});

/**
 * DELETE /api/agency/clients/:clientId
 * Delete (archive) a client account
 */
router.delete('/:clientId', verifyClientOwnership, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Soft delete by setting status to 'archived' instead of hard delete
    // Or perform hard delete - this will cascade delete related records
    const hardDelete = req.query.hard === 'true';

    if (hardDelete) {
      // Hard delete - will cascade to projects, ads, etc.
      await prisma.clientAccount.delete({
        where: { id: clientId }
      });

      console.log('✅ Client permanently deleted:', clientId);

      res.json({
        success: true,
        message: 'Client permanently deleted'
      });
    } else {
      // Soft delete - change status
      await prisma.clientAccount.update({
        where: { id: clientId },
        data: { status: 'archived' }
      });

      console.log('✅ Client archived:', clientId);

      res.json({
        success: true,
        message: 'Client archived successfully'
      });
    }

  } catch (error) {
    console.error('❌ Error deleting client:', error);
    res.status(500).json({
      error: 'Failed to delete client',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/clients/:clientId/stats
 * Get detailed statistics for a client
 */
router.get('/:clientId/stats', verifyClientOwnership, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get stats
    const [
      totalAds,
      recentAds,
      totalProjects,
      activeProjects,
      pendingApprovals,
      totalBrands,
      usageLogs
    ] = await Promise.all([
      // Total ads ever
      prisma.ad.count({
        where: { clientAccountId: clientId }
      }),
      // Ads in period
      prisma.ad.count({
        where: {
          clientAccountId: clientId,
          createdAt: { gte: startDate }
        }
      }),
      // Total projects
      prisma.clientProject.count({
        where: { clientAccountId: clientId }
      }),
      // Active projects
      prisma.clientProject.count({
        where: {
          clientAccountId: clientId,
          status: 'active'
        }
      }),
      // Pending approvals
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'pending'
        }
      }),
      // Total brands
      prisma.brand.count({
        where: { clientAccountId: clientId }
      }),
      // Usage logs in period
      prisma.usageLog.findMany({
        where: {
          clientAccountId: clientId,
          createdAt: { gte: startDate }
        },
        select: {
          actionType: true,
          creditsConsumed: true,
          createdAt: true
        }
      })
    ]);

    // Calculate credits consumed
    const creditsConsumed = usageLogs.reduce((sum, log) => sum + log.creditsConsumed, 0);

    res.json({
      success: true,
      period,
      startDate,
      endDate: now,
      stats: {
        ads: {
          total: totalAds,
          inPeriod: recentAds
        },
        projects: {
          total: totalProjects,
          active: activeProjects
        },
        approvals: {
          pending: pendingApprovals
        },
        brands: {
          total: totalBrands
        },
        credits: {
          consumed: creditsConsumed
        }
      },
      activity: usageLogs.map(log => ({
        type: log.actionType,
        credits: log.creditsConsumed,
        date: log.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching client stats:', error);
    res.status(500).json({
      error: 'Failed to fetch client stats',
      message: error.message
    });
  }
});

export default router;
