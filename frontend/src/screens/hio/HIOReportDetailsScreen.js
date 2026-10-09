import React, { useCallback, useRef, useState } from 'react';
import { View, Text, Share, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { exportMonthlyReportPdf } from '../../services/hioReportPdf';
import HIOReportNote from '../../components/hio/HIOReportNote';
import { Ionicons } from '@expo/vector-icons';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, EmptyState, number, minutes, percentage } from '../../components/hio/HIOUI';
import { LineChart } from '../../components/hio/HIOCharts';

const C = {
  primary: '#005A71', navy: '#005A71', bg: '#FFFFFF', text: '#0F2A3D', muted: '#64748B', border: '#E3EAEF',
  red: '#C62828', redSoft: '#FDECEC', amber: '#B45309', amberSoft: '#FFF4E0',
  green: '#2E7D32', greenSoft: '#E8F5E9', blue: '#005A71', tealSoft: '#E3F2F5', blueSoft: '#E6EEF8',
};

const APPOINTMENT_STATUSES = [
  { key: 'booked', label: 'Booked', icon: 'calendar-outline', fg: C.primary, bg: C.tealSoft },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline', fg: C.blue, bg: C.blueSoft },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline', fg: C.red, bg: C.redSoft },
  { key: 'rescheduled', label: 'Rescheduled', icon: 'swap-horizontal-outline', fg: C.amber, bg: C.amberSoft },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-outline', fg: C.green, bg: C.greenSoft },
];

function Card({ title, subtitle, icon, right, children }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.cardTitleWrap}>
          {icon ? <View style={s.cardIcon}><Ionicons name={icon} size={16} color={C.primary} /></View> : null}
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{title}</Text>
            {subtitle ? <Text style={s.cardSub}>{subtitle}</Text> : null}
          </View>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

