import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// Role-specific dashboards
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import StaffNavigator from './StaffNavigator';
import HIONavigator from './HIONavigator';

// Patient appointment booking flow screens
import HospitalOPDSelectionScreen from '../screens/patient/HospitalOPDSelectionScreen';
import DateSlotSelectionScreen from '../screens/patient/DateSlotSelectionScreen';
import AppointmentConfirmationScreen from '../screens/patient/AppointmentConfirmationScreen';
import QueueTokenScreen from '../screens/patient/QueueTokenScreen';

const Stack = createNativeStackNavigator();

// ─── Patient Stack (existing tabs + booking flow) ─────────────────────────────
const PatientNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Screen name="HospitalOPDSelection" component={HospitalOPDSelectionScreen} />
    <Stack.Screen name="DateSlotSelection" component={DateSlotSelectionScreen} />
    <Stack.Screen name="AppointmentConfirmation" component={AppointmentConfirmationScreen} />
    <Stack.Screen name="QueueToken" component={QueueTokenScreen} />
  </Stack.Navigator>
);

import DoctorNavigator from './DoctorNavigator';

// ─── Nurse Stack (Handled by StaffNavigator) ──────────────────────────────────────────────────────────────
// ─── HIO Stack ────────────────────────────────────────────────────────────────

// ─── Role-based navigator selector ───────────────────────────────────────────
const getNavigatorForRole = (role) => {
  switch (role) {
    case 'doctor':                   return <DoctorNavigator />;
    case 'nurse':                    return <StaffNavigator />;
    case 'health_information_officer': return <HIONavigator />;
    case 'patient':
    default:                         return <PatientNavigator />;
  }
};

// ─── Root Navigator ───────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { isLoading, userToken, userInfo } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#005A71" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken !== null
        ? getNavigatorForRole(userInfo?.role)
        : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
