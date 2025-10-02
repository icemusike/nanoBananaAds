import express from 'express';
import geminiService from '../services/gemini.js';
import openaiService from '../services/openai.js';
import { generateGeminiPrompt, getTemplatesForCategory, TEMPLATE_CATEGORIES } from '../prompts/templates.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

/**
 * POST /api/generate
 * Main endpoint to generate complete ad creative (image + copy)
 */
router.post('/generate', async (req, res) => {
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
      referenceImage // { data: base64, mimeType: string }
    } = req.body;

    // Extract API keys from headers (sent from frontend localStorage)
    const geminiApiKey = req.headers['x-gemini-api-key'];
    const openaiApiKey = req.headers['x-openai-api-key'];

    // Load user settings from database
    const DEFAULT_USER_ID = 'default-user';
    let userSettings = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: DEFAULT_USER_ID }
      });
      if (user) {
        userSettings = {
          preferredImageModel: user.preferredImageModel || 'gemini',
          imageQuality: user.imageQuality || 'standard',
          defaultAspectRatio: user.defaultAspectRatio || 'square',
          defaultTone: user.defaultTone || 'professional yet approachable'
        };
        console.log('✓ User settings loaded:', userSettings);
      }
    } catch (settingsError) {
      console.log('⚠️ Could not load user settings, using defaults:', settingsError.message);
    }

    // Use settings with fallbacks
    const preferredImageModel = userSettings?.preferredImageModel || 'gemini';
    const imageQuality = userSettings?.imageQuality || 'standard';
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

    // Check if API keys are available based on preferred model
    if (preferredImageModel === 'gemini' && !geminiApiKey && !process.env.GEMINI_API_KEY) {
      return res.status(401).json({
        error: 'Gemini API key not found. Please add it in Settings.',
        details: 'Go to Settings and add your Google Gemini API key'
      });
    }

    if (preferredImageModel === 'dalle' && !openaiApiKey && !process.env.OPENAI_API_KEY) {
      return res.status(401).json({
        error: 'OpenAI API key not found. Please add it in Settings.',
        details: 'Go to Settings and add your OpenAI API key for DALL-E'
      });
    }

    if (!openaiApiKey && !process.env.OPENAI_API_KEY) {
      return res.status(401).json({
        error: 'OpenAI API key not found. Please add it in Settings.',
        details: 'Go to Settings and add your OpenAI API key'
      });
    }

    console.log('🚀 Starting ad generation process...');
    console.log('📋 Category:', category);
    console.log('🎨 Template:', template);
    console.log('👥 Target Audience:', targetAudience);
    console.log('🖼️ Image Description:', imageDescription?.substring(0, 100) + '...');
    console.log('🎯 Preferred Image Model:', preferredImageModel);
    console.log('💎 Image Quality:', imageQuality);

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
      avoidInImage
    });

    console.log('📝 Generated image prompt');

    // Validate prompt
    const promptValidation = geminiService.validatePrompt(geminiPrompt);
    console.log('✓ Prompt validation score:', (promptValidation.score * 100).toFixed(0) + '%');

    // Step 2: Generate image and copy in parallel, using preferred model
    console.log(`🔄 Starting parallel generation: ${preferredImageModel.toUpperCase()} (image) + OpenAI (copy)...`);

    // Prepare image generation promise based on user preference
    let imageGenerationPromise;
    if (preferredImageModel === 'dalle') {
      // Use DALL-E as primary choice
      const imageSize = finalAspectRatio === 'portrait' ? '1024x1792' : '1024x1024';
      imageGenerationPromise = openaiService.generateImage(geminiPrompt, {
        size: imageSize,
        quality: imageQuality, // 'standard' or 'hd'
        style: 'natural',
        apiKey: openaiApiKey
      });
    } else {
      // Use Gemini (default)
      imageGenerationPromise = geminiService.generateImage(geminiPrompt, {
        apiKey: geminiApiKey,
        referenceImage: referenceImage // Pass reference image if provided
      });
    }

    const [imageResult, copyResult] = await Promise.allSettled([
      imageGenerationPromise,
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
        apiKey: openaiApiKey
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
        preferredImageModel,
        imageQuality,
        aspectRatio: finalAspectRatio,
        tone: finalTone
      }
    };

    // Image result - Try preferred model first, fallback to alternative if needed
    if (imageResult.status === 'fulfilled' && imageResult.value.success) {
      response.image = imageResult.value;
      response.image.modelUsed = preferredImageModel;
      console.log(`✅ ${preferredImageModel.toUpperCase()} image generation successful`);
    } else {
      // Fallback to alternative model
      const fallbackModel = preferredImageModel === 'gemini' ? 'dalle' : 'gemini';
      console.log(`⚠️ ${preferredImageModel.toUpperCase()} image generation failed, falling back to ${fallbackModel.toUpperCase()}...`);

      try {
        let fallbackResult;
        if (fallbackModel === 'dalle') {
          const imageSize = finalAspectRatio === 'portrait' ? '1024x1792' : '1024x1024';
          fallbackResult = await openaiService.generateImage(geminiPrompt, {
            size: imageSize,
            quality: imageQuality,
            style: 'natural',
            apiKey: openaiApiKey
          });
        } else {
          fallbackResult = await geminiService.generateImage(geminiPrompt, {
            apiKey: geminiApiKey,
            referenceImage: referenceImage
          });
        }

        response.image = fallbackResult;
        response.image.fallbackUsed = true;
        response.image.modelUsed = fallbackModel;
        console.log(`✅ ${fallbackModel.toUpperCase()} image generation successful (fallback)`);
      } catch (fallbackError) {
        response.image = {
          success: false,
          error: imageResult.reason?.message || 'Image generation failed',
          fallbackError: fallbackError.message,
          attemptedModels: [preferredImageModel, fallbackModel]
        };
        console.log('❌ Both image generation methods failed');
        console.log(`  ${preferredImageModel.toUpperCase()} error:`, imageResult.reason?.message);
        console.log(`  ${fallbackModel.toUpperCase()} error:`, fallbackError.message);
      }
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
        const savedAd = await prisma.ad.create({
          data: {
            imageData: response.image.imageData.data,
            imageMimeType: response.image.imageData.mimeType,
            imageMetadata: {
              ...response.image.metadata || {},
              modelUsed: response.image.modelUsed,
              fallbackUsed: response.image.fallbackUsed || false,
              imageQuality: imageQuality
            },
            headline: response.copy.adCopy.headline,
            description: response.copy.adCopy.description,
            primaryText: response.copy.adCopy.primaryText,
            callToAction: response.copy.adCopy.callToAction,
            alternativeHeadlines: response.copy.adCopy.alternativeHeadlines || [],
            keyBenefits: response.copy.adCopy.keyBenefits || [],
            toneAnalysis: response.copy.adCopy.toneAnalysis || null,
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
            where: { id: DEFAULT_USER_ID },
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
router.post('/generate-image', async (req, res) => {
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
router.post('/generate-copy', async (req, res) => {
  try {
    const result = await openaiService.generateAdCopy(req.body);
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
 * POST /api/generate-headlines
 * Generate headline variations for A/B testing
 */
router.post('/generate-headlines', async (req, res) => {
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

export default router;
