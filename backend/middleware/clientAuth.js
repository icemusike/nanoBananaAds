import prisma from '../utils/prisma.js';

/**
 * Middleware to authenticate client portal users
 * Uses access token from ClientAccount
 */
export async function authenticateClient(req, res, next) {
  try {
    // Get access token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide your access token'
      });
    }

    // Find client account by access token
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { accessToken: token },
      include: {
        agencyUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!clientAccount) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Your access token is not valid'
      });
    }

    // Check if account is active
    if (clientAccount.status !== 'active') {
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact your agency.'
      });
    }

    // Update last access
    await prisma.clientAccount.update({
      where: { id: clientAccount.id },
      data: { lastAccess: new Date() }
    });

    // Attach client info to request
    req.client = {
      id: clientAccount.id,
      email: clientAccount.clientEmail,
      name: clientAccount.clientName,
      company: clientAccount.clientCompany,
      agencyUserId: clientAccount.agencyUserId,
      agencyUser: clientAccount.agencyUser
    };

    next();

  } catch (error) {
    console.error('❌ Client authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Unable to authenticate. Please try again.'
    });
  }
}

export default {
  authenticateClient
};
