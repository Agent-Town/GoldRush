/**
 * THE DRY GULCH BEAUTY BOARD — the instrument that judges every upgrade.
 *
 * `docs/beauty/e1-dry-gulch-brief.md` §4 is the shot list; this rig renders it. The renders judge,
 * not intentions, so the SAME rig runs on both sides of every change and the pairs land beside each
 * other in `artifacts/beauty-dry-gulch/<label>/`.
 *
 *   GR_BEAUTY_LABEL=before GR_CAPTURE_RUN=1 GR_CAPTURE_EXTERNAL_SERVER=1 \
 *   GR_CAPTURE_BASE_URL=http://127.0.0.1:5241 npx playwright test e2e/beauty-dry-gulch.rig.ts
 *
 * WHY A RIG AND NOT A SPEC: `*.rig.ts` is excluded from the default gate (playwright.config.ts
 * `testIgnore`), so a capture harness can never turn into a tree red. It asserts only the things a
 * beauty verdict depends on — GLB terrain actually mounted, zero console/page errors — and writes
 * every number it measures to `board.json` instead of hiding them inside an expectation.
 *
 * THE FRESH-EYE RUN CAMERA IS NOT A NEW CAMERA. `render_fresh_eye_sweep.py` poses Blender at
 * ((0,-30.3,26.26) -> (0,-8.65,0.51), 42deg) in Z-up. Converted to three.js Y-up that is
 * position (0, 26.26, 30.3) looking at (0, 0.51, 8.65) — exactly what CameraRig.snapTo produces for
 * a hero standing at (0, 12) on ground y≈0.06: offset (0, 26.2, 18.3) and a look target of
 * (x, y+0.45, z - downScreenLookOffset 3.35). So the shipped run camera IS the readability judge,
 * and every framing below is expressed as the hero position that produces it.
 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Errors = { console: string[]; page: string[] };
type Sample = {
  shot: string;
  p95: number;
  avg: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  frames: number;
};

const LABEL = process.env.GR_BEAUTY_LABEL ?? 'before';
const ROOT = path.resolve('artifacts/beauty-dry-gulch');
const SEED = 'beauty-dry-gulch';
/** The camera centres roughly on (hero.x, hero.z - downScreenLookOffset); solve back for the hero. */
const LOOK_OFFSET = 3.35;
const samples: Sample[] = [];

/** Hero stands here -> the fresh-eye run camera, i.e. the shipped boot framing. */
const RUN_CAMERA_HERO = { x: 0, z: 12 };

function outDir(testInfo: TestInfo): string {
  return path.join(ROOT, LABEL, testInfo.project.name);
}

function collectErrors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.console.push(message.text());
  });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

/**
 * Boot the gulch and WAIT FOR THE SCULPT. `artifacts/tile-identity/desktop-chrome-e1-dry-gulch.png`
 * is the cautionary tale: it screenshots at frame 18, before the GLB lands, so it boards the flat
 * painted fallback and reads as a different map. Nothing here fires until the pilot says `ready`
 * on the `glb` source with its landmarks mounted.
 */
