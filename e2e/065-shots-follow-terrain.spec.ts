import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type ProjectileVisual = ReturnType<NonNullable<Window['__GR_TEST__']>['projectileVisuals']>[number];

const ARTIFACT_DIR = path.resolve('artifacts/065');
const HILL_QUERY = '?debug&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&nokill';
const CLAIM_QUERY = '?debug&nowaves&nolevel&nopause&nosteal&nowreck&nokill&terrainMesh=0&terrainSplat=0';
const TURRET_TERRACE = { x: 24, z: 25 };
const VALLEY_TARGET = { x: 24, z: 5.6 };
const CLAIM_TURRET = { x: 0, z: 14 };
const CLAIM_TARGET = { x: 0, z: 22 };
const BOLT_Y = 0.72;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`${query}&seed=${seed}${extra}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  return errors;
}

async function setBalance(page: Page, key: string, value: number): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function setupTurretShot(page: Page, turret: Point, target: Point): Promise<void> {
  await setBalance(page, 'enemy.hp', 999);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'sparkRig.range', 0);
  await setBalance(page, 'turret.range', 30);
  await setBalance(page, 'turret.fireRate', 4);
  await setBalance(page, 'turret.boltSpeed', 4);
  await expect(page.evaluate((point) => window.__GR_TEST__?.placeFree('turret', point.x, point.z), turret)).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.teleport(42, -42));
  await expect(page.evaluate((point) => window.__GR_TEST__?.spawnEnemyAt(point.x, point.z), target)).resolves.toBe(true);
}

async function waitForTurretBolt(page: Page): Promise<ProjectileVisual> {
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Boolean(window.__GR_TEST__?.projectileVisuals().some((sample) => sample.ownerId === 'turrets' && sample.progress > 0 && sample.progress < 1)),
        ),
      { timeout: 10_000 },
    )
    .toBe(true);
  const sample = await page.evaluate(() =>
    window.__GR_TEST__?.projectileVisuals().find((entry) => entry.ownerId === 'turrets' && entry.progress > 0 && entry.progress < 1),
  );
  expect(sample).toBeTruthy();
  return sample!;
}

async function expectedLine(page: Page, turret: Point, target: Point): Promise<{ startY: number; endY: number }> {
  return page.evaluate(
    ([from, to, boltY, originPadRadius]) => ({
      startY: window.__GR_TEST__?.terrainVisualY(from.x, from.z, boltY, originPadRadius) ?? Number.NaN,
      endY: window.__GR_TEST__?.terrainVisualY(to.x, to.z, boltY) ?? Number.NaN,
    }),
    [turret, target, BOLT_Y, Balance.turret.overlapRadius] as const,
  );
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function runtimeReport(page: Page): Promise<unknown> {
  return page.evaluate(() => ({
    frameMs: window.__THREE_GAME_DIAGNOSTICS__?.frameMs,
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
  }));
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('Hill Mine turret bolts interpolate from terrace muzzle to lower target terrain', async ({ page }, testInfo) => {
  test.setTimeout(40_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openGame(page, HILL_QUERY, `065-hill-${testInfo.project.name}`, '&timescale=4');
  await setupTurretShot(page, TURRET_TERRACE, VALLEY_TARGET);

  const sample = await waitForTurretBolt(page);
  const expected = await expectedLine(page, TURRET_TERRACE, VALLEY_TARGET);
  const lerpedY = sample.startY + (sample.endY - sample.startY) * sample.progress;

  expect(expected.startY - expected.endY).toBeGreaterThan(1);
  expect(sample.startY).toBeCloseTo(expected.startY, 2);
  expect(sample.endY).toBeCloseTo(expected.endY, 2);
  expect(sample.y).toBeCloseTo(lerpedY, 2);
  await shot(page, testInfo, 'after-hill-mine-turret-shot');
  await writeFile(
    path.join(ARTIFACT_DIR, `${testInfo.project.name}-hill-report.json`),
    `${JSON.stringify({ expected, sample, runtime: await runtimeReport(page) }, null, 2)}\n`,
  );
  assertNoErrors(errors);
});

test('flat Claim shots keep the old zero-height bolt plane', async ({ page }, testInfo) => {
  test.setTimeout(40_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openGame(page, CLAIM_QUERY, `065-flat-${testInfo.project.name}`, '&timescale=4');
  await setBalance(page, 'world.terrainRelief', 0);
  await setBalance(page, 'world.terrainFeatureRelief', 0);
  await setupTurretShot(page, CLAIM_TURRET, CLAIM_TARGET);

  const sample = await waitForTurretBolt(page);
  const expected = await expectedLine(page, CLAIM_TURRET, CLAIM_TARGET);

  expect(expected.startY).toBeCloseTo(BOLT_Y, 3);
  expect(expected.endY).toBeCloseTo(BOLT_Y, 3);
  expect(sample.startY).toBeCloseTo(BOLT_Y, 3);
  expect(sample.endY).toBeCloseTo(BOLT_Y, 3);
  expect(sample.y).toBeCloseTo(BOLT_Y, 3);
  await shot(page, testInfo, 'flat-claim-turret-shot');
  await writeFile(
    path.join(ARTIFACT_DIR, `${testInfo.project.name}-flat-report.json`),
    `${JSON.stringify({ expected, sample, runtime: await runtimeReport(page) }, null, 2)}\n`,
  );
  assertNoErrors(errors);
});
