import api from './api';

const read = async (path, options = {}) => (await api.get(`/hio${path}`, options)).data.data;
export default {
  getReportNote: (year, month, options) => read(`/report-notes/${year}/${month}`, options),
  createReportNote: async payload => (await api.post('/hio/report-notes', payload)).data.data,
  updateReportNote: async (id, payload) => (await api.put(`/hio/report-notes/${id}`, payload)).data.data,
  deleteReportNote: async id => (await api.delete(`/hio/report-notes/${id}`)).data.data,
  dashboard: options => read('/dashboard', options),
  queue: options => read('/queue-stats', options),
  performance: options => read('/performance', options),
  reports: options => read('/reports', options),
  report: (year, month, options) => read(`/reports/${year}/${month}`, options),
};
