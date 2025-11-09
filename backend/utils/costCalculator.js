/**
 * Cost Calculator for API Usage Tracking
 *
 * Calculates estimated costs for OpenAI and Google Gemini API calls
 * Prices verified and updated as of October 2025
 * Sources: OpenAI API Pricing, Google AI Gemini API Pricing
 */

// OpenAI Pricing (per 1M tokens) - Updated October 2025
const OPENAI_PRICING = {
  // o1 model (reasoning model)
  'o1': {
    input: 15.00,    // $15 per 1M input tokens
    output: 60.00,   // $60 per 1M output tokens
    reasoning: 60.00 // $60 per 1M reasoning tokens (counted as output)
  },
  // GPT-5 family (released August 2025)
  'gpt-5-2025-08-07': {
    input: 1.25,     // $1.25 per 1M input tokens
    output: 10.00,   // $10 per 1M output tokens
    reasoning: 10.00 // $10 per 1M reasoning tokens (if applicable)
  },
  'gpt-5': {
    input: 1.25,     // $1.25 per 1M input tokens
    output: 10.00    // $10 per 1M output tokens
  },
  'gpt-5-mini': {
    input: 0.25,     // $0.25 per 1M input tokens
    output: 2.00     // $2.00 per 1M output tokens
  },
  'gpt-5-nano': {
    input: 0.05,     // $0.05 per 1M input tokens
    output: 0.40     // $0.40 per 1M output tokens
  },
  // GPT-4o family (most commonly used)
  'gpt-4o-2024-08-06': {
    input: 2.50,     // $2.50 per 1M input tokens (official pricing)
    output: 10.00    // $10.00 per 1M output tokens (official pricing)
  },
  'gpt-4o': {
    input: 2.50,     // $2.50 per 1M input tokens
    output: 10.00    // $10.00 per 1M output tokens
  },
  'gpt-4o-mini': {
    input: 0.15,     // $0.15 per 1M input tokens
    output: 0.60     // $0.60 per 1M output tokens
  },
  // Legacy GPT-4
  'gpt-4': {
    input: 30.00,    // $30 per 1M input tokens
    output: 60.00    // $60 per 1M output tokens
  }
};

// Google Gemini Pricing (per 1M tokens/images) - Updated October 2025
const GEMINI_PRICING = {
  'gemini-2.5-flash-image': {
    // Image generation pricing: $0.039 per image (1290 tokens × $30/1M)
    perImage: 0.039,      // $0.039 per image (official pricing)
    tokensPerImage: 1290, // Each image consumes 1290 tokens
    // Text tokens (same pricing as 2.5 Flash)
    input: 0.30,          // $0.30 per 1M input text tokens
    output: 2.50          // $2.50 per 1M output text tokens
  },
  'gemini-2.5-flash': {
    input: 0.30,     // $0.30 per 1M input tokens (updated pricing)
    output: 2.50     // $2.50 per 1M output tokens (updated pricing)
  },
  'gemini-1.5-pro': {
    input: 1.25,     // $1.25 per 1M input tokens
    output: 5.00     // $5.00 per 1M output tokens
  }
};

/**
 * Calculate cost for OpenAI API call
 * @param {object} usage - Token usage from OpenAI response
 * @param {string} model - Model identifier
 * @returns {number} - Estimated cost in USD
 */
