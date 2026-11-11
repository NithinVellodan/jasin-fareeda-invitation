// Small sparkle effects (four-point gold glints).
import { play, rand } from './anim.js';

export function spark(container, x, y, size) {
  const i = document.createElement('i');
  i.className = 'spark';
  i.style.left = `${x}%`;
  i.style.top = `${y}%`;
  if (size) i.style.setProperty('--sz', `${size}px`);
  container.appendChild(i);
  return i;
}

// Radial burst of glints from (x%, y%) of the container.
export function sparkBurst(container, x, y, { count = 14, reach = [0.06, 0.2], size = [7, 16] } = {}) {
  const w = container.getBoundingClientRect().width;
  for (let k = 0; k < count; k++) {
    const s = spark(container, x, y, rand(size[0], size[1]));
    const a = (k / count) * Math.PI * 2 + rand(-0.3, 0.3);
    const d = rand(reach[0], reach[1]) * w;
    const anim = play(
      s,
      [
        { transform: 'translate(-50%,-50%) scale(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d * 0.8}px), calc(-50% + ${Math.sin(a) * d * 0.8}px)) scale(1) rotate(45deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(0) rotate(90deg)`, opacity: 0 },
      ],
      { duration: rand(900, 1400), easing: 'cubic-bezier(.2,.7,.3,1)' },
    );
    anim.finished.then(() => s.remove(), () => s.remove());
  }
}

// Ambient twinkles: static glints with staggered CSS animations (cheap, compositor-only).
export function twinkles(container, count, { x = [8, 92], y = [8, 92], size = [6, 12] } = {}) {
  for (let k = 0; k < count; k++) {
    const s = spark(container, rand(x[0], x[1]), rand(y[0], y[1]), rand(size[0], size[1]));
    s.classList.add('twinkle');
    s.style.animationDelay = `${rand(0, 6).toFixed(2)}s`;
    s.style.animationDuration = `${rand(3.2, 5.8).toFixed(2)}s`;
  }
}
