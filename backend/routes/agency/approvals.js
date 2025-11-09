import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireAgencyLicense, verifyClientOwnership } from '../../middleware/requireAgencyLicense.js';

const router = express.Router();

// Apply authentication and agency license middleware to all routes
router.use(authenticateUser);
router.use(requireAgencyLicense);

/**
 * POST /api/agency/ads/:adId/submit-for-approval
 * Submit an ad to client for approval
 */
router.post('/ads/:adId/submit-for-approval', async (req, res) => {
  try {
    const userId = req.user.id;
    const { adId } = req.params;
    const { message } = req.body;

    // Verify ad belongs to this agency user
    const ad = await prisma.ad.findFirst({
      where: {
        id: adId,
        clientAccount: {
          agencyUserId: userId
        }
      },
      include: {
        clientAccount: true
      }
    });

    if (!ad) {
      return res.status(404).json({
        error: 'Ad not found',
        message: 'This ad does not exist or does not belong to your agency'
      });
    }

    if (!ad.clientAccountId) {
      return res.status(400).json({
        error: 'No client assigned',
        message: 'This ad is not assigned to any client. Please assign it to a client first.'
      });
    }

    // Check if there's already a pending approval
    const existingApproval = await prisma.clientAdApproval.findFirst({
      where: {
        adId,
        status: 'pending'
      }
    });

    if (existingApproval) {
      return res.status(400).json({
        error: 'Approval already pending',
        message: 'This ad is already pending approval from the client'
      });
    }

    // Create approval request
    const approval = await prisma.clientAdApproval.create({
      data: {
        adId,
        clientAccountId: ad.clientAccountId,
        status: 'pending',
        submitterMessage: message || null,
        submittedBy: userId,
        submittedAt: new Date()
      },
      include: {
        ad: {
          select: {
            id: true,
            headline: true,
            imageMimeType: true
          }
        },
        clientAccount: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true
          }
        }
      }
    });

    // TODO: Send email notification to client

    res.json({
      success: true,
      approval,
      message: 'Ad submitted for approval successfully'
    });

  } catch (error) {
    console.error('❌ Error submitting ad for approval:', error);
    res.status(500).json({
      error: 'Failed to submit ad for approval',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/approvals
 * Get all approval requests across all clients
 */
router.get('/approvals', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      clientId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      ad: {
        clientAccount: {
          agencyUserId: userId
        }
      }
    };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientAccountId = clientId;
    }

    // Get approvals
    const [approvals, total] = await Promise.all([
      prisma.clientAdApproval.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          ad: {
            select: {
              id: true,
              headline: true,
              description: true,
              imageMimeType: true,
              industry: true,
              category: true,
              createdAt: true
            }
          },
          clientAccount: {
            select: {
              id: true,
              clientName: true,
              clientEmail: true,
              clientCompany: true
            }
          }
        }
      }),
      prisma.clientAdApproval.count({ where })
    ]);

    res.json({
      success: true,
      approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching approvals:', error);
    res.status(500).json({
      error: 'Failed to fetch approvals',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/clients/:clientId/approvals
 * Get all approval requests for a specific client
 */
router.get('/clients/:clientId/approvals', verifyClientOwnership, async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      clientAccountId: clientId
    };

    if (status) {
      where.status = status;
    }

    const [approvals, total] = await Promise.all([
      prisma.clientAdApproval.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          ad: {
            select: {
              id: true,
              headline: true,
              description: true,
              imageMimeType: true,
              industry: true,
              category: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.clientAdApproval.count({ where })
    ]);

    res.json({
      success: true,
      approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching client approvals:', error);
    res.status(500).json({
      error: 'Failed to fetch approvals',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/approvals/:approvalId
 * Get a single approval request with full details
 */
router.get('/approvals/:approvalId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { approvalId } = req.params;

    const approval = await prisma.clientAdApproval.findFirst({
      where: {
        id: approvalId,
        ad: {
          clientAccount: {
            agencyUserId: userId
          }
        }
      },
      include: {
        ad: true,
        clientAccount: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true,
            clientCompany: true
          }
        }
      }
    });

    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        message: 'This approval request does not exist or does not belong to your agency'
      });
    }

    res.json({
      success: true,
      approval
    });

  } catch (error) {
    console.error('❌ Error fetching approval:', error);
    res.status(500).json({
      error: 'Failed to fetch approval',
      message: error.message
    });
  }
});

/**
 * PATCH /api/agency/approvals/:approvalId/cancel
 * Cancel a pending approval request (agency side)
 */
router.patch('/approvals/:approvalId/cancel', async (req, res) => {
  try {
    const userId = req.user.id;
    const { approvalId } = req.params;

    // Verify approval belongs to this agency
    const approval = await prisma.clientAdApproval.findFirst({
      where: {
        id: approvalId,
        ad: {
          clientAccount: {
            agencyUserId: userId
          }
        },
        status: 'pending'
      }
    });

    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        message: 'This approval is not found or cannot be cancelled'
      });
    }

    // Update to cancelled
    const updated = await prisma.clientAdApproval.update({
      where: { id: approvalId },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      approval: updated,
      message: 'Approval request cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling approval:', error);
    res.status(500).json({
      error: 'Failed to cancel approval',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/approvals/stats/summary
 * Get approval statistics for the agency
 */
router.get('/approvals/stats/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const [pending, approved, changesRequested, rejected] = await Promise.all([
      prisma.clientAdApproval.count({
        where: {
          ad: { clientAccount: { agencyUserId: userId } },
          status: 'pending'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          ad: { clientAccount: { agencyUserId: userId } },
          status: 'approved'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          ad: { clientAccount: { agencyUserId: userId } },
          status: 'changes_requested'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          ad: { clientAccount: { agencyUserId: userId } },
          status: 'rejected'
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        pending,
        approved,
        changesRequested,
        rejected,
        total: pending + approved + changesRequested + rejected
      }
    });

  } catch (error) {
    console.error('❌ Error fetching approval stats:', error);
    res.status(500).json({
      error: 'Failed to fetch approval statistics',
      message: error.message
    });
  }
});

export default router;
