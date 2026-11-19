import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { play, tonePlayer } from '../audio';
import { C, s } from './theme';

export function MetronomeScreen() {
  const [bpm, setBpm] = useState(80);
  const [beats, setBeats] = useState(4);
  const [on, setOn] = useState(false);
  const [beat, setBeat] = useState(0);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useEffect(() => {
    if (!on) return;
    let n = 0;
    let next = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const accent = n % beats === 0;
      try {
        play(tonePlayer(accent ? 'click-hi' : 'click-lo', accent ? 1500 : 1000, 40, true));
        Haptics.impactAsync(accent ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {
        /* ohne Ton weiterlaufen */
      }
      setBeat(n % beats);
      n++;
      next += 60000 / bpmRef.current;
      timer = setTimeout(tick, Math.max(0, next - Date.now()));
    };
    tick();
    return () => clearTimeout(timer);
  }, [on, beats]);

  const adj = (d: number) => setBpm((b) => Math.min(220, Math.max(30, b + d)));
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad}>
      <Text style={s.h1}>Metronom</Text>
      <View style={[s.card, { alignItems: 'center' }]}>
        <Text style={{ color: C.accent, fontSize: 72, fontWeight: '800' }}>{bpm}</Text>
        <Text style={s.dim}>Schlaege pro Minute</Text>
        <View style={[s.row, { marginTop: 12 }]}>
          {[-5, -1, 1, 5].map((d) => (
            <Pressable key={d} style={[s.btn2, { marginHorizontal: 4 }]} onPress={() => adj(d)}>
              <Text style={s.btn2Txt}>{d > 0 ? '+' : '−'}{Math.abs(d)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[s.row, { marginTop: 16 }]}>
          {Array.from({ length: beats }, (_, i) => (
            <View key={i} style={{ width: 22, height: 22, borderRadius: 11, margin: 5, backgroundColor: on && beat === i ? C.accent : C.line }} />
          ))}
        </View>
      </View>
      <View style={[s.row, { marginBottom: 12 }]}>
        {[2, 3, 4, 6].map((b) => (
          <Pressable key={b} style={[s.btn2, { marginRight: 6, borderColor: beats === b ? C.accent : C.line }]} onPress={() => setBeats(b)}>
            <Text style={s.btn2Txt}>{b}/4</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={s.btn} onPress={() => setOn((o) => !o)}>
        <Text style={s.btnTxt}>{on ? 'Stopp' : 'Start'}</Text>
      </Pressable>
      <Text style={[s.dim, { marginTop: 12 }]}>Tipp: Neue Akkordwechsel langsam ueben (60-70) und erst dann schneller werden.</Text>
    </ScrollView>
  );
}

