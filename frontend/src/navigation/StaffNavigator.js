import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import StaffTabNavigator from './StaffTabNavigator';
import StaffPatientDetailsScreen from '../screens/staff/StaffPatientDetailsScreen';
import StaffConfirmArrivalScreen from '../screens/staff/StaffConfirmArrivalScreen';
import StaffPriorityManagementScreen from '../screens/staff/StaffPriorityManagementScreen';
import StaffQueueUpdatedScreen from '../screens/staff/StaffQueueUpdatedScreen';
import StaffCallNextPatientScreen from '../screens/staff/StaffCallNextPatientScreen';
import StaffActiveConsultationScreen from '../screens/staff/StaffActiveConsultationScreen';
import StaffNotificationsScreen from '../screens/staff/StaffNotificationsScreen';
import StaffEditProfileScreen from '../screens/staff/StaffEditProfileScreen';
import StaffChangePasswordScreen from '../screens/staff/StaffChangePasswordScreen';

const Stack = createNativeStackNavigator();

const StaffNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="StaffMainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#005A71', // Primary Medical Teal
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="StaffMainTabs" 
        component={StaffTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="StaffPatientDetails" 
        component={StaffPatientDetailsScreen} 
        options={{ title: 'Patient Details' }} 
      />
      <Stack.Screen 
        name="StaffConfirmArrival" 
        component={StaffConfirmArrivalScreen} 
        options={{ title: 'Confirm Arrival' }} 
      />
      <Stack.Screen 
        name="StaffPriorityManagement" 
        component={StaffPriorityManagementScreen} 
        options={{ title: 'Manage Priority' }} 
      />
      <Stack.Screen 
        name="StaffQueueUpdated" 
        component={StaffQueueUpdatedScreen} 
        options={{ title: 'Queue Updated', headerBackVisible: false }} 
      />
      <Stack.Screen 
        name="StaffCallNextPatient" 
        component={StaffCallNextPatientScreen} 
        options={{ title: 'Call Next Patient' }} 
      />
      <Stack.Screen 
        name="StaffActiveConsultation" 
        component={StaffActiveConsultationScreen} 
        options={{ title: 'Active Consultation' }} 
      />
      <Stack.Screen 
        name="StaffNotifications" 
        component={StaffNotificationsScreen} 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="StaffEditProfile" 
        component={StaffEditProfileScreen} 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="StaffChangePassword" 
        component={StaffChangePasswordScreen} 
        options={{ title: 'Change Password' }} 
      />

    </Stack.Navigator>
  );
};

export default StaffNavigator;
