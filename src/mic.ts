import { Platform } from 'react-native';
import { chromaFromSpectrum } from './logic/listen';

export const micSupported = (): boolean =>
  Platform.OS === 'web' && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

export type MicFrame = { chroma: number[]; level: number };

/**
 * Hoert (nur Web/PWA, braucht https) mit dem Mikrofon zu und liefert alle ~100 ms einen Tonhoehenvektor.
 * Echo-/Rauschunterdrueckung ist aus, weil sie Gitarrenklang verfaelscht. Gibt eine Stopp-Funktion zurueck.
 */
export async function startMic(onFrame: (f: MicFrame) => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const Ctx = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  const ctx = new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 8192;
  analyser.smoothingTimeConstant = 0.6;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const db = new Float32Array(analyser.frequencyBinCount);
  const mags = new Float32Array(analyser.frequencyBinCount);
  const wave = new Float32Array(analyser.fftSize);

  const timer = setInterval(() => {
    analyser.getFloatFrequencyData(db);
    analyser.getFloatTimeDomainData(wave);
    let sum = 0;
    for (let i = 0; i < wave.length; i++) sum += wave[i] * wave[i];
    const level = Math.sqrt(sum / wave.length);
    for (let i = 0; i < db.length; i++) mags[i] = Math.pow(10, db[i] / 20);
    onFrame({ chroma: chromaFromSpectrum(mags, ctx.sampleRate, analyser.fftSize), level });
  }, 100);

  return () => {
    clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    ctx.close().catch(() => {});
  };
}
