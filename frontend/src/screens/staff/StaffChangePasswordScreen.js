import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';

const THEME = '#005A71';

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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBox: {
    backgroundColor: THEME, alignItems: 'center',
    paddingTop: 28, paddingBottom: 38,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: THEME, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  subText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  form: { padding: 20, marginTop: -15, backgroundColor: '#FFFFFF' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F2A38', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 15, height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0F2A38' },
  eyeBtn: { padding: 5 },
  saveBtn: {
    backgroundColor: THEME, borderRadius: 14,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: 20, shadowColor: THEME, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default StaffChangePasswordScreen;
