import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { color } from '../lib/theme';

// Nahtlose Hintergrundschleife für den Website-Hero.
// Jede Bewegung ist eine volle Sinus-Periode über die Gesamtlänge: Bild 0 und letztes Bild schließen
// exakt aneinander an, <video loop> zeigt keinen Sprung.
// Ruhig halten: Hintergrund, nicht Hauptdarsteller. Text liegt auf der Website darüber, nicht im Video.

const blobs = [
  { x: 0.25, y: 0.3, r: 0.7, hue: 38, ax: 0.1, ay: 0.08, phase: 0 },
  { x: 0.78, y: 0.25, r: 0.6, hue: 70, ax: 0.08, ay: 0.1, phase: 0.33 },
  { x: 0.6, y: 0.85, r: 0.8, hue: 20, ax: 0.12, ay: 0.06, phase: 0.66 },
];

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const t = (frame / durationInFrames) * Math.PI * 2;

  return (
    <AbsoluteFill style={{ backgroundColor: color.bg, overflow: 'hidden' }}>
      {blobs.map((b, i) => {
        const cx = (b.x + Math.sin(t + b.phase * Math.PI * 2) * b.ax) * width;
        const cy = (b.y + Math.cos(t + b.phase * Math.PI * 2) * b.ay) * height;
        const size = b.r * width * (1 + Math.sin(t * 2 + i) * 0.04);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx - size / 2,
              top: cy - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, oklch(0.88 0.09 ${b.hue} / 0.9), oklch(0.74 0.15 ${b.hue} / 0.45) 40%, transparent 68%)`,
              filter: 'blur(120px)',
            }}
          />
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};

// Feines Filmkorn gegen Farbbänder im Verlauf (h264 komprimiert glatte Verläufe sonst in Stufen)
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'multiply' }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
