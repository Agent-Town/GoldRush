#!/usr/bin/env node
/**
 * capture-compare.mjs: site-vibe-fixes-1 evidence. Serves four builds of site/ (the branch base and the tree after
 * each of the task's three commits) on scratch ports, screenshots the landing full-page in light and dark, and
 * compares the builds pixel by pixel. Three shapes: the repo's two e2e shapes as playwright.config.ts sets them
 * (Desktop Chrome 1280x800, and Pixel 5 at 390x844, whose device pixel ratio is 2.75), plus the same Pixel 5 at
 * ratio 1, so the 390-wide layout is also judged without fractional scaling.
 *
 * STATUS (2026-09-26): THIS REVISION HAS NOT BEEN RUN. It adds REPS and the height-matched control after run 4,
 * and its queued batch was withdrawn on the attended session's word to free the drain lock. The committed
 * capture-compare.json and shots/ come from run 4 of the previous revision: one capture per build, each in a fresh
 * browser, plus a second capture of the base and the tip as self-controls (capture-runs/batch4-capture.log).
 * Running this revision under the lock is the cure the report names for F-SVF1-1.
 *
 * THE INSTRUMENT IS NOT BIT-STABLE, SO IT IS MEASURED AND CONTROLLED, NEVER TRUSTED (learned on this task's first
 * three runs). (1) Random captures of one build differ from its other captures in the image band by up to 31
 * levels, with one browser for every capture or with a fresh browser each time. (2) At ratio 2.75 a page that is
 * 18 px shorter rasterizes the images ABOVE its footer slightly differently (5,270 weak pixels, max 15, the same
 * count in two runs), while at ratio 1 it does not. Two controls answer them:
 *   REPS: every build is captured REPS times, each in a fresh browser, interleaved in time. Two builds count as
 *   identical when ANY capture of one matches ANY capture of the other exactly in the judged region; a real
 *   difference survives all REPS x REPS combinations, a flicker does not. The spread inside each build is reported.
 *   HEIGHT-MATCHED: where the footer change shortens the page, the tip is captured again with the lost height added
 *   as padding BELOW the footer. If the rows above the footer then match exactly, the weak difference was the page
 *   height's effect on rasterization, not a change of content above the footer.
 *
 * THE VERDICTS. "identical": some combination matches exactly over the whole page. "footer-only": the footer's top
 * is where it was, any change in page height equals the change in the footer's own height, and some combination
 * matches exactly in every row above the footer's top (directly, or against the height-matched tip).
 *
 * NO NETWORK. Every request that is not to the local server is answered or refused inside the browser: the
 * county's standings and rotation calls to agenttown.app get a local `200 {"ok":false}`, which drives the page's
 * own caught-error branches ("the wire is quiet") without a console error; anything else is aborted and counted.
 * Nothing leaves the machine. The page's refresh timer is pushed to an hour, as e2e/cost-column.spec.ts does.
 *
 * Run it inside the drain lock (scripts/attended/dlock.sh); it starts and stops its own servers in-process.
 *   node artifacts/site-vibe-fixes-1/capture-compare.mjs --port 5661 --scratch <dir outside the repo> [--reps 3]
 */
import { chromium, devices } from '@playwright/test';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const PORT = Number(opt('--port', '5661'));
const REPS = Number(opt('--reps', '3'));
const SCRATCH = resolve(opt('--scratch', ''));
const OUT = resolve(opt('--out', HERE));
if (!opt('--scratch') || SCRATCH.startsWith(ROOT + sep)) throw new Error('--scratch must name a directory outside the repository');

