import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, FadeInUpView, HeartbeatDot } from '../../components/MedicalAnimations';

const THEME = '#005A71';
const ACCENT = '#005A71';

const StaffDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getDashboard();
      if (response.success) {
        setStats(response.data);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
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
    slideAnim.setValue(20);
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.headerLogoBox}>
                <HospitalSvgIcon size={24} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.heroGreeting}>Staff Portal • Suwa Seva</Text>
                <Text style={styles.heroName}>General OPD Nurse</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => navigation.navigate('StaffNotifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroDate}>{getCurrentDate()}</Text>

          {/* Live Status Bar with PulseView */}
          <PulseView active={true} style={styles.liveBar}>
            <View style={styles.liveItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <HeartbeatDot color="#10B981" size={6} />
                <Text style={[styles.liveLabel, { marginLeft: 6, marginBottom: 0 }]}>NOW SERVING</Text>
              </View>
              <Text style={styles.liveValue}>{stats?.currentlyServingToken || '—'}</Text>
            </View>
            <View style={styles.liveDivider} />
            <View style={styles.liveItem}>
              <Text style={styles.liveLabel}>NEXT TOKEN</Text>
              <Text style={[styles.liveValue, { color: '#FCD34D' }]}>{stats?.nextToken || '—'}</Text>
            </View>
          </PulseView>
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 12, color: THEME, fontSize: 15, fontWeight: '600' },

  heroHeader: {
    backgroundColor: THEME,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLogoBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroGreeting: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  heroName: { color: '#fff', fontSize: 19, fontWeight: '800', letterSpacing: 0.2, marginTop: 2 },
  heroDate: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 16 },
  notifButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  notifBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444',
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
  liveLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  liveValue: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 1 },

  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#0F2A38', marginLeft: 20, marginTop: 24, marginBottom: 14 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 },
  statCard: {
    width: '47%', margin: '1.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#005A71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statNumber: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textAlign: 'center' },

  actionsContainer: { paddingHorizontal: 20 },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#005A71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#0F2A38', marginBottom: 2 },
  actionSub: { fontSize: 12, color: '#64748B' },
});

export default StaffDashboardScreen;
