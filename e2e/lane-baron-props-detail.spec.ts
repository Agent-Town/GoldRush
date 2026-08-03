import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const OUT = path.resolve('artifacts/baron-props/after');

test('the detailed launcher and powder keg mount without the wrecker stone', async ({ page }, testInfo) => {
  testInfo.setTimeout(120_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&tier=full&seed=baron-props-detail');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await page.evaluate(() => {
    const rocket = window.__GR_TEST__?.activeContract().twist.baron?.rocketVolley;
    if (!rocket) throw new Error('missing Baron rocket volley manifest');
    Object.assign(rocket, { damage: 0, cadenceSeconds: 2, telegraphSeconds: 0.25, airTime: 1.1, spreadRadius: 0.9 });
    window.__GR_TEST__?.setBalance('sparkRig.damage', 0);
    window.__GR_TEST__?.setBalance('sparkRig.range', 0);
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 12, {
      eliteKind: 'baron', hpScale: 240, speedScale: 0.001, visualScale: 4, banner: true, wrecker: true,
      heroPursuitRange: 45, buildingDamageScale: 12, supportBuildingDamageScale: 8,
    });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronRocket.props.state), { timeout: 30_000 }).toBe('ready');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronRocket.props)).resolves.toEqual({
    state: 'ready', source: 'glb', launcher: true, rocket: true, powderKeg: true,
    triangles: { launcher: 2020, rocket: 876, powder_keg: 704 },
  });
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.baronVolley.rockets.modelReady)).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronRocket.distanceFromBaron ?? 99)).toBeLessThan(2.5);

  await mkdir(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${testInfo.project.name}-carried-props.png`) });
  await page.evaluate((x) => window.__GR_TEST__?.teleport(x, 12), testInfo.project.name === 'desktop-chrome' ? 5 : 1.6);
  await expect.poll(async () => {
    await page.evaluate(() => window.__GR_TEST__?.advanceSim(1 / 30));
    return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.baronVolley.rockets.active ?? 0);
  }, { timeout: 10_000, intervals: [0] }).toBeGreaterThan(0);
  await page.evaluate((seconds) => window.__GR_TEST__?.advanceSim(seconds), testInfo.project.name === 'desktop-chrome' ? 0.38 : 0.16);
  await page.screenshot({ path: path.join(OUT, `${testInfo.project.name}-rocket-flight.png`) });
  const flight = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vfx.baronVolley);
  expect(flight.rockets.modelReady).toBe(true);
  expect(flight.rockets.active).toBeGreaterThan(0);
  expect(flight.rockets.active).toBeLessThanOrEqual(flight.rockets.capacity);
  expect(flight.tracers.active).toBe(flight.rockets.active);
  expect(errors).toEqual([]);
});
