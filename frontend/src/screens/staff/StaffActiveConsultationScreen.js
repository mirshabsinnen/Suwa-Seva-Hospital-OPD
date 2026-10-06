import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';

const StaffActiveConsultationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [activePatient, setActivePatient] = useState(null);
  const [nextWaitingPatient, setNextWaitingPatient] = useState(null);
  const [error, setError] = useState(null);

  const fetchConsultationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active patient
      const activeRes = await staffApi.getActivePatient();
      if (activeRes.success && activeRes.data) {
        setActivePatient(activeRes.data);
      } else {
        setActivePatient(null);
      }

      // Fetch next waiting
      const nextRes = await staffApi.getNextPatient();
      if (nextRes.success && nextRes.data) {
        setNextWaitingPatient(nextRes.data);
      } else {
        setNextWaitingPatient(null);
      }

    } catch (err) {
      setError('Unable to load monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConsultationData();
    }, [])
  );

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchConsultationData} />}
    >
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>Queue Monitoring</Text>
        <Text style={styles.pageSubtitle}>Active OPD Status</Text>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.contentArea}>
          
          {/* Active Patient Card */}
          <Text style={styles.sectionTitle}>Currently Called / In Consultation</Text>
          {activePatient ? (
            <View style={[styles.card, styles.activeCard]}>
              <View style={styles.activeHeader}>
                <Text style={styles.activeToken}>{activePatient.tokenNumber}</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.patientName}>{activePatient.patientId?.fullName || 'N/A'}</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Called At:</Text>
                <Text style={styles.detailValue}>{formatTime(activePatient.calledTime)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Queue Status:</Text>
                <Text style={styles.detailValue}>{activePatient.status.toUpperCase()}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No patient is currently active.</Text>
            </View>
          )}

          {/* Next Waiting Patient Card */}
          <Text style={styles.sectionTitle}>Next in Queue</Text>
          {nextWaitingPatient ? (
            <View style={styles.card}>
              <View style={styles.nextHeaderRow}>
                <Text style={styles.nextTokenText}>{nextWaitingPatient.tokenNumber}</Text>
                {nextWaitingPatient.priority === 'Emergency' && (
                  <View style={styles.emergencyBadge}><Text style={styles.emergencyText}>EMERGENCY</Text></View>
                )}
              </View>
              <Text style={styles.patientNameSmall}>{nextWaitingPatient.patientId?.fullName || 'N/A'}</Text>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('StaffCallNextPatient')}
              >
                <Text style={styles.actionButtonText}>Call This Patient Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No more patients waiting!</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => navigation.navigate('StaffDashboard')}
          >
            <Text style={styles.dashboardButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
          
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  centerContainer: { padding: 20, alignItems: 'center' },
  errorText: { color: '#c0392b', fontSize: 16 },
  
  headerArea: { backgroundColor: '#0a3d62', padding: 20, paddingTop: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  pageSubtitle: { color: '#bdc3c7', fontSize: 14, marginTop: 5 },
  
  contentArea: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 10, marginTop: 10 },
  
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 20 },
  activeCard: { borderLeftWidth: 5, borderLeftColor: '#27ae60' },
  
  emptyCard: { backgroundColor: '#ecf0f1', borderRadius: 15, padding: 30, alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#bdc3c7' },
  emptyCardText: { color: '#7f8c8d', fontSize: 16, fontStyle: 'italic' },
  
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  activeToken: { fontSize: 40, fontWeight: 'bold', color: '#0a3d62' },
  liveBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  liveBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  
  patientName: { fontSize: 20, color: '#2c3e50', fontWeight: 'bold' },
  patientNameSmall: { fontSize: 18, color: '#34495e', fontWeight: '500', marginBottom: 15 },
  
  divider: { height: 1, backgroundColor: '#ecf0f1', marginVertical: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  detailLabel: { fontSize: 15, color: '#7f8c8d' },
  detailValue: { fontSize: 15, color: '#2c3e50', fontWeight: 'bold' },

  nextHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  nextTokenText: { fontSize: 28, fontWeight: 'bold', color: '#f39c12' },
  emergencyBadge: { backgroundColor: '#c0392b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  emergencyText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  actionButton: { backgroundColor: '#2980b9', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  dashboardButton: { backgroundColor: 'transparent', paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#0a3d62', marginTop: 10 },
  dashboardButtonText: { color: '#0a3d62', fontSize: 16, fontWeight: 'bold' }
});

export default StaffActiveConsultationScreen;