async function boot(page: Page, query = ''): Promise<void> {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`/?debug&contract=e1-dry-gulch&nowaves&nolevel&nopause&nosteal&nowreck&seed=${SEED}${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible().catch(() => false)) await begin.click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' &&
      canvas?.dataset.terrain3dPilotRenderSource === 'glb' &&
      canvas?.dataset.terrain3dPilotLandmarkLoadState === 'mounted';
  }, undefined, { timeout: 20_000 });
  // lil-gui is a debug affordance, not the game; it would sit in every beauty pair otherwise.
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  await settle(page, 30);
}

/**
 * Wait out N rendered frames. Both operands travel INSIDE the argument — a browser-side callback
 * closes over nothing from this file, and referencing `frames` directly here silently turned every
 * wait into a timeout on the first run of this rig.
 */
async function settle(page: Page, frames: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction(
    ([from, count]) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > from! + count!,
    [start, frames] as const,
    { timeout: 30_000 },
  );
}

/**
 * Frame the world point (x, z): put the hero where the run camera centres on it, then wait for the
 * camera to actually ARRIVE.
 *
 * CameraRig lerps at `Balance.camera.lag` 0.15, i.e. ~5.4% of the remaining distance per 120 Hz
 * frame, so 45 frames still leaves ~8% of a 30 m teleport unconsumed and the camera is visibly
 * creeping at shutter time. That produced a whole-frame sub-pixel drift between boards: a
 * u2-vs-u3 pixel diff came back "40% of pixels changed" for an upgrade that only adds 54 small
 * ellipses, because the two frames were photographed from marginally different places. 240 frames
 * puts the residual at ~1e-6 of the jump — the frames are then comparable pixel for pixel.
 */
async function frameOn(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate(([px, pz]) => window.__GR_TEST__?.teleport(px!, pz!), [x, z + LOOK_OFFSET] as const);
  await settle(page, 240);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const dir = outDir(testInfo);
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: false });
}

/** Measure over a real window rather than trusting one frame; every number reaches board.json. */
async function measure(page: Page, name: string, frames = 200): Promise<Sample> {
  await settle(page, frames);
  const sample = await page.evaluate(([shotName, frameCount]) => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      shot: String(shotName),
      p95: Math.round((diagnostics.frameMs?.p95 ?? 0) * 100) / 100,
      avg: Math.round((diagnostics.frameMs?.avg ?? 0) * 100) / 100,
      drawCalls: diagnostics.renderer?.calls ?? 0,
      triangles: diagnostics.renderer?.triangles ?? 0,
      textures: diagnostics.renderer?.textures ?? 0,
      frames: Number(frameCount),
    };
  }, [name, frames] as const);
  samples.push(sample);
  return sample;
}

function expectClean(errors: Errors): void {
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
}

test.describe.configure({ mode: 'serial' });

test('dry gulch beauty board', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const errors = collectErrors(page);
  await boot(page);

  // U1's contract: the map's one spring is a LIVE surface, not baked paint. If this ever reads 0
  // again the pond silently fell back and every shot below would look fine while lying.
  // Any `before*` label is captured on the base commit, where the pond does not exist yet.
  // Prefix, not equality: the timed repeats are labelled before-r1..r3 and an equality test
  // silently turned all three into failures with empty sample sets.
  if (!LABEL.startsWith('before')) {
    expect(await page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotSpringPonds)).toBe('1');
  }

  // 1. Plain boot — the standing-orders framing, hero where the run starts.
  await shot(page, testInfo, '1-boot');

  // 2. The fixed fresh-eye run camera: the readability judge.
  await frameOn(page, RUN_CAMERA_HERO.x, RUN_CAMERA_HERO.z - LOOK_OFFSET);
  await shot(page, testInfo, '2-run-camera');
  await measure(page, 'run-camera');

  // 3. The spring close-up — the map's only water, at the isolated_spring mount.
  await frameOn(page, -18, -18);
  await shot(page, testInfo, '3-spring');
  await measure(page, 'spring');

  // 4. The bison skeleton against the mesa edge, at gameplay zoom.
  await frameOn(page, -8, 12.5);
  await shot(page, testInfo, '4-bison');

  // 6. The horizon: where a heat shimmer band would live (top third of frame).
  await frameOn(page, 0, -20);
  await shot(page, testInfo, '6-horizon');

  expectClean(errors);
});

test('dry gulch secured board', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const errors = collectErrors(page);
  await boot(page);

  // 5. Secured (~wave 15) with builds up: scrub shadows and the mid-field tiling fingerprint.
  await page.evaluate(() => {
    const api = window.__GR_TEST__!;
    api.grantGold(4000);
    api.setWave(15);
    for (const [id, x, z] of [
      ['sluice', -16.5, -16],
      ['stockpile', -3, 6],
      ['turret', 6, 2],
      ['turret', -7, 0],
      ['sentry_beacon', 2, 9],
      ['palisade', -2, -2],
      ['palisade', 1, -2],
      ['assay_office', 9, 7],
    ] as const) api.placeFree(id as never, x, z);
  });
  await frameOn(page, 0, 2);
  await settle(page, 60);
  await shot(page, testInfo, '5-secured');

  // Mid-wave perf: the p95 the +15% law is measured against, with a live pack on screen.
  // The long settle is load-bearing. Sampling 30 frames after the spawn measured shader compilation
  // and pool warm-up, not the scene: two runs of the SAME build came back 16.8ms and 10.2ms, a 39%
  // swing that would have been read as an upgrade's cost. 120 frames of warm-up first.
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(28, 14));
  await settle(page, 120);
  await measure(page, 'secured-midwave', 240);
  await shot(page, testInfo, '5-secured-midwave');

  expectClean(errors);
});

test('dry gulch LITE stays untouched', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`/?debug&contract=e1-dry-gulch&nowaves&nolevel&nopause&performance=lite&seed=${SEED}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 60);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible().catch(() => false)) await begin.click();
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  await settle(page, 40);
  await shot(page, testInfo, '7-lite');
  const sample = await measure(page, 'lite', 180);
  expect(sample.p95).toBeGreaterThan(0);
  const tier = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.tier);
  expect(tier).toBe('lite');
  expectClean(errors);
});

test.afterAll(async () => {
  await mkdir(path.join(ROOT, LABEL), { recursive: true });
  let head = 'unknown';
  try {
    head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    head = 'unknown';
  }
  await writeFile(
    path.join(ROOT, LABEL, 'board.json'),
    `${JSON.stringify({ label: LABEL, head, seed: SEED, samples }, null, 2)}\n`,
  );
});
