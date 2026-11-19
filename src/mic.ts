import { Platform } from 'react-native';
import { chromaFromSpectrum } from './logic/listen';
import { fftMagnitudes } from './logic/fft';
import { nativeMicAvailable, startNativePcm } from './nativeMic';

export const micSupported = (): boolean =>
  nativeMicAvailable || (Platform.OS === 'web' && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);

export type MicFrame = { chroma: number[]; level: number };

/** Ringpuffer ueber die letzten n Samples; liefert sie in zeitlicher Reihenfolge. */
class Ring {
  private buf: Float32Array;
  private pos = 0;
  private filled = 0;
  constructor(private n: number) {
    this.buf = new Float32Array(n);
  }
  push(x: Float32Array) {
    for (let i = 0; i < x.length; i++) {
      this.buf[this.pos] = x[i];
      this.pos = (this.pos + 1) % this.n;
    }
    this.filled = Math.min(this.n, this.filled + x.length);
  }
  get full() {
    return this.filled >= this.n;
  }
  window(): Float32Array {
    const out = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) out[i] = this.buf[(this.pos + i) % this.n];
    return out;
  }
}

function startNativeWindow(size: number, everyMs: number, onWindow: (w: Float32Array, sr: number) => void): Promise<() => void> {
  const ring = new Ring(size);
  let sr = 44100;
  return startNativePcm((chunk, rate) => {
    sr = rate;
    ring.push(chunk);
  }).then((stop) => {
    const timer = setInterval(() => {
      if (ring.full) onWindow(ring.window(), sr);
    }, everyMs);
    return () => {
      clearInterval(timer);
      stop();
    };
  });
}

/** Rohsignal fuer das Stimmgeraet: alle ~80 ms ein Zeitfenster (4096 Samples). Web: getUserMedia, nativ: PCM-Aufnahme. */
export async function startPitchMic(onWave: (wave: Float32Array, sampleRate: number) => void): Promise<() => void> {
  if (nativeMicAvailable) return startNativeWindow(4096, 80, onWave);
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const Ctx = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  const ctx = new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const wave = new Float32Array(analyser.fftSize);
  const timer = setInterval(() => {
    analyser.getFloatTimeDomainData(wave);
    onWave(wave, ctx.sampleRate);
  }, 80);
  return () => {
    clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    ctx.close().catch(() => {});
  };
}

/**
 * Hoert zu und liefert alle ~100 ms einen Tonhoehenvektor (Web und nativ).
 * Echo-/Rauschunterdrueckung ist aus, weil sie Gitarrenklang verfaelscht. Gibt eine Stopp-Funktion zurueck.
 */
export async function startMic(onFrame: (f: MicFrame) => void): Promise<() => void> {
  if (nativeMicAvailable) {
    return startNativeWindow(8192, 100, (w, sr) => {
      let sum = 0;
      for (let i = 0; i < w.length; i++) sum += w[i] * w[i];
      const level = Math.sqrt(sum / w.length);
      onFrame({ chroma: chromaFromSpectrum(fftMagnitudes(w), sr, w.length), level });
    });
  }
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
