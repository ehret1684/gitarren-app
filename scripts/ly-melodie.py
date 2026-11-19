"""Liest die Sopran-Stimme aus einer Mutopia-LilyPond-Datei und gibt die Melodie als (MIDI, Laenge in 16teln) aus.
Aufruf: python scripts/ly-melodie.py stille_nacht.ly -3     (letzter Wert = Transposition in Halbtoenen)
Quelle fuer Stille Nacht: mutopiaproject.org/ftp/GruberFX/stille_nacht/stille_nacht.ly (Public Domain)."""
import re
import sys

src = open(sys.argv[1], encoding="utf8").read()
shift = int(sys.argv[2]) if len(sys.argv) > 2 else 0
body = re.search(r"Soprano = .*?\\major (.*?)\\bar", src, re.S).group(1)
base = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}
dur, dots, notes = "8", "", []
for tk in body.split():
    m = re.fullmatch(r"([a-g])(is|es|s)?('*|,*)(\d+)?(\.*)", tk)
    if not m:
        print("??", tk)
        continue
    n, acc, oc, d, dt = m.groups()
    if d:
        dur, dots = d, dt
    pc = base[n] + (1 if acc == "is" else -1 if acc in ("es", "s") else 0)
    octv = 3 + oc.count("'") - oc.count(",")  # c = C3, c' = C4
    ln = {"1": 16, "2": 8, "4": 4, "8": 2, "16": 1}[dur]
    if dots == ".":
        ln = ln * 3 // 2
    notes.append((12 * (octv + 1) + pc + shift, ln))
print(len(notes), "Noten,", sum(l for _, l in notes) / 12, "Takte (12 Sechzehntel)")
print(notes)
