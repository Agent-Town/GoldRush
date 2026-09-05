import { expect, test, type Page } from '@playwright/test';
import type { AdvanceStreamScene, createAdvanceStream } from '../src/assets/AdvanceStream';

const RESPONSE_BYTES = 37;

declare global {
  interface Window {
    __PREFETCH_FIXTURE__: {
      stream: ReturnType<typeof createAdvanceStream>;
      requests: Array<{ url: string; bytesAtStart: number }>;
      primary: string[];
      successor: string[];
      allowance: number;
      bytesKey: string;
    };
  }
}

test('normal mode stops after the successor and honours the byte allowance', async ({ page }, testInfo) => {
  const errors = await openFixture(page);
  await mountStream(page, { kind: 'run', contractId: 'e1-drill-yard' });
  const canvas = page.locator('#game-canvas');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready');
  const normal = await page.evaluate(() => {
    const { requests, primary, successor, allowance } = window.__PREFETCH_FIXTURE__;
    return { urls: requests.map(({ url }) => url), expected: [...new Set([...primary, ...successor])], allowance };
  });
  expect(normal.urls).toEqual(normal.expected);
  expect(normal.allowance).toBe(testInfo.project.name === 'mobile-chrome' ? 12_000_000 : 24_000_000);
  await expect(canvas).toHaveAttribute('data-asset-prefetch-bytes', String(normal.urls.length * RESPONSE_BYTES));
  await page.waitForTimeout(1_200);
  expect(await page.evaluate(() => window.__PREFETCH_FIXTURE__.requests.length)).toBe(normal.urls.length);

  // Leave enough room for the primary, then cross the allowance in the successor's first batch.
  await page.evaluate((bodyBytes) => {
    const { stream, primary, allowance, bytesKey } = window.__PREFETCH_FIXTURE__;
    stream.dispose();
    sessionStorage.setItem(bytesKey, String(allowance - primary.length * bodyBytes - 1));
  }, RESPONSE_BYTES);
  await mountStream(page, { kind: 'run', contractId: 'e1-drill-yard' });
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'allowance');
  const limited = await page.evaluate(() => {
    const { requests, primary, successor, allowance, bytesKey } = window.__PREFETCH_FIXTURE__;
    return { requests, expected: [...primary, ...successor.slice(0, 2)], allowance, bytes: Number(sessionStorage.getItem(bytesKey)) };
  });
  expect(limited.requests.map(({ url }) => url)).toEqual(limited.expected);
  expect(limited.requests.every(({ bytesAtStart }) => bytesAtStart < limited.allowance)).toBe(true);
  expect(limited.bytes).toBe(limited.allowance + 2 * RESPONSE_BYTES - 1);
  await expect(canvas).toHaveAttribute('data-asset-prefetch-bytes', String(limited.bytes));

  // Neither scene changes nor a hard navigation can refill this tab's allowance.
  await page.evaluate(() => {
    const { stream } = window.__PREFETCH_FIXTURE__;
    stream.pause();
    stream.enter({ kind: 'run', contractId: 'the-claim' });
  });
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'allowance');
  expect(await page.evaluate(() => window.__PREFETCH_FIXTURE__.requests.length)).toBe(limited.requests.length);
  await page.reload();
  await mountStream(page, { kind: 'menu' });
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'allowance');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-bytes', String(limited.bytes));
  expect(await page.evaluate(() => window.__PREFETCH_FIXTURE__.requests)).toEqual([]);
  expect(errors).toEqual([]);
});

test('balanced uses the smaller allowance and completed URLs are counted once across replans', async ({ page }) => {
  const errors = await openFixture(page, 'balanced');
  await mountStream(page, { kind: 'town' });
  const canvas = page.locator('#game-canvas');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-allowance', '12000000');
  const bytes = await canvas.getAttribute('data-asset-prefetch-bytes');
  await page.evaluate(() => window.__PREFETCH_FIXTURE__.stream.enter({ kind: 'town' }));
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-bytes', bytes!);
  expect(errors).toEqual([]);
});

// F-BPTH-1 — `allowance` means STOPPED SHORT, and nothing else. The allowance check used to sit
// ABOVE the drained-plan check in AdvanceStream's `run()`, so a plan that fetched every URL and
// landed on the allowance published the early-stop state instead of `ready`: "we finished" and "we
// gave up" were the same word, and anything waiting for `ready` hung on a stream with no work left.
test('a plan that completes exactly at the allowance publishes ready, not the allowance stop', async ({ page }) => {
  const errors = await openFixture(page);
  await mountStream(page, { kind: 'run', contractId: 'e1-drill-yard' });
  const canvas = page.locator('#game-canvas');
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready');

  // Leave room for exactly the whole plan: its last batch lands ON the allowance with nothing queued.
  const { allowance, planSize } = await page.evaluate((bodyBytes) => {
    const { stream, primary, successor, allowance, bytesKey } = window.__PREFETCH_FIXTURE__;
    const planSize = new Set([...primary, ...successor]).size;
    stream.dispose();
    sessionStorage.setItem(bytesKey, String(allowance - planSize * bodyBytes));
    return { allowance, planSize };
  }, RESPONSE_BYTES);
  await mountStream(page, { kind: 'run', contractId: 'e1-drill-yard' });
  await expect(canvas).toHaveAttribute('data-asset-prefetch-bytes', String(allowance));
  await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready');
  expect(await page.evaluate(() => window.__PREFETCH_FIXTURE__.requests.length)).toBe(planSize);
  expect(errors).toEqual([]);
});

async function openFixture(page: Page, tier = 'full'): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/advance-stream-fixture?*', route => route.fulfill({
    contentType: 'text/html',
    body: '<html><head><link rel="icon" href="data:,"></head><body><canvas id="game-canvas"></canvas><script>window.__GR_RELEASE_E1__ = false;</script></body></html>',
  }));
  await page.goto(`/advance-stream-fixture?tier=${tier}`);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  return errors;
}

async function mountStream(page: Page, scene: AdvanceStreamScene): Promise<void> {
  await page.evaluate(async ({ scene, bodyBytes }) => {
    const streamPath = '/src/assets/AdvanceStream.ts';
    const terrainPath = '/src/world/Terrain3dClaimPilot.ts';
    const { createAdvanceStream, ADVANCE_STREAM_BYTES_KEY } = await import(streamPath);
    const { contractPrefetchUrls } = await import(terrainPath);
    const townPath = '/src/town/TownTavernPilot.ts';
    const { townPrefetchUrls } = await import(townPath);
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
    const primary = townPrefetchUrls();
    const successor = await contractPrefetchUrls('e1-dry-gulch');
    const requests: Array<{ url: string; bytesAtStart: number }> = [];
    const nativeFetch = window.fetch;
    window.fetch = async (input, init) => {
      if (new Headers(init?.headers).get('x-gold-rush-prefetch') !== '1') return nativeFetch(input, init);
      requests.push({ url: String(input), bytesAtStart: Number(canvas.dataset.assetPrefetchBytes) });
      // No content-length: accounting must measure the body, even for a cache hit.
      return new Response(new Uint8Array(bodyBytes));
    };
    const stream = createAdvanceStream(canvas);
    stream.enter(scene);
    window.__PREFETCH_FIXTURE__ = { stream, requests, primary, successor, allowance: Number(canvas.dataset.assetPrefetchAllowance), bytesKey: ADVANCE_STREAM_BYTES_KEY };
  }, { scene, bodyBytes: RESPONSE_BYTES });
}
