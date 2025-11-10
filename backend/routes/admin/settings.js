import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication
router.use(verifyAdminToken);

// Get all settings
router.get('/', async (req, res) => {
  try {
    // Test database connection and get stats
    let databaseStatus = 'connected';
    let totalUsers = 0;
    let totalLicenses = 0;
    let totalAds = 0;
    let totalPrompts = 0;
    let totalAngles = 0;
    let totalBrands = 0;

    try {
      // Test database connection with a simple query
      await prisma.$queryRaw`SELECT 1`;

      // Get database statistics
      totalUsers = await prisma.user.count().catch(() => 0);
      totalLicenses = await prisma.license.count().catch(() => 0);
      totalPrompts = await prisma.prompt.count().catch(() => 0);
      totalAngles = await prisma.angle.count().catch(() => 0);
      totalBrands = await prisma.brand.count().catch(() => 0);

      // Get total ads generated
      const adsAgg = await prisma.user.aggregate({
        _sum: { adsGenerated: true }
      }).catch(() => ({ _sum: { adsGenerated: 0 } }));
      totalAds = adsAgg._sum.adsGenerated || 0;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      databaseStatus = 'disconnected';
    }

    // Return system settings with real database data
    res.json({
      success: true,
      settings: {
        system: {
          nodeVersion: process.version,
          environment: 'production', // Force production
          uptime: Math.round(process.uptime()),
          uptimeFormatted: formatUptime(process.uptime())
        },
        database: {
          status: databaseStatus,
          type: 'PostgreSQL (Prisma Accelerate)',
          connected: databaseStatus === 'connected',
          statistics: {
            totalUsers,
            totalLicenses,
            totalAds,
            totalPrompts,
            totalAngles,
            totalBrands
          }
        },
        features: {
          geminiEnabled: !!process.env.GEMINI_API_KEY,
          openaiEnabled: !!process.env.OPENAI_API_KEY,
          jvzooEnabled: !!process.env.JVZOO_SECRET_KEY
        }
      }
    });
  } catch (error) {
    console.error('❌ Settings error:', error);
    res.status(500).json({
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '< 1m';
}

// Get system info
router.get('/system/info', async (req, res) => {
  try {
    const os = await import('os');

    // Get database statistics
    let databaseStatus = 'connected';
    let databaseSize = 'N/A';
    let totalUsers = 0;
    let totalLicenses = 0;
    let totalAds = 0;
    let totalPrompts = 0;
    let totalAngles = 0;
    let totalBrands = 0;

    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;

      // Get database statistics
      totalUsers = await prisma.user.count().catch(() => 0);
      totalLicenses = await prisma.license.count().catch(() => 0);
      totalPrompts = await prisma.prompt.count().catch(() => 0);
      totalAngles = await prisma.angle.count().catch(() => 0);
      totalBrands = await prisma.brand.count().catch(() => 0);

      // Get total ads generated
      const adsAgg = await prisma.user.aggregate({
        _sum: { adsGenerated: true }
      }).catch(() => ({ _sum: { adsGenerated: 0 } }));
      totalAds = adsAgg._sum.adsGenerated || 0;

      databaseStatus = 'Connected';
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      databaseStatus = 'Disconnected';
    }

    // Get memory info
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.default.totalmem();
    const freeMemory = os.default.freemem();
    const usedMemory = totalMemory - freeMemory;

    res.json({
      success: true,
      systemInfo: {
        database: {
          status: databaseStatus,
          type: 'PostgreSQL (Prisma Accelerate)',
          size: databaseSize,
          records: {
            users: totalUsers,
            ads: totalAds,
            licenses: totalLicenses,
            prompts: totalPrompts,
            angles: totalAngles,
            brands: totalBrands
          }
        },
        server: {
          platform: process.platform,
          nodeVersion: process.version,
          arch: process.arch,
          cpus: os.default.cpus().length,
          uptime: Math.round(process.uptime()),
          memory: {
            total: totalMemory,
            used: usedMemory,
            free: freeMemory,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed
          }
        },
        environment: {
          nodeEnv: 'production' // Force production
        }
      }
    });
  } catch (error) {
    console.error('❌ System info error:', error);
    res.status(500).json({
      error: 'Failed to fetch system info',
      message: error.message
    });
  }
});

export default router;
