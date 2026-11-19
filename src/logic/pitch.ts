import { STRINGS } from './wav';

/** Grundfrequenz per YIN (de Cheveigne/Kawahara). Gibt null zurueck, wenn kein klarer Ton da ist. */
export function detectPitch(buf: Float32Array, sampleRate: number, fMin = 60, fMax = 450): number | null {
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / buf.length) < 0.008) return null;
  const tauMax = Math.min(Math.floor(sampleRate / fMin), Math.floor(buf.length / 2) - 1);
  const tauMin = Math.max(2, Math.floor(sampleRate / fMax));
  const d = new Float32Array(tauMax + 1);
  const n = buf.length - tauMax;
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x = buf[i] - buf[i + tau];
      sum += x * x;
    }
    d[tau] = sum;
  }
  // kumulativ normierte Differenz
  let run = 0;
  d[0] = 1;
  for (let tau = 1; tau <= tauMax; tau++) {
    run += d[tau];
    d[tau] = run === 0 ? 1 : (d[tau] * tau) / run;
  }
  const TH = 0.15;
  let tau = -1;
  for (let t = tauMin; t < tauMax; t++) {
    if (d[t] < TH) {
      while (t + 1 < tauMax && d[t + 1] < d[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) return null;
  // parabolische Interpolation
  const a = d[tau - 1], b = d[tau], c = d[tau + 1];
  const den = a - 2 * b + c;
  const shift = den === 0 ? 0 : (a - c) / (2 * den);
  return sampleRate / (tau + shift);
}

export const centsBetween = (f: number, ref: number): number => 1200 * Math.log2(f / ref);

export type TuneResult = { string: (typeof STRINGS)[number]; cents: number };

/** Naechste Gitarrensaite (Standardstimmung, optional um Halbtoene verschoben) und Abweichung in Cent. */
export function nearestString(f: number, offsetSemis = 0): TuneResult {
  const k = Math.pow(2, offsetSemis / 12);
  let best = STRINGS[0];
  for (const st of STRINGS) if (Math.abs(centsBetween(f, st.freq * k)) < Math.abs(centsBetween(f, best.freq * k))) best = st;
  return { string: best, cents: centsBetween(f, best.freq * k) };
}

/** Mittelt die letzten Messungen (Median) gegen Ausreisser. */
export class PitchSmoother {
  private v: number[] = [];
  constructor(private size = 5) {}
  push(f: number | null): number | null {
    if (f == null) {
      if (this.v.length) this.v.shift();
    } else {
      this.v.push(f);
      if (this.v.length > this.size) this.v.shift();
    }
    if (!this.v.length) return null;
    const s = [...this.v].sort((x, y) => x - y);
    return s[Math.floor(s.length / 2)];
  }
  reset() { this.v = []; }
}
