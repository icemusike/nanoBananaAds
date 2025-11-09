import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientPortal } from '../../context/ClientPortalContext';

export default function ClientPortalLogin() {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useClientPortal();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accessToken.trim()) {
      setError('Please enter your access token');
      return;
    }

    setLoading(true);

    try {
      const result = await login(accessToken.trim());

      if (result.success) {
        navigate('/client-portal/dashboard');
      } else {
        setError(result.error || 'Invalid access token. Please check with your agency.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            Client Portal
          </h1>
          <p className="text-muted-foreground">
            Enter your access token to view your ads
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Access Token Input */}
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium mb-2">
                Access Token
              </label>
              <input
                id="accessToken"
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your access token"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your agency provided this token via email
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !accessToken.trim()}
              className="w-full py-3 bg-primary hover:bg-primary/90 rounded-lg font-medium text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Access Portal'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Don't have an access token?
              <br />
              Contact your agency for assistance.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Secure client portal
          </p>
        </div>
      </div>
    </div>
  );
}
