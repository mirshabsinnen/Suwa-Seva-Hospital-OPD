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
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, HeartbeatDot } from '../../components/MedicalAnimations';

const THEME = '#005A71';

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
            onPress={() => navigation.navigate('StaffMainTabs')}
          >
            <Text style={styles.dashboardButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
          
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { padding: 20, alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 15 },
  
  headerArea: { backgroundColor: THEME, padding: 20, paddingTop: 36, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, alignItems: 'center' },
  pageTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  pageSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  
  contentArea: { padding: 20, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F2A38', marginBottom: 10, marginTop: 10 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: THEME, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  activeCard: { borderLeftWidth: 4, borderLeftColor: '#10B981' },
  
  emptyCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CBD5E1' },
  emptyCardText: { color: '#64748B', fontSize: 15, fontStyle: 'italic' },
  
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  activeToken: { fontSize: 38, fontWeight: '900', color: THEME },
  liveBadge: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  liveBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  
  patientName: { fontSize: 20, color: '#0F2A38', fontWeight: '800' },
  patientNameSmall: { fontSize: 17, color: '#0F2A38', fontWeight: '600', marginBottom: 15 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  detailLabel: { fontSize: 14, color: '#64748B' },
  detailValue: { fontSize: 14, color: '#0F2A38', fontWeight: '700' },

  nextHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  nextTokenText: { fontSize: 28, fontWeight: '900', color: '#F59E0B' },
  emergencyBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  emergencyText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  
  actionButton: { backgroundColor: THEME, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  dashboardButton: { backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: THEME, marginTop: 10 },
  dashboardButtonText: { color: THEME, fontSize: 15, fontWeight: '700' }
});

export default StaffActiveConsultationScreen;
