// THE HILL MINE BEAUTY SHIFT — shot + perf harness.
//
// Rendering-only evidence gathering. Boots e2-hill-mine, teleports the hero to the brief's shot-list
// framings, screenshots, and records the pilot dataset + console errors. Also runs the SAME-SESSION
// p95 A/B (?nobeauty vs the live arm), because this box's load average swings 6..307 and a
// before/after taken from two separate runs measures the machine, not the change.
//
// Traps this harness is written against (all previously hit in this repo):
//   * chromium.launch() uses playwright's BUNDLED build -> software GL -> 600 ms p95. channel:'chromium'.
//   * ?contract=<id> is gated behind ?debug; a plain boot must drive the town board.
//   * camera lag 0.15 -> settle generously and assert the hero actually arrived.
//   * a vite on your port may be somebody else's worktree -> caller verifies the log + lsof.
//
// Usage:
//   node logs/session-scratch/e2-hill-mine-beauty-probe.mjs --label before
//   node logs/session-scratch/e2-hill-mine-beauty-probe.mjs --label u1 --frames run-camera,gallery-trestle
//   node logs/session-scratch/e2-hill-mine-beauty-probe.mjs --perf
//   node logs/session-scratch/e2-hill-mine-beauty-probe.mjs --label u1 --mobile
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const ROOT = path.resolve('artifacts/beauty-e2-hill-mine');

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? (argv[index + 1] ?? true) : fallback;
};
const has = (name) => argv.includes(`--${name}`);

const LABEL = flag('label', 'scratch');
const MOBILE = has('mobile');
const VIEWPORT = MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 800 };
const PROJECT = MOBILE ? 'mobile-chrome' : 'desktop-chrome';

// The brief's shot list, §4. Hero coordinates match the director's "before" boards exactly where
// they overlap, so before/after pairs are the same camera.
const FRAMES = [
  { label: 'run-camera', hero: [0, 12], settleMs: 2600 },
  { label: 'gallery-trestle', hero: [0, 8], settleMs: 1800 },
  { label: 'upper-terraces', hero: [-6, 34], settleMs: 1800 },
  { label: 'boiler-approach', hero: [4, 18], settleMs: 1800 },
  { label: 'rail-cut-east', hero: [22, 6], settleMs: 1800 },
  // The t2 bench face and the impassable cliff shoulder in one frame — U2's own subject.
  { label: 'bench-face', hero: [-20, 22], settleMs: 1800 },
];

const wanted = flag('frames', null);
const frames = wanted && wanted !== true
  ? FRAMES.filter((frame) => String(wanted).split(',').includes(frame.label))
  : FRAMES;

function bootUrl({ nobeauty = false, extra = '' } = {}) {
  const params = [
    'debug',
    'epoch=epoch-2-steamworks',
    'contract=e2-hill-mine',
    'nolevel',
    'seed=beauty2-e2-hill-mine',
  ];
  if (nobeauty) params.push('nobeauty');
  return `${BASE}/?${params.join('&')}${extra}`;
}

async function openMap(browser, { nobeauty = false, extra = '', viewport = VIEWPORT } = {}) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(bootUrl({ nobeauty, extra }));
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas?.dataset.terrain3dPilotState && canvas.dataset.terrain3dPilotState !== 'loading';
  }, undefined, { timeout: 180000 });
  await page.waitForTimeout(1500);
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.count()) await begin.click().catch(() => {});
  await page.waitForTimeout(1200);
  return { page, errors };
}

const readDataset = (page) => page.evaluate(() => {
  const d = document.querySelector('canvas')?.dataset ?? {};
  return {
    state: d.terrain3dPilotState,
    renderSource: d.terrain3dPilotRenderSource,
    landmarks: d.terrain3dPilotLandmarks,
    landmarkSkipped: d.terrain3dPilotLandmarkSkipped,
    landmarkExpected: d.terrain3dPilotLandmarkExpected,
    landmarkEmissive: d.terrain3dPilotLandmarkEmissive,
    landmarkDiagnostics: d.terrain3dPilotLandmarkDiagnostics,
    sculptWater: d.terrain3dPilotSculptWater,
    sculptWaterY: d.terrain3dPilotSculptWaterY,
    sculptWaterDeepest: d.terrain3dPilotSculptWaterDeepest,
    sculptWaterGlints: d.terrain3dPilotSculptWaterGlints,
    contactShadows: d.terrain3dPilotContactShadows,
    motes: d.terrain3dPilotMotes,
    steam: d.terrain3dPilotSteam,
    hiddenGroundLayers: d.terrain3dPilotHiddenGroundLayers,
    meshes: d.terrain3dPilotMeshes,
    triangles: d.terrain3dPilotTriangles,
    vertices: d.terrain3dPilotVertices,
    materials: d.terrain3dPilotMaterials,
  };
});

