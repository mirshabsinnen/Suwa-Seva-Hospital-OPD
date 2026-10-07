import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.greetingText}>Good Morning,</Text>
              <Text style={styles.userName}>{userInfo?.fullName || 'Patient'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="#005A71" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Today's Active Q Widget */}
        <View style={styles.activeQCard}>
          <View style={styles.activeQHeader}>
            <Text style={styles.activeQTitle}>● TODAY'S ACTIVE Q</Text>
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
            <Text style={styles.trackButtonText}>● Track Live Queue →</Text>
          </TouchableOpacity>
        </View>

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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#005A71', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  greetingText: { fontSize: 14, color: '#666' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  notificationIcon: { padding: 8, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  badge: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, backgroundColor: 'red', borderRadius: 4 },

  // Active Q Widget
  activeQCard: { backgroundColor: '#eef6f9', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#d0e5ed' },
  activeQHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  activeQTitle: { color: '#005A71', fontWeight: 'bold', fontSize: 12 },
  roomBadge: { backgroundColor: '#d0e5ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roomBadgeText: { fontSize: 11, color: '#005A71', fontWeight: '600' },
  hospitalName: { fontSize: 18, fontWeight: 'bold', color: '#005A71', marginBottom: 15 },
  
  queueInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  tokenBox: { flex: 1 },
  servingBox: { flex: 1, alignItems: 'flex-end' },
  tokenLabel: { fontSize: 12, color: '#555', marginBottom: 4 },
  tokenNumber: { fontSize: 32, fontWeight: 'bold', color: '#005A71' },
  servingRow: { flexDirection: 'row', alignItems: 'center' },
  servingNumber: { fontSize: 24, fontWeight: 'bold', color: '#005A71', marginRight: 8 },
  servingBadge: { backgroundColor: '#cce5ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  servingBadgeText: { fontSize: 10, color: '#0056b3', fontWeight: 'bold' },
  aheadText: { fontSize: 12, color: '#555', fontWeight: 'bold', marginTop: 4 },

  waitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, marginBottom: 15 },
  waitText: { fontSize: 12, color: '#555', marginLeft: 4 },
  boldText: { fontWeight: 'bold', color: '#333' },
  
  trackButton: { backgroundColor: '#005A71', borderRadius: 8, padding: 12, alignItems: 'center' },
  trackButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Book Appointment Button
  bookAppointmentBtn: { backgroundColor: '#007b99', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  newClinicText: { color: '#e0f7fa', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  bookTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  plusIconBox: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Upcoming Appointment
  upcomingSection: { marginBottom: 25 },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  confirmedBadge: { backgroundColor: '#d4edda', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  confirmedText: { color: '#155724', fontSize: 12, fontWeight: 'bold' },
  
  upcomingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  doctorInfoRow: { flexDirection: 'row', marginBottom: 15 },
  doctorAvatar: { width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  departmentText: { fontSize: 11, color: '#005A71', fontWeight: 'bold', marginBottom: 2 },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  doctorDesc: { fontSize: 12, color: '#666' },
  
  appointmentDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  appointmentDetailText: { fontSize: 13, color: '#555', marginLeft: 8 },
  appointmentTimeText: { fontSize: 13, color: '#333', fontWeight: 'bold', marginLeft: 4 },
  
  detailsButton: { backgroundColor: '#eef6f9', borderRadius: 8, padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  detailsButtonText: { color: '#005A71', fontWeight: 'bold', fontSize: 13 },

  // Quick Services
  sectionTitleQuick: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  quickServicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  quickServiceCard: { backgroundColor: '#fff', width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  iconCircle: { width: 50, height: 50, backgroundColor: '#eef6f9', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickServiceText: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },

  // Emergency Card
  emergencyCard: { backgroundColor: '#ffe5e5', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  emergencyIcon: { width: 50, height: 50, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  emergencyContent: { flex: 1 },
  emergencySub: { color: '#cc0000', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  emergencyTitle: { color: '#cc0000', fontSize: 18, fontWeight: 'bold' },
  callButton: { backgroundColor: '#cc0000', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  callButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});

export default HomeScreen;
