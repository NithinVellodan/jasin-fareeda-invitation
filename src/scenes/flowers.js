// Scene 1: simple blossoms open around the S+B monogram, then part outward to reveal the gatefold.
import { blossom, goldLeaf } from '../lib/art.js';
import { $$ } from '../lib/dom.js';
import { E, finished, play, spring, wait } from '../lib/anim.js';
import { sparkBurst } from '../lib/fx.js';

// [angle deg, size in column widths, tilt deg] around an ellipse framing the monogram
const RING = [
  [-90, 0.19, 8],
  [-45, 0.15, -20],
  [0, 0.18, 30],
  [45, 0.15, -12],
  [90, 0.19, 20],
  [135, 0.15, -30],
  [180, 0.18, 12],
  [225, 0.15, -8],
];
const RX = 0.4;
const RY = 0.36;

const col = () => Math.min(window.innerWidth, window.innerHeight * 0.5625);

export function createFlowers(root, { reduced, petals }) {
  const at = (deg, rx = RX, ry = RY) => {
    const a = (deg * Math.PI) / 180;
    return [Math.cos(a) * rx, Math.sin(a) * ry];
  };
  root.innerHTML = `
    <div class="fl-bg"></div>
    <div class="fl-ring">
      ${RING.map(([a, s, tilt]) => {
        const [x, y] = at(a);
        return `<div class="fl" style="--x:${x.toFixed(3)};--y:${y.toFixed(3)};--s:${s}"><div class="fl-in" data-tilt="${tilt}">${blossom()}</div></div>`;
      }).join('')}
      ${RING.map(([a]) => {
        const [x, y] = at(a + 22.5, RX * 0.98, RY * 0.98);
        return `<div class="fl-leaf" style="--x:${x.toFixed(3)};--y:${y.toFixed(3)};--rot:${(a + 22.5 + 90).toFixed(1)}deg"><div class="fl-leaf-in">${goldLeaf}</div></div>`;
      }).join('')}
    </div>`;
  const flowers = $$('.fl-in', root);
  const leaves = $$('.fl-leaf-in', root);

  return {
    // each blossom unfolds petal by petal, sweeping around the monogram
    async bloom() {
      if (reduced) {
        [...flowers, ...leaves].forEach((n) => play(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }));
        await wait(500);
        return;
      }
      const pop = spring({ stiffness: 140, damping: 13 });
      const anims = flowers.map((fl, i) => {
        const d = i * 120;
        const tilt = Number(fl.dataset.tilt);
        play(fl, [{ transform: `rotate(${tilt - 70}deg) scale(.2)`, opacity: 0 }, { transform: `rotate(${tilt}deg) scale(1)`, opacity: 1 }], {
          duration: pop.duration,
          delay: d,
          easing: pop.easing,
        });
        $$('.bl-petal', fl).forEach((p, k) =>
          play(p, [{ transform: 'rotate(-28deg) scale(.15, .1)' }, { transform: 'none' }], { duration: 1100, delay: d + 80 + k * 55, easing: E.out }),
        );
        setTimeout(() => sparkBurst(fl, 50, 50, { count: 6, reach: [0.35, 0.8], size: [6, 11] }), d + 420);
        return play(fl.querySelector('.bl-heart'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          duration: 700,
          delay: d + 380,
          easing: E.back,
        });
      });
      leaves.forEach((lf, i) =>
        play(lf, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 900, delay: 500 + i * 90, easing: E.out }),
      );
      await Promise.all(anims.map(finished));
    },

    // the ring opens like petals parting; the background fades to the gatefold underneath
    async part(dur = 1400) {
      if (reduced) {
        await finished(play(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }));
        root.remove();
        return;
      }
      const c = col();
      petals?.burst({ x: innerWidth / 2, y: innerHeight / 2, angle: -90, spread: 360, count: 40, speed: [360, 720] });
      $$('.fl', root).forEach((fl, i) => {
        const x = parseFloat(fl.style.getPropertyValue('--x')) * c * 1.9;
        const y = parseFloat(fl.style.getPropertyValue('--y')) * c * 1.9;
        play(fl, [{ transform: 'translate(0, 0) scale(1)', opacity: 1 }, { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1.35)`, opacity: 0 }], {
          duration: dur,
          delay: i * 25,
          easing: 'cubic-bezier(.5,0,.75,.35)',
        });
      });
      leaves.forEach((lf) => play(lf, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }));
      await finished(play(root.querySelector('.fl-bg'), [{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.85, delay: dur * 0.12, easing: E.inOutSoft }));
      root.remove();
    },
  };
}
