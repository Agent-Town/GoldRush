import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&e4convoyweather&seed=e4-03';
const ARTIFACT_DIR = 'artifacts/e4-convoy-weather';

async function openHarness(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => Boolean(window.__GR_E4_CONVOY_WEATHER__));
  return errors;
}

test('convoy holds three-unit formation when the leader reroutes', async ({ page }, testInfo: TestInfo) => {
  const errors = await openHarness(page);
  const movement = await page.evaluate(() => window.__GR_E4_CONVOY_WEATHER__!.movementProbe());
  expect(movement.tooCloseFollower).toBe(0);
  expect(movement.lateReroute.every((distance, index) => distance <= movement.maxSteps[index]!)).toBe(true);
  const result = await page.evaluate(() => window.__GR_E4_CONVOY_WEATHER__!.advance(6));
  expect(result.convoy).toMatchObject({ routeId: 'dust-road-detour', reroutes: 1 });
  expect(result.convoy.members).toHaveLength(3);
  expect(result.convoy.members.slice(1).map((member) => member.gap)).toEqual([3, 3]);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-formation.json`, `${JSON.stringify(result, null, 2)}\n`);
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-formation.png` });
  expect(errors).toEqual([]);
});

test('scheduled storm telegraphs, applies modifiers, clears, and repeats deterministically', async ({ page }, testInfo: TestInfo) => {
  const errors = await openHarness(page);
  const clear = await page.evaluate(() => window.__GR_E4_CONVOY_WEATHER__!.reset());
  const telegraph = await page.evaluate(() => window.__GR_E4_CONVOY_WEATHER__!.advance(6.1));
  const storm = await page.evaluate(() => window.__GR_E4_CONVOY_WEATHER__!.advance(4));
  const cleared = await page.evaluate(() => window.__GR_E4_CONVOY_WEATHER__!.advance(12));
  expect(clear.weather).toMatchObject({ phase: 'clear', movementMultiplier: 1, visibilityMultiplier: 1, hazeStrength: 0 });
  expect(telegraph.weather).toMatchObject({ phase: 'telegraph', warning: true, movementMultiplier: 1, visibilityMultiplier: 1 });
  expect(storm.weather).toMatchObject({
    phase: 'storm', warning: false, movementMultiplier: 0.7, visibilityMultiplier: 0.55, hazeColor: '#c99052', hazeStrength: 0.2,
  });
  expect(storm.fog).toEqual({ color: '#c99052', near: 23.1, far: 48.4 });
  expect(cleared.weather).toMatchObject({ phase: 'clear', movementMultiplier: 1, visibilityMultiplier: 1, hazeStrength: 0 });

  const clearMove = await page.evaluate(() => {
    const start = window.__GR_E4_CONVOY_WEATHER__!.reset().convoy.leaderDistance;
    return window.__GR_E4_CONVOY_WEATHER__!.advance(1).convoy.leaderDistance - start;
  });
  const stormMove = await page.evaluate(() => {
    window.__GR_E4_CONVOY_WEATHER__!.reset();
    const start = window.__GR_E4_CONVOY_WEATHER__!.advance(10).convoy.leaderDistance;
    return window.__GR_E4_CONVOY_WEATHER__!.advance(1).convoy.leaderDistance - start;
  });
  expect(clearMove).toBeCloseTo(1, 2);
  expect(stormMove).toBeCloseTo(0.7, 2);

  const first = await page.evaluate(() => {
    window.__GR_E4_CONVOY_WEATHER__!.reset();
    return window.__GR_E4_CONVOY_WEATHER__!.advance(18).hash;
  });
  const second = await page.evaluate(() => {
    window.__GR_E4_CONVOY_WEATHER__!.reset();
    return window.__GR_E4_CONVOY_WEATHER__!.advance(18).hash;
  });
  expect(second).toBe(first);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    `${ARTIFACT_DIR}/${testInfo.project.name}-weather-cycle.json`,
    `${JSON.stringify({ clear, telegraph, storm, cleared, deterministicHash: first }, null, 2)}\n`,
  );
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-storm.png` });
  expect(errors).toEqual([]);
});
