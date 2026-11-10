import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const HospitalOPDSelectionScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [opds, setOpds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedOpd, setSelectedOpd] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingOpds, setLoadingOpds] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const res = await api.get('/hospitals');
      setHospitals(res.data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load hospitals');
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchOpds = async (hospitalId) => {
    try {
      setLoadingOpds(true);
      const res = await api.get(`/hospitals/${hospitalId}/opds`);
      setOpds(res.data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load OPDs');
    } finally {
      setLoadingOpds(false);
    }
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setSelectedOpd(null); // Reset OPD selection
    setSelectedDoctor(null); // Reset Doctor selection
    setDoctors([]);
    fetchOpds(hospital._id);
  };

  const fetchDoctors = async (opdId) => {
    try {
      setLoadingDoctors(true);
      const res = await api.get(`/users/doctors/opd/${opdId}`);
      setDoctors(res.data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleOpdSelect = (opd) => {
    setSelectedOpd(opd);
    setSelectedDoctor(null);
    fetchDoctors(opd._id);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleContinue = () => {
    if (!selectedHospital || !selectedOpd || !selectedDoctor) {
      Alert.alert('Selection Required', 'Please select a hospital, an OPD, and a doctor');
      return;
    }
    // Navigate to next screen
    navigation.navigate('DateSlotSelection', { hospital: selectedHospital, opd: selectedOpd, doctor: selectedDoctor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Hospital & OPD</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hospital Selection */}
        <Text style={styles.sectionTitle}>1. Select Hospital</Text>
        {loadingHospitals ? (
          <ActivityIndicator color="#005A71" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.listContainer}>
            {hospitals.length === 0 ? (
              <Text style={styles.emptyText}>No hospitals available at the moment. Please ensure you are logged in.</Text>
            ) : (
              hospitals.map(hospital => (
                <TouchableOpacity
                  key={hospital._id}
                  style={[styles.itemCard, selectedHospital?._id === hospital._id && styles.itemCardSelected]}
                  onPress={() => handleHospitalSelect(hospital)}
                >
                  <Text style={[styles.itemTitle, selectedHospital?._id === hospital._id && styles.itemTextSelected]}>
                    {hospital.name}
                  </Text>
                  <Text style={[styles.itemDesc, selectedHospital?._id === hospital._id && styles.itemTextSelected]}>
                    {hospital.location}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* OPD Selection */}
        {selectedHospital && (
          <>
            <Text style={styles.sectionTitle}>2. Select OPD</Text>
            {loadingOpds ? (
              <ActivityIndicator color="#005A71" style={{ marginVertical: 20 }} />
            ) : opds.length === 0 ? (
              <Text style={styles.emptyText}>No OPDs available for this hospital.</Text>
            ) : (
              <View style={styles.listContainer}>
                {opds.map(opd => (
                  <TouchableOpacity
                    key={opd._id}
                    style={[styles.itemCard, selectedOpd?._id === opd._id && styles.itemCardSelected]}
                    onPress={() => handleOpdSelect(opd)}
                  >
                    <Text style={[styles.itemTitle, selectedOpd?._id === opd._id && styles.itemTextSelected]}>
                      {opd.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Doctor Selection */}
        {selectedOpd && (
          <>
            <Text style={styles.sectionTitle}>3. Select Doctor</Text>
            {loadingDoctors ? (
              <ActivityIndicator color="#005A71" style={{ marginVertical: 20 }} />
            ) : doctors.length === 0 ? (
              <Text style={styles.emptyText}>No doctors available for this OPD.</Text>
            ) : (
              <View style={styles.listContainer}>
                {doctors.map(doctor => (
                  <TouchableOpacity
                    key={doctor._id}
                    style={[styles.itemCard, selectedDoctor?._id === doctor._id && styles.itemCardSelected]}
                    onPress={() => handleDoctorSelect(doctor)}
                  >
                    <Text style={[styles.itemTitle, selectedDoctor?._id === doctor._id && styles.itemTextSelected]}>
                      Dr. {doctor.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedHospital || !selectedOpd || !selectedDoctor) && styles.continueButtonDisabled]}
          disabled={!selectedHospital || !selectedOpd || !selectedDoctor}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  content: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { padding: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#005A71', marginTop: 14, marginBottom: 10, letterSpacing: 0.3 },
  listContainer: { marginBottom: 12 },
  itemCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1.5, borderColor: '#E5ECF0' },
  itemCardSelected: { borderColor: '#005A71', backgroundColor: '#F0F7F9' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1B2C36', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#688291' },
  itemTextSelected: { color: '#005A71' },
  emptyText: { color: '#688291', fontStyle: 'italic', marginBottom: 20 },
  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EBF1F4' },
  continueButton: { backgroundColor: '#005A71', paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: '#005A71', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  continueButtonDisabled: { backgroundColor: '#B0C8D0', elevation: 0, shadowOpacity: 0 },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});

export default HospitalOPDSelectionScreen;
