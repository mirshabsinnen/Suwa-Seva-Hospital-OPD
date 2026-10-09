const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const StaffHandover = require('../models/StaffHandover');

// Helper to get today's appointment IDs
const getTodaysAppointmentIds = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const todaysAppointments = await Appointment.find({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  }).select('_id');
  return todaysAppointments.map(a => a._id);
};

// ==========================================
// DASHBOARD
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const todaysAppointmentIds = await getTodaysAppointmentIds();
    const query = { appointmentId: { $in: todaysAppointmentIds } };

    const totalPatients = await Queue.countDocuments(query);
    const waitingPatients = await Queue.countDocuments({ ...query, status: 'waiting' });
    const completedPatients = await Queue.countDocuments({ ...query, status: 'completed' });
    const priorityPatients = await Queue.countDocuments({ ...query, priority: { $in: ['Priority', 'Emergency'] } });

    const currentServing = await Queue.findOne({ ...query, status: 'called' }).sort({ calledTime: -1 });
    
    // Find next patient using priority weighting (Emergency > Priority > Normal) and arrival status
    const waitingList = await Queue.find({ ...query, status: 'waiting', arrivalStatus: 'Arrived' });
    const getPriorityWeight = (p) => p === 'Emergency' ? 3 : p === 'Priority' ? 2 : 1;
    waitingList.sort((a, b) => {
      const wA = getPriorityWeight(a.priority);
      const wB = getPriorityWeight(b.priority);
      if (wA !== wB) return wB - wA;
      return (a.queuePosition || 999) - (b.queuePosition || 999);
    });

    const nextPatient = waitingList.length > 0 ? waitingList[0] : null;

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
    const todaysAppointmentIds = await getTodaysAppointmentIds();
    const queue = await Queue.find({ appointmentId: { $in: todaysAppointmentIds } })
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

    if (queue.status === 'cancelled' || queue.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot confirm arrival for cancelled or completed appointments' });
    }

    if (queue.arrivalStatus !== 'Arrived') {
      queue.arrivalStatus = 'Arrived';
      queue.arrivalTime = Date.now();
      await queue.save();
    }

    res.status(200).json({ success: true, data: queue, message: 'Patient arrival confirmed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const validPriorities = ['Normal', 'Priority', 'Emergency'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }

    const queue = await Queue.findById(req.params.queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue record not found' });
    }

    queue.priority = priority;
    await queue.save();

    res.status(200).json({ success: true, data: queue, message: 'Priority updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getNextPatient = async (req, res) => {
  try {
    const todaysAppointmentIds = await getTodaysAppointmentIds();
    const waitingPatients = await Queue.find({ 
      appointmentId: { $in: todaysAppointmentIds },
      status: 'waiting', 
      arrivalStatus: 'Arrived' 
    }).populate('patientId', 'fullName');
    
    if (!waitingPatients || waitingPatients.length === 0) {
      return res.status(200).json({ success: true, data: null, message: 'No waiting patients found' });
    }

    const getPriorityWeight = (priority) => {
      if (priority === 'Emergency') return 3;
      if (priority === 'Priority') return 2;
      return 1;
    };

    waitingPatients.sort((a, b) => {
      const weightA = getPriorityWeight(a.priority);
      const weightB = getPriorityWeight(b.priority);
      if (weightA !== weightB) return weightB - weightA;

      return (a.queuePosition || 999) - (b.queuePosition || 999);
    });

    const nextPatient = waitingPatients[0];

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
    
    if (queue.status === 'cancelled' || queue.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot call cancelled or completed patients' });
    }

    if (queue.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Patient is not waiting' });
    }

    // 1. Mark this patient as called and arrived
    queue.status = 'called';
    queue.arrivalStatus = 'Arrived';
    if (!queue.arrivalTime) {
      queue.arrivalTime = Date.now();
    }
    queue.calledTime = Date.now();
    queue.currentServingToken = queue.tokenNumber;
    await queue.save();

    // 2. Update currentServingToken across all active queue entries
    const todaysAppointmentIds = await getTodaysAppointmentIds();
    await Queue.updateMany(
      { appointmentId: { $in: todaysAppointmentIds }, status: { $ne: 'completed' } },
      { $set: { currentServingToken: queue.tokenNumber } }
    );

    res.status(200).json({ success: true, data: queue, message: 'Patient called successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getActivePatient = async (req, res) => {
  try {
    const activePatient = await Queue.findOne({ status: 'called' })
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
    req.body.createdBy = req.user ? req.user.id : null;
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
    const handover = await StaffHandover.findByIdAndDelete(req.params.id);
    if (!handover) {
      return res.status(404).json({ success: false, message: 'Handover not found' });
    }

    res.status(200).json({ success: true, data: {}, message: 'Handover deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