const VARIANTS = [
  { id: 'v0-base', rev: 'afd7393e9', what: 'branch base: three inlined images, HUD-frame card, token link' },
  { id: 'v1-files', rev: '16c090887', what: 'the three illustrations as files (F-VIBE-3)' },
  { id: 'v2-card', rev: 'a7c75b5cd', what: 'plus the illustrated share card (F-VIBE-2)' },
  { id: 'v3-footer', rev: '21fe841e4', what: 'plus the footer without the token link (F-VIBE-5)' },
];
const SHAPES = [
  { id: 'desktop', device: devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
  { id: 'mobile390', device: devices['Pixel 5'], viewport: { width: 390, height: 844 } },
  { id: 'mobile390-dpr1', device: devices['Pixel 5'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 },
];
const SCHEMES = ['light', 'dark'];
const PAIRS = [
  ['v0-base', 'v1-files', 'identical'],
  ['v1-files', 'v2-card', 'identical'],
  ['v2-card', 'v3-footer', 'footer-only'],
  ['v0-base', 'v3-footer', 'footer-only'],
];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

function exportRev(rev, dir) {
  mkdirSync(dir, { recursive: true });
  execFileSync('sh', ['-c', 'git -C "$1" archive "$2" site | tar -x -C "$3"', 'sh', ROOT, rev, dir]);
  return join(dir, 'site');
}

function serve(root, port, log) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
      log.push({ path: url.pathname + url.search, status: 404 });
      res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
      return;
    }
    const body = readFileSync(file);
    log.push({ path: url.pathname + url.search, status: 200, bytes: body.length });
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  });
  return new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', () => ok(server)); });
}

/** One capture in its own browser. `padBelowFooter` adds that many CSS px to the page's bottom padding. */
async function capture(shape, scheme, port, padBelowFooter = 0) {
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const context = await browser.newContext({
      ...shape.device, viewport: shape.viewport, deviceScaleFactor: shape.deviceScaleFactor ?? shape.device.deviceScaleFactor,
      colorScheme: scheme, reducedMotion: 'reduce',
    });
    const net = { local: 0, stubbed: [], aborted: [] };
    await context.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.protocol === 'data:') return route.continue();
      if (u.hostname === '127.0.0.1' && Number(u.port) === port) { net.local += 1; return route.continue(); }
      if (u.hostname === 'agenttown.app') {
        net.stubbed.push(u.pathname + u.search);
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false}' });
      }
      net.aborted.push(`${u.protocol}//${u.hostname}${u.pathname}`);
      return route.abort();
    });
    await context.addInitScript(() => { window.__ASSAY_REFRESH_MS__ = 3_600_000; });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.querySelector('[data-standings="rows"]')?.textContent.includes('the wire is quiet')
      && document.querySelector('[data-rotation="window"]')?.textContent === 'the rotation wire is quiet', null, { timeout: 30_000 });
    if (padBelowFooter) await page.addStyleTag({ content: `.wrap{padding-bottom:calc(4rem + ${padBelowFooter}px) !important}` });
    const images = await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => null)));
      return [...document.images].map((img) => ({
        src: img.getAttribute('src').startsWith('data:') ? `data:... (${img.getAttribute('src').length} chars)` : img.getAttribute('src'),
        complete: img.complete, natural: `${img.naturalWidth}x${img.naturalHeight}`,
      }));
    });
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    const facts = await page.evaluate(() => {
      const box = document.querySelector('footer.colophon').getBoundingClientRect();
      return {
        dpr: devicePixelRatio,
        docHeight: document.documentElement.scrollHeight,
        footer: { top: box.top + scrollY, bottom: box.bottom + scrollY },
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.content,
        footerLinks: [...document.querySelectorAll('footer.colophon a')].map((a) => a.textContent),
      };
    });
    const png = await page.screenshot({ fullPage: true, type: 'png', animations: 'disabled', caret: 'hide' });
    await context.close();
    return { png, images, facts, net, consoleErrors, pageErrors };
  } finally {
    await browser.close();
  }
}

/** Differing pixels over the overlap of two decoded captures; rows above splitY form the judged region. */
function compare(a, b, splitY) {
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  let diffPixels = 0;
  let maxDelta = 0;
  let judgedPixels = 0;
  let judgedMaxDelta = 0;
  let box = null;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * a.width + x) * 4;
      const j = (y * b.width + x) * 4;
      const delta = Math.max(Math.abs(a.data[i] - b.data[j]), Math.abs(a.data[i + 1] - b.data[j + 1]), Math.abs(a.data[i + 2] - b.data[j + 2]), Math.abs(a.data[i + 3] - b.data[j + 3]));
      if (!delta) continue;
      diffPixels += 1;
      maxDelta = Math.max(maxDelta, delta);
      box = box ? { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x), y1: Math.max(box.y1, y) } : { x0: x, y0: y, x1: x, y1: y };
      if (y < splitY) { judgedPixels += 1; judgedMaxDelta = Math.max(judgedMaxDelta, delta); }
    }
  }
  return { sizeA: `${a.width}x${a.height}`, sizeB: `${b.width}x${b.height}`, diffPixels, maxDelta, box, judgedPixels, judgedMaxDelta };
}

