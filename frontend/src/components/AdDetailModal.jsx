import { X, Download, Trash2, Copy, Check, Calendar, Tag, Zap } from 'lucide-react';
import { useState } from 'react';

export default function AdDetailModal({ ad, onClose, onDelete, onDownload }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-900 border border-dark-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-2xl font-bold mb-1">Ad Details</h2>
            <p className="text-sm text-gray-400">
              Created {formatDate(ad.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Image */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-800 mb-4">
                <img
                  src={`data:${ad.image.imageData.mimeType};base64,${ad.image.imageData.data}`}
                  alt={ad.adCopy.headline}
                  className="w-full h-full object-cover"
                />

                {/* Model Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    ad.image.metadata?.model === 'dall-e-3'
                      ? 'bg-yellow-500 text-yellow-950'
                      : 'bg-green-500 text-green-950'
                  }`}>
                    {ad.image.metadata?.model === 'dall-e-3' ? '⚡ DALL-E 3' : '✓ Gemini'}
                  </div>
                </div>
              </div>

              {/* Image Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onDownload(ad)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this ad?')) {
                      onDelete(ad.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Created:</span>
                  <span className="text-gray-300">{formatDate(ad.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Industry:</span>
                  <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs">
                    {ad.formData.industry?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Category:</span>
                  <span className="text-gray-300">
                    {ad.formData.category?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Ad Copy */}
            <div className="space-y-6">
              {/* Headline */}
              <div className="card bg-dark-800/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-primary-400">Headline</label>
                  <button
                    onClick={() => copyToClipboard(ad.adCopy.headline, 'headline')}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'headline' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-lg font-semibold">{ad.adCopy.headline}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {ad.adCopy.headline?.length} characters
                </p>
              </div>

              {/* Description */}
              <div className="card bg-dark-800/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-primary-400">Description</label>
                  <button
                    onClick={() => copyToClipboard(ad.adCopy.description, 'description')}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'description' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-sm">{ad.adCopy.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {ad.adCopy.description?.length} characters
                </p>
              </div>

              {/* Primary Text */}
              <div className="card bg-dark-800/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-primary-400">Primary Text</label>
                  <button
                    onClick={() => copyToClipboard(ad.adCopy.primaryText, 'primaryText')}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'primaryText' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{ad.adCopy.primaryText}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {ad.adCopy.primaryText?.length} characters
                </p>
              </div>

              {/* Call to Action */}
              <div className="card bg-dark-800/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-primary-400">Call to Action</label>
                  <button
                    onClick={() => copyToClipboard(ad.adCopy.callToAction, 'cta')}
                    className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'cta' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-sm">{ad.adCopy.callToAction}</p>
              </div>

              {/* Alternative Headlines */}
              {ad.adCopy.alternativeHeadlines && ad.adCopy.alternativeHeadlines.length > 0 && (
                <div className="card bg-dark-800/50">
                  <label className="text-sm font-semibold text-primary-400 mb-2 block">
                    Alternative Headlines
                  </label>
                  <ul className="space-y-2">
                    {ad.adCopy.alternativeHeadlines.map((headline, index) => (
                      <li
                        key={index}
                        className="text-sm p-2 bg-dark-700 rounded flex items-start justify-between gap-2"
                      >
                        <span>{headline}</span>
                        <button
                          onClick={() => copyToClipboard(headline, `alt-${index}`)}
                          className="flex-shrink-0 p-1 hover:bg-dark-600 rounded transition-colors"
                        >
                          {copiedField === `alt-${index}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Audience & Description */}
              <div className="card bg-dark-800/50">
                <label className="text-sm font-semibold text-primary-400 mb-2 block">
                  Campaign Details
                </label>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Target Audience:</span>
                    <span className="ml-2 text-gray-300">{ad.formData.targetAudience}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <span className="ml-2 text-gray-300">{ad.formData.description}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tone:</span>
                    <span className="ml-2 text-gray-300">{ad.formData.tone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
