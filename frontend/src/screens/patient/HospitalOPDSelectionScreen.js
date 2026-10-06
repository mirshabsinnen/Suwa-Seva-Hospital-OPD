import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const HospitalOPDSelectionScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [opds, setOpds] = useState([]);
  
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedOpd, setSelectedOpd] = useState(null);
  
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingOpds, setLoadingOpds] = useState(false);

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
    fetchOpds(hospital._id);
  };

  const handleOpdSelect = (opd) => {
    setSelectedOpd(opd);
  };

  const handleContinue = () => {
    if (!selectedHospital || !selectedOpd) {
      Alert.alert('Selection Required', 'Please select both a hospital and an OPD');
      return;
    }
    // Navigate to next screen
    navigation.navigate('DateSlotSelection', { hospital: selectedHospital, opd: selectedOpd });
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
            {hospitals.map(hospital => (
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
            ))}
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedHospital || !selectedOpd) && styles.continueButtonDisabled]}
          disabled={!selectedHospital || !selectedOpd}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1 },
  contentContainer: { padding: 15, paddingBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#005A71', marginTop: 15, marginBottom: 10 },
  listContainer: { marginBottom: 10 },
  itemCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  itemCardSelected: { borderColor: '#005A71', backgroundColor: '#eef6f9' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#666' },
  itemTextSelected: { color: '#005A71' },
  emptyText: { color: '#666', fontStyle: 'italic', marginBottom: 20 },
  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  continueButton: { backgroundColor: '#005A71', padding: 15, borderRadius: 10, alignItems: 'center' },
  continueButtonDisabled: { backgroundColor: '#005A7180' },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default HospitalOPDSelectionScreen;
