import test from 'node:test';
import assert from 'node:assert/strict';
import { transposeChord, parseChord, suggestCapo, detectGerman, shapeFor } from './chords';
import { parseSong, toSegments, allChords } from './song';
import { extractFromHtml } from './importer';
import { streak, suggestToday, dayKey, Song } from './practice';
import { detectPitch, nearestString, PitchSmoother } from './pitch';
import { makeWav, toBase64 } from './wav';

const st = { flats: false, german: false };

test('Akkorde erkennen, Woerter nicht', () => {
  assert.ok(parseChord('Am7'));
  assert.ok(parseChord('D/F#'));
  assert.equal(parseChord('Dann'), null);
  assert.equal(parseChord('Amen'), null);
});

test('transponieren', () => {
  assert.equal(transposeChord('C', 2, st), 'D');
  assert.equal(transposeChord('Am', -3, st), 'F#m');
  assert.equal(transposeChord('G/B', 2, st), 'A/C#');
  assert.equal(transposeChord('E', 3, { flats: true, german: false }), 'G');
  assert.equal(transposeChord('Dm', 1, { flats: true, german: false }), 'Ebm');
});

test('deutsche Schreibweise H/B', () => {
  const g = { flats: true, german: true };
  assert.ok(detectGerman(['Am', 'H7']));
  assert.equal(transposeChord('Hm', 1, g), 'Cm');
  assert.equal(transposeChord('A', 1, g), 'B');
  assert.equal(shapeFor('Hm', true)?.join(), '-1,2,4,4,3,2');
});

test('ChordPro parsen', () => {
  const l = parseSong('[C]Hallo [G]Welt\n');
  assert.equal(l[0].text, 'Hallo Welt');
  assert.deepEqual(l[0].chords, [
    { pos: 0, chord: 'C' },
    { pos: 6, chord: 'G' },
  ]);
  assert.deepEqual(toSegments(l[0]).map((s) => s.text), ['Hallo ', 'Welt']);
});

test('Akkorde ueber Text', () => {
  const l = parseSong('Refrain:\nC      G\nHallo  Welt\n\nAm\nNoch ein Text');
  assert.equal(l[0].section, 'Refrain');
  assert.equal(l[1].text, 'Hallo  Welt');
  assert.deepEqual(l[1].chords.map((c) => c.pos), [0, 7]);
  assert.deepEqual(allChords(l), ['C', 'G', 'Am']);
});

test('Kapo', () => {
  const r = suggestCapo(['F', 'Bb', 'C', 'Dm']);
  assert.ok(r.capo > 0 && r.easy >= 3);
});

test('HTML-Import', () => {
  const r = extractFromHtml('<html><title>Lied &amp; Co</title><pre>C   G\nHi &lt;du&gt;</pre></html>');
  assert.equal(r.title, 'Lied & Co');
  assert.equal(r.text, 'C   G\nHi <du>');
});

test('Streak', () => {
  const t = new Date(2026, 10, 19);
  const k = (d: number) => dayKey(new Date(2026, 10, d));
  assert.equal(streak({ [k(18)]: 10, [k(17)]: 5 }, t), 2);
  assert.equal(streak({ [k(19)]: 1, [k(17)]: 5 }, t), 1);
  assert.equal(streak({}, t), 0);
});

test('Tagesvorschlag', () => {
  const mk = (id: string, status: Song['status'], lp?: string): Song => ({ id, title: id, artist: '', body: '', status, bpm: 80, lastPracticed: lp });
  const r = suggestToday([mk('a', 'kann'), mk('b', 'ueben', '2026-11-10'), mk('c', 'ueben', '2026-11-01')], 2);
  assert.deepEqual(r.map((s) => s.id), ['c', 'b']);
});

test('WAV', () => {
  const w = makeWav(440, 50);
  assert.equal(String.fromCharCode(...w.slice(0, 4)), 'RIFF');
  assert.ok(toBase64(w).length > 100);
});

import { CHRISTMAS } from '../data/christmas';
import { isChord } from './chords';

test('Weihnachtsbibliothek: eindeutige IDs, alle Akkorde gueltig und mit Griffbild', () => {
  assert.equal(new Set(CHRISTMAS.map((x) => x.id)).size, CHRISTMAS.length);
  for (const x of CHRISTMAS) {
    const ch = allChords(parseSong(x.body));
    assert.ok(ch.length >= 4, x.title);
    for (const c of ch) {
      assert.ok(isChord(c), `${x.title}: ${c}`);
      assert.ok(shapeFor(c), `${x.title}: kein Griffbild fuer ${c}`);
    }
  }
});

import { chromaFromSpectrum, detect, Follower } from './listen';

