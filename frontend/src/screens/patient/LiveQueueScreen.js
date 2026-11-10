import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { PulseView, HeartbeatDot } from '../../components/MedicalAnimations';

const LiveQueueScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  const alertedPriority = useRef(null);

  const fetchActiveQueue = async () => {
    try {
      const res = await api.get('/appointments');
      const activeAppt = res.data.find(a => a.status !== 'cancelled' && a.status !== 'completed');
      
      if (activeAppt) {
        setAppointments([activeAppt]);
        const queueRes = await api.get(`/queue/${activeAppt._id}`);
        const newQueueData = queueRes.data;
        
        if (newQueueData.priority !== 'Normal' && alertedPriority.current !== newQueueData.priority) {
          alertedPriority.current = newQueueData.priority;
          setTimeout(() => {
            if (Platform.OS === 'web') {
              window.alert(`QUEUE ESCALATED: Your queue status has been escalated to ${newQueueData.priority.toUpperCase()}. Please approach the OPD immediately.`);
            } else {
              Alert.alert(
                "Queue Status Updated",
                `Your queue status has been escalated to ${newQueueData.priority.toUpperCase()}. Please approach the OPD immediately.`
              );
            }
          }, 500);
        }
        
        setQueueData(newQueueData);
      } else {
        setQueueData(null);
      }
    } catch (error) {
      console.log('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveQueue();
      // Setup polling every 5 seconds for faster real-time updates
      const interval = setInterval(fetchActiveQueue, 5000);
      return () => clearInterval(interval);
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#005A71" />
      </SafeAreaView>
    );
  }

  if (!queueData) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="people-circle-outline" size={76} color="#B0C8D0" />
        <Text style={styles.emptyText}>You don't have any active queue right now.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Queue Tracking</Text>
        <View style={styles.liveIndicator}>
          <HeartbeatDot color="#10B981" size={8} />
          <Text style={styles.liveIndicatorText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topCard}>
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>{appointments[0]?.hospitalId?.name}</Text>
            <Text style={styles.opdName}>{appointments[0]?.opdId?.name} • Room 14</Text>
          </View>
          
          {queueData.priority && queueData.priority !== 'Normal' && (
            <View style={[styles.priorityBanner, queueData.priority === 'Emergency' ? styles.emergencyBg : styles.priorityBg]}>
              <Ionicons name="alert-circle" size={18} color={queueData.priority === 'Emergency' ? '#FFFFFF' : '#8A5300'} />
              <Text style={[styles.priorityText, queueData.priority === 'Emergency' ? styles.emergencyText : styles.priorityNormalText]}>
                QUEUE STATUS: {queueData.priority.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.tokenDisplayRow}>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
              <Text style={styles.myTokenNum}>{queueData.tokenNumber}</Text>
            </View>
            <View style={styles.servingBox}>
              <Text style={styles.tokenLabel}>CURRENTLY SERVING</Text>
              <PulseView duration={2200}>
                <Text style={styles.servingTokenNum}>{queueData.currentServingToken}</Text>
              </PulseView>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color="#005A71" />
            <Text style={styles.statValue}>{queueData.patientsAhead}</Text>
            <Text style={styles.statLabel}>Patients Ahead</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color="#005A71" />
            <Text style={styles.statValue}>{queueData.estimatedWaitingTime} min</Text>
            <Text style={styles.statLabel}>Estimated Wait</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Queue Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: queueData.patientsAhead < 5 ? '80%' : '40%' }]} />
          </View>
          <Text style={styles.progressText}>Please remain near the OPD waiting area.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  emptyText: { marginTop: 14, fontSize: 15, color: '#688291', textAlign: 'center', paddingHorizontal: 40 },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, gap: 6 },
  liveIndicatorText: { fontSize: 11, fontWeight: '700', color: '#059669', letterSpacing: 0.5 },
  content: { padding: 16, backgroundColor: '#FFFFFF' },
  
  topCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 14 },
  hospitalInfo: { alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#EBF1F4', paddingBottom: 14 },
  hospitalName: { fontSize: 17, fontWeight: '700', color: '#005A71', textAlign: 'center' },
  opdName: { fontSize: 13, color: '#688291', marginTop: 4 },
  
  priorityBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, marginBottom: 14 },
  emergencyBg: { backgroundColor: '#DC2626' },
  priorityBg: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  priorityText: { marginLeft: 6, fontWeight: '700', letterSpacing: 0.5, fontSize: 12 },
  emergencyText: { color: '#FFFFFF' },
  priorityNormalText: { color: '#8A5300' },
  
  tokenDisplayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tokenBox: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#EBF1F4' },
  servingBox: { flex: 1, alignItems: 'center' },
  tokenLabel: { fontSize: 10, fontWeight: '700', color: '#688291', marginBottom: 8, letterSpacing: 0.8 },
  myTokenNum: { fontSize: 32, fontWeight: '800', color: '#005A71' },
  servingTokenNum: { fontSize: 32, fontWeight: '800', color: '#059669' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#005A71', marginVertical: 8 },
  statLabel: { fontSize: 12, color: '#688291', textAlign: 'center', fontWeight: '500' },
  
  progressContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  progressTitle: { fontSize: 15, fontWeight: '700', color: '#1B2C36', marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#E5ECF0', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#005A71', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#688291', textAlign: 'center' }
});

export default LiveQueueScreen;
