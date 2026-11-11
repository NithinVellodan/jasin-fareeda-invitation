// Gatefold invitation (scalloped toile doors, ivory chiffon ribbon) generated for the real card size,
// so the scallops stay round on every screen. Every moving part is its own small layer (GPU-friendly).
import { smoothPath } from './geom.js';

const f = (n) => Math.round(n * 10) / 10;

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/* ---------- toile pattern (rose vines in taupe ink) ---------- */

const ROSE = `<path d="M-8 1C-8-6-2-9 3-7C8-5 9 2 5 6C1 9-6 8-8 1Z"/>
  <path d="M-4.6.4C-4.8-3.4-.4-5.6 2.6-3.8 5.4-2 4.6 2.4 1.6 3.4-1.2 4.2-3.6 2.2-2.8-.2-2.1-2 .6-1.9.8 0"/>
  <path d="M-8 1C-6 4.2-2 5.2 1.4 4.2M5 6C3.2 3.4 3.8.2 6-1.8"/>`;
const LEAF = '<path d="M0 0C3-3.4 8.6-3.8 12.6 0 8.6 3.8 3 3.4 0 0Z"/><path d="M.6 0H10.6"/>';
const BUD = '<path d="M0 0C-2.4-2-2-6.2 0-8.4 2-6.2 2.4-2 0 0Z"/><path d="M-2.6-1.2 0 .8 2.6-1.2"/>';

function toileTile() {
  const leaf = (x, y, r, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${LEAF}</g>`;
  const bud = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">${BUD}</g>`;
  const vine = `
    <path d="M50 0C22 28 24 62 50 80C76 98 78 132 50 160"/>
    <path d="M36 30C26 26 18 28 13 21"/><path d="M64 110C74 114 82 112 87 119"/>
    <path d="M39 64C47 60 52 54 52 46"/><path d="M61 96C53 100 48 106 48 114"/>
    <g transform="translate(27 46)">${ROSE}</g>
    <g transform="translate(74 122) scale(1.1)">${ROSE}</g>
    ${leaf(40, 12, -40)}${leaf(33, 22, 200, 0.9)}${leaf(27, 66, 160)}${leaf(36, 74, 30, 0.85)}
    ${leaf(60, 88, 20)}${leaf(68, 98, -160, 0.9)}${leaf(74, 140, -20)}${leaf(62, 150, 150, 0.85)}
    ${bud(13, 21, -60)}${bud(87, 119, 120)}${bud(52, 46, 10)}${bud(48, 114, 190)}
    <g transform="translate(86 36)"><path d="M0 10C1 4 4 0 8-2"/>${leaf(0, 10, -100, 0.7)}${leaf(2, 4, -30, 0.6)}${bud(8, -2, 50)}</g>
    <g transform="translate(14 128)"><path d="M0-10C-1-4-4 0-8 2"/>${leaf(0, -10, 80, 0.7)}${leaf(-2, -4, 150, 0.6)}${bud(-8, 2, 230)}</g>
    <circle cx="86" cy="64" r="1.1"/><circle cx="89" cy="61" r=".9"/><circle cx="14" cy="96" r="1.1"/><circle cx="11" cy="99" r=".9"/>`;
  // 200 x 160 tile: the second column is mirrored and dropped by half a repeat
  return `${vine}<g transform="translate(200 80) scale(-1 1)">${vine}</g><g transform="translate(200 -80) scale(-1 1)">${vine}</g>`;
}

/* ---------- doors ---------- */

function doorShape(W, H) {
  const cx = W / 2;
  const k = Math.max(3, Math.round(H / (W * 0.44)));
  const L = H / k;
  const depth = W * 0.072;
  const gap = W * 0.004;
  const xv = cx - depth;
  const b = ((depth - gap) * 4) / 3;
  let edge = `M${f(xv)} ${f(-L / 2)}`;
  for (let i = 0; i <= k; i++) {
    const y0 = (i - 0.5) * L;
    const y1 = (i + 0.5) * L;
    edge += `C${f(xv + b)} ${f(y0)} ${f(xv + b)} ${f(y1)} ${f(xv)} ${f(y1)}`;
  }
  const outline = `M-4 ${f(-L / 2)}H${f(xv)}${edge.slice(edge.indexOf('C'))}H-4Z`;
  return { outline, edge, cx, gap };
}

function doorSVG(W, H, side) {
  const { outline, edge, cx } = doorShape(W, H);
  const tw = W * 0.25;
  const left = side === 'l';
  const vb = left ? `0 0 ${f(cx + 16)} ${H}` : `${f(cx - 16)} 0 ${f(W - cx + 16)} ${H}`;
  const mirror = left ? '' : `transform="translate(${W} 0) scale(-1 1)"`;
  return `<svg class="door-svg" viewBox="${vb}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="toile-${side}" width="${f(tw * 2)}" height="${f(tw * 1.6)}" patternUnits="userSpaceOnUse" patternTransform="translate(${f(W * 0.03)} ${f(H * 0.02)})">
        <g transform="scale(${(tw / 100).toFixed(4)})" fill="none" stroke="#8A7663" stroke-width="${(0.95 * (100 / tw) * (W / 390)).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${toileTile()}</g>
      </pattern>
      <clipPath id="door-clip-${side}"><path d="${outline}"/></clipPath>
    </defs>
    <g ${mirror}>
      <path d="${outline}" fill="#2e1d14" opacity=".2" transform="translate(4 0)" filter="url(#f-blur3)"/>
      <path d="${outline}" fill="url(#g-paper)"/>
      <path d="${outline}" fill="url(#toile-${side})" opacity=".9"/>
      <g clip-path="url(#door-clip-${side})">
        <path d="${edge}" fill="none" stroke="#5a412e" stroke-opacity=".13" stroke-width="9"/>
        <path d="${edge}" fill="none" stroke="#FFFDF8" stroke-opacity=".9" stroke-width="1.4" transform="translate(-2 0)"/>
      </g>
      <path d="${edge}" fill="none" stroke="#B49C82" stroke-opacity=".75" stroke-width=".9"/>
    </g>
  </svg>`;
}

/* ---------- chiffon ribbon ---------- */

function strip(centre, widthAt, steps, rand, fray) {
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const [x, y, nx, ny] = centre(s);
    const w = widthAt(s) / 2;
    const j = () => (rand() - 0.5) * fray;
    left.push([x + nx * (w + j()), y + ny * (w + j())]);
    right.push([x - nx * (w + j()), y - ny * (w + j())]);
  }
  return { left, right };
}

