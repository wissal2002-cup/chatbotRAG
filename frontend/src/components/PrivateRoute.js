import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  // Not logged in
  if (!user) return <Navigate to="/login" />;

  // Wrong role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}