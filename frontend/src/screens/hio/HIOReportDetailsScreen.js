import React, { useCallback } from 'react';
import { View, Text, Share, Alert } from 'react-native';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, SectionCard, MetricCard, StatRow, MissingSources, EmptyState, ActionButton, ui, number, minutes, percentage } from '../../components/hio/HIOUI';
import { LineChart } from '../../components/hio/HIOCharts';

export default function HIOReportDetailsScreen({ route }) {
  const { year, month } = route.params || {};
  const resource = useHioResource(useCallback(signal => hioApi.report(year, month, { signal }), [year, month]));
  const d = resource.data;
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
  return <Screen title="Monthly Performance Report" subtitle={d?.label || 'Monthly operational summary'} resource={resource} hasHeader>
    {d ? <>
      {!d.totalAppointments ? <SectionCard title="Report availability"><EmptyState title="No report data for this month" /></SectionCard> : null}
      <View style={ui.grid}>
        <MetricCard label="Total appointments" value={number(d.totalAppointments)} icon="calendar-outline" />
        <MetricCard label="Queue completions" value={number(d.queueCompletionCount)} icon="checkmark-done-outline" tone="blue" />
        <MetricCard label="Estimated wait" value={minutes(d.averageEstimatedWait)} detail="Stored estimates • arrived & waiting" icon="time-outline" tone="green" />
        <MetricCard label="Appointment completion" value={percentage(d.appointmentCompletionRate)} icon="stats-chart-outline" />
      </View>
      <SectionCard title="OPD appointment activity" subtitle="Daily scheduled appointments • Asia/Colombo" icon="trending-up-outline">
        <LineChart data={d.dailyAppointmentTrend || []} />
      </SectionCard>
      <SectionCard title="Monthly appointment summary" icon="document-text-outline">
        {['booked', 'confirmed', 'cancelled', 'rescheduled', 'completed'].map(key => <StatRow key={key} label={`${key.charAt(0).toUpperCase() + key.slice(1)} appointments`} value={number(d.appointments?.[key])} />)}
      </SectionCard>
      <SectionCard title="Triage & attendance breakdown" icon="pulse-outline">
        <StatRow label="Checked-in patients" value={number(d.checkedInPatients)} />
        <StatRow label="Emergency cases • arrived" value={number(d.emergencyCases)} tone="red" />
        <StatRow label="Priority cases • arrived" value={number(d.priorityCases)} tone="amber" />
        <StatRow label="Routine cases • arrived" value={number(d.normalCases)} />
        <StatRow label="Observed wait until called" value={minutes(d.observedWaitUntilCalled)} />
      </SectionCard>
      <MissingSources feedback={d.feedback} consultation={d.consultation} />
      <ActionButton label="Share anonymized report summary" onPress={shareSummary} />
      <Text style={ui.caption}>Live derived report • No saved approval status. Completion rate counts all appointment statuses in its denominator. Queue completions are not verified consultations.</Text>
    </> : null}
  </Screen>;
}
