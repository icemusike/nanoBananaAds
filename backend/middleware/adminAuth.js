import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

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

    // Check if admin user exists and is active
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: decoded.adminUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!adminUser) {
      return res.status(401).json({
        error: 'Admin user not found',
        message: 'Admin user does not exist'
      });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({
        error: 'Account inactive',
        message: 'This admin account has been deactivated'
      });
    }

    // Attach admin user to request
    req.adminUser = adminUser;
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

// Log admin activity
const logAdminActivity = async (adminUserId, action, targetType, targetId, details, req) => {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminUserId,
        action,
        targetType,
        targetId,
        details,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
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
