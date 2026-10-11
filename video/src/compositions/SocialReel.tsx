import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { color, font } from '../lib/theme';

// Hochformat-Reel (Instagram, TikTok, LinkedIn) – Texte kommen als Props, pro Kunde rendern:
//   npx remotion render SocialReel out/kunde.mp4 --props='{"kicker":"Neu online","headline":["Weingut","am Hang"],"cta":"weingut.de"}'
export type SocialReelProps = {
  kicker: string;
  headline: string[];
  points: string[];
  cta: string;
};

export const socialReelDefaults: SocialReelProps = {
  kicker: 'Webdesign & Motion',
  headline: ['Websites,', 'die sich', 'bewegen.'],
  points: ['Schnell geladen', 'Barrierearm', 'Mit Haltung animiert'],
  cta: 'studio.example',
};

const out = Easing.bezier(0.22, 1, 0.36, 1);

export const SocialReel: React.FC<SocialReelProps> = (props) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg, color: color.ink, fontFamily: font.sans }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={Math.round(3.6 * fps)}>
          <Intro kicker={props.kicker} headline={props.headline} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={linearTiming({ durationInFrames: 18, easing: out })}
        />
        <TransitionSeries.Sequence durationInFrames={Math.round(3.6 * fps)}>
          <Points points={props.points} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: 18, easing: out })}
        />
        <TransitionSeries.Sequence durationInFrames={Math.round(3 * fps)}>
          <Outro cta={props.cta} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Zeilen steigen aus einer Maske, wie [data-split] auf der Website
const MaskedLine: React.FC<{ children: React.ReactNode; delay: number; style?: React.CSSProperties }> = ({
  children,
  delay,
  style,
}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame - delay, [0, 24], [110, 0], {
    easing: out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.08em' }}>
      <div style={{ transform: `translateY(${y}%)`, ...style }}>{children}</div>
    </div>
  );
};

const Intro: React.FC<{ kicker: string; headline: string[] }> = ({ kicker, headline }) => {
  const frame = useCurrentFrame();
  const kickerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ padding: 96, justifyContent: 'flex-end', gap: 40 }}>
      <div style={{ fontSize: 34, letterSpacing: '0.08em', textTransform: 'uppercase', color: color.inkSoft, opacity: kickerOpacity }}>
        {kicker}
      </div>
      <div style={{ fontFamily: font.display, fontSize: 210, lineHeight: 0.9, letterSpacing: '-0.035em' }}>
        {headline.map((line, i) => (
          <MaskedLine
            key={i}
            delay={8 + i * 6}
            style={i === headline.length - 1 ? { fontStyle: 'italic', color: color.accent } : undefined}
          >
            {line}
          </MaskedLine>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Points: React.FC<{ points: string[] }> = ({ points }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: color.dark, color: color.onDark, padding: 96, justifyContent: 'center', gap: 56 }}>
      {points.map((p, i) => {
        const s = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 200 } });
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 36,
              fontSize: 96,
              fontFamily: font.display,
              opacity: s,
              transform: `translateX(${(1 - s) * 80}px)`,
            }}
          >
            <span style={{ fontFamily: font.sans, fontSize: 32, color: color.accent }}>0{i + 1}</span>
            {p}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ cta: string }> = ({ cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ backgroundColor: color.accent, color: color.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: font.display, fontSize: 120, transform: `scale(${0.85 + pop * 0.15})`, opacity: pop }}>
        {cta}
      </div>
    </AbsoluteFill>
  );
};
