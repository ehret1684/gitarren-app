export type Status = 'neu' | 'ueben' | 'kann';
export type Log = Record<string, number>; // YYYY-MM-DD -> Minuten

export type Song = {
  id: string;
  title: string;
  artist: string;
  body: string;
  status: Status;
  bpm: number;
  lastPracticed?: string;
  source?: string;
};

export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Tage in Folge mit Uebung; ein heute noch leerer Tag bricht die Serie nicht ab. */
export function streak(log: Log, today: Date): number {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!(log[dayKey(d)] > 0)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (log[dayKey(d)] > 0) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function weekMinutes(log: Log, today: Date): number {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += log[dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i))] ?? 0;
  }
  return sum;
}

/** Vorschlag fuer heute: erst "ueben", dann "neu", je am laengsten nicht gespielt zuerst. */
export function suggestToday(songs: Song[], max = 3): Song[] {
  const rank = (s: Song) => (s.status === 'ueben' ? 0 : s.status === 'neu' ? 1 : 2);
  return [...songs]
    .sort((a, b) => rank(a) - rank(b) || (a.lastPracticed ?? '').localeCompare(b.lastPracticed ?? ''))
    .slice(0, max);
}
