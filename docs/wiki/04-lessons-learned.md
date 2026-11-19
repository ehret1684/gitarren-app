# 04 · Lessons Learned

## Gut gelaufen

- **Logik ohne React Native** (`src/logic/`): mit `node:test` + `tsx` ohne Gerät testbar. Ein Test prüft, dass jeder Akkord der Bibliothek ein Griffbild hat.
- **Erkennung nur gegen die Akkorde des Liedes** statt freier Akkorderkennung: kleine Auswahl, wenige Fehlgriffe.
- **Statt Konto/Store: PWA auf GitHub Pages.** Ein Link genügt, installierbar, ohne Laptop erreichbar.
- Android-Bundle (`npx expo export --platform android`) als Compile-Probe ohne Emulator.

## Schlecht gelaufen / verworfen

| Was | Warum | Folge |
|---|---|---|
| **APK per GitHub Actions** (`.github/workflows/apk.yml`) | Push abgelehnt: `gh`-Token ohne Scope `workflow`; der Nutzer war unterwegs | Workflow liegt nur im Arbeitsplatz-Repo, nicht im öffentlichen. Nachziehen: `gh auth refresh -h github.com -s workflow`, Datei ins öffentliche Repo kopieren (ADR 025) |
| **EAS Build** | braucht Expo-Konto; Nutzer wollte keins | nicht verfolgt |
| **Lokaler APK-Bau** | weder JDK noch Android SDK auf dem Laptop | nicht verfolgt |
| **Mikrofon-Stimmgerät** | braucht ein natives Pitch-Modul | nur Referenztöne |
| **Browser-Vorschau zur Prüfung** | Browser-Pane war ausgeblendet, Navigation abgelehnt | App nie live im Browser oder auf dem Handy gesehen |
| **Sammel-Heredoc in Bash** (viele Dateien in einem Befehl) | „unexpected EOF", nichts wurde angelegt (zweimal passiert) | Dateien einzeln mit dem Schreib-Werkzeug anlegen |
| **`rm -rf "$D/"*`** | Sicherheitsprüfung blockt Variablen-Glob | stattdessen `git rm -rq .` im Pages-Repo |
| **Netz-Import im Browser** | CORS blockt die meisten Seiten | Hinweis, Text einfügen; kein Proxy (würde die Adresse an Dritte senden) |

## Fallstricke

- `tsconfig`: `types: ["node","react"]` nötig, sonst meckert `tsc` über `node:test`.
- RN 0.88: Der Ref-Typ der ScrollView ist `ScrollViewInstance` (aus `react-native`), nicht `ScrollView`.
- Git-Commits im öffentlichen Repo nie mit der privaten Mailadresse (Noreply nutzen).
- `dist/` steht in der `.gitignore` des Projekts; das Pages-Repo hat eine **eigene** Git-Historie (Branch `gh-pages`, Kopie von `dist/`).
- Mit Kapo spielen und gleichzeitig zuhören lassen passt nicht: erkannt wird der **klingende** Akkord → Lied transponieren statt Kapo.

## Ungeprüft (Stand 2026-11-19)

Ton, Dateiauswahl, Netz-Import und vor allem die **Mikrofon-Erkennung mit echter Gitarre** sind auf keinem Gerät erprobt. Die Schwellen (0,72 / 0,04 / 0,01 / 3 Messungen) sind geschätzt und nur mit künstlichen Spektren getestet.

## 2026-11-19 · Stimmgerät

- **Gut:** YIN statt FFT-Spitzensuche — bei Gitarre ist der Grundton oft schwächer als die Obertöne, die FFT würde Oktavfehler machen. Im Test mit synthetischen Obertönen sauber.
- **Offen:** Nur mit synthetischen Signalen geprüft, nicht mit echter Gitarre/Mikrofon. Tiefes E (82 Hz) braucht das 4096er-Fenster (~93 ms); bei Problemen Fenster vergrößern.
- **Fallstrick:** Im frischen Worktree fehlen `node_modules` → `npm test` meldet `ERR_MODULE_NOT_FOUND`; erst `npm ci`.

## 2026-11-19 · Liedersuche und Auslieferung

- **Schlecht gelaufen:** Test mit `\n` über ein Bash-Heredoc geschrieben → die Shell machte `\n` daraus (echter Zeilenumbruch im JSON-String), Test schlug fehl, der Parser war unschuldig. Dateien mit Escape-Folgen mit dem Write-Werkzeug schreiben, nicht per Heredoc.
- **Schlecht gelaufen:** `gh auth refresh` im Terminal scheiterte („not logged in"), weil die Zeile mitten in den Prompt eingefügt war; erst `gh auth login -h github.com -s workflow` (HTTPS) brachte den Scope `workflow`.
- **Offen:** KI-Suche nie mit echtem Schlüssel ausprobiert; Browser-Direktaufruf der API hängt am Header `anthropic-dangerous-direct-browser-access`.
