import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import api from '../services/api';

export default function PatientFeedback({ appointmentId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setSaved(null);
    api.get(`/feedback/${appointmentId}`, { signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setSaved(response.data.data); })
      .catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.message || 'Unable to load feedback. Please retry.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [appointmentId, retry]);
  const submit = async () => {
    if (lock.current || !rating) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const response = await api.post(`/feedback/${appointmentId}`, { rating, comment: comment.trim() });
      setSaved(response.data.data);
    } catch (e) {
      if (e.response?.status === 409) setRetry(value => value + 1);
      else setError(e.response?.data?.message || 'Unable to submit feedback. Please try again.');
    } finally { lock.current = false; setBusy(false); }
  };
  return <View style={s.box}>
    <Text style={s.title}>Your visit feedback</Text>
    {loading ? <ActivityIndicator color="#005A71" /> : saved ? <>
      <Text style={s.text}>Thank you! Your rating: {saved.rating}/5</Text>
      {saved.comment ? <Text style={s.text}>{saved.comment}</Text> : null}
    </> : <>
      <Text style={s.text}>How was your OPD experience? 1 = Poor, 5 = Excellent.</Text>
      <View style={s.row}>{[1, 2, 3, 4, 5].map(value => <TouchableOpacity key={value}
        accessibilityRole="radio" accessibilityLabel={`${value} out of 5`} accessibilityState={{ checked: rating === value, disabled: busy }}
        disabled={busy} onPress={() => setRating(value)} style={[s.choice, rating === value && s.selected]}>
        <Text style={{ color: rating === value ? '#fff' : '#005A71' }}>{value}</Text>
      </TouchableOpacity>)}</View>
      <Text style={s.text}>Optional comment. Do not include names or medical details. HIO reports show aggregate ratings only.</Text>
      <TextInput accessibilityLabel="Feedback comment" multiline maxLength={1000} editable={!busy} value={comment}
        onChangeText={setComment} placeholder="Tell us about the service" style={s.input} />
      <TouchableOpacity accessibilityRole="button" disabled={!rating || busy} onPress={submit} style={[s.button, (!rating || busy) && { opacity: 0.5 }]}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>{busy ? 'Submitting...' : 'Submit Feedback'}</Text>
      </TouchableOpacity>
    </>}
    {error ? <><Text accessibilityRole="alert" style={{ color: '#b73535' }}>{error}</Text>
      <TouchableOpacity accessibilityRole="button" disabled={busy || loading} onPress={() => setRetry(value => value + 1)}><Text style={s.text}>Reload feedback</Text></TouchableOpacity></> : null}
  </View>;
}
const s = StyleSheet.create({
  box: { borderTopWidth: 1, borderColor: '#E5ECF0', paddingTop: 12, gap: 10 },
  title: { fontWeight: '700', color: '#005A71', fontSize: 15 }, text: { color: '#526773', lineHeight: 20 },
  row: { flexDirection: 'row', gap: 8 }, choice: { minWidth: 44, minHeight: 44, borderRadius: 8, backgroundColor: '#eef4f8', alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: '#005A71' }, input: { borderWidth: 1, borderColor: '#ccd8e0', borderRadius: 8, padding: 12, minHeight: 85, textAlignVertical: 'top', color: '#1a2b3c' },
  button: { backgroundColor: '#005A71', borderRadius: 8, padding: 13, alignItems: 'center' },
});
