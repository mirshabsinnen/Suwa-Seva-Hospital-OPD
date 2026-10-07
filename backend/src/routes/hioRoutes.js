const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const controller = require('../controllers/hioController');

router.use(protect);
router.use((req, res, next) => {
  if (req.user?.role !== 'health_information_officer') {
    return res.status(403).json({ success: false, message: 'Health Information Officer access required' });
  }
  next();
});
router.get('/dashboard', controller.dashboard);
router.get('/queue-stats', controller.queueStats);
router.get('/performance', controller.performance);
router.get('/reports', controller.reports);
router.get('/reports/:year/:month', controller.monthlyReport);
module.exports = router;
