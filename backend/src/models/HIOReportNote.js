const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  year: { type: Number, required: true, min: 2000, max: 2100, validate: Number.isInteger },
  month: { type: Number, required: true, min: 1, max: 12, validate: Number.isInteger },
  observationDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
  note: { type: String, required: true, trim: true, maxlength: 1000 },
  reviewStatus: { type: String, enum: ['draft', 'reviewed', 'needs_attention'], default: 'draft', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
schema.index({ createdBy: 1, year: 1, month: 1 }, { name: 'hio_owner_month' });
module.exports = mongoose.model('HIOReportNote', schema);
