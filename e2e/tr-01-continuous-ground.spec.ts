import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const shotDir = path.resolve('artifacts/tr-01');
const poses = [
  { id: 'mid-claim', x: 0, z: 12 },
  { id: 'river-bank', x: 12, z: 6.25 },
  { id: 'vista-edge', x: 28, z: 28 },
] as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, enabled: boolean, seed: string): Promise<void> {
  const terrainMesh = enabled ? '&terrainMesh=1' : '';
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&nosteal&seed=${seed}${terrainMesh}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
}

async function capturePoses(page: Page, testInfo: TestInfo, enabled: boolean): Promise<void> {
  fs.mkdirSync(shotDir, { recursive: true });
  const flag = enabled ? 'flag-on' : 'flag-off';
  for (const pose of poses) {
    await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), pose);
    await page.waitForTimeout(450);
    const buffer = await page.screenshot({ fullPage: true });
    const file = path.join(shotDir, `${testInfo.project.name}-${pose.id}-${flag}.png`);
    fs.writeFileSync(file, buffer);
    await testInfo.attach(`${pose.id}-${flag}`, { body: buffer, contentType: 'image/png' });
  }
}

async function sampleStress(page: Page, enabled: boolean, seed: string): Promise<{
  ground: NonNullable<ThreeGameDiagnostics['terrain']['ground']>;
  frameMsP95: number;
  rendererCalls: number;
  enemiesAlive: number;
}> {
  await openGame(page, enabled, seed);
  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 96);
    window.__GR_TEST__?.spawnPack(96, 16, { hpScale: 999, speedScale: 0.25 });
  });
  await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= 90);
  const startFrame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction((frame) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > frame + 220, startFrame);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  return {
    ground: diagnostics.terrain.ground!,
    frameMsP95: diagnostics.frameMs.p95,
    rendererCalls: diagnostics.renderer.calls,
    enemiesAlive: diagnostics.enemiesAlive,
  };
}

test('terrainMesh flag swaps in a one-draw continuous ground mesh and preserves fallback probes', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await openGame(page, false, 'tr-01-shared');
  const off = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  expect(off.terrain.ground).toMatchObject({
    enabled: false,
    mode: 'fallback',
    drawCalls: 1,
    heightSource: 'visual',
    textureSource: 'bank-atlas',
    textureSeams: 'texture seams remain until TR-02',
  });
  await capturePoses(page, testInfo, false);

  await openGame(page, true, 'tr-01-shared');
  const on = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  expect(on.terrain.ground).toMatchObject({
    enabled: true,
    mode: 'continuous-mesh',
    drawCalls: 1,
    heightSource: 'visual',
    textureSource: 'bank-atlas',
    textureSeams: 'texture seams remain until TR-02',
  });
  expect(on.terrain.ground?.vertexStep).toBeCloseTo(Balance.world.terrainMeshVertexStep, 5);
  const segments = on.terrain.ground?.segments ?? 0;
  expect(on.terrain.ground?.vertices).toBe((segments + 1) ** 2);
  expect(on.terrain.ground?.triangles).toBe(segments ** 2 * 2);
  expect(on.terrain.height.probes).toEqual(off.terrain.height.probes);
  await capturePoses(page, testInfo, true);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('terrainMesh stress perf stays inside the draw-call envelope', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const flagOff = await sampleStress(page, false, `tr-01-stress-off-${testInfo.project.name}`);
  const flagOn = await sampleStress(page, true, `tr-01-stress-on-${testInfo.project.name}`);
  const report = { project: testInfo.project.name, flagOff, flagOn };
  fs.mkdirSync(shotDir, { recursive: true });
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(path.join(shotDir, `perf-${testInfo.project.name}.json`), body);
  await testInfo.attach('tr-01-perf', { body, contentType: 'application/json' });

  expect(flagOff.ground.drawCalls).toBe(1);
  expect(flagOn.ground.drawCalls).toBe(1);
  expect(flagOff.rendererCalls).toBeLessThanOrEqual(200);
  expect(flagOn.rendererCalls).toBeLessThanOrEqual(200);
  expect(flagOff.frameMsP95).toBeGreaterThan(0);
  expect(flagOn.frameMsP95).toBeGreaterThan(0);
  expect(flagOn.enemiesAlive).toBeGreaterThanOrEqual(90);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
