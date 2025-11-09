/**
 * AdGenius AI - Credit Meter Component
 *
 * Displays user's credit balance in the header/navbar
 */

import React from 'react';
import { useCredits } from '../hooks/useCredits';
import { useLicense } from '../context/LicenseContext';

/**
 * Credit Meter - Show credit balance and usage
 */
export function CreditMeter({ variant = 'full', className = '' }) {
  const { unlimited, total, remaining, percentage, loading, resetDate } = useCredits();
  const { tier } = useLicense();

  if (loading) {
    return (
      <div className={`credit-meter-loading ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Unlimited credits display
  if (unlimited) {
    return (
      <div className={`credit-meter unlimited ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
              ∞ Unlimited
            </span>
            {variant === 'full' && (
              <span className="text-xs text-purple-700 dark:text-purple-300">
                {tier === 'pro_unlimited' ? 'Pro' : 'Elite'} Plan
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Limited credits display
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;

  const colorClasses = isLow
    ? 'from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-200 dark:border-red-700'
    : isMedium
    ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-700'
    : 'from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 border-green-200 dark:border-green-700';

  const iconColor = isLow
    ? 'text-red-600 dark:text-red-400'
    : isMedium
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-green-600 dark:text-green-400';

  const textColor = isLow
    ? 'text-red-900 dark:text-red-100'
    : isMedium
    ? 'text-yellow-900 dark:text-yellow-100'
    : 'text-green-900 dark:text-green-100';

  const barColor = isLow
    ? 'bg-gradient-to-r from-red-500 to-orange-500'
    : isMedium
    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
    : 'bg-gradient-to-r from-green-500 to-blue-500';

  return (
    <div className={`credit-meter ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${colorClasses} rounded-lg border`}>
        <div className="flex-shrink-0">
          <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {variant === 'full' ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${textColor}`}>
                  {remaining} / {total}
                </span>
                <span className={`text-xs ${textColor}`}>
                  {Math.round(percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              {resetDate && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Resets: {new Date(resetDate).toLocaleDateString()}
                </div>
              )}
            </>
          ) : (
            <span className={`text-sm font-bold ${textColor}`}>
              {remaining} credits
            </span>
          )}
        </div>

        {isLow && (
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Upgrade
          </button>
        )}
      </div>

      {isLow && variant === 'full' && (
        <div className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400">
          Running low! Upgrade to Pro for unlimited credits
        </div>
      )}
    </div>
  );
}

export default CreditMeter;
