// Creates only a temporary HIO-owned note and deletes that exact document in finally.
require('dotenv').config({ quiet: true });
require('node:dns').setServers((process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()).filter(Boolean));
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Note = require('../src/models/HIOReportNote');
const service = require('../src/services/hioReportNoteService');
(async () => {
  let server; const createdIds = [];
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    await Note.init(); // Verify the compound unique index actually exists.
    const hios = await User.find({ role: 'health_information_officer' }).limit(2).select('_id');
    const nonHio = await User.findOne({ role: { $ne: 'health_information_officer' } }).select('_id');
    assert.ok(hios[0], 'An existing HIO account is required');
    const token = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '5m' });
    const app = express(); app.use(express.json()); app.use('/api/hio', require('../src/routes/hioRoutes'));
    server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api/hio`;
    async function request(method, path, body, expected, auth = token(hios[0])) {
      const result = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const json = await result.json();
      if (method === 'POST' && result.status === 201) createdIds.push(json.data._id);
      assert.equal(result.status, expected, `${method} ${path}: ${json.message || ''}`);
      console.log(`PASS ${expected} ${method} ${path}`); return json.data;
    }
    let month = 12;
    while (month && await Note.exists({ createdBy: hios[0]._id, year: 2000, month })) month--;
    assert.ok(month, 'No empty test month available; existing notes will not be modified');
    const path = `/report-notes/2000/${month}`;
    const payload = { year: 2000, month, note: ' Temporary operational CRUD verification ', reviewStatus: 'draft', observationDate: `2000-${String(month).padStart(2, '0')}-01` };
    for (const [method, endpoint, body] of [['GET', path], ['POST', '/report-notes', payload], ['PUT', '/report-notes/000000000000000000000000', { note: 'test', reviewStatus: 'draft' }], ['DELETE', '/report-notes/000000000000000000000000']]) {
      await request(method, endpoint, body, 401, null);
      if (nonHio) await request(method, endpoint, body, 403, token(nonHio));
    }
    assert.deepEqual(await request('GET', path, null, 200), []);
    await request('POST', '/report-notes', { ...payload, note: '  ' }, 400);
    await request('POST', '/report-notes', { ...payload, month: 13 }, 400);
    await request('POST', '/report-notes', { ...payload, note: 'x'.repeat(1001) }, 400);
    await request('POST', '/report-notes', { ...payload, createdBy: new mongoose.Types.ObjectId() }, 400);
    const created = await request('POST', '/report-notes', payload, 201);
    assert.equal(created.note, payload.note.trim());
    assert.equal(String((await Note.findById(created._id)).createdBy), String(hios[0]._id));
    const second = await request('POST', '/report-notes', { ...payload, note: 'Second observation', observationDate: `2000-${String(month).padStart(2, '0')}-02` }, 201);
    const listed = await request('GET', path, null, 200);
    assert.equal(listed.length, 2);
    assert.equal(listed[0]._id, second._id);
    await request('POST', '/report-notes', { ...payload, observationDate: '2001-01-01' }, 400);
    await request('POST', '/report-notes', { ...payload, observationDate: '2000-02-30' }, 400);
    assert.equal((await request('GET', path, null, 200)).find(n => n._id === created._id)._id, created._id);
    const edited = await request('PUT', `/report-notes/${created._id}`, { note: 'Updated administrative observation', reviewStatus: 'reviewed', observationDate: `2000-${String(month).padStart(2, '0')}-03` }, 200);
    assert.equal(edited._id, created._id); assert.equal(edited.reviewStatus, 'reviewed');
    assert.equal(await Note.countDocuments({ createdBy: hios[0]._id, year: 2000, month }), 2);
    assert.equal((await request('GET', path, null, 200)).find(n => n._id === created._id).reviewStatus, 'reviewed');
    await request('PUT', `/report-notes/${created._id}`, { note: ' ', reviewStatus: 'draft' }, 400);
    await request('PUT', `/report-notes/${created._id}`, { note: 'test', reviewStatus: 'invalid' }, 400);
    await request('GET', '/report-notes/2026/13', null, 400);
    await request('DELETE', '/report-notes/invalid', null, 400);
    if (hios[1]) {
      await request('PUT', `/report-notes/${created._id}`, { note: 'denied', reviewStatus: 'draft' }, 404, token(hios[1]));
      await request('DELETE', `/report-notes/${created._id}`, null, 404, token(hios[1]));
    } else {
      const otherOwner = new mongoose.Types.ObjectId();
      await assert.rejects(service.update(otherOwner, created._id, { note: 'denied', reviewStatus: 'draft' }), e => e.status === 404);
      await assert.rejects(service.remove(otherOwner, created._id), e => e.status === 404);
      console.log('PASS ownership service checks; second HIO account unavailable for HTTP test');
    }
    await request('GET', '/reports/2000/12', null, 200);
    await request('DELETE', `/report-notes/${created._id}`, null, 200);
    assert.equal((await request('GET', path, null, 200)).length, 1);
    await request('DELETE', `/report-notes/${second._id}`, null, 200);
    assert.deepEqual(await request('GET', path, null, 200), []);
    assert.equal(await Note.findById(created._id), null);
    await request('DELETE', `/report-notes/${created._id}`, null, 404);
    console.log('All note CRUD checks passed. Existing records were not modified.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally {
    if (createdIds.length) await Note.deleteMany({ _id: { $in: createdIds } });
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
  }
})();
