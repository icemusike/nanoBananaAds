import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ClientPortalContext = createContext();

export const useClientPortal = () => {
  const context = useContext(ClientPortalContext);
  if (!context) {
    throw new Error('useClientPortal must be used within ClientPortalProvider');
  }
  return context;
};

export const ClientPortalProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = '/api';

  // Initialize from localStorage
  useEffect(() => {
    const storedClient = localStorage.getItem('client_portal_auth');
    if (storedClient) {
      try {
        const clientData = JSON.parse(storedClient);
        setClient(clientData);
        // Verify token is still valid
        verifyToken(clientData.accessToken);
      } catch (err) {
        console.error('Error parsing stored client data:', err);
        localStorage.removeItem('client_portal_auth');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token validity
  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/client-portal/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.valid) {
        logout();
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (accessToken) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/client-portal/auth/login`, {
        accessToken
      });

      if (response.data.success) {
        const clientData = response.data.client;
        setClient(clientData);
        localStorage.setItem('client_portal_auth', JSON.stringify(clientData));
        return { success: true, client: clientData };
      }

      return { success: false, error: 'Login failed' };

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (client?.accessToken) {
        await axios.post(
          `${API_URL}/client-portal/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${client.accessToken}`
            }
          }
        );
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setClient(null);
      localStorage.removeItem('client_portal_auth');
    }
  };

  // API helper with authentication
  const clientApi = axios.create({
    baseURL: API_URL
  });

  // Add auth token to all requests
  clientApi.interceptors.request.use(
    (config) => {
      if (client?.accessToken) {
        config.headers.Authorization = `Bearer ${client.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 errors (token expired/invalid)
  clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await clientApi.get('/client-portal/dashboard');
      return response.data;
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      throw err;
    }
  };

  // Fetch ads
  const fetchAds = async (params = {}) => {
    try {
      const response = await clientApi.get('/client-portal/ads', { params });
      return response.data;
    } catch (err) {
      console.error('Error fetching ads:', err);
      throw err;
    }
  };

  // Fetch single ad
  const fetchAd = async (adId) => {
    try {
      const response = await clientApi.get(`/client-portal/ads/${adId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching ad:', err);
      throw err;
    }
  };

  // Fetch approvals
  const fetchApprovals = async (params = {}) => {
    try {
      const response = await clientApi.get('/client-portal/approvals', { params });
      return response.data;
    } catch (err) {
      console.error('Error fetching approvals:', err);
      throw err;
    }
  };

  // Approve ad
  const approveAd = async (approvalId, comments = '') => {
    try {
      const response = await clientApi.post(`/client-portal/approvals/${approvalId}/approve`, {
        comments
      });
      return response.data;
    } catch (err) {
      console.error('Error approving ad:', err);
      throw err;
    }
  };

  // Request changes to ad
  const requestChanges = async (approvalId, feedback, requestedChanges = null) => {
    try {
      const response = await clientApi.post(`/client-portal/approvals/${approvalId}/request-changes`, {
        feedback,
        requestedChanges
      });
      return response.data;
    } catch (err) {
      console.error('Error requesting changes:', err);
      throw err;
    }
  };

  // Reject ad
  const rejectAd = async (approvalId, reason) => {
    try {
      const response = await clientApi.post(`/client-portal/approvals/${approvalId}/reject`, {
        reason
      });
      return response.data;
    } catch (err) {
      console.error('Error rejecting ad:', err);
      throw err;
    }
  };

  // Fetch projects
  const fetchProjects = async (params = {}) => {
    try {
      const response = await clientApi.get('/client-portal/projects', { params });
      return response.data;
    } catch (err) {
      console.error('Error fetching projects:', err);
      throw err;
    }
  };

  // Fetch single project
  const fetchProject = async (projectId) => {
    try {
      const response = await clientApi.get(`/client-portal/projects/${projectId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching project:', err);
      throw err;
    }
  };

  const value = {
    client,
    loading,
    error,
    isAuthenticated: !!client,
    login,
    logout,
    // API methods
    fetchDashboard,
    fetchAds,
    fetchAd,
    fetchApprovals,
    approveAd,
    requestChanges,
    rejectAd,
    fetchProjects,
    fetchProject
  };

  return (
    <ClientPortalContext.Provider value={value}>
      {children}
    </ClientPortalContext.Provider>
  );
};

export default ClientPortalContext;
