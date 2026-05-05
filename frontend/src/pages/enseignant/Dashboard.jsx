import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function EnseignantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [animIn, setAnimIn] = useState(false);
  const [activeNav, setActiveNav] = useState(0);

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ titre: '', module: '', description: '', file: null });
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'loading' | 'success' | 'error'

  // Test Gemini modal state
  const [testDoc, setTestDoc] = useState(null);
  const [testQuestion, setTestQuestion] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 50);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: '⊞',  label: 'Dashboard',    path: null },
    { icon: '📄', label: 'Mes documents', path: '/enseignant/documents' },
    { icon: '🧪', label: 'Tester Gemini', path: '/enseignant/test' },
    { icon: '📚', label: 'Tous les docs', path: '/enseignant/all-documents' },
  ];

  // Mock documents data
  const myDocuments = [
    { id: 1, titre: 'Algèbre Linéaire — Chap.3', module: 'Mathématiques S2', description: 'Matrices, déterminants et systèmes linéaires', date: '02 Mai 2026', size: '3.2 Mo', questions: 47 },
    { id: 2, titre: 'POO Java — Cours complet', module: 'Informatique S3',   description: 'Héritage, polymorphisme, interfaces', date: '28 Avr 2026', size: '1.8 Mo', questions: 83 },
    { id: 3, titre: 'Réseaux TCP/IP',           module: 'Informatique S4',   description: 'Modèle OSI, protocoles, routage',  date: '20 Avr 2026', size: '2.4 Mo', questions: 31 },
  ];

  const stats = [
    { label: 'Documents uploadés', icon: '📄', color1: '#7c3aed', color2: '#4f46e5', value: myDocuments.length },
    { label: 'Questions reçues',   icon: '💬', color1: '#0ea5e9', color2: '#6366f1', value: myDocuments.reduce((s, d) => s + d.questions, 0) },
    { label: 'Modules couverts',   icon: '📚', color1: '#10b981', color2: '#0d9488', value: new Set(myDocuments.map(d => d.module)).size },
    { label: 'Tests effectués',    icon: '🧪', color1: '#f59e0b', color2: '#ef4444', value: 12 },
  ];

  // Simulate upload
  const handleUploadSubmit = () => {
    if (!uploadForm.titre || !uploadForm.module || !uploadForm.file) return;
    setUploadStatus('loading');
    setTimeout(() => setUploadStatus('success'), 1800);
  };

  // Simulate Gemini test
  const handleTest = () => {
    if (!testQuestion.trim()) return;
    setTestLoading(true);
    setTestResponse('');
    setTimeout(() => {
      setTestResponse(`D'après le document « ${testDoc?.titre} » :\n\n${testQuestion.includes('?') ? testQuestion.replace('?','') : testQuestion} — Réponse générée par Gemini API basée exclusivement sur le contenu du PDF fourni. Les points clés abordés dans ce chapitre sont directement liés à votre question. Aucune information extérieure au document n'a été utilisée.`);
      setTestLoading(false);
    }, 2200);
  };

  const moduleColors = {
    'Mathématiques S2': { color: '#7c3aed', bg: '#f5f3ff' },
    'Informatique S3':  { color: '#0ea5e9', bg: '#f0f9ff' },
    'Informatique S4':  { color: '#10b981', bg: '#f0fdf4' },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f7ff; }
        .nav-btn:hover { background: rgba(124,58,237,0.15) !important; color: #c4b5fd !important; }
        .doc-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important; transform: translateY(-1px); }
        .logout-btn:hover { background: #dc2626 !important; }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .overlay { position:fixed; inset:0; background:rgba(15,12,41,0.55); z-index:50; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); }
        .modal { background:white; border-radius:20px; padding:28px; width:480px; max-width:95vw; box-shadow:0 24px 64px rgba(0,0,0,0.18); }
        .input-field { width:100%; padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:10px; font-size:13px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .input-field:focus { border-color:#7c3aed; }
        textarea.input-field { resize:vertical; min-height:70px; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:3px; }
      `}</style>

      <div style={{ display:'flex', height:'100vh', fontFamily:"'DM Sans', sans-serif", backgroundColor:'#f5f7ff', overflow:'hidden' }}>

        {/* ===== SIDEBAR ===== */}
        <div style={{ width:240, background:'linear-gradient(160deg, #1a1060 0%, #0f0c29 100%)', display:'flex', flexDirection:'column', flexShrink:0, boxShadow:'4px 0 24px rgba(0,0,0,0.2)' }}>
          <div style={{ padding:'28px 20px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🎓</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'white', letterSpacing:'-0.3px' }}>Chatbot RAG</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Espace Enseignant</div>
            </div>
          </div>

          <nav style={{ flex:1, padding:'16px 10px', display:'flex', flexDirection:'column', gap:3 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:2, padding:'8px 12px 4px', textTransform:'uppercase' }}>Menu</div>
            {navItems.map((item, i) => (
              <button key={i} className="nav-btn" onClick={() => { setActiveNav(i); item.path && navigate(item.path); }} style={{
                display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                borderRadius:10, border:'none', cursor:'pointer', width:'100%', textAlign:'left',
                backgroundColor: activeNav===i ? 'rgba(124,58,237,0.25)' : 'transparent',
                borderLeft: activeNav===i ? '3px solid #7c3aed' : '3px solid transparent',
                color: activeNav===i ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                fontSize:14, fontWeight:500, transition:'all 0.2s',
              }}>
                <span style={{ fontSize:17 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Upload CTA in sidebar */}
          <div style={{ padding:'12px 12px 6px' }}>
            <button onClick={() => { setShowUpload(true); setUploadStatus(null); setUploadForm({ titre:'', module:'', description:'', file:null }); }} style={{
              width:'100%', padding:'11px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white',
              cursor:'pointer', fontSize:13, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              boxShadow:'0 4px 14px rgba(124,58,237,0.4)',
            }}>
              ⬆️ Uploader un PDF
            </button>
          </div>

          <div style={{ padding:'10px 12px 14px', borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:14, flexShrink:0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ color:'white', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>Enseignant</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} style={{
              width:'100%', padding:'9px', borderRadius:10, border:'none',
              backgroundColor:'rgba(220,38,38,0.15)', color:'#fca5a5',
              cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              🚪 Se déconnecter
            </button>
          </div>
        </div>

        {/* ===== MAIN ===== */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* TOPBAR */}
          <div style={{ backgroundColor:'white', padding:'0 28px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e8eaf0', flexShrink:0, boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:'#0f0c29' }}>Mon tableau de bord</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:1 }}>Bienvenue, <strong style={{ color:'#7c3aed' }}>{user?.name}</strong> 👋</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => { setShowUpload(true); setUploadStatus(null); setUploadForm({ titre:'', module:'', description:'', file:null }); }} style={{
                padding:'8px 18px', borderRadius:20, border:'none',
                background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white',
                fontSize:13, fontWeight:600, cursor:'pointer',
                boxShadow:'0 3px 10px rgba(124,58,237,0.35)',
              }}>
                ⬆️ Nouveau PDF
              </button>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:15 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ flex:1, overflow:'auto', padding:28 }}>
            <div style={{ opacity:animIn?1:0, transform:animIn?'translateY(0)':'translateY(20px)', transition:'all 0.5s ease' }}>

              {/* STAT CARDS */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, marginBottom:26 }}>
                {stats.map((card, i) => (
                  <div key={i} style={{
                    background:`linear-gradient(135deg, ${card.color1}, ${card.color2})`,
                    borderRadius:18, padding:'20px 18px', color:'white',
                    boxShadow:`0 6px 20px ${card.color1}40`,
                    position:'relative', overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top:-10, right:-10, fontSize:60, opacity:0.1 }}>{card.icon}</div>
                    <div style={{ fontSize:28, marginBottom:6 }}>{card.icon}</div>
                    <div style={{ fontSize:32, fontWeight:800, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{card.value}</div>
                    <div style={{ fontSize:12, opacity:0.85, marginTop:5 }}>{card.label}</div>
                  </div>
                ))}
              </div>

              {/* MY DOCUMENTS */}
              <div style={{ backgroundColor:'white', borderRadius:18, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.06)', marginBottom:22 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:'#0f0c29' }}>📄 Mes documents uploadés</div>
                  <span style={{ fontSize:12, color:'#7c3aed', backgroundColor:'#f5f3ff', padding:'4px 12px', borderRadius:20, fontWeight:500 }}>{myDocuments.length} document{myDocuments.length > 1 ? 's' : ''}</span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {myDocuments.map((doc) => {
                    const mc = moduleColors[doc.module] || { color:'#6b7280', bg:'#f9fafb' };
                    return (
                      <div key={doc.id} className="doc-card" style={{
                        display:'flex', alignItems:'center', gap:16,
                        padding:'16px 18px', borderRadius:14,
                        border:'1.5px solid #f1f0ff',
                        backgroundColor:'#fafafa', transition:'all 0.2s',
                      }}>
                        {/* PDF icon */}
                        <div style={{ width:46, height:46, borderRadius:12, backgroundColor:mc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📄</div>

                        {/* Info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:3 }}>{doc.titre}</div>
                          <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>{doc.description}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:11, fontWeight:500, color:mc.color, backgroundColor:mc.bg, padding:'2px 9px', borderRadius:20 }}>{doc.module}</span>
                            <span style={{ fontSize:11, color:'#9ca3af' }}>• {doc.size}</span>
                            <span style={{ fontSize:11, color:'#9ca3af' }}>• {doc.date}</span>
                          </div>
                        </div>

                        {/* Questions badge */}
                        <div style={{ textAlign:'center', flexShrink:0 }}>
                          <div style={{ fontSize:18, fontWeight:700, color:'#7c3aed' }}>{doc.questions}</div>
                          <div style={{ fontSize:10, color:'#9ca3af' }}>questions</div>
                        </div>

                        {/* Actions */}
                        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                          <button className="action-btn" onClick={() => { setTestDoc(doc); setTestQuestion(''); setTestResponse(''); }} style={{
                            padding:'7px 14px', borderRadius:9, border:'none',
                            backgroundColor:'#f0fdf4', color:'#10b981',
                            fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                          }}>🧪 Tester</button>
                          <button className="action-btn" onClick={() => setDeleteTarget(doc)} style={{
                            padding:'7px 14px', borderRadius:9, border:'none',
                            backgroundColor:'#fef2f2', color:'#ef4444',
                            fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                          }}>🗑 Supprimer</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM ROW — Quick actions + Tips */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

                {/* Quick actions */}
                <div style={{ backgroundColor:'white', borderRadius:18, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:'#0f0c29', marginBottom:16 }}>⚡ Actions rapides</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      { icon:'⬆️', label:'Uploader un nouveau PDF', desc:'Titre, module, description + fichier', color:'#7c3aed', bg:'#f5f3ff', action: () => { setShowUpload(true); setUploadStatus(null); setUploadForm({ titre:'', module:'', description:'', file:null }); } },
                      { icon:'🧪', label:'Tester la réponse Gemini', desc:'Posez une question sur votre cours', color:'#10b981', bg:'#f0fdf4', action: () => myDocuments[0] && setTestDoc(myDocuments[0]) },
                      { icon:'📚', label:'Voir tous les documents', desc:'Parcourir tous les cours disponibles', color:'#0ea5e9', bg:'#f0f9ff', action: () => navigate('/enseignant/all-documents') },
                    ].map((a, i) => (
                      <button key={i} onClick={a.action} style={{
                        display:'flex', alignItems:'center', gap:12, padding:'13px 14px',
                        borderRadius:12, border:`1px solid ${a.bg}`, backgroundColor:a.bg,
                        cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                      }}>
                        <div style={{ width:38, height:38, borderRadius:10, backgroundColor:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 2px 6px rgba(0,0,0,0.07)' }}>{a.icon}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{a.label}</div>
                          <div style={{ fontSize:11, color:'#6b7280', marginTop:1 }}>{a.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rules reminder (RG2, RG4, BNF7) */}
                <div style={{ backgroundColor:'white', borderRadius:18, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:'#0f0c29', marginBottom:16 }}>📋 Règles d'upload</div>
                  {[
                    { icon:'📏', color:'#7c3aed', bg:'#f5f3ff', text:'Taille max : 10 Mo par fichier PDF' },
                    { icon:'📄', color:'#0ea5e9', bg:'#f0f9ff', text:'Format accepté : PDF uniquement' },
                    { icon:'✏️', color:'#10b981', bg:'#f0fdf4', text:'Champs requis : titre, module, description' },
                    { icon:'🔒', color:'#f59e0b', bg:'#fffbeb', text:'Vous pouvez uniquement supprimer vos propres documents' },
                    { icon:'📝', color:'#ef4444', bg:'#fef2f2', text:'Texte extrait limité à 50 000 caractères pour Gemini' },
                  ].map((r, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 0', borderBottom: i < 4 ? '1px solid #f9fafb' : 'none' }}>
                      <div style={{ width:30, height:30, borderRadius:8, backgroundColor:r.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{r.icon}</div>
                      <span style={{ fontSize:12.5, color:'#374151', paddingTop:5, lineHeight:1.4 }}>{r.text}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== UPLOAD MODAL (UC03) ===== */}
      {showUpload && (
        <div className="overlay" onClick={() => !uploadStatus && setShowUpload(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:'#0f0c29', marginBottom:20 }}>⬆️ Uploader un document PDF</div>

            {uploadStatus === 'success' ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:15, fontWeight:600, color:'#10b981' }}>Document uploadé avec succès !</div>
                <div style={{ fontSize:13, color:'#6b7280', marginTop:6 }}>Les métadonnées ont été enregistrées.</div>
                <button onClick={() => setShowUpload(false)} style={{ marginTop:20, padding:'10px 28px', borderRadius:10, border:'none', background:'#7c3aed', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Fermer</button>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>Titre du cours *</div>
                    <input className="input-field" placeholder="Ex : Algèbre Linéaire — Chapitre 3" value={uploadForm.titre} onChange={e => setUploadForm(f => ({...f, titre: e.target.value}))} />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>Module *</div>
                    <input className="input-field" placeholder="Ex : Mathématiques S2" value={uploadForm.module} onChange={e => setUploadForm(f => ({...f, module: e.target.value}))} />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>Description</div>
                    <textarea className="input-field" placeholder="Brève description du contenu..." value={uploadForm.description} onChange={e => setUploadForm(f => ({...f, description: e.target.value}))} />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>Fichier PDF * <span style={{ color:'#9ca3af', fontWeight:400 }}>(max 10 Mo)</span></div>
                    <div style={{ border:'2px dashed #e5e7eb', borderRadius:10, padding:'20px', textAlign:'center', cursor:'pointer', backgroundColor:'#fafafa' }}
                      onClick={() => document.getElementById('pdf-input').click()}>
                      {uploadForm.file
                        ? <div style={{ fontSize:13, color:'#7c3aed', fontWeight:500 }}>📄 {uploadForm.file.name}</div>
                        : <div style={{ fontSize:13, color:'#9ca3af' }}>Cliquez pour sélectionner un PDF</div>
                      }
                      <input id="pdf-input" type="file" accept=".pdf" style={{ display:'none' }}
                        onChange={e => setUploadForm(f => ({...f, file: e.target.files[0] || null}))} />
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <button onClick={() => setShowUpload(false)} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'white', fontSize:13, fontWeight:600, cursor:'pointer', color:'#6b7280' }}>Annuler</button>
                  <button onClick={handleUploadSubmit} disabled={uploadStatus === 'loading'} style={{ flex:2, padding:'11px', borderRadius:10, border:'none', background: uploadStatus === 'loading' ? '#c4b5fd' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    {uploadStatus === 'loading' ? '⏳ Envoi en cours...' : '⬆️ Uploader'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== TEST GEMINI MODAL (UC11) ===== */}
      {testDoc && (
        <div className="overlay" onClick={() => { setTestDoc(null); setTestResponse(''); }}>
          <div className="modal" style={{ width:540 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:'#0f0c29', marginBottom:6 }}>🧪 Tester la réponse Gemini</div>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:18 }}>Document : <strong style={{ color:'#7c3aed' }}>{testDoc.titre}</strong></div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>Votre question test</div>
              <textarea className="input-field" rows={3} placeholder="Ex : Qu'est-ce qu'une matrice diagonale ?" value={testQuestion} onChange={e => setTestQuestion(e.target.value)} />
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <button onClick={() => { setTestDoc(null); setTestResponse(''); }} style={{ flex:1, padding:'10px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'white', fontSize:13, fontWeight:600, cursor:'pointer', color:'#6b7280' }}>Annuler</button>
              <button onClick={handleTest} disabled={testLoading} style={{ flex:2, padding:'10px', borderRadius:10, border:'none', background: testLoading ? '#a7f3d0' : 'linear-gradient(135deg,#10b981,#0d9488)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {testLoading ? '⏳ Gemini réfléchit...' : '🚀 Envoyer à Gemini'}
              </button>
            </div>

            {testResponse && (
              <div style={{ backgroundColor:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:12, padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#10b981', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>🤖 Réponse Gemini (non sauvegardée)</div>
                <div style={{ fontSize:13, color:'#1f2937', lineHeight:1.6, whiteSpace:'pre-line' }}>{testResponse}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL (UC08) ===== */}
      {deleteTarget && (
        <div className="overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ width:420 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🗑️</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:'#0f0c29', marginBottom:8 }}>Supprimer ce document ?</div>
              <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }}>
                Vous êtes sur le point de supprimer <strong>"{deleteTarget.titre}"</strong>.<br/>
                Cette action supprimera le fichier du serveur.<br/>
                <span style={{ color:'#ef4444' }}>Les historiques associés peuvent être affectés.</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'white', fontSize:13, fontWeight:600, cursor:'pointer', color:'#6b7280' }}>Annuler</button>
              <button onClick={() => setDeleteTarget(null)} style={{ flex:1, padding:'11px', borderRadius:10, border:'none', backgroundColor:'#ef4444', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Confirmer la suppression</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}