import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';

const THEME = '#0a3d62';
const ACCENT = '#1a5f8a';

const StaffDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getDashboard();
      if (response.success) {
        setStats(response.data);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
      }
    } catch {
      setError('Unable to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    fetchDashboardStats();
  }, []));

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardStats} tintColor={THEME} />}
      >
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Good Morning 👋</Text>
              <Text style={styles.heroName}>General OPD Nurse</Text>
            </View>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => navigation.navigate('StaffNotifications')}
            >
              <Ionicons name="notifications" size={22} color="#fff" />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroDate}>{getCurrentDate()}</Text>

          {/* Live Status Bar */}
          <View style={styles.liveBar}>
            <View style={styles.liveItem}>
              <Text style={styles.liveLabel}>NOW SERVING</Text>
              <Text style={styles.liveValue}>{stats?.currentlyServingToken || '—'}</Text>
            </View>
            <View style={styles.liveDivider} />
            <View style={styles.liveItem}>
              <Text style={styles.liveLabel}>NEXT TOKEN</Text>
              <Text style={[styles.liveValue, { color: '#f1c40f' }]}>{stats?.nextToken || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionLabel}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: 'people', color: THEME, bg: '#e8f0f7' },
            { label: 'Waiting', value: stats?.waitingPatients ?? 0, icon: 'time', color: '#e67e22', bg: '#fef6ee' },
            { label: 'Completed', value: stats?.completedPatients ?? 0, icon: 'checkmark-circle', color: '#27ae60', bg: '#edfbf0' },
            { label: 'Priority', value: stats?.priorityPatients ?? 0, icon: 'alert-circle', color: '#e74c3c', bg: '#fdf0ef' },
          ].map((item, i) => (
            <Animated.View
              key={i}
              style={[styles.statCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              <View style={[styles.statIconCircle, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.statNumber, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {[
            { icon: 'people', label: 'View Queue', sub: 'See all patients today', route: 'StaffTodayQueue', color: THEME },
            { icon: 'megaphone', label: 'Call Next Patient', sub: 'Call the next in line', route: 'StaffCallNextPatient', color: '#2980b9' },
            { icon: 'time', label: 'Shift Handover', sub: 'Log handover notes', route: 'StaffShiftHandover', color: '#8e44ad' },
            { icon: 'eye', label: 'Active Consultation', sub: 'Monitor current status', route: 'StaffActiveConsultation', color: '#27ae60' },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionSub}>{action.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bdc3c7" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 12, color: THEME, fontSize: 15, fontWeight: '500' },

  heroHeader: {
    backgroundColor: THEME,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  heroGreeting: { color: '#a0c4e0', fontSize: 14, fontWeight: '500' },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.3, marginTop: 2 },
  heroDate: { color: '#7fb8d8', fontSize: 13, marginBottom: 20 },
  notifButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  notifBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#e74c3c',
    borderWidth: 1.5, borderColor: THEME,
  },

  liveBar: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  liveItem: { flex: 1, alignItems: 'center' },
  liveDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  liveLabel: { color: '#a0c4e0', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  liveValue: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 1 },

  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#1a2b3c', marginLeft: 20, marginTop: 28, marginBottom: 14 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 },
  statCard: {
    width: '47%', margin: '1.5%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#0a3d62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  statIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statNumber: { fontSize: 30, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: '600', textAlign: 'center' },

  actionsContainer: { paddingHorizontal: 20 },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0a3d62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#1a2b3c', marginBottom: 2 },
  actionSub: { fontSize: 12, color: '#7f8c8d' },
});

export default StaffDashboardScreen;
