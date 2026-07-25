import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&deepwater&nowaves&nolevel&nopause&seed=shelf-1';
const ARTIFACT_DIR = 'artifacts/e5-water-spike';

async function openHarness(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => Boolean(window.__GR_E5_DEEPWATER__));
  return errors;
}

async function artifact(page: Page, testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
  await page.getByTestId('e5-deepwater-harness').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('deepwater boots the 128x128 real dev tile with swim, boat, and depth classes', async ({ page }, testInfo) => {
  const errors = await openHarness(page);
  const state = await page.evaluate(() => window.__GR_E5_DEEPWATER__!.snapshot());
  expect(state.tile).toMatchObject({ id: 'shelf-reefs-dev', size: 128 });
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.sample(0, 30, 'swim'))).toMatchObject({
    regionId: 'lagoon-shallows', depth: -1, depthClass: 'shallows', passable: true,
  });
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.sample(20, 0, 'boat'))).toMatchObject({
    regionId: 'reef-ring', depth: -2, depthClass: 'reef', passable: false,
  });
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.sample(0, 0, 'boat'))).toMatchObject({
    regionId: 'reef-gap', depth: -2, depthClass: 'reef', passable: true,
  });
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.sample(0, -24, 'depth'))).toMatchObject({
    regionId: 'wreck-shelf', depth: -4, depthClass: 'wreck', passable: true,
  });
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.sample(0, -56, 'depth'))).toMatchObject({
    regionId: 'trench-edge', depth: -8, depthClass: 'trench', passable: false,
  });
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.sample(0, -56, 'boat'))).toMatchObject({
    regionId: 'trench-edge', depth: -8, depthClass: 'trench', passable: false,
  });
  await artifact(page, testInfo, 'water-tile', state);
  expect(errors).toEqual([]);
});

test('Claim-Boat pads accept buildings and carry them between anchors', async ({ page }, testInfo) => {
  const errors = await openHarness(page);
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.placeBuilding('bow', 'sentry_beacon'))).toBe(true);
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.placeBuilding('bow', 'turret'))).toBe(false);
  const before = await page.evaluate(() => window.__GR_E5_DEEPWATER__!.snapshot().boat);
  expect(before.buildings).toEqual([{ buildingId: 'sentry_beacon', padId: 'bow', x: 0, z: 27 }]);
  expect(await page.evaluate(() => window.__GR_E5_DEEPWATER__!.reanchor('open-water'))).toBe(true);
  const after = await page.evaluate(() => window.__GR_E5_DEEPWATER__!.snapshot());
  expect(after.boat.anchor.id).toBe('open-water');
  expect(after.boat.buildings).toEqual([{ buildingId: 'sentry_beacon', padId: 'bow', x: -24, z: 9 }]);
  expect(after.log).toEqual(['building:sentry_beacon:bow', 'anchor:open-water']);
  await artifact(page, testInfo, 'boat-pads', after);
  expect(errors).toEqual([]);
});

test('storm fronts carry one west-to-east wave per deterministic cycle', async ({ page }, testInfo) => {
  const errors = await openHarness(page);
  const first = await page.evaluate(() => window.__GR_E5_DEEPWATER__!.advance(8));
  expect(first.storm.weather.phase).toBe('storm');
  expect(first.storm.waves).toEqual([{ wave: 1, cycle: 0, scheduledAt: 8, direction: 'west-to-east', fromX: -64, toX: 64 }]);
  expect(first.log).toEqual(['wave:1:storm-0:west-to-east@8']);
  const second = await page.evaluate(() => window.__GR_E5_DEEPWATER__!.advance(24));
  expect(second.storm.waves).toHaveLength(2);
  expect(second.storm.waves[1]).toMatchObject({ wave: 2, cycle: 1, scheduledAt: 32 });
  const hash = second.hash;
  const repeated = await page.evaluate(() => {
    window.__GR_E5_DEEPWATER__!.reset();
    window.__GR_E5_DEEPWATER__!.advance(8);
    return window.__GR_E5_DEEPWATER__!.advance(24);
  });
  expect(repeated.hash).toBe(hash);
  expect(repeated.log).toEqual(second.log);
  await artifact(page, testInfo, 'storm-waves', repeated);
  expect(errors).toEqual([]);
});

test('plain debug boot leaves the deepwater chunk dormant', async ({ page }) => {
  await page.addInitScript(() => performance.setResourceTimingBufferSize(10_000));
  await page.goto('/?debug&nowaves&nolevel&nopause');
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => ({
    installed: window.__GR_E5_DEEPWATER__ !== undefined,
    resources: performance.getEntriesByType('resource').map((entry) => entry.name).filter((name) => /E5Deepwater/i.test(name)),
  }))).toEqual({ installed: false, resources: [] });
});
