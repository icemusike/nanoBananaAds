import { useState } from 'react';
import { X, Mail, User, Building2, CreditCard } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export default function AddClientModal({ isOpen, onClose, onSuccess }) {
  const { createClient } = useAgency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    clientEmail: '',
    clientName: '',
    clientCompany: '',
    creditsAllocated: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.clientEmail) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.clientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const clientData = {
        clientEmail: formData.clientEmail,
        clientName: formData.clientName || null,
        clientCompany: formData.clientCompany || null,
        creditsAllocated: formData.creditsAllocated ? parseInt(formData.creditsAllocated) : null
      };

      await createClient(clientData);

      // Reset form
      setFormData({
        clientEmail: '',
        clientName: '',
        clientCompany: '',
        creditsAllocated: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error.response?.data?.error || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Add New Client</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email (Required) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="client@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The client will receive an invitation to this email
              </p>
            </div>

            {/* Client Name (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Client Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Company Name (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="clientCompany"
                  value={formData.clientCompany}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Credits Allocated (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Credits Allocated
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  name="creditsAllocated"
                  value={formData.creditsAllocated}
                  onChange={handleChange}
                  placeholder="1000"
                  min="0"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Optional: Set a credit limit for this client
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
