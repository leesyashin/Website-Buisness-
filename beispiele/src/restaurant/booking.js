import { gsap } from 'gsap';

// Tischreservierung mit Zeitslots – rein im Browser, ohne Server (Beispielseite).
// In echt würde loadSlots() die freien Tische von einem Reservierungssystem holen.

// Öffnungszeiten je Wochentag (0 = Sonntag): Mittag- und Abendservice, null = geschlossen
const HOURS = {
  0: { mittag: ['11:30', '14:00'], abend: null },
  1: { mittag: null, abend: null },
  2: { mittag: ['11:30', '13:30'], abend: ['17:30', '21:30'] },
  3: { mittag: ['11:30', '13:30'], abend: ['17:30', '21:30'] },
  4: { mittag: ['11:30', '13:30'], abend: ['17:30', '21:30'] },
  5: { mittag: ['11:30', '13:30'], abend: ['17:30', '21:30'] },
  6: { mittag: null, abend: ['17:30', '21:30'] },
};
const DAYS_AHEAD = 14;

export function initBooking(form, { reduced, getService, setService }) {
  const daysEl = form.querySelector('[data-days]');
  const slotsEl = form.querySelector('[data-slots]');
  const hint = form.querySelector('[data-slots-hint]');
  const summary = form.querySelector('[data-summary]');
  const summaryLine = form.querySelector('[data-summary-line]');
  const done = form.querySelector('[data-done]');
  const partyOut = form.querySelector('[data-party-out]');
  const error = form.querySelector('[data-error]');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const state = { day: null, party: 2, time: null };

  // ---------- Tage
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const fmtDay = (d, i) =>
    i === 0 ? 'Heute' : i === 1 ? 'Morgen' : d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
  daysEl.innerHTML = days
    .map((d, i) => {
      const closed = !HOURS[d.getDay()].mittag && !HOURS[d.getDay()].abend;
      return `<button type="button" class="r-day" data-day="${i}" ${closed ? 'disabled' : ''} aria-pressed="false">
        <span>${fmtDay(d, i)}</span><strong>${d.getDate()}.</strong><small>${closed ? 'Ruhetag' : d.toLocaleDateString('de-DE', { month: 'short' })}</small>
      </button>`;
    })
    .join('');
  state.day = days.findIndex((d) => HOURS[d.getDay()].mittag || HOURS[d.getDay()].abend);

  // ---------- Verfügbarkeit: deterministisch aus Datum, Uhrzeit und Gruppengröße (Platzhalter für echte Daten)
  const tablesLeft = (date, time, party) => {
    const key = `${date.toISOString().slice(0, 10)}-${time}`;
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const base = h % 5; // 0–4 Tische frei
    return Math.max(0, base - Math.floor((party - 1) / 3));
  };

  const slotsFor = (date, service) => {
    const range = HOURS[date.getDay()][service];
    if (!range) return [];
    const [from, to] = range.map((t) => t.split(':').map(Number)).map(([h, m]) => h * 60 + m);
    const now = new Date();
    const out = [];
    for (let t = from; t <= to; t += 30) {
      const time = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
      const past = date.getTime() === today.getTime() && t <= now.getHours() * 60 + now.getMinutes() + 60;
      out.push({ time, past, left: past ? 0 : tablesLeft(date, time, state.party) });
    }
    return out;
  };

  // ---------- Zeichnen
  const renderDays = () =>
    daysEl.querySelectorAll('.r-day').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.day === state.day)));

  const renderSlots = () => {
    const date = days[state.day];
    const service = getService();
    const slots = slotsFor(date, service);
    if (!slots.some((s) => s.time === state.time && s.left > 0)) state.time = null;

    if (!slots.length) {
      const other = service === 'mittag' ? 'abend' : 'mittag';
      slotsEl.innerHTML = '';
      hint.innerHTML = HOURS[date.getDay()][other]
        ? `${service === 'mittag' ? 'Mittags' : 'Abends'} geschlossen. <button type="button" class="r-link" data-switch="${other}">${other === 'abend' ? 'Abendtische' : 'Mittagstische'} ansehen</button>`
        : 'An diesem Tag geschlossen.';
    } else {
      slotsEl.innerHTML = slots
        .map((s) => {
          const label = s.past ? 'vorbei' : s.left === 0 ? 'ausgebucht' : s.left === 1 ? 'noch 1 Tisch' : 'frei';
          return `<button type="button" class="r-slot" data-time="${s.time}" ${s.left === 0 ? 'disabled' : ''} aria-pressed="${s.time === state.time}">
            <strong>${s.time}</strong><small>${label}</small></button>`;
        })
        .join('');
      const free = slots.filter((s) => s.left > 0).length;
      hint.textContent = free ? `${free} von ${slots.length} Zeiten frei für ${state.party} ${state.party === 1 ? 'Person' : 'Personen'}.` : 'Alles ausgebucht – probieren Sie einen anderen Tag.';
      if (!reduced) gsap.from(slotsEl.children, { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.025, ease: 'expo.out' });
    }
    renderSummary();
  };

  const renderSummary = () => {
    const show = !!state.time;
    if (show) {
      const date = days[state.day].toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
      summaryLine.textContent = `${date} · ${state.time} Uhr · ${state.party} ${state.party === 1 ? 'Person' : 'Personen'}`;
    }
    if (show === !summary.hidden) return;
    summary.hidden = !show;
    if (show && !reduced) gsap.from(summary, { y: 24, autoAlpha: 0, duration: 0.7, ease: 'signature' });
  };

  // ---------- Eingaben
  daysEl.addEventListener('click', (e) => {
    const b = e.target.closest('.r-day');
    if (!b || b.disabled) return;
    state.day = +b.dataset.day;
    const h = HOURS[days[state.day].getDay()];
    if (!h[getService()]) setService(h.mittag ? 'mittag' : 'abend');
    renderDays();
    renderSlots();
  });

  form.addEventListener('click', (e) => {
    const step = e.target.closest('[data-party]');
    if (step) {
      state.party = Math.min(8, Math.max(1, state.party + +step.dataset.party));
      partyOut.textContent = state.party;
      renderSlots();
    }
    const slot = e.target.closest('.r-slot');
    if (slot && !slot.disabled) {
      state.time = slot.dataset.time;
      slotsEl.querySelectorAll('.r-slot').forEach((s) => s.setAttribute('aria-pressed', String(s === slot)));
      renderSummary();
    }
    const sw = e.target.closest('[data-switch]');
    if (sw) setService(sw.dataset.switch);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const tel = form.elements.tel.value.trim();
    error.hidden = !!(name && tel);
    if (!name || !tel) return;
    form.querySelector('[data-done-line]').textContent = `${summaryLine.textContent} · auf den Namen ${name}.`;
    form.querySelectorAll('fieldset, [data-summary]').forEach((el) => (el.hidden = true));
    done.hidden = false;
    if (!reduced) {
      const path = done.querySelector('path');
      const len = path.getTotalLength();
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: 'signature', delay: 0.2 });
      gsap.from(done, { y: 20, autoAlpha: 0, duration: 0.6, ease: 'expo.out' });
    }
  });

  document.addEventListener('colorway', renderSlots);
  renderDays();
  renderSlots();
}
