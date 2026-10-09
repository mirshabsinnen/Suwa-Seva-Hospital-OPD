import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import hioApi from '../../services/hioApi';
import HIODateFilter, { useHioDate } from '../../components/hio/HIODateFilter';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, EmptyState, Badge, number, minutes, statusLabel } from '../../components/hio/HIOUI';

const PAGE_SIZE = 20;

const C = {
  primary: '#005A71', navy: '#005A71', bg: '#FFFFFF', text: '#0F2A3D', muted: '#64748B', border: '#E3EAEF',
  red: '#C62828', redSoft: '#FDECEC', amber: '#B45309', amberSoft: '#FFF4E0',
  green: '#2E7D32', greenSoft: '#E8F5E9', tealSoft: '#E3F2F5', blueSoft: '#E6EEF8',
};

function Card({ title, subtitle, icon, children }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        {icon ? <View style={s.cardIcon}><Ionicons name={icon} size={16} color={C.primary} /></View> : null}
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{title}</Text>
          {subtitle ? <Text style={s.cardSub}>{subtitle}</Text> : null}
        </View>
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

function Field({ label, value }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

function PageButton({ label, icon, onPress, disabled, iconRight }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${label} page`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.pageBtn, disabled && s.pageBtnOff]}
    >
      {!iconRight ? <Ionicons name={icon} size={16} color={disabled ? C.muted : '#fff'} /> : null}
      <Text style={[s.pageBtnText, disabled && { color: C.muted }]}>{label}</Text>
      {iconRight ? <Ionicons name={icon} size={16} color={disabled ? C.muted : '#fff'} /> : null}
    </TouchableOpacity>
  );
}

export default function HIOQueueStatisticsScreen() {
  const [page, setPage] = useState(1);
  const { selection, setSelection, date, isToday } = useHioDate();
  const changeDate = value => { setPage(1); setSelection(value); };
  const resource = useHioResource(useCallback(signal => hioApi.queue({ signal, params: { page, limit: PAGE_SIZE, date } }), [page, date]), isToday);
  const d = resource.data, sm = d?.summary;
  const total = d?.pagination?.total;

  return (
    <Screen title="Queue & Waiting Statistics" subtitle={isToday ? "Today's OPD queue - Monitoring only" : `Queue records - ${date}`} resource={resource} live={isToday}
      filters={<HIODateFilter selection={selection} date={date} onChange={changeDate} />}>
      {d ? (
        <View style={s.wrap}>
          {/* 2. KPI cards */}
          <View style={s.kpiGrid}>
            <Kpi label="Checked In" value={number(sm?.checkedIn)} detail={isToday ? "Arrived today" : "Arrived on selected date"} icon="checkmark-circle-outline" fg={C.primary} bg={C.tealSoft} />
            <Kpi label="Waiting" value={number(sm?.waiting)} detail="Arrived & waiting" icon="people-outline" fg={C.amber} bg={C.amberSoft} />
            <Kpi label="Emergency" value={number(sm?.emergency)} detail="Active & arrived" icon="alert-circle-outline" fg={C.red} bg={C.redSoft} />
            <Kpi label="Avg. Wait" value={minutes(sm?.averageEstimatedWait)} detail="Stored estimate, not elapsed time" icon="time-outline" fg={C.navy} bg={C.blueSoft} />
          </View>

          {/* 3. Queue overview */}
          <Card title="Queue Overview" subtitle={isToday ? "Refreshes every 30 seconds" : "Stored statuses for the selected appointment date"} icon="pulse-outline">
            <View style={s.tileRow}>
              <Tile label="Called" value={number(sm?.called)} />
              <Tile label="Serving" value={number(sm?.serving)} />
              <Tile label="Completed" value={number(sm?.completed)} />
            </View>
            <View style={s.pillRow}>
              <Pill label="Routine" value={number(sm?.normal)} icon="person-outline" fg={C.primary} bg={C.tealSoft} />
              <Pill label="Priority" value={number(sm?.priority)} icon="flag" fg={C.amber} bg={C.amberSoft} />
              <Pill label="Not arrived" value={number(sm?.notArrived)} icon="hourglass-outline" fg={C.navy} bg={C.blueSoft} />
            </View>
            <Text style={s.hint}>Routine and Priority are active & arrived. Completed is a queue status, not a verified consultation.</Text>
          </Card>

          {/* 4. Roster heading */}
          <View>
            <Text style={s.sectionTitle}>{isToday ? "Active Queue Roster" : "Queue Records"}</Text>
            <Text style={s.sectionSub}>Appointment date: {d.period?.label}. Reservations awaiting arrival are explicitly labelled.</Text>
          </View>

          {/* 5. Patient queue cards */}
          {d.activeQueue?.length ? d.activeQueue.map(item => {
            const accent = item.priority === 'Emergency' ? C.red : item.priority === 'Priority' ? C.amber : C.primary;
            return (
              <View key={item.queueId} style={[s.ticket, { borderLeftColor: accent }]}>
                <View style={s.ticketTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.tokenLabel}>TOKEN</Text>
                    <Text style={[s.token, { color: accent }]} numberOfLines={1}>{item.token || 'Token unavailable'}</Text>
                  </View>
                  <View style={s.posBox}>
                    <Text style={s.posLabel}>POSITION</Text>
                    <Text style={s.posValue}>{number(item.queuePosition)}</Text>
                  </View>
                </View>
                <Text style={s.patient} numberOfLines={2}>{item.patientName || 'Patient name unavailable'}</Text>
                <View style={s.badges}>
                  <Badge tone={item.priority === 'Emergency' ? 'red' : item.priority === 'Priority' ? 'amber' : 'teal'}>{statusLabel(item.priority)}</Badge>
                  <Badge tone="blue">{statusLabel(item.status)}</Badge>
                  <Badge tone={item.arrivalStatus === 'Arrived' ? 'green' : 'amber'}>{item.arrivalStatus || 'Arrival unknown'}</Badge>
                </View>
                <View style={s.divider} />
                <Field label="Hospital" value={item.hospital || 'Unavailable'} />
                <Field label="OPD" value={item.opd || 'Unavailable'} />
                <View style={s.statRow}>
                  <Stat label="Estimated wait" value={minutes(item.estimatedWaitingTime)} />
                  <Stat label="Appointment" value={item.appointmentTime || 'Unavailable'} />
                </View>
              </View>
            );
          }) : (
            <Card title="Active Queue" icon="people-outline">
              <EmptyState title={isToday ? "No active queue patients" : "No queue records for this date"} description={isToday ? "Today's waiting, called and serving patients will appear here." : "No non-cancelled queue records were found for this appointment date."} icon="people-outline" />
            </Card>
          )}

          {/* 6. Pagination */}
          {total > PAGE_SIZE || page > 1 ? (
            <View style={s.pager}>
              <PageButton label="Previous" icon="chevron-back-outline" disabled={page <= 1} onPress={() => setPage(p => p - 1)} />
              <View style={s.pageInfo}>
                <Text style={s.pageNum}>Page {page}</Text>
                <Text style={s.pageTotal}>{number(total)} records</Text>
              </View>
              <PageButton label="Next" icon="chevron-forward-outline" iconRight disabled={!(page * PAGE_SIZE < total)} onPress={() => setPage(p => p + 1)} />
            </View>
          ) : null}
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
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
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
  hint: { fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 16 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  sectionSub: { fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 16 },

  ticket: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4 },
  ticketTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  tokenLabel: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  token: { fontSize: 22, fontWeight: '800', marginTop: 1 },
  posBox: { alignItems: 'flex-end', marginLeft: 10, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  posLabel: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 0.6 },
  posValue: { fontSize: 20, fontWeight: '800', color: C.text },
  patient: { fontSize: 15, fontWeight: '600', color: C.text, marginTop: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  field: { marginBottom: 8 },
  fieldLabel: { fontSize: 10, color: C.muted },
  fieldValue: { fontSize: 13, fontWeight: '600', color: C.text, marginTop: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  stat: { flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 10 },
  statLabel: { fontSize: 10, color: C.muted },
  statValue: { fontSize: 15, fontWeight: '700', color: C.primary, marginTop: 2 },

  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: C.border },
  pageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 11, paddingVertical: 11, paddingHorizontal: 12, minWidth: 98, gap: 4 },
  pageBtnOff: { backgroundColor: C.bg },
  pageBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  pageInfo: { alignItems: 'center', flex: 1, paddingHorizontal: 6 },
  pageNum: { fontSize: 14, fontWeight: '700', color: C.text },
  pageTotal: { fontSize: 11, color: C.muted, marginTop: 1 },
});
