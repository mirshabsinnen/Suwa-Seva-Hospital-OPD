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
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, HeartbeatDot } from '../../components/MedicalAnimations';

const THEME = '#005A71';

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
        <ActivityIndicator size="large" color="#005A71" />
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 10, color: '#0F2A38', fontSize: 15 },
  errorText: { color: '#EF4444', fontSize: 15, marginBottom: 15, textAlign: 'center', paddingHorizontal: 20 },
  retryButton: { backgroundColor: THEME, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  
  headerCard: {
    backgroundColor: THEME,
    padding: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  tokenNumber: { color: '#fff', fontSize: 46, fontWeight: '900', marginVertical: 8 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1 },

  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F2A38', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  infoLabel: { color: '#64748B', fontSize: 14 },
  infoValue: { color: '#0F2A38', fontSize: 14, fontWeight: '600' },
  highlightValue: { color: THEME, fontSize: 17, fontWeight: '800' },
  priorityText: { color: '#EF4444', fontWeight: 'bold' },
  arrivedText: { color: '#10B981', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },

  actionsContainer: { marginHorizontal: 20 },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButton: { backgroundColor: THEME },
  callButton: { backgroundColor: '#10B981' },
  secondaryButton: { backgroundColor: '#F59E0B' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: THEME, shadowOpacity: 0, elevation: 0 },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  outlineButtonText: { color: THEME, fontSize: 15, fontWeight: '700' },
  
  spacer: { height: 40 }
});

export default StaffPatientDetailsScreen;
