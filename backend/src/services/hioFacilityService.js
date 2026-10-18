const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const OPD = require('../models/OPD');

async function resolveScope(query) {
  const { hospitalId, opdId } = query;
  for (const value of [hospitalId, opdId]) {
    if (value !== undefined && (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value))) {
      throw new RangeError('Invalid hospital or OPD ID');
    }
  }
  if (opdId && !hospitalId) throw new RangeError('Select a hospital before selecting an OPD');
  const hospital = hospitalId ? await Hospital.findById(hospitalId).select('name') : null;
  if (hospitalId && !hospital) throw new RangeError('Hospital not found');
  const opd = opdId ? await OPD.findOne({ _id: opdId, hospitalId }).select('name') : null;
  if (opdId && !opd) throw new RangeError('OPD does not belong to the selected hospital');
  return { hospitalId: hospital?._id, opdId: opd?._id,
    hospitalName: hospital?.name || 'All Hospitals', opdName: opd?.name || 'All OPDs' };
}
function match(scope = {}, prefix = '') {
  return { ...(scope.hospitalId ? { [`${prefix}hospitalId`]: scope.hospitalId } : {}),
    ...(scope.opdId ? { [`${prefix}opdId`]: scope.opdId } : {}) };
}
async function facilities() {
  const [hospitals, opds] = await Promise.all([
    Hospital.find().select('_id name').sort({ name: 1 }).lean(),
    OPD.find().select('_id name hospitalId').sort({ name: 1 }).lean(),
  ]);
  return { hospitals, opds };
}
module.exports = { resolveScope, match, facilities };
