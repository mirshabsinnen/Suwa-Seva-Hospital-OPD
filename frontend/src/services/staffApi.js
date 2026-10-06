import api from './api';

/**
 * Service to handle all Staff (Nurse) related backend API requests.
 */
const staffApi = {
  // DASHBOARD
  getDashboard: async () => {
    const response = await api.get('/staff/dashboard');
    return response.data;
  },

  // QUEUE MANAGEMENT
  getTodayQueue: async () => {
    const response = await api.get('/staff/queue/today');
    return response.data;
  },

  getQueuePatient: async (queueId) => {
    const response = await api.get(`/staff/queue/${queueId}`);
    return response.data;
  },

  confirmArrival: async (queueId) => {
    const response = await api.patch(`/staff/queue/${queueId}/arrival`);
    return response.data;
  },

  updatePriority: async (queueId, priority) => {
    const response = await api.patch(`/staff/queue/${queueId}/priority`, { priority });
    return response.data;
  },

  getNextPatient: async () => {
    const response = await api.get('/staff/queue/next');
    return response.data;
  },

  callPatient: async (queueId) => {
    const response = await api.patch(`/staff/queue/${queueId}/call`);
    return response.data;
  },

  getActivePatient: async () => {
    const response = await api.get('/staff/queue/active');
    return response.data;
  },

  // SHIFT HANDOVER
  createHandover: async (data) => {
    const response = await api.post('/staff/handovers', data);
    return response.data;
  },

  getHandovers: async () => {
    const response = await api.get('/staff/handovers');
    return response.data;
  },

  updateHandover: async (id, data) => {
    const response = await api.patch(`/staff/handovers/${id}`, data);
    return response.data;
  },

  deleteHandover: async (id) => {
    const response = await api.delete(`/staff/handovers/${id}`);
    return response.data;
  }
};

export default staffApi;
