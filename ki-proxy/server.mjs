// Kleiner Vermittler fuer die Liedersuche der Gitarren-App: haelt den Anthropic-Schluessel serverseitig.
// Start: node server.mjs   Umgebung: ANTHROPIC_API_KEY, APP_CODE, optional PORT, TAGESLIMIT (Standard 150)
import http from 'node:http';
import { createHash } from 'node:crypto';

const KEY = process.env.ANTHROPIC_API_KEY;
const CODE = process.env.APP_CODE;
const LIMIT = Number(process.env.TAGESLIMIT || 150);
const PORT = Number(process.env.PORT || 8080);
const MODEL = 'claude-haiku-5-5';
const SYSTEM = `Du hilfst einem Gitarren-Anfaenger, Lieder fuer eine Uebungs-App zu finden.
Der Nutzer beschreibt ein Lied oder einen Wunsch (Titel, Zeile aus dem Text, Stimmung, Anlass, Schwierigkeit), meist gesprochen und daher mit Hoerfehlern.
Antworte AUSSCHLIESSLICH mit einem JSON-Array (kein Text davor oder danach) mit hoechstens 3 Liedern, bestes zuerst:
[{"title":"...","artist":"Komponist/Interpret oder 'Traditionell'","bpm":80,"publicDomain":true,"body":"..."}]
"body" ist ChordPro: Akkorde in eckigen Klammern direkt vor der Silbe, z. B. "[G]Stille [D7]Nacht". Abschnitte als eigene Zeile ("Strophe 1", "Refrain").
Regeln:
- Nur einfache Anfaenger-Akkorde (offene Griffe: G, C, D, Em, Am, A, E, D7, G7, C7 ...). Notfalls passend transponieren.
- publicDomain=true NUR bei Volks- und Weihnachtsliedern bzw. Texten, deren Urheber seit ueber 70 Jahren tot sind. Dann den vollstaendigen Text mit Akkorden liefern.
- Bei urheberrechtlich geschuetzten Liedern publicDomain=false und KEINEN Liedtext wiedergeben: body enthaelt nur Abschnittsnamen und die Akkordfolge je Abschnitt, z. B. "Strophe\
[G] [D] [Em] [C]\
\
Refrain\
[C] [G] [D] [G]", ohne Textzeilen.
- Wenn du das Lied nicht sicher kennst, erfinde nichts: gib ein leeres Array [] zurueck.`;

let tag = '', n = 0;
const fails = new Map(); // ip -> {n, bis}

function cors(res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type,x-code');
  res.setHeader('access-control-allow-methods', 'POST,GET,OPTIONS');
}
const send = (res, code, obj) => { cors(res); res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

// ---- Over-the-air-Updates (expo-updates, Protokoll 1): Manifest aus dem Export auf GitHub Pages ----
const OTA = process.env.OTA_BASE || 'https://ehret1684.github.io/gitarren-app/ota/';
const shaCache = new Map();
async function sha(url) {
  if (shaCache.has(url)) return shaCache.get(url);
  const r = await fetch(url);
  if (!r.ok) throw new Error('Asset ' + r.status);
  const h = createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('base64url');
  shaCache.set(url, h);
  return h;
}
const MIME = { png: 'image/png', jpg: 'image/jpeg', ttf: 'font/ttf', otf: 'font/otf', json: 'application/json', webp: 'image/webp' };
const uuidOf = (s) => { const h = createHash('sha256').update(s).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`; };

async function manifest(req, res) {
  const rt = String(req.headers['expo-runtime-version'] || '');
  const platform = String(req.headers['expo-platform'] || 'android');
  if (!/^[\w.-]+$/.test(rt) || !['android', 'ios'].includes(platform)) return send(res, 400, { error: 'ungueltig' });
  const base = OTA + rt + '/';
  const mr = await fetch(base + 'metadata.json', { headers: { 'cache-control': 'no-cache' } });
  if (!mr.ok) { res.writeHead(404); return res.end(); }
  const text = await mr.text();
  const meta = JSON.parse(text).fileMetadata?.[platform];
  if (!meta) { res.writeHead(404); return res.end(); }
  const id = uuidOf(text);
  const boundary = 'b' + createHash('md5').update(id).digest('hex');
  const part = (name, obj) => `--${boundary}

content-disposition: form-data; name="${name}"

content-type: application/json; charset=utf-8



${JSON.stringify(obj)}

`;
  let body;
  if (req.headers['expo-current-update-id'] === id) {
    body = part('directive', { type: 'noUpdateAvailable' });
  } else {
    const norm = (p) => p.split('\\').join('/');
    const bundleUrl = base + norm(meta.bundle);
    const assets = await Promise.all((meta.assets || []).map(async (a) => {
      const path = norm(a.path);
      const url = base + path;
      return { hash: await sha(url), key: path.split('/').pop(), contentType: MIME[a.ext] || 'application/octet-stream', fileExtension: '.' + a.ext, url };
    }));
    const m = {
      id,
      createdAt: new Date(mr.headers.get('last-modified') || Date.now()).toISOString(),
      runtimeVersion: rt,
      launchAsset: { hash: await sha(bundleUrl), key: 'bundle', contentType: 'application/javascript', fileExtension: '.bundle', url: bundleUrl },
      assets, metadata: {}, extra: {},
    };
    body = part('manifest', m);
  }
  body += `--${boundary}--

`;
  cors(res);
  res.writeHead(200, {
    'expo-protocol-version': '1', 'expo-sfv-version': '0', 'cache-control': 'private, max-age=0',
    'content-type': `multipart/mixed; boundary=${boundary}`,
  });
  res.end(body);
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url?.startsWith('/manifest')) return manifest(req, res).catch(() => send(res, 502, { error: 'Manifest nicht erstellbar' }));
  if (req.method === 'GET') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/suche') return send(res, 404, { error: 'nicht gefunden' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
  const f = fails.get(ip);
  if (f && f.n >= 5 && Date.now() < f.bis) return send(res, 429, { error: 'zu viele Fehlversuche' });
  if (!CODE || req.headers['x-code'] !== CODE) {
    const x = f && Date.now() < f.bis ? f : { n: 0, bis: Date.now() + 15 * 60 * 1000 };
    x.n++; fails.set(ip, x);
    return send(res, 401, { error: 'Zugangscode falsch' });
  }
  const heute = new Date().toISOString().slice(0, 10);
  if (tag !== heute) { tag = heute; n = 0; }
  if (n >= LIMIT) return send(res, 429, { error: 'Tageslimit erreicht' });
  let body = '';
  for await (const c of req) { body += c; if (body.length > 2000) return send(res, 413, { error: 'zu lang' }); }
  let q;
  try { q = String(JSON.parse(body).query || '').trim().slice(0, 300); } catch { return send(res, 400, { error: 'ungueltig' }); }
  if (!q) return send(res, 400, { error: 'leer' });
  n++;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 3000, system: SYSTEM, messages: [{ role: 'user', content: q }] }),
    });
    const j = await r.json();
    if (!r.ok) return send(res, 502, { error: 'KI-Fehler ' + r.status });
    send(res, 200, { text: (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('') });
  } catch { send(res, 502, { error: 'KI nicht erreichbar' }); }
}).listen(PORT, () => console.log('ki-proxy auf', PORT));
