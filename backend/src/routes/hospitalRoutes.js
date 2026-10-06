const express = require('express');
const router = express.Router();
const { getHospitals, getHospitalOPDs } = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHospitals);
router.get('/:id/opds', protect, getHospitalOPDs);

module.exports = router;
