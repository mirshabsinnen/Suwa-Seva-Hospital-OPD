
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Main Staff Tab Navigator
import StaffTabNavigator from './StaffTabNavigator';

// Staff Screens
import StaffTodayQueueScreen from '../screens/staff/StaffTodayQueueScreen';
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
          backgroundColor: '#005A71',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Main Staff Tabs */}
      <Stack.Screen
        name="StaffMainTabs"
        component={StaffTabNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Today's Queue */}
      <Stack.Screen
        name="StaffTodayQueue"
        component={StaffTodayQueueScreen}
        options={{
          title: "Today's Queue",
        }}
      />

      {/* Patient Details */}
      <Stack.Screen
        name="StaffPatientDetails"
        component={StaffPatientDetailsScreen}
        options={{
          title: 'Patient Details',
        }}
      />

      {/* Confirm Patient Arrival */}
      <Stack.Screen
        name="StaffConfirmArrival"
        component={StaffConfirmArrivalScreen}
        options={{
          title: 'Confirm Arrival',
        }}
      />

      {/* Manage Patient Priority */}
      <Stack.Screen
        name="StaffPriorityManagement"
        component={StaffPriorityManagementScreen}
        options={{
          title: 'Manage Priority',
        }}
      />

      {/* Queue Updated Confirmation */}
      <Stack.Screen
        name="StaffQueueUpdated"
        component={StaffQueueUpdatedScreen}
        options={{
          title: 'Queue Updated',
          headerBackVisible: false,
        }}
      />

      {/* Call Next Patient */}
      <Stack.Screen
        name="StaffCallNextPatient"
        component={StaffCallNextPatientScreen}
        options={{
          title: 'Call Next Patient',
        }}
      />

      {/* Active Consultation */}
      <Stack.Screen
        name="StaffActiveConsultation"
        component={StaffActiveConsultationScreen}
        options={{
          title: 'Active Consultation',
        }}
      />

      {/* Notifications */}
      <Stack.Screen
        name="StaffNotifications"
        component={StaffNotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />

      {/* Edit Staff Profile */}
      <Stack.Screen
        name="StaffEditProfile"
        component={StaffEditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />

      {/* Change Password */}
      <Stack.Screen
        name="StaffChangePassword"
        component={StaffChangePasswordScreen}
        options={{
          title: 'Change Password',
        }}
      />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
