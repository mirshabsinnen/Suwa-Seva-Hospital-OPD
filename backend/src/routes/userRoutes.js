const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDoctorsByOpd } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/doctors/opd/:opdId', protect, getDoctorsByOpd);

router.route('/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
