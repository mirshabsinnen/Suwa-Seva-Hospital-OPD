import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const AppointmentConfirmationScreen = ({ route, navigation }) => {
  const { hospital, opd, date, time } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await api.post('/appointments', {
        hospitalId: hospital._id,
        opdId: opd._id,
        appointmentDate: date,
        appointmentTime: time
      });

      navigation.reset({
        index: 1,
        routes: [
          { name: 'Main' },
          { name: 'QueueToken', params: { appointment: response.data.appointment, queueToken: response.data.queueToken, queueId: response.data.queueId } }
        ],
      });
    } catch (error) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Something went wrong');
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 15 },
  
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#005A71', marginBottom: 15 },
  detailText: { fontSize: 15, color: '#333', marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  
  warningCard: { backgroundColor: '#eef6f9', borderRadius: 10, padding: 15, flexDirection: 'row', alignItems: 'center' },
  warningText: { flex: 1, color: '#005A71', fontSize: 13, lineHeight: 20 },

  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { backgroundColor: '#005A71', padding: 15, borderRadius: 10, alignItems: 'center' },
  confirmButtonDisabled: { backgroundColor: '#005A7180' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AppointmentConfirmationScreen;
