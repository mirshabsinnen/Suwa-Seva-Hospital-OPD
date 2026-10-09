import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPatientDetails, createConsultationDraft, updateConsultationDraft, completeConsultation } from '../../services/doctorApi';

const ConsultationNotesScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchDetails = async () => {
    try {
      const data = await getPatientDetails(queueId);
      setDetails(data);
      if (data.consultation) {
        setSymptoms(data.consultation.symptoms || '');
        setDiagnosis(data.consultation.diagnosis || '');
        setNotes(data.consultation.notes || '');
      }
    } catch (error) {
      console.error('Failed to fetch details', error);
      showToast('Error: Could not load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [queueId]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (details.consultation) {
        await updateConsultationDraft(details.consultation._id, { symptoms, diagnosis, notes });
      } else {
        await createConsultationDraft({ queueId, symptoms, diagnosis, notes });
      }
      showToast('Draft Saved Successfully!');
      fetchDetails();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save draft.');
    } finally {
      setSaving(false);
    }
  };

  const executeComplete = async () => {
    setSaving(true);
    try {
      let consultationId = details.consultation?._id;
      if (!consultationId) {
        const res = await createConsultationDraft({ queueId, symptoms, diagnosis, notes });
        consultationId = res._id;
      }
      await completeConsultation(consultationId, { symptoms, diagnosis, notes });
      showToast('Consultation Completed!');
      setTimeout(() => {
        navigation.navigate('DoctorTabs');
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not complete consultation.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Are you sure you want to complete this consultation? This cannot be undone.");
      if (confirm) {
        executeComplete();
      }
    } else {
      // Direct execution to avoid Alert issues on web if Platform check fails
      executeComplete();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#005A71" />
      </View>
    );
  }

  const { queue, consultation } = details;
  const isCompleted = consultation?.status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      {toastMsg !== '' && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Notes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{queue?.patientId?.fullName}</Text>
          <Text style={styles.patientMeta}>Token: {queue?.tokenNumber} | {queue?.priority}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>COMPLETED</Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Symptoms</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter symptoms..."
          multiline
          numberOfLines={4}
          value={symptoms}
          onChangeText={setSymptoms}
          editable={!isCompleted}
        />

        <Text style={styles.label}>Diagnosis</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter diagnosis..."
          multiline
          numberOfLines={4}
          value={diagnosis}
          onChangeText={setDiagnosis}
          editable={!isCompleted}
        />

        <Text style={styles.label}>Additional Notes / Prescriptions</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter notes..."
          multiline
          numberOfLines={6}
          value={notes}
          onChangeText={setNotes}
          editable={!isCompleted}
        />
      </ScrollView>

      {!isCompleted && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btn, styles.draftBtn]} 
            onPress={handleSaveDraft}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#005A71" /> : <Text style={styles.draftBtnText}>Save Draft</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.completeBtn]} 
            onPress={handleComplete}
            disabled={saving}
          >
            <Text style={styles.completeBtnText}>Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  toastContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5
  },
  toastText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#005A71', padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  body: { padding: 15 },
  patientInfo: { backgroundColor: '#e8f4f8', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  patientMeta: { fontSize: 14, color: '#666', marginTop: 4 },
  completedBadge: { backgroundColor: '#4caf50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  completedText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 15
  },
  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  draftBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#005A71' },
  draftBtnText: { color: '#005A71', fontSize: 16, fontWeight: 'bold' },
  completeBtn: { backgroundColor: '#005A71' },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ConsultationNotesScreen;
