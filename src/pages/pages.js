// Invitation pages (swipe deck). All text is real HTML text over the embroidered background photo.
import { config } from '../config.js';
import { arch, divider, icon, lantern, monogram, rings } from '../lib/art.js';
import { createCountdown } from '../lib/countdown.js';
import { $, $$, dateLineHtml, dateParts, esc, mapsUrl } from '../lib/dom.js';
import { E, play, rand, spring, vibrate } from '../lib/anim.js';
import { sparkBurst, twinkles } from '../lib/fx.js';

const T = config.text;
const INV = config.invitation;
const bride = esc(config.bride.name);
const groom = esc(config.groom.name);

// Splits a multi-line config string (uses \n) into HTML lines, each part HTML-escaped.
const lines = (s) => (s || '').split('\n').map(esc).join('<br>');

const bg = () => '<div class="sheet-bg" aria-hidden="true"></div><div class="bg-sparkles" aria-hidden="true"></div>';
const orn = (cls = '') => `<div class="orn ${cls}" data-r>${divider}</div>`;

function namesPage(variant) {
  const isReception = variant === 'reception';
  // Reception card shows groom first, Nikkah card shows bride first
  const intro = isReception && INV.blessingsIntroReception ? INV.blessingsIntroReception : INV.blessingsIntro;
  const firstName = isReception ? groom : bride;
  const firstDetails = isReception ? (INV.groomParentsReception || INV.groomParents) : INV.brideDetails;
  const firstDetailsClass = isReception ? 'groom-parents' : 'bride-parents';
  const secondName = isReception ? bride : groom;
  const secondDetails = isReception ? (INV.brideDetailsReception || INV.brideDetails) : INV.groomParents;
  const secondDetailsClass = isReception ? 'bride-parents' : 'groom-parents';
  const joiner = isReception && INV.joinerReception ? INV.joinerReception : INV.joiner;
  return `
  <div class="sheet sheet--names">
    ${bg()}
    <div class="names-arch">
      ${arch}
      <div class="arch-content">
        <p class="bismillah" lang="ar" dir="rtl" data-r>${INV.ayah ? esc(INV.ayah) : '&#xFDFD;'}</p>
        <p class="meaning" data-r>${esc(INV.bismillahMeaning)}</p>
        ${orn('orn--sm')}
        ${intro ? `<p class="blessings-intro" data-r>${esc(intro)}</p>` : ''}
        ${INV.blessings ? `<p class="blessings" data-r>${esc(INV.blessings)}</p>` : ''}
        ${INV.hosts || INV.hostsLine ? `${orn('orn--sm')}${INV.hosts ? `<p class="hosts" data-r>${esc(INV.hosts)}</p>` : ''}${INV.hostsLine ? `<p class="hosts-line" data-r>${esc(INV.hostsLine)}</p>` : ''}` : ''}
        <h1 class="name" data-w><span class="shimmer">${firstName}</span></h1>
        ${firstDetails ? `<p class="${firstDetailsClass}" data-r>${lines(firstDetails)}</p>` : ''}
        <p class="joiner" data-r><span>${esc(joiner)}</span></p>
        <p class="name" data-w><span class="shimmer">${secondName}</span></p>
        ${orn('orn--sm')}
        <p class="${secondDetailsClass}" data-r>${lines(secondDetails)}</p>
      </div>
    </div>
    <p class="swipe-hint" data-r aria-hidden="true">
      <span class="swipe-chev">${icon.chevron}${icon.chevron}</span>
      <span>Swipe to open the invitation</span>
    </p>
  </div>`;
}

function datePage(event) {
  const p = dateParts(event.start);
  return `
  <div class="sheet sheet--date">
    ${bg()}
    <div class="date-glow" aria-hidden="true"></div>
    <div class="stack">
      <div class="tap-icon" data-r aria-hidden="true">${icon.tap}</div>
      <p class="script-title date-title" data-w>
        <span class="t-before"><span class="foil-rose">${esc(T.revealTitle)}</span></span>
        <span class="t-after" aria-hidden="true"><span class="foil-rose">${esc(T.revealedTitle)}</span></span>
      </p>
      ${orn()}
      <button class="date-card" type="button" data-r aria-label="${esc(T.revealTitle)}">
        <span class="date-face">
          <span class="d-cal">${icon.calendar}</span>
          <span class="d-weekday">${esc(p.weekday)},</span>
          <span class="d-date">${dateLineHtml(p)}</span>
          <span class="orn orn--xs">${divider}</span>
          <span class="d-insha">${esc(T.inshallah)}</span>
        </span>
        <span class="veil" aria-hidden="true">
          <span class="veil-shimmer"></span>
          <span class="veil-sparkles"></span>
          <span class="veil-text">${esc(T.revealTitle)}</span>
          <span class="tap-dot"></span>
        </span>
        <span class="date-glint" aria-hidden="true"></span>
      </button>
      <div class="countdown-block" data-r>
        <p class="cd-title">${esc(T.countdownTitle)}</p>
        <div class="countdown" role="timer" aria-live="off"></div>
      </div>
    </div>
  </div>`;
}

