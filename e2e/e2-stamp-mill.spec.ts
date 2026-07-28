import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/stamp-site-read');
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

async function openScienceIncompleteGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ metaKey, megaprojectKey, researchKey, scoreKey }) => {
      localStorage.removeItem(megaprojectKey);
      localStorage.removeItem(researchKey);
      localStorage.removeItem(scoreKey);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: 0, hero: 0, agent: 0 },
        }),
      );
    },
    {
      metaKey: META_PROGRESS_KEY,
      megaprojectKey: MEGAPROJECT_STATE_KEY,
      researchKey: RESEARCH_STATE_KEY,
      scoreKey: SCOREBOARD_KEY,
    },
  );
  await page.goto('/?debug&timescale=4&nolevel&nopause&seed=e2-stamp-mill-locked');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
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

async function teleportToStampSitePrompt(page: Page): Promise<void> {
  const site = await megaproject(page);
  const footprint = site.siteFootprint;
  if (!footprint) throw new Error('Stamp Mill site footprint missing');
  await page.evaluate(
    (pos) => window.__GR_TEST__?.teleport(pos.x, pos.z),
    { x: footprint.x, z: footprint.z - footprint.d * 0.5 - 0.72 },
  );
}

async function expectFundPrompt(page: Page, stageIndex: number) {
  await teleportToStampSitePrompt(page);
  const button = page.getByTestId('stamp-site-fund');
  await expect(button).toBeVisible();
  await expect(button).toContainText(`Fund stage ${stageIndex + 1} — ${STAGE_COSTS[stageIndex]}g`);
  await expect(page.getByTestId('building-context-prompt')).toContainText('STAMP MILL & RAIL SPUR');
  return button;
}

async function fundStage(page: Page, stageIndex: number): Promise<void> {
  const cost = STAGE_COSTS[stageIndex]!;
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 120);
    window.__GR_TEST__?.setWave(window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
  });
  await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), cost);
  const beforeGold = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  const button = await expectFundPrompt(page, stageIndex);
  await button.click();
  await expect.poll(() => megaproject(page).then((site) => site.funded)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(beforeGold - cost);
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
  expect(initial.siteRead).toMatchObject({
    packedEarth: true,
    stakes: 4,
    stringLines: 4,
    walkwayPlanks: 5,
    signboard: true,
    constructionProps: 0,
    surveyVisible: true,
  });
  expect(initial.siteRead?.plaque).toContain('surveyed for the town');
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
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));

  const firstFundButton = await expectFundPrompt(page, 0);
  await expect.poll(() => megaproject(page).then((site) => site.siteRead?.promptReady ?? false)).toBe(true);
  await expect(page.getByTestId('story-beat-card')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'stamp-site-found');
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-speaker', 'elder');
  // F-1158-2: this asserted "The survey's done." — the beat's first line as authored by
  // 734f269e (07-08 08:45). ss-02 (e3019343, 07-08 17:47) re-authored the whole 21-beat table
  // and gave stamp-site-found new lines; this expectation was never updated, so the test has
  // been red for 20 days. Both lines below are read from src/story/beats.ts:173 (the shipped,
  // reviewed copy). The assertion's intent — both authored lines render on the card — is intact.
  await expect(page.getByTestId('story-beat-card')).toContainText('Fund the first stage here.');
  await expect(page.getByTestId('story-beat-card')).toContainText("The Steamworks wants a founder's gold.");
  await expect(firstFundButton).toHaveAttribute('data-story-pointer', 'true');
  await shot(page, testInfo, 'pre-funding-surveyed-site');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  await page.evaluate(() => window.__GR_STORY__?.emit({ type: 'stamp-site-found' }));
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);

  await fundStage(page, 0);
  await expect.poll(() => megaproject(page).then((site) => site.siteRead?.surveyVisible ?? true)).toBe(false);
  expect(await megaproject(page).then((site) => site.siteRead?.constructionProps ?? 0)).toBeGreaterThan(0);
  expect(await megaproject(page).then((site) => site.siteRead?.plaque ?? '')).toContain('stage 1');
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

test('Stamp Mill claim site stays hidden before Steamworks science', async ({ page }) => {
  const errors = await openScienceIncompleteGame(page);
  const locked = await megaproject(page);
  expect(locked).toMatchObject({
    id: 'stamp-mill',
    unlocked: false,
    active: false,
    complete: false,
    funded: false,
  });
  expect(locked.siteRead).toMatchObject({
    packedEarth: false,
    stakes: 0,
    stringLines: 0,
    walkwayPlanks: 0,
    signboard: false,
    constructionProps: 0,
    promptReady: false,
    surveyVisible: false,
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.reservedFootprints.length)).toBe(0);
  await expect(page.getByTestId('building-context-prompt')).toBeHidden();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
