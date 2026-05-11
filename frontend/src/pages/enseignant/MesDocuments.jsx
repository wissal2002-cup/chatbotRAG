import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDocuments, deleteDocument } from '../../services/documentService';

export default function MesDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await getDocuments();
      // Filter only this enseignant's documents
      const myDocs = res.data.filter(d => d.user_id === user.id);
      setDocuments(myDocs);
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
      fetchDocs();
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur suppression');
    }
  };

  const semColors = { S1:'#7c3aed',S2:'#0ea5e9',S3:'#10b981',S4:'#f59e0b',S5:'#ef4444',S6:'#ec4899' };

  if (loading) return <div style={{textAlign:'center',padding:40,color:'#6b7280'}}>Chargement...</div>;

  return (
    <div>
      {error   && <div style={{backgroundColor:'#fee2e2',color:'#c00000',padding:'12px 16px',borderRadius:10,marginBottom:16,fontSize:14}}>{error}</div>}
      {success && <div style={{backgroundColor:'#dcfce7',color:'#166534',padding:'12px 16px',borderRadius:10,marginBottom:16,fontSize:14}}>{success}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {documents.map((doc) => (
          <div key={doc.id} style={{backgroundColor:'white',borderRadius:16,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:4,backgroundColor:semColors[doc.semester]||'#0ea5e9'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{fontSize:28}}>📄</div>
              <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,backgroundColor:`${semColors[doc.semester]||'#0ea5e9'}15`,color:semColors[doc.semester]||'#0ea5e9'}}>{doc.semester}</span>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:'#111827',marginBottom:4,lineHeight:1.3}}>{doc.title}</div>
            <div style={{fontSize:12,color:'#6b7280',marginBottom:8}}>📚 {doc.module}</div>
            <div style={{fontSize:11,color:'#d1d5db',marginBottom:16}}>{(doc.file_size/1024/1024).toFixed(2)} Mo • {new Date(doc.created_at).toLocaleDateString('fr-FR')}</div>
            <button onClick={() => handleDelete(doc.id)} style={{width:'100%',padding:'8px',backgroundColor:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600}}>
              🗑️ Supprimer
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:60,color:'#9ca3af'}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{fontSize:16,fontWeight:600}}>Aucun document uploadé</div>
            <div style={{fontSize:13,marginTop:8}}>Cliquez sur "Uploader PDF" pour commencer</div>
          </div>
        )}
      </div>
    </div>
  );
}