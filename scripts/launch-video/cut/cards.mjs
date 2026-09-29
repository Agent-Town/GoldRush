// scripts/launch-video/cut/cards.mjs: every piece of type and every drawn layer of the cut, rendered as PNGs by
// headless Chromium (Playwright), because this Mac's ffmpeg has no drawtext (task launch-video-cut-3, scope 3).
// Outputs, all under ~/.goldrush/launch-video/cut/work/cards/: per format (master, landscape, vertical) one
// full-frame transparent PNG per card in edl.mjs CARDS, the page border (page.png), the parchment grain
// (grain.png) and the end card (endcard.png); once, the menu backdrop drawn from the valley plate at each take
// geometry (menu-still-1920x1200.png, menu-still-780x1688.png) and B2's hand-cut layers (b2-near.png, b2-far.png).
// THE ONLY NETWORK USE IN THE CUT: the two Google Fonts faces (Rye, Wellfleet), fetched once into work/fonts and
// hashed; the browser itself is refused every request (counted, must be 0), and a face that fails to load stops
// the run rather than falling back to another font.
// Usage: node scripts/launch-video/cut/cards.mjs [--format master,landscape,vertical] [--only id,id] [--refetch-fonts]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { CARDS, END_CARD, FORMATS, LOCKUP, PLATES, VALLEY_NEAR_LINE } from './edl.mjs';
import { EMBLEM, WORK, ensureDir, platePath, sha256 } from './lib.mjs';

const { values: args } = parseArgs({ options: { format: { type: 'string', default: 'master,landscape,vertical' }, only: { type: 'string' }, 'refetch-fonts': { type: 'boolean', default: false } } });
const OUT = ensureDir(path.join(WORK, 'cards'));
const only = args.only ? new Set(args.only.split(',')) : null;
const INK = '#2e1b0e';
const PARCHMENT = '#f5e6c8';
const BRASS = '#c4883a';
const TEAL = '#5b8a8a';
const LANTERN = '#ffe4a0';

async function ensureFonts(refetch) {
  const dir = ensureDir(path.join(WORK, 'fonts'));
  const manifestFile = path.join(dir, 'fonts.json');
  if (!refetch && existsSync(manifestFile)) {
    const cached = JSON.parse(readFileSync(manifestFile, 'utf8'));
    if (cached.faces.every((face) => existsSync(face.file) && sha256(face.file) === face.sha256)) return { ...cached, network: 0 };
  }
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Rye&family=Wellfleet';
  const css = await (await fetch(cssUrl, { headers: { 'user-agent': 'Mozilla/4.0' } })).text();
  let requests = 1;
  const faces = [];
  for (const block of css.split('@font-face').slice(1)) {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
    const url = block.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!family || !url) continue;
    if (!url.startsWith('https://fonts.gstatic.com/')) throw new Error(`cards: refusing a font URL outside fonts.gstatic.com: ${url}`);
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    requests += 1;
    const file = path.join(dir, `${family}-Regular${path.extname(new URL(url).pathname) || '.ttf'}`);
    writeFileSync(file, buf);
    faces.push({ family, url, file, bytes: buf.length, sha256: sha256(file) });
  }
  for (const family of ['Rye', 'Wellfleet']) if (!faces.some((face) => face.family === family)) throw new Error(`cards: Google Fonts returned no ${family}`);
  const manifest = { fetched: new Date().toISOString(), css: cssUrl, faces };
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return { ...manifest, network: requests };
}

const dataUri = (file, mime = 'image/png') => `data:${mime};base64,${readFileSync(file).toString('base64')}`;
const svgUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

// Procedural paper: ink speckle from Chromium's own turbulence filter (deterministic, no image generation).
const PAPER = svgUri('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.106  0 0 0 0 0.055  0 0 0 0.55 -0.12"/></filter><rect width="512" height="512" filter="url(#n)"/></svg>');
const GRAIN = svgUri('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="11" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.106  0 0 0 0 0.055  0 0 0 0.30 -0.08"/></filter><rect width="512" height="512" filter="url(#n)"/></svg>');

