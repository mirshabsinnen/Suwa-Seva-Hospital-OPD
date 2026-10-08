const mongoose = require('mongoose');
require('dotenv').config();

const Hospital = require('./src/models/Hospital');
const OPD = require('./src/models/OPD');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Check if hospitals exist
    const count = await Hospital.countDocuments();
    if (count > 0) {
      console.log("Hospitals already exist. Exiting.");
      process.exit(0);
    }

    const h1 = await Hospital.create({
      name: 'Colombo General Hospital',
      location: 'Colombo',
      contactNumber: '0112691111',
      isActive: true
    });

    const h2 = await Hospital.create({
      name: 'Kandy Teaching Hospital',
      location: 'Kandy',
      contactNumber: '0812222222',
      isActive: true
    });

    await OPD.create({
      hospitalId: h1._id,
      name: 'Cardiology OPD',
      description: 'Heart related issues',
      operatingHours: '08:00 AM - 04:00 PM',
      isActive: true
    });

    await OPD.create({
      hospitalId: h1._id,
      name: 'General OPD',
      description: 'General checkups',
      operatingHours: '08:00 AM - 08:00 PM',
      isActive: true
    });

    await OPD.create({
      hospitalId: h2._id,
      name: 'Dental OPD',
      description: 'Dental care',
      operatingHours: '09:00 AM - 05:00 PM',
      isActive: true
    });

    console.log("Successfully seeded hospitals and OPDs!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
