import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { mode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.name, formData.email, formData.password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
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
          <h2 className="text-2xl font-bold mt-4">Create Your Free Account</h2>
          <p className="text-muted-foreground mt-2">Start generating winning ads in 60 seconds</p>
        </div>

        {/* Signup Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="Re-enter your password"
                required
              />
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
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Join 1,000+ marketers creating ads 10x faster
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
