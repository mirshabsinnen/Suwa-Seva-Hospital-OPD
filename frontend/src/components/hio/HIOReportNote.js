import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import hioApi from '../../services/hioApi';
import useHioResource from './useHioResource';
import HIODateFilter, { colomboToday } from './HIODateFilter';
import { SectionCard, Badge } from './HIOUI';

const statuses = { draft: 'Draft', reviewed: 'Reviewed', needs_attention: 'Needs Attention' };
export default function HIOReportNote({ year, month }) {
  const resource = useHioResource(useCallback(signal => hioApi.getReportNote(year, month, { signal }), [year, month]));
  const notes = Array.isArray(resource.data) ? resource.data : [];
  const [observationDate, setObservationDate] = useState(colomboToday());
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('draft');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const validObservation = observationDate.startsWith(`${year}-${String(month).padStart(2, '0')}-`) && observationDate <= colomboToday();
  const lock = useRef(false);
  const editId = useRef(null);
  const message = e => e.response?.data?.message || 'Unable to save your changes. Check your connection and try again.';
  const open = (saved = null) => {
    const reportMonth = `${year}-${String(month).padStart(2, '0')}`;
    setObservationDate(saved?.observationDate || (colomboToday().startsWith(reportMonth) ? colomboToday() : `${reportMonth}-01`));
    editId.current = saved?._id || null;
    setText(saved?.note || ''); setStatus(saved?.reviewStatus || 'draft'); setError(''); setSuccess(''); setEditing(true);
  };
  const save = async () => {
    if (lock.current || !validObservation || !text.trim() || text.trim().length > 1000) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const payload = { note: text.trim(), reviewStatus: status, observationDate };
      if (editId.current) await hioApi.updateReportNote(editId.current, payload);
      else await hioApi.createReportNote({ ...payload, year: Number(year), month: Number(month) });
      setEditing(false); setSuccess('Review note saved.'); await resource.refresh();
    } catch (e) { setError(message(e)); }
    finally { lock.current = false; setBusy(false); }
  };
  const remove = (id) => {
    if (!id || lock.current) return;
    Alert.alert('Delete review note?', 'This will remove the HIO review note for this monthly report.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (lock.current) return;
        lock.current = true; setBusy(true); setError(''); setSuccess('');
        try { await hioApi.deleteReportNote(id); setSuccess('Review note deleted.'); await resource.refresh(); }
        catch (e) { setError(message(e)); }
        finally { lock.current = false; setBusy(false); }
      } },
    ]);
  };
  const button = (label, onPress, disabled = false, danger = false) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, danger && s.danger, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{label}</Text></TouchableOpacity>;
  return <SectionCard title="HIO Review Notes" subtitle="Your administrative observation for this month. Do not include patient names or medical information." icon="create-outline">
    {resource.loading || resource.refreshing || busy ? <ActivityIndicator color="#005A71" /> : null}
    {resource.error ? <View><Text accessibilityRole="alert" style={s.error}>{resource.error}</Text>{button('Retry loading note', resource.refresh, resource.refreshing)}</View> : resource.loading ? null : <>
      {notes.length ? notes.map(saved => <View key={saved._id} style={{ borderBottomWidth: 1, borderBottomColor: '#e4ebf2', paddingBottom: 14, marginBottom: 14 }}>
        <Text style={s.caption}>Observation date: {saved.observationDate || "Not recorded (existing note)"}</Text>
        <View style={{ alignSelf: 'flex-start' }}><Badge tone={saved.reviewStatus === 'reviewed' ? 'green' : saved.reviewStatus === 'needs_attention' ? 'amber' : 'blue'}>{statuses[saved.reviewStatus] || 'Draft'}</Badge></View>
        <Text selectable style={s.note}>{saved.note}</Text>
        {saved.createdAt ? <Text style={s.caption}>Saved: {new Date(saved.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Colombo' })} (Asia/Colombo)</Text> : null}
        {saved.updatedAt ? <Text style={s.caption}>Last updated: {new Date(saved.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Colombo' })} (Asia/Colombo)</Text> : null}
        <View style={s.row}>{button('Edit Note', () => open(saved), busy || resource.refreshing)}{button('Delete', () => remove(saved._id), busy || resource.refreshing, true)}</View>
      </View>) : <Text style={s.note}>No review notes have been added for this report.</Text>}
      {button('Add Review Note', () => open(), busy || resource.refreshing)}
    </>}
    {!editing && error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    {success ? <Text accessibilityLiveRegion="polite" style={s.success}>{success}</Text> : null}
    <Modal visible={editing} animationType="slide" onRequestClose={() => { if (!busy) setEditing(false); }}>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.form}>
            <Text accessibilityRole="header" style={s.title}>{editId.current ? 'Edit Review Note' : 'Add Review Note'}</Text>
            <Text style={s.caption}>{year}-{String(month).padStart(2, '0')} · Administrative observations only</Text>
            <HIODateFilter title="Observation date" selection={observationDate} date={observationDate} onChange={value => setObservationDate(value === "today" ? colomboToday() : value === "yesterday" ? new Date(Date.parse(`${colomboToday()}T00:00:00Z`) - 86400000).toISOString().slice(0, 10) : value)} />
            <Text style={s.caption}>Choose a date within this report month. Saved time is recorded automatically.</Text>
            {!validObservation ? <Text style={s.error}>Select a date within this report month, no later than today.</Text> : null}
            <Text style={s.label}>Review Note</Text>
            <TextInput accessibilityLabel="Review Note" multiline textAlignVertical="top" maxLength={1000} value={text} onChangeText={setText} editable={!busy} placeholder="Record your operational observations…" style={s.input} />
            <Text style={s.caption}>{text.length}/1000 characters</Text>
            {!text.trim() ? <Text style={s.caption}>Enter a review note to save.</Text> : null}
            <Text style={s.label}>Review Status</Text>
            <View style={s.statuses}>{Object.entries(statuses).map(([value, label]) => <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ checked: status === value, disabled: busy }} disabled={busy} onPress={() => setStatus(value)} style={[s.choice, status === value && s.selected]}><Text style={{ color: status === value ? '#fff' : '#005A71', fontWeight: '600' }}>{label}</Text></TouchableOpacity>)}</View>
            {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
            {busy ? <ActivityIndicator color="#005A71" /> : null}
            <View style={s.row}>{button('Cancel', () => setEditing(false), busy)}{button(busy ? 'Saving…' : editId.current ? 'Save Changes' : 'Save Note', save, busy || !text.trim() || !validObservation)}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  </SectionCard>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' }, form: { padding: 20, flexGrow: 1 },
  title: { color: '#0A3D62', fontSize: 22, fontWeight: '700' }, label: { color: '#0A3D62', fontSize: 15, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  input: { minHeight: 170, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccd8e0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1a2b3c' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }, statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: '#005A71', padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 4 }, buttonText: { color: '#fff', fontWeight: '700' }, danger: { backgroundColor: '#b73535' },
  choice: { backgroundColor: '#e4edf2', padding: 12, borderRadius: 10 }, selected: { backgroundColor: '#005A71' },
  note: { fontSize: 15, lineHeight: 23, color: '#1a2b3c', marginVertical: 12 }, caption: { fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 18 },
  error: { color: '#b73535', marginVertical: 10 }, success: { color: '#16845b', marginTop: 10 },
});
