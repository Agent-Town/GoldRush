import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/055');
const BASE_QUERY = '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck';
const DEFEAT_TITLE = 'THE BARON IS DEFEATED';
const DEFEAT_LINE = 'Dragged off by his own men, swearing revenge.';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !isDevServerTransportError(message.text())) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function isDevServerTransportError(text: string): boolean {
  return text.includes("WebSocket connection to 'ws://127.0.0.1:5188/") || text === 'Failed to load resource: net::ERR_CONNECTION_REFUSED';
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function setBalances(page: Page, values: Record<string, number | boolean>): Promise<void> {
  for (const [key, value] of Object.entries(values)) await setBalance(page, key, value);
}

async function setWave(page: Page, wave: number): Promise<void> {
  await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(wave);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function unlockAudio(page: Page): Promise<void> {
  await page.mouse.click(24, 24);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false), { timeout: 8_000 }).toBe(true);
}

async function prepareManualBaronKill(page: Page, seed: string, extraQuery = '', unlock = false): Promise<ErrorBucket> {
  const errors = await openGame(page, `${BASE_QUERY}${extraQuery}&seed=${seed}`);
  if (unlock) await unlockAudio(page);
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? -1)).toBe(0);
  await setBalances(page, {
    'enemy.hp': 1,
    'sparkRig.damage': 9999,
    'sparkRig.fireRate': 60,
    'sparkRig.range': 300,
    'sparkRig.boltRadius': 5,
    'sparkRig.boltSpeed': 18,
    'sparkRig.boltLife': 3,
  });
  await setWave(page, 20);
  await page.evaluate(() =>
    window.__GR_TEST__?.spawnPack(1, 5, {
      eliteKind: 'baron',
      hpScale: 1,
      speedScale: 0,
      visualScale: 4,
      banner: true,
    }),
  );

  for (let i = 0; i < 40; i += 1) {
    await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.1, 1 / 60));
    const done = await page.evaluate(() => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      return Boolean(diagnostics?.baronCeremony.active || diagnostics?.run.secured || diagnostics?.runState === 'dead');
    });
    if (done) return errors;
  }
  throw new Error('Baron did not resolve');
}

async function simFingerprint(page: Page): Promise<{ hash: string; payload: unknown }> {
  const payload = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const round = (value: number | undefined) => Math.round((value ?? 0) * 1000) / 1000;
    return {
      wave: diagnostics?.wave ?? 0,
      kills: diagnostics?.kills ?? 0,
      hp: round(diagnostics?.hp),
      enemiesAlive: diagnostics?.enemiesAlive ?? 0,
      hero: {
        x: round(diagnostics?.heroPos.x),
        z: round(diagnostics?.heroPos.z),
      },
      standard: {
        visible: diagnostics?.baronStandard.visible ?? false,
        x: round(diagnostics?.baronStandard.x),
        z: round(diagnostics?.baronStandard.z),
      },
    };
  });
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload };
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('Baron kill-stop freezes sim, advances render, plants the standard, then the note persists', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await prepareManualBaronKill(page, '055-kill-stop', '', true);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? false), { timeout: 8_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementTitle)).toBe(DEFEAT_TITLE);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronStandard.visible ?? false)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['victory-sting'] ?? 0), { timeout: 8_000 }).toBeGreaterThan(0);

  const before = await page.evaluate(() => ({
    timeAlive: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    frame: window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0,
  }));
  await shot(page, testInfo, 'mid-freeze-card');
  await page.waitForTimeout(550);
  const during = await page.evaluate(() => ({
    timeAlive: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    frame: window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0,
    dropElapsed: window.__THREE_GAME_DIAGNOSTICS__?.baronStandard.dropElapsed ?? 0,
  }));
  expect(during.timeAlive).toBe(before.timeAlive);
  expect(during.frame).toBeGreaterThan(before.frame);
  expect(during.dropElapsed).toBeGreaterThan(0);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? true), { timeout: 5_000 }).toBe(false);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 5_000 });
  await page.getByTestId('stay-for-rush').click();
  const standard = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronStandard);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport((pos?.x ?? 0) + 0.6, pos?.z ?? 0), standard);
  await expect(page.getByTestId('world-info-note-title')).toHaveText("The Baron's Standard", { timeout: 5_000 });
  await expect(page.getByTestId('world-info-note-body')).toContainText("The Baron's standard. He'll want it back.");
  await shot(page, testInfo, 'planted-standard-note');
  assertNoErrors(errors);
});

test('click or key skips only the hold and leaves the defeat card active', async ({ page }) => {
  const errors = await prepareManualBaronKill(page, '055-skip');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? false), { timeout: 8_000 }).toBe(true);

  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? true), { timeout: 1_000 }).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false), { timeout: 2_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementTitle)).toBe(DEFEAT_TITLE);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement)).toBe(DEFEAT_LINE);
  assertNoErrors(errors);
});

test('kill-stop leaves the sim hash identical to a nopause control', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one deterministic hash proof is enough');
  const errors = await prepareManualBaronKill(page, '055-hash');
  const frozen = await simFingerprint(page);
  const frozenTime = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForTimeout(350);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0)).resolves.toBe(frozenTime);

  const context = await browser.newContext({ viewport: page.viewportSize() ?? undefined });
  const control = await context.newPage();
  const controlErrors = await prepareManualBaronKill(control, '055-hash', '&nopause');
  const controlFingerprint = await simFingerprint(control);
  await context.close();

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, 'hash-report.json'),
    `${JSON.stringify({ frozen, control: controlFingerprint }, null, 2)}\n`,
  );
  expect(frozen.payload).toEqual(controlFingerprint.payload);
  expect(frozen.hash).toBe(controlFingerprint.hash);
  assertNoErrors(errors);
  assertNoErrors(controlErrors);
});

test('same-tick overrun and Baron kill does not start the celebration', async ({ page }) => {
  const errors = await openGame(page, `${BASE_QUERY}&seed=055-trade`);
  await setBalances(page, {
    'enemy.contactDamage': 999,
    'enemy.hp': 1,
    'sparkRig.damage': 9999,
    'sparkRig.fireRate': 60,
    'sparkRig.range': 300,
    'sparkRig.boltRadius': 5,
    'sparkRig.boltSpeed': 12,
    'sparkRig.boltLife': 3,
  });
  await setWave(page, 20);
  await page.evaluate(() =>
    window.__GR_TEST__?.spawnPack(1, 0.1, {
      eliteKind: 'baron',
      hpScale: 1,
      speedScale: 0,
      visualScale: 4,
      banner: true,
    }),
  );

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 10_000 }).toBe('dead');
  await page.waitForTimeout(300);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? false)).resolves.toBe(false);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronStandard.visible ?? false)).resolves.toBe(false);
  await expect(page.getByTestId('claim-secured')).toHaveCount(0);
  await expect(page.getByTestId('death-overlay')).not.toContainText(DEFEAT_TITLE);
  assertNoErrors(errors);
});