function eventPage(event, kind) {
  const p = dateParts(event.start);
  const url = mapsUrl(event);
  const reception = kind === 'reception';
  return `
  <div class="sheet sheet--event sheet--${kind}">
    ${bg()}
    ${reception ? `<div class="bokeh" aria-hidden="true"></div><div class="lanterns" aria-hidden="true">${lantern('l1')}${lantern('l2')}${lantern('l3')}</div>` : ''}
    <div class="stack stack--event">
      ${reception ? '' : `<button class="rings-btn" type="button" data-r aria-label="Tap the rings">${rings}<span class="rings-pulse" aria-hidden="true"></span></button>`}
      ${event.eyebrow ? `<p class="eyebrow" data-r>${esc(event.eyebrow)}</p>` : ''}
      <h2 class="script-title script-title--xl" data-w><span class="foil-rose">${esc(event.title)}</span></h2>
      ${event.subtitle ? `<p class="event-sub" data-r>${esc(event.subtitle)}</p>` : ''}
      ${orn()}
      <ul class="details">
        <li data-r>${icon.calendar}<span class="det"><em>${esc(event.dayText)}</em><strong>${dateLineHtml(p)}</strong>${event.hijri ? `<em>${esc(event.hijri)}</em>` : ''}</span></li>
        <li data-r>${icon.clock}<span class="det"><em>${esc(event.timeText)}</em></span></li>
        <li data-r>${icon.pin}<span class="det"><strong>${esc(event.venuePrefix)} ${esc(event.venue)}</strong>${[].concat(event.address).map((a) => `<span>${esc(a)}</span>`).join('')}</span></li>
      </ul>
      ${orn()}
      ${url ? `<a class="map-btn" data-r href="${esc(url)}" target="_blank" rel="noopener" aria-label="Open the ${esc(event.title)} venue in Google Maps">${icon.pin}<span>Open in Maps</span></a>` : ''}
    </div>
  </div>`;
}

function closingPage(variant) {
  const isReception = variant === 'reception';
  const familiesRaw = variant === 'reception' && config.familiesReception
    ? config.familiesReception
    : config.families;
  const closingText = isReception && config.text.closingReception ? config.text.closingReception : T.closing;
  const complimentsText = isReception && config.text.complimentsReception ? config.text.complimentsReception : T.compliments;
  return `
  <div class="sheet sheet--closing">
    ${bg()}
    <div class="closing-rays" aria-hidden="true"></div>
    <div class="stack">
      <div class="closing-mono" data-r>${monogram('mono-gold')}</div>
      <p class="eyebrow" data-r>${esc(T.closingKicker)}</p>
      ${orn()}
      <p class="closing-text" data-r>${esc(closingText)}</p>
      ${orn()}
      <p class="compliments" data-r>${esc(complimentsText)}</p>
      ${orn()}
      <p class="closing-family" data-w>${lines(familiesRaw)}</p>
      <button class="replay" type="button" data-r>${icon.replay}<span>Watch again</span></button>
    </div>
  </div>`;
}

// Inner gold border of the arch artwork (viewBox 300 x 500): its left edge x for a given y, sampled from the
// two curves of the dome; below y=182 the sides are straight at x=21.
const DOME = (() => {
  const bez = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
  const pts = [];
  [
    [21, 182, 21, 126, 58, 97, 100, 76],
    [100, 76, 125, 63, 142, 49, 150, 31],
  ].forEach(([x0, y0, x1, y1, x2, y2, x3, y3]) => {
    for (let i = 0; i <= 24; i++) pts.push([bez(y0, y1, y2, y3, i / 24), bez(x0, x1, x2, x3, i / 24)]);
  });
  return pts.sort((p, q) => p[0] - q[0]);
})();

function borderX(y) {
  if (y >= 182) return 21;
  if (y <= DOME[0][0]) return 150;
  const i = DOME.findIndex((p) => p[0] >= y);
  const [ya, xa] = DOME[i - 1];
  const [yb, xb] = DOME[i];
  return xa + ((xb - xa) * (y - ya)) / (yb - ya);
}

