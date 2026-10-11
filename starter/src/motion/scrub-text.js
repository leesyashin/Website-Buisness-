import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ease } from './config.js';

// [data-scrub-text]   Absatz hellt sich beim Scrollen Wort für Wort auf (an den Scrollweg gekoppelt)
export function initScrubText() {
  const splits = gsap.utils.toArray('[data-scrub-text]').map((el) =>
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.15 },
          {
            opacity: 1,
            ease: ease.none,
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        ),
    }),
  );
  return () => splits.forEach((s) => s.revert());
}
