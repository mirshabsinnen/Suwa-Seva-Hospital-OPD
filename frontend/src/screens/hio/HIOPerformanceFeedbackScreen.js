import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, SectionCard, MetricCard, StatRow, MissingSources, ui, number, minutes, percentage } from '../../components/hio/HIOUI';

export default function HIOPerformanceFeedbackScreen() {
  const resource = useHioResource(useCallback(signal => hioApi.performance({ signal }), []));
  const d = resource.data;
  return <Screen title="OPD Performance & Citizen Feedback" subtitle="Operational performance • Today's appointments" resource={resource}>
    {d ? <>
      <View style={ui.grid}>
        <MetricCard label="Appointment completion" value={percentage(d.appointmentCompletionRate)} detail="Completed / all appointments" icon="checkmark-done-outline" />
        <MetricCard label="Queue completions" value={number(d.queueCompletionCount)} detail="Separate from consultations" icon="people-outline" tone="blue" />
        <MetricCard label="Estimated wait" value={minutes(d.averageEstimatedWait)} detail="Arrived & waiting records" icon="time-outline" tone="green" />
        <MetricCard label="Observed wait until call" value={minutes(d.observedWaitUntilCalled)} detail="Valid arrival/call timestamp pairs" icon="stopwatch-outline" tone="amber" />
      </View>
      <SectionCard title="Appointment performance indices" subtitle={d.period?.label} icon="stats-chart-outline">
        <StatRow label="Total appointments" value={number(d.appointments?.total)} />
        {['booked', 'confirmed', 'rescheduled', 'cancelled', 'completed'].map(key => <StatRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={number(d.appointments?.[key])} />)}
        <View style={ui.note}><Text style={ui.caption}>Completion rate includes cancelled appointments in its denominator. No appointments means the rate is unavailable.</Text></View>
      </SectionCard>
      <SectionCard title="Triage & attendance" icon="pulse-outline">
        <StatRow label="Checked-in patients" value={number(d.checkedInPatients)} />
        <StatRow label="Emergency cases • arrived" value={number(d.emergencyCases)} tone="red" />
        <StatRow label="Priority cases • arrived" value={number(d.priorityCases)} tone="amber" />
        <StatRow label="Routine cases • arrived" value={number(d.normalCases)} />
      </SectionCard>
      <MissingSources feedback={d.feedback} consultation={d.consultation} />
    </> : null}
  </Screen>;
}
