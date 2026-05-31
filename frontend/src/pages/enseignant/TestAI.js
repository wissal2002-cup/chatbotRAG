import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TestAI() {
  const [documents, setDocuments]     = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [question, setQuestion]       = useState('');
  const [answer, setAnswer]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    api.get('/documents')
      .then(res => setDocuments(res.data))
      .catch(() => setError('Erreur chargement documents'));
  }, []);

  const handleTest = async () => {
    if (!selectedDoc) { setError('Choisissez un document'); return; }
    if (!question.trim()) { setError('Saisissez une question'); return; }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await api.post(`/documents/${selectedDoc.id}/test`, { question });
      setAnswer(res.data.answer);
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Texte du PDF non disponible — re-uploadez le document.');
      } else if (err.response?.status === 503) {
        setError('OpenRouter API indisponible. Réessayez.');
      } else {
        setError(err.response?.data?.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:20 }}>

      <h2 style={{ color:'#0f0c29', marginBottom:20 }}>🤖 Tester AI Assistant sur mon cours</h2>

      {error && (
        <div style={{ backgroundColor:'#fee2e2', color:'#c00000', padding:12, borderRadius:8, marginBottom:16 }}>
          {error}
        </div>
      )}

      {/* Documents list */}
      <div style={{ backgroundColor:'white', borderRadius:12, padding:20, marginBottom:16, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight:700, marginBottom:12, color:'#0f0c29' }}>📄 Choisir un document</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {documents.map(doc => (
            <div key={doc.id}
              onClick={() => { setSelectedDoc(doc); setAnswer(''); setError(''); }}
              style={{
                padding:'10px 14px', borderRadius:8, cursor:'pointer',
                border: selectedDoc?.id === doc.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                backgroundColor: selectedDoc?.id === doc.id ? '#f0fdf4' : 'white',
              }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{doc.title}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{doc.module} • {doc.semester}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Question + Button */}
      <div style={{ backgroundColor:'white', borderRadius:12, padding:20, marginBottom:16, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight:700, marginBottom:12, color:'#0f0c29' }}>💬 Votre question</div>

        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ex: Qu'est-ce qu'un algorithme ?"
          rows={4}
          style={{ width:'100%', padding:12, borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, resize:'none', boxSizing:'border-box', outline:'none' }}
        />

        {/*  type="button" + onClick — JAMAIS de <form> */}
        <button
          type="button"
          onClick={handleTest}
          disabled={loading || !selectedDoc}
          style={{
            marginTop:12, width:'100%', padding:12,
            backgroundColor: loading || !selectedDoc ? '#9ca3af' : '#10b981',
            color:'white', border:'none', borderRadius:8,
            fontSize:14, fontWeight:700,
            cursor: loading || !selectedDoc ? 'not-allowed' : 'pointer',
          }}>
          {loading ? '⏳ AI Assistant réfléchit...' : ' Tester'}
        </button>
      </div>

      {/* Answer */}
      {answer && (
        <div style={{ backgroundColor:'white', borderRadius:12, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, marginBottom:12, color:'#10b981' }}> Réponse de AI Assistant</div>
          <div style={{ backgroundColor:'#f9fafb', borderRadius:8, padding:16, borderLeft:'3px solid #10b981' }}>
            <div style={{ fontSize:13, color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{answer}</div>
          </div>
          <div style={{ marginTop:10, fontSize:11, color:'#9ca3af', textAlign:'center' }}>
            💡 Non sauvegardé dans l'historique (BF10)
          </div>
        </div>
      )}
    </div>
  );
}