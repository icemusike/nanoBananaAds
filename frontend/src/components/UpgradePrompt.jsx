/**
 * AdGenius AI - Upgrade Prompt Component
 *
 * Shows when user tries to access a locked feature
 */

import React from 'react';
import { useLicense } from '../context/LicenseContext';

// Feature to upgrade path mapping
const FEATURE_UPGRADE_PATHS = {
  bulk_generation: {
    title: 'Bulk Generation',
    description: 'Generate multiple ads at once to save time',
    requiredTier: 'Pro Unlimited',
    price: '$97',
    benefits: [
      'Generate up to 10 ads simultaneously',
      'Unlimited credits',
      'All AI models (GPT-4, DALL-E 3, Gemini 2.5)',
      'No watermarks'
    ]
  },
  premium_templates: {
    title: 'Premium Templates',
    description: 'Access 500+ professional templates across all industries',
    requiredTier: 'Template Library Addon',
    price: '$127',
    benefits: [
      '500+ premium templates',
      'All industry categories',
      'Custom template builder',
      'Regular template updates'
    ]
  },
  commercial_use: {
    title: 'Commercial Rights',
    description: 'Use AdGenius AI for client work and commercial projects',
    requiredTier: 'Agency License',
    price: '$197',
    benefits: [
      'Commercial use rights',
      'Manage unlimited clients',
      'White label option',
      'Client dashboard access'
    ]
  },
  unlimited_credits: {
    title: 'Unlimited Credits',
    description: 'Never worry about running out of credits again',
    requiredTier: 'Pro Unlimited',
    price: '$97',
    benefits: [
      'Unlimited ad generation',
      'All AI models',
      'Bulk generation',
      'No watermarks'
    ]
  },
  'ai_models.gpt-4': {
    title: 'GPT-4 Access',
    description: 'Access the most advanced AI model for superior ad copy',
    requiredTier: 'Pro Unlimited',
    price: '$97',
    benefits: [
      'GPT-4 powered copy generation',
      'Unlimited credits',
      'All AI models',
      'Better ad quality'
    ]
  },
  'ai_models.dalle-3': {
    title: 'DALL-E 3 Access',
    description: 'Generate stunning images with OpenAI\'s DALL-E 3',
    requiredTier: 'Pro Unlimited',
    price: '$97',
    benefits: [
      'DALL-E 3 image generation',
      'Unlimited credits',
      'All export formats',
      'Professional quality images'
    ]
  }
};

/**
 * Upgrade Prompt - Encourage users to upgrade for locked features
 */
export function UpgradePrompt({ feature, compact = false }) {
  const { tier, isStarter } = useLicense();

  const upgradeInfo = FEATURE_UPGRADE_PATHS[feature] || {
    title: 'Premium Feature',
    description: 'This feature requires an upgrade',
    requiredTier: 'Pro Unlimited',
    price: '$97',
    benefits: ['Full access to all features']
  };

  if (compact) {
    return (
      <div className="upgrade-prompt-compact">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {upgradeInfo.title} - Premium Feature
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Upgrade to {upgradeInfo.requiredTier} to unlock
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upgrade-prompt">
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {upgradeInfo.title}
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {upgradeInfo.description}
        </p>

        {/* Current Tier Badge */}
        {tier && (
          <div className="text-center mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              Current: {tier === 'starter' ? 'Starter' : tier === 'pro_unlimited' ? 'Pro Unlimited' : 'Elite Bundle'}
            </span>
          </div>
        )}

        {/* Benefits */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            What you'll get:
          </h3>
          <ul className="space-y-2">
            {upgradeInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {upgradeInfo.price}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            One-time payment • Lifetime access
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Upgrade to {upgradeInfo.requiredTier}
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Go Back
          </button>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
          30-day money-back guarantee • Secure payment via JVZoo
        </p>
      </div>
    </div>
  );
}

export default UpgradePrompt;
