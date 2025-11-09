/**
 * AdGenius AI - Feature Gate Component
 *
 * Conditionally render content based on license features
 */

import React from 'react';
import { useFeature } from '../hooks/useFeature';
import { useLicense } from '../context/LicenseContext';
import UpgradePrompt from './UpgradePrompt';

/**
 * Feature Gate - Show content only if user has feature access
 *
 * @param {string} feature - Required feature name
 * @param {React.ReactNode} children - Content to show if feature is available
 * @param {React.ReactNode} fallback - Optional custom fallback (default: UpgradePrompt)
 * @param {boolean} showUpgradePrompt - Whether to show upgrade prompt (default: true)
 *
 * @example
 * <FeatureGate feature="bulk_generation">
 *   <BulkGenerationUI />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  showUpgradePrompt = true
}) {
  const hasFeature = useFeature(feature);
  const { loading } = useLicense();

  // Show loading state
  if (loading) {
    return (
      <div className="feature-gate-loading">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // User has feature - show content
  if (hasFeature) {
    return <>{children}</>;
  }

  // User doesn't have feature - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt feature={feature} />;
  }

  return null;
}

export default FeatureGate;
