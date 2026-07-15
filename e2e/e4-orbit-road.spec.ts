import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&e4orbit&seed=dustflats-1';
const ARTIFACT_DIR = 'artifacts/e4-orbit-road';

async function openHarness(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => Boolean(window.__GR_E4_ORBIT_ROAD__));
  return errors;
}

async function artifact(page: Page, testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
  const png = await page.getByTestId('e4-orbit-road-harness').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL('image/png'));
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png`, Buffer.from(png.split(',')[1]!, 'base64'));
}

test('wave circles the literal ring road, warns, then peels inward', async ({ page }, testInfo) => {
  const errors = await openHarness(page);
  const spawned = await page.evaluate(() => window.__GR_E4_ORBIT_ROAD__!.snapshot());
  expect(spawned.orbit).toMatchObject({ contractId: 'dust-flats-dev', enabled: true, radius: 24 });
  expect(spawned.orbit.members).toHaveLength(3);
  expect(spawned.orbit.members.every((member) => member.state === 'orbiting' && member.radius === 24 && !member.telegraphed)).toBe(true);

  const warned = await page.evaluate(() => window.__GR_E4_ORBIT_ROAD__!.advance(7.1));
  expect(warned.orbit.members[0]).toMatchObject({ state: 'orbiting', telegraphed: true, peelPointId: 'east-cut', peelAt: 9 });
  const peeled = await page.evaluate(() => window.__GR_E4_ORBIT_ROAD__!.advance(2));
  expect(peeled.orbit.members[0]!.state).toBe('peeled');
  expect(peeled.orbit.members[0]!.radius).toBeLessThan(24);
  await artifact(page, testInfo, 'peel', peeled);
  expect(errors).toEqual([]);
});

test('graded road is 2.5x faster, burns less fuel, and attracts enemy convoys', async ({ page }, testInfo) => {
  const errors = await openHarness(page);
  const result = await page.evaluate(() => window.__GR_E4_ORBIT_ROAD__!.advance(4));
  expect(result.roads).toMatchObject({ segments: 1, length: 120, friendlySpeedMultiplier: 2.5, friendlyFuelMultiplier: 0.4 });
  expect(result.friendly.speedRatio).toBe(2.5);
  expect(result.friendly.fuelRatio).toBe(0.4);
  expect(result.enemyRoute).toEqual({ routeId: 'graded-road', cost: 6, roadLength: 24 });
  await artifact(page, testInfo, 'road-effects', result);
  expect(errors).toEqual([]);
});

test('orbit and road results repeat deterministically', async ({ page }) => {
  const errors = await openHarness(page);
  const first = await page.evaluate(() => {
    window.__GR_E4_ORBIT_ROAD__!.reset();
    return window.__GR_E4_ORBIT_ROAD__!.advance(16).hash;
  });
  const second = await page.evaluate(() => {
    window.__GR_E4_ORBIT_ROAD__!.reset();
    return window.__GR_E4_ORBIT_ROAD__!.advance(16).hash;
  });
  expect(second).toBe(first);
  expect(errors).toEqual([]);
});
