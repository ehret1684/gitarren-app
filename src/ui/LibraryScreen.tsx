import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHRISTMAS, LibSong } from '../data/christmas';
import { Song } from '../logic/practice';
import { C, s } from './theme';

export function toSong(l: LibSong): Song {
  return { id: l.id, title: l.title, artist: l.artist, body: l.body, status: 'neu', bpm: l.bpm, source: 'bibliothek' };
}

export function LibraryScreen({ have, onAdd, onClose }: { have: Set<string>; onAdd: (s: Song[]) => void; onClose: () => void }) {
  const missing = CHRISTMAS.filter((x) => !have.has(x.id));
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.h1}>Weihnachtslieder</Text>
        <Text style={[s.dim, { marginBottom: 12 }]}>
          Gemeinfreie Texte mit einfachen Akkorden (offene Griffe). Antippen zum Hinzufügen.
        </Text>
        <Pressable
          style={[s.btn, { marginBottom: 12, opacity: missing.length ? 1 : 0.4 }]}
          disabled={!missing.length}
          onPress={() => onAdd(missing.map(toSong))}
        >
          <Text style={s.btnTxt}>{missing.length ? `Alle ${missing.length} hinzufügen` : 'Alle sind schon in deiner Liste'}</Text>
        </Pressable>
        {CHRISTMAS.map((x) => {
          const has = have.has(x.id);
          return (
            <Pressable key={x.id} style={[s.card, s.row, { opacity: has ? 0.5 : 1 }]} disabled={has} onPress={() => onAdd([toSong(x)])}>
              <View style={{ flex: 1 }}>
                <Text style={s.h2}>{x.title}</Text>
                <Text style={s.dim}>{x.artist}</Text>
              </View>
              <Text style={{ color: has ? C.ok : C.accent, fontWeight: '700' }}>{has ? '✓' : '+'}</Text>
            </Pressable>
          );
        })}
        <Pressable style={[s.btn2, { marginTop: 8 }]} onPress={onClose}>
          <Text style={s.btn2Txt}>Fertig</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
