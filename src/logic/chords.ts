const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const BASE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };

export type ChordParts = { root: string; suffix: string; bass?: string };

const CHORD_RE = /^([A-H][#b]?)([^/\s]*)(?:\/([A-H][#b]?))?$/;
// Suffix muss wie ein Akkordzusatz aussehen, sonst wird "Dann" als D+ann erkannt
const SUFFIX_RE = /^(m|min|maj|M|dim|aug|sus|add|\+|-|°|\d)*[0-9#b()]*$/;

export function parseChord(s: string): ChordParts | null {
  const m = CHORD_RE.exec(s.trim());
  if (!m) return null;
  const suffix = m[2];
  if (suffix && !SUFFIX_RE.test(suffix)) return null;
  return { root: m[1], suffix, bass: m[3] };
}

export function isChord(s: string): boolean {
  return parseChord(s) !== null;
}

function noteIndex(note: string): number {
  let i = BASE[note[0]];
  if (i === undefined) return -1;
  if (note[1] === '#') i += 1;
  else if (note[1] === 'b') i -= 1;
  return (i + 12) % 12;
}

export type Style = { flats: boolean; german: boolean };

function noteName(i: number, st: Style): string {
  const n = (st.flats ? FLAT : SHARP)[((i % 12) + 12) % 12];
  if (st.german) {
    if (n === 'B') return 'H';
    if (n === 'Bb') return 'B';
  }
  return n;
}

/** Deutsche Schreibweise (B = Bb, H = B), erkannt am ersten H. */
export function detectGerman(chords: string[]): boolean {
  return chords.some((c) => /^H/.test(c.trim()) || /\/H/.test(c));
}

function rootIndex(root: string, german: boolean): number {
  if (german && root === 'B') return 10;
  return noteIndex(root);
}

export function transposeChord(chord: string, steps: number, st: Style): string {
  const p = parseChord(chord);
  if (!p) return chord;
  const r = rootIndex(p.root, st.german);
  if (r < 0) return chord;
  let out = noteName(r + steps, st) + p.suffix;
  if (p.bass) {
    const b = rootIndex(p.bass, st.german);
    if (b >= 0) out += '/' + noteName(b + steps, st);
  }
  return out;
}

/** Normalform fuer die Griffbild-Suche, z. B. "Hm" -> "Bm", deutsches "B" -> "Bb". */
export function canonical(chord: string, german: boolean): string {
  const p = parseChord(chord);
  if (!p) return chord;
  const r = rootIndex(p.root, german);
  const flat = FLAT[r];
  return (flat === 'Bb' || flat === 'Eb' || flat === 'Ab' ? flat : SHARP[r]) + p.suffix;
}

// Saiten E A D G B e; -1 = nicht spielen, 0 = leer
export const SHAPES: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  D: [-1, -1, 0, 2, 3, 2],
  E: [0, 2, 2, 1, 0, 0],
  G: [3, 2, 0, 0, 0, 3],
  A: [-1, 0, 2, 2, 2, 0],
  F: [1, 3, 3, 2, 1, 1],
  Am: [-1, 0, 2, 2, 1, 0],
  Dm: [-1, -1, 0, 2, 3, 1],
  Em: [0, 2, 2, 0, 0, 0],
  Bm: [-1, 2, 4, 4, 3, 2],
  A7: [-1, 0, 2, 0, 2, 0],
  B7: [-1, 2, 1, 2, 0, 2],
  C7: [-1, 3, 2, 3, 1, 0],
  D7: [-1, -1, 0, 2, 1, 2],
  E7: [0, 2, 0, 1, 0, 0],
  G7: [3, 2, 0, 0, 0, 1],
  Em7: [0, 2, 0, 0, 0, 0],
  Am7: [-1, 0, 2, 0, 1, 0],
  Dm7: [-1, -1, 0, 2, 1, 1],
  Cmaj7: [-1, 3, 2, 0, 0, 0],
  Fmaj7: [-1, -1, 3, 2, 1, 0],
  Dsus4: [-1, -1, 0, 2, 3, 3],
  Asus4: [-1, 0, 2, 2, 3, 0],
  Esus4: [0, 2, 2, 2, 0, 0],
  Dsus2: [-1, -1, 0, 2, 3, 0],
  Asus2: [-1, 0, 2, 2, 0, 0],
  Bb: [-1, 1, 3, 3, 3, 1],
};

const BARRE = ['F', 'Bm', 'Bb', 'Fmaj7'];

export function shapeFor(chord: string, german = false): number[] | null {
  const p = parseChord(chord);
  if (!p) return null;
  return SHAPES[canonical(p.root + p.suffix, german)] ?? null;
}

export function isEasy(chord: string, german = false): boolean {
  const s = shapeFor(chord, german);
  if (!s) return false;
  const p = parseChord(chord)!;
  return !BARRE.includes(canonical(p.root + p.suffix, german)) && Math.max(...s) <= 3;
}

/** Kapodaster-Bund (0-7), bei dem die meisten Akkorde ohne Barre spielbar sind. */
export function suggestCapo(chords: string[], german = false): { capo: number; easy: number; total: number } {
  const uniq = [...new Set(chords)].filter(isChord);
  const st: Style = { flats: false, german };
  let best = { capo: 0, easy: -1, total: uniq.length };
  for (let capo = 0; capo <= 7; capo++) {
    const easy = uniq.filter((c) => isEasy(transposeChord(c, -capo, st), german)).length;
    if (easy > best.easy) best = { capo, easy, total: uniq.length };
  }
  return best;
}
