import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Exposed checkAuth function
  const checkAuth = async () => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await authService.signup(name, email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    checkAuth, // Now exposed
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
