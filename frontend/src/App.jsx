/*
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login              from './pages/Login';
//import AdminDashboard     from './pages/admin/Dashboard';
//import EnseignantDashboard from './pages/enseignant/Dashboard';
//import EtudiantDashboard  from './pages/etudiant/Dashboard';
//import Users from './pages/admin/Users';
import AdminLayout from './pages/admin/Dashboard';
import EnseignantLayout from './pages/enseignant/Dashboard';
import EtudiantLayout from './pages/etudiant/Dashboard';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public }
          <Route path="/login" element={<Login />} />

          {/* Admin only }
          <Route path="/admin/*" element={
  <PrivateRoute roles={['admin']}>
    <AdminLayout />
            </PrivateRoute>
          }/>
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
            <Users />
           </PrivateRoute>
            }/>

          {/* Enseignant only }
          <Route path="/enseignant/*" element={
            <PrivateRoute roles={['enseignant']}>
              <EnseignantLayout />
            </PrivateRoute>
          }/>

          {/* Etudiant only }
          <Route path="/etudiant/*" element={
            <PrivateRoute roles={['etudiant']}>
              <EtudiantLayout />
            </PrivateRoute>
          }/>

          {/* Unauthorized }
          <Route path="/unauthorized" element={
            <div style={{padding:'40px'}}>
              <h2>🚫 Accès non autorisé</h2>
            </div>
          }/>

          {/* Default redirect }
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
*/


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login            from './pages/Login';
import AdminLayout      from './pages/admin/Dashboard';
import EnseignantLayout from './pages/enseignant/Dashboard';
import EtudiantLayout   from './pages/etudiant/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Admin — wildcard gère toutes les sous-routes */}
          <Route path="/admin/*" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }/>

          {/* Enseignant */}
          <Route path="/enseignant/*" element={
            <PrivateRoute roles={['enseignant']}>
              <EnseignantLayout />
            </PrivateRoute>
          }/>

          {/* Etudiant */}
          <Route path="/etudiant/*" element={
            <PrivateRoute roles={['etudiant']}>
              <EtudiantLayout />
            </PrivateRoute>
          }/>

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div style={{ padding:'40px' }}>
              <h2>🚫 Accès non autorisé</h2>
            </div>
          }/>

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;