// Scene 0: the gold monogram draws itself (pure CSS, starts before JS), then flies into the wax seal.
import { $ } from '../lib/dom.js';
import { E, finished, play, wait } from '../lib/anim.js';

const capped = (p, ms) => Promise.race([p, wait(ms)]);

export async function loadAssets({ music, quick, reduced }) {
  const bar = $('#loader .loader-line span');
  const fonts = document.fonts
    ? Promise.all([
        document.fonts.load('400 40px "Great Vibes"'),
        document.fonts.load('500 20px "Cormorant Garamond"'),
        document.fonts.load('italic 500 20px "Cormorant Garamond"'),
        document.fonts.load('500 20px "Cinzel"'),
        document.fonts.load('400 40px "Amiri"', '\uFDFD'),
      ]).catch(() => {})
    : Promise.resolve();
  const tasks = [capped(fonts, 4000), capped(music.preload(), 4000)];
  let done = 0;
  const step = () => {
    done++;
    if (bar) bar.style.transform = `scaleX(${(0.15 + (0.85 * done) / tasks.length).toFixed(3)})`;
  };
  tasks.forEach((t) => t.then(step));
  await Promise.all([...tasks, wait(quick || reduced ? 700 : 2900)]);
  if (bar) bar.style.transform = 'scaleX(1)';
  await wait(300);
}

// The loader's backdrop fades away (the flower scene behind it has the same colour); the logo stays put.
export async function revealStage({ reduced }) {
  const loader = $('#loader');
  if (!loader) return;
  play($('.loader-line', loader), [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: E.out });
  await finished(play($('.loader-bg', loader), [{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 300 : 700, easing: E.inOutSoft }));
}

// The logo flies onto the wax seal (target = its final on-screen box) and hands over to it.
export async function flyInto(target, { reduced, onLand }) {
  const loader = $('#loader');
  if (!loader) return onLand();
  const mono = $('.loader-mono', loader);
  if (reduced) {
    onLand();
    await finished(play(loader, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }));
    loader.remove();
    return;
  }
  const a = mono.getBoundingClientRect();
  const dx = target.left + target.width / 2 - (a.left + a.width / 2);
  const dy = target.top + target.height / 2 - (a.top + a.height / 2);
  const s = target.width / a.width;
  const fly = play(mono, [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }], { duration: 1300, easing: E.inOut });
  setTimeout(onLand, 980);
  await finished(fly);
  await finished(play(mono, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: E.inOutSoft }));
  loader.remove();
}
