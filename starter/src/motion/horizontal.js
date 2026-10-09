import { gsap } from 'gsap';
import { ease } from './config.js';

// [data-horizontal]           Abschnitt wird angeheftet, die Spur darin fährt beim Scrollen seitwärts.
//   [data-horizontal-track]   die Spur (Flex-Reihe)
// Nur am Desktop (siehe index.js). Auf dem Handy bleibt die Spur eine native Wischleiste mit scroll-snap.
export function initHorizontal() {
  gsap.utils.toArray('[data-horizontal]').forEach((section) => {
    const track = section.querySelector('[data-horizontal-track]');
    if (!track) return;
    const distance = () => track.scrollWidth - section.clientWidth;

    gsap.to(track, {
      x: () => -distance(),
      ease: ease.none,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  });
}
