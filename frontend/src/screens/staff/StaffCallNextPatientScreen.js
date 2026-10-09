import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';
import { useToast } from '../../context/ToastContext';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, HeartbeatDot } from '../../components/MedicalAnimations';

const THEME = '#005A71';

const StaffCallNextPatientScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextPatient, setNextPatient] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const fetchNextPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getNextPatient();
      if (response.success && response.data) {
        setNextPatient(response.data);
      } else {
        setNextPatient(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNextPatient(null);
      } else {
        setError('Unable to fetch next patient.');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNextPatient();
    }, [])
  );

  const handleCallPatient = async () => {
    try {
      setSubmitting(true);
      const response = await staffApi.callPatient(nextPatient._id);
      if (response.success) {
        setSubmitting(false);
        showToast({
          type: 'success',
          title: 'Patient Called ✓',
          message: `Token ${nextPatient.tokenNumber} has been successfully called for consultation.`,
          duration: 4000,
        });
        setTimeout(() => navigation.replace('StaffActiveConsultation'), 400);
      }
    } catch (err) {
      setSubmitting(false);
      showToast({ type: 'error', title: 'Error', message: 'Failed to call patient. Please try again.' });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005A71" />
        <Text style={styles.loadingText}>Finding next appropriate patient...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNextPatient}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!nextPatient) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyCircle}>
          <Text style={styles.emptyIcon}>✓</Text>
        </View>
        <Text style={styles.emptyText}>No patients are currently waiting.</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Call Next Patient</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.headerTitle}>System Recommended Next Patient</Text>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.tokenCircle}>
            <Text style={styles.tokenText}>{nextPatient.tokenNumber}</Text>
          </View>
          
          <Text style={styles.patientName}>{nextPatient.patientId?.fullName || 'N/A'}</Text>
          
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Queue Position:</Text>
              <Text style={styles.detailValue}>{nextPatient.queuePosition}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority:</Text>
              <Text style={[styles.detailValue, (nextPatient.priority === 'Emergency' || nextPatient.priority === 'Priority') && styles.urgentText]}>
                {nextPatient.priority}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Status:</Text>
              <Text style={styles.detailValue}>{nextPatient.status}</Text>
            </View>
          </View>

          <Text style={styles.confirmationQuestion}>
            Call Token {nextPatient.tokenNumber}?
          </Text>

          <TouchableOpacity 
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleCallPatient}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Yes, Call Patient</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, justifyContent: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 15, color: THEME, fontSize: 16, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 15, marginBottom: 15 },
  retryButton: { backgroundColor: THEME, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  
  emptyCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#A7F3D0' },
  emptyIcon: { color: '#10B981', fontSize: 36, fontWeight: 'bold' },
  emptyText: { fontSize: 18, color: '#0F2A38', marginBottom: 20, textAlign: 'center', fontWeight: '700' },
  
  pageTitle: { fontSize: 24, fontWeight: '800', color: THEME, marginBottom: 20, textAlign: 'center' },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: THEME, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, overflow: 'hidden' },
  cardHeader: { backgroundColor: THEME, padding: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  cardBody: { padding: 22, alignItems: 'center' },
  tokenCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(0, 90, 113, 0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: THEME, marginBottom: 15 },
  tokenText: { fontSize: 36, fontWeight: '900', color: THEME },
  patientName: { fontSize: 22, fontWeight: '800', color: '#0F2A38', marginBottom: 20 },
  
  detailsBox: { width: '100%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  detailLabel: { fontSize: 14, color: '#64748B' },
  detailValue: { fontSize: 14, color: '#0F2A38', fontWeight: '700' },
  urgentText: { color: '#EF4444' },

  confirmationQuestion: { fontSize: 17, fontWeight: '700', color: '#F59E0B', marginBottom: 20 },

  primaryButton: { backgroundColor: '#10B981', width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 12, shadowColor: '#10B981', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.7 },
  
  cancelButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  
  secondaryButton: { backgroundColor: 'transparent', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: THEME },
  secondaryButtonText: { color: THEME, fontSize: 15, fontWeight: '700' }
});

export default StaffCallNextPatientScreen;
