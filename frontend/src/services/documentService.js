import api from './api';

export const getDocuments    = ()      => api.get('/documents');
export const deleteDocument  = (id)    => api.delete(`/documents/${id}`);

export const uploadDocument  = (formData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });