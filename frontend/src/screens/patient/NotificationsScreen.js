import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const NotificationsScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications/${userInfo._id}`);
      setNotifications(res.data);
    } catch (error) {
      console.log('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?._id) {
      fetchNotifications();
    }
  }, [userInfo]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.log('Error marking as read');
    }
  };

  const renderItem = ({ item }) => {
    const isRead = item.isRead;
    
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !isRead && styles.unreadCard]} 
        onPress={() => !isRead && markAsRead(item._id)}
        disabled={isRead}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.type === 'appointment_reminder' ? 'calendar' : 'notifications'} 
            size={24} 
            color={!isRead ? '#005A71' : '#888'} 
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, !isRead && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#005A71" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  emptyText: { marginTop: 12, fontSize: 15, color: '#688291' },
  listContainer: { padding: 16, backgroundColor: '#FFFFFF' },

  notificationCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  unreadCard: { backgroundColor: '#F0F7F9', borderWidth: 1.5, borderColor: '#005A71' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5ECF0', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  contentContainer: { flex: 1 },
  title: { fontSize: 15, color: '#1B2C36', marginBottom: 4, fontWeight: '600' },
  unreadTitle: { fontWeight: '700', color: '#005A71' },
  message: { fontSize: 13, color: '#4B6271', marginBottom: 6, lineHeight: 18 },
  time: { fontSize: 11, color: '#8DA3B0' },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#005A71', marginLeft: 10 }
});

export default NotificationsScreen;
