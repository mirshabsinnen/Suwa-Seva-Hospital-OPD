import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export const palette = { teal: '#005A71', navy: '#0a3d62', blue: '#2797bc', sky: '#77c8ed',
  ink: '#1a2b3c', muted: '#66788a', pale: '#f0f4f8', panel: '#eef4ff', border: '#e4ebf2',
  green: '#16845b', amber: '#b56a12', red: '#c53f43' };
export const number = value => value === null || value === undefined || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString();
export const minutes = value => value === null || value === undefined ? '—' : `${number(value)} min`;
export const percentage = value => value === null || value === undefined ? '—' : `${number(value)}%`;
export const statusLabel = value => ({ waiting: 'Waiting', called: 'Called', serving: 'Serving', completed: 'Queue completed',
  Normal: 'Routine', Priority: 'Priority', Emergency: 'Emergency' }[value] || value);

export function Badge({ children, tone = 'teal' }) {
  const color = palette[tone] || palette.teal;
  return <View style={[ui.badge, { backgroundColor: `${color}12` }]}><Text style={[ui.badgeText, { color }]}>{children}</Text></View>;
}
export function EmptyState({ title, description, icon = 'file-tray-outline' }) {
  return <View style={ui.empty}><Ionicons name={icon} size={30} color={palette.blue} />
    <Text style={ui.emptyTitle}>{title}</Text>{description ? <Text style={ui.caption}>{description}</Text> : null}</View>;
}
export function SectionCard({ title, subtitle, icon, children }) {
  return <View style={ui.card}>
    <View style={ui.sectionHeading}>{icon ? <Ionicons name={icon} size={17} color={palette.teal} /> : null}
      <Text accessibilityRole="header" style={ui.sectionTitle}>{title}</Text></View>
    {subtitle ? <Text style={[ui.caption, { marginBottom: 14 }]}>{subtitle}</Text> : null}
    {children}
  </View>;
}
export function MetricCard({ label, value, detail, icon = 'stats-chart-outline', tone = 'teal' }) {
  const color = palette[tone] || palette.teal;
  return <View style={ui.metric} accessible accessibilityLabel={`${label}: ${value}. ${detail || ''}`}>
    <View style={[ui.metricIcon, { backgroundColor: `${color}12` }]}><Ionicons name={icon} size={19} color={color} /></View>
    <Text style={ui.metricLabel}>{label}</Text><Text style={[ui.metricValue, { color }]}>{value}</Text>
    {detail ? <Text style={ui.metricDetail}>{detail}</Text> : null}
  </View>;
}
export function StatRow({ label, value, tone = 'ink' }) {
  return <View style={ui.statRow}><Text style={ui.rowLabel}>{label}</Text><Text style={[ui.rowValue, { color: palette[tone] }]}>{value}</Text></View>;
}
export function ActionButton({ label, onPress, icon = 'share-outline' }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={ui.button}>
    <Ionicons name={icon} size={18} color="#fff" /><Text style={ui.buttonText}>{label}</Text></TouchableOpacity>;
}
export function MissingSources({ feedback, consultation }) {
  return <>
    <SectionCard title="Citizen feedback" icon="chatbubbles-outline" subtitle="Patient experience & recent comments">
      <EmptyState title="No patient feedback available yet." description={feedback?.available ? 'No responses for this period.' : 'Feedback analytics will appear when the feedback data source is available.'} icon="chatbubble-ellipses-outline" />
    </SectionCard>
    <SectionCard title="Consultation analytics" icon="medkit-outline">
      <EmptyState title="Consultation data unavailable" description={consultation?.available ? 'No consultation records for this period.' : 'Consultation analytics will appear when consultation records are available.'} />
    </SectionCard>
  </>;
}
export function Screen({ title, subtitle, resource, children, live = false, hasHeader = false }) {
  const { logout } = useContext(AuthContext);
  const { data, loading, refreshing, error, refresh } = resource;
  return <SafeAreaView edges={hasHeader ? ['left', 'right'] : ['top', 'left', 'right']} style={ui.safe}>
    <View style={ui.header}>
      <View style={ui.brandIcon}><Ionicons name="medical" size={23} color="#fff" /></View>
      <View style={{ flex: 1 }}><Text style={ui.brand}>SuwaSeva <Text style={ui.brandTag}>HIO / ANALYTICS</Text></Text>
        <Text style={ui.brandSub}>Government Hospital OPD</Text></View>
      <TouchableOpacity onPress={logout} accessibilityRole="button" accessibilityLabel="Sign out" style={ui.iconButton}>
        <Ionicons name="log-out-outline" size={23} color={palette.teal} /></TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={ui.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing && !loading} onRefresh={refresh} tintColor={palette.teal} />}>
      <View style={ui.hero}>
        <View style={ui.heroTop}><Badge>HIO TERMINAL</Badge><Badge tone={live ? 'green' : 'teal'}>{live ? 'Auto-refresh • 30s' : 'Operational overview'}</Badge></View>
        <Text accessibilityRole="header" style={ui.title}>{title}</Text>
        <Text style={ui.caption}>{subtitle}</Text>
        {data?.generatedAt ? <Text style={ui.timestamp}>Updated {new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Asia/Colombo</Text> : null}
      </View>
      {error ? <View accessibilityRole="alert" style={ui.error}><Text style={ui.errorText}>{error}</Text>
        {data ? <Text style={ui.caption}>Showing the last successful response.</Text> : null}
        <ActionButton label="Try again" icon="refresh-outline" onPress={refresh} /></View> : null}
      {loading && !data ? <View style={ui.loading}><ActivityIndicator color={palette.teal} size="large" /><Text style={ui.caption}>Loading HIO data…</Text></View> : children}
      <View style={ui.footer}><View style={ui.liveDot} /><Text style={ui.footerText}>Read-only monitoring • SuwaSeva HIO</Text></View>
    </ScrollView>
  </SafeAreaView>;
}
export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 13, gap: 10, borderBottomWidth: 1, borderBottomColor: palette.border },
  brandIcon: { backgroundColor: palette.teal, height: 36, width: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  brand: { color: palette.navy, fontSize: 17, fontWeight: '800' }, brandTag: { color: palette.teal, fontSize: 10, fontWeight: '700' },
  brandSub: { color: palette.muted, fontSize: 10, marginTop: 2 }, iconButton: { padding: 8 },
  content: { backgroundColor: '#f6f8fd', padding: 18, gap: 16, paddingBottom: 28, flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
  hero: { backgroundColor: palette.panel, padding: 17, borderRadius: 16, gap: 8 }, heroTop: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { color: palette.ink, fontSize: 23, fontWeight: '800', lineHeight: 30 },
  caption: { color: palette.muted, fontSize: 12, lineHeight: 19 }, timestamp: { color: palette.teal, fontSize: 11, marginTop: 2 },
  badge: { alignSelf: 'flex-start', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 }, badgeText: { fontSize: 10, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 17, borderWidth: 1, borderColor: '#edf1f6', shadowColor: palette.navy,
    shadowOpacity: 0.035, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1 },
  sectionHeading: { flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, color: palette.ink, fontWeight: '700', flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, metric: { flexGrow: 1, flexBasis: '45%', backgroundColor: '#fff', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#edf1f6' },
  metricIcon: { height: 33, width: 33, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metricLabel: { fontSize: 12, color: palette.muted, lineHeight: 18 }, metricValue: { fontSize: 27, fontWeight: '800', marginVertical: 5 },
  metricDetail: { fontSize: 10, lineHeight: 16, color: palette.muted },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1f4f7', gap: 12 },
  rowLabel: { flex: 1, color: palette.muted, fontSize: 13 }, rowValue: { color: palette.ink, fontSize: 14, fontWeight: '700', flexShrink: 1, maxWidth: '60%', textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 8, gap: 8 }, emptyTitle: { color: palette.ink, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  button: { backgroundColor: palette.teal, borderRadius: 11, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '700', flexShrink: 1 },
  error: { backgroundColor: '#fff0ef', borderRadius: 14, padding: 16, gap: 8 }, errorText: { color: '#a12c33', fontSize: 13, lineHeight: 20 },
  loading: { padding: 40, alignItems: 'center', gap: 14 }, footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  liveDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: palette.green }, footerText: { color: palette.muted, fontSize: 10 },
  note: { padding: 13, borderRadius: 10, backgroundColor: palette.panel, marginTop: 12 },
});
