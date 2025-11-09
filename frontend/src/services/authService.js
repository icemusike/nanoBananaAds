import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Auth API Service
export const authService = {
  // Signup new user
  async signup(name, email, password) {
    const response = await axios.post(`${API_URL}/api/auth/signup`, {
      name,
      email,
      password
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Login user
  async login(email, password) {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  async getCurrentUser() {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.user;
    } catch (error) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        this.logout();
      }
      throw error;
    }
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;
