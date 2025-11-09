import { Navigate } from 'react-router-dom';
import { useClientPortal } from '../context/ClientPortalContext';

export default function ClientPortalProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useClientPortal();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/client-portal/login" replace />;
  }

  return children;
}
