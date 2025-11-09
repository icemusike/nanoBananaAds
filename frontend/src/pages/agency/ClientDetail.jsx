import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Building2, Calendar, CreditCard, FolderKanban, ImagePlus, Plus, Tag, X, Edit, Trash2, Image, Download, Send } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import SubmitForApprovalModal from '../../components/agency/SubmitForApprovalModal';

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const {
    getClientDetails,
    selectedClient,
    createProject,
    getClientProjects,
    updateProject,
    deleteProject,
    getClientBrands,
    getAllBrands,
    assignBrandToClient,
    unassignBrandFromClient,
    getClientAds,
    getAd
  } = useAgency();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Brand management state
  const [clientBrands, setClientBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [showAssignBrand, setShowAssignBrand] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingAllBrands, setLoadingAllBrands] = useState(false);

  // Projects management state
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Ads management state
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adToSubmit, setAdToSubmit] = useState(null);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    try {
      setLoading(true);
      await getClientDetails(clientId);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(clientId, projectForm);
      setProjectForm({ name: '', description: '', startDate: '', endDate: '' });
      setShowAddProject(false);
      await loadClient();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const loadClientBrands = async () => {
    try {
      setLoadingBrands(true);
      console.log('📦 Loading client brands for client:', clientId);
      const brands = await getClientBrands(clientId);
      console.log('📦 Client brands loaded:', brands);
      setClientBrands(brands || []);
    } catch (error) {
      console.error('❌ Error loading client brands:', error);
      alert('Failed to load client brands: ' + error.message);
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadAllBrands = async () => {
    try {
      setLoadingAllBrands(true);
      console.log('📦 Loading all brands...');
      const brands = await getAllBrands();
      console.log('📦 All brands loaded:', brands);
      setAllBrands(brands || []);
    } catch (error) {
      console.error('❌ Error loading all brands:', error);
      alert('Failed to load brands: ' + error.message);
    } finally {
      setLoadingAllBrands(false);
    }
  };

  const handleAssignBrand = async (brandId) => {
    try {
      await assignBrandToClient(clientId, brandId);
      await loadClientBrands();
      await loadAllBrands();
      setShowAssignBrand(false);
      alert('Brand assigned successfully!');
    } catch (error) {
      console.error('Error assigning brand:', error);
      alert('Failed to assign brand');
    }
  };

  const handleUnassignBrand = async (brandId) => {
    if (!confirm('Are you sure you want to unassign this brand from the client?')) return;

    try {
      await unassignBrandFromClient(clientId, brandId);
      await loadClientBrands();
      await loadAllBrands();
      alert('Brand unassigned successfully!');
    } catch (error) {
      console.error('Error unassigning brand:', error);
      alert('Failed to unassign brand');
    }
  };

  const openAssignBrand = () => {
    console.log('🔵 Opening assign brand modal...');
    setShowAssignBrand(true);
    loadAllBrands();
  };

  // Load projects
  const loadClientProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await getClientProjects(clientId);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load ads
  const loadClientAds = async () => {
    try {
      setLoadingAds(true);
      const adsData = await getClientAds(clientId, 1, 50);
      setAds(adsData.ads || []);
    } catch (error) {
      console.error('Error loading ads:', error);
      alert('Failed to load ads');
    } finally {
      setLoadingAds(false);
    }
  };

  // Handle project status update
  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await updateProject(projectId, { status: newStatus });
      await loadClientProjects();
      alert('Project status updated!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project status');
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(projectId, false);
      await loadClientProjects();
      alert('Project deleted successfully!');
    } catch (error) {
      if (error.response?.data?.adsCount) {
        const forceDelete = confirm(
          `This project has ${error.response.data.adsCount} ads. Delete anyway?`
        );
        if (forceDelete) {
          try {
            await deleteProject(projectId, true);
            await loadClientProjects();
            alert('Project deleted successfully!');
          } catch (err) {
            console.error('Error force deleting project:', err);
            alert('Failed to delete project');
          }
        }
      } else {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  // View ad details (fetch full ad with image data)
  const handleViewAd = async (ad) => {
    try {
      setShowAdModal(true);
      setSelectedAd({ ...ad, loading: true }); // Show modal with loading state
      const fullAd = await getAd(ad.id);
      setSelectedAd(fullAd);
    } catch (error) {
      console.error('Error loading ad details:', error);
      alert('Failed to load ad details');
      setShowAdModal(false);
    }
  };

  // Download ad image
  const handleDownloadAd = (ad) => {
    if (!ad?.imageData) {
      alert('Image not loaded yet');
      return;
    }

    const link = document.createElement('a');
    link.href = `data:${ad.imageMimeType};base64,${ad.imageData}`;
    link.download = `ad-${ad.id}-${ad.headline?.substring(0, 30) || 'image'}.${ad.imageMimeType?.split('/')[1] || 'png'}`;
    link.click();
  };

  // Handle submit for approval
  const handleSubmitForApproval = (ad, event) => {
    event.stopPropagation(); // Prevent triggering the card click
    setAdToSubmit(ad);
    setShowApprovalModal(true);
  };

  // Handle approval submission success
  const handleApprovalSuccess = (approval) => {
    console.log('Approval submitted successfully:', approval);
    alert('Ad submitted for approval successfully!');
    // Optionally refresh the ads list or add approval status badge
    loadClientAds();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
          <Link to="/agency/clients" className="text-primary hover:underline">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/agency/clients"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedClient.clientName || selectedClient.clientEmail}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {selectedClient.clientEmail}
              </span>
              {selectedClient.clientCompany && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {selectedClient.clientCompany}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(selectedClient.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedClient.status === 'active'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {selectedClient.status}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Projects</div>
          <div className="text-2xl font-bold">{selectedClient.stats?.projects || 0}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Ads Created</div>
          <div className="text-2xl font-bold">{selectedClient.stats?.ads || 0}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Brands</div>
          <div className="text-2xl font-bold">{selectedClient.stats?.brands || 0}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Credits Used</div>
          <div className="text-2xl font-bold">
            {selectedClient.creditsUsed || 0}
            {selectedClient.creditsAllocated && ` / ${selectedClient.creditsAllocated}`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('projects');
              loadClientProjects();
            }}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Projects ({selectedClient.stats?.projects || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab('ads');
              loadClientAds();
            }}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'ads'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Ads ({selectedClient.stats?.ads || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab('brands');
              loadClientBrands();
            }}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'brands'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Brands ({selectedClient.stats?.brands || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Access Token</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {selectedClient.accessToken}
                </code>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Last Access</div>
                <div>{selectedClient.lastAccess ? new Date(selectedClient.lastAccess).toLocaleString() : 'Never'}</div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Projects</h3>
              <button
                onClick={() => setShowAddProject(true)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
            {selectedClient.recentProjects && selectedClient.recentProjects.length > 0 ? (
              <div className="space-y-2">
                {selectedClient.recentProjects.map(project => (
                  <div key={project.id} className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: {project.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No projects yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">All Projects</h3>
            <button
              onClick={() => setShowAddProject(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {loadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <button
                onClick={() => setShowAddProject(true)}
                className="text-sm text-primary hover:underline"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-muted border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <ImagePlus className="w-4 h-4" />
                      <span>{project.adsCount || 0} ads</span>
                    </div>
                    {project.budget && (
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        <span>{project.currency} {project.budget}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <select
                      value={project.status}
                      onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                      className="px-3 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {project.deadline && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Client Ads</h3>

          {loadingAds ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12">
              <ImagePlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No ads generated yet</p>
              <p className="text-sm text-muted-foreground">
                Ads created for this client will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div
                  key={ad.id}
                  className="bg-muted border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors group"
                >
                  {/* Ad Image Placeholder */}
                  <div
                    className="relative aspect-square bg-dark-800 flex items-center justify-center cursor-pointer"
                    onClick={() => handleViewAd(ad)}
                  >
                    <div className="text-center">
                      <Image className="w-16 h-16 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-xs text-muted-foreground">Click to view</p>
                    </div>
                  </div>

                  {/* Ad Info */}
                  <div className="p-4">
                    <h4 className="font-semibold mb-2 line-clamp-2">{ad.headline}</h4>
                    {ad.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ad.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                      {ad.project && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                          {ad.project.name}
                        </span>
                      )}
                    </div>

                    {/* Submit for Approval Button */}
                    <button
                      onClick={(e) => handleSubmitForApproval(ad, e)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Send className="w-4 h-4" />
                      Submit for Approval
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Client Brands</h3>
            <button
              onClick={openAssignBrand}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Assign Brand
            </button>
          </div>

          {loadingBrands ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : clientBrands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No brands assigned to this client yet</p>
              <button
                onClick={openAssignBrand}
                className="mt-4 text-primary hover:underline"
              >
                Assign your first brand
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientBrands.map(brand => (
                <div
                  key={brand.id}
                  className="bg-muted border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{brand.name}</h4>
                      {brand.tagline && (
                        <p className="text-xs text-muted-foreground italic">{brand.tagline}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnassignBrand(brand.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Unassign brand"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {brand.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {brand.industry && (
                      <span className="px-2 py-1 bg-background rounded text-xs">
                        {brand.industry}
                      </span>
                    )}
                    {brand.primaryColor && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-background rounded text-xs">
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: brand.primaryColor }}
                        />
                        {brand.primaryColor}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Summer Campaign 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Project description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Brand Modal */}
      {showAssignBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold">Assign Brand to Client</h3>
              <button
                onClick={() => setShowAssignBrand(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Select a brand from your brand library to assign to this client.
              </p>

              {loadingAllBrands ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allBrands.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">No brands available to assign</p>
                  <Link
                    to="/brands"
                    className="mt-4 inline-block text-primary hover:underline"
                  >
                    Create your first brand
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {allBrands.map(brand => {
                    const isAssigned = brand.clientAccountId === clientId;
                    const isAssignedElsewhere = brand.clientAccountId && brand.clientAccountId !== clientId;

                    return (
                      <div
                        key={brand.id}
                        className={`bg-muted border border-border rounded-lg p-4 transition-colors ${
                          isAssigned
                            ? 'bg-green-500/10 border-green-500/30'
                            : isAssignedElsewhere
                            ? 'opacity-50'
                            : 'hover:border-primary/30 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isAssigned && !isAssignedElsewhere) {
                            handleAssignBrand(brand.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{brand.name}</h4>
                            {brand.tagline && (
                              <p className="text-xs text-muted-foreground italic mb-2">{brand.tagline}</p>
                            )}
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {brand.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {brand.industry && (
                                <span className="px-2 py-1 bg-background rounded text-xs">
                                  {brand.industry}
                                </span>
                              )}
                              {brand.primaryColor && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-background rounded text-xs">
                                  <div
                                    className="w-3 h-3 rounded-full border border-border"
                                    style={{ backgroundColor: brand.primaryColor }}
                                  />
                                  {brand.primaryColor}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {isAssigned ? (
                              <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-sm">
                                Assigned
                              </span>
                            ) : isAssignedElsewhere ? (
                              <span className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">
                                {brand.clientAccount?.clientName || 'Other client'}
                              </span>
                            ) : (
                              <button className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm">
                                Assign
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <button
                onClick={() => setShowAssignBrand(false)}
                className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Detail Modal */}
      {showAdModal && selectedAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold">Ad Details</h3>
              <button
                onClick={() => setShowAdModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedAd.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ad Image */}
                  <div className="bg-muted rounded-lg overflow-hidden">
                    {selectedAd.imageData && (
                      <img
                        src={`data:${selectedAd.imageMimeType};base64,${selectedAd.imageData}`}
                        alt={selectedAd.headline}
                        className="w-full h-auto"
                      />
                    )}
                  </div>

                {/* Ad Copy */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Headline</h4>
                    <p className="text-lg font-semibold">{selectedAd.headline}</p>
                  </div>

                  {selectedAd.description && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                      <p className="text-sm">{selectedAd.description}</p>
                    </div>
                  )}

                  {selectedAd.primaryText && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Text</h4>
                      <p className="text-sm whitespace-pre-wrap">{selectedAd.primaryText}</p>
                    </div>
                  )}

                  {selectedAd.callToAction && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Call to Action</h4>
                      <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                        {selectedAd.callToAction}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      {selectedAd.industry && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Industry:</span>
                          <span className="font-medium">{selectedAd.industry}</span>
                        </div>
                      )}
                      {selectedAd.category && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{selectedAd.category}</span>
                        </div>
                      )}
                      {selectedAd.template && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Template:</span>
                          <span className="font-medium">{selectedAd.template}</span>
                        </div>
                      )}
                      {selectedAd.aspectRatio && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Aspect Ratio:</span>
                          <span className="font-medium">{selectedAd.aspectRatio}</span>
                        </div>
                      )}
                      {selectedAd.project && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Project:</span>
                          <span className="font-medium">{selectedAd.project.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{new Date(selectedAd.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => handleDownloadAd(selectedAd)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                disabled={!selectedAd.imageData || selectedAd.loading}
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
              <button
                onClick={() => setShowAdModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit for Approval Modal */}
      {showApprovalModal && adToSubmit && (
        <SubmitForApprovalModal
          ad={adToSubmit}
          client={selectedClient}
          onClose={() => {
            setShowApprovalModal(false);
            setAdToSubmit(null);
          }}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </div>
  );
}
