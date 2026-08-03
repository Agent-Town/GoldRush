import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

// THE ATMOSPHERICS SHIFT — THE THREE-SKIES BOARD (reviews/beauty-atmos.md).
// Four columns of the SAME seven moments: no flag, ?townSky=a, =b, =c. The owner picks one.
// Not part of the default gate: `.rig.ts` is testIgnored unless GR_CAPTURE_RUN=1.
//   GR_TOWN_SKY=a GR_CAPTURE_RUN=1 GR_CAPTURE_EXTERNAL_SERVER=1 \
//   GR_CAPTURE_BASE_URL=http://127.0.0.1:5301 npx playwright test e2e/beauty-atmos.rig.ts --workers=1
// Shots land in reviews/shots-beauty-atmos/<variant>/, per-shot perf in artifacts/beauty-atmos/.
const VARIANT = process.env.GR_TOWN_SKY ?? 'off';
const SHOT_DIR = path.resolve('reviews/shots-beauty-atmos', VARIANT);
const PERF_DIR = path.resolve('artifacts/beauty-atmos');
// Actors walk authored loops off the scene clock, so every column shoots at the SAME town-second
// and the four boards compare like with like.
const SETTLE_ELAPSED = 8;
const PERF_SAMPLE_MS = 1_900;

type Shot = {
  name: string;
  query?: string;
  camera: { x: number; z: number; zoom: number };
};

// THE SHOT LIST IS THE FINDING. Shot 1 is the plaza, where the reverted U6 measured "zero
// pixels" and where all four columns are still identical — that is not a failure of the sky,
// it is where the town has no horizon to answer. Shots 2-7 walk north, which is where every
// one of these variants lives.
const DESKTOP_SHOTS: readonly Shot[] = [
  { name: '1-plaza-boot', camera: { x: 0, z: 2, zoom: 0.85 } },
  { name: '2-north-gate', camera: { x: 0, z: -13, zoom: 0.85 } },
  { name: '3-north-widest', camera: { x: 0, z: -13, zoom: 1.1 } },
  { name: '4-nw-corner', camera: { x: -13, z: -13, zoom: 0.85 } },
  { name: '5-dusk-north', query: '&townDusk', camera: { x: 0, z: -13, zoom: 0.85 } },
  { name: '7-night-north', query: '&townNight', camera: { x: 0, z: -13, zoom: 0.85 } },
];

const MOBILE_SHOTS: readonly Shot[] = [
  { name: '6-mobile-north', camera: { x: 0, z: -13, zoom: 0.85 } },
  { name: '6b-mobile-lite-north', query: '&tier=lite', camera: { x: 0, z: -13, zoom: 0.85 } },
];

const ONLY = (process.env.GR_BEAUTY_SHOTS ?? '').split(',').map((name) => name.trim()).filter(Boolean);

for (const shot of [...DESKTOP_SHOTS, ...MOBILE_SHOTS]) {
  test(`atmos shot ${shot.name} [${VARIANT}]`, async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    const mobile = testInfo.project.name === 'mobile-chrome';
    test.skip(mobile !== MOBILE_SHOTS.includes(shot), 'shot belongs to the other viewport');
    test.skip(ONLY.length > 0 && !ONLY.includes(shot.name), 'not in GR_BEAUTY_SHOTS');
    const errors = collectErrors(page);
    await seedProfile(page);
    await bootTown(page, `?townSky=${VARIANT}${shot.query ?? ''}`);
    await frameCamera(page, shot.camera);
    await settle(page);
    await mkdir(SHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(SHOT_DIR, `${shot.name}.png`) });
    const perf = await measure(page);
    await writePerf(testInfo, shot, perf, errors);
  });
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey, flatMetaKey, flatTownKey, flatGuideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(guideKey, '1');
    const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
    localStorage.setItem(metaKey, meta);
    // TownScene reads the FLAT meta key; only a start-menu profile activation copies the
    // profile-scoped one across (F-BT-4). Seed both, or the whole board shows a territory-0 town.
    localStorage.setItem(flatMetaKey, meta);
    localStorage.setItem(flatTownKey, 'Quartz Hill');
    localStorage.setItem(flatGuideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    flatMetaKey: META_PROGRESS_KEY,
    flatTownKey: TOWN_NAME_KEY,
    flatGuideKey: FIRST_CLAIM_DONE_KEY,
  });
}

