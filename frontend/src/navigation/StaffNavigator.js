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

const Stack = createNativeStackNavigator();

const StaffNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="StaffMainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a3d62', // Professional clinical blue
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

    </Stack.Navigator>
  );
};

export default StaffNavigator;
