const mongoose = require('mongoose');
const Note = require('../models/HIOReportNote');
const { monthRange, dayRange, localDate } = require('../utils/hioDateRange');

const failure = (status, message) => Object.assign(new Error(message), { status });
function validatePayload(body, create = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw failure(400, 'A note object is required');
  const allowed = create ? ['year', 'month', 'note', 'reviewStatus', 'observationDate'] : ['note', 'reviewStatus', 'observationDate'];
  if (Object.keys(body).some(key => !allowed.includes(key))) throw failure(400, 'Unsupported note fields');
  if (typeof body.note !== 'string' || !body.note.trim() || body.note.trim().length > 1000) throw failure(400, 'Review note must contain 1–1000 characters');
  const reviewStatus = body.reviewStatus === undefined && create ? 'draft' : body.reviewStatus;
  if (!['draft', 'reviewed', 'needs_attention'].includes(reviewStatus)) throw failure(400, 'Invalid review status');
  const payload = { note: body.note.trim(), reviewStatus };
  if (create) {
    if (!Number.isInteger(body.year) || !Number.isInteger(body.month)) throw failure(400, 'Year and month must be integers');
    monthRange(body.year, body.month);
    Object.assign(payload, { year: body.year, month: body.month });
  }
  if (body.observationDate !== undefined) {
    dayRange(body.observationDate);
    if (body.observationDate > localDate()) throw failure(400, 'Observation date cannot be in the future');
    payload.observationDate = body.observationDate;
  } else if (create) throw failure(400, 'Observation date is required');
  return payload;
}
function ownerQuery(id, owner) {
  if (!mongoose.isObjectIdOrHexString(id)) throw failure(400, 'Invalid review note ID');
  return { _id: id, createdBy: owner };
}
function checkMonth(payload, year, month) {
  if (payload.observationDate && payload.observationDate.slice(0, 7) !== `${year}-${String(month).padStart(2, '0')}`) throw failure(400, 'Observation date must belong to the selected report month');
}
exports.create = (owner, body) => {
  const payload = validatePayload(body, true);
  checkMonth(payload, payload.year, payload.month);
  return Note.create({ ...payload, createdBy: owner });
};
exports.read = (owner, year, month) => {
  const range = monthRange(year, month);
  return Note.find({ createdBy: owner, year: range.year, month: range.month }).sort({ observationDate: -1, createdAt: -1, _id: -1 });
};
exports.update = async (owner, id, body) => {
  const query = ownerQuery(id, owner), payload = validatePayload(body);
  const existing = await Note.findOne(query).select('year month');
  if (!existing) throw failure(404, 'Review note not found');
  checkMonth(payload, existing.year, existing.month);
  const note = await Note.findOneAndUpdate(query, { $set: payload }, { returnDocument: 'after', runValidators: true });
  if (!note) throw failure(404, 'Review note not found');
  return note;
};
exports.remove = async (owner, id) => {
  const note = await Note.findOneAndDelete(ownerQuery(id, owner));
  if (!note) throw failure(404, 'Review note not found');
  return null;
};
