import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';

// Beauty shift capture rig for e1-night-shift (docs/beauty/e1-night-shift-brief.md §4 shot list).
// Rendering-only: it drives the shipped debug harness, changes no sim balance, and asserts nothing
// beyond "the map really booted in 3D with the night shader on and no console errors".
// Tag the run so before/after boards land side by side:
//   GR_BEAUTY_TAG=before npx playwright test --config playwright.scratch.config.ts e2e/beauty-night-shift.spec.ts
const TAG = process.env.GR_BEAUTY_TAG ?? 'current';
const SHOT_DIR = path.resolve('reviews/shots-beauty-night', TAG);

// Hero sits at a spot night-mode-truth already proves is on-camera and on valid ground; the lantern
// post goes six metres east so its warm pool clears the hero's own cool pool.
const HERO: readonly [number, number] = [12, 12];
const LANTERN: readonly [number, number] = [18, 12];
// Candidate post sites ringed around the hero. Roughly half of any fixed list collides with props or
// relief, so offer plenty and keep the first seven that actually land.
const LANTERN_SITES: ReadonlyArray<readonly [number, number]> = (() => {
  const sites: Array<readonly [number, number]> = [];
  for (const radius of [8, 13, 18]) {
    for (let step = 0; step < 12; step += 1) {
      const angle = (step / 12) * Math.PI * 2;
      sites.push([
        Math.round((HERO[0] + Math.cos(angle) * radius) * 10) / 10,
        Math.round((HERO[1] + Math.sin(angle) * radius) * 10) / 10,
      ]);
    }
  }
  return sites;
})();
const WANTED_POSTS = 7;

type Metrics = {
  moment: string;
  project: string;
  phase: string | undefined;
  darkness: number | undefined;
  frameP95Ms: number | undefined;
  drawCalls: number | undefined;
  triangles: number | undefined;
  nightPools: number | undefined;
  nightPoolSources: number | undefined;
  enemyLanterns: number | undefined;
};

async function boot(page: Page, seed: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=${seed}&tier=full`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  // The whole shift is judged on the 3D path; a silent painted fallback would make every shot a lie.
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.terrain3dPilotRenderSource === 'glb';
  });
  return errors;
}

async function setCanvasOnly(page: Page, enabled: boolean): Promise<void> {
  await page.evaluate((hide) => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    if (!canvas) return;
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      if (element === canvas || element.contains(canvas) || canvas.contains(element)) continue;
      element.style.visibility = hide ? 'hidden' : '';
    }
  }, enabled);
}

async function settle(page: Page, wave: number): Promise<void> {
  await page.evaluate((target) => window.__GR_TEST__!.setWave(target), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave)).toBe(wave);
  await page.waitForTimeout(500);
}

// The seven_lantern_terraces are painted LANDMARKS, not buildings — repair('lantern_post', i) finds
// nothing to repair on a fresh run, which is why an unprepared night shot has exactly one pool (the
// hero's). Build the row instead, so the style anchor's "seven amber pools along a worked road" is
// actually on camera. Returns how many posts really landed.
async function lightTheTerraces(page: Page): Promise<number> {
  return page.evaluate(({ sites, wanted }) => {
    const api = window.__GR_TEST__!;
    api.grantGold(5_000);
    for (let index = 0; index < 7; index += 1) api.repair('lantern_post', index);
    let placed = 0;
    for (const [x, z] of sites) {
      if (placed >= wanted) break;
      if (api.placeFree('lantern_post', x!, z!)) placed += 1;
    }
    return placed;
  }, { sites: LANTERN_SITES, wanted: WANTED_POSTS });
}

async function readMetrics(page: Page, moment: string, project: string): Promise<Metrics> {
  // 180 rAF deltas, same shape as night3d-perf.spec.ts's p95() so the numbers are comparable.
  const frameP95Ms = await page.evaluate(async () => {
    const samples: number[] = [];
    let previous = performance.now();
    for (let index = 0; index < 180; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)] ?? 0;
  });
  const rest = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return {
      phase: diagnostics?.lighting?.nightShift?.phase,
      darkness: diagnostics?.lighting?.nightShift?.darkness,
      drawCalls: diagnostics?.renderer?.calls,
      triangles: diagnostics?.renderer?.triangles,
      nightPools: diagnostics?.lighting?.nightPools,
      nightPoolSources: Number(canvas?.dataset.terrain3dPilotNightPoolSources ?? 0),
      enemyLanterns: diagnostics?.lighting?.enemyLanterns,
    };
  });
  return { moment, project, frameP95Ms: Math.round(frameP95Ms * 100) / 100, ...rest };
}

// Frame-to-frame noise (sprite bob, lamp flicker) swamps a whole-image diff, so measure the thing
// itself: for every visible enemy, pair the light it actually stands in with the colour its own
// pixels are drawn at. A binary boost gives one flat row; a graded ignition gives a ramp.
async function ignitionLadder(page: Page): Promise<unknown> {
  const probes = await page.evaluate(() => {
    const api = window.__GR_TEST__!;
    return api.enemyPositions()
      .map((enemy) => {
        const point = api.screenPoint(enemy.x, enemy.z, api.terrainVisualY(enemy.x, enemy.z, 0.9));
        return { coverage: api.lightCoverage(enemy.x, enemy.z), x: point.x, y: point.y, inView: point.inView };
      })
      .filter((probe) => probe.inView);
  });
  const canvas = page.locator('#game-canvas');
  await setCanvasOnly(page, true);
  const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  await setCanvasOnly(page, false);
  const png = PNG.sync.read(buffer);
  const rows = probes.map((probe) => {
    const centerX = Math.round(probe.x * png.width / box!.width);
    const centerY = Math.round(probe.y * png.height / box!.height);
    let peak = -1; let peakPixel = [0, 0, 0];
    // The sprite stands above its ground point; take the brightest pixel in a box over the figure.
    for (let py = centerY - 26; py <= centerY + 4; py += 1) {
      for (let px = centerX - 8; px <= centerX + 8; px += 1) {
        if (px < 0 || py < 0 || px >= png.width || py >= png.height) continue;
        const offset = (py * png.width + px) * 4;
        const [r, g, b] = [png.data[offset]!, png.data[offset + 1]!, png.data[offset + 2]!];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (luma > peak) { peak = luma; peakPixel = [r, g, b]; }
      }
    }
    return { coverage: +probe.coverage.toFixed(3), peakLuma: +peak.toFixed(1), rgb: peakPixel.join(',') , warm: peakPixel[0]! - peakPixel[2]! };
  });
  rows.sort((a, b) => a.coverage - b.coverage);
  return rows;
}

async function shoot(page: Page, testInfo: TestInfo, moment: string, metrics: Metrics[]): Promise<void> {
  metrics.push(await readMetrics(page, moment, testInfo.project.name));
  await setCanvasOnly(page, true);
  await mkdir(SHOT_DIR, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${moment}.png`) });
  await setCanvasOnly(page, false);
}