async function bootTown(page: Page, query: string): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);
  await page.evaluate((url) => history.replaceState({ goldRushScene: 'town' }, '', url), `/${query}`);
  await page.reload();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);
  const lite = await page.evaluate(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.town3dPilotState === 'lite');
  if (!lite) {
    await page.waitForFunction(
      () => {
        const data = document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset ?? {};
        const ids = (data.town3dPilotLoadedIds ?? '').split(',').filter(Boolean);
        return ids.length >= 7 && data.town3dPlazaPropsState === 'loaded';
      },
      undefined,
      { timeout: 60_000 },
    );
  }
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.actors ?? []).every((actor) => !actor.visible || actor.loaded), undefined, { timeout: 30_000 });
}

// Teleport, then PROVE it took, then wait for the camera lerp to land. A fire-and-forget
// teleport lost a control column to the plaza once, which turned a 0% diff into an 82% one.
async function frameCamera(page: Page, camera: { x: number; z: number; zoom: number }): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.evaluate(({ x, z, zoom }) => {
      const town = window.__GR_TOWN_DIAGNOSTICS__!;
      town.teleport(x, z);
      town.camera.setZoom(zoom);
    }, camera);
    await page.waitForTimeout(900);
    const at = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
    if (Math.abs(at.x - camera.x) < 0.3 && Math.abs(at.z - camera.z) < 0.3) break;
  }
  await page.waitForFunction(
    ({ x, z, zoom }) => {
      const town = window.__GR_TOWN_DIAGNOSTICS__;
      if (!town) return false;
      return Math.abs(town.player.x - x) < 0.3 && Math.abs(town.player.z - z) < 0.3
        && Math.abs(town.camera.framingDistanceScale - zoom) < 0.01
        && Math.abs(town.camera.actualDistance - town.camera.targetDistance) < 0.05;
    },
    camera,
    { timeout: 30_000 },
  );
}

async function settle(page: Page): Promise<void> {
  await page.waitForFunction((seconds) => (window.__GR_TOWN_DIAGNOSTICS__?.elapsed ?? 0) > seconds, SETTLE_ELAPSED, { timeout: 60_000 });
  // The camera lerp is 5.4% of the remaining distance per frame; the dry-gulch shift measured a
  // 40.76% bogus pixel diff from photographing a still-moving camera.
  await page.waitForTimeout(2_500);
}

// This box also runs the factory's fires, so a single window drifts by whole milliseconds
// depending on who else is awake. Three consecutive windows, keep the least-contended one.
async function measure(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(async (sampleMs) => {
    const sample = async (): Promise<void> => {
      const started = performance.now();
      while (performance.now() - started < sampleMs) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    };
    type Window = { frameMs: TownFrameStats; renderMs: TownFrameStats };
    let best: Window | null = null;
    for (let pass = 0; pass < 3; pass += 1) {
      await sample();
      const current = window.__GR_TOWN_DIAGNOSTICS__!;
      if (!current.renderMs) break;
      const candidate: Window = { frameMs: current.frameMs, renderMs: current.renderMs };
      if (!best || candidate.renderMs.avg < best.renderMs.avg) best = candidate;
    }
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    return {
      frameMs: best?.frameMs ?? null,
      renderMs: best?.renderMs ?? null,
      renderer: town.renderer,
      canvas: town.canvas,
      zoom: town.camera.framingDistanceScale,
      hero: town.player,
      sky: town.sky,
      lighting: town.lighting,
      tier: town.ambientDust.tier,
      buildings: town.buildings.filter((building) => building.visible).length,
    };
  }, PERF_SAMPLE_MS);
}

type TownFrameStats = { last: number; avg: number; p95: number; sampleCount: number };

async function writePerf(testInfo: TestInfo, shot: Shot, perf: Record<string, unknown>, errors: ErrorBucket): Promise<void> {
  await mkdir(PERF_DIR, { recursive: true });
  const file = path.join(PERF_DIR, `perf-${VARIANT}-${testInfo.project.name}-${shot.name}.json`);
  await writeFile(file, `${JSON.stringify({ variant: VARIANT, project: testInfo.project.name, shot: shot.name, ...perf, errors }, null, 2)}\n`);
}

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}
