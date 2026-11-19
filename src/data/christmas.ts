// Mitgelieferte Weihnachtslieder. Alle Texte sind gemeinfrei (Autoren >70 Jahre tot bzw. traditionell);
// die Akkordfolgen sind einfache eigene Anfaengerfassungen (offene Griffe, ChordPro mit [Akkord] im Text).
export type LibSong = { id: string; title: string; artist: string; bpm: number; body: string };

export const CHRISTMAS: LibSong[] = [
  {
    id: 'lib-stille-nacht',
    title: 'Stille Nacht, heilige Nacht',
    artist: 'Joseph Mohr / Franz Xaver Gruber (1818)',
    bpm: 60,
    body: `Strophe 1
[G]Stille Nacht, heilige Nacht,
[D7]Alles schläft, einsam [G]wacht
Nur das [C]traute, hochheilige [G]Paar.
[G]Holder Knabe im [C]lockigen [G]Haar,
[D7]Schlaf in himmlischer [G]Ruh,
[D7]Schlaf in himmlischer [G]Ruh.

Strophe 2
[G]Stille Nacht, heilige Nacht,
[D7]Hirten erst kundgemacht,
Durch der [C]Engel Halleluja
[G]tönt es laut von fern und nah:
[D7]Christ, der Retter, ist [G]da,
[D7]Christ, der Retter, ist [G]da.`,
  },
  {
    id: 'lib-o-tannenbaum',
    title: 'O Tannenbaum',
    artist: 'Traditionell (Text: Ernst Anschütz, 1824)',
    bpm: 90,
    body: `[G]O Tannenbaum, o [D7]Tannenbaum,
wie [G]treu sind deine [D7]Blätter!
[G]Du grünst nicht nur zur [C]Sommerzeit,
nein, [G]auch im Winter, [D7]wenn es [G]schneit.
O [G]Tannenbaum, o [D7]Tannenbaum,
wie [G]treu sind deine [D7]Blät[G]ter!`,
  },
  {
    id: 'lib-o-du-froehliche',
    title: 'O du fröhliche',
    artist: 'Johannes Daniel Falk / Heinrich Holzschuher (1816)',
    bpm: 70,
    body: `[G]O du fröhliche, o du [D7]selige,
[G]gnadenbringende [C]Weihnachts[G]zeit!
Welt ging verloren, Christ ist geboren:
[D7]Freue, freue dich, o [G]Christenheit!`,
  },
  {
    id: 'lib-alle-jahre-wieder',
    title: 'Alle Jahre wieder',
    artist: 'Wilhelm Hey / Friedrich Silcher (1837)',
    bpm: 80,
    body: `Strophe 1
[G]Alle Jahre wieder kommt das [D7]Christuskind
auf die [G]Erde nieder, wo wir [D7]Menschen [G]sind.

Strophe 2
Kehrt mit seinem [G]Segen ein in [C]jedes [G]Haus,
geht auch mit uns [D7]allen sanft von [G]Haus zu Haus.`,
  },
  {
    id: 'lib-ihr-kinderlein',
    title: 'Ihr Kinderlein, kommet',
    artist: 'Christoph von Schmid / J. A. P. Schulz (um 1800)',
    bpm: 90,
    body: `[G]Ihr Kinderlein, [D7]kommet, o [G]kommet doch all!
Zur [G]Krippe her [D7]kommet in Bethlehems [G]Stall
und [C]seht, was in [G]dieser hochheiligen [D7]Nacht
der [G]Vater im [D7]Himmel für [G]Freude uns macht.`,
  },
  {
    id: 'lib-morgen-kinder',
    title: "Morgen, Kinder, wird's was geben",
    artist: 'Karl Friedrich Splittegarb (1778)',
    bpm: 100,
    body: `[C]Morgen, Kinder, wird's was [G7]geben,
[C]morgen werden wir uns [G7]freun!
[C]Welch ein Jubel, welch ein [F]Leben
wird in [C]unserm Hause [G7]sein!
[C]Einmal werden wir noch [F]wach,
[G7]heißa, dann ist [C]Weihnachtstag.`,
  },
  {
    id: 'lib-morgen-kommt',
    title: 'Morgen kommt der Weihnachtsmann',
    artist: 'Hoffmann von Fallersleben (1835)',
    bpm: 110,
    body: `[C]Morgen kommt der [G7]Weihnachtsmann,
[C]kommt mit seinen [G7]Gaben.
[C]Trommel, Pfeifen und Ge[G7]wehr,
[C]Fahn' und Säbel [G7]und noch [C]mehr,
[F]ja ein ganzes [C]Kriegesheer
[G7]möcht' ich gerne [C]haben.`,
  },
  {
    id: 'lib-kling-gloeckchen',
    title: 'Kling, Glöckchen, klingelingeling',
    artist: 'Traditionell (Text: Karl Enslin, 1826)',
    bpm: 120,
    body: `[C]Kling, Glöckchen, klingelingeling,
[G7]kling, Glöckchen, [C]kling!
[C]Lasst mich ein, ihr [F]Kinder,
ist so [C]kalt der [G7]Winter,
[C]öffnet mir die [F]Türen,
[G7]lasst mich nicht er[C]frieren!
Kling, Glöckchen, klingelingeling,
[G7]kling, Glöckchen, [C]kling!`,
  },
  {
    id: 'lib-leise-rieselt',
    title: 'Leise rieselt der Schnee',
    artist: 'Eduard Ebel (1895)',
    bpm: 70,
    body: `[G]Leise rieselt der [D]Schnee,
[Em]still und starr ruht der [C]See,
[G]weihnachtlich glänzet der [D]Wald:
[C]Freue dich, [D]Christkind kommt [G]bald!`,
  },
  {
    id: 'lib-es-ist-ein-ros',
    title: 'Es ist ein Ros entsprungen',
    artist: 'Traditionell (16. Jahrhundert)',
    bpm: 70,
    body: `[G]Es ist ein Ros ent[D]sprungen,
aus [Em]einer Wurzel [C]zart,
wie [G]uns die Alten [D]sungen,
von [Em]Jesse kam die [G]Art.
[C]Und hat ein Blümlein [G]bracht,
mitten im [D]kalten Winter,
wohl zu der [G]halben Nacht.`,
  },
  {
    id: 'lib-suesser-die-glocken',
    title: 'Süßer die Glocken nie klingen',
    artist: 'Friedrich Wilhelm Kritzinger (1860)',
    bpm: 80,
    body: `[G]Süßer die [C]Glocken nie [G]klingen
als [D7]zu der Weihnachts[G]zeit,
's ist, als ob [C]Engelein [G]singen
wieder von [D7]Frieden und [G]Freud.
Wie sie gesungen in [C]seliger [G]Nacht,
Glocken mit [D7]heiligem [G]Klang,
klinget die [D7]Erde ent[G]lang.`,
  },
  {
    id: 'lib-jingle-bells',
    title: 'Jingle Bells',
    artist: 'James Lord Pierpont (1857)',
    bpm: 120,
    body: `Refrain
[C]Jingle bells, jingle bells, [F]jingle all the [C]way,
Oh what [F]fun it is to [C]ride in a one-horse open [G7]sleigh, hey!
[C]Jingle bells, jingle bells, [F]jingle all the [C]way,
Oh what [F]fun it is to [G7]ride in a one-horse open [C]sleigh.`,
  },
  {
    id: 'lib-silent-night',
    title: 'Silent Night',
    artist: 'Joseph Mohr / Franz Xaver Gruber (engl.: John F. Young, 1859)',
    bpm: 60,
    body: `[G]Silent night, holy night,
[D7]All is calm, all is [G]bright
Round yon [C]virgin mother and [G]child,
[G]Holy infant so [C]tender and [G]mild,
[D7]Sleep in heavenly [G]peace,
[D7]Sleep in heavenly [G]peace.`,
  },
  {
    id: 'lib-o-come-all-ye',
    title: 'O Come, All Ye Faithful',
    artist: 'John F. Wade / Frederick Oakeley (1841)',
    bpm: 90,
    body: `[G]O come, all ye faithful, [D]joyful and tri[G]umphant,
O [G]come ye, o [D]come ye to [G]Beth[D]lehem;
[G]Come and be[C]hold Him, [G]born the King of [D]angels;
O [G]come, let us a[D]dore Him, o [G]come, let us a[D]dore Him,
O [G]come, let us a[C]dore [D]Him, [G]Christ the Lord.`,
  },
  {
    id: 'lib-joy-to-the-world',
    title: 'Joy to the World',
    artist: 'Isaac Watts (1719)',
    bpm: 100,
    body: `[C]Joy to the world! the [G7]Lord is come,
let [C]earth receive her [F]King;
let [C]every heart pre[G7]pare Him room,
and [C]heaven and nature [G7]sing,
and [C]heaven and nature [G7]sing,
and [C]heaven, and [G7]heaven and nature [C]sing.`,
  },
  {
    id: 'lib-we-wish-you',
    title: 'We Wish You a Merry Christmas',
    artist: 'Traditionell (England)',
    bpm: 110,
    body: `[D]We wish you a merry Christmas,
we [G]wish you a merry [D]Christmas,
we [A7]wish you a merry Christmas
and a [D]happy New Year.`,
  },
];
