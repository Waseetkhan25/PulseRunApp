/**
 * HomeScreen.js
 * Entry point. One job: take the user to an active run.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.logo}>🏃 PulseRun</Text>
        <Text style={s.tagline}>Every step counts.</Text>

        <TouchableOpacity
          style={s.startBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ActiveRun')}
        >
          <Text style={s.startTxt}>Start Run</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo:      { fontSize: 36, fontWeight: '800', color: '#FF6B35' },
  tagline:   { fontSize: 16, color: '#9E9E9E', marginBottom: 48 },
  startBtn:  {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 56,
    paddingVertical: 18,
    borderRadius: 50,
  },
  startTxt:  { color: '#fff', fontSize: 20, fontWeight: '700' },
});
