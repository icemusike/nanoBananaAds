import { useState, useEffect } from 'react';
import { Wand2, Sparkles, Copy, Check, Loader2, BookOpen, Building2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import BrainLoader from '../components/BrainLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CreativePrompts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('Professional UGC');
  const [aspectRatio, setAspectRatio] = useState('Square (1:1)');
  const [colorPalette, setColorPalette] = useState('Bold professional colors');
  const [loading, setLoading] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [copied, setCopied] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    loadBrands();

    // Check if navigated from angle
    if (location.state?.fromAngle && location.state?.angleData) {
      loadAngleData(location.state.angleData);
    }
  }, []);

  const loadAngleData = (angleData) => {
    // Construct idea from angle data
    const angleIdea = `${angleData.angleName}: ${angleData.exampleHeadline}. Visual style: ${angleData.visualStyle}`;

    setIdea(angleIdea);
    setIndustry(angleData.industry || industry);

    // Map angle emotion to style
    const emotionToStyle = {
      'Fear': 'Bold Product-focused',
      'Desire': 'Results & ROI',
      'Trust': 'Professional UGC',
      'Curiosity': 'Authentic UGC',
      'Urgency': 'Bold Product-focused',
      'Belonging': 'Team Collaboration',
      'Status': 'Polished Professional',
      'Relief': 'Customer Testimonial',
      'Pride': 'Results & ROI'
    };

    if (angleData.targetEmotion && emotionToStyle[angleData.targetEmotion]) {
      setStyle(emotionToStyle[angleData.targetEmotion]);
    }
  };

  const loadBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const [brandsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/brands`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/user/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (brandsRes.data.success) {
        setBrands(brandsRes.data.brands);

        // Load default brand if set
        const defaultBrandId = settingsRes.data?.user?.defaultBrandId;
        if (defaultBrandId) {
          const defaultBrand = brandsRes.data.brands.find(b => b.id === defaultBrandId);
          if (defaultBrand) {
            handleSelectBrand(defaultBrand);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  const handleSelectBrand = async (brand) => {
    if (!brand) {
      setSelectedBrand(null);
      return;
    }

    setSelectedBrand(brand);

    // Auto-fill form with brand data
    setIndustry(brand.industry || industry);
    setColorPalette(brand.primaryColor || colorPalette);

    // Optionally use brand description as idea starter
    if (brand.valueProposition && !idea.trim()) {
      setIdea(brand.valueProposition);
    }

    // Increment brand usage count
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/brands/${brand.id}/use`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to update brand usage:', err);
    }
  };

  const industries = [
    'Phone Services',
    'Answering Services',
    'B2B Software/SaaS',
    'Healthcare',
    'Legal',
    'Finance',
    'Home Services',
    'E-commerce',
    'Education',
    'Other'
  ];

  const styles = [
    'Professional UGC',
    'Polished Professional',
    'Authentic UGC',
    'Bold Product-focused',
    'Customer Testimonial',
    'Team Collaboration',
    'Results & ROI'
  ];

  const aspectRatios = [
    'Square (1:1)',
    'Portrait (9:16)',
    'Landscape (16:9)',
    'Portrait Fullscreen (3:4)'
  ];

  const colorPalettes = [
    'Bold professional colors',
    'Navy and gold (authority)',
    'Teal and coral (modern)',
    'Blue and purple (tech)',
    'Warm natural tones',
    'High contrast black/yellow'
  ];

  const handleGenerate = async () => {
    if (!idea.trim()) {
      alert('Please enter your ad idea');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/prompts/generate`, {
        idea,
        industry,
        style,
        aspectRatio,
        colorPalette,
        saveToLibrary: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Add new prompt to the beginning of the array
        setGeneratedPrompts(prev => [{
          ...response.data,
          id: response.data.savedPrompt?.id || Date.now(),
          timestamp: new Date().toISOString()
        }, ...prev]);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Failed to generate prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (promptId, text) => {
    navigator.clipboard.writeText(text);
    setCopied(promptId);
    setTimeout(() => setCopied(null), 2000);
  };

  const useInCreateAd = (promptText) => {
    navigate('/app', {
      state: {
        fromPrompt: true,
        promptData: {
          generatedPrompt: promptText,
          idea,
          industry,
          style
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold">Creative Prompts</h1>
          </div>
          <p className="text-gray-400">
            Transform your simple idea into an optimized AI image generation prompt
          </p>
        </div>

        {/* Angle Loaded Indicator */}
        {location.state?.fromAngle && location.state?.angleData && (
          <div className="mb-6 p-4 bg-accent-teal/10 border border-accent-teal/20 rounded-lg flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-teal" />
            <div>
              <p className="text-accent-teal font-medium">Angle Loaded: {location.state.angleData.angleName}</p>
              <p className="text-xs text-gray-400 mt-1">Form has been auto-filled with angle data</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="card">
            {/* Brand Selector */}
            {brands.length > 0 && !location.state?.fromAngle && (
              <div className="mb-6 pb-6 border-b border-dark-700">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-400" />
                  Select Brand (Auto-fill)
                </label>
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
                  <div className="mt-2 p-2 bg-primary-500/10 border border-primary-500/20 rounded text-xs text-primary-300">
                    ✓ Loaded: {selectedBrand.name}
                  </div>
                )}
              </div>
            )}

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              Your Ad Idea
            </h2>

            {/* Idea Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Simple Idea *
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="E.g., Happy receptionist answering phone in modern office"
                className="input-field w-full h-32 resize-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe your ad concept in simple terms
              </p>
            </div>

            {/* Industry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="select-field w-full"
                disabled={loading}
              >
                <option value="">Select industry...</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="select-field w-full"
                disabled={loading}
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="select-field w-full"
                disabled={loading}
              >
                {aspectRatios.map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color Palette
              </label>
              <select
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value)}
                className="select-field w-full"
                disabled={loading}
              >
                {colorPalettes.map((cp) => (
                  <option key={cp} value={cp}>
                    {cp}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Optimized Prompt...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Prompt</span>
                </>
              )}
            </button>

            {/* View Library Button */}
            <button
              onClick={() => navigate('/prompt-library')}
              className="btn-secondary w-full mt-3 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>View Prompt Library</span>
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Generated Prompts</h2>

              {generatedPrompts.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-500">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Your optimized prompts will appear here</p>
                </div>
              )}

              {loading && (
                <div className="py-8">
                  <BrainLoader message="Creating your optimized prompt..." />
                </div>
              )}
            </div>

            {/* Prompts List */}
            {generatedPrompts.map((promptData, index) => (
              <div key={promptData.id} className="card hover:border-primary-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-400">
                    Prompt #{generatedPrompts.length - index}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(promptData.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-dark-800 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Style</p>
                    <p className="text-sm font-medium text-primary-400">
                      {promptData.prompt.style}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="text-sm font-medium text-accent-teal">
                      {promptData.prompt.promptType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Aspect Ratio</p>
                    <p className="text-sm font-medium">
                      {promptData.prompt.aspectRatio}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Colors</p>
                    <p className="text-sm font-medium">
                      {promptData.prompt.suggestedColors}
                    </p>
                  </div>
                </div>

                {/* Generated Prompt */}
                <div className="relative mb-4">
                  <div className="p-4 bg-dark-800 rounded-lg border border-dark-700 max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {promptData.prompt.generatedPrompt}
                    </p>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(promptData.id, promptData.prompt.generatedPrompt)}
                    className="absolute top-2 right-2 p-2 bg-dark-900/80 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied === promptData.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => useInCreateAd(promptData.prompt.generatedPrompt)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Use in Create Ad</span>
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Another</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
