import { useState, useEffect } from 'react';
import { Search, Calendar, Tag, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import AdDetailModal from '../components/AdDetailModal';
import BrainLoader from '../components/BrainLoader';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Lazy loading image component
function LazyAdImage({ ad, imageDataCache, onLoadImage }) {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (imageDataCache[ad.id]) {
        setImageData(imageDataCache[ad.id]);
        setLoading(false);
      } else {
        const data = await onLoadImage(ad.id);
        setImageData(data);
        setLoading(false);
      }
    };
    loadImage();
  }, [ad.id, imageDataCache]);

  if (loading || !imageData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-800">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={`data:${ad.image.imageData.mimeType};base64,${imageData}`}
      alt={ad.adCopy.headline}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}

export default function AdsLibrary() {
  const toast = useToast();
  const [savedAds, setSavedAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageDataCache, setImageDataCache] = useState({});

  // Load saved ads from database
  useEffect(() => {
    loadSavedAds();
  }, [searchQuery, filterIndustry]);

  const loadSavedAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterIndustry !== 'all') params.append('industry', filterIndustry);

      const response = await axios.get(`${API_URL}/api/ads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Transform API data to match expected format
        const transformedAds = response.data.ads.map(ad => ({
          id: ad.id,
          createdAt: ad.createdAt,
          image: {
            imageData: {
              mimeType: ad.imageMimeType,
              data: null, // Will be loaded on-demand
            },
            metadata: ad.imageMetadata,
          },
          adCopy: {
            headline: ad.headline,
            description: ad.description,
            primaryText: ad.primaryText,
            callToAction: ad.callToAction,
            alternativeHeadlines: ad.alternativeHeadlines,
            keyBenefits: ad.keyBenefits,
            toneAnalysis: ad.toneAnalysis,
          },
          formData: {
            description: ad.productDescription,
            targetAudience: ad.targetAudience,
            industry: ad.industry,
            category: ad.category,
            template: ad.template,
            tone: ad.tone,
            colorPalette: ad.colorPalette,
            aspectRatio: ad.aspectRatio,
            valueProposition: ad.valueProposition,
          },
        }));

        setSavedAds(transformedAds);
      }
    } catch (err) {
      console.error('Error loading ads:', err);
      setError('Failed to load ads from database');
    } finally {
      setLoading(false);
    }
  };

  const loadImageData = async (adId) => {
    // Return cached data if available
    if (imageDataCache[adId]) {
      return imageDataCache[adId];
    }

    try {
      const token = localStorage.getItem('token');
      // Use lightweight image-only endpoint to avoid memory overflow
      const response = await axios.get(`${API_URL}/api/ads/${adId}/image`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const imageData = response.data.imageData;
        // Cache the image data
        setImageDataCache(prev => ({ ...prev, [adId]: imageData }));
        return imageData;
      }
    } catch (err) {
      console.error('Error loading image data:', err);
      return null;
    }
  };

  const deleteAd = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/ads/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Reload ads after deletion
      loadSavedAds();
    } catch (err) {
      console.error('Error deleting ad:', err);
      toast.error('Failed to delete ad');
    }
  };

  const handleRegenerateCopy = async (ad) => {
    try {
      // Load image data if not already loaded
      let imageData = ad.image.imageData.data;
      if (!imageData) {
        imageData = await loadImageData(ad.id);
        if (!imageData) {
          toast.error('Failed to load image data. Please try again.');
          return;
        }
      }

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('You must be logged in to create copy variations');
        return;
      }

      // Generate new copy using the regenerate-copy endpoint
      const response = await axios.post(`${API_URL}/api/generate/regenerate-copy`, {
        description: ad.formData.description,
        targetAudience: ad.formData.targetAudience,
        industry: ad.formData.industry,
        imageDescription: ad.formData.description,
        tone: ad.formData.tone,
        copywritingStyle: 'default',
        valueProposition: ad.formData.valueProposition,
        callToAction: ad.adCopy.callToAction,
        model: 'gpt-4o-2024-08-06'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Save the new variation to database with the same image but new copy
        await axios.post(`${API_URL}/api/ads`, {
          imageData: imageData,
          imageMimeType: ad.image.imageData.mimeType,
          imageMetadata: ad.image.metadata,
          adCopy: response.data.copy.adCopy,
          formData: ad.formData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Close modal and reload
        setSelectedAd(null);
        toast.success('Copy variation created successfully!');
        loadSavedAds();
      } else {
        toast.error('Failed to generate copy variation');
      }
    } catch (err) {
      console.error('Copy regeneration error:', err);
      toast.error(err.response?.data?.error || 'Failed to generate copy variation. Please try again.');
    }
  };

  const downloadImage = async (ad) => {
    const imageData = await loadImageData(ad.id);
    if (imageData) {
      const link = document.createElement('a');
      link.href = `data:${ad.image.imageData.mimeType};base64,${imageData}`;
      link.download = `adgenius-ai-ad-${ad.id}.png`;
      link.click();
    }
  };

  // Filtered ads (already filtered by API based on search and industry)
  const filteredAds = savedAds;

  // Get unique industries for filter
  const industries = ['all', ...new Set(savedAds.map(ad => ad.formData.industry))];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ads Library</h1>
          <p className="text-gray-400">Browse and manage your generated Facebook ads</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search ads by headline, text, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Industry Filter */}
          <div className="md:w-64">
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="select-field w-full"
            >
              <option value="all">All Industries</option>
              {industries.filter(i => i !== 'all').map(industry => (
                <option key={industry} value={industry}>
                  {industry.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Ads</p>
                <p className="text-2xl font-bold text-primary-400">{savedAds.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-2xl font-bold text-accent-teal">
                  {savedAds.filter(ad => {
                    const adDate = new Date(ad.createdAt);
                    const now = new Date();
                    return adDate.getMonth() === now.getMonth() &&
                           adDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-teal/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-teal" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Filtered Results</p>
                <p className="text-2xl font-bold text-accent-purple">{filteredAds.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8 mb-8">
            <p className="text-red-300">{error}</p>
            <button
              onClick={loadSavedAds}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="card py-8">
            <BrainLoader message="Loading your ads library..." />
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {savedAds.length === 0 ? 'No Ads Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {savedAds.length === 0
                ? 'Start creating amazing Facebook ads and they will appear here'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="card group hover:border-primary-500/30 transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-dark-800">
                  <LazyAdImage
                    ad={ad}
                    imageDataCache={imageDataCache}
                    onLoadImage={loadImageData}
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={async () => {
                        // Load full ad data before opening modal
                        const imageData = await loadImageData(ad.id);
                        setSelectedAd({ ...ad, image: { ...ad.image, imageData: { ...ad.image.imageData, data: imageData } } });
                      }}
                      className="p-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => downloadImage(ad)}
                      className="p-2 bg-accent-teal hover:bg-accent-teal/80 rounded-lg transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this ad?')) {
                          deleteAd(ad.id);
                        }
                      }}
                      className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                      title="Delete Ad"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Ad Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {ad.adCopy.headline}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {ad.adCopy.primaryText}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-dark-700">
                    <span className="px-2 py-1 bg-dark-800 rounded">
                      {ad.formData.industry?.replace(/_/g, ' ')}
                    </span>
                    <span>•</span>
                    <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Detail Modal */}
      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onDelete={(adId) => {
            deleteAd(adId);
            setSelectedAd(null);
          }}
          onDownload={downloadImage}
          onRegenerateCopy={handleRegenerateCopy}
        />
      )}
    </div>
  );
}
