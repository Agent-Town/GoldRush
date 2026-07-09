import { expect, test, webkit, type Browser, type Page, type TestInfo } from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PERFORMANCE_TIER_CONFIGS, type PerformanceTier } from '../src/game/PerformanceTier';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type PerfSample = {
  tier: PerformanceTier;
  p95: number;
  renderer: ThreeGameDiagnostics['renderer'];
  lighting: ThreeGameDiagnostics['lighting'];
  detail: ThreeGameDiagnostics['terrain']['detailScatter'];
  canvas: ThreeGameDiagnostics['canvas'];
  errors: ErrorBucket;
};

const ARTIFACT_DIR = path.resolve('artifacts/058');
const BASE_URL = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5188';
const PROFILE_STATE = {
  version: 2,
  activeId: 'robin',
  profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript((state) => {
    if (sessionStorage.getItem('__gr_058_profile_seeded__')) return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('gr.profile.v2', JSON.stringify(state));
    sessionStorage.setItem('__gr_058_profile_seeded__', '1');
  }, PROFILE_STATE);
}

async function openGame(page: Page, tier: PerformanceTier | 'auto', seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  const tierParam = tier === 'auto' ? '' : `&tier=${tier}`;
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&nosteal&seed=${seed}${tierParam}${extra}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40);
  return errors;
}

async function captureTierShot(page: Page, tier: PerformanceTier, testInfo: TestInfo): Promise<ThreeGameDiagnostics> {
  await openGame(page, tier, '058-shot');
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 12));
  await page.waitForTimeout(350);
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const buffer = await page.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, `${testInfo.project.name}-${tier}.png`), buffer);
  await testInfo.attach(`058-${tier}`, { body: buffer, contentType: 'image/png' });
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

test.describe('desktop Chrome tier proofs', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'desktop Chrome only');

test('Settings performance override persists and applies Lite render knobs', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'settings proof only needs one browser');
  await seedProfile(page);
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-settings').click();
  await page.getByTestId('start-menu-performance-tier').selectOption('lite');
  await expect(page.getByTestId('start-menu-performance-tier')).toHaveValue('lite');

  await page.goto('/?debug&nowaves&nokill&nolevel&nopause&nosteal&seed=058-settings');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  const config = PERFORMANCE_TIER_CONFIGS.lite;

  expect(diagnostics.performance).toMatchObject({ tier: 'lite', override: 'lite', source: 'override' });
  expect(diagnostics.canvas.dpr).toBeLessThanOrEqual(config.maxDpr);
  expect(diagnostics.lighting?.shadowsQuality).toBe(config.shadowsQuality);
  expect(diagnostics.lighting?.postEnabled).toBe(config.postEnabled);
  expect(diagnostics.terrain.detailScatter?.densityTier).toBe('desktop');
  expect(diagnostics.terrain.detailScatter?.totalInstances ?? 99).toBeLessThan(60);
  expect(diagnostics.vfx.floatTextPool).toBe(config.floatTextPool);
  expect(diagnostics.vfx.combat.puffs.capacity).toBe(config.combatVfxPuffs);
  expect(diagnostics.performance.config.enemyBarCap).toBe(config.enemyBarCap);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('iPad-class auto detection chooses Lite', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'auto-detect proof only needs one browser');
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = await openGame(page, 'auto', '058-ipad-auto');
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);

  expect(diagnostics.performance.tier).toBe('lite');
  expect(diagnostics.performance.source).toBe('auto');
  expect(diagnostics.performance.reason).toContain('iPad');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  await context.close();
});

test('tier switch is render-only for a deterministic economy slice', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'determinism proof only needs one browser');
  test.setTimeout(60_000);
  const full = await simSignature(page, 'full');
  const lite = await simSignature(page, 'lite');
  const report = {
    full: { hash: hashSignature(full.signature), performance: full.diagnostics.performance },
    lite: { hash: hashSignature(lite.signature), performance: lite.diagnostics.performance },
  };
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'determinism-tier-report.json'), body);
  await testInfo.attach('058-determinism-tier-report', { body, contentType: 'application/json' });

  expect(full.signature).toEqual(lite.signature);
  expect(full.diagnostics.performance.tier).toBe('full');
  expect(lite.diagnostics.performance.tier).toBe('lite');
  expect(lite.diagnostics.canvas.dpr).toBeLessThanOrEqual(full.diagnostics.canvas.dpr);
  expect(lite.diagnostics.lighting?.postEnabled).toBe(false);
});

test('FULL and LITE same-scene screenshots are captured', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'visual pair only needs one browser');
  const full = await captureTierShot(page, 'full', testInfo);
  const lite = await captureTierShot(page, 'lite', testInfo);

  expect(full.performance.tier).toBe('full');
  expect(lite.performance.tier).toBe('lite');
});
});

test('desktop WebKit records FULL baseline and LITE wave-20 stress envelope', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-webkit', 'webkit perf probe');
  test.setTimeout(90_000);
  const executablePath = webkit.executablePath();
  test.skip(!fs.existsSync(executablePath), `Playwright WebKit executable missing: ${executablePath}`);
  const browser = await webkit.launch();
  try {
    const full = await wave20Sample(browser, 'full');
    const lite = await wave20Sample(browser, 'lite');
    const report = { project: testInfo.project.name, full, lite, envelope: { liteP95MsMax: 25 } };
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    const body = `${JSON.stringify(report, null, 2)}\n`;
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'webkit-perf-table.json'), body);
    await testInfo.attach('058-webkit-perf-table', { body, contentType: 'application/json' });

    expect(full.tier).toBe('full');
    expect(lite.tier).toBe('lite');
    expect(lite.canvas.dpr).toBeLessThanOrEqual(full.canvas.dpr);
    expect(lite.lighting?.shadowsQuality).toBe('blob');
    expect(lite.p95).toBeLessThanOrEqual(25);
    expect(full.errors.consoleErrors).toEqual([]);
    expect(full.errors.pageErrors).toEqual([]);
    expect(lite.errors.consoleErrors).toEqual([]);
    expect(lite.errors.pageErrors).toEqual([]);
  } finally {
    await browser.close();
  }
});

test('built hashed assets have immutable cache headers and small-merge download estimate', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'cache report only needs one project');
  const headersPath = path.resolve('dist/_headers');
  test.skip(!fs.existsSync(headersPath), 'run npm run build before the cache-header report');

  const headers = fs.readFileSync(headersPath, 'utf8');
  const assets = listDistAssets();
  const hashedAssets = assets.filter((asset) => /-[A-Za-z0-9_-]{8,}\./.test(path.basename(asset.file)));
  const jsAssets = hashedAssets.filter((asset) => asset.file.endsWith('.js')).sort((a, b) => b.bytes - a.bytes);
  const cssAssets = hashedAssets.filter((asset) => asset.file.endsWith('.css'));
  const indexBytes = fs.statSync(path.resolve('dist/index.html')).size;
  const typicalSmallMergeBytes = indexBytes + (jsAssets[0]?.bytes ?? 0) + cssAssets.reduce((sum, asset) => sum + asset.bytes, 0);
  const report = {
    immutableRule: '/assets/*',
    indexBytes,
    largestChangedJs: jsAssets[0] ?? null,
    cssAssets,
    typicalSmallMergeBytes,
    typicalSmallMergeMb: Number((typicalSmallMergeBytes / 1024 / 1024).toFixed(3)),
    hashedAssetCount: hashedAssets.length,
  };
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'cache-report.json'), body);
  await testInfo.attach('058-cache-report', { body, contentType: 'application/json' });

  expect(headers).toContain('/assets/*');
  expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
  expect(headers).toContain('/*.html');
  expect(headers).toContain('Cache-Control: no-cache');
  expect(hashedAssets.length).toBeGreaterThan(0);
  expect(typicalSmallMergeBytes).toBeGreaterThan(indexBytes);
});

async function simSignature(page: Page, tier: PerformanceTier): Promise<{ signature: unknown; diagnostics: ThreeGameDiagnostics }> {
  await openGame(page, tier, '058-sim-shared');
  const signature = await page.evaluate(() => {
    const testApi = window.__GR_TEST__;
    testApi?.setManualSim(true);
    testApi?.resetRun();
    testApi?.setManualSim(true);
    testApi?.setBalance('enemy.contactDamage', 0);
    const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active);
    if (node) testApi?.teleport(node.position.x, node.position.z);
    testApi?.advanceSim(8, 1 / 10);
    const log = (testApi?.economyLog() ?? []) as Record<string, unknown>[];
    return {
      economy: testApi?.summarizeLog(log),
      logLength: log.length,
      terrain: [
        testApi?.terrainSim(-10, 18),
        testApi?.terrainSim(2, 18),
        testApi?.terrainSim(14, 18),
      ],
      wave: window.__THREE_GAME_DIAGNOSTICS__?.wave,
      hero: window.__THREE_GAME_DIAGNOSTICS__?.heroPos,
    };
  });
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  return { signature, diagnostics };
}

function hashSignature(signature: unknown): string {
  return `sha256:${crypto.createHash('sha256').update(JSON.stringify(signature)).digest('hex').slice(0, 16)}`;
}

async function wave20Sample(browser: Browser, tier: PerformanceTier): Promise<PerfSample> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, baseURL: BASE_URL });
  const page = await context.newPage();
  try {
    const errors = await openGame(page, tier, `058-webkit-${tier}`, '&timescale=3');
    await page.evaluate(() => {
      window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
      window.__GR_TEST__?.setBalance('waves.aliveCap', 60);
      window.__GR_TEST__?.setWave(20);
      window.__GR_TEST__?.setBeaconWave(20);
      window.__GR_TEST__?.teleport(0, 12);
      window.__GR_TEST__?.spawnPack(60, 16, { hpScale: 999, speedScale: 0.35 });
    });
    await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= 55);
    const startFrame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
    await page.waitForFunction((frame) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > frame + 220, startFrame, { timeout: 45_000 });
    const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
    return {
      tier,
      p95: diagnostics.frameMs.p95,
      renderer: diagnostics.renderer,
      lighting: diagnostics.lighting,
      detail: diagnostics.terrain.detailScatter,
      canvas: diagnostics.canvas,
      errors,
    };
  } finally {
    await context.close();
  }
}

function listDistAssets(): Array<{ file: string; bytes: number }> {
  const root = path.resolve('dist/assets');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).map((file) => {
    const fullPath = path.join(root, file);
    return { file: `assets/${file}`, bytes: fs.statSync(fullPath).size };
  });
}
