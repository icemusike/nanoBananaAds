import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken, logAdminActivity } from '../../middleware/adminAuth.js';
import { sendWelcomeEmail } from '../../services/emailService.js';

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
              licenseKey: true,
              productId: true,
              status: true,
              purchaseDate: true,
              expiryDate: true
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
    console.error('❌ Get users error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
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

    // Send welcome email with login credentials
    try {
      await sendWelcomeEmail({
        to: email,
        name: name,
        email: email,
        password: password, // Send the plain password before hashing
        productName: 'AdGenius AI Account',
        licenseKey: null // No license key for admin-created accounts
      });
      console.log('✅ Welcome email sent to:', email);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    res.status(201).json({
      success: true,
      user: {
        ...user,
        password: undefined // Don't send password hash
      },
      message: 'User created successfully and welcome email sent',
      emailSent: true
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

// Get user's licenses
router.get('/:userId/licenses', async (req, res) => {
  try {
    const { userId } = req.params;

    const licenses = await prisma.license.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      licenses
    });
  } catch (error) {
    console.error('Get user licenses error:', error);
    res.status(500).json({
      error: 'Failed to fetch licenses',
      message: error.message
    });
  }
});

// Grant a license to a user (Admin manual grant)
router.post('/:userId/licenses', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      productId,
      expiryDate,
      isRecurring = false,
      purchaseAmount = 0
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required',
        message: 'Please specify which product license to grant'
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Generate a unique license key
    const licenseKey = generateLicenseKey();

    // Create manual transaction ID for admin-granted licenses
    const manualTransactionId = `ADMIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the license
    const license = await prisma.license.create({
      data: {
        userId,
        licenseKey,
        productId,
        status: 'active',
        jvzooTransactionId: manualTransactionId,
        jvzooReceiptId: `ADMIN-${Date.now()}`,
        jvzooProductId: productId,
        transactionType: 'ADMIN_GRANT',
        purchaseDate: new Date(),
        purchaseAmount: purchaseAmount || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isRecurring: isRecurring || false
      }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'license_granted',
      'License',
      license.id,
      { userId, productId, licenseKey },
      req
    );

    res.json({
      success: true,
      license,
      message: 'License granted successfully'
    });
  } catch (error) {
    console.error('Grant license error:', error);
    res.status(500).json({
      error: 'Failed to grant license',
      message: error.message
    });
  }
});

// Revoke a user's license
router.delete('/:userId/licenses/:licenseId', async (req, res) => {
  try {
    const { userId, licenseId } = req.params;

    // Verify license belongs to user
    const license = await prisma.license.findFirst({
      where: {
        id: licenseId,
        userId
      }
    });

    if (!license) {
      return res.status(404).json({
        error: 'License not found',
        message: 'License does not exist or does not belong to this user'
      });
    }

    // Update license status instead of deleting (for audit trail)
    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'license_revoked',
      'License',
      licenseId,
      { userId, licenseKey: license.licenseKey },
      req
    );

    res.json({
      success: true,
      message: 'License revoked successfully',
      license: updatedLicense
    });
  } catch (error) {
    console.error('Revoke license error:', error);
    res.status(500).json({
      error: 'Failed to revoke license',
      message: error.message
    });
  }
});

// Send credentials email to user
router.post('/:userId/send-credentials', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Send welcome email with new credentials
    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name,
        email: user.email,
        password: tempPassword,
        productName: 'AdGenius AI Account',
        licenseKey: null
      });

      // Log admin activity
      await logAdminActivity(
        req.adminUser.id,
        'credentials_sent',
        'User',
        userId,
        { email: user.email },
        req
      );

      res.json({
        success: true,
        message: 'Credentials email sent successfully'
      });
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      res.status(500).json({
        error: 'Email sending failed',
        message: emailError.message
      });
    }
  } catch (error) {
    console.error('Send credentials error:', error);
    res.status(500).json({
      error: 'Failed to send credentials',
      message: error.message
    });
  }
});

// Helper function to generate temporary password
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to generate license key
function generateLicenseKey() {
  const segments = 4;
  const segmentLength = 4;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars

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