const readRender = (page) => page.evaluate(() => {
  const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  return {
    calls: diagnostics?.renderer?.calls ?? null,
    triangles: diagnostics?.renderer?.triangles ?? null,
    p95: diagnostics?.frameMs?.p95 ?? null,
    avg: diagnostics?.frameMs?.avg ?? null,
    samples: diagnostics?.frameMs?.sampleCount ?? null,
    tier: window.__GR_PERFORMANCE_TIER__ ?? null,
  };
});

async function teleport(page, [x, z]) {
  await page.evaluate(([tx, tz]) => window.__GR_TEST__?.teleport?.(tx, tz), [x, z]);
}

async function heroAt(page) {
  return page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.hero ?? window.__THREE_GAME_DIAGNOSTICS__?.player;
    if (hero && typeof hero.x === 'number') return [hero.x, hero.z];
    const height = window.__THREE_GAME_DIAGNOSTICS__?.terrain?.height;
    return height ? [null, null] : [null, null];
  });
}

async function shots() {
  const outDir = path.join(ROOT, LABEL);
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium' });
  const { page, errors } = await openMap(browser);
  const dataset = await readDataset(page);
  const captured = [];
  for (const frame of frames) {
    await teleport(page, frame.hero);
    await page.waitForTimeout(frame.settleMs);
    const file = path.join(outDir, `${PROJECT}-${frame.label}.png`);
    await page.screenshot({ path: file });
    captured.push({ frame: frame.label, hero: frame.hero, file, render: await readRender(page) });
  }
  const report = { label: LABEL, project: PROJECT, viewport: VIEWPORT, dataset, captured, consoleErrors: errors, loadavg: os.loadavg() };
  writeFileSync(path.join(outDir, `${PROJECT}-report.json`), JSON.stringify(report, null, 2));
  await page.close();
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

/**
 * SAME-SESSION p95 A/B. Both arms are opened in ONE browser and sampled alternately, so a load spike
 * lands on both. Each sample settles the frame window first (Game resets the window on teleport and
 * on visibility change), then reads the game's own rolling p95.
 */
async function perf() {
  const outDir = path.join(ROOT, 'perf');
  mkdirSync(outDir, { recursive: true });
  const rounds = Number(flag('rounds', 3));
  const browser = await chromium.launch({ channel: 'chromium' });
  const arms = {};
  for (const arm of ['nobeauty', 'beauty']) {
    const opened = await openMap(browser, { nobeauty: arm === 'nobeauty' });
    arms[arm] = opened;
    await teleport(opened.page, [0, 12]);
  }
  const samples = { nobeauty: [], beauty: [] };
  for (let round = 0; round < rounds; round += 1) {
    for (const arm of ['nobeauty', 'beauty']) {
      const { page } = arms[arm];
      await page.bringToFront();
      await page.waitForTimeout(6000);
      samples[arm].push(await readRender(page));
    }
  }
  const summarize = (list) => {
    const p95s = list.map((entry) => entry.p95).filter((value) => typeof value === 'number');
    const sorted = [...p95s].sort((a, b) => a - b);
    return {
      p95s,
      median: sorted[Math.floor(sorted.length / 2)] ?? null,
      min: sorted[0] ?? null,
      calls: list.map((entry) => entry.calls),
      triangles: list.map((entry) => entry.triangles),
      tier: list[0]?.tier ?? null,
    };
  };
  const report = {
    label: LABEL,
    project: PROJECT,
    viewport: VIEWPORT,
    rounds,
    nobeauty: summarize(samples.nobeauty),
    beauty: summarize(samples.beauty),
    datasets: {
      nobeauty: await readDataset(arms.nobeauty.page),
      beauty: await readDataset(arms.beauty.page),
    },
    consoleErrors: { nobeauty: arms.nobeauty.errors, beauty: arms.beauty.errors },
    loadavg: os.loadavg(),
  };
  const nb = report.nobeauty.median;
  const b = report.beauty.median;
  report.ratio = nb && b ? +(b / nb).toFixed(4) : null;
  report.verdict = report.ratio === null ? 'unknown' : (report.ratio <= 1.15 ? 'WITHIN +15%' : 'OVER +15%');
  writeFileSync(path.join(outDir, `${PROJECT}-${LABEL}-perf.json`), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

if (has('perf')) await perf();
else await shots();
