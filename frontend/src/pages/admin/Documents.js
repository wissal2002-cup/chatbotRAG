import { useState, useEffect } from 'react';
import { getDocuments, deleteDocument } from '../../services/adminService';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data);
    } catch (e) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    try {
      await deleteDocument(id);
      setSuccess('Document supprimé');
      fetchDocuments();
    } catch (e) {
      setError('Erreur lors de la suppression');
    }
  };

  const semesterColors = {
    S1:'#7c3aed',S2:'#0ea5e9',S3:'#10b981',
    S4:'#f59e0b',S5:'#ef4444',S6:'#ec4899'
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#6b7280'}}>Chargement...</div>;

  return (
    <div>
      {error   && <div style={{backgroundColor:'#fee2e2',color:'#c00000',padding:'10px 16px',borderRadius:10,marginBottom:16}}>{error}</div>}
      {success && <div style={{backgroundColor:'#dcfce7',color:'#166534',padding:'10px 16px',borderRadius:10,marginBottom:16}}>{success}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {documents.map((doc,i) => (
          <div key={doc.id} style={{backgroundColor:'white',borderRadius:16,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',position:'relative',overflow:'hidden',border:'1px solid #f3f4f6'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:4,backgroundColor:semesterColors[doc.semester] || '#7c3aed'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{fontSize:28}}>📄</div>
              <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,backgroundColor:`${semesterColors[doc.semester] || '#7c3aed'}15`,color:semesterColors[doc.semester] || '#7c3aed'}}>
                {doc.semester}
              </span>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:'#111827',marginBottom:4,lineHeight:1.3}}>{doc.title}</div>
            <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>📚 {doc.module}</div>
            <div style={{fontSize:12,color:'#9ca3af',marginBottom:12}}>👤 {doc.enseignant}</div>
            <div style={{fontSize:11,color:'#d1d5db',marginBottom:16}}>
              {(doc.file_size / 1024 / 1024).toFixed(2)} Mo • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
            </div>
            <button onClick={() => handleDelete(doc.id)} style={{width:'100%',padding:'8px',backgroundColor:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.2s'}}>
              🗑️ Supprimer
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'#9ca3af'}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{fontSize:16,fontWeight:600}}>Aucun document uploadé</div>
          </div>
        )}
      </div>
    </div>
  );
}