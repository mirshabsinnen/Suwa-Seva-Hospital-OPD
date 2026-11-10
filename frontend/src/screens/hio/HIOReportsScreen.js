import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import hioApi from '../../services/hioApi';
import useHioResource from '../../components/hio/useHioResource';
import { Screen, SectionCard, EmptyState, Badge, ui, number, palette } from '../../components/hio/HIOUI';

export default function HIOReportsScreen({ navigation }) {
  const resource = useHioResource(useCallback(signal => hioApi.reports({ signal }), []));
  const reports = resource.data;
  return <Screen title="Reports & Documents" subtitle="Monthly OPD reporting • Derived from current records" resource={resource}>
    <SectionCard title="Reporting scope" icon="business-outline">
      <Text style={ui.caption}>All hospitals • All OPD departments</Text>
      <View style={[ui.note, { marginTop: 10 }]}><Text style={ui.caption}>Reports are calculated when opened. They are live summaries, not saved or approved snapshots.</Text></View>
    </SectionCard>
    {reports?.length ? <>
      <Text style={ui.sectionTitle}>Monthly performance reports</Text>
      {reports.map(report => <TouchableOpacity key={`${report.year}-${report.month}`} accessibilityRole="button"
        accessibilityLabel={`Open ${report.label} report, ${report.appointmentCount} appointments`}
        onPress={() => navigation.navigate('HIOReportDetails', { year: report.year, month: report.month })}>
        <SectionCard title={report.label} icon="document-text-outline">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 25, fontWeight: '800' }}>{number(report.appointmentCount)}</Text>
              <Text style={ui.caption}>Scheduled appointments</Text></View>
            <Badge>Live summary</Badge><Ionicons name="chevron-forward" size={20} color={palette.teal} />
          </View>
          <Text style={[ui.caption, { marginTop: 10, color: palette.teal }]}>View monthly report →</Text>
        </SectionCard>
      </TouchableOpacity>)}
    </> : !resource.loading && !resource.error ? <SectionCard title="Available reports"><EmptyState title="No report data available yet" description="Months will appear when appointment records exist." icon="documents-outline" /></SectionCard> : null}
  </Screen>;
}
