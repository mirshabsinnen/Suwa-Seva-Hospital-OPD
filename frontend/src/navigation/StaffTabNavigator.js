import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffTodayQueueScreen from '../screens/staff/StaffTodayQueueScreen';
import StaffShiftHandoverScreen from '../screens/staff/StaffShiftHandoverScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

const Tab = createBottomTabNavigator();

const StaffTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'StaffHomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'StaffQueueTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'StaffShiftTab') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'StaffProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0a3d62',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60, backgroundColor: '#ffffff' },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="StaffHomeTab" component={StaffDashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="StaffQueueTab" component={StaffTodayQueueScreen} options={{ title: 'Queue' }} />
      <Tab.Screen name="StaffShiftTab" component={StaffShiftHandoverScreen} options={{ title: 'Shifts' }} />
      <Tab.Screen name="StaffProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
