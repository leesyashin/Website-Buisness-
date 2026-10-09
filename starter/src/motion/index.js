import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { media } from './config.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initReveal } from './reveal.js';
import { initSplit } from './split.js';
import { initScrubText } from './scrub-text.js';
import { initParallax } from './parallax.js';
import { initHorizontal } from './horizontal.js';
import { initMarquee } from './marquee.js';
import { initMagnetic } from './magnetic.js';
import { initCounter } from './counter.js';
import { initHeader } from './header.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Grundregel: Das HTML ist ohne JavaScript und bei „Bewegung reduzieren“ vollständig und lesbar.
// Bewegung kommt nur obendrauf. gsap.matchMedia räumt alles automatisch auf, sobald eine Bedingung
// wegfällt (z. B. Fenster schmaler als Desktop oder Systemeinstellung geändert).
export function initMotion() {
  const html = document.documentElement;
  initHeader();

  const mm = gsap.matchMedia();
  mm.add(media, (ctx) => {
    const { motion, desktop, finePointer } = ctx.conditions;
    if (!motion) {
      html.classList.remove('motion-pending');
      pauseAutoplayVideos();
      return;
    }

    const cleanups = [initSmoothScroll(), initSplit(), initScrubText(), initMarquee()];
    initReveal();
    initParallax();
    initCounter();
    if (desktop) initHorizontal();
    if (finePointer) cleanups.push(initMagnetic());

    html.classList.remove('motion-pending');
    html.classList.add('motion-ready');

    // Nach dem Laden von Schriften und Bildern ändern sich Höhen – Szenen neu vermessen
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

    return () => {
      cleanups.forEach((c) => c?.());
      html.classList.remove('motion-ready');
    };
  });
}

// Hintergrundvideos (z. B. aus Remotion gerendert) bei reduzierter Bewegung anhalten
function pauseAutoplayVideos() {
  document.querySelectorAll('video[autoplay]').forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
  });
}
