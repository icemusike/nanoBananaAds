/**
 * AdGenius AI - useCredits Hook
 *
 * Hook for managing and displaying user credits
 */

import { useState, useEffect } from 'react';
import { useLicense } from '../context/LicenseContext';

/**
 * Get user's credit information
 *
 * @returns {object} Credit information
 *
 * @example
 * const { credits, unlimited, remaining, loading } = useCredits();
 */
export function useCredits() {
  const { getCredits, hasUnlimitedCredits, license } = useLicense();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      setLoading(true);
      const creditsData = await getCredits();
      setCredits(creditsData);
      setLoading(false);
    }

    fetchCredits();
  }, [getCredits]);

  // Calculate from license if available
  const creditsTotal = license?.license?.creditsTotal;
  const creditsUsed = license?.license?.creditsUsed;
  const remaining = creditsTotal ? creditsTotal - creditsUsed : null;

  return {
    credits,
    unlimited: hasUnlimitedCredits,
    total: creditsTotal,
    used: creditsUsed,
    remaining,
    loading,
    hasCredits: hasUnlimitedCredits || (remaining && remaining > 0),
    percentage: creditsTotal ? (remaining / creditsTotal) * 100 : 100,
    resetDate: license?.license?.creditsResetDate
  };
}

export default useCredits;
