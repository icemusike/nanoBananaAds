import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { verifyAdminToken } from '../../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication
router.use(verifyAdminToken);

// Get costs summary
router.get('/summary', async (req, res) => {
  try {
    // For now, return placeholder data
    // This can be enhanced later with actual cost tracking
    res.json({
      success: true,
      summary: {
        totalCosts: 0,
        geminiCosts: 0,
        openaiCosts: 0,
        period: 'last-30-days'
      }
    });
  } catch (error) {
    console.error('❌ Costs summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

// Get costs by provider
router.get('/by-provider', async (req, res) => {
  try {
    res.json({
      success: true,
      costs: []
    });
  } catch (error) {
    console.error('❌ Costs by provider error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

// Get costs by model
router.get('/by-model', async (req, res) => {
  try {
    res.json({
      success: true,
      costs: []
    });
  } catch (error) {
    console.error('❌ Costs by model error:', error);
    res.status(500).json({
      error: 'Failed to fetch costs',
      message: error.message
    });
  }
});

export default router;
