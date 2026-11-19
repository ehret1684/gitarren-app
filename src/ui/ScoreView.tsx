import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Melody, MNote } from '../data/melodies';
import { shapeFor, transposeChord, Style } from '../logic/chords';
import { barWidth, cellWidth, fretFor, layoutSystems, noteShape, staffPos, transposeBars } from '../logic/score';
import { ChordDiagram } from './ChordDiagram';
import { C } from './theme';

const SP = 9; // Abstand zweier Notenlinien
const HALF = SP / 2;
const STAFF_TOP = 44; // Platz ueber der Notenzeile (Hilfslinien, Hals)
const STAFF_H = SP * 4;
const BOTTOM_STEP = 30; // E4 = unterste Linie
const TAB_GAP = 13;

const yOfStep = (step: number) => STAFF_TOP + STAFF_H - (step - BOTTOM_STEP) * HALF;

/** Notenblatt: Griffbilder, Noten, Text und Tabulatur der Melodie, Zeile fuer Zeile. */
export function ScoreView({ melody, steps, style, fontSize = 15 }: { melody: Melody; steps: number; style: Style; fontSize?: number }) {
  const [width, setWidth] = useState(0);
  const bars = transposeBars(melody.bars, steps);
  const fs = Math.min(13, Math.max(10, fontSize - 3)); // Silbenschrift, damit zwei Takte je Zeile passen
  const systems = width ? layoutSystems(bars, width - 4, fs) : [];
  const mapChord = (c: string) => (steps ? transposeChord(c, steps, style) : c);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Text style={{ color: C.dim, marginBottom: 6 }}>{melody.meter}-Takt · {steps ? `${steps > 0 ? '+' : ''}${steps} Halbtöne` : 'Tonart wie in der Liedansicht'}</Text>
      {systems.map((sys, si) => (
        <System key={si} bars={sys.map((i) => bars[i])} mapChord={mapChord} german={style.german} fontSize={fs} />
      ))}
      <Text style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{melody.source}</Text>
    </View>
  );
}

function System({ bars, mapChord, german, fontSize }: { bars: MNote[][]; mapChord: (c: string) => string; german: boolean; fontSize: number }) {
  const total = bars.reduce((a, b) => a + barWidth(b, fontSize), 0);
  const tabTop = STAFF_TOP + STAFF_H + 44;
  const height = tabTop + TAB_GAP * 5 + 20;
  let x = 0;
  const items: React.ReactNode[] = [];
  const chordsAt: { x: number; name: string }[] = [];

  bars.forEach((bar, bi) => {
    x += 4;
    bar.forEach((n, ni) => {
      const w = cellWidth(n, fontSize);
      const cx = x + w / 2;
      const [midi, len, syl, chord] = n;
      const key = `${bi}-${ni}`;
      if (chord) chordsAt.push({ x: x + 2, name: mapChord(chord) });
      const { step, sharp } = staffPos(midi);
      const y = yOfStep(step);
      const sh = noteShape(len);
      const up = step < 34;
      // Hilfslinien
      for (let s = BOTTOM_STEP - 2; s >= step; s -= 2) items.push(<View key={`${key}l${s}`} style={{ position: 'absolute', left: cx - 9, width: 18, top: yOfStep(s), height: 1, backgroundColor: C.text }} />);
      for (let s = 40; s <= step; s += 2) items.push(<View key={`${key}u${s}`} style={{ position: 'absolute', left: cx - 9, width: 18, top: yOfStep(s), height: 1, backgroundColor: C.text }} />);
      // Kreuz
      if (sharp) items.push(<Text key={`${key}#`} style={{ position: 'absolute', left: cx - 17, top: y - 11, color: C.text, fontSize: 13 }}>♯</Text>);
      // Hals und Fahne
      if (sh.stem) {
        const sx = up ? cx + 4 : cx - 5;
        const top = up ? y - 26 : y;
        items.push(<View key={`${key}s`} style={{ position: 'absolute', left: sx, top, width: 1.5, height: 26, backgroundColor: C.text }} />);
        for (let f = 0; f < sh.flags; f++) {
          items.push(<View key={`${key}f${f}`} style={{ position: 'absolute', left: sx + 1, top: up ? y - 26 + f * 5 : y + 21 - f * 5, width: 8, height: 2, backgroundColor: C.text, transform: [{ rotate: up ? '45deg' : '-45deg' }] }} />);
        }
      }
      // Kopf
      items.push(
        <View key={`${key}h`} style={{ position: 'absolute', left: cx - 5, top: y - 4, width: 10, height: 8, borderRadius: 5, borderWidth: 1.5, borderColor: C.text, backgroundColor: sh.head === 'filled' ? C.text : C.bg, transform: [{ rotate: '-20deg' }] }} />,
      );
      if (sh.dots) items.push(<View key={`${key}d`} style={{ position: 'absolute', left: cx + 8, top: y - (step % 2 === 0 ? 4 : 1), width: 3, height: 3, borderRadius: 2, backgroundColor: C.text }} />);
      // Text
      if (syl) items.push(<Text key={`${key}t`} style={{ position: 'absolute', left: x, width: w, top: STAFF_TOP + STAFF_H + 14, textAlign: 'center', color: C.text, fontSize, fontFamily: 'monospace' }}>{syl === '_' ? '___' : syl}</Text>);
      // Tabulatur
      const pos = fretFor(midi);
      if (pos) {
        items.push(
          <Text key={`${key}n`} style={{ position: 'absolute', left: cx - 10, width: 20, top: tabTop + pos.string * TAB_GAP - 8, textAlign: 'center', backgroundColor: C.bg, color: C.accent, fontWeight: '700', fontSize: 13, lineHeight: 16 }}>{pos.fret}</Text>,
        );
      }
      x += w;
    });
    x += 4;
    items.push(<View key={`bar${bi}`} style={{ position: 'absolute', left: x - 1, top: STAFF_TOP, width: 1.5, height: STAFF_H, backgroundColor: C.text }} />);
    items.push(<View key={`tbar${bi}`} style={{ position: 'absolute', left: x - 1, top: tabTop, width: 1.5, height: TAB_GAP * 5, backgroundColor: C.dim }} />);
  });

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', height: 100 }}>
        {/* Griffbilder auf der Hoehe ihrer Note */}
        {chordsAt.map((c, i) => {
          const sh = shapeFor(c.name, german);
          return (
            <View key={i} style={{ position: 'absolute', left: c.x - 6, top: 0 }}>
              {sh ? <ChordDiagram name={c.name} shape={sh} /> : <Text style={{ color: C.chord, fontWeight: '700' }}>{c.name}</Text>}
            </View>
          );
        })}
      </View>
      <View style={{ width: total, height }}>
        {/* Notenlinien */}
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={`sl${i}`} style={{ position: 'absolute', left: 0, width: total, top: STAFF_TOP + i * SP, height: 1, backgroundColor: C.text }} />
        ))}
        {/* Tabulaturlinien */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={`tl${i}`} style={{ position: 'absolute', left: 0, width: total, top: tabTop + i * TAB_GAP, height: 1, backgroundColor: C.dim }} />
        ))}
        <Text style={{ position: 'absolute', left: 0, top: tabTop - 2, color: C.dim, fontSize: 11, fontWeight: '700', width: 12 }}>T{'\n'}A{'\n'}B</Text>
        {items}
      </View>
    </View>
  );
}
