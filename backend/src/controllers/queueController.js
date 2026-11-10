const Queue = require('../models/Queue');

// @desc    Get queue status for a specific appointment
// @route   GET /api/queue/:appointmentId
// @access  Private
exports.getQueueStatus = async (req, res) => {
  try {
    const queue = await Queue.findOne({ appointmentId: req.params.appointmentId });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found for this appointment' });
    }

    // For demonstration, we simulate the "Currently Serving" logic
    // In a real app, a doctor would be updating the current serving token.
    // Let's just simulate 5 people ahead if position > 5, or queuePosition - 1 otherwise
    
    let currentServing = queue.currentServingToken;
    let patientsAhead = queue.queuePosition - 1;
    let estimatedWait = queue.estimatedWaitingTime;
    
    if (!currentServing) {
      const dateStr = queue.tokenNumber.split('-')[0]; // e.g. A2024
      const currentTokenNum = Math.max(1, queue.queuePosition - 5);
      currentServing = `${dateStr}-${currentTokenNum.toString().padStart(3, '0')}`;
      patientsAhead = queue.queuePosition - currentTokenNum;
      estimatedWait = patientsAhead * 15;
    }

    res.json({
      ...queue._doc,
      currentServingToken: currentServing,
      patientsAhead: patientsAhead > 0 ? patientsAhead : 0,
      estimatedWaitingTime: estimatedWait > 0 ? estimatedWait : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
