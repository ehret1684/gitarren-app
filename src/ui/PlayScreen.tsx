import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, ScrollViewInstance, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Song, Status } from '../logic/practice';
import { allChords, parseSong, toSegments } from '../logic/song';
import { Style, detectGerman, shapeFor, suggestCapo, transposeChord } from '../logic/chords';
import { ChordDiagram } from './ChordDiagram';
import { STATUS_LABEL } from './SongsScreen';
import { C, s } from './theme';

export function PlayScreen({ song, onBack, onChange, onDelete, onPractice }: {
  song: Song;
  onBack: () => void;
  onChange: (p: Partial<Song>) => void;
  onDelete: () => void;
  onPractice: (min: number) => void;
}) {
  useKeepAwake();
  const lines = useMemo(() => parseSong(song.body), [song.body]);
  const chords = useMemo(() => allChords(lines), [lines]);
  const german = useMemo(() => detectGerman(chords), [chords]);
  const [steps, setSteps] = useState(0);
  const [scroll, setScroll] = useState(0); // Pixel pro Sekunde, 0 = aus
  const [fontSize, setFontSize] = useState(17);
  const [secs, setSecs] = useState(0);
  const sv = useRef<ScrollViewInstance>(null);
  const y = useRef(0);

  const st: Style = { flats: steps !== 0 && [1, 3, 5, 8, 10].includes(((steps % 12) + 12) % 12), german };
  const map = (c: string) => (steps ? transposeChord(c, steps, st) : c);
  const shown = [...new Set(chords.map(map))];
  const capo = useMemo(() => suggestCapo(chords, german), [chords, german]);

  useEffect(() => {
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!scroll) return;
    const t = setInterval(() => {
      y.current += scroll / 10;
      sv.current?.scrollTo({ y: y.current, animated: false });
    }, 100);
    return () => clearInterval(t);
  }, [scroll]);

  const done = () => {
    onPractice(Math.max(1, Math.round(secs / 60)));
    onBack();
  };

  return (
    <View style={s.screen}>
      <View style={[s.row, { padding: 12 }]}>
        <Pressable onPress={done} style={s.btn2}><Text style={s.btn2Txt}>‹ Fertig</Text></Pressable>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text style={s.h2} numberOfLines={1}>{song.title}</Text>
          <Text style={s.dim}>Uebezeit {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</Text>
        </View>
      </View>
      <ScrollView
        ref={sv}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onScroll={(e) => { if (!scroll) y.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={50}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {shown.map((c) => {
            const sh = shapeFor(c, german);
            return sh ? <ChordDiagram key={c} name={c} shape={sh} /> : <Text key={c} style={{ color: C.chord, margin: 8 }}>{c}</Text>;
          })}
        </View>
        {capo.capo > 0 && steps === 0 && capo.easy > 0 && (
          <Text style={[s.dim, { marginBottom: 12 }]}>
            Tipp: Kapodaster im {capo.capo}. Bund, dann Griffe wie {chords.length ? 'diese' : ''} ohne Barre ({capo.easy} von {capo.total} leicht).
            Mit "−" unten um {capo.capo} Halbtoene absenken.
          </Text>
        )}
        {lines.map((l, i) =>
          l.section ? (
            <Text key={i} style={{ color: C.accent, fontWeight: '700', marginTop: 14, marginBottom: 4, fontSize }}>{l.section}</Text>
          ) : (
            <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', minHeight: fontSize + 6, marginBottom: 6 }}>
              {toSegments(l, map).map((g, k) => (
                <View key={k}>
                  <Text style={{ color: C.chord, fontWeight: '700', fontSize: fontSize - 1, height: g.chord || l.chords.length ? fontSize + 4 : 0, fontFamily: 'monospace' }}>
                    {g.chord ? g.chord + ' ' : ' '}
                  </Text>
                  <Text style={{ color: C.text, fontSize, fontFamily: 'monospace' }}>{g.text || ' '}</Text>
                </View>
              ))}
            </View>
          ),
        )}
      </ScrollView>
      <View style={{ backgroundColor: C.card, padding: 10, borderTopWidth: 1, borderColor: C.line }}>
        <View style={[s.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
          <View style={s.row}>
            <Pressable style={s.btn2} onPress={() => setSteps((x) => x - 1)}><Text style={s.btn2Txt}>−</Text></Pressable>
            <Text style={[s.text, { marginHorizontal: 10 }]}>{steps > 0 ? '+' : ''}{steps}</Text>
            <Pressable style={s.btn2} onPress={() => setSteps((x) => x + 1)}><Text style={s.btn2Txt}>+</Text></Pressable>
          </View>
          <View style={s.row}>
            <Pressable style={s.btn2} onPress={() => setFontSize((f) => Math.max(12, f - 2))}><Text style={s.btn2Txt}>A−</Text></Pressable>
            <Pressable style={[s.btn2, { marginLeft: 6 }]} onPress={() => setFontSize((f) => Math.min(30, f + 2))}><Text style={s.btn2Txt}>A+</Text></Pressable>
          </View>
          <Pressable style={[s.btn2, { borderColor: scroll ? C.accent : C.line }]} onPress={() => setScroll((x) => (x === 0 ? 20 : x === 20 ? 40 : 0))}>
            <Text style={s.btn2Txt}>{scroll ? `Scroll ${scroll / 20}x` : 'Scroll aus'}</Text>
          </Pressable>
        </View>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          {(['neu', 'ueben', 'kann'] as Status[]).map((k) => (
            <Pressable key={k} style={[s.btn2, { flex: 1, marginHorizontal: 3, borderColor: song.status === k ? C.accent : C.line }]} onPress={() => onChange({ status: k })}>
              <Text style={s.btn2Txt}>{STATUS_LABEL[k]}</Text>
            </Pressable>
          ))}
          <Pressable
            style={[s.btn2, { marginLeft: 3 }]}
            onPress={() => Alert.alert('Lied loeschen?', song.title, [{ text: 'Abbrechen' }, { text: 'Loeschen', style: 'destructive', onPress: onDelete }])}
          >
            <Text style={{ color: C.warn }}>Loeschen</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
