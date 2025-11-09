import express from 'express';
import prisma from '../../utils/prisma.js';
import { verifyAdminToken, logAdminActivity } from '../../middleware/adminAuth.js';
import crypto from 'crypto';

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Encryption helpers
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Get all settings (grouped by category)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.platformSettings.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Group by category and decrypt sensitive values
    const grouped = {};
    settings.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }

      let value = setting.value;
      // Decrypt if needed, but mask API keys for display
      if (setting.encrypted && setting.category === 'api_keys') {
        try {
          const decrypted = decrypt(value);
          // Mask the key - show only last 4 characters
          value = '***' + decrypted.slice(-4);
        } catch (err) {
          console.error('Decryption error:', err);
          value = '***ENCRYPTED***';
        }
      }

      grouped[setting.category][setting.key] = {
        value,
        encrypted: setting.encrypted,
        description: setting.description,
        lastModifiedBy: setting.lastModifiedBy,
        updatedAt: setting.updatedAt
      };
    });

    res.json({
      success: true,
      settings: grouped
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

// Get settings for specific category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const settings = await prisma.platformSettings.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    });

    const data = {};
    settings.forEach(setting => {
      let value = setting.value;

      // Decrypt if needed, but mask API keys
      if (setting.encrypted && category === 'api_keys') {
        try {
          const decrypted = decrypt(value);
          value = '***' + decrypted.slice(-4);
        } catch (err) {
          console.error('Decryption error:', err);
          value = '***ENCRYPTED***';
        }
      }

      data[setting.key] = {
        value,
        encrypted: setting.encrypted,
        description: setting.description,
        lastModifiedBy: setting.lastModifiedBy,
        updatedAt: setting.updatedAt
      };
    });

    res.json({
      success: true,
      category,
      settings: data
    });
  } catch (error) {
    console.error('Get category settings error:', error);
    res.status(500).json({
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

// Update or create specific setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, category, encrypted = false, description } = req.body;

    if (!category) {
      return res.status(400).json({
        error: 'Missing category',
        message: 'Category is required'
      });
    }

    let finalValue = value;

    // Encrypt if needed
    if (encrypted && typeof value === 'string') {
      finalValue = encrypt(value);
    }

    const setting = await prisma.platformSettings.upsert({
      where: { key },
      update: {
        value: finalValue,
        category,
        encrypted,
        description,
        lastModifiedBy: req.adminUser.email
      },
      create: {
        key,
        value: finalValue,
        category,
        encrypted,
        description,
        lastModifiedBy: req.adminUser.email
      }
    });

    // Log admin activity
    await logAdminActivity(
      req.adminUser.id,
      'setting_updated',
      'PlatformSettings',
      setting.id,
      { key, category },
      req
    );

    res.json({
      success: true,
      setting: {
        ...setting,
        value: encrypted ? '***ENCRYPTED***' : setting.value
      }
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      error: 'Failed to update setting',
      message: error.message
    });
  }
});

// Test API key connection
router.post('/test-api', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Provider and API key are required'
      });
    }

    let testResult = { success: false, message: '' };

    if (provider === 'openai') {
      // Test OpenAI API
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        });

        testResult = {
          success: true,
          message: 'OpenAI API connection successful',
          model: response.model
        };
      } catch (err) {
        testResult = {
          success: false,
          message: `OpenAI API error: ${err.message}`
        };
      }
    } else if (provider === 'gemini') {
      // Test Gemini API
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('test');
        const response = await result.response;

        testResult = {
          success: true,
          message: 'Gemini API connection successful',
          model: 'gemini-2.5-flash'
        };
      } catch (err) {
        testResult = {
          success: false,
          message: `Gemini API error: ${err.message}`
        };
      }
    } else {
      return res.status(400).json({
        error: 'Invalid provider',
        message: 'Provider must be "openai" or "gemini"'
      });
    }

    res.json({
      success: true,
      testResult
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      error: 'Failed to test API',
      message: error.message
    });
  }
});

// Get system information
router.get('/system/info', async (req, res) => {
  try {
    const os = await import('os');

    const [
      totalUsers,
      totalAds,
      totalPrompts,
      totalAngles,
      totalBrands,
      totalLicenses,
      dbSize
    ] = await Promise.all([
      prisma.user.count(),
      prisma.ad.count(),
      prisma.prompt.count(),
      prisma.angle.count(),
      prisma.brand.count(),
      prisma.license.count(),
      // Get database size (PostgreSQL specific)
      prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`
    ]);

    const systemInfo = {
      database: {
        status: 'connected',
        size: dbSize[0]?.size || 'N/A',
        records: {
          users: totalUsers,
          ads: totalAds,
          prompts: totalPrompts,
          angles: totalAngles,
          brands: totalBrands,
          licenses: totalLicenses
        }
      },
      server: {
        platform: os.platform(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        cpus: os.cpus().length
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000
      }
    };

    res.json({
      success: true,
      systemInfo
    });
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      error: 'Failed to fetch system info',
      message: error.message
    });
  }
});

export default router;
