/**
 * AdGenius AI - License Configuration
 *
 * This file defines all license tiers, features, and access control rules
 */

// ============================================
// LICENSE TIERS
// ============================================

export const LICENSE_TIERS = {
  STARTER: 'starter',
  PRO_UNLIMITED: 'pro_unlimited',
  ELITE_BUNDLE: 'elite_bundle'
};

export const ADDON_TYPES = {
  TEMPLATE_LIBRARY: 'template_library',
  AGENCY_LICENSE: 'agency_license',
  RESELLER_RIGHTS: 'reseller_rights'
};

// ============================================
// LICENSE TIER CONFIGURATIONS
// ============================================

export const LICENSE_CONFIG = {
  [LICENSE_TIERS.STARTER]: {
    tier: LICENSE_TIERS.STARTER,
    name: 'Starter',
    price: 47,
    credits_monthly: 100, // Monthly credit limit
    features: {
      // Core features
      basic_templates: true,
      premium_templates: false,
      unlimited_credits: false,

      // Ad generation
      bulk_generation: false,
      custom_branding: false,

      // Commercial use
      commercial_use: false,

      // Agency features
      agency_features: false,
      client_accounts: false,
      white_label: false,

      // Reseller features
      reseller_rights: false,
      reseller_dashboard: false,
      custom_pricing: false,

      // AI Models
      ai_models: ['gemini-basic'],

      // Export formats
      export_formats: ['jpg', 'png'],

      // Limits
      max_projects: 5,
      max_brands: 3,
      max_templates_per_generation: 1,

      // Branding
      watermark: true,

      // Support
      support_level: 'standard',
      support_response_time: '48h'
    }
  },

  [LICENSE_TIERS.PRO_UNLIMITED]: {
    tier: LICENSE_TIERS.PRO_UNLIMITED,
    name: 'Pro Unlimited',
    price: 97,
    credits_monthly: null, // NULL = unlimited
    features: {
      // Core features
      basic_templates: true,
      premium_templates: false, // Requires addon
      unlimited_credits: true,

      // Ad generation
      bulk_generation: true,
      custom_branding: true,

      // Commercial use
      commercial_use: false, // Requires addon

      // Agency features
      agency_features: false, // Requires addon
      client_accounts: false, // Requires addon
      white_label: false, // Requires addon

      // Reseller features
      reseller_rights: false, // Requires addon
      reseller_dashboard: false, // Requires addon
      custom_pricing: false, // Requires addon

      // AI Models
      ai_models: ['gemini-2.5', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'dalle-3'],

      // Export formats
      export_formats: ['jpg', 'png', 'svg', 'pdf'],

      // Limits
      max_projects: null, // Unlimited
      max_brands: null, // Unlimited
      max_templates_per_generation: 5,

      // Branding
      watermark: false,

      // Support
      support_level: 'priority',
      support_response_time: '24h'
    }
  },

  [LICENSE_TIERS.ELITE_BUNDLE]: {
    tier: LICENSE_TIERS.ELITE_BUNDLE,
    name: 'Elite Bundle',
    price: 397,
    credits_monthly: null, // Unlimited
    features: {
      // Core features (ALL UNLOCKED)
      basic_templates: true,
      premium_templates: true,
      unlimited_credits: true,

      // Ad generation
      bulk_generation: true,
      custom_branding: true,

      // Commercial use
      commercial_use: true,

      // Agency features
      agency_features: true,
      client_accounts: true,
      white_label: true,

      // Reseller features
      reseller_rights: true,
      reseller_dashboard: true,
      custom_pricing: true,

      // AI Models
      ai_models: ['gemini-2.5', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'dalle-3'],

      // Export formats
      export_formats: ['jpg', 'png', 'svg', 'pdf'],

      // Limits
      max_projects: null, // Unlimited
      max_brands: null, // Unlimited
      max_templates_per_generation: 10,

      // Branding
      watermark: false,

      // Support
      support_level: 'vip',
      support_response_time: '12h'
    }
  }
};

// ============================================
// ADDON CONFIGURATIONS
// ============================================

