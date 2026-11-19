import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Log, Song, dayKey, streak, suggestToday, weekMinutes } from '../logic/practice';
import { C, s } from './theme';

export function PracticeScreen({ songs, log, onOpen, onAddMinutes }: {
  songs: Song[];
  log: Log;
  onOpen: (id: string) => void;
  onAddMinutes: (m: number) => void;
}) {
  const now = new Date();
  const todayMin = log[dayKey(now)] ?? 0;
  const sug = suggestToday(songs);
  const [left, setLeft] = useState(10 * 60);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [run]);
  useEffect(() => {
    if (run && left <= 0) {
      setRun(false);
      setLeft(10 * 60);
      onAddMinutes(10);
    }
  }, [left, run, onAddMinutes]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    return { d, m: log[dayKey(d)] ?? 0 };
  });
  const max = Math.max(15, ...days.map((x) => x.m));

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad}>
      <Text style={s.h1}>Ueben</Text>
      <View style={[s.card, s.row, { justifyContent: 'space-around' }]}>
        <Stat v={String(streak(log, now))} l="Tage in Folge" />
        <Stat v={String(todayMin)} l="Min heute" />
        <Stat v={String(weekMinutes(log, now))} l="Min Woche" />
      </View>
      <View style={[s.card, s.row, { justifyContent: 'space-between', alignItems: 'flex-end', height: 110 }]}>
        {days.map(({ d, m }) => (
          <View key={d.getTime()} style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 18, height: Math.max(3, (m / max) * 60), backgroundColor: m ? C.accent : C.line, borderRadius: 4 }} />
            <Text style={[s.dim, { fontSize: 11, marginTop: 4 }]}>{['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]}</Text>
          </View>
        ))}
      </View>
      <Text style={s.h2}>Heute ueben</Text>
      {sug.length ? sug.map((x) => (
        <Pressable key={x.id} style={s.card} onPress={() => onOpen(x.id)}>
          <Text style={s.text}>{x.title}</Text>
          <Text style={s.dim}>{x.lastPracticed ? `zuletzt ${x.lastPracticed}` : 'noch nie geuebt'}</Text>
        </Pressable>
      )) : <Text style={s.dim}>Lege zuerst Lieder an.</Text>}
      <Text style={[s.h2, { marginTop: 12 }]}>10-Minuten-Timer</Text>
      <View style={[s.card, { alignItems: 'center' }]}>
        <Text style={{ color: C.text, fontSize: 48, fontWeight: '700' }}>
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
        </Text>
        <View style={[s.row, { marginTop: 8 }]}>
          <Pressable style={[s.btn, { marginRight: 8 }]} onPress={() => setRun((r) => !r)}>
            <Text style={s.btnTxt}>{run ? 'Pause' : 'Start'}</Text>
          </Pressable>
          <Pressable
            style={s.btn2}
            onPress={() => {
              const m = Math.round((10 * 60 - left) / 60);
              setRun(false);
              setLeft(10 * 60);
              if (m > 0) onAddMinutes(m);
            }}
          >
            <Text style={s.btn2Txt}>Beenden & zaehlen</Text>
          </Pressable>
        </View>
      </View>
      <Text style={s.dim}>Zeit im Liedmodus zaehlt automatisch mit.</Text>
    </ScrollView>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: C.accent, fontSize: 30, fontWeight: '800' }}>{v}</Text>
      <Text style={s.dim}>{l}</Text>
    </View>
  );
}
