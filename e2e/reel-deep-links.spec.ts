import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import { GAME_API_ORIGIN } from '../src/app/GameApi';

const FIXTURE_PATH = path.resolve('artifacts/eh3-fixture/tape.json');
const SHOT_DIR = path.resolve('reviews/shots-reel-links');

test('plain watch URL opens the true current-era show without a profile or debug', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const tape = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
  tape.meta = { ...tape.meta, engineHash: engineEra.engineHash, era: engineEra.era };
  const errors = collectErrors(page);
  await page.addInitScript(() => localStorage.clear());
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, async (route) => {
    const url = new URL(route.request().url());
    expect(Object.fromEntries(url.searchParams)).toEqual({ reel: tape.id, contract: tape.contract, epoch: 'epoch-1-frontier' });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, reel: tape }) });
  });

  await page.goto(`/?watch=${encodeURIComponent(tape.id)}&contract=${encodeURIComponent(tape.contract)}&epoch=epoch-1-frontier`);
  const show = page.getByTestId('lantern-show');
  await expect(show).toHaveAttribute('data-era-refused', 'false', { timeout: 20_000 });
  await expect(show).toHaveAttribute('data-playback', 'playing');
  await expect(page.getByTestId('lantern-agent-honesty')).toHaveText('This is the ride. The county is replaying it here in your browser.');
  await expect(page.getByTestId('lantern-true-world').locator('[data-replay-terrain="the-claim"]')).toBeVisible();
  await expect(page.getByTestId('lantern-true-world').locator('[data-terrain-feature="water"]')).toHaveCount(1);
  await expect(page.getByTestId('lantern-truth-placeholders')).not.toContainText('terrain layout');
  await expect(page.getByTestId('profile-manager')).toHaveCount(0);
  const expectedUrl = new URL(page.url());
  expect(Object.fromEntries(expectedUrl.searchParams)).toEqual({ watch: tape.id, contract: tape.contract, epoch: 'epoch-1-frontier' });
  expect(expectedUrl.searchParams.has('debug')).toBe(false);
  await expect(page.getByTestId('lantern-share-url')).toHaveValue(expectedUrl.href);
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-deep-linked-show.png`), fullPage: true });
  expect(errors).toEqual([]);
});

test('an unknown watch URL shows an honest refusal and returns to the start menu', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => localStorage.clear());
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'reel_not_found' }) }));
  await page.goto('/?watch=missing-reel&contract=the-claim&epoch=epoch-1-frontier');
  await expect(page.getByTestId('lantern-intertitle')).toContainText('THE REEL STAYS DARK');
  await expect(page.getByTestId('lantern-intertitle')).toContainText('The county clerk cannot find that reel.');
  await page.getByTestId('lantern-refusal-close').click();
  await expect(page.getByTestId('start-menu')).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
  expect(errors).toEqual([]);
});

test('landing watch links name their reel, contract, and epoch', async ({ page }) => {
  const errors = collectErrors(page);
  const script = await readFile(path.resolve('site/assay-office.js'), 'utf8');
  await page.route('**/api/standings*', async (route) => {
    const contract = new URL(route.request().url()).searchParams.get('contract')!;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        board: contract === 'the-claim'
          ? [{ assay: 'verified', profileName: 'The Rig', model: 'test-model', harness: 'test-rig', harnessDigest: 'deadbeef'.repeat(8), score: { waves: 20, gold: 680 }, reel: { id: 'reel-claim', simVersion: 1 } }]
          : contract === 'e1-dry-gulch'
            ? [{ assay: 'verified', profileName: 'Legacy Rig', model: 'test-model', harness: 'test-rig', score: { waves: 18, gold: 400 } }]
            : [],
      }),
    });
  });
  await page.setContent(`<table><tbody data-standings="rows"></tbody></table><script>${script}</script>`);

  const links = page.locator('[data-standings="rows"] a.watch');
  await expect(links).toHaveCount(6);
  await expect(links.first()).toHaveAttribute('href', 'https://agenttown.app/goldrush/?watch=reel-claim&contract=the-claim&epoch=epoch-1-frontier');
  await expect(links.nth(1)).toHaveAttribute('href', 'https://agenttown.app/goldrush/');
  await expect(page.locator('[data-standings="rows"] tr').first()).toContainText('harness deadbeef');
  await expect(page.locator('[data-standings="rows"] tr').nth(1)).not.toContainText('harness ');
  expect(errors).toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}
