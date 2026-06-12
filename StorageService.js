/**
 * HistoryScreen.js
 * Renders all past workouts from WorkoutContext in an optimised FlatList.
 * Each card shows the victory selfie thumbnail + key stats.
 */

import React, { useCallback } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet,
  SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';

import { useWorkout }     from '../context/WorkoutContext';
import { formatDuration, formatTimestamp } from '../utils/calculations';

// ── WorkoutCard ───────────────────────────────────────────────────────────────
const WorkoutCard = React.memo(({ item, onDelete }) => (
  <View style={s.card}>
    {/* Left: selfie thumbnail */}
    {item.photoUri ? (
      <Image source={{ uri: item.photoUri }} style={s.thumb} />
    ) : (
      <View style={[s.thumb, s.thumbPlaceholder]}>
        <Text style={{ fontSize: 28 }}>🏃</Text>
      </View>
    )}

    {/* Right: stats */}
    <View style={s.info}>
      <Text style={s.date}>{formatTimestamp(item.timestamp)}</Text>
      <View style={s.statsRow}>
        <MiniStat emoji="👟" value={item.steps?.toLocaleString() ?? '—'} label="steps" />
        <MiniStat emoji="📍" value={`${(item.distanceKm ?? 0).toFixed(2)}`} label="km" />
        <MiniStat emoji="⏱" value={formatDuration(item.durationMs ?? 0)} label="time" />
        <MiniStat emoji="🔥" value={`${item.calories ?? 0}`} label="kcal" />
      </View>
    </View>

    {/* Delete button */}
    <TouchableOpacity style={s.del} onPress={() => onDelete(item.id)}>
      <Text style={s.delTxt}>✕</Text>
    </TouchableOpacity>
  </View>
));

function MiniStat({ emoji, value, label }) {
  return (
    <View style={s.miniStat}>
      <Text style={s.miniVal}>{emoji} {value}</Text>
      <Text style={s.miniLbl}>{label}</Text>
    </View>
  );
}

// ── HistoryScreen ─────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const { state, deleteWorkout } = useWorkout();

  const confirmDelete = useCallback((id) => {
    Alert.alert('Delete run?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWorkout(id) },
    ]);
  }, [deleteWorkout]);

  const renderItem = useCallback(
    ({ item }) => <WorkoutCard item={item} onDelete={confirmDelete} />,
    [confirmDelete]
  );

  if (!state.isHydrated) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><Text style={s.empty}>Loading…</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {state.workouts.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 48 }}>🏁</Text>
          <Text style={s.empty}>No runs yet. Go crush it!</Text>
        </View>
      ) : (
        <FlatList
          data={state.workouts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          // ── Performance props (Helio G85 / 4GB RAM) ──────────────────────
          removeClippedSubviews
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={6}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  empty:  { color: '#9E9E9E', fontSize: 16 },
  list:   { padding: 16, gap: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 32 },
  thumbPlaceholder: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center', justifyContent: 'center',
  },
  info:     { flex: 1 },
  date:     { color: '#FF6B35', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  miniStat: { marginRight: 8 },
  miniVal:  { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  miniLbl:  { color: '#9E9E9E', fontSize: 10 },

  del:    { padding: 8 },
  delTxt: { color: '#555', fontSize: 14, fontWeight: '700' },
});
