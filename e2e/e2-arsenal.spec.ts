import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MEDALS_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { researchStateKey } from '../src/meta/ResearchTree';
import type { CraftedItemDef } from '../src/crafting/CraftingQueueContract';
import type { StatSimRun } from '../src/crafting/StatSimHarness';

const ARTIFACT_DIR = path.resolve('artifacts/e2-arsenal');
const QUERY = '?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&timescale=8';

async function open(page: Page, testInfo: TestInfo, medal = false): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    ({ e1Research, e2Research, medals, hasMedal }) => {
      localStorage.setItem(e1Research, JSON.stringify({
        version: 1,
        steps: 4,
        taken: ['beacon_cadence', 'brass_coil_standards', 'powder_math', 'sky_rocket_battery'],
        proposalSalt: 0,
        pinnedTarget: null,
      }));
      localStorage.setItem(e2Research, JSON.stringify({
        version: 1,
        steps: 3,
        taken: ['boiler_lance', 'pressure_mortar', 'boiler_battery'],
        proposalSalt: 0,
        pinnedTarget: null,
      }));
      if (hasMedal) localStorage.setItem(medals, JSON.stringify({ version: 1, baronBeaten: true, rocketCartCaptured: true }));
      else localStorage.removeItem(medals);
    },
    {
      e1Research: profileDataKey('robin', researchStateKey('epoch-1-frontier')),
      e2Research: profileDataKey('robin', researchStateKey('epoch-2-steamworks')),
      medals: profileDataKey('robin', MEDALS_KEY),
      hasMedal: medal,
    },
  );
  await page.goto(`${QUERY}&seed=e2-arsenal-${testInfo.project.name}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('pressure arsenal fires through existing resolvers and the captured battery requires the Baron medal', async ({ page }, testInfo) => {
  const errors = await open(page, testInfo);
  await page.evaluate(() => {
    window.__GR_TEST__?.grantPressure(75);
    window.__GR_TEST__?.spawnPack(4, 6, { speedScale: 0.01 });
    window.__GR_TEST__?.advanceSim(0.1);
  });
  await shot(page, testInfo, 'boiler-lance-steam-jet');
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.25));

  const beforeMedal = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressureArsenal);
  expect(beforeMedal?.fires.boilerLance).toBeGreaterThan(0);
  expect(beforeMedal?.fires.pressureMortar).toBeGreaterThan(0);
  expect(beforeMedal?.fires.skyRocket).toBe(0);
  expect(beforeMedal?.pressureSpent).toBeGreaterThan(0);
  await shot(page, testInfo, 'pressure-mortar-arc');

  await page.evaluate((medals) => {
    localStorage.setItem(medals, JSON.stringify({ version: 1, baronBeaten: true, rocketCartCaptured: true }));
    window.__GR_TEST__?.grantPressure(75);
    window.__GR_TEST__?.spawnPack(4, 6, { speedScale: 0.01 });
    window.__GR_TEST__?.advanceSim(0.2);
  }, profileDataKey('robin', MEDALS_KEY));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressureArsenal.fires.skyRocket)).toBeGreaterThan(0);
  await shot(page, testInfo, 'sky-rocket-gold-teal-salvo');

  const pressureEvents = await page.evaluate(() => window.__GR_TEST__?.economyLog().filter((event: any) => event.type === 'resource_spent')) ?? [];
  expect(pressureEvents.some((event: any) => event.sink === 'arsenal_boilerLance')).toBe(true);
  expect(pressureEvents.some((event: any) => event.sink === 'arsenal_pressureMortar')).toBe(true);
  expect(pressureEvents.some((event: any) => event.sink === 'arsenal_skyRocket')).toBe(true);
  expect(errors).toEqual([]);
});

test('Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store', async ({ page }, testInfo) => {
  const errors = await open(page, testInfo, true);
  await page.evaluate(() => {
    window.__GR_TEST__?.setUpgradeStacks({ auto_pan: 1 });
    window.__GR_TEST__?.grantPressure(50);
    const seam = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.active);
    if (seam) window.__GR_TEST__?.teleport(seam.position.x, seam.position.z);
    window.__GR_TEST__?.advanceSim(1.5);
  });
  const autoPan = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressureArsenal);
  expect(autoPan?.autoPanSeconds).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__GR_TEST__?.economyLog().some((event: any) => event.type === 'resource_spent' && event.sink === 'auto_pan'))).toBe(true);

  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('turret', 0, 10))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.1));
  const workingRate = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'turret')?.effectiveFireRate ?? 0);
  await page.evaluate(() => {
    const pressure = window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure.amount ?? 0;
    window.__GR_TEST__?.grantPressure(95 - pressure);
    window.__GR_TEST__?.advanceSim(0.1);
  });
  const highRate = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'turret')?.effectiveFireRate ?? 0);
  expect(workingRate).toBeCloseTo(1.32, 2);
  expect(highRate).toBeCloseTo(1.595, 2);
  expect(highRate).toBeGreaterThan(workingRate);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressureArsenal.multiplayerPosture)).toBe('single-player-gated');
  expect(errors).toEqual([]);
});

test('Auto-Pan stays within the uncommon StatSim budget deterministically', async ({ page }, testInfo) => {
  await page.goto('/?debug&nowaves&nolevel');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const item: CraftedItemDef = {
    id: 'e2_auto_pan',
    kind: 'tool',
    rarity: 'uncommon',
    family: 'panning',
    name: 'Auto-Pan',
    blurb: 'A pressure-fed shaking tool beside the pan.',
    cost: 55,
    stats: { panTickMult: -0.25 },
  };
  const result = await page.evaluate(async (candidate) => {
    const modulePath = '/src/crafting/StatSimHarness.ts';
    const { runStatSimHarness } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/crafting/StatSimHarness');
    return runStatSimHarness(candidate);
  }, item) as StatSimRun;
  expect(result.status).toBe('within-tolerance');
  expect(result.contract.budgetOk).toBe(true);
  expect(result.hash).toBeTruthy();
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-auto-pan-statsim.json`), `${JSON.stringify(result, null, 2)}\n`);
});
