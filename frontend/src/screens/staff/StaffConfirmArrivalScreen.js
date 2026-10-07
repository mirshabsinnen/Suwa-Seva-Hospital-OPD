import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, Platform, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';
import { useToast } from '../../context/ToastContext';

const THEME = '#0a3d62';

const StaffConfirmArrivalScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getQueuePatient(queueId);
      if (response.success) {
        setQueueData(response.data.queue);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        ]).start();
      }
    } catch (err) {
      setError('Unable to fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDetails(); }, [queueId]));

  const handleConfirmArrival = async () => {
    try {
      setSubmitting(true);
      const response = await staffApi.confirmArrival(queueId);
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Arrival Confirmed ✓',
          message: `${queueData?.patientId?.fullName || 'Patient'} (Token: ${queueData?.tokenNumber}) has been marked as arrived.`,
          duration: 4000,
        });
        setTimeout(() => navigation.navigate('StaffTodayQueue'), 600);
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Unable to confirm patient arrival. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME} />
        <Text style={styles.loadingText}>Loading patient details...</Text>
      </View>
    );
  }

  if (error || !queueData) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={50} color="#bdc3c7" />
        <Text style={styles.errorText}>{error || 'Patient not found.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          {/* Header Icon */}
          <View style={styles.iconHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={36} color={THEME} />
            </View>
            <Text style={styles.cardTitle}>Confirm Arrival</Text>
            <Text style={styles.cardSub}>Verify that this patient is physically present at the OPD</Text>
          </View>

          {/* Patient Info */}
          <View style={styles.patientBox}>
            <View style={styles.tokenRow}>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenText}>{queueData.tokenNumber}</Text>
              </View>
              <View style={[
                styles.priorityBadge,
                queueData.priority === 'Emergency' && { backgroundColor: '#fdf0ef' },
                queueData.priority === 'Priority' && { backgroundColor: '#fef6ee' },
              ]}>
                <Text style={[
                  styles.priorityText,
                  queueData.priority === 'Emergency' && { color: '#e74c3c' },
                  queueData.priority === 'Priority' && { color: '#e67e22' },
                ]}>
                  {queueData.priority}
                </Text>
              </View>
            </View>

            <Text style={styles.patientName}>
              {queueData.patientId?.fullName || 'Unknown Patient'}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={14} color="#95a5a6" />
                <Text style={styles.infoText}>Position #{queueData.queuePosition}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={14} color="#95a5a6" />
                <Text style={styles.infoText}>~{queueData.estimatedWaitingTime} min wait</Text>
              </View>
            </View>

            <View style={[
              styles.statusRow,
              { backgroundColor: queueData.arrivalStatus === 'Arrived' ? '#edfbf0' : '#fef6ee' }
            ]}>
              <Ionicons
                name={queueData.arrivalStatus === 'Arrived' ? 'checkmark-circle' : 'time'}
                size={16}
                color={queueData.arrivalStatus === 'Arrived' ? '#27ae60' : '#e67e22'}
              />
              <Text style={[
                styles.statusText,
                { color: queueData.arrivalStatus === 'Arrived' ? '#27ae60' : '#e67e22' }
              ]}>
                {queueData.arrivalStatus === 'Arrived' ? 'Already Arrived' : 'Not Yet Arrived'}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          {queueData.arrivalStatus === 'Arrived' ? (
            <View style={styles.alreadyBox}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.alreadyText}>This patient has already been confirmed.</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
              onPress={handleConfirmArrival}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.confirmText}>Yes, Confirm Arrival</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { marginTop: 12, color: THEME, fontSize: 15 },
  errorText: { color: '#7f8c8d', fontSize: 14, marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: THEME, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  iconHeader: {
    backgroundColor: '#e8f0f7',
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dde8f0',
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1a2b3c', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#7f8c8d', textAlign: 'center', lineHeight: 18 },

  patientBox: { padding: 22 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  tokenBadge: {
    backgroundColor: THEME,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 12,
  },
  tokenText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  priorityBadge: {
    backgroundColor: '#edfbf0',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10,
  },
  priorityText: { color: '#27ae60', fontSize: 12, fontWeight: '700' },
  patientName: { fontSize: 22, fontWeight: '800', color: '#1a2b3c', marginBottom: 10 },
  infoRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { fontSize: 13, color: '#7f8c8d' },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
  },
  statusText: { fontSize: 13, fontWeight: '700' },

  alreadyBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 22, marginBottom: 10,
    backgroundColor: '#edfbf0',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14,
  },
  alreadyText: { color: '#27ae60', fontWeight: '600', fontSize: 14 },

  confirmBtn: {
    backgroundColor: THEME,
    marginHorizontal: 22, marginBottom: 12,
    paddingVertical: 15, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: {
    marginHorizontal: 22, marginBottom: 22,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelText: { color: '#95a5a6', fontSize: 15, fontWeight: '600' },
});

export default StaffConfirmArrivalScreen;
