import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store';
import { SongsScreen } from './src/ui/SongsScreen';
import { PlayScreen } from './src/ui/PlayScreen';
import { MetronomeScreen } from './src/ui/ToolsScreen';
import { TunerScreen } from './src/ui/TunerScreen';
import { PracticeScreen } from './src/ui/PracticeScreen';
import { UpdateBanner } from './src/ui/UpdateBanner';
import { C, s } from './src/ui/theme';

type Tab = 'songs' | 'practice' | 'metro' | 'tuner';
const TABS: { k: Tab; label: string }[] = [
  { k: 'songs', label: 'Lieder' },
  { k: 'practice', label: 'Ueben' },
  { k: 'metro', label: 'Metronom' },
  { k: 'tuner', label: 'Stimmen' },
];

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('songs');
  const [open, setOpen] = useState<string | null>(null);
  const song = store.songs.find((x) => x.id === open);

  if (!store.ready) return <View style={s.screen} />;

  return (
    <SafeAreaProvider>
    <SafeAreaView style={s.screen}>
      <StatusBar style="light" />
      <UpdateBanner />
      <View style={{ flex: 1 }}>
        {song ? (
          <PlayScreen
            song={song}
            onBack={() => setOpen(null)}
            onChange={(p) => store.setSongs((a) => a.map((x) => (x.id === song.id ? { ...x, ...p } : x)))}
            onDelete={() => { store.setSongs((a) => a.filter((x) => x.id !== song.id)); setOpen(null); }}
            onPractice={(m) => store.addMinutes(m, song.id)}
          />
        ) : tab === 'songs' ? (
          <SongsScreen songs={store.songs} onOpen={setOpen} onAdd={(x) => store.setSongs((a) => [x, ...a])} />
        ) : tab === 'practice' ? (
          <PracticeScreen songs={store.songs} log={store.log} onOpen={setOpen} onAddMinutes={(m) => store.addMinutes(m)} />
        ) : tab === 'metro' ? (
          <MetronomeScreen />
        ) : (
          <TunerScreen />
        )}
      </View>
      {!song && (
        <View style={{ flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderColor: C.line }}>
          {TABS.map((t) => (
            <Pressable key={t.k} onPress={() => setTab(t.k)} style={{ flex: 1, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: tab === t.k ? C.accent : C.dim, fontWeight: '600' }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
