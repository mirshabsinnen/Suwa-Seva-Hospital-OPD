const express = require('express');
const router = express.Router();
const { getQueueStatus } = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:appointmentId')
  .get(protect, getQueueStatus);

module.exports = router;
