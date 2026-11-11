// Countdown with rolling digits (old digit slides up, the new one rises in).
import { esc } from './dom.js';

const UNITS = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
];

function split(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export function createCountdown(root, targetIso, { doneText, label, reduced }) {
  const target = new Date(targetIso).getTime();
  const cells = {};
  let active = false;
  let finished = false;
  root.innerHTML = UNITS.map(
    ([k, l]) => `<div class="cd-unit"><div class="cd-num" data-k="${k}" aria-hidden="true"></div><div class="cd-label">${l}</div></div>`,
  ).join('');
  for (const [k] of UNITS) cells[k] = { el: root.querySelector(`[data-k="${k}"]`), digits: [] };

  function setValue(cell, str, animate) {
    if (cell.digits.length !== str.length) {
      cell.el.innerHTML = '';
      cell.digits = [...str].map((ch) => {
        const span = document.createElement('span');
        span.className = 'd';
        span.innerHTML = `<b>${ch}</b>`;
        cell.el.appendChild(span);
        return { span, value: ch };
      });
      return;
    }
    [...str].forEach((ch, i) => {
      const d = cell.digits[i];
      if (d.value === ch) return;
      d.value = ch;
      if (!animate) {
        d.span.innerHTML = `<b>${ch}</b>`;
        return;
      }
      while (d.span.children.length > 1) d.span.firstElementChild.remove();
      const old = d.span.firstElementChild;
      const next = document.createElement('b');
      next.className = 'next';
      next.textContent = ch;
      d.span.appendChild(next);
      const opts = { duration: 620, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' };
      old.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], opts).finished.then(
        () => old.remove(),
        () => {},
      );
      next.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], opts).finished.then(
        () => next.classList.remove('next'),
        () => {},
      );
    });
  }

  function tick(animate) {
    const left = target - Date.now();
    if (left <= 0) {
      if (!finished) {
        finished = true;
        root.innerHTML = `<p class="cd-done">${esc(doneText)}</p>`;
        root.setAttribute('aria-label', doneText);
      }
      return;
    }
    const v = split(left);
    for (const [k] of UNITS) setValue(cells[k], String(v[k]).padStart(2, '0'), animate && active && !reduced && !document.hidden);
    root.setAttribute('aria-label', `${v.days} days, ${v.hours} hours, ${v.minutes} minutes ${label}`);
  }

  tick(false);
  const align = () =>
    setTimeout(() => {
      tick(true);
      if (!finished) align();
    }, 1000 - (Date.now() % 1000) + 5);
  if (!finished) align();

  return {
    setActive(on) {
      active = on;
    },
  };
}
