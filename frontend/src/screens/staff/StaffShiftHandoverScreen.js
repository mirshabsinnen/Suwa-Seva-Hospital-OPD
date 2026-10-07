import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, Platform, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import staffApi from '../../services/staffApi';

const THEME = '#0a3d62';

const showAlert = (title, msg, buttons) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${msg}`);
    buttons?.[0]?.onPress?.();
  } else {
    Alert.alert(title, msg, buttons);
  }
};

const SHIFTS = [
  { key: 'Morning', icon: 'sunny', color: '#f39c12' },
  { key: 'Evening', icon: 'partly-sunny', color: '#e67e22' },
  { key: 'Night',   icon: 'moon',        color: '#2980b9' },
];

const StaffShiftHandoverScreen = ({ navigation }) => {
  const [shift, setShift] = useState('Morning');
  const [opd, setOpd] = useState('General OPD');
  const [currentToken, setCurrentToken] = useState('');
  const [numberWaiting, setNumberWaiting] = useState('');
  const [numberPriority, setNumberPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentToken || !numberWaiting || !numberPriority || !notes) {
      showAlert('Missing Fields', 'Please fill in all fields before submitting the handover.');
      return;
    }

    const payload = { shift, opd, currentToken, numberWaiting: Number(numberWaiting), numberPriority: Number(numberPriority), notes };

    try {
      setSubmitting(true);
      const response = await staffApi.createHandover(payload);
      if (response.success) {
        showAlert('Update Successful', 'Shift handover notes have been saved successfully.', [
          { text: 'OK', onPress: () => navigation.navigate('StaffHomeTab') }
        ]);
      }
    } catch {
      showAlert('Error', 'Unable to save handover. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.8)" style={{ marginBottom: 8 }} />
          <Text style={styles.headerTitle}>Shift Handover</Text>
          <Text style={styles.headerSub}>Leave operational notes for the next shift</Text>
        </View>

        <View style={styles.formArea}>
          {/* Shift Selector */}
          <Text style={styles.sectionLabel}>Select Shift</Text>
          <View style={styles.shiftRow}>
            {SHIFTS.map(s => (
              <TouchableOpacity
                key={s.key}
                style={[styles.shiftCard, shift === s.key && { backgroundColor: s.color, borderColor: s.color }]}
                onPress={() => setShift(s.key)}
                activeOpacity={0.85}
              >
                <Ionicons name={s.icon} size={22} color={shift === s.key ? '#fff' : s.color} />
                <Text style={[styles.shiftCardText, shift === s.key && { color: '#fff' }]}>{s.key}</Text>
              </TouchableOpacity>
            ))}
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
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Submit */}
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
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitText}>Submit Handover</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    backgroundColor: THEME,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: '#a0c4e0', fontSize: 13, marginTop: 6, textAlign: 'center' },

  formArea: { padding: 20, marginTop: -12 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },

  shiftRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  shiftCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 2, borderColor: '#dde4ea',
    paddingVertical: 14, alignItems: 'center', gap: 6,
    shadowColor: '#0a3d62', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  shiftCardText: { fontSize: 13, fontWeight: '700', color: '#5a6a7a' },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#34495e', marginBottom: 8, marginTop: 12 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dde4ea',
    paddingHorizontal: 14,
    shadowColor: '#0a3d62', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#2c3e50', paddingVertical: 13 },

  statsRow: { flexDirection: 'row' },

  textarea: {
    minHeight: 110,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    fontSize: 14,
    color: '#2c3e50',
    flexDirection: 'column',
  },

  submitBtn: {
    backgroundColor: THEME,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default StaffShiftHandoverScreen;