function baseCss(fonts) {
  const face = (family) => {
    const f = fonts.faces.find((x) => x.family === family);
    const fmt = f.file.endsWith('.woff2') ? 'woff2' : f.file.endsWith('.woff') ? 'woff' : 'truetype';
    return `@font-face{font-family:'${family}';src:url(${dataUri(f.file, `font/${fmt === 'truetype' ? 'ttf' : fmt}`)}) format('${fmt}');font-weight:400;font-style:normal;}`;
  };
  return `${face('Rye')}${face('Wellfleet')}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:transparent;overflow:hidden}
  #stage{position:relative;overflow:hidden}
  .slip{position:absolute;display:inline-block;color:${INK};font-family:'Wellfleet',Georgia,serif;line-height:1.22;text-align:center;
    border:3px solid ${INK};border-radius:12px;background:linear-gradient(135deg,rgba(255,248,232,.96),rgba(245,230,200,.985)),url(${PAPER}),${PARCHMENT};
    box-shadow:inset 0 0 0 3px rgba(139,125,60,.38),0 6px 0 rgba(46,27,14,.72),0 18px 34px rgba(46,27,14,.34);padding:20px 50px 22px;white-space:nowrap}
  .slip.rye{font-family:'Rye',Georgia,serif;letter-spacing:.02em;padding:16px 56px 20px;line-height:1.16}
  .slip.italic .txt{font-style:italic}
  .slip.night{box-shadow:inset 0 0 0 3px rgba(139,125,60,.38),0 6px 0 rgba(46,27,14,.72),0 0 64px 16px rgba(255,228,160,.40),0 0 18px 4px rgba(255,228,160,.55)}
  .slip.wrap{white-space:normal;text-wrap:balance}
  .rv{position:absolute;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 34% 32%,#ffe6b4 0,${BRASS} 48%,#6b4a1c 100%);box-shadow:0 1px 0 rgba(46,27,14,.6)}
  .teal .rv{background:radial-gradient(circle at 34% 32%,#d5f0ec 0,${TEAL} 50%,#2f4d4d 100%)}
  .rv.tl{top:8px;left:8px}.rv.tr{top:8px;right:8px}.rv.bl{bottom:8px;left:8px}.rv.br{bottom:8px;right:8px}
  .ghost{visibility:hidden}
  .masthead{padding:14px 64px 16px;letter-spacing:.14em}
  .masthead .rule{height:0;border-top:3px double ${INK};margin:0 -18px}
  .masthead .txt{padding:10px 0 8px}
  .teal{text-align:left;display:flex;align-items:center;gap:30px;padding:20px 46px 22px 24px}
  .teal .badge{flex:none;border-radius:50%;border:4px solid ${TEAL};box-shadow:0 0 0 2px ${INK},inset 0 0 12px rgba(46,27,14,.35);background-color:${PARCHMENT};background-repeat:no-repeat}
  .teal .lines div{white-space:nowrap}
  .mark{padding:6px 22px 8px;border-radius:9px;border-width:2px;font-style:italic}
  .mark .rv{width:8px;height:8px}.mark .rv.tl{top:5px;left:5px}.mark .rv.tr{top:5px;right:5px}.mark .rv.bl{bottom:5px;left:5px}.mark .rv.br{bottom:5px;right:5px}
  .lockup{position:absolute;display:flex;flex-direction:column;align-items:center;text-align:center}
  .lockup .scrim{position:absolute;left:-40%;right:-40%;top:-30%;bottom:-30%;background:radial-gradient(ellipse at center,rgba(20,14,10,.62) 0,rgba(20,14,10,.38) 45%,rgba(20,14,10,0) 72%);z-index:-1}
  .wordmark{font-family:'Rye',Georgia,serif;color:${PARCHMENT};line-height:1;letter-spacing:.03em;text-shadow:0 4px 0 ${INK},0 0 28px rgba(20,14,10,.75)}
  .tagline{font-family:'Wellfleet',Georgia,serif;font-style:italic;color:${LANTERN};text-shadow:0 2px 0 ${INK},0 0 18px rgba(20,14,10,.8)}
  .edition{font-family:'Wellfleet',Georgia,serif;color:${PARCHMENT};letter-spacing:.08em;text-shadow:0 2px 0 ${INK}}`;
}

// Where a card's centre sits, as a fraction of the frame height (and x for lowerLeft), per format.
const SLOTS = {
  master: { hook1: 0.25, upper: 0.2, bottom: 0.885, center: 0.47, leftX: 0.1 },
  landscape: { hook1: 0.25, upper: 0.21, bottom: 0.88, center: 0.47, leftX: 0.1 },
  vertical: { hook1: 0.21, upper: 0.2, upperLow: 0.31, bottom: 0.79, center: 0.44, leftX: null },
};

