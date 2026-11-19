# Gitarren-Übungs-App

Native App (Expo / React Native, TypeScript) zum Üben von Lagerfeuer-Liedern, Zielgruppe Anfänger.
Scope: nur diese App. Was nicht hierher gehört: Hof-/Smarthome-Apps.

## Funktionen
| Bereich | Inhalt |
|---|---|
| Lieder | Liste, Status Neu/Üben/Kann ich, Import per URL, Datei (.txt/.cho/.pro) oder Einfügen |
| Spielen | Text mit Akkorden über der Silbe, Griffbilder, Transponieren, Kapo-Tipp, Auto-Scroll, Schriftgröße, Übezeit |
| Metronom | 30–220 BPM, 2/3/4/6 Schläge, Betonung, Haptik |
| Stimmen | Referenztöne der 6 Saiten (kein Mikrofon-Stimmgerät) |
| Üben | Streak, Minuten heute/Woche, Wochenbalken, Tagesvorschlag, 10-Min-Timer |

## Entwickeln
```bash
cd projects/gitarren-app
npm install
npm test            # Logik-Tests (node:test + tsx)
npm run typecheck
npm start           # Expo; auf dem Handy mit Expo Go öffnen (QR-Code)
```
Preview-Eintrag `gitarren-app` in `.claude/launch.json` (Web, Port 8099).

## Aufbau
- `src/logic/` — reine Logik ohne React Native, getestet: `chords.ts` (Parser, Transponieren, Griffe, Kapo, deutsches H/B), `song.ts` (ChordPro und „Akkorde über Text"), `importer.ts` (HTML → Text), `practice.ts` (Streak, Vorschlag), `wav.ts` (Klick/Stimmton).
- `src/ui/` — Screens; `src/store.ts` — Speicher in AsyncStorage (nur auf dem Gerät); `src/audio.ts` — Töne über expo-audio.

## Stand und Grenzen
- Geprüft: 10 Logik-Tests grün, `tsc` sauber, Android-Bundle baut. **Nicht** auf einem Gerät/Emulator ausprobiert (Browser-Vorschau war nicht freigegeben).
- Audio (Datei im Cache + expo-audio) und Dateiauswahl sind auf dem Gerät unverifiziert.
- Netz-Import: holt nur die eine eingegebene Adresse, Seiten mit JavaScript-Rendering oder Sperre liefern nichts → Text einfügen. Texte/Akkorde sind meist urheberrechtlich geschützt; Nutzung privat.
- Offen: Mikrofon-Stimmgerät (braucht natives Pitch-Modul), Akkord-Wechsel-Training, Cloud-Sync.
