const Hospital = require('../models/Hospital');
const OPD = require('../models/OPD');

// @desc    Get all active hospitals
// @route   GET /api/hospitals
// @access  Private
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get OPDs for a specific hospital
// @route   GET /api/hospitals/:id/opds
// @access  Private
exports.getHospitalOPDs = async (req, res) => {
  try {
    const opds = await OPD.find({ 
      hospitalId: req.params.id,
      isActive: true 
    });
    res.json(opds);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
