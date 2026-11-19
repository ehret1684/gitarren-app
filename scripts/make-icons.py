"""Erzeugt alle App-Symbole (assets/*.png) aus einer einzigen Gitarren-Zeichnung. Aufruf: python scripts/make-icons.py"""
from PIL import Image, ImageDraw

BG = (20, 17, 15, 255)        # #14110f
BODY = (242, 160, 61, 255)    # #f2a03d (Akzent)
NECK = (150, 92, 28, 255)
DARK = (20, 17, 15, 255)
LIGHT = (243, 236, 228, 255)  # #f3ece4
S = 4                          # Supersampling


def guitar(size, body=BODY, neck=NECK, dark=DARK, strings=LIGHT, angle=40):
    """Gitarre auf transparenter Flaeche (size x size), um `angle` Grad gedreht."""
    n = 1000 * S
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    k = lambda v: int(v * S)

    def ell(cx, cy, rx, ry, fill):
        d.ellipse([k(cx - rx), k(cy - ry), k(cx + rx), k(cy + ry)], fill=fill)

    # Hals und Kopfplatte
    d.rounded_rectangle([k(468), k(190), k(532), k(560)], radius=k(8), fill=neck)
    d.rounded_rectangle([k(446), k(70), k(554), k(215)], radius=k(26), fill=neck)
    for x in (468, 532):  # Stimmwirbel
        for y in (100, 150):
            ell(x - (30 if x < 500 else -30) + (0), y, 11, 11, body)
    # Korpus: oberer und unterer Bauch, dazwischen eine Taille
    ell(500, 520, 165, 150, body)
    ell(500, 770, 235, 195, body)
    d.rectangle([k(385), k(590), k(615), k(650)], fill=body)
    # Schallloch und Steg
    ell(500, 700, 62, 62, dark)
    d.rounded_rectangle([k(430), k(850), k(570), k(878)], radius=k(10), fill=dark)
    for x in (480, 500, 520):
        d.line([k(x), k(215), k(x), k(864)], fill=strings, width=k(5))
    im = im.rotate(angle, resample=Image.BICUBIC, center=(n // 2, n // 2))
    return im.resize((size, size), Image.LANCZOS)


def on(bg, g, scale=1.0, size=1024):
    out = Image.new("RGBA", (size, size), bg)
    gg = g.resize((int(size * scale), int(size * scale)), Image.LANCZOS)
    o = (size - gg.width) // 2
    out.alpha_composite(gg, (o, o))
    return out


g = guitar(1024)
# Haupticon: Gitarre auf dunklem Grund, mit etwas Luft
on(BG, g, 0.92).convert("RGB").save("assets/icon.png")
# Android adaptive: Vordergrund (Sicherheitszone ~66 %), Hintergrund einfarbig, einfarbige Variante
on((0, 0, 0, 0), g, 0.70).resize((512, 512), Image.LANCZOS).save("assets/android-icon-foreground.png")
Image.new("RGBA", (512, 512), BG).save("assets/android-icon-background.png")
mono = guitar(1024, body=(255, 255, 255, 255), neck=(255, 255, 255, 255), dark=(0, 0, 0, 0), strings=(0, 0, 0, 0))
on((0, 0, 0, 0), mono, 0.70).resize((432, 432), Image.LANCZOS).save("assets/android-icon-monochrome.png")
# Startbild und Favicon
on((0, 0, 0, 0), g, 0.80).save("assets/splash-icon.png")
on(BG, g, 1.0).resize((48, 48), Image.LANCZOS).convert("RGB").save("assets/favicon.png")
print("Symbole erzeugt")
