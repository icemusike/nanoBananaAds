import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Zap,
  Save,
  FolderOpen,
  Trash2,
  CheckCircle,
  X,
  BookOpen,
  Building2
} from 'lucide-react';
import FormSection from '../components/FormSection';
import ResultsSection from '../components/ResultsSection';
import BananaLoader from '../components/BananaLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function CreateAds() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState({});
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [showSavePromptModal, setShowSavePromptModal] = useState(false);
  const [promptName, setPromptName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [libraryPrompts, setLibraryPrompts] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    targetAudience: '',
    industry: 'tech_saas',
    category: 'b2b_software',
    template: 'dashboardShowcase',
    style: 'professional',
    colorPalette: '',
    aspectRatio: 'square',
    tone: 'professional yet approachable',
    valueProposition: '',
    callToAction: 'Learn More',
    imageDescription: '',
    moodKeywords: '',
    visualEmphasis: '',
    avoidInImage: '',
  });

  // Reference image state
  const [referenceImage, setReferenceImage] = useState({
    data: null,
    mimeType: null,
    preview: null
  });

  // Load templates, brands, and saved prompts on mount
  useEffect(() => {
    loadTemplates();
    loadSavedPrompts();
    loadBrands();

    // Check if navigated from angle
    if (location.state?.fromAngle && location.state?.angleData) {
      loadAngleData(location.state.angleData);
    }
  }, []);

  const loadBrands = async () => {
    try {
      const [brandsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/brands`),
        axios.get(`${API_URL}/user/settings`)
      ]);

      if (brandsRes.data.success) {
        setBrands(brandsRes.data.brands);

        // Load default brand if set (but don't override angle data)
        if (!location.state?.fromAngle) {
          const defaultBrandId = settingsRes.data?.user?.defaultBrandId;
          if (defaultBrandId) {
            const defaultBrand = brandsRes.data.brands.find(b => b.id === defaultBrandId);
            if (defaultBrand) {
              handleSelectBrand(defaultBrand);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  const loadAngleData = (angleData) => {
    // Map angle copy framework to tone
    const frameworkToTone = {
      'AIDA': 'professional yet approachable',
      'PAS': 'empathetic and caring',
      'BAB': 'friendly and casual',
      'FAB': 'professional yet approachable',
      '4Ps': 'authoritative and expert'
    };

    // Construct image description from angle
    const imageDesc = `${angleData.visualStyle}. Focus on: ${angleData.exampleHeadline}`;

    setFormData(prev => ({
      ...prev,
      description: angleData.businessDescription || prev.description,
      targetAudience: angleData.targetAudience || prev.targetAudience,
      industry: angleData.industry || prev.industry,
      tone: angleData.copyFramework && frameworkToTone[angleData.copyFramework]
        ? frameworkToTone[angleData.copyFramework]
        : prev.tone,
      imageDescription: imageDesc,
      valueProposition: angleData.whyItWorks || prev.valueProposition
    }));
  };

  const handleSelectBrand = async (brand) => {
    if (!brand) {
      setSelectedBrand(null);
      return;
    }

    setSelectedBrand(brand);

    // Auto-fill form with brand data
    setFormData(prev => ({
      ...prev,
      description: brand.description || prev.description,
      targetAudience: brand.targetAudience || prev.targetAudience,
      industry: brand.industry || prev.industry,
      tone: brand.tone || prev.tone,
      colorPalette: brand.primaryColor || prev.colorPalette,
      valueProposition: brand.valueProposition || prev.valueProposition
    }));

    // Increment brand usage count
    try {
      await axios.put(`${API_URL}/brands/${brand.id}/use`);
    } catch (err) {
      console.error('Failed to update brand usage:', err);
    }
  };

  const loadSavedPrompts = () => {
    const saved = localStorage.getItem('savedPrompts');
    if (saved) {
      setSavedPrompts(JSON.parse(saved));
    }
  };

  const handleSavePrompt = () => {
    if (!promptName.trim()) {
      setError('Please enter a name for this prompt');
      return;
    }

    const newPrompt = {
      id: Date.now().toString(),
      name: promptName,
      data: formData,
      createdAt: new Date().toISOString()
    };

    const updatedPrompts = [...savedPrompts, newPrompt];
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
    setSavedPrompts(updatedPrompts);
    setPromptName('');
    setShowSavePromptModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLoadPrompt = (promptData) => {
    setFormData(promptData);
  };

  const handleDeletePrompt = (promptId) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== promptId);
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
    setSavedPrompts(updatedPrompts);
  };

  const loadPromptLibrary = async () => {
    try {
      setLoadingLibrary(true);
      const response = await axios.get(`${API_URL}/prompts?limit=20`);
      if (response.data.success) {
        setLibraryPrompts(response.data.prompts);
      }
    } catch (err) {
      console.error('Failed to load prompt library:', err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const useLibraryPrompt = async (prompt) => {
    // Set the image description from the library prompt
    setFormData(prev => ({
      ...prev,
      imageDescription: prompt.generatedPrompt,
      industry: prompt.industry || prev.industry,
    }));

    // Increment usage count
    try {
      await axios.put(`${API_URL}/prompts/${prompt.id}/use`);
    } catch (err) {
      console.error('Failed to update prompt usage:', err);
    }

    setShowPromptLibrary(false);
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/templates`);
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleGenerate = async () => {
    if (!formData.description || !formData.targetAudience) {
      setError('Please fill in all required fields (Description, Target Audience, and Image Description)');
      return;
    }

    if (!formData.imageDescription || formData.imageDescription.trim().length < 20) {
      setError('Please provide a more detailed Image Description (at least 20 characters) to help generate the perfect visual');
      return;
    }

    // Get API keys from localStorage
    const savedApiKeys = localStorage.getItem('apiKeys');
    let apiKeys = { gemini: '', openai: '' };

    if (savedApiKeys) {
      apiKeys = JSON.parse(savedApiKeys);
    }

    // Check if API keys are present
    if (!apiKeys.gemini && !apiKeys.openai) {
      setError('API keys not found. Please add your Gemini and OpenAI API keys in Settings.');
      return;
    }

    if (!apiKeys.gemini) {
      setError('Gemini API key not found. Please add it in Settings.');
      return;
    }

    if (!apiKeys.openai) {
      setError('OpenAI API key not found. Please add it in Settings.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Prepare request data with optional reference image
      const requestData = {
        ...formData,
        ...(referenceImage.data && {
          referenceImage: {
            data: referenceImage.data,
            mimeType: referenceImage.mimeType
          }
        })
      };

      const response = await axios.post(`${API_URL}/generate`, requestData, {
        headers: {
          'x-gemini-api-key': apiKeys.gemini,
          'x-openai-api-key': apiKeys.openai
        }
      });

      if (response.data.success) {
        setResults(response.data);

        // Check if it was saved to database
        if (response.data.savedToDatabase) {
          console.log('✅ Ad saved to database with ID:', response.data.adId);
        } else {
          console.warn('⚠️ Ad was not saved to database');
        }
      } else {
        setError('Generation failed. Please try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate ad creative. Please check your API keys and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReferenceImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result; // e.g., "data:image/jpeg;base64,/9j/4AAQ..."
        const base64Data = base64String.split(',')[1]; // Extract pure base64 without "data:image/jpeg;base64," prefix

        setReferenceImage({
          data: base64Data,           // Pure base64 string for API (required by @google/generative-ai)
          mimeType: file.type,        // e.g., "image/jpeg"
          preview: base64String       // Full data URL for preview in <img> tag
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage({
      data: null,
      mimeType: null,
      preview: null
    });
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">
              Powered by Gemini / DALL-E 3 & GPT-5
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-purple to-accent-teal bg-clip-text text-transparent">
            Create High-Converting Facebook Ads
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-powered ad creative generation. Get stunning images and compelling copy in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Angle Loaded Indicator */}
        {location.state?.fromAngle && location.state?.angleData && (
          <div className="mb-6 p-4 bg-accent-teal/10 border border-accent-teal/20 rounded-lg flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-teal" />
            <div>
              <p className="text-accent-teal font-medium">Angle Loaded: {location.state.angleData.angleName}</p>
              <p className="text-xs text-gray-400 mt-1">Form has been auto-filled with angle strategy and visual style</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Brand Selector */}
            {brands.length > 0 && !location.state?.fromAngle && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-400" />
                  Select Brand (Auto-fill)
                </h3>
                <select
                  value={selectedBrand?.id || ''}
                  onChange={(e) => {
                    const brand = brands.find(b => b.id === e.target.value);
                    handleSelectBrand(brand);
                  }}
                  className="select-field w-full"
                >
                  <option value="">Choose a brand...</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} {brand.industry ? `(${brand.industry})` : ''}
                    </option>
                  ))}
                </select>
                {selectedBrand && (
                  <div className="mt-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                    <p className="text-sm text-primary-300">
                      ✓ Loaded: {selectedBrand.name}
                    </p>
                    {selectedBrand.tagline && (
                      <p className="text-xs text-gray-400 mt-1 italic">{selectedBrand.tagline}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <FormSection
              formData={formData}
              onInputChange={handleInputChange}
              templates={templates}
            />

            {/* Reference Image Upload */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent-purple" />
                Reference Image (Optional)
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Upload a reference image to guide the visual style. Gemini will use this to better understand the look and feel you want.
              </p>

              {!referenceImage.preview ? (
                <label className="block">
                  <div className="border-2 border-dashed border-dark-700 rounded-lg p-6 hover:border-primary-500/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-primary-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-300">Click to upload reference image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={referenceImage.preview}
                    alt="Reference"
                    className="w-full h-48 object-cover rounded-lg border border-dark-700"
                  />
                  <button
                    onClick={removeReferenceImage}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="mt-2 p-2 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                    <p className="text-xs text-primary-300">
                      ✓ Reference image uploaded - Gemini will use this to guide the visual style
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Management */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Prompt Management
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setShowSavePromptModal(true)}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Current
                </button>

                <button
                  onClick={() => {
                    setShowPromptLibrary(true);
                    loadPromptLibrary();
                  }}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Prompt Library
                </button>
              </div>

              {savedPrompts.length > 0 && (
                <div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const prompt = savedPrompts.find(p => p.id === e.target.value);
                        if (prompt) handleLoadPrompt(prompt.data);
                      }
                    }}
                    className="select-field w-full"
                    defaultValue=""
                  >
                    <option value="">Load Saved Prompt...</option>
                    {savedPrompts.map(prompt => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {savedPrompts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500">Saved Prompts ({savedPrompts.length}):</p>
                  {savedPrompts.map(prompt => (
                    <div key={prompt.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm text-foreground">{prompt.name}</span>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Success Message */}
            {saveSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Prompt saved successfully!</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Amazing Ad Creative...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Ad Creative
                </>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div className="lg:sticky lg:top-8 h-fit">
            {loading ? (
              <div className="card">
                <BananaLoader message="Creating your amazing ad..." />
              </div>
            ) : results ? (
              <ResultsSection results={results} formData={formData} />
            ) : (
              <div className="card h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Your Ad Creative Will Appear Here
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Fill in the form and click "Generate Ad Creative" to see your results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Generated Images</h3>
            <p className="text-gray-400 text-sm">
              Dual-model system: Gemini 2.5 Flash with DALL-E 3 fallback ensures you always get stunning images
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-accent-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-accent-teal" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Compelling Copy</h3>
            <p className="text-gray-400 text-sm">
              GPT-5 crafts high-converting headlines, descriptions, and primary text that drives results
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-accent-purple" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Use</h3>
            <p className="text-gray-400 text-sm">
              Download your complete ad creative and launch your campaign immediately
            </p>
          </div>
        </div>

        {/* Save Prompt Modal */}
        {showSavePromptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Save Prompt</h3>
                <button
                  onClick={() => {
                    setShowSavePromptModal(false);
                    setPromptName('');
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Prompt Name</label>
                  <input
                    type="text"
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    placeholder="E.g., Tech SaaS Dashboard Ad"
                    className="input-field"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give this prompt a memorable name
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSavePromptModal(false);
                      setPromptName('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePrompt}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Library Modal */}
        {showPromptLibrary && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary-400" />
                  Prompt Library
                </h2>
                <button
                  onClick={() => setShowPromptLibrary(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingLibrary ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-16 h-16 text-primary-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading prompts...</p>
                  </div>
                ) : libraryPrompts.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No prompts in library yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Create prompts in the Creative Prompts page
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {libraryPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="card hover:border-primary-500/30 transition-all cursor-pointer"
                        onClick={() => useLibraryPrompt(prompt)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{prompt.idea}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {prompt.industry && (
                                <span className="px-2 py-1 bg-dark-800 rounded">
                                  {prompt.industry}
                                </span>
                              )}
                              {prompt.style && (
                                <span className="px-2 py-1 bg-primary-500/10 rounded text-primary-400">
                                  {prompt.style}
                                </span>
                              )}
                              {prompt.usageCount > 0 && (
                                <span className="text-accent-teal">
                                  Used {prompt.usageCount}x
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {prompt.generatedPrompt}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-dark-700">
                <button
                  onClick={() => setShowPromptLibrary(false)}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
