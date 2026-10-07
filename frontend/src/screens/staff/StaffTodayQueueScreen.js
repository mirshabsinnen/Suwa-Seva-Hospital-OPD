import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';

const THEME = '#0a3d62';

const statusConfig = {
  waiting: { label: 'WAITING', color: '#e67e22', bg: '#fef6ee' },
  called:  { label: 'CALLED',  color: '#2980b9', bg: '#eaf4fb' },
  completed: { label: 'DONE', color: '#27ae60', bg: '#edfbf0' },
  cancelled: { label: 'CANCELLED', color: '#95a5a6', bg: '#f5f5f5' },
};

const priorityConfig = {
  Emergency: { color: '#e74c3c', icon: 'alert-circle' },
  Priority:  { color: '#f39c12', icon: 'flag' },
  Normal:    { color: '#27ae60', icon: null },
};

const StaffTodayQueueScreen = ({ navigation }) => {
  const [queueData, setQueueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getTodayQueue();
      if (response.success) {
        setQueueData(response.data);
        applyFilters(response.data, search, activeFilter);
      }
    } catch {
      setError('Unable to load queue. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchQueue(); }, []));

  const applyFilters = (data, query, filter) => {
    let result = [...data];
    if (filter === 'Waiting')   result = result.filter(i => i.status === 'waiting');
    else if (filter === 'Called') result = result.filter(i => i.status === 'called');
    else if (filter === 'Done')   result = result.filter(i => i.status === 'completed');
    else if (filter === 'Priority') result = result.filter(i => i.priority === 'Priority' || i.priority === 'Emergency');
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(i =>
        i.tokenNumber.toLowerCase().includes(q) ||
        (i.patientId?.fullName || '').toLowerCase().includes(q)
      );
    }
    setFilteredData(result);
  };

  const onSearch = (text) => { setSearch(text); applyFilters(queueData, text, activeFilter); };
  const onFilter = (f) => { setActiveFilter(f); applyFilters(queueData, search, f); };

  const renderCard = ({ item }) => {
    const stat = statusConfig[item.status] || statusConfig.waiting;
    const prio = priorityConfig[item.priority] || priorityConfig.Normal;
    const isHighPriority = item.priority === 'Emergency' || item.priority === 'Priority';

    return (
      <TouchableOpacity
        style={[styles.card, isHighPriority && styles.cardPriority]}
        onPress={() => navigation.navigate('StaffPatientDetails', { queueId: item._id })}
        activeOpacity={0.88}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.tokenBadge, { backgroundColor: isHighPriority ? prio.color : THEME }]}>
            <Text style={styles.tokenText}>{item.tokenNumber}</Text>
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.patientName}>{item.patientId?.fullName || 'Unknown'}</Text>
            <Text style={styles.positionText}>Position #{item.queuePosition}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          {isHighPriority && (
            <View style={[styles.prioBadge, { backgroundColor: prio.color + '20' }]}>
              <Ionicons name={prio.icon} size={12} color={prio.color} />
              <Text style={[styles.prioText, { color: prio.color }]}>{item.priority}</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: stat.bg }]}>
            <Text style={[styles.statusText, { color: stat.color }]}>{stat.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Queue</Text>
        <Text style={styles.headerSub}>{queueData.length} patients registered</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#7f8c8d" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by token or name..."
          value={search}
          onChangeText={onSearch}
          placeholderTextColor="#95a5a6"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch('')}>
            <Ionicons name="close-circle" size={18} color="#95a5a6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        {['All', 'Waiting', 'Called', 'Done', 'Priority'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => onFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading && queueData.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={56} color="#bdc3c7" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchQueue}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={i => i._id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchQueue} tintColor={THEME} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={56} color="#bdc3c7" />
              <Text style={styles.emptyText}>No patients found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    backgroundColor: THEME,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#a0c4e0', fontSize: 13, marginTop: 4 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0a3d62',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#2c3e50' },

  filtersRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#fff',
    marginRight: 8, borderWidth: 1, borderColor: '#dde4ea',
  },
  chipActive: { backgroundColor: THEME, borderColor: THEME },
  chipText: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  list: { padding: 16, paddingBottom: 30 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#0a3d62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  cardPriority: { borderLeftColor: '#e74c3c', backgroundColor: '#fffbfb' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tokenBadge: {
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10, minWidth: 75, alignItems: 'center',
  },
  tokenText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1a2b3c' },
  positionText: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  prioBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, gap: 4,
  },
  prioText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  errorText: { color: '#7f8c8d', fontSize: 14, marginTop: 12, textAlign: 'center', paddingHorizontal: 30 },
  emptyText: { color: '#95a5a6', fontSize: 15, marginTop: 12 },
  retryBtn: {
    marginTop: 16, backgroundColor: THEME,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});

export default StaffTodayQueueScreen;
