import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, checkAuth } = useAuth();
  const { mode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for impersonation token (via query param)
  useEffect(() => {
    const impersonateToken = searchParams.get('token');
    if (impersonateToken) {
      handleImpersonation(impersonateToken);
    }
  }, [searchParams]);

  const handleImpersonation = async (token) => {
    try {
      setLoading(true);
      // Set token directly in local storage
      localStorage.setItem('token', token);
      
      // Validate token and get user data
      await checkAuth();
      
      // Redirect to dashboard
      navigate('/app');
    } catch (err) {
      setError('Failed to login with impersonation token');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center justify-center mb-4">
            <img
              src={mode === 'light' ? '/images/adgeniusai_logo_dark.png' : '/images/adgeniusai_logo_light.png'}
              alt="AdGenius AI"
              className="h-16 w-auto mb-3"
            />
          </Link>
          <h2 className="text-2xl font-bold mt-4">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to continue creating winning ads</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <a href="https://adgeniusai.io" className="text-primary font-semibold hover:underline">
                Sign Up Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
