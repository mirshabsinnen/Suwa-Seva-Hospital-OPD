import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPatientDetails, startConsultation } from '../../services/doctorApi';
import { useFocusEffect } from '@react-navigation/native';

const PatientDetailsScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await getPatientDetails(queueId);
      setDetails(data);
    } catch (error) {
      console.error('Failed to fetch details', error);
      Alert.alert('Error', 'Could not load patient details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [queueId])
  );

  const handleStartConsultation = async () => {
    setActionLoading(true);
    try {
      await startConsultation(queueId);
      fetchDetails(); 
      Alert.alert('Success', 'Consultation started.');
      navigation.navigate('ConsultationNotes', { queueId });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not start consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#005A71" />
      </View>
    );
  }

  const { queue, appointment, consultation } = details;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patient Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{queue?.patientId?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{queue?.patientId?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{queue?.patientId?.phone}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hospital:</Text>
            <Text style={styles.infoValue}>{appointment?.hospitalId?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>OPD:</Text>
            <Text style={styles.infoValue}>{appointment?.opdId?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date(appointment?.appointmentDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{appointment?.appointmentTime}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Queue Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token:</Text>
            <Text style={styles.infoValue}>{queue?.tokenNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: '#005A71', fontWeight: 'bold' }]}>{queue?.status.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority:</Text>
            <Text style={styles.infoValue}>{queue?.priority}</Text>
          </View>
        </View>

        {consultation && (
          <View style={[styles.card, { backgroundColor: '#f0f9ff' }]}>
            <Text style={styles.cardTitle}>Consultation Exists</Text>
            <Text style={{ marginBottom: 10 }}>Status: {consultation.status}</Text>
            <TouchableOpacity 
              style={styles.outlineBtn}
              onPress={() => navigation.navigate('ConsultationNotes', { queueId, consultationId: consultation._id })}
            >
              <Text style={styles.outlineBtnText}>View/Edit Notes</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        {!consultation && queue?.status === 'called' && (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={handleStartConsultation}
            disabled={actionLoading}
          >
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Start Consultation</Text>}
          </TouchableOpacity>
        )}
        
        {(!consultation && queue?.status !== 'called') && (
          <Text style={styles.helperText}>
            Consultation can only be started when patient is "CALLED" by staff. Current status is "{queue?.status.toUpperCase()}".
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#005A71', padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  body: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { width: 80, fontSize: 14, color: '#666' },
  infoValue: { flex: 1, fontSize: 14, color: '#333' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  primaryBtn: { backgroundColor: '#005A71', padding: 15, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineBtn: { borderWidth: 1, borderColor: '#005A71', padding: 10, borderRadius: 8, alignItems: 'center' },
  outlineBtnText: { color: '#005A71', fontSize: 14, fontWeight: 'bold' },
  helperText: { color: '#e53935', fontSize: 13, textAlign: 'center' }
});

export default PatientDetailsScreen;
