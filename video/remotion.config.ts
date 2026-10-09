import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Remotion lädt sonst beim ersten Rendern ein eigenes Chrome Headless Shell herunter.
// In der Cloud-Umgebung (ohne freien Internetzugang) auf den vorinstallierten Browser zeigen:
//   REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render:hero
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