test('night shift beauty board', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const metrics: Metrics[] = [];
  const errors = await boot(page, 'beauty-night-shift');
  await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x!, z!), HERO);

  // 1. Plain day boot — the weakest paint of the five maps, per the brief's current-state read.
  await settle(page, 1);
  await shoot(page, testInfo, '01-day', metrics);

  // 2/6. Dusk over the terraces: the keyframe palette and the sky it breaks against.
  const posts = await lightTheTerraces(page);
  expect(posts, 'the lantern row must actually light, or every night shot is a one-pool lie').toBe(WANTED_POSTS);
  await settle(page, 8);
  await shoot(page, testInfo, '02-dusk', metrics);

  // 3. Full dark, mid-assault at a pool edge. Enemies are frozen but NOT speedScale 0 — that clamps
  // the pack radius to 1.8 and bunches them into one blob, which is exactly what hides the ignition.
  await settle(page, 10);
  await page.evaluate(([x, z]) => { window.__GR_TEST__!.placeFree('lantern_post', x!, z!); }, LANTERN);
  await page.evaluate(() => {
    window.__GR_TEST__!.spawnPack(14, 9, { speedScale: 0.001, hpScale: 999, carriedLantern: true });
  });
  await page.waitForTimeout(600);
  await shoot(page, testInfo, '03-dark-pool', metrics);

  // 3b. The ignition read, isolated — WRECKERS. A lantern-carrying enemy stands at the centre of its
  // own pool and is therefore always fully lit, so it can never show the approach ramp.
  // WaveSystem.enemyCarriesLantern is `!wrecker && classes.includes('rusher')`: wreckers are the one
  // class that walks in carrying nothing, and they are also the class the 1.18x dark-corridor speed
  // rides. They are the whole subject of this upgrade.
  await page.evaluate(() => {
    window.__GR_TEST__!.clearEnemies();
    window.__GR_TEST__!.spawnPack(18, 11, { speedScale: 0.001, hpScale: 999, wrecker: true });
  });
  await page.waitForTimeout(600);
  await shoot(page, testInfo, '03b-dark-approach', metrics);
  await writeFile(
    path.join(SHOT_DIR, `ignition-${testInfo.project.name}.json`),
    `${JSON.stringify(await ignitionLadder(page), null, 2)}\n`,
  );

  // 4. Dawn at wave 25 survived.
  await page.evaluate(() => window.__GR_TEST__!.clearEnemies());
  await settle(page, 25);
  await shoot(page, testInfo, '04-dawn', metrics);

  await writeFile(
    path.join(SHOT_DIR, `metrics-${testInfo.project.name}.json`),
    `${JSON.stringify(metrics, null, 2)}\n`,
  );
  expect(errors).toEqual([]);
});
