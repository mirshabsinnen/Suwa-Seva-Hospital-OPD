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
  },
  arrivalStatus: {
    type: String,
    enum: ['Not Arrived', 'Arrived'],
    default: 'Not Arrived'
  },
  priority: {
    type: String,
    enum: ['Normal', 'Priority', 'Emergency'],
    default: 'Normal'
  },
  arrivalTime: {
    type: Date,
    default: null
  },
  calledTime: {
    type: Date,
    default: null
  },
  completedTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Queue', queueSchema);
