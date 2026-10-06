const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenNumber: {
    type: String,
    required: true
  },
  queuePosition: {
    type: Number,
    required: true
  },
  currentServingToken: {
    type: String,
    default: null
  },
  estimatedWaitingTime: {
    type: Number, // In minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'serving', 'completed', 'cancelled'],
    default: 'waiting'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Queue', queueSchema);
