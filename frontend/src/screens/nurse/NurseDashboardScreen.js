import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { FadeInUpView } from '../../components/MedicalAnimations';

const NurseDashboardScreen = () => {
  const { logout, userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <HospitalSvgIcon size={24} color="#FFFFFF" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greeting}>Welcome, {userInfo?.fullName}</Text>
            <Text style={styles.roleLabel}>Nurse Station Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FadeInUpView duration={400} style={styles.body}>
        <View style={styles.iconWrap}>
          <HospitalSvgIcon size={56} color="#005A71" />
        </View>
        <Text style={styles.comingTitle}>Nurse Clinical Station</Text>
        <Text style={styles.comingSubtitle}>
          Active OPD nurse portal for patient triage, check-ins and queue management.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="person-circle-outline" size={20} color="#005A71" />
          <Text style={styles.infoText}>{userInfo?.fullName || 'Staff Nurse'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="mail-outline" size={20} color="#005A71" />
          <Text style={styles.infoText}>{userInfo?.email}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#005A71" />
          <Text style={styles.infoText}>Role: Staff Nurse</Text>
        </View>
      </FadeInUpView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#005A71', paddingHorizontal: 20, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  greeting: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roleLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  iconWrap: {
    width: 96, height: 96, borderRadius: 24,
    backgroundColor: 'rgba(0, 90, 113, 0.08)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(0, 90, 113, 0.15)',
  },
  comingTitle: { fontSize: 22, fontWeight: '800', color: '#0F2A38', marginBottom: 8 },
  comingSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: 16, borderRadius: 14, marginBottom: 12, width: '100%',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
  },
  infoText: { marginLeft: 12, fontSize: 14, color: '#0F2A38', fontWeight: '500' },
});

export default NurseDashboardScreen;

