import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStats } from '../../services/adminService';
import Users from './Users';
import Documents from './Documents';
import Stats from './Stats';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [stats, setStats]   = useState({ students:0, enseignants:0, documents:0, questions:0 });
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 50);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data);
    } catch (e) {
      console.error('Stats error', e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon:'⊞',  label:'Dashboard',     path:'/admin/dashboard' },
    { icon:'👥', label:'Utilisateurs',   path:'/admin/users' },
    { icon:'📄', label:'Documents',      path:'/admin/documents' },
    { icon:'📊', label:'Statistiques',   path:'/admin/stats' },
  ];

  const isActive = (path) => location.pathname === path;

  const cards = [
    { label:'Étudiants',   icon:'🎓', color1:'#7c3aed', color2:'#4f46e5', value: stats.students },
    { label:'Enseignants', icon:'👨‍🏫', color1:'#0ea5e9', color2:'#6366f1', value: stats.enseignants },
    { label:'Documents',   icon:'📄', color1:'#10b981', color2:'#0d9488', value: stats.documents },
    { label:'Questions',   icon:'💬', color1:'#f59e0b', color2:'#ef4444', value: stats.questions },
  ];

  const pageTitle = () => {
    if (location.pathname === '/admin/users')     return 'Utilisateurs';
    if (location.pathname === '/admin/documents') return 'Documents';
    if (location.pathname === '/admin/stats')     return 'Statistiques';
    return 'Tableau de bord';
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-btn:hover{background:rgba(124,58,237,0.18)!important;color:#c4b5fd!important;}
        .card-h:hover{transform:translateY(-3px);box-shadow:0 14px 32px rgba(0,0,0,0.18)!important;}
        .qbtn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1)!important;}
        .logout-btn:hover{background:rgba(220,38,38,0.3)!important;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px;}
      `}</style>

      <div style={{display:'flex',height:'100vh',fontFamily:"'DM Sans',sans-serif",backgroundColor:'#f5f7ff',overflow:'hidden'}}>

        {/* SIDEBAR */}
        <div style={{width:240,background:'linear-gradient(160deg,#1a1060,#0f0c29)',display:'flex',flexDirection:'column',flexShrink:0,boxShadow:'4px 0 24px rgba(0,0,0,0.2)'}}>
          <div style={{padding:'26px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🎓</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:'white'}}>Chatbot RAG</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Administration</div>
            </div>
          </div>

          <nav style={{flex:1,padding:'14px 10px',display:'flex',flexDirection:'column',gap:3}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',fontWeight:700,letterSpacing:2,padding:'8px 12px 4px',textTransform:'uppercase'}}>Menu</div>
            {navItems.map((item,i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{
                display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
                borderRadius:10,border:'none',cursor:'pointer',width:'100%',textAlign:'left',
                backgroundColor: isActive(item.path) ? 'rgba(124,58,237,0.25)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid #7c3aed' : '3px solid transparent',
                color: isActive(item.path) ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                fontSize:14,fontWeight:500,transition:'all 0.2s',
              }}>
                <span style={{fontSize:17}}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{padding:'14px 12px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{overflow:'hidden'}}>
                <div style={{color:'white',fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
                <div style={{color:'rgba(255,255,255,0.35)',fontSize:11}}>{user?.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} style={{width:'100%',padding:'9px',borderRadius:10,border:'none',backgroundColor:'rgba(220,38,38,0.15)',color:'#fca5a5',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

          {/* TOPBAR */}
          <div style={{backgroundColor:'white',padding:'0 28px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e8eaf0',flexShrink:0,boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:'#0f0c29'}}>{pageTitle()}</div>
              <div style={{fontSize:12,color:'#9ca3af',marginTop:1}}>Bienvenue, <strong style={{color:'#7c3aed'}}>{user?.name}</strong> 👋</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontSize:12,color:'#6b7280',backgroundColor:'#f9fafb',padding:'6px 14px',borderRadius:20,border:'1px solid #e5e7eb'}}>🟢 Système opérationnel</div>
              <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:15}}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div style={{flex:1,overflow:'auto',padding:28}}>
            <Routes>
              <Route path="dashboard" element={
                <DashboardHome cards={cards} navigate={navigate} animIn={animIn} stats={stats}/>
              }/>
              <Route path="users"     element={<Users/>}/>
              <Route path="documents" element={<Documents/>}/>
              <Route path="stats"     element={<Stats/>}/>
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardHome({ cards, navigate, animIn, stats }) {
  return (
    <div style={{opacity:animIn?1:0,transform:animIn?'translateY(0)':'translateY(20px)',transition:'all 0.5s ease'}}>

      {/* STAT CARDS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,marginBottom:28}}>
        {cards.map((card,i) => (
          <div key={i} className="card-h" style={{background:`linear-gradient(135deg,${card.color1},${card.color2})`,borderRadius:18,padding:'22px 20px',color:'white',boxShadow:`0 6px 20px ${card.color1}40`,position:'relative',overflow:'hidden',transition:'all 0.25s ease'}}>
            <div style={{position:'absolute',top:-12,right:-12,fontSize:64,opacity:0.12}}>{card.icon}</div>
            <div style={{fontSize:30,marginBottom:8}}>{card.icon}</div>
            <div style={{fontSize:36,fontWeight:800,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{card.value}</div>
            <div style={{fontSize:13,opacity:0.85,marginTop:6}}>{card.label}</div>
            <div style={{marginTop:10,height:3,backgroundColor:'rgba(255,255,255,0.2)',borderRadius:2}}>
              <div style={{height:'100%',width:'60%',backgroundColor:'rgba(255,255,255,0.5)',borderRadius:2}}/>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{backgroundColor:'white',borderRadius:18,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.06)',marginBottom:24}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#0f0c29',marginBottom:18}}>⚡ Actions rapides</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {[
            {icon:'👥',label:'Gérer les utilisateurs',desc:'Ajout, modification, suppression',color:'#7c3aed',bg:'#f5f3ff',path:'/admin/users'},
            {icon:'📄',label:'Gérer les documents',   desc:'Consulter et supprimer les PDF', color:'#0ea5e9',bg:'#f0f9ff',path:'/admin/documents'},
            {icon:'📊',label:'Voir les statistiques', desc:'Questions posées par module',    color:'#10b981',bg:'#f0fdf4',path:'/admin/stats'},
          ].map((a,i) => (
            <button key={i} className="qbtn" onClick={() => navigate(a.path)} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'18px',borderRadius:14,border:`1px solid ${a.bg}`,backgroundColor:a.bg,cursor:'pointer',textAlign:'left',transition:'all 0.25s ease',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{width:44,height:44,borderRadius:12,backgroundColor:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>{a.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:'#111827',marginBottom:4}}>{a.label}</div>
                <div style={{fontSize:12,color:'#6b7280',lineHeight:1.4}}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div style={{backgroundColor:'white',borderRadius:18,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#0f0c29',marginBottom:18}}>👥 Répartition des rôles</div>
          {[
             { role:'Étudiants',   color:'#7c3aed', pct: stats.roles_pct?.etudiants   || 0 },
             { role:'Enseignants', color:'#0ea5e9', pct: stats.roles_pct?.enseignants || 0 },
             { role:'Admins',      color:'#10b981', pct: stats.roles_pct?.admins      || 0 },
          ].map((item,i) => (
            <div key={i} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>{item.role}</span>
                <span style={{fontSize:13,fontWeight:700,color:item.color}}>{item.pct}%</span>
              </div>
              <div style={{backgroundColor:'#f3f4f6',borderRadius:6,height:8,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${item.pct}%`,background:`linear-gradient(90deg,${item.color},${item.color}aa)`,borderRadius:6,transition:'width 0.8s ease'}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{backgroundColor:'white',borderRadius:18,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#0f0c29',marginBottom:18}}>⚙️ Informations système</div>
          {[
            {label:'Backend',        value:'Laravel 11',    icon:'🔧',color:'#7c3aed'},
            {label:'Frontend',       value:'React.js',      icon:'⚛️',color:'#0ea5e9'},
            {label:'Base de données',value:'MySQL',         icon:'🗄️',color:'#10b981'},
            {label:'Auth',           value:'Sanctum (JWT)', icon:'🔐',color:'#f59e0b'},
            {label:'IA',             value:'assistant IA',  icon:'🤖',color:'#ec4899'},
          ].map((info,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<4?'1px solid #f9fafb':'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:16}}>{info.icon}</span>
                <span style={{fontSize:13,color:'#6b7280'}}>{info.label}</span>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:info.color,backgroundColor:`${info.color}15`,padding:'3px 10px',borderRadius:20}}>{info.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}