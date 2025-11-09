import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma.js';
import { verifyAdminToken, JWT_SECRET } from '../../middleware/adminAuth.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!adminUser) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!adminUser.isActive) {
      return res.status(403).json({
        error: 'Account inactive',
        message: 'This admin account has been deactivated'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, adminUser.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        adminUserId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '8h' } // 8 hour session
    );

    res.json({
      success: true,
      token,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Get current admin user
router.get('/me', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      adminUser: req.adminUser
    });
  } catch (error) {
    console.error('Get admin user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user data'
    });
  }
});

// Admin logout (client-side will remove token)
router.post('/logout', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
});

// Refresh token
router.post('/refresh', verifyAdminToken, async (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      {
        adminUserId: req.adminUser.id,
        email: req.adminUser.email,
        role: req.adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Refresh failed',
      message: 'An error occurred while refreshing token'
    });
  }
});

export default router;
