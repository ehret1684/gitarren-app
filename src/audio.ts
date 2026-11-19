import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { makeWav, wavDataUri } from './logic/wav';

const cache = new Map<string, AudioPlayer>();

function source(key: string, bytes: Uint8Array): string {
  if (Platform.OS === 'web') return wavDataUri(bytes);
  const f = new File(Paths.cache, `${key}.wav`);
  if (!f.exists) f.create();
  f.write(bytes);
  return f.uri;
}

export function tonePlayer(key: string, freq: number, ms: number, decay: boolean): AudioPlayer {
  let p = cache.get(key);
  if (!p) {
    p = createAudioPlayer({ uri: source(key, makeWav(freq, ms, decay)) });
    cache.set(key, p);
  }
  return p;
}

export function play(p: AudioPlayer) {
  try {
    p.seekTo(0);
    p.play();
  } catch {
    /* Ton ausgelassen, kein Absturz */
  }
}

export function stopAll() {
  cache.forEach((p) => {
    try {
      p.pause();
    } catch {
      /* ignorieren */
    }
  });
}
