# Lädt die generierten Fotos (tools/bilder.json) und legt sie webtauglich ab:
# public/media/<name>.webp in 1600 px und <name>-800.webp für kleine Bildschirme.
#   python3 tools/bilder-laden.py          nur Bilder, die noch fehlen
#   python3 tools/bilder-laden.py --alle   alle neu laden
#
# Eintrag in bilder.json: entweder nur die URL oder ein Objekt mit Nachbearbeitung (Pixel im Original):
#   "zuschnitt": [links, oben, rechts, unten]                  z. B. einfarbigen Rand abschneiden
#   "flicken":   [[[x0, y0, x1, y1], [dx, dy]], …]             Bereich mit sauberem Stück daneben überdecken
#                (Poisson-Klonen, braucht OpenCV: pip install opencv-python-headless) – etwa Logos auf Kleidung
import json, os, sys, urllib.request, io
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
alle = '--alle' in sys.argv
quellen = json.load(open(os.path.join(here, 'bilder.json')))


def flicken(bild, stellen):
    import cv2, numpy as np
    im = cv2.cvtColor(np.array(bild), cv2.COLOR_RGB2BGR)
    for (x0, y0, x1, y1), (dx, dy) in stellen:
        stueck = im[y0 + dy:y1 + dy, x0 + dx:x1 + dx].copy()
        maske = np.full(stueck.shape[:2], 255, np.uint8)
        im = cv2.seamlessClone(stueck, im, maske, ((x0 + x1) // 2, (y0 + y1) // 2), cv2.NORMAL_CLONE)
    return Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))


for name, eintrag in quellen.items():
    if name.startswith('_'):
        continue
    if isinstance(eintrag, str):
        eintrag = {'url': eintrag}
    ziel = os.path.join(root, 'public', 'media', name)
    if not alle and os.path.exists(f'{ziel}.webp') and os.path.exists(f'{ziel}-800.webp'):
        continue
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    try:
        daten = urllib.request.urlopen(eintrag['url'], timeout=60).read()
    except Exception as e:
        print(f'FEHLER {name}: {e}', file=sys.stderr)
        continue
    bild = Image.open(io.BytesIO(daten)).convert('RGB')
    if 'flicken' in eintrag:
        bild = flicken(bild, eintrag['flicken'])
    if 'zuschnitt' in eintrag:
        bild = bild.crop(tuple(eintrag['zuschnitt']))
    for breite, suffix in ((1600, ''), (800, '-800')):
        kopie = bild.copy()
        kopie.thumbnail((breite, breite * 2))
        kopie.save(f'{ziel}{suffix}.webp', quality=80, method=6)
    print(f'{name}: {bild.size[0]}×{bild.size[1]} → {ziel}.webp')
