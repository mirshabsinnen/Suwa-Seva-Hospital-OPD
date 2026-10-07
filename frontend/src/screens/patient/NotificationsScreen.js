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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 16, color: '#666' },
  listContainer: { padding: 15 },

  notificationCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, alignItems: 'center' },
  unreadCard: { backgroundColor: '#eef6f9', borderWidth: 1, borderColor: '#d0e5ed' },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contentContainer: { flex: 1 },
  title: { fontSize: 15, color: '#333', marginBottom: 4 },
  unreadTitle: { fontWeight: 'bold', color: '#005A71' },
  message: { fontSize: 13, color: '#555', marginBottom: 8 },
  time: { fontSize: 11, color: '#999' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e67e22', marginLeft: 10 }
});

export default NotificationsScreen;
