import { useState } from 'react';
import { Download, Copy, Check, AlertCircle, Eye, FileText, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function ResultsSection({ results, formData, onRegenerateCopy }) {
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [regeneratingCopy, setRegeneratingCopy] = useState(false);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadImage = async () => {
    if (results.image?.imageData?.data) {
      // Create a link and download base64 image
      const link = document.createElement('a');
      link.href = `data:${results.image.imageData.mimeType};base64,${results.image.imageData.data}`;
      link.download = `adgenius-ai-ad-${Date.now()}.png`;
      link.click();
    }
  };

  const downloadCopyAsText = () => {
    if (!results.copy?.adCopy) return;

    const copy = results.copy.adCopy;
    const text = `FACEBOOK AD COPY
Generated: ${new Date().toLocaleString()}

HEADLINE:
${copy.headline}

DESCRIPTION:
${copy.description}

PRIMARY TEXT:
${copy.primaryText}

CALL TO ACTION:
${copy.callToAction}

---
Generated with AdGenius AI 🧠
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-copy-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    downloadImage();
    downloadCopyAsText();
  };

  const adCopy = results.copy?.adCopy;
  const imageSuccess = results.image?.success;
  const copySuccess = results.copy?.success;

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Ad Creative</h2>
        <button
          onClick={downloadAll}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </div>
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Details
          </div>
        </button>
      </div>

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Image */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Ad Image</h3>
              {imageSuccess && (
                <button
                  onClick={downloadImage}
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>

            {imageSuccess && results.image.imageData ? (
              <div className="relative bg-dark-800 rounded-lg overflow-hidden">
                <img
                  src={`data:${results.image.imageData.mimeType};base64,${results.image.imageData.data}`}
                  alt="Generated ad"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="bg-dark-800 rounded-lg p-8 text-center border-2 border-dashed border-dark-600">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-yellow-400 font-medium mb-2">Image Generation Note</p>
                <p className="text-gray-400 text-sm">
                  {results.image?.error || results.image?.message || 'Image generation is currently experimental'}
                </p>
                {results.image?.textResponse && (
                  <details className="mt-4 text-left">
                    <summary className="text-primary-400 cursor-pointer text-sm">
                      View AI Response
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap bg-dark-900 p-3 rounded">
                      {results.image.textResponse}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Ad Copy */}
          {copySuccess && adCopy && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Ad Copy</h3>
                {onRegenerateCopy && (
                  <button
                    onClick={async () => {
                      setRegeneratingCopy(true);
                      await onRegenerateCopy();
                      setRegeneratingCopy(false);
                    }}
                    disabled={regeneratingCopy}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${regeneratingCopy ? 'animate-spin' : ''}`} />
                    {regeneratingCopy ? 'Regenerating...' : 'Regenerate Copy'}
                  </button>
                )}
              </div>

              {/* Headline */}
              <div className="bg-dark-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Headline ({adCopy.headline?.length || 0}/40)
                  </span>
                  <button
                    onClick={() => copyToClipboard(adCopy.headline, 'headline')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {copiedField === 'headline' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-lg font-semibold">{adCopy.headline}</p>
              </div>

              {/* Description */}
              <div className="bg-dark-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Description ({adCopy.description?.length || 0}/30)
                  </span>
                  <button
                    onClick={() => copyToClipboard(adCopy.description, 'description')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {copiedField === 'description' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="font-medium">{adCopy.description}</p>
              </div>

              {/* Primary Text */}
              <div className="bg-dark-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Primary Text
                  </span>
                  <button
                    onClick={() => copyToClipboard(adCopy.primaryText, 'primary')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {copiedField === 'primary' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{adCopy.primaryText}</p>
              </div>

              {/* Call to Action */}
              <div className="bg-dark-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Call to Action
                  </span>
                  <button
                    onClick={() => copyToClipboard(adCopy.callToAction, 'cta')}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {copiedField === 'cta' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="font-semibold text-primary-400">{adCopy.callToAction}</p>
              </div>
            </div>
          )}

          {!copySuccess && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">
                {results.copy?.error || 'Failed to generate ad copy'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Validation */}
          {results.copy?.validation && (
            <div>
              <h3 className="font-semibold mb-3">Copy Validation</h3>
              <div className="space-y-2 text-sm">
                {results.copy.validation.issues?.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                    <p className="font-medium text-red-300 mb-2">Issues:</p>
                    <ul className="space-y-1 text-red-200">
                      {results.copy.validation.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.copy.validation.warnings?.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                    <p className="font-medium text-yellow-300 mb-2">Warnings:</p>
                    <ul className="space-y-1 text-yellow-200">
                      {results.copy.validation.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.copy.validation.isValid && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                    <p className="text-green-300 font-medium">✓ All validation checks passed!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alternative Headlines */}
          {adCopy?.alternativeHeadlines?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Alternative Headlines for A/B Testing</h3>
              <div className="space-y-2">
                {adCopy.alternativeHeadlines.map((headline, i) => (
                  <div key={i} className="bg-dark-800 rounded p-3 flex items-start justify-between">
                    <span className="text-sm">{headline}</span>
                    <button
                      onClick={() => copyToClipboard(headline, `alt-${i}`)}
                      className="text-gray-400 hover:text-primary-400 ml-2 flex-shrink-0"
                    >
                      {copiedField === `alt-${i}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Benefits */}
          {adCopy?.keyBenefits?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Key Benefits Highlighted</h3>
              <ul className="space-y-2">
                {adCopy.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary-400 flex-shrink-0">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prompt Validation */}
          {results.prompt?.validation && (
            <div>
              <h3 className="font-semibold mb-3">Prompt Quality Score</h3>
              <div className="bg-dark-800 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Quality Score</span>
                  <span className="font-bold text-primary-400">
                    {(results.prompt.validation.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-accent-teal"
                    style={{ width: `${results.prompt.validation.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