function poly(points) {
  return 'M' + points.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

function cubicFrame(p0, p1, p2, p3) {
  return (s) => {
    const u = 1 - s;
    const x = u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0];
    const y = u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1];
    const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * s * (p2[0] - p1[0]) + 3 * s * s * (p3[0] - p2[0]);
    const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * s * (p2[1] - p1[1]) + 3 * s * s * (p3[1] - p2[1]);
    const len = Math.hypot(dx, dy) || 1;
    return [x, y, -dy / len, dx / len];
  };
}

function bandPart(W, cy, t, from, to, seed) {
  const rand = rng(seed);
  const lambda = W * 0.62;
  const a = t * 0.09;
  const n = Math.ceil(Math.abs(to - from) / 3);
  const top = [];
  const bot = [];
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    top.push([x, cy - t / 2 + a * Math.sin((2 * Math.PI * x) / lambda + seed) + (rand() - 0.5) * 0.7]);
    bot.push([x, cy + t / 2 + a * Math.sin((2 * Math.PI * x) / lambda + seed + 0.9) + (rand() - 0.5) * 0.7]);
  }
  const body = poly([...top, ...bot.reverse()]);
  const line = (dy, amp, ph) => {
    let d = '';
    for (let i = 0; i <= n; i += 2) {
      const x = from + ((to - from) * i) / n;
      d += `${i ? 'L' : 'M'}${f(x)} ${f(cy + dy + amp * Math.sin((2 * Math.PI * x) / (lambda * 0.7) + ph))}`;
    }
    return d;
  };
  return `<path d="${body}" fill="#3a2a20" opacity=".2" transform="translate(0 4)" filter="url(#f-blur3)"/>
    <path d="${body}" fill="url(#g-chiffon)"/>
    <path d="${line(-t * 0.2, a * 0.8, seed)}" fill="none" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="1.4"/>
    <path d="${line(t * 0.06, a * 0.6, seed + 2)}" fill="none" stroke="#CDBDAA" stroke-opacity=".5" stroke-width="1"/>
    <path d="${line(t * 0.28, a * 0.7, seed + 4)}" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="1.1"/>
    <path d="${body}" fill="none" stroke="#D9CBB9" stroke-opacity=".7" stroke-width=".7"/>`;
}

function tailPart(W, frame, width, seed) {
  const rand = rng(seed);
  const { left, right } = strip(frame, width, 40, rand, 0.8);
  const endL = left[left.length - 1];
  const endR = right[right.length - 1];
  const teeth = [];
  for (let i = 1; i < 9; i++) {
    const s = i / 9;
    const x = endL[0] + (endR[0] - endL[0]) * s;
    const y = endL[1] + (endR[1] - endL[1]) * s + (i % 2 ? W * 0.012 : -W * 0.004) + (rand() - 0.5) * 2;
    teeth.push([x, y]);
  }
  const body = poly([...left, ...teeth, ...right.reverse()]);
  const centre = [];
  for (let i = 0; i <= 40; i += 2) {
    const [x, y, nx, ny] = frame(i / 40);
    centre.push(`${i ? 'L' : 'M'}${f(x + nx * width(i / 40) * 0.18)} ${f(y + ny * width(i / 40) * 0.18)}`);
  }
  const [ex, ey] = frame(1);
  const threads = [0, 1, 2]
    .map((k) => {
      const x0 = ex + (k - 1) * W * 0.018;
      return `<path d="M${f(x0)} ${f(ey + W * 0.006)}c${f(W * 0.004)} ${f(W * 0.02)} ${f(-W * 0.006)} ${f(W * 0.03)} ${f(W * 0.002)} ${f(W * (0.04 + k * 0.008))}"/>`;
    })
    .join('');
  return `<path d="${body}" fill="#3a2a20" opacity=".18" transform="translate(3 5)" filter="url(#f-blur3)"/>
    <path d="${body}" fill="url(#g-chiffon-x)"/>
    <path d="${centre.join('')}" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="1.3"/>
    <path d="${body}" fill="none" stroke="#D6C7B4" stroke-opacity=".75" stroke-width=".7"/>
    <g fill="none" stroke="#E2D6C6" stroke-width=".7" stroke-linecap="round">${threads}</g>`;
}

