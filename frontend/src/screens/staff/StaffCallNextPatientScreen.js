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
import staffApi from '../../../services/staffApi';

const StaffCallNextPatientScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextPatient, setNextPatient] = useState(null);
  const [error, setError] = useState(null);

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
        // Navigate to Active Consultation Screen
        navigation.replace('StaffActiveConsultation');
      }
    } catch (err) {
      Alert.alert("Error", "Failed to call patient. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a3d62" />
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
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20, justifyContent: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 15, color: '#0a3d62', fontSize: 16, fontWeight: '500' },
  errorText: { color: '#c0392b', fontSize: 16, marginBottom: 15 },
  retryButton: { backgroundColor: '#0a3d62', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  
  emptyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d4edda', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyIcon: { color: '#155724', fontSize: 40, fontWeight: 'bold' },
  emptyText: { fontSize: 18, color: '#2c3e50', marginBottom: 20, textAlign: 'center' },
  
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#0a3d62', marginBottom: 20, textAlign: 'center' },
  
  card: { backgroundColor: '#fff', borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5, overflow: 'hidden' },
  cardHeader: { backgroundColor: '#0a3d62', padding: 15, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  cardBody: { padding: 20, alignItems: 'center' },
  tokenCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e8f4f8', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#0a3d62', marginBottom: 15 },
  tokenText: { fontSize: 36, fontWeight: 'bold', color: '#0a3d62' },
  patientName: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  
  detailsBox: { width: '100%', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  detailLabel: { fontSize: 15, color: '#7f8c8d' },
  detailValue: { fontSize: 15, color: '#2c3e50', fontWeight: 'bold' },
  urgentText: { color: '#c0392b' },

  confirmationQuestion: { fontSize: 18, fontWeight: 'bold', color: '#e67e22', marginBottom: 20 },

  primaryButton: { backgroundColor: '#27ae60', width: '100%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
  
  cancelButton: { width: '100%', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  cancelButtonText: { color: '#7f8c8d', fontSize: 16, fontWeight: 'bold' },
  
  secondaryButton: { backgroundColor: 'transparent', width: '100%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#0a3d62' },
  secondaryButtonText: { color: '#0a3d62', fontSize: 16, fontWeight: 'bold' }
});

export default StaffCallNextPatientScreen;
