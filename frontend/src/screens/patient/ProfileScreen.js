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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 40 },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  avatarContainer: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#005A71', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  roleText: { color: '#005A71', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },

  formContainer: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  
  updateBtn: { backgroundColor: '#005A71', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabledBtn: { backgroundColor: '#005A7180' },
  updateText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  logoutText: { color: '#d9534f', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;
