import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffTodayQueueScreen from '../screens/staff/StaffTodayQueueScreen';
import StaffPatientDetailsScreen from '../screens/staff/StaffPatientDetailsScreen';
import StaffConfirmArrivalScreen from '../screens/staff/StaffConfirmArrivalScreen';
import StaffPriorityManagementScreen from '../screens/staff/StaffPriorityManagementScreen';
import StaffQueueUpdatedScreen from '../screens/staff/StaffQueueUpdatedScreen';
import StaffCallNextPatientScreen from '../screens/staff/StaffCallNextPatientScreen';
import StaffActiveConsultationScreen from '../screens/staff/StaffActiveConsultationScreen';
import StaffShiftHandoverScreen from '../screens/staff/StaffShiftHandoverScreen';

const Stack = createNativeStackNavigator();

const StaffNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="StaffDashboard"
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
        name="StaffDashboard" 
        component={StaffDashboardScreen} 
        options={{ title: 'Staff Dashboard' }} 
      />
      <Stack.Screen 
        name="StaffTodayQueue" 
        component={StaffTodayQueueScreen} 
        options={{ title: "Today's OPD Queue" }} 
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
        name="StaffShiftHandover" 
        component={StaffShiftHandoverScreen} 
        options={{ title: 'Shift Handover' }} 
      />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
