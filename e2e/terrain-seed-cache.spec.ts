import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('artifacts/f1319-3-terrain-seed-per-sample-url-parse');

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('terrain height samples derive the URL seed once', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.route('**/terrain-seed-cache.html*', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html>' }));
  await page.goto('/terrain-seed-cache.html?contract=e1-night-shift&seed=before');

  const measurement = await page.evaluate(async () => {
    const modulePath = '/src/world/Terrain.ts';
    const terrain = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/world/Terrain');
    const NativeURLSearchParams = URLSearchParams;
    let derivations = 0;
    globalThis.URLSearchParams = new Proxy(NativeURLSearchParams, {
      construct(target, args, newTarget) {
        derivations += 1;
        return Reflect.construct(target, args, newTarget);
      },
    });
    history.replaceState(null, '', '/terrain-seed-cache.html?contract=e1-night-shift&seed=after');
    const started = performance.now();
    for (let index = 0; index < 200; index += 1) terrain.sampleHeight(index % 20 - 10, Math.floor(index / 20) - 5);
    const elapsedMs = performance.now() - started;
    globalThis.URLSearchParams = NativeURLSearchParams;
    return { derivations, elapsedMs };
  });

  expect(measurement.derivations, `200 sampleHeight calls took ${measurement.elapsedMs.toFixed(2)} ms`).toBe(1);

  await page.unroute('**/terrain-seed-cache.html*');
  await page.goto('/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&seed=e1-night-shift-01');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
  testInfo.annotations.push({ type: 'browser-sample', description: `200 sampleHeight calls: ${measurement.elapsedMs.toFixed(2)} ms` });
});
