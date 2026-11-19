# 05 · Status (2026-11-19)

| Funktion | Stand |
|---|---|
| Lieder, Status, Import (URL/Datei/Einfügen) | fertig, im Web teils eingeschränkt (CORS) |
| Liedmodus: Akkorde über Text, Griffbilder, Transponieren, Kapo-Tipp, Auto-Scroll, Schriftgröße | fertig |
| Metronom, Referenztöne | fertig, Ton ungetestet |
| Üben: Streak, Wochenbalken, Vorschlag, 10-Minuten-Timer | fertig |
| Weihnachtsbibliothek (15 Lieder) | fertig |
| Zuhören per Mikrofon + Mitscrollen | fertig, **nur Web**, nicht mit echter Gitarre getestet |
| Installation per Link (PWA) | live |
| Native APK | offen (Scope `workflow`) |

**Tests:** 22 grün (`npm test`), `npm run typecheck` sauber, Android-Bundle und Web-Export bauen.

## Offen

- [ ] Mikrofon-Erkennung mit echter Gitarre abstimmen (Schwellen, Reaktionszeit).
- [ ] APK-Workflow ins öffentliche Repo (`gh auth refresh -h github.com -s workflow`).
- [ ] Mehr Lieder (Bibliothek erweitern, weitere gemeinfreie Sammlungen).
- [ ] Akkordwechsel-Training, Sync zwischen Geräten.
- [ ] Mikrofon (Zuhören + Stimmgerät) in der nativen App (braucht natives Audio-Modul).
