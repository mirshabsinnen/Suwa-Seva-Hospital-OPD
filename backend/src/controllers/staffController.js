const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const StaffHandover = require('../models/StaffHandover');

// ==========================================
// DASHBOARD
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalPatients = await Queue.countDocuments({ createdAt: { $gte: today } });
    const waitingPatients = await Queue.countDocuments({ status: 'waiting', arrivalStatus: 'Arrived', createdAt: { $gte: today } });
    const completedPatients = await Queue.countDocuments({ status: 'completed', createdAt: { $gte: today } });
    const priorityPatients = await Queue.countDocuments({ priority: { $in: ['Priority', 'Emergency'] }, createdAt: { $gte: today } });

    const currentServing = await Queue.findOne({ status: 'called', createdAt: { $gte: today } }).sort({ calledTime: -1 });
    
    // Find next token: arrived, waiting, sorted by priority then time (simplistic sort for now)
    const nextPatient = await Queue.findOne({ status: 'waiting', arrivalStatus: 'Arrived', createdAt: { $gte: today } })
                                   .sort({ queuePosition: 1 });

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        waitingPatients,
        completedPatients,
        priorityPatients,
        currentlyServingToken: currentServing ? currentServing.tokenNumber : null,
        nextToken: nextPatient ? nextPatient.tokenNumber : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ==========================================
// QUEUE MANAGEMENT
// ==========================================
exports.getTodayQueue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queue = await Queue.find({ createdAt: { $gte: today } })
                             .populate('patientId', 'fullName')
                             .sort({ queuePosition: 1 });
    
    res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getQueuePatient = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId).populate('patientId', 'fullName phone');
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue record not found' });
    }
    const appointment = await Appointment.findById(queue.appointmentId).populate('opdId');
    
    res.status(200).json({ success: true, data: { queue, appointment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateArrivalStatus = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue record not found' });
    }

    queue.arrivalStatus = 'Arrived';
    queue.arrivalTime = Date.now();
    await queue.save();

    res.status(200).json({ success: true, data: queue, message: 'Patient arrival confirmed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const queue = await Queue.findById(req.params.queueId);
    
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue record not found' });
    }

    queue.priority = priority;
    
    // In a real system, you would recalculate the queue positions of all patients.
    // For this prototype, we will just move them to position 1 if they are Priority/Emergency.
    if (priority === 'Priority' || priority === 'Emergency') {
        queue.queuePosition = 1; 
    }

    await queue.save();

    res.status(200).json({ success: true, data: queue, message: 'Priority updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getNextPatient = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextPatient = await Queue.findOne({ status: 'waiting', arrivalStatus: 'Arrived', createdAt: { $gte: today } })
                                   .sort({ queuePosition: 1 })
                                   .populate('patientId', 'fullName');
    
    if (!nextPatient) {
      return res.status(404).json({ success: false, message: 'No waiting patients found' });
    }

    res.status(200).json({ success: true, data: nextPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.callPatient = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue record not found' });
    }

    queue.status = 'called';
    queue.calledTime = Date.now();
    await queue.save();

    res.status(200).json({ success: true, data: queue, message: 'Patient called successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getActivePatient = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activePatient = await Queue.findOne({ status: 'called', createdAt: { $gte: today } })
                                     .sort({ calledTime: -1 })
                                     .populate('patientId', 'fullName');
    
    res.status(200).json({ success: true, data: activePatient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ==========================================
// SHIFT HANDOVER
// ==========================================
exports.createHandover = async (req, res) => {
  try {
    req.body.createdBy = req.user ? req.user.id : "60d0fe4f5311236168a109ca"; // Fake ID for testing if no auth
    const handover = await StaffHandover.create(req.body);
    res.status(201).json({ success: true, data: handover, message: 'Handover created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHandovers = async (req, res) => {
  try {
    const handovers = await StaffHandover.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: handovers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateHandover = async (req, res) => {
  try {
    let handover = await StaffHandover.findById(req.params.id);
    if (!handover) {
      return res.status(404).json({ success: false, message: 'Handover not found' });
    }

    handover = await StaffHandover.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: handover, message: 'Handover updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteHandover = async (req, res) => {
  try {
    const handover = await StaffHandover.findById(req.params.id);
    if (!handover) {
      return res.status(404).json({ success: false, message: 'Handover not found' });
    }

    await handover.remove();
    res.status(200).json({ success: true, data: {}, message: 'Handover deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
