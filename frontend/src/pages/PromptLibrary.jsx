import { useState, useEffect } from 'react';
import { Search, BookOpen, Trash2, Copy, Check, Eye, Loader2, TrendingUp, Filter } from 'lucide-react';
import axios from 'axios';
import BrainLoader from '../components/BrainLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterStyle, setFilterStyle] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copied, setCopied] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadPrompts();
    loadStats();
  }, [searchQuery, filterIndustry, filterStyle]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterIndustry !== 'all') params.append('industry', filterIndustry);
      if (filterStyle !== 'all') params.append('style', filterStyle);

      const response = await axios.get(`${API_URL}/api/prompts?${params.toString()}`);
      if (response.data.success) {
        setPrompts(response.data.prompts);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/prompts/stats/summary`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const deletePrompt = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/prompts/${id}`);
      loadPrompts();
      loadStats();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt');
    }
  };

  const copyPrompt = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const industries = stats?.industries || [];
  const styles = stats?.styles || [];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold">Prompt Library</h1>
          </div>
          <p className="text-gray-400">
            Browse and manage your saved image generation prompts
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Prompts</p>
                  <p className="text-2xl font-bold text-primary-400">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-accent-teal">{stats.thisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-accent-teal/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent-teal" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Styles</p>
                  <p className="text-2xl font-bold text-accent-purple">{styles.length}</p>
                </div>
                <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center">
                  <Filter className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search prompts by idea or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="select-field md:w-48"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="select-field md:w-48"
          >
            <option value="all">All Styles</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="card py-8">
            <BrainLoader message="Loading prompts library..." />
          </div>
        ) : prompts.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Prompts Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or create a new prompt
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="card hover:border-primary-500/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                      {prompt.idea}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {prompt.industry && (
                        <span className="px-2 py-1 bg-dark-800 rounded">
                          {prompt.industry}
                        </span>
                      )}
                      {prompt.style && (
                        <span className="px-2 py-1 bg-dark-800 rounded">
                          {prompt.style}
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {prompt.usageCount > 0 && (
                      <span className="text-xs text-accent-teal bg-accent-teal/10 px-2 py-1 rounded">
                        Used {prompt.usageCount}x
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt Preview */}
                <div className="mb-4 p-3 bg-dark-800 rounded-lg">
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {prompt.generatedPrompt}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPrompt(prompt)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Full
                  </button>
                  <button
                    onClick={() => copyPrompt(prompt.id, prompt.generatedPrompt)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    {copied === prompt.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this prompt?')) {
                        deletePrompt(prompt.id);
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Prompt Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold mb-2">{selectedPrompt.idea}</h2>
              <div className="flex items-center gap-2 text-sm">
                {selectedPrompt.industry && (
                  <span className="px-2 py-1 bg-dark-800 rounded text-gray-400">
                    {selectedPrompt.industry}
                  </span>
                )}
                {selectedPrompt.style && (
                  <span className="px-2 py-1 bg-primary-500/10 rounded text-primary-400">
                    {selectedPrompt.style}
                  </span>
                )}
                {selectedPrompt.metadata?.suggestedColors && (
                  <span className="px-2 py-1 bg-accent-teal/10 rounded text-accent-teal">
                    {selectedPrompt.metadata.suggestedColors}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedPrompt.generatedPrompt}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-dark-700 flex gap-3">
              <button
                onClick={() => copyPrompt(selectedPrompt.id, selectedPrompt.generatedPrompt)}
                className="btn-primary flex-1"
              >
                {copied === selectedPrompt.id ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Prompt
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedPrompt(null)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