function lineRects(node) {
  if (node.matches('.orn, .joiner')) return [node.getBoundingClientRect()];
  const rects = [];
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walk.nextNode()) {
    if (!walk.currentNode.data.trim()) continue;
    range.selectNodeContents(walk.currentNode);
    rects.push(...range.getClientRects());
  }
  return rects;
}

// Shrinks the arch text (CSS --k) just enough that every line sits inside the arch's inner border,
// clear of the dome's curve and the bottom edge, on any screen size.
export function fitArch(root) {
  $$('.names-arch', root).forEach((box) => {
    const content = $('.arch-content', box);
    const fits = () => {
      const A = box.getBoundingClientRect();
      if (!A.width) return true;
      const sx = 300 / A.width;
      const sy = 500 / A.height;
      return [...content.children].every((node) =>
        lineRects(node).every((r) => {
          const top = (r.top - A.top) * sy;
          const bottom = (r.bottom - A.top) * sy;
          const edge = borderX(top) + 9;
          return bottom <= 470 && (r.left - A.left) * sx >= edge && (r.right - A.left) * sx <= 300 - edge;
        }),
      );
    };
    content.style.setProperty('--k', '1');
    if (fits()) return;
    let lo = 0.6;
    let hi = 1;
    for (let i = 0; i < 7; i++) {
      const k = (lo + hi) / 2;
      content.style.setProperty('--k', String(k));
      if (fits()) lo = k;
      else hi = k;
    }
    content.style.setProperty('--k', lo.toFixed(3));
  });
}

export function pageList(variant) {
  const pages = [
    { id: 'names', label: 'Invitation', html: namesPage(variant) },
    { id: 'date', label: 'Save the date', html: datePage(variant === 'reception' ? config.reception : config.nikah) },
  ];
  if (variant !== 'reception') pages.push({ id: 'nikah', label: 'Nikah', html: eventPage(config.nikah, 'nikah') });
  pages.push({ id: 'reception', label: 'Reception', html: eventPage(config.reception, 'reception') });
  pages.push({ id: 'closing', label: 'With love', html: closingPage(variant) });
  return pages;
}

const WRITE = { duration: 1600, easing: 'cubic-bezier(.45,.05,.25,1)' };
const write = (node, delay) =>
  play(node, [{ clipPath: 'inset(-30% 104% -30% -14%)' }, { clipPath: 'inset(-30% -14% -30% -14%)' }], { ...WRITE, delay, fill: 'backwards' });

