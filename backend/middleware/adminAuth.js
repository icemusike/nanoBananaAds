import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

// Middleware to verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Admin authentication required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Admin token is invalid or expired'
      });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        settings: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User does not exist'
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

    // Attach admin user info to request
    req.adminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.settings?.role || 'admin',
      isActive: true
    };

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Middleware to check for specific admin roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Admin authentication required'
      });
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];

    if (!rolesArray.includes(req.adminUser.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${rolesArray.join(', ')}`
      });
    }

    next();
  };
};

// Log admin activity (simplified - stores in console for now)
const logAdminActivity = async (adminUserId, action, targetType, targetId, details, req) => {
  try {
    console.log('📝 Admin Activity:', {
      adminUserId,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    console.error('Failed to log admin activity:', error);
    // Don't throw - logging failure shouldn't break the request
  }
};

export {
  verifyAdminToken,
  requireRole,
  logAdminActivity,
  JWT_SECRET
};
