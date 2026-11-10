import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const StaffQueueUpdatedScreen = ({ route, navigation }) => {
  const { queue, oldPosition } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.successIconBox}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      
      <Text style={styles.successTitle}>Update Successful!</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Token: <Text style={styles.summaryValue}>{queue.tokenNumber}</Text></Text>
        <Text style={styles.summaryLabel}>New Priority: <Text style={[styles.summaryValue, styles.highlightText]}>{queue.priority}</Text></Text>
        <View style={styles.divider} />
        
        <View style={styles.positionRow}>
          <View style={styles.posBox}>
            <Text style={styles.posLabel}>Old Position</Text>
            <Text style={styles.oldPosText}>{oldPosition}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.posBox}>
            <Text style={styles.posLabel}>New Position</Text>
            <Text style={styles.newPosText}>{queue.queuePosition}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('StaffTodayQueue')}
      >
        <Text style={styles.buttonText}>Return to Today's Queue</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('StaffCallNextPatient')}
      >
        <Text style={styles.secondaryButtonText}>Call Next Patient</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'center', alignItems: 'center' },
  successIconBox: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 18, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  checkIcon: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0F2A38', marginBottom: 24 },
  
  summaryCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, marginBottom: 28 },
  summaryLabel: { fontSize: 15, color: '#64748B', marginBottom: 10 },
  summaryValue: { color: '#0F2A38', fontWeight: '800' },
  highlightText: { color: '#EF4444' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  
  positionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  posBox: { alignItems: 'center' },
  posLabel: { fontSize: 13, color: '#64748B', marginBottom: 5 },
  oldPosText: { fontSize: 22, color: '#94A3B8', textDecorationLine: 'line-through' },
  newPosText: { fontSize: 30, color: '#10B981', fontWeight: '900' },
  arrow: { fontSize: 26, color: '#CBD5E1' },

  primaryButton: { backgroundColor: '#005A71', width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 14, shadowColor: '#005A71', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  secondaryButton: { backgroundColor: 'transparent', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#005A71' },
  secondaryButtonText: { color: '#005A71', fontSize: 16, fontWeight: '700' }
});

export default StaffQueueUpdatedScreen;
