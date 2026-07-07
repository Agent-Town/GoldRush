import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/e2-stamp-mill');
const TAKEN_FRONTIER_NODES = RESEARCH_NODES.map((node) => node.id);
const SCIENCE_STEPS = STEAMWORKS_THRESHOLD + 9;
const STAGE_COSTS = [90, 140, 190];

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ metaKey, megaprojectKey, researchKey, scoreKey, scienceSteps, takenNodes }) => {
      localStorage.removeItem(megaprojectKey);
      localStorage.removeItem(scoreKey);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: scienceSteps, hero: 0, agent: 0 },
        }),
      );
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: takenNodes, proposalSalt: 0 }));
    },
    {
      metaKey: META_PROGRESS_KEY,
      megaprojectKey: MEGAPROJECT_STATE_KEY,
      researchKey: RESEARCH_STATE_KEY,
      scoreKey: SCOREBOARD_KEY,
      scienceSteps: SCIENCE_STEPS,
      takenNodes: TAKEN_FRONTIER_NODES,
    },
  );
  await page.goto('/?debug&timescale=4&nolevel&nopause&seed=e2-stamp-mill');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 120);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setWave(0);
  });
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function trackAnnouncements(page: Page): Promise<void> {
  await page.evaluate(() => {
    const windowWithLines = window as unknown as { __STAMP_MILL_LINES__?: string[] };
    windowWithLines.__STAMP_MILL_LINES__ = [];
    const tick = () => {
      const line = window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement;
      const lines = windowWithLines.__STAMP_MILL_LINES__!;
      if (line && lines[lines.length - 1] !== line) lines.push(line);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function announcements(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __STAMP_MILL_LINES__?: string[] }).__STAMP_MILL_LINES__ ?? []);
}

async function megaproject(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.megaproject);
}

async function fundStage(page: Page, stageIndex: number): Promise<void> {
  const cost = STAGE_COSTS[stageIndex]!;
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 120);
    window.__GR_TEST__?.setWave(window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
  });
  await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), cost);
  expect(await page.evaluate(() => window.__GR_TEST__?.fundMegaproject())).toBe(true);
  await expect.poll(() => megaproject(page).then((site) => site.funded)).toBe(true);
  expect(await megaproject(page).then((site) => site.materials.gold)).toBe(cost);
}

async function waitForStage(page: Page, stage: number): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 1);
    window.__GR_TEST__?.setWave(window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
  });
  await expect.poll(() => megaproject(page).then((site) => site.stage), { timeout: 18_000 }).toBe(stage);
}

test('Stamp Mill manifest builds to the door without switching epochs', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page);
  await trackAnnouncements(page);

  const initial = await megaproject(page);
  expect(initial).toMatchObject({
    id: 'stamp-mill',
    name: 'The Stamp Mill',
    unlocked: true,
    complete: false,
    stage: 0,
    totalStages: 3,
    funded: false,
    materials: { gold: STAGE_COSTS[0] },
  });
  expect(initial.siteFootprint).toEqual({ x: -8, z: 16, w: 5, d: 3 });
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().overflow)).toBe(9);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().meter)).toContain('the Steamworks awaits a town to build it');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails.active)).toBe(false);

  await page.evaluate(() => {
    const footprint = window.__THREE_GAME_DIAGNOSTICS__!.megaproject.siteFootprint!;
    window.__GR_TEST__?.teleport(footprint.x, footprint.z + 2);
    window.__GR_TEST__?.selectBuildable('sentry_beacon');
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.reservedFootprints[0]?.id)).toBe('stamp-mill');

  await fundStage(page, 0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement)).toBe(
    'The Stamp Mill rises: the rail spur is staked.',
  );
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().meter)).toContain('the town is building the Steamworks');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails)).toMatchObject({
    active: true,
    style: 'mine-spur',
    renderSlot: 'groundDecals',
    asset: 'procedural-placeholder',
  });
  await shot(page, testInfo, 'stage-1-rail-spur');

  await waitForStage(page, 1);

  await fundStage(page, 1);
  expect(await announcements(page)).toContain('The Stamp Mill rises: the boilers are seated.');
  await shot(page, testInfo, 'stage-2-boiler-house');
  expect(await page.evaluate(() => window.__GR_TEST__?.damageMegaproject(999))).toBe(true);
  await expect.poll(() => megaproject(page).then((site) => site.delayTicks), { timeout: 8_000 }).toBeGreaterThan(0);
  expect(await megaproject(page)).toMatchObject({ stage: 1, funded: true, ticksRemaining: 4 });
  await waitForStage(page, 2);

  await fundStage(page, 2);
  await shot(page, testInfo, 'stage-3-stamp-mill');
  await waitForStage(page, 3);
  expect(await megaproject(page).then((site) => site.complete)).toBe(true);
  expect(await announcements(page)).toContain('The Stamp Mill stands ready. The era waits on its whistle.');

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.tileId)).toBe('frontier-river-claim');
  expect(await page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.loadEpoch('epoch-2-steamworks').locked)).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().steps)).toBe(SCIENCE_STEPS);

  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await megaproject(page)).toMatchObject({ id: 'stamp-mill', stage: 3, complete: true, funded: false });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
