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

    if (!email || !password) {
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
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check if user is admin
    const isAdmin = user.settings?.isAdmin === true;
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
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
