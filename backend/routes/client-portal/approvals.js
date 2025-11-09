import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateClient } from '../../middleware/clientAuth.js';

const router = express.Router();

// Apply client authentication to all routes
router.use(authenticateClient);

/**
 * GET /api/client-portal/approvals
 * Get all approval requests for this client
 */
router.get('/approvals', async (req, res) => {
  try {
    const clientId = req.client.id;
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      clientAccountId: clientId
    };

    if (status) {
      where.status = status;
    }

    // Get approvals with full ad data
    const [approvals, total] = await Promise.all([
      prisma.clientAdApproval.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          ad: true // Include full ad data including image
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
 * GET /api/client-portal/approvals/:approvalId
 * Get a single approval with full details
 */
router.get('/approvals/:approvalId', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { approvalId } = req.params;

    const approval = await prisma.clientAdApproval.findFirst({
      where: {
        id: approvalId,
        clientAccountId: clientId
      },
      include: {
        ad: true
      }
    });

    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        message: 'This approval request does not exist'
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
 * POST /api/client-portal/approvals/:approvalId/approve
 * Approve an ad
 */
router.post('/approvals/:approvalId/approve', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { approvalId } = req.params;
    const { comments } = req.body;

    // Get the approval
    const approval = await prisma.clientAdApproval.findFirst({
      where: {
        id: approvalId,
        clientAccountId: clientId
      },
      include: {
        ad: {
          select: {
            id: true,
            headline: true
          }
        }
      }
    });

    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        message: 'This approval request does not exist'
      });
    }

    // Check if already processed
    if (approval.status !== 'pending') {
      return res.status(400).json({
        error: 'Already processed',
        message: `This ad has already been ${approval.status}`
      });
    }

    // Update approval to approved
    const updated = await prisma.clientAdApproval.update({
      where: { id: approvalId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.client.name || req.client.email,
        feedback: comments || null,
        updatedAt: new Date()
      },
      include: {
        ad: true
      }
    });

    // TODO: Send email notification to agency

    res.json({
      success: true,
      approval: updated,
      message: 'Ad approved successfully'
    });

  } catch (error) {
    console.error('❌ Error approving ad:', error);
    res.status(500).json({
      error: 'Failed to approve ad',
      message: error.message
    });
  }
});

/**
 * POST /api/client-portal/approvals/:approvalId/request-changes
 * Request changes to an ad
 */
router.post('/approvals/:approvalId/request-changes', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { approvalId } = req.params;
    const { feedback, requestedChanges } = req.body;

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({
        error: 'Feedback required',
        message: 'Please provide feedback about what changes are needed'
      });
    }

    // Get the approval
    const approval = await prisma.clientAdApproval.findFirst({
      where: {
        id: approvalId,
        clientAccountId: clientId
      },
      include: {
        ad: {
          select: {
            id: true,
            headline: true
          }
        }
      }
    });

    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        message: 'This approval request does not exist'
      });
    }

    // Check if already processed
    if (approval.status !== 'pending') {
      return res.status(400).json({
        error: 'Already processed',
        message: `This ad has already been ${approval.status}`
      });
    }

    // Update approval with changes requested
    const updated = await prisma.clientAdApproval.update({
      where: { id: approvalId },
      data: {
        status: 'changes_requested',
        feedback: feedback.trim(),
        requestedChanges: requestedChanges || null,
        updatedAt: new Date()
      },
      include: {
        ad: true
      }
    });

    // TODO: Send email notification to agency with feedback

    res.json({
      success: true,
      approval: updated,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error requesting changes:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
});

/**
 * POST /api/client-portal/approvals/:approvalId/reject
 * Reject an ad
 */
router.post('/approvals/:approvalId/reject', async (req, res) => {
  try {
    const clientId = req.client.id;
    const { approvalId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        error: 'Reason required',
        message: 'Please provide a reason for rejecting this ad'
      });
    }

    // Get the approval
    const approval = await prisma.clientAdApproval.findFirst({
      where: {
        id: approvalId,
        clientAccountId: clientId
      },
      include: {
        ad: {
          select: {
            id: true,
            headline: true
          }
        }
      }
    });

    if (!approval) {
      return res.status(404).json({
        error: 'Approval not found',
        message: 'This approval request does not exist'
      });
    }

    // Check if already processed
    if (approval.status !== 'pending') {
      return res.status(400).json({
        error: 'Already processed',
        message: `This ad has already been ${approval.status}`
      });
    }

    // Update approval to rejected
    const updated = await prisma.clientAdApproval.update({
      where: { id: approvalId },
      data: {
        status: 'rejected',
        feedback: reason.trim(),
        updatedAt: new Date()
      },
      include: {
        ad: true
      }
    });

    // TODO: Send email notification to agency

    res.json({
      success: true,
      approval: updated,
      message: 'Ad rejected successfully'
    });

  } catch (error) {
    console.error('❌ Error rejecting ad:', error);
    res.status(500).json({
      error: 'Failed to reject ad',
      message: error.message
    });
  }
});

/**
 * GET /api/client-portal/approvals/stats/summary
 * Get approval statistics for the client
 */
router.get('/approvals/stats/summary', async (req, res) => {
  try {
    const clientId = req.client.id;

    const [pending, approved, changesRequested, rejected, total] = await Promise.all([
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'pending'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'approved'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'changes_requested'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId,
          status: 'rejected'
        }
      }),
      prisma.clientAdApproval.count({
        where: {
          clientAccountId: clientId
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
        total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching approval stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

export default router;
