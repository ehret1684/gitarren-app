/** Kurzer Sinuston als WAV (16 Bit, mono). decay = true: abklingender Klick, sonst Dauerton mit Rampen. */
export function makeWav(freq: number, ms: number, decay = true, rate = 22050): Uint8Array {
  const n = Math.floor((rate * ms) / 1000);
  const buf = new Uint8Array(44 + n * 2);
  const v = new DataView(buf.buffer);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) buf[o + i] = s.charCodeAt(i);
  };
  w(0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const env = decay ? Math.pow(1 - i / n, 2) : Math.min(1, i / 400, (n - i) / 400);
    v.setInt16(44 + i * 2, Math.round(Math.sin((2 * Math.PI * freq * i) / rate) * env * 0.8 * 32767), true);
  }
  return buf;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function toBase64(b: Uint8Array): string {
  let o = '';
  for (let i = 0; i < b.length; i += 3) {
    const a = b[i];
    const c = b[i + 1];
    const d = b[i + 2];
    o += B64[a >> 2] + B64[((a & 3) << 4) | ((c ?? 0) >> 4)];
    o += c === undefined ? '=' : B64[((c & 15) << 2) | ((d ?? 0) >> 6)];
    o += d === undefined ? '=' : B64[d & 63];
  }
  return o;
}

export const wavDataUri = (b: Uint8Array) => 'data:audio/wav;base64,' + toBase64(b);

// Standardstimmung, tief nach hoch
export const STRINGS = [
  { name: 'E', label: '6. Saite · tiefes E', freq: 82.41 },
  { name: 'A', label: '5. Saite · A', freq: 110.0 },
  { name: 'D', label: '4. Saite · D', freq: 146.83 },
  { name: 'G', label: '3. Saite · G', freq: 196.0 },
  { name: 'H', label: '2. Saite · H', freq: 246.94 },
  { name: 'e', label: '1. Saite · hohes e', freq: 329.63 },
];
