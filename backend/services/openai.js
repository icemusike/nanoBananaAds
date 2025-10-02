import OpenAI from 'openai';

/**
 * OpenAI Service for Ad Copy Generation
 * Generates Facebook ad copy: Headline, Description, and Primary Text
 */

class OpenAIService {
  constructor() {
    this.openai = null;
    this.apiKey = null;
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
   * Generate complete Facebook ad copy
   * @param {object} params - Parameters for ad copy generation (can include apiKey)
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
      callToAction = 'Learn More'
    } = params;

    try {
      console.log('✍️ Starting OpenAI ad copy generation...');
      if (imageDescription) {
        console.log('🎨 Using custom image description for copy context');
      }

      const prompt = this.buildAdCopyPrompt(params);

      // System message content
      const systemMessage = `You are an expert Facebook advertising copywriter specializing in B2B and service-based businesses. You create high-converting ad copy that:
- Speaks directly to the target audience's pain points
- Uses proven direct response copywriting techniques
- Includes strategic use of emojis (increases CTR by 241%)
- Balances professionalism with approachability
- Creates urgency and desire
- Matches the visual tone of the ad image
- Follows Facebook ad best practices (2024-2025)

Format your response as valid JSON with these exact keys:
{
  "headline": "Primary headline (max 40 characters, attention-grabbing)",
  "description": "Link description (max 30 characters, benefit-focused)",
  "primaryText": "Main ad copy (125-150 words, detailed with emojis and line breaks)",
  "callToAction": "CTA button text (clear action)",
  "alternativeHeadlines": ["2-3 alternative headline options"],
  "keyBenefits": ["3-5 key benefits highlighted"],
  "toneAnalysis": "Brief analysis of the tone used and why it works for this audience"
}`;

      // Log the complete request being sent to OpenAI
      console.log('\n' + '='.repeat(80));
      console.log('📤 OPENAI AD COPY GENERATION REQUEST');
      console.log('='.repeat(80));
      console.log('🔧 MODEL: gpt-4o-mini');
      console.log('🌡️  TEMPERATURE: 0.8');
      console.log('📊 MAX TOKENS: 2000');
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

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for reliability
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0].message.content;
      console.log('📝 Raw response length:', responseContent?.length || 0);

