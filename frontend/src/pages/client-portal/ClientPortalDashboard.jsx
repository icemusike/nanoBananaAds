import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClientPortal } from '../../context/ClientPortalContext';

export default function ClientPortalDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchDashboard, client, logout } = useClientPortal();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      setError('Failed to load dashboard. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {dashboard?.agency?.company || dashboard?.agency?.name || 'Client Portal'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {dashboard?.client?.name || dashboard?.client?.email}
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
              className="text-sm font-medium text-primary border-b-2 border-primary pb-2"
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground pb-2 border-b-2 border-transparent transition-colors"
            >
              Approvals {dashboard?.stats?.pendingApprovals > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {dashboard.stats.pendingApprovals}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Ads"
            value={dashboard?.stats?.totalAds || 0}
            icon="📊"
          />
          <StatCard
            title="Pending Approvals"
            value={dashboard?.stats?.pendingApprovals || 0}
            icon="⏳"
            highlight={dashboard?.stats?.pendingApprovals > 0}
          />
          <StatCard
            title="Approved Ads"
            value={dashboard?.stats?.approvedAds || 0}
            icon="✅"
          />
          <StatCard
            title="Active Projects"
            value={dashboard?.projects?.length || 0}
            icon="📁"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Ads */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Ads</h2>
            {dashboard?.recentActivity?.ads?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentActivity.ads.map((ad) => (
                  <Link
                    key={ad.id}
                    to={`/client-portal/ads/${ad.id}`}
                    className="block p-3 bg-background rounded-lg hover:bg-muted transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{ad.headline}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ad.createdAt).toLocaleDateString()}
                      {ad.project && ` • ${ad.project.name}`}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No ads yet</p>
            )}
          </div>

          {/* Recent Approval Requests */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Approvals</h2>
            {dashboard?.recentActivity?.approvals?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentActivity.approvals.map((approval) => (
                  <Link
                    key={approval.id}
                    to={`/client-portal/approvals`}
                    className="block p-3 bg-background rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate flex-1">
                        {approval.ad?.headline || 'Ad'}
                      </p>
                      <StatusBadge status={approval.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No approval requests</p>
            )}
          </div>
        </div>

        {/* Active Projects */}
        {dashboard?.projects?.length > 0 && (
          <div className="mt-6 bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.projects.map((project) => (
                <div key={project.id} className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium mb-2">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {project.adsCount} {project.adsCount === 1 ? 'ad' : 'ads'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = false }) {
  return (
    <div
      className={`bg-card border rounded-lg p-6 ${
        highlight ? 'border-primary' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-500/20 text-green-500' },
    changes_requested: { label: 'Changes', color: 'bg-orange-500/20 text-orange-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-500' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}
