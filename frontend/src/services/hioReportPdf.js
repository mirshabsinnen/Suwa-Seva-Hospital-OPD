import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const numeric = value => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value).toLocaleString('en-US') : 'Unavailable';
const measure = (value, unit) => numeric(value) === 'Unavailable' ? 'Unavailable' : `${numeric(value)}${unit}`;

// Explicit aggregate-only allowlist: never serialize patient records into the document.
export function monthlyReportHtml(report) {
  const appointments = report.appointments || {};
  const rows = [
    ['Total appointments', numeric(report.totalAppointments)],
    ...['booked', 'confirmed', 'cancelled', 'rescheduled', 'completed'].map(key => [`${key[0].toUpperCase()}${key.slice(1)} appointments`, numeric(appointments[key])]),
    ['Appointment completion rate', measure(report.appointmentCompletionRate, '%')],
    ['Checked-in patients', numeric(report.checkedInPatients)],
    ['Queue completions', numeric(report.queueCompletionCount)],
    ['Emergency cases', numeric(report.emergencyCases)],
    ['Priority cases', numeric(report.priorityCases)],
    ['Routine cases', numeric(report.normalCases)],
    ['Average estimated wait', measure(report.averageEstimatedWait, ' min')],
    ['Observed wait until called', measure(report.observedWaitUntilCalled, ' min')],
    ['Patient feedback', 'Unavailable - no feedback data source'],
    ['Verified consultations', 'Unavailable - no consultation data source'],
  ];
  const days = Array.isArray(report.dailyAppointmentTrend) ? report.dailyAppointmentTrend : [];
  const max = Math.max(1, ...days.map(day => Number(day.count) || 0));
  const generated = new Date(report.generatedAt);
  const generatedLabel = Number.isFinite(generated.getTime()) ? generated.toLocaleString('en-GB', { timeZone: 'Asia/Colombo' }) : 'Unavailable';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SuwaSeva Monthly Report</title>
    <style>@page{size:A4;margin:18mm}body{font:12px Arial,sans-serif;color:#1a2b3c}h1{color:#005a71;font-size:25px}h2{color:#0a3d62;font-size:17px;margin-top:24px}.muted{color:#66788a;line-height:1.6}table{border-collapse:collapse;width:100%;margin-top:12px}th,td{padding:9px;border-bottom:1px solid #e4ebf2;text-align:left}th{background:#eef4ff}tr{page-break-inside:avoid}.value{text-align:right;font-weight:bold}.bar{background:#005a71;height:9px;border-radius:3px}.note{background:#eef4ff;padding:12px;line-height:1.6;margin-top:20px}</style></head>
    <body><h1>SuwaSeva - HIO Monthly Report</h1><h2>${escape(report.label)}</h2>
    <p class="muted">All Hospitals / All OPDs<br>Timezone: Asia/Colombo<br>Data generated: ${escape(generatedLabel)}</p>
    ${report.totalAppointments === 0 ? '<p>No appointment records for this month.</p>' : ''}
    <table><thead><tr><th>Operational metric</th><th class="value">Value</th></tr></thead><tbody>${rows.map(([label, value]) => `<tr><td>${escape(label)}</td><td class="value">${escape(value)}</td></tr>`).join('')}</tbody></table>
    <h2>Daily Appointment Trend</h2>${days.length ? `<table><thead><tr><th>Date</th><th>Appointments</th><th>Trend</th></tr></thead><tbody>${days.map(day => `<tr><td>${escape(day.date)}</td><td>${escape(numeric(day.count))}</td><td style="width:45%"><div class="bar" style="width:${Math.max(0, Math.min(100, (Number(day.count) || 0) / max * 100))}%"></div></td></tr>`).join('')}</tbody></table>` : '<p>No trend data available.</p>'}
    <h2>HIO Review Notes</h2><p class="muted">Administrative observations from the exporting HIO. Not clinical notes.</p>${Array.isArray(report.reviewNotes) && report.reviewNotes.length ? report.reviewNotes.map(note => `<section style="page-break-inside:avoid;margin-bottom:16px;border-bottom:1px solid #e4ebf2"><p><strong>Observation date:</strong> ${escape(note.observationDate || 'Not recorded (existing note)')}<br><strong>Status:</strong> ${escape(({draft:'Draft', reviewed:'Reviewed', needs_attention:'Needs Attention'})[note.reviewStatus] || note.reviewStatus)}</p><p style="white-space:pre-wrap">${escape(note.note)}</p><p class="muted">Saved: ${escape(note.createdAt ? new Date(note.createdAt).toLocaleString('en-GB', {timeZone:'Asia/Colombo'}) : 'Unavailable')} (Asia/Colombo)<br>Last updated: ${escape(note.updatedAt ? new Date(note.updatedAt).toLocaleString('en-GB', {timeZone:'Asia/Colombo'}) : 'Unavailable')} (Asia/Colombo)</p></section>`).join('') : '<p>No review notes for this month.</p>'}
    <div class="note">Live derived report, not an approved or saved report record. Completion rate uses all appointment statuses, including cancellations. Checked-in counts require arrival. Estimated wait is a stored estimate for arrived, waiting records. Queue completions are not verified doctor consultations. No patient identifiers are included.</div></body></html>`;
}

export async function exportMonthlyReportPdf(report) {
  const html = monthlyReportHtml(report);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device.');
  // Expo Go's Print output can be outside the project's scoped filesystem.
  // Obtain bytes directly from Print and write to the permitted project cache;
  // copying/reading the original URI would hit the same permissions restriction.
  const { base64 } = await Print.printToFileAsync({ html, width: 595, height: 842, base64: true });
  if (!base64) throw new Error('PDF generation returned no document data. Please try again.');
  const file = new File(Paths.cache, `SuwaSeva-HIO-${Number(report.year)}-${String(Number(report.month)).padStart(2, '0')}.pdf`);
  file.create({ overwrite: true });
  file.write(base64, { encoding: 'base64' });
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: '.pdf', dialogTitle: `Save or share SuwaSeva ${report.label}` });
}
