import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SHOTS = path.resolve('reviews/shots-cost-column');
const CLAIM_ROWS = [
  { assay: 'verified', profileName: 'Opus Rider', model: 'claude-opus', harness: 'county-rig', waves: 22, gold: 394,
    cost: { orders: 530, calls: 114, tokensIn: 123_456, tokensOut: 7_890, durationS: 597 }, reel: { id: 'claim-1', simVersion: 1 } },
  { assay: 'verified', profileName: 'Flash Rider', waves: 14, gold: 310,
    cost: { orders: 280, calls: null, tokensIn: null, tokensOut: null, durationS: 420 }, reel: { id: 'claim-2', simVersion: 1 } },
];

test('landing shows cost cells and a responsive theme-aware Claim chart', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const source = await readFile(path.resolve('site/index.html'), 'utf8');
  const script = await readFile(path.resolve('site/assay-office.js'), 'utf8');
  const styles = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  const ledger = source.match(/<section class="ledger"[\s\S]*?<\/section>/)?.[0];
  expect(styles).toBeTruthy();
  expect(ledger).toBeTruthy();
  const shell = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style><div class="wrap">${ledger}</div>`;

  await page.emulateMedia({ colorScheme: 'light' });
  await page.setContent(shell);
  const baselineP95 = await frameP95(page);
  await page.route('https://agenttown.app/api/standings**', async (route) => {
    const contract = new URL(route.request().url()).searchParams.get('contract');
    const rows = contract === 'the-claim' ? CLAIM_ROWS : contract === 'e1-baron' ? [] : [{
      assay: 'verified', profileName: `${contract} rider`, waves: 10, gold: 200,
      cost: { orders: 120, calls: 12, tokensIn: null, tokensOut: null, durationS: 300 },
      reel: { id: `${contract}-reel`, simVersion: 1 },
    }];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, board: rows }) });
  });
  await page.setContent(`${shell}<script>window.__ASSAY_REFRESH_MS__=3600000</script><script>${script}</script>`);

  const costs = page.locator('[data-standings="rows"] td.cost');
  await expect(costs).toHaveCount(6);
  await expect(costs.first()).toHaveText('530 orders · 114 calls · 9:57');
  await expect(costs.first()).toHaveAttribute('title', 'Tokens: 123,456 in · 7,890 out');
  const chart = page.locator('[data-standings="cost-chart"]');
  await expect(chart).toHaveAttribute('aria-label', 'The Claim cost versus waves: 530 orders, 22 waves; 280 orders, 14 waves.');
  const box = await chart.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(testInfo.project.use.viewport!.width);
  const lightPixels = await chart.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => chart.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).not.toBe(lightPixels);

  const renderedP95 = await frameP95(page);
  expect(renderedP95).toBeLessThanOrEqual(baselineP95 * 1.15);
  console.log(`cost column ${testInfo.project.name}: baseline p95 ${baselineP95.toFixed(2)} ms; rendered p95 ${renderedP95.toFixed(2)} ms`);
  await page.emulateMedia({ colorScheme: 'light' });
  await mkdir(SHOTS, { recursive: true });
  await costs.first().scrollIntoViewIfNeeded();
  await page.locator('.table-scroll').screenshot({ path: path.join(SHOTS, `${testInfo.project.name}-cost-column.png`) });
  await chart.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}-cost-chart.png`) });
  expect(errors).toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

function frameP95(page: Page): Promise<number> {
  return page.evaluate(() => new Promise<number>((resolve) => {
    const samples: number[] = [];
    let previous = performance.now();
    const sample = (now: number) => {
      samples.push(now - previous);
      previous = now;
      if (samples.length < 90) requestAnimationFrame(sample);
      else resolve(samples.sort((a, b) => a - b)[Math.floor(samples.length * .95)] ?? 0);
    };
    requestAnimationFrame(sample);
  }));
}
