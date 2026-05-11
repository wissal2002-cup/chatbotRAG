import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Upload from './Upload';
import MesDocuments from './MesDocuments';

export default function EnseignantLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const navItems = [
    { icon:'⊞',  label:'Dashboard',     path:'/enseignant/dashboard' },
    { icon:'📤', label:'Uploader PDF',   path:'/enseignant/upload' },
    { icon:'📄', label:'Mes documents',  path:'/enseignant/documents' },
    { icon:'🤖', label:'Tester Gemini',  path:'/enseignant/test' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pageTitle = () => {
    if (location.pathname === '/enseignant/upload')    return 'Uploader un PDF';
    if (location.pathname === '/enseignant/documents') return 'Mes Documents';
    if (location.pathname === '/enseignant/test')      return 'Tester Gemini';
    return 'Tableau de bord';
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-btn:hover{background:rgba(14,165,233,0.18)!important;color:#7dd3fc!important;}
        .logout-btn:hover{background:rgba(220,38,38,0.3)!important;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px;}
      `}</style>

      <div style={{display:'flex',height:'100vh',fontFamily:"'DM Sans',sans-serif",backgroundColor:'#f0f9ff',overflow:'hidden'}}>

        {/* SIDEBAR */}
        <div style={{width:240,background:'linear-gradient(160deg,#0c4a6e,#082f49)',display:'flex',flexDirection:'column',flexShrink:0,boxShadow:'4px 0 24px rgba(0,0,0,0.2)'}}>
          <div style={{padding:'26px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#0ea5e9,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🎓</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:'white'}}>Chatbot RAG</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Enseignant</div>
            </div>
          </div>

          <nav style={{flex:1,padding:'14px 10px',display:'flex',flexDirection:'column',gap:3}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',fontWeight:700,letterSpacing:2,padding:'8px 12px 4px',textTransform:'uppercase'}}>Menu</div>
            {navItems.map((item,i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{
                display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
                borderRadius:10,border:'none',cursor:'pointer',width:'100%',textAlign:'left',
                backgroundColor: isActive(item.path) ? 'rgba(14,165,233,0.25)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid #0ea5e9' : '3px solid transparent',
                color: isActive(item.path) ? '#7dd3fc' : 'rgba(255,255,255,0.5)',
                fontSize:14,fontWeight:500,transition:'all 0.2s',
              }}>
                <span style={{fontSize:17}}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{padding:'14px 12px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#0ea5e9,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{overflow:'hidden'}}>
                <div style={{color:'white',fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
                <div style={{color:'rgba(255,255,255,0.35)',fontSize:11}}>{user?.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} style={{width:'100%',padding:'9px',borderRadius:10,border:'none',backgroundColor:'rgba(220,38,38,0.15)',color:'#fca5a5',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              🚪 Se déconnecter
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{backgroundColor:'white',padding:'0 28px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e8eaf0',flexShrink:0,boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:'#0f0c29'}}>{pageTitle()}</div>
              <div style={{fontSize:12,color:'#9ca3af',marginTop:1}}>Bienvenue, <strong style={{color:'#0ea5e9'}}>{user?.name}</strong> 👋</div>
            </div>
            <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#0ea5e9,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:15}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div style={{flex:1,overflow:'auto',padding:28}}>
            <Routes>
              <Route path="dashboard" element={<EnseignantHome navigate={navigate}/>}/>
              <Route path="upload"    element={<Upload/>}/>
              <Route path="documents" element={<MesDocuments/>}/>
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

function EnseignantHome({ navigate }) {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {[
          {icon:'📤',label:'Uploader un PDF',   desc:'Ajouter un nouveau cours',            color:'#0ea5e9',bg:'#f0f9ff',path:'/enseignant/upload'},
          {icon:'📄',label:'Mes documents',      desc:'Voir et gérer vos cours uploadés',    color:'#7c3aed',bg:'#f5f3ff',path:'/enseignant/documents'},
          {icon:'🤖',label:'Tester Gemini',      desc:'Tester les réponses sur vos cours',   color:'#10b981',bg:'#f0fdf4',path:'/enseignant/test'},
        ].map((a,i) => (
          <button key={i} onClick={() => navigate(a.path)} style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:12,padding:'24px',borderRadius:16,border:`1px solid ${a.bg}`,backgroundColor:a.bg,cursor:'pointer',textAlign:'left',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',transition:'all 0.25s'}}>
            <div style={{width:50,height:50,borderRadius:14,backgroundColor:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>{a.icon}</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:'#111827',marginBottom:4}}>{a.label}</div>
              <div style={{fontSize:13,color:'#6b7280'}}>{a.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}