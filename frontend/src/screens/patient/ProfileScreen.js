import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const ProfileScreen = () => {
  const { userInfo, logout } = useContext(AuthContext);
  
  const [fullName, setFullName] = useState(userInfo?.fullName || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!fullName || !email || !phone) {
      Alert.alert('Error', 'Fields cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const payload = { fullName, email, phone };
      if (password) {
        payload.password = password;
      }
      const response = await api.put(`/users/${userInfo._id}`, payload);
      Alert.alert('Success', 'Profile updated successfully');
      setPassword('');
      // In a real app, update AuthContext here as well.
    } catch (error) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
            <Text style={styles.roleText}>{userInfo?.role?.toUpperCase()}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>New Password (Optional)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Leave blank to keep current password"
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={[styles.updateBtn, loading && styles.disabledBtn]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateText}>Update Profile</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#d9534f" />
            <Text style={styles.logoutText}> Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBF1F4', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#005A71' },
  
  avatarContainer: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#005A71', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 3, shadowColor: '#005A71', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  roleText: { color: '#005A71', fontWeight: '700', fontSize: 13, letterSpacing: 1 },

  formContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#E5ECF0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  label: { fontSize: 13, fontWeight: '700', color: '#005A71', marginBottom: 8, letterSpacing: 0.3 },
  input: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10, marginBottom: 16, fontSize: 15, borderWidth: 1.5, borderColor: '#E5ECF0', color: '#1B2C36' },
  
  updateBtn: { backgroundColor: '#005A71', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 2, shadowColor: '#005A71', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5 },
  disabledBtn: { backgroundColor: '#B0C8D0', elevation: 0, shadowOpacity: 0 },
  updateText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 26, paddingVertical: 10 },
  logoutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' }
});

export default ProfileScreen;