// The first time a page is shown its content arrives in a choreographed sequence.
export function revealPage(page, { reduced, delay = 0 } = {}) {
  if (page.dataset.revealed) return;
  page.dataset.revealed = '1';
  page.classList.add('is-revealed');
  const pop = spring({ stiffness: 220, damping: 13 });
  $$('[data-r], [data-w]', page).forEach((node, i) => {
    const d = delay + i * 95;
    if (reduced) {
      play(node, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: d, fill: 'backwards' });
      return;
    }
    if (node.hasAttribute('data-w')) {
      write(node, d);
      return;
    }
    if (node.classList.contains('orn')) {
      play(node, [{ clipPath: 'inset(0 50% 0 50%)', opacity: 0.4 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], { duration: 1100, delay: d, easing: E.out, fill: 'backwards' });
      return;
    }
    play(node, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: d, easing: E.out, fill: 'backwards' });
    const svg = node.matches('li') && $('svg', node);
    if (svg) play(svg, [{ transform: 'scale(.3) rotate(-25deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: pop.duration, delay: d + 220, easing: pop.easing, fill: 'backwards' });
  });
}

export function setupPages(root, { variant, petals, reduced, onReplay }) {
  const hooks = {};

  // gold glints over the embroidered flowers (top garland and bottom posies)
  if (!reduced) {
    $$('.bg-sparkles', root).forEach((layer) => {
      twinkles(layer, 4, { x: [8, 92], y: [2, 13], size: [7, 13] });
      twinkles(layer, 4, { x: [8, 92], y: [86, 97], size: [7, 13] });
    });
  }

  // Date: tap to reveal, title turns into "Save the Date", petals burst, countdown rolls
  const date = $('[data-page="date"]', root);
  if (date) {
    const event = variant === 'reception' ? config.reception : config.nikah;
    const cd = createCountdown($('.countdown', date), event.start, { doneText: T.countdownDone, label: `until the ${event.title}`, reduced });
    const card = $('.date-card', date);
    const veil = $('.veil', card);
    const face = $('.date-face', card);
    const glint = $('.date-glint', card);
    const title = $('.date-title', date);
    if (!reduced) twinkles($('.veil-sparkles', card), 9, { x: [10, 90], y: [16, 84], size: [5, 10] });
    let revealed = false;
    card.addEventListener('click', () => {
      if (revealed) return;
      revealed = true;
      card.classList.add('is-open');
      card.setAttribute('aria-label', face.textContent.replace(/\s+/g, ' ').trim());
      $('.t-after', title).removeAttribute('aria-hidden');
      $('.t-before', title).setAttribute('aria-hidden', 'true');
      vibrate(35);
      const before = $('.t-before', title);
      const after = $('.t-after', title);
      const tapIcon = $('.tap-icon', date);
      if (reduced) {
        [veil, before, tapIcon].forEach((n) => play(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }));
        play(after, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
        play(face, [{ filter: 'blur(6px)', opacity: 0.5 }, { filter: 'blur(0)', opacity: 1 }], { duration: 500 });
        return;
      }
      const dur = 1500;
      play($('.tap-dot', veil), [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.4)' }], { duration: 320, easing: E.in });
      play($('.veil-text', veil), [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      play(veil, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: dur, delay: 120, easing: E.inOutSoft });
      play(glint, [{ left: '0%', opacity: 0 }, { left: '8%', opacity: 1, offset: 0.08 }, { left: '92%', opacity: 1, offset: 0.9 }, { left: '100%', opacity: 0 }], {
        duration: dur,
        delay: 120,
        easing: E.inOutSoft,
      });
      play(face, [{ filter: 'blur(7px)', opacity: 0.35, transform: 'scale(.97)' }, { filter: 'blur(0)', opacity: 1, transform: 'scale(1)' }], {
        duration: dur * 0.9,
        delay: 300,
        easing: E.out,
      });
      play(tapIcon, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px) scale(.8)' }], { duration: 500, easing: E.in });
      play(before, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(4px)' }], { duration: 500, easing: E.in });
      after.style.opacity = '1';
      write(after, 420);
      play($('.date-glow', date), [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1.05)', offset: 0.45 }, { opacity: 0.55, transform: 'scale(1)' }], {
        duration: 2600,
        delay: 500,
        easing: E.outSoft,
      });
      setTimeout(() => {
        const r = card.getBoundingClientRect();
        sparkBurst(card, 50, 50, { count: 18, reach: [0.25, 0.6], size: [8, 16] });
        const y = r.top + r.height * 0.8;
        petals.burst({ x: -10, y: y + 60, angle: -58, spread: 40, count: 36 });
        petals.burst({ x: innerWidth + 10, y: y + 60, angle: -122, spread: 40, count: 36 });
      }, 900);
    });
    hooks.date = { enter: () => cd.setActive(true), leave: () => cd.setActive(false) };
  }

  // Nikah: the rings answer a tap with a little clink, sparkles and petals
  const ringsBtn = $('.rings-btn', root);
  ringsBtn?.addEventListener('click', () => {
    vibrate(20);
    play($('.rings', ringsBtn), [
      { transform: 'none' },
      { transform: 'rotate(-12deg) scale(1.1)', offset: 0.22 },
      { transform: 'rotate(9deg) scale(1.05)', offset: 0.48 },
      { transform: 'rotate(-4deg)', offset: 0.74 },
      { transform: 'none' },
    ], { duration: 1000, easing: 'ease-out', fill: 'none' });
    sparkBurst(ringsBtn, 61, 34, { count: 16, reach: [0.25, 0.7], size: [7, 14] });
    const r = ringsBtn.getBoundingClientRect();
    petals.burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, angle: -90, spread: 160, count: 14, speed: [260, 520] });
  });

  // Reception: warm bokeh drifting up like lantern light
  const bokeh = $('.bokeh', root);
  if (bokeh && !reduced) {
    for (let k = 0; k < 14; k++) {
      const i = document.createElement('i');
      i.style.left = `${rand(6, 94).toFixed(1)}%`;
      i.style.setProperty('--s', `${rand(2.2, 5.5).toFixed(2)}cqw`);
      i.style.animationDuration = `${rand(8, 14).toFixed(1)}s`;
      i.style.animationDelay = `${(-rand(0, 14)).toFixed(1)}s`;
      bokeh.appendChild(i);
    }
  }
  $$('.lantern .flame', root).forEach((fl) => (fl.style.animationDelay = `${rand(-3, 0).toFixed(2)}s`));

  $('.replay', root)?.addEventListener('click', onReplay);
  return hooks;
}