async function renderCard(page, fmtName, id, def, boxes, portrait) {
  const fmt = FORMATS[fmtName];
  const input = { id, def, fmtName, W: fmt.w, H: fmt.h, text: fmt.text, slots: SLOTS[fmtName], vertical: fmtName === 'vertical', boxes, portrait, emblem: EMBLEM_URI, lockup: LOCKUP };
  const box = await page.evaluate((p) => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '';
    stage.style.width = `${p.W}px`;
    stage.style.height = `${p.H}px`;
    const rivets = '<span class="rv tl"></span><span class="rv tr"></span><span class="rv bl"></span><span class="rv br"></span>';
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const d = p.def;
    const el = document.createElement('div');
    let size = d.size?.[p.fmtName] ?? (d.type === 'rye' ? p.text.rye : d.type === 'mark' ? (p.vertical ? 30 : 28) : p.text.slip);
    if (d.type === 'lockup') {
      el.className = 'lockup';
      const k = p.vertical ? 0.86 : p.H < 1150 ? 0.92 : 1;
      el.innerHTML = `<div class="scrim"></div><img src="${p.emblem}" style="width:${Math.round(210 * k)}px;height:${Math.round(210 * k)}px;margin-bottom:${Math.round(10 * k)}px"><div class="wordmark" style="font-size:${Math.round(150 * k)}px">${esc(p.lockup.wordmark)}</div><div class="tagline" style="font-size:${Math.round(52 * k)}px;margin-top:${Math.round(18 * k)}px">${esc(p.lockup.tagline)}</div>`;
    } else if (d.type === 'teal') {
      el.className = 'slip teal';
      const lines = d.lines.map((line, i) => `<div${i >= d.show ? ' class="ghost"' : ''}>${esc(line)}</div>`).join('');
      const badge = Math.round(size * 2.7);
      el.innerHTML = `${rivets}<div class="badge" style="width:${badge}px;height:${badge}px;background-image:url(${p.portrait});background-size:${Math.round(badge * 3.45)}px auto;background-position:${Math.round(-badge * 0.3)}px ${Math.round(-badge * 0.07)}px"></div><div class="lines">${lines}</div>`;
    } else if (d.type === 'masthead') {
      el.className = 'slip masthead';
      el.innerHTML = `${rivets}<div class="rule"></div><div class="txt">${esc(d.text)}</div><div class="rule"></div>`;
    } else {
      el.className = `slip ${d.type === 'rye' ? 'rye' : ''} ${d.type === 'mark' ? 'mark' : ''} ${d.italic ? 'italic' : ''} ${d.night ? 'night' : ''}`;
      el.innerHTML = `${rivets}<div class="txt">${esc(d.text)}${d.ghost ? `<span class="ghost">${esc(d.ghost)}</span>` : ''}</div>`;
    }
    if (d.type !== 'lockup') el.style.fontSize = `${size}px`;
    stage.appendChild(el);
    const maxW = Math.min(d.maxW ?? p.text.maxW, p.text.maxW);
    if (d.type !== 'lockup' && d.type !== 'mark' && el.offsetWidth > maxW) {
      if ((d.type === 'rye' && !p.vertical) || d.type === 'teal' || d.type === 'masthead') {
        while (el.offsetWidth > maxW && size > 30) { size -= 1; el.style.fontSize = `${size}px`; }
      } else {
        el.classList.add('wrap');
        el.style.width = `${maxW}px`;
        // shrink-wrap the balanced lines: narrow the box while the line count holds
        const lines = () => Math.round(el.querySelector('.txt, .lines')?.getBoundingClientRect().height / (size * 1.22)) || 1;
        const n = lines();
        let w = maxW;
        while (w > 300) { el.style.width = `${w - 10}px`; if (lines() > n) { el.style.width = `${w}px`; break; } w -= 10; }
      }
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let x = (p.W - w) / 2;
    let y;
    if (d.type === 'mark') { x = p.W - Math.round(p.W * 0.05) - w; y = p.H - Math.round(p.H * (p.vertical ? 0.1 : 0.05)) - h; }
    else if (d.at === 'hook2') { const up = p.boxes['b1-they-dont-want']; y = up.y + up.h + 18; }
    else if (d.at === 'lower' || d.at === 'lowerLeft') { if (d.at === 'lowerLeft' && p.slots.leftX !== null) x = Math.round(p.W * p.slots.leftX); y = p.slots.bottom * p.H - h; }
    else y = p.slots[(p.vertical && d.atV) || d.at] * p.H - h / 2;
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    const text = el.querySelector('.txt, .lines');
    const lineCount = text ? Math.round(text.getBoundingClientRect().height / (size * 1.22)) : 1;
    return { x: Math.round(x), y: Math.round(y), w, h, size, lines: lineCount };
  }, input);
  const file = path.join(OUT, fmtName, `${id}.png`);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: fmt.w, height: fmt.h } });
  const safe = def.type === 'mark' ? 0.05 : 0.1;
  const inSafe = box.x >= fmt.w * safe - 0.5 && box.y >= fmt.h * safe - 0.5 && box.x + box.w <= fmt.w * (1 - safe) + 0.5 && box.y + box.h <= fmt.h * (1 - safe) + 0.5;
  return { ...box, file, safe: inSafe };
}

