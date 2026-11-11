// Vector artwork drawn in code: crisp at every screen size. Palette: ivory, blush, gold and rose gold.
import { MONOGRAM as M } from './monogram-data.js';
import { blobPath } from './geom.js';

const GOLD_STOPS = `
  <stop offset="0" stop-color="#8C6A2F"/><stop offset=".22" stop-color="#D2B26A"/>
  <stop offset=".42" stop-color="#F6E6B4"/><stop offset=".58" stop-color="#C99F52"/>
  <stop offset=".8" stop-color="#9A7533"/><stop offset="1" stop-color="#DDBE78"/>`;
const ROSE_STOPS = `
  <stop offset="0" stop-color="#7E433E"/><stop offset=".24" stop-color="#C08176"/>
  <stop offset=".44" stop-color="#F3D2C6"/><stop offset=".6" stop-color="#C98B7F"/>
  <stop offset=".8" stop-color="#8F4F48"/><stop offset="1" stop-color="#D9A699"/>`;
const CHIFFON_STOPS = `
  <stop offset="0" stop-color="#EADFD2" stop-opacity=".92"/><stop offset=".28" stop-color="#FFFDF9" stop-opacity=".97"/>
  <stop offset=".55" stop-color="#F7F0E6" stop-opacity=".94"/><stop offset=".78" stop-color="#FFFEFB" stop-opacity=".97"/>
  <stop offset="1" stop-color="#E6DACB" stop-opacity=".92"/>`;

// Shared gradients/filters, referenced by id from every inline SVG (never display:none, or Chrome drops them).
export const DEFS = `
<svg class="svg-defs" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="g-foil" x1="0" y1="0" x2="1" y2="1">${GOLD_STOPS}</linearGradient>
    <linearGradient id="g-foil-h" x1="0" y1="0" x2="1" y2="0">${GOLD_STOPS}</linearGradient>
    <linearGradient id="g-rose" x1="0" y1="0" x2="1" y2="1">${ROSE_STOPS}</linearGradient>
    <radialGradient id="g-gwax" cx=".36" cy=".3" r=".82">
      <stop offset="0" stop-color="#ECD3CA"/><stop offset=".42" stop-color="#C99B91"/>
      <stop offset=".8" stop-color="#A06C63"/><stop offset="1" stop-color="#77473F"/>
    </radialGradient>
    <radialGradient id="g-gwax-disc" cx=".42" cy=".36" r=".72">
      <stop offset="0" stop-color="#D3A79E"/><stop offset="1" stop-color="#A5736A"/>
    </radialGradient>
    <radialGradient id="g-petal" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="46">
      <stop offset=".08" stop-color="#EDC6BC"/><stop offset=".45" stop-color="#F8E6E0"/><stop offset="1" stop-color="#FFFDF9"/>
    </radialGradient>
    <linearGradient id="g-arch" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFEFB" stop-opacity=".96"/><stop offset="1" stop-color="#FDF8F2" stop-opacity=".94"/>
    </linearGradient>
    <radialGradient id="g-flame" cx=".5" cy=".62" r=".6">
      <stop offset="0" stop-color="#FFF6D8"/><stop offset=".45" stop-color="#F7D58A"/><stop offset="1" stop-color="#E0A64A" stop-opacity=".15"/>
    </radialGradient>
    <linearGradient id="g-chiffon" x1="0" y1="0" x2="0" y2="1">${CHIFFON_STOPS}</linearGradient>
    <linearGradient id="g-chiffon-x" x1="0" y1="0" x2="1" y2="0">${CHIFFON_STOPS}</linearGradient>
    <radialGradient id="g-paper" cx=".5" cy=".4" r=".85">
      <stop offset="0" stop-color="#FCF8F1"/><stop offset=".65" stop-color="#F3ECE1"/><stop offset="1" stop-color="#E7DCCD"/>
    </radialGradient>
    <linearGradient id="g-gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F6EEEA"/><stop offset="1" stop-color="#DCCBC4"/>
    </linearGradient>
    <filter id="f-wax-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="f-blur3" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
</svg>`;

/* ---------- monogram ---------- */

export function monogram(cls = '') {
  return `<svg class="monogram ${cls}" viewBox="${M.viewBox}" aria-hidden="true" focusable="false">
    <path class="mg mg-1" d="${M.first}" style="--len:${M.firstLength}"/>
    <path class="mg mg-2" d="${M.second}" style="--len:${M.secondLength}"/>
  </svg>`;
}

/* ---------- dusty-rose wax seal stamped with the joined S+B (gatefold) ---------- */

const WAX = blobPath(90, [[3, 2.6, 2.2], [5, 2.1, 0.4], [9, 1.5, 3.1], [14, 0.9, 1.7]]);

