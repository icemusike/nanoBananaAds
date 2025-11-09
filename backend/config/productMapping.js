/**
 * AdGenius AI - JVZoo Product Mapping
 *
 * This file maps JVZoo product IDs to internal license tiers and addons
 *
 * IMPORTANT: Update these product IDs with your actual JVZoo product IDs
 * before going live!
 */

import { LICENSE_TIERS, ADDON_TYPES } from './licenseConfig.js';

// ============================================
// JVZOO PRODUCT MAPPING
// ============================================

/**
 * Maps JVZoo product IDs to license tiers and addons
 *
 * Product types:
 * - license: Creates a new license (or upgrades existing)
 * - addon: Adds feature addon to existing license
 */
export const JVZOO_PRODUCT_MAPPING = {
  // ============================================
  // FRONT END - STARTER LICENSE
  // ============================================
  '427079': {
    type: 'license',
    tier: LICENSE_TIERS.STARTER,
    name: 'AdGenius AI Starter',
    price: 47,
    credits_monthly: 100,
    description: '100 credits/month, basic features'
  },

  // ============================================
  // OTO 1 - PRO UNLIMITED
  // ============================================
  '427343': {
    type: 'upgrade', // Upgrades existing license
    tier: LICENSE_TIERS.PRO_UNLIMITED,
    name: 'AdGenius AI Pro Unlimited',
    price: 97,
    credits_monthly: null, // Unlimited
    description: 'Unlimited credits, all AI models, bulk generation'
  },

  // OTO 1 Downsell - Pro Lite
  '427345': {
    type: 'upgrade',
    tier: LICENSE_TIERS.PRO_UNLIMITED,
    name: 'AdGenius AI Pro Lite',
    price: 67,
    credits_monthly: null,
    description: 'Pro Unlimited at discounted price'
  },

  // ============================================
  // OTO 2 - TEMPLATE LIBRARY ADDON
  // ============================================
  '427347': {
    type: 'addon',
    addon_type: ADDON_TYPES.TEMPLATE_LIBRARY,
    name: 'Complete Template Library',
    price: 127,
    requires: null, // Can be added to any license
    description: '500+ premium templates, all industries'
  },

  // OTO 2 Downsell - Template Pack DS
  '427349': {
    type: 'addon',
    addon_type: ADDON_TYPES.TEMPLATE_LIBRARY,
    name: 'Top 10 Industries Template Pack',
    price: 67,
    requires: null,
    description: 'Template library at discounted price'
  },

  // ============================================
  // OTO 3 - AGENCY LICENSE ADDON
  // ============================================
  '427351': {
    type: 'addon',
    addon_type: ADDON_TYPES.AGENCY_LICENSE,
    name: 'Agency License',
    price: 197,
    requires: LICENSE_TIERS.PRO_UNLIMITED, // Requires Pro Unlimited
    description: 'Commercial use, client accounts, white label'
  },

  // OTO 3 Downsell - Agency DS
  '427353': {
    type: 'addon',
    addon_type: ADDON_TYPES.AGENCY_LICENSE,
    name: 'Basic Agency License',
    price: 127,
    requires: LICENSE_TIERS.PRO_UNLIMITED,
    description: 'Agency license at discounted price'
  },

  // ============================================
  // OTO 4 - RESELLER RIGHTS ADDON
  // ============================================
  '427355': {
    type: 'addon',
    addon_type: ADDON_TYPES.RESELLER_RIGHTS,
    name: 'Reseller Rights',
    price: 297,
    requires: ADDON_TYPES.AGENCY_LICENSE, // Requires Agency License addon
    description: 'Resell rights, 100% commission, custom pricing'
  },

  // OTO 4 Downsell - Reseller Downsell
  '427359': {
    type: 'addon',
    addon_type: ADDON_TYPES.RESELLER_RIGHTS,
    name: 'Affiliate Pack',
    price: 197,
    requires: ADDON_TYPES.AGENCY_LICENSE,
    description: 'Reseller rights at discounted price'
  },

  // ============================================
  // ELITE BUNDLE - ALL-IN-ONE
  // ============================================
  '427357': {
    type: 'license',
    tier: LICENSE_TIERS.ELITE_BUNDLE,
    name: 'Elite Bundle',
    price: 397,
    credits_monthly: null, // Unlimited
    includes_addons: [
      ADDON_TYPES.TEMPLATE_LIBRARY,
      ADDON_TYPES.AGENCY_LICENSE,
      ADDON_TYPES.RESELLER_RIGHTS
    ],
    description: 'Everything included - Best value'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get product configuration by JVZoo product ID
 */
export function getProductConfig(jvzooProductId) {
  const config = JVZOO_PRODUCT_MAPPING[jvzooProductId];

  if (!config) {
    console.warn(`Unknown JVZoo product ID: ${jvzooProductId}`);
    return null;
  }

  return config;
}

/**
 * Check if product is a license (creates/upgrades license)
 */
export function isLicenseProduct(jvzooProductId) {
  const config = getProductConfig(jvzooProductId);
  return config && (config.type === 'license' || config.type === 'upgrade');
}

/**
 * Check if product is an addon
 */
export function isAddonProduct(jvzooProductId) {
  const config = getProductConfig(jvzooProductId);
  return config && config.type === 'addon';
}

/**
 * Check if product is the Elite Bundle
 */
export function isEliteBundle(jvzooProductId) {
  const config = getProductConfig(jvzooProductId);
  return config && config.tier === LICENSE_TIERS.ELITE_BUNDLE;
}

/**
 * Get all products for a specific type
 */
export function getProductsByType(type) {
  return Object.entries(JVZOO_PRODUCT_MAPPING)
    .filter(([_, config]) => config.type === type)
    .map(([productId, config]) => ({ productId, ...config }));
}

/**
 * Get main product IDs (excluding downsells)
 */
export function getMainProducts() {
  return Object.entries(JVZOO_PRODUCT_MAPPING)
    .filter(([productId, _]) => !productId.includes('DOWNSELL'))
    .map(([productId, config]) => ({ productId, ...config }));
}

/**
 * Map internal product ID to JVZoo product ID (reverse lookup)
 */
export function findJVZooProductId(tier, addonType = null) {
  for (const [productId, config] of Object.entries(JVZOO_PRODUCT_MAPPING)) {
    if (addonType) {
      if (config.addon_type === addonType) {
        return productId;
      }
    } else {
      if (config.tier === tier && config.type === 'license') {
        return productId;
      }
    }
  }
  return null;
}

/**
 * Get upgrade path for a product
 */
export function getUpgradePath(currentTier) {
  const upgrades = [];

  if (currentTier === LICENSE_TIERS.STARTER) {
    upgrades.push({
      productId: '427343',
      ...JVZOO_PRODUCT_MAPPING['427343']
    });
    upgrades.push({
      productId: '427357',
      ...JVZOO_PRODUCT_MAPPING['427357']
    });
  }

  return upgrades;
}

/**
 * Get available addons for a license tier
 */
export function getAvailableAddons(licenseTier, existingAddons = []) {
  const available = [];

  for (const [productId, config] of Object.entries(JVZOO_PRODUCT_MAPPING)) {
    if (config.type !== 'addon') continue;
    if (existingAddons.includes(config.addon_type)) continue;

    // Check requirements
    if (config.requires) {
      if (typeof config.requires === 'string' && config.requires !== licenseTier) {
        // Check if it's a tier requirement
        if (Object.values(LICENSE_TIERS).includes(config.requires)) {
          continue; // Doesn't meet tier requirement
        }

        // Check if it's an addon requirement
        if (!existingAddons.includes(config.requires)) {
          continue; // Doesn't have required addon
        }
      }
    }

    available.push({
      productId,
      ...config
    });
  }

  return available;
}

/**
 * Validate product purchase requirements
 */
export function validatePurchaseRequirements(
  jvzooProductId,
  userLicenseTier,
  userAddons = []
) {
  const config = getProductConfig(jvzooProductId);

  if (!config) {
    return {
      valid: false,
      reason: 'Unknown product'
    };
  }

  // Check addon requirements
  if (config.type === 'addon' && config.requires) {
    const requirement = config.requires;

    // Check if requires specific tier
    if (Object.values(LICENSE_TIERS).includes(requirement)) {
      if (userLicenseTier !== requirement) {
        return {
          valid: false,
          reason: `Requires ${requirement} license tier`
        };
      }
    }

    // Check if requires another addon
    if (Object.values(ADDON_TYPES).includes(requirement)) {
      if (!userAddons.includes(requirement)) {
        return {
          valid: false,
          reason: `Requires ${requirement} addon first`
        };
      }
    }
  }

  return { valid: true };
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  JVZOO_PRODUCT_MAPPING,
  getProductConfig,
  isLicenseProduct,
  isAddonProduct,
  isEliteBundle,
  getProductsByType,
  getMainProducts,
  findJVZooProductId,
  getUpgradePath,
  getAvailableAddons,
  validatePurchaseRequirements
};
