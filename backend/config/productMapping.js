/**
 * JVZoo Product ID Mapping
 * Maps JVZoo product IDs to internal license tiers and types
 */

export const PRODUCT_MAPPING = {
  // Frontend Offer
  '427079': {
    id: 'frontend',
    name: 'AdGenius AI Frontend',
    tier: 'frontend',
    credits: 500, // Monthly credits
    features: ['basic_templates', 'watermark']
  },

  // OTO 1: Pro License (Main + Downsell)
  '427343': {
    id: 'pro_license',
    name: 'Pro License (Unlimited)',
    tier: 'pro',
    credits: -1, // Unlimited
    features: ['unlimited_credits', 'bulk_generation', 'no_watermark', 'all_ai_models']
  },
  '427345': {
    id: 'pro_license',
    name: 'Pro License (Unlimited) - DS',
    tier: 'pro',
    credits: -1, // Unlimited
    features: ['unlimited_credits', 'bulk_generation', 'no_watermark', 'all_ai_models']
  },

  // OTO 2: Templates License (Main + Downsell)
  '427347': {
    id: 'templates_license',
    name: 'Templates Club',
    tier: 'templates',
    credits: 0, // Just adds access
    features: ['templates_library', 'custom_builder']
  },
  '427349': {
    id: 'templates_license',
    name: 'Templates Club - DS',
    tier: 'templates',
    credits: 0,
    features: ['templates_library', 'custom_builder']
  },

  // OTO 3: Agency License (Main + Downsell)
  '427351': {
    id: 'agency_license',
    name: 'Agency License',
    tier: 'agency',
    credits: 0, // Just adds features
    features: ['agency_features', 'client_accounts', 'white_label']
  },
  '427353': {
    id: 'agency_license',
    name: 'Agency License - DS',
    tier: 'agency',
    credits: 0,
    features: ['agency_features', 'client_accounts', 'white_label']
  },

  // OTO 4: Reseller License (Main + Downsell)
  '427355': {
    id: 'reseller_license',
    name: 'Reseller License',
    tier: 'reseller',
    credits: 0,
    features: ['reseller_rights']
  },
  '427359': {
    id: 'reseller_license',
    name: 'Reseller License - DS',
    tier: 'reseller',
    credits: 0,
    features: ['reseller_rights']
  },

  // Bundle Offers
  '427357': {
    id: 'fastpass_bundle',
    name: 'FastPass Bundle',
    tier: 'elite',
    credits: -1,
    features: ['all_features', 'unlimited_credits']
  },
  '428667': {
    id: 'elite_bundle',
    name: 'Elite Bundle Deal',
    tier: 'elite',
    credits: -1,
    features: ['all_features', 'unlimited_credits']
  }
};

export function getProductDetails(jvzooProductId) {
  return PRODUCT_MAPPING[jvzooProductId] || {
    id: 'unknown',
    name: 'Unknown Product',
    tier: 'free',
    credits: 50, // Free tier default
    features: []
  };
}

export function getInternalProductId(jvzooProductId) {
  return getProductDetails(jvzooProductId).id;
}

