// Natives Mikrofon (Android/iOS): liefert rohe PCM-Bloecke. Die Web-Fassung liegt in nativeMic.web.ts (Stub).
import { AudioManager, AudioRecorder } from 'react-native-audio-api';

export const nativeMicAvailable = true;
const RATE = 44100;

/** Startet die Aufnahme und ruft onChunk mit Mono-Samples (-1..1) und der tatsaechlichen Abtastrate. */
export async function startNativePcm(onChunk: (samples: Float32Array, sampleRate: number) => void): Promise<() => void> {
  const perm = await AudioManager.requestRecordingPermissions();
  if (perm !== 'Granted') throw new Error('Mikrofon verweigert');
  const recorder = new AudioRecorder();
  const r = recorder.onAudioReady({ sampleRate: RATE, bufferLength: 2048, channelCount: 1 }, (e) => {
    onChunk(e.buffer.getChannelData(0), e.buffer.sampleRate || RATE);
  });
  if ((r as any)?.status === 'error') throw new Error('Aufnahme nicht moeglich');
  const started = await recorder.start();
  if ((started as any)?.status === 'error') throw new Error('Aufnahme nicht gestartet');
  return () => {
    recorder.clearOnAudioReady();
    recorder.stop().catch(() => {});
  };
}
