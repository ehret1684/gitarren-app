export const RELEASES_API = 'https://api.github.com/repos/ehret1684/gitarren-app/releases/latest';

export type UpdateInfo = { label: string; url?: string; ota?: boolean };

/** Zahl hinter "build-" im Release-Tag, sonst null. */
export function buildNumber(tag: string): number | null {
  const m = /^build-(\d+)$/.exec(tag);
  return m ? Number(m[1]) : null;
}

/** Gibt eine Update-Beschreibung zurueck, wenn es eine neuere Fassung gibt, sonst null. Fehler (offline) = null. */
export async function checkUpdate(fetchFn: typeof fetch, current: string, web: boolean): Promise<UpdateInfo | null> {
  if (!current) return null; // Entwicklungsstand: keine Pruefung
  try {
    if (web) {
      const base = (globalThis as any).document?.baseURI ?? '';
      const r = await fetchFn(new URL('version.json?t=' + Date.now(), base).toString(), { cache: 'no-store' });
      if (!r.ok) return null;
      const j: any = await r.json();
      return j?.v && String(j.v) !== current ? { label: 'Neue Version verfuegbar' } : null;
    }
    const r = await fetchFn(RELEASES_API, { headers: { accept: 'application/vnd.github+json' } });
    if (!r.ok) return null;
    const j: any = await r.json();
    const n = buildNumber(String(j?.tag_name ?? ''));
    const apk = (j?.assets ?? []).find((a: any) => String(a.name).endsWith('.apk'));
    if (n == null || n <= Number(current) || !apk) return null;
    return { label: 'Neue Version (Build ' + n + ') verfuegbar', url: apk.browser_download_url };
  } catch {
    return null;
  }
}
