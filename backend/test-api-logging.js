import prisma from './utils/prisma.js';
import { calculateOpenAICost, calculateGeminiCost } from './utils/costCalculator.js';

async function testApiLogging() {
  console.log('🧪 Testing API usage logging...\n');

  try {
    const DEFAULT_USER_ID = 'default-user';

    // Test 1: Log a simulated Gemini image generation
    console.log('Test 1: Logging Gemini image generation...');
    const geminiCost = calculateGeminiCost(
      { imageCount: 1 },
      'gemini-2.5-flash-image',
      'image'
    );

    const geminiLog = await prisma.apiUsageLog.create({
      data: {
        userId: DEFAULT_USER_ID,
        provider: 'gemini',
        model: 'gemini-2.5-flash-image',
        feature: 'image_generation',
        requestTokens: null,
        responseTokens: null,
        totalTokens: null,
        estimatedCost: geminiCost,
        success: true,
        metadata: {
          test: true,
          promptLength: 500
        }
      }
    });
    console.log('✅ Gemini log created:', geminiLog.id);

    // Test 2: Log a simulated OpenAI copy generation with GPT-4o
    console.log('\nTest 2: Logging OpenAI (GPT-4o) copy generation...');
    const openaiUsage = {
      prompt_tokens: 1500,
      completion_tokens: 800,
      total_tokens: 2300
    };
    const openaiCost = calculateOpenAICost(openaiUsage, 'gpt-4o-2024-08-06');

    const openaiLog = await prisma.apiUsageLog.create({
      data: {
        userId: DEFAULT_USER_ID,
        provider: 'openai',
        model: 'gpt-4o-2024-08-06',
        feature: 'copy_generation',
        requestTokens: openaiUsage.prompt_tokens,
        responseTokens: openaiUsage.completion_tokens,
        totalTokens: openaiUsage.total_tokens,
        estimatedCost: openaiCost,
        success: true,
        metadata: {
          test: true,
          copywritingStyle: 'default'
        }
      }
    });
    console.log('✅ OpenAI log created:', openaiLog.id);

    // Test 3: Log a simulated GPT-5 copy generation with reasoning tokens
    console.log('\nTest 3: Logging OpenAI (GPT-5) copy generation with reasoning tokens...');
    const gpt5Usage = {
      prompt_tokens: 1000,
      completion_tokens: 1200,
      total_tokens: 2200,
      completion_tokens_details: {
        reasoning_tokens: 400
      }
    };
    const gpt5Cost = calculateOpenAICost(gpt5Usage, 'gpt-5-2025-08-07');

    const gpt5Log = await prisma.apiUsageLog.create({
      data: {
        userId: DEFAULT_USER_ID,
        provider: 'openai',
        model: 'gpt-5-2025-08-07',
        feature: 'copy_generation',
        requestTokens: gpt5Usage.prompt_tokens,
        responseTokens: gpt5Usage.completion_tokens,
        totalTokens: gpt5Usage.total_tokens,
        estimatedCost: gpt5Cost,
        success: true,
        metadata: {
          test: true,
          reasoningTokens: 400,
          copywritingStyle: 'legendary'
        }
      }
    });
    console.log('✅ GPT-5 log created:', gpt5Log.id);

    // Test 4: Verify we can query the logs
    console.log('\n📊 Querying API usage logs...');
    const logs = await prisma.apiUsageLog.findMany({
      where: {
        userId: DEFAULT_USER_ID,
        metadata: {
          path: ['test'],
          equals: true
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`\n✅ Found ${logs.length} test logs:`);
    logs.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.provider.toUpperCase()} - ${log.model}`);
      console.log(`   Feature: ${log.feature}`);
      console.log(`   Tokens: ${log.totalTokens || 'N/A'}`);
      console.log(`   Cost: $${log.estimatedCost?.toFixed(6) || '0.00'}`);
      console.log(`   Success: ${log.success ? '✅' : '❌'}`);
      console.log(`   Created: ${log.createdAt.toISOString()}`);
    });

    // Test 5: Calculate total costs
    console.log('\n💰 Total cost analysis:');
    const totalCost = logs.reduce((sum, log) => sum + (log.estimatedCost || 0), 0);
    const geminiTotal = logs.filter(l => l.provider === 'gemini').reduce((sum, log) => sum + (log.estimatedCost || 0), 0);
    const openaiTotal = logs.filter(l => l.provider === 'openai').reduce((sum, log) => sum + (log.estimatedCost || 0), 0);

    console.log(`   Total: $${totalCost.toFixed(6)}`);
    console.log(`   Gemini: $${geminiTotal.toFixed(6)}`);
    console.log(`   OpenAI: $${openaiTotal.toFixed(6)}`);

    console.log('\n✅ All tests passed! API logging is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testApiLogging();
