import { MNote } from '../data/melodies';

const LETTER_IDX = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]; // Halbton -> Stufe C D E F G A B (Kreuz-Schreibweise)
const SHARP = [false, true, false, true, false, false, true, false, true, false, true, false];

/** Diagonale Notenstufe (C4 = 28, E4 = 30 = unterste Linie im Violinschluessel) und ob ein Kreuz davor steht. */
export function staffPos(midi: number): { step: number; sharp: boolean } {
  const pc = ((midi % 12) + 12) % 12;
  return { step: 7 * (Math.floor(midi / 12) - 1) + LETTER_IDX[pc], sharp: SHARP[pc] };
}

export const OPEN_STRINGS = [64, 59, 55, 50, 45, 40]; // e B G D A E, oben -> unten wie in der Tabulatur

/** Beste Lage (Saite 0 = hohes e, Bund) fuer eine Tonhoehe: kleinster Bund bis 12, bei Gleichstand die hoehere Saite. */
export function fretFor(midi: number): { string: number; fret: number } | null {
  let best: { string: number; fret: number } | null = null;
  OPEN_STRINGS.forEach((open, i) => {
    const fret = midi - open;
    if (fret >= 0 && fret <= 12 && (!best || fret < best.fret)) best = { string: i, fret };
  });
  return best;
}

export type NoteShape = { head: 'filled' | 'hollow'; stem: boolean; flags: number; dots: number };

/** Notenform aus der Laenge in Sechzehnteln (1,2,3,4,6,8,12,16). */
export function noteShape(len: number): NoteShape {
  const base = len === 3 ? 2 : len === 6 ? 4 : len === 12 ? 8 : len;
  const dots = len === 3 || len === 6 || len === 12 ? 1 : 0;
  return { head: base >= 8 ? 'hollow' : 'filled', stem: base < 16, flags: base === 2 ? 1 : base === 1 ? 2 : 0, dots };
}

export const transposeBars = (bars: MNote[][], steps: number): MNote[][] =>
  bars.map((b) => b.map(([m, l, s, c]) => [m + steps, l, s, c] as MNote));

/** Breite der Spalte einer Note (Platz fuer Silbe und Notenkopf); fs = Schriftgroesse der Silben. */
export const cellWidth = (n: MNote, fs = 12): number => Math.max(26, 14 + n[1] * 3, Math.ceil(n[2].length * fs * 0.62) + 6);

export const barWidth = (bar: MNote[], fs = 12): number => bar.reduce((a, n) => a + cellWidth(n, fs), 0) + 8;

/** Verteilt Takte auf Zeilen, die in `width` passen (mindestens ein Takt je Zeile). */
export function layoutSystems(bars: MNote[][], width: number, fs = 12): number[][] {
  const out: number[][] = [];
  let cur: number[] = [];
  let used = 0;
  bars.forEach((b, i) => {
    const w = barWidth(b, fs);
    if (cur.length && used + w > width) {
      out.push(cur);
      cur = [];
      used = 0;
    }
    cur.push(i);
    used += w;
  });
  if (cur.length) out.push(cur);
  return out;
}
