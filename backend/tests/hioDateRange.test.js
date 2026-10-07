const test = require('node:test');
const assert = require('node:assert/strict');
const { dayRange, monthRange, dateLabels, localDate } = require('../src/utils/hioDateRange');

test('Colombo midnight uses the preceding UTC day, with exclusive next midnight', () => {
  const range = dayRange('2026-10-07');
  assert.equal(range.start.toISOString(), '2026-10-06T18:30:00.000Z');
  assert.equal(range.end.toISOString(), '2026-10-07T18:30:00.000Z');
  assert.equal(localDate(new Date('2026-10-06T18:29:59Z')), '2026-10-06');
  assert.equal(localDate(range.start), '2026-10-07');
});
test('leap months and year transitions generate the correct calendar days', () => {
  const february = monthRange('2024', '2');
  assert.equal(dateLabels(february.start, february.end).length, 29);
  assert.equal(monthRange('2026', '12').end.toISOString(), '2026-12-31T18:30:00.000Z');
});
test('invalid dates and invalid month parameters are rejected', () => {
  for (const value of ['2026-02-29', '2026-02-30', '2026-13-01', 'hello', ['2026-10-07']]) {
    assert.throws(() => dayRange(value), RangeError);
  }
  for (const pair of [['2026', '13'], ['2026', '0'], ['20x6', '10'], ['2026', '1.5']]) {
    assert.throws(() => monthRange(...pair), RangeError);
  }
});
