import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// [data-marquee]          Laufband. Inhalt wird einmal dupliziert (für Screenreader versteckt).
// [data-marquee-speed]    Pixel pro Sekunde (Standard 60). Scrollen beschleunigt kurz, Richtung folgt dem Scrollen.
// Läuft nur, solange es im Bild ist.
export function initMarquee() {
  const cleanups = gsap.utils.toArray('[data-marquee]').map((el) => {
    const inner = el.firstElementChild;
    if (!inner) return () => {};
    const clone = inner.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    el.append(clone);

    const speed = parseFloat(el.dataset.marqueeSpeed) || 60;
    const loop = gsap.to([inner, clone], {
      xPercent: -100,
      duration: () => inner.offsetWidth / speed,
      ease: 'none',
      repeat: -1,
      paused: true,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        gsap.to(loop, { timeScale: boost || 1, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 0.8, delay: 0.2 });
      },
    });

    return () => {
      st.kill();
      loop.kill();
      clone.remove();
    };
  });
  return () => cleanups.forEach((c) => c());
}