      let result;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 Response content:', responseContent?.substring(0, 500));
        throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
      }

      console.log('✅ OpenAI ad copy generation complete');

      return {
        success: true,
        adCopy: result,
        metadata: {
          model: completion.model || 'gpt-4o-mini',
          timestamp: new Date().toISOString(),
          tokensUsed: completion.usage.total_tokens
        }
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

    let prompt = `Create compelling Facebook ad copy for the following:

**Product/Service**: ${description}

**Target Audience**: ${targetAudience}

**Industry**: ${industry}

**Visual Context (CRITICAL - Copy must reference and complement this image)**: ${visualContext}

**Tone**: ${tone}

**Value Proposition**: ${valueProposition || 'Help businesses save time and improve efficiency'}

**Call to Action**: ${callToAction}
`;

    if (competitorDifferentiators) {
      prompt += `\n**Key Differentiators**: ${competitorDifferentiators}`;
    }

    if (urgencyFactor) {
      prompt += `\n**Urgency Factor**: ${urgencyFactor}`;
    }

    // Get copywriting style instructions if not default
    const styleInstructions = copywritingStyle && copywritingStyle !== 'default'
      ? `\n\n**🎯 COPYWRITING STYLE TO EMULATE**:\n${this.getCopywritingStyleInstructions(copywritingStyle)}\n\nIMPORTANT: Apply this legendary copywriter's techniques throughout your ad copy. Study their style and replicate their proven patterns.`
      : '';

    prompt += styleInstructions;

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

3. **Image-Copy Coherence (CRITICAL)**:
   - Reference visual elements from the image description in your copy
   - If the image shows people, mention the relatable situation they're in
   - If the image shows a product/dashboard, highlight what's visible
   - Create a seamless story between what viewers see and what they read
   - Example: If image shows "team celebrating," copy could start with "Imagine your team celebrating wins like this..."

4. **Primary Text Mastery** (125-150 words):
   - **Opening Hook**: Reference the visual scene or emotion shown in the image
   - **Connection**: Bridge from what they see to what they need
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

Generate the copy in valid JSON format. Remember: The copy and image must work together to tell ONE cohesive story that stops the scroll and drives action.`;

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
        model: 'gpt-5-2025-08-07',
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
   * Generate image using DALL-E 3
   * @param {string} prompt - Image generation prompt
   * @param {object} options - Generation options (can include apiKey)
   * @returns {Promise<object>} - Generated image data
   */
  async generateImage(prompt, options = {}) {
    this.initialize(options.apiKey); // Ensure API is initialized with optional key

    try {
      console.log('🎨 Starting DALL-E 3 image generation...');

      // Simplify prompt for DALL-E (max 4000 chars, but we'll keep it concise)
      const simplifiedPrompt = prompt.length > 1000
        ? this.simplifyPromptForDallE(prompt)
        : prompt;

      console.log('\n' + '='.repeat(80));
      console.log('📤 DALL-E 3 IMAGE GENERATION REQUEST');
      console.log('='.repeat(80));
      console.log('🔧 MODEL: dall-e-3');
      console.log('📐 SIZE:', options.size || '1024x1024');
      console.log('💎 QUALITY:', options.quality || 'hd');
      console.log('🎨 STYLE:', options.style || 'natural');
      console.log('─'.repeat(80));
      console.log('📝 PROMPT:');
      console.log('─'.repeat(80));
      console.log(simplifiedPrompt);
      console.log('─'.repeat(80));
      console.log('📏 Original prompt length:', prompt.length, 'characters');
      console.log('📏 Simplified prompt length:', simplifiedPrompt.length, 'characters');
      console.log('='.repeat(80) + '\n');

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: simplifiedPrompt,
        n: 1,
        size: options.size || '1024x1024', // square format for Facebook
        quality: 'hd',
        style: options.style || 'natural', // 'natural' or 'vivid'
      });

      console.log('✅ DALL-E 3 image generation complete');

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      // Download the image and convert to base64
      const axios = (await import('axios')).default;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');

      return {
        success: true,
        imageData: {
          mimeType: 'image/png',
          data: base64Image,
        },
        url: imageUrl,
        revisedPrompt: revisedPrompt,
        metadata: {
          model: 'dall-e-3',
          timestamp: new Date().toISOString(),
          originalPromptLength: prompt.length,
          simplifiedPromptLength: simplifiedPrompt.length,
        }
      };

    } catch (error) {
      console.error('❌ DALL-E 3 API Error:', error);
      throw new Error(`DALL-E 3 image generation failed: ${error.message}`);
    }
  }

  /**
   * Simplify a detailed prompt for DALL-E 3
   * @private
   */
  simplifyPromptForDallE(detailedPrompt) {
    // Extract key elements from the detailed prompt
    const lines = detailedPrompt.split('\n').filter(line => line.trim());

    // Take the first few sentences which usually contain the main description
    const mainDescription = lines.slice(0, 3).join(' ');

    // Look for key descriptors
    const hasPhotorealistic = detailedPrompt.includes('photorealistic') || detailedPrompt.includes('realistic');
    const hasProfessional = detailedPrompt.includes('professional');
    const hasModern = detailedPrompt.includes('modern');

    let simplified = mainDescription;

    if (hasPhotorealistic) simplified = 'Photorealistic ' + simplified;
    if (hasProfessional) simplified += ', professional quality';
    if (hasModern) simplified += ', modern aesthetic';

    // Ensure it ends properly
    if (!simplified.endsWith('.')) simplified += '.';

    // Add quality markers
    simplified += ' High-quality professional photography, detailed, sharp focus.';

    return simplified.substring(0, 1000); // DALL-E has a 4000 char limit, but shorter is often better
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
        model: 'gpt-4o-mini',
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
          model: completion.model || 'gpt-4o-mini',
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
        model: 'gpt-4o-mini',
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
          model: completion.model || 'gpt-4o-mini',
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
