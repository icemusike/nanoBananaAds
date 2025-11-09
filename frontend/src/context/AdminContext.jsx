import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const API_URL = ''; // Use relative URL - Vite proxy will handle it

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAdminUser(response.data.adminUser);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, adminUser } = response.data;
        localStorage.setItem('adminToken', token);
        setToken(token);
        setAdminUser(adminUser);
        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdminUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const newToken = response.data.token;
        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const value = {
    adminUser,
    token,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!adminUser
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
