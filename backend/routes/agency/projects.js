import express from 'express';
import prisma from '../../utils/prisma.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireAgencyLicense, verifyClientOwnership } from '../../middleware/requireAgencyLicense.js';

const router = express.Router();

// Apply authentication and agency license middleware to all routes
router.use(authenticateUser);
router.use(requireAgencyLicense);

/**
 * POST /api/agency/clients/:clientId/projects
 * Create a new project for a client
 */
router.post('/clients/:clientId/projects', verifyClientOwnership, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const {
      name,
      description,
      budget,
      currency = 'USD',
      startDate,
      endDate,
      deadline,
      metadata
    } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Project name is required'
      });
    }

    // Create project
    const project = await prisma.clientProject.create({
      data: {
        clientAccountId: clientId,
        name: name.trim(),
        description: description || null,
        budget: budget || null,
        currency,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        status: 'active',
        metadata: metadata || null
      },
      include: {
        _count: {
          select: {
            ads: true
          }
        }
      }
    });

    console.log('✅ Project created:', project.id);

    res.status(201).json({
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
        createdAt: project.createdAt,
        adsCount: project._count.ads
      },
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/clients/:clientId/projects
 * Get all projects for a client
 */
router.get('/clients/:clientId/projects', verifyClientOwnership, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { status = 'all', sort = 'createdAt', order = 'desc' } = req.query;

    // Build where clause
    const where = {
      clientAccountId: clientId
    };

    if (status !== 'all') {
      where.status = status;
    }

    // Get projects
    const projects = await prisma.clientProject.findMany({
      where,
      orderBy: {
        [sort]: order
      },
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
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        currency: project.currency,
        startDate: project.startDate,
        endDate: project.endDate,
        deadline: project.deadline,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        adsCount: project._count.ads
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/projects
 * Get all projects across all clients
 */
router.get('/projects', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'all', limit = 50 } = req.query;

    // Build where clause - projects for clients belonging to this agency
    const where = {
      clientAccount: {
        agencyUserId: userId
      }
    };

    if (status !== 'all') {
      where.status = status;
    }

    // Get projects
    const projects = await prisma.clientProject.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        clientAccount: {
          select: {
            id: true,
            clientName: true,
            clientCompany: true,
            clientEmail: true
          }
        },
        _count: {
          select: {
            ads: true
          }
        }
      }
    });

    res.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        currency: project.currency,
        startDate: project.startDate,
        endDate: project.endDate,
        deadline: project.deadline,
        createdAt: project.createdAt,
        adsCount: project._count.ads,
        client: project.clientAccount
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

/**
 * GET /api/agency/projects/:projectId
 * Get a specific project
 */
router.get('/projects/:projectId', async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    // Get project with ownership verification
    const project = await prisma.clientProject.findFirst({
      where: {
        id: projectId,
        clientAccount: {
          agencyUserId: userId
        }
      },
      include: {
        clientAccount: {
          select: {
            id: true,
            clientName: true,
            clientCompany: true,
            clientEmail: true
          }
        },
        _count: {
          select: {
            ads: true
          }
        },
        ads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            headline: true,
            createdAt: true,
            imageMimeType: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'This project does not exist or does not belong to your agency'
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
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        metadata: project.metadata,
        client: project.clientAccount,
        adsCount: project._count.ads,
        recentAds: project.ads
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

/**
 * PATCH /api/agency/projects/:projectId
 * Update a project
 */
router.patch('/projects/:projectId', async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    // Verify project belongs to agency
    const existingProject = await prisma.clientProject.findFirst({
      where: {
        id: projectId,
        clientAccount: {
          agencyUserId: userId
        }
      }
    });

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    const {
      name,
      description,
      status,
      budget,
      currency,
      startDate,
      endDate,
      deadline,
      metadata
    } = req.body;

    // Build update data
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (budget !== undefined) updateData.budget = budget;
    if (currency !== undefined) updateData.currency = currency;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Update project
    const updatedProject = await prisma.clientProject.update({
      where: { id: projectId },
      data: updateData
    });

    console.log('✅ Project updated:', projectId);

    res.json({
      success: true,
      project: updatedProject,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      error: 'Failed to update project',
      message: error.message
    });
  }
});

/**
 * DELETE /api/agency/projects/:projectId
 * Delete a project
 */
router.delete('/projects/:projectId', async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    // Verify project belongs to agency
    const existingProject = await prisma.clientProject.findFirst({
      where: {
        id: projectId,
        clientAccount: {
          agencyUserId: userId
        }
      }
    });

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Check if project has ads
    const adsCount = await prisma.ad.count({
      where: { projectId }
    });

    if (adsCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        error: 'Project has ads',
        message: `This project has ${adsCount} ads. Add ?force=true to delete anyway.`,
        adsCount
      });
    }

    // Delete project (cascade will handle ads)
    await prisma.clientProject.delete({
      where: { id: projectId }
    });

    console.log('✅ Project deleted:', projectId);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      message: error.message
    });
  }
});

export default router;
