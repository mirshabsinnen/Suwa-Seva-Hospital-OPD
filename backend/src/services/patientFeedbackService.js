const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Feedback = require('../models/PatientFeedback');
const fail = (status, message) => Object.assign(new Error(message), { status });

async function ownedAppointment(patientId, id) {
  if (!mongoose.isObjectIdOrHexString(id)) throw fail(400, 'Invalid appointment ID');
  const appointment = await Appointment.findOne({ _id: id, patientId });
  if (!appointment) throw fail(404, 'Appointment not found');
  return appointment;
}
exports.read = async (patientId, id) => {
  await ownedAppointment(patientId, id);
  return Feedback.findOne({ appointmentId: id, patientId });
};
exports.submit = async (patientId, id, body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !['rating', 'comment'].includes(key)) ||
      !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5 ||
      (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.trim().length > 1000))) {
    throw fail(400, 'Choose a rating from 1 to 5 and a comment of at most 1000 characters');
  }
  const appointment = await ownedAppointment(patientId, id);
  const completed = await Consultation.exists({ appointmentId: id, patientId, status: 'completed' });
  if (appointment.status !== 'completed' || !completed) throw fail(400, 'Feedback is available after your consultation is completed');
  try {
    return await Feedback.create({ appointmentId: id, patientId, appointmentDate: appointment.appointmentDate,
      rating: body.rating, comment: body.comment?.trim() || '' });
  } catch (error) {
    if (error.code === 11000) throw fail(409, 'Feedback has already been submitted for this appointment');
    throw error;
  }
};
exports.summary = async range => {
  const rows = await Feedback.aggregate([
    { $match: { appointmentDate: { $gte: range.start, $lt: range.end } } },
    { $group: { _id: null, total: { $sum: 1 }, averageRating: { $avg: '$rating' },
      positive: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } } } },
  ]);
  const row = rows[0];
  return { available: true, total: row?.total || 0,
    averageRating: row ? Math.round(row.averageRating * 10) / 10 : null,
    positivePercentage: row ? Math.round(row.positive / row.total * 1000) / 10 : null,
    comments: [] };
};
