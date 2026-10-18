const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const Appointment = require('../src/models/Appointment');
const Consultation = require('../src/models/Consultation');
const Feedback = require('../src/models/PatientFeedback');
const service = require('../src/services/patientFeedbackService');
const id = '507f1f77bcf86cd799439011';
const owner = '507f191e810c19729de860ea';
const date = new Date('2026-10-16T00:00:00Z');

test('patient feedback authorization, validation, duplicate handling and privacy', async t => {
  t.afterEach(() => mock.restoreAll());
  await t.test('rejects invalid payloads and IDs before writing', async () => {
    for (const body of [{ rating: 0 }, { rating: 6 }, { rating: 2.5 }, { rating: '5' }, { rating: 5, patientId: owner }, { rating: 5, comment: 'x'.repeat(1001) }, null]) {
      await assert.rejects(service.submit(owner, id, body), { status: 400 });
    }
    await assert.rejects(service.read(owner, 'bad'), { status: 400 });
  });
  await t.test('another patient cannot read or submit feedback', async () => {
    mock.method(Appointment, 'findOne', async query => {
      assert.equal(query.patientId, owner); assert.equal(query._id, id); return null;
    });
    await assert.rejects(service.read(owner, id), { status: 404 });
    await assert.rejects(service.submit(owner, id, { rating: 5 }), { status: 404 });
  });
  await t.test('requires a completed consultation, not only appointment status', async () => {
    mock.method(Appointment, 'findOne', async () => ({ status: 'completed' }));
    mock.method(Consultation, 'exists', async query => {
      assert.equal(query.patientId, owner); assert.equal(query.status, 'completed'); return null;
    });
    await assert.rejects(service.submit(owner, id, { rating: 5 }), { status: 400 });
  });
  await t.test('stores server-owned identity and visit date with trimmed comment', async () => {
    mock.method(Appointment, 'findOne', async () => ({ status: 'completed', appointmentDate: date }));
    mock.method(Consultation, 'exists', async () => ({ _id: id }));
    mock.method(Feedback, 'create', async payload => payload);
    assert.deepEqual(await service.submit(owner, id, { rating: 4, comment: ' Good service ' }),
      { appointmentId: id, patientId: owner, appointmentDate: date, rating: 4, comment: 'Good service' });
  });
  await t.test('concurrent duplicate database error becomes 409', async () => {
    mock.method(Appointment, 'findOne', async () => ({ status: 'completed', appointmentDate: date }));
    mock.method(Consultation, 'exists', async () => ({ _id: id }));
    mock.method(Feedback, 'create', async () => { throw Object.assign(new Error(), { code: 11000 }); });
    await assert.rejects(service.submit(owner, id, { rating: 5 }), { status: 409 });
  });
  await t.test('empty summary uses null ratings, and date boundaries are exclusive', async () => {
    const range = { start: date, end: new Date(date.getTime() + 86400000) };
    mock.method(Feedback, 'aggregate', async pipeline => {
      assert.deepEqual(pipeline[0].$match.appointmentDate, { $gte: range.start, $lt: range.end }); return [];
    });
    assert.deepEqual(await service.summary(range), { available: true, total: 0, averageRating: null, positivePercentage: null, comments: [] });
  });
  await t.test('summary rounds ratings and never returns patient identities or comments', async () => {
    mock.method(Feedback, 'aggregate', async () => [{ total: 3, averageRating: 11 / 3, positive: 2 }]);
    assert.deepEqual(await service.summary({ start: date, end: date }),
      { available: true, total: 3, averageRating: 3.7, positivePercentage: 66.7, comments: [] });
    assert.ok(Feedback.schema.indexes().some(([keys, options]) => keys.appointmentId === 1 && options.unique));
  });
});

test('feedback routes require a valid token and patient role', async t => {
  const express = require('express');
  const jwt = require('jsonwebtoken');
  const User = require('../src/models/User');
  const app = express();
  app.use(express.json());
  app.use('/api/feedback', require('../src/routes/patientFeedbackRoutes'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); mock.restoreAll(); });
  const url = `http://127.0.0.1:${server.address().port}/api/feedback/${id}`;
  assert.equal((await fetch(url)).status, 401);
  const token = jwt.sign({ id: owner }, process.env.JWT_SECRET || 'fallback_secret_key');
  let role = 'health_information_officer';
  mock.method(User, 'findById', () => ({ select: async () => ({ _id: owner, role }) }));
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  assert.equal((await fetch(url, { headers })).status, 403);
  assert.equal((await fetch(url, { headers, method: 'POST', body: JSON.stringify({ rating: 5 }) })).status, 403);
  role = 'patient';
  mock.method(Appointment, 'findOne', async () => ({ status: 'completed', appointmentDate: date }));
  mock.method(Feedback, 'findOne', async () => null);
  const response = await fetch(url, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, data: null });
  mock.method(Consultation, 'exists', async () => ({ _id: id }));
  mock.method(Feedback, 'create', async payload => payload);
  const submitted = await fetch(url, { headers, method: 'POST', body: JSON.stringify({ rating: 5 }) });
  assert.equal(submitted.status, 201);
  assert.equal((await submitted.json()).data.rating, 5);
});