export function gateSealSVG() {
  const s = 104 / M.width;
  const w = M.width * s;
  const h = M.height * s;
  const mono = (attrs) => `<path d="${M.first}" ${attrs}/><path d="${M.second}" ${attrs}/>`;
  return `<svg class="gseal-svg" viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">
    <path d="${WAX}" fill="#3d211c" opacity=".36" transform="translate(4 8)" filter="url(#f-wax-shadow)"/>
    <path d="${WAX}" fill="url(#g-gwax)"/>
    <path d="${WAX}" fill="none" stroke="#6d4740" stroke-opacity=".5" stroke-width="1.4"/>
    <circle r="66" fill="url(#g-gwax-disc)"/>
    <circle r="66" fill="none" stroke="#6b443d" stroke-opacity=".45" stroke-width="2.4"/>
    <circle r="68" fill="none" stroke="#F8E6E0" stroke-opacity=".55" stroke-width="1.1"/>
    <circle r="59" fill="none" stroke="url(#g-foil)" stroke-width="2.2" stroke-linecap="round" stroke-dasharray=".01 5.149"/>
    <g class="seal-mono" transform="translate(${(-w / 2).toFixed(2)} ${(-h / 2 + 2).toFixed(2)}) scale(${s.toFixed(4)})">
      <g transform="translate(1.4 2.2)">${mono('fill="#4a2621" stroke="#4a2621" stroke-width="2.2" opacity=".5"')}</g>
      ${mono('fill="url(#g-foil)" stroke="url(#g-foil)" stroke-width="2.2" stroke-linejoin="round"')}
    </g>
    <ellipse cx="-30" cy="-50" rx="40" ry="14" fill="#fff" opacity=".2" transform="rotate(-30 -30 -50)"/>
  </svg>`;
}

/* ---------- simple blossoms (like the embroidered flowers in the background photo) ---------- */

const PETAL = 'M0-3C-11-9-19-28-11-40C-7-46-2-45 0-41C2-45 7-46 11-40C19-28 11-9 0-3Z';

