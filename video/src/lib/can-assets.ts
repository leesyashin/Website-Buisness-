import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
// Gleicher Code wie die Website (beispiele/src/dose): Dosenmodell, Etikett, Sorten
import { createCan } from '../../../beispiele/src/dose/can.js';
import { drawLabel } from '../../../beispiele/src/dose/label.js';
import { flavors } from '../../../beispiele/src/dose/flavors.js';

export type FlavorKey = keyof typeof flavors;
export { flavors };

type Assets = { can: ReturnType<typeof createCan>; labels: Record<FlavorKey, HTMLCanvasElement> };

// Lädt die Etikett-Schrift, malt die drei Etiketten und baut die Dose. Bis dahin wartet Remotion mit dem Rendern.
export function useCanAssets(): Assets | null {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('Dose vorbereiten'));
  useEffect(() => {
    loadFont({
      family: 'Bricolage Grotesque Variable',
      url: staticFile('fonts/bricolage-grotesque-latin-standard-normal.woff2'),
      weight: '200 800',
    }).then(() => {
      const labels = Object.fromEntries(
        (Object.keys(flavors) as FlavorKey[]).map((k) => [k, drawLabel(document.createElement('canvas'), k)]),
      ) as Record<FlavorKey, HTMLCanvasElement>;
      setAssets({ can: createCan(labels.yuzu), labels });
      continueRender(handle);
    });
  }, [handle]);
  return assets;
}