function Kpi({ label, value, detail, icon, fg, bg }) {
  return (
    <View style={s.kpi} accessible accessibilityLabel={`${label}: ${value}. ${detail}`}>
      <View style={[s.kpiIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={18} color={fg} /></View>
      <Text style={s.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={s.kpiLabel} numberOfLines={2}>{label}</Text>
      <Text style={s.kpiDetail} numberOfLines={2}>{detail}</Text>
    </View>
  );
}

function StatusRow({ label, value, icon, fg, bg, last }) {
  return (
    <View style={[s.statusRow, last && { borderBottomWidth: 0 }]}>
      <View style={[s.statusIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={15} color={fg} /></View>
      <Text style={s.statusLabel}>{label}</Text>
      <Text style={[s.statusValue, { color: fg }]}>{value}</Text>
    </View>
  );
}

function Pill({ label, value, icon, fg, bg }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={16} color={fg} />
      <Text style={[s.pillValue, { color: fg }]}>{value}</Text>
      <Text style={[s.pillLabel, { color: fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function Unavailable({ title, heading, description, cardIcon, mainIcon }) {
  return (
    <Card title={title} icon={cardIcon}>
      <View style={s.empty}>
        <View style={s.emptyIcon}><Ionicons name={mainIcon} size={26} color={C.primary} /></View>
        <Text style={s.emptyTitle}>{heading}</Text>
        <Text style={s.emptyText}>{description}</Text>
      </View>
    </Card>
  );
}

export default function HIOReportDetailsScreen({ route }) {
  const { year, month } = route.params || {};
  const resource = useHioResource(useCallback(signal => hioApi.report(year, month, { signal }), [year, month]));
  const d = resource.data;
  const [exporting, setExporting] = useState(false);
  const exportInProgress = useRef(false);
  const downloadPdf = async () => {
    if (!d || exportInProgress.current) return;
    exportInProgress.current = true;
    setExporting(true);
    try { const reviewNotes = await hioApi.getReportNote(year, month);
      await exportMonthlyReportPdf({ ...d, reviewNotes }); }
    catch (error) {
      console.error('HIO PDF export failed:', error?.message || error);
      Alert.alert('Unable to export PDF', error?.message || 'The report could not be generated or shared. Please try again.');
    }
    finally { exportInProgress.current = false; setExporting(false); }
  };

  const shareSummary = async () => {
    try {
      await Share.share({ title: `SuwaSeva ${d.label}`, message: [
        `SuwaSeva — ${d.label}`, 'All hospitals / OPDs • Asia/Colombo',
        `Appointments: ${d.totalAppointments}`, `Completed appointments: ${d.appointments.completed}`,
        `Completion rate: ${percentage(d.appointmentCompletionRate)}`, `Checked in: ${d.checkedInPatients}`,
        `Queue completions: ${d.queueCompletionCount}`, `Emergency cases: ${d.emergencyCases}`,
        `Estimated wait: ${minutes(d.averageEstimatedWait)}`, 'Feedback & verified consultation analytics unavailable.',
        `Live derived report generated ${d.generatedAt}. No patient identifiers included.`,
      ].join('\n') });
    } catch { Alert.alert('Unable to share', 'Please try sharing the report again.'); }
  };

  const hero = d ? (
    <View style={s.hero}>
      <View style={{ flex: 1 }}>
        <Text style={s.heroKicker}>Monthly Performance Report</Text>
        <Text style={s.heroName} numberOfLines={2}>{d.label}</Text>
        <Text style={s.heroScope} numberOfLines={2}>All Hospitals • All OPDs • Asia/Colombo</Text>
        {d.generatedAt ? (
          <Text style={s.heroUpdated}>
            Generated {new Date(d.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : null}
      </View>
      <View style={s.badge}><Ionicons name="document-text-outline" size={13} color="#fff" /><Text style={s.badgeText}>REPORT</Text></View>
    </View>
  ) : undefined;

  return (
    <Screen title="Monthly Performance Report" subtitle={d?.label || 'Monthly operational summary'} resource={resource} hasHeader hero={hero}>
      {d ? (
        <View style={s.wrap}>
          {/* Empty month notice */}
          {!d.totalAppointments ? (
            <Card title="Report availability" icon="alert-circle-outline">
              <EmptyState title="No report data for this month" description="There are no scheduled appointment records available for this reporting period." icon="document-outline" />
            </Card>
          ) : null}

          {/* 2. KPI cards */}
          <View style={s.kpiGrid}>
            <Kpi label="Total Appointments" value={number(d.totalAppointments)} detail="All statuses this month" icon="calendar-outline" fg={C.primary} bg={C.tealSoft} />
            <Kpi label="Queue Completions" value={number(d.queueCompletionCount)} detail="Operational queue records" icon="checkmark-done-outline" fg={C.navy} bg={C.blueSoft} />
            <Kpi label="Estimated Wait" value={minutes(d.averageEstimatedWait)} detail="Stored estimates, arrived & waiting" icon="time-outline" fg={C.amber} bg={C.amberSoft} />
            <Kpi label="Appointment Completion" value={percentage(d.appointmentCompletionRate)} detail="Completed / all appointments" icon="stats-chart-outline" fg={C.green} bg={C.greenSoft} />
          </View>

          {/* 3. Daily trend */}
          <Card title="Daily Appointment Trend" subtitle="Scheduled appointments during this month" icon="trending-up-outline">
            <LineChart data={d.dailyAppointmentTrend || []} />
          </Card>

          {/* 4. Appointment status summary */}
          <Card title="Appointment Status Summary" icon="document-text-outline">
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>Total appointments</Text>
              <Text style={s.totalValue}>{number(d.totalAppointments)}</Text>
            </View>
            <View style={{ marginTop: 6 }}>
              {APPOINTMENT_STATUSES.map((st, i) => (
                <StatusRow
                  key={st.key}
                  label={st.label}
                  value={number(d.appointments?.[st.key])}
                  icon={st.icon}
                  fg={st.fg}
                  bg={st.bg}
                  last={i === APPOINTMENT_STATUSES.length - 1}
                />
              ))}
            </View>
          </Card>

          {/* 5. Triage & attendance */}
          <Card title="Triage & Attendance" subtitle="Triage of arrived patients" icon="pulse-outline">
            <View style={s.checkedBox}>
              <Ionicons name="log-in-outline" size={20} color={C.primary} />
              <Text style={s.checkedLabel}>Checked in</Text>
              <Text style={s.checkedValue}>{number(d.checkedInPatients)}</Text>
            </View>
            <View style={s.pillRow}>
              <Pill label="Emergency" value={number(d.emergencyCases)} icon="alert-circle" fg={C.red} bg={C.redSoft} />
              <Pill label="Priority" value={number(d.priorityCases)} icon="flag" fg={C.amber} bg={C.amberSoft} />
              <Pill label="Routine" value={number(d.normalCases)} icon="person-outline" fg={C.primary} bg={C.tealSoft} />
            </View>
            <View style={s.waitBox}>
              <Ionicons name="stopwatch-outline" size={18} color={C.navy} />
              <Text style={s.waitLabel}>Observed wait until call</Text>
              <Text style={s.waitValue}>{minutes(d.observedWaitUntilCalled)}</Text>
            </View>
          </Card>

          {/* 6. Feedback */}
          <Unavailable
            title="Citizen Feedback"
            cardIcon="chatbubbles-outline"
            mainIcon="chatbubble-ellipses-outline"
            heading="No patient feedback available yet."
            description={d.feedback?.available ? 'No responses for this period.' : 'Feedback analytics will appear when the feedback data source is available.'}
          />

          {/* 7. Consultation */}
          <Unavailable
            title="Consultation Analytics"
            cardIcon="medkit-outline"
            mainIcon="file-tray-outline"
            heading="Consultation data unavailable."
            description={d.consultation?.available ? 'No consultation records for this period.' : 'Consultation analytics will appear when consultation records are available.'}
          />

          {/* 8. Share */}
          <HIOReportNote key={`${year}-${month}`} year={year} month={month} />
          <View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Download monthly report PDF" accessibilityState={{ disabled: exporting, busy: exporting }} disabled={exporting} onPress={downloadPdf} style={[s.shareBtn, { marginBottom: 10, opacity: exporting ? 0.65 : 1 }]}>
              {exporting ? <ActivityIndicator color="#fff" /> : <Ionicons name="download-outline" size={18} color="#fff" />}
              <Text style={s.shareText}>{exporting ? 'Preparing PDF...' : 'Download PDF'}</Text>
            </TouchableOpacity>
            <Text style={[s.shareHint, { marginTop: 0, marginBottom: 12 }]}>Choose an available save/share app to keep the PDF.</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share report summary" onPress={shareSummary} style={s.shareBtn}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={s.shareText}>Share Report Summary</Text>
            </TouchableOpacity>
            <Text style={s.shareHint}>Anonymized operational summary only</Text>
          </View>

          {/* 9. Note */}
          <View style={s.note}>
            <Ionicons name="information-circle-outline" size={18} color={C.primary} />
            <Text style={s.noteText}>
              Live derived report • No saved approval status. Completion rate counts all appointment statuses in its denominator. Queue completions are not verified consultations.
            </Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 14 },

  hero: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.navy, borderRadius: 18, padding: 16 },
  heroKicker: { color: '#7FD1E6', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroScope: { color: '#CFE3EE', fontSize: 12, marginTop: 6 },
  heroUpdated: { color: '#9FC3D6', fontSize: 11, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginLeft: 5 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  kpi: { width: '48.5%', backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  kpiIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 30, fontWeight: '800', color: C.text },
  kpiLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginTop: 2 },
  kpiDetail: { fontSize: 11, color: C.muted, marginTop: 2 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  cardTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  cardIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: C.tealSoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  cardSub: { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 16 },

  totalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  totalLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  totalValue: { fontSize: 26, fontWeight: '800', color: C.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F4F7' },
  statusIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  statusLabel: { flex: 1, fontSize: 14, color: C.text },
  statusValue: { fontSize: 17, fontWeight: '800' },

  checkedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  checkedLabel: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: C.text },
  checkedValue: { fontSize: 26, fontWeight: '800', color: C.primary },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  pill: { width: '31.5%', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  pillValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  pillLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  waitBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.blueSoft, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginTop: 12 },
  waitLabel: { flex: 1, marginLeft: 10, fontSize: 13, fontWeight: '600', color: C.navy },
  waitValue: { fontSize: 18, fontWeight: '800', color: C.navy },

  empty: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.tealSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'center' },
  emptyText: { fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 4, lineHeight: 18 },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15 },
  shareText: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  shareHint: { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 6 },

  note: { flexDirection: 'row', backgroundColor: C.tealSoft, borderRadius: 12, padding: 12, alignItems: 'flex-start' },
  noteText: { flex: 1, marginLeft: 8, fontSize: 12, color: C.navy, lineHeight: 17 },
});
