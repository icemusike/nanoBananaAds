import { useState, useEffect } from 'react';
import { Library, Search, Trash2, TrendingUp, Filter, Star, Sparkles, Target, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BrainLoader from '../components/BrainLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AnglesLibrary() {
  const navigate = useNavigate();
  const [angles, setAngles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [stats, setStats] = useState(null);
  const [expandedAngle, setExpandedAngle] = useState(null);
  const [ratingAngle, setRatingAngle] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchAngles();
    fetchStats();
  }, [selectedIndustry, selectedEmotion, sortBy]);

  const fetchAngles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        industry: selectedIndustry,
        targetEmotion: selectedEmotion,
        sortBy
      });

      const response = await axios.get(`${API_URL}/api/angles?${params}`);
      if (response.data.success) {
        setAngles(response.data.angles);
      }
    } catch (error) {
      console.error('Error fetching angles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/angles/stats/summary`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this angle?')) return;

    try {
      await axios.delete(`${API_URL}/api/angles/${id}`);
      setAngles(angles.filter(a => a.id !== id));
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting angle:', error);
      alert('Failed to delete angle');
    }
  };

  const handleRate = async (angleId) => {
    try {
      await axios.put(`${API_URL}/api/angles/${angleId}`, {
        performanceRating: rating
      });
      setRatingAngle(null);
      setRating(0);
      fetchAngles(); // Refresh
      alert('Rating saved!');
    } catch (error) {
      console.error('Error rating angle:', error);
      alert('Failed to save rating');
    }
  };

  const handleUseAngle = async (angle, type) => {
    try {
      // Track usage
      await axios.put(`${API_URL}/api/angles/${angle.id}/use`, { type });

      // Navigate with angle data
      if (type === 'prompt') {
        navigate('/creative-prompts', {
          state: {
            fromAngle: true,
            angleData: angle
          }
        });
      } else if (type === 'ad') {
        navigate('/', {
          state: {
            fromAngle: true,
            angleData: angle
          }
        });
      }
    } catch (error) {
      console.error('Error tracking angle usage:', error);
      // Navigate anyway
      if (type === 'prompt') {
        navigate('/creative-prompts', { state: { fromAngle: true, angleData: angle } });
      } else {
        navigate('/', { state: { fromAngle: true, angleData: angle } });
      }
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

  const filteredAngles = angles.filter(angle => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      angle.angleName?.toLowerCase().includes(search) ||
      angle.businessName?.toLowerCase().includes(search) ||
      angle.angleDescription?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Library className="w-8 h-8 text-primary-400" />
              <h1 className="text-3xl font-bold">Angles Library</h1>
            </div>
            <button
              onClick={() => navigate('/angles-generator')}
              className="btn-primary"
            >
              <Sparkles className="w-5 h-5" />
              Discover New Angles
            </button>
          </div>
          <p className="text-gray-400">
            Browse and manage your saved advertising angles
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Angles</p>
              <p className="text-3xl font-bold text-primary-400">{stats.total}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">This Month</p>
              <p className="text-3xl font-bold text-accent-teal">{stats.thisMonth}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Industries</p>
              <p className="text-3xl font-bold text-accent-purple">{stats.industries?.length || 0}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Most Used</p>
              <p className="text-sm font-medium text-gray-300 mt-2">
                {stats.mostUsed?.[0]?.angleName || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search angles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="select-field w-full"
              >
                <option value="all">All Industries</option>
                {stats?.industries?.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field w-full"
              >
                <option value="createdAt">Newest First</option>
                <option value="usageCount">Most Used</option>
                <option value="performanceRating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Angles Grid */}
        {loading ? (
          <div className="py-8">
            <BrainLoader message="Loading your angles library..." />
          </div>
        ) : filteredAngles.length === 0 ? (
          <div className="card text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Angles Found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'Start by generating some creative angles'}
            </p>
            <button
              onClick={() => navigate('/angles-generator')}
              className="btn-primary"
            >
              <Sparkles className="w-5 h-5" />
              Generate Angles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAngles.map((angle) => (
              <div
                key={angle.id}
                className="card hover:border-primary-500/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-primary-400">
                        {angle.angleName}
                      </h3>
                      {angle.performanceRating && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">{angle.performanceRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{angle.businessName}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(angle.targetEmotion)}`}>
                        {angle.targetEmotion}
                      </span>
                      {angle.industry && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-dark-700 text-gray-300">
                          {angle.industry}
                        </span>
                      )}
                      {angle.copyFramework && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent-purple/20 text-accent-purple">
                          {angle.copyFramework}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(angle.id)}
                    className="btn-secondary p-2 text-red-400 hover:bg-red-500/10"
                    title="Delete angle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-400 line-clamp-2">
                      {angle.angleDescription}
                    </p>
                  </div>

                  {expandedAngle === angle.id && (
                    <>
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
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-dark-700">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Used {angle.usageCount} times
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {angle._count?.prompts || 0} prompts
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {angle._count?.ads || 0} ads
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => setExpandedAngle(expandedAngle === angle.id ? null : angle.id)}
                    className="text-sm text-primary-400 hover:text-primary-300 mb-2"
                  >
                    {expandedAngle === angle.id ? 'Show Less' : 'Show More'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseAngle(angle, 'prompt')}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Prompt
                    </button>
                    <button
                      onClick={() => handleUseAngle(angle, 'ad')}
                      className="btn-secondary flex-1 text-sm py-2"
                    >
                      <Target className="w-4 h-4" />
                      Create Ad
                    </button>
                  </div>

                  {!angle.performanceRating && (
                    <button
                      onClick={() => setRatingAngle(angle.id)}
                      className="btn-secondary w-full text-sm py-2"
                    >
                      <Star className="w-4 h-4" />
                      Rate Performance
                    </button>
                  )}
                </div>

                {/* Rating Modal */}
                {ratingAngle === angle.id && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-md w-full">
                      <h3 className="text-xl font-semibold mb-4">Rate Angle Performance</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        How well did this angle perform in your campaigns?
                      </p>
                      <div className="flex gap-2 mb-6 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-10 h-10 ${
                                star <= rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRate(angle.id)}
                          disabled={rating === 0}
                          className="btn-primary flex-1"
                        >
                          Save Rating
                        </button>
                        <button
                          onClick={() => {
                            setRatingAngle(null);
                            setRating(0);
                          }}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
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
