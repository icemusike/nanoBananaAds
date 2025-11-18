import express from 'express';
import geminiService from '../services/gemini.js';
import openaiService from '../services/openai.js';
import { generateGeminiPrompt, getTemplatesForCategory, TEMPLATE_CATEGORIES } from '../prompts/templates.js';
import prisma from '../utils/prisma.js';
import { authenticateUser } from '../middleware/auth.js';
import { getAdminApiKeys } from '../utils/systemSettings.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * POST /api/generate
 * Main endpoint to generate complete ad creative (image + copy)
 */
router.post('/', async (req, res) => {
  try {
    const {
      description,
      targetAudience,
      industry,
      category,
      template,
      style,
      colorPalette,
      aspectRatio,
      tone,
      copywritingStyle,
      valueProposition,
      callToAction,
      customDetails,
      imageDescription,
      moodKeywords,
      visualEmphasis,
      avoidInImage,
      customTemplateDescription,
      referenceImage, // { data: base64, mimeType: string }
      model = 'gpt-4o-2024-08-06', // NEW: Allow model selection for ad copy generation
      simpleMode = false, // NEW: Simple Mode - bypass templates
      clientAccountId // Agency feature: link ad to specific client
    } = req.body;

    // Load user settings and API keys from database
    let userSettings = null;
    let userGeminiKey = null;
    let userOpenaiKey = null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          defaultAspectRatio: true,
          defaultTone: true,
          geminiApiKey: true,
          openaiApiKey: true
        }
      });
      if (user) {
        userSettings = {
          defaultAspectRatio: user.defaultAspectRatio || 'square',
          defaultTone: user.defaultTone || 'professional yet approachable'
        };
        userGeminiKey = user.geminiApiKey;
        userOpenaiKey = user.openaiApiKey;
        console.log('✓ User settings loaded:', userSettings);
        console.log('✓ User has custom Gemini key:', !!userGeminiKey);
        console.log('✓ User has custom OpenAI key:', !!userOpenaiKey);
      }
    } catch (settingsError) {
      console.log('⚠️ Could not load user settings, using defaults:', settingsError.message);
    }

    // Get admin default API keys from database
    const adminKeys = await getAdminApiKeys();

    // API Key Priority: Headers > User DB > Admin Database > Environment Variables
    // This allows users to optionally set their own keys, otherwise use admin defaults from database
    const geminiApiKey = req.headers['x-gemini-api-key'] || userGeminiKey || adminKeys.geminiApiKey || process.env.GEMINI_API_KEY;
    const openaiApiKey = req.headers['x-openai-api-key'] || userOpenaiKey || adminKeys.openaiApiKey || process.env.OPENAI_API_KEY;

    // Use settings with fallbacks
    const finalAspectRatio = aspectRatio || userSettings?.defaultAspectRatio || 'square';
    const finalTone = tone || userSettings?.defaultTone || 'professional yet approachable';

    // Validation
    if (!description || !targetAudience) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['description', 'targetAudience']
      });
    }

    if (!imageDescription || imageDescription.trim().length < 20) {
      return res.status(400).json({
        error: 'Image description is required and must be at least 20 characters',
        required: ['imageDescription']
      });
    }

    // Check if API keys are available (from any source)
    if (!geminiApiKey) {
      return res.status(401).json({
        error: 'Gemini API key not configured',
        details: 'No Gemini API key found. Please contact your administrator or add your own key in Settings.'
      });
    }

    if (!openaiApiKey) {
      return res.status(401).json({
        error: 'OpenAI API key not configured',
        details: 'No OpenAI API key found. Please contact your administrator or add your own key in Settings.'
      });
    }

    console.log('🚀 Starting ad generation process...');
    console.log('📋 Category:', category);
    console.log('🎨 Template:', template);
    console.log('👥 Target Audience:', targetAudience);
    console.log('🖼️ Image Description:', imageDescription?.substring(0, 100) + '...');
    console.log('🎯 Image Model: Google Gemini (gemini-2.5-flash-image)');
    console.log('📝 Copy Model:', model);
    if (simpleMode) {
      console.log('🎯 SIMPLE MODE ENABLED: Bypassing templates, using ONLY image description');
    }

    // Step 1: Generate Gemini image prompt
    const geminiPrompt = generateGeminiPrompt({
      category: category || TEMPLATE_CATEGORIES.B2B_SOFTWARE,
      template: template || 'dashboardShowcase',
      style,
      description,
      targetAudience,
      industry,
      colorPalette,
      aspectRatio: finalAspectRatio,
      customDetails,
      customDescription: customTemplateDescription, // For custom template
      imageDescription,
      moodKeywords,
      visualEmphasis,
      avoidInImage,
      simpleMode // NEW: Pass simpleMode flag
    });

    console.log('📝 Generated image prompt');

    // Validate prompt
    const promptValidation = geminiService.validatePrompt(geminiPrompt);
    console.log('✓ Prompt validation score:', (promptValidation.score * 100).toFixed(0) + '%');

    // Step 2: Generate image and copy in parallel
    console.log('🔄 Starting parallel generation: Gemini (image) + OpenAI (copy)...');

    const [imageResult, copyResult] = await Promise.allSettled([
      geminiService.generateImage(geminiPrompt, {
        apiKey: geminiApiKey,
        referenceImage: referenceImage // Pass reference image if provided
      }),
      openaiService.generateAdCopy({
        description,
        targetAudience,
        industry,
        visualDescription: imageDescription || `A ${template} style image showing ${description}`,
        imageDescription: imageDescription,
        tone: finalTone,
        copywritingStyle: copywritingStyle || 'default',
        valueProposition,
        callToAction,
        apiKey: openaiApiKey,
        model: model // NEW: Pass model selection to OpenAI service
      })
    ]);

    // Handle results
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      prompt: {
        gemini: geminiPrompt,
        validation: promptValidation
      },
      settings: {
        aspectRatio: finalAspectRatio,
        tone: finalTone
      }
    };

    // Image result
    if (imageResult.status === 'fulfilled' && imageResult.value.success) {
      response.image = imageResult.value;
      response.image.modelUsed = 'gemini';
      console.log('✅ Gemini image generation successful');
    } else {
      response.image = {
        success: false,
        error: imageResult.reason?.message || 'Gemini image generation failed'
      };
      console.log('❌ Gemini image generation failed:', imageResult.reason?.message);
    }

    // Copy result
    if (copyResult.status === 'fulfilled' && copyResult.value.success) {
      response.copy = copyResult.value;
      console.log('✅ Ad copy generation successful');

      // Validate the generated copy
      const copyValidation = openaiService.validateAdCopy(copyResult.value.adCopy);
      response.copy.validation = copyValidation;
    } else {
      response.copy = {
        success: false,
        error: copyResult.reason?.message || 'Copy generation failed'
      };
      console.log('⚠️ Copy generation failed:', copyResult.reason?.message);
    }

    // Save to database if both image and copy generation succeeded
    if (response.image?.success && response.copy?.success) {
      try {
        if (clientAccountId) {
          console.log('🔗 Linking ad to agency client:', clientAccountId);
        }

        const savedAd = await prisma.ad.create({
          data: {
            userId: req.userId, // Associate with authenticated user
            agencyClientId: clientAccountId || null, // Link to agency client if provided
            imageData: response.image.imageData.data,
            imageMimeType: response.image.imageData.mimeType,
            imageMetadata: {
              ...response.image.metadata || {},
              modelUsed: 'gemini'
            },
            headline: response.copy.adCopy.headline,
            description: response.copy.adCopy.description,
            primaryText: response.copy.adCopy.primaryText,
            callToAction: response.copy.adCopy.callToAction,
            alternativeHeadlines: response.copy.adCopy.alternativeHeadlines || [],
            keyBenefits: response.copy.adCopy.keyBenefits || [],
            toneAnalysis: response.copy.adCopy.toneAnalysis || null,
            copyModel: response.copy.metadata?.model || model, // Track which model was used
            productDescription: description,
            targetAudience: targetAudience,
            industry: industry || 'tech_saas',
            category: category || 'b2b_software',
            template: template || 'dashboardShowcase',
            tone: finalTone,
            colorPalette: colorPalette || null,
            aspectRatio: finalAspectRatio,
            valueProposition: valueProposition || null,
          },
        });

        response.savedToDatabase = true;
        response.adId = savedAd.id;
        console.log('✅ Ad saved to database with ID:', savedAd.id);

        // Increment user usage counter
        try {
          await prisma.user.update({
            where: { id: req.userId },
            data: { adsGenerated: { increment: 1 } }
          });
          console.log('✅ User ads counter incremented');
        } catch (counterError) {
          console.log('⚠️ Failed to increment ads counter:', counterError.message);
        }
      } catch (dbError) {
        console.error('⚠️ Failed to save ad to database:', dbError);
        response.savedToDatabase = false;
        response.databaseError = dbError.message;
      }
    }

    // Return combined result
    res.json(response);

  } catch (error) {
    console.error('❌ Generate endpoint error:', error);
    res.status(500).json({
      error: 'Failed to generate ad creative',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/generate-image
 * Generate only image (for regeneration)
 */
router.post('/image', async (req, res) => {
  try {
    const { prompt, customPrompt } = req.body;

    if (!prompt && !customPrompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const finalPrompt = customPrompt || prompt;
    const result = await geminiService.generateImage(finalPrompt);

    res.json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: 'Image generation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/generate-copy
 * Generate only ad copy (for regeneration)
 */
router.post('/copy', async (req, res) => {
  try {
    // Extract model from request body, default to GPT-4o
    const params = {
      ...req.body,
      model: req.body.model || 'gpt-4o-2024-08-06'
    };
    const result = await openaiService.generateAdCopy(params);
    res.json(result);
  } catch (error) {
    console.error('Copy generation error:', error);
    res.status(500).json({
      error: 'Copy generation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/models
 * Get available OpenAI models for ad copy generation
 */
router.get('/models', (req, res) => {
  try {
    const models = openaiService.getAvailableModels();
    res.json({
      success: true,
      models: models
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message
    });
  }
});

/**
 * POST /api/generate-headlines
 * Generate headline variations for A/B testing
 */
router.post('/headlines', async (req, res) => {
  try {
    const { description, targetAudience, count } = req.body;
    const headlines = await openaiService.generateHeadlineVariations({
      description,
      targetAudience,
      count: count || 5
    });

    res.json({ success: true, headlines });
  } catch (error) {
    console.error('Headline generation error:', error);
    res.status(500).json({
      error: 'Headline generation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/:category
 * Get available templates for a category
 */
router.get('/templates/:category', (req, res) => {
  try {
    const { category } = req.params;
    const templates = getTemplatesForCategory(category);

    res.json({
      success: true,
      category,
      templates
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

/**
 * GET /api/templates
 * Get all available categories and templates
 */
router.get('/templates', (req, res) => {
  try {
    const categories = Object.values(TEMPLATE_CATEGORIES);
    const allTemplates = {};

    categories.forEach(category => {
      allTemplates[category] = getTemplatesForCategory(category);
    });

    res.json({
      success: true,
      categories,
      templates: allTemplates
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

/**
 * POST /api/validate-prompt
 * Validate a Gemini prompt
 */
router.post('/validate-prompt', (req, res) => {
  try {
    const { prompt } = req.body;
    const validation = geminiService.validatePrompt(prompt);
    res.json({ success: true, validation });
  } catch (error) {
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/validate-copy
 * Validate ad copy against Facebook guidelines
 */
router.post('/validate-copy', (req, res) => {
  try {
    const validation = openaiService.validateAdCopy(req.body);
    res.json({ success: true, validation });
  } catch (error) {
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/test-gemini
 * Simple test endpoint to verify Gemini image generation works
 */
router.get('/test-gemini', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini image generation with simple prompt...');

    // Load user's API key from database
    let userGeminiKey = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { geminiApiKey: true }
      });
      userGeminiKey = user?.geminiApiKey;
    } catch (err) {
      console.log('⚠️ Could not load user Gemini key:', err.message);
    }

    // Get admin default API keys from database
    const adminKeys = await getAdminApiKeys();

    // API Key Priority: Headers > User DB > Admin Database > Environment Variables
    const geminiApiKey = req.headers['x-gemini-api-key'] || userGeminiKey || adminKeys.geminiApiKey || process.env.GEMINI_API_KEY;

    const simplePrompt = "Create a picture of a banana";

    const result = await geminiService.generateImage(simplePrompt, {
      apiKey: geminiApiKey
    });

    res.json({
      success: true,
      message: 'Gemini test successful',
      hasImage: !!result.imageData,
      imageSize: result.imageData?.data?.length || 0
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/regenerate-copy
 * Regenerate ONLY the ad copy (keep existing image)
 */
router.post('/regenerate-copy', async (req, res) => {
  try {
    const {
      description,
      targetAudience,
      industry,
      imageDescription,
      tone,
      copywritingStyle,
      valueProposition,
      callToAction,
      model = 'gpt-4o-2024-08-06'
    } = req.body;

    // Load user's API key from database
    let userOpenaiKey = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { openaiApiKey: true }
      });
      userOpenaiKey = user?.openaiApiKey;
    } catch (err) {
      console.log('⚠️ Could not load user OpenAI key:', err.message);
    }

    // Get admin default API keys from database
    const adminKeys = await getAdminApiKeys();

    // API Key Priority: Headers > User DB > Admin Database > Environment Variables
    const openaiApiKey = req.headers['x-openai-api-key'] || userOpenaiKey || adminKeys.openaiApiKey || process.env.OPENAI_API_KEY;

    // Validation
    if (!description || !targetAudience) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['description', 'targetAudience']
      });
    }

    if (!openaiApiKey) {
      return res.status(401).json({
        error: 'OpenAI API key not configured',
        details: 'No OpenAI API key found. Please contact your administrator or add your own key in Settings.'
      });
    }

    console.log('🔄 Regenerating ad copy only...');
    console.log('📝 Copy Model:', model);
    console.log('🎨 Copywriting Style:', copywritingStyle || 'default');

    // Generate only ad copy
    const copyResult = await openaiService.generateAdCopy({
      description,
      targetAudience,
      industry,
      visualDescription: imageDescription || `A professional image showing ${description}`,
      imageDescription: imageDescription,
      tone: tone || 'professional yet approachable',
      copywritingStyle: copywritingStyle || 'default',
      valueProposition,
      callToAction,
      apiKey: openaiApiKey,
      model: model
    });

    if (copyResult.success) {
      // Validate the generated copy
      const copyValidation = openaiService.validateAdCopy(copyResult.adCopy);

      return res.json({
        success: true,
        copy: {
          ...copyResult,
          validation: copyValidation
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate ad copy'
      });
    }

  } catch (error) {
    console.error('❌ Copy regeneration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to regenerate ad copy'
    });
  }
});

export default router;
