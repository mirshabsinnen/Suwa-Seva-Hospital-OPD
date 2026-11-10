import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DateSlotSelectionScreen = ({ route, navigation }) => {
  const { hospital, opd, doctor } = route.params;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Dates for appointment booking (today + next 6 days)
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };
  const availableDates = generateDates();

  const availableSlots = [
    { id: '1', time: '08:00 AM', status: 'available' },
    { id: '2', time: '08:30 AM', status: 'unavailable' },
    { id: '3', time: '09:00 AM', status: 'available' },
    { id: '4', time: '09:30 AM', status: 'available' },
    { id: '5', time: '10:00 AM', status: 'available' },
    { id: '6', time: '10:30 AM', status: 'unavailable' },
    { id: '7', time: '11:00 AM', status: 'available' },
    { id: '8', time: '11:30 AM', status: 'available' },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset slot
  };

  const handleSlotSelect = (slot) => {
    if (slot.status === 'unavailable') return;
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Selection Required', 'Please select a date and a time slot');
      return;
    }
    navigation.navigate('AppointmentConfirmation', {
      hospital,
      opd,
      doctor,
      date: selectedDate,
      time: selectedSlot.time
    });
  };

  const formatDate = (dateStr) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (dateStr === todayStr) {
      return 'Today';
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.infoText}>Hospital: {hospital.name}</Text>
        <Text style={styles.infoText}>OPD: {opd.name}</Text>
        <Text style={styles.infoText}>Doctor: Dr. {doctor.fullName}</Text>

        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateContainer}>
          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, selectedDate === date && styles.dateCardSelected]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[styles.dateText, selectedDate === date && styles.dateTextSelected]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedDate && (
          <>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <View style={styles.slotGrid}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    slot.status === 'unavailable' && styles.slotCardUnavailable,
                    selectedSlot?.id === slot.id && styles.slotCardSelected
                  ]}
                  onPress={() => handleSlotSelect(slot)}
                  disabled={slot.status === 'unavailable'}
                >
                  <Text style={[
                    styles.slotText,
                    slot.status === 'unavailable' && styles.slotTextUnavailable,
                    selectedSlot?.id === slot.id && styles.slotTextSelected
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedDate || !selectedSlot) && styles.continueButtonDisabled]}
          disabled={!selectedDate || !selectedSlot}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Review Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  content: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  infoText: { fontSize: 14, color: '#688291', marginBottom: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#005A71', marginTop: 18, marginBottom: 12, letterSpacing: 0.3 },
  
  dateContainer: { flexDirection: 'row', marginBottom: 20 },
  dateCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginRight: 10, borderWidth: 1.5, borderColor: '#E5ECF0', minWidth: 100, alignItems: 'center' },
  dateCardSelected: { borderColor: '#005A71', backgroundColor: '#F0F7F9' },
  dateText: { fontSize: 14, color: '#1B2C36', fontWeight: '700' },
  dateTextSelected: { color: '#005A71' },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  slotCard: { width: '48%', backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#E5ECF0', alignItems: 'center' },
  slotCardUnavailable: { backgroundColor: '#F7FAFC', borderColor: '#EEF2F5', opacity: 0.6 },
  slotCardSelected: { borderColor: '#005A71', backgroundColor: '#F0F7F9' },
  slotText: { fontSize: 14, color: '#1B2C36', fontWeight: '700' },
  slotTextUnavailable: { color: '#9AAEC0' },
  slotTextSelected: { color: '#005A71' },

  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EBF1F4' },
  continueButton: { backgroundColor: '#005A71', paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: '#005A71', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  continueButtonDisabled: { backgroundColor: '#B0C8D0', elevation: 0, shadowOpacity: 0 },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});

export default DateSlotSelectionScreen;
