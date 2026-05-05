import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';

export default function Users() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [form, setForm]           = useState({
    name: '', email: '', password: '', role: 'etudiant'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
        setSuccess('Utilisateur modifié avec succès');
      } else {
        await createUser(form);
        setSuccess('Utilisateur ajouté avec succès');
      }
      setShowForm(false);
      setEditUser(null);
      setForm({ name:'', email:'', password:'', role:'etudiant' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
      await deleteUser(id);
      setSuccess('Utilisateur supprimé avec succès');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditUser(null);
    setForm({ name:'', email:'', password:'', role:'etudiant' });
    setError('');
  };

  const roleColors = {
    admin:      { bg: '#fee2e2', color: '#c00000' },
    enseignant: { bg: '#dbeafe', color: '#1d4ed8' },
    etudiant:   { bg: '#dcfce7', color: '#166534' },
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Gestion des Utilisateurs</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>
          + Ajouter un utilisateur
        </button>
      </div>

      {error   && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* FORM */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {editUser ? '✏️ Modifier utilisateur' : '➕ Nouvel utilisateur'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Nom complet</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Nom complet"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>
                  {editUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </label>
                <input
                  style={styles.input}
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••"
                  required={!editUser}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Rôle</label>
                <select
                  style={styles.input}
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={styles.formButtons}>
              <button type="submit" style={styles.saveBtn}>
                {editUser ? '💾 Modifier' : '✅ Ajouter'}
              </button>
              <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Date création</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={index%2===0 ? styles.trEven : styles.trOdd}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: roleColors[user.role]?.bg,
                    color: roleColors[user.role]?.color,
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(user)}>
                    ✏️
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(user.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={styles.empty}>Aucun utilisateur trouvé</p>
        )}
      </div>

      <p style={styles.count}>Total : {users.length} utilisateur(s)</p>
    </div>
  );
}

const styles = {
  container:   { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' },
  title:       { color: '#1F3864', margin: 0 },
  addBtn:      { backgroundColor:'#1F3864', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  error:       { backgroundColor:'#fee2e2', color:'#c00000', padding:'10px', borderRadius:'8px', marginBottom:'12px' },
  success:     { backgroundColor:'#dcfce7', color:'#166534', padding:'10px', borderRadius:'8px', marginBottom:'12px' },
  formCard:    { backgroundColor:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.1)', marginBottom:'24px' },
  formTitle:   { color:'#1F3864', marginBottom:'16px' },
  formGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  field:       { display:'flex', flexDirection:'column' },
  label:       { marginBottom:'6px', fontWeight:'500', color:'#333', fontSize:'14px' },
  input:       { padding:'10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' },
  formButtons: { marginTop:'16px', display:'flex', gap:'12px' },
  saveBtn:     { backgroundColor:'#166534', color:'white', border:'none', padding:'10px 24px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  cancelBtn:   { backgroundColor:'#e5e7eb', color:'#333', border:'none', padding:'10px 24px', borderRadius:'8px', cursor:'pointer' },
  tableWrapper:{ backgroundColor:'white', borderRadius:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', overflow:'hidden' },
  table:       { width:'100%', borderCollapse:'collapse' },
  thead:       { backgroundColor:'#1F3864' },
  th:          { padding:'12px 16px', color:'white', textAlign:'left', fontSize:'14px' },
  trEven:      { backgroundColor:'white' },
  trOdd:       { backgroundColor:'#f8fafc' },
  td:          { padding:'12px 16px', fontSize:'14px', color:'#333' },
  badge:       { padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold' },
  editBtn:     { background:'none', border:'none', cursor:'pointer', fontSize:'16px', marginRight:'8px' },
  deleteBtn:   { background:'none', border:'none', cursor:'pointer', fontSize:'16px' },
  empty:       { textAlign:'center', padding:'24px', color:'#666' },
  count:       { marginTop:'12px', color:'#666', fontSize:'14px' },
  loading:     { padding:'40px', textAlign:'center' },
};