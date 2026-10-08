import React, { useCallback, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import hioApi from '../../services/hioApi';
import HIODateFilter, { useHioDate } from '../../components/hio/HIODateFilter';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, number, minutes, palette } from '../../components/hio/HIOUI';
import { LineChart, BarChart, DonutChart } from '../../components/hio/HIOCharts';

const C = {
  primary: '#005A71',
  navy: '#0A3D62',
  bg: '#F4F7F9',
  text: '#0F2A3D',
  muted: '#64748B',
  border: '#E3EAEF',
  red: '#C62828',
  redSoft: '#FDECEC',
  amber: '#B45309',
  amberSoft: '#FFF4E0',
  green: '#2E7D32',
  greenSoft: '#E8F5E9',
  tealSoft: '#E3F2F5',
  blueSoft: '#E6EEF8',
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function Card({ title, subtitle, icon, right, children }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.cardTitleWrap}>
          {icon ? (
            <View style={s.cardIcon}>
              <Ionicons name={icon} size={16} color={C.primary} />
            </View>
          ) : null}
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
      <View style={[s.kpiIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={fg} />
      </View>
      <Text style={s.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={s.kpiLabel} numberOfLines={1}>{label}</Text>
      <Text style={s.kpiDetail} numberOfLines={2}>{detail}</Text>
    </View>
  );
}

function Tile({ label, value }) {
  return (
    <View style={s.tile}>
      <Text style={s.tileValue}>{value}</Text>
      <Text style={s.tileLabel} numberOfLines={1}>{label}</Text>
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

export default function HIODashboardScreen() {
  const { userInfo } = useContext(AuthContext);
  const { selection, setSelection, date, isToday } = useHioDate();
  const resource = useHioResource(useCallback(signal => hioApi.dashboard({ signal, params: { date } }), [date]), isToday);
  const d = resource.data;

  const appointmentStatus = d ? [
    { label: 'Booked', value: d.statusComparison?.booked || 0 },
    { label: 'Confirmed', value: d.statusComparison?.confirmed || 0 },
  ] : [];

  const queueStatus = d ? ['waiting', 'called', 'serving', 'completed'].map((key, index) => ({
    label: key === 'completed' ? 'Complete' : key.charAt(0).toUpperCase() + key.slice(1),
    value: d.statusComparison?.[key] || 0,
    color: [palette.teal, palette.blue, palette.sky, palette.green][index],
  })) : [];

  const priorityData = d ? ['Normal', 'Priority', 'Emergency'].map((key, i) => ({
    label: key === 'Normal' ? 'Routine' : key,
    value: d.priorityDistribution?.[key] || 0,
    color: [palette.teal, palette.amber, palette.red][i],
  })) : [];

  const hero = d ? (
    <View style={s.hero}>
      <View style={{ flex: 1 }}>
        <Text style={s.heroKicker}>HIO Analytics</Text>
        <Text style={s.heroHello}>{greeting()},</Text>
        <Text style={s.heroName} numberOfLines={1}>{userInfo?.fullName || 'Health Information Officer'}</Text>
        <Text style={s.heroScope} numberOfLines={2}>
          All Hospitals • All OPDs • {d.period?.label || 'Today'}
        </Text>
        {d.generatedAt ? (
          <Text style={s.heroUpdated}>
            Updated {new Date(d.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : null}
      </View>
      <View style={s.live}>
        {isToday ? <View style={s.liveDot} /> : null}
        <Text style={s.liveText}>{isToday ? 'LIVE' : 'RECORDS'}</Text>
      </View>
    </View>
  ) : undefined;

  return (
    <Screen title="HIO Analytics" subtitle={isToday ? "Operational overview for today" : `Operational records - ${date}`} resource={resource} live={isToday} hero={hero}
      filters={<HIODateFilter selection={selection} date={date} onChange={setSelection} />}>
      {d ? (
        <View style={s.wrap}>
          {/* 2. KPI cards */}
          <View style={s.kpiGrid}>
            <Kpi label={isToday ? "Today's Appointments" : "Appointments"} value={number(d.todayAppointments)} detail={`All statuses, scheduled ${date}`} icon="calendar-outline" fg={C.primary} bg={C.tealSoft} />
            <Kpi label={isToday ? "Waiting Now" : "Waiting Records"} value={number(d.waitingPatients)} detail="Arrived patients only" icon="people-outline" fg={C.amber} bg={C.amberSoft} />
            <Kpi label="Queue Completed" value={number(d.completedVisits)} detail="Queue completion records" icon="checkmark-done-outline" fg={C.green} bg={C.greenSoft} />
            <Kpi label="Avg. Wait" value={minutes(d.averageEstimatedWaitingTime)} detail="Stored estimates, arrived & waiting" icon="time-outline" fg={C.navy} bg={C.blueSoft} />
          </View>

          {/* 3. Queue overview */}
          <Card title="Queue Overview" subtitle={isToday ? "Today's cohort - refreshes every 30 seconds" : `Appointment records for ${date}`} icon="pulse-outline">
            <View style={s.tileRow}>
              <Tile label="Checked in" value={number(d.checkedInPatients)} />
              <Tile label="Called" value={number(d.calledPatients)} />
              <Tile label="Serving" value={number(d.servingPatients)} />
            </View>
            <Text style={s.hint}>Checked in includes completed visits.</Text>
            <View style={s.pillRow}>
              <Pill label="Emergency" value={number(d.emergencyPatients)} icon="alert-circle" fg={C.red} bg={C.redSoft} />
              <Pill label="Priority" value={number(d.priorityPatients)} icon="flag" fg={C.amber} bg={C.amberSoft} />
              <Pill label="Awaiting" value={number(d.notArrivedPatients)} icon="hourglass-outline" fg={C.navy} bg={C.blueSoft} />
            </View>
            <Text style={s.hint}>Emergency and Priority are active & arrived. Awaiting = not yet arrived.</Text>
          </Card>

          {/* 4. Appointment trend */}
          <Card
            title="Appointment Trend"
            subtitle="Scheduled appointments per day"
            icon="trending-up-outline"
            right={<View style={s.chip}><Text style={s.chipText}>{isToday ? "Last 7 days" : "7-day period"}</Text></View>}
          >
            <LineChart data={d.appointmentTrendLast7Days || []} />
          </Card>

          {/* 5. Status comparison */}
          <Card title="Status Comparison" subtitle="Appointment and queue measures overlap, so they are shown separately." icon="bar-chart-outline">
            <Text style={s.group}>Appointment Status</Text>
            <BarChart data={appointmentStatus} />
            <View style={s.divider} />
            <Text style={s.group}>Queue Status</Text>
            <Text style={s.hint}>Waiting requires arrival.</Text>
            <BarChart data={queueStatus} />
          </Card>

          {/* 6. Priority distribution (chart draws its own legend) */}
          <Card title="Queue Priority" subtitle="Active checked-in patients • Emergency is separate from Priority" icon="pie-chart-outline">
            <DonutChart data={priorityData} />
          </Card>

          {/* 7. Info note */}
          <View style={s.note}>
            <Ionicons name="information-circle-outline" size={18} color={C.primary} />
            <Text style={s.noteText}>
              Queue completion is an operational queue status. Verified doctor consultation analytics will appear when consultation records are available.
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
  heroHello: { color: '#B8D4E3', fontSize: 13 },
  heroName: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 2 },
  heroScope: { color: '#CFE3EE', fontSize: 12, marginTop: 6 },
  heroUpdated: { color: '#9FC3D6', fontSize: 11, marginTop: 4 },
  live: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },

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

  tileRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tile: { width: '31.5%', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  tileValue: { fontSize: 22, fontWeight: '800', color: C.primary },
  tileLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  pill: { width: '31.5%', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  pillValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  pillLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  hint: { fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 16 },

  chip: { backgroundColor: C.tealSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '600', color: C.primary },
  group: { fontSize: 12, fontWeight: '700', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  note: { flexDirection: 'row', backgroundColor: C.tealSoft, borderRadius: 12, padding: 12, alignItems: 'flex-start' },
  noteText: { flex: 1, marginLeft: 8, fontSize: 12, color: C.navy, lineHeight: 17 },
});
