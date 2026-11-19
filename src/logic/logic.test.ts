import test from 'node:test';
import assert from 'node:assert/strict';
import { transposeChord, parseChord, suggestCapo, detectGerman, shapeFor } from './chords';
import { parseSong, toSegments, allChords } from './song';
import { extractFromHtml } from './importer';
import { streak, suggestToday, dayKey, Song } from './practice';
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
