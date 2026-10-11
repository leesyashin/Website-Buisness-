import { gsap } from 'gsap';

// Terminanfrage in drei Schritten – rein im Browser, ohne Server (Beispielseite).
// Ohne JavaScript ist es ein normales Formular mit allen Fragen untereinander; mit JavaScript eine Frage pro Schritt,
// Fokus wandert zum neuen Schritt, der Fortschritt wird vorgelesen (aria-live).

export function initTermin(form, { reduced }) {
  const steps = Array.from(form.querySelectorAll('[data-step]'));
  const progress = form.querySelector('[data-progress]');
  const error = form.querySelector('[data-error]');
  const done = form.querySelector('[data-done]');
  const painHint = form.querySelector('[data-pain-hint]');
  let current = 0;

  form.classList.add('is-stepped');

  const show = (i, { dir = 1, focus = true } = {}) => {
    current = i;
    steps.forEach((s, k) => (s.hidden = k !== i));
    progress.textContent = `Schritt ${i + 1} von ${steps.length}`;
    form.style.setProperty('--progress', (i + 1) / steps.length);
    if (!reduced && focus) gsap.from(steps[i], { x: 28 * dir, autoAlpha: 0, duration: 0.6, ease: 'expo.out' });
    if (focus) steps[i].focus({ preventScroll: true });
  };

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) show(Math.min(current + 1, steps.length - 1));
    if (e.target.closest('[data-back]')) show(Math.max(current - 1, 0), { dir: -1 });
  });

  // Schmerzen: lieber anrufen
  form.addEventListener('change', (e) => {
    if (e.target.name === 'anliegen') painHint.hidden = !e.target.matches('[data-pain-choice]');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const tel = String(data.get('tel') || '').trim();
    error.hidden = !!(name && tel);
    if (!name || !tel) {
      form.elements[name ? 'tel' : 'name'].focus();
      return;
    }
    const days = data.getAll('tag').join(', ') || 'jeder Tag';
    const times = data.getAll('zeit').join(', ') || 'jede Uhrzeit';
    form.querySelector('[data-done-title]').textContent = `Danke, ${name}.`;
    form.querySelector('[data-done-line]').textContent =
      `${data.get('anliegen')} · ${days} · ${times}. Wir rufen Sie unter ${tel} innerhalb eines Werktags zurück, meist am Vormittag.`;
    steps.forEach((s) => (s.hidden = true));
    progress.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    if (!reduced) {
      const path = done.querySelector('path');
      const len = path.getTotalLength();
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: 'signature', delay: 0.2 });
      gsap.from(done, { y: 20, autoAlpha: 0, duration: 0.6, ease: 'expo.out' });
    }
  });

  show(0, { focus: false });
}
