import React, { useCallback, useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, SectionCard, MetricCard, StatRow, Badge, ui, number, minutes, palette } from '../../components/hio/HIOUI';
import { LineChart, BarChart, DonutChart } from '../../components/hio/HIOCharts';

export default function HIODashboardScreen() {
  const { userInfo } = useContext(AuthContext);
  const resource = useHioResource(useCallback(signal => hioApi.dashboard({ signal }), []), true);
  const d = resource.data;
  return <Screen title="HIO Analytics Hub" subtitle="Live operational oversight • All hospitals & OPDs" resource={resource} live>
    {d ? <>
      <SectionCard title={userInfo?.fullName || 'Health Information Officer'} icon="person-circle-outline">
        <Badge>Authenticated HIO • Read only</Badge>
      </SectionCard>
      <SectionCard title="Scope & stream" icon="options-outline">
        <StatRow label="Facility" value="All participating hospitals" />
        <StatRow label="OPD department" value="All OPD units" />
        <StatRow label="Appointment date" value={d.period?.label || 'Today'} />
      </SectionCard>
      <View style={ui.grid}>
        <MetricCard label="Today's appointments" value={number(d.todayAppointments)} icon="calendar-outline" detail="All appointment statuses" />
        <MetricCard label="Queue completed" value={number(d.completedVisits)} icon="checkmark-done-outline" tone="blue" detail="Queue completion records" />
        <MetricCard label="Waiting now" value={number(d.waitingPatients)} icon="people-outline" tone="amber" detail="Arrived patients only" />
        <MetricCard label="Estimated waiting time" value={minutes(d.averageEstimatedWaitingTime)} icon="time-outline" tone="green" detail="Stored estimates • arrived & waiting" />
      </View>
      <SectionCard title="Triage & queue pulse" subtitle="Today's appointment cohort • refreshed every 30 seconds" icon="pulse-outline">
        <StatRow label="Checked in (including completed)" value={number(d.checkedInPatients)} />
        <StatRow label="Called" value={number(d.calledPatients)} />
        <StatRow label="Serving status" value={number(d.servingPatients)} />
        <StatRow label="Emergency • active & arrived" value={number(d.emergencyPatients)} tone="red" />
        <StatRow label="Priority • active & arrived" value={number(d.priorityPatients)} tone="amber" />
        <StatRow label="Awaiting arrival" value={number(d.notArrivedPatients)} />
      </SectionCard>
      <SectionCard title="Appointment trend" subtitle="Last 7 calendar days • scheduled appointments" icon="trending-up-outline">
        <LineChart data={d.appointmentTrendLast7Days || []} />
      </SectionCard>
      <SectionCard title="Today status comparison" subtitle="Appointment statuses and queue states are separate, overlapping measures." icon="bar-chart-outline">
        <Text style={ui.caption}>Appointment records</Text>
        <BarChart data={[{ label: 'Booked', value: d.statusComparison?.booked || 0 }, { label: 'Confirmed', value: d.statusComparison?.confirmed || 0 }]} />
        <Text style={ui.caption}>Queue records • waiting requires arrival</Text>
        <BarChart data={['waiting', 'called', 'serving', 'completed'].map((key, index) => ({ label: key === 'completed' ? 'Complete' : key.charAt(0).toUpperCase() + key.slice(1), value: d.statusComparison?.[key] || 0, color: [palette.teal, palette.blue, palette.sky, palette.green][index] }))} />
      </SectionCard>
      <SectionCard title="Queue priority distribution" subtitle="Active checked-in patients • Emergency is separate from Priority" icon="pie-chart-outline">
        <DonutChart data={['Normal', 'Priority', 'Emergency'].map((key, i) => ({ label: key === 'Normal' ? 'Routine' : key, value: d.priorityDistribution?.[key] || 0, color: [palette.teal, palette.amber, palette.red][i] }))} />
      </SectionCard>
      <View style={ui.note}><Text style={ui.caption}>Queue completion is an operational queue status. Verified doctor consultation analytics will appear when consultation records are available.</Text></View>
    </> : null}
  </Screen>;
}
