const TIMEZONE = 'Asia/Colombo';
const OFFSET_MS = 330 * 60000;
const DAY_MS = 86400000;

function localDate(now = new Date()) {
  return new Date(now.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}
function dayRange(value = localDate()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError('Date must be YYYY-MM-DD');
  }
  const start = new Date(`${value}T00:00:00+05:30`);
  if (!Number.isFinite(start.getTime()) || localDate(start) !== value) {
    throw new RangeError('Invalid calendar date');
  }
  return { start, end: new Date(start.getTime() + DAY_MS), label: value };
}
function monthRange(yearValue, monthValue) {
  if (!/^\d{4}$/.test(String(yearValue)) || !/^\d{1,2}$/.test(String(monthValue))) {
    throw new RangeError('Year/month must be integers');
  }
  const year = Number(yearValue), month = Number(monthValue);
  if (year < 2000 || year > 2100 || month < 1 || month > 12) {
    throw new RangeError('Year must be 2000–2100 and month must be 1–12');
  }
  const start = new Date(Date.UTC(year, month - 1, 1) - OFFSET_MS);
  const end = new Date(Date.UTC(year, month, 1) - OFFSET_MS);
  return { start, end, year, month, label: monthLabel(year, month) };
}
function monthLabel(year, month) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: TIMEZONE })
    .format(new Date(Date.UTC(year, month - 1, 15)));
}
function dateLabels(start, end) {
  const labels = [];
  for (let time = start.getTime(); time < end.getTime(); time += DAY_MS) labels.push(localDate(new Date(time)));
  return labels;
}
module.exports = { TIMEZONE, DAY_MS, localDate, dayRange, monthRange, monthLabel, dateLabels };
