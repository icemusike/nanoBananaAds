import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * Middleware to check if user has agency license
 */
async function checkAgencyLicense(req, res, next) {
  try {
    const userId = req.userId;

    const hasAgencyLicense = await prisma.license.findFirst({
      where: {
        userId,
        productId: 'agency_license',
        status: 'active'
      }
    });

    if (!hasAgencyLicense) {
      return res.status(403).json({
        success: false,
        error: 'Agency license required. Please upgrade to access this feature.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking agency license:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify agency license'
    });
  }
}

/**
 * GET /api/agency/clients
 * Get all clients for the agency
 */
router.get('/clients', checkAgencyLicense, async (req, res) => {
  try {
    const { status, search } = req.query;
    const agencyUserId = req.userId;

    const where = {
      agencyUserId
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { clientEmail: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientCompany: { contains: search, mode: 'insensitive' } }
      ];
    }

    const clients = await prisma.agencyClient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        clientEmail: true,
        clientName: true,
        clientCompany: true,
        status: true,
        creditsAllocated: true,
        creditsUsed: true,
        lastLoginAt: true,
        stats: true,
        notes: true
      }
    });

    res.json({
      success: true,
      clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

/**
 * GET /api/agency/clients/:id
 * Get a specific client by ID
 */
router.get('/clients/:id', checkAgencyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const agencyUserId = req.userId;

    const client = await prisma.agencyClient.findFirst({
      where: {
        id,
        agencyUserId
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client'
    });
  }
});

/**
 * POST /api/agency/clients
 * Create a new client
 */
router.post('/clients', checkAgencyLicense, async (req, res) => {
  try {
    const agencyUserId = req.userId;
    const { clientEmail, clientName, clientCompany, creditsAllocated } = req.body;

    // Validation
    if (!clientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Client email is required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Check if client with this email already exists for this agency
    const existingClient = await prisma.agencyClient.findFirst({
      where: {
        agencyUserId,
        clientEmail
      }
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'A client with this email already exists'
      });
    }

    // Generate access token for client portal
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Create client
    const client = await prisma.agencyClient.create({
      data: {
        agencyUserId,
        clientEmail,
        clientName,
        clientCompany,
        creditsAllocated,
        accessToken,
        stats: {
          projects: 0,
          ads: 0,
          prompts: 0
        }
      }
    });

    // TODO: Send invitation email to client with portal access link

    res.json({
      success: true,
      client,
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create client'
    });
  }
});

/**
 * PUT /api/agency/clients/:id
 * Update a client
 */
router.put('/clients/:id', checkAgencyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const agencyUserId = req.userId;
    const { clientName, clientCompany, status, creditsAllocated, notes } = req.body;

    // Verify client belongs to this agency
    const existingClient = await prisma.agencyClient.findFirst({
      where: {
        id,
        agencyUserId
      }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Update client
    const client = await prisma.agencyClient.update({
      where: { id },
      data: {
        clientName,
        clientCompany,
        status,
        creditsAllocated,
        notes
      }
    });

    res.json({
      success: true,
      client,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
});

/**
 * DELETE /api/agency/clients/:id
 * Delete a client
 */
router.delete('/clients/:id', checkAgencyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const agencyUserId = req.userId;

    // Verify client belongs to this agency
    const existingClient = await prisma.agencyClient.findFirst({
      where: {
        id,
        agencyUserId
      }
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Delete client
    await prisma.agencyClient.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client'
    });
  }
});

/**
 * GET /api/agency/settings
 * Get agency settings
 */
router.get('/settings', checkAgencyLicense, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });

    const agencySettings = user?.settings?.agency || {};

    res.json({
      success: true,
      settings: agencySettings
    });
  } catch (error) {
    console.error('Error fetching agency settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agency settings'
    });
  }
});

/**
 * PUT /api/agency/settings
 * Update agency settings
 */
router.put('/settings', checkAgencyLicense, async (req, res) => {
  try {
    const userId = req.userId;
    const agencySettings = req.body;

    // Get current settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true }
    });

    const currentSettings = user?.settings || {};

    // Update agency settings
    const updatedSettings = {
      ...currentSettings,
      agency: agencySettings
    };

    await prisma.user.update({
      where: { id: userId },
      data: { settings: updatedSettings }
    });

    res.json({
      success: true,
      settings: agencySettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating agency settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agency settings'
    });
  }
});

export default router;
