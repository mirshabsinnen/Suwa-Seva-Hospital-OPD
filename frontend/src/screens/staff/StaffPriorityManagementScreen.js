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

const StaffPriorityManagementScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);

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
        // Navigate to the Success Screen passing the updated data
        navigation.replace('StaffQueueUpdated', { queue: response.data, oldPosition: queueData.queuePosition });
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to update priority. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !queueData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a3d62" />
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
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#555' },
  
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#0a3d62', marginBottom: 5 },
  disclaimerText: { fontSize: 12, color: '#7f8c8d', fontStyle: 'italic', marginBottom: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  patientInfo: { borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingBottom: 15, marginBottom: 20 },
  label: { fontSize: 14, color: '#7f8c8d' },
  value: { fontSize: 18, color: '#2c3e50', fontWeight: 'bold', marginBottom: 10 },
  tokenValue: { fontSize: 28, color: '#0a3d62', fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#34495e', marginBottom: 15 },
  priorityOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  optionButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  optionSelected: { backgroundColor: '#f39c12', borderColor: '#f39c12' },
  emergencySelected: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  optionText: { color: '#7f8c8d', fontWeight: 'bold' },
  optionTextSelected: { color: '#fff' },
  
  previewBox: { backgroundColor: '#e8f4f8', borderRadius: 10, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#b6dce8' },
  previewTitle: { fontSize: 16, fontWeight: 'bold', color: '#0a3d62', marginBottom: 10, textAlign: 'center' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  previewLabel: { fontSize: 15, color: '#34495e' },
  previewOldValue: { fontSize: 18, color: '#7f8c8d', textDecorationLine: 'line-through' },
  previewNewValue: { fontSize: 24, color: '#27ae60', fontWeight: 'bold' },

  confirmButton: { backgroundColor: '#27ae60', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  disabledButton: { opacity: 0.7 },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default StaffPriorityManagementScreen;
