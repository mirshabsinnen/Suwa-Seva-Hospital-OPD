import api from './api';

export const getDoctorDashboardStats = async () => {
  const response = await api.get('/doctor/dashboard');
  return response.data;
};

export const getTodaysPatients = async () => {
  const response = await api.get('/doctor/patients/today');
  return response.data;
};

export const getPatientDetails = async (queueId) => {
  const response = await api.get(`/doctor/patients/${queueId}`);
  return response.data;
};

export const startConsultation = async (queueId) => {
  const response = await api.put(`/doctor/patients/${queueId}/start`);
  return response.data;
};

export const createConsultationDraft = async (data) => {
  const response = await api.post('/doctor/consultations', data);
  return response.data;
};

export const updateConsultationDraft = async (consultationId, data) => {
  const response = await api.put(`/doctor/consultations/${consultationId}`, data);
  return response.data;
};

export const completeConsultation = async (consultationId, data) => {
  const response = await api.put(`/doctor/consultations/${consultationId}/complete`, data);
  return response.data;
};

export const getConsultationHistory = async () => {
  const response = await api.get('/doctor/consultations');
  return response.data;
};

export const deleteConsultationDraft = async (consultationId) => {
  const response = await api.delete(`/doctor/consultations/${consultationId}`);
  return response.data;
};

export const updateDoctorProfile = async (data) => {
  const response = await api.put('/doctor/profile', data);
  return response.data;
};

export const markPatientNoShow = async (queueId) => {
  const response = await api.put(`/doctor/patients/${queueId}/no-show`);
  return response.data;
};

export const getDoctorNotes = async () => {
  const response = await api.get('/doctor/notes');
  return response.data;
};

export const createDoctorNote = async (data) => {
  const response = await api.post('/doctor/notes', data);
  return response.data;
};

export const deleteDoctorNote = async (noteId) => {
  const response = await api.delete(`/doctor/notes/${noteId}`);
  return response.data;
};
