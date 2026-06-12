/**
 * App.js — entry point
 *
 * WorkoutProvider wraps the navigator so every screen gets Context access.
 * Nothing else lives here — keeps the entry file clean (MVVM: no business logic).
 */

import React from 'react';
import { WorkoutProvider } from './src/context/WorkoutContext';
import AppNavigator         from './src/navigation/AppNavigator';

export default function App() {
  return (
    <WorkoutProvider>
      <AppNavigator />
    </WorkoutProvider>
  );
}