function knotPart(cx, cy, t, W) {
  const rand = rng(7);
  const pts = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const r = 1 + (rand() - 0.5) * 0.16;
    pts.push([cx + Math.cos(a) * W * 0.085 * r, cy + Math.sin(a) * t * 0.78 * r]);
  }
  const body = smoothPath(pts, true);
  const fold = (x0, y0, c1, c2, x1, y1) => `M${f(x0)} ${f(y0)}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(x1)} ${f(y1)}`;
  return `<path d="${body}" fill="#3a2a20" opacity=".22" transform="translate(0 4)" filter="url(#f-blur3)"/>
    <path d="${body}" fill="url(#g-chiffon)"/>
    <g fill="none" stroke-linecap="round">
      <path d="${fold(cx - W * 0.07, cy - t * 0.3, [cx - W * 0.03, cy - t * 0.6], [cx + W * 0.02, cy - t * 0.1], cx + W * 0.06, cy - t * 0.35)}" stroke="#CBBAA6" stroke-opacity=".6" stroke-width="1.1"/>
      <path d="${fold(cx - W * 0.065, cy + t * 0.3, [cx - W * 0.02, cy + t * 0.05], [cx + W * 0.03, cy + t * 0.6], cx + W * 0.07, cy + t * 0.25)}" stroke="#CBBAA6" stroke-opacity=".55" stroke-width="1"/>
      <path d="${fold(cx - W * 0.05, cy - t * 0.05, [cx - W * 0.01, cy - t * 0.3], [cx + W * 0.02, cy + t * 0.3], cx + W * 0.05, cy + t * 0.02)}" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="1.4"/>
    </g>
    <path d="${body}" fill="none" stroke="#D4C4B0" stroke-opacity=".8" stroke-width=".8"/>`;
}

function part(cls, box, inner) {
  const [x, y, w, h] = box.map((v) => Math.round(v));
  return `<div class="gate-part ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
    <div class="gate-part-inner"><svg viewBox="${x} ${y} ${w} ${h}" aria-hidden="true" focusable="false">${inner}</svg></div>
  </div>`;
}

// Everything is laid out in px for a W x H card; cy is the ribbon line.
export function gateMarkup(W, H) {
  const cx = W / 2;
  const cy = H * 0.535;
  const t = W * 0.1;
  const tailL = cubicFrame([cx - W * 0.012, cy + t * 0.25], [cx - W * 0.03, cy + H * 0.13], [cx - W * 0.15, cy + H * 0.19], [cx - W * 0.12, cy + H * 0.33]);
  const tailR = cubicFrame([cx + W * 0.012, cy + t * 0.25], [cx + W * 0.04, cy + H * 0.12], [cx + W * 0.14, cy + H * 0.22], [cx + W * 0.07, cy + H * 0.37]);
  const twist = (base) => (s) => base * (1 - 0.22 * s) * (1 - 0.5 * Math.exp(-(((s - 0.42) / 0.09) ** 2)));
  const tailBox = (frame) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i <= 20; i++) {
      const [x, y] = frame(i / 20);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    const m = W * 0.09;
    return [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m];
  };
  const band = [cy - t * 1.1, t * 2.4];
  return {
    cx,
    cy,
    sealSize: W * 0.27,
    doors: `<div class="door door--l" style="left:0;width:${f(cx + 16)}px">${doorSVG(W, H, 'l')}</div>
      <div class="door door--r" style="left:${f(cx - 16)}px;width:${f(W - cx + 16)}px">${doorSVG(W, H, 'r')}</div>`,
    ribbon: [
      part('rb-tail rb-tail-l', tailBox(tailL), tailPart(W, tailL, twist(W * 0.074), 11)),
      part('rb-tail rb-tail-r', tailBox(tailR), tailPart(W, tailR, twist(W * 0.07), 23)),
      part('rb-band rb-band-l', [-W * 0.06, band[0], cx + W * 0.1, band[1]], bandPart(W, cy, t, -W * 0.05, cx + W * 0.03, 1)),
      part('rb-band rb-band-r', [cx - W * 0.04, band[0], W - cx + W * 0.1, band[1]], bandPart(W, cy, t, cx - W * 0.03, W * 1.05, 3)),
      part('rb-knot', [cx - W * 0.13, cy - t * 1.3, W * 0.26, t * 2.8], knotPart(cx, cy, t, W)),
    ].join(''),
  };
}
