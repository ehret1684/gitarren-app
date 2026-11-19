// Baut die Web-App (PWA) nach dist/ : Export + Manifest + Service Worker + Icons.
import { execSync } from 'node:child_process';
import { cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASE = '/gitarren-app';
execSync('npx expo export --platform web --output-dir dist', { stdio: 'inherit' });

cpSync('assets/icon.png', 'dist/icon-512.png');
writeFileSync('dist/manifest.webmanifest', JSON.stringify({
  name: 'Gitarre ueben', short_name: 'Gitarre', lang: 'de', display: 'standalone',
  start_url: BASE + '/', scope: BASE + '/', background_color: '#14110f', theme_color: '#14110f',
  icons: [{ src: BASE + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }],
}, null, 2));
writeFileSync('dist/sw.js', `const C='gitarre-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('${BASE}/index.html'))));
});`);
const BUILD_ID = Date.now().toString(36);
writeFileSync('dist/version.json', JSON.stringify({ v: BUILD_ID }));
let html = readFileSync('dist/index.html', 'utf8');
const head = `<link rel="manifest" href="${BASE}/manifest.webmanifest"><meta name="theme-color" content="#14110f"><link rel="apple-touch-icon" href="${BASE}/icon-512.png">`;
const sw = `<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('${BASE}/sw.js',{scope:'${BASE}/'}).catch(function(){})</script>`;
html = html.replace('</head>', `<script>window.__BUILD__=${JSON.stringify(BUILD_ID)}</script>` + head + '</head>').replace('</body>', sw + '</body>');
writeFileSync('dist/index.html', html);
if (!existsSync('dist/.nojekyll')) writeFileSync('dist/.nojekyll', '');
console.log('dist/ fertig');
