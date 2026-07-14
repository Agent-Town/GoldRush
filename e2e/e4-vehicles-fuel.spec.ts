import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&vehicles&nowaves&nolevel&nopause&seed=e4-vehicles';
const ARTIFACT_DIR = 'artifacts/e4-vehicles-fuel';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openHarness(page: Page): Promise<string[]> {
  const errors = watchErrors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.vehicle?.active === true && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function harvest(page: Page, nodeIndex: number): Promise<void> {
  const node = await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__!.fuel!.nodes[index]!, nodeIndex);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), node);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1.5));
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('tar harvest fuels the HAULER, dry-halts it, and resumes without a jump', async ({ page }, testInfo) => {
  const errors = await openHarness(page);
  await harvest(page, 0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.fuel)).toMatchObject({ tar: 0, stored: 12, harvestedNodes: 1, refinedTar: 3 });

  expect(await page.evaluate(() => window.__GR_TEST__!.driveVehicle(50, -8))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(5));
  const dry = await page.evaluate(() => ({ fuel: window.__THREE_GAME_DIAGNOSTICS__!.fuel!, vehicle: window.__THREE_GAME_DIAGNOSTICS__!.vehicle! }));
  expect(dry.vehicle).toMatchObject({ kind: 'hauler', state: 'dry', burnPerSecond: 3, speed: 9 });
  expect(dry.fuel.stored).toBeCloseTo(0, 8);
  const dryPosition = { x: dry.vehicle.x, z: dry.vehicle.z, distanceTravelled: dry.vehicle.distanceTravelled };
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  expect(await page.evaluate(() => {
    const vehicle = window.__THREE_GAME_DIAGNOSTICS__!.vehicle!;
    return { x: vehicle.x, z: vehicle.z, distanceTravelled: vehicle.distanceTravelled };
  })).toEqual(dryPosition);
  await shot(page, testInfo, 'dry-halt');

  await harvest(page, 1);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(4));
  const resumed = await page.evaluate(() => ({ fuel: window.__THREE_GAME_DIAGNOSTICS__!.fuel!, vehicle: window.__THREE_GAME_DIAGNOSTICS__!.vehicle!, calls: window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls }));
  expect(resumed.vehicle.state).toBe('arrived');
  expect(resumed.vehicle.distanceTravelled).toBeCloseTo(70, 5);
  expect(resumed.fuel.drawn).toBeCloseTo((70 / 9) * 3, 5);
  expect(resumed.calls).toBeLessThan(200);
  await shot(page, testInfo, 'fuel-resume');
  expect(errors).toEqual([]);
});

test('fixed-step fuel and vehicle results are deterministic', async ({ page }) => {
  const errors = watchErrors(page);
  const run = async () => {
    await page.goto(`/${QUERY}`);
    await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.vehicle?.active === true);
    const begin = page.getByRole('button', { name: 'Begin' });
    if (await begin.isVisible()) await begin.click();
    await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
    await harvest(page, 0);
    await page.evaluate(() => {
      window.__GR_TEST__!.driveVehicle(50, -8);
      window.__GR_TEST__!.advanceSim(5);
    });
    return page.evaluate(() => JSON.stringify({ fuel: window.__THREE_GAME_DIAGNOSTICS__!.fuel, vehicle: window.__THREE_GAME_DIAGNOSTICS__!.vehicle }));
  };
  expect(await run()).toBe(await run());
  expect(errors).toEqual([]);
});
