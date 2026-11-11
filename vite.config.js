import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { config } from './src/config.js';
import { MONOGRAM as M } from './src/lib/monogram-data.js';

const file = (p) => fileURLToPath(new URL(p, import.meta.url));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const placeholder = (s) => !s || /^\[.*\]$/.test(String(s).trim());

function when(iso) {
  const d = new Date(iso);
  const f = (o) => new Intl.DateTimeFormat('en-GB', { timeZone: config.timeZone, ...o }).format(d);
  const time = new Intl.DateTimeFormat('en-US', { timeZone: config.timeZone, hour: 'numeric', minute: '2-digit' }).format(d);
  return { long: `${f({ weekday: 'long' })}, ${f({ day: 'numeric', month: 'long', year: 'numeric' })}`, short: f({ day: 'numeric', month: 'long', year: 'numeric' }), time };
}

function meta(variant) {
  const couple = `${config.groom.name} & ${config.bride.name}`;
  const main = variant === 'reception' ? config.reception : config.nikah;
  const w = when(main.start);
  const title = `${couple} · ${main.title} · ${w.short}`;
  const where = placeholder(main.venue) ? '' : `, ${main.venue}`;
  const what = variant === 'reception' ? 'wedding reception' : 'Nikah';
  const description = `You're invited to the ${what} of ${couple} — ${w.long}${where}`;
  const url = config.siteUrl ? config.siteUrl.replace(/\/$/, '') + (variant === 'reception' ? '/reception' : '') : '';
  const imageUrl = config.siteUrl ? config.siteUrl.replace(/\/$/, '') + '/images/preview.png' : '/images/preview.png';
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(couple)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(imageUrl)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(imageUrl)}" />`,
  ];
  if (url) tags.push(`<meta property="og:url" content="${esc(url)}" />`, `<link rel="canonical" href="${esc(url)}" />`);
  return tags.join('\n    ');
}

function noscript(variant) {
  const lines = (variant === 'reception' ? [config.reception] : [config.nikah, config.reception]).map((e) => {
    const w = when(e.start);
    return `${esc(e.title)}: ${esc(w.long)}, ${esc(e.timeText || w.time)}${placeholder(e.venue) ? '' : ` at ${esc(e.venue)}`}`;
  });
  return `<noscript><div class="noscript"><p>${esc(config.bride.name)} &amp; ${esc(config.groom.name)}<br />${lines.join('<br />')}</p></div></noscript>`;
}

const loader = `<div id="loader" role="status" aria-label="Loading the invitation">
    <div class="loader-bg"></div>
    <div class="loader-inner">
      <svg class="monogram loader-mono" viewBox="${M.viewBox}" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="g-lfoil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#8C6A2F" /><stop offset=".25" stop-color="#D2B26A" /><stop offset=".45" stop-color="#F6E6B4" />
            <stop offset=".62" stop-color="#C99F52" /><stop offset="1" stop-color="#9A7533" />
          </linearGradient>
        </defs>
        <path class="mg mg-1" d="${M.first}" style="--len: ${M.firstLength}" />
        <path class="mg mg-2" d="${M.second}" style="--len: ${M.secondLength}" />
      </svg>
      <div class="loader-line"><span></span></div>
    </div>
  </div>`;

function invitationHtml() {
  // Local dev/preview: serve /reception like Vercel's cleanUrls does (no trailing slash needed).
  const rewrite = (req, _res, next) => {
    if (/^\/reception(\?|$)/.test(req.url)) req.url = req.url.replace('/reception', '/reception/');
    next();
  };
  return {
    name: 'invitation-html',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
    transformIndexHtml(html, ctx) {
      const variant = /reception[\\/]index\.html$/.test(ctx.filename) ? 'reception' : 'full';
      const analytics = `<script defer src="/_vercel/insights/script.js"></script>`;
      return html
        .replace('<!--meta-->', meta(variant) + '\n    ' + analytics)
        .replace('<!--loader-->', loader)
        .replace('<!--noscript-->', noscript(variant));
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [invitationHtml()],
  build: {
    target: 'es2020',
    rolldownOptions: {
      input: {
        main: file('./index.html'),
        reception: file('./reception/index.html'),
      },
    },
  },
});
