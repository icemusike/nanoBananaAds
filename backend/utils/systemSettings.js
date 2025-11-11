import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Get a system setting by key
 * @param {string} key - Setting key
 * @param {string} defaultValue - Default value if not found
 * @returns {Promise<string|null>}
 */
export async function getSystemSetting(key, defaultValue = null) {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key }
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error getting system setting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set a system setting
 * @param {string} key - Setting key
 * @param {string} value - Setting value
 * @param {string} category - Setting category (default: 'general')
 * @returns {Promise<object>}
 */
export async function setSystemSetting(key, value, category = 'general') {
  try {
    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: {
        value,
        category,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        category
      }
    });
    return setting;
  } catch (error) {
    console.error(`Error setting system setting ${key}:`, error);
    throw error;
  }
}

/**
 * Get all system settings by category
 * @param {string} category - Category name
 * @returns {Promise<Array>}
 */
export async function getSystemSettingsByCategory(category) {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: { category }
    });
    return settings;
  } catch (error) {
    console.error(`Error getting system settings for category ${category}:`, error);
    return [];
  }
}

/**
 * Get admin API keys (with fallback to environment variables)
 * @returns {Promise<{geminiApiKey: string|null, openaiApiKey: string|null}>}
 */
export async function getAdminApiKeys() {
  try {
    // Try to get from database first
    const geminiKey = await getSystemSetting('admin_gemini_api_key');
    const openaiKey = await getSystemSetting('admin_openai_api_key');

    // Fallback to environment variables if not in database
    return {
      geminiApiKey: geminiKey || process.env.GEMINI_API_KEY || null,
      openaiApiKey: openaiKey || process.env.OPENAI_API_KEY || null
    };
  } catch (error) {
    console.error('Error getting admin API keys:', error);
    // Final fallback to environment variables
    return {
      geminiApiKey: process.env.GEMINI_API_KEY || null,
      openaiApiKey: process.env.OPENAI_API_KEY || null
    };
  }
}

export default {
  getSystemSetting,
  setSystemSetting,
  getSystemSettingsByCategory,
  getAdminApiKeys
};
