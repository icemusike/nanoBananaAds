import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClientPortal } from '../../context/ClientPortalContext';

export default function ClientPortalAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [loadingAd, setLoadingAd] = useState(false);

  const { fetchAds, fetchAd, client, logout } = useClientPortal();

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await fetchAds({ search });
      setAds(data.ads);
    } catch (err) {
      setError('Failed to load ads. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAds();
  };

  const handleAdClick = async (ad) => {
    try {
      setLoadingAd(true);
      const fullAd = await fetchAd(ad.id);
      setSelectedAd(fullAd.ad);
    } catch (err) {
      console.error('Error fetching ad details:', err);
      setError('Failed to load ad details. Please try again.');
    } finally {
      setLoadingAd(false);
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.headline.toLowerCase().includes(search.toLowerCase()) ||
    ad.description.toLowerCase().includes(search.toLowerCase())
  );

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
              className="text-sm font-medium text-primary border-b-2 border-primary pb-2"
            >
              My Ads
            </Link>
            <Link
              to="/client-portal/approvals"
              className="text-sm font-medium text-muted-foreground hover:text-foreground pb-2 border-b-2 border-transparent transition-colors"
            >
              Approvals
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ads..."
            className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ads...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && filteredAds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-2">No ads found</p>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try a different search term' : 'Your agency hasn\'t created any ads yet'}
            </p>
          </div>
        )}

        {/* Ad Grid */}
        {!loading && filteredAds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onClick={() => handleAdClick(ad)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ad Detail Modal */}
      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          loading={loadingAd}
        />
      )}

      {/* Loading Overlay */}
      {loadingAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Loading ad details...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AdCard({ ad, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-all group"
    >
      {/* Image Placeholder */}
      <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center">
        {ad.imageData ? (
          <img
            src={ad.imageData}
            alt={ad.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-muted-foreground text-center p-4">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm">Click to view ad</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{ad.headline}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {ad.description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
          {ad.project && <span className="truncate ml-2">{ad.project.name}</span>}
        </div>

        {/* Approval Status */}
        {ad.approvals && ad.approvals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <StatusBadge status={ad.approvals[0].status} />
          </div>
        )}
      </div>
    </div>
  );
}

function AdDetailModal({ ad, onClose }) {
  const downloadAd = () => {
    const link = document.createElement('a');
    link.href = ad.imageData;
    link.download = `${ad.headline.substring(0, 30)}.png`;
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
        className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Ad Details</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <img
                src={ad.imageData}
                alt={ad.headline}
                className="w-full rounded-lg border border-border"
              />
              <button
                onClick={downloadAd}
                className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Download Ad
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Headline</h3>
                <p className="font-semibold">{ad.headline}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{ad.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Primary Text</h3>
                <p className="text-sm">{ad.primaryText}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Call to Action</h3>
                <p>{ad.callToAction}</p>
              </div>

              {ad.project && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                  <p>{ad.project.name}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                <p className="text-sm">{new Date(ad.createdAt).toLocaleString()}</p>
              </div>

              {ad.approvals && ad.approvals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Approval Status</h3>
                  <StatusBadge status={ad.approvals[0].status} />
                  {ad.approvals[0].feedback && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{ad.approvals[0].feedback}</p>
                    </div>
                  )}
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
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-500/20 text-green-500' },
    changes_requested: { label: 'Changes Requested', color: 'bg-orange-500/20 text-orange-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-500' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}
