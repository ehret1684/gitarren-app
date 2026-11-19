import React from 'react';
import { Text, View } from 'react-native';
import { C } from './theme';

/** Griffbild: 6 Saiten (E A D G B e), 4 Buende. */
export function ChordDiagram({ name, shape }: { name: string; shape: number[] }) {
  const W = 12;
  const H = 14;
  const base = Math.max(...shape) > 4 ? Math.min(...shape.filter((f) => f > 0)) : 1;
  return (
    <View style={{ alignItems: 'center', margin: 6 }}>
      <Text style={{ color: C.chord, fontWeight: '700', marginBottom: 2 }}>{name}</Text>
      <View style={{ flexDirection: 'row', height: 14 }}>
        {shape.map((f, i) => (
          <Text key={i} style={{ width: W, color: C.dim, fontSize: 10, textAlign: 'center' }}>
            {f < 0 ? 'x' : f === 0 ? 'o' : ''}
          </Text>
        ))}
      </View>
      <View style={{ width: W * 5 + 1, height: H * 4 + 1, borderTopWidth: base === 1 ? 3 : 1, borderColor: C.dim }}>
        {[1, 2, 3, 4].map((r) => (
          <View key={r} style={{ position: 'absolute', top: (r - 1) * H, left: 0, right: 0, height: H, borderBottomWidth: 1, borderColor: C.line }} />
        ))}
        {shape.map((_, i) => (
          <View key={i} style={{ position: 'absolute', left: i * W, top: 0, bottom: 0, width: 1, backgroundColor: C.dim }} />
        ))}
        {shape.map((f, i) =>
          f > 0 ? (
            <View
              key={i}
              style={{ position: 'absolute', left: i * W - 5, top: (f - base) * H + 2, width: 11, height: 11, borderRadius: 6, backgroundColor: C.accent }}
            />
          ) : null,
        )}
      </View>
      {base > 1 ? <Text style={{ color: C.dim, fontSize: 10 }}>{base}. Bund</Text> : null}
    </View>
  );
}
