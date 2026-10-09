import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, FlatList, Modal, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
};

const AVAILABLE_DATES = generateDates();

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
];

const formatDate = (dateStr) => {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

const formatShortDate = (dateStr) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

// ─── showAlert: works on both web and native ──────────────────────────────────
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MyAppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancel confirmation modal
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule modal
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);

  // ── Fetch appointments ──────────────────────────────────────────────────
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to load appointments.';
      showAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  // ── Cancel flow ─────────────────────────────────────────────────────────
  const openCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      setCancelling(true);
      await api.delete(`/appointments/${appointmentToCancel._id}`);
      setCancelModalVisible(false);
      setAppointmentToCancel(null);
      fetchAppointments();
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to cancel. Please try again.';
      showAlert('Error', msg);
    } finally {
      setCancelling(false);
    }
  };

  // ── Reschedule flow ─────────────────────────────────────────────────────
  const openRescheduleModal = (appointment) => {
    setAppointmentToReschedule(appointment);
    setSelectedDate(null);
    setSelectedTime(null);
    setRescheduleModalVisible(true);
  };

  const confirmReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      showAlert('Required', 'Please select a new date and time slot.');
      return;
    }
    try {
      setRescheduling(true);
      await api.put(`/appointments/${appointmentToReschedule._id}`, {
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        status: 'rescheduled',
      });
      setRescheduleModalVisible(false);
      setAppointmentToReschedule(null);
      fetchAppointments();
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to reschedule. Please try again.';
      showAlert('Error', msg);
    } finally {
      setRescheduling(false);
    }
  };

  // ── Status badge helper ─────────────────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status) {
      case 'cancelled':   return { badge: styles.badgeCancelled,   text: styles.textCancelled   };
      case 'completed':   return { badge: styles.badgeCompleted,   text: styles.textCompleted   };
      case 'rescheduled': return { badge: styles.badgeRescheduled, text: styles.textRescheduled };
      default:            return { badge: {},                      text: {}                     };
    }
  };

  // ── Appointment card ────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const isActionable = item.status === 'confirmed' || item.status === 'rescheduled';
    const { badge, text } = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.rowCenter}>
            <Ionicons name="business" size={20} color="#005A71" />
            <Text style={styles.hospitalName}>{item.hospitalId?.name}</Text>
          </View>
          <View style={[styles.statusBadge, badge]}>
            <Text style={[styles.statusText, text]}>{(item.status || 'booked').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.opdText}>OPD: {item.opdId?.name}</Text>
          {item.doctorId && (
            <Text style={styles.opdText}>Doctor: Dr. {item.doctorId?.fullName}</Text>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.infoText}> {formatDate(item.appointmentDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}> {item.appointmentTime}</Text>
          </View>
        </View>

        {isActionable && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.rescheduleBtn}
              onPress={() => openRescheduleModal(item)}
            >
              <Ionicons name="calendar" size={14} color="#005A71" />
              <Text style={styles.rescheduleText}> Reschedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => openCancelModal(item)}
            >
              <Ionicons name="close-circle-outline" size={14} color="#dc3545" />
              <Text style={styles.cancelText}> Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#005A71" />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>You have no appointments yet.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ══════════════════════════════════════════════════
          CANCEL CONFIRMATION MODAL
          Works on both web and native (no Alert.alert)
      ══════════════════════════════════════════════════ */}
      <Modal
        visible={cancelModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.overlayCenter}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="warning-outline" size={40} color="#dc3545" />
            </View>
            <Text style={styles.confirmTitle}>Cancel Appointment?</Text>
            {appointmentToCancel && (
              <View style={styles.confirmInfo}>
                <Text style={styles.confirmInfoText}>
                  🏥 {appointmentToCancel.hospitalId?.name}
                </Text>
                <Text style={styles.confirmInfoText}>
                  🩺 {appointmentToCancel.opdId?.name}
                </Text>
                <Text style={styles.confirmInfoText}>
                  📅 {formatDate(appointmentToCancel.appointmentDate)}
                </Text>
                <Text style={styles.confirmInfoText}>
                  ⏰ {appointmentToCancel.appointmentTime}
                </Text>
              </View>
            )}
            <Text style={styles.confirmMessage}>
              This action cannot be undone. Are you sure you want to cancel this appointment?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.btnKeep}
                onPress={() => setCancelModalVisible(false)}
                disabled={cancelling}
              >
                <Text style={styles.btnKeepText}>Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirmCancel}
                onPress={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnConfirmCancelText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════
          RESCHEDULE MODAL
      ══════════════════════════════════════════════════ */}
      <Modal
        visible={rescheduleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.overlayBottom}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Reschedule Appointment</Text>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {appointmentToReschedule && (
              <View style={styles.sheetInfo}>
                <Text style={styles.sheetInfoText}>
                  🏥 {appointmentToReschedule.hospitalId?.name}
                </Text>
                <Text style={styles.sheetInfoText}>
                  🩺 OPD: {appointmentToReschedule.opdId?.name}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetSectionTitle}>Select New Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {AVAILABLE_DATES.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[styles.dateChip, selectedDate === date && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dateChipText, selectedDate === date && styles.dateChipTextSel]}>
                      {formatShortDate(date)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sheetSectionTitle}>Select New Time Slot</Text>
              <View style={styles.slotGrid}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.slotChip, selectedTime === time && styles.slotChipSelected]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.slotChipText, selectedTime === time && styles.slotChipTextSel]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.confirmRescheduleBtn,
                (!selectedDate || !selectedTime) && styles.confirmRescheduleBtnDisabled,
              ]}
              onPress={confirmReschedule}
              disabled={!selectedDate || !selectedTime || rescheduling}
            >
              {rescheduling ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmRescheduleBtnText}>Confirm Reschedule</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF1F4',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  emptyText: { marginTop: 12, fontSize: 15, color: '#688291' },
  listContainer: { padding: 16, backgroundColor: '#FFFFFF' },

  // ── Card ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5ECF0',
    shadowColor: '#005A71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  hospitalName: { fontSize: 15, fontWeight: 'bold', color: '#005A71', marginLeft: 8, flexShrink: 1 },

  statusBadge: { backgroundColor: '#d4edda', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeCancelled:   { backgroundColor: '#f8d7da' },
  badgeCompleted:   { backgroundColor: '#e2e3e5' },
  badgeRescheduled: { backgroundColor: '#fff3cd' },
  statusText:       { color: '#155724', fontSize: 10, fontWeight: 'bold' },
  textCancelled:    { color: '#721c24' },
  textCompleted:    { color: '#383d41' },
  textRescheduled:  { color: '#856404' },

  cardBody: { marginBottom: 12 },
  opdText:  { fontSize: 14, color: '#333', marginBottom: 6, fontWeight: '500' },
  infoRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  infoText: { fontSize: 13, color: '#666' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    gap: 12,
  },
  rescheduleBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#005A71',
  },
  rescheduleText: { color: '#005A71', fontWeight: '600', fontSize: 13 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#dc3545',
  },
  cancelText: { color: '#dc3545', fontWeight: '600', fontSize: 13 },

  // ── Cancel confirmation modal ──────────────────────────────────────────
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmIconWrap: {
    width: 70, height: 70,
    borderRadius: 35,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  confirmInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 12,
  },
  confirmInfoText: { fontSize: 13, color: '#555', marginBottom: 4 },
  confirmMessage: {
    fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20,
  },
  confirmButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  btnKeep: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#005A71', alignItems: 'center',
  },
  btnKeepText: { color: '#005A71', fontWeight: '700', fontSize: 15 },
  btnConfirmCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#dc3545', alignItems: 'center',
  },
  btnConfirmCancelText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // ── Reschedule bottom sheet modal ──────────────────────────────────────
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sheetInfo:  { backgroundColor: '#f0f8fb', borderRadius: 10, padding: 12, marginBottom: 15 },
  sheetInfoText: { fontSize: 14, color: '#005A71', marginBottom: 4 },
  sheetSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#005A71', marginBottom: 12, marginTop: 8 },

  dateScroll: { marginBottom: 10 },
  dateChip: {
    backgroundColor: '#f0f0f0', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#e0e0e0',
    minWidth: 90, alignItems: 'center',
  },
  dateChipSelected:    { backgroundColor: '#eef6f9', borderColor: '#005A71' },
  dateChipText:        { fontSize: 13, color: '#333', fontWeight: '600' },
  dateChipTextSel:     { color: '#005A71' },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slotChip: {
    width: '46%', backgroundColor: '#f0f0f0', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0',
  },
  slotChipSelected:    { backgroundColor: '#eef6f9', borderColor: '#005A71' },
  slotChipText:        { fontSize: 13, color: '#333', fontWeight: '600' },
  slotChipTextSel:     { color: '#005A71' },

  confirmRescheduleBtn: {
    backgroundColor: '#005A71', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5,
  },
  confirmRescheduleBtnDisabled: { backgroundColor: '#005A7180' },
  confirmRescheduleBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default MyAppointmentScreen;
