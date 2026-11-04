import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, Platform, SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../services/staffApi';
import { FadeInUpView } from '../../components/MedicalAnimations';

const THEME = '#005A71';

const showAlert = (title, msg, buttons) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${msg}`);
    buttons?.[0]?.onPress?.();
  } else {
    Alert.alert(title, msg, buttons);
  }
};

const showConfirm = (title, msg, onConfirm) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${msg}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  }
};

const SHIFTS = [
  { key: 'Morning', icon: 'sunny',        color: '#f39c12', bg: '#fef9e7' },
  { key: 'Evening', icon: 'partly-sunny', color: '#e67e22', bg: '#fef5ec' },
  { key: 'Night',   icon: 'moon',         color: '#2980b9', bg: '#ebf5fb' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' • ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
};

const StaffShiftHandoverScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'history'

  // Form states
  const [shift, setShift] = useState('Morning');
  const [opd, setOpd] = useState('General OPD');
  const [currentToken, setCurrentToken] = useState('');
  const [numberWaiting, setNumberWaiting] = useState('');
  const [numberPriority, setNumberPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingHandoverId, setEditingHandoverId] = useState(null);

  // List states
  const [handovers, setHandovers] = useState([]);
  const [loadingHandovers, setLoadingHandovers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterShift, setFilterShift] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all handovers from API
  const fetchHandovers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingHandovers(true);
      }
      const response = await staffApi.getHandovers();
      if (response && response.success) {
        setHandovers(response.data || []);
      }
    } catch {
      // Graceful error handling
    } finally {
      setLoadingHandovers(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHandovers();
    }, [])
  );

  const resetForm = () => {
    setShift('Morning');
    setOpd('General OPD');
    setCurrentToken('');
    setNumberWaiting('');
    setNumberPriority('');
    setNotes('');
    setEditingHandoverId(null);
  };

  const handleEditPress = (item) => {
    setEditingHandoverId(item._id);
    setShift(item.shift || 'Morning');
    setOpd(item.opd || 'General OPD');
    setCurrentToken(item.currentToken || '');
    setNumberWaiting(item.numberWaiting != null ? String(item.numberWaiting) : '');
    setNumberPriority(item.numberPriority != null ? String(item.numberPriority) : '');
    setNotes(item.notes || '');
    setActiveTab('form');
  };

  const handleDeletePress = (item) => {
    showConfirm(
      'Delete Handover',
      `Are you sure you want to delete this ${item.shift} shift handover record? This cannot be undone.`,
      async () => {
        try {
          setDeletingId(item._id);
          const response = await staffApi.deleteHandover(item._id);
          if (response && response.success) {
            setHandovers((prev) => prev.filter((h) => h._id !== item._id));
            if (editingHandoverId === item._id) {
              resetForm();
            }
            showAlert('Deleted', 'Shift handover record has been deleted successfully.');
          } else {
            showAlert('Error', response?.message || 'Unable to delete handover.');
          }
        } catch {
          showAlert('Error', 'Unable to delete handover. Please try again.');
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  const handleSubmit = async () => {
    // 1. OPD Validation
    if (!opd || !opd.trim()) {
      showAlert('Missing OPD', 'Please enter the OPD or Department name.');
      return;
    }

    // 2. Token Validation
    if (!currentToken || !currentToken.trim()) {
      showAlert('Missing Token', 'Please enter the currently serving token number (e.g. A045).');
      return;
    }

    // 3. Patients Waiting Validation
    const waitingNum = Number(numberWaiting);
    if (numberWaiting.trim() === '' || isNaN(waitingNum) || waitingNum < 0 || !Number.isInteger(waitingNum)) {
      showAlert('Invalid Waiting Count', 'Patients waiting must be a non-negative whole number (0, 1, 2, ...).');
      return;
    }

    // 4. Priority Waiting Validation
    const priorityNum = Number(numberPriority);
    if (numberPriority.trim() === '' || isNaN(priorityNum) || priorityNum < 0 || !Number.isInteger(priorityNum)) {
      showAlert('Invalid Priority Count', 'Priority waiting must be a non-negative whole number (0, 1, 2, ...).');
      return;
    }

    if (priorityNum > waitingNum) {
      showAlert('Validation Error', 'Priority waiting patients cannot exceed the total number of patients waiting.');
      return;
    }

    // 5. Notes Validation
    if (!notes || notes.trim().length < 5) {
      showAlert('Notes Too Short', 'Please enter descriptive handover notes or remarks (at least 5 characters).');
      return;
    }

    const payload = {
      shift,
      opd: opd.trim(),
      currentToken: currentToken.trim().toUpperCase(),
      numberWaiting: waitingNum,
      numberPriority: priorityNum,
      notes: notes.trim(),
    };

    try {
      setSubmitting(true);

      if (editingHandoverId) {
        // UPDATE Handover
        const response = await staffApi.updateHandover(editingHandoverId, payload);
        if (response && response.success) {
          showAlert('Update Successful', 'Shift handover record updated successfully.', [
            {
              text: 'View Logs',
              onPress: () => {
                resetForm();
                fetchHandovers();
                setActiveTab('history');
              },
            },
          ]);
          resetForm();
          fetchHandovers();
          setActiveTab('history');
        } else {
          showAlert('Error', response?.message || 'Unable to update handover.');
        }
      } else {
        // CREATE Handover
        const response = await staffApi.createHandover(payload);
        if (response && response.success) {
          showAlert('Submission Successful', 'Shift handover notes have been logged successfully.', [
            {
              text: 'View Logs',
              onPress: () => {
                resetForm();
                fetchHandovers();
                setActiveTab('history');
              },
            },
          ]);
          resetForm();
          fetchHandovers();
          setActiveTab('history');
        } else {
          showAlert('Error', response?.message || 'Unable to save handover.');
        }
      }
    } catch {
      showAlert('Error', `Unable to ${editingHandoverId ? 'update' : 'save'} handover. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHandovers = handovers.filter((h) => {
    if (filterShift === 'All') return true;
    return h.shift === filterShift;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHandovers(true)}
            colors={[THEME]}
            tintColor={THEME}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.9)" style={{ marginBottom: 6 }} />
          <Text style={styles.headerTitle}>Shift Handover</Text>
          <Text style={styles.headerSub}>Log, view, and manage operational handover notes</Text>

          {/* Segmented Tab Controls */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'form' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('form')}
              activeOpacity={0.85}
            >
              <Ionicons
                name={editingHandoverId ? 'create' : 'add-circle'}
                size={16}
                color={activeTab === 'form' ? THEME : 'rgba(255,255,255,0.85)'}
              />
              <Text style={[styles.segmentText, activeTab === 'form' && styles.segmentTextActive]}>
                {editingHandoverId ? 'Edit Handover' : 'Log Handover'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'history' && styles.segmentBtnActive]}
              onPress={() => {
                setActiveTab('history');
                fetchHandovers();
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name="list"
                size={16}
                color={activeTab === 'history' ? THEME : 'rgba(255,255,255,0.85)'}
              />
              <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
                View Logs {handovers.length > 0 ? `(${handovers.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TAB 1: FORM SECTION */}
        {activeTab === 'form' && (
          <FadeInUpView duration={350} style={styles.formArea}>
            {/* Editing Notice Banner */}
            {editingHandoverId && (
              <View style={styles.editNoticeBanner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name="pencil" size={18} color="#e67e22" style={{ marginRight: 8 }} />
                  <Text style={styles.editNoticeText}>Editing Handover Record</Text>
                </View>
                <TouchableOpacity onPress={resetForm} style={styles.cancelEditBtn}>
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Shift Selector */}
            <Text style={styles.sectionLabel}>Select Shift</Text>
            <View style={styles.shiftRow}>
              {SHIFTS.map((s) => {
                const isSelected = shift === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.shiftCard,
                      isSelected && { backgroundColor: s.color, borderColor: s.color },
                    ]}
                    onPress={() => setShift(s.key)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name={s.icon} size={22} color={isSelected ? '#fff' : s.color} />
                    <Text style={[styles.shiftCardText, isSelected && { color: '#fff' }]}>{s.key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* OPD Field */}
            <Text style={styles.fieldLabel}>OPD / Department</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business" size={18} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={opd}
                onChangeText={setOpd}
                placeholder="e.g. General OPD"
                placeholderTextColor="#bdc3c7"
              />
            </View>

            {/* Currently Serving */}
            <Text style={styles.fieldLabel}>Currently Serving Token</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="ticket" size={18} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={currentToken}
                onChangeText={setCurrentToken}
                placeholder="e.g. A045"
                placeholderTextColor="#bdc3c7"
                autoCapitalize="characters"
              />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Patients Waiting</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people" size={18} color="#7f8c8d" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={numberWaiting}
                    onChangeText={setNumberWaiting}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#bdc3c7"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Priority Waiting</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="alert-circle" size={18} color="#e74c3c" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={numberPriority}
                    onChangeText={setNumberPriority}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#bdc3c7"
                  />
                </View>
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>Important Notes / Remarks</Text>
            <TextInput
              style={[styles.inputWrapper, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Write pending tasks, special instructions, or patient status notes here..."
              placeholderTextColor="#bdc3c7"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit / Update Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={editingHandoverId ? 'checkmark-circle' : 'send'}
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitText}>
                    {editingHandoverId ? 'Update Handover' : 'Submit Handover'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {editingHandoverId && (
              <TouchableOpacity style={styles.cancelFullBtn} onPress={resetForm} activeOpacity={0.85}>
                <Ionicons name="close-circle-outline" size={18} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.cancelFullText}>Cancel Editing</Text>
              </TouchableOpacity>
            )}

            {/* Quick Preview of Recent Handover */}
            {handovers.length > 0 && !editingHandoverId && (
              <View style={styles.previewSection}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Most Recent Handover</Text>
                  <TouchableOpacity onPress={() => setActiveTab('history')}>
                    <Text style={styles.viewAllLink}>View All ({handovers.length}) ➔</Text>
                  </TouchableOpacity>
                </View>

                {renderHandoverCard(handovers[0])}
              </View>
            )}

            <View style={{ height: 40 }} />
          </FadeInUpView>
        )}

        {/* TAB 2: VIEW / HISTORY SECTION (FULL CRUD) */}
        {activeTab === 'history' && (
          <FadeInUpView duration={350} style={styles.historyArea}>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {['All', 'Morning', 'Evening', 'Night'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filterShift === f && styles.filterChipActive]}
                  onPress={() => setFilterShift(f)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.filterText, filterShift === f && styles.filterTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading Indicator */}
            {loadingHandovers && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME} />
                <Text style={styles.loadingText}>Loading shift handovers...</Text>
              </View>
            ) : filteredHandovers.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={54} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Handovers Found</Text>
                <Text style={styles.emptySub}>
                  {filterShift === 'All'
                    ? 'No shift handovers have been submitted yet.'
                    : `No handovers recorded for the ${filterShift} shift.`}
                </Text>
                <TouchableOpacity
                  style={styles.createFirstBtn}
                  onPress={() => {
                    resetForm();
                    setActiveTab('form');
                  }}
                >
                  <Ionicons name="add-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.createFirstBtnText}>Log New Handover</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Handover Records List */
              <View style={styles.recordsList}>
                {filteredHandovers.map((item) => (
                  <View key={item._id} style={{ marginBottom: 14 }}>
                    {renderHandoverCard(item)}
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </FadeInUpView>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // Helper to render an individual Handover Card with Edit & Delete actions
  function renderHandoverCard(item) {
    const shiftConfig = SHIFTS.find((s) => s.key === item.shift) || SHIFTS[0];
    const isDeleting = deletingId === item._id;

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.shiftBadge, { backgroundColor: shiftConfig.bg, borderColor: shiftConfig.color }]}>
            <Ionicons name={shiftConfig.icon} size={14} color={shiftConfig.color} style={{ marginRight: 4 }} />
            <Text style={[styles.shiftBadgeText, { color: shiftConfig.color }]}>{item.shift} Shift</Text>
          </View>

          <View style={styles.opdBadge}>
            <Ionicons name="business" size={12} color="#005A71" style={{ marginRight: 4 }} />
            <Text style={styles.opdBadgeText}>{item.opd || 'General OPD'}</Text>
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={13} color="#64748B" style={{ marginRight: 5 }} />
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Serving Token</Text>
            <View style={styles.tokenTag}>
              <Text style={styles.tokenTagText}>{item.currentToken || 'None'}</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Waiting</Text>
            <Text style={styles.metricValue}>{item.numberWaiting ?? 0}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Priority</Text>
            <Text style={[styles.metricValue, { color: '#e74c3c' }]}>{item.numberPriority ?? 0}</Text>
          </View>
        </View>

        {/* Notes Block */}
        <View style={styles.notesBlock}>
          <Text style={styles.notesTitle}>Remarks & Notes:</Text>
          <Text style={styles.notesBody}>{item.notes || 'No remarks added.'}</Text>
        </View>

        {/* Card Footer with Creator Info & Action Buttons */}
        <View style={styles.cardFooter}>
          <View style={styles.authorContainer}>
            <Ionicons name="person-circle-outline" size={16} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.authorText}>
              {item.createdBy?.fullName ? `Nurse ${item.createdBy.fullName}` : 'Staff Member'}
            </Text>
          </View>

          {/* Action Buttons (Full CRUD: Update & Delete) */}
          <View style={styles.actionsRow}>
            {/* Edit / Update Button */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEditPress(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={14} color="#005A71" style={{ marginRight: 4 }} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.deleteBtn, isDeleting && { opacity: 0.6 }]}
              onPress={() => handleDeletePress(item)}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#e74c3c" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={14} color="#e74c3c" style={{ marginRight: 4 }} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    backgroundColor: THEME,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, textAlign: 'center' },

  /* Segmented Controls */
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 14,
    padding: 4,
    marginTop: 18,
    width: '100%',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  segmentTextActive: {
    color: THEME,
  },

  /* Form Section */
  formArea: { padding: 20, backgroundColor: '#FFFFFF' },

  editNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  editNoticeText: { fontSize: 13, fontWeight: '700', color: '#C2410C' },
  cancelEditBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FED7AA',
    borderRadius: 6,
  },
  cancelEditText: { fontSize: 12, fontWeight: '700', color: '#9A3412' },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },

  shiftRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  shiftCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  shiftCardText: { fontSize: 13, fontWeight: '700', color: '#0F2A38' },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#0F2A38', marginBottom: 8, marginTop: 12 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#0F2A38', paddingVertical: 12 },

  statsRow: { flexDirection: 'row' },

  textarea: {
    minHeight: 100,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    fontSize: 14,
    color: '#0F2A38',
    flexDirection: 'column',
  },

  submitBtn: {
    backgroundColor: THEME,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  cancelFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cancelFullText: { fontSize: 14, fontWeight: '700', color: '#64748B' },

  /* Preview Section */
  previewSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: { fontSize: 14, fontWeight: '800', color: '#0F2A38' },
  viewAllLink: { fontSize: 13, fontWeight: '700', color: THEME },

  /* History / View Section */
  historyArea: { padding: 18, backgroundColor: '#FFFFFF' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: { backgroundColor: THEME },
  filterText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF' },

  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },

  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 14 },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, maxWidth: 260 },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  createFirstBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  recordsList: { gap: 14 },

  /* Handover Card Design */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  shiftBadgeText: { fontSize: 12, fontWeight: '700' },
  opdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  opdBadgeText: { fontSize: 11, fontWeight: '700', color: '#005A71' },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: { fontSize: 12, color: '#64748B' },

  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2A38',
  },
  tokenTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tokenTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME,
  },

  notesBlock: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: THEME,
    paddingLeft: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  notesBody: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Actions (Update & Delete) */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005A71',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 64,
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e74c3c',
  },
});

export default StaffShiftHandoverScreen;
