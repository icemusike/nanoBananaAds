import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../../services/adminApi';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showGrantLicense, setShowGrantLicense] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [licenseForm, setLicenseForm] = useState({
    productId: '427079', // Default to Starter
    purchaseAmount: 0,
    isAddon: false
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(userId);
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await usersApi.resetPassword(userId, newPassword);
      setSuccess('Password reset successfully!');
      setShowResetPassword(false);
      setNewPassword('');
    } catch (err) {
      setError('Failed to reset password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGrantLicense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await usersApi.grantLicense(userId, {
        productId: licenseForm.productId,
        jvzooProductId: licenseForm.productId,
        purchaseAmount: parseFloat(licenseForm.purchaseAmount) || 0
      });
      setSuccess('License granted successfully!');
      setShowGrantLicense(false);
      setLicenseForm({ productId: 'standard', purchaseAmount: 0 });
      fetchUser(); // Refresh user data
    } catch (err) {
      setError('Failed to grant license: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateLicenseStatus = async (licenseId, newStatus) => {
    if (!confirm(`Are you sure you want to change this license status to "${newStatus}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await usersApi.updateLicense(userId, licenseId, { status: newStatus });
      setSuccess('License status updated successfully!');
      fetchUser(); // Refresh user data
    } catch (err) {
      setError('Failed to update license: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersApi.delete(userId);
      navigate('/admin/users');
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSendCredentials = async () => {
    setError('');
    setSuccess('');

    try {
      await usersApi.sendCredentials(userId);
      setSuccess('Credentials email sent successfully!');
    } catch (err) {
      setError('Failed to send credentials: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-4">
        <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
          ← Back to Users
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-2 inline-block">
            ← Back to Users
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={handleDeleteUser}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          Delete User
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">User ID</label>
            <p className="text-sm font-mono text-gray-900 dark:text-white">{user?.id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Created</label>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(user?.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Company</label>
            <p className="text-sm text-gray-900 dark:text-white">{user?.company || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Email Verified</label>
            <p className="text-sm text-gray-900 dark:text-white">
              {user?.emailVerified ? '✅ Yes' : '❌ No'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Created Via</label>
            <p className="text-sm text-gray-900 dark:text-white">{user?.createdVia || 'signup'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">JVZoo Customer ID</label>
            <p className="text-sm text-gray-900 dark:text-white">{user?.jvzooCustomerId || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ads Generated</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{user?.adsGenerated || 0}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Prompts Generated</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{user?.promptsGenerated || 0}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Angles Generated</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{user?.anglesGenerated || 0}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Brands Created</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{user?.brands?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* API Usage & Costs */}
      {user?.apiStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Usage & Costs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${user.apiStats.totalCost.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total API Calls</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.apiStats.totalCalls.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tokens Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.apiStats.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Licenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Licenses</h2>
          <button
            onClick={() => setShowGrantLicense(!showGrantLicense)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Grant License
          </button>
        </div>

        {/* Grant License Form */}
        {showGrantLicense && (
          <form onSubmit={handleGrantLicense} className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Type
                </label>
                <select
                  value={licenseForm.productId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    // Auto-fill purchase amount based on product
                    const prices = {
                      '427079': 47,    // Starter
                      '427343': 97,    // Pro Unlimited
                      '427345': 67,    // Pro Lite
                      '427357': 397,   // Elite Bundle
                      '427347': 127,   // Template Library
                      '427349': 67,    // Template Pack DS
                      '427351': 197,   // Agency
                      '427353': 127,   // Agency DS
                      '427355': 297,   // Reseller
                      '427359': 197    // Reseller DS
                    };
                    setLicenseForm({
                      ...licenseForm,
                      productId: selectedId,
                      purchaseAmount: prices[selectedId] || 0
                    });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <optgroup label="Base Licenses">
                    <option value="427079">Starter ($47) - 100 credits/month</option>
                    <option value="427343">Pro Unlimited ($97) - Unlimited credits</option>
                    <option value="427345">Pro Lite ($67) - Unlimited credits</option>
                    <option value="427357">Elite Bundle ($397) - Everything included</option>
                  </optgroup>
                  <optgroup label="Addons (Require Base License)">
                    <option value="427347">Template Library ($127) - Premium templates</option>
                    <option value="427349">Template Pack DS ($67) - Top 10 Industries</option>
                    <option value="427351">Agency License ($197) - Requires Pro+</option>
                    <option value="427353">Agency DS ($127) - Requires Pro+</option>
                    <option value="427355">Reseller Rights ($297) - Requires Agency</option>
                    <option value="427359">Reseller DS ($197) - Requires Agency</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={licenseForm.purchaseAmount}
                  onChange={(e) => setLicenseForm({ ...licenseForm, purchaseAmount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Elite Bundle automatically includes all addons.
                Addons require appropriate base licenses (Agency requires Pro+, Reseller requires Agency).
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                Grant License
              </button>
              <button
                type="button"
                onClick={() => setShowGrantLicense(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Licenses List */}
        {user?.licenses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">License Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Purchase Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.licenses.map((license) => (
                  <tr key={license.id}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{license.licenseKey}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{license.productId}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        license.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        license.status === 'refunded' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(license.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {license.status === 'active' && (
                        <button
                          onClick={() => handleUpdateLicenseStatus(license.id, 'cancelled')}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No licenses found</p>
        )}
      </div>

      {/* Admin Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Admin Actions</h2>
        <div className="space-y-4">
          <button
            onClick={handleSendCredentials}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-left"
          >
            📧 Send Credentials Email
          </button>

          <button
            onClick={() => setShowResetPassword(!showResetPassword)}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition text-left"
          >
            🔑 Reset Password
          </button>

          {showResetPassword && (
            <form onSubmit={handleResetPassword} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Transactions */}
      {user?.jvzooTransactions?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.jvzooTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{tx.transactionType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      ${tx.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.verified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {tx.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
