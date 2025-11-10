import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getStats: () => adminApi.get('/dashboard/stats'),
  getUserGrowth: (days = 30) => adminApi.get(`/dashboard/user-growth?days=${days}`),
  getRevenueTrend: (days = 30) => adminApi.get(`/dashboard/revenue-trend?days=${days}`),
  getUsageStats: (days = 30) => adminApi.get(`/dashboard/usage-stats?days=${days}`)
};

// Users API
export const usersApi = {
  getAll: (params) => adminApi.get('/users', { params }),
  getById: (userId) => adminApi.get(`/users/${userId}`),
  create: (data) => adminApi.post('/users', data),
  update: (userId, data) => adminApi.put(`/users/${userId}`, data),
  delete: (userId) => adminApi.delete(`/users/${userId}`),
  grantLicense: (userId, data) => adminApi.post(`/users/${userId}/licenses`, data),
  updateLicense: (userId, licenseId, data) => adminApi.put(`/users/${userId}/licenses/${licenseId}`, data),
  resetPassword: (userId, newPassword) => adminApi.post(`/users/${userId}/reset-password`, { newPassword }),
  sendCredentials: (userId) => adminApi.post(`/users/${userId}/send-credentials`)
};

// Costs API
export const costsApi = {
  getSummary: () => adminApi.get('/costs/summary'),
  getByProvider: (days = 30) => adminApi.get(`/costs/by-provider?days=${days}`),
  getByModel: (days = 30) => adminApi.get(`/costs/by-model?days=${days}`),
  getByFeature: (days = 30) => adminApi.get(`/costs/by-feature?days=${days}`),
  getTrend: (days = 30) => adminApi.get(`/costs/trend?days=${days}`),
  getLogs: (params) => adminApi.get('/costs/logs', { params }),
  getTopUsers: (limit = 10, days = 30) => adminApi.get(`/costs/top-users?limit=${limit}&days=${days}`)
};

// Settings API
export const settingsApi = {
  getAll: () => adminApi.get('/settings'),
  getByCategory: (category) => adminApi.get(`/settings/${category}`),
  update: (key, data) => adminApi.put(`/settings/${key}`, data),
  testApi: (provider, apiKey) => adminApi.post('/settings/test-api', { provider, apiKey }),
  getSystemInfo: () => adminApi.get('/settings/system/info')
};

export default adminApi;
