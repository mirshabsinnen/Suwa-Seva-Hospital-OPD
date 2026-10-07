import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const THEME = '#0a3d62';

const StaffChangePasswordScreen = ({ navigation }) => {
  const { updatePassword } = React.useContext(AuthContext);
  const { showToast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({ type: 'error', title: 'Missing Fields', message: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Mismatch', message: 'New passwords do not match.' });
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(currentPassword, newPassword);
      showToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been successfully updated.',
      });
      navigation.goBack();
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: error.toString() });
      setSubmitting(false);
    }
  };

  const renderInput = (label, value, setValue, show, setShow, placeholder) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={18} color="#95a5a6" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#95a5a6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={40} color={THEME} />
            </View>
            <Text style={styles.headerText}>Change Password</Text>
            <Text style={styles.subText}>Ensure your account stays secure</Text>
          </View>

          <View style={styles.form}>
            {renderInput('Current Password', currentPassword, setCurrentPassword, showCurrent, setShowCurrent, 'Enter current password')}
            {renderInput('New Password', newPassword, setNewPassword, showNew, setShowNew, 'Enter new password')}
            {renderInput('Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, 'Re-enter new password')}

            <TouchableOpacity style={[styles.saveBtn, submitting && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={submitting}>
              <Text style={styles.saveBtnText}>{submitting ? 'Updating...' : 'Update Password'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { flex: 1 },
  headerBox: {
    backgroundColor: THEME, alignItems: 'center',
    paddingTop: 30, paddingBottom: 40,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  subText: { color: '#a0c4e0', fontSize: 14 },
  form: { padding: 20, marginTop: -15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '700', color: '#34495e', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#dde4ea',
    paddingHorizontal: 15, height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#2c3e50' },
  eyeBtn: { padding: 5 },
  saveBtn: {
    backgroundColor: THEME, borderRadius: 14,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginTop: 20, shadowColor: THEME, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default StaffChangePasswordScreen;
