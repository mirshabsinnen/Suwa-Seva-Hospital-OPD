import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getConsultationHistory, deleteConsultationDraft } from '../../services/doctorApi';
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

const ConsultationHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await getConsultationHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDeleteDraft = (id) => {
    Alert.alert(
      "Delete Draft",
      "Are you sure you want to delete this draft consultation? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteConsultationDraft(id);
              fetchHistory();
              Alert.alert("Success", "Draft deleted");
            } catch (error) {
              Alert.alert("Error", error.response?.data?.message || "Failed to delete draft");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isCompleted = item.status === 'completed';
    const statusColor = isCompleted ? T.success : T.warning;

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.dateContainer}>
            <View style={s.dateIconWrap}>
              <Ionicons name="calendar-outline" size={14} color={T.accent} />
            </View>
            <Text style={s.dateText}>
              {new Date(item.appointmentId?.appointmentDate || item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[s.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={s.cardBody}>
          <Text style={s.patientName}>{item.patientId?.fullName}</Text>
          <Text style={s.symptomsText} numberOfLines={2}>
            Symptoms: {item.symptoms || 'None recorded'}
          </Text>
        </View>
        
        <View style={s.cardFooter}>
          <TouchableOpacity 
            style={s.actionBtn}
            onPress={() => navigation.navigate('ConsultationNotes', { queueId: item.queueId })}
            activeOpacity={0.7}
          >
            <Text style={s.actionBtnText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color={T.accent} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          
          {item.status === 'draft' && (
            <TouchableOpacity 
              style={s.deleteBtn}
              onPress={() => handleDeleteDraft(item._id)}
            >
              <Ionicons name="trash-outline" size={18} color={T.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={s.headerTitle}>Consultation History</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="document-text-outline" size={48} color={T.accent} />
            </View>
            <Text style={s.emptyText}>No consultation history found.</Text>
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
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

  // ── List ──
  listContent: { padding: 20, paddingBottom: 40 },

  // ── Card (Glassmorphic) ──
  card: {
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
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateIconWrap: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: T.accentLight,
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  dateText: { color: T.text, fontWeight: '700', fontSize: 13 },
  
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 12, borderWidth: 1
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  cardBody: { marginBottom: 16 },
  patientName: { fontSize: 17, fontWeight: '700', color: T.text, marginBottom: 6 },
  symptomsText: { fontSize: 13, color: T.textDim, fontStyle: 'italic', lineHeight: 18 },

  cardFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderTopWidth: 1, borderTopColor: 'rgba(0,90,113,0.06)', 
    paddingTop: 14 
  },
  actionBtn: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.accentLight,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.1)'
  },
  actionBtnText: { color: T.accent, fontWeight: '700', fontSize: 13 },
  
  deleteBtn: { 
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.20)',
    justifyContent: 'center', alignItems: 'center',
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

export default ConsultationHistoryScreen;
