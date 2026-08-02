import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

// THE TOWN BEAUTY SHIFT capture rig (docs/beauty/town-brief.md §4 shot list).
// Not part of the default gate: `.rig.ts` is testIgnored unless GR_CAPTURE_RUN=1, so the beauty
// loop can re-shoot the same six moments dozens of times without adding a spec to the tree.
//   GR_BEAUTY_PHASE=before GR_CAPTURE_RUN=1 GR_CAPTURE_EXTERNAL_SERVER=1 \
//   GR_CAPTURE_BASE_URL=http://127.0.0.1:5199 npx playwright test e2e/beauty-town.rig.ts --workers=1
// Shots land in reviews/shots-beauty-town/<phase>/, per-shot perf in artifacts/beauty-town/.
const PHASE = process.env.GR_BEAUTY_PHASE ?? 'wip';
const SHOT_DIR = path.resolve('reviews/shots-beauty-town', PHASE);
const PERF_DIR = path.resolve('artifacts/beauty-town');
// Actors walk authored loops off the scene clock, so every phase shoots at the SAME town-second:
// the cast lands within a few centimetres of its previous pose and the boards compare like for like.
const SETTLE_ELAPSED = 6;
const PERF_SAMPLE_MS = 1_900;

type Shot = {
  name: string;
  query?: string;
  camera?: { x: number; z: number; zoom: number };
};

const DESKTOP_SHOTS: readonly Shot[] = [
  { name: '1-boot-wide' },
  { name: '2-plaza-center', camera: { x: 0, z: 2.6, zoom: 0.62 } },
  { name: '3-tavern-close', camera: { x: -4.9, z: -4.9, zoom: 0.36 } },
  { name: '4-assay-close', camera: { x: 6.6, z: 2.4, zoom: 0.36 } },
  { name: '5-dusk-plaza', query: '?townDusk', camera: { x: 0, z: 2.6, zoom: 0.62 } },
  { name: '7-night-plaza', query: '?townNight', camera: { x: 0, z: 2.6, zoom: 0.62 } },
];

const MOBILE_SHOTS: readonly Shot[] = [
  { name: '6-mobile-default' },
  { name: '6b-mobile-lite', query: '?tier=lite' },
  { name: '6c-mobile-lite-close', query: '?tier=lite', camera: { x: -4.9, z: -4.9, zoom: 0.36 } },
];

// GR_BEAUTY_SHOTS=3-tavern-close,4-assay-close narrows a re-shoot to the moments an upgrade touches.
const ONLY = (process.env.GR_BEAUTY_SHOTS ?? '').split(',').map((name) => name.trim()).filter(Boolean);

for (const shot of [...DESKTOP_SHOTS, ...MOBILE_SHOTS]) {
  test(`beauty shot ${shot.name}`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const mobile = testInfo.project.name === 'mobile-chrome';
    test.skip(mobile !== MOBILE_SHOTS.includes(shot), 'shot belongs to the other viewport');
    test.skip(ONLY.length > 0 && !ONLY.includes(shot.name), 'not in GR_BEAUTY_SHOTS');
    const errors = collectErrors(page);
    await seedProfile(page);
    await bootTown(page, shot.query ?? '');
    if (shot.camera) await frameCamera(page, shot.camera);
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
    // TownScene reads the FLAT meta key; only profile activation (a start-menu step) copies the
    // profile-scoped copy across. Shots that reach the town by the history route skip that step,
    // and the first cut of this rig quietly shot a territory-0 town — four buildings, eight
    // townsfolk — for every flagged variant. Seed both so all nine frames show the same town.
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
  if (query) {
    // main.ts only lets MENU_SAFE_PARAMS boot past the start menu — every other search key
    // launches a contract run instead. The town route + reload reaches the flagged town from
    // any phase, so the same rig shoots ?townNight before U7 makes the flag menu-safe.
    await page.evaluate((url) => history.replaceState({ goldRushScene: 'town' }, '', url), `/${query}`);
    await page.reload();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);
  }
  const lite = await page.evaluate(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.town3dPilotState === 'lite');
  if (!lite) {
    await page.waitForFunction(
      () => {
        const data = document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset ?? {};
        const ids = (data.town3dPilotLoadedIds ?? '').split(',').filter(Boolean);
        return ids.length >= 7 && data.town3dPlazaPropsState === 'loaded';
      },
      undefined,
      { timeout: 45_000 },
    );
  }
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.actors ?? []).every((actor) => !actor.visible || actor.loaded), undefined, { timeout: 30_000 });
}

async function frameCamera(page: Page, camera: { x: number; z: number; zoom: number }): Promise<void> {
  await page.evaluate(({ x, z, zoom }) => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    town.teleport(x, z);
    town.camera.setZoom(zoom);
  }, camera);
  await page.waitForFunction(
    (zoom) => {
      const town = window.__GR_TOWN_DIAGNOSTICS__;
      if (!town) return false;
      return Math.abs(town.camera.framingDistanceScale - zoom) < 0.01 && Math.abs(town.camera.actualDistance - town.camera.targetDistance) < 0.05;
    },
    camera.zoom,
    { timeout: 15_000 },
  );
}

async function settle(page: Page): Promise<void> {
  await page.waitForFunction((seconds) => (window.__GR_TOWN_DIAGNOSTICS__?.elapsed ?? 0) > seconds, SETTLE_ELAPSED, { timeout: 30_000 });
}

// This box also runs the factory's fires, so a single 180-frame window drifts by whole
// milliseconds depending on who else is awake — the first pass measured the same idle scene at
// 2.2ms and 4.2ms p95. Three consecutive windows, keep the least-contended one (lowest mean):
// the quietest window is the one that measured the RENDERER rather than the neighbours.
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
      // A pre-instrument tree (the BEFORE worktree) publishes neither: take one window and stop.
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
      contact: town.contact ?? null,
      lighting: town.lighting,
      tier: town.ambientDust.tier,
      buildings: town.buildings.filter((building) => building.visible).length,
    };
  }, PERF_SAMPLE_MS);
}

type TownFrameStats = { last: number; avg: number; p95: number; sampleCount: number };

async function writePerf(testInfo: TestInfo, shot: Shot, perf: Record<string, unknown>, errors: ErrorBucket): Promise<void> {
  await mkdir(PERF_DIR, { recursive: true });
  const file = path.join(PERF_DIR, `perf-${PHASE}-${testInfo.project.name}-${shot.name}.json`);
  await writeFile(file, `${JSON.stringify({ phase: PHASE, project: testInfo.project.name, shot: shot.name, ...perf, errors }, null, 2)}\n`);
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
