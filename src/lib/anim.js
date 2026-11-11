// Animation helpers on top of the Web Animations API (no runtime dependencies).

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const E = {
  out: 'cubic-bezier(.22,.8,.24,1)',
  outSoft: 'cubic-bezier(.25,.7,.35,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
  inOutSoft: 'cubic-bezier(.45,0,.25,1)',
  in: 'cubic-bezier(.55,0,.8,.3)',
  paper: 'cubic-bezier(.6,.02,.22,1)',
  back: 'cubic-bezier(.3,1.45,.55,1)',
};

export const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - (1 - t) ** 3,
  outQuart: (t) => 1 - (1 - t) ** 4,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

const linearEasing = typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 1)');

// Damped spring sampled into a CSS linear() easing; falls back to an overshoot bezier.
export function spring({ stiffness = 170, damping = 14, mass = 1 } = {}) {
  const dt = 1 / 120;
  let x = 0, v = 0, t = 0, calm = 0;
  const pts = [0];
  while (t < 4) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    pts.push(x);
    calm = Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.02 ? calm + 1 : 0;
    if (calm > 10) break;
  }
  const duration = Math.round(t * 1000);
  if (!linearEasing) return { easing: E.back, duration };
  const step = Math.max(1, Math.round(pts.length / 64));
  const out = [];
  for (let i = 0; i < pts.length; i += step) out.push(+pts[i].toFixed(4));
  out.push(1);
  return { easing: `linear(${out.join(',')})`, duration };
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function play(el, keyframes, options) {
  return el.animate(keyframes, { fill: 'both', ...options });
}

export const finished = (anim) => anim.finished.catch(() => {});

// rAF tween for values that are not CSS properties (deck angle, masks, audio fades).
export function tween(duration, easeFn, onUpdate) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      onUpdate(easeFn(t));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function vibrate(ms) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Some browsers throw when vibration is blocked; it is only a nicety.
  }
}
