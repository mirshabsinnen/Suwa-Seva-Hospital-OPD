import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QueueTokenScreen = ({ route, navigation }) => {
  const { queueToken, appointment } = route.params;

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Token</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tokenCard}>
          <Text style={styles.successText}>Booking Confirmed!</Text>
          <Text style={styles.tokenLabel}>Your Queue Token Number</Text>
          <View style={styles.tokenNumberBox}>
            <Text style={styles.tokenNumberText}>{queueToken}</Text>
          </View>
          
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{formatDate(appointment.appointmentDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{appointment.appointmentTime}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.trackButton} 
          onPress={() => navigation.navigate('Main', { screen: 'QueueTab' })}
        >
          <Text style={styles.trackButtonText}>Track Live Queue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  
  tokenCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginBottom: 30 },
  successText: { fontSize: 18, fontWeight: 'bold', color: '#28a745', marginBottom: 20 },
  tokenLabel: { fontSize: 14, color: '#666', marginBottom: 10 },
  tokenNumberBox: { backgroundColor: '#eef6f9', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, marginBottom: 30 },
  tokenNumberText: { fontSize: 40, fontWeight: 'bold', color: '#005A71', letterSpacing: 2 },
  
  detailsBox: { width: '100%', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'center' },
  detailText: { marginLeft: 10, fontSize: 16, color: '#333', fontWeight: '500' },

  trackButton: { width: '100%', backgroundColor: '#005A71', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  trackButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  homeButton: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#005A71' },
  homeButtonText: { color: '#005A71', fontSize: 16, fontWeight: 'bold' }
});

export default QueueTokenScreen;
