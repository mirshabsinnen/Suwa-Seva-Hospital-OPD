import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Animated, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';

const THEME = '#0a3d62';
const ACCENT = '#1a5f8a';

const MOCK_NOTIFICATIONS = [
  { _id: '1', type: 'emergency', title: 'Emergency Alert', message: 'Token A1009-005 has been escalated to EMERGENCY. Immediate attention required.', time: '5 min ago', read: false },
  { _id: '2', type: 'arrival', title: 'Patient Arrived', message: 'Token A1009-006 (Kasun) has physically arrived at the OPD.', time: '12 min ago', read: false },
  { _id: '3', type: 'handover', title: 'Shift Handover Logged', message: 'Morning shift handover submitted by Nurse Nilanthi. 3 patients waiting.', time: '1 hour ago', read: true },
  { _id: '4', type: 'priority', title: 'Priority Update', message: 'Token A1007-001 has been set to PRIORITY by the attending nurse.', time: '2 hours ago', read: true },
  { _id: '5', type: 'called', title: 'Patient Called', message: 'Token A1007-004 has been called for consultation.', time: '3 hours ago', read: true },
];

const typeConfig = {
  emergency: { icon: 'alert-circle', color: '#e74c3c', bg: '#fdf0ef' },
  arrival: { icon: 'checkmark-circle', color: '#27ae60', bg: '#edfbf0' },
  handover: { icon: 'document-text', color: '#f39c12', bg: '#fef9ed' },
  priority: { icon: 'flag', color: '#8e44ad', bg: '#f5eefb' },
  called: { icon: 'megaphone', color: THEME, bg: '#e8f0f7' },
};

const StaffNotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useFocusEffect(
    useCallback(() => {
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }).start();
    }, [])
  );

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderItem = ({ item, index }) => {
    const cfg = typeConfig[item.type] || typeConfig.called;
    return (
      <Animated.View
        style={[
          styles.notifCard,
          !item.read && styles.unreadCard,
          { opacity: fadeAnim }
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage}>{item.message}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread alert{unreadCount > 1 ? 's' : ''}</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    backgroundColor: THEME,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  headerSubtitle: { color: '#a0c4e0', fontSize: 13, marginTop: 4 },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  markAllText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  listContainer: { padding: 16, paddingTop: 20 },
  separator: { height: 10 },

  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#0a3d62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#1a2b3c', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME, marginLeft: 8, flexShrink: 0 },
  notifMessage: { fontSize: 13, color: '#5a6a7a', lineHeight: 19, marginBottom: 6 },
  notifTime: { fontSize: 12, color: '#95a5a6', fontWeight: '500' },

  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#95a5a6', fontSize: 16, marginTop: 15, fontWeight: '500' },
});

export default StaffNotificationsScreen;
