const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getTodaysPatients,
  getPatientDetails,
  startConsultation,
  createConsultationDraft,
  updateConsultationDraft,
  completeConsultation,
  getConsultationHistory,
  deleteConsultationDraft,
  updateDoctorProfile,
  markPatientNoShow,
  getDoctorNotes,
  createDoctorNote,
  deleteDoctorNote
} = require('../controllers/doctorController');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/patients/today', getTodaysPatients);
router.get('/patients/:id', getPatientDetails); // :id is queueId
router.put('/patients/:id/start', startConsultation); // :id is queueId
router.put('/patients/:id/no-show', markPatientNoShow); // Added for UPDATE in TodaysPatients

router.post('/consultations', createConsultationDraft);
router.put('/consultations/:id', updateConsultationDraft); // :id is consultationId
router.put('/consultations/:id/complete', completeConsultation); // :id is consultationId
router.get('/consultations', getConsultationHistory);
router.delete('/consultations/:id', deleteConsultationDraft); // :id is consultationId

// Added for Profile CRUD
router.put('/profile', updateDoctorProfile);

// Added for Dashboard Notes CRUD
router.get('/notes', getDoctorNotes);
router.post('/notes', createDoctorNote);
router.delete('/notes/:id', deleteDoctorNote);

module.exports = router;
