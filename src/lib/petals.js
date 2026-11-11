// Slowly falling rose petals on one canvas, plus petal "confetti" bursts that settle into the same drift.
import { rand } from './anim.js';

const PETAL_COLOURS = [
  { weight: 5, stops: ['#E2A097', '#F1C6BE', '#FDEDE8'] }, // blush
  { weight: 3, stops: ['#D58D85', '#E8B1A9', '#F8DCD6'] }, // dusty rose
  { weight: 4, stops: ['#E6D7BE', '#F6EEE1', '#FFFFFF'] }, // ivory
  { weight: 2, stops: ['#D2AF6E', '#E9D09C', '#FBF1D6'] }, // champagne
];

function petalSprite(stops, slim) {
  const s = 96;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.translate(s / 2, s / 2);
  g.scale(slim ? 0.78 : 0.94, 1);
  g.translate(-s / 2, -s / 2);
  const p = new Path2D();
  // rose petal: narrow base at the bottom, broad top with a soft notch
  p.moveTo(48, 92);
  p.bezierCurveTo(28, 84, 6, 60, 8, 36);
  p.bezierCurveTo(10, 12, 30, 2, 43, 8);
  p.quadraticCurveTo(48, 12, 53, 8);
  p.bezierCurveTo(66, 2, 86, 12, 88, 36);
  p.bezierCurveTo(90, 60, 68, 84, 48, 92);
  p.closePath();
  const grad = g.createRadialGradient(48, 86, 4, 48, 40, 60);
  grad.addColorStop(0, stops[0]);
  grad.addColorStop(0.45, stops[1]);
  grad.addColorStop(1, stops[2]);
  g.fillStyle = grad;
  g.fill(p);
  g.save();
  g.clip(p);
  const sheen = g.createLinearGradient(20, 10, 70, 80);
  sheen.addColorStop(0, 'rgba(255,255,255,0.45)');
  sheen.addColorStop(0.4, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(120,60,50,0.12)');
  g.fillStyle = sheen;
  g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(150,80,70,0.12)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(48, 88);
  g.quadraticCurveTo(46, 50, 48, 18);
  g.stroke();
  g.restore();
  g.strokeStyle = 'rgba(140,80,60,0.16)';
  g.lineWidth = 1;
  g.stroke(p);
  return c;
}

function flakeSprite() {
  const s = 48;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(8, 8, 40, 40);
  grad.addColorStop(0, '#9A7533');
  grad.addColorStop(0.45, '#F6E6B4');
  grad.addColorStop(0.7, '#C99F52');
  grad.addColorStop(1, '#8C6A2F');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(24, 6);
  g.lineTo(40, 20);
  g.lineTo(30, 42);
  g.lineTo(10, 30);
  g.closePath();
  g.fill();
  return c;
}

export class Petals {
  constructor(canvas, { reduced = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reduced = reduced;
    this.items = [];
    this.target = 0;
    this.running = false;
    this.time = 0;
    this.sprites = [];
    for (const col of PETAL_COLOURS) {
      for (let i = 0; i < col.weight; i++) this.sprites.push(petalSprite(col.stops, i % 2 === 1));
    }
    this.flake = flakeSprite();
    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.running) {
        this.last = performance.now();
        requestAnimationFrame(this.frame);
      }
    });
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.base = Math.max(18, Math.min(34, Math.min(this.w, this.h) * 0.06));
  }

  spawn(initial) {
    const z = rand(0.35, 1);
    const flake = Math.random() < 0.12;
    return {
      mode: 'fall',
      z,
      flake,
      sprite: flake ? this.flake : this.sprites[(Math.random() * this.sprites.length) | 0],
      size: this.base * (flake ? 0.32 : 0.55 + 0.6 * z),
      x: rand(-0.05, 1.05) * this.w,
      y: initial ? rand(-this.h * 0.9, -20) : rand(-80, -24),
      fall: (this.reduced ? 10 : 16) + 22 * z,
      swayAmp: 14 + 30 * z,
      swayFreq: rand(0.1, 0.24),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.45, 0.45),
      flipFreq: rand(0.18, 0.5),
      flipPhase: rand(0, Math.PI * 2),
      alpha: 0.55 + 0.4 * z,
    };
  }

  setCount(n) {
    this.target = this.reduced ? Math.min(n, 4) : n;
    let live = this.items.filter((p) => p.mode === 'fall').length;
    while (live < this.target) {
      this.items.push(this.spawn(true));
      live++;
    }
  }

  // Petals thrown from (x, y) in viewport px; angle in degrees (0 = right, -90 = up).
  burst({ x, y, angle = -60, spread = 50, count = 40, speed = [520, 900] }) {
    if (this.reduced) count = Math.round(count / 4);
    for (let i = 0; i < count; i++) {
      const p = this.spawn(false);
      const a = ((angle + rand(-spread / 2, spread / 2)) * Math.PI) / 180;
      const v = rand(speed[0], speed[1]) * (this.h / 800);
      Object.assign(p, {
        mode: 'burst',
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        age: 0,
        ttl: rand(5, 8),
        swayAmp: 0,
        vr: rand(-4, 4),
        flipFreq: rand(0.8, 1.6),
        alpha: 0.95,
      });
      this.items.push(p);
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
  }

  frame(now) {
    if (!this.running || document.hidden) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const t = this.time;
    const g = this.ctx;
    const r = this.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const wind = Math.sin(t * 0.13) * 10 + Math.sin(t * 0.051 + 1.3) * 7;
    let falling = 0;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      let fade = 1;
      if (p.mode === 'burst') {
        p.age += dt;
        const drag = Math.exp(-2.1 * dt);
        p.vx *= drag;
        p.vy = p.vy * drag + 620 * dt * (this.h / 800);
        p.vy = Math.min(p.vy, 70 + 40 * p.z);
        p.x += (p.vx + wind * p.z) * dt;
        p.y += p.vy * dt;
        p.vr *= Math.exp(-0.6 * dt);
        fade = Math.min(1, (p.ttl - p.age) / 1.2);
        if (fade <= 0 || p.y > this.h + p.size) {
          this.items.splice(i, 1);
          continue;
        }
      } else {
        falling++;
        p.y += p.fall * dt;
        p.x += wind * p.z * dt;
        if (p.y > this.h + p.size * 2) {
          if (falling > this.target) {
            this.items.splice(i, 1);
            falling--;
            continue;
          }
          Object.assign(p, this.spawn(false));
        }
      }
      p.rot += p.vr * dt;
      const sway = p.swayAmp * Math.sin(t * p.swayFreq * Math.PI * 2 + p.phase);
      const flip = this.reduced ? 1 : Math.cos(t * p.flipFreq * Math.PI * 2 + p.flipPhase);
      const sx = 0.28 + 0.72 * Math.abs(flip);
      const scale = p.size / p.sprite.width;
      const c = Math.cos(p.rot), s = Math.sin(p.rot);
      g.globalAlpha = p.alpha * fade * (0.75 + 0.25 * Math.abs(flip));
      g.setTransform(c * sx * scale * r, s * sx * scale * r, -s * scale * r, c * scale * r, (p.x + sway) * r, p.y * r);
      g.drawImage(p.sprite, -p.sprite.width / 2, -p.sprite.height / 2);
    }
    g.globalAlpha = 1;
    requestAnimationFrame(this.frame);
  }
}
