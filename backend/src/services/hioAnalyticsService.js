const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const { TIMEZONE, DAY_MS, dayRange, monthLabel, dateLabels } = require('../utils/hioDateRange');

const ACTIVE = ['waiting', 'called', 'serving'];
const within = ({ start, end }) => ({ $gte: start, $lt: end });
const countIf = condition => ({ $sum: { $cond: [condition, 1, 0] } });
const eq = (field, value) => ({ $eq: [`$${field}`, value] });
const arrived = eq('arrivalStatus', 'Arrived');
const active = { $in: ['$status', ACTIVE] };
const physicalActive = { $and: [arrived, active] };
const validEstimate = { $and: [arrived, eq('status', 'waiting'),
  { $isNumber: '$estimatedWaitingTime' }, { $gte: ['$estimatedWaitingTime', 0] }] };

// Keep future Feedback/Consultation adapters here. Missing sources are not zero performance.
function unavailableSources() {
  return {
    feedback: { available: false, total: 0, averageRating: null, positivePercentage: null, comments: [] },
    consultation: { available: false, completed: null, averageDuration: null },
  };
}
function scopeQueue(range) {
  return [
    { $lookup: { from: Appointment.collection.name, localField: 'appointmentId', foreignField: '_id', as: 'appointment' } },
    { $unwind: '$appointment' },
    { $match: { 'appointment.appointmentDate': within(range), 'appointment.status': { $ne: 'cancelled' }, status: { $ne: 'cancelled' } } },
  ];
}
async function appointmentSummary(range) {
  const rows = await Appointment.aggregate([
    { $match: { appointmentDate: within(range) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result = { total: 0, booked: 0, confirmed: 0, cancelled: 0, rescheduled: 0, completed: 0 };
  for (const row of rows) { result[row._id] = row.count; result.total += row.count; }
  return result;
}
async function trend(range) {
  const rows = await Appointment.aggregate([
    { $match: { appointmentDate: within(range) } },
    { $group: { _id: { $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d', timezone: TIMEZONE } }, count: { $sum: 1 } } },
  ]);
  const counts = new Map(rows.map(row => [row._id, row.count]));
  return dateLabels(range.start, range.end).map(date => ({ date, count: counts.get(date) || 0 }));
}
async function queueSummary(range) {
  const rows = await Queue.aggregate([...scopeQueue(range), { $group: {
    _id: null,
    checkedIn: countIf(arrived),
    waiting: countIf({ $and: [arrived, eq('status', 'waiting')] }),
    notArrived: countIf({ $and: [eq('arrivalStatus', 'Not Arrived'), active] }),
    called: countIf(eq('status', 'called')),
    serving: countIf(eq('status', 'serving')),
    completed: countIf(eq('status', 'completed')),
    emergency: countIf({ $and: [physicalActive, eq('priority', 'Emergency')] }),
    priority: countIf({ $and: [physicalActive, eq('priority', 'Priority')] }),
    normal: countIf({ $and: [physicalActive, eq('priority', 'Normal')] }),
    emergencyCases: countIf({ $and: [arrived, eq('priority', 'Emergency')] }),
    priorityCases: countIf({ $and: [arrived, eq('priority', 'Priority')] }),
    normalCases: countIf({ $and: [arrived, eq('priority', 'Normal')] }),
    averageEstimatedWait: { $avg: { $cond: [validEstimate, '$estimatedWaitingTime', null] } },
    estimatedWaitSamples: countIf(validEstimate),
    observedWaitUntilCalled: { $avg: { $cond: [
      { $and: [{ $eq: [{ $type: '$arrivalTime' }, 'date'] }, { $eq: [{ $type: '$calledTime' }, 'date'] },
        { $gte: ['$calledTime', '$arrivalTime'] }] },
      { $divide: [{ $subtract: ['$calledTime', '$arrivalTime'] }, 60000] }, null,
    ] } },
  } }]);
  const summary = { checkedIn: 0, waiting: 0, notArrived: 0, called: 0, serving: 0, completed: 0,
    emergency: 0, priority: 0, normal: 0, emergencyCases: 0, priorityCases: 0, normalCases: 0,
    averageEstimatedWait: null, estimatedWaitSamples: 0, observedWaitUntilCalled: null, ...rows[0] };
  delete summary._id;
  for (const key of ['averageEstimatedWait', 'observedWaitUntilCalled']) {
    if (summary[key] !== null) summary[key] = Math.round(summary[key] * 10) / 10;
  }
  return summary;
}
function metadata(range) {
  return { timezone: TIMEZONE, period: { start: range.start, endExclusive: range.end, label: range.label },
    generatedAt: new Date(), definitions: {
      waiting: 'Arrived patients with queue status waiting',
      checkedIn: 'Arrived records in the appointment period, including completed visits',
      priorities: 'Active, arrived queue records; Emergency and Priority are separate',
      estimatedWait: 'Stored booking-time estimate averaged over arrived waiting records; not a live prediction',
      completionRate: 'Completed appointment records / all appointment records, including cancellations',
      queueCompleted: 'Queue records marked completed; not verified doctor consultation completions',
    } };
}
async function dashboard(range = dayRange()) {
  const trendRange = { start: new Date(range.start.getTime() - 6 * DAY_MS), end: range.end };
  const [appointments, queue, appointmentTrendLast7Days] = await Promise.all([
    appointmentSummary(range), queueSummary(range), trend(trendRange),
  ]);
  return { ...metadata(range), todayAppointments: appointments.total, checkedInPatients: queue.checkedIn,
    waitingPatients: queue.waiting, notArrivedPatients: queue.notArrived, calledPatients: queue.called,
    servingPatients: queue.serving, completedVisits: queue.completed, emergencyPatients: queue.emergency,
    priorityPatients: queue.priority, normalPatients: queue.normal, averageEstimatedWaitingTime: queue.averageEstimatedWait,
    appointmentTrendLast7Days, appointmentStatuses: appointments,
    statusComparison: { booked: appointments.booked, confirmed: appointments.confirmed,
      waiting: queue.waiting, called: queue.called, serving: queue.serving, completed: queue.completed },
    priorityDistribution: { Normal: queue.normal, Priority: queue.priority, Emergency: queue.emergency } };
}
async function queueStats(range = dayRange(), page = 1, limit = 25) {
  // Past-day monitoring includes completed records, rather than an empty active-only roster.
  const historical = range.end <= dayRange().start;
  const activeScope = [...scopeQueue(range), ...(historical ? [] : [{ $match: { status: { $in: ACTIVE } } }])];
  const [summary, results] = await Promise.all([queueSummary(range), Queue.aggregate([...activeScope,
    { $facet: {
      total: [{ $count: 'count' }],
      records: [
        { $sort: { queuePosition: 1, _id: 1 } }, { $skip: (page - 1) * limit }, { $limit: limit },
        { $lookup: { from: 'users', localField: 'patientId', foreignField: '_id', as: 'patient' } },
        { $lookup: { from: 'hospitals', localField: 'appointment.hospitalId', foreignField: '_id', as: 'hospital' } },
        { $lookup: { from: 'opds', localField: 'appointment.opdId', foreignField: '_id', as: 'opd' } },
        { $project: { _id: 0, queueId: '$_id', appointmentId: '$appointmentId', token: '$tokenNumber',
          patientName: { $ifNull: [{ $arrayElemAt: ['$patient.fullName', 0] }, null] },
          hospital: { $ifNull: [{ $arrayElemAt: ['$hospital.name', 0] }, null] },
          opd: { $ifNull: [{ $arrayElemAt: ['$opd.name', 0] }, null] },
          queuePosition: 1, estimatedWaitingTime: 1, priority: 1, status: 1, arrivalStatus: 1,
          appointmentDate: '$appointment.appointmentDate', appointmentTime: '$appointment.appointmentTime' } },
      ],
    } },
  ])]);
  const result = results[0] || {};
  return { ...metadata(range), summary, activeQueue: result.records || [],
    pagination: { page, limit, total: result.total?.[0]?.count || 0 } };
}
async function performance(range = dayRange()) {
  const [appointments, queue] = await Promise.all([appointmentSummary(range), queueSummary(range)]);
  return { ...metadata(range), appointments,
    appointmentCompletionRate: appointments.total ? Math.round(appointments.completed / appointments.total * 1000) / 10 : null,
    queueCompletionCount: queue.completed, checkedInPatients: queue.checkedIn,
    averageEstimatedWait: queue.averageEstimatedWait, observedWaitUntilCalled: queue.observedWaitUntilCalled,
    emergencyCases: queue.emergencyCases, priorityCases: queue.priorityCases, normalCases: queue.normalCases,
    ...unavailableSources() };
}
async function reports() {
  const rows = await Appointment.aggregate([
    { $group: { _id: { year: { $year: { date: '$appointmentDate', timezone: TIMEZONE } },
      month: { $month: { date: '$appointmentDate', timezone: TIMEZONE } } }, appointmentCount: { $sum: 1 } } },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
  ]);
  return rows.map(row => ({ ...row._id, label: monthLabel(row._id.year, row._id.month), appointmentCount: row.appointmentCount }));
}
async function monthlyReport(range) {
  const [metrics, dailyAppointmentTrend] = await Promise.all([performance(range), trend(range)]);
  return { ...metrics, year: range.year, month: range.month, label: range.label,
    totalAppointments: metrics.appointments.total, dailyAppointmentTrend, derived: true };
}
module.exports = { dashboard, queueStats, performance, reports, monthlyReport };
