import { isChord } from './chords';

export type Line = { text: string; chords: { pos: number; chord: string }[]; section?: string };
export type Segment = { chord?: string; text: string };

const SECTION_RE = /^\s*[[(]?(strophe|refrain|chorus|verse|intro|outro|bridge|zwischenspiel|solo|pre-?chorus|\d+\.)[^\])]*[\])]?:?\s*$/i;

function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => isChord(t) || t === '|');
}

function parseChordPro(src: string): Line[] {
  const out: Line[] = [];
  for (const raw of src.split(/\r?\n/)) {
    const dir = /^\s*\{(\w+):?\s*(.*)\}\s*$/.exec(raw);
    if (dir) {
      const k = dir[1].toLowerCase();
      if (k === 'soc' || k === 'start_of_chorus') out.push({ text: '', chords: [], section: 'Refrain' });
      else if (k === 'sov' || k === 'start_of_verse') out.push({ text: '', chords: [], section: dir[2] || 'Strophe' });
      else if (k === 'comment' || k === 'c' || k === 'ci') out.push({ text: '', chords: [], section: dir[2] });
      continue; // title, artist, key ... liest guessTitle
    }
    let text = '';
    const chords: Line['chords'] = [];
    const re = /\[([^\]]+)\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      text += raw.slice(last, m.index);
      chords.push({ pos: text.length, chord: m[1] });
      last = m.index + m[0].length;
    }
    text += raw.slice(last);
    out.push({ text, chords });
  }
  return out;
}

function parseAbove(src: string): Line[] {
  const lines = src.split(/\r?\n/);
  const out: Line[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].replace(/\s+$/, '');
    if (l.trim() && SECTION_RE.test(l)) {
      out.push({ text: '', chords: [], section: l.trim().replace(/^[[(]|[\])]$/g, '').replace(/:$/, '') });
      continue;
    }
    if (l.trim() && isChordLine(l)) {
      const chords: Line['chords'] = [];
      const re = /[^\s|]+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(l))) chords.push({ pos: m.index, chord: m[0] });
      const next = lines[i + 1];
      if (next !== undefined && next.trim() && !isChordLine(next) && !SECTION_RE.test(next)) {
        out.push({ text: next.replace(/\s+$/, ''), chords });
        i++;
      } else {
        out.push({ text: '', chords });
      }
      continue;
    }
    out.push({ text: l, chords: [] });
  }
  return out;
}

const isEmpty = (l: Line) => !l.text.trim() && !l.chords.length && !l.section;

export function parseSong(src: string): Line[] {
  const cp = /\[[A-H][^\]]{0,8}\]/.test(src);
  const lines = cp ? parseChordPro(src) : parseAbove(src);
  const res: Line[] = [];
  for (const l of lines) {
    if (isEmpty(l) && (!res.length || isEmpty(res[res.length - 1]))) continue;
    res.push(l);
  }
  while (res.length && isEmpty(res[res.length - 1])) res.pop();
  return res;
}

export function toSegments(line: Line, map: (c: string) => string = (c) => c): Segment[] {
  const cs = [...line.chords].sort((a, b) => a.pos - b.pos);
  if (!cs.length) return [{ text: line.text }];
  const segs: Segment[] = [];
  if (cs[0].pos > 0) segs.push({ text: line.text.slice(0, cs[0].pos) });
  cs.forEach((c, i) => {
    const end = i + 1 < cs.length ? cs[i + 1].pos : line.text.length;
    const start = Math.min(c.pos, line.text.length);
    segs.push({ chord: map(c.chord), text: line.text.slice(start, Math.max(end, start)) });
  });
  return segs;
}

export function allChords(lines: Line[]): string[] {
  return lines.flatMap((l) => l.chords.map((c) => c.chord));
}

export function guessTitle(src: string): { title?: string; artist?: string } {
  const t = /\{(?:title|t):\s*(.+?)\}/i.exec(src);
  const a = /\{(?:artist|subtitle|st):\s*(.+?)\}/i.exec(src);
  return { title: t?.[1], artist: a?.[1] };
}
