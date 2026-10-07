import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const HIODashboardScreen = () => {
  const { logout, userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="stats-chart" size={28} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greeting}>Welcome, {userInfo?.fullName}</Text>
            <Text style={styles.roleLabel}>Health Information Officer</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="construct-outline" size={64} color="#7b5ea7" />
        </View>
        <Text style={styles.comingTitle}>HIO Dashboard</Text>
        <Text style={styles.comingSubtitle}>
          Your dashboard is under development. You are logged in as a{' '}
          <Text style={styles.roleHighlight}>Health Information Officer</Text>.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="person-circle-outline" size={20} color="#7b5ea7" />
          <Text style={styles.infoText}>{userInfo?.fullName}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="mail-outline" size={20} color="#7b5ea7" />
          <Text style={styles.infoText}>{userInfo?.email}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#7b5ea7" />
          <Text style={styles.infoText}>Role: Health Information Officer</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#7b5ea7', padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  roleLabel: { color: '#d4c5e8', fontSize: 13 },
  logoutBtn: { padding: 8 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#f0eaf8', justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  comingTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  comingSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  roleHighlight: { color: '#7b5ea7', fontWeight: 'bold' },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 10, marginBottom: 10, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
  },
  infoText: { marginLeft: 12, fontSize: 14, color: '#333' },
});

export default HIODashboardScreen;
