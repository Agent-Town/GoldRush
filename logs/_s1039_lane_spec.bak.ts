import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('artifacts/perf-05');
const BOOT_URL = '/?debug&profile&nolevel&nopause&seed=perf-05&timescale=8';
const BASELINE_MODE = process.env.PERF05_BASELINE === '1';
const THROTTLE = {
  cpuRate: 1.25,
  latencyMs: 1,
  downloadBytesPerSecond: 20_000_000,
  uploadBytesPerSecond: 5_000_000,
};

const NON_CRITICAL_TEXTURES = [
  '/bld-palisade',
  '/bld-sentry-beacon',
  '/bld-sluice-works',
  '/bld-stockpile-yard',
  '/bld-signal-turret',
  '/bld-claim-office',
  '/char-baron',
  '/char-prospector',
  '/prop-baron-banner',
  '/townsfolk-',
  '/ui-menu-',
  '/ui-title-',
  '/icon-',
];
const PREFETCH_TEXTURES = ['/bld-sentry-beacon', '/bld-palisade', '/bld-sluice-works', '/bld-stockpile-yard', '/bld-signal-turret'];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[]; assetErrors: string[] };
type ResourceRow = {
  name: string;
  startTime: number;
  responseEnd: number;
  bytes: number;
  initiatorType: string;
};
type BootMarks = {
  firstFrame: number;
  playable: number;
  waveWarning: number;
  waveSpawn: number;
};
type StartupReport = {
  mode: 'baseline' | 'after';
  project: string;
  throttle: typeof THROTTLE;
  metrics: {
    ttiMs: number;
    firstFrameMs: number;
    waveWarningMs: number;
    waveSpawnMs: number;
    bootBytes: number;
  };
  lazy: {
    beforeFirstFrame: string[];
    prefetchedBeforeWaveSpawn: string[];
  };
  diagnostics: {
    browserVersion: string;
    iconRows: ResourceRow[];
    prefetchRows: ResourceRow[];
    assetStatuses: Record<string, string | undefined>;
  };
  errors: ErrorBucket;
};

declare global {
  interface Window {
    __PERF05_BOOT__?: BootMarks;
  }
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [], assetErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && isMeasuredResource(response.url())) {
      bucket.assetErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  return bucket;
}

async function installBootProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5_000);
    window.__PERF05_BOOT__ = { firstFrame: 0, playable: 0, waveWarning: 0, waveSpawn: 0 };
    const sample = () => {
      const marks = window.__PERF05_BOOT__!;
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (diagnostics) {
        if (!marks.firstFrame && diagnostics.frame > 0) marks.firstFrame = performance.now();
        if (!marks.playable && diagnostics.runState === 'playing' && diagnostics.frame > 2) marks.playable = performance.now();
        if (!marks.waveWarning && diagnostics.wave === 1 && diagnostics.waveState === 'warning') marks.waveWarning = performance.now();
        if (!marks.waveSpawn && diagnostics.wave >= 1 && diagnostics.waveSpawnedTotal > 0) marks.waveSpawn = performance.now();
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function installProfile(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(
      'gr.profile.v2',
      JSON.stringify({
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }),
    );
  });
}

async function throttlePage(page: Page): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: THROTTLE.latencyMs,
    downloadThroughput: THROTTLE.downloadBytesPerSecond,
    uploadThroughput: THROTTLE.uploadBytesPerSecond,
    connectionType: 'cellular4g',
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE.cpuRate });
}

async function resourceRows(page: Page): Promise<ResourceRow[]> {
  return page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => {
        const resource = entry as PerformanceResourceTiming;
        return {
          name: resource.name,
          startTime: resource.startTime,
          responseEnd: resource.responseEnd,
          bytes: Math.max(resource.transferSize || 0, resource.encodedBodySize || 0, resource.decodedBodySize || 0),
          initiatorType: resource.initiatorType,
        };
      })
      .filter((entry) => /\.(css|js|json|png|jpe?g|webp|mp3|woff2?)(\?|$)/.test(new URL(entry.name).pathname + new URL(entry.name).search)),
  );
}

