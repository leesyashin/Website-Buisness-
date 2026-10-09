import { Composition } from 'remotion';
import { HeroLoop } from './compositions/HeroLoop';
import { SocialReel, socialReelDefaults } from './compositions/SocialReel';
import './lib/theme';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Website-Hintergrund: 8 s nahtlos, 1920×1080 */}
    <Composition id="HeroLoop" component={HeroLoop} durationInFrames={8 * FPS} fps={FPS} width={1920} height={1080} />
    {/* Reel 9:16, Texte per --props austauschbar. Länge: 3 Szenen minus 2 Übergänge à 18 Bilder */}
    <Composition
      id="SocialReel"
      component={SocialReel}
      durationInFrames={Math.round(3.6 * FPS) * 2 + 3 * FPS - 36}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={socialReelDefaults}
    />
  </>
);
