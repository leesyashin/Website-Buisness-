import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useCanAssets, flavors, type FlavorKey } from '../lib/can-assets';
import { Studio3D } from '../lib/Studio3D';

// Produkt-Reel 9:16: die 3D-Dose der Website, drei Sorten à 4 s, dann Schlusskarte.
// Hintergrund und Schrift folgen den Colorways der Produktseite (beispiele/src/dose/dose.css).
const ORDER: FlavorKey[] = ['yuzu', 'hibiskus', 'minze'];
const PAGE: Record<FlavorKey, { bg: string; ink: string }> = {
  yuzu: { bg: '#1d3a26', ink: '#f1eda4' },
  hibiskus: { bg: '#f6d9de', ink: '#4a0d27' },
  minze: { bg: '#cdeedf', ink: '#10343b' },
};
export const SEGMENT = 120;
export const OUTRO = 75;
const sig = Easing.bezier(0.65, 0.05, 0, 1);
const font = '"Bricolage Grotesque Variable", sans-serif';

export const CanReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const assets = useCanAssets();

  const seg = Math.min(ORDER.length - 1, Math.floor(frame / SEGMENT));
  const local = frame - seg * SEGMENT;
  const key = ORDER[seg];
  const outro = frame >= ORDER.length * SEGMENT;

  // Hintergrund blendet in den letzten 14 Bildern eines Abschnitts zur nächsten Sorte
  const nextKey = ORDER[Math.min(ORDER.length - 1, seg + 1)];
  const blend = interpolate(local, [SEGMENT - 14, SEGMENT], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bg = interpolateColors(blend, [0, 1], [PAGE[key].bg, PAGE[nextKey].bg]);
  const ink = interpolateColors(blend, [0, 1], [PAGE[key].ink, PAGE[nextKey].ink]);

  // Dose: dreht stetig, wirbelt beim Sortenwechsel einmal herum; Etikett wechselt in der Mitte des Wirbels
  const spins = ORDER.slice(1).reduce((acc, _, i) => {
    const at = (i + 1) * SEGMENT;
    return acc + interpolate(frame, [at - 12, at + 16], [0, Math.PI * 2], { easing: sig, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  }, 0);
  const labelKey = ORDER[Math.min(ORDER.length - 1, Math.floor((frame + 4) / SEGMENT))];
  if (assets && (assets.can as { label?: string }).label !== labelKey) {
    (assets.can as { label?: string }).label = labelKey;
    assets.can.setLabel(assets.labels[labelKey]);
  }
  const rise = interpolate(frame, [0, 40], [-2.2, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: 'clamp' });
  const outroT = interpolate(frame, [ORDER.length * SEGMENT, ORDER.length * SEGMENT + 30], [0, 1], { easing: sig, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Großes Sortenwort hinter der Dose, steigt aus einer Maske
  const wordY = interpolate(local, [0, 22], [100, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: 'clamp' });
  const wordOut = interpolate(local, [SEGMENT - 16, SEGMENT], [0, -100], { easing: sig, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: outro ? PAGE.minze.bg : bg, color: outro ? PAGE.minze.ink : ink, fontFamily: font }}>
      {!outro && (
        <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 170, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                transform: `translateY(${seg === ORDER.length - 1 ? wordY : wordY + wordOut}%)`,
                fontSize: Math.min(330, 1700 / flavors[key].short.length),
                fontWeight: 800,
                fontVariationSettings: '"wdth" 75',
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {flavors[key].short}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {assets && (
        <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0.15, 4.6] }} gl={{ antialias: true }}>
          <Studio3D />
          <group position={[0, -0.2 + rise + Math.sin(frame / 18) * 0.03 + outroT * 0.5, 0]} scale={1.05 - outroT * 0.15}>
            <group rotation={[0.1, 0, 0.12 * Math.sin(frame / 40)]}>
              <primitive object={assets.can.group} rotation-y={0.05 + frame * 0.012 + spins - outroT * 0.4} />
            </group>
          </group>
        </ThreeCanvas>
      )}

      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: 90, gap: 18 }}>
        {!outro ? (
          <>
            <div style={{ fontSize: 34, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75 }}>
              No. {flavors[key].no} · perle
            </div>
            <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1 }}>{flavors[key].name}</div>
          </>
        ) : (
          <div style={{ opacity: outroT, transform: `translateY(${(1 - outroT) * 40}px)` }}>
            <div style={{ fontSize: 120, fontWeight: 800, fontVariationSettings: '"wdth" 75', lineHeight: 0.9 }}>Alle drei probieren.</div>
            <div style={{ fontSize: 44, marginTop: 24 }}>12 Dosen · 24,90 € · perle.example</div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Standbild einer Sorte mit transparentem Hintergrund (für Übersichtsseite und Fallback ohne WebGL)
export const CanStill: React.FC<{ flavor: FlavorKey }> = ({ flavor }) => {
  const { width, height } = useVideoConfig();
  const assets = useCanAssets();
  if (assets && (assets.can as { label?: string }).label !== flavor) {
    (assets.can as { label?: string }).label = flavor;
    assets.can.setLabel(assets.labels[flavor]);
  }
  return (
    <AbsoluteFill>
      {assets && (
        <ThreeCanvas width={width} height={height} camera={{ fov: 28, position: [0, 0.2, 4.2] }} gl={{ antialias: true, alpha: true }}>
          <Studio3D />
          <group rotation={[0.08, 0, 0.12]}>
            <primitive object={assets.can.group} rotation-y={0.12} />
          </group>
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