export function blossom(cls = '') {
  const petals = [0, 72, 144, 216, 288]
    .map(
      (a) => `<g transform="rotate(${a})"><g class="bl-petal">
        <path d="${PETAL}" fill="url(#g-petal)" stroke="#D9B8AB" stroke-width=".7"/>
        <path d="M0-6C-1-18 0-30 0-38" fill="none" stroke="#E2C4B8" stroke-width=".6"/></g></g>`,
    )
    .join('');
  const pearls = [0, 60, 120, 180, 240, 300]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<circle cx="${(Math.cos(r) * 10.5).toFixed(2)}" cy="${(Math.sin(r) * 10.5).toFixed(2)}" r="2.3" fill="#FFF9F0" stroke="#C9A55E" stroke-width=".6"/>`;
    })
    .join('');
  return `<svg class="blossom ${cls}" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
    ${petals}
    <g class="bl-heart"><circle r="7.6" fill="url(#g-foil)"/><circle r="7.6" fill="none" stroke="#8C6A2F" stroke-opacity=".5" stroke-width=".6"/>${pearls}
      <circle cx="-2.4" cy="-2.6" r="2.2" fill="#FFF6DA" opacity=".8"/></g>
  </svg>`;
}

// Gold leaf sprig (no green anywhere).
export const goldLeaf = `<svg class="gleaf" viewBox="-6 -40 12 42" aria-hidden="true" focusable="false" fill="none" stroke="url(#g-foil)" stroke-width="1" stroke-linecap="round">
  <path d="M0 0C0-12 0-24 0-36"/>
  <path d="M0-9C-4-11-5-15-4-18-1-16 0-13 0-9ZM0-18C4-20 5-24 4-27 1-25 0-22 0-18ZM0-27C-3.5-29-4.5-32-3.5-35-1-33 0-30 0-27Z" fill="#F3E3BB" fill-opacity=".55"/>
</svg>`;

/* ---------- ornaments ---------- */

export const divider = `<svg class="divider" viewBox="0 0 240 14" aria-hidden="true" focusable="false" fill="none" stroke="currentColor">
  <path d="M6 7h92M142 7h92" stroke-width=".8" stroke-linecap="round"/>
  <path d="M106 7l4-3 4 3-4 3zM126 7l4-3 4 3-4 3z" stroke-width=".7"/>
  <path d="M120 1.6l5.4 5.4-5.4 5.4-5.4-5.4z" fill="currentColor" stroke="none"/>
  <circle cx="101" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="139" cy="7" r="1.1" fill="currentColor" stroke="none"/>
</svg>`;

export const arch = `<svg class="arch" viewBox="0 0 300 500" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <path d="M12 490V180C12 120 52 88 96 66C122 53 140 38 150 16C160 38 178 53 204 66C248 88 288 120 288 180V490Z" fill="url(#g-arch)" stroke="url(#g-foil)" stroke-width="1.4" vector-effect="non-scaling-stroke"/>
  <path d="M21 481V182C21 126 58 97 100 76C125 63 142 49 150 31C158 49 175 63 200 76C242 97 279 126 279 182V481Z" fill="none" stroke="#C9A55E" stroke-opacity=".6" stroke-width=".8" vector-effect="non-scaling-stroke"/>
  <path d="M150 1.5C154 6 154 10 150 13.5C146 10 146 6 150 1.5Z" fill="url(#g-foil)"/>
</svg>`;

export function lantern(cls = '') {
  return `<svg class="lantern ${cls}" viewBox="0 0 40 104" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round">
    <path d="M20 0v15" stroke-dasharray="2 2"/>
    <circle cx="20" cy="17.5" r="2.4"/>
    <path d="M12 31c0-6 3.6-9.4 8-10.6 4.4 1.2 8 4.6 8 10.6z" fill="currentColor" fill-opacity=".18"/>
    <path d="M10.5 31h19l3 9v23l-3 7.5h-19l-3-7.5V40z" fill="#FFF8EC" fill-opacity=".55"/>
    <path class="flame" d="M15 65V45c0-5 2.4-8.2 5-9.4 2.6 1.2 5 4.4 5 9.4v20z" fill="url(#g-flame)" stroke-width=".8"/>
    <path d="M7.5 40h25M7.5 63h25" stroke-width=".7" opacity=".7"/>
    <path d="M13 70.5l7 10 7-10M20 80.5v6"/>
    <circle cx="20" cy="89" r="2.2" fill="currentColor" stroke="none"/>
  </svg>`;
}

// Two interlocked rings (gold + rose gold) with a small diamond.
export const rings = `<svg class="rings" viewBox="0 0 120 86" aria-hidden="true" focusable="false" fill="none" stroke-linecap="round">
  <circle class="ring ring-a" cx="47" cy="54" r="24" stroke="url(#g-foil)" stroke-width="5.4"/>
  <circle class="ring ring-b" cx="73" cy="54" r="24" stroke="url(#g-rose)" stroke-width="5.4"/>
  <path class="ring ring-a2" d="M57.3 75.7A24 24 0 0 0 64.9 70.1" stroke="url(#g-foil)" stroke-width="5.4"/>
  <circle cx="47" cy="54" r="24" stroke="#FFF6DD" stroke-opacity=".7" stroke-width="1" stroke-dasharray="20 131" stroke-dashoffset="-88"/>
  <circle cx="73" cy="54" r="24" stroke="#FFEDE6" stroke-opacity=".7" stroke-width="1" stroke-dasharray="18 133" stroke-dashoffset="-80"/>
  <g class="gem" transform="translate(73 26)">
    <path d="M-7-4l3.4-4.6h7.2L7-4 0 6z" fill="url(#g-gem)" stroke="#B9896F" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M-7-4h14M-3.6-8.6-2-4 0 6M3.6-8.6 2-4 0 6" stroke="#C9A58C" stroke-width=".6"/>
  </g>
</svg>`;

export const icon = {
  pin: '<svg class="i-pin" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21.5s-6.6-5.7-6.6-11.2a6.6 6.6 0 1 1 13.2 0c0 5.5-6.6 11.2-6.6 11.2z"/><circle cx="12" cy="10.2" r="2.5"/></svg>',
  calendar:
    '<svg class="i-cal" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/><path d="M8 13.4h.01M12 13.4h.01M16 13.4h.01M8 16.8h.01M12 16.8h.01" stroke-width="2.2"/></svg>',
  clock:
    '<svg class="i-clock" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.6"/><path class="i-hour" d="M12 12V8"/><path class="i-min" d="M12 12l3.6 2.1"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5.5l6.5 6.5L9 18.5"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4.5 4.5v4h4"/></svg>',
  tap: `<svg class="i-tap" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <g class="tap-rays"><path d="M21.6 3.2v3.6M13.6 6.4l2.4 2.5M29.6 6.4l-2.4 2.5M11 13.6h3.2M32.2 13.6H29"/></g>
    <g class="tap-hand"><path d="M18.8 27.6V12a2.9 2.9 0 0 1 5.8 0v10.2m0-1.4v-1.5a2.7 2.7 0 0 1 5.4 0v2.3m0-.8v-.5a2.6 2.6 0 0 1 5.2 0v2m0-.5a2.5 2.5 0 0 1 5 0V32c0 6.6-4.4 11-10.6 11h-3c-3.8 0-6.4-1.7-8.4-4.8l-5.2-8.2a2.7 2.7 0 0 1 4.3-3.2l1.5 1.8"/></g>
  </svg>`,
};

// Faint gold lattice (eight-point stars) used as a background texture.
export const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='#B08A45' stroke-opacity='.4' stroke-width='.7'><path d='M20 20h16v16H20z'/><path d='M28 16.7 39.3 28 28 39.3 16.7 28z'/><path d='M0 28h16.7M39.3 28H56M28 0v16.7M28 39.3V56'/></g></svg>`,
)}")`;
