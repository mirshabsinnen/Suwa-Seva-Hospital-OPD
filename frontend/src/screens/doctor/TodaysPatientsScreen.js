import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTodaysPatients, markPatientNoShow } from '../../services/doctorApi';
import { useFocusEffect } from '@react-navigation/native';

// ── Light Theme with Glassmorphism ──
const T = {
  bg:        '#f0f4f8',       
  card:      'rgba(255,255,255,0.75)', 
  cardBorder:'rgba(0,90,113,0.08)',
  accent:    '#005A71',       
  accentLight:'rgba(0,90,113,0.08)',
  text:      '#1a2b3c',       
  textDim:   '#7f8c8d',       
  success:   '#22c55e',
  warning:   '#f59e0b',
  danger:    '#ef4444',
  muted:     '#94a3b8',
  headerBg:  '#005A71',       
};

const TodaysPatientsScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = async () => {
    try {
      const data = await getTodaysPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'called': return T.warning;
      case 'serving': return T.success;
      case 'waiting': return '#3b82f6'; // blue
      case 'completed': return '#8b5cf6'; // purple
      default: return T.muted;
    }
  };

  const handleNoShow = (queueId, currentStatus) => {
    if (currentStatus === 'serving' || currentStatus === 'completed') {
      Alert.alert('Error', `Cannot mark a ${currentStatus} patient as No Show.`);
      return;
    }
    Alert.alert(
      "Mark No Show",
      "Are you sure this patient is a no show?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: "destructive",
          onPress: async () => {
            try {
              await markPatientNoShow(queueId);
              fetchPatients();
              Alert.alert("Success", "Patient marked as no show.");
            } catch (error) {
              Alert.alert("Error", error.response?.data?.message || "Failed to mark no show");
            }
          }
        }
      ]
    );
  };

  const renderPatient = ({ item }) => (
    <TouchableOpacity 
      style={s.patientCard}
      onPress={() => navigation.navigate('PatientDetails', { queueId: item.queueId })}
      activeOpacity={0.7}
    >
      <View style={s.cardHeader}>
        <View style={s.tokenBadge}>
          <Text style={s.tokenText}>{item.tokenNumber}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.queueStatus) + '15', borderColor: getStatusColor(item.queueStatus) + '30' }]}>
          <View style={[s.statusDot, { backgroundColor: getStatusColor(item.queueStatus) }]} />
          <Text style={[s.statusText, { color: getStatusColor(item.queueStatus) }]}>{item.queueStatus.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={s.cardBody}>
        <Text style={s.patientName}>{item.patientName}</Text>
        <View style={s.detailsContainer}>
          <View style={s.detailsRow}>
            <Ionicons name="time-outline" size={16} color={T.textDim} />
            <Text style={s.detailText}>{item.appointmentTime}</Text>
          </View>
          <View style={s.detailsRow}>
            <Ionicons name="alert-circle-outline" size={16} color={T.textDim} />
            <Text style={s.detailText}>Priority: <Text style={{fontWeight:'700', color: T.text}}>{item.priority}</Text></Text>
          </View>
        </View>
      </View>
      
      <View style={s.cardFooter}>
        <Text style={s.opdText}>{item.opdName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.queueStatus !== 'serving' && item.queueStatus !== 'completed' && (
            <TouchableOpacity 
              style={s.noShowBtn}
              onPress={() => handleNoShow(item.queueId, item.queueStatus)}
            >
              <Text style={s.noShowText}>No Show</Text>
            </TouchableOpacity>
          )}
          <View style={s.arrowIconWrap}>
            <Ionicons name="chevron-forward" size={16} color={T.accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={s.headerBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Today's Patients</Text>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.queueId.toString()}
        renderItem={renderPatient}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={48} color={T.accent} />
            </View>
            <Text style={s.emptyText}>No patients assigned for today.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },

  // ── Header ──
  header: {
    backgroundColor: T.headerBg,
    paddingHorizontal: 20, paddingTop: 44, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // ── List ──
  listContent: { padding: 20, paddingBottom: 40 },
  
  // ── Patient Card (Glassmorphic) ──
  patientCard: {
    backgroundColor: T.card,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: T.cardBorder,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tokenBadge: { 
    backgroundColor: T.accentLight, 
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.12)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 
  },
  tokenText: { color: T.accent, fontWeight: '800', fontSize: 14 },
  
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 12, borderWidth: 1
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  
  cardBody: { marginBottom: 16 },
  patientName: { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 10 },
  detailsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  detailText: { marginLeft: 6, fontSize: 13, color: T.textDim },
  
  cardFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderTopWidth: 1, borderTopColor: 'rgba(0,90,113,0.06)', 
    paddingTop: 14 
  },
  opdText: { fontSize: 12, color: T.textDim, fontWeight: '600' },
  
  noShowBtn: { 
    marginRight: 15, 
    backgroundColor: 'rgba(239,68,68,0.08)', 
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.20)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 
  },
  noShowText: { color: T.danger, fontSize: 12, fontWeight: '700' },
  arrowIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: T.accentLight,
    justifyContent: 'center', alignItems: 'center'
  },
  
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: T.card,
    borderWidth: 1, borderColor: T.cardBorder,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  emptyText: { color: T.textDim, fontSize: 15, fontWeight: '500' }
});

export default TodaysPatientsScreen;