export function calculateOpenAICost(usage, model = 'gpt-4o-2024-08-06') {
  if (!usage) return 0;

  const pricing = OPENAI_PRICING[model] || OPENAI_PRICING['gpt-4o-2024-08-06'];

  const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
  const outputTokens = usage.completion_tokens || usage.output_tokens || 0;
  const reasoningTokens = usage.completion_tokens_details?.reasoning_tokens || 0;

  // Calculate costs per million tokens
  const inputCost = (inputTokens / 1_000_000) * pricing.input;

  // For reasoning models (o1, GPT-5), reasoning tokens are counted as output tokens
  let outputCost;
  let reasoningCost = 0;

  if (reasoningTokens > 0 && pricing.reasoning) {
    // Reasoning tokens are billed separately at the reasoning rate
    const regularOutputTokens = outputTokens - reasoningTokens;
    outputCost = (regularOutputTokens / 1_000_000) * pricing.output;
    reasoningCost = (reasoningTokens / 1_000_000) * pricing.reasoning;
  } else {
    outputCost = (outputTokens / 1_000_000) * pricing.output;
  }

  const totalCost = inputCost + outputCost + reasoningCost;

  console.log(`💰 OpenAI Cost Calculation (${model}):`);
  console.log(`   Input tokens: ${inputTokens.toLocaleString()} @ $${pricing.input}/1M = $${inputCost.toFixed(6)}`);
  if (reasoningTokens > 0) {
    const regularOutputTokens = outputTokens - reasoningTokens;
    console.log(`   Regular output tokens: ${regularOutputTokens.toLocaleString()} @ $${pricing.output}/1M = $${outputCost.toFixed(6)}`);
    console.log(`   Reasoning tokens: ${reasoningTokens.toLocaleString()} @ $${pricing.reasoning}/1M = $${reasoningCost.toFixed(6)}`);
  } else {
    console.log(`   Output tokens: ${outputTokens.toLocaleString()} @ $${pricing.output}/1M = $${outputCost.toFixed(6)}`);
  }
  console.log(`   Total cost: $${totalCost.toFixed(6)}`);

  return totalCost;
}

/**
 * Calculate cost for Google Gemini API call
 * @param {object} usage - Token usage or image count
 * @param {string} model - Model identifier
 * @param {string} type - 'text' or 'image'
 * @returns {number} - Estimated cost in USD
 */
export function calculateGeminiCost(usage, model = 'gemini-2.5-flash-image', type = 'image') {
  if (!usage) return 0;

  const pricing = GEMINI_PRICING[model] || GEMINI_PRICING['gemini-2.5-flash-image'];

  if (type === 'image') {
    // Image generation - $0.039 per image (official pricing)
    const imageCount = usage.imageCount || 1;
    const cost = imageCount * pricing.perImage;

    console.log(`💰 Gemini Cost Calculation (${model} - Image):`);
    console.log(`   Images generated: ${imageCount} @ $${pricing.perImage.toFixed(3)}/image = $${cost.toFixed(6)}`);
    console.log(`   Each image = ${pricing.tokensPerImage} tokens @ $30/1M tokens`);

    return cost;
  } else {
    // Text generation
    const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
    const outputTokens = usage.completion_tokens || usage.output_tokens || 0;

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    const totalCost = inputCost + outputCost;

    console.log(`💰 Gemini Cost Calculation (${model} - Text):`);
    console.log(`   Input tokens: ${inputTokens.toLocaleString()} @ $${pricing.input}/1M = $${inputCost.toFixed(6)}`);
    console.log(`   Output tokens: ${outputTokens.toLocaleString()} @ $${pricing.output}/1M = $${outputCost.toFixed(6)}`);
    console.log(`   Total cost: $${totalCost.toFixed(6)}`);

    return totalCost;
  }
}

/**
 * Get pricing information for a model
 * @param {string} provider - 'openai' or 'gemini'
 * @param {string} model - Model identifier
 * @returns {object} - Pricing information
 */
export function getModelPricing(provider, model) {
  if (provider === 'openai') {
    return OPENAI_PRICING[model] || OPENAI_PRICING['gpt-4o-2024-08-06'];
  } else if (provider === 'gemini') {
    return GEMINI_PRICING[model] || GEMINI_PRICING['gemini-2.5-flash-image'];
  }
  return null;
}

/**
 * Format cost for display
 * @param {number} cost - Cost in USD
 * @returns {string} - Formatted cost string
 */
export function formatCost(cost) {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(6)}`; // Show 6 decimals for small costs
  if (cost < 1) return `$${cost.toFixed(4)}`;    // Show 4 decimals for cents
  return `$${cost.toFixed(2)}`;                   // Show 2 decimals for dollars
}

export default {
  calculateOpenAICost,
  calculateGeminiCost,
  getModelPricing,
  formatCost
};