/** Every combination of two builds' captures; the best is the closest match, the worst the furthest. */
function combos(capsA, capsB, splitY) {
  const all = [];
  capsA.forEach((a, i) => capsB.forEach((b, j) => all.push({ i, j, ...compare(a.img, b.img, splitY) })));
  all.sort((p, q) => p.judgedPixels - q.judgedPixels);
  return { best: all[0], worst: all.at(-1), exactCombos: all.filter((c) => c.judgedPixels === 0).length, combos: all.length };
}

/** The footer band plus a margin, full width, as a lossless PNG; with `maskAgainst`, differing pixels painted red. */
async function footerCrop(pngBuf, facts, file, maskAgainst = null) {
  const img = PNG.sync.read(pngBuf);
  const top = Math.max(0, Math.floor((facts.footer.top - 16) * facts.dpr));
  const bottom = Math.min(img.height, Math.ceil((facts.footer.bottom + 16) * facts.dpr));
  let buffer = await sharp(pngBuf).extract({ left: 0, top, width: img.width, height: bottom - top }).png().toBuffer();
  if (maskAgainst) {
    const other = PNG.sync.read(maskAgainst);
    const out = PNG.sync.read(buffer);
    for (let y = 0; y < out.height; y += 1) {
      for (let x = 0; x < out.width; x += 1) {
        const i = (y * out.width + x) * 4;
        const j = ((y + top) * other.width + x) * 4;
        const same = y + top < other.height && x < other.width && out.data[i] === other.data[j] && out.data[i + 1] === other.data[j + 1] && out.data[i + 2] === other.data[j + 2];
        if (same) { out.data[i] = out.data[i + 1] = out.data[i + 2] = Math.round(out.data[i] * 0.25 + 180); } else { out.data[i] = 220; out.data[i + 1] = 30; out.data[i + 2] = 30; }
      }
    }
    buffer = PNG.sync.write(out);
  }
  writeFileSync(file, buffer);
  return { file: file.slice(ROOT.length + 1), rows: `${top}..${bottom}`, bytes: buffer.length };
}

const started = Date.now();
const caps = {};
const logs = {};
const servers = [];
const cell = (variant, shape, scheme) => `${variant}/${shape}/${scheme}`;
const pushCap = (key, rep, r) => { (caps[key] ??= []).push({ rep, ...r }); };
const pad = {};
try {
  for (const [index, variant] of VARIANTS.entries()) {
    variant.port = PORT + index;
    logs[variant.id] = [];
    servers.push(await serve(exportRev(variant.rev, join(SCRATCH, variant.id)), variant.port, logs[variant.id]));
  }
  // Interleaved in time: every build and shape once, then again, REPS times.
  for (let rep = 1; rep <= REPS; rep += 1) {
    for (const variant of VARIANTS) {
      for (const shape of SHAPES) {
        for (const scheme of SCHEMES) pushCap(cell(variant.id, shape.id, scheme), rep, await capture(shape, scheme, variant.port));
      }
    }
  }
  // The height-matched tip: the footer height the token link's line took, added back below the footer.
  const tip = VARIANTS.find((v) => v.id === 'v3-footer');
  for (const shape of SHAPES) {
    for (const scheme of SCHEMES) {
      const withLink = caps[cell('v2-card', shape.id, scheme)][0].facts.footer;
      const without = caps[cell('v3-footer', shape.id, scheme)][0].facts.footer;
      const lost = (withLink.bottom - withLink.top) - (without.bottom - without.top);
      if (Math.abs(lost) < 0.001) continue;
      pad[`${shape.id}/${scheme}`] = lost;
      for (let rep = 1; rep <= REPS; rep += 1) pushCap(cell('v3-footer+height', shape.id, scheme), rep, await capture(shape, scheme, tip.port, lost));
    }
  }
} finally {
  await Promise.all(servers.map((server) => new Promise((done) => server.close(done))));
}

