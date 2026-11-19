const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
}

/** Titel und Liedtext aus einer HTML-Seite: bevorzugt <pre>, sonst der Seitentext. */
export function extractFromHtml(html: string): { title?: string; text: string } {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const pres = [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)].map((m) => stripTags(m[1]));
  let text = pres.sort((a, b) => b.length - a.length)[0];
  if (!text) {
    const body = html
      .replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/gi, '')
      .replace(/<\/(p|div|li|h\d|tr)>/gi, '\n');
    text = stripTags(body).replace(/\n{3,}/g, '\n\n');
  }
  return { title: title ? stripTags(title).trim().replace(/\s+/g, ' ') : undefined, text: text.trim() };
}

export function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
