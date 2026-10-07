import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, SectionCard, MetricCard, StatRow, EmptyState, ActionButton, Badge, ui, number, minutes, statusLabel } from '../../components/hio/HIOUI';

export default function HIOQueueStatisticsScreen() {
  const [page, setPage] = useState(1);
  const resource = useHioResource(useCallback(signal => hioApi.queue({ signal, params: { page, limit: 20 } }), [page]), true);
  const d = resource.data, s = d?.summary;
  return <Screen title="Queue & Waiting Statistics" subtitle="Today's OPD queue • Monitoring only" resource={resource} live>
    {d ? <>
      <View style={ui.grid}>
        <MetricCard label="Checked in" value={number(s?.checkedIn)} detail="Today's arrived records" icon="checkmark-circle-outline" />
        <MetricCard label="Waiting" value={number(s?.waiting)} detail="Arrived & waiting" icon="people-outline" tone="blue" />
        <MetricCard label="Emergency" value={number(s?.emergency)} detail="Active & arrived" icon="alert-circle-outline" tone="red" />
        <MetricCard label="Average estimated wait" value={minutes(s?.averageEstimatedWait)} detail="Stored estimate, not elapsed time" icon="time-outline" tone="green" />
      </View>
      <SectionCard title="Live queue overview" icon="pulse-outline">
        <StatRow label="Called" value={number(s?.called)} /><StatRow label="Serving status" value={number(s?.serving)} />
        <StatRow label="Routine • active & arrived" value={number(s?.normal)} /><StatRow label="Priority • active & arrived" value={number(s?.priority)} />
        <StatRow label="Not arrived" value={number(s?.notArrived)} /><StatRow label="Queue completed" value={number(s?.completed)} />
      </SectionCard>
      <Text style={ui.sectionTitle}>Active queue roster</Text>
      <Text style={ui.caption}>Appointment date: {d.period?.label}. Reservations awaiting arrival are explicitly labelled.</Text>
      {d.activeQueue?.length ? d.activeQueue.map(item => <SectionCard key={item.queueId} title={item.token || 'Token unavailable'} icon="ticket-outline" subtitle={item.patientName || 'Patient name unavailable'}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Badge tone={item.priority === 'Emergency' ? 'red' : item.priority === 'Priority' ? 'amber' : 'teal'}>{statusLabel(item.priority)}</Badge>
          <Badge tone="blue">{statusLabel(item.status)}</Badge>
          <Badge tone={item.arrivalStatus === 'Arrived' ? 'green' : 'amber'}>{item.arrivalStatus || 'Arrival unknown'}</Badge>
        </View>
        <StatRow label="Hospital" value={item.hospital || 'Unavailable'} /><StatRow label="OPD" value={item.opd || 'Unavailable'} />
        <StatRow label="Queue position" value={number(item.queuePosition)} /><StatRow label="Stored estimated wait" value={minutes(item.estimatedWaitingTime)} />
        <StatRow label="Appointment time" value={item.appointmentTime || 'Unavailable'} />
      </SectionCard>) : <SectionCard title="Active queue"><EmptyState title="No active queue patients" description="Today's waiting, called and serving entries will appear here." icon="people-outline" /></SectionCard>}
      {d.pagination?.total > 20 || page > 1 ? <SectionCard title={`Page ${page} • ${number(d.pagination?.total)} records`}>
        {page > 1 ? <ActionButton label="Previous page" icon="chevron-back-outline" onPress={() => setPage(p => p - 1)} /> : null}
        {page * 20 < d.pagination.total ? <ActionButton label="Next page" icon="chevron-forward-outline" onPress={() => setPage(p => p + 1)} /> : null}
      </SectionCard> : null}
    </> : null}
  </Screen>;
}
