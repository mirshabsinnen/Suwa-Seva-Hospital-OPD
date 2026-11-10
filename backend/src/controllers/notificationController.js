const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications/:userId
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    // Only allow fetching own notifications
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
