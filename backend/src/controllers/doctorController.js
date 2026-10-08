const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    // Remove date filter to match staff dashboard behavior for testing
    const appointments = await Appointment.find({});
    const appointmentIds = appointments.map(app => app._id);
    
    const queues = await Queue.find({ appointmentId: { $in: appointmentIds } });
    
    const stats = {
      totalAssigned: appointments.length,
      waiting: queues.filter(q => q.status === 'waiting' || q.status === 'called').length,
      called: queues.filter(q => q.status === 'called').length,
      serving: queues.filter(q => q.status === 'serving').length,
      completed: queues.filter(q => q.status === 'completed').length,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Today's Assigned Patients
const getTodaysPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    // Remove date filter to match staff dashboard behavior
    const appointments = await Appointment.find({}).populate('patientId', 'fullName email phone').populate('opdId', 'name');
    const appointmentIds = appointments.map(app => app._id);
    
    const queues = await Queue.find({ appointmentId: { $in: appointmentIds } }).populate('patientId', 'fullName');
    
    const patients = queues.map(q => {
      const app = appointments.find(a => a._id.toString() === q.appointmentId.toString());
      return {
        queueId: q._id,
        appointmentId: q.appointmentId,
        patientId: q.patientId._id,
        patientName: q.patientId.fullName,
        tokenNumber: q.tokenNumber,
        appointmentTime: app ? app.appointmentTime : '',
        arrivalStatus: q.arrivalStatus,
        queueStatus: q.status,
        priority: q.priority,
        opdName: app && app.opdId ? app.opdId.name : ''
      };
    });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Patient Details
const getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params; // queueId
    const queue = await Queue.findById(id).populate('patientId', 'fullName email phone');
    if (!queue) return res.status(404).json({ message: 'Queue record not found' });
    
    const appointment = await Appointment.findById(queue.appointmentId).populate('opdId', 'name').populate('hospitalId', 'name');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    const consultation = await Consultation.findOne({ queueId: id });
    
    res.json({ queue, appointment, consultation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start Consultation
const startConsultation = async (req, res) => {
  try {
    const { id } = req.params; 
    const doctorId = req.user._id;
    
    const queue = await Queue.findById(id);
    if (!queue) return res.status(404).json({ message: 'Queue record not found' });
    
    if (queue.status !== 'called') {
      return res.status(400).json({ message: 'Patient must be called before starting consultation' });
    }
    
    const appointment = await Appointment.findById(queue.appointmentId);
    if (appointment && appointment.doctorId && appointment.doctorId.toString() !== doctorId.toString()) {
      // Only block if a different doctor is explicitly assigned
      return res.status(403).json({ message: 'Unauthorized. Assigned to a different doctor' });
    }
    
    queue.status = 'serving';
    await queue.save();
    
    res.json({ message: 'Consultation started', queue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Consultation Draft
const createConsultationDraft = async (req, res) => {
  try {
    const { queueId, symptoms, diagnosis, notes } = req.body;
    const doctorId = req.user._id;
    
    const queue = await Queue.findById(queueId);
    if (!queue) return res.status(404).json({ message: 'Queue record not found' });
    
    let consultation = await Consultation.findOne({ queueId });
    if (consultation) {
      return res.status(400).json({ message: 'Consultation already exists for this queue record', consultation });
    }
    
    consultation = new Consultation({
      patientId: queue.patientId,
      doctorId,
      appointmentId: queue.appointmentId,
      queueId,
      symptoms,
      diagnosis,
      notes,
      status: 'draft'
    });
    
    await consultation.save();
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Consultation Draft
const updateConsultationDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { symptoms, diagnosis, notes } = req.body;
    
    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    
    if (consultation.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (consultation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot edit a completed consultation' });
    }
    
    if (symptoms !== undefined) consultation.symptoms = symptoms;
    if (diagnosis !== undefined) consultation.diagnosis = diagnosis;
    if (notes !== undefined) consultation.notes = notes;
    
    await consultation.save();
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete Consultation
const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params; 
    const { symptoms, diagnosis, notes } = req.body;
    
    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    
    if (consultation.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (consultation.status === 'completed') {
      return res.status(400).json({ message: 'Consultation already completed' });
    }
    
    if (symptoms !== undefined) consultation.symptoms = symptoms;
    if (diagnosis !== undefined) consultation.diagnosis = diagnosis;
    if (notes !== undefined) consultation.notes = notes;
    
    consultation.status = 'completed';
    consultation.completedAt = Date.now();
    await consultation.save();
    
    const queue = await Queue.findById(consultation.queueId);
    if (queue) {
      queue.status = 'completed';
      queue.completedTime = Date.now();
      await queue.save();
      
      const appointment = await Appointment.findById(queue.appointmentId);
      if (appointment) {
        appointment.status = 'completed';
        await appointment.save();
      }
    }
    
    res.json({ message: 'Consultation completed', consultation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Consultation History
const getConsultationHistory = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const consultations = await Consultation.find({ doctorId }).populate('patientId', 'fullName email phone').populate('appointmentId', 'appointmentDate').sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Consultation Draft
const deleteConsultationDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);
    
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    
    if (consultation.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (consultation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot delete a completed consultation' });
    }
    
    await consultation.deleteOne();
    res.json({ message: 'Draft consultation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- NEW CRUD OPERATIONS ADDED FOR MILESTONE COMPLIANCE ---

// Update Doctor Profile (UPDATE on Profile Screen)
const updateDoctorProfile = async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.fullName = fullName || user.fullName;
      user.phone = phone || user.phone;
      if (password) {
        user.password = password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark Patient as No Show (UPDATE on Todays Patients Screen)
const markPatientNoShow = async (req, res) => {
  try {
    const { id } = req.params; // queueId
    const queue = await Queue.findById(id);
    
    if (!queue) return res.status(404).json({ message: 'Queue record not found' });
    
    if (queue.status === 'serving' || queue.status === 'completed') {
      return res.status(400).json({ message: `Cannot mark a ${queue.status} patient as No Show` });
    }
    
    queue.status = 'cancelled';
    queue.arrivalStatus = 'Not Arrived'; // Or keep as arrived but cancelled
    await queue.save();
    
    res.json({ message: 'Patient marked as No Show', queue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const DoctorNote = require('../models/DoctorNote');

// Get Doctor Notes (READ on Dashboard)
const getDoctorNotes = async (req, res) => {
  try {
    const notes = await DoctorNote.find({ doctorId: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Doctor Note (CREATE on Dashboard)
const createDoctorNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required' });
    
    const note = new DoctorNote({ doctorId: req.user._id, text });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Doctor Note (DELETE on Dashboard)
const deleteDoctorNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await DoctorNote.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (note.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
