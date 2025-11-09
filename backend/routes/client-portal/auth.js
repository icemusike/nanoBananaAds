import express from 'express';
import prisma from '../../utils/prisma.js';

const router = express.Router();

/**
 * POST /api/client-portal/auth/login
 * Client portal login using access token
 */
router.post('/login', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken || accessToken.trim().length === 0) {
      return res.status(400).json({
        error: 'Access token required',
        message: 'Please provide your access token'
      });
    }

    // Find client account by access token
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { accessToken: accessToken.trim() },
      include: {
        agencyUser: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        _count: {
          select: {
            ads: true,
            approvals: true,
            projects: true
          }
        }
      }
    });

    if (!clientAccount) {
      return res.status(401).json({
        error: 'Invalid access token',
        message: 'The access token you provided is not valid. Please check with your agency.'
      });
    }

    // Check if account is active
    if (clientAccount.status !== 'active') {
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact your agency for assistance.'
      });
    }

    // Update last access time
    await prisma.clientAccount.update({
      where: { id: clientAccount.id },
      data: { lastAccess: new Date() }
    });

    // Return client info and token
    res.json({
      success: true,
      message: 'Login successful',
      client: {
        id: clientAccount.id,
        email: clientAccount.clientEmail,
        name: clientAccount.clientName,
        company: clientAccount.clientCompany,
        accessToken: clientAccount.accessToken,
        status: clientAccount.status,
        creditsAllocated: clientAccount.creditsAllocated,
        creditsUsed: clientAccount.creditsUsed,
        createdAt: clientAccount.createdAt,
        lastAccess: clientAccount.lastAccess,
        agency: {
          name: clientAccount.agencyUser.name,
          email: clientAccount.agencyUser.email,
          company: clientAccount.agencyUser.company
        },
        stats: {
          totalAds: clientAccount._count.ads,
          totalApprovals: clientAccount._count.approvals,
          totalProjects: clientAccount._count.projects
        }
      }
    });

  } catch (error) {
    console.error('❌ Client login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to log in. Please try again or contact your agency.'
    });
  }
});

/**
 * POST /api/client-portal/auth/logout
 * Client portal logout (optional - mainly for clearing client-side state)
 */
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Client logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to log out. Please try again.'
    });
  }
});

/**
 * GET /api/client-portal/auth/verify
 * Verify if the current access token is still valid
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: 'No access token provided'
      });
    }

    const clientAccount = await prisma.clientAccount.findUnique({
      where: { accessToken: token },
      select: {
        id: true,
        status: true,
        clientEmail: true,
        clientName: true
      }
    });

    if (!clientAccount || clientAccount.status !== 'active') {
      return res.status(401).json({
        valid: false,
        message: 'Invalid or inactive access token'
      });
    }

    res.json({
      valid: true,
      client: {
        id: clientAccount.id,
        email: clientAccount.clientEmail,
        name: clientAccount.clientName
      }
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      valid: false,
      message: 'Unable to verify token'
    });
  }
});

export default router;
