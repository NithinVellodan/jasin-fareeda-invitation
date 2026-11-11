import { config } from './config.js';
import { DEFS, PATTERN_URL, icon } from './lib/art.js';
import { $, $$, el, esc } from './lib/dom.js';
import { E, finished, play, reducedMotion as reduced, wait } from './lib/anim.js';
import { Music } from './lib/audio.js';
import { Petals } from './lib/petals.js';
import { sparkBurst } from './lib/fx.js';
import { flyInto, loadAssets, revealStage } from './scenes/loader.js';
import { createFlowers } from './scenes/flowers.js';
import { createGate } from './scenes/gate.js';
import { createDeck } from './deck/deck.js';
import { fitArch, pageList, revealPage, setupPages } from './pages/pages.js';

const variant =
  document.documentElement.dataset.variant === 'reception' || /^\/reception\/?$/.test(window.location.pathname) ? 'reception' : 'full';
const replayed = sessionStorage.getItem('rr-replay') === '1';
sessionStorage.removeItem('rr-replay');
if (replayed) $('#loader')?.classList.add('quick');

document.documentElement.style.setProperty('--pattern', PATTERN_URL);
document.body.insertAdjacentHTML('afterbegin', DEFS);

const pages = pageList(variant);
const couple = `${config.bride.name} and ${config.groom.name}`;
document.body.appendChild(
  el(`<div id="app">
  <div id="backdrop" aria-hidden="true"></div>
  <main id="deck" aria-roledescription="carousel" aria-label="${esc(`Wedding invitation of ${couple}`)}">
    ${pages
      .map(
        (p, i) => `<section class="page" data-page="${p.id}" aria-roledescription="slide" aria-label="${i + 1} of ${pages.length}: ${esc(p.label)}">
      ${p.html}<div class="shade" aria-hidden="true"></div></section>`,
      )
      .join('')}
  </main>
  <div id="tapfx" aria-hidden="true"></div>
  <nav class="deck-nav" aria-label="Invitation pages">
    <button class="nav-btn nav-prev" type="button" aria-label="Previous page">${icon.chevron}</button>
    <div class="dots">${pages.map((p, i) => `<button class="dot" type="button" aria-label="Page ${i + 1}: ${esc(p.label)}"></button>`).join('')}</div>
    <button class="nav-btn nav-next" type="button" aria-label="Next page">${icon.chevron}</button>
  </nav>
  <button id="music" type="button" aria-label="Mute music" aria-pressed="false" hidden><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>
  <div id="intro">
    <section class="scene scene--gate" aria-hidden="true"></section>
    <section class="scene scene--flowers" aria-hidden="true"></section>
  </div>
  <canvas id="petals" aria-hidden="true"></canvas>
  <div id="fade" aria-hidden="true"></div>
  <div id="rotate" aria-hidden="true"><p>Please turn your phone upright</p></div>
</div>`),
);

const deckEl = $('#deck');
const pageEls = $$('.page', deckEl);
const nav = $('.deck-nav');
const dots = $$('.dot', nav);
const prevBtn = $('.nav-prev', nav);
const nextBtn = $('.nav-next', nav);
const musicBtn = $('#music');

const petals = new Petals($('#petals'), { reduced });
const music = new Music(config.music);
music.onChange((m) => {
  musicBtn.classList.toggle('is-playing', m.playing);
  musicBtn.setAttribute('aria-pressed', String(!m.playing));
  musicBtn.setAttribute('aria-label', m.playing ? 'Mute music' : 'Play music');
  if (!m.available) musicBtn.hidden = true;
});
musicBtn.addEventListener('click', () => {
  // the press that just started the song must not also mute it
  if (performance.now() - musicStartedAt > 500) music.toggle();
});

function replay() {
  play($('#fade'), [{ opacity: 0 }, { opacity: 1 }], { duration: 850, easing: E.inOutSoft }).finished.then(() => {
    sessionStorage.setItem('rr-replay', '1');
    window.location.reload();
  });
}

