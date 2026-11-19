# 05 · Status (2026-11-19)

| Funktion | Stand |
|---|---|
| Lieder, Status, Import (URL/Datei/Einfügen) | fertig, im Web teils eingeschränkt (CORS) |
| Liedmodus: Akkorde über Text, Griffbilder, Transponieren, Kapo-Tipp, Auto-Scroll, Schriftgröße | fertig |
| Metronom, Referenztöne | fertig, Ton ungetestet |
| Üben: Streak, Wochenbalken, Vorschlag, 10-Minuten-Timer | fertig |
| Weihnachtsbibliothek (15 Lieder) | fertig |
| Zuhören per Mikrofon + Mitscrollen | fertig, Web und nativ (eigene FFT `logic/fft.ts`), nicht mit echter Gitarre getestet |
| Update: Web per `version.json`; APK per OTA (`expo-updates`, Manifest-Dienst auf Railway) + Hinweis auf neue APK | Dienst und Manifest geprüft (curl), **auf dem Gerät ungeprüft** |
| Installation per Link (PWA) | live |
| Native APK | offen (Scope `workflow`) |

**Tests:** 25 grün (`npm test`), `npm run typecheck` sauber, Android-Bundle und Web-Export bauen.

## Offen

- [ ] Mikrofon-Erkennung mit echter Gitarre abstimmen (Schwellen, Reaktionszeit).
- [ ] APK-Workflow ins öffentliche Repo (`gh auth refresh -h github.com -s workflow`).
- [ ] Mehr Lieder (Bibliothek erweitern, weitere gemeinfreie Sammlungen).
- [ ] Akkordwechsel-Training, Sync zwischen Geräten.
- [ ] Mikrofon (Zuhören + Stimmgerät) in der nativen App (braucht natives Audio-Modul).

**KI-Vermittler** läuft (Railway-Projekt `gitarren-ki`, Dienst `gitarren-ki`; Variablen `ANTHROPIC_API_KEY`, `APP_CODE`, `TAGESLIMIT`; gleicher Dienst liefert das OTA-Manifest). Der Zugangscode liegt nur beim Nutzer, nicht im Repo.
