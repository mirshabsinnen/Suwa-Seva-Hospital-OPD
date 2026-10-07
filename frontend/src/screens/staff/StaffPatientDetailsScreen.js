import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';
import { useToast } from '../../context/ToastContext';

const StaffPatientDetailsScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getQueuePatient(queueId);
      if (response.success) {
        setPatientData(response.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      setError('Unable to load patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPatient = async () => {
    try {
      setSubmitting(true);
      const response = await staffApi.callPatient(queueId);
      if (response.success) {
        setSubmitting(false);
        showToast({
          type: 'success',
          title: 'Patient Called ✓',
          message: `Token ${patientData?.queue?.tokenNumber || ''} has been successfully called for consultation.`,
          duration: 4000,
        });
        setTimeout(() => navigation.replace('StaffActiveConsultation'), 400);
      }
    } catch (err) {
      setSubmitting(false);
      showToast({ type: 'error', title: 'Error', message: 'Failed to call patient. Please try again.' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatientDetails();
    }, [queueId])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a3d62" />
        <Text style={styles.loadingText}>Fetching patient details...</Text>
      </View>
    );
  }

  if (error || !patientData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPatientDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { queue, appointment } = patientData;
  const isArrived = queue.arrivalStatus === 'Arrived';
  const isWaiting = queue.status === 'waiting';
  
  return (
    <ScrollView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        
        {/* Token Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Token Number</Text>
          <Text style={styles.tokenNumber}>{queue.tokenNumber}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{queue.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>General Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient Name</Text>
            <Text style={styles.infoValue}>{queue.patientId?.fullName || 'N/A'}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Appointment Date</Text>
            <Text style={styles.infoValue}>
              {new Date(appointment.appointmentDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{appointment.appointmentTime}</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Queue Position</Text>
            <Text style={styles.highlightValue}>{queue.queuePosition}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority</Text>
            <Text style={[styles.infoValue, (queue.priority === 'Priority' || queue.priority === 'Emergency') && styles.priorityText]}>
              {queue.priority}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Arrival Status</Text>
            <Text style={[styles.infoValue, isArrived && styles.arrivedText]}>
              {queue.arrivalStatus}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Queue Actions</Text>
          
          {isWaiting && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton, submitting && { opacity: 0.7 }]}
              onPress={handleCallPatient}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Call Patient Now</Text>
              )}
            </TouchableOpacity>
          )}

          {!isArrived && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => navigation.navigate('StaffConfirmArrival', { queueId: queue._id })}
            >
              <Text style={styles.actionButtonText}>Confirm Physical Arrival</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('StaffPriorityManagement', { queueId: queue._id })}
          >
            <Text style={styles.actionButtonText}>Manage Priority</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.outlineButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.outlineButtonText}>Back to Queue</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.spacer} />

      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#555', fontSize: 16 },
  errorText: { color: '#c0392b', fontSize: 16, marginBottom: 15, textAlign: 'center', paddingHorizontal: 20 },
  retryButton: { backgroundColor: '#0a3d62', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  
  headerCard: {
    backgroundColor: '#0a3d62',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: { color: '#bdc3c7', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  tokenNumber: { color: '#fff', fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  statusBadgeText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  infoLabel: { color: '#7f8c8d', fontSize: 15 },
  infoValue: { color: '#2c3e50', fontSize: 15, fontWeight: '500' },
  highlightValue: { color: '#0a3d62', fontSize: 18, fontWeight: 'bold' },
  priorityText: { color: '#c0392b', fontWeight: 'bold' },
  arrivedText: { color: '#27ae60', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#ecf0f1', marginVertical: 10 },

  actionsContainer: { marginHorizontal: 20 },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: { backgroundColor: '#2980b9' },
  callButton: { backgroundColor: '#27ae60' },
  secondaryButton: { backgroundColor: '#e67e22' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#7f8c8d', shadowOpacity: 0, elevation: 0 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButtonText: { color: '#7f8c8d', fontSize: 16, fontWeight: 'bold' },
  
  spacer: { height: 40 }
});

export default StaffPatientDetailsScreen;
