import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&tram&nowaves&nolevel&nopause&seed=e3-tram';
const ARTIFACT_DIR = 'artifacts/e3-tram';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('tram moves powered, holds cargo dark, and resumes on the authored loop', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.tram?.active === true && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));

  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1));
  const moving = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  expect(moving.state).toBe('moving');
  expect(moving.distanceTravelled - start.distanceTravelled).toBeGreaterThan(5);
  expect(moving.cargo).toEqual(start.cargo);

  expect(await page.evaluate(() => window.__GR_TEST__?.queuePowerGraphCommand({ type: 'set-node-online', nodeId: 'tram-generator', online: false }))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.2));
  const dark = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  expect(dark).toMatchObject({ state: 'unpowered', powered: false, drawWatts: 4 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes.find((node) => node.id === 'tram-motor')?.state)).toBe('dark');
  expect(dark.cargo).toEqual(start.cargo);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(2));
  const held = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  expect({ x: held.x, z: held.z, distanceTravelled: held.distanceTravelled }).toEqual({ x: dark.x, z: dark.z, distanceTravelled: dark.distanceTravelled });
  await shot(page, testInfo, 'dark-halt');

  expect(await page.evaluate(() => window.__GR_TEST__?.queuePowerGraphCommand({ type: 'set-node-online', nodeId: 'tram-generator', online: true }))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1));
  const resumed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  expect(resumed.state).toBe('moving');
  expect(resumed.distanceTravelled - held.distanceTravelled).toBeGreaterThan(5);
  expect(resumed.cargo).toEqual(start.cargo);
  await shot(page, testInfo, 'powered-resume');

  const loop = await page.evaluate(() => {
    let previous = window.__THREE_GAME_DIAGNOSTICS__!.tram!;
    let maxStep = 0;
    window.__GR_TEST__?.advanceSim(25, () => {
      const current = window.__THREE_GAME_DIAGNOSTICS__!.tram!;
      maxStep = Math.max(maxStep, Math.hypot(current.x - previous.x, current.z - previous.z));
      previous = current;
    });
    return { tram: window.__THREE_GAME_DIAGNOSTICS__!.tram!, maxStep };
  });
  expect(loop.tram.trips).toBeGreaterThan(0);
  expect(loop.tram.progress).toBeLessThan(1);
  expect(loop.maxStep).toBeLessThan(3);
  expect(errors).toEqual([]);
});
