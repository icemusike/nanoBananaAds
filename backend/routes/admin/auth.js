import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken, JWT_SECRET } from '../../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt for:', email);

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', user.email);
    console.log('   Has password:', user.password ? 'Yes' : 'No');
    console.log('   Settings:', user.settings);

    // Check if user is admin
    const isAdmin = user.settings?.isAdmin === true;
    if (!isAdmin) {
      console.log('❌ User is not admin. Settings:', user.settings);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    console.log('✅ User is admin');

    // Check if password exists
    if (!user.password) {
      console.log('❌ User has no password set');
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Password not set for this account'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('   Password valid:', validPassword);

    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.settings?.role || 'admin'
      },
      JWT_SECRET,
      { expiresIn: '8h' } // 8 hour session
    );

    res.json({
      success: true,
      token,
      adminUser: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.settings?.role || 'admin'
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

export default router;
