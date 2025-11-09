/**
 * AdGenius AI - useFeature Hook
 *
 * Simple hook to check if user has access to a specific feature
 */

import { useLicense } from '../context/LicenseContext';

/**
 * Check if user has access to a specific feature
 *
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - Whether user has access
 *
 * @example
 * const hasBulkGeneration = useFeature('bulk_generation');
 * const hasGPT4 = useFeature('ai_models.gpt-4');
 */
export function useFeature(featureName) {
  const { hasFeature, loading } = useLicense();

  if (loading) return false;

  return hasFeature(featureName);
}

export default useFeature;
