const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const StaffHandover = require('../models/StaffHandover');

// ==========================================
// DASHBOARD
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Queue.countDocuments();
    const waitingPatients = await Queue.countDocuments({ status: 'waiting' });
    const completedPatients = await Queue.countDocuments({ status: 'completed' });
    const priorityPatients = await Queue.countDocuments({ priority: { $in: ['Priority', 'Emergency'] } });

    const currentServing = await Queue.findOne({ status: 'called' }).sort({ calledTime: -1 });
    
    // Find next patient using priority weighting (Emergency > Priority > Normal) and arrival status
    const waitingList = await Queue.find({ status: 'waiting' });
    const getPriorityWeight = (p) => p === 'Emergency' ? 3 : p === 'Priority' ? 2 : 1;
    waitingList.sort((a, b) => {
      const arrA = a.arrivalStatus === 'Arrived' ? 1 : 0;
      const arrB = b.arrivalStatus === 'Arrived' ? 1 : 0;
      if (arrA !== arrB) return arrB - arrA;
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
    const queue = await Queue.find()
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
    const waitingPatients = await Queue.find({ status: 'waiting' })
                                     .populate('patientId', 'fullName');
    
    if (!waitingPatients || waitingPatients.length === 0) {
      return res.status(404).json({ success: false, message: 'No waiting patients found' });
    }

    const getPriorityWeight = (priority) => {
      if (priority === 'Emergency') return 3;
      if (priority === 'Priority') return 2;
      return 1;
    };

    waitingPatients.sort((a, b) => {
      const arrivedA = a.arrivalStatus === 'Arrived' ? 1 : 0;
      const arrivedB = b.arrivalStatus === 'Arrived' ? 1 : 0;
      if (arrivedA !== arrivedB) return arrivedB - arrivedA;

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

    // 1. Mark currently called patient as completed
    await Queue.updateMany(
      { status: 'called' },
      { $set: { status: 'completed', completedTime: Date.now() } }
    );

    // 2. Mark this patient as called and arrived
    queue.status = 'called';
    queue.arrivalStatus = 'Arrived';
    if (!queue.arrivalTime) {
      queue.arrivalTime = Date.now();
    }
    queue.calledTime = Date.now();
    queue.currentServingToken = queue.tokenNumber;
    await queue.save();

    // 3. Update currentServingToken across all active queue entries
    await Queue.updateMany(
      { status: { $ne: 'completed' } },
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
