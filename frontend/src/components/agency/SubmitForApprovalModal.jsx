import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SubmitForApprovalModal({ ad, client, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!ad.agencyClientId) {
      setError('This ad is not assigned to a client');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/agency/ads/${ad.id}/submit-for-approval`,
        { message: message.trim() || null },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onSuccess && onSuccess(response.data.approval);
        onClose();
      }
    } catch (err) {
      console.error('Error submitting for approval:', err);
      setError(err.response?.data?.message || 'Failed to submit ad for approval');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Submit for Approval</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Send this ad to {client?.clientName || client?.clientEmail} for approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Error</p>
                <p className="text-sm text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Ad Preview */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex gap-4">
              {/* Image Preview */}
              {ad.imageData && (
                <div className="w-48 h-48 flex-shrink-0 bg-background rounded-lg overflow-hidden border border-border">
                  <img
                    src={`data:${ad.imageMimeType || 'image/png'};base64,${ad.imageData}`}
                    alt={ad.headline}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Ad Details */}
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Headline</p>
                  <p className="text-sm font-semibold text-foreground">{ad.headline}</p>
                </div>
                {ad.description && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Description</p>
                    <p className="text-sm text-foreground">{ad.description}</p>
                  </div>
                )}
                {ad.primaryText && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Primary Text</p>
                    <p className="text-sm text-foreground line-clamp-3">{ad.primaryText}</p>
                  </div>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {ad.industry && <span>{ad.industry}</span>}
                  {ad.category && <span>• {ad.category}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          {client && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-xs text-accent font-medium mb-2">Submitting to:</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {client.clientName || 'Unnamed Client'}
                </p>
                <p className="text-sm text-muted-foreground">{client.clientEmail}</p>
                {client.clientCompany && (
                  <p className="text-sm text-muted-foreground">{client.clientCompany}</p>
                )}
              </div>
            </div>
          )}

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Message to Client <span className="text-muted-foreground">(Optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for your client (e.g., 'Please review and provide feedback by Friday...')"
              rows={4}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length} characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-xs text-primary font-medium mb-1">What happens next?</p>
            <ul className="text-xs text-foreground/80 space-y-1 list-disc list-inside">
              <li>Your client will receive a notification to review this ad</li>
              <li>They can approve, request changes, or reject the ad</li>
              <li>You'll be notified of their decision</li>
              <li>You can view all approvals in the Approvals dashboard</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !ad.agencyClientId}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Approval
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
