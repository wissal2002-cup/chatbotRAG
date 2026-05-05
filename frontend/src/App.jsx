import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login              from './pages/Login';
import AdminDashboard     from './pages/admin/Dashboard';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import EtudiantDashboard  from './pages/etudiant/Dashboard';
import Users from './pages/admin/Users';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Admin only */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }/>
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
            <Users />
           </PrivateRoute>
            }/>

          {/* Enseignant only */}
          <Route path="/enseignant/dashboard" element={
            <PrivateRoute roles={['enseignant']}>
              <EnseignantDashboard />
            </PrivateRoute>
          }/>

          {/* Etudiant only */}
          <Route path="/etudiant/dashboard" element={
            <PrivateRoute roles={['etudiant']}>
              <EtudiantDashboard />
            </PrivateRoute>
          }/>

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div style={{padding:'40px'}}>
              <h2>🚫 Accès non autorisé</h2>
            </div>
          }/>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;