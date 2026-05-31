import { useState, useEffect, useRef } from 'react';
import {
  getDocuments,
  getDocument,
  createConversation,
  sendMessage
} from '../../services/conversationService';
import { useAuth } from '../../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docDetails, setDocDetails] = useState(null);
  const [showPdfContent, setShowPdfContent] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('select');

  const messagesEndRef = useRef(null);

  // Charger documents
  useEffect(() => {
    getDocuments()
      .then((res) => setDocuments(res.data))
      .catch(() => setError('Erreur chargement documents'));
  }, []);

  // Reprendre conversation
  useEffect(() => {
    const savedConv = localStorage.getItem('continueConversation');

    if (savedConv) {
      const conv = JSON.parse(savedConv);

      localStorage.removeItem('continueConversation');

      setConversation(conv);
      setMessages(conv.messages || []);

      getDocument(conv.document_id || conv.document?.id)
        .then((res) => {
          setSelectedDoc(res.data);
          setDocDetails(res.data);
          setStep('chat');
        })
        .catch(() => {});
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSelectDoc = async (doc) => {
    setSelectedDoc(doc);
    setError('');
    setMessages([]);

    try {
      const detailRes = await getDocument(doc.id);
      setDocDetails(detailRes.data);

      const convRes = await createConversation({
        document_id: doc.id
      });

      setConversation(convRes.data);
      setStep('chat');
    } catch (err) {
      setError('Erreur création conversation');
    }
  };

  const handleSend = () => {
    if (!question.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: question,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setError('');

    sendMessage(conversation.id, {
      question: userMessage.content
    })
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.answer,
            created_at: new Date().toISOString()
          }
        ]);
      })
      .catch((err) => {
        setError(
          err.response?.status === 503
            ? 'Service IA indisponible'
            : 'Erreur envoi message'
        );

        setMessages((prev) => prev.slice(0, -1));
      })
      .finally(() => setLoading(false));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const semColors = {
    S1: '#7c3aed',
    S2: '#0ea5e9',
    S3: '#10b981',
    S4: '#f59e0b',
    S5: '#ef4444',
    S6: '#ec4899'
  };

  const pdfUrl = docDetails
    ? `http://localhost:8000/api/documents/${docDetails.id}/view?token=${localStorage.getItem(
        'token'
      )}`
    : '';

  // STEP 1
  if (step === 'select') {
    return (
      <div style={{ padding: 28, overflow: 'auto', flex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: '#0f0c29',
                marginBottom: 6
              }}
            >
              📚 Choisir un cours
            </div>

            <div
              style={{
                fontSize: 14,
                color: '#6b7280'
              }}
            >
              Sélectionnez un document pour commencer
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#c00000',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,1fr)',
              gap: 14
            }}
          >
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div
                  style={{
                    height: 4,
                    backgroundColor:
                      semColors[doc.semester] || '#10b981'
                  }}
                />

                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 10
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.3,
                        flex: 1
                      }}
                    >
                      {doc.title}
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                        backgroundColor: `${
                          semColors[doc.semester] || '#10b981'
                        }15`,
                        color:
                          semColors[doc.semester] || '#10b981',
                        flexShrink: 0,
                        marginLeft: 8
                      }}
                    >
                      {doc.semester}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#6b7280',
                      marginBottom: 4
                    }}
                  >
                    📚 {doc.module}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: '#9ca3af',
                      marginBottom: 14
                    }}
                  >
                    👤 {doc.enseignant}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleSelectDoc(doc)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      💬 Démarrer le chat
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await getDocument(doc.id);
                        setDocDetails(res.data);
                        setShowPdfContent(true);
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f0fdf4',
                        color: '#10b981',
                        border: '1px solid #bbf7d0',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      📖 Voir PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: 60,
                  color: '#9ca3af'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  📭
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  Aucun document disponible
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PDF MODAL */}
        {showPdfContent && docDetails && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                width: '100%',
                maxWidth: 900,
                height: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#0f0c29'
                    }}
                  >
                    {docDetails.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      marginTop: 2
                    }}
                  >
                    {docDetails.module} • {docDetails.semester} •{' '}
                    {docDetails.enseignant}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 14px',
                      backgroundColor: '#f0fdf4',
                      color: '#10b981',
                      border: '1px solid #bbf7d0',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    🔗 Ouvrir dans un onglet
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowPdfContent(false)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: '#f3f4f6',
                      cursor: 'pointer',
                      fontSize: 16
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <iframe
                  src={pdfUrl}
                  title={docDetails.title}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STEP 2
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* CHAT */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* HEADER */}
        
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              📄
            </div>

            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {selectedDoc?.title || docDetails?.title}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: '#9ca3af'
                }}
              >
                {selectedDoc?.module || docDetails?.module} •{' '}
                {selectedDoc?.semester || docDetails?.semester}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPdfContent(!showPdfContent)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            📖 PDF
          </button>
        </div>

        {/* MESSAGES */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 20,
            backgroundColor: '#f9fafb'
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent:
                  msg.role === 'user'
                    ? 'flex-end'
                    : 'flex-start',
                marginBottom: 14
              }}
            >
              
              <div
                style={{
                  maxWidth: '72%',
                  padding: '10px 14px',
                  borderRadius:
                    msg.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                  backgroundColor:
                    msg.role === 'user'
                      ? '#10b981'
                      : 'white',
                  color:
                    msg.role === 'user'
                      ? 'white'
                      : '#374151',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Posez votre question..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                resize: 'none'
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !question.trim()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* PDF PANEL */}
      {showPdfContent && docDetails && (
        <div
          style={{
            width: 400,
            borderLeft: '1px solid #e5e7eb',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700
              }}
            >
              📖 {docDetails.title}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#f0fdf4',
                  color: '#10b981',
                  border: '1px solid #bbf7d0',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                🔗 Plein écran
              </a>

              <button
                type="button"
                onClick={() =>
                  setShowPdfContent(false)
                }
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <iframe
              src={pdfUrl}
              title={docDetails.title}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}