import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { updateDoctorProfile } from '../../services/doctorApi';

// ── Light Theme with Glassmorphism ──
const T = {
  bg:        '#f0f4f8',       
  card:      'rgba(255,255,255,0.75)', 
  cardBorder:'rgba(0,90,113,0.08)',
  accent:    '#005A71',       
  accentLight:'rgba(0,90,113,0.08)',
  text:      '#1a2b3c',       
  textDim:   '#7f8c8d',       
  success:   '#22c55e',
  danger:    '#ef4444',
  headerBg:  '#005A71',       
};

const DoctorProfileScreen = ({ navigation }) => {
  const { logout, userInfo, setUserInfo } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userInfo?.fullName || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await updateDoctorProfile({ fullName, phone });
      setUserInfo({ ...userInfo, ...updatedUser }); // update context
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header Bar ── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={s.headerBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Profile</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.headerBtn}>
          <Ionicons name="log-out-outline" size={20} color="#ffb3b3" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        {/* ── Profile Header ── */}
        <View style={s.profileHeader}>
          <View style={s.avatarContainer}>
            <Text style={s.avatarText}>{userInfo?.fullName?.charAt(0)?.toUpperCase() || 'D'}</Text>
          </View>
          <Text style={s.nameText}>Dr. {userInfo?.fullName}</Text>
          <Text style={s.roleText}>Medical Officer (Doctor)</Text>
        </View>

        {/* ── Personal Info Card (Glassmorphic) ── */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>Personal Information</Text>
            {isEditing ? (
              <TouchableOpacity onPress={handleSave} disabled={saving} style={s.saveBtn}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={s.editBtn}>
                <Ionicons name="pencil" size={14} color={T.accent} style={{marginRight: 4}} />
                <Text style={s.editText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="person-outline" size={18} color={T.accent} />
            </View>
            <View style={s.infoContent}>
              <Text style={s.infoLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput 
                  style={s.input}
                  value={fullName}
                  onChangeText={setFullName}
                />
              ) : (
                <Text style={s.infoValue}>{userInfo?.fullName}</Text>
              )}
            </View>
          </View>
          
          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="mail-outline" size={18} color={T.accent} />
            </View>
            <View style={s.infoContent}>
              <Text style={s.infoLabel}>Email Address</Text>
              <Text style={[s.infoValue, { color: T.textDim }]}>{userInfo?.email} <Text style={{fontSize: 10}}>(Read-only)</Text></Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="call-outline" size={18} color={T.accent} />
            </View>
            <View style={s.infoContent}>
              <Text style={s.infoLabel}>Phone Number</Text>
              {isEditing ? (
                <TextInput 
                  style={s.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={s.infoValue}>{userInfo?.phone || 'Not provided'}</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* ── Settings Card ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Account Settings</Text>
          <TouchableOpacity style={s.settingRow} activeOpacity={0.7}>
            <View style={s.settingIconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={T.textDim} />
            </View>
            <Text style={s.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={T.textDim} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  
  // ── Header ──
  header: { 
    backgroundColor: T.headerBg, 
    paddingHorizontal: 20, paddingTop: 44, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  body: { padding: 20, paddingBottom: 40 },
  
  // ── Profile Top ──
  profileHeader: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarContainer: { 
    width: 96, height: 96, borderRadius: 48, 
    backgroundColor: T.accentLight, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 4, borderColor: '#fff',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  avatarText: { fontSize: 38, fontWeight: '800', color: T.accent },
  nameText: { fontSize: 22, fontWeight: '800', color: T.text, marginBottom: 6 },
  roleText: { 
    fontSize: 12, color: T.accent, fontWeight: '700', 
    backgroundColor: T.accentLight, 
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.1)',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 
  },
  
  // ── Cards ──
  card: { 
    backgroundColor: T.card, borderRadius: 16, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: T.cardBorder,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 
  },
  cardHeaderRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' 
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: T.text, letterSpacing: 0.3 },
  
  // Buttons
  editBtn: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.accentLight, paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,90,113,0.1)'
  },
  editText: { color: T.accent, fontWeight: '700', fontSize: 12 },
  
  saveBtn: { 
    backgroundColor: T.success, paddingHorizontal: 16, paddingVertical: 6, 
    borderRadius: 8, shadowColor: T.success, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  
  // Info Rows
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconContainer: { 
    width: 40, height: 40, borderRadius: 12, 
    backgroundColor: T.accentLight, 
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 16 
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: T.textDim, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: T.text, fontWeight: '600' },
  
  input: { 
    borderBottomWidth: 2, borderBottomColor: T.accent, 
    fontSize: 15, paddingVertical: 4, fontWeight: '600', color: T.text
  },
  
  // Settings
  settingRow: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 14, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', borderRadius: 12, paddingHorizontal: 14,
    backgroundColor: '#fff'
  },
  settingIconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center'
  },
  settingText: { flex: 1, marginLeft: 14, fontSize: 14, color: T.text, fontWeight: '600' }
});

export default DoctorProfileScreen;
