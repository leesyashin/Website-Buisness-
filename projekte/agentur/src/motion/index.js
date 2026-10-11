import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { media, signatureCurve } from './config.js';
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
import { initColorway } from './colorway.js';
import { initScramble } from './scramble.js';
import { initDraw } from './draw.js';
import { initHighlight } from './highlight.js';
import { initRoll } from './roll.js';
import { initStack } from './stack.js';
import { initSnap } from './snap.js';
import { initZoom } from './zoom.js';
// Muster der Agenturseite (nur aktiv, wo ihre Elemente stehen)
import { initVergleich, initVergleichAuftritt } from './vergleich.js';
import { initWeiche } from './weiche.js';
import { initGalerie } from './galerie.js';
import { initAblauf } from './ablauf.js';
import { initKarte } from './karte.js';
import { initSzene } from './szene.js';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, CustomEase);
CustomEase.create('signature', signatureCurve);

// Grundregel: Das HTML ist ohne JavaScript und bei „Bewegung reduzieren“ vollständig und lesbar.
// Bewegung kommt nur obendrauf. gsap.matchMedia räumt alles automatisch auf, sobald eine Bedingung
// wegfällt (z. B. Fenster schmaler als Desktop oder Systemeinstellung geändert).
export function initMotion() {
  const html = document.documentElement;
  // Unabhängig von „Bewegung reduzieren“: Zustände, keine Bewegung (Übergänge schaltet base.css dann ab)
  initHeader();
  initColorway();
  initRoll();
  initVergleich();

  const mm = gsap.matchMedia();
  mm.add(media, (ctx) => {
    const { motion, desktop, finePointer } = ctx.conditions;
    if (!motion) {
      html.classList.remove('motion-pending');
      pauseAutoplayVideos();
      return;
    }

    const cleanups = [initSmoothScroll(), initSplit(), initScrubText(), initMarquee()];
    cleanups.push(initSnap(window.lenis));
    initReveal();
    initParallax();
    initZoom();
    initCounter();
    initScramble();
    initDraw();
    initHighlight();
    initStack();
    if (desktop) initHorizontal();
    if (finePointer) cleanups.push(initMagnetic());
    if (desktop) cleanups.push(initSzene());
    initVergleichAuftritt();
    cleanups.push(initWeiche({ finePointer }));
    if (desktop) cleanups.push(initGalerie());
    initAblauf({ desktop });
    initKarte();

    html.classList.remove('motion-pending');
    html.classList.add('motion-ready');

    // Nach dem Laden von Schriften und Bildern ändern sich Höhen – Szenen neu vermessen.
    // sort() bringt alle Auslöser in Seitenreihenfolge: Anheftungen (Pins), die erst später entstehen
    // (Seitwärts-Strecke, Seiten-Skripte), verschieben dann auch früher erstellte Auslöser darunter richtig.
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh, { once: true });

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
