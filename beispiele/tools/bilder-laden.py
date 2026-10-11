# Lädt die generierten Fotos (tools/bilder.json) und legt sie webtauglich ab:
# public/media/<name>.webp in 1600 px und <name>-800.webp für kleine Bildschirme.
#   python3 tools/bilder-laden.py
import json, os, sys, urllib.request, io
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
quellen = json.load(open(os.path.join(here, 'bilder.json')))
for name, url in quellen.items():
    if name.startswith('_'):
        continue
    ziel = os.path.join(root, 'public', 'media', name)
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    try:
        daten = urllib.request.urlopen(url, timeout=60).read()
    except Exception as e:
        print(f'FEHLER {name}: {e}', file=sys.stderr)
        continue
    bild = Image.open(io.BytesIO(daten)).convert('RGB')
    for breite, suffix in ((1600, ''), (800, '-800')):
        kopie = bild.copy()
        kopie.thumbnail((breite, breite * 2))
        kopie.save(f'{ziel}{suffix}.webp', quality=80, method=6)
    print(f'{name}: {bild.size[0]}×{bild.size[1]} → {ziel}.webp')
