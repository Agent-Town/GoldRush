import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type Detonation = { x: number; y: number; z: number };

const ARTIFACT_DIR = path.resolve('artifacts/blast-relief');
const IMPACT_Y = 0.08;
const RAISED_BANK = { x: 23, z: -20 };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&timescale=1&nowaves&nolevel&nopause&nosteal&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  return errors;
}

async function setBalance(page: Page, key: string, value: number): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function prepBlast(page: Page, point: Point): Promise<void> {
  await setBalance(page, 'enemy.hp', 10);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'blast.airTime', 1.2);
  await setBalance(page, 'blast.cooldown', 0.25);
  await page.evaluate((target) => window.__GR_TEST__?.teleport(target.x - 2, target.z + 3), point);
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await page.evaluate((target) => window.__GR_TEST__?.setBlastAim(target.x, target.z), point);
}

async function fireBlastAt(page: Page, point: Point, testInfo: TestInfo, label: string): Promise<Detonation> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const before = await page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0);
  await page.evaluate((target) => window.__GR_TEST__?.spawnEnemyAt(target.x, target.z), point);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.blastsAlive ?? 0), { timeout: 12_000 }).toBe(1);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${label}-airborne.png`), fullPage: false });
  await expect
    .poll(() => page.evaluate((start) => (window.__GR_TEST__?.state().arsenal.detonations ?? 0) - start, before), { timeout: 12_000 })
    .toBe(1);
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${label}-detonation.png`), fullPage: false });
  const detonation = await page.evaluate(() => window.__GR_TEST__?.state().arsenal.lastDetonation ?? null);
  expect(detonation).not.toBeNull();
  return detonation!;
}

async function visualY(page: Page, point: Point, base = 0): Promise<number> {
  return page.evaluate(([target, y]) => window.__GR_TEST__?.terrainVisualY(target.x, target.z, y) ?? Number.NaN, [point, base] as const);
}

function xzDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

test('blast arc and detonation sit on raised visual terrain without moving planar impact XZ', async ({ page }, testInfo) => {
  const errors = await openGame(page, `blast-relief-bank-${testInfo.project.name}`);
  await prepBlast(page, RAISED_BANK);

  const expectedImpactY = await visualY(page, RAISED_BANK, IMPACT_Y);
  const groundY = await visualY(page, RAISED_BANK, 0);
  expect(groundY).toBeGreaterThan(0.5);

  const hero = await page.evaluate(() => {
    const heroPos = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, y: 0, z: 0 };
    return {
      pos: heroPos,
      groundY: window.__GR_TEST__?.terrainVisualY(heroPos.x, heroPos.z, 0) ?? 0,
      muzzleY: window.__GR_TEST__?.terrainVisualY(heroPos.x, heroPos.z, 0.78) ?? 0,
    };
  });
  expect(hero.pos.y).toBeCloseTo(hero.groundY + 0.06, 2);
  expect(hero.muzzleY - hero.pos.y).toBeCloseTo(0.72, 2);

  const detonation = await fireBlastAt(page, RAISED_BANK, testInfo, 'raised-bank');
  expect(xzDistance(detonation, RAISED_BANK)).toBeLessThan(0.2);
  expect(detonation.y).toBeCloseTo(expectedImpactY, 2);

  await writeFile(
    path.join(ARTIFACT_DIR, `${testInfo.project.name}-raised-bank-evidence.json`),
    `${JSON.stringify({ point: RAISED_BANK, groundY, expectedImpactY, detonation, hero }, null, 2)}\n`,
  );
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('zero-height samples preserve flat impact offset and sim payload determinism', async ({ browser, page }, testInfo) => {
  const errors = await openGame(page, `blast-relief-zero-${testInfo.project.name}`);
  const zeroPoint = await page.evaluate(() => {
    let lo = 0;
    let hi = 12;
    for (let i = 0; i < 30; i += 1) {
      const mid = (lo + hi) * 0.5;
      const y = window.__GR_TEST__?.terrainVisualY(0, mid, 0) ?? 0;
      if (y > 0) hi = mid;
      else lo = mid;
    }
    return { x: 0, z: (lo + hi) * 0.5 };
  });
  const groundY = await visualY(page, zeroPoint, 0);
  expect(Math.abs(groundY)).toBeLessThan(0.001);

  await prepBlast(page, zeroPoint);
  const detonation = await fireBlastAt(page, zeroPoint, testInfo, 'zero-height');
  expect(detonation.y).toBeCloseTo(IMPACT_Y, 3);

  if (testInfo.project.name === 'desktop-chrome') {
    const first = await blastSimHash(browser, 'blast-relief-determinism');
    const second = await blastSimHash(browser, 'blast-relief-determinism');
    await writeFile(
      path.join(ARTIFACT_DIR, 'determinism-report.json'),
      `${JSON.stringify({ hashA: first.hash, hashB: second.hash, payload: first.payload }, null, 2)}\n`,
    );
    expect(second.hash).toBe(first.hash);
    expect(first.errors.consoleErrors).toEqual([]);
    expect(first.errors.pageErrors).toEqual([]);
    expect(second.errors.consoleErrors).toEqual([]);
    expect(second.errors.pageErrors).toEqual([]);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function blastSimHash(browser: Browser, seed: string): Promise<{ hash: string; payload: unknown; errors: ErrorBucket }> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = await openGame(page, seed);
  await prepBlast(page, RAISED_BANK);
  await page.evaluate((target) => window.__GR_TEST__?.spawnEnemyAt(target.x, target.z), RAISED_BANK);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 12_000 }).toBe(1);
  const payload = await page.evaluate(() => {
    const arsenal = window.__GR_TEST__?.state().arsenal;
    return {
      enemiesAlive: window.__GR_TEST__?.state().enemiesAlive,
      killsByOwner: window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner,
      detonation: arsenal?.lastDetonation ? { x: arsenal.lastDetonation.x, z: arsenal.lastDetonation.z } : null,
      detonations: arsenal?.detonations,
      terrainSim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
    };
  });
  await page.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, errors };
}
