import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../../services/staffApi';

const StaffDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Animation value for fade in effect
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now we use fake OPD Name
      const response = await staffApi.getDashboard();
      if (response.success) {
        setStats(response.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      setError('Unable to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardStats();
    }, [])
  );

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a3d62" />
        <Text style={styles.loadingText}>Loading today's overview...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardStats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardStats} />}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          <Text style={styles.opdTitle}>General OPD</Text>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>

        {/* Current Status Section */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBox, styles.servingBox]}>
            <Text style={styles.statusLabel}>Currently Serving</Text>
            <Text style={styles.statusValue}>{stats?.currentlyServingToken || '--'}</Text>
          </View>
          <View style={[styles.statusBox, styles.nextBox]}>
            <Text style={styles.statusLabel}>Next Token</Text>
            <Text style={styles.statusValue}>{stats?.nextToken || '--'}</Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <Text style={styles.sectionTitle}>Today's Queue Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.totalPatients || 0}</Text>
            <Text style={styles.statName}>Total Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats?.waitingPatients || 0}</Text>
            <Text style={styles.statName}>Waiting</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#27ae60' }]}>{stats?.completedPatients || 0}</Text>
            <Text style={styles.statName}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#c0392b' }]}>{stats?.priorityPatients || 0}</Text>
            <Text style={styles.statName}>Priority</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('StaffTodayQueue')}
        >
          <Text style={styles.actionButtonText}>View Today's Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={() => navigation.navigate('StaffCallNextPatient')}
        >
          <Text style={styles.actionButtonText}>Call Next Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.outlineButton]} 
          onPress={() => navigation.navigate('StaffShiftHandover')}
        >
          <Text style={styles.outlineButtonText}>Shift Handover</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' },
  loadingText: { marginTop: 10, color: '#555', fontSize: 16 },
  errorText: { color: '#c0392b', fontSize: 16, marginBottom: 15, textAlign: 'center', paddingHorizontal: 20 },
  retryButton: { backgroundColor: '#0a3d62', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  headerCard: {
    backgroundColor: '#0a3d62',
    padding: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  opdTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  dateText: { color: '#d1d8e0', fontSize: 16 },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -20, paddingHorizontal: 15 },
  statusBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  servingBox: { borderTopWidth: 4, borderTopColor: '#27ae60' },
  nextBox: { borderTopWidth: 4, borderTopColor: '#f39c12' },
  statusLabel: { color: '#7f8c8d', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  statusValue: { color: '#2c3e50', fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginLeft: 20, marginTop: 30, marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  statCard: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: { fontSize: 26, fontWeight: 'bold', color: '#0a3d62', marginBottom: 5 },
  statName: { fontSize: 14, color: '#7f8c8d', fontWeight: '500' },
  actionButton: {
    backgroundColor: '#0a3d62',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: { backgroundColor: '#2980b9' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#0a3d62', shadowOpacity: 0, elevation: 0 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButtonText: { color: '#0a3d62', fontSize: 16, fontWeight: 'bold' },
  spacer: { height: 40 }
});

export default StaffDashboardScreen;
