import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView, FadeInUpView, HeartbeatDot } from '../../components/MedicalAnimations';

const HomeScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileAvatar}>
              <HospitalSvgIcon size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.greetingText}>Suwa Seva OPD Portal</Text>
              <Text style={styles.userName}>{userInfo?.fullName || 'Patient'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('AlertsTab')}>
            <Ionicons name="notifications-outline" size={22} color="#005A71" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Today's Active Q Widget */}
        <FadeInUpView delay={100} duration={400} style={styles.activeQCard}>
          <View style={styles.activeQHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HeartbeatDot color="#10B981" size={7} />
              <Text style={[styles.activeQTitle, { marginLeft: 6 }]}>TODAY'S ACTIVE QUEUE</Text>
            </View>
            <View style={styles.roomBadge}>
              <Text style={styles.roomBadgeText}>Room 14 • General OPD</Text>
            </View>
          </View>
          
          <Text style={styles.hospitalName}>Colombo National Hospital (NHSL)</Text>
          
          <View style={styles.queueInfoRow}>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>Your Token Code</Text>
              <Text style={styles.tokenNumber}>A-125</Text>
            </View>
            <View style={styles.servingBox}>
              <Text style={styles.tokenLabel}>Currently Calling</Text>
              <View style={styles.servingRow}>
                <Text style={styles.servingNumber}>A-117</Text>
                <View style={styles.servingBadge}><Text style={styles.servingBadgeText}>Serving</Text></View>
              </View>
              <Text style={styles.aheadText}>8 patients ahead</Text>
            </View>
          </View>

          <View style={styles.waitRow}>
            <Ionicons name="time-outline" size={16} color="#005A71" />
            <Text style={styles.waitText}> Estimated Wait: <Text style={styles.boldText}>~28 mins</Text> Target Call ~09:42 AM</Text>
          </View>
          
          <TouchableOpacity style={styles.trackButton} onPress={() => navigation.navigate('QueueTab')}>
            <Text style={styles.trackButtonText}>Track Live Queue →</Text>
          </TouchableOpacity>
        </FadeInUpView>

        {/* Book Appointment Button */}
        <TouchableOpacity style={styles.bookAppointmentBtn} onPress={() => navigation.navigate('HospitalOPDSelection')}>
          <View>
            <Text style={styles.newClinicText}>⊕ New Clinic Registration</Text>
            <Text style={styles.bookTitle}>Book New OPD Appointment</Text>
          </View>
          <View style={styles.plusIconBox}>
            <Ionicons name="add" size={28} color="#005A71" />
          </View>
        </TouchableOpacity>

        {/* Upcoming Appointment */}
        <View style={styles.upcomingSection}>
          <View style={styles.upcomingHeader}>
            <View style={styles.rowCenter}>
              <Ionicons name="calendar" size={20} color="#005A71" />
              <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            </View>
            <View style={styles.confirmedBadge}><Text style={styles.confirmedText}>Confirmed</Text></View>
          </View>
          
          <View style={styles.upcomingCard}>
            <View style={styles.doctorInfoRow}>
              <View style={styles.doctorAvatar}><Ionicons name="medkit" size={24} color="#005A71" /></View>
              <View>
                <Text style={styles.departmentText}>CARDIOLOGY OPD</Text>
                <Text style={styles.doctorName}>Dr. Nirmal Senanayake</Text>
                <Text style={styles.doctorDesc}>Consultant Physician • Room 04</Text>
              </View>
            </View>
            
            <View style={styles.appointmentDetailRow}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <Text style={styles.appointmentDetailText}>Colombo South Teaching Hospital (Kalubowila)</Text>
            </View>
            <View style={styles.appointmentDetailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.appointmentDetailText}>Thursday, 24 Oct 2024</Text>
              <Text style={styles.appointmentTimeText}>• 08:30 AM (Morning)</Text>
            </View>
            
            <TouchableOpacity style={styles.detailsButton}>
              <Ionicons name="document-text-outline" size={16} color="#005A71" />
              <Text style={styles.detailsButtonText}> View Details & Preparation Notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Services */}
        <Text style={styles.sectionTitleQuick}>Quick Services</Text>
        <View style={styles.quickServicesGrid}>
          <TouchableOpacity style={styles.quickServiceCard}>
            <View style={styles.iconCircle}><Ionicons name="ticket-outline" size={24} color="#005A71" /></View>
            <Text style={styles.quickServiceText}>My Tokens & History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickServiceCard}>
            <View style={styles.iconCircle}><MaterialCommunityIcons name="doctor" size={24} color="#005A71" /></View>
            <Text style={styles.quickServiceText}>Clinic & Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickServiceCard}>
            <View style={styles.iconCircle}><Ionicons name="medical-outline" size={24} color="#005A71" /></View>
            <Text style={styles.quickServiceText}>Pharmacy Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickServiceCard}>
            <View style={styles.iconCircle}><Ionicons name="map-outline" size={24} color="#005A71" /></View>
            <Text style={styles.quickServiceText}>Hospital Map</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Hotline */}
        <TouchableOpacity style={styles.emergencyCard}>
          <View style={styles.emergencyIcon}>
            <MaterialCommunityIcons name="ambulance" size={32} color="#cc0000" />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencySub}>NATIONAL EMERGENCY HOTLINE</Text>
            <Text style={styles.emergencyTitle}>1990 Suwa Seriya</Text>
          </View>
          <View style={styles.callButton}>
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.callButtonText}> Call 1990</Text>
          </View>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 20, paddingBottom: 40, backgroundColor: '#FFFFFF' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#005A71', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  greetingText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 18, fontWeight: '800', color: '#0F2A38' },
  notificationIcon: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4 },

  // Active Q Widget
  activeQCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  activeQHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeQTitle: { color: '#005A71', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  roomBadge: { backgroundColor: 'rgba(0, 90, 113, 0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roomBadgeText: { fontSize: 11, color: '#005A71', fontWeight: '700' },
  hospitalName: { fontSize: 17, fontWeight: '800', color: '#0F2A38', marginBottom: 15 },
  
  queueInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  tokenBox: { flex: 1 },
  servingBox: { flex: 1, alignItems: 'flex-end' },
  tokenLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '500' },
  tokenNumber: { fontSize: 32, fontWeight: '900', color: '#005A71' },
  servingRow: { flexDirection: 'row', alignItems: 'center' },
  servingNumber: { fontSize: 24, fontWeight: '800', color: '#005A71', marginRight: 8 },
  servingBadge: { backgroundColor: 'rgba(0, 90, 113, 0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  servingBadgeText: { fontSize: 10, color: '#005A71', fontWeight: '700' },
  aheadText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 4 },

  waitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  waitText: { fontSize: 12, color: '#64748B', marginLeft: 6 },
  boldText: { fontWeight: '700', color: '#0F2A38' },
  
  trackButton: { backgroundColor: '#005A71', borderRadius: 12, paddingVertical: 13, alignItems: 'center', shadowColor: '#005A71', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  trackButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Book Appointment Button
  bookAppointmentBtn: { backgroundColor: '#005A71', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, shadowColor: '#005A71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
  newClinicText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  bookTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  plusIconBox: { backgroundColor: '#fff', width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Upcoming Appointment
  upcomingSection: { marginBottom: 24 },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F2A38', marginLeft: 8 },
  confirmedBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  confirmedText: { color: '#065F46', fontSize: 11, fontWeight: '700' },
  
  upcomingCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  doctorInfoRow: { flexDirection: 'row', marginBottom: 14 },
  doctorAvatar: { width: 46, height: 46, backgroundColor: 'rgba(0, 90, 113, 0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  departmentText: { fontSize: 11, color: '#005A71', fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#0F2A38', marginBottom: 2 },
  doctorDesc: { fontSize: 12, color: '#64748B' },
  
  appointmentDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  appointmentDetailText: { fontSize: 13, color: '#64748B', marginLeft: 8 },
  appointmentTimeText: { fontSize: 13, color: '#0F2A38', fontWeight: '700', marginLeft: 4 },
  
  detailsButton: { backgroundColor: 'rgba(0, 90, 113, 0.06)', borderRadius: 10, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  detailsButtonText: { color: '#005A71', fontWeight: '700', fontSize: 13 },

  // Quick Services
  sectionTitleQuick: { fontSize: 16, fontWeight: '700', color: '#0F2A38', marginBottom: 14 },
  quickServicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  quickServiceCard: { backgroundColor: '#FFFFFF', width: '48%', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#005A71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  iconCircle: { width: 46, height: 46, backgroundColor: 'rgba(0, 90, 113, 0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickServiceText: { fontSize: 13, fontWeight: '600', color: '#0F2A38', textAlign: 'center' },

  // Emergency Card
  emergencyCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  emergencyIcon: { width: 46, height: 46, backgroundColor: '#FFFFFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  emergencyContent: { flex: 1 },
  emergencySub: { color: '#DC2626', fontSize: 10, fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  emergencyTitle: { color: '#991B1B', fontSize: 17, fontWeight: '800' },
  callButton: { backgroundColor: '#DC2626', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  callButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default HomeScreen;
