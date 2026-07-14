import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

type Errors = { console: string[]; page: string[] };
const ARTIFACT_DIR = path.resolve('artifacts/e3-day-night');
const QUERY = '?debug&daynight&contract=e1-night-shift&timescale=8&nowaves&nospawn&nolevel&seed=e3-day-night';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => localStorage.clear()));

function errors(page: Page): Errors {
  const found: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') found.console.push(message.text()); });
  page.on('pageerror', (error) => found.page.push(error.message));
  return found;
}

async function open(page: Page): Promise<Errors> {
  const found = errors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return found;
}

async function setTime(page: Page, seconds: number): Promise<void> {
  await page.evaluate((time) => window.__GR_TEST__?.setDayNightTime(time), seconds);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.dayNight?.simTime)).toBe(seconds);
}

async function hudStyle(page: Page) {
  return page.locator('#hud').evaluate((element) => {
    const style = getComputedStyle(element);
    return { filter: style.filter, color: style.color, opacity: style.opacity };
  });
}

async function captureStrip(page: Page, testInfo: TestInfo): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const frames: PNG[] = [];
  for (const [name, time] of [['dusk', 10], ['midnight', 16], ['dawn', 22]] as const) {
    await setTime(page, time);
    const buffer = await page.locator('#game-canvas').screenshot();
    await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), buffer);
    frames.push(PNG.sync.read(buffer));
  }
  const width = frames[0]!.width;
  const height = frames[0]!.height;
  const strip = new PNG({ width: width * frames.length, height });
  frames.forEach((frame, index) => {
    for (let y = 0; y < height; y += 1) {
      frame.data.copy(strip.data, (y * strip.width + index * width) * 4, y * width * 4, (y + 1) * width * 4);
    }
  });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-dusk-midnight-dawn-strip.png`), PNG.sync.write(strip));
}

test('loops the existing light rig, publishes lantern coverage, and never tints UI', async ({ page }, testInfo) => {
  const found = await open(page);

  await setTime(page, 0);
  const dayUi = await hudStyle(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'full', darkness: 0,
  });

  await setTime(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness)).toBeCloseTo(0.5, 2);

  await setTime(page, 16);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dark', darkness: 1,
  });
  expect(await hudStyle(page)).toEqual(dayUi);

  await page.evaluate(() => {
    window.__GR_TEST__?.grantGold(100);
    window.__GR_TEST__?.teleport(0, 16);
    window.__GR_TEST__?.repair('lantern_post', 0);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.coverage.sources)).toBe(1);
  const coverage = await page.evaluate(() => ({
    near: window.__GR_TEST__?.lightCoverage(0, 16),
    far: window.__GR_TEST__?.lightCoverage(10, 16),
  }));
  expect(coverage.near).toBeGreaterThan(0.95);
  expect(coverage.far).toBeLessThan(0.05);

  await setTime(page, 22);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dawn', darkness: 0.5,
  });
  await setTime(page, 24);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.dayNight)).toMatchObject({
    phase: 'full', darkness: 0, cycle: 1,
  });

  await captureStrip(page, testInfo);
  expect(found.console).toEqual([]);
  expect(found.page).toEqual([]);
});
