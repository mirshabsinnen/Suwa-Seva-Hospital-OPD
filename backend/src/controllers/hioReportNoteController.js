const service = require('../services/hioReportNoteService');
const handler = (work, status = 200) => async (req, res) => {
  try { res.status(status).json({ success: true, data: await work(req) }); }
  catch (error) {
    const code = error.code === 11000 ? 409 : error instanceof RangeError || error.name === 'ValidationError' ? 400 : error.status || 500;
    const message = code === 409 ? 'You already have a review note for this month. Reload it to edit.' : code === 500 ? 'Unable to process the review note. Please try again.' : error.message;
    if (code === 500) console.error('HIO review note error:', error.message);
    res.status(code).json({ success: false, message });
  }
};
exports.create = handler(req => service.create(req.user._id, req.body), 201);
exports.read = handler(req => service.read(req.user._id, req.params.year, req.params.month));
exports.update = handler(req => service.update(req.user._id, req.params.id, req.body));
exports.remove = handler(req => service.remove(req.user._id, req.params.id));
