# 02 · Quellen und Abhängigkeiten

| Bereich | Wahl |
|---|---|
| Framework | expo ~58.0, react-native 0.88.1, react 19.3 |
| Speicher | `@react-native-async-storage/async-storage` 2.2.0 |
| Ton | `expo-audio` (WAV aus `src/logic/wav.ts`; nativ als Cache-Datei, Web als Data-URI) |
| Haptik / Display an | `expo-haptics`, `expo-keep-awake` |
| Dateiauswahl | `expo-document-picker`, `expo-file-system` (neue `File`-API) |
| Web | `react-native-web`, `react-dom`, `@expo/metro-runtime` |
| Tests | `node:test` + `tsx` (kein Jest) |

## Lieder

- **Bibliothek** (`src/data/christmas.ts`, 15 Stück): Texte gemeinfrei bzw. traditionell (Gruber/Mohr, Falk, Hey/Silcher, Hoffmann von Fallersleben, Enslin, Ebel, Kritzinger, Pierpont, Watts u. a.). Die Akkorde sind **eigene Anfängerfassungen**, keine Übernahme fremder Akkordblätter.
- **Import:** URL (nur die eine eingegebene Adresse; `<pre>` oder Seitentext), Datei (.txt/.cho/.pro), Einfügen. Formate: ChordPro (`[C]Text`) und „Akkorde über Text".
- **Rechtliches:** Texte und Akkorde fremder Portale sind meist urheberrechtlich geschützt. Kein Crawler, keine feste Quelle; privater Gebrauch, Speicherung nur lokal. Das öffentliche Repo enthält nur die gemeinfreien Bibliothekslieder.

## Offene externe Abhängigkeit

Native APK: Der GitHub-Actions-Workflow braucht den `gh`-Scope `workflow` (siehe 04).
