import { config } from '../config.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// "10<sup>th</sup> December 2026"
export const dateLineHtml = (p) => `${p.day}<sup>${p.ordinal.slice(String(p.day).length)}</sup> ${p.month} ${p.year}`;

export function dateParts(iso) {
  const d = new Date(iso);
  const tz = config.timeZone;
  const get = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...opts }).format(d);
  const day = Number(get({ day: 'numeric' }));
  return {
    date: d,
    weekday: get({ weekday: 'long' }),
    day,
    ordinal: ordinal(day),
    month: get({ month: 'long' }),
    year: get({ year: 'numeric' }),
    time: new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(d),
  };
}

// Google Maps universal link: opens the Maps app on phones, the website elsewhere.
export function mapsUrl(event) {
  const m = event.map || {};
  if (m.url) return m.url;
  if (Number.isFinite(m.lat) && Number.isFinite(m.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;
  }
  const q = m.query || [event.venue, ...[].concat(event.address || [])].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}
