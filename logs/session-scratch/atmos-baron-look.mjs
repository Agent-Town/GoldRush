// THE ATMOSPHERICS SHIFT — baron before/after at the poses where the apron IS the horizon.
// `?baronHorizon=off` is the control arm, so both frames come off the same tree and the same
// dev server minutes apart.
//   node logs/session-scratch/atmos-baron-look.mjs
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.GR_BASE ?? 'http://127.0.0.1:5301';

async function boot(context, off) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => { errors.push('PAGEERROR ' + String(e).slice(0, 200)); console.error('[pageerror]', String(e).slice(0, 250)); });
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`${BASE}/?debug${off ? '&baronHorizon=off' : ''}&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&nokill&tier=full&seed=atmos-horizon`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 90_000 });
  await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready', undefined, { timeout: 90_000 });
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  return { page, errors };
}

async function settle(page, frames) {
  const from = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
  await page.waitForFunction(([start, count]) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > start + count, [from, frames], { timeout: 60_000 });
}

// Three settled 180-frame windows, keep the median: a single window on this box swung 26.5 and
// 10.4 ms for the same unchanged scene (reviews/beauty-baron.md).
async function perf(page) {
  const runs = [];
  for (let pass = 0; pass < 3; pass += 1) {
    await settle(page, 200);
    runs.push(await page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      return { p95: d.frameMs.p95, avg: +d.frameMs.avg.toFixed(2), calls: d.renderer.calls, tris: d.renderer.triangles };
    }));
  }
  runs.sort((a, b) => a.p95 - b.p95);
  return runs[1];
}

function bandStats(buffer, topFraction = 0.34) {
  const png = PNG.sync.read(buffer);
  const rows = Math.round(png.height * topFraction);
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * 4;
      const lum = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
      sum += lum;
      sumSq += lum * lum;
      r += png.data[i];
      g += png.data[i + 1];
      b += png.data[i + 2];
      n += 1;
    }
  }
  const mean = sum / n;
  return {
    mean: +mean.toFixed(1),
    stdev: +Math.sqrt(sumSq / n - mean * mean).toFixed(1),
    rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)],
  };
}

function diff(a, b, topFraction = 0.34) {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  const rows = Math.round(pa.height * topFraction);
  let n = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < pa.width; x += 1) {
      const i = (y * pa.width + x) * 4;
      if (Math.abs(pa.data[i] - pb.data[i]) > 6 || Math.abs(pa.data[i + 1] - pb.data[i + 1]) > 6 || Math.abs(pa.data[i + 2] - pb.data[i + 2]) > 6) n += 1;
    }
  }
  return +((n / (pa.width * rows)) * 100).toFixed(2);
}

const QUICK = process.env.GR_ATMOS_QUICK === '1';
const POSES = QUICK ? [['3-far-bank', -22], ['4-far-edge', -30]] : [
  ['1-fresh-eye', 8.65],
  ['2-crossing', -10],
  ['3-far-bank', -22],
  ['4-far-edge', -30],
];

const browser = await chromium.launch();
const VIEWPORTS = QUICK ? [['desktop', { viewport: { width: 1280, height: 800 } }]] : [
  ['desktop', { viewport: { width: 1280, height: 800 } }],
  ['mobile', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
];
for (const [label, opts] of VIEWPORTS) {
  const context = await browser.newContext(opts);
  const shots = {};
  for (const arm of ['before', 'after']) {
    const { page, errors } = await boot(context, arm === 'before');
    for (const [name, z] of POSES) {
      await page.evaluate((pz) => window.__GR_TEST__?.teleport(0, pz), z);
      await settle(page, 240);
      shots[`${arm}:${name}`] = await page.screenshot({ path: `artifacts/beauty-atmos/baron/${arm}/${label}-${name}.png` });
    }
    // p95 at the far-bank pose, where the apron owns a third of the frame.
    await page.evaluate(() => window.__GR_TEST__?.teleport(0, -22));
    await settle(page, 240);
    shots[`${arm}:perf`] = await perf(page);
    shots[`${arm}:errors`] = errors;
    await page.close();
  }
  console.log('##', label);
  for (const [name] of POSES) {
    const before = bandStats(shots[`before:${name}`]);
    const after = bandStats(shots[`after:${name}`]);
    console.log(' ', name.padEnd(12),
      'topBand lum', String(before.mean).padStart(5), '->', String(after.mean).padStart(5),
      '| stdev', String(before.stdev).padStart(5), '->', String(after.stdev).padStart(5),
      '| rgb', JSON.stringify(before.rgb), '->', JSON.stringify(after.rgb),
      '| changed%', diff(shots[`before:${name}`], shots[`after:${name}`]));
  }
  console.log('  perf before', JSON.stringify(shots['before:perf']), 'after', JSON.stringify(shots['after:perf']));
  console.log('  errors before', shots['before:errors'].length, 'after', shots['after:errors'].length, shots['after:errors'].slice(0, 2));
  await context.close();
}
await browser.close();
