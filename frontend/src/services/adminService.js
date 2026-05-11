import api from './api';

export const getStats        = ()  => api.get('/admin/stats');
export const getStatsByModule = () => api.get('/admin/stats-by-module');
export const getDocuments    = ()  => api.get('/documents');
export const deleteDocument  = (id) => api.delete(`/documents/${id}`);