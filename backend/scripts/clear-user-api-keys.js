import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * SECURITY FIX: Clear all API keys from user records
 *
 * This script removes all geminiApiKey and openaiApiKey values from user records.
 * Users should NOT have admin keys stored in their records.
 * The system will use admin default keys as fallback automatically.
 */
async function clearAllUserApiKeys() {
  try {
    console.log('🔒 Starting API key cleanup...');
    console.log('🔄 Clearing all user API keys from database...');

    // Update all users to have NULL API keys
    const result = await prisma.user.updateMany({
      data: {
        geminiApiKey: null,
        openaiApiKey: null
      }
    });

    console.log(`✅ Successfully cleared API keys from ${result.count} user(s)`);
    console.log('📋 Summary:');
    console.log('   - All user geminiApiKey fields set to NULL');
    console.log('   - All user openaiApiKey fields set to NULL');
    console.log('   - Users will now use admin default keys automatically');
    console.log('   - Users can still set their own custom keys if needed');
    console.log('\n✅ API key cleanup complete!');

  } catch (error) {
    console.error('❌ Error clearing API keys:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearAllUserApiKeys()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
