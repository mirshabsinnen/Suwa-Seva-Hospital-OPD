const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');

// @desc    Create new appointment & generate queue token
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { hospitalId, opdId, doctorId, appointmentDate, appointmentTime } = req.body;
    
    // Check if slot is already taken by this patient
    const existing = await Appointment.findOne({
      patientId: req.user._id,
      appointmentDate: new Date(appointmentDate),
      status: { $ne: 'cancelled' }
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have an appointment on this date' });
    }

    // Create Appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      hospitalId,
      opdId,
      doctorId: doctorId || null,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: 'confirmed'
    });

    // Generate token and Queue entry
    const dateStr = new Date(appointmentDate).toISOString().split('T')[0].replace(/-/g, '').slice(-4);
    const count = await Queue.countDocuments({ 
      createdAt: { $gte: new Date().setHours(0,0,0,0) } 
    });
    const tokenNumber = `A${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
    
    const queue = await Queue.create({
      appointmentId: appointment._id,
      patientId: req.user._id,
      tokenNumber,
      queuePosition: count + 1,
      estimatedWaitingTime: (count + 1) * 15 // Assuming 15 min per patient
    });

    res.status(201).json({
      appointment,
      queueToken: queue.tokenNumber,
      queueId: queue._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments
// @access  Private
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('hospitalId', 'name location')
      .populate('opdId', 'name')
      .populate('doctorId', 'fullName')
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update/Reschedule appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    appointment.appointmentDate = req.body.appointmentDate ? new Date(req.body.appointmentDate) : appointment.appointmentDate;
    appointment.appointmentTime = req.body.appointmentTime || appointment.appointmentTime;
    appointment.status = req.body.status || 'rescheduled';

    const updatedAppointment = await appointment.save();

    // Update the existing queue for this appointment
    const queue = await Queue.findOne({ appointmentId: req.params.id });
    if (queue && req.body.appointmentDate) {
      const dateStr = new Date(req.body.appointmentDate).toISOString().split('T')[0].replace(/-/g, '').slice(-4);
      const count = await Queue.countDocuments({ 
        createdAt: { $gte: new Date().setHours(0,0,0,0) } 
      });
      queue.tokenNumber = `A${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
      queue.status = 'waiting';
      queue.arrivalStatus = 'Not Arrived';
      queue.queuePosition = count + 1;
      await queue.save();
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete/Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    
    // Also update queue status
    const queue = await Queue.findOne({ appointmentId: req.params.id });
    if (queue) {
      queue.status = 'cancelled';
      await queue.save();
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
