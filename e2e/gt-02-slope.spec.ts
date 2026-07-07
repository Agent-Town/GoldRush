import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/gt-02');
const DEV_QUERY = '?debug&tile=gt-test-basin&nowaves&nolevel&nokill&nopause&nosteal&nowreck&seed=gt-02';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function waitForGame(page: Page): Promise<void> {
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
}

async function openDevTile(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(DEV_QUERY);
  await waitForGame(page);
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('gt-test-basin');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.flat)).resolves.toBe(false);
  return errors;
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((point) => window.__GR_TEST__?.teleport(point.x, point.z), { x, z });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? Number.NaN)).toBeCloseTo(x, 2);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? Number.NaN)).toBeCloseTo(z, 2);
}

async function waitForX(page: Page, targetX: number, increasing: boolean): Promise<void> {
  if (increasing) {
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(targetX);
  } else {
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0), { timeout: 10_000 }).toBeLessThanOrEqual(targetX);
  }
}

async function walkXSegment(
  page: Page,
  warmStartX: number,
  z: number,
  measureStartX: number,
  targetX: number,
  key: 'KeyA' | 'KeyD',
): Promise<{ seconds: number; speed: number }> {
  const increasing = targetX > warmStartX;
  await teleport(page, warmStartX, z);
  await page.waitForTimeout(80);
  await page.keyboard.down(key);
  try {
    await waitForX(page, measureStartX, increasing);
    const start = await page.evaluate(() => ({
      at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      x: window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0,
    }));
    await waitForX(page, targetX, increasing);
    const end = await page.evaluate(() => ({
      at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      x: window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0,
    }));
    const seconds = end.at - start.at;
    return { seconds, speed: Math.abs(end.x - start.x) / seconds };
  } finally {
    await page.keyboard.up(key);
  }
}

async function setTerrainSim(page: Page, uphillMin: number, downhillMax: number): Promise<void> {
  await expect(page.evaluate((value) => window.__GR_TEST__?.setBalance('terrainSim.uphillMin', value), uphillMin)).resolves.toBe(true);
  await expect(page.evaluate((value) => window.__GR_TEST__?.setBalance('terrainSim.downhillMax', value), downhillMax)).resolves.toBe(true);
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

test('tile param is debug-gated and first-claim fingerprint remains flat', async ({ browser, page }, testInfo) => {
  test.setTimeout(40_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);

  await page.goto('/?tile=gt-test-basin&nowaves&seed=gt-02-gated');
  await waitForGame(page);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim)).toMatchObject({
    flat: true,
    tile: 'frontier-river-claim',
  });

  async function fingerprint(): Promise<string> {
    const next = await browser.newPage();
    await next.goto('/?debug&nowaves&nolevel&nokill&nopause&seed=gt-02-first-claim');
    await waitForGame(next);
    const payload = await next.evaluate(() => ({
      activeTile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
      sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
      samples: [
        window.__GR_TEST__?.terrainSample(0, 12),
        window.__GR_TEST__?.terrainSample(0, 0),
        window.__GR_TEST__?.terrainSample(12, -18),
      ],
      visual: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.probes,
    }));
    await next.close();
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  const hashA = await fingerprint();
  const hashB = await fingerprint();
  await writeFile(path.join(ARTIFACT_DIR, `first-claim-fingerprint-${testInfo.project.name}.json`), `${JSON.stringify({ hashA, hashB }, null, 2)}\n`);
  expect(hashB).toBe(hashA);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('slope movement, cliff blocking, and visual height use the sim field', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = await openDevTile(page);

  await setTerrainSim(page, 1, 1);
  const flat = await walkXSegment(page, -20, 18, -14, -5, 'KeyD');
  await setTerrainSim(page, 0.6, 1.1);
  const uphill = await walkXSegment(page, -20, 18, -14, -5, 'KeyD');
  const downhill = await walkXSegment(page, 2, 18, -5, -14, 'KeyA');
  const ratios = {
    uphillVsFlatTime: Number((uphill.seconds / flat.seconds).toFixed(3)),
    downhillVsFlatSpeed: Number((downhill.speed / flat.speed).toFixed(3)),
    flat,
    uphill,
    downhill,
  };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `movement-ratios-${testInfo.project.name}.json`), `${JSON.stringify(ratios, null, 2)}\n`);
  expect(ratios.uphillVsFlatTime).toBeGreaterThan(1.08);
  expect(ratios.downhillVsFlatSpeed).toBeGreaterThanOrEqual(0.98);

  await teleport(page, 0, -18.2);
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(900);
  await page.keyboard.up('KeyS');
  const heroZ = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0);
  expect(heroZ).toBeLessThan(-16.05);

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(1, -18.2, 1, -8, 4);
  });
  await page.waitForTimeout(1500);
  const enemy = await page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]);
  expect(enemy?.z ?? 0).toBeLessThan(-16.05);
  expect(await page.evaluate(() => window.__GR_TEST__?.terrainSim(0, -14.5).traversable)).toBe(false);

  for (const point of [
    { x: -12, z: 18 },
    { x: 2, z: 18 },
    { x: 16, z: -20 },
  ]) {
    await teleport(page, point.x, point.z);
    const sample = await page.evaluate(() => ({
      heroY: window.__THREE_GAME_DIAGNOSTICS__?.heroPos.y ?? 0,
      renderHeight: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.heroGround ?? 0,
      simHeight: window.__GR_TEST__?.terrainSim(window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0, window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0).height ?? 0,
    }));
    expect(sample.renderHeight).toBeCloseTo(sample.simHeight, 4);
    expect(sample.heroY - 0.06).toBeCloseTo(sample.simHeight, 4);
  }

  await teleport(page, -8, 18);
  await screenshot(page, testInfo, 'basin-wide');
  await teleport(page, 0, -18);
  await screenshot(page, testInfo, 'cliff-close');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
