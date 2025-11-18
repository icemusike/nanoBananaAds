import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Check, X, Upload, Star, StarOff, Palette, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import BrainLoader from '../components/BrainLoader';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Info Tooltip Component
function InfoTooltip({ text }) {
  return (
    <div className="group relative inline-block">
      <Info className="w-4 h-4 text-gray-500 hover:text-primary-400 cursor-help transition-colors" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 z-50">
        <div className="bg-dark-800 text-gray-200 text-xs rounded-lg p-3 shadow-xl border border-dark-600">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-dark-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrandsManager() {
  const toast = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [defaultBrandId, setDefaultBrandId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tagline: '',
    logo: '',
    logoMimeType: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    colorPalette: '',
    industry: '',
    targetAudience: '',
    brandVoice: '',
    tone: 'professional yet approachable',
    valueProposition: '',
    keyMessages: [],
    brandGuidelines: '',
    websiteUrl: '',
    socialMediaLinks: {}
  });

  const industries = [
    'Tech/SaaS',
    'E-commerce',
    'Healthcare',
    'Finance',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Fashion & Apparel',
    'Professional Services',
    'Other'
  ];

  const toneOptions = [
    'professional yet approachable',
    'friendly and casual',
    'authoritative and expert',
    'playful and energetic',
    'empathetic and caring',
    'bold and confident'
  ];

  useEffect(() => {
    loadBrands();
    loadDefaultBrand();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBrands(response.data.brands);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Failed to load brands. Please try logging in again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultBrand = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/user/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.user) {
        setDefaultBrandId(response.data.user.defaultBrandId);
      }
    } catch (error) {
      console.error('Error loading default brand:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result.split(',')[1], // Base64 without prefix
          logoMimeType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingBrand) {
        // Update existing brand
        const response = await axios.put(`${API_URL}/api/brands/${editingBrand.id}`, formData, { headers });
        if (response.data.success) {
          await loadBrands();
          resetForm();
        }
      } else {
        // Create new brand
        const response = await axios.post(`${API_URL}/api/brands`, formData, { headers });
        if (response.data.success) {
          await loadBrands();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Failed to save brand. Please try again.');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
      tagline: brand.tagline || '',
      logo: brand.logo || '',
      logoMimeType: brand.logoMimeType || '',
      primaryColor: brand.primaryColor || '#3B82F6',
      secondaryColor: brand.secondaryColor || '#10B981',
      accentColor: brand.accentColor || '#F59E0B',
      colorPalette: brand.colorPalette || '',
      industry: brand.industry || '',
      targetAudience: brand.targetAudience || '',
      brandVoice: brand.brandVoice || '',
      tone: brand.tone || 'professional yet approachable',
      valueProposition: brand.valueProposition || '',
      keyMessages: brand.keyMessages || [],
      brandGuidelines: brand.brandGuidelines || '',
      websiteUrl: brand.websiteUrl || '',
      socialMediaLinks: brand.socialMediaLinks || {}
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        await loadBrands();
        if (defaultBrandId === id) {
          setDefaultBrandId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand. Please try again.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/brands/${id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDefaultBrandId(id);
      }
    } catch (error) {
      console.error('Error setting default brand:', error);
      toast.error('Failed to set default brand. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tagline: '',
      logo: '',
      logoMimeType: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      colorPalette: '',
      industry: '',
      targetAudience: '',
      brandVoice: '',
      tone: 'professional yet approachable',
      valueProposition: '',
      keyMessages: [],
      brandGuidelines: '',
      websiteUrl: '',
      socialMediaLinks: {}
    });
    setEditingBrand(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <BrainLoader message="Loading your brands..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-primary-400" />
              <h1 className="text-3xl font-bold">Brand Manager</h1>
            </div>
            <p className="text-gray-400">Manage your brands and speed up ad creation</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Brand</span>
          </button>
        </div>

        {/* Brand Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-8 flex items-center justify-center">
              <div className="card max-w-4xl w-full my-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label flex items-center gap-2">
                      Brand Name *
                      <InfoTooltip text="Enter your brand or company name. This will be used throughout the ad generation process." />
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input-field w-full"
                      placeholder="Acme Inc."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label flex items-center gap-2">
                      Brand Description *
                      <InfoTooltip text="Describe what your brand does, what products/services you offer, and who you serve. This helps AI create more targeted ads." />
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="input-field w-full h-24 resize-none"
                      placeholder="What does your brand do? Who do you serve?"
                      required
                    />
                  </div>

                  <div>
                    <label className="label flex items-center gap-2">
                      Tagline
                      <InfoTooltip text="Your brand's memorable slogan or catchphrase that summarizes what you stand for." />
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => handleInputChange('tagline', e.target.value)}
                      className="input-field w-full"
                      placeholder="Your brand's slogan"
                    />
                  </div>

                  <div>
                    <label className="label flex items-center gap-2">
                      Website URL
                      <InfoTooltip text="Your brand's website address. This helps provide context for ad generation." />
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className="input-field w-full"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="label flex items-center gap-2">
                      Industry
                      <InfoTooltip text="Select your industry to get more relevant ad templates and copy suggestions." />
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="select-field w-full"
                    >
                      <option value="">Select industry...</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label flex items-center gap-2">
                      Brand Tone
                      <InfoTooltip text="Choose the communication style that best represents your brand's personality in ads." />
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                      className="select-field w-full"
                    >
                      {toneOptions.map(tone => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="label flex items-center gap-2">
                    Brand Logo
                    <InfoTooltip text="Upload your brand logo to include it in generated ads. Supports PNG, JPG, or SVG formats." />
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logo && (
                      <img
                        src={`data:${formData.logoMimeType};base64,${formData.logo}`}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                      />
                    )}
                    <label className="btn-secondary cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Brand Colors */}
                <div>
                  <label className="label flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Brand Colors
                    <InfoTooltip text="Define your brand's color palette. These colors will be used in ad designs to maintain brand consistency." />
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="input-field flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="input-field flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => handleInputChange('accentColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.accentColor}
                          onChange={(e) => handleInputChange('accentColor', e.target.value)}
                          className="input-field flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="label flex items-center gap-2">
                    Target Audience
                    <InfoTooltip text="Describe your ideal customers: demographics, interests, pain points, and behaviors. This helps create more resonant ad copy." />
                  </label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="input-field w-full h-20 resize-none"
                    placeholder="E.g., Small business owners aged 30-50 who struggle with marketing..."
                  />
                </div>

                {/* Value Proposition */}
                <div>
                  <label className="label flex items-center gap-2">
                    Value Proposition
                    <InfoTooltip text="What makes your brand unique? What specific benefits do you offer that competitors don't?" />
                  </label>
                  <textarea
                    value={formData.valueProposition}
                    onChange={(e) => handleInputChange('valueProposition', e.target.value)}
                    className="input-field w-full h-20 resize-none"
                    placeholder="E.g., We help businesses increase sales by 3x with AI-powered ads in minutes..."
                  />
                </div>

                {/* Brand Voice */}
                <div>
                  <label className="label flex items-center gap-2">
                    Brand Voice & Personality
                    <InfoTooltip text="Describe how your brand speaks: Are you formal or casual? Funny or serious? Technical or simple? This shapes the ad copy style." />
                  </label>
                  <textarea
                    value={formData.brandVoice}
                    onChange={(e) => handleInputChange('brandVoice', e.target.value)}
                    className="input-field w-full h-20 resize-none"
                    placeholder="E.g., We're friendly and approachable but knowledgeable. We use simple language and avoid jargon..."
                  />
                </div>

                {/* Brand Guidelines */}
                <div>
                  <label className="label flex items-center gap-2">
                    Brand Guidelines & Notes
                    <InfoTooltip text="Any specific rules, restrictions, or preferences for your brand? Words to avoid? Messaging guidelines? Add them here." />
                  </label>
                  <textarea
                    value={formData.brandGuidelines}
                    onChange={(e) => handleInputChange('brandGuidelines', e.target.value)}
                    className="input-field w-full h-24 resize-none"
                    placeholder="E.g., Never use sales-y language, always emphasize security, avoid using 'cheap' or 'discount'..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>{editingBrand ? 'Update Brand' : 'Create Brand'}</span>
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
            </div>
          </div>
        )}

        {/* Brands Grid */}
        {brands.length === 0 ? (
          <div className="card text-center py-16">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No brands yet</h3>
            <p className="text-gray-400 mb-6">Create your first brand to speed up ad creation</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add Your First Brand</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map(brand => (
              <div key={brand.id} className="card hover:border-primary-500/30 transition-all">
                {/* Brand Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {brand.logo ? (
                      <img
                        src={`data:${brand.logoMimeType};base64,${brand.logo}`}
                        alt={brand.name}
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{brand.name}</h3>
                      {brand.tagline && (
                        <p className="text-xs text-gray-400 italic">{brand.tagline}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSetDefault(brand.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      defaultBrandId === brand.id
                        ? 'bg-accent-teal/20 text-accent-teal'
                        : 'hover:bg-dark-700 text-gray-400'
                    }`}
                    title={defaultBrandId === brand.id ? 'Default brand' : 'Set as default'}
                  >
                    {defaultBrandId === brand.id ? (
                      <Star className="w-5 h-5 fill-current" />
                    ) : (
                      <StarOff className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Brand Info */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-300 line-clamp-2">{brand.description}</p>

                  {brand.industry && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 rounded">
                        {brand.industry}
                      </span>
                    </div>
                  )}

                  {/* Color Palette */}
                  {(brand.primaryColor || brand.secondaryColor || brand.accentColor) && (
                    <div className="flex gap-2 pt-2">
                      {brand.primaryColor && (
                        <div
                          className="w-8 h-8 rounded-lg border border-dark-600"
                          style={{ backgroundColor: brand.primaryColor }}
                          title={brand.primaryColor}
                        />
                      )}
                      {brand.secondaryColor && (
                        <div
                          className="w-8 h-8 rounded-lg border border-dark-600"
                          style={{ backgroundColor: brand.secondaryColor }}
                          title={brand.secondaryColor}
                        />
                      )}
                      {brand.accentColor && (
                        <div
                          className="w-8 h-8 rounded-lg border border-dark-600"
                          style={{ backgroundColor: brand.accentColor }}
                          title={brand.accentColor}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Brand Actions */}
                <div className="flex gap-2 pt-4 border-t border-dark-700">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="btn-secondary flex-1 text-sm py-2 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="btn-secondary text-sm py-2 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Usage Count */}
                {brand.usageCount > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Used {brand.usageCount} time{brand.usageCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
