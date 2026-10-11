// Live-Öffnungsstatus für Praxen und Läden: „Jetzt geöffnet · bis 18 Uhr“, „Heute ab 8 Uhr“, „Montag ab 8 Uhr“.
// hours: { 0: [], 1: [[480, 1080]], … } – Wochentag (0 = Sonntag) → Zeitfenster in Minuten ab Mitternacht.
// Ohne JavaScript steht im HTML ein neutraler Text, die Tabelle der Öffnungszeiten ist ohnehin vollständig.

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const hhmm = (m) => (m % 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}` : `${m / 60}`);

export function openStatus(hours, now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = hours[now.getDay()] || [];
  const open = today.find(([a, b]) => mins >= a && mins < b);
  if (open) return { open: true, text: `Jetzt geöffnet · bis ${hhmm(open[1])} Uhr` };
  const later = today.find(([a]) => mins < a);
  if (later) return { open: false, text: `Heute ab ${hhmm(later[0])} Uhr geöffnet` };
  for (let i = 1; i <= 7; i++) {
    const day = (now.getDay() + i) % 7;
    if (hours[day]?.length) {
      return { open: false, text: `Geschlossen · ${i === 1 ? 'morgen' : DAYS[day]} ab ${hhmm(hours[day][0][0])} Uhr` };
    }
  }
  return { open: false, text: 'Geschlossen' };
}

// Statuszeile füllen (Klasse is-open für den grünen Punkt) und den heutigen Tag in der Tabelle markieren
export function showOpenStatus(hours, { status, table }) {
  const now = new Date();
  if (status) {
    const s = openStatus(hours, now);
    status.textContent = s.text;
    status.classList.toggle('is-open', s.open);
  }
  table?.querySelector(`tr[data-day="${now.getDay()}"]`)?.classList.add('is-today');
}
