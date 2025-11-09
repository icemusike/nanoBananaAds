/**
 * AdGenius AI - License Badge Component
 *
 * Displays user's license tier as a badge
 */

import React from 'react';
import { useLicense } from '../context/LicenseContext';

const TIER_STYLES = {
  starter: {
    gradient: 'from-gray-500 to-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-900 dark:text-gray-100',
    label: 'Starter'
  },
  pro_unlimited: {
    gradient: 'from-blue-500 to-purple-600',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-900 dark:text-blue-100',
    label: 'Pro Unlimited'
  },
  elite_bundle: {
    gradient: 'from-purple-500 via-pink-500 to-yellow-500',
    bg: 'bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-yellow-900/30',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-900 dark:text-purple-100',
    label: 'Elite Bundle'
  }
};

/**
 * License Badge - Show user's tier as a badge
 */
export function LicenseBadge({ variant = 'default', showIcon = true, className = '' }) {
  const { tier, loading, hasLicense } = useLicense();

  if (loading) {
    return (
      <div className={`license-badge-loading ${className}`}>
        <div className="animate-pulse w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  if (!hasLicense) {
    return null;
  }

  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.starter;

  if (variant === 'compact') {
    return (
      <div className={`license-badge-compact ${className}`}>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border}`}>
          {showIcon && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {tierStyle.label}
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`license-badge-full ${className}`}>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${tierStyle.bg} ${tierStyle.border}`}>
          {showIcon && (
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${tierStyle.gradient} flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <div className={`text-sm font-semibold ${tierStyle.text}`}>
              {tierStyle.label}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Active License
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`license-badge ${className}`}>
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border}`}>
        {showIcon && (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {tierStyle.label}
      </span>
    </div>
  );
}

export default LicenseBadge;