// Every raw capture stays OUTSIDE the repository, so the committed evidence can be re-derived without a browser.
mkdirSync(join(SCRATCH, 'png'), { recursive: true });
for (const [key, list] of Object.entries(caps)) for (const c of list) writeFileSync(join(SCRATCH, 'png', `${key.replaceAll('/', '--')}--rep${c.rep}.png`), c.png);

const comparisons = [];
const stability = [];
for (const shape of SHAPES) {
  for (const scheme of SCHEMES) {
    // Decode this shape and scheme's captures once, and let them go before the next group.
    const group = Object.fromEntries(Object.entries(caps).filter(([key]) => key.endsWith(`/${shape.id}/${scheme}`))
      .map(([key, list]) => [key.split('/')[0], list.map((c) => ({ ...c, img: PNG.sync.read(c.png) }))]));
    for (const [variant, list] of Object.entries(group)) {
      const within = [];
      for (let i = 0; i < list.length; i += 1) for (let j = i + 1; j < list.length; j += 1) within.push(compare(list[i].img, list[j].img, Number.MAX_SAFE_INTEGER));
      stability.push({ shape: shape.id, scheme, variant, capturePairs: within.length, exactPairs: within.filter((c) => c.diffPixels === 0).length,
        maxDiffPixels: Math.max(...within.map((c) => c.diffPixels)), maxDelta: Math.max(...within.map((c) => c.maxDelta)) });
    }
    for (const [a, b, expect] of PAIRS) {
      const A = group[a];
      const B = group[b];
      const fa = A[0].facts;
      const fb = B[0].facts;
      const footerPair = expect === 'footer-only';
      const footerTopPx = Math.floor(Math.min(fa.footer.top, fb.footer.top) * fa.dpr);
      const direct = combos(A, B, footerPair ? footerTopPx : Number.MAX_SAFE_INTEGER);
      const footerHeightDelta = (fb.footer.bottom - fb.footer.top) - (fa.footer.bottom - fa.footer.top);
      const pageHeightDelta = fb.docHeight - fa.docHeight;
      const footerTopSame = fa.footer.top === fb.footer.top;
      const heightExplained = Math.abs(pageHeightDelta - footerHeightDelta) < 1;
      const matched = footerPair && group['v3-footer+height'] ? combos(A, group['v3-footer+height'], footerTopPx) : null;
      const exact = direct.best.judgedPixels === 0 || Boolean(matched && matched.best.judgedPixels === 0);
      const pass = footerPair ? footerTopSame && heightExplained && exact : exact;
      comparisons.push({
        shape: shape.id, scheme, a, b, expect, pass, exactDirect: direct.best.judgedPixels === 0,
        exactHeightMatched: matched ? matched.best.judgedPixels === 0 : null, direct, heightMatched: matched,
        judgedRegion: footerPair ? `rows above the footer's top (device row ${footerTopPx})` : 'the whole page',
        footerTopPx, footerTopSame, pageHeightDeltaCss: pageHeightDelta, footerHeightDeltaCss: Number(footerHeightDelta.toFixed(3)), heightExplained,
      });
    }
  }
}

// Evidence: the base and the tip, light, as the best-matching capture pair of the base -> tip comparison.
const shotsDir = join(OUT, 'shots');
mkdirSync(shotsDir, { recursive: true });
const evidence = [];
for (const shape of SHAPES.filter((s) => s.id !== 'mobile390-dpr1')) {
  const row = comparisons.find((c) => c.shape === shape.id && c.scheme === 'light' && c.a === 'v0-base' && c.b === 'v3-footer');
  const before = caps[cell('v0-base', shape.id, 'light')][row.direct.best.i];
  const after = caps[cell('v3-footer', shape.id, 'light')][row.direct.best.j];
  for (const [label, shot] of [['before', before], ['after', after]]) {
    const file = join(shotsDir, `${label}-${shape.id}-light.jpg`);
    const jpg = await sharp(shot.png).resize({ width: shape.viewport.width }).jpeg({ quality: 78 }).toBuffer();
    writeFileSync(file, jpg);
    const meta = await sharp(jpg).metadata();
    evidence.push({ file: file.slice(ROOT.length + 1), bytes: jpg.length, pixels: `${meta.width}x${meta.height}`, capture: `${label === 'before' ? 'v0-base' : 'v3-footer'} rep ${shot.rep}` });
    evidence.push(await footerCrop(shot.png, shot.facts, join(shotsDir, `footer-${label}-${shape.id}-light.png`)));
  }
  evidence.push(await footerCrop(after.png, after.facts, join(shotsDir, `footer-diff-${shape.id}-light.png`), before.png));
}

