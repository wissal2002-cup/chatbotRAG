import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function EtudiantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>🎓 Dashboard Étudiant</h1>
      <p>Bienvenue, <strong>{user?.name}</strong></p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}