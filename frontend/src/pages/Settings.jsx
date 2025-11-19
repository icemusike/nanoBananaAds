import { useState, useEffect } from 'react';
import { Key, User, Save, Eye, EyeOff, CheckCircle, AlertCircle, Image, Settings as SettingsIcon, TrendingUp, Palette, CreditCard, DollarSign, Activity, Zap, X, Check, UserCog, Building2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useLicense } from '../context/LicenseContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Settings() {
  const { themeName, mode, changeTheme, toggleMode, availableThemes } = useTheme();
  const { license, tier, addons, getCredits, hasUnlimitedCredits, loading: licenseLoading } = useLicense();

  const [activeTab, setActiveTab] = useState('account-details'); // Tab state

  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    company: '',
  });

  const [preferences, setPreferences] = useState({
    defaultIndustry: '',
    defaultTone: 'professional yet approachable',
    defaultAspectRatio: 'square',
    defaultModel: 'gpt-4o-2024-08-06',
    theme: themeName,
    themeMode: mode
  });

  const [stats, setStats] = useState({
    adsGenerated: 0,
    promptsGenerated: 0,
    anglesGenerated: 0,
    memberSince: new Date()
  });

  const [billing, setBilling] = useState({
    creditsRemaining: 1000,
    creditsUsed: 0,
    monthlyCreditsLimit: 1000,
    billingCycle: 'monthly',
    plan: 'Free',
    tier: null, // Raw tier value (starter, pro_unlimited, elite_bundle)
    hasAgencyAddon: false,
    hasUnlimitedCredits: false,
    costBreakdown: {
      imageGeneration: 0,
      copyGeneration: 0,
      promptGeneration: 0
    }
  });

  const [showKeys, setShowKeys] = useState({
    gemini: false,
    openai: false,
  });

  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Load settings from database and localStorage on mount
  useEffect(() => {
    Promise.all([loadSettings(), loadStats(), loadLicenseData()]);
  }, []);

  const loadSettings = async () => {
    try {
      // SECURITY: Don't load API keys from localStorage
      // Admin keys should never be stored client-side
      // Clear any cached keys
      localStorage.removeItem('apiKeys');

      // Get token for authentication
      const token = localStorage.getItem('token');

      // Load user settings from database
      const response = await axios.get(`${API_URL}/api/user/settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000
      });
      if (response.data.success && response.data.user) {
        const user = response.data.user;

        setUserInfo({
          name: user.name || '',
          email: user.email || '',
          company: user.company || ''
        });

        const userTheme = user.theme || themeName; // Use current theme if not set
        const userThemeMode = user.themeMode || mode; // Use current mode if not set

        setPreferences({
          defaultIndustry: user.defaultIndustry || '',
          defaultTone: user.defaultTone || 'professional yet approachable',
          defaultAspectRatio: user.defaultAspectRatio || 'square',
          defaultModel: user.defaultModel || 'gpt-4o-2024-08-06',
          theme: userTheme,
          themeMode: userThemeMode
        });

        // SECURITY: API keys are never loaded from the backend
        // Backend always returns empty strings for security
        // Users should see blank fields (admin keys are used on backend only)
        setApiKeys({
          gemini: '',
          openai: ''
        });

        // Apply theme from database ONLY if explicitly set by user
        if (user.theme && userTheme !== themeName) {
          changeTheme(userTheme);
        }
        if (user.themeMode && userThemeMode !== mode) {
          toggleMode();
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000
      });
      if (response.data.success) {
        setStats(response.data.stats);
        calculateBillingData(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        adsGenerated: 0,
        promptsGenerated: 0,
        anglesGenerated: 0,
        memberSince: new Date()
      });
      calculateBillingData({
        adsGenerated: 0,
        promptsGenerated: 0,
        anglesGenerated: 0
      });
    }
  };

  const loadLicenseData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Fetch license information
      const licenseResponse = await axios.get(`${API_URL}/api/license/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      // Fetch credits information
      const creditsResponse = await axios.get(`${API_URL}/api/license/credits`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      if (licenseResponse.data.success && creditsResponse.data.success) {
        const licenseData = licenseResponse.data.license;
        const credits = creditsResponse.data;
        const addonsData = licenseResponse.data.addons || [];
        const features = licenseResponse.data.features || {};

        // Debug logging
        console.log('🔵 License Response:', licenseResponse.data);
        console.log('🔵 Addons:', addonsData);
        console.log('🔵 Features:', features);

        // Get all licenses user owns
        const ownedLicenses = licenseResponse.data.licenses || [];
        const hasUnlimitedCreds = features.unlimited_credits || false;

        // Map license tier to friendly plan name
        const planNames = {
          'frontend': 'Frontend',
          'pro_license': 'Pro License',
          'templates_license': 'Templates',
          'agency_license': 'Agency',
          'reseller_license': 'Reseller',
          'elite_bundle': 'Elite Bundle'
        };

        // Build comprehensive plan name showing all owned licenses
        const baseTier = licenseData?.tier || 'Free';
        
        let planName = 'Free';
        
        if (baseTier === 'elite_bundle') {
          planName = 'Elite Bundle';
        } else {
          const basePlan = planNames[baseTier] || 'Free';
          
          // Build addon list (exclude the base tier)
          const addons = ownedLicenses
            .filter(l => l !== baseTier && planNames[l])
            .map(l => planNames[l]);

          planName = addons.length > 0
            ? `${basePlan} + ${addons.join(' + ')}`
            : basePlan;
        }

        // Update billing with real license data
        setBilling(prev => ({
          ...prev,
          plan: planName,
          tier: licenseData?.tier || null,
          ownedLicenses: ownedLicenses,
          features: features,
          hasUnlimitedCredits: hasUnlimitedCreds,
          creditsTotal: credits.total || 0,
          creditsUsed: credits.used || 0,
          creditsRemaining: credits.remaining !== undefined ? credits.remaining : 0,
          monthlyCreditsLimit: credits.total || 0
        }));
      }
    } catch (error) {
      console.error('Error loading license data:', error);
    }
  };

  const calculateBillingData = (stats) => {
    const imageGenCost = stats.adsGenerated * 0.04;
    const copyGenCost = stats.adsGenerated * 0.005;
    const promptGenCost = (stats.promptsGenerated + stats.anglesGenerated) * 0.0002;

    const totalCost = imageGenCost + copyGenCost + promptGenCost;
    const creditsUsed = Math.round(totalCost * 100);
    const monthlyLimit = 1000;

    setBilling(prev => ({
      ...prev,
      creditsRemaining: prev.plan === 'Free' ? Math.max(0, monthlyLimit - creditsUsed) : prev.creditsRemaining,
      creditsUsed: prev.plan === 'Free' ? creditsUsed : prev.creditsUsed,
      monthlyCreditsLimit: prev.plan === 'Free' ? monthlyLimit : prev.monthlyCreditsLimit,
      costBreakdown: {
        imageGeneration: Math.round(imageGenCost * 100),
        copyGeneration: Math.round(copyGenCost * 100),
        promptGeneration: Math.round(promptGenCost * 100)
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // SECURITY: Don't save admin API keys to localStorage
      // Only save if user has entered custom keys
      const hasCustomKeys = apiKeys.gemini.trim() !== '' || apiKeys.openai.trim() !== '';
      if (hasCustomKeys) {
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
      } else {
        localStorage.removeItem('apiKeys');
      }

      // Get token for authentication
      const token = localStorage.getItem('token');

      // Save user info, preferences, AND API keys to database
      const response = await axios.put(`${API_URL}/api/user/settings`, {
        ...userInfo,
        ...preferences,
        // Only send API keys if user has entered custom ones
        geminiApiKey: apiKeys.gemini.trim() !== '' ? apiKeys.gemini : '',
        openaiApiKey: apiKeys.openai.trim() !== '' ? apiKeys.openai : ''
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const toggleShowKey = (keyType) => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account, billing, API keys, and preferences</p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            saveStatus === 'success'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Settings saved successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">Failed to save settings</span>
              </>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Ads Generated</p>
                <p className="text-2xl font-bold text-primary">{stats.adsGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Prompts Created</p>
                <p className="text-2xl font-bold text-accent">{stats.promptsGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Angles Discovered</p>
                <p className="text-2xl font-bold text-secondary">{stats.anglesGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('account-details')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'account-details'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Account Details
          </button>

          <button
            onClick={() => setActiveTab('account-settings')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'account-settings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCog className="w-4 h-4" />
            Account Settings
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'billing'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Credits
          </button>

          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'api-keys'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className="w-4 h-4" />
            API Keys & Integrations
          </button>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {/* Account Details Tab */}
          {activeTab === 'account-details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={userInfo.company}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Acme Inc."
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Account Status</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Current Plan</span>
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                      {billing.plan}
                    </span>
                  </div>

                  {billing.hasAgencyAddon && (
                    <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-accent">Agency Features Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You have access to client management, project tracking, and team collaboration features.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(stats.memberSince).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Total Generations</span>
                    <span className="text-sm font-bold text-primary">
                      {stats.adsGenerated + stats.promptsGenerated + stats.anglesGenerated}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'account-settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Generation Settings */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Image className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Image Generation</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Default Aspect Ratio</label>
                    <select
                      value={preferences.defaultAspectRatio}
                      onChange={(e) => setPreferences(prev => ({ ...prev, defaultAspectRatio: e.target.value }))}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="square">Square (1:1) - Best for Facebook</option>
                      <option value="portrait">Portrait (9:16) - Mobile optimized</option>
                      <option value="landscape">Landscape (16:9) - Desktop</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Theme Appearance */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Theme Appearance</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
                    <select
                      value={themeName}
                      onChange={(e) => {
                        changeTheme(e.target.value);
                        setPreferences(prev => ({ ...prev, theme: e.target.value }));
                      }}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {availableThemes.map(theme => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {availableThemes.find(t => t.id === themeName)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Mode</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (mode !== 'light') {
                            toggleMode();
                            setPreferences(prev => ({ ...prev, themeMode: 'light' }));
                          }
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                          mode === 'light'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border hover:border-primary'
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => {
                          if (mode !== 'dark') {
                            toggleMode();
                            setPreferences(prev => ({ ...prev, themeMode: 'dark' }));
                          }
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                          mode === 'dark'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border hover:border-primary'
                        }`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div className="mt-4 p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-3">Preview</p>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--primary)' }} title="Primary" />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--secondary)' }} title="Secondary" />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--accent)' }} title="Accent" />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--muted)' }} title="Muted" />
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--background)' }} title="Background" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Preferences */}
              <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <SettingsIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Default Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Default Industry</label>
                    <select
                      value={preferences.defaultIndustry}
                      onChange={(e) => setPreferences(prev => ({ ...prev, defaultIndustry: e.target.value }))}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">None</option>
                      <option value="tech_saas">Tech/SaaS</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="real_estate">Real Estate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Default Tone</label>
                    <select
                      value={preferences.defaultTone}
                      onChange={(e) => setPreferences(prev => ({ ...prev, defaultTone: e.target.value }))}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="professional yet approachable">Professional yet Approachable</option>
                      <option value="friendly and casual">Friendly and Casual</option>
                      <option value="authoritative and expert">Authoritative and Expert</option>
                      <option value="playful and energetic">Playful and Energetic</option>
                      <option value="empathetic and caring">Empathetic and Caring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">AI Quality Level</label>
                    <select
                      value={preferences.defaultModel}
                      onChange={(e) => setPreferences(prev => ({ ...prev, defaultModel: e.target.value }))}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="gpt-5-2025-08-07">Premium - Best quality</option>
                      <option value="gpt-4o-2024-08-06">Standard - Recommended</option>
                      <option value="gpt-4o-mini">Fast - Affordable</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  {preferences.defaultModel === 'gpt-5-2025-08-07' && '🔥 Maximum quality, highest cost. Expert-level intelligence for complex ad copy.'}
                  {preferences.defaultModel === 'gpt-4o-2024-08-06' && '⚡ Great balance of quality and cost. Excellent for most use cases.'}
                  {preferences.defaultModel === 'gpt-4o-mini' && '💰 Most affordable option. Good for testing and high-volume generation.'}
                </div>
              </div>
            </div>
          )}

          {/* Billing & Credits Tab */}
          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* License & Upgrade Progress */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">Your Licenses</h2>
                  </div>
                  {billing.tier !== 'elite_bundle' && (
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade Now
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* License Badges */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/70 mb-3">Active Licenses</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Frontend License */}
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        billing.ownedLicenses?.includes('frontend') || billing.tier === 'elite_bundle'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {billing.ownedLicenses?.includes('frontend') || billing.tier === 'elite_bundle' ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-bold text-foreground">Frontend</span>
                        </div>
                        <p className="text-xs text-foreground/60">500 credits/mo</p>
                      </div>

                      {/* Pro License */}
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        billing.ownedLicenses?.includes('pro_license') || billing.tier === 'elite_bundle'
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {billing.ownedLicenses?.includes('pro_license') || billing.tier === 'elite_bundle' ? (
                            <Check className="w-4 h-4 text-accent" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-bold text-foreground">Pro</span>
                        </div>
                        <p className="text-xs text-foreground/60">Unlimited credits</p>
                      </div>

                      {/* Templates License */}
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        billing.ownedLicenses?.includes('templates_license') || billing.tier === 'elite_bundle'
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {billing.ownedLicenses?.includes('templates_license') || billing.tier === 'elite_bundle' ? (
                            <Check className="w-4 h-4 text-secondary" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-bold text-foreground">Templates</span>
                        </div>
                        <p className="text-xs text-foreground/60">Template library</p>
                      </div>

                      {/* Agency License */}
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        billing.ownedLicenses?.includes('agency_license') || billing.tier === 'elite_bundle'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {billing.ownedLicenses?.includes('agency_license') || billing.tier === 'elite_bundle' ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-bold text-foreground">Agency</span>
                        </div>
                        <p className="text-xs text-foreground/60">Client management</p>
                      </div>

                      {/* Reseller License */}
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        billing.ownedLicenses?.includes('reseller_license') || billing.tier === 'elite_bundle'
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {billing.ownedLicenses?.includes('reseller_license') || billing.tier === 'elite_bundle' ? (
                            <Check className="w-4 h-4 text-accent" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-bold text-foreground">Reseller</span>
                        </div>
                        <p className="text-xs text-foreground/60">White-label</p>
                      </div>

                      {/* Elite Bundle */}
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        billing.tier === 'elite_bundle'
                          ? 'border-accent bg-gradient-to-br from-primary/20 to-accent/20'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {billing.tier === 'elite_bundle' ? (
                            <Check className="w-4 h-4 text-accent" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-bold text-foreground">Elite Bundle</span>
                        </div>
                        <p className="text-xs text-foreground/60">All features</p>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Progress */}
                  {billing.tier !== 'elite_bundle' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground/70">Upgrade Progress</h3>
                        <span className="text-xs font-bold text-primary">
                          {(() => {
                            const total = 6; // Frontend, Pro, Templates, Agency, Reseller, Elite
                            const owned = (billing.ownedLicenses || []).length;
                            return Math.round((owned / total) * 100);
                          })()}% Unlocked
                        </span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2 border border-border">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-700"
                          style={{
                            width: `${(() => {
                              const total = 6;
                              const owned = (billing.ownedLicenses || []).length;
                              return Math.round((owned / total) * 100);
                            })()}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-foreground/60">
                        Unlock all features to maximize your ad creation potential!
                      </p>
                    </div>
                  )}

                  {billing.tier === 'elite_bundle' && (
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-accent" />
                          <span className="font-bold text-accent">Elite Bundle Active</span>
                        </div>
                        <span className="text-xs font-bold text-primary">100% Unlocked</span>
                      </div>
                      
                      {/* 100% Progress Bar */}
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2 border border-border">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-700"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      
                      <p className="text-xs text-foreground/70 mt-2">
                        You have unlocked all features! Enjoy unlimited access to everything AdGenius AI has to offer.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Plan Summary (moved from above) */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Plan Summary</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6">
                    <div className="mb-3">
                      <span className="text-sm text-foreground/70 block mb-1">Current Plan</span>
                      <span className="text-2xl font-bold text-primary">{billing.plan}</span>
                    </div>
                  </div>

                  {/* Credits Overview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Credits Balance</h3>
                      {billing.hasUnlimitedCredits ? (
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Unlimited
                        </span>
                      ) : (
                        <span className="text-sm text-foreground font-medium">
                          {billing.creditsRemaining.toLocaleString()} / {billing.monthlyCreditsLimit.toLocaleString()} credits
                        </span>
                      )}
                    </div>

                    {!billing.hasUnlimitedCredits && (
                      <>
                        {/* Progress Bar */}
                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-2 border border-border">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                            style={{
                              width: `${Math.max(3, Math.min(100, (billing.creditsUsed / billing.monthlyCreditsLimit) * 100))}%`
                            }}
                          ></div>
                        </div>

                        <p className="text-xs text-foreground/70">
                          {billing.creditsUsed.toLocaleString()} credits used ({Math.round((billing.creditsUsed / billing.monthlyCreditsLimit) * 100)}%)
                        </p>
                      </>
                    )}

                    {billing.hasUnlimitedCredits && (
                      <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg mt-2">
                        <p className="text-xs text-foreground/70">
                          You have unlimited credits! Generate as many ads as you need.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Breakdown */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Usage Breakdown</h2>
                </div>

                <div className="space-y-3">
                  {/* Image Generation */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Image Generation</p>
                        <p className="text-xs text-foreground/60">{stats.adsGenerated} images</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {billing.costBreakdown.imageGeneration} credits
                      </p>
                    </div>
                  </div>

                  {/* Copy Generation */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Ad Copy Generation</p>
                        <p className="text-xs text-foreground/60">{stats.adsGenerated} copies</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">
                        {billing.costBreakdown.copyGeneration} credits
                      </p>
                    </div>
                  </div>

                  {/* Prompts & Angles */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Prompts & Angles</p>
                        <p className="text-xs text-foreground/60">
                          {stats.promptsGenerated + stats.anglesGenerated} generated
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-secondary">
                        {billing.costBreakdown.promptGeneration} credits
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Total This Month</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">
                        {billing.creditsUsed} credits
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mt-4">
                  <p className="text-xs text-accent leading-relaxed">
                    <strong>💡 How Credits Work:</strong> Credits are used for AI generation.
                    Image generation uses more credits than prompts or angles.
                    Upgrade to Pro License or Elite Bundle for unlimited credits!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Keys & Integrations Tab */}
          {activeTab === 'api-keys' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Keys */}
              <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Key className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">API Keys</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gemini API Key */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Google Gemini API Key (Image Generation)
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys.gemini ? 'text' : 'password'}
                        value={apiKeys.gemini}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        placeholder="Enter your Gemini API key"
                        className="w-full px-4 py-2 pr-12 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey('gemini')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKeys.gemini ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Used for AI-powered image generation. Get your API key from{' '}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  {/* OpenAI API Key */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      OpenAI API Key (Ad Copy Generation)
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys.openai ? 'text' : 'password'}
                        value={apiKeys.openai}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                        placeholder="Enter your OpenAI API key"
                        className="w-full px-4 py-2 pr-12 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey('openai')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKeys.openai ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Used for generating ad copy, headlines, and descriptions. Get your API key from{' '}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mt-6">
                  <p className="text-xs text-accent">
                    <strong>🔒 Security:</strong> API keys are stored locally in your browser only.
                    They are never sent to our servers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <Save className="w-5 h-5" />
            Save All Settings
          </button>
        </div>
      </div>

      {/* Pricing Modal - Hide if Elite Bundle */}
      {showPricingModal && billing.tier !== 'elite_bundle' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-primary/40 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card/98 backdrop-blur-md border-b border-border p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Upgrade Your Plan
                </h2>
                <p className="text-muted-foreground">Current plan: <span className="font-semibold text-foreground">{billing.plan}</span></p>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Upgrade Options */}
            <div className="p-6">
              {/* First Row - Individual Licenses */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Pro License - Check for official product ID */}
                {!billing.ownedLicenses?.includes('pro_license') && (
                  <div className="bg-muted/50 border border-border rounded-xl p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">Pro</h3>
                      <p className="text-2xl font-bold text-primary">$97</p>
                      <p className="text-xs text-muted-foreground">One-time</p>
                    </div>
                    <ul className="space-y-2 mb-4 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Unlimited credits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>All AI models</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <a
                      href="https://adgeniusai.io/pro-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mb-3 block"
                    >
                      (See all features...)
                    </a>
                    <a
                      href="https://adgeniusai.io/pro-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center text-sm"
                    >
                      Upgrade to Pro
                    </a>
                  </div>
                )}

                {/* Templates License - Check for official product ID */}
                {!billing.ownedLicenses?.includes('templates_license') && (
                  <div className="bg-muted/50 border border-border rounded-xl p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">Templates</h3>
                      <p className="text-2xl font-bold text-primary">$127</p>
                      <p className="text-xs text-muted-foreground">One-time</p>
                    </div>
                    <ul className="space-y-2 mb-4 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>500+ templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>All industries</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Regular updates</span>
                      </li>
                    </ul>
                    <a
                      href="https://adgeniusai.io/template-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mb-3 block"
                    >
                      (See all features...)
                    </a>
                    <a
                      href="https://adgeniusai.io/template-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center text-sm"
                    >
                      Get Templates
                    </a>
                  </div>
                )}

                {/* Agency License - Check for official product ID */}
                {!billing.ownedLicenses?.includes('agency_license') && (
                  <div className="bg-muted/50 border border-border rounded-xl p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">Agency</h3>
                      <p className="text-2xl font-bold text-primary">$197</p>
                      <p className="text-xs text-muted-foreground">One-time</p>
                    </div>
                    <ul className="space-y-2 mb-4 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Unlimited clients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Client dashboards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>White-label</span>
                      </li>
                    </ul>
                    <a
                      href="https://adgeniusai.io/agency-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mb-3 block"
                    >
                      (See all features...)
                    </a>
                    <a
                      href="https://adgeniusai.io/agency-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center text-sm"
                    >
                      Get Agency
                    </a>
                  </div>
                )}

                {/* Reseller License - Check for official product ID */}
                {!billing.ownedLicenses?.includes('reseller_license') && (
                  <div className="bg-muted/50 border border-border rounded-xl p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">Reseller</h3>
                      <p className="text-2xl font-bold text-primary">$297</p>
                      <p className="text-xs text-muted-foreground">One-time</p>
                    </div>
                    <ul className="space-y-2 mb-4 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Resell rights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Keep 100% profit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>Full branding</span>
                      </li>
                    </ul>
                    <a
                      href="https://adgeniusai.io/reseller-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mb-3 block"
                    >
                      (See all features...)
                    </a>
                    <a
                      href="https://adgeniusai.io/reseller-upgrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center text-sm"
                    >
                      Get Reseller
                    </a>
                  </div>
                )}
              </div>

              {/* Second Row - Elite Bundle - Only show if user doesn't have ALL licenses */}
              {!(
                billing.tier === 'elite_bundle' ||
                (
                  billing.ownedLicenses?.includes('pro_license') &&
                  billing.ownedLicenses?.includes('templates_license') &&
                  billing.ownedLicenses?.includes('agency_license') &&
                  billing.ownedLicenses?.includes('reseller_license')
                )
              ) && (
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary rounded-xl p-8 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full text-sm font-bold shadow-lg">
                    ⭐ MOST POPULAR BUNDLE DEAL
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Elite Bundle
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Get ALL licenses (Pro + Templates + Agency + Reseller) and save $224!
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>Everything in Pro</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>Complete Template Library</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>Agency License</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>Reseller Rights</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>Unlimited everything</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span>Lifetime access</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="line-through">Regular Price: $621</span> • <span className="text-accent font-semibold">You Save: $224!</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-primary mb-2">$397</p>
                      <p className="text-sm text-muted-foreground mb-4">One-time payment</p>
                      <a
                        href="https://adgeniusai.io/special-bundle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block py-3 px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-bold text-lg shadow-lg"
                      >
                        Get Elite Bundle →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
