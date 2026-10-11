import { gsap } from 'gsap';

// [data-stack]    Behälter für Slides. Jede Slide klebt oben (position: sticky im CSS), die nächste schiebt sich darüber,
//                 die vorige tritt zurück: wird kleiner und dunkler (schwarze Ebene statt Filter – günstiger beim Scrollen).
export function initStack() {
  gsap.utils.toArray('[data-stack]').forEach((stack) => {
    const slides = Array.from(stack.children);
    slides.slice(0, -1).forEach((slide, i) => {
      const shade = slide.querySelector('.stack-shade') || slide.appendChild(Object.assign(document.createElement('div'), { className: 'stack-shade' }));
      gsap
        .timeline({ scrollTrigger: { trigger: slides[i + 1], start: 'top bottom', end: 'top top', scrub: true } })
        .to(slide.firstElementChild, { scale: 0.9, yPercent: -4, ease: 'none' }, 0)
        .to(shade, { opacity: 0.55, ease: 'none' }, 0);
    });
  });
}