async function runStartup(page: Page, testInfo: TestInfo): Promise<StartupReport> {
  await installProfile(page);
  await installBootProbe(page);
  await throttlePage(page);
  const errors = collectErrors(page);

  await page.goto(BOOT_URL, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => window.__PERF05_BOOT__?.playable ?? 0), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__PERF05_BOOT__?.waveWarning ?? 0), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__PERF05_BOOT__?.waveSpawn ?? 0), { timeout: 30_000 }).toBeGreaterThan(0);

  const marks = (await page.evaluate(() => window.__PERF05_BOOT__))!;
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);
  const resources = await resourceRows(page);
  const bootBytes = resources
    .filter((row) => row.responseEnd <= marks.playable)
    .reduce((sum, row) => sum + row.bytes, 0);
  const beforeFirstFrame = resources
    .filter((row) => row.startTime < marks.firstFrame && hasAny(row.name, NON_CRITICAL_TEXTURES))
    .map((row) => shortName(row.name));
  const prefetchedBeforeWaveSpawn = resources
    .filter((row) => row.startTime > marks.firstFrame && row.startTime < marks.waveSpawn && hasAny(row.name, PREFETCH_TEXTURES))
    .map((row) => shortName(row.name));

  const report: StartupReport = {
    mode: BASELINE_MODE ? 'baseline' : 'after',
    project: testInfo.project.name,
    throttle: THROTTLE,
    metrics: {
      ttiMs: Math.round(marks.playable),
      firstFrameMs: Math.round(marks.firstFrame),
      waveWarningMs: Math.round(marks.waveWarning),
      waveSpawnMs: Math.round(marks.waveSpawn),
      bootBytes,
    },
    lazy: {
      beforeFirstFrame: [...new Set(beforeFirstFrame)].sort(),
      prefetchedBeforeWaveSpawn: [...new Set(prefetchedBeforeWaveSpawn)].sort(),
    },
    diagnostics: {
      browserVersion: page.context().browser()?.version() ?? 'unknown',
      iconRows: resources.filter((row) => row.name.includes('icon')),
      prefetchRows: resources.filter((row) => hasAny(row.name, PREFETCH_TEXTURES)),
      assetStatuses: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assets ?? {}),
    },
    errors,
  };
  await writeReport(testInfo, report);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${report.mode}-${testInfo.project.name}.png`), fullPage: true });
  return report;
}

async function writeReport(testInfo: TestInfo, report: StartupReport): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(path.join(ARTIFACT_DIR, `${report.mode}-${testInfo.project.name}.json`), body);
  await testInfo.attach('perf-05-startup', { body, contentType: 'application/json' });
}

function hasAny(url: string, needles: readonly string[]): boolean {
  return needles.some((needle) => url.includes(needle));
}

function shortName(url: string): string {
  return new URL(url).pathname.split('/').pop() ?? url;
}

function isMeasuredResource(url: string): boolean {
  return /\.(css|js|json|png|jpe?g|webp|mp3|woff2?)(\?|$)/.test(new URL(url).pathname + new URL(url).search);
}

test('startup reaches playable quickly and defers non-critical textures', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const report = await runStartup(page, testInfo);
  if (BASELINE_MODE) return;

  expect(report.metrics.ttiMs).toBeLessThan(3_000);
  expect(report.metrics.firstFrameMs).toBeLessThan(report.metrics.ttiMs);
  expect(report.errors.consoleErrors).toEqual([]);
  expect(report.errors.pageErrors).toEqual([]);
  expect(report.errors.assetErrors).toEqual([]);
  expect(report.lazy.beforeFirstFrame).toEqual([]);
  expect(report.lazy.prefetchedBeforeWaveSpawn.length).toBeGreaterThan(0);
});
