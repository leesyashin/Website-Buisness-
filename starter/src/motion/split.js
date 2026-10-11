import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ease, enter } from './config.js';

// [data-split]              Überschrift steigt zeilenweise aus einer Maske (Standard: lines)
// [data-split="words"]      wortweise · [data-split="chars"] zeichenweise
// [data-split-now]          sofort beim Laden statt beim Hereinscrollen (Hero)
// autoSplit teilt bei Größenänderung und nach dem Laden der Schrift neu; der Screenreader liest
// weiterhin den ganzen Satz (SplitText setzt aria-label).
export function initSplit() {
  const splits = gsap.utils.toArray('[data-split]').map((el) => {
    const type = ['lines', 'words', 'chars'].includes(el.dataset.split) ? el.dataset.split : 'lines';
    const now = el.hasAttribute('data-split-now');

    return SplitText.create(el, {
      type: type === 'lines' ? 'lines' : `lines,${type}`,
      mask: 'lines',
      linesClass: 'split-line', // Maske heißt dann .split-line-mask (siehe base.css)
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self[type], {
          yPercent: 110,
          duration: type === 'chars' ? 0.9 : 1.1,
          ease: ease.out,
          stagger: type === 'chars' ? 0.015 : type === 'words' ? 0.04 : 0.09,
          delay: now ? 0.15 : 0,
          scrollTrigger: now ? undefined : { trigger: el, start: enter, once: true },
        });
      },
    });
  });

  return () => splits.forEach((s) => s.revert());
}
