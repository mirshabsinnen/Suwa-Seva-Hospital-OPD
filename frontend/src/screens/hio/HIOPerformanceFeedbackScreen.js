import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, number, minutes, percentage } from '../../components/hio/HIOUI';

const C = {
  primary: '#005A71', navy: '#005A71', bg: '#FFFFFF', text: '#0F2A3D', muted: '#64748B', border: '#E3EAEF',
  red: '#C62828', redSoft: '#FDECEC', amber: '#B45309', amberSoft: '#FFF4E0',
  green: '#2E7D32', greenSoft: '#E8F5E9', blue: '#005A71', tealSoft: '#E3F2F5', blueSoft: '#E6EEF8',
};

const APPOINTMENT_STATUSES = [
  { key: 'booked', label: 'Booked', icon: 'calendar-outline', fg: C.primary, bg: C.tealSoft },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline', fg: C.blue, bg: C.blueSoft },
  { key: 'rescheduled', label: 'Rescheduled', icon: 'swap-horizontal-outline', fg: C.amber, bg: C.amberSoft },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline', fg: C.red, bg: C.redSoft },
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

function Unavailable({ title, heading, description, icon }) {
  return (
    <Card title={title} icon={icon.card}>
      <View style={s.empty}>
        <View style={s.emptyIcon}><Ionicons name={icon.main} size={26} color={C.primary} /></View>
        <Text style={s.emptyTitle}>{heading}</Text>
        <Text style={s.emptyText}>{description}</Text>
      </View>
    </Card>
  );
}

export default function HIOPerformanceFeedbackScreen() {
  const resource = useHioResource(useCallback(signal => hioApi.performance({ signal }), []));
  const d = resource.data;

  return (
    <Screen title="OPD Performance & Citizen Feedback" subtitle="Operational performance • Today's appointments" resource={resource}>
      {d ? (
        <View style={s.wrap}>
          {/* 2. KPI cards */}
          <View style={s.kpiGrid}>
            <Kpi label="Appointment Completion" value={percentage(d.appointmentCompletionRate)} detail="Completed / all appointments" icon="checkmark-done-outline" fg={C.green} bg={C.greenSoft} />
            <Kpi label="Queue Completions" value={number(d.queueCompletionCount)} detail="Separate from consultations" icon="people-outline" fg={C.primary} bg={C.tealSoft} />
            <Kpi label="Estimated Wait" value={minutes(d.averageEstimatedWait)} detail="Arrived & waiting records" icon="time-outline" fg={C.amber} bg={C.amberSoft} />
            <Kpi label="Observed Wait Until Call" value={minutes(d.observedWaitUntilCalled)} detail="Valid arrival/call pairs" icon="stopwatch-outline" fg={C.navy} bg={C.blueSoft} />
          </View>

          {/* 3. Appointment performance */}
          <Card
            title="Appointment Performance"
            icon="stats-chart-outline"
            right={d.period?.label ? <View style={s.chip}><Text style={s.chipText} numberOfLines={1}>{d.period.label}</Text></View> : null}
          >
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>Total appointments</Text>
              <Text style={s.totalValue}>{number(d.appointments?.total)}</Text>
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
            <View style={s.callout}>
              <Ionicons name="information-circle-outline" size={18} color={C.primary} />
              <Text style={s.calloutText}>
                Completion rate includes cancelled appointments in its denominator. No appointments means the rate is unavailable.
              </Text>
            </View>
          </Card>

          {/* 4. Triage & attendance */}
          <Card title="Attendance Overview" subtitle="Triage of arrived patients" icon="pulse-outline">
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
            <Text style={s.hint}>Emergency, Priority and Routine counts are arrived cases.</Text>
          </Card>

          {/* 5. Citizen feedback */}
          <Unavailable
            title="Citizen Feedback"
            icon={{ card: 'chatbubbles-outline', main: 'chatbubble-ellipses-outline' }}
            heading="No patient feedback available yet."
            description={d.feedback?.available ? 'No responses for this period.' : 'Feedback analytics will appear when the feedback data source is available.'}
          />

          {/* 6. Consultation analytics */}
          <Unavailable
            title="Consultation Analytics"
            icon={{ card: 'medkit-outline', main: 'file-tray-outline' }}
            heading="Consultation data unavailable."
            description={d.consultation?.available ? 'No consultation records for this period.' : 'Consultation analytics will appear when consultation records are available.'}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 14 },

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
  chip: { backgroundColor: C.tealSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, maxWidth: '45%' },
  chipText: { fontSize: 11, fontWeight: '600', color: C.primary },

  totalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  totalLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  totalValue: { fontSize: 26, fontWeight: '800', color: C.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F4F7' },
  statusIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  statusLabel: { flex: 1, fontSize: 14, color: C.text },
  statusValue: { fontSize: 17, fontWeight: '800' },
  callout: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.tealSoft, borderRadius: 12, padding: 12, marginTop: 12 },
  calloutText: { flex: 1, marginLeft: 8, fontSize: 12, color: C.navy, lineHeight: 17 },

  checkedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  checkedLabel: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: C.text },
  checkedValue: { fontSize: 26, fontWeight: '800', color: C.primary },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  pill: { width: '31.5%', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  pillValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  pillLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  hint: { fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 16 },

  empty: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.tealSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'center' },
  emptyText: { fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});