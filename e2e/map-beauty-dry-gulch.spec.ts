import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type Errors = { console: string[]; page: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/dry-gulch-relief');

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.console.push(message.text());
  });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function open(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&nopause&nosteal&nowreck&nokill&${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
}

test('Dry Gulch consumes its authored relief while the Claim keeps the flat fallback', async ({ page }, testInfo) => {
  const faults = errors(page);
  await open(page, 'contract=e1-dry-gulch&seed=dry-gulch-relief');
  const gulch = await page.evaluate(() => ({
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
    ground: window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground,
    basin: window.__GR_TEST__?.terrainVisualY(-18, -18),
    rim: window.__GR_TEST__?.terrainVisualY(-10, -18),
    arroyo: window.__GR_TEST__?.terrainVisualY(-12, -14),
    mesa: window.__GR_TEST__?.terrainVisualY(22, 22),
  }));

  expect(gulch.tile?.render).toEqual({ terrainMesh: 'required' });
  expect(gulch.ground).toMatchObject({ enabled: true, mode: 'continuous-mesh', drawCalls: 1, heightSource: 'visual' });
  expect((gulch.rim ?? 0) - (gulch.basin ?? 0)).toBeGreaterThan(0.15);
  expect((gulch.mesa ?? 0) - (gulch.arroyo ?? 0)).toBeGreaterThan(0.1);

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const before = path.resolve('artifacts/e1-dry-gulch', `${testInfo.project.name}-gulch-overview.png`);
  if (fs.existsSync(before)) fs.copyFileSync(before, path.join(ARTIFACT_DIR, `${testInfo.project.name}-before.png`));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-after.png`) });

  await open(page, 'seed=dry-gulch-flat-claim');
  const claim = await page.evaluate(() => ({
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
    ground: window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground,
  }));
  expect(claim.tile?.id).toBe('frontier-river-claim');
  expect(claim.tile?.render).toBeUndefined();
  expect(claim.ground).toMatchObject({ enabled: false, mode: 'fallback', drawCalls: 1 });
  expect(faults).toEqual({ console: [], page: [] });
});

test('Dry Gulch relief stays inside FULL and LITE render budgets', async ({ page }, testInfo) => {
  const faults = errors(page);
  const samples = [];
  for (const tier of ['full', 'lite'] as const) {
    await open(page, `contract=e1-dry-gulch&performance=${tier}&seed=dry-gulch-perf-${tier}`);
    const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
    await page.waitForFunction((frame) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > frame + 180, start);
    samples.push(await page.evaluate(() => ({
      tier: window.__THREE_GAME_DIAGNOSTICS__?.performance.tier,
      p95: window.__THREE_GAME_DIAGNOSTICS__?.frameMs.p95 ?? 0,
      drawCalls: window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? 0,
      groundDrawCalls: window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground?.drawCalls ?? 0,
    })));
  }
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, `perf-${testInfo.project.name}.json`), `${JSON.stringify(samples, null, 2)}\n`);
  expect(samples.map((sample) => sample.tier)).toEqual(['full', 'lite']);
  expect(samples.every((sample) => sample.p95 > 0 && sample.p95 <= 50)).toBe(true);
  expect(samples.every((sample) => sample.drawCalls <= 200 && sample.groundDrawCalls === 1)).toBe(true);
  expect(faults).toEqual({ console: [], page: [] });
});
