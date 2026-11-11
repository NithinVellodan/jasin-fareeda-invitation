// Horizontal page deck: each page opens like a card (3D turn around its left edge).
// Swipe/drag, flick, arrow buttons, dots, mouse wheel and keyboard all drive the same turn.
import { clamp, ease, tween } from '../lib/anim.js';

const MAX = 104; // final angle of a turned page (just past edge-on)
const DEG = 180 / Math.PI;

export function createDeck(root, pages, { reduced, onChange, onTurnStart }) {
  let index = 0;
  let busy = false;
  let locked = true;
  let drag = null;
  let lastTurnEnd = 0;
  let peekToken = 0;
  let suppressClick = false;
  const shade = pages.map((p) => p.querySelector(':scope > .shade'));

  function rest() {
    pages.forEach((p, i) => {
      const cur = i === index;
      p.style.zIndex = cur ? '2' : '1';
      p.style.visibility = cur ? 'visible' : 'hidden';
      p.style.transformOrigin = '';
      p.style.transform = i < index ? `rotateY(${-MAX}deg)` : '';
      p.style.opacity = '';
      p.inert = !cur;
      p.setAttribute('aria-hidden', String(!cur));
      p.classList.toggle('is-current', cur);
      shade[i].style.opacity = '0';
    });
  }

  // Draw a turn: `top` is lifted by angle a (0 = flat, MAX = gone), revealing `under`.
  function draw(ti, ui, a) {
    const top = pages[ti];
    const under = pages[ui];
    const u = Math.min(1, a / 90);
    top.style.zIndex = '3';
    under.style.zIndex = '2';
    top.style.visibility = under.style.visibility = 'visible';
    top.style.transformOrigin = '0 50%';
    top.style.transform = `rotateY(${(-a).toFixed(2)}deg)`;
    under.style.transformOrigin = '50% 50%';
    under.style.transform = `scale(${(0.94 + 0.06 * u).toFixed(4)})`;
    shade[ti].dataset.role = 'top';
    shade[ti].style.opacity = (0.6 * Math.sin(u * Math.PI * 0.5)).toFixed(3);
    shade[ui].dataset.role = 'under';
    shade[ui].style.opacity = (0.45 * (1 - u)).toFixed(3);
  }

  // Lift the current page alone (end of the deck: it refuses to turn).
  function lift(i, a) {
    pages[i].style.transformOrigin = '0 50%';
    pages[i].style.transform = `rotateY(${(-a).toFixed(2)}deg)`;
    shade[i].dataset.role = 'top';
    shade[i].style.opacity = (0.6 * Math.sin(Math.min(1, a / 90) * Math.PI * 0.5)).toFixed(3);
  }

  function crossfade(ti, ui, fwd) {
    const top = pages[ti];
    const under = pages[ui];
    top.style.zIndex = '3';
    under.style.zIndex = '2';
    top.style.visibility = under.style.visibility = 'visible';
    return tween(450, ease.inOutSine, (k) => {
      top.style.opacity = String(fwd ? 1 - k : k);
    });
  }

  async function go(target, from = null) {
    if (target === index || target < 0 || target >= pages.length) return;
    peekToken++;
    busy = true;
    const fwd = target > index;
    const ti = fwd ? index : target;
    const ui = fwd ? target : index;
    onTurnStart?.(target);
    if (reduced) {
      await crossfade(ti, ui, fwd);
    } else {
      const a0 = from ?? (fwd ? 0 : MAX);
      const a1 = fwd ? MAX : 0;
      const manual = from !== null;
      const dur = manual ? clamp((Math.abs(a1 - a0) / MAX) * 950, 380, 900) : 1150;
      await tween(dur, manual ? ease.outCubic : ease.inOutCubic, (k) => draw(ti, ui, a0 + (a1 - a0) * k));
    }
    index = target;
    rest();
    busy = false;
    lastTurnEnd = performance.now();
    onChange?.(index);
  }

  async function settle(ti, ui, a, to) {
    busy = true;
    await tween(clamp((Math.abs(to - a) / MAX) * 700, 260, 600), ease.outCubic, (k) => draw(ti, ui, a + (to - a) * k));
    rest();
    busy = false;
  }

  /* ----- pointer drag ----- */

  const width = () => pages[index].getBoundingClientRect().width || innerWidth;

  root.addEventListener('pointerdown', (e) => {
    if (locked || busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
    peekToken++;
    drag = { x0: e.clientX, y0: e.clientY, id: e.pointerId, active: false, samples: [[e.timeStamp, e.clientX]] };
  });

  root.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.active) {
      if (Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        drag.active = true;
        drag.fwd = dx < 0;
        drag.edge = (drag.fwd && index === pages.length - 1) || (!drag.fwd && index === 0);
        drag.w = width();
        root.setPointerCapture?.(e.pointerId);
        root.classList.add('is-dragging');
      } else if (Math.abs(dy) > 14) {
        drag = null;
        return;
      } else return;
    }
    drag.samples.push([e.timeStamp, e.clientX]);
    if (drag.samples.length > 6) drag.samples.shift();
    const q = clamp((drag.fwd ? -dx : dx) / drag.w, 0, 1);
    if (reduced) return;
    if (drag.edge) {
      // resist at the ends: the card lifts a little, then refuses
      const a = 16 * (1 - Math.exp(-q * 3));
      if (drag.fwd) lift(index, a);
      else pages[index].style.transform = `translateX(${(18 * (1 - Math.exp(-q * 3))).toFixed(2)}px)`;
      drag.a = a;
      return;
    }
    drag.a = drag.fwd ? Math.acos(1 - q) * DEG : Math.acos(q) * DEG;
    if (drag.fwd) draw(index, index + 1, drag.a);
    else draw(index - 1, index, drag.a);
    if (!drag.started) {
      drag.started = true;
      onTurnStart?.(drag.fwd ? index + 1 : index - 1);
    }
  });

  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    root.classList.remove('is-dragging');
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 350);
    const dx = e.clientX - d.x0;
    const q = clamp((d.fwd ? -dx : dx) / d.w, 0, 1);
    const [t0, x0] = d.samples[0];
    const v = (e.clientX - x0) / Math.max(1, e.timeStamp - t0); // px per ms
    const flick = (d.fwd ? -v : v) > 0.45;
    if (d.edge) {
      if (d.fwd) {
        const a = d.a || 0;
        busy = true;
        tween(420, ease.outCubic, (k) => lift(index, a * (1 - k))).then(() => {
          rest();
          busy = false;
        });
      } else {
        const from = pages[index].style.transform;
        pages[index].style.transform = '';
        pages[index].animate([{ transform: from }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,.8,.24,1)' });
      }
      return;
    }
    const complete = e.type !== 'pointercancel' && (q > 0.33 || flick);
    if (reduced) {
      if (complete) go(d.fwd ? index + 1 : index - 1);
      return;
    }
    if (complete) go(d.fwd ? index + 1 : index - 1, d.a ?? (d.fwd ? 0 : 90));
    else if (d.fwd) settle(index, index + 1, d.a ?? 0, 0);
    else settle(index - 1, index, d.a ?? 90, MAX);
  }
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
  root.addEventListener(
    'click',
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );

  /* ----- wheel & keyboard ----- */

  let acc = 0;
  let accTimer = 0;
  root.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      if (locked || busy || performance.now() - lastTurnEnd < 450) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      acc += e.deltaMode === 1 ? d * 30 : d;
      clearTimeout(accTimer);
      accTimer = setTimeout(() => (acc = 0), 200);
      if (Math.abs(acc) > 60) {
        const dir = Math.sign(acc);
        acc = 0;
        go(index + dir);
      }
    },
    { passive: false },
  );

  document.addEventListener('keydown', (e) => {
    if (locked || busy || e.altKey || e.ctrlKey || e.metaKey) return;
    const next = ['ArrowRight', 'PageDown'].includes(e.key);
    const prev = ['ArrowLeft', 'PageUp'].includes(e.key);
    if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(pages.length - 1);
    else if (next || prev) {
      e.preventDefault();
      go(index + (next ? 1 : -1));
    }
  });

  rest();

  return {
    get index() {
      return index;
    },
    get count() {
      return pages.length;
    },
    unlock() {
      locked = false;
    },
    go: (i) => !locked && !busy && go(i),
    next: () => !locked && !busy && go(index + 1),
    prev: () => !locked && !busy && go(index - 1),
    // A small lift of the card's edge that invites the first swipe.
    async peek() {
      if (reduced || busy || locked || index !== 0) return;
      const token = ++peekToken;
      const alive = () => token === peekToken && !drag && !busy;
      await tween(1500, ease.inOutSine, (k) => alive() && draw(0, 1, 22 * Math.sin(k * Math.PI)));
      if (token === peekToken && !drag && !busy) rest();
    },
  };
}
