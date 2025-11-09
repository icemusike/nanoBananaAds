import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../utils/prisma.js';
import { verifyAdminToken, logAdminActivity } from '../../middleware/adminAuth.js';
import { createLicense, addLicenseAddon } from '../../services/licenseService.js';
import { getProductConfig, isEliteBundle } from '../../config/productMapping.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Create new user (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long'
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
        // Set default preferences
        preferredImageModel: 'gemini',
        imageQuality: 'standard',
        defaultTone: 'professional yet approachable',
        defaultAspectRatio: 'square',
        defaultModel: 'gpt-4o-2024-08-06',
        theme: 'clean-slate',
        themeMode: 'light'
      }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'user_created',
      'User',
      user.id,
      { name, email, company },
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

// Get all users with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      createdVia = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (createdVia) {
      where.createdVia = createdVia;
    }

    // Get users with related data
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          licenses: {
            select: {
              id: true,
              status: true,
              productId: true,
              purchaseDate: true
            }
          },
          _count: {
            select: {
              brands: true,
              apiUsageLogs: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Calculate credits and enrich user data
    const enrichedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      createdVia: user.createdVia,
      adsGenerated: user.adsGenerated,
      promptsGenerated: user.promptsGenerated,
      anglesGenerated: user.anglesGenerated,
      brandsCount: user._count.brands,
      apiCallsCount: user._count.apiUsageLogs,
      licenses: user.licenses,
      activeLicensesCount: user.licenses.filter(l => l.status === 'active').length,
      totalLicensesCount: user.licenses.length
    }));

    res.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
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

