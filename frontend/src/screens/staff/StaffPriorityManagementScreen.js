import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';
import { useToast } from '../../context/ToastContext';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, HeartbeatDot } from '../../components/MedicalAnimations';

const THEME = '#005A71';

const StaffPriorityManagementScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const { showToast } = useToast();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getQueuePatient(queueId);
      if (response.success) {
        setQueueData(response.data.queue);
        setSelectedPriority(response.data.queue.priority);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to load patient details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [queueId])
  );

  const handleConfirmPriority = async () => {
    if (selectedPriority === queueData.priority) {
      Alert.alert('Notice', 'Priority is already set to ' + selectedPriority);
      return;
    }

    try {
      setSubmitting(true);
      const response = await staffApi.updatePriority(queueId, selectedPriority);
      if (response.success) {
        showToast({
          type: selectedPriority === 'Emergency' ? 'error' : selectedPriority === 'Priority' ? 'warning' : 'success',
          title: 'Priority Updated ✓',
          message: `${queueData?.patientId?.fullName || 'Patient'}'s priority has been set to ${selectedPriority}.`,
          duration: 4000,
        });
        setTimeout(() => navigation.replace('StaffQueueUpdated', { queue: response.data, oldPosition: queueData.queuePosition }), 400);
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Update Failed', message: 'Unable to update priority. Please try again.' });
      setSubmitting(false);
    }
  };

  if (loading || !queueData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005A71" />
        <Text style={styles.loadingText}>Loading queue position...</Text>
      </View>
    );
  }

  // Basic preview logic: if emergency/priority, proposed pos is 1, else it stays same (in prototype)
  let proposedPosition = queueData.queuePosition;
  if (selectedPriority === 'Emergency' || selectedPriority === 'Priority') {
    proposedPosition = 1;
  }
  
  const isChanged = selectedPriority !== queueData.priority;

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Priority Management</Text>
      <Text style={styles.disclaimerText}>
        * Priority categories here are for prototype purposes and do not represent official triage standards.
      </Text>
      
      <View style={styles.card}>
        <View style={styles.patientInfo}>
          <Text style={styles.label}>Patient:</Text>
          <Text style={styles.value}>{queueData.patientId?.fullName || 'N/A'}</Text>
          <Text style={styles.label}>Token:</Text>
          <Text style={styles.tokenValue}>{queueData.tokenNumber}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select New Priority:</Text>
        
        <View style={styles.priorityOptions}>
          {['Normal', 'Priority', 'Emergency'].map((prio) => (
            <TouchableOpacity 
              key={prio}
              style={[
                styles.optionButton, 
                selectedPriority === prio && styles.optionSelected,
                selectedPriority === prio && prio === 'Emergency' && styles.emergencySelected
              ]}
              onPress={() => setSelectedPriority(prio)}
            >
              <Text style={[
                styles.optionText, 
                selectedPriority === prio && styles.optionTextSelected
              ]}>
                {prio}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isChanged && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Impact Preview</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Current Position:</Text>
              <Text style={styles.previewOldValue}>{queueData.queuePosition}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Proposed Position:</Text>
              <Text style={styles.previewNewValue}>{proposedPosition}</Text>
            </View>
          </View>
        )}

        {isChanged && (
          <TouchableOpacity 
            style={[styles.confirmButton, submitting && styles.disabledButton]}
            onPress={handleConfirmPriority}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Priority Change?</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 10, color: '#0F2A38' },
  
  pageTitle: { fontSize: 22, fontWeight: '800', color: THEME, marginBottom: 4 },
  disclaimerText: { fontSize: 12, color: '#64748B', fontStyle: 'italic', marginBottom: 20 },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  patientInfo: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 15, marginBottom: 20 },
  label: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  value: { fontSize: 17, color: '#0F2A38', fontWeight: '700', marginBottom: 10 },
  tokenValue: { fontSize: 30, color: THEME, fontWeight: '900' },
  
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F2A38', marginBottom: 14 },
  priorityOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  optionButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, alignItems: 'center', marginHorizontal: 4, backgroundColor: '#F8FAFC' },
  optionSelected: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  emergencySelected: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  optionText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  optionTextSelected: { color: '#fff' },
  
  previewBox: { backgroundColor: 'rgba(0, 90, 113, 0.06)', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0, 90, 113, 0.15)' },
  previewTitle: { fontSize: 15, fontWeight: '700', color: THEME, marginBottom: 10, textAlign: 'center' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  previewLabel: { fontSize: 14, color: '#0F2A38' },
  previewOldValue: { fontSize: 16, color: '#94A3B8', textDecorationLine: 'line-through' },
  previewNewValue: { fontSize: 22, color: '#10B981', fontWeight: '800' },

  confirmButton: { backgroundColor: '#10B981', paddingVertical: 15, borderRadius: 12, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  disabledButton: { opacity: 0.7 },
  confirmButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});

export default StaffPriorityManagementScreen;
