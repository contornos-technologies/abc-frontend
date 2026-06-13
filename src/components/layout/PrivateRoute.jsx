import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const isAdminRoute = location.pathname.startsWith('/admin')
    return <Navigate to={isAdminRoute ? '/portal/acesso' : '/login'} replace />
  }

  if (adminOnly && !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/student/profile" replace />
  }

  return children
}