// Get single user details
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        licenses: {
          orderBy: { createdAt: 'desc' }
        },
        brands: {
          select: {
            id: true,
            name: true,
            industry: true,
            usageCount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        jvzooTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        apiUsageLogs: {
          select: {
            id: true,
            createdAt: true,
            provider: true,
            model: true,
            feature: true,
            estimatedCost: true,
            success: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this ID'
      });
    }

    // Calculate API costs
    const apiCostStats = await prisma.apiUsageLog.aggregate({
      where: { userId },
      _sum: {
        estimatedCost: true,
        totalTokens: true
      },
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      user: {
        ...user,
        // Don't send password hash
        password: undefined,
        // API stats
        apiStats: {
          totalCost: apiCostStats._sum.estimatedCost || 0,
          totalTokens: apiCostStats._sum.totalTokens || 0,
          totalCalls: apiCostStats._count.id || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// Update user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.password; // Use separate endpoint for password
    delete updateData.licenses;
    delete updateData.brands;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'user_updated',
      'User',
      userId,
      { updatedFields: Object.keys(updateData) },
      req
    );

    res.json({
      success: true,
      user: {
        ...updatedUser,
        password: undefined
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Grant license to user
router.post('/:userId/licenses', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      productId,
      jvzooProductId,
      purchaseAmount
    } = req.body;

    // Get product configuration
    const productConfig = getProductConfig(jvzooProductId || productId);

    if (!productConfig) {
      return res.status(400).json({
        error: 'Invalid product',
        message: 'Unknown product ID'
      });
    }

    console.log(`Admin granting ${productConfig.name} to user ${userId}`);

    let license = null;
    let addon = null;

    // Handle different product types
    if (productConfig.type === 'license' || productConfig.type === 'upgrade') {
      // Check if user already has a license
      const existingLicense = await prisma.license.findFirst({
        where: {
          userId,
          status: 'active'
        }
      });

      if (existingLicense && productConfig.type === 'upgrade') {
        // Upgrade existing license
        const { upgradeLicense } = await import('../../services/licenseService.js');
        license = await upgradeLicense(userId, productConfig.tier);
      } else {
        // Create new license
        license = await createLicense({
          userId,
          licenseTier: productConfig.tier,
          jvzooTransactionId: `MANUAL-ADMIN-${Date.now()}`,
          jvzooReceiptId: `ADMIN-RECEIPT-${Date.now()}`,
          jvzooProductId: jvzooProductId || productId,
          transactionType: 'SALE',
          purchaseAmount: purchaseAmount || productConfig.price || 0,
          productId: jvzooProductId || productId,
          isRecurring: false
        });

        // If Elite Bundle, auto-add all addons
        if (isEliteBundle(jvzooProductId || productId) && productConfig.includes_addons) {
          for (const addonType of productConfig.includes_addons) {
            await addLicenseAddon({
              licenseId: license.id,
              addonType,
              jvzooProductId: jvzooProductId || productId,
              jvzooTransactionId: `MANUAL-ADMIN-${Date.now()}-${addonType}`,
              jvzooReceiptId: `ADMIN-RECEIPT-${Date.now()}`,
              purchaseAmount: 0 // Included in bundle
            });
          }
        }
      }
    } else if (productConfig.type === 'addon') {
      // Add addon to existing license
      const userLicense = await prisma.license.findFirst({
        where: {
          userId,
          status: 'active'
        }
      });

      if (!userLicense) {
        return res.status(400).json({
          error: 'No active license found',
          message: 'User must have an active license before adding addons'
        });
      }

      addon = await addLicenseAddon({
        licenseId: userLicense.id,
        addonType: productConfig.addon_type,
        jvzooProductId: jvzooProductId || productId,
        jvzooTransactionId: `MANUAL-ADMIN-${Date.now()}`,
        jvzooReceiptId: `ADMIN-RECEIPT-${Date.now()}`,
        purchaseAmount: purchaseAmount || productConfig.price || 0
      });
    }

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'license_granted',
      'License',
      license?.id || addon?.id,
      { userId, productId: jvzooProductId || productId, productName: productConfig.name },
      req
    );

    res.json({
      success: true,
      license,
      addon,
      message: `${productConfig.name} granted successfully`
    });
  } catch (error) {
    console.error('Grant license error:', error);
    res.status(500).json({
      error: 'Failed to grant license',
      message: error.message
    });
  }
});

// Update license
router.put('/:userId/licenses/:licenseId', async (req, res) => {
  try {
    const { userId, licenseId } = req.params;
    const { status, expiryDate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);

    // Add status change timestamps
    if (status === 'refunded' && !updateData.refundedAt) {
      updateData.refundedAt = new Date();
    } else if (status === 'chargeback' && !updateData.chargebackAt) {
      updateData.chargebackAt = new Date();
    } else if (status === 'cancelled' && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const license = await prisma.license.update({
      where: {
        id: licenseId,
        userId // Ensure license belongs to this user
      },
      data: updateData
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'license_updated',
      'License',
      licenseId,
      { userId, updates: updateData },
      req
    );

    res.json({
      success: true,
      license
    });
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({
      error: 'Failed to update license',
      message: error.message
    });
  }
});

// Reset user password (admin action)
router.post('/:userId/reset-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'password_reset',
      'User',
      userId,
      { note: 'Password reset by admin' },
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

// Send credentials email to user
router.post('/:userId/send-credentials', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this ID'
      });
    }

    // TODO: Implement actual email sending
    // For now, we'll just log and return success
    console.log('Send credentials email to:', user.email);
    console.log('User info:', { name: user.name, email: user.email });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'credentials_email_sent',
      'User',
      userId,
      { email: user.email },
      req
    );

    res.json({
      success: true,
      message: `Credentials email sent to ${user.email}`,
      note: 'Email service not yet configured. In production, this would send an email with login credentials and license information.'
    });
  } catch (error) {
    console.error('Send credentials error:', error);
    res.status(500).json({
      error: 'Failed to send credentials',
      message: error.message
    });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user email before deletion for logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this ID'
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'user_deleted',
      'User',
      userId,
      { email: user.email, name: user.name },
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

// Helper function to generate license key
function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;

  const key = [];
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key.push(segment);
  }

  return key.join('-');
}

export default router;