const hooks = setupPages(deckEl, { variant, petals, reduced, onReplay: replay });
let interacted = false;

function onPage(i) {
  dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === pages.length - 1;
  for (const [id, h] of Object.entries(hooks)) (pages[i].id === id ? h.enter : h.leave)?.();
  if (i > 0) {
    interacted = true;
    document.body.classList.add('has-turned');
  }
}

const deck = createDeck(deckEl, pageEls, {
  reduced,
  onTurnStart: (i) => revealPage(pageEls[i], { reduced }),
  onChange: onPage,
});
onPage(0);
prevBtn.addEventListener('click', () => deck.prev());
nextBtn.addEventListener('click', () => deck.next());
dots.forEach((d, i) => d.addEventListener('click', () => deck.go(i)));

// A tap anywhere on a page leaves a small spray of gold glints and petals.
const tapfx = $('#tapfx');
let press = null;
deckEl.addEventListener('pointerdown', (e) => (press = { x: e.clientX, y: e.clientY, t: e.timeStamp }));
deckEl.addEventListener('pointerup', (e) => {
  const p = press;
  press = null;
  if (!p || reduced || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10 || e.timeStamp - p.t > 600) return;
  sparkBurst(tapfx, (e.clientX / innerWidth) * 100, (e.clientY / innerHeight) * 100, { count: 9, reach: [0.025, 0.08], size: [7, 13] });
  petals.burst({ x: e.clientX, y: e.clientY, angle: -90, spread: 150, count: 4, speed: [150, 320] });
});

const flowers = createFlowers($('.scene--flowers'), { reduced, petals });
const gate = createGate($('.scene--gate'), { reduced, petals, hint: config.text.sealHint });

// Browsers only allow sound after a touch, so the song starts on the guest's first tap or swipe.
let musicStartedAt = 0;
function startMusic() {
  if (music.started || !music.available) return;
  music.start();
  musicStartedAt = performance.now();
  if (musicBtn.hidden) {
    musicBtn.hidden = false;
    requestAnimationFrame(() => musicBtn.classList.add('is-visible'));
  }
}
['pointerup', 'touchend', 'keydown'].forEach((type) => window.addEventListener(type, startMusic, { passive: true }));

async function invitePeeks() {
  deckEl.addEventListener('pointerdown', () => (interacted = true), { once: true });
  await wait(2800);
  while (!interacted && deck.index === 0) {
    await deck.peek();
    await wait(5200);
  }
}

async function run() {
  await loadAssets({ music, quick: replayed, reduced });
  fitArch(deckEl);
  let fitTimer;
  window.addEventListener('resize', () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => fitArch(deckEl), 150);
  });
  document.fonts?.addEventListener('loadingdone', () => fitArch(deckEl));
  petals.setCount(reduced ? 3 : 8);
  petals.start();
  await revealStage({ reduced });
  await flowers.bloom();
  await wait(reduced ? 100 : 500);

  const target = gate.sealRect();
  petals.setCount(reduced ? 4 : 16);
  gate.reveal(1400);
  flowers.part(1400);
  await flyInto(target, { reduced, onLand: () => gate.popSeal() });
  await gate.waitForTap(startMusic);

  document.body.classList.remove('intro-playing');
  await gate.open(() => {
    revealPage(pageEls[0], { reduced, delay: 450 });
    if (!reduced) play(pageEls[0], [{ transform: 'scale(1.07)' }, { transform: 'none' }], { duration: 2400, easing: E.out, fill: 'none' });
  });
  $('#intro').remove();
  deck.unlock();
  nav.classList.add('is-visible');
  invitePeeks();
}

run().catch(async (err) => {
  // Never leave a guest stuck on the intro: drop straight to the pages.
  console.error(err);
  $('#loader')?.remove();
  $('#intro')?.remove();
  document.body.classList.remove('intro-playing');
  fitArch(deckEl);
  revealPage(pageEls[0], { reduced: true });
  deck.unlock();
  nav.classList.add('is-visible');
  await finished(play(deckEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'none' }));
});
