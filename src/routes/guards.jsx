import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Spinner';

/** Only signed-in users; others are sent to /login and returned afterwards. */
export function ProtectedRoute() {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <div className="min-h-screen"><PageLoader label="Loading your workspace…" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Login/register screens; signed-in users skip straight to the app. */
export function PublicOnlyRoute() {
  const { status, isAuthenticated } = useAuth();
  if (status === 'loading') return <div className="min-h-screen"><PageLoader /></div>;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <Outlet />;
}
