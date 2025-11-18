import { useState, useEffect } from 'react';
import { Settings, Save, Building2, User, Mail, Phone, MapPin, Globe, Palette } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AgencySettings() {
  const { hasAgencyLicense } = useAgency();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [settings, setSettings] = useState({
    agencyName: '',
    agencyEmail: '',
    agencyPhone: '',
    agencyAddress: '',
    agencyWebsite: '',
    primaryColor: '#3B82F6',
    logoUrl: '',
    whiteLabelEnabled: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/agency/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      await axios.put(`${API_URL}/api/agency/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!hasAgencyLicense) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Settings className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Agency License Required</h1>
          <p className="text-muted-foreground">
            Agency settings are only available with an Agency License.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Agency Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure your agency branding and contact information
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300">
          {successMessage}
        </div>
      )}

      <div className="max-w-3xl space-y-6">
        {/* Agency Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Agency Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Agency Name
                </span>
              </label>
              <input
                type="text"
                value={settings.agencyName}
                onChange={(e) => handleChange('agencyName', e.target.value)}
                placeholder="Your Agency Name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Agency Email
                </span>
              </label>
              <input
                type="email"
                value={settings.agencyEmail}
                onChange={(e) => handleChange('agencyEmail', e.target.value)}
                placeholder="contact@agency.com"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Agency Phone
                </span>
              </label>
              <input
                type="tel"
                value={settings.agencyPhone}
                onChange={(e) => handleChange('agencyPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Agency Address
                </span>
              </label>
              <textarea
                value={settings.agencyAddress}
                onChange={(e) => handleChange('agencyAddress', e.target.value)}
                placeholder="123 Main St, City, State 12345"
                rows="3"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Agency Website
                </span>
              </label>
              <input
                type="url"
                value={settings.agencyWebsite}
                onChange={(e) => handleChange('agencyWebsite', e.target.value)}
                placeholder="https://agency.com"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Branding
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-16 h-10 rounded border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This color will be used in client portal branding
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                value={settings.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload your logo to an image hosting service and paste the URL here
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whiteLabelEnabled}
                  onChange={(e) => handleChange('whiteLabelEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <div>
                  <div className="font-medium">Enable White Label</div>
                  <div className="text-sm text-muted-foreground">
                    Remove AdGenius AI branding from client-facing materials
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
