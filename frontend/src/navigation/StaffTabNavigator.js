import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffTodayQueueScreen from '../screens/staff/StaffTodayQueueScreen';
import StaffShiftHandoverScreen from '../screens/staff/StaffShiftHandoverScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';

const Tab = createBottomTabNavigator();
const THEME = '#0a3d62';

const TabIcon = ({ name, focused, color, badge }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={focused ? tabStyles.activeIcon : null}>
      <Ionicons name={name} size={22} color={color} />
    </View>
    {badge > 0 && (
      <View style={tabStyles.badge}>
        <Text style={tabStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    )}
  </View>
);

const StaffTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            StaffHomeTab:    focused ? 'home'    : 'home-outline',
            StaffQueueTab:   focused ? 'people'  : 'people-outline',
            StaffShiftTab:   focused ? 'time'    : 'time-outline',
            StaffProfileTab: focused ? 'person'  : 'person-outline',
          };
          const badge = route.name === 'StaffHomeTab' ? 2 : 0;
          return <TabIcon name={icons[route.name]} focused={focused} color={color} badge={badge} />;
        },
        tabBarActiveTintColor: THEME,
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          shadowColor: '#0a3d62',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      })}
    >
      <Tab.Screen name="StaffHomeTab" component={StaffDashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="StaffQueueTab" component={StaffTodayQueueScreen} options={{ title: 'Queue' }} />
      <Tab.Screen name="StaffShiftTab" component={StaffShiftHandoverScreen} options={{ title: 'Shifts' }} />
      <Tab.Screen name="StaffProfileTab" component={StaffProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  activeIcon: {
    backgroundColor: '#e8f0f7',
    borderRadius: 10,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});

export default StaffTabNavigator;