// Kuenstliches Gitarrenspektrum: Noten mit Obertoenen, Bin = Frequenz / (sr/fft)
function spectrum(freqs: number[], sr = 44100, fft = 8192): Float32Array {
  const m = new Float32Array(fft / 2);
  const bw = sr / fft;
  for (const f of freqs) for (let h = 1; h <= 4; h++) {
    const b = Math.round((f * h) / bw);
    if (b < m.length) { m[b] += 1 / h; m[b - 1] += 0.4 / h; m[b + 1] += 0.4 / h; }
  }
  return m;
}
const hz = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const GUITAR: Record<string, number[]> = {
  G: [43, 47, 50, 55, 59, 67], C: [48, 52, 55, 60, 64], D: [50, 57, 62, 66],
  Em: [40, 47, 52, 55, 59, 64], Am: [45, 52, 57, 60, 64],
};

test('Akkorderkennung aus Spektrum (nur Akkorde des Liedes)', () => {
  const song = ['G', 'C', 'D', 'Em', 'Am'];
  for (const [name, notes] of Object.entries(GUITAR)) {
    const ch = chromaFromSpectrum(spectrum(notes.map(hz)), 44100, 8192);
    assert.equal(detect(ch, song), name, name);
  }
});

test('Stille und Rauschen ergeben keinen Akkord', () => {
  const song = ['G', 'C', 'D'];
  assert.equal(detect(chromaFromSpectrum(new Float32Array(4096), 44100, 8192), song), null);
  const flat = new Array(12).fill(1 / Math.sqrt(12));
  assert.equal(detect(flat, song), null);
});

test('Follower folgt Akkordwechseln und ueberspringt Wiederholungen', () => {
  const f = new Follower([
    { chord: 'G', line: 0 }, { chord: 'G', line: 0 }, { chord: 'D', line: 1 },
    { chord: 'Em', line: 1 }, { chord: 'C', line: 2 }, { chord: 'G', line: 3 },
  ]);
  const feed = (c: string, n = 3) => { let m = false; for (let i = 0; i < n; i++) m = f.feed(c) || m; return m; };
  assert.equal(feed('G'), false);
  assert.equal(f.line, 0);
  assert.equal(feed('D'), true);
  assert.equal(f.pos, 2);
  assert.equal(feed('Em', 2), false); // zu kurz = Stoerung
  assert.equal(feed('Em'), true);
  assert.equal(feed('C'), true);
  assert.equal(f.line, 2);
  assert.equal(feed('Am'), false); // gehoert nicht zum Lied
  assert.equal(f.line, 2);
});

test('Follower: verirrt sich nicht rueckwaerts, setLine setzt neu', () => {
  const f = new Follower([{ chord: 'G', line: 0 }, { chord: 'C', line: 1 }, { chord: 'D', line: 2 }]);
  f.setLine(2);
  assert.equal(f.pos, 2);
  for (let i = 0; i < 5; i++) f.feed('G');
  assert.equal(f.pos, 2);
});

function sine(f: number, sr = 44100, n = 4096) {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = 0.3 * Math.sin((2 * Math.PI * f * i) / sr) + 0.15 * Math.sin((4 * Math.PI * f * i) / sr) + 0.1 * Math.sin((6 * Math.PI * f * i) / sr);
  return b;
}

test('Stimmgeraet: erkennt alle sechs Saiten auf 2 Cent genau', () => {
  for (const f of [82.41, 110, 146.83, 196, 246.94, 329.63]) {
    const got = detectPitch(sine(f), 44100)!;
    assert.ok(got, 'kein Ton bei ' + f);
    assert.ok(Math.abs(1200 * Math.log2(got / f)) < 2, `${f} -> ${got}`);
  }
});

test('Stimmgeraet: Stille und Rauschen ergeben keinen Ton', () => {
  assert.equal(detectPitch(new Float32Array(4096), 44100), null);
  const n = new Float32Array(4096);
  let x = 1;
  for (let i = 0; i < n.length; i++) { x = (x * 16807) % 2147483647; n[i] = (x / 2147483647 - 0.5) * 0.4; }
  assert.equal(detectPitch(n, 44100), null);
});

test('Stimmgeraet: Saite und Cent-Abweichung', () => {
  const r = nearestString(110 * Math.pow(2, 20 / 1200));
  assert.equal(r.string.name, 'A');
  assert.ok(Math.abs(r.cents - 20) < 0.01);
  const h = nearestString(110 * Math.pow(2, -1 / 12), -1);
  assert.equal(h.string.name, 'A');
  assert.ok(Math.abs(h.cents) < 0.01);
});

test('Stimmgeraet: Median glaettet Ausreisser', () => {
  const sm = new PitchSmoother(5);
  let out: number | null = null;
  for (const f of [110, 110.2, 220, 110.1, 109.9]) out = sm.push(f);
  assert.ok(out! > 109 && out! < 111);
});
