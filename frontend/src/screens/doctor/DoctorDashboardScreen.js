import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getDoctorDashboardStats, getDoctorNotes, createDoctorNote, deleteDoctorNote } from '../../services/doctorApi';
import { useFocusEffect } from '@react-navigation/native';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, FadeInUpView, HeartbeatDot } from '../../components/MedicalAnimations';

// ── Medical Theme with Primary #005A71 and Clean White ──
const T = {
  bg:        '#FFFFFF',       // clean crisp white background
  surface:   '#F8FAFC',
  card:      '#FFFFFF',
  cardBorder:'#E2E8F0',
  accent:    '#005A71',       // primary teal accent
  accentLight:'rgba(0,90,113,0.08)',
  text:      '#0F2A38',       // dark clinical text
  textDim:   '#64748B',       // muted text
  success:   '#10B981',
  danger:    '#EF4444',
  headerBg:  '#005A71',       // primary teal header
};

const DoctorDashboardScreen = ({ navigation }) => {
  const { logout, userInfo } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [chamber, setChamber] = useState('Room 101');
  const [showChamberList, setShowChamberList] = useState(false);
  const chambers = ['Room 101', 'Room 102', 'Room 103', 'Room 205 (VIP)', 'Ward 3 (Cardiology)'];

  const fetchData = async () => {
    try {
      const [statsData, notesData] = await Promise.all([
        getDoctorDashboardStats(),
        getDoctorNotes()
      ]);
      setStats(statsData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const added = await createDoctorNote({ text: newNote });
      setNotes([added, ...notes]);
      setNewNote('');
    } catch (error) {
      Alert.alert("Error", "Failed to add note.");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteDoctorNote(id);
      setNotes(notes.filter(n => n._id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete note.");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  const StatCard = ({ num, label, icon, color }) => (
    <View style={s.statCard}>
      <View style={[s.statIconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={s.statNumber}>{num}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header Bar ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarText}>{userInfo?.fullName?.charAt(0)?.toUpperCase() || 'D'}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={s.greeting}>Dr. {userInfo?.fullName}</Text>
            <Text style={s.roleLabel}>Doctor Dashboard</Text>
          </View>
        </View>
        <View style={s.headerCenter}>
          <View style={s.headerLogoCircle}>
            <HospitalSvgIcon size={16} color="#fff" />
          </View>
          <Text style={s.headerAppName}>SUWA SEVA</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.headerBtn}>
            <Ionicons name="person-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[s.headerBtn, { marginLeft: 10 }]}>
            <Ionicons name="log-out-outline" size={18} color="#ffb3b3" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={s.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />}
      >
        {/* ── Status Card (Clean Medical Card) ── */}
        <FadeInUpView delay={100} duration={400} style={s.statusCard}>
          <View style={s.statusTop}>
            <View style={s.statusLeft}>
              <View style={s.statusIcon}>
                <Ionicons name="pulse-outline" size={22} color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.statusName}>Dr. {userInfo?.fullName}</Text>
                <Text style={s.statusMeta}>General Medicine  •  Morning Shift</Text>
              </View>
            </View>
            {/* ── Available / Unavailable Toggle with HeartbeatDot ── */}
            <TouchableOpacity 
              style={[s.availBtn, isAvailable ? s.availBtnOn : s.availBtnOff]}
              onPress={() => setIsAvailable(!isAvailable)}
              activeOpacity={0.7}
            >
              <HeartbeatDot color={isAvailable ? T.success : T.danger} size={7} />
              <Text style={[s.availText, { color: isAvailable ? T.success : T.danger, marginLeft: 4 }]}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Chamber Dropdown ── */}
          <View style={s.chamberRow}>
            <Ionicons name="business-outline" size={16} color={T.textDim} />
            <Text style={s.chamberLabel}>Chamber</Text>
            <TouchableOpacity 
              style={s.chamberDropdown} 
              onPress={() => setShowChamberList(!showChamberList)}
              activeOpacity={0.7}
            >
              <Text style={s.chamberValue}>{chamber}</Text>
              <Ionicons name={showChamberList ? "chevron-up" : "chevron-down"} size={16} color={T.accent} />
            </TouchableOpacity>
          </View>
          
          {showChamberList && (
            <View style={s.chamberList}>
              {chambers.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[s.chamberOption, chamber === c && s.chamberOptionActive]} 
                  onPress={() => { setChamber(c); setShowChamberList(false); }}
                >
                  <Text style={[s.chamberOptionText, chamber === c && { color: T.accent, fontWeight: '700' }]}>{c}</Text>
                  {chamber === c && <Ionicons name="checkmark-circle" size={18} color={T.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </FadeInUpView>

        {/* ── Stats Grid ── */}
        <Text style={s.sectionTitle}>Today's Overview</Text>
        <FadeInUpView delay={200} duration={400} style={s.statsGrid}>
          <StatCard num={stats?.totalAssigned || 0} label="Total" icon="clipboard-outline" color="#005A71" />
          <StatCard num={stats?.waiting || 0} label="Waiting" icon="hourglass-outline" color="#f59e0b" />
          <StatCard num={stats?.serving || 0} label="In Progress" icon="pulse-outline" color="#10B981" />
          <StatCard num={stats?.completed || 0} label="Completed" icon="checkmark-done-outline" color="#0284C7" />
        </FadeInUpView>

        {/* ── Notes Section ── */}
        <Text style={s.sectionTitle}>Quick Notes</Text>
        <View style={s.glassCard}>
          <View style={s.addNoteRow}>
            <TextInput 
              style={s.noteInput}
              placeholder="Add a quick note…"
              placeholderTextColor={T.textDim}
              value={newNote}
              onChangeText={setNewNote}
            />
            <TouchableOpacity style={s.addNoteBtn} onPress={handleAddNote} disabled={addingNote}>
              {addingNote ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="add" size={22} color="#fff" />}
            </TouchableOpacity>
          </View>
          {notes.map(note => (
            <View key={note._id} style={s.noteItem}>
              <View style={s.noteDot} />
              <Text style={s.noteText}>{note.text}</Text>
              <TouchableOpacity onPress={() => handleDeleteNote(note._id)} style={s.noteDelete}>
                <Ionicons name="close-circle" size={20} color="rgba(239,68,68,0.5)" />
              </TouchableOpacity>
            </View>
          ))}
          {notes.length === 0 && <Text style={s.emptyNote}>No notes yet. Start adding one above.</Text>}
        </View>

        {/* ── Quick Action ── */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={s.actionCard}
          onPress={() => navigation.navigate('Patients')}
          activeOpacity={0.7}
        >
          <View style={s.actionIcon}>
            <Ionicons name="people-outline" size={22} color={T.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.actionTitle}>Today's Patients</Text>
            <Text style={s.actionDesc}>View and manage assigned patients</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ──
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },

  // ── Header ──
  header: {
    backgroundColor: T.headerBg,
    paddingHorizontal: 20, paddingTop: 44, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerLogoCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  headerAppName: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  greeting: { color: '#fff', fontSize: 15, fontWeight: '700' },
  roleLabel: { color: '#a8d8e8', fontSize: 11, marginTop: 1 },
  headerBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Body ──
  body: { padding: 20, paddingBottom: 40 },

  // ── Status Card ──
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: T.accentLight,
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.12)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  statusName: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text,
  },
  statusMeta: {
    fontSize: 11,
    color: T.textDim,
    marginTop: 2,
  },

  // ── Available / Unavailable Button ──
  availBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  availBtnOn: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.25)',
  },
  availBtnOff: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  availDot: {
    width: 8, height: 8, borderRadius: 4,
    marginRight: 8,
  },
  availText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Chamber Dropdown ──
  chamberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,90,113,0.06)',
    paddingTop: 14,
    marginTop: 14,
  },
  chamberLabel: {
    fontSize: 12,
    color: T.textDim,
    marginLeft: 8,
    marginRight: 12,
    fontWeight: '600',
  },
  chamberDropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,90,113,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,90,113,0.10)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chamberValue: {
    color: T.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  chamberList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,90,113,0.10)',
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  chamberOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  chamberOptionActive: {
    backgroundColor: T.accentLight,
  },
  chamberOptionText: {
    color: '#555',
    fontSize: 13,
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: T.text,
    marginBottom: 14, marginTop: 4,
    letterSpacing: 0.3,
  },

  // ── Stats Grid ──
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: T.text },
  statLabel: { fontSize: 11, color: T.textDim, marginTop: 4, letterSpacing: 0.5 },

  // ── Clean White Card (Notes) ──
  glassCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  addNoteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  noteInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginRight: 10,
    color: T.text,
    fontSize: 14,
  },
  addNoteBtn: {
    backgroundColor: T.accent,
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: T.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  noteItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  noteDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: T.accent, marginRight: 12,
  },
  noteText: { fontSize: 13, color: T.text, flex: 1 },
  noteDelete: { padding: 4 },
  emptyNote: { color: T.textDim, fontStyle: 'italic', fontSize: 12, marginTop: 4 },

  // ── Quick Action ──
  actionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, borderRadius: 16, marginBottom: 16,
    shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  actionIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: T.accentLight,
    borderWidth: 1, borderColor: 'rgba(0,90,113,0.12)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  actionTitle: { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 3 },
  actionDesc: { fontSize: 11, color: T.textDim },
});

export default DoctorDashboardScreen;
