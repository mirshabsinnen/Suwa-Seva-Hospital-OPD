import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const LiveQueueScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  // For demonstration, we just fetch the most recent active appointment's queue
  const fetchActiveQueue = async () => {
    try {
      const res = await api.get('/appointments');
      const activeAppt = res.data.find(a => a.status !== 'cancelled' && a.status !== 'completed');
      
      if (activeAppt) {
        setAppointments([activeAppt]);
        const queueRes = await api.get(`/queue/${activeAppt._id}`);
        setQueueData(queueRes.data);
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
      // Setup polling every 20 seconds
      const interval = setInterval(fetchActiveQueue, 20000);
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
        <Ionicons name="people-circle-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>You don't have any active queue right now.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Queue Tracking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.topCard}>
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>{appointments[0]?.hospitalId?.name}</Text>
            <Text style={styles.opdName}>{appointments[0]?.opdId?.name} • Room 14</Text>
          </View>
          
          <View style={styles.tokenDisplayRow}>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
              <Text style={styles.myTokenNum}>{queueData.tokenNumber}</Text>
            </View>
            <View style={styles.servingBox}>
              <Text style={styles.tokenLabel}>CURRENTLY SERVING</Text>
              <Text style={styles.servingTokenNum}>{queueData.currentServingToken}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#005A71" />
            <Text style={styles.statValue}>{queueData.patientsAhead}</Text>
            <Text style={styles.statLabel}>Your Position (Ahead)</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#e67e22" />
            <Text style={[styles.statValue, { color: '#e67e22' }]}>{queueData.estimatedWaitingTime} min</Text>
            <Text style={styles.statLabel}>Estimated Wait Time</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Queue Progress</Text>
          <View style={styles.progressBar}>
            {/* Simple Mock Progress Bar */}
            <View style={[styles.progressFill, { width: queueData.patientsAhead < 5 ? '80%' : '40%' }]} />
          </View>
          <Text style={styles.progressText}>Please be near the OPD waiting area.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  
  topCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 20 },
  hospitalInfo: { alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
  hospitalName: { fontSize: 18, fontWeight: 'bold', color: '#005A71', textAlign: 'center' },
  opdName: { fontSize: 14, color: '#666', marginTop: 4 },
  
  tokenDisplayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tokenBox: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  servingBox: { flex: 1, alignItems: 'center' },
  tokenLabel: { fontSize: 10, fontWeight: 'bold', color: '#888', marginBottom: 8, letterSpacing: 1 },
  myTokenNum: { fontSize: 32, fontWeight: 'bold', color: '#005A71' },
  servingTokenNum: { fontSize: 32, fontWeight: 'bold', color: '#28a745' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#005A71', marginVertical: 10 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  
  progressContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  progressTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  progressBar: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden', marginBottom: 15 },
  progressFill: { height: '100%', backgroundColor: '#005A71', borderRadius: 5 },
  progressText: { fontSize: 13, color: '#666', textAlign: 'center', fontStyle: 'italic' }
});

export default LiveQueueScreen;
