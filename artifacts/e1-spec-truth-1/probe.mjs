// e1-spec-truth-1 measurement probe. Read-only against the game: it boots the same debug queries
// the three specs boot, and records what the tree actually answers, so the coordinates this task
// re-pins are MEASURED and not inferred.
//
// Answers three questions:
//   1. which grid points near the two `twin-banks` winch mounts are walkable + buildable + placeable
//      (the stockpile targets of `e1-twin-banks.spec.ts:110-111`), INCLUDING the hero stand point
//      `placeBuildableAt` teleports to (target z + 2), because the ghost is hero-derived;
//   2. whether an enemy spawned at (17, 14) crosses the east ford while (16, 14) does not
//      (`assertFordRoute`, the north_bank_homestead footprint);
//   3. what the per-body sprite architecture publishes for a PREFETCHED Baron (no live animator).
//
// Usage: node artifacts/e1-spec-truth-1/probe.mjs <baseURL> <outfile>
import { chromium, devices } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5309';
const OUT = process.argv[3] ?? 'artifacts/e1-spec-truth-1/probe.json';

const TWIN_QUERY = '?debug&contract=e1-twin-banks&timescale=8&nolevel&nowaves&nokill&seed=e1-twin-banks';
const ROUTE_QUERY = '?debug&contract=e1-twin-banks&timescale=12&nowaves&nokill&nolevel&nopause&seed=e1-twin-route';
const BARON_QUERY = '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nokill&nosteal&nowreck&seed=e1-baron-taunts';

// The four twin-banks mounts, verbatim from assets/pilots/map-rebuild-spike/landmark-collision-contract.json.
const MOUNTS = [
  { id: 'north_bank_homestead', x: 13.5, z: 14.2, w: 5.184, d: 4.018, rotation: -0.1 },
  { id: 'south_bank_homestead', x: -13, z: -14, w: 5.184, d: 4.018, rotation: 0.14 },
  { id: 'north_bank_winch', x: -16, z: 10.7, w: 3.096, d: 1.728, rotation: 0 },
  { id: 'south_bank_winch', x: 16, z: -10.7, w: 3.096, d: 1.767, rotation: 0 },
];
const HERO_PAD = 0.5 + 0.08; // Balance.hero.radius + 0.08, the pad Terrain.sample() gives every blocker.

function blockedBy(px, pz, pad = HERO_PAD) {
  return MOUNTS.filter((mount) => {
    const dx = px - mount.x;
    const dz = pz - mount.z;
    const cos = Math.cos(-mount.rotation);
    const sin = Math.sin(-mount.rotation);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;
    return Math.abs(localX) <= mount.w / 2 + pad && Math.abs(localZ) <= mount.d / 2 + pad;
  }).map((mount) => mount.id);
}

