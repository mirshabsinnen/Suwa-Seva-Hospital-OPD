const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('nurse'));

// Dashboard
router.get('/dashboard', staffController.getDashboardStats);

// Queue
router.get('/queue/today', staffController.getTodayQueue);
router.get('/queue/next', staffController.getNextPatient);
router.get('/queue/active', staffController.getActivePatient);

router.route('/queue/:queueId')
  .get(staffController.getQueuePatient);

router.patch('/queue/:queueId/arrival', staffController.updateArrivalStatus);
router.patch('/queue/:queueId/priority', staffController.updatePriority);
router.patch('/queue/:queueId/call', staffController.callPatient);

// Handovers
router.route('/handovers')
  .post(staffController.createHandover)
  .get(staffController.getHandovers);

router.route('/handovers/:id')
  .patch(staffController.updateHandover)
  .delete(staffController.deleteHandover);

module.exports = router;
