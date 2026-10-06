import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Alert 
} from 'react-native';
import staffApi from '../../../services/staffApi';

const StaffShiftHandoverScreen = ({ navigation }) => {
  const [shift, setShift] = useState('Morning');
  const [opd, setOpd] = useState('General OPD');
  const [currentToken, setCurrentToken] = useState('');
  const [numberWaiting, setNumberWaiting] = useState('');
  const [numberPriority, setNumberPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!currentToken || !numberWaiting || !numberPriority || !notes) {
      Alert.alert('Validation Error', 'Please fill in all the fields before submitting the handover.');
      return;
    }

    const payload = {
      shift,
      opd,
      currentToken,
      numberWaiting: Number(numberWaiting),
      numberPriority: Number(numberPriority),
      notes
    };

    try {
      setSubmitting(true);
      const response = await staffApi.createHandover(payload);
      if (response.success) {
        Alert.alert(
          'Handover Successful', 
          'Shift handover notes have been saved.', 
          [
            { text: 'Back to Dashboard', onPress: () => navigation.navigate('StaffDashboard') }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to save handover. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>Create Shift Handover</Text>
        <Text style={styles.pageSubtitle}>Leave operational notes for the next shift</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Shift Selection */}
        <Text style={styles.label}>Shift Selection</Text>
        <View style={styles.shiftSelector}>
          {['Morning', 'Evening', 'Night'].map((s) => (
            <TouchableOpacity 
              key={s}
              style={[styles.shiftChip, shift === s && styles.shiftChipActive]}
              onPress={() => setShift(s)}
            >
              <Text style={[styles.shiftChipText, shift === s && styles.shiftChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>OPD / Department</Text>
        <TextInput 
          style={styles.input}
          value={opd}
          onChangeText={setOpd}
          placeholder="e.g. General OPD"
          placeholderTextColor="#95a5a6"
        />

        <Text style={styles.label}>Currently Serving Token</Text>
        <TextInput 
          style={styles.input}
          value={currentToken}
          onChangeText={setCurrentToken}
          placeholder="e.g. A045"
          placeholderTextColor="#95a5a6"
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Patients Waiting</Text>
            <TextInput 
              style={styles.input}
              value={numberWaiting}
              onChangeText={setNumberWaiting}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#95a5a6"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Priority Waiting</Text>
            <TextInput 
              style={styles.input}
              value={numberPriority}
              onChangeText={setNumberPriority}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#95a5a6"
            />
          </View>
        </View>

        <Text style={styles.label}>Important Notes / Remarks</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Write any pending tasks or special instructions here..."
          placeholderTextColor="#95a5a6"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Handover</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.spacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  headerArea: { backgroundColor: '#0a3d62', padding: 25, paddingBottom: 35, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  pageSubtitle: { color: '#d1d8e0', fontSize: 14, marginTop: 5 },
  
  formContainer: { padding: 20, marginTop: -20 },
  
  label: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, marginTop: 15 },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#bdc3c7', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    fontSize: 16,
    color: '#34495e'
  },
  textArea: { height: 100 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },

  shiftSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  shiftChip: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdc3c7', paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  shiftChipActive: { backgroundColor: '#0a3d62', borderColor: '#0a3d62' },
  shiftChipText: { color: '#7f8c8d', fontWeight: 'bold' },
  shiftChipTextActive: { color: '#fff' },

  submitButton: { backgroundColor: '#27ae60', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  disabledButton: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  spacer: { height: 40 }
});

export default StaffShiftHandoverScreen;
