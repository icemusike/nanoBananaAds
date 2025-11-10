import express from 'express';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication
router.use(verifyAdminToken);

// Get all settings
router.get('/', async (req, res) => {
  try {
    // Return system settings
    res.json({
      success: true,
      settings: {
        system: {
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'production',
          uptime: process.uptime()
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

// Get system info
router.get('/system/info', async (req, res) => {
  try {
    res.json({
      success: true,
      info: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(process.uptime()) + ' seconds'
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
