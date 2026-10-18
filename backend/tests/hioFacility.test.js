const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Hospital = require('../src/models/Hospital');
const OPD = require('../src/models/OPD');
const Appointment = require('../src/models/Appointment');
const Queue = require('../src/models/Queue');
const facility = require('../src/services/hioFacilityService');
const analytics = require('../src/services/hioAnalyticsService');
const { dayRange } = require('../src/utils/hioDateRange');

test('facility validation rejects malformed, missing and unrelated facilities', async t => {
  t.after(() => mock.restoreAll());
  for (const query of [{ hospitalId: 'bad' }, { hospitalId: [] }, { hospitalId: { $ne: null } }, { opdId: '507f1f77bcf86cd799439011' }]) {
    await assert.rejects(facility.resolveScope(query), RangeError);
  }
  assert.deepEqual(await facility.resolveScope({}), { hospitalId: undefined, opdId: undefined, hospitalName: 'All Hospitals', opdName: 'All OPDs' });
  const hospitalId = new mongoose.Types.ObjectId(), opdId = new mongoose.Types.ObjectId();
  mock.method(Hospital, 'findById', () => ({ select: async () => null }));
  await assert.rejects(facility.resolveScope({ hospitalId: String(hospitalId) }), /Hospital not found/);
  mock.restoreAll();
  mock.method(Hospital, 'findById', () => ({ select: async () => ({ _id: hospitalId, name: 'Test Hospital' }) }));
  mock.method(OPD, 'findOne', query => {
    assert.equal(query.hospitalId, String(hospitalId));
    return { select: async () => null };
  });
  await assert.rejects(facility.resolveScope({ hospitalId: String(hospitalId), opdId: String(opdId) }), /does not belong/);
  mock.restoreAll();
  mock.method(Hospital, 'findById', () => ({ select: async () => ({ _id: hospitalId, name: 'Test Hospital' }) }));
  mock.method(OPD, 'findOne', () => ({ select: async () => ({ _id: opdId, name: 'Test OPD' }) }));
  const scope = await facility.resolveScope({ hospitalId: String(hospitalId), opdId: String(opdId) });
  assert.deepEqual(facility.match(scope), { hospitalId, opdId });
  assert.deepEqual(facility.match(scope, 'appointment.'), { 'appointment.hospitalId': hospitalId, 'appointment.opdId': opdId });
});

test('all analytics pipelines retain hospital/OPD scope including trends and pagination', async t => {
  t.after(() => mock.restoreAll());
  const scope = { hospitalId: new mongoose.Types.ObjectId(), opdId: new mongoose.Types.ObjectId(), hospitalName: 'Test Hospital', opdName: 'Test OPD' };
  const range = { ...dayRange('2026-10-01'), year: 2026, month: 10, scope };
  let appointments = 0, queues = 0;
  mock.method(Appointment, 'aggregate', async pipeline => {
    assert.deepEqual(pipeline[0].$match.hospitalId, scope.hospitalId);
    assert.deepEqual(pipeline[0].$match.opdId, scope.opdId);
    appointments++; return [];
  });
  mock.method(Queue, 'aggregate', async pipeline => {
    const match = pipeline.find(stage => stage.$match)?.$match;
    assert.deepEqual(match['appointment.hospitalId'], scope.hospitalId);
    assert.deepEqual(match['appointment.opdId'], scope.opdId);
    assert.equal(match.status.$ne, 'cancelled'); queues++; return [];
  });
  for (const result of [await analytics.dashboard(range), await analytics.queueStats(range, 2, 20), await analytics.performance(range), await analytics.monthlyReport(range)]) {
    assert.deepEqual(result.scope, scope);
  }
  await analytics.reports(scope);
  assert.ok(appointments >= 6); assert.ok(queues >= 5);
  assert.deepEqual(facility.match(), {});
});
