import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView } from '../../components/MedicalAnimations';

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
          <Ionicons name="close" size={24} color="#005A71" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Token</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tokenCard}>
          <View style={styles.logoBadge}>
            <HospitalSvgIcon size={38} color="#005A71" />
          </View>
          <Text style={styles.successText}>Booking Confirmed</Text>
          <Text style={styles.tokenLabel}>Your Queue Token Number</Text>
          <PulseView duration={2600}>
            <View style={styles.tokenNumberBox}>
              <Text style={styles.tokenNumberText}>{queueToken}</Text>
            </View>
          </PulseView>
          
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color="#005A71" />
              <Text style={styles.detailText}>{formatDate(appointment.appointmentDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#005A71" />
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  content: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  
  tokenCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 26, alignItems: 'center', borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, marginBottom: 24 },
  logoBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F7F9', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#D3E6ED' },
  successText: { fontSize: 18, fontWeight: '700', color: '#059669', marginBottom: 12 },
  tokenLabel: { fontSize: 13, color: '#688291', marginBottom: 12, fontWeight: '500' },
  tokenNumberBox: { backgroundColor: '#F0F7F9', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginBottom: 22, borderWidth: 1.5, borderColor: '#005A71' },
  tokenNumberText: { fontSize: 38, fontWeight: '800', color: '#005A71', letterSpacing: 2 },
  
  detailsBox: { width: '100%', borderTopWidth: 1, borderTopColor: '#EBF1F4', paddingTop: 18 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' },
  detailText: { marginLeft: 8, fontSize: 15, color: '#1B2C36', fontWeight: '600' },

  trackButton: { width: '100%', backgroundColor: '#005A71', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#005A71', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  trackButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  homeButton: { width: '100%', backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#005A71' },
  homeButtonText: { color: '#005A71', fontSize: 16, fontWeight: '700' }
});

export default QueueTokenScreen;
