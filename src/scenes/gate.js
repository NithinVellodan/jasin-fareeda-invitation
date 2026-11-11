// Scene 2: the gatefold invitation. The S+B logo lands on the wax seal like a stamp; the guest's tap cracks
// the seal in two, the chiffon ribbon slides away to both sides (slow drift, then fast), and the doors swing open.
import { gateSealSVG } from '../lib/art.js';
import { gateMarkup } from '../lib/gate-art.js';
import { $, $$, esc } from '../lib/dom.js';
import { E, finished, play, spring, vibrate, wait } from '../lib/anim.js';
import { sparkBurst } from '../lib/fx.js';

const DRIFT = 'cubic-bezier(.35,0,.65,1)';
const SPEED_UP = 'cubic-bezier(.5,0,.86,.32)';

export function createGate(root, { reduced, petals, hint }) {
  root.innerHTML = `
    <div class="gate-zoom">
      <div class="gate">
        <div class="gate-liner"></div>
        <div class="gate-doors"></div>
        <div class="gate-ribbon"></div>
        <div class="gseal"><div class="gseal-inner">${gateSealSVG()}<span class="gseal-sheen"></span></div><span class="gseal-pulse"></span></div>
        <p class="gate-hint" aria-hidden="true">${esc(hint)}</p>
        <div class="gate-glow"></div>
      </div>
    </div>
    <button class="gate-tap" type="button" aria-label="Open the invitation" hidden></button>`;
  const zoom = $('.gate-zoom', root);
  const gate = $('.gate', root);
  const seal = $('.gseal', root);
  const sealInner = $('.gseal-inner', root);
  const hintEl = $('.gate-hint', root);
  let geo;

  function build() {
    const W = gate.offsetWidth;
    const H = gate.offsetHeight;
    geo = gateMarkup(W, H);
    $('.gate-doors', root).innerHTML = geo.doors;
    $('.gate-ribbon', root).innerHTML = geo.ribbon;
    Object.assign(seal.style, {
      left: `${geo.cx - geo.sealSize / 2}px`,
      top: `${geo.cy - geo.sealSize / 2}px`,
      width: `${geo.sealSize}px`,
      height: `${geo.sealSize}px`,
    });
    hintEl.style.top = `${geo.cy - geo.sealSize * 0.68}px`;
  }
  build();
  let opening = false;
  const onResize = () => !opening && build();
  window.addEventListener('resize', onResize);
  if (!reduced) zoom.style.transform = 'scale(1.06)';
  const sealY = () => (geo.cy / gate.offsetHeight) * 100;

  return {
    // where the seal's logo will be once the card has settled (the card starts slightly zoomed)
    sealRect() {
      const r = $('.seal-mono', seal).getBoundingClientRect();
      if (reduced) return r;
      const k = 1.06;
      const cx = innerWidth / 2;
      const cy = innerHeight / 2;
      return { left: cx + (r.left - cx) / k, top: cy + (r.top - cy) / k, width: r.width / k, height: r.height / k };
    },

    // settle into place while the flowers part
    reveal(dur) {
      if (!reduced) play(zoom, [{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: dur + 600, easing: E.out });
    },

    // the wax appears under the landing logo, like a stamp pressed into it
    popSeal() {
      if (reduced) {
        play(seal, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
        return;
      }
      const s = spring({ stiffness: 230, damping: 14 });
      play(seal, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: s.duration, easing: s.easing });
      setTimeout(() => sparkBurst(gate, 50, sealY(), { count: 12, reach: [0.1, 0.24], size: [7, 13] }), 160);
    },

    // Anywhere on the screen opens it; onTap runs inside the tap itself, so phones allow the song to start.
    waitForTap(onTap) {
      const btn = $('.gate-tap', root);
      root.removeAttribute('aria-hidden');
      btn.hidden = false;
      const show = setTimeout(() => {
        seal.classList.add('is-waiting');
        hintEl.classList.add('is-on');
      }, 350);
      return new Promise((resolve) => {
        btn.addEventListener(
          'click',
          () => {
            onTap();
            clearTimeout(show);
            btn.remove();
            root.setAttribute('aria-hidden', 'true');
            seal.classList.remove('is-waiting');
            hintEl.classList.remove('is-on');
            resolve();
          },
          { once: true },
        );
      });
    },

    async open(onReveal) {
      opening = true;
      window.removeEventListener('resize', onResize);
      const part = (c) => $(`.${c}`, root);
      if (reduced) {
        onReveal();
        await finished(play(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }));
        return;
      }

      // 1. the seal gives under the tap, cracks in two and falls away
      await finished(play(sealInner, [{ transform: 'scale(1)' }, { transform: 'scale(.93)' }], { duration: 160, easing: E.in }));
      const shards = ['l', 'r'].map((side) => {
        const d = document.createElement('div');
        d.className = `seal-shard seal-shard--${side}`;
        d.innerHTML = gateSealSVG();
        seal.appendChild(d);
        return d;
      });
      sealInner.style.visibility = 'hidden';
      const crack = document.createElement('div');
      crack.className = 'seal-crack';
      crack.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="52,4 47,18 55,33 45,50 54,66 46,82 51,96"/></svg>';
      seal.appendChild(crack);
      play(crack, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 520 });
      vibrate(30);
      sparkBurst(gate, 50, sealY(), { count: 18, reach: [0.12, 0.34], size: [8, 16] });
      shards.forEach((shard, k) => {
        const dir = k === 0 ? -1 : 1;
        play(
          shard,
          [
            { transform: 'scale(.93)', opacity: 1, easing: 'cubic-bezier(.2,.8,.3,1)' },
            { transform: `scale(.93) translate(${dir * 8}%, -3%) rotate(${dir * 9}deg)`, opacity: 1, offset: 0.24, easing: 'cubic-bezier(.5,0,.9,.45)' },
            { transform: `scale(.88) translate(${dir * 26}%, 120%) rotate(${dir * 38}deg)`, opacity: 0 },
          ],
          { duration: 1200 },
        );
      });
      await wait(420);

      // 2. the ribbon: knot loosens, tails slip down, both halves slide away - a slow drift, then fast
      const rd = 2500;
      play(
        part('rb-knot'),
        [
          { transform: 'none', opacity: 1, easing: DRIFT },
          { transform: 'scale(.9) rotate(-4deg)', opacity: 1, offset: 0.45, easing: SPEED_UP },
          { transform: 'scale(.5) rotate(-10deg)', opacity: 0 },
        ],
        { duration: rd * 0.7 },
      );
      [
        ['rb-tail-l', -1],
        ['rb-tail-r', 1],
      ].forEach(([name, dir]) =>
        play(
          part(name),
          [
            { transform: 'none', opacity: 1, easing: DRIFT },
            { transform: `translate(${dir * 2}%, 5%) rotate(${dir * -3}deg)`, opacity: 1, offset: 0.4, easing: SPEED_UP },
            { transform: `translate(${dir * 17}%, 72%) rotate(${dir * -12}deg)`, opacity: 0 },
          ],
          { duration: rd * 0.85 },
        ),
      );
      const bands = [
        [part('rb-band-l'), -1],
        [part('rb-band-r'), 1],
      ].map(([band, dir]) => {
        play(
          $('.gate-part-inner', band),
          [
            { transform: 'skewY(0deg) scaleY(1)' },
            { transform: `skewY(${dir * 1.4}deg) scaleY(1.12)`, offset: 0.4 },
            { transform: `skewY(${dir * -2.4}deg) scaleY(.88)`, offset: 0.68 },
            { transform: `skewY(${dir * 1.6}deg) scaleY(1.08)`, offset: 0.86 },
            { transform: 'skewY(0deg) scaleY(1)' },
          ],
          { duration: rd, easing: 'ease-in-out' },
        );
        return play(
          band,
          [
            { transform: 'translateX(0) rotate(0deg)', easing: DRIFT },
            { transform: `translateX(${dir * 7}%) rotate(${dir * 1}deg)`, offset: 0.38, easing: SPEED_UP },
            { transform: `translateX(${dir * 130}%) rotate(${dir * 5}deg)` },
          ],
          { duration: rd },
        );
      });
      setTimeout(() => {
        sparkBurst(gate, 30, sealY(), { count: 8, reach: [0.05, 0.16], size: [7, 12] });
        sparkBurst(gate, 70, sealY(), { count: 8, reach: [0.05, 0.16], size: [7, 12] });
      }, rd * 0.55);
      await wait(rd * 0.7);

      // 3. the envelope opens: a small unlatch, a slow creep, then both doors swing out fast
      const dd = 2100;
      $$('.door', root).forEach((door, k) => {
        const dir = k === 0 ? -1 : 1;
        play(
          door,
          [
            { transform: 'rotateY(0deg)', easing: 'cubic-bezier(.2,.8,.3,1)' },
            { transform: `rotateY(${dir * 8}deg)`, offset: 0.14, easing: 'linear' },
            { transform: `rotateY(${dir * 14}deg)`, offset: 0.34, easing: SPEED_UP },
            { transform: `rotateY(${dir * 108}deg)` },
          ],
          { duration: dd },
        );
        play(door, [{ opacity: 1 }, { opacity: 1, offset: 0.78 }, { opacity: 0 }], { duration: dd });
      });
      play($('.gate-liner', root), [{ opacity: 1 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: dd * 0.9, easing: 'linear' });
      play($('.gate-glow', root), [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1.15)', offset: 0.45 }, { opacity: 0, transform: 'scale(1.6)' }], {
        duration: dd,
        delay: 250,
        easing: E.outSoft,
      });
      setTimeout(() => {
        onReveal();
        const r = gate.getBoundingClientRect();
        const y = r.top + geo.cy;
        petals?.burst({ x: r.left + r.width / 2, y, angle: 180, spread: 80, count: 24, speed: [320, 620] });
        petals?.burst({ x: r.left + r.width / 2, y, angle: 0, spread: 80, count: 24, speed: [320, 620] });
      }, 850);
      await Promise.all(bands.map(finished));
      await wait(dd - rd * 0.3 + 100);
    },
  };
}
