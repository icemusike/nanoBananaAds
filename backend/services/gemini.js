import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Gemini Service for Image Generation
 * Uses Gemini 2.5 Flash Image (gemini-2.5-flash-image)
 * Updated to use @google/genai SDK (v1.22.0+)
 */

class GeminiService {
  constructor() {
    this.client = null;
    this.apiKey = null;
  }

  initialize(apiKeyOverride = null) {
    // Use provided API key, or fallback to environment variable
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not provided. Please add it in Settings or environment variables.');
    }

    // Only reinitialize if API key changed
    if (!this.client || this.apiKey !== apiKey) {
      this.apiKey = apiKey;
      this.client = new GoogleGenAI({ apiKey });
      console.log('✅ Gemini client initialized with new SDK');
    }
  }

  /**
   * Generate an image using Gemini 2.5 Flash Image
   * @param {string} prompt - The detailed prompt for image generation
   * @param {object} options - Additional options (can include apiKey, referenceImage)
   * @returns {Promise<object>} - Generated image data
   */
  async generateImage(prompt, options = {}) {
    this.initialize(options.apiKey); // Ensure API is initialized with optional key

    try {
      console.log('🎨 Starting Gemini image generation...');
      console.log('📝 Prompt length:', prompt.length, 'characters');

      // Model name for image generation
      const modelName = 'gemini-2.5-flash-image';

      // Prepare content based on whether we have a reference image
      let contents;

      if (options.referenceImage && options.referenceImage.data) {
        console.log('🖼️ Including reference image for style guidance');
        console.log('📋 Reference image MIME type:', options.referenceImage.mimeType);
        console.log('📏 Reference image data length:', options.referenceImage.data.length, 'characters');

        // Verify base64 data doesn't contain data URI prefix
        let imageData = options.referenceImage.data;
        if (imageData.startsWith('data:')) {
          console.log('⚠️ Removing data URI prefix from reference image');
          imageData = imageData.split(',')[1];
        }

        // With reference image: send image first, then prompt
        contents = [
          {
            inlineData: {
              mimeType: options.referenceImage.mimeType,
              data: imageData  // Pure base64 string
            }
          },
          {
            text: `Using the visual style, composition, and aesthetic from the reference image, create a new image with this description: ${prompt}`
          }
        ];
      } else {
        // No reference image, just send the text prompt
        contents = prompt;
      }

      console.log('🎯 Requesting image generation from Gemini...');
      console.log('\n' + '='.repeat(80));
      console.log('📤 GEMINI IMAGE GENERATION REQUEST');
      console.log('='.repeat(80));

      if (options.referenceImage && options.referenceImage.data) {
        console.log('🖼️  WITH REFERENCE IMAGE');
        console.log('   📋 MIME Type:', options.referenceImage.mimeType);
        console.log('   📏 Image Size:', Math.round(options.referenceImage.data.length / 1024), 'KB');
        console.log('\n📝 TEXT PROMPT:');
        console.log('─'.repeat(80));
        console.log(contents[1].text);
      } else {
        console.log('📝 TEXT PROMPT (No Reference Image):');
        console.log('─'.repeat(80));
        console.log(typeof contents === 'string' ? contents : JSON.stringify(contents));
      }

      console.log('─'.repeat(80));
      console.log('🔧 MODEL:', modelName);
      console.log('='.repeat(80) + '\n');

      // Generate content using the new SDK with explicit image generation config
      // gemini-2.5-flash-image requires responseModalities to specify image output
      const response = await this.client.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          responseModalities: [Modality.IMAGE] // Explicitly request image output
        }
      });

      console.log('✅ Gemini generation complete');

      // Log the raw HTTP response if available
      if (response.sdkHttpResponse) {
        console.log('\n📡 HTTP Response Status:', response.sdkHttpResponse.statusCode);
        console.log('📡 HTTP Response Headers:', JSON.stringify(response.sdkHttpResponse.headers, null, 2));
      }

      // DETAILED DEBUG: Log full response structure
      console.log('\n🔍 DETAILED RESPONSE DEBUG:');
      console.log('─'.repeat(80));
      console.log('📝 Response object keys:', Object.keys(response));
      console.log('📦 Response candidates:', response.candidates?.length || 0);

      if (response.candidates && response.candidates[0]) {
        console.log('📦 Candidate[0] keys:', Object.keys(response.candidates[0]));
        console.log('📄 Content keys:', Object.keys(response.candidates[0].content || {}));

        const parts = response.candidates[0].content?.parts || [];
        console.log('📋 Response parts:', parts.length);

        if (parts.length === 0) {
          console.log('❌ WARNING: Response has 0 parts!');
          console.log('🔍 Full candidate structure:', JSON.stringify(response.candidates[0], null, 2));
          console.log('🔍 FULL RESPONSE (for debugging):', JSON.stringify(response, null, 2));
        }

        parts.forEach((part, idx) => {
          console.log(`  Part ${idx} keys:`, Object.keys(part));
          if (part.text) {
            console.log(`    → Text content (${part.text.length} chars):`, part.text.substring(0, 100));
          }
          if (part.inlineData) {
            console.log(`    → InlineData found:`, Object.keys(part.inlineData));
            console.log(`    → MIME type:`, part.inlineData.mimeType);
            console.log(`    → Data length:`, (part.inlineData.data || '').length, 'bytes');
          }
        });
      } else {
        console.log('❌ No candidates or first candidate is missing');
        console.log('🔍 Full response:', JSON.stringify(response, null, 2).substring(0, 500));
      }
      console.log('─'.repeat(80));

      // Extract image data from response
      const imageData = this.extractImageFromResponse(response);

      if (!imageData) {
        // If no image in response, return the text response for debugging
        let textResponse = '';
        try {
          if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            textResponse = response.candidates[0].content.parts[0].text;
          }
        } catch (e) {
          textResponse = 'Unable to extract text response';
        }

        console.log('⚠️ No image found in response');
        console.log('📝 Text response preview:', textResponse.substring(0, 200));
        console.log('💡 This may indicate the model returned text instead of an image');

        throw new Error('Gemini did not return an image. The response contained only text.');
      }

      console.log('✅ Successfully extracted image from Gemini response');
      console.log('📊 Image MIME type:', imageData.mimeType);
      console.log('📏 Image data size:', Math.round(imageData.data.length / 1024), 'KB');

      return {
        success: true,
        imageData: imageData,
        prompt: prompt,
        metadata: {
          model: modelName,
          timestamp: new Date().toISOString(),
          hasReferenceImage: !!options.referenceImage
        }
      };

    } catch (error) {
      console.error('❌ Gemini API Error:', error.message);
      console.error('Error stack:', error.stack);

      // Log more details about the error
      if (error.response) {
        console.error('API Response Error:', error.response.data || error.response);
      }

      throw new Error(`Gemini image generation failed: ${error.message}`);
    }
  }

  /**
   * Extract image data from Gemini response
   * @private
   */
  extractImageFromResponse(response) {
    try {
      // Check if response has candidates
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
      // According to @google/genai SDK, images are in inlineData with mimeType and data
      for (let i = 0; i < content.parts.length; i++) {
        const part = content.parts[i];
        console.log(`  Checking part ${i}:`, Object.keys(part));

        // Check for inlineData (the format used by @google/genai)
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
          console.log(`    ℹ️ Part ${i} contains text (no image):`, part.text.substring(0, 100));
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
