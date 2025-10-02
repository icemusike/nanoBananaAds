import { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, TrendingUp, BookmarkPlus, Loader2, Target, Zap, Save, Library, Building2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AnglesGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    industry: '',
    targetAudience: '',
    currentApproach: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const [brandsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/brands`),
        axios.get(`${API_URL}/user/settings`)
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
    setFormData(prev => ({
      ...prev,
      businessName: brand.name || prev.businessName,
      businessDescription: brand.description || prev.businessDescription,
      industry: brand.industry || prev.industry,
      targetAudience: brand.targetAudience || prev.targetAudience
    }));

    // Increment brand usage count
    try {
      await axios.put(`${API_URL}/brands/${brand.id}/use`);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.businessName.trim() || !formData.businessDescription.trim()) {
      alert('Please enter business name and description');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/angles/generate`, {
        ...formData,
        saveToLibrary: true // Auto-save all angles to library
      });

      if (response.data.success) {
        setGeneratedData(response.data);
        // Show success message if angles were saved
        if (response.data.savedAngles && response.data.savedAngles.length > 0) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
          console.log(`✅ Saved ${response.data.savedAngles.length} angles to library`);
        }
      }
    } catch (error) {
      console.error('Error generating angles:', error);
      alert('Failed to generate angles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'Fear': 'text-red-400 bg-red-500/10',
      'Desire': 'text-purple-400 bg-purple-500/10',
      'Trust': 'text-blue-400 bg-blue-500/10',
      'Curiosity': 'text-yellow-400 bg-yellow-500/10',
      'Urgency': 'text-orange-400 bg-orange-500/10',
      'Belonging': 'text-green-400 bg-green-500/10',
      'Status': 'text-indigo-400 bg-indigo-500/10',
      'Relief': 'text-teal-400 bg-teal-500/10',
      'Pride': 'text-pink-400 bg-pink-500/10',
      'Anger': 'text-rose-400 bg-rose-500/10'
    };
    return colors[emotion] || 'text-gray-400 bg-gray-500/10';
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold">Discover Ad Angles</h1>
          </div>
          <p className="text-gray-400">
            Uncover creative advertising strategies you haven't thought of yet
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <Library className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-300 font-medium">Angles Saved Successfully!</p>
              <p className="text-green-200 text-sm">
                {generatedData?.savedAngles?.length || 0} angles have been added to your Angles Library
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Brand Selector */}
            {brands.length > 0 && (
              <div className="card">
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
                  disabled={loading}
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

            <div className="card space-y-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                Your Business
              </h2>

              {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="E.g., Acme Virtual Receptionists"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe what your business does, who you serve, and what problems you solve..."
                className="input-field w-full h-32 resize-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about your services and target market
              </p>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
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

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="E.g., Small business owners, Healthcare practices"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {/* Current Approach */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Marketing Approach (Optional)
              </label>
              <textarea
                value={formData.currentApproach}
                onChange={(e) => handleInputChange('currentApproach', e.target.value)}
                placeholder="Describe how you currently market your business. This helps us suggest fresh angles you're NOT using yet..."
                className="input-field w-full h-24 resize-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll suggest angles that differentiate from your current approach
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !formData.businessName.trim() || !formData.businessDescription.trim()}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Discovering Creative Angles...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Angles
                </>
              )}
            </button>

            {/* View Library Button */}
            <button
              onClick={() => navigate('/angles-library')}
              className="btn-secondary w-full"
            >
              <Library className="w-5 h-5" />
              View Angles Library
            </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {!generatedData && !loading && (
              <div className="card text-center py-16 text-gray-500">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Your creative ad angles will appear here</p>
              </div>
            )}

            {loading && (
              <div className="card text-center py-16">
                <Loader2 className="w-16 h-16 text-primary-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">
                  Analyzing your business and discovering creative angles...
                </p>
              </div>
            )}

            {generatedData && !loading && (
              <>
                {/* Strategic Insights */}
                <div className="card bg-gradient-to-br from-primary-500/10 to-accent-teal/10 border-primary-500/20">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" />
                    Strategic Insights
                  </h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div>
                      <p className="font-medium text-primary-400 mb-1">Industry Analysis</p>
                      <p>{generatedData.insights?.industryInsights}</p>
                    </div>
                    <div>
                      <p className="font-medium text-accent-teal mb-1">Competitive Gaps</p>
                      <p>{generatedData.insights?.competitiveGaps}</p>
                    </div>
                  </div>
                </div>

                {/* Generated Angles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    Your Creative Angles ({generatedData.angles?.length || 0})
                  </h3>

                  {generatedData.angles?.map((angle, index) => (
                    <div
                      key={index}
                      className="card hover:border-primary-500/30 transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-primary-400 mb-2">
                            {angle.angleName}
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEmotionColor(angle.targetEmotion)}`}>
                              {angle.targetEmotion}
                            </span>
                            {angle.copyFramework && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-700 text-gray-300">
                                {angle.copyFramework}
                              </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 flex items-center gap-1">
                              <Library className="w-3 h-3" />
                              Saved
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-300 mb-1">Strategy:</p>
                          <p className="text-gray-400">{angle.angleDescription}</p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-300 mb-1">Why It Works:</p>
                          <p className="text-gray-400">{angle.whyItWorks}</p>
                        </div>

                        <div className="p-3 bg-dark-800 rounded-lg border border-dark-700">
                          <p className="font-medium text-gray-300 mb-1">Example Headline:</p>
                          <p className="text-primary-400 font-medium">{angle.exampleHeadline}</p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-300 mb-1">Visual Style:</p>
                          <p className="text-gray-400">{angle.visualStyle}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-dark-700">
                        <button
                          onClick={() => {
                            // Navigate to Creative Prompts with angle context
                            navigate('/creative-prompts', {
                              state: {
                                fromAngle: true,
                                angleData: {
                                  ...angle,
                                  businessName: formData.businessName,
                                  industry: formData.industry
                                }
                              }
                            });
                          }}
                          className="btn-primary flex-1 text-sm py-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate Image Prompt
                        </button>
                        <button
                          onClick={() => {
                            // Navigate to Create Ad with angle context
                            navigate('/', {
                              state: {
                                fromAngle: true,
                                angleData: {
                                  ...angle,
                                  businessName: formData.businessName,
                                  businessDescription: formData.businessDescription
                                }
                              }
                            });
                          }}
                          className="btn-secondary flex-1 text-sm py-2"
                        >
                          <Target className="w-4 h-4" />
                          Create Ad
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
