import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // Aguarda verificar a sessão antes de decidir
  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200"
        style={{ borderTopColor: '#F69220' }}
      />
    </div>
  );
}

  // Não está logado → vai para login
  if (!user) return <Navigate to="/login" replace />;

  // Rota de admin mas user não é admin → vai para profile
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/profile" replace />;

  return children;
}