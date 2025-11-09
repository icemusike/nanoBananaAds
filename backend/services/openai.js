import OpenAI from 'openai';

/**
 * OpenAI Service for Ad Copy Generation
 * Generates Facebook ad copy: Headline, Description, and Primary Text
 */

class OpenAIService {
  constructor() {
    this.openai = null;
    this.apiKey = null;

    // Available models with configuration
    this.models = {
      'gpt-5-2025-08-07': {
        name: 'GPT-5',
        temperature: null, // GPT-5 reasoning models don't support custom temperature (uses default 1)
        maxTokens: 4000, // Increased for GPT-5 reasoning models (includes reasoning tokens + output)
        useMaxCompletionTokens: true, // GPT-5 uses max_completion_tokens instead of max_tokens
        reasoningEffort: 'low', // Changed to 'low' for faster, cheaper generation with less reasoning
        isReasoningModel: true, // Flag to identify reasoning models
        description: 'Latest GPT-5 model with advanced reasoning and best performance',
        costMultiplier: 100, // Relative cost indicator
        capabilities: ['Advanced reasoning', 'Expert-level intelligence', 'Best for complex ad copy']
      },
      'gpt-4o-2024-08-06': {
        name: 'GPT-4o',
        temperature: 0.75,
        maxTokens: 1500,
        useMaxCompletionTokens: false,
        isReasoningModel: false,
        description: 'Latest GPT-4o model with superior instruction following',
        costMultiplier: 33,
        capabilities: ['Superior reasoning', 'Excellent instruction adherence', 'Cost-effective']
      },
      'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        temperature: 0.8,
        maxTokens: 1500,
        useMaxCompletionTokens: false,
        isReasoningModel: false,
        description: 'Fast and cost-effective model for simple ad copy',
        costMultiplier: 1,
        capabilities: ['Fast generation', 'Most affordable', 'Good for testing']
      }
    };
  }

  initialize(apiKeyOverride = null) {
    // Use provided API key, or fallback to environment variable
    const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not provided. Please add it in Settings or environment variables.');
    }

    // Only reinitialize if API key changed
    if (!this.openai || this.apiKey !== apiKey) {
      this.apiKey = apiKey;
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  /**
   * Get optimal configuration for a specific model
   * @param {string} model - Model identifier
   * @returns {object} - Model configuration
   */
  getModelConfig(model) {
    const config = this.models[model];
    if (!config) {
      console.warn(`⚠️ Unknown model: ${model}, falling back to GPT-4o defaults`);
      return this.models['gpt-4o-2024-08-06'];
    }
    return config;
  }

  /**
   * Get list of available models
   * @returns {array} - Array of model information
   */
  getAvailableModels() {
    return Object.entries(this.models).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  /**
   * Generate complete Facebook ad copy
   * @param {object} params - Parameters for ad copy generation (can include apiKey and model)
   * @returns {Promise<object>} - Generated ad copy
   */
  async generateAdCopy(params) {
    this.initialize(params.apiKey); // Ensure API is initialized with optional key

    const {
      description,
      targetAudience,
      industry,
      visualDescription,
      imageDescription,
      tone = 'professional yet approachable',
      copywritingStyle = 'default',
      valueProposition,
      callToAction = 'Learn More',
      model = 'gpt-4o-2024-08-06' // NEW: Allow model selection, default to GPT-4o
    } = params;

    try {
      // Get model configuration
      const modelConfig = this.getModelConfig(model);

      console.log('✍️ Starting OpenAI ad copy generation...');
      console.log('🤖 Model:', model, `(${modelConfig.name})`);
      console.log('🌡️  Temperature:', modelConfig.temperature);
      if (imageDescription) {
        console.log('🎨 Using custom image description for copy context');
      }

      const prompt = this.buildAdCopyPrompt(params);

      // ENHANCED System message with strict enforcement and psychological copywriting framework
      const jsonOutputInstructions = modelConfig.isReasoningModel
        ? `\n\n🚨 CRITICAL FOR REASONING MODELS: You MUST output ONLY valid JSON. You can include reasoning internally, but your final response MUST be pure JSON with no additional text, explanations, or markdown. Start your response with { and end with }.`
        : '';

      const systemMessage = `You are an elite Facebook advertising copywriter with mastery of legendary direct response techniques from Gary Halbert, David Ogilvy, Eugene Schwartz, and Dan Kennedy. You are renowned for creating scroll-stopping, conversion-optimized ad copy.${jsonOutputInstructions}

CORE COMPETENCIES:
✓ Advanced emotional trigger engineering (fear, desire, curiosity, urgency, belonging, relief)
✓ Psychological copywriting frameworks (PAS, BAB, AIDA, 4Ps, PASTOR)
✓ Facebook ad algorithm optimization (2024-2025 best practices)
✓ Mobile-first copy architecture (73% of users on mobile)
✓ Strategic emoji deployment (241% CTR increase when used correctly)
✓ Copy-visual synchronization for seamless storytelling

CRITICAL OUTPUT REQUIREMENTS - NON-NEGOTIABLE:

1. CHARACTER LIMITS (STRICTLY ENFORCED):
   • headline: MAXIMUM 40 characters (if over 40, CUT IT DOWN)
   • description: MAXIMUM 30 characters (if over 30, CUT IT DOWN)
   • primaryText: 125-150 words EXACTLY (count every word)

2. EMOJI RULES (EXACT PLACEMENT):
   • Headline: 0-1 emoji at the VERY BEGINNING (optional, only if it enhances)
   • Primary Text: 2-4 emojis ONLY at the start of key benefit bullets/sentences
   • NEVER use emojis mid-sentence or as random decoration
   • Example: "✨ Transform your business in 30 days" ✓
   • Example: "Transform ✨ your business in 30 days" ✗

3. PRIMARY TEXT STRUCTURE (MANDATORY FORMAT):
   Line 1-2: POWERFUL HOOK - Bold question, shocking stat, or provocative statement that stops the scroll
   [BLANK LINE]
   Line 3-6: 3-4 key benefits, each starting with emoji bullet
   [BLANK LINE]
   Line 7-8: Social proof or credibility element
   [BLANK LINE]
   Line 9-10: Urgency/scarcity statement
   [BLANK LINE]
   Line 11: Clear call to action

   CRITICAL: The opening hook must NOT describe the image. Instead it must:
   - Ask a provocative question targeting their pain
   - State a shocking statistic or bold claim
   - Challenge a common belief
   - Present an urgent problem they're facing NOW
   Examples: "Losing 30% of your leads to missed calls?", "Most businesses waste $5K/month on..."

4. HEADLINE PSYCHOLOGY:
   Must trigger ONE of: Curiosity, Fear, Desire, Urgency, Social Proof
   Use power words: Discover, Proven, Secret, Guaranteed, Limited, Exclusive, Transform, Revolutionary
   Include numbers when possible: "3 Ways...", "247% More...", "30-Day..."
   Ask questions that highlight pain: "Tired of...?", "What if you could...?"

5. ALTERNATIVE HEADLINES - CRITICAL:
   Each alternative MUST use a DIFFERENT psychological trigger than the main headline
   Main headline = Curiosity → Alt 1 = Social Proof, Alt 2 = Urgency, Alt 3 = Fear
   Test different frameworks: Question, Bold Claim, Statistic, How-To, Warning

6. MOBILE OPTIMIZATION:
   First 2 lines of primaryText are critical (visible above fold)
   Use short sentences (10-15 words max)
   Use line breaks for scannability (every 2-3 sentences)
   Make key benefits easily skimmable

OUTPUT FORMAT (STRICT JSON):
{
  "headline": "string (≤40 chars)",
  "description": "string (≤30 chars)",
  "primaryText": "string (125-150 words, \\n\\n for line breaks)",
  "callToAction": "string (action verb + benefit)",
  "alternativeHeadlines": ["string", "string", "string"] (3 headlines, different triggers),
  "keyBenefits": ["string", "string", "string", "string"] (3-5 specific benefits),
  "toneAnalysis": "string (2-3 sentences on tone strategy)"
}

VALIDATION BEFORE OUTPUT:
- Count headline characters → if >40, make shorter
- Count description characters → if >30, make shorter
- Count primaryText words → if not 125-150, adjust
- Check emojis → only at line/bullet starts
- Check alternative headlines → each uses different psychological angle

Your output will be rejected if character limits are exceeded. Quality > Quantity. Every word must earn its place.`;

      // Log the complete request being sent to OpenAI
      console.log('\n' + '='.repeat(80));
      console.log('📤 OPENAI AD COPY GENERATION REQUEST');
      console.log('='.repeat(80));
      console.log('🔧 MODEL:', model, `(${modelConfig.name})`);
      console.log('🌡️  TEMPERATURE:', modelConfig.temperature);
      console.log('📊 MAX TOKENS:', modelConfig.maxTokens);
      console.log('💰 COST MULTIPLIER:', `${modelConfig.costMultiplier}x`);
      console.log('─'.repeat(80));
      console.log('💬 SYSTEM MESSAGE:');
      console.log('─'.repeat(80));
      console.log(systemMessage);
      console.log('\n' + '─'.repeat(80));
      console.log('👤 USER PROMPT:');
      console.log('─'.repeat(80));
      console.log(prompt);
      console.log('─'.repeat(80));
      console.log('📏 Prompt Length:', prompt.length, 'characters');
      console.log('='.repeat(80) + '\n');

      // Build request parameters based on model type
      const requestParams = {
        model: model, // Use selected model
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      // Handle model-specific parameters
      if (modelConfig.isReasoningModel) {
        // GPT-5/o1 reasoning models:
        // - Don't support custom temperature (uses default 1)
        // - Use max_completion_tokens instead of max_tokens
        // - Support reasoning_effort parameter
        // - DON'T support response_format json_object (will return empty response!)
        requestParams.max_completion_tokens = modelConfig.maxTokens;

        if (modelConfig.reasoningEffort) {
          requestParams.reasoning_effort = modelConfig.reasoningEffort;
        }

        console.log('🧠 Reasoning model detected:');
        console.log(`   - Using default temperature (1)`);
        console.log(`   - max_completion_tokens: ${modelConfig.maxTokens}`);
        console.log(`   - reasoning_effort: ${modelConfig.reasoningEffort || 'not set'}`);
        console.log(`   - NO response_format (reasoning models don't support it)`);
      } else {
        // GPT-4o and older models:
        // - Support custom temperature
        // - Use max_tokens parameter
        // - Support response_format json_object
        requestParams.temperature = modelConfig.temperature;
        requestParams.max_tokens = modelConfig.maxTokens;
        requestParams.response_format = { type: 'json_object' };
      }

      const completion = await this.openai.chat.completions.create(requestParams);

      const responseContent = completion.choices[0].message.content;
      console.log('📝 Raw response length:', responseContent?.length || 0);

      // Check if response is empty
      if (!responseContent || responseContent.trim() === '') {
        console.error('❌ OpenAI returned empty response!');
        console.error('🔍 Model:', model);
        console.error('🔍 Is reasoning model:', modelConfig.isReasoningModel);
        throw new Error('OpenAI returned an empty response. Check model compatibility.');
      }

      // Log first 300 chars for debugging
      console.log('📄 Response preview:', responseContent.substring(0, 300) + '...');

      let result;
      try {
        // For reasoning models, extract JSON from response (may include reasoning text)
        if (modelConfig.isReasoningModel) {
          console.log('🧠 Extracting JSON from reasoning model response...');
          result = this.extractJSONFromText(responseContent);
        } else {
          // For non-reasoning models with json_object format, parse directly
          result = JSON.parse(responseContent);
        }

        // CRITICAL: Enforce standards before returning
        console.log('\n🔍 Enforcing ad copy standards...');
        result = this.enforceAdCopyStandards(result);

      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 Response content:', responseContent?.substring(0, 500));
        throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
      }

      console.log('✅ OpenAI ad copy generation complete');
      console.log('📊 Quality Metrics:');
      console.log(`   Headline: ${result.headline?.length || 0}/40 chars`);
      console.log(`   Description: ${result.description?.length || 0}/30 chars`);
      console.log(`   Primary Text: ${result.primaryText?.split(/\s+/).length || 0} words`);
      console.log(`   Alternative Headlines: ${result.alternativeHeadlines?.length || 0}`);

      // Build metadata with complete token usage for cost tracking
      const metadata = {
        model: completion.model || model,
        modelName: modelConfig.name,
        timestamp: new Date().toISOString(),
        // Detailed token breakdown for cost calculation
        promptTokens: completion.usage.prompt_tokens || 0,
        completionTokens: completion.usage.completion_tokens || 0,
        totalTokens: completion.usage.total_tokens || 0,
        // For backwards compatibility
        tokensUsed: completion.usage.total_tokens,
        costMultiplier: modelConfig.costMultiplier
      };

      // Add reasoning tokens for GPT-5/o1 models
      if (modelConfig.isReasoningModel && completion.usage.completion_tokens_details?.reasoning_tokens) {
        metadata.reasoningTokens = completion.usage.completion_tokens_details.reasoning_tokens;
        console.log(`🧠 Reasoning Tokens: ${metadata.reasoningTokens}`);
      }

      // Log token usage summary
      console.log(`📊 Token Usage Summary:`);
      console.log(`   Prompt: ${metadata.promptTokens.toLocaleString()}`);
      console.log(`   Completion: ${metadata.completionTokens.toLocaleString()}`);
      console.log(`   Total: ${metadata.totalTokens.toLocaleString()}`);

      return {
        success: true,
        adCopy: result,
        metadata: metadata
      };

    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      throw new Error(`OpenAI ad copy generation failed: ${error.message}`);
    }
  }

  /**
   * Build the prompt for ad copy generation
   * @private
   */
  buildAdCopyPrompt(params) {
    const {
      description,
      targetAudience,
      industry,
      visualDescription,
      imageDescription,
      tone,
      copywritingStyle,
      valueProposition,
      callToAction,
      competitorDifferentiators,
      urgencyFactor
    } = params;

    // ENHANCED: Use imageDescription for better copy-image coherence
    const visualContext = imageDescription || visualDescription || 'a professional business scene';

    // Build structured, optimized prompt with clear sections
    let prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUSINESS CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product/Service: ${description}
Target Audience: ${targetAudience}
Industry: ${industry}
Value Proposition: ${valueProposition || 'Help businesses save time and improve efficiency'}
Tone Requirement: ${tone}
CTA Button: ${callToAction}
${competitorDifferentiators ? `Key Differentiators: ${competitorDifferentiators}` : ''}
${urgencyFactor ? `Urgency Factor: ${urgencyFactor}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET AUDIENCE PAIN POINTS - Address These
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.getAudiencePainPoints(targetAudience, industry)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDUSTRY-SPECIFIC COPYWRITING GUIDANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.getIndustrySpecificCopyGuidance(industry)}`;

    // Get copywriting style instructions if not default
    if (copywritingStyle && copywritingStyle !== 'default') {
      const styleInstructions = this.getCopywritingStyleInstructions(copywritingStyle);
      prompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 COPYWRITING STYLE TO EMULATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styleInstructions}

⚡ CRITICAL: Apply this legendary copywriter's style throughout ALL copy elements - headline, description, primary text. Don't just reference it, EMBODY it completely.`;
    }

    prompt += `

**ENHANCED REQUIREMENTS for Maximum Ad Performance**:

1. **Headline Mastery** (40 characters max):
   - Use power words that trigger curiosity, fear, or desire
   - Lead with a number when possible ("3 Ways...", "247 Calls...")
   - Ask a provocative question that targets pain points
   - Make a bold, specific claim or promise
   - Create a curiosity gap (make them want to learn more)
   - Examples of high-performing patterns:
     * "How [Target Audience] [Achieve Desire] Without [Common Objection]"
     * "[Number] [Benefit] That [Result] in [Timeframe]"
     * "The [Adjective] Way to [Benefit] (Even If [Objection])"
     * "Warning: [Consequence of Not Acting]"
   - Test against: Does it stop the scroll? Does it promise value?

2. **Description Excellence** (30 characters max):
   - Focus on the PRIMARY benefit or transformation
   - Use actionable language
   - Amplify the headline's promise
   - Examples: "No More Missed Calls", "24/7 Availability", "Boost Revenue Now"
   - Make it work WITH the headline (not repeat it)

3. **Hook-First Approach (CRITICAL)**:
   - START with a scroll-stopping hook (question, stat, bold claim)
   - DO NOT start by describing the image or saying "Picture this..."
   - The hook must target a PAIN POINT or DESIRE of ${targetAudience}
   - Make it SPECIFIC and RELATABLE to their daily struggle
   - Examples: "Missing 30% of sales calls?", "$5K/month wasted on [problem]?", "What if you never missed a lead again?"

4. **Primary Text Mastery** (125-150 words):
   - **Opening Hook (CRITICAL)**: Start with a POWERFUL attention-grabber:
     * Provocative question: "Tired of [pain point]?"
     * Shocking stat: "67% of [audience] are losing [specific loss]"
     * Bold claim: "What if you could [desired outcome] in [timeframe]?"
     * Challenge belief: "Everyone thinks [X], but here's why they're wrong..."
     DO NOT describe the image. DO NOT say "Picture this" or "Imagine seeing..."
   - **Connection**: Bridge from hook to solution
   - **3-4 Key Benefits**: Specific, measurable, relatable to ${targetAudience}
   - **Social Proof**: Brief credibility element (numbers, testimonials, authority)
   - **Urgency/Scarcity**: Create FOMO or time-sensitive reason to act
   - **Clear CTA**: Direct action step that feels natural
   - **Strategic Emojis**: 3-5 emojis max, used to enhance readability and emotion
   - **Line Breaks**: Use \\n\\n for paragraph breaks to improve scannability

5. **Emotional Resonance**:
   - Match the mood of the image (if celebratory, be energetic; if serious, be trustworthy)
   - Speak to specific pain points of ${targetAudience}
   - Use power words: transform, discover, proven, guaranteed, exclusive, limited

6. **Psychological Triggers**:
   - Use at least 2 of: scarcity, social proof, authority, reciprocity, commitment
   - Make it feel personal and conversational

7. **Brand Voice Consistency**:
   - ${tone} throughout
   - Avoid corporate jargon unless industry-appropriate
   - Sound human, not robotic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTION CHECKLIST - Verify Before Submitting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before you finalize your response, double-check:
☑ Headline is ≤40 characters (count them!)
☑ Description is ≤30 characters (count them!)
☑ Primary text is 125-150 words (count them!)
☑ Emojis only at beginning of lines/bullets (2-4 total in primary text)
☑ Primary text has 4-5 line breaks (\\n\\n) for mobile scannability
☑ Alternative headlines use DIFFERENT psychological triggers (not just word swaps)
☑ PRIMARY TEXT STARTS WITH POWERFUL HOOK (NOT image description!)
☑ Hook targets pain point or desire of ${targetAudience}
☑ Power words included (discover, proven, transform, guaranteed, secret, etc.)
☑ Tone matches: ${tone}
☑ Industry guidance applied: ${industry}
☑ Target audience pain points addressed: ${targetAudience}

Generate the JSON output now. Remember: The copy and image must work together to tell ONE cohesive story that stops the scroll and drives action.`;

    return prompt;
  }

  /**
   * Generate multiple headline variations for A/B testing
   * @param {object} params
   * @returns {Promise<array>} - Array of headline variations
   */
  async generateHeadlineVariations(params) {
    this.initialize(); // Ensure API is initialized

    const { description, targetAudience, count = 5 } = params;

    try {
      const prompt = `Generate ${count} different Facebook ad headline variations for:
Product/Service: ${description}
Target Audience: ${targetAudience}

Each headline must:
- Be 40 characters or less
- Use different angles (benefit, curiosity, social proof, urgency, transformation)
- Include strategic emoji use
- Be immediately attention-grabbing

Return as JSON array: ["headline1", "headline2", ...]`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06', // FIXED: Was 'gpt-5-2025-08-07' which doesn't exist yet
        messages: [
          { role: 'system', content: 'You are an expert copywriter creating high-converting Facebook ad headlines.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result.headlines || [];

    } catch (error) {
      console.error('Error generating headline variations:', error);
      throw error;
    }
  }

  /**
   * Generate optimized image generation prompt from a simple idea
   * Based on Gemini 2.5 Flash best practices guide
   * @param {object} params - { idea, industry, style, aspectRatio, colorPalette, apiKey }
   * @returns {Promise<object>} - Generated prompt and metadata
   */
  async generateImagePrompt(params) {
    this.initialize(params.apiKey);

    const {
      idea,
      industry,
      style = 'Professional UGC',
      aspectRatio = 'Square (1:1)',
      colorPalette = 'Bold professional colors'
    } = params;

    try {
      console.log('🎨 Generating optimized image prompt from idea...');

      const systemPrompt = `You are an expert prompt engineer specializing in AI image generation for Facebook ads, specifically for Gemini 2.5 Flash (Imagen 3).

Your expertise is based on proven best practices:
- Describe scenes narratively, not as keyword lists
- Include 5 essential elements: Subject, Environment, Composition, Style & Aesthetic, Technical Details
- Add authentic imperfections for realism (skin texture, environmental clutter, natural lighting)
- Use bold contrasting colors for Facebook feed visibility
- Specify camera equipment for photorealism
- Create UGC-style or Professional B2B aesthetics
- Optimize for mobile viewing (focal point in upper 2/3)

Return a JSON object with:
{
  "generatedPrompt": "Complete narrative prompt (200-400 words)",
  "style": "Detected/assigned style (UGC, Professional, Product-focused, etc.)",
  "suggestedColors": "Color palette suggestion",
  "aspectRatio": "Best aspect ratio for this concept",
  "promptType": "Template category (e.g., Professional Portrait, Dashboard Showcase, etc.)"
}`;

      const userPrompt = `Create an optimized Gemini 2.5 Flash image generation prompt for a Facebook ad based on this idea:

**Simple Idea**: ${idea}

**Industry**: ${industry || 'General Business'}
**Preferred Style**: ${style}
**Aspect Ratio**: ${aspectRatio}
**Color Preference**: ${colorPalette}

Generate a detailed, narrative prompt following these requirements:

1. **Subject Description**: Detailed person/object with specific age, appearance, clothing, action
2. **Environment**: Location, time of day, atmospheric conditions, setting context
3. **Composition**: Camera angle, framing, perspective, focal length
4. **Style & Aesthetic**: Mood, realism level, photography type (UGC/Professional/etc.)
5. **Technical Details**: Camera specs, lighting quality, authentic imperfections

**Critical Elements to Include**:
- Natural imperfections (visible pores, slight blemishes, environmental clutter, realistic wear)
- Specific lighting description (direction, quality, mixed sources)
- Bold contrasting colors optimized for Facebook feed
- Camera equipment specs (Canon EOS R5, iPhone 14 Pro, etc.)
- Authentic details (coffee mug, papers, cables visible, natural workspace)
- Mobile-optimized composition (focal point in upper 2/3)

**Style Guidelines**:
- If UGC style: Use smartphone camera specs, candid moments, natural lighting imperfections
- If Professional: Use DSLR specs, controlled lighting, modern office settings
- If Product-focused: Clean backgrounds, vibrant UI colors, minimal professional clutter

Write the prompt as a flowing narrative paragraph, NOT as bullet points. Make it 200-400 words of descriptive storytelling that Gemini can visualize perfectly.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0].message.content;
      console.log('📝 Prompt response length:', responseContent?.length || 0);

      let result;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('❌ JSON Parse Error in prompt generation:', parseError.message);
        console.error('📄 Response content:', responseContent?.substring(0, 500));
        throw new Error(`Failed to parse prompt response: ${parseError.message}`);
      }

      console.log('✅ Image prompt generation complete');

      return {
        success: true,
        prompt: result,
        metadata: {
          model: completion.model || 'gpt-4o-2024-08-06',
          timestamp: new Date().toISOString(),
          tokensUsed: completion.usage.total_tokens,
          originalIdea: idea
        }
      };

    } catch (error) {
      console.error('❌ Prompt generation error:', error);
      throw new Error(`Image prompt generation failed: ${error.message}`);
    }
  }

  /**
   * Generate creative advertising angles for a business
   * Uses advanced advertising psychology and proven frameworks
   * @param {object} params - { businessName, businessDescription, industry, targetAudience, currentApproach, apiKey }
   * @returns {Promise<object>} - Generated angles array with metadata
   */
  async generateAdAngles(params) {
    this.initialize(params.apiKey);

    const {
      businessName,
      businessDescription,
      industry,
      targetAudience,
      currentApproach
    } = params;

    try {
      console.log('📐 Generating creative ad angles...');

      const systemPrompt = `You are an elite advertising strategist and creative director with 20+ years of experience in B2B, SaaS, and service-based business marketing. You specialize in discovering unconventional, high-performing ad angles that competitors haven't explored.

Your expertise includes:
- Advanced consumer psychology (Cialdini's principles, Kahneman's behavioral economics)
- Proven copywriting frameworks (AIDA, PAS, BAB, 4Ps, Before-After-Bridge)
- Emotional triggers and cognitive biases
- Industry-specific positioning strategies
- Storytelling and narrative psychology
- Direct response advertising principles

You MUST generate creative, specific, actionable angles—not generic advice. Each angle should be distinctly different from the others and grounded in proven psychological principles.

Return a JSON object with this exact structure:
{
  "angles": [
    {
      "angleName": "Short, catchy name for this angle",
      "angleDescription": "2-3 sentences explaining the strategy and how to execute it",
      "whyItWorks": "2-3 sentences explaining the psychology and why this resonates with the target audience",
      "targetEmotion": "Primary emotion (Fear, Desire, Trust, Curiosity, Urgency, Belonging, Status, Relief, Pride, or Anger)",
      "exampleHeadline": "A specific headline example using this angle for THIS business",
      "visualStyle": "Recommended visual approach (e.g., 'Professional team collaboration', 'Customer success story', 'Product UI showcase')",
      "copyFramework": "The copywriting framework this uses (AIDA, PAS, BAB, 4Ps, etc.)"
    }
  ],
  "industryInsights": "2-3 sentences of strategic insights specific to this industry",
  "competitiveGaps": "Areas where competitors are likely missing opportunities"
}`;

      const userPrompt = `Generate 8-10 unique, creative advertising angles for this business:

**Business Name**: ${businessName}

**Business Description**: ${businessDescription}

**Industry**: ${industry || 'General Business Services'}

**Target Audience**: ${targetAudience || 'Business decision-makers'}

${currentApproach ? `**Current Marketing Approach**: ${currentApproach}` : ''}

---

**CRITICAL REQUIREMENTS**:

1. **Diversity**: Each angle must be fundamentally different. Use various frameworks:
   - Problem-Solution (PAS: Problem-Agitate-Solve)
   - Transformation Story (Before-After-Bridge)
   - Social Proof & Authority
   - Contrarian/Against-the-Grain
   - Aspirational/Status
   - Urgency/Scarcity
   - Education/Value-First
   - Identity/Belonging
   - Fear-of-Missing-Out
   - Direct Challenge/Bold Claim

2. **Specificity**: Every angle must be tailored to THIS specific business and industry. Generic angles will be rejected.
   - Example headlines must reference the actual business offering
   - Psychology explanations must connect to the specific target audience
   - Visual styles must align with industry norms or strategically break them

3. **Psychological Depth**: Go beyond surface-level benefits
   - What deeper fears, desires, or aspirations drive this audience?
   - What cognitive biases can we leverage? (anchoring, social proof, scarcity, authority, etc.)
   - What identity does this audience want to project?

4. **Strategic Variety**: Cover multiple emotional triggers:
   - At least 2 angles focused on pain/fear (loss aversion)
   - At least 2 angles focused on gain/aspiration
   - At least 1 angle using social proof/authority
   - At least 1 contrarian or unexpected angle
   - Mix rational and emotional appeals

5. **Actionability**: Each angle should be immediately usable
   - Example headlines should be ready to test
   - Visual style should be clear enough to brief a designer
   - Copy framework should guide the ad text structure

6. **Competitive Differentiation**:
   ${currentApproach
     ? `Consider their current approach: "${currentApproach}". Suggest angles they're NOT currently using.`
     : 'Think about what competitors in this space typically do—and suggest fresh alternatives.'}

7. **Proven Frameworks**: Reference specific advertising frameworks:
   - **AIDA**: Attention → Interest → Desire → Action
   - **PAS**: Problem → Agitate → Solve
   - **BAB**: Before → After → Bridge
   - **4Ps**: Picture, Promise, Prove, Push
   - **FAB**: Features → Advantages → Benefits
   - **PASTOR**: Problem, Amplify, Story, Transformation, Offer, Response

**Industry-Specific Considerations**:
${this.getIndustrySpecificGuidance(industry)}

Generate angles that are insightful, creative, and grounded in proven direct response principles. Make each angle feel like a strategic breakthrough, not generic marketing advice.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9, // Higher creativity for diverse angles
        max_tokens: 4000, // Increased for complex JSON response
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0].message.content;
      console.log('📝 Angles response length:', responseContent?.length || 0);

      let result;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('❌ JSON Parse Error in angles generation:', parseError.message);
        console.error('📄 Response content (first 1000 chars):', responseContent?.substring(0, 1000));
        console.error('📄 Response content (last 500 chars):', responseContent?.substring(responseContent.length - 500));
        throw new Error(`Failed to parse angles response: ${parseError.message}. Response may have been truncated.`);
      }

      console.log(`✅ Generated ${result.angles?.length || 0} creative angles`);

      return {
        success: true,
        angles: result.angles,
        insights: {
          industryInsights: result.industryInsights,
          competitiveGaps: result.competitiveGaps
        },
        metadata: {
          model: completion.model || 'gpt-4o-2024-08-06',
          timestamp: new Date().toISOString(),
          tokensUsed: completion.usage.total_tokens,
          businessName,
          industry
        }
      };

    } catch (error) {
      console.error('❌ Angle generation error:', error);
      throw new Error(`Ad angle generation failed: ${error.message}`);
    }
  }

  /**
   * Get industry-specific guidance for angle generation
   * @private
   */
  getIndustrySpecificGuidance(industry) {
    const guidance = {
      'Phone Services': 'Focus on reliability, 24/7 availability, professional image, missed call anxiety, customer service quality',
      'Answering Services': 'Emphasize never missing opportunities, professional first impressions, cost vs. hiring receptionist, scalability',
      'B2B Software/SaaS': 'Highlight efficiency gains, ROI, integration capabilities, time savings, competitive advantages, scalability',
      'Healthcare': 'Trust, compliance, patient outcomes, operational efficiency, staff burnout reduction, quality of care',
      'Legal': 'Authority, expertise, case outcomes, peace of mind, risk mitigation, specialized knowledge',
      'Finance': 'Security, growth, peace of mind, expertise, regulatory compliance, wealth protection',
      'Home Services': 'Trust, quality, convenience, emergency response, value for money, warranties',
      'E-commerce': 'Product benefits, social proof, urgency, unique selling propositions, convenience, guarantees',
      'Education': 'Transformation, career outcomes, credibility, accessibility, ROI on learning investment'
    };

    return guidance[industry] || 'Focus on unique value propositions, pain point solutions, and differentiation from competitors';
  }

  /**
   * Get copywriting style-specific instructions
   * @private
   */
  getCopywritingStyleInstructions(style) {
    const styleGuides = {
      'alex_hormozi': `
**Alex Hormozi Style - Value-Stacking & Direct ROI:**
- Lead with a bold, specific claim or transformation
- Stack value: Show multiple benefits and bonuses
- Use "You get X, Y, and Z" format
- Emphasize ROI and tangible results with numbers
- Remove risk with guarantees
- Use comparison: "Most people do X, but here's why Y is better"
- Create urgency through scarcity (limited spots, time-sensitive)
- Be direct and no-fluff - cut to the value immediately
- Example: "Get 247 qualified leads in 30 days (or we work for free)"`,

      'dan_kennedy': `
**Dan Kennedy Style - No-BS Direct Response:**
- Start with a provocative question or challenge
- Be bold and slightly controversial
- Use "Who Else Wants..." or "How to..." headlines
- Long-form copy that builds case methodically
- Address skepticism head-on
- Use specifics over generalities (exact numbers, timeframes)
- Create enemies (us vs. them positioning)
- Include deadline-driven offers
- Example: "Who Else Wants To Fire Their Receptionist And Still Never Miss A Call?"`,

      'gary_halbert': `
**Gary Halbert Style - Empathy & Story-Driven:**
- Start with deep empathy for the reader's pain
- Tell a relatable story or scenario
- Use "imagine" or "picture this" language
- Make it personal and conversational
- Focus on emotional desires, not just logic
- Use simple, clear language (5th grade reading level)
- Build curiosity with "secrets" or "discoveries"
- Example: "If you've ever felt frustrated hanging up on potential customers..."`,

      'eugene_schwartz': `
**Eugene Schwartz Style - Desire & Sophistication:**
- Match market sophistication (aware/unaware of solutions)
- Amplify existing desires rather than create new ones
- Use mechanism: HOW your solution works uniquely
- Create a "big idea" or unique concept
- Mass desire channeled to your specific solution
- Use fascinations: tease benefits without revealing
- Example: "The 'Set It And Forget It' System That Answers Your Phone Better Than Any Human..."`,

      'david_ogilvy': `
**David Ogilvy Style - Research-Based Persuasion:**
- Lead with a factual, informative headline
- Use testimonials and specific results
- Be educational and authoritative
- Include facts, figures, and research
- Long copy that informs while persuading
- Professional, credible tone
- Use subheads to guide readers
- Example: "At 60 miles an hour, the loudest noise comes from your phone ringing..."`,

      'joe_sugarman': `
**Joe Sugarman Style - Psychological Triggers:**
- Use curiosity gaps throughout
- Apply consistency principle (small yes to big yes)
- Leverage authority and credibility indicators
- Create belonging (join others who already benefit)
- Use power words: discover, secret, guarantee, proven
- Smooth reading flow with short sentences
- Overcome objections preemptively
- Example: "There's a hidden reason 847 dentists never miss patient calls..."`,

      'russell_brunson': `
**Russell Brunson Style - Funnel & Story Selling:**
- Use the "Epiphany Bridge" (your discovery story)
- Follow "Hook, Story, Offer" structure
- Make villain = the old way of doing things
- Position your solution as the new opportunity
- Use "imagine" scenarios frequently
- Build desire through origin story
- Include social proof from others' results
- Example: "I discovered this by accident when our receptionist quit..."`,

      'frank_kern': `
**Frank Kern Style - Casual Authority & Results:**
- Be conversational and laid-back
- Use "real talk" and authenticity
- Lead with results, not process
- Include a "because" (psychological trigger)
- Use second person ("you") extensively
- Demonstrate expertise through casual teaching
- Include light humor or relatability
- Example: "Look, I'm going to be straight with you..."`,

      'todd_brown': `
**Todd Brown Style - Unique Mechanism & Big Ideas:**
- Lead with a "big idea" or unique mechanism
- Name your methodology or system
- Focus on ONE breakthrough concept
- Use proprietary language (give it a name)
- Position against alternatives
- Build intrigue around "how" it works
- Create a movement or new category
- Example: "Introducing: The 'Human-Free Reception System'..."`,

      'john_carlton': `
**John Carlton Style - Aggressive & Bold Claims:**
- Start with a shocking statement or bold claim
- Use swagger and confidence
- Challenge the reader directly
- Include warnings and "this isn't for everyone" copy
- Use street-smart, slightly edgy language
- Make bold promises backed by proof
- Create FOMO through exclusivity
- Example: "WARNING: This works so well, you might need to hire more staff..."`,

      'clayton_makepeace': `
**Clayton Makepeace Style - Fear & Urgency Master:**
- Start with a threat or warning
- Use fear-based motivation (what they'll lose)
- Create urgency through consequences of inaction
- Use "what if" scenarios
- Build up the problem before revealing solution
- Include specific timeframes and deadlines
- Use power words: crisis, danger, mistake, warning
- Example: "How Many Customers Did You Lose Today While Your Phone Rang Unanswered?"`
    };

    return styleGuides[style] || '';
  }

  /**
   * Enforce character limits and formatting standards on generated copy
   * CRITICAL: This ensures 100% compliance with Facebook ad requirements
   * @private
   * @param {object} adCopy - Generated ad copy object
   * @returns {object} - Enforced ad copy with corrections applied
   */
  enforceAdCopyStandards(adCopy) {
    const enforced = { ...adCopy };

    // HEADLINE: Hard limit at 40 characters
    if (enforced.headline && enforced.headline.length > 40) {
      console.warn(`⚠️ Headline exceeded 40 chars (${enforced.headline.length}), truncating...`);
      console.warn(`   Original: "${enforced.headline}"`);
      enforced.headline = enforced.headline.substring(0, 37) + '...';
      console.warn(`   Truncated: "${enforced.headline}"`);
    }

    // DESCRIPTION: Hard limit at 30 characters
    if (enforced.description && enforced.description.length > 30) {
      console.warn(`⚠️ Description exceeded 30 chars (${enforced.description.length}), truncating...`);
      console.warn(`   Original: "${enforced.description}"`);
      enforced.description = enforced.description.substring(0, 27) + '...';
      console.warn(`   Truncated: "${enforced.description}"`);
    }

    // PRIMARY TEXT: Ensure line breaks exist for readability
    if (enforced.primaryText && !enforced.primaryText.includes('\n')) {
      console.warn('⚠️ Primary text missing line breaks, adding structure...');
      // Add line breaks after sentences (simple heuristic)
      enforced.primaryText = enforced.primaryText
        .replace(/\. ([A-Z])/g, '.\n\n$1')
        .replace(/\? ([A-Z])/g, '?\n\n$1')
        .replace(/! ([A-Z])/g, '!\n\n$1');
    }

    // EMOJI VALIDATION: Count emojis and warn if excessive
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const headlineEmojis = (enforced.headline?.match(emojiRegex) || []).length;
    const primaryTextEmojis = (enforced.primaryText?.match(emojiRegex) || []).length;

    if (headlineEmojis > 1) {
      console.warn(`⚠️ Headline has ${headlineEmojis} emojis, optimal is 0-1`);
    }
    if (primaryTextEmojis > 5) {
      console.warn(`⚠️ Too many emojis in primary text (${primaryTextEmojis}), optimal is 2-4`);
    }

    // ALTERNATIVE HEADLINES: Ensure they're different and within limits
    if (enforced.alternativeHeadlines && Array.isArray(enforced.alternativeHeadlines)) {
      enforced.alternativeHeadlines = enforced.alternativeHeadlines
        .filter(h => h !== enforced.headline) // Remove duplicates of main headline
        .slice(0, 3) // Max 3 alternatives
        .map(h => {
          if (h.length > 40) {
            console.warn(`⚠️ Alternative headline exceeded 40 chars: "${h.substring(0, 50)}..."`);
            return h.substring(0, 37) + '...';
          }
          return h;
        });
    }

    // WORD COUNT VALIDATION: Check primary text word count
    const wordCount = enforced.primaryText?.split(/\s+/).length || 0;
    if (wordCount < 125 || wordCount > 150) {
      console.warn(`⚠️ Primary text word count (${wordCount}) outside optimal range (125-150 words)`);
    }

    return enforced;
  }

  /**
   * Get industry-specific copy guidance for better targeting
   * @private
   * @param {string} industry - Target industry
   * @returns {string} - Industry-specific copywriting guidance
   */
  getIndustrySpecificCopyGuidance(industry) {
    const guidance = {
      'Phone Services': `• Emphasize 24/7 reliability and "never miss a call" fear
• Use urgency: "Every missed call = lost revenue"
• Highlight ROI: "247% increase in captured leads"
• Professional image positioning: "Sound like a Fortune 500 company"`,

      'Answering Services': `• Pain point: Missed opportunities while busy
• Benefit language: "Professional first impression, every time"
• Cost comparison: "Fraction of hiring a receptionist"
• Scalability focus: "Grows with your business"`,

      'B2B Software/SaaS': `• Lead with efficiency gains and time savings
• Use specifics: "Save 15 hours/week" not "save time"
• Integration emphasis: "Works with your existing tools"
• ROI focus: "Pay for itself in 30 days"
• Trust signals: "Used by 10,000+ businesses"`,

      'Healthcare': `• Trust and compliance are critical (HIPAA, privacy)
• Patient outcomes over features
• Staff burnout reduction angle
• Quality of care improvement
• Use compassionate, professional tone`,

      'Legal': `• Authority positioning required
• Case outcomes and success rates
• Risk mitigation language
• Peace of mind emotional trigger
• Avoid over-promising (ethical constraints)`,

      'Finance': `• Security and trust are paramount
• Wealth growth/protection dual focus
• Regulatory compliance mentions
• Expert positioning essential
• Use conservative, professional tone`,

      'E-commerce': `• Social proof critical (reviews, testimonials)
• Urgency and scarcity work well
• Product-specific benefits (not generic)
• Guarantee and risk-reversal
• Fast shipping/convenience angles`
    };

    return guidance[industry] || `Focus on specific, measurable benefits for ${industry}. Use industry-appropriate language and avoid jargon that confuses your audience.`;
  }

  /**
   * Get audience pain points based on target audience and industry
   * @private
   * @param {string} audience - Target audience description
   * @param {string} industry - Industry context
   * @returns {string} - Audience-specific pain points
   */
  getAudiencePainPoints(audience, industry) {
    const audienceLower = audience.toLowerCase();

    if (audienceLower.includes('small business') || audienceLower.includes('entrepreneur')) {
      return `• Limited time and resources
• Wearing too many hats
• Competing with larger competitors
• Need to maximize ROI on every dollar
• Fear of making wrong investment decisions`;
    }

    if (audienceLower.includes('enterprise') || audienceLower.includes('corporate')) {
      return `• Scalability and reliability concerns
• Integration with existing systems
• Security and compliance requirements
• Need measurable ROI and reporting
• Change management challenges`;
    }

    if (audienceLower.includes('marketing') || audienceLower.includes('marketer')) {
      return `• Pressure to show ROI and metrics
• Limited budget, high expectations
• Need to prove campaign effectiveness
• Staying current with platform changes
• Attribution and tracking challenges`;
    }

    // Default pain points
    return `• Wasting time on inefficient processes
• Missing opportunities due to gaps in coverage
• Struggling to scale without proportional cost increases
• Difficulty measuring ROI on current solutions
• Frustration with complex or unreliable tools`;
  }

  /**
   * Extract JSON from text that may contain reasoning or markdown
   * Used for reasoning models (GPT-5, o1, etc.) that don't support response_format
   * @private
   * @param {string} text - Response text that may contain JSON
   * @returns {object} - Parsed JSON object
   */
  extractJSONFromText(text) {
    // Try direct parse first
    try {
      return JSON.parse(text);
    } catch (e) {
      // If direct parse fails, try to extract JSON from markdown code blocks
      console.log('🔍 Direct JSON parse failed, extracting from markdown...');
    }

    // Try to extract JSON from markdown code blocks (```json ... ```)
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      try {
        console.log('✓ Found JSON in markdown code block');
        return JSON.parse(jsonBlockMatch[1]);
      } catch (e) {
        console.error('❌ Failed to parse JSON from code block:', e.message);
      }
    }

    // Try to extract JSON from generic code blocks (``` ... ```)
    const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        console.log('✓ Found JSON in code block');
        return JSON.parse(codeBlockMatch[1]);
      } catch (e) {
        console.error('❌ Failed to parse JSON from code block:', e.message);
      }
    }

    // Try to find JSON object by looking for { ... }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        console.log('✓ Found JSON object in text');
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('❌ Failed to parse extracted JSON:', e.message);
      }
    }

    // If all else fails, throw error
    throw new Error('Could not extract valid JSON from response. Response may not contain JSON.');
  }

  /**
   * Validate ad copy against Facebook guidelines
   * @param {object} adCopy
   * @returns {object} validation results
   */
  validateAdCopy(adCopy) {
    const issues = [];
    const warnings = [];

    // Headline validation
    if (adCopy.headline && adCopy.headline.length > 40) {
      issues.push('Headline exceeds 40 characters (will be truncated on mobile)');
    }

    // Description validation
    if (adCopy.description && adCopy.description.length > 30) {
      warnings.push('Description exceeds recommended 30 characters');
    }

    // Primary text validation
    if (adCopy.primaryText) {
      const wordCount = adCopy.primaryText.split(/\s+/).length;
      if (wordCount < 50) {
        warnings.push('Primary text is quite short. Consider adding more value/benefits.');
      }
      if (wordCount > 250) {
        warnings.push('Primary text is quite long. Users may not read it all.');
      }

      // Check for all caps (Facebook guideline violation)
      const capsWords = adCopy.primaryText.split(/\s+/).filter(word =>
        word.length > 2 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)
      );
      if (capsWords.length > 2) {
        issues.push('Excessive use of all-caps words (violates Facebook guidelines)');
      }
    }

    // Emoji check
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (adCopy.primaryText && !emojiRegex.test(adCopy.primaryText)) {
      warnings.push('Consider adding emojis (increases CTR by 241%)');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      characterCounts: {
        headline: adCopy.headline?.length || 0,
        description: adCopy.description?.length || 0,
        primaryText: adCopy.primaryText?.length || 0,
      }
    };
  }
}

export default new OpenAIService();
