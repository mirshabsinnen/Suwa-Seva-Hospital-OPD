import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export const colomboToday = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
export const shiftDay = (date, offset) => new Date(Date.parse(`${date}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10);

// Keep Today relative, so polling and returning to a tab after midnight use the new day.
export function useHioDate() {
  const [selection, setSelection] = useState('today');
  const today = colomboToday();
  const date = selection === 'today' ? today : selection === 'yesterday' ? shiftDay(today, -1) : selection;
  return { selection, setSelection, date, isToday: date === today };
}

export default function HIODateFilter({ selection, date, onChange, title = "Appointment date" }) {
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(date.slice(0, 7));
  const today = colomboToday();
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const moveMonth = offset => setMonth(new Date(Date.UTC(year, monthNumber - 1 + offset, 1)).toISOString().slice(0, 7));
  const button = (label, active, onPress) => (
    <TouchableOpacity key={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[s.button, active && s.active]}>
      <Text style={[s.buttonText, active && s.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={s.card}>
      <Text style={s.title}>{title}</Text>
      <View style={s.row}>
        {button('Today', selection === 'today', () => onChange('today'))}
        {button('Yesterday', selection === 'yesterday', () => onChange('yesterday'))}
        {button('Select Date', !['today', 'yesterday'].includes(selection), () => { setMonth(date.slice(0, 7)); setVisible(true); })}
      </View>
      <Text style={s.caption}>{date} · Asia/Colombo{title === 'Appointment date' && date !== today ? '\nStored record statuses; not a historical snapshot.' : ''}</Text>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={s.overlay}>
          <View style={s.calendar} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={s.title}>Select date</Text>
            <View style={s.monthRow}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => moveMonth(-1)} style={s.arrow}><Text style={s.buttonText}>‹</Text></TouchableOpacity>
              <Text style={s.title}>{new Date(Date.UTC(year, monthNumber - 1, 15)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next month" disabled={month >= today.slice(0, 7)} onPress={() => moveMonth(1)} style={s.arrow}><Text style={s.buttonText}>›</Text></TouchableOpacity>
            </View>
            <View style={s.grid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <View key={`weekday-${i}`} style={s.day}><Text style={s.caption}>{day}</Text></View>)}
              {Array.from({ length: first }, (_, i) => <View key={`blank-${i}`} style={s.day} />)}
              {Array.from({ length: count }, (_, i) => {
                const value = `${month}-${String(i + 1).padStart(2, '0')}`;
                const disabled = value > today;
                return <TouchableOpacity key={value} accessibilityRole="button" accessibilityLabel={value} accessibilityState={{ disabled, selected: value === date }} disabled={disabled} style={[s.day, value === date && s.active, disabled && { opacity: 0.3 }]} onPress={() => { onChange(value === today ? 'today' : value); setVisible(false); }}><Text style={[s.buttonText, value === date && s.activeText]}>{i + 1}</Text></TouchableOpacity>;
              })}
            </View>
            {button('Cancel', false, () => setVisible(false))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E3EAEF', marginBottom: 14 },
  title: { fontSize: 14, fontWeight: '700', color: '#005A71' },
  row: { flexDirection: 'row', gap: 6, marginTop: 10 },
  button: { flexGrow: 1, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, backgroundColor: '#EEF4F8', alignItems: 'center' },
  active: { backgroundColor: '#005A71' },
  buttonText: { fontSize: 13, color: '#005A71', fontWeight: '600' },
  activeText: { color: '#fff' },
  caption: { fontSize: 12, color: '#64748B', marginTop: 8, lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center', padding: 20 },
  calendar: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  arrow: { padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  day: { width: '14.2857%', minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
});