async function renderFrameLayers(page, fmtName) {
  const fmt = FORMATS[fmtName];
  const { x, y, w, h } = fmt.page;
  const common = async (html, file, omit = true) => {
    await page.evaluate(([W, H, inner]) => { const s = document.getElementById('stage'); s.style.width = `${W}px`; s.style.height = `${H}px`; s.innerHTML = inner; }, [fmt.w, fmt.h, html]);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, fmtName, file), omitBackground: omit, clip: { x: 0, y: 0, width: fmt.w, height: fmt.h } });
  };
  const frameHole = `M0 0H${fmt.w}V${fmt.h}H0Z M${x} ${y}V${y + h}H${x + w}V${y}Z`;
  await common(`<div style="position:absolute;inset:0;clip-path:path(evenodd,'${frameHole}');background:radial-gradient(ellipse at center,rgba(245,230,200,0) 58%,rgba(120,80,40,.34) 100%),url(${PAPER}),${PARCHMENT}"></div>
    <div style="position:absolute;left:${x - 9}px;top:${y - 9}px;width:${w + 18}px;height:${h + 18}px;border:2px solid ${BRASS};border-radius:3px"></div>
    <div style="position:absolute;left:${x - 3}px;top:${y - 3}px;width:${w + 6}px;height:${h + 6}px;border:3px solid ${INK}"></div>
    <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-shadow:inset 0 0 22px rgba(46,27,14,.5)"></div>`, 'page.png');
  await common(`<div style="position:absolute;inset:0;background:url(${GRAIN})"></div>`, 'grain.png');
  // the end card: the valley plate darkened to ledger-ink, the emblem, the wordmark, the two lines on slips
  const k = fmtName === 'vertical' ? 1 : fmt.h < 1150 ? 0.9 : 1;
  const px = (n) => `${Math.round(n * k)}px`;
  const rivets = '<span class="rv tl"></span><span class="rv tr"></span><span class="rv bl"></span><span class="rv br"></span>';
  const e = END_CARD;
  await common(`<div style="position:absolute;inset:0;background:linear-gradient(rgba(46,27,14,.86),rgba(46,27,14,.86)),url(${VALLEY_URI}) center/cover"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(20,14,10,0) 45%,rgba(20,14,10,.6) 100%)"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="slip" style="position:relative;font-size:${px(fmtName === 'vertical' ? 44 : 46)}">${rivets}<div class="txt">${e.top}</div></div>
      <img src="${EMBLEM_URI}" style="width:${px(fmtName === 'vertical' ? 230 : 180)};height:${px(fmtName === 'vertical' ? 230 : 180)};margin-top:${px(40)}">
      <div class="wordmark" style="font-size:${px(fmtName === 'vertical' ? 124 : 128)};margin-top:${px(6)}">${e.wordmark}</div>
      <div class="tagline" style="font-size:${px(44)};margin-top:${px(14)}">${e.tagline}</div>
      <div class="edition" style="font-size:${px(34)};margin-top:${px(10)}">${e.edition}</div>
      <div class="slip" style="position:relative;font-size:${px(fmtName === 'vertical' ? 31 : 36)};margin-top:${px(40)};line-height:1.45">${rivets}<div class="txt">${e.links.map((l) => `<div>${l}</div>`).join('')}</div></div>
    </div>`, 'endcard.png', false);
}

