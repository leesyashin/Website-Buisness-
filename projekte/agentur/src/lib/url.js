// „www.beispiel.de“ → „https://www.beispiel.de/“; ungültige Eingaben → ''
export function normUrl(raw) {
  let s = (raw || '').trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (!u.hostname.includes('.') || u.hostname.endsWith('.')) return '';
    return u.href;
  } catch {
    return '';
  }
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
