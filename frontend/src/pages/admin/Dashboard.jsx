import { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/adminApi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your platform's performance and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <StatsCard
          title="Total Users"
          value={stats?.users?.total || 0}
          subtitle={`+${stats?.users?.newThisMonth || 0} this month`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="blue"
        />

        {/* Total Revenue */}
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.revenue?.total || 0).toFixed(2)}`}
          subtitle={`$${(stats?.revenue?.thisMonth || 0).toFixed(2)} this month`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />

        {/* Active Licenses */}
        <StatsCard
          title="Active Licenses"
          value={stats?.licenses?.active || 0}
          subtitle={`${stats?.licenses?.total || 0} total licenses`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          color="purple"
        />

        {/* API Costs */}
        <StatsCard
          title="API Costs"
          value={`$${(stats?.costs?.total || 0).toFixed(2)}`}
          subtitle={`$${(stats?.costs?.thisMonth || 0).toFixed(2)} this month`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="red"
        />
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Generated
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ads</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.usage?.totalAds?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Prompts</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.usage?.totalPrompts?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Angles</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.usage?.totalAngles?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Brands</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.usage?.totalBrands?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">New Today</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{stats?.users?.newToday || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">New This Week</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                +{stats?.users?.newThisWeek || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active (7 days)</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.users?.activeLast7Days || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active (30 days)</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats?.users?.activeLast30Days || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            License Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.licenses?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Refunded</span>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats?.licenses?.refunded || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Chargebacks</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats?.licenses?.chargebacks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.licenses?.total || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          API Usage Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total API Calls</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats?.costs?.totalApiCalls?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens Used</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats?.costs?.totalTokens?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Cost per Call</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              ${((stats?.costs?.total || 0) / (stats?.costs?.totalApiCalls || 1)).toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
