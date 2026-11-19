import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Log, Song, dayKey } from './logic/practice';

const K_SONGS = 'gitarren.songs.v1';
const K_LOG = 'gitarren.log.v1';

const DEMO: Song[] = [
  {
    id: 'demo1',
    title: 'Beispiel: Vier-Akkorde-Lied',
    artist: 'Eigene Uebung (frei)',
    status: 'neu',
    bpm: 80,
    body: 'Strophe\n[G]Das ist ein [D]kleines Beispiel\n[Em]zum Ueben der [C]Wechsel\n\nRefrain\n[G]La la la, [D]la la la\n[Em]la la [C]la la [G]la',
  },
];

export function useStore() {
  const [songs, setSongsState] = useState<Song[]>([]);
  const [log, setLogState] = useState<Log>({});
  const [ready, setReady] = useState(false);
  const songsRef = useRef<Song[]>([]);
  const logRef = useRef<Log>({});

  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem(K_SONGS);
        const l = await AsyncStorage.getItem(K_LOG);
        songsRef.current = s ? JSON.parse(s) : DEMO;
        logRef.current = l ? JSON.parse(l) : {};
      } catch {
        songsRef.current = DEMO;
      }
      setSongsState(songsRef.current);
      setLogState(logRef.current);
      setReady(true);
    })();
  }, []);

  const setSongs = useCallback((fn: (s: Song[]) => Song[]) => {
    songsRef.current = fn(songsRef.current);
    setSongsState(songsRef.current);
    AsyncStorage.setItem(K_SONGS, JSON.stringify(songsRef.current)).catch(() => {});
  }, []);

  const addMinutes = useCallback((min: number, songId?: string) => {
    const k = dayKey(new Date());
    logRef.current = { ...logRef.current, [k]: (logRef.current[k] ?? 0) + min };
    setLogState(logRef.current);
    AsyncStorage.setItem(K_LOG, JSON.stringify(logRef.current)).catch(() => {});
    if (songId) setSongs((a) => a.map((s) => (s.id === songId ? { ...s, lastPracticed: k } : s)));
  }, [setSongs]);

  return { songs, log, ready, setSongs, addMinutes };
}

export type Store = ReturnType<typeof useStore>;