async function renderOnce(browser) {
  // the menu's backdrop, drawn from the treatment's valley plate with the game's own CSS (src/styles.css:61-86:
  // cover, centre right, the radial vignette), at each take geometry so it matches the live menu in every format
  for (const [w, h, dsf] of [[1280, 800, 1.5], [390, 844, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
    const page = await ctx.newPage();
    await page.route('**/*', (route) => { ABORTED += 1; return route.abort(); });
    await page.setContent(`<html><body style="margin:0;background:#000"><div style="position:fixed;inset:0;background-image:url(${VALLEY_URI});background-repeat:no-repeat;background-position:center right;background-size:cover"><div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(35,22,12,.12) 0 30%,rgba(20,14,10,.82) 100%)"></div></div></body></html>`);
    await page.screenshot({ path: path.join(OUT, `menu-still-${w * dsf}x${h * dsf}.png`) });
    await ctx.close();
  }
  // B2's hand-cut layers at the plate's own size: the near scrub and rocks below the traced line (feathered, 2.2 px)
  const ctx = await browser.newContext({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.route('**/*', (route) => { ABORTED += 1; return route.abort(); });
  const line = VALLEY_NEAR_LINE;
  const below = `${line.map(([a, b]) => `${a},${b}`).join(' ')} 1672,941 0,941`;
  const mask = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><filter id="f"><feGaussianBlur stdDeviation="2.2"/></filter><polygon points="${below}" fill="#fff" filter="url(#f)"/></svg>`);
  // the far layer: under the traced line, the bank's own pixels from just above it, cloned straight down (no blur,
  // no mirror), so the frame is unchanged while the layers agree and the bank simply continues where they part
  const CLONE = 18;
  const clip = `polygon(${line.map(([a, b]) => `${a}px ${b + 1}px`).join(',')},1672px 941px,0px 941px)`;
  await page.setContent(`<html><body style="margin:0;background:transparent"><img src="${VALLEY_URI}" style="position:absolute;left:0;top:0;-webkit-mask-image:url(${mask});mask-image:url(${mask})"></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'b2-near.png'), omitBackground: true });
  await page.setContent(`<html><body style="margin:0;background:#000;overflow:hidden"><img src="${VALLEY_URI}" style="position:absolute;left:0;top:0"><div style="position:absolute;inset:0;clip-path:${clip};overflow:hidden"><img src="${VALLEY_URI}" style="position:absolute;left:0;top:${CLONE}px"></div></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'b2-far.png') });
  await ctx.close();
  return { b2CloneShift: CLONE };
}

let ABORTED = 0;
const VALLEY_URI = dataUri(platePath(PLATES.valley));
const EMBLEM_URI = dataUri(EMBLEM);
const PORTRAIT_URI = dataUri(platePath(PLATES.portrait));

const fonts = await ensureFonts(args['refetch-fonts']);
const browser = await chromium.launch({ headless: true });
const manifestFile = path.join(OUT, 'manifest.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { formats: {} };
manifest.fonts = fonts.faces.map(({ family, url, bytes, sha256: hash }) => ({ family, url, bytes, sha256: hash }));
manifest.fontNetworkRequests = fonts.network;
if (!only) Object.assign(manifest, await renderOnce(browser));
for (const fmtName of args.format.split(',')) {
  ensureDir(path.join(OUT, fmtName));
  const fmt = FORMATS[fmtName];
  const ctx = await browser.newContext({ viewport: { width: fmt.w, height: fmt.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.route('**/*', (route) => { ABORTED += 1; return route.abort(); });
  await page.setContent(`<html><head><style>${baseCss(fonts)}</style></head><body><div id="stage"></div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(async () => { await document.fonts.load('74px Rye'); await document.fonts.load('46px Wellfleet'); return { rye: document.fonts.check('74px Rye'), wellfleet: document.fonts.check('46px Wellfleet') }; });
  if (!loaded.rye || !loaded.wellfleet) throw new Error(`cards: a face failed to load (${JSON.stringify(loaded)}); refusing to fall back`);
  const boxes = manifest.formats[fmtName]?.cards ?? {};
  for (const [id, def] of Object.entries(CARDS)) {
    if (only && !only.has(id)) continue;
    boxes[id] = await renderCard(page, fmtName, id, def, boxes, PORTRAIT_URI);
  }
  if (!only) await renderFrameLayers(page, fmtName);
  manifest.formats[fmtName] = { cards: boxes, page: fmt.page };
  await ctx.close();
}
await browser.close();
manifest.browserRequestsRefused = ABORTED;
manifest.rendered = new Date().toISOString();
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
const unsafe = Object.entries(manifest.formats).flatMap(([f, m]) => Object.entries(m.cards).filter(([, b]) => !b.safe).map(([id]) => `${f}/${id}`));
console.log(`cards: fonts ${manifest.fonts.map((f) => `${f.family} ${f.bytes} B sha256 ${f.sha256.slice(0, 12)}`).join(', ')}; font requests this run ${fonts.network}; browser requests refused ${ABORTED}`);
console.log(`cards: ${Object.values(manifest.formats).reduce((n, m) => n + Object.keys(m.cards).length, 0)} cards across ${Object.keys(manifest.formats).join(', ')}; outside the safe area: ${unsafe.length ? unsafe.join(' ') : 'none'}`);
