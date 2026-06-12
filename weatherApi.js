/**
 * ActiveRunScreen.js
 * The core screen. Live step count, distance, timer, and pace from
 * useAccelerometer + useLocation hooks. "Finish" navigates to RunComplete.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';

import { useAccelerometer } from '../hooks/useAccelerometer';
import { useLocation }       from '../hooks/useLocation';
import {
  estimateCalories,
  formatDuration,
  calculatePace,
} from '../utils/calculations';

export default function ActiveRunScreen({ navigation }) {
  // ── Timer ──────────────────────────────────────────────────────────────────
  const [isRunning, setIsRunning]     = useState(false);
  const [durationMs, setDurationMs]   = useState(0);
  const timerRef                      = useRef(null);
  const startTimeRef                  = useRef(null);

  // ── Sensors ────────────────────────────────────────────────────────────────
  const { steps, reset: resetSteps }       = useAccelerometer(isRunning);
  const { distanceKm, route, reset: resetLocation } = useLocation(isRunning);

  // ── Derived ────────────────────────────────────────────────────────────────
  const calories = estimateCalories(steps);
  const pace     = calculatePace(durationMs, distanceKm);

  // ── Timer logic ────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - durationMs;
    timerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current);
    }, 1000);
  }, [durationMs]);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Controls ───────────────────────────────────────────────────────────────
  const handleStart = () => {
    setIsRunning(true);
    startTimer();
  };

  const handlePause = () => {
    setIsRunning(false);
    stopTimer();
  };

  const handleFinish = () => {
    if (steps < 5) {
      Alert.alert('Too short', 'Take a few more steps before finishing!');
      return;
    }
    handlePause();
    navigation.navigate('RunComplete', {
      steps,
      distanceKm,
      durationMs,
      calories,
      route,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Timer */}
        <Text style={s.timer}>{formatDuration(durationMs)}</Text>
        <Text style={s.timerLabel}>
          {isRunning ? '● RUNNING' : durationMs > 0 ? '⏸ PAUSED' : 'READY'}
        </Text>

        {/* Stats grid */}
        <View style={s.grid}>
          <Stat label="Steps"    value={steps.toLocaleString()} />
          <Stat label="Distance" value={`${distanceKm.toFixed(2)} km`} />
          <Stat label="Calories" value={`${calories} kcal`} />
          <Stat label="Pace"     value={`${pace} /km`} />
        </View>

        {/* Controls */}
        <View style={s.controls}>
          {!isRunning ? (
            <TouchableOpacity style={s.btn} onPress={handleStart}>
              <Text style={s.btnTxt}>{durationMs > 0 ? 'Resume' : 'Go!'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={handlePause}>
              <Text style={[s.btnTxt, s.btnTxtSecondary]}>Pause</Text>
            </TouchableOpacity>
          )}

          {durationMs > 0 && (
            <TouchableOpacity style={[s.btn, s.btnFinish]} onPress={handleFinish}>
              <Text style={s.btnTxt}>Finish Run</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function Stat({ label, value }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0D0D0D' },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'space-evenly',
    paddingHorizontal: 24,
  },
  timer:     { fontSize: 72, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  timerLabel:{ fontSize: 13, color: '#FF6B35', letterSpacing: 3, fontWeight: '600' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', width: '100%', gap: 12,
  },
  statBox: {
    width: '47%', backgroundColor: '#1A1A1A',
    borderRadius: 16, padding: 20, alignItems: 'center',
  },
  statVal: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  statLbl: { fontSize: 12, color: '#9E9E9E', marginTop: 4, letterSpacing: 1 },

  controls: { width: '100%', gap: 12 },
  btn: {
    backgroundColor: '#FF6B35', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#FF6B35' },
  btnFinish:    { backgroundColor: '#2E7D32' },
  btnTxt:       { color: '#fff', fontSize: 18, fontWeight: '700' },
  btnTxtSecondary: { color: '#FF6B35' },
});
