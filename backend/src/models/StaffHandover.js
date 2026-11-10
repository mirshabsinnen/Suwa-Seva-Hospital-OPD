const mongoose = require('mongoose');

const staffHandoverSchema = new mongoose.Schema({
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    required: true
  },
  opd: {
    type: String, // Can also be an ObjectId ref to OPD model
    required: true
  },
  currentToken: {
    type: String,
    required: true
  },
  numberWaiting: {
    type: Number,
    required: true,
    default: 0
  },
  numberPriority: {
    type: Number,
    required: true,
    default: 0
  },
  notes: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StaffHandover', staffHandoverSchema);
