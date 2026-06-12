import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    return <Navigate to={isAdminRoute ? '/portal/acesso' : '/login'} replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/student/profile" replace />;

  return children;
}