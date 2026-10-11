import { gsap } from 'gsap';

// [data-magnetic]   Knopf folgt dem Mauszeiger leicht (nur Maus/Trackpad, nicht Touch).
// [data-magnetic="0.4"] Stärke, Standard 0.3
export function initMagnetic() {
  const cleanups = gsap.utils.toArray('[data-magnetic]').map((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  });
  return () => cleanups.forEach((c) => c());
}
