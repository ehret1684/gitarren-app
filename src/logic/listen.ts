import { parseChord, rootIndex } from './chords';

/** Tonhoehenklassen-Vektor (12 Werte, C=0) aus einem Betragsspektrum (linear, nicht dB). */
export function chromaFromSpectrum(mags: ArrayLike<number>, sampleRate: number, fftSize: number): number[] {
  const chroma = new Array(12).fill(0);
  const binW = sampleRate / fftSize;
  const lo = Math.max(1, Math.floor(70 / binW));
  const hi = Math.min(mags.length - 1, Math.ceil(1400 / binW));
  for (let i = lo; i <= hi; i++) {
    const f = i * binW;
    const pc = ((Math.round(12 * Math.log2(f / 440)) + 69) % 12 + 12) % 12;
    // tiefere Toene staerker: Grundtoene der Akkorde liegen tief, Obertoene stoeren sonst
    chroma[pc] += mags[i] * mags[i] * (1 / Math.sqrt(f / 100));
  }
  const n = Math.sqrt(chroma.reduce((a, b) => a + b * b, 0));
  return n > 0 ? chroma.map((c) => c / n) : chroma;
}

/** Gewichtete Akkordtoene als 12er-Vektor. */
export function chordTemplate(chord: string, german = false): number[] | null {
  const p = parseChord(chord);
  if (!p) return null;
  const r = rootIndex(p.root, german);
  if (r < 0) return null;
  const t = new Array(12).fill(0);
  const add = (iv: number, w: number) => (t[(r + iv) % 12] = Math.max(t[(r + iv) % 12], w));
  const sx = p.suffix;
  const minor = /^(m(?!aj)|min|-)/.test(sx);
  const dim = /^dim|°/.test(sx);
  add(0, 1);
  if (/sus2/.test(sx)) add(2, 0.8);
  else if (/sus/.test(sx)) add(5, 0.8);
  else add(dim || minor ? 3 : 4, 0.8);
  add(dim ? 6 : 7, 0.8);
  if (/maj7|M7/.test(sx)) add(11, 0.5);
  else if (/7/.test(sx)) add(10, 0.5);
  if (/add9/.test(sx)) add(2, 0.4);
  const n = Math.sqrt(t.reduce((a, b) => a + b * b, 0));
  return t.map((x) => x / n);
}

export type Scored = { chord: string; score: number };

/** Bewertet nur die uebergebenen Akkorde (die des Liedes): Kosinus-Aehnlichkeit, beste zuerst. */
export function scoreChords(chroma: number[], chords: string[], german = false): Scored[] {
  const out: Scored[] = [];
  for (const c of new Set(chords)) {
    const t = chordTemplate(c, german);
    if (t) out.push({ chord: c, score: t.reduce((a, b, i) => a + b * chroma[i], 0) });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** Erkannter Akkord oder null, wenn zu unsicher (Rauschen, Mischklang, kaum Abstand zum Zweiten). */
export function detect(chroma: number[], chords: string[], german = false, minScore = 0.72, margin = 0.04): string | null {
  const s = scoreChords(chroma, chords, german);
  if (!s.length || s[0].score < minScore) return null;
  if (s.length > 1 && s[0].score - s[1].score < margin) return null;
  return s[0].chord;
}

export type Token = { chord: string; line: number };

/** Verfolgt die Position im Lied anhand der erkannten Akkordwechsel (nur vorwaerts, mit Nachlauf-Suche). */
export class Follower {
  pos = 0;
  private cand: string | null = null;
  private count = 0;
  private lost = 0;

  constructor(public tokens: Token[], private need = 3) {}

  get line(): number {
    return this.tokens[this.pos]?.line ?? 0;
  }

  setLine(line: number) {
    const j = this.tokens.findIndex((t) => t.line >= line);
    this.pos = j < 0 ? Math.max(0, this.tokens.length - 1) : j;
    this.cand = null;
    this.count = 0;
    this.lost = 0;
  }

  /** Ein Auswerteschritt mit dem erkannten Akkord (oder null). Gibt true zurueck, wenn die Position sich aenderte. */
  feed(det: string | null): boolean {
    if (!det || !this.tokens.length) {
      this.cand = null;
      this.count = 0;
      return false;
    }
    if (det === this.cand) this.count++;
    else {
      this.cand = det;
      this.count = 1;
    }
    if (this.count < this.need) return false;
    if (det === this.tokens[this.pos].chord) {
      this.lost = 0;
      return false;
    }
    // nach dem naechsten passenden Akkord suchen; je laenger nichts passt, desto weiter voraus
    const reach = this.lost >= 12 ? 14 : 4;
    for (let j = this.pos + 1; j <= Math.min(this.tokens.length - 1, this.pos + reach); j++) {
      if (this.tokens[j].chord === det) {
        this.pos = j;
        this.lost = 0;
        this.cand = null;
        this.count = 0;
        return true;
      }
    }
    this.lost++;
    return false;
  }
}
