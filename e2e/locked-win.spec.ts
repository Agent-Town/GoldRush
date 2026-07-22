import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { SCOREBOARD_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { TELEMETRY_DEV_SEND_STORAGE_KEY, type RunTelemetryPayload } from '../src/telemetry/payload';

type Errors = { console: string[]; page: string[] };
type ScoreRow = { waves: number; secured?: boolean; secureWave?: number; deepestWave?: number };

const SCORE_KEY = profileDataKey('robin', SCOREBOARD_KEY);
const SHOT_DIR = path.resolve('artifacts/locked-win');

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function openClaim(page: Page, seed: string, telemetry = false, dismissBriefing = true): Promise<Errors> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ telemetryKey, telemetry }) => {
      if (sessionStorage.getItem('gr.lockedWin.initialized') !== '1') {
        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('gr.lockedWin.initialized', '1');
        if (telemetry) localStorage.setItem(telemetryKey, '1');
      }
    },
    { telemetryKey: TELEMETRY_DEV_SEND_STORAGE_KEY, telemetry },
  );
  await page.goto(`/?debug&contract=the-claim&terrain2d&nowaves&nolevel&nosteal&nowreck&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  if (dismissBriefing) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

async function secureAtTen(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(10));
  await expect(page.getByTestId('claim-secured')).toBeVisible();
  await expect(page.getByTestId('claim-secured')).toContainText('The win is banked');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured)).toBe(true);
  const scores = await readScores(page);
  expect(scores).toHaveLength(1);
  expect(scores[0]).toMatchObject({ waves: 10, secured: true, secureWave: 10, deepestWave: 10 });
}

async function readScores(page: Page): Promise<ScoreRow[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]') as ScoreRow[], SCORE_KEY);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

function expectClean(errors: Errors): void {
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
}

test('wave 10 banks the win; a wave 12 Rush death keeps it and records both wave marks', async ({ page }, testInfo) => {
  const posts: RunTelemetryPayload[] = [];
  await page.route('**/api/telemetry', async (route) => {
    posts.push(JSON.parse(route.request().postData() ?? '{}') as RunTelemetryPayload);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  const errors = await openClaim(page, `locked-win-rush-${testInfo.project.name}`, true);
  await secureAtTen(page);
  await expect.poll(() => posts.length).toBe(1);
  expect(posts[0]).toMatchObject({ stage: 'secure', waves: 10, secureWave: 10, deepestWave: 10 });

  await page.getByTestId('stay-for-rush').click();
  await expect(page.getByTestId('claim-secured-chip')).toBeVisible();
  await expect(page.getByTestId('claim-secured-chip')).toContainText('CLAIM SECURED ✓');
  await expect(page.getByTestId('claim-secured-chip')).toContainText('The win is banked');
  await page.getByTestId('hud-pause').click();
  await expect(page.getByTestId('claim-secured-chip')).toBeVisible();
  await page.getByTestId('hud-pause').click();
  await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(11));
  await shot(page, testInfo, 'secured-chip-mid-rush');

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  await expect(page.getByTestId('claim-secured-chip')).toBeVisible();
  expect(await readScores(page)).toHaveLength(1);
  await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(12));

  await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('run-outcome-copy')).toContainText('The claim held. The Rush took the rest');
  await expect(page.getByTestId('best-claim-row').first()).toContainText('SECURED');
  await expect(page.getByTestId('best-claim-row').first()).toContainText('secured wave 10 · deepest wave 12');
  await expect(page.getByTestId('claim-secured-chip')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('rush');
  await expect.poll(() => posts.length).toBe(2);
  expect(posts[1]).toMatchObject({ stage: 'end', waves: 12, secureWave: 10, deepestWave: 12 });
  expect(await readScores(page)).toEqual([
    expect.objectContaining({ waves: 12, secured: true, secureWave: 10, deepestWave: 12 }),
  ]);
  await shot(page, testInfo, 'summary-after-rush-death');
  expectClean(errors);
});

test('leaving at secure follows the full victory ledger flow', async ({ page }, testInfo) => {
  const errors = await openClaim(page, `locked-win-leave-${testInfo.project.name}`);
  await secureAtTen(page);
  await page.getByTestId('bank-secured-claim').click();

  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('run-outcome-copy')).toContainText('The assay is sealed');
  await expect(page.getByTestId('best-claim-row').first()).toContainText('secured wave 10 · deepest wave 10');
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await expect(page.getByTestId('run-secondary-action')).toHaveText('New Claim');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('secured');
  expectClean(errors);
});

test('The Claim card names wave 10 while Night Shift and Baron keep their tuned secure waves', async ({ page, context }) => {
  const errors = await openClaim(page, 'locked-win-contracts', false, false);
  const claim = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  expect(claim?.secureWave).toBe(10);
  expect(claim?.briefing.goals).toEqual(['Hold the claim through wave 10.']);
  expect(claim?.briefing.rules).toContain(
    'Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.',
  );
  await expect(page.getByTestId('contract-briefing-goals')).toContainText('Hold the claim through wave 10.');
  await expect(page.getByTestId('contract-briefing-rules')).toContainText('wave 10 seals the claim');

  const nightPage = await context.newPage();
  const nightErrors = collectErrors(nightPage);
  await nightPage.goto('/?debug&contract=e1-night-shift&terrain2d&nowaves&nolevel&seed=locked-win-night');
  await nightPage.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  expect(await nightPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave)).toBe(25);

  const baronPage = await context.newPage();
  const baronErrors = collectErrors(baronPage);
  await baronPage.goto('/?debug&contract=e1-baron&terrain2d&nowaves&nolevel&seed=locked-win-baron');
  await baronPage.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  expect(await baronPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave)).toBe(20);
  expectClean(errors);
  expectClean(nightErrors);
  expectClean(baronErrors);
});
