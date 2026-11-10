import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const AppointmentConfirmationScreen = ({ route, navigation }) => {
  const { hospital, opd, doctor, date, time } = route.params;
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await api.post('/appointments', {
        hospitalId: hospital._id,
        opdId: opd._id,
        doctorId: doctor?._id || null,
        appointmentDate: date,
        appointmentTime: time
      });

      showToast('Appointment Confirmed Successfully!', 'success');
      
      setTimeout(() => {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Main' },
            { name: 'QueueToken', params: { appointment: response.data.appointment, queueToken: response.data.queueToken, queueId: response.data.queueId } }
          ],
        });
      }, 1500); // Give time for toast to be seen
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
      showToast('Booking Failed: ' + errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Hospital Information</Text>
          <Text style={styles.detailText}><Text style={styles.label}>Hospital: </Text>{hospital.name}</Text>
          <Text style={styles.detailText}><Text style={styles.label}>OPD: </Text>{opd.name}</Text>
          <Text style={styles.detailText}><Text style={styles.label}>Doctor: </Text>Dr. {doctor.fullName}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.detailText}><Text style={styles.label}>Date: </Text>{formatDate(date)}</Text>
          <Text style={styles.detailText}><Text style={styles.label}>Time: </Text>{time}</Text>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="information-circle-outline" size={24} color="#005A71" style={{ marginRight: 10 }} />
          <Text style={styles.warningText}>Please ensure you arrive at the hospital 15 minutes before your token is called. Your digital token will be generated on the next screen.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          disabled={loading}
          onPress={handleConfirm}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Top Right Toast Message */}
      {toastMessage && (
        <View style={[styles.toastContainer, toastType === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  content: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#005A71', marginBottom: 14 },
  detailText: { fontSize: 15, color: '#1B2C36', marginBottom: 10, lineHeight: 22 },
  label: { fontWeight: '700', color: '#688291' },
  divider: { height: 1, backgroundColor: '#EBF1F4', marginVertical: 14 },
  
  warningCard: { backgroundColor: '#F0F7F9', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D3E6ED' },
  warningText: { flex: 1, color: '#005A71', fontSize: 13, lineHeight: 19, fontWeight: '500' },

  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EBF1F4' },
  confirmButton: { backgroundColor: '#005A71', paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: '#005A71', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  confirmButtonDisabled: { backgroundColor: '#B0C8D0', elevation: 0, shadowOpacity: 0 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  toastContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  toastSuccess: {
    backgroundColor: '#28a745',
  },
  toastError: {
    backgroundColor: '#dc3545',
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default AppointmentConfirmationScreen;
