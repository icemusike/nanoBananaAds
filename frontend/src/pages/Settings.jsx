import { useState, useEffect } from 'react';
import { Key, User, Save, Eye, EyeOff, CheckCircle, AlertCircle, Image, Settings as SettingsIcon, TrendingUp, Palette } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Settings() {
  const { themeName, mode, changeTheme, toggleMode, availableThemes } = useTheme();

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
    preferredImageModel: 'gemini',
    imageQuality: 'standard',
    defaultIndustry: '',
    defaultTone: 'professional yet approachable',
    defaultAspectRatio: 'square',
    theme: themeName,
    themeMode: mode
  });

  const [stats, setStats] = useState({
    adsGenerated: 0,
    promptsGenerated: 0,
    anglesGenerated: 0,
    memberSince: new Date()
  });

  const [showKeys, setShowKeys] = useState({
    gemini: false,
    openai: false,
  });

  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings from database and localStorage on mount
  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load API keys from localStorage (for security - not in database)
      const savedApiKeys = localStorage.getItem('apiKeys');
      if (savedApiKeys) {
        setApiKeys(JSON.parse(savedApiKeys));
      }

      // Load user settings from database
      const response = await axios.get(`${API_URL}/user/settings`);
      if (response.data.success && response.data.user) {
        const user = response.data.user;

        setUserInfo({
          name: user.name || '',
          email: user.email || '',
          company: user.company || ''
        });

        setPreferences({
          preferredImageModel: user.preferredImageModel || 'gemini',
          imageQuality: user.imageQuality || 'standard',
          defaultIndustry: user.defaultIndustry || '',
          defaultTone: user.defaultTone || 'professional yet approachable',
          defaultAspectRatio: user.defaultAspectRatio || 'square',
          theme: user.theme || 'solar-dusk',
          themeMode: user.themeMode || 'dark'
        });

        // Apply theme from database if different from current
        if (user.theme && user.theme !== themeName) {
          changeTheme(user.theme);
        }
        if (user.themeMode && user.themeMode !== mode) {
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
      const response = await axios.get(`${API_URL}/user/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save API keys to localStorage only (for security)
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));

      // Save user info and preferences to database
      const response = await axios.put(`${API_URL}/user/settings`, {
        ...userInfo,
        ...preferences
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
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account, API keys, and preferences</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ads Generated</p>
                <p className="text-2xl font-bold text-primary-400">{stats.adsGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Prompts Created</p>
                <p className="text-2xl font-bold text-accent-teal">{stats.promptsGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-accent-teal/10 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-accent-teal" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Angles Discovered</p>
                <p className="text-2xl font-bold text-accent-purple">{stats.anglesGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">Account Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={userInfo.company}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Acme Inc."
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Image Generation Preferences */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Image className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">Image Generation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Preferred Image Model</label>
                  <select
                    value={preferences.preferredImageModel}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferredImageModel: e.target.value }))}
                    className="select-field w-full"
                  >
                    <option value="gemini">Google Gemini (Imagen 3) - Recommended</option>
                    <option value="dalle">DALL-E 3</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {preferences.preferredImageModel === 'gemini'
                      ? 'Gemini 2.5 Flash produces high-quality, photorealistic images optimized for Facebook ads'
                      : 'DALL-E 3 is great for artistic and creative imagery'}
                  </p>
                </div>

                <div>
                  <label className="label">Image Quality</label>
                  <select
                    value={preferences.imageQuality}
                    onChange={(e) => setPreferences(prev => ({ ...prev, imageQuality: e.target.value }))}
                    className="select-field w-full"
                  >
                    <option value="standard">Standard Quality</option>
                    <option value="hd">HD Quality (DALL-E only)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    HD quality costs more but produces higher resolution images
                  </p>
                </div>

                <div>
                  <label className="label">Default Aspect Ratio</label>
                  <select
                    value={preferences.defaultAspectRatio}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultAspectRatio: e.target.value }))}
                    className="select-field w-full"
                  >
                    <option value="square">Square (1:1) - Best for Facebook</option>
                    <option value="portrait">Portrait (9:16) - Mobile optimized</option>
                    <option value="landscape">Landscape (16:9) - Desktop</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Theme Appearance */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">Theme Appearance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Theme</label>
                  <select
                    value={themeName}
                    onChange={(e) => {
                      changeTheme(e.target.value);
                      setPreferences(prev => ({ ...prev, theme: e.target.value }));
                    }}
                    className="select-field w-full"
                  >
                    {availableThemes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {availableThemes.find(t => t.id === themeName)?.description}
                  </p>
                </div>

                <div>
                  <label className="label">Mode</label>
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
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-card border-border hover:border-primary-400'
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
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-card border-border hover:border-primary-400'
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* API Keys */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Key className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">API Keys</h2>
              </div>

              <div className="space-y-4">
                {/* Gemini API Key */}
                <div>
                  <label className="label">Google Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.gemini ? 'text' : 'password'}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                      placeholder="Enter your Gemini API key"
                      className="input-field pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('gemini')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showKeys.gemini ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                {/* OpenAI API Key */}
                <div>
                  <label className="label">OpenAI API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.openai ? 'text' : 'password'}
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                      placeholder="Enter your OpenAI API key"
                      className="input-field pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openai')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showKeys.openai ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>

                <div className="bg-accent-teal/5 border border-accent-teal/20 rounded-lg p-3 mt-4">
                  <p className="text-xs text-accent-teal">
                    <strong>🔒 Security:</strong> API keys are stored locally in your browser only.
                    They are never sent to our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Default Preferences */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">Default Preferences</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Default Industry</label>
                  <select
                    value={preferences.defaultIndustry}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultIndustry: e.target.value }))}
                    className="select-field w-full"
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
                  <label className="label">Default Tone</label>
                  <select
                    value={preferences.defaultTone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultTone: e.target.value }))}
                    className="select-field w-full"
                  >
                    <option value="professional yet approachable">Professional yet Approachable</option>
                    <option value="friendly and casual">Friendly and Casual</option>
                    <option value="authoritative and expert">Authoritative and Expert</option>
                    <option value="playful and energetic">Playful and Energetic</option>
                    <option value="empathetic and caring">Empathetic and Caring</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <Save className="w-5 h-5" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
