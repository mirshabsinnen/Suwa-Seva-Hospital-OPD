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
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20, justifyContent: 'center', alignItems: 'center' },
  successIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkIcon: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 30 },
  
  summaryCard: { backgroundColor: '#fff', width: '100%', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 30 },
  summaryLabel: { fontSize: 16, color: '#7f8c8d', marginBottom: 10 },
  summaryValue: { color: '#2c3e50', fontWeight: 'bold' },
  highlightText: { color: '#e74c3c' },
  divider: { height: 1, backgroundColor: '#ecf0f1', marginVertical: 15 },
  
  positionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  posBox: { alignItems: 'center' },
  posLabel: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  oldPosText: { fontSize: 24, color: '#95a5a6', textDecorationLine: 'line-through' },
  newPosText: { fontSize: 32, color: '#27ae60', fontWeight: 'bold' },
  arrow: { fontSize: 30, color: '#bdc3c7' },

  primaryButton: { backgroundColor: '#0a3d62', width: '100%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  secondaryButton: { backgroundColor: 'transparent', width: '100%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#0a3d62' },
  secondaryButtonText: { color: '#0a3d62', fontSize: 16, fontWeight: 'bold' }
});

export default StaffQueueUpdatedScreen;
