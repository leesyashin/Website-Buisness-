// Laufzeit-Erkennung (window.*, DOM) und Bundle-Signaturen zusammenführen
export function libs(d) {
  const names = new Set(d.tech.motionLibs.map((n) => n.replace(/ [\d.]+$/, '')));
  (d.tech.bundledLibs || []).forEach((n) => names.add(n));
  if (d.motion.pinSpacers) names.add('ScrollTrigger');
  const gsapVersion = d.tech.motionLibs.find((n) => n.startsWith('GSAP '));
  return [...names].map((n) => (n === 'GSAP' && gsapVersion ? gsapVersion : n));
}
