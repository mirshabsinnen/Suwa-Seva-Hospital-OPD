import api from './api';

const read = async (path, options = {}) => (await api.get(`/hio${path}`, options)).data.data;
export default {
  dashboard: options => read('/dashboard', options),
  queue: options => read('/queue-stats', options),
  performance: options => read('/performance', options),
  reports: options => read('/reports', options),
  report: (year, month, options) => read(`/reports/${year}/${month}`, options),
};
