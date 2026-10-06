import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

// ─── Role options ─────────────────────────────────────────────────────────────
const ROLES = [
  { label: 'Patient',                     value: 'patient',                    icon: 'person-outline',       color: '#005A71' },
  { label: 'Doctor',                      value: 'doctor',                     icon: 'medkit-outline',       color: '#005A71' },
  { label: 'Nurse',                       value: 'nurse',                      icon: 'heart-outline',        color: '#005A71' },
  { label: 'Health Information Officer',  value: 'health_information_officer', icon: 'stats-chart-outline',  color: '#005A71' },
];

// ─── Simple cross-platform alert ─────────────────────────────────────────────
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

// ─── Register Screen ──────────────────────────────────────────────────────────
const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole]     = useState(null);
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [localLoading, setLocalLoading]     = useState(false);

  const { register } = useContext(AuthContext);

  const selectedRoleObj = ROLES.find(r => r.value === selectedRole);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword || !selectedRole) {
      showAlert('Missing Fields', 'Please fill in all fields and select a role.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLocalLoading(true);
    try {
      await register({ fullName, email, phone, password, role: selectedRole });
    } catch (error) {
      showAlert('Registration Failed', error.toString());
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ── Header ── */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="medical" size={36} color="#fff" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Suwa Seva Health Portal</Text>
          </View>

          <View style={styles.formContainer}>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Role Picker */}
            <Text style={styles.label}>Select Role</Text>
            <TouchableOpacity
              style={[styles.inputRow, styles.dropdownTrigger, dropdownOpen && styles.dropdownTriggerOpen]}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={selectedRoleObj ? selectedRoleObj.icon : 'people-outline'}
                size={18}
                color={selectedRoleObj ? '#005A71' : '#999'}
                style={styles.inputIcon}
              />
              <Text style={[styles.dropdownPlaceholder, selectedRole && styles.dropdownSelected]}>
                {selectedRoleObj ? selectedRoleObj.label : 'Select your role...'}
              </Text>
              <Ionicons
                name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#999"
              />
            </TouchableOpacity>

            {/* Dropdown options */}
            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.dropdownItem,
                      selectedRole === role.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedRole(role.value);
                      setDropdownOpen(false);
                    }}
                  >
                    <Ionicons
                      name={role.icon}
                      size={18}
                      color={selectedRole === role.value ? '#005A71' : '#555'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={[
                      styles.dropdownItemText,
                      selectedRole === role.value && styles.dropdownItemTextSelected,
                    ]}>
                      {role.label}
                    </Text>
                    {selectedRole === role.value && (
                      <Ionicons name="checkmark" size={18} color="#005A71" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.button, localLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={localLoading}
            >
              {localLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Footer link */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },

  headerContainer: { marginBottom: 28, alignItems: 'center' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#005A71', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  title:    { fontSize: 26, fontWeight: 'bold', color: '#005A71', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888' },

  formContainer: { width: '100%' },

  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 14 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f7fa', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'web' ? 12 : 0,
    marginBottom: 2,
    minHeight: 50,
  },
  inputIcon:   { marginRight: 10 },
  inputField:  { flex: 1, fontSize: 15, color: '#333', paddingVertical: 12 },

  // Dropdown
  dropdownTrigger:     { justifyContent: 'space-between', cursor: 'pointer' },
  dropdownTriggerOpen: { borderColor: '#005A71', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  dropdownPlaceholder: { flex: 1, fontSize: 15, color: '#aaa' },
  dropdownSelected:    { color: '#333' },

  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#005A71',
    borderTopWidth: 0,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    marginBottom: 2,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  dropdownItemSelected: { backgroundColor: '#eef6f9' },
  dropdownItemText:     { fontSize: 14, color: '#555' },
  dropdownItemTextSelected: { color: '#005A71', fontWeight: '600' },

  // Button
  button: {
    backgroundColor: '#005A71', paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  buttonDisabled: { backgroundColor: '#005A7180', elevation: 0 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 10 },
  footerText: { color: '#888', fontSize: 14 },
  linkText:   { color: '#005A71', fontSize: 14, fontWeight: 'bold' },
});

export default RegisterScreen;
