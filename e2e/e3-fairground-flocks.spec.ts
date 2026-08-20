import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

/**
 * THE CROWD FLOCKS, in the browser — ratified door-completion-sheet item A1.
 *
 * WHERE THE PLAYER SEES THIS, IN A PLAIN BOOT (Mistake #10): `Game.createScene` builds the crowds
 * beside the Ferris wheel with no `isDebugEnabled()` anywhere in the path, and their state is
 * published through `publishDiagnostics` — the ordinary channel, not the `?debug` harness. Both
 * tests below read `__THREE_GAME_DIAGNOSTICS__.crowdFlocks`, which exists on every boot; `?debug`
 * appears here only because a LOCKED contract (`unlock: secured:e3-moth-season`) cannot be reached
 * from a cold start menu at all, which is why every contract spec in this suite boots the same way.
 */

const CONTRACT = 'debug&epoch=epoch-3-voltage&contract=e3-fairground&nowaves&nolevel&nopause&seed=e3-fairground-flocks';
const QUIET = `?${CONTRACT}&nospawn`;
const LIVE = `?${CONTRACT}`;
const ARTIFACT_DIR = 'artifacts/e3-fairground-flocks';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => localStorage.clear()));

async function open(page: Page, query: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.crowdFlocks != null);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.waitForTimeout(150);
  await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

const flocksOf = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crowdFlocks!);

test('three crowds wait on the gate line, walk on the night cycle, and complete a crossing', async ({ page }, testInfo) => {
  const errors = await open(page, QUIET);

  // AT REST: one crowd per attraction, each on the gate line (the heroStart stake's z), each
  // directly south of the landmark it came for. Every coordinate here is DECLARED contract data.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e3-fairground');
  const rest = await flocksOf(page);
  expect(rest).toMatchObject({ enabled: true, count: 3, escortRadius: 7, attempts: 0, completions: 0, allCrossed: false, night: -1 });
  expect(rest.speed).toBeCloseTo(3.6, 3); // ratified default: hero walk (6) x 0.6
  expect(rest.flocks.map(({ id, x, z, destination, phase }) => ({ id, x, z, destination, phase }))).toEqual([
    { id: 'flock-1', x: -20, z: -30, destination: 'copper-pavilion', phase: 'home' },
    { id: 'flock-2', x: 0, z: -30, destination: 'ferris-wheel', phase: 'home' },
    { id: 'flock-3', x: 20, z: -30, destination: 'silver-pavilion', phase: 'home' },
  ]);
  await shot(page, testInfo, 'crowds-at-the-gate');

  // DAY: nobody moves. The declared cycle is 24s with a 9s hold, so t=4 is broad daylight.
  await page.evaluate(() => {
    window.__GR_TEST__!.setDayNightTime(4);
    window.__GR_TEST__!.advanceSim(1);
  });
  expect(await flocksOf(page)).toMatchObject({ attempts: 0, night: -1 });

  // NIGHT: the dark phase of cycle 0 launches all three.
  await page.evaluate(() => {
    window.__GR_TEST__!.setDayNightTime(14);
    window.__GR_TEST__!.advanceSim(1);
  });
  const launched = await flocksOf(page);
  expect(launched).toMatchObject({ attempts: 3, night: 0 });
  expect(launched.flocks.every(({ phase }) => phase === 'outbound')).toBe(true);
  expect(launched.flocks[1]!.z).toBeGreaterThan(-30);
  await shot(page, testInfo, 'night-crossing');

  // THE CROSSING: nothing spawns in this boot, so the midway is clear and every round trip
  // completes inside one night — the flanks walk 40 units out and back at 3.6 u/s.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(24));
  const crossed = await flocksOf(page);
  expect(crossed.flocks.map(({ crossings, phase }) => ({ crossings, phase })))
    .toEqual([{ crossings: 1, phase: 'home' }, { crossings: 1, phase: 'home' }, { crossings: 1, phase: 'home' }]);
  expect(crossed).toMatchObject({ completions: 3, frights: 0, allCrossed: true });

  // THE LATCH, BOTH HALVES: three crossings banked AND the wheel still turning, so wave 12 secures.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.fairground!)).toMatchObject({ spinning: true, hp: 240 });
  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(12));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(true);

  expect(errors).toEqual([]);
});

test('one outlaw inside the declared escort ring scatters the crowd and voids its crossing', async ({ page }, testInfo) => {
  // Spawns are LIVE in this boot on purpose: `spawnHarnessPack` refuses under `nospawn`, and an
  // enemy is the only thing that may frighten a crowd.
  const errors = await open(page, LIVE);
  await page.evaluate(() => {
    window.__GR_TEST__!.setDayNightTime(14);
    window.__GR_TEST__!.advanceSim(1);
  });
  const launched = await flocksOf(page);
  expect(launched.attempts).toBe(3);
  expect(launched.flocks[1]!.phase).toBe('outbound');

  await page.evaluate(() => {
    const flock = window.__THREE_GAME_DIAGNOSTICS__!.crowdFlocks!.flocks[1]!;
    window.__GR_TEST__!.teleport(flock.x, flock.z - 2);
    window.__GR_TEST__!.spawnPack(2, 1);
    window.__GR_TEST__!.advanceSim(0.3);
  });
  const frightened = await flocksOf(page);
  expect(frightened.frights).toBeGreaterThanOrEqual(launched.frights + 1);
  expect(frightened.flocks[1]!.crossings).toBe(0);
  await shot(page, testInfo, 'fright-scatter');

  expect(errors).toEqual([]);
});
