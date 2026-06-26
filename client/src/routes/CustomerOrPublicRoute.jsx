import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function CustomerOrPublicRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user?.role && user.role !== 'customer') {
    const dashboardMap = {
      farmer: '/farmer/dashboard',
      delivery: '/delivery/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
