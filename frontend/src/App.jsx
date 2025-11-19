import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { LicenseProvider } from './context/LicenseContext';
import { AgencyProvider } from './context/AgencyContext';
import { ClientPortalProvider } from './context/ClientPortalContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ClientPortalProtectedRoute from './components/ClientPortalProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateAds from './pages/CreateAds';
import AdsLibrary from './pages/AdsLibrary';
import CreativePrompts from './pages/CreativePrompts';
import PromptLibrary from './pages/PromptLibrary';
import AnglesGenerator from './pages/AnglesGenerator';
import AnglesLibrary from './pages/AnglesLibrary';
import BrandsManager from './pages/BrandsManager';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Downloads from './pages/Downloads';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import CostAnalysis from './pages/admin/CostAnalysis';
import PlatformSettings from './pages/admin/PlatformSettings';
import AgencyDashboard from './pages/agency/AgencyDashboard';
import ClientManagement from './pages/agency/ClientManagement';
import ClientDetail from './pages/agency/ClientDetail';
import AgencySettings from './pages/agency/AgencySettings';
import AddNewClient from './pages/agency/AddNewClient';
import ClientPortalLogin from './pages/client-portal/ClientPortalLogin';
import ClientPortalDashboard from './pages/client-portal/ClientPortalDashboard';
import ClientPortalAds from './pages/client-portal/ClientPortalAds';
import ClientPortalApprovals from './pages/client-portal/ClientPortalApprovals';

function AppLayout({ children }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <LicenseProvider>
            <AgencyProvider>
              <ClientPortalProvider>
                <AdminProvider>
                  <Router>
                  <div className="min-h-screen bg-background text-foreground">
                    <Routes>
              {/* Public Login Page */}
              <Route path="/" element={<Login />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/auth/impersonate" element={<Login />} /> {/* Handle impersonation logic */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="costs" element={<CostAnalysis />} />
                <Route path="settings" element={<PlatformSettings />} />
              </Route>

              {/* App Routes - Protected */}
              <Route path="/app" element={<ProtectedRoute><AppLayout><CreateAds /></AppLayout></ProtectedRoute>} />
              <Route path="/creative-prompts" element={<ProtectedRoute><AppLayout><CreativePrompts /></AppLayout></ProtectedRoute>} />
              <Route path="/prompt-library" element={<ProtectedRoute><AppLayout><PromptLibrary /></AppLayout></ProtectedRoute>} />
              <Route path="/angles-generator" element={<ProtectedRoute><AppLayout><AnglesGenerator /></AppLayout></ProtectedRoute>} />
              <Route path="/angles-library" element={<ProtectedRoute><AppLayout><AnglesLibrary /></AppLayout></ProtectedRoute>} />
              <Route path="/brands" element={<ProtectedRoute><AppLayout><BrandsManager /></AppLayout></ProtectedRoute>} />
              <Route path="/ads-library" element={<ProtectedRoute><AppLayout><AdsLibrary /></AppLayout></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><AppLayout><AdsLibrary /></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><AppLayout><Help /></AppLayout></ProtectedRoute>} />
              <Route path="/downloads" element={<ProtectedRoute><AppLayout><Downloads /></AppLayout></ProtectedRoute>} />

              {/* Agency Routes - Protected */}
              <Route path="/agency" element={<ProtectedRoute><AppLayout><AgencyDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/agency/clients" element={<ProtectedRoute><AppLayout><ClientManagement /></AppLayout></ProtectedRoute>} />
              <Route path="/agency/clients/new" element={<ProtectedRoute><AppLayout><AddNewClient /></AppLayout></ProtectedRoute>} />
              <Route path="/agency/clients/:clientId" element={<ProtectedRoute><AppLayout><ClientDetail /></AppLayout></ProtectedRoute>} />
              <Route path="/agency/settings" element={<ProtectedRoute><AppLayout><AgencySettings /></AppLayout></ProtectedRoute>} />

              {/* Client Portal Routes */}
              <Route path="/client-portal/login" element={<ClientPortalLogin />} />
              <Route path="/client-portal/dashboard" element={<ClientPortalProtectedRoute><ClientPortalDashboard /></ClientPortalProtectedRoute>} />
              <Route path="/client-portal/ads" element={<ClientPortalProtectedRoute><ClientPortalAds /></ClientPortalProtectedRoute>} />
              <Route path="/client-portal/approvals" element={<ClientPortalProtectedRoute><ClientPortalApprovals /></ClientPortalProtectedRoute>} />
                </Routes>
              </div>
                  </Router>
                </AdminProvider>
              </ClientPortalProvider>
            </AgencyProvider>
          </LicenseProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
