const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const service = require('../services/patientFeedbackService');
router.use(protect, authorize('patient'));
const handler = (work, status = 200) => async (req, res) => {
  try { res.status(status).json({ success: true, data: await work(req) }); }
  catch (error) {
    const code = error.status || (error.name === 'ValidationError' ? 400 : 500);
    if (code === 500) console.error('Patient feedback error:', error.message);
    res.status(code).json({ success: false, message: code === 500 ? 'Unable to process feedback. Please try again.' : error.message });
  }
};
router.get('/:appointmentId', handler(req => service.read(req.user._id, req.params.appointmentId)));
router.post('/:appointmentId', handler(req => service.submit(req.user._id, req.params.appointmentId, req.body), 201));
module.exports = router;
