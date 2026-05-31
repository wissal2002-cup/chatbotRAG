import api from './api';

export const getDocuments       = ()         => api.get('/documents');
export const getDocument        = (id)       => api.get(`/documents/${id}`);
export const createConversation = (data)     => api.post('/conversations', data);
export const sendMessage        = (id, data) => api.post(`/conversations/${id}/messages`, data);
export const getMessages        = (id)       => api.get(`/conversations/${id}/messages`);
export const getConversations   = ()         => api.get('/conversations');

// ✅ Export
export const exportHistory = (format, convId = null) => {
  const params = convId
    ? `?format=${format}&conversation_id=${convId}`
    : `?format=${format}`;
  return api.get(`/conversations/export${params}`, {
    responseType: 'blob' // ← important pour télécharger le fichier
  });
};