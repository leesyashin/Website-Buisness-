import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const here = (p) => resolve(import.meta.dirname, p);

// Die Beispiele nutzen das Motion-System und die Grundstile des Starters direkt (@starter/…),
// damit Verbesserungen dort sofort auch hier ankommen. gsap/lenis nur einmal laden (dedupe),
// sonst gäbe es zwei GSAP-Instanzen und die Plugins wären nur an einer registriert.
export default defineConfig({
  resolve: {
    alias: { '@starter': here('../starter/src') },
    dedupe: ['gsap', 'lenis'],
  },
  server: { fs: { allow: [here('..')] } },
  build: {
    rollupOptions: {
      input: {
        index: here('index.html'),
        dose: here('dose/index.html'),
        bau: here('bau/index.html'),
        restaurant: here('restaurant/index.html'),
        schreinerei: here('schreinerei/index.html'),
        zahnarzt: here('zahnarzt/index.html'),
        physio: here('physio/index.html'),
        architektur: here('architektur/index.html'),
        'architektur-speicher-7': here('architektur/speicher-7.html'),
        'architektur-haus-am-hang': here('architektur/haus-am-hang.html'),
        'architektur-bootshaus': here('architektur/bootshaus.html'),
        'architektur-hof-ehrenfeld': here('architektur/hof-ehrenfeld.html'),
      },
    },
  },
});
