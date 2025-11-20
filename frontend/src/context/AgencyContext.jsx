import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLicense } from './LicenseContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AgencyContext = createContext();

export function useAgency() {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
}

export function AgencyProvider({ children }) {
  const licenseContext = useLicense();
  const {
    hasAgencyFeatures,
    isAgency,
    isElite,
    loading: licenseLoading,
    license,
    features
  } = licenseContext;

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use license context to determine if user has agency license
  // Check both the computed properties AND the raw features object
  // CRITICAL FIX: Ensure Elite Bundle always returns TRUE for hasAgencyLicense
  const hasAgencyLicense = hasAgencyFeatures ||
                           isAgency ||
                           isElite ||
                           license?.features?.agency_features === true ||
                           license?.features?.agency_license === true ||
                           license?.license?.tier === 'agency_license' ||
                           license?.license?.tier === 'elite_bundle';

  const agencyLicense = hasAgencyLicense ? {
    isActive: true,
    tier: isElite ? 'elite_bundle' : 'agency_license'
  } : null;

  // No longer need checkAgencyLicense function - using LicenseContext instead

  // Fetch all clients
  const fetchClients = async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/agency/clients`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });

      if (response.data.success) {
        setClients(response.data.clients);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  };

  // Create new client
  const createClient = async (clientData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/agency/clients`,
        clientData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Refresh clients list
        await fetchClients();
        return response.data.client;
      }
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  // Update client
  const updateClient = async (clientId, clientData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/agency/clients/${clientId}`,
        clientData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Refresh clients list
        await fetchClients();
        return response.data.client;
      }
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  // Delete client
  const deleteClient = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/api/agency/clients/${clientId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Refresh clients list
        await fetchClients();
        return true;
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  // Get client details
  const getClientDetails = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/agency/clients/${clientId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSelectedClient(response.data.client);
        return response.data.client;
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      throw error;
    }
  };

  // Create project for client
  const createProject = async (clientId, projectData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/agency/clients/${clientId}/projects`,
        projectData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Refresh client details if viewing that client
        if (selectedClient?.id === clientId) {
          await getClientDetails(clientId);
        }
        return response.data.project;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Get projects for client
  const getClientProjects = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/agency/clients/${clientId}/projects`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return response.data.projects;
      }
    } catch (error) {
      console.error('Error fetching client projects:', error);
      throw error;
    }
  };

  // Get brands for client
  const getClientBrands = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔵 AgencyContext: Fetching brands for client:', clientId);
      const response = await axios.get(
        `${API_URL}/api/agency/clients/${clientId}/brands`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('🔵 AgencyContext: Brands response:', response.data);
      if (response.data.success) {
        return response.data.brands;
      }
      return [];
    } catch (error) {
      console.error('❌ AgencyContext: Error fetching client brands:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      throw error;
    }
  };

  // Get all brands owned by agency user
  const getAllBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔵 AgencyContext: Fetching all brands');
      const response = await axios.get(
        `${API_URL}/api/agency/brands/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('🔵 AgencyContext: All brands response:', response.data);
      if (response.data.success) {
        return response.data.brands;
      }
      return [];
    } catch (error) {
      console.error('❌ AgencyContext: Error fetching all brands:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      throw error;
    }
  };

  // Assign brand to client
  const assignBrandToClient = async (clientId, brandId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/agency/clients/${clientId}/brands/${brandId}/assign`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return response.data.brand;
      }
    } catch (error) {
      console.error('Error assigning brand to client:', error);
      throw error;
    }
  };

  // Unassign brand from client
  const unassignBrandFromClient = async (clientId, brandId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/agency/clients/${clientId}/brands/${brandId}/unassign`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return response.data.brand;
      }
    } catch (error) {
      console.error('Error unassigning brand from client:', error);
      throw error;
    }
  };

  // Get ads for client
  const getClientAds = async (clientId, page = 1, limit = 20) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/agency/clients/${clientId}/ads`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit }
        }
      );

      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching client ads:', error);
      throw error;
    }
  };

  // Get single ad with full image data
  const getAd = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/agency/ads/${adId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return response.data.ad;
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
      throw error;
    }
  };

  // Update project
  const updateProject = async (projectId, projectData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/agency/projects/${projectId}`,
        projectData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return response.data.project;
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  // Delete project
  const deleteProject = async (projectId, force = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/api/agency/projects/${projectId}${force ? '?force=true' : ''}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return true;
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const value = {
    hasAgencyLicense,
    agencyLicense,
    clients,
    selectedClient,
    loading: loading || licenseLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientDetails,
    createProject,
    getClientProjects,
    updateProject,
    deleteProject,
    getClientBrands,
    getClientAds,
    getAd,
    getAllBrands,
    assignBrandToClient,
    unassignBrandFromClient,
    setSelectedClient
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
}