const flat = Object.entries(caps).flatMap(([key, list]) => list.map((c) => ({ key, ...c })));
const summary = {
  ranAt: new Date(started).toISOString(), seconds: Math.round((Date.now() - started) / 1000), ports: VARIANTS.map((v) => v.port), reps: REPS,
  variants: VARIANTS, heightMatchedPaddingCss: pad,
  captures: Object.fromEntries(flat.map((c) => [`${c.key}#${c.rep}`, {
    docHeight: c.facts.docHeight, dpr: c.facts.dpr, footer: c.facts.footer, ogImage: c.facts.ogImage, twitterImage: c.facts.twitterImage,
    footerLinks: c.facts.footerLinks, images: c.images, localRequests: c.net.local, stubbedCountyCalls: c.net.stubbed.length,
    stubbedPaths: [...new Set(c.net.stubbed.map((p) => p.split('?')[0]))], aborted: c.net.aborted, consoleErrors: c.consoleErrors, pageErrors: c.pageErrors,
  }])),
  servers: Object.fromEntries(VARIANTS.map((v) => [v.id, {
    requests: logs[v.id].length, notFound: logs[v.id].filter((e) => e.status !== 200).map((e) => e.path),
    served: [...new Set(logs[v.id].map((e) => `${e.path} ${e.status}${e.bytes ? ` ${e.bytes}B` : ''}`))],
  }])),
  stability,
  comparisons,
  evidence,
};
const allPass = comparisons.every((c) => c.pass);
const clean = Object.values(summary.captures).every((c) => !c.consoleErrors.length && !c.pageErrors.length && !c.aborted.length);
const noMissing = Object.values(summary.servers).every((s) => !s.notFound.length);
summary.verdict = { comparisonsPass: allPass, zeroConsoleAndPageErrors: clean, zeroNotFound: noMissing, captures: flat.length };
writeFileSync(join(OUT, 'capture-compare.json'), `${JSON.stringify(summary, null, 2)}\n`);

for (const s of stability) console.log(`stability ${s.shape}/${s.scheme} ${s.variant}: ${s.exactPairs} of ${s.capturePairs} capture pairs exact (worst ${s.maxDiffPixels} px, max delta ${s.maxDelta})`);
for (const c of comparisons) {
  const d = c.direct;
  console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.shape}/${c.scheme} ${c.a} -> ${c.b} (${c.expect}): ${d.best.sizeA} vs ${d.best.sizeB}; judged region `
    + `best ${d.best.judgedPixels} px (combo ${d.best.i}/${d.best.j}), worst ${d.worst.judgedPixels} px (max ${d.worst.judgedMaxDelta}), exact in ${d.exactCombos} of ${d.combos}`
    + (c.heightMatched ? `; height-matched best ${c.heightMatched.best.judgedPixels} px, exact in ${c.heightMatched.exactCombos} of ${c.heightMatched.combos}` : '')
    + (c.expect === 'footer-only' ? `; whole page best ${d.best.diffPixels} px within y ${d.best.box ? `${d.best.box.y0}..${d.best.box.y1}` : 'none'}; footer top px ${c.footerTopPx} same=${c.footerTopSame}; page height ${c.pageHeightDeltaCss} vs footer height ${c.footerHeightDeltaCss} css px` : ''));
}
console.log(`verdict ${JSON.stringify(summary.verdict)}; ${summary.seconds}s`);
process.exit(allPass && clean && noMissing ? 0 : 1);
