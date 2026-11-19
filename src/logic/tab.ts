import { shapeFor } from './chords';
import { Line, toSegments } from './song';

/** Saitennamen von oben (hohes e) nach unten (tiefes E) wie in einer Tabulatur. */
export const TAB_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];

/** Bundzahlen je Saite, oben (hohes e) zuerst; null = Akkord unbekannt. -1 = Saite nicht gespielt. */
export function chordFrets(chord: string, german = false): number[] | null {
  const s = shapeFor(chord, german);
  return s ? [...s].reverse() : null; // SHAPES laufen von tief (E) nach hoch (e)
}

const fretText = (f: number | undefined): string => (f === undefined ? '?' : f < 0 ? 'x' : String(f));

/** Ein Akkord als sechs Tabulaturzeilen, z. B. e|0 B|1 G|0 D|2 A|3 E|x (C-Dur). */
export function chordTab(chord: string, german = false): string[] {
  const fr = chordFrets(chord, german);
  return TAB_STRINGS.map((n, i) => `${n}|-${fretText(fr ? fr[i] : undefined)}-|`);
}

export type TabBlock = { chords: string; strings: string[]; text: string };

/**
 * Liedzeile als Tabulatur: Akkorde werden zu Bundzahlen-Saeulen, genau ueber der Silbe, auf der sie stehen.
 * `map` transponiert den Akkordnamen (wie in der Liedansicht).
 */
export function lineToTab(line: Line, map: (c: string) => string = (c) => c, german = false): TabBlock {
  const segs = toSegments(line, map);
  let chords = '';
  let text = '';
  const rows = TAB_STRINGS.map((n) => `${n}|`);
  for (const g of segs) {
    const fr = g.chord ? chordFrets(g.chord, german) : null;
    const digits = fr ? fr.map(fretText) : TAB_STRINGS.map(() => '-');
    const w = Math.max(g.text.length + 1, (g.chord ?? '').length + 1, Math.max(...digits.map((d) => d.length)) + 1);
    chords += (g.chord ?? '').padEnd(w);
    text += g.text.padEnd(w);
    digits.forEach((d, i) => { rows[i] += d.padEnd(w, '-'); });
  }
  return { chords, strings: rows.map((r) => r + '|'), text };
}
