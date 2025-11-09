import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, ImagePlus, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import axios from 'axios';

export default function AgencyDashboard() {
  const { hasAgencyLicense, clients, fetchClients } = useAgency();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    totalAds: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasAgencyLicense) {
      loadDashboardData();
    }
  }, [hasAgencyLicense]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch clients
      await fetchClients();

      // Calculate stats from clients data
      // This will be implemented once we have the data structure

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  // Calculate stats from clients
  useEffect(() => {
    if (clients.length > 0) {
      const activeClients = clients.filter(c => c.status === 'active').length;
      const totalProjects = clients.reduce((sum, c) => sum + (c.stats?.projects || 0), 0);
      const totalAds = clients.reduce((sum, c) => sum + (c.stats?.ads || 0), 0);

      setStats({
        totalClients: clients.length,
        activeClients,
        totalProjects,
        totalAds
      });
    }
  }, [clients]);

  if (!hasAgencyLicense) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Users className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Agency License Required</h1>
          <p className="text-muted-foreground mb-8">
            Upgrade to the Agency License to manage unlimited clients, create ads for them,
            and access powerful white-label features.
          </p>
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Agency License Features:</h3>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Unlimited client accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Client dashboard with ad approval workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>White-label branding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Message center for client communication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>File sharing system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Full commercial rights</span>
              </li>
            </ul>
            <div className="text-2xl font-bold text-primary mb-4">$197</div>
            <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Upgrade to Agency License
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agency Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clients, projects, and ad campaigns
          </p>
        </div>
        <Link
          to="/agency/clients/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalClients}</div>
          <div className="text-sm text-muted-foreground">
            {stats.activeClients} active
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FolderKanban className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Projects</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalProjects}</div>
          <div className="text-sm text-muted-foreground">Active campaigns</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ImagePlus className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Ads Created</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalAds}</div>
          <div className="text-sm text-muted-foreground">All time</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">This Month</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {clients.filter(c => {
              const createdDate = new Date(c.createdAt);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() &&
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="text-sm text-muted-foreground">New clients</div>
        </div>
      </div>

      {/* Recent Clients & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Clients</h2>
            <Link
              to="/agency/clients"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No clients yet</p>
              <Link
                to="/agency/clients/new"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Your First Client
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 5).map(client => (
                <Link
                  key={client.id}
                  to={`/agency/clients/${client.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">{client.clientName || client.clientEmail}</div>
                    <div className="text-sm text-muted-foreground">{client.clientCompany || client.clientEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{client.stats?.ads || 0} ads</div>
                    <div className="text-xs text-muted-foreground">
                      {client.stats?.projects || 0} projects
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/agency/clients/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Add New Client</div>
                <div className="text-sm text-muted-foreground">Create a new client account</div>
              </div>
            </Link>

            <Link
              to="/app"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ImagePlus className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="font-medium">Create Ad for Client</div>
                <div className="text-sm text-muted-foreground">Generate new ad campaign</div>
              </div>
            </Link>

            <Link
              to="/agency/clients"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">Manage Clients</div>
                <div className="text-sm text-muted-foreground">View and manage all clients</div>
              </div>
            </Link>

            <Link
              to="/agency/settings"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">Agency Settings</div>
                <div className="text-sm text-muted-foreground">Configure branding & preferences</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
