import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import AddClientModal from '../../components/agency/AddClientModal';

export default function AddNewClient() {
  const navigate = useNavigate();
  const { hasAgencyLicense } = useAgency();
  const [showModal, setShowModal] = useState(true);

  const handleSuccess = (clientId) => {
    setShowModal(false);
    // Navigate to the new client's detail page
    navigate(`/agency/clients/${clientId}`);
  };

  const handleClose = () => {
    setShowModal(false);
    // Navigate back to clients list
    navigate('/agency/clients');
  };

  if (!hasAgencyLicense) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <UserPlus className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Agency License Required</h1>
          <p className="text-muted-foreground mb-8">
            Adding clients is only available with an Agency License.
          </p>
          <button
            onClick={() => navigate('/agency')}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Agency Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/agency/clients')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </button>

        <div className="flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Add New Client</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Create a new client account and grant portal access
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <AddClientModal
          isOpen={showModal}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}

      {/* Placeholder content when modal is closed */}
      {!showModal && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      )}
    </div>
  );
}
