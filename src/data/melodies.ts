// Melodien fuer das Notenblatt (Noten + Tabulatur). Nur geprueft belegte, gemeinfreie Vorlagen.
// Note = [MIDI-Tonhoehe, Laenge in Sechzehnteln, Silbe ('' = keine, '_' = Haltebogen), Akkord ab dieser Note (optional)]
export type MNote = [number, number, string, string?];
export type Melody = {
  /** Lied-IDs bzw. Titel-Kuerzel (slug), die diese Melodie bekommen */
  match: string[];
  title: string;
  source: string;
  /** Sechzehntel pro Takt (6/8 = 12) und Taktangabe zur Anzeige */
  barLen: number;
  meter: string;
  bars: MNote[][];
};

export const MELODIES: Melody[] = [
  {
    match: ['lib-stille-nacht', 'stille-nacht', 'stille-nacht-heilige-nacht', 'silent-night'],
    title: 'Stille Nacht, heilige Nacht',
    source: 'Franz Xaver Gruber (1818), Public Domain; Noten nach Mutopia Project (GruberFX/stille_nacht), nach G-Dur gesetzt',
    barLen: 12,
    meter: '6/8',
    bars: [
      [[62, 3, 'Stil-', 'G'], [64, 1, ''], [62, 2, 'le'], [59, 6, 'Nacht,']],
      [[62, 3, 'hei-'], [64, 1, 'li-'], [62, 2, 'ge'], [59, 6, 'Nacht!']],
      [[69, 4, 'Al-', 'D7'], [69, 2, 'les'], [66, 6, 'schläft,']],
      [[67, 4, 'ein-', 'G'], [67, 2, 'sam'], [62, 6, 'wacht,']],
      [[64, 4, 'nur', 'C'], [64, 2, 'das'], [67, 3, 'trau-'], [66, 1, 'te'], [64, 2, 'hoch-']],
      [[62, 3, 'hei-', 'G'], [64, 1, 'li-'], [62, 2, 'ge'], [59, 6, 'Paar.']],
      [[64, 4, 'Hol-', 'C'], [64, 2, 'der'], [67, 3, 'Kna-'], [66, 1, 'be'], [64, 2, 'im']],
      [[62, 3, 'loc-', 'G'], [64, 1, 'ki-'], [62, 2, 'gen'], [59, 6, 'Haar,']],
      [[69, 4, 'Schlaf', 'D7'], [69, 2, 'in'], [72, 3, 'himm-'], [69, 1, 'li-'], [66, 2, 'scher']],
      [[67, 6, 'Ruh', 'G'], [71, 6, '_']],
      [[67, 3, 'schlaf', 'D7'], [62, 1, ''], [59, 2, 'in'], [62, 3, 'himm-'], [60, 1, 'li-'], [57, 2, 'scher']],
      [[55, 12, 'Ruh!', 'G']],
    ],
  },
];

export const melodyFor = (idOrSlug: string): Melody | undefined => MELODIES.find((m) => m.match.includes(idOrSlug));
