const analytics = require('../services/hioAnalyticsService');
const { dayRange, monthRange } = require('../utils/hioDateRange');
const facility = require('../services/hioFacilityService');
const scoped = async (req, range) => ({ ...range, scope: await facility.resolveScope(req.query) });

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
exports.dashboard = handler(async req => analytics.dashboard(await scoped(req, dayRange(req.query.date))));
exports.queueStats = handler(async req => analytics.queueStats(await scoped(req, dayRange(req.query.date)),
  positiveInteger(req.query.page, 1, 100000), positiveInteger(req.query.limit, 25, 100)));
exports.performance = handler(async req => analytics.performance(await scoped(req, dayRange(req.query.date))));
exports.reports = handler(async req => analytics.reports(await facility.resolveScope(req.query)));
exports.monthlyReport = handler(async req => analytics.monthlyReport(await scoped(req, monthRange(req.params.year, req.params.month))));
exports.facilities = handler(() => facility.facilities());
