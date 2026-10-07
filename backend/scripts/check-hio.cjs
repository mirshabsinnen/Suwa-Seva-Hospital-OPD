// Read-only integration checks against the configured database. Never print JWTs or credentials.
require('dotenv').config({ quiet: true });
require('node:dns').setServers((process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()).filter(Boolean));
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Appointment = require('../src/models/Appointment');
const Queue = require('../src/models/Queue');
const { dayRange, localDate } = require('../src/utils/hioDateRange');

(async () => {
  let server;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('MongoDB connected successfully (read-only HIO check)');
    const app = express();
    app.use('/api/hio', require('../src/routes/hioRoutes'));
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api/hio`;
    const hio = await User.findOne({ role: 'health_information_officer' }).select('_id');
    const other = await User.findOne({ role: { $ne: 'health_information_officer' } }).select('_id');
    assert.ok(hio, 'Create an HIO account through existing registration before live integration checks');
    const tokenFor = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '2m' });
    const token = tokenFor(hio);
    async function request(path, expected = 200, auth = token) {
      const response = await fetch(base + path, { headers: auth ? { Authorization: `Bearer ${auth}` } : {} });
      assert.equal(response.status, expected, `${path} HTTP status`);
      const result = await response.json();
      console.log(`PASS ${expected} ${path}`);
      return result.data;
    }
    for (const path of ['/dashboard', '/queue-stats', '/performance', '/reports', '/reports/2026/10']) {
      await request(path, 401, null);
      if (other) await request(path, 403, tokenFor(other));
    }
    await request('/dashboard', 401, 'invalid-token');
    const dashboard = await request('/dashboard');
    const queue = await request('/queue-stats');
    const performance = await request('/performance');
    const reports = await request('/reports');
    const [year, month] = localDate().split('-');
    const report = await request(`/reports/${year}/${Number(month)}`);
    assert.equal(dashboard.appointmentTrendLast7Days.length, 7);
    assert.equal(performance.feedback.available, false);
    assert.equal(performance.consultation.averageDuration, null);
    assert.equal(report.dailyAppointmentTrend.reduce((n, row) => n + row.count, 0), report.totalAppointments);
    const range = dayRange();
    const appointments = await Appointment.find({ appointmentDate: { $gte: range.start, $lt: range.end } }).select('_id status').lean();
    assert.equal(dashboard.todayAppointments, appointments.length);
    const ids = appointments.filter(a => a.status !== 'cancelled').map(a => a._id);
    const todayQueue = await Queue.find({ appointmentId: { $in: ids }, status: { $ne: 'cancelled' } }).lean();
    assert.equal(dashboard.checkedInPatients, todayQueue.filter(q => q.arrivalStatus === 'Arrived').length);
    assert.equal(dashboard.waitingPatients, todayQueue.filter(q => q.status === 'waiting' && q.arrivalStatus === 'Arrived').length);
    assert.equal(queue.pagination.total, todayQueue.filter(q => ['waiting', 'called', 'serving'].includes(q.status)).length);
    for (const item of queue.activeQueue) assert.equal(localDate(new Date(item.appointmentDate)), range.label);
    for (let i = 1; i < reports.length; i++) assert.ok(reports[i - 1].year * 12 + reports[i - 1].month > reports[i].year * 12 + reports[i].month);
    await request('/reports/2026/13', 400);
    await request('/reports/nope/10', 400);
    await request('/dashboard?date=2026-02-30', 400);
    await request('/queue-stats?page=0', 400);
    const empty = await request('/reports/2100/1');
    assert.equal(empty.totalAppointments, 0);
    assert.equal(empty.appointmentCompletionRate, null);
    console.log('All HIO live checks passed. No database records changed.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { if (server) await new Promise(resolve => server.close(resolve)); await mongoose.disconnect(); }
})();
