import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClientPortal } from '../../context/ClientPortalContext';

export default function ClientPortalApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedApproval, setSelectedApproval] = useState(null);

  const { fetchApprovals, client, logout } = useClientPortal();

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await fetchApprovals({ status: filter === 'all' ? undefined : filter });
      setApprovals(data.approvals);
    } catch (err) {
      setError('Failed to load approvals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalComplete = () => {
    setSelectedApproval(null);
    loadApprovals();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Client Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {client?.name || client?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link
              to="/client-portal/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground pb-2 border-b-2 border-transparent transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/client-portal/ads"
              className="text-sm font-medium text-muted-foreground hover:text-foreground pb-2 border-b-2 border-transparent transition-colors"
            >
              My Ads
            </Link>
            <Link
              to="/client-portal/approvals"
              className="text-sm font-medium text-primary border-b-2 border-primary pb-2"
            >
              Approvals
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 bg-card border border-border rounded-lg p-1">
          {[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'changes_requested', label: 'Changes Requested' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'all', label: 'All' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading approvals...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && approvals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-2">No approvals found</p>
            <p className="text-sm text-muted-foreground">
              {filter === 'pending'
                ? 'No pending approvals at the moment'
                : `No ${filter} approvals`}
            </p>
          </div>
        )}

        {/* Approval Grid */}
        {!loading && approvals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onClick={() => setSelectedApproval(approval)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <ApprovalModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onComplete={handleApprovalComplete}
        />
      )}
    </div>
  );
}

function ApprovalCard({ approval, onClick }) {
  const isPending = approval.status === 'pending';

  return (
    <div
      onClick={onClick}
      className={`bg-card border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-all group ${
        isPending ? 'border-yellow-500/30' : 'border-border'
      }`}
    >
      {/* Image */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img
          src={approval.ad?.imageData}
          alt={approval.ad?.headline}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isPending && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Review Needed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">
          {approval.ad?.headline || 'Ad'}
        </h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>Submitted {new Date(approval.submittedAt).toLocaleDateString()}</span>
        </div>

        <StatusBadge status={approval.status} />

        {approval.feedback && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {approval.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalModal({ approval, onClose, onComplete }) {
  const [action, setAction] = useState(null); // 'approve', 'changes', 'reject'
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { approveAd, requestChanges, rejectAd } = useClientPortal();

  const isPending = approval.status === 'pending';

  const handleSubmit = async () => {
    if (!action) return;

    if ((action === 'changes' || action === 'reject') && !feedback.trim()) {
      setError('Please provide feedback');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (action === 'approve') {
        await approveAd(approval.id, feedback);
      } else if (action === 'changes') {
        await requestChanges(approval.id, feedback);
      } else if (action === 'reject') {
        await rejectAd(approval.id, feedback);
      }

      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAd = () => {
    const link = document.createElement('a');
    link.href = approval.ad.imageData;
    link.download = `${approval.ad.headline.substring(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Ad Approval</h2>
            <StatusBadge status={approval.status} />
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div>
              <img
                src={approval.ad.imageData}
                alt={approval.ad.headline}
                className="w-full rounded-lg border border-border mb-4"
              />
              <button
                onClick={downloadAd}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Download Ad
              </button>
            </div>

            {/* Right: Details & Actions */}
            <div className="space-y-6">
              {/* Ad Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Headline</h3>
                  <p className="font-semibold text-lg">{approval.ad.headline}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p>{approval.ad.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Primary Text</h3>
                  <p className="text-sm">{approval.ad.primaryText}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Call to Action</h3>
                  <p>{approval.ad.callToAction}</p>
                </div>
              </div>

              {/* Previous Feedback */}
              {approval.feedback && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Previous Feedback</h3>
                  <p className="text-sm">{approval.feedback}</p>
                </div>
              )}

              {/* Action Buttons (only if pending) */}
              {isPending && !action && (
                <div className="space-y-3">
                  <h3 className="font-medium">What would you like to do?</h3>
                  <button
                    onClick={() => setAction('approve')}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    ✓ Approve This Ad
                  </button>
                  <button
                    onClick={() => setAction('changes')}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    ✎ Request Changes
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    ✕ Reject This Ad
                  </button>
                </div>
              )}

              {/* Feedback Form */}
              {action && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {action === 'approve' && 'Add Comment (Optional)'}
                      {action === 'changes' && 'What Changes Are Needed?'}
                      {action === 'reject' && 'Why Are You Rejecting?'}
                    </h3>
                    <button
                      onClick={() => {
                        setAction(null);
                        setFeedback('');
                        setError(null);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      action === 'approve'
                        ? 'Add any comments...'
                        : action === 'changes'
                        ? 'Please describe the changes you\'d like...'
                        : 'Please explain why you\'re rejecting this ad...'
                    }
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y"
                    required={action !== 'approve'}
                  />

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmit}
                      disabled={loading || ((action === 'changes' || action === 'reject') && !feedback.trim())}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                        action === 'approve'
                          ? 'bg-green-500 hover:bg-green-600'
                          : action === 'changes'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-red-500 hover:bg-red-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? 'Submitting...' : `Confirm ${action === 'approve' ? 'Approval' : action === 'changes' ? 'Changes' : 'Rejection'}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-500/20 text-green-500' },
    changes_requested: { label: 'Changes Requested', color: 'bg-orange-500/20 text-orange-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-500' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}
