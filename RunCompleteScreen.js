/**
 * AppNavigator.js
 * Demonstrates: Stack, Tab navigators + parameter passing between screens.
 *
 * Run flow (Stack inside Tab "Track"):
 *   HomeScreen → ActiveRunScreen → RunCompleteScreen
 *                                       ↓ (addWorkout + navigate to History)
 *                              HistoryScreen (Tab 2)
 */

import React from 'react';
import { NavigationContainer }        from '@react-navigation/native';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── Screen imports (create these files next) ──────────────────────────────────
import HomeScreen         from '../screens/HomeScreen';
import ActiveRunScreen    from '../screens/ActiveRunScreen';
import RunCompleteScreen  from '../screens/RunCompleteScreen';
import HistoryScreen      from '../screens/HistoryScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Run flow stack ────────────────────────────────────────────────────────────
function TrackStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"        component={HomeScreen} />
      <Stack.Screen name="ActiveRun"   component={ActiveRunScreen} />
      {/*
        RunCompleteScreen receives params:
          { steps, distanceKm, durationMs, calories, route, photoUri, weather }
        passed from ActiveRunScreen via navigation.navigate('RunComplete', { ... })
      */}
      <Stack.Screen name="RunComplete" component={RunCompleteScreen} />
    </Stack.Navigator>
  );
}

// ── Root tab navigator ────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarStyle: { paddingBottom: 4 },
        }}
      >
        <Tab.Screen
          name="Track"
          component={TrackStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'My Runs' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
