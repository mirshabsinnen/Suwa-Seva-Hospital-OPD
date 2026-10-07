import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const THEME = '#0a3d62';

const MenuItem = ({ icon, label, sub, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.menuIcon, { backgroundColor: danger ? '#fdf0ef' : '#e8f0f7' }]}>
      <Ionicons name={icon} size={20} color={danger ? '#e74c3c' : THEME} />
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuLabel, danger && { color: '#e74c3c' }]}>{label}</Text>
      {sub && <Text style={styles.menuSub}>{sub}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
  </TouchableOpacity>
);

const StaffProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) logout();
    } else {
      Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'N';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>{user?.fullName || 'Staff Nurse'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="medical" size={13} color="#fff" />
            <Text style={styles.roleText}>Staff Nurse</Text>
          </View>
          <Text style={styles.email}>{user?.email || 'nurse@suwaseva.lk'}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          {[
            { icon: 'business', label: 'OPD', value: 'General OPD' },
            { icon: 'location', label: 'Hospital', value: 'Colombo South' },
          ].map((item, i) => (
            <View key={i} style={styles.infoCard}>
              <Ionicons name={item.icon} size={20} color={THEME} />
              <Text style={styles.infoValue}>{item.value}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon="person-circle-outline" label="My Profile" sub="View and edit your profile" onPress={() => navigation?.navigate?.('StaffEditProfile')} />
          <MenuItem icon="notifications-outline" label="Notifications" sub="Manage your alert preferences" onPress={() => navigation?.navigate?.('StaffNotifications')} />
          <MenuItem icon="lock-closed-outline" label="Change Password" sub="Update your login credentials" onPress={() => navigation?.navigate?.('StaffChangePassword')} />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <MenuItem icon="information-circle-outline" label="About Suwa Seva" sub="Version 1.0.0" onPress={() => {}} />
          <MenuItem icon="help-circle-outline" label="Help & Support" sub="Get help or report a bug" onPress={() => {}} />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <MenuItem icon="log-out-outline" label="Logout" sub="Sign out of your account" onPress={handleLogout} danger />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    backgroundColor: THEME,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarImage: { width: 82, height: 82, borderRadius: 41 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 10,
  },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  email: { color: '#a0c4e0', fontSize: 14 },

  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    gap: 12,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 18, padding: 18,
    alignItems: 'center', gap: 6,
    shadowColor: THEME, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#1a2b3c', textAlign: 'center' },
  infoLabel: { fontSize: 11, color: '#95a5a6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },

  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8,
    shadowColor: THEME, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#1a2b3c' },
  menuSub: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
});

export default StaffProfileScreen;
