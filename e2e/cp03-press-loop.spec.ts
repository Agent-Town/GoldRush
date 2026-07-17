import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { contractDescriptorJson, listContracts } from '../src/meta/ContractFamilies';

// CP-03 THE LOOP: import a shipped contract as a charter, edit it with the
// existing editor tools, stamp it to the profile-scoped shelf, launch it as a
// real run through the ordinary contract-launch path, and return to the Press.
// Plus the inertness law: a plain boot never sees the Press, and a staged
// charter entry without a Press launch never reaches a run.
const SHOT_DIR = path.resolve('reviews/shots-press-cp01-03');
const CHARTER_NAME = 'Twin Banks, Re-pressed';

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('the Press loop: edit, stamp, shelve, launch a real run, and return', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  await mkdir(SHOT_DIR, { recursive: true });
  const errors = collectErrors(page);

  await page.goto('/?editor&debug&contract=e1-twin-banks&nowaves&nolevel&nokill&nopause&seed=cp03-loop');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const panel = page.getByTestId('charter-press-panel');
  await expect(panel).toBeVisible();
  await expect(page.getByTestId('press-lineage')).toHaveText('Pressing from Twin Banks · e1-twin-banks');

  // One zone tweak through the EXISTING placement editor; the commit stages
  // the descriptor and relaunches the editor page on the staged document.
  const maxX = page.getByTestId('placement-zone-0-maxX');
  await expect(maxX).toHaveValue('28');
  await maxX.fill('27');
  await maxX.press('Enter');
  await page.waitForURL(/editorDescriptor=session/);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('placement-zone-0-maxX')).toHaveValue('27');
  await expect(page.getByTestId('contract-validator')).toHaveAttribute('data-verdict', 'accepted');

  // Name the charter and stamp it to the shelf.
  await page.getByTestId('press-charter-name').fill(CHARTER_NAME);
  await page.getByTestId('press-stamp').click();
  await expect(page.getByTestId('press-status')).toContainText('Stamped to the shelf');
  await expect(page.getByTestId('press-shelf-row')).toContainText(CHARTER_NAME);
  await page.getByTestId('charter-press-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SHOT_DIR, `press-panel-${testInfo.project.name}.png`) });

  // The shelf lives under the gr.profile.v2 scope, never at a bare key.
  const shelfKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes('gr.charterShelf.v1')));
  expect(shelfKeys).toHaveLength(1);
  expect(shelfKeys[0]).toMatch(/^gr\.profile\.v2\.[^.]+\.gr\.charterShelf\.v1$/);

  // Launch as a real run: no ?editor, no ?debug — the ordinary player
  // contract-launch path with the charter document riding the launch seam.
  await page.getByTestId('press-launch-0').click();
  await page.waitForURL((url) => url.searchParams.get('contract') === 'e1-twin-banks' && !url.searchParams.has('editor'));
  await expect(page.getByTestId('contract-briefing-name')).toHaveText(CHARTER_NAME, { timeout: 30_000 });
  await page.screenshot({ path: path.join(SHOT_DIR, `charter-run-briefing-${testInfo.project.name}.png`) });
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForTimeout(1_000);
  await page.screenshot({ path: path.join(SHOT_DIR, `charter-run-${testInfo.project.name}.png`) });

  // Re-enter the same staged run with the debug harness to end it quickly;
  // the launch seam and player-launch key survive the reload.
  await page.goto('/?debug&contract=e1-twin-banks&nowaves&nolevel&nokill&nopause&seed=cp03-return');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const active = await page.evaluate(() => ({
    id: window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId,
    maxX: (window.__THREE_GAME_DIAGNOSTICS__!.contract.tileParams as { buildZones?: Array<{ maxX: number }> }).buildZones?.[0]?.maxX,
  }));
  expect(active).toEqual({ id: 'e1-twin-banks', maxX: 27 });

  // End the run for real and ride the Return to Town action back to the Press.
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const returnButton = page.getByTestId('stake-again');
  await expect(returnButton).toBeVisible();
  await expect(returnButton).toHaveText(/Return to Town/);
  await returnButton.click();
  await page.waitForURL(/press=return-overrun/);
  // The return page carries ?editor without ?debug, so no __GR_TEST__ here;
  // the Press panel itself is the readiness signal.
  await expect(page.getByTestId('charter-press-panel')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('press-return-banner')).toContainText('overrun');
  await expect(page.getByTestId('press-shelf-row')).toContainText(CHARTER_NAME);
  expect(await page.evaluate(() => sessionStorage.getItem('gr.charter.launch.v1'))).toBeNull();
  await page.getByTestId('charter-press-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SHOT_DIR, `press-return-${testInfo.project.name}.png`) });

  expect(errors).toEqual({ console: [], page: [] });
});

test('a plain boot never sees the Press and writes nothing', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu-wordmark')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('charter-press-panel')).toHaveCount(0);
  await expect(page.getByTestId('descriptor-inspector')).toHaveCount(0);
  const storage = await page.evaluate(() => ({
    shelfKeys: Object.keys(localStorage).filter((key) => key.includes('charterShelf')),
    charterLaunch: sessionStorage.getItem('gr.charter.launch.v1'),
  }));
  expect(storage).toEqual({ shelfKeys: [], charterLaunch: null });
  expect(errors).toEqual({ console: [], page: [] });
});

test('a staged charter entry without a Press launch never reaches a run', async ({ page }) => {
  const shipped = listContracts('epoch-1-frontier').find((contract) => contract.id === 'the-claim')!;
  const tampered = structuredClone(shipped);
  tampered.tileParams.lanes.territoryRingBiasWaves = 9;
  const errors = collectErrors(page);
  await page.addInitScript(
    (document) => sessionStorage.setItem('gr.charter.launch.v1', JSON.stringify({ templateId: 'the-claim', document })),
    contractDescriptorJson(tampered),
  );
  await page.goto('/?debug&contract=the-claim&nowaves&nolevel&nokill&nopause&seed=cp03-inert');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const tileParams = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.tileParams);
  expect(tileParams).toEqual(JSON.parse(contractDescriptorJson(shipped)).tileParams);
  expect(errors).toEqual({ console: [], page: [] });
});
