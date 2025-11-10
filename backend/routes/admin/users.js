import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken, logAdminActivity } from '../../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Get all users with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    // Get users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          createdVia: true,
          adsGenerated: true,
          promptsGenerated: true,
          anglesGenerated: true,
          settings: true,
          licenses: {
            select: {
              id: true,
              licenseTier: true,
              status: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Get single user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        licenses: true,
        brands: true,
        jvzooTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// Create new user (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, company, isAdmin = false } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company: company || null,
        createdVia: 'admin',
        emailVerified: true, // Admin-created users are auto-verified
        settings: isAdmin ? { isAdmin: true, role: 'admin' } : null
      }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'user_created',
      'User',
      user.id,
      { name, email, company, isAdmin },
      req
    );

    res.status(201).json({
      success: true,
      user: {
        ...user,
        password: undefined // Don't send password hash
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Update user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, company, emailVerified, settings } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (settings !== undefined) updateData.settings = settings;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'user_updated',
      'User',
      userId,
      updateData,
      req
    );

    res.json({
      success: true,
      user: {
        ...user,
        password: undefined
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (userId === req.adminUser.id) {
      return res.status(400).json({
        error: 'Cannot delete yourself',
        message: 'You cannot delete your own admin account'
      });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'user_deleted',
      'User',
      userId,
      {},
      req
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// Reset user password
router.post('/:userId/reset-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'password_reset',
      'User',
      userId,
      {},
      req
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Failed to reset password',
      message: error.message
    });
  }
});

export default router;
