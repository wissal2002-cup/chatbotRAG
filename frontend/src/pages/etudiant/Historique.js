import { useState, useEffect } from 'react';
import { getConversations, exportHistory } from '../../services/conversationService';
import { useNavigate } from 'react-router-dom';

export default function Historique() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [error, setError]                 = useState('');
  const [exporting, setExporting]         = useState('');
  const navigate                          = useNavigate();

  useEffect(() => {
    getConversations()
      .then(res => setConversations(res.data))
      .catch(() => setError('Erreur chargement historique'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format, convId = null) => {
    setExporting(format);
    try {
      const res = await exportHistory(format, convId);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/plain'
      });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.download = `historique_${new Date().toISOString().slice(0,10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors de l\'export');
    } finally {
      setExporting('');
    }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* LEFT — Liste conversations */}
      <div style={{ width: selected ? 340 : '100%', borderRight: selected ? '1px solid #e5e7eb' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.3s' }}>

        {/* Header avec export global */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0f0c29' }}>🕐 Historique</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{conversations.length} conversation(s)</div>
            </div>
          </div>

          {/* Export tous */}
          {conversations.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'} style={{ flex: 1, padding: '7px 0', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {exporting === 'pdf' ? '⏳ Export...' : '📄 Tout exporter PDF'}
              </button>
              <button type="button" onClick={() => handleExport('txt')} disabled={exporting === 'txt'} style={{ flex: 1, padding: '7px 0', backgroundColor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {exporting === 'txt' ? '⏳ Export...' : '📝 Tout exporter TXT'}
              </button>
            </div>
          )}
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#c00000', padding: 10, borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          {conversations.map(conv => (
            <div key={conv.id}
              onClick={() => setSelected(conv)}
              style={{
                backgroundColor: selected?.id === conv.id ? '#f0fdf4' : 'white',
                borderRadius: 12, padding: 16, cursor: 'pointer',
                border: selected?.id === conv.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0c29', lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
                  {conv.document?.title || conv.title}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                  {new Date(conv.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                📚 {conv.document?.module} • {conv.document?.semester}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  💬 {conv.messages?.length || 0} message(s)
                </div>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Voir →</span>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Aucune conversation</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Commencez par poser une question</div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Détail conversation */}
      {selected && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f0c29' }}>{selected.document?.title}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{selected.document?.module} • {selected.document?.semester}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>

              {/* Export cette conversation */}
              <button type="button" onClick={() => handleExport('pdf', selected.id)} disabled={exporting === 'pdf'} style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {exporting === 'pdf' ? '⏳' : '📄 PDF'}
              </button>
              <button type="button" onClick={() => handleExport('txt', selected.id)} disabled={exporting === 'txt'} style={{ padding: '6px 12px', backgroundColor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {exporting === 'txt' ? '⏳' : '📝 TXT'}
              </button>

              {/* Continuer conversation */}
              <button type="button" onClick={() => {
                localStorage.setItem('continueConversation', JSON.stringify(selected));
                navigate('/etudiant/chat');
              }} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                💬 Continuer
              </button>

              <button type="button" onClick={() => setSelected(null)} style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: 20, backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selected.messages?.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Aucun message dans cette conversation</div>
            )}

            {selected.messages?.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                )}
                <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', backgroundColor: msg.role === 'user' ? '#10b981' : 'white', color: msg.role === 'user' ? 'white' : '#374151', boxShadow: '0 2px 6px rgba(0,0,0,0.07)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>M</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}