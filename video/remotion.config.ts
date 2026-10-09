import path from 'node:path';
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Remotion lädt sonst beim ersten Rendern ein eigenes Chrome Headless Shell herunter.
// In der Cloud-Umgebung (ohne freien Internetzugang) auf den vorinstallierten Browser zeigen:
//   REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render:hero
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}

// Die 3D-Dose kommt aus beispiele/src/dose (gleicher Code wie auf der Website).
// three immer aus diesem Projekt laden, sonst gäbe es zwei three-Instanzen.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), three: path.resolve(process.cwd(), 'node_modules/three') },
  },
}));
