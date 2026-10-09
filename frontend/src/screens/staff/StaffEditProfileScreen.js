import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';

const THEME = '#005A71';

// 4 placeholder images to simulate choosing a profile picture
const MOCK_AVATARS = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/46.jpg'
];

const StaffEditProfileScreen = ({ navigation }) => {
  const { userInfo, updateProfile } = useContext(AuthContext);
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(userInfo?.fullName || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [profileImage, setProfileImage] = useState(userInfo?.profileImage || null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectAvatar = () => {
    // Cycle through mock avatars for demo purposes
    const currentIndex = MOCK_AVATARS.indexOf(profileImage);
    const nextIndex = currentIndex + 1 >= MOCK_AVATARS.length ? 0 : currentIndex + 1;
    setProfileImage(MOCK_AVATARS[nextIndex]);
  };

  const handleSave = async () => {
    if (!fullName || !email) {
      showToast({ type: 'error', title: 'Missing Info', message: 'Name and email are required.' });
      return;
    }
    
    setSubmitting(true);
    try {
      await updateProfile({ fullName, email, phone, profileImage });
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully saved.',
      });
      navigation.goBack();
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: error.toString() });
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.headerBox}>
            <TouchableOpacity onPress={handleSelectAvatar} activeOpacity={0.8}>
              <View style={styles.avatarCircle}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={40} color={THEME} />
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.headerText}>Tap photo to change</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#95a5a6" style={styles.icon} />
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Enter your full name" />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#95a5a6" style={styles.icon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="#95a5a6" style={styles.icon} />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter your phone number" keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={[styles.saveBtn, submitting && { opacity: 0.7 }]} onPress={handleSave} disabled={submitting}>
              <Text style={styles.saveBtnText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
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
    backgroundColor: THEME,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 38,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    shadowColor: THEME, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: -5,
    backgroundColor: '#EF4444', width: 30, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#FFFFFF',
  },
  headerText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500', marginTop: 5 },
  form: { padding: 20, marginTop: -15, backgroundColor: '#FFFFFF' },
  label: { fontSize: 13, fontWeight: '700', color: '#0F2A38', marginBottom: 8, marginTop: 15 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 15, height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0F2A38' },
  saveBtn: {
    backgroundColor: THEME, borderRadius: 14,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: 30, shadowColor: THEME, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default StaffEditProfileScreen;
