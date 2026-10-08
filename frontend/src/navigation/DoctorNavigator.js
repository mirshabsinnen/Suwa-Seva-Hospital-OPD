import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DoctorTabNavigator from './DoctorTabNavigator';
import PatientDetailsScreen from '../screens/doctor/PatientDetailsScreen';
import ConsultationNotesScreen from '../screens/doctor/ConsultationNotesScreen';

const Stack = createNativeStackNavigator();

const DoctorNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabNavigator} />
      <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
      <Stack.Screen name="ConsultationNotes" component={ConsultationNotesScreen} />
    </Stack.Navigator>
  );
};

export default DoctorNavigator;
