/**
 * AdGenius AI - License Context
 *
 * Global license state management for the entire application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LicenseContext = createContext(null);

export function LicenseProvider({ children }) {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch license from API
  const fetchLicense = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setLicense(null);
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API_URL}/api/license/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        console.log('🔍 LicenseContext: API Response:', {
          tier: data.license?.tier,
          features: data.features,
          licenses: data.licenses,
          fullData: data
        });
        setLicense(data);
      } else {
        setLicense(null);
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch license:', err);
      setLicense(null);
      setError(err.response?.data?.error || 'Failed to load license');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchLicense();
  }, [fetchLicense]);

  // Refresh license (useful after upgrades)
  const refreshLicense = useCallback(() => {
    return fetchLicense();
  }, [fetchLicense]);

  // Check if user has a specific feature
  const hasFeature = useCallback((featureName) => {
    if (!license?.features) return false;

    // Handle nested features (e.g., "ai_models.gpt-4")
    if (featureName.includes('.')) {
      const [key, value] = featureName.split('.');
      const featureValue = license.features[key];

      if (Array.isArray(featureValue)) {
        return featureValue.includes(value);
      }

      return false;
    }

    return !!license.features[featureName];
  }, [license]);

  // Check if user has an addon
  const hasAddon = useCallback((addonType) => {
    if (!license?.addons) return false;
    return license.addons.includes(addonType);
  }, [license]);

  // Get credits info
  const getCredits = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const { data } = await axios.get(`${API_URL}/api/license/credits`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return data;
    } catch (err) {
      console.error('Failed to fetch credits:', err);
      return null;
    }
  }, []);

  // Consume credits
  const consumeCredits = useCallback(async (actionType, metadata = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const { data } = await axios.post(`${API_URL}/api/license/consume-credits`, {
        actionType,
        metadata
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to consume credits');
      }

      // Refresh license to update credits
      await refreshLicense();

      return data;
    } catch (err) {
      console.error('Failed to consume credits:', err);
      throw err;
    }
  }, [refreshLicense]);

  // Check feature access (async version for API call)
  const checkFeatureAccess = useCallback(async (featureName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const { data } = await axios.post(`${API_URL}/api/license/check-feature`, {
        feature: featureName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return data.hasAccess;
    } catch (err) {
      console.error('Failed to check feature access:', err);
      return false;
    }
  }, []);

  // Get license stats
  const getLicenseStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const { data } = await axios.get(`${API_URL}/api/license/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return data.stats;
    } catch (err) {
      console.error('Failed to fetch license stats:', err);
      return null;
    }
  }, []);

  const value = {
    // State
    license,
    loading,
    error,

    // License info
    tier: license?.license?.tier,
    licenseKey: license?.license?.licenseKey,
    status: license?.license?.status,
    features: license?.features,
    addons: license?.addons,

    // Helper methods
    hasFeature,
    hasAddon,
    refreshLicense,

    // Credit methods
    getCredits,
    consumeCredits,

    // API methods
    checkFeatureAccess,
    getLicenseStats,

    // Computed properties
    hasLicense: !!license,
    isFrontend: license?.license?.tier === 'frontend',
    isPro: license?.license?.tier === 'pro_license',
    hasTemplates: license?.license?.tier === 'templates_license' || license?.features?.templates_library,
    isAgency: license?.license?.tier === 'agency_license' || license?.features?.agency_license,
    isReseller: license?.license?.tier === 'reseller_license' || license?.features?.reseller_license,
    isElite: license?.license?.tier === 'elite_bundle',
    hasUnlimitedCredits: license?.features?.unlimited_credits || false,

    // Feature helpers
    hasProFeatures: license?.features?.pro_license || license?.features?.all_features || false,
    hasTemplatesLibrary: license?.features?.templates_library || license?.features?.all_features || false,
    hasAgencyFeatures: license?.features?.agency_features || license?.features?.all_features || false,
    hasResellerFeatures: license?.features?.reseller_license || license?.features?.all_features || false,
    hasWhiteLabel: license?.features?.white_label || license?.features?.all_features || false
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}

// Custom hook to use the license context
export function useLicense() {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }

  return context;
}

export default LicenseContext;