async function boot(page, query) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`${BASE}/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function attemptPlacement(page, id, x, z, timeoutMs = 2500) {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z: z + 2 });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  const started = Date.now();
  let valid = false;
  while (Date.now() - started < timeoutMs) {
    valid = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false);
    if (valid) break;
    await page.waitForTimeout(80);
  }
  const ghost = await page.evaluate(() => {
    const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
    return { ghostPos: build?.ghostPos ?? null, ghostValid: build?.ghostValid ?? null, selected: build?.selectedBuildable ?? null };
  });
  const confirmed = valid ? await page.evaluate(() => window.__GR_TEST__?.confirmBuild()) : false;
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos);
  return {
    id,
    target: { x, z },
    heroStand: { x, z: z + 2 },
    ghostValidMs: valid ? Date.now() - started : null,
    ghostValid: valid,
    ghost,
    confirmed,
    heroAfter: hero,
    targetBlockedBy: blockedBy(x, z),
    heroStandBlockedBy: blockedBy(x, z + 2),
  };
}

async function traceSpawn(page, spawnX, spawnZ, fordX, windowMs = 15_000) {
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const spawned = await page.evaluate((p) => window.__GR_TEST__?.spawnEnemyAt(p.x, p.z), { x: spawnX, z: spawnZ });
  await page.evaluate((x) => {
    const w = window;
    w.__probeRoute = { deepSamples: 0, fordSamples: 0, reached: false, samples: 0, startedAt: performance.now(), reachedAt: null, last: null };
    const tick = () => {
      const track = w.__probeRoute;
      if (!track) return;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
      if (enemy && hero) {
        track.samples += 1;
        track.last = { x: enemy.x, z: enemy.z, zone: enemy.zone };
        if (enemy.zone === 'river') track.deepSamples += 1;
        if (enemy.zone === 'ford' && Math.abs(enemy.x - x) <= 3.2) track.fordSamples += 1;
        if (Math.hypot(enemy.x - hero.x, enemy.z - hero.z) < 1.4 && !track.reached) {
          track.reached = true;
          track.reachedAt = performance.now() - track.startedAt;
        }
      }
      if (!track.reached) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, fordX);
  const deadline = Date.now() + windowMs;
  let track = null;
  while (Date.now() < deadline) {
    track = await page.evaluate(() => window.__probeRoute);
    if (track?.reached) break;
    await page.waitForTimeout(250);
  }
  return { spawn: { x: spawnX, z: spawnZ }, fordWindowCentre: fordX, spawned, spawnBlockedBy: blockedBy(spawnX, spawnZ), ...track };
}

const report = { base: BASE, at: new Date().toISOString(), mounts: MOUNTS, heroPad: HERO_PAD };
const browser = await chromium.launch({ channel: 'chromium' });

try {
  for (const [projectName, deviceOptions] of [
    ['desktop-chrome', { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }],
    ['mobile-chrome', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
  ]) {
    const context = await browser.newContext(deviceOptions);
    const project = { placements: [], routes: [], samples: {}, baron: null, consoleErrors: [], pageErrors: [] };
    report[projectName] = project;

    // 1. Terrain truth + real placement attempts.
    let page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') project.consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => project.pageErrors.push(e.message));
    await boot(page, TWIN_QUERY);
    const candidates = [
      [-16, 7], [-16, 10], [-16, 12], [-16, 13], [-16, 14], [-16, 15],
      [16, -7], [16, -10], [16, -12], [16, -13], [16, -14], [16, -15],
      [13, -13], [12, -13], [16, -11], [16, -8],
    ];
    project.samples = await page.evaluate((points) => {
      const out = {};
      for (const [x, z] of points) {
        const sample = window.__GR_TEST__?.terrainSample(x, z);
        out[`${x},${z}`] = { zone: sample?.zone, walkable: sample?.walkable, speedMul: sample?.speedMul };
      }
      return out;
    }, candidates);
    for (const [x, z] of candidates) project.samples[`${x},${z}`].blockedBy = blockedBy(x, z);

    await page.evaluate(() => window.__GR_TEST__?.grantGold(400));
    project.placements.push(await attemptPlacement(page, 'sluice', -16, 7));
    project.placements.push(await attemptPlacement(page, 'sluice', 16, -7));
    // The current pins first (the measured red), then the candidates.
    project.placements.push(await attemptPlacement(page, 'stockpile', -16, 10, 2000));
    project.placements.push(await attemptPlacement(page, 'stockpile', -16, 13, 2000));
    project.placements.push(await attemptPlacement(page, 'stockpile', 16, -10, 2000));
    project.placements.push(await attemptPlacement(page, 'stockpile', 16, -13, 2000));
    project.placements.push(await attemptPlacement(page, 'stockpile', 16, -15, 2000));
    project.buildAfter = await page.evaluate(() => {
      const build = window.__THREE_GAME_DIAGNOSTICS__.build;
      return {
        sluices: build.sluices,
        stockpiles: build.stockpiles,
        sluicePositions: build.sluicePositions,
        stockpilePositions: build.stockpilePositions,
      };
    });
    await page.close();

    // 2. The east arm: the pinned spawn versus the candidate.
    page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') project.consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => project.pageErrors.push(e.message));
    await boot(page, ROUTE_QUERY);
    await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.speed', 3.8));
    project.routes.push(await traceSpawn(page, 16, 14, 16));
    project.routes.push(await traceSpawn(page, 17, 14, 16));
    project.routes.push(await traceSpawn(page, -16, 14, -16));
    await page.close();

    // 3. What a prefetched Baron publishes.
    page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') project.consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => project.pageErrors.push(e.message));
    await boot(page, BARON_QUERY);
    await page.waitForTimeout(4000);
    project.baron = await page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      const canvas = document.querySelector('#game-canvas');
      return {
        assetsBaron: d?.assets['char.baron'] ?? null,
        assetsBanner: d?.assets['prop.baron_banner'] ?? null,
        assetSpritesBaron: d?.assetSprites['char.baron'] ?? 0,
        assetSpritesBanner: d?.assetSprites['prop.baron_banner'] ?? 0,
        spriteAnimationKeys: Object.keys(d?.spriteAnimations ?? {}),
        baronAnimation: d?.spriteAnimations['char.baron'] ?? null,
        spriteStats: d?.spriteStats ?? null,
        spriteClipGroups: canvas?.dataset.spriteClipGroups ?? null,
        assetKeysLoaded: Object.entries(d?.assets ?? {}).filter(([, v]) => v === 'loaded').map(([k]) => k),
        portraitSrc: document.querySelector('[data-hud-wave-portrait]')?.getAttribute('src') ?? null,
      };
    });
    await page.close();
    await context.close();
  }
} finally {
  await browser.close();
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2));
  console.log(`probe written: ${OUT}`);
}
