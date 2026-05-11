import { useState, useEffect } from 'react';
import { getStatsByModule } from '../../services/adminService';

export default function Stats() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatsByModule()
      .then(res => setData(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const maxQ = Math.max(...data.map(d => d.questions), 1);
  const maxD = Math.max(...data.map(d => d.documents), 1);
  const colors = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899'];

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#6b7280'}}>Chargement...</div>;

  return (
    <div>
      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
        {[
          {label:'Total modules',   value:data.length,                              icon:'📚',color:'#7c3aed'},
          {label:'Total documents', value:data.reduce((s,d)=>s+d.documents,0),     icon:'📄',color:'#0ea5e9'},
          {label:'Total questions', value:data.reduce((s,d)=>s+d.questions,0),     icon:'💬',color:'#10b981'},
        ].map((c,i) => (
          <div key={i} style={{backgroundColor:'white',borderRadius:16,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:50,height:50,borderRadius:14,backgroundColor:`${c.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{c.icon}</div>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:'#0f0c29',fontFamily:"'Syne',sans-serif"}}>{c.value}</div>
              <div style={{fontSize:13,color:'#6b7280'}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>

        {/* Questions bar chart */}
        <div style={{backgroundColor:'white',borderRadius:18,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#0f0c29',marginBottom:20}}>💬 Questions par module</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:10,height:160}}>
            {data.map((d,i) => {
              const h = (d.questions / maxQ) * 130;
              return (
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#6b7280'}}>{d.questions}</div>
                  <div style={{width:'100%',height:h||4,borderRadius:'6px 6px 0 0',background:`linear-gradient(to top,${colors[i%colors.length]},${colors[i%colors.length]}88)`,boxShadow:`0 4px 12px ${colors[i%colors.length]}33`,transition:'height 0.6s ease'}}/>
                  <div style={{fontSize:9,color:'#9ca3af',textAlign:'center',lineHeight:1.3}}>{d.module.split(' ')[0]}</div>
                </div>
              );
            })}
            {data.length===0 && <div style={{flex:1,textAlign:'center',color:'#9ca3af',fontSize:13}}>Aucune donnée</div>}
          </div>
        </div>

        {/* Documents bar chart */}
        <div style={{backgroundColor:'white',borderRadius:18,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#0f0c29',marginBottom:20}}>📄 Documents par module</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:10,height:160}}>
            {data.map((d,i) => {
              const h = (d.documents / maxD) * 130;
              return (
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#6b7280'}}>{d.documents}</div>
                  <div style={{width:'100%',height:h||4,borderRadius:'6px 6px 0 0',background:`linear-gradient(to top,${colors[i%colors.length]},${colors[i%colors.length]}88)`,boxShadow:`0 4px 12px ${colors[i%colors.length]}33`,transition:'height 0.6s ease'}}/>
                  <div style={{fontSize:9,color:'#9ca3af',textAlign:'center',lineHeight:1.3}}>{d.module.split(' ')[0]}</div>
                </div>
              );
            })}
            {data.length===0 && <div style={{flex:1,textAlign:'center',color:'#9ca3af',fontSize:13}}>Aucune donnée</div>}
          </div>
        </div>

        {/* Table detail */}
        <div style={{gridColumn:'1/-1',backgroundColor:'white',borderRadius:18,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#0f0c29',marginBottom:18}}>📊 Détail par module</div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{backgroundColor:'#f9fafb'}}>
                {['Module','Documents','Questions','Activité'].map(h => (
                  <th key={h} style={{textAlign:'left',padding:'10px 16px',fontSize:12,color:'#6b7280',fontWeight:700,borderBottom:'2px solid #f3f4f6'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d,i) => (
                <tr key={i} style={{borderBottom:'1px solid #f9fafb'}}>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:10,height:10,borderRadius:'50%',backgroundColor:colors[i%colors.length]}}/>
                      <span style={{fontSize:14,fontWeight:600,color:'#111827'}}>{d.module}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 16px',fontSize:14,color:'#374151',fontWeight:600}}>{d.documents}</td>
                  <td style={{padding:'12px 16px',fontSize:14,color:'#374151',fontWeight:600}}>{d.questions}</td>
                  <td style={{padding:'12px 16px',width:200}}>
                    <div style={{backgroundColor:'#f3f4f6',borderRadius:6,height:8,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${maxQ>0?(d.questions/maxQ)*100:0}%`,backgroundColor:colors[i%colors.length],borderRadius:6,transition:'width 0.8s ease'}}/>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length===0 && (
                <tr><td colSpan={4} style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Aucune donnée disponible</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}