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

const StaffConfirmArrivalScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getQueuePatient(queueId);
      if (response.success) {
        setQueueData(response.data.queue);
      }
    } catch (err) {
      setError('Unable to fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [queueId])
  );

  const handleConfirmArrival = async () => {
    try {
      setSubmitting(true);
      const response = await staffApi.confirmArrival(queueId);
      if (response.success) {
        Alert.alert(
          "Update Successful",
          "Patient arrival confirmed successfully!",
          [
            { text: "OK", onPress: () => navigation.navigate('StaffTodayQueue') }
          ]
        );
      }
    } catch (err) {
      Alert.alert("Error", "Unable to update patient status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a3d62" />
      </View>
    );
  }

  if (error || !queueData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.warningHeader}>
          <Text style={styles.warningTitle}>Confirm Patient Arrival</Text>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.questionText}>
            Are you sure you want to confirm the physical arrival of this patient?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Token Number:</Text>
            <Text style={styles.tokenText}>{queueData.tokenNumber}</Text>
            
            <Text style={styles.infoLabel}>Patient Name:</Text>
            <Text style={styles.nameText}>{queueData.patientId?.fullName || 'N/A'}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleConfirmArrival}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Yes, Confirm Arrival</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
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
  container: { flex: 1, backgroundColor: '#f4f6f8', justifyContent: 'center', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#c0392b', fontSize: 16, marginBottom: 15 },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden'
  },
  warningHeader: {
    backgroundColor: '#f39c12',
    padding: 20,
    alignItems: 'center'
  },
  warningTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardBody: { padding: 20 },
  questionText: { fontSize: 16, color: '#34495e', textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  
  infoBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 25, alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#7f8c8d', marginBottom: 5, marginTop: 10 },
  tokenText: { fontSize: 32, fontWeight: 'bold', color: '#0a3d62' },
  nameText: { fontSize: 18, color: '#2c3e50', fontWeight: '500' },

  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: { backgroundColor: '#27ae60' },
  cancelButton: { backgroundColor: 'transparent' },
  disabledButton: { opacity: 0.7 },
  
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButtonText: { color: '#7f8c8d', fontSize: 16, fontWeight: 'bold' },
  
  outlineButton: { borderWidth: 1, borderColor: '#7f8c8d', padding: 10, borderRadius: 8 },
  outlineButtonText: { color: '#7f8c8d' }
});

export default StaffConfirmArrivalScreen;