export const ADDON_CONFIG = {
  [ADDON_TYPES.TEMPLATE_LIBRARY]: {
    addon_type: ADDON_TYPES.TEMPLATE_LIBRARY,
    name: 'Template Library',
    price: 127,
    requires: null, // No requirement - can be added to any license
    features: {
      premium_templates: true,
      template_count: 500,
      custom_template_builder: true,
      all_industries: true
    }
  },

  [ADDON_TYPES.AGENCY_LICENSE]: {
    addon_type: ADDON_TYPES.AGENCY_LICENSE,
    name: 'Agency License',
    price: 197,
    requires: LICENSE_TIERS.PRO_UNLIMITED, // Requires Pro Unlimited base
    features: {
      commercial_use: true,
      agency_features: true,
      client_accounts: true,
      white_label: true,
      agency_toolkit: true,
      client_reports: true,
      unlimited_clients: true
    }
  },

  [ADDON_TYPES.RESELLER_RIGHTS]: {
    addon_type: ADDON_TYPES.RESELLER_RIGHTS,
    name: 'Reseller Rights',
    price: 297,
    requires: ADDON_TYPES.AGENCY_LICENSE, // Requires Agency License addon
    features: {
      reseller_rights: true,
      reseller_dashboard: true,
      keep_100_percent_commission: true,
      custom_pricing: true,
      reseller_toolkit: true,
      sales_page_templates: true
    }
  }
};

// ============================================
// CREDIT COSTS PER ACTION
// ============================================

export const CREDIT_COSTS = {
  generate_ad: 1,
  generate_prompt: 1,
  generate_angle: 1,
  bulk_generate: 5, // Per batch
  export_ad: 0, // Free (already consumed credit on generation)
  reference_image_upload: 2 // Reference image adds cost
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get license configuration by tier
 */
export function getLicenseConfig(licenseTier) {
  const config = LICENSE_CONFIG[licenseTier];
  if (!config) {
    throw new Error(`Invalid license tier: ${licenseTier}`);
  }
  return config;
}

/**
 * Get addon configuration by type
 */
export function getAddonConfig(addonType) {
  const config = ADDON_CONFIG[addonType];
  if (!config) {
    throw new Error(`Invalid addon type: ${addonType}`);
  }
  return config;
}

/**
 * Build complete feature set from base license + addons
 */
export function buildFeatureSet(licenseTier, addonTypes = []) {
  // Start with base license features
  const baseConfig = getLicenseConfig(licenseTier);
  let features = { ...baseConfig.features };

  // Apply addon features
  for (const addonType of addonTypes) {
    const addonConfig = getAddonConfig(addonType);
    features = {
      ...features,
      ...addonConfig.features
    };
  }

  return features;
}

/**
 * Check if license tier can add specific addon
 */
export function canAddAddon(licenseTier, addonType, existingAddons = []) {
  const addonConfig = getAddonConfig(addonType);

  // Check if addon requires specific tier
  if (addonConfig.requires && typeof addonConfig.requires === 'string' && addonConfig.requires !== licenseTier) {
    // Check if requirement is a tier
    if (Object.values(LICENSE_TIERS).includes(addonConfig.requires)) {
      return {
        can_add: false,
        reason: `Requires ${addonConfig.requires} license tier`
      };
    }

    // Check if requirement is another addon
    if (!existingAddons.includes(addonConfig.requires)) {
      return {
        can_add: false,
        reason: `Requires ${addonConfig.requires} addon first`
      };
    }
  }

  return { can_add: true };
}

/**
 * Get credit cost for an action
 */
export function getCreditCost(actionType, metadata = {}) {
  let cost = CREDIT_COSTS[actionType] || 1;

  // Add extra cost for reference image
  if (metadata.hasReferenceImage) {
    cost += CREDIT_COSTS.reference_image_upload;
  }

  return cost;
}

/**
 * Check if feature is available in license
 */
export function hasFeature(features, featureName) {
  // Handle nested feature checks (e.g., "ai_models.gpt-4")
  if (featureName.includes('.')) {
    const [key, value] = featureName.split('.');
    const featureValue = features[key];

    if (Array.isArray(featureValue)) {
      return featureValue.includes(value);
    }

    return false;
  }

  return !!features[featureName];
}

/**
 * Get human-readable tier name
 */
export function getTierName(licenseTier) {
  const config = getLicenseConfig(licenseTier);
  return config.name;
}

/**
 * Get all available features for a license
 */
export function getAllFeatures(licenseTier, addonTypes = []) {
  const features = buildFeatureSet(licenseTier, addonTypes);
  return Object.keys(features).filter(key => features[key] === true);
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  LICENSE_TIERS,
  ADDON_TYPES,
  LICENSE_CONFIG,
  ADDON_CONFIG,
  CREDIT_COSTS,
  getLicenseConfig,
  getAddonConfig,
  buildFeatureSet,
  canAddAddon,
  getCreditCost,
  hasFeature,
  getTierName,
  getAllFeatures
};
