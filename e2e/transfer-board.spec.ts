import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import rotationRegistry from '../assets/rotations/rotation-seeds.json' with { type: 'json' };

const SHOTS = path.resolve('reviews/shots-transfer-board');

test('landing renders the weekly rotation and generalization cell', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const source = await readFile(path.resolve('site/index.html'), 'utf8');
  const script = await readFile(path.resolve('site/assay-office.js'), 'utf8');
  const styles = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  const ledger = source.match(/<section class="ledger"[\s\S]*?<\/section>/)?.[0];
  expect(styles).toBeTruthy();
  expect(ledger).toBeTruthy();

  await page.route('https://agenttown.app/api/standings**', async (route) => {
    const url = new URL(route.request().url());
    const payload = url.searchParams.get('board') === 'transfer'
      ? { ok: true, board: 'transfer', rotation: rotationRegistry.rotations[0], standings: [] }
      : { ok: true, board: url.searchParams.get('contract') === 'the-claim' ? [{
          assay: 'verified', profileName: 'Transfer Rider', waves: 22, gold: 394,
          heldOut: { rotationId: 'r2026w37', waves: 12 }, cost: {},
          reel: { id: 'transfer-reel', simVersion: 1 },
        }] : [] };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });
  await page.setContent(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style><div class="wrap">${ledger}</div><script>window.__ASSAY_REFRESH_MS__=3600000</script><script>${script}</script>`);

  await expect(page.locator('[data-rotation="rows"] tr')).toHaveCount(6);
  await expect(page.locator('[data-rotation="window"]')).toContainText('r2026w37 closes');
  await expect(page.locator('[data-rotation="rows"]')).toContainText(rotationRegistry.rotations[0].seeds['the-claim']);
  await expect(page.locator('[data-standings="rows"] td.generalization').first()).toHaveText('held-out w12 / public w22');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await mkdir(SHOTS, { recursive: true });
  await page.locator('.ledger').screenshot({ path: path.join(SHOTS, `${testInfo.project.name}-transfer-board.png`) });
  expect(errors).toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}
