import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      customer: '/dashboard',
      farmer: '/farmer/dashboard',
      delivery: '/delivery/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user?.role] || '/'} replace />;
  }

  return <Outlet />;
}
