import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../../services/staffApi';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StaffTodayQueueScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getTodayQueue();
      if (response.success) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setQueueData(response.data);
        applyFilters(response.data, searchQuery, activeFilter);
      }
    } catch (err) {
      setError('Unable to load the queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQueue();
    }, [])
  );

  const applyFilters = (data, search, filter) => {
    let filtered = [...data];

    // Filter by status
    if (filter !== 'All') {
      filtered = filtered.filter(item => {
        if (filter === 'Waiting') return item.status === 'waiting' && item.arrivalStatus === 'Arrived';
        if (filter === 'Not Arrived') return item.arrivalStatus === 'Not Arrived';
        if (filter === 'Priority') return item.priority === 'Priority' || item.priority === 'Emergency';
        return item.status.toLowerCase() === filter.toLowerCase();
      });
    }

    // Filter by search text (Token or Name)
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.tokenNumber.toLowerCase().includes(lowerSearch) || 
        (item.patientId?.fullName && item.patientId.fullName.toLowerCase().includes(lowerSearch))
      );
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilteredData(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(queueData, text, activeFilter);
  };

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    applyFilters(queueData, searchQuery, filter);
  };

  const renderFilterChip = (label) => {
    const isActive = activeFilter === label;
    return (
      <TouchableOpacity 
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => handleFilterSelect(label)}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status, arrivalStatus) => {
    if (status === 'completed') return '#27ae60';
    if (status === 'called' || status === 'serving') return '#2980b9';
    if (arrivalStatus === 'Arrived') return '#f39c12';
    return '#95a5a6'; // Not Arrived
  };

  const renderPatientCard = ({ item }) => {
    const isPriority = item.priority === 'Priority' || item.priority === 'Emergency';
    const statusColor = getStatusColor(item.status, item.arrivalStatus);

    return (
      <TouchableOpacity 
        style={[styles.card, isPriority && styles.priorityCard]}
        onPress={() => navigation.navigate('StaffPatientDetails', { queueId: item._id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.tokenText}>{item.tokenNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>
              {item.status === 'waiting' && item.arrivalStatus === 'Not Arrived' ? 'Not Arrived' : item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.patientName}>{item.patientId?.fullName || 'Unknown Patient'}</Text>
          
          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>Pos: {item.queuePosition}</Text>
            {isPriority && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by Token or Name..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#95a5a6"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', 'Not Arrived', 'Waiting', 'Priority', 'Called', 'Completed']}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderFilterChip(item)}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Content */}
      {loading && queueData.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0a3d62" />
          <Text style={styles.loadingText}>Loading today's queue...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQueue}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderPatientCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchQueue} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No patients found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#555', fontSize: 16 },
  errorText: { color: '#c0392b', fontSize: 16, marginBottom: 15, textAlign: 'center', paddingHorizontal: 20 },
  retryButton: { backgroundColor: '#0a3d62', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#7f8c8d', fontSize: 16, fontStyle: 'italic' },
  
  searchContainer: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  searchInput: { 
    backgroundColor: '#f4f6f8', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50'
  },
  
  filtersWrapper: { backgroundColor: '#fff', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  filtersContainer: { paddingHorizontal: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 5,
  },
  filterChipActive: { backgroundColor: '#0a3d62' },
  filterChipText: { color: '#7f8c8d', fontWeight: '600' },
  filterChipTextActive: { color: '#ffffff' },
  
  listContainer: { padding: 15, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#bdc3c7',
  },
  priorityCard: { borderLeftColor: '#c0392b', backgroundColor: '#fdf3f2' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tokenText: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientName: { fontSize: 16, color: '#34495e', fontWeight: '500', flex: 1 },
  detailsRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 14, color: '#7f8c8d', marginRight: 10 },
  priorityBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  priorityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default StaffTodayQueueScreen;
