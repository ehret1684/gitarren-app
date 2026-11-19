import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { play, tonePlayer } from '../audio';
import { STRINGS } from '../logic/wav';
import { detectPitch, nearestString, PitchSmoother } from '../logic/pitch';
import { micSupported, startPitchMic } from '../mic';
import { C, s } from './theme';

const IN_TUNE = 5; // Cent

export function TunerScreen() {
  const [active, setActive] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState('');
  const [semis, setSemis] = useState(0);
  const [res, setRes] = useState<{ name: string; cents: number; hz: number } | null>(null);
  const stopRef = useRef<null | (() => void)>(null);
  const semisRef = useRef(0);
  semisRef.current = semis;

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setListening(false);
    setRes(null);
  };
  useEffect(() => () => stopRef.current?.(), []);

  const start = async () => {
    setErr('');
    if (!micSupported()) {
      setErr('Mikrofon geht nur in der Web-App (https) - nutze die Referenztoene unten.');
      return;
    }
    try {
      const sm = new PitchSmoother(5);
      let miss = 0;
      stopRef.current = await startPitchMic((wave, sr) => {
        const f = sm.push(detectPitch(wave, sr));
        if (f == null) {
          if (++miss > 12) setRes(null);
          return;
        }
        miss = 0;
        const r = nearestString(f, semisRef.current);
        setRes({ name: r.string.name, cents: r.cents, hz: f });
      });
      setListening(true);
    } catch {
      setErr('Kein Zugriff aufs Mikrofon. Bitte im Browser erlauben.');
    }
  };

  const play1 = (name: string, freq: number) => {
    setActive(name);
    play(tonePlayer('tone-' + name + semis, freq * Math.pow(2, semis / 12), 2500, false));
  };
  const cents = res ? Math.max(-50, Math.min(50, res.cents)) : 0;
  const ok = res != null && Math.abs(res.cents) <= IN_TUNE;
  const hint = !res ? '' : ok ? 'Stimmt!' : res.cents < 0 ? 'Zu tief - Saite anziehen' : 'Zu hoch - Saite lockern';
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad}>
      <Text style={s.h1}>Stimmen</Text>
      <View style={[s.card, { alignItems: 'center' }]}>
        <Text style={{ color: res ? (ok ? C.ok : C.accent) : C.dim, fontSize: 80, fontWeight: '800' }}>{res ? res.name : '-'}</Text>
        <Text style={s.dim}>
          {res ? `${res.hz.toFixed(1)} Hz · ${res.cents > 0 ? '+' : ''}${res.cents.toFixed(0)} Cent` : listening ? 'Schlag eine Saite an ...' : 'Mikrofon aus'}
        </Text>
        <View style={{ width: '100%', height: 36, marginTop: 14, justifyContent: 'center' }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: C.line }} />
          <View style={{ position: 'absolute', left: '50%', width: 2, height: 28, marginLeft: -1, backgroundColor: C.ok }} />
          {res && (
            <View
              style={{
                position: 'absolute',
                left: `${50 + cents}%`,
                width: 14,
                height: 30,
                marginLeft: -7,
                borderRadius: 7,
                backgroundColor: ok ? C.ok : Math.abs(res.cents) > 25 ? C.warn : C.accent,
              }}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text style={s.dim}>tief</Text>
          <Text style={s.dim}>{hint}</Text>
          <Text style={s.dim}>hoch</Text>
        </View>
      </View>
      <Pressable style={s.btn} onPress={listening ? stop : start}>
        <Text style={s.btnTxt}>{listening ? 'Stimmgeraet stoppen' : 'Stimmgeraet starten'}</Text>
      </Pressable>
      {!!err && <Text style={[s.dim, { color: C.warn, marginTop: 8 }]}>{err}</Text>}
      <View style={[s.row, { marginTop: 12, marginBottom: 4 }]}>
        <Text style={[s.dim, { marginRight: 8 }]}>Stimmung:</Text>
        {([[0, 'Standard'], [-1, 'Halbton tiefer']] as [number, string][]).map(([v, l]) => (
          <Pressable key={v} style={[s.btn2, { marginRight: 6, minHeight: 38, paddingVertical: 6, borderColor: semis === v ? C.accent : C.line }]} onPress={() => setSemis(v)}>
            <Text style={s.btn2Txt}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.dim, { marginVertical: 8 }]}>
        Saite einzeln anschlagen, ausklingen lassen und drehen, bis der Zeiger gruen in der Mitte steht. Ohne Mikrofon: Referenzton antippen und nach Gehoer angleichen.
      </Text>
      {STRINGS.map((st) => (
        <Pressable
          key={st.name}
          style={[s.card, s.row, { borderColor: res?.name === st.name ? C.ok : active === st.name ? C.accent : C.line }]}
          onPress={() => play1(st.name, st.freq)}
        >
          <Text style={{ color: C.accent, fontSize: 28, fontWeight: '800', width: 44 }}>{st.name}</Text>
          <View>
            <Text style={s.text}>{st.label}</Text>
            <Text style={s.dim}>{(st.freq * Math.pow(2, semis / 12)).toFixed(2)} Hz</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
