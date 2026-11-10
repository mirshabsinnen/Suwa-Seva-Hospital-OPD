const express = require('express');
const router = express.Router();
const { getHospitals, getHospitalOPDs } = require('../controllers/hospitalController');
// const { protect } = require('../middleware/authMiddleware'); // Removing protect so registration can fetch them

router.get('/', getHospitals);
router.get('/:id/opds', getHospitalOPDs);

module.exports = router;
