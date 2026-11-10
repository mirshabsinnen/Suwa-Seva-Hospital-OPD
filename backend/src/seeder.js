const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./models/Hospital');
const OPD = require('./models/OPD');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') }); // Make sure it finds .env if run from backend root or src

// Fallback to direct string if .env doesn't load right for script
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const hospitals = [
  {
    name: 'National Hospital of Sri Lanka',
    location: 'Colombo',
    description: 'The largest teaching hospital in Sri Lanka and the final referral centre in the country.'
  },
  {
    name: 'Colombo South Teaching Hospital',
    location: 'Kalubowila',
    description: 'A major teaching hospital located in Kalubowila.'
  },
  {
    name: 'Colombo North Teaching Hospital',
    location: 'Ragama',
    description: 'Teaching hospital affiliated with the University of Kelaniya.'
  }
];

const opdNames = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopaedics',
  'ENT'
];

const importData = async () => {
  try {
    await Hospital.deleteMany();
    await OPD.deleteMany();

    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log('Hospitals Imported!');

    const opdsToInsert = [];

    for (const hospital of createdHospitals) {
      for (const opdName of opdNames) {
        opdsToInsert.push({
          hospitalId: hospital._id,
          name: opdName,
          description: `${opdName} Department`
        });
      }
    }

    await OPD.insertMany(opdsToInsert);
    console.log('OPDs Imported!');

    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
