import { mkdir, readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nowaves&nokill&nolevel&nopause&seed=dustflats-1';
const ARTIFACT_DIR = 'artifacts/e4-dust-flats';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-4-motor');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('fires the authored storm and peels a convoy off the ORBIT road', async ({ page }, testInfo) => {
  const errors = await open(page);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract)).toMatchObject({
    activeId: 'e4-dust-flats',
    epochId: 'epoch-4-motor',
    secureWave: 12,
    tileParams: { size: 160, dimensions: { width: 160, height: 160 } },
  });
  expect(await page.evaluate(async () => (await import('../src/meta/ContractFamilies')).epochIsActive('epoch-4-motor'))).toBe(true);

  await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(1);
    window.__GR_TEST__!.advanceSim(12);
  });
  const dust = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.dustFlats);
  expect(dust).toMatchObject({
    enabled: true,
    ringRoad: { radius: 24 },
    weather: { contractId: 'e4-dust-flats', phase: 'storm', cycle: 0 },
    orbit: { contractId: 'e4-dust-flats', radius: 24 },
  });
  expect(dust?.tarSeams).toHaveLength(4);
  expect(dust?.orbit.members).toHaveLength(3);
  expect(dust?.orbit.members.every((member) => member.state === 'peeled')).toBe(true);
  expect((await page.evaluate(() => window.__GR_TEST__!.enemyPositions())).filter((enemy) => enemy.variantId === 'motor_gang')).toHaveLength(3);

  expect(await page.evaluate(() => window.__GR_TEST__!.gradeRoad('camp-to-railhead'))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.gradeRoad('camp-to-railhead'))).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.dustFlats?.roads)).toMatchObject({
    segments: 1,
    friendlySpeedMultiplier: 2.5,
    graded: ['camp-to-railhead'],
  });
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(-12, -8);
    window.__GR_TEST__!.advanceSim(1);
  });
  expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vehicle?.distanceTravelled ?? 0))).toBeGreaterThan(4);
  const storyCard = page.getByTestId('story-beat-card');
  if (await storyCard.isVisible()) await expect(storyCard).toBeHidden({ timeout: 7_000 });
  await shot(page, testInfo, 'storm-graded-road');
  expect(errors).toEqual([]);
});

test('publishes a mask table that matches the real Dust Flats contract', async ({ page }) => {
  const errors = await open(page);
  const contract = await page.evaluate(() => window.__GR_TEST__!.activeContract());
  const mask = JSON.parse(await readFile('assets/contracts/epoch-4-motor/mask-tables/e4-dust-flats.json', 'utf8')).maskTruth;
  expect(mask.tileId).toBe('e4-dust-flats');
  expect(mask.dimensions).toEqual(contract.tileParams.dimensions);
  expect(mask.buildZones).toEqual(contract.tileParams.buildZones);
  expect(mask.harvestAnchors).toEqual(contract.tileParams.harvestAnchors);
  expect(mask.tarSeams).toEqual(contract.tileParams.tarSeams);
  expect(mask.roadCorridors).toEqual(contract.tileParams.roadCorridors);
  expect(mask.dryWash).toEqual(contract.tileParams.dryWash);
  expect(mask.lanes).toEqual(contract.tileParams.lanes);
  expect(await page.evaluate(async () => {
    const contracts = await import('../src/meta/ContractFamilies');
    const authored = structuredClone(contracts.loadContract('e4-dust-flats'));
    authored.tileParams.orbitSpawn!.radius = 0;
    authored.twist.weather!.telegraphSeconds = 0;
    return contracts.parseContractDescriptor(contracts.contractDescriptorJson(authored), contracts.loadContract('e4-dust-flats')).ok;
  })).toBe(false);
  expect(errors).toEqual([]);
});

test('offers road grading and the hauler in a normal Motor-era run', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'e4-dust-flats'));
  await page.goto('/?contract=e4-dust-flats&nowaves&nospawn&nokill&nolevel&nopause');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats' && window.__THREE_GAME_DIAGNOSTICS__?.vehicle?.active === true);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyS');
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.dustFlats?.roads.segments ?? 0)).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vehicle?.target)).toEqual({ x: 0, z: 72 });
  expect(errors).toEqual([]);
});
