import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DateSlotSelectionScreen = ({ route, navigation }) => {
  const { hospital, opd } = route.params;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Dummy dates for demonstration (next 7 days)
  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
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
      date: selectedDate,
      time: selectedSlot.time
    });
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 15 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#005A71', marginTop: 20, marginBottom: 15 },
  
  dateContainer: { flexDirection: 'row', marginBottom: 20 },
  dateCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#e0e0e0', minWidth: 100, alignItems: 'center' },
  dateCardSelected: { borderColor: '#005A71', backgroundColor: '#eef6f9' },
  dateText: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  dateTextSelected: { color: '#005A71' },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  slotCard: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  slotCardUnavailable: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' },
  slotCardSelected: { borderColor: '#005A71', backgroundColor: '#eef6f9' },
  slotText: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  slotTextUnavailable: { color: '#aaa' },
  slotTextSelected: { color: '#005A71' },

  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  continueButton: { backgroundColor: '#005A71', padding: 15, borderRadius: 10, alignItems: 'center' },
  continueButtonDisabled: { backgroundColor: '#005A7180' },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default DateSlotSelectionScreen;
