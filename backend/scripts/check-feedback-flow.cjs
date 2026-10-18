// Live HTTP flow using temporary accounts/records only; cleanup is restricted to their IDs.
require('dotenv').config({ quiet: true });
require('node:dns').setServers((process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()).filter(Boolean));
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const express = require('express');
require('../src/models/Hospital');
require('../src/models/OPD');
const User = require('../src/models/User');
const Appointment = require('../src/models/Appointment');
const Queue = require('../src/models/Queue');
const Consultation = require('../src/models/Consultation');
const Feedback = require('../src/models/PatientFeedback');
const { dayRange, monthRange, localDate } = require('../src/utils/hioDateRange');
const feedbackService = require('../src/services/patientFeedbackService');

(async () => {
  const userIds = [0, 1, 2].map(() => new mongoose.Types.ObjectId());
  const appointmentId = new mongoose.Types.ObjectId();
  const queueId = new mongoose.Types.ObjectId();
  const run = crypto.randomBytes(8).toString('hex');
  const password = crypto.randomBytes(24).toString('hex');
  let server;
  let connected = false;
  let passed = false;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    connected = true;
    await Feedback.init();
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../src/routes/authRoutes'));
    app.use('/api/doctor', require('../src/routes/doctorRoutes'));
    app.use('/api/appointments', require('../src/routes/appointmentRoutes'));
    app.use('/api/feedback', require('../src/routes/patientFeedbackRoutes'));
    app.use('/api/hio', require('../src/routes/hioRoutes'));
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const request = async (path, token, body, method = body ? 'POST' : 'GET', status = 200) => {
      const response = await fetch(base + path, { method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      assert.equal(response.status, status, `${method} ${path}: ${result.message || 'unexpected status'}`);
      return result;
    };
    const roles = ['doctor', 'patient', 'health_information_officer'];
    for (let i = 0; i < roles.length; i++) {
      await User.create({ _id: userIds[i], fullName: `Feedback test ${roles[i]}`, email: `feedback-${run}-${i}@example.com`,
        phone: '0000000000', password, role: roles[i] });
    }
    const tokens = [];
    for (let i = 0; i < roles.length; i++) {
      const result = await request('/auth/login', null, { email: `feedback-${run}-${i}@example.com`, password });
      assert.equal(result.role, roles[i]); tokens.push(result.token);
      console.log(`PASS actual login: ${roles[i]}`);
    }
    const [doctor, patient, hio] = tokens;
    const day = localDate();
    const range = dayRange(day);
    const [year, month] = day.split('-').map(Number);
    const monthlyRange = monthRange(year, month);
    const baselineDay = await feedbackService.summary(range);
    const baselineMonth = await feedbackService.summary(monthlyRange);
    await Appointment.create({ _id: appointmentId, patientId: userIds[1], doctorId: userIds[0],
      hospitalId: new mongoose.Types.ObjectId(), opdId: new mongoose.Types.ObjectId(),
      appointmentDate: range.start, appointmentTime: '09:00 AM', status: 'confirmed' });
    await Queue.create({ _id: queueId, appointmentId, patientId: userIds[1], tokenNumber: `TEST-${run}`,
      queuePosition: 1, arrivalStatus: 'Arrived', arrivalTime: new Date(), status: 'called' });
    const patients = await request('/doctor/patients/today', doctor);
    assert.ok(patients.some(item => item.queueId === String(queueId)));
    await request(`/feedback/${appointmentId}`, patient, { rating: 5 }, 'POST', 400);
    await request(`/doctor/patients/${queueId}/start`, doctor, {}, 'PUT');
    const draft = await request('/doctor/consultations', doctor,
      { queueId, symptoms: 'Synthetic test only', diagnosis: 'Synthetic test only', notes: 'No real patient data' }, 'POST', 201);
    await request(`/doctor/consultations/${draft._id}/complete`, doctor, {}, 'PUT');
    assert.equal((await Appointment.findById(appointmentId)).status, 'completed');
    assert.equal((await Queue.findById(queueId)).status, 'completed');
    console.log('PASS doctor selects patient, starts and completes consultation');
    const appointments = await request('/appointments', patient);
    assert.equal(appointments.find(item => item._id === String(appointmentId)).status, 'completed');
    const feedback = await request(`/feedback/${appointmentId}`, patient, { rating: 5, comment: 'Synthetic service feedback test' }, 'POST', 201);
    assert.equal(feedback.data.rating, 5);
    assert.equal((await request(`/feedback/${appointmentId}`, patient)).data.rating, 5);
    await request(`/feedback/${appointmentId}`, patient, { rating: 4 }, 'POST', 409);
    console.log('PASS patient sees completed appointment, submits and reloads feedback; duplicate blocked');
    const performance = (await request(`/hio/performance?date=${day}`, hio)).data;
    const report = (await request(`/hio/reports/${year}/${month}`, hio)).data;
    assert.equal(performance.feedback.total, baselineDay.total + 1);
    assert.equal(report.feedback.total, baselineMonth.total + 1);
    assert.deepEqual(performance.feedback, await feedbackService.summary(range));
    assert.deepEqual(report.feedback, await feedbackService.summary(monthlyRange));
    assert.deepEqual(performance.feedback.comments, []);
    assert.equal('patientId' in performance.feedback, false);
    console.log('PASS HIO daily and monthly summaries include the new rating, without patient identities/comments');
    passed = true;
  } catch (error) {
    console.error('FAIL feedback flow:', error.message); process.exitCode = 1;
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    if (connected && passed && process.argv.includes('--keep-demo')) {
      await User.deleteMany({ _id: userIds[2] });
      console.log(`DEMO retained: appointment=${appointmentId}, patient=${userIds[1]}, doctor=${userIds[0]}; rating=5/5`);
    } else if (connected) {
      try {
        await Feedback.deleteMany({ appointmentId });
        await Consultation.deleteMany({ appointmentId });
        await Queue.deleteMany({ _id: queueId });
        await Appointment.deleteMany({ _id: appointmentId });
        await User.deleteMany({ _id: { $in: userIds } });
        console.log('CLEANUP: removed only this run\'s temporary feedback, visit and accounts');
      } catch (error) { console.error('CLEANUP FAILED:', error.message); process.exitCode = 1; }
    }
    await mongoose.disconnect();
  }
})();
