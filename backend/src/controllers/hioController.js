const analytics = require('../services/hioAnalyticsService');
const { dayRange, monthRange } = require('../utils/hioDateRange');

function handler(work) {
  return async (req, res) => {
    try { res.json({ success: true, data: await work(req) }); }
    catch (error) {
      if (error instanceof RangeError) return res.status(400).json({ success: false, message: error.message });
      console.error('HIO analytics error:', error.message);
      res.status(500).json({ success: false, message: 'Unable to load HIO analytics. Please try again.' });
    }
  };
}
function positiveInteger(value, fallback, max) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) {
    throw new RangeError(`Pagination values must be integers between 1 and ${max}`);
  }
  return Number(value);
}
exports.dashboard = handler(req => analytics.dashboard(dayRange(req.query.date)));
exports.queueStats = handler(req => analytics.queueStats(dayRange(req.query.date),
  positiveInteger(req.query.page, 1, 100000), positiveInteger(req.query.limit, 25, 100)));
exports.performance = handler(req => analytics.performance(dayRange(req.query.date)));
exports.reports = handler(() => analytics.reports());
exports.monthlyReport = handler(req => analytics.monthlyReport(monthRange(req.params.year, req.params.month)));
