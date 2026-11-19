import { Song } from './practice';
import { CHRISTMAS } from '../data/christmas';

export const AI_MODEL = 'claude-haiku-5-5';

export const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const norm = (s: string): string => slug(s).replace(/-/g, ' ');

/** Suche im eingebauten Bestand (ohne KI): alle Suchwoerter muessen in Titel/Autor/Text vorkommen, Titeltreffer zuerst. */
export function localSearch(query: string): Song[] {
  const words = norm(query).split(' ').filter((w) => w.length > 1);
  if (!words.length) return [];
  const scored = CHRISTMAS.map((l) => {
    const title = norm(l.title + ' ' + l.artist);
    const text = norm(l.body.replace(/\[[^\]]*\]/g, ''));
    let score = 0;
    for (const w of words) {
      if (title.includes(w)) score += 3;
      else if (text.includes(w)) score += 1;
      else return { l, score: 0 };
    }
    return { l, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ l }) => ({ id: l.id, title: l.title, artist: l.artist, body: l.body, status: 'neu' as const, bpm: l.bpm, source: 'bibliothek' }));
}

export const SYSTEM_PROMPT = `Du hilfst einem Gitarren-Anfaenger, Lieder fuer eine Uebungs-App zu finden.
Der Nutzer beschreibt ein Lied oder einen Wunsch (Titel, Zeile aus dem Text, Stimmung, Anlass, Schwierigkeit), meist gesprochen und daher mit Hoerfehlern.
Antworte AUSSCHLIESSLICH mit einem JSON-Array (kein Text davor oder danach) mit hoechstens 3 Liedern, bestes zuerst:
[{"title":"...","artist":"Komponist/Interpret oder 'Traditionell'","bpm":80,"publicDomain":true,"body":"..."}]
"body" ist ChordPro: Akkorde in eckigen Klammern direkt vor der Silbe, z. B. "[G]Stille [D7]Nacht". Abschnitte als eigene Zeile ("Strophe 1", "Refrain").
Regeln:
- Nur einfache Anfaenger-Akkorde (offene Griffe: G, C, D, Em, Am, A, E, D7, G7, C7 ...). Notfalls passend transponieren.
- publicDomain=true NUR bei Volks- und Weihnachtsliedern bzw. Texten, deren Urheber seit ueber 70 Jahren tot sind. Dann den vollstaendigen Text mit Akkorden liefern.
- Bei urheberrechtlich geschuetzten Liedern publicDomain=false und KEINEN Liedtext wiedergeben: body enthaelt nur Abschnittsnamen und die Akkordfolge je Abschnitt, z. B. "Strophe\\n[G] [D] [Em] [C]\\n\\nRefrain\\n[C] [G] [D] [G]", ohne Textzeilen.
- Wenn du das Lied nicht sicher kennst, erfinde nichts: gib ein leeres Array [] zurueck.`;

export type AiSong = { title: string; artist: string; bpm: number; publicDomain: boolean; body: string };

/** Liest die Modellantwort tolerant (Codezaun, Text drumherum) und verwirft Unbrauchbares. */
export function parseAiSongs(text: string): AiSong[] {
  const m = /\[[\s\S]*\]/.exec(text);
  if (!m) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(m[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const out: AiSong[] = [];
  for (const r of raw.slice(0, 3)) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title.trim() : '';
    const body = typeof o.body === 'string' ? o.body.trim() : '';
    if (!title || !body || !/\[[A-H][^\]]*\]/.test(body)) continue;
    const bpm = typeof o.bpm === 'number' && o.bpm >= 30 && o.bpm <= 220 ? Math.round(o.bpm) : 80;
    out.push({
      title,
      artist: typeof o.artist === 'string' && o.artist.trim() ? o.artist.trim() : 'Unbekannt',
      bpm,
      publicDomain: o.publicDomain === true,
      body,
    });
  }
  return out;
}

export function aiToSong(a: AiSong): Song {
  const note = a.publicDomain ? '' : '(Geschuetztes Lied: nur Akkordfolge, Text selbst ergaenzen)\n\n';
  return {
    id: 'ki-' + slug(a.title + ' ' + a.artist),
    title: a.title,
    artist: a.artist,
    body: note + a.body,
    status: 'neu',
    bpm: a.bpm,
    source: 'ki',
  };
}

export class AiError extends Error {}

/** Adresse des eigenen Vermittlers (haelt den Anthropic-Schluessel serverseitig); leer = nur eigener Schluessel moeglich. */
export const PROXY_URL: string = 'https://gitarren-ki-production.up.railway.app';

const parseText = (text: string): Song[] => parseAiSongs(text).map(aiToSong);

/**
 * Sucht per KI. `secret` ist entweder ein eigener Anthropic-Schluessel ("sk-...", direkter Aufruf aus dem Browser/der App)
 * oder der Zugangscode fuer den Vermittler (PROXY_URL); der Schluessel selbst steht dann nur auf dem Server.
 */
export async function aiSearch(query: string, secret: string, fetchFn: typeof fetch = fetch): Promise<Song[]> {
  const sec = secret.trim();
  if (!sec.startsWith('sk-')) {
    if (!PROXY_URL) throw new AiError('Vermittler ist noch nicht eingerichtet - trage einen eigenen API-Schluessel ein.');
    const r = await fetchFn(PROXY_URL.replace(/\/$/, '') + '/suche', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-code': sec },
      body: JSON.stringify({ query }),
    });
    if (r.status === 401) throw new AiError('Zugangscode wurde abgelehnt.');
    if (r.status === 429) throw new AiError('Limit erreicht - spaeter erneut versuchen.');
    if (!r.ok) throw new AiError('KI-Anfrage fehlgeschlagen (' + r.status + ').');
    const j: any = await r.json();
    return parseText(String(j.text ?? ''));
  }
  return directSearch(query, sec, fetchFn);
}

/** Fragt die Claude-API direkt aus dem Browser ab; der Schluessel bleibt auf dem Geraet. */
async function directSearch(query: string, apiKey: string, fetchFn: typeof fetch): Promise<Song[]> {
  const res = await fetchFn('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    }),
  });
  if (res.status === 401) throw new AiError('API-Schluessel wurde abgelehnt.');
  if (res.status === 429) throw new AiError('Zu viele Anfragen - kurz warten.');
  if (!res.ok) throw new AiError('KI-Anfrage fehlgeschlagen (' + res.status + ').');
  const j: any = await res.json();
  const text = (j.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
  return parseText(text);
}
