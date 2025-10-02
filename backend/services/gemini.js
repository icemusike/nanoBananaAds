import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini Service for Image Generation
 * Uses Gemini 2.5 Flash (gemini-2.5-flash-image-preview)
 */

class GeminiService {
  constructor() {
    this.genAI = null;
    this.apiKey = null;
  }

  initialize(apiKeyOverride = null) {
    // Use provided API key, or fallback to environment variable
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not provided. Please add it in Settings or environment variables.');
    }

    // Only reinitialize if API key changed
    if (!this.genAI || this.apiKey !== apiKey) {
      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Generate an image using Gemini 2.5 Flash
   * @param {string} prompt - The detailed prompt for image generation
   * @param {object} options - Additional options (can include apiKey, referenceImage)
   * @returns {Promise<object>} - Generated image data
   */
  async generateImage(prompt, options = {}) {
    this.initialize(options.apiKey); // Ensure API is initialized with optional key

    try {
      console.log('🎨 Starting Gemini image generation...');
      console.log('📝 Prompt length:', prompt.length, 'characters');

      // Use gemini-2.5-flash-image-preview model which supports image generation
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-image-preview',
      });

      // Prepare content parts according to Google Gemini documentation
      let contentParts;

      if (options.referenceImage && options.referenceImage.data) {
        console.log('🖼️ Including reference image for style guidance');
        console.log('📋 Reference image MIME type:', options.referenceImage.mimeType);
        console.log('📏 Reference image data length:', options.referenceImage.data.length, 'characters');

        // Verify base64 data doesn't contain data URI prefix
        if (options.referenceImage.data.startsWith('data:')) {
          console.error('❌ ERROR: Base64 data contains data URI prefix! This will fail.');
          throw new Error('Invalid image data format: base64 string should not include data URI prefix');
        }

        // Format according to @google/generative-ai documentation:
        // Text prompt first, then inline image data with mimeType and base64 data
        contentParts = [
          {
            text: `Using the visual style, composition, and aesthetic from the reference image, create a new image with this description: ${prompt}`
          },
          {
            inlineData: {
              mimeType: options.referenceImage.mimeType,
              data: options.referenceImage.data  // Pure base64 string, no prefix
            }
          }
        ];
      } else {
        // No reference image, just send the prompt as text
        contentParts = prompt;
      }

      console.log('🎯 Requesting image generation from Gemini...');

      // Generate content - Gemini 2.5 Flash can generate images
      const result = await model.generateContent(contentParts);

      const response = result.response;
      console.log('✅ Gemini generation complete');
      console.log('📦 Response candidates:', response.candidates?.length || 0);

      // Debug: Log response structure
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content?.parts || [];
        console.log('📋 Response parts:', parts.length);
        parts.forEach((part, idx) => {
          console.log(`  Part ${idx}:`, Object.keys(part));
        });
      }

      // Extract image data from response
      const imageData = this.extractImageFromResponse(response);

      if (!imageData) {
        // If no image in response, return the text response for debugging
        let text = '';
        try {
          text = response.text();
        } catch (e) {
          text = 'Unable to extract text response';
        }

        console.log('⚠️ No image found in response');
        console.log('📝 Text response preview:', text.substring(0, 200));

        return {
          success: false,
          message: 'Gemini did not return an image. The model may be text-only or image generation is not yet available.',
          textResponse: text,
          prompt: prompt,
          hint: 'Image generation with Gemini is experimental. Consider using DALL-E or Stable Diffusion as alternative.'
        };
      }

      return {
        success: true,
        imageData: imageData,
        prompt: prompt,
        metadata: {
          model: 'gemini-2.5-flash-image-preview',
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error(`Gemini image generation failed: ${error.message}`);
    }
  }

  /**
   * Extract image data from Gemini response
   * @private
   */
  extractImageFromResponse(response) {
    try {
      // Check if response has image parts
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        console.log('❌ No candidates in response');
        return null;
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        console.log('❌ No content or parts in response');
        return null;
      }

      console.log(`🔍 Searching for image in ${content.parts.length} parts...`);

      // Look for image parts in the response
      // According to Google docs, images are in inline_data with mime_type and data
      for (let i = 0; i < content.parts.length; i++) {
        const part = content.parts[i];
        console.log(`  Checking part ${i}:`, Object.keys(part));

        // Try inline_data (snake_case from API)
        if (part.inline_data) {
          console.log(`    Found inline_data:`, Object.keys(part.inline_data));
          if (part.inline_data.mime_type && part.inline_data.mime_type.startsWith('image/')) {
            console.log(`    ✓ Found image! MIME type: ${part.inline_data.mime_type}`);
            return {
              mimeType: part.inline_data.mime_type,
              data: part.inline_data.data, // Base64 encoded image
            };
          }
        }

        // Also try inlineData (camelCase from SDK)
        if (part.inlineData) {
          console.log(`    Found inlineData:`, Object.keys(part.inlineData));
          if (part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
            console.log(`    ✓ Found image! MIME type: ${part.inlineData.mimeType}`);
            return {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data, // Base64 encoded image
            };
          }
        }

        // Check for text (means no image was generated)
        if (part.text) {
          console.log(`    ℹ️ Part ${i} contains text (no image)`);
        }
      }

      console.log('❌ No image parts found in response');
      return null;
    } catch (error) {
      console.error('❌ Error extracting image:', error);
      return null;
    }
  }

  /**
   * Validate prompt meets best practices
   * @param {string} prompt
   * @returns {object} validation result
   */
  validatePrompt(prompt) {
    const warnings = [];
    const recommendations = [];

    // Check prompt length
    if (prompt.length < 100) {
      warnings.push('Prompt is quite short. Gemini performs better with detailed narrative descriptions.');
    }

    // Check for narrative style
    if (prompt.split('.').length < 3) {
      recommendations.push('Consider adding more descriptive sentences for better results.');
    }

    // Check for key elements
    const hasSubject = /person|professional|worker|owner|user/i.test(prompt);
    const hasEnvironment = /office|workspace|home|cafe|shop|environment/i.test(prompt);
    const hasLighting = /light|illuminat|glow|shadow/i.test(prompt);
    const hasCamera = /camera|lens|captured|shot|photograph/i.test(prompt);
    const hasColors = /color|palette|blue|green|vibrant|bold/i.test(prompt);

    if (!hasSubject) recommendations.push('Add detailed subject description');
    if (!hasEnvironment) recommendations.push('Specify the environment/setting');
    if (!hasLighting) recommendations.push('Describe lighting conditions');
    if (!hasCamera) recommendations.push('Include camera/photography specifications');
    if (!hasColors) recommendations.push('Specify color palette');

    return {
      isValid: warnings.length === 0,
      warnings,
      recommendations,
      score: [hasSubject, hasEnvironment, hasLighting, hasCamera, hasColors].filter(Boolean).length / 5
    };
  }
}

export default new GeminiService();
