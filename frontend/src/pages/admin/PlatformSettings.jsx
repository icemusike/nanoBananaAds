import { useState, useEffect } from 'react';
import { settingsApi } from '../../services/adminApi';

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState('system');
  const [systemInfo, setSystemInfo] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API Keys form
  const [apiKeys, setApiKeys] = useState({
    geminiApiKey: '',
    openaiApiKey: ''
  });

  // AI Models form
  const [aiModels, setAiModels] = useState({
    defaultImageModel: 'gemini',
    defaultCopyModel: 'gpt-4o-2024-08-06',
    imageQuality: 'standard'
  });

  const [testingApi, setTestingApi] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [systemRes, settingsRes] = await Promise.all([
        settingsApi.getSystemInfo(),
        settingsApi.getAll()
      ]);

      if (systemRes.data.success) {
        setSystemInfo(systemRes.data.systemInfo);
      }

      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);

        // Populate forms if settings exist (from database)
        if (settingsRes.data.settings.apiKeys) {
          setApiKeys({
            geminiApiKey: settingsRes.data.settings.apiKeys.geminiApiKey || '',
            openaiApiKey: settingsRes.data.settings.apiKeys.openaiApiKey || ''
          });
        }

        if (settingsRes.data.settings.ai_models) {
          setAiModels({
            defaultImageModel: settingsRes.data.settings.ai_models.default_image_model?.value || 'gemini',
            defaultCopyModel: settingsRes.data.settings.ai_models.default_copy_model?.value || 'gpt-4o-2024-08-06',
            imageQuality: settingsRes.data.settings.ai_models.image_quality?.value || 'standard'
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKeys = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Save Gemini API Key
      if (apiKeys.geminiApiKey) {
        await settingsApi.update('gemini_api_key', {
          value: apiKeys.geminiApiKey,
          category: 'api_keys',
          encrypted: true,
          description: 'Google Gemini API Key'
        });
      }

      // Save OpenAI API Key
      if (apiKeys.openaiApiKey) {
        await settingsApi.update('openai_api_key', {
          value: apiKeys.openaiApiKey,
          category: 'api_keys',
          encrypted: true,
          description: 'OpenAI API Key'
        });
      }

      setSuccess('API keys saved successfully!');
      fetchData(); // Refresh to show masked keys
    } catch (err) {
      setError('Failed to save API keys: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTestApiKey = async (provider) => {
    setError('');
    setSuccess('');

    try {
      const apiKey = provider === 'gemini' ? apiKeys.geminiApiKey : apiKeys.openaiApiKey;

      if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('***')) {
        setError('Please enter a valid API key first');
        return;
      }

      // Set loading state for specific provider
      if (provider === 'gemini') {
        setTestingGemini(true);
      } else {
        setTestingOpenai(true);
      }

      const response = provider === 'gemini'
        ? await settingsApi.testGemini(apiKey)
        : await settingsApi.testOpenai(apiKey);

      if (response.data.success) {
        setSuccess(`${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key is valid! ${response.data.details}`);
      } else {
        setError(`${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API test failed: ${response.data.message}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(`API test failed: ${errorMsg}`);
    } finally {
      if (provider === 'gemini') {
        setTestingGemini(false);
      } else {
        setTestingOpenai(false);
      }
    }
  };

  const handleSaveAiModels = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await Promise.all([
        settingsApi.update('default_image_model', {
          value: aiModels.defaultImageModel,
          category: 'ai_models',
          description: 'Default image generation model'
        }),
        settingsApi.update('default_copy_model', {
          value: aiModels.defaultCopyModel,
          category: 'ai_models',
          description: 'Default copy generation model'
        }),
        settingsApi.update('image_quality', {
          value: aiModels.imageQuality,
          category: 'ai_models',
          description: 'Default image quality setting'
        })
      ]);

      setSuccess('AI model settings saved successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to save AI model settings: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure AI models, API keys, and system settings
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              System Information
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'api-keys'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('ai-models')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'ai-models'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              AI Models
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* System Information Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Database
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Status</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {systemInfo?.database?.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Size</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.database?.size || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Users</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.database?.records?.users?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Ads</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.database?.records?.ads?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Licenses</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.database?.records?.licenses?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Server Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Server
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Platform</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.server?.platform || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Node Version</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.server?.nodeVersion || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">CPUs</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.server?.cpus || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Uptime</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatUptime(systemInfo?.server?.uptime || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Environment</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {systemInfo?.environment?.nodeEnv || 'development'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Memory Usage
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Used Memory</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatBytes(systemInfo?.server?.memory?.used || 0)} / {formatBytes(systemInfo?.server?.memory?.total || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${((systemInfo?.server?.memory?.used || 0) / (systemInfo?.server?.memory?.total || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={fetchData}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                🔄 Refresh System Information
              </button>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <form onSubmit={handleSaveApiKeys} className="space-y-6">
              {/* Gemini API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Gemini API Key
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={apiKeys.geminiApiKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, geminiApiKey: e.target.value })}
                    placeholder="Enter Gemini API key"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestApiKey('gemini')}
                    disabled={testingGemini}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingGemini ? '⏳ Testing Gemini...' : '🧪 Test Gemini Key'}
                  </button>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API Key
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={apiKeys.openaiApiKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, openaiApiKey: e.target.value })}
                    placeholder="Enter OpenAI API key"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestApiKey('openai')}
                    disabled={testingOpenai}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingOpenai ? '⏳ Testing OpenAI...' : '🧪 Test OpenAI Key'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                💾 Save API Keys
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-500">
                API keys are encrypted and stored securely. After saving, keys will be masked for security.
              </p>
            </form>
          )}

          {/* AI Models Tab */}
          {activeTab === 'ai-models' && (
            <form onSubmit={handleSaveAiModels} className="space-y-6">
              {/* Default Image Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Image Generation Model
                </label>
                <select
                  value={aiModels.defaultImageModel}
                  onChange={(e) => setAiModels({ ...aiModels, defaultImageModel: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gemini">Gemini 2.5 Flash</option>
                  <option value="dalle">DALL-E 3</option>
                </select>
              </div>

              {/* Default Copy Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Copy Generation Model
                </label>
                <select
                  value={aiModels.defaultCopyModel}
                  onChange={(e) => setAiModels({ ...aiModels, defaultCopyModel: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-4o-2024-08-06">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Faster/Cheaper)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                </select>
              </div>

              {/* Image Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Image Quality (DALL-E)
                </label>
                <select
                  value={aiModels.imageQuality}
                  onChange={(e) => setAiModels({ ...aiModels, imageQuality: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD (Higher Cost)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                💾 Save AI Model Settings
              </button>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Note:</strong> These settings will be used as defaults for new users. Existing user preferences will not be affected.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
