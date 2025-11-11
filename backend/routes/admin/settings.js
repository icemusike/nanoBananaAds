import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';
import { getAdminApiKeys, setSystemSetting, getSystemSetting } from '../../utils/systemSettings.js';

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

    // Get admin API keys from database
    const adminKeys = await getAdminApiKeys();

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
        apiKeys: {
          geminiApiKey: adminKeys.geminiApiKey || '',
          openaiApiKey: adminKeys.openaiApiKey || ''
        },
        features: {
          geminiEnabled: !!adminKeys.geminiApiKey,
          openaiEnabled: !!adminKeys.openaiApiKey,
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

// Update a setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    console.log(`🔧 Admin updating setting: ${key}`);

    // Validate the key
    const allowedKeys = ['gemini_api_key', 'openai_api_key'];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        error: 'Invalid setting key',
        message: `Key must be one of: ${allowedKeys.join(', ')}`
      });
    }

    // Save API keys to database for persistence across deployments
    if (key === 'gemini_api_key') {
      await setSystemSetting('admin_gemini_api_key', value, 'api_keys');
      console.log('✅ Gemini API key saved to database');
    } else if (key === 'openai_api_key') {
      await setSystemSetting('admin_openai_api_key', value, 'api_keys');
      console.log('✅ OpenAI API key saved to database');
    }

    res.json({
      success: true,
      message: `Setting ${key} saved successfully to database`,
      note: 'API key is now persistent across Railway deployments'
    });
  } catch (error) {
    console.error('❌ Update setting error:', error);
    res.status(500).json({
      error: 'Failed to update setting',
      message: error.message
    });
  }
});

// Test Gemini API key
router.post('/test/gemini', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        message: 'Please provide a Gemini API key to test'
      });
    }

    console.log('🧪 Testing Gemini API key...');

    // Import gemini service
    const geminiService = (await import('../../services/gemini.js')).default;

    // Test with a simple prompt
    const testPrompt = "A simple test image of a yellow banana on white background";

    const result = await geminiService.generateImage(testPrompt, {
      apiKey: apiKey
    });

    if (result && result.imageData) {
      console.log('✅ Gemini API key test successful');
      res.json({
        success: true,
        message: 'Gemini API key is valid and working',
        details: 'Successfully generated a test image'
      });
    } else {
      throw new Error('No image data returned');
    }
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    res.status(400).json({
      success: false,
      error: 'Gemini API key test failed',
      message: error.message || 'Invalid or expired API key'
    });
  }
});

// Test OpenAI API key
router.post('/test/openai', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        message: 'Please provide an OpenAI API key to test'
      });
    }

    console.log('🧪 Testing OpenAI API key...');

    // Import openai service
    const openaiService = (await import('../../services/openai.js')).default;

    // Test with a simple copy generation
    const result = await openaiService.generateAdCopy({
      description: 'Test product',
      targetAudience: 'Test audience',
      industry: 'Technology',
      visualDescription: 'A test image',
      tone: 'professional',
      apiKey: apiKey
    });

    if (result && result.success) {
      console.log('✅ OpenAI API key test successful');
      res.json({
        success: true,
        message: 'OpenAI API key is valid and working',
        details: 'Successfully generated test ad copy'
      });
    } else {
      throw new Error('No response from OpenAI');
    }
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    res.status(400).json({
      success: false,
      error: 'OpenAI API key test failed',
      message: error.message || 'Invalid or expired API key'
    });
  }
});

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
