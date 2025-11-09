import { useState, useEffect } from 'react';
import { Users, FolderKanban, Plus } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export default function ClientProjectSelector({
  selectedClientId,
  selectedProjectId,
  onClientChange,
  onProjectChange,
  showCreateProject = false
}) {
  const { clients, fetchClients, getClientProjects } = useAgency();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load clients on mount
    const loadClients = async () => {
      try {
        await fetchClients();
      } catch (err) {
        console.error('Error loading clients:', err);
        setError('Failed to load clients');
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    // Load projects when client is selected
    if (selectedClientId) {
      loadClientProjects();
    } else {
      setProjects([]);
    }
  }, [selectedClientId]);

  const loadClientProjects = async () => {
    if (!selectedClientId) return;

    try {
      setLoadingProjects(true);
      setError(null);
      const clientProjects = await getClientProjects(selectedClientId);
      setProjects(clientProjects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    onClientChange(clientId);
    // Reset project selection when client changes
    onProjectChange('');
  };

  return (
    <div className="space-y-4">
      {/* Client Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Client (Optional)
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={selectedClientId}
            onChange={handleClientChange}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="">Create for my own account</option>
            <optgroup label="My Clients">
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.clientName || client.clientEmail}
                  {client.clientCompany && ` (${client.clientCompany})`}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Choose a client to create this ad for, or leave empty to create for yourself
        </p>
      </div>

      {/* Project Selector - Only shown when client is selected */}
      {selectedClientId && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Project (Optional)
          </label>
          <div className="relative">
            <FolderKanban className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedProjectId}
              onChange={(e) => onProjectChange(e.target.value)}
              disabled={loadingProjects}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">No project</option>
              {loadingProjects ? (
                <option disabled>Loading projects...</option>
              ) : projects.length === 0 ? (
                <option disabled>No projects found</option>
              ) : (
                <optgroup label="Client Projects">
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Associate this ad with a specific project/campaign
          </p>
        </div>
      )}

      {/* Info Box when client is selected */}
      {selectedClientId && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-500 mb-1">Creating for Client</div>
              <div className="text-muted-foreground">
                This ad will be associated with{' '}
                <strong>
                  {clients.find(c => c.id === selectedClientId)?.clientName ||
                   clients.find(c => c.id === selectedClientId)?.clientEmail}
                </strong>
                {selectedProjectId && projects.find(p => p.id === selectedProjectId) && (
                  <span>
                    {' '}in project{' '}
                    <strong>{projects.find(p => p.id === selectedProjectId).name}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
