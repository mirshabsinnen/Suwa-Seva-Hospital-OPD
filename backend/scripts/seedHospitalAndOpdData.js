require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Hospital = require('../src/models/Hospital');
const OPD = require('../src/models/OPD');

const hospitalsData = [
  {
    name: 'National Hospital of Sri Lanka (NHSL)',
    location: 'Regent Street, Colombo 10',
    description: 'Premier tertiary healthcare hospital and the national referral center in Sri Lanka.',
    isActive: true,
  },
  {
    name: 'Colombo North Teaching Hospital',
    location: 'Hospital Road, Ragama',
    description: 'Major tertiary care teaching hospital affiliated with the Faculty of Medicine, University of Kelaniya.',
    isActive: true,
  },
  {
    name: 'Teaching Hospital Karapitiya',
    location: 'Karapitiya, Galle',
    description: 'Largest tertiary medical center in the Southern Province, affiliated with University of Ruhuna.',
    isActive: true,
  },
];

const opdSpecialties = [
  {
    name: 'General Medicine OPD',
    description: 'Primary medical consultations, triage, adult illnesses, hypertension, and non-communicable disease follow-ups.',
    isActive: true,
  },
  {
    name: 'Pediatrics OPD (Child Clinic)',
    description: 'Specialized medical consultations for infants, children, developmental checks, and childhood ailments.',
    isActive: true,
  },
  {
    name: 'Cardiology & Heart Care OPD',
    description: 'Cardiac assessments, ECG reviews, post-procedure follow-ups, and specialized cardiovascular evaluations.',
    isActive: true,
  },
  {
    name: 'Orthopedics & Fracture Clinic OPD',
    description: 'Trauma recovery, bone and joint care, arthritis management, and fracture follow-ups.',
    isActive: true,
  },
  {
    name: 'Dermatology & Skin Disease OPD',
    description: 'Clinical skin consultations, allergy testing, eczema care, and outpatient dermatological evaluations.',
    isActive: true,
  },
];

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI.trim();
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    for (const hData of hospitalsData) {
      let hospital = await Hospital.findOne({ name: hData.name });
      if (!hospital) {
        hospital = await Hospital.create(hData);
        console.log(`Created Hospital: ${hospital.name} (${hospital._id})`);
      } else {
        hospital.location = hData.location;
        hospital.description = hData.description;
        hospital.isActive = true;
        await hospital.save();
        console.log(`Updated Hospital: ${hospital.name} (${hospital._id})`);
      }

      for (const opdData of opdSpecialties) {
        let opd = await OPD.findOne({ hospitalId: hospital._id, name: opdData.name });
        if (!opd) {
          opd = await OPD.create({
            hospitalId: hospital._id,
            name: opdData.name,
            description: opdData.description,
            isActive: true,
          });
          console.log(`  -> Created OPD: ${opd.name}`);
        } else {
          opd.description = opdData.description;
          opd.isActive = true;
          await opd.save();
          console.log(`  -> Updated OPD: ${opd.name}`);
        }
      }
    }

    const User = require('../src/models/User');
    const demoDoctors = [
      { fullName: 'Dr. Anura Perera', email: 'dr.anura@suwaseva.lk', phone: '0771122334', opdName: 'General Medicine OPD' },
      { fullName: 'Dr. Chamari Fernando', email: 'dr.chamari@suwaseva.lk', phone: '0772233445', opdName: 'Pediatrics OPD (Child Clinic)' },
      { fullName: 'Dr. Priyantha Silva', email: 'dr.priyantha@suwaseva.lk', phone: '0773344556', opdName: 'Cardiology & Heart Care OPD' },
      { fullName: 'Dr. Kumara Jayasinghe', email: 'dr.kumara@suwaseva.lk', phone: '0774455667', opdName: 'Orthopedics & Fracture Clinic OPD' },
      { fullName: 'Dr. Dilrukshi Wickramasinghe', email: 'dr.dilrukshi@suwaseva.lk', phone: '0775566778', opdName: 'Dermatology & Skin Disease OPD' },
    ];

    const allOpds = await OPD.find();
    for (const d of demoDoctors) {
      const matchingOpd = allOpds.find(o => o.name === d.opdName);
      let doc = await User.findOne({ email: d.email });
      if (!doc) {
        doc = await User.create({
          fullName: d.fullName,
          email: d.email,
          phone: d.phone,
          password: 'password123',
          role: 'doctor',
          opdId: matchingOpd ? matchingOpd._id : null,
        });
        console.log(`Created Doctor: ${doc.fullName} (${d.opdName})`);
      } else {
        doc.opdId = matchingOpd ? matchingOpd._id : doc.opdId;
        await doc.save();
        console.log(`Updated Doctor: ${doc.fullName} (${d.opdName})`);
      }
    }

    const totalHospitals = await Hospital.countDocuments();
    const totalOPDs = await OPD.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    console.log(`\nDone! Total Hospitals: ${totalHospitals}, Total OPDs: ${totalOPDs}, Total Doctors: ${totalDoctors}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
