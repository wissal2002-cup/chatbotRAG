import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../../services/documentService';

export default function Upload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', module: '', semester: 'S1', description: ''
  });
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Fichier trop grand (max 10 Mo)');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Veuillez sélectionner un fichier PDF'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgress(0);

    const formData = new FormData();
    formData.append('title',       form.title);
    formData.append('module',      form.module);
    formData.append('semester',    form.semester);
    formData.append('description', form.description);
    formData.append('file',        file);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(p => p < 85 ? p + 10 : p);
      }, 200);

      await uploadDocument(formData);
      clearInterval(interval);
      setProgress(100);

      setSuccess('✅ Document uploadé avec succès !');
      setForm({ title:'', module:'', semester:'S1', description:'' });
      setFile(null);

      setTimeout(() => navigate('/enseignant/documents'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:680,margin:'0 auto'}}>
      <div style={{backgroundColor:'white',borderRadius:20,padding:32,boxShadow:'0 2px 20px rgba(0,0,0,0.07)'}}>
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:'#0f0c29',marginBottom:6}}>📤 Uploader un document PDF</div>
          <div style={{fontSize:14,color:'#6b7280'}}>Le texte sera extrait automatiquement pour le chatbot</div>
        </div>

        {error   && <div style={{backgroundColor:'#fee2e2',color:'#c00000',padding:'12px 16px',borderRadius:10,marginBottom:20,fontSize:14}}>{error}</div>}
        {success && <div style={{backgroundColor:'#dcfce7',color:'#166534',padding:'12px 16px',borderRadius:10,marginBottom:20,fontSize:14}}>{success}</div>}

        <form onSubmit={handleSubmit}>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragOver ? '#0ea5e9' : file ? '#10b981' : '#d1d5db'}`,
              borderRadius:16, padding:'32px 20px', textAlign:'center',
              cursor:'pointer', marginBottom:24, transition:'all 0.2s',
              backgroundColor: dragOver ? '#f0f9ff' : file ? '#f0fdf4' : '#fafafa',
            }}
          >
            <input id="fileInput" type="file" accept=".pdf" style={{display:'none'}} onChange={e => handleFile(e.target.files[0])}/>
            {file ? (
              <>
                <div style={{fontSize:40,marginBottom:8}}>✅</div>
                <div style={{fontSize:15,fontWeight:700,color:'#166534'}}>{file.name}</div>
                <div style={{fontSize:13,color:'#6b7280',marginTop:4}}>{(file.size/1024/1024).toFixed(2)} Mo</div>
                <div style={{fontSize:12,color:'#0ea5e9',marginTop:8}}>Cliquer pour changer</div>
              </>
            ) : (
              <>
                <div style={{fontSize:40,marginBottom:8}}>📁</div>
                <div style={{fontSize:15,fontWeight:600,color:'#374151'}}>Glisser-déposer votre PDF ici</div>
                <div style={{fontSize:13,color:'#9ca3af',marginTop:4}}>ou cliquer pour sélectionner</div>
                <div style={{fontSize:12,color:'#d1d5db',marginTop:8}}>PDF uniquement • Max 10 Mo</div>
              </>
            )}
          </div>

          {/* Progress bar */}
          {loading && (
            <div style={{marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,color:'#6b7280'}}>Upload en cours...</span>
                <span style={{fontSize:13,fontWeight:700,color:'#0ea5e9'}}>{progress}%</span>
              </div>
              <div style={{backgroundColor:'#e0f2fe',borderRadius:6,height:8,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${progress}%`,backgroundColor:'#0ea5e9',borderRadius:6,transition:'width 0.3s ease'}}/>
              </div>
            </div>
          )}

          {/* Form fields */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Titre du cours *</label>
              <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Ex: Cours Algorithmique" required style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none'}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Module *</label>
              <input value={form.module} onChange={e => setForm({...form,module:e.target.value})} placeholder="Ex: Algorithmique" required style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none'}}/>
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Semestre *</label>
            <select value={form.semester} onChange={e => setForm({...form,semester:e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none',backgroundColor:'white'}}>
              {['S1','S2','S3','S4','S5','S6'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Description (optionnel)</label>
            <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Brève description du contenu..." rows={3} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none',resize:'vertical'}}/>
          </div>

          <button type="submit" disabled={loading} style={{width:'100%',padding:'14px',backgroundColor: loading ? '#9ca3af' : '#0ea5e9',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor: loading ? 'not-allowed' : 'pointer',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {loading ? '⏳ Upload en cours...' : '📤 Uploader le document'}
          </button>
        </form>
      </div>
    </div>
  );
}