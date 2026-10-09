import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HIODashboardScreen from '../screens/hio/HIODashboardScreen';
import HIOQueueStatisticsScreen from '../screens/hio/HIOQueueStatisticsScreen';
import HIOPerformanceFeedbackScreen from '../screens/hio/HIOPerformanceFeedbackScreen';
import HIOReportsScreen from '../screens/hio/HIOReportsScreen';
import HIOReportDetailsScreen from '../screens/hio/HIOReportDetailsScreen';
import { palette } from '../components/hio/HIOUI';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const icons = { HIODashboard: 'grid-outline', HIOQueue: 'people-outline', HIOPerformance: 'pulse-outline', HIOReports: 'documents-outline' };
function ReportsNavigator() {
  return <Stack.Navigator screenOptions={{ headerTintColor: palette.teal, headerTitleStyle: { fontSize: 16 }, headerShadowVisible: false }}>
    <Stack.Screen name="HIOReportsList" component={HIOReportsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HIOReportDetails" component={HIOReportDetailsScreen} options={{ title: 'Monthly report' }} />
  </Stack.Navigator>;
}
export default function HIONavigator() {
  return <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: palette.teal,
    tabBarInactiveTintColor: '#788998',
    tabBarStyle: { backgroundColor: '#fff', borderTopColor: palette.border },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
  })}>
    <Tab.Screen name="HIODashboard" component={HIODashboardScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="HIOQueue" component={HIOQueueStatisticsScreen} options={{ title: 'Queue' }} />
    <Tab.Screen name="HIOPerformance" component={HIOPerformanceFeedbackScreen} options={{ title: 'Performance' }} />
    <Tab.Screen name="HIOReports" component={ReportsNavigator} options={{ title: 'Reports' }} />
  </Tab.Navigator>;
}
