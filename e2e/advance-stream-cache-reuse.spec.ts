import { execFile } from 'node:child_process';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { preview as startVitePreview, type PreviewServer } from 'vite';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

// This probe asserts only that its instrument observed both sides of the cache
// question. The answer itself becomes a regression assertion only after it is known.
const BOOT_FLAGS = 'debug&timescale=24&nolevel&seed=advance-stream-walkthrough';
const PRODUCTION_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const execFileAsync = promisify(execFile);

type Bucket = 'DOUBLE-DOWNLOAD' | 'REVALIDATED' | 'OVERLAP' | 'CACHE-HIT';
type Fetch = {
  requestId: string;
  url: string;
  door: string;
  startedAt: number;
  wallTime: number;
  prefetch: boolean;
  servedFromCache: boolean;
  fromDiskCache: boolean;
  fromPrefetchCache: boolean;
  status?: number;
  finishedAt?: number;
  failedAt?: number;
  encodedDataLength?: number;
  cacheControl?: string;
};
type DoorRow = {
  door: string;
  doubleDownload: number;
  revalidated: number;
  overlap: number;
  cacheHit: number;
  wireBytes: number;
};
type ProbeResult = {
  arm: 'dev-server' | 'production-headers';
  project: string;
  cacheControl: string[];
  doorRows: DoorRow[];
  observed: Fetch[];
  repeatedUrls: Array<{ url: string; fetches: Fetch[] }>;
};

const devResults = new Map<string, ProbeResult>();

test('measures advance-stream cache reuse without route interception', async ({ page }, testInfo) => {
  const result = await measure(page, testInfo, 'dev-server', '/');
  devResults.set(testInfo.project.name, result);
  await writeReport(`artifacts/advance-stream-cache-reuse-${testInfo.project.name}.md`, renderArm(result));
});

// The production answer is genuinely unknown: assert only instrument validity, never its outcome.
test('compares advance-stream cache reuse under production headers', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const preview = await startPreview();
  try {
    const production = await measure(page, testInfo, 'production-headers', preview.url);
    const dev = devResults.get(testInfo.project.name);
    expect(dev, 'the dev-server arm must run before the production arm').toBeDefined();
    await writeReport(`artifacts/advance-stream-cache-reuse-headers-${testInfo.project.name}.md`, renderComparison(dev!, production));
  } finally {
    await preview.server.close();
  }
});

async function measure(
  page: Page,
  testInfo: TestInfo,
  arm: ProbeResult['arm'],
  targetUrl: string,
): Promise<ProbeResult> {
  test.setTimeout(180_000);
  await seedProfile(page);
  const errors = collectErrors(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const fetches = new Map<string, Fetch>();
  let currentDoor = 'menu';

  cdp.on('Network.requestWillBeSent', (event) => {
    if (!isGlbRequest(event.request.url)) return;
    fetches.set(event.requestId, {
      requestId: event.requestId,
      url: event.request.url,
      door: currentDoor,
      startedAt: event.timestamp,
      wallTime: event.wallTime,
      prefetch: Object.entries(event.request.headers).some(
        ([name, value]) => name.toLowerCase() === 'x-gold-rush-prefetch' && value === '1',
      ),
      servedFromCache: false,
      fromDiskCache: false,
      fromPrefetchCache: false,
    });
  });
  cdp.on('Network.requestServedFromCache', ({ requestId }) => {
    const fetch = fetches.get(requestId);
    if (fetch) fetch.servedFromCache = true;
  });
  cdp.on('Network.responseReceived', ({ requestId, response }) => {
    const fetch = fetches.get(requestId);
    if (!fetch) return;
    fetch.fromDiskCache = response.fromDiskCache ?? false;
    fetch.fromPrefetchCache = response.fromPrefetchCache ?? false;
    fetch.status ??= response.status;
    const cacheControl = Object.entries(response.headers).find(([name]) => name.toLowerCase() === 'cache-control')?.[1];
    if (cacheControl !== undefined) fetch.cacheControl = String(cacheControl);
  });
  cdp.on('Network.responseReceivedExtraInfo', ({ requestId, statusCode }) => {
    const fetch = fetches.get(requestId);
    if (fetch) fetch.status = statusCode;
  });
  cdp.on('Network.loadingFinished', ({ requestId, timestamp, encodedDataLength }) => {
    const fetch = fetches.get(requestId);
    if (!fetch) return;
    fetch.finishedAt = timestamp;
    fetch.encodedDataLength = encodedDataLength;
  });
  cdp.on('Network.loadingFailed', ({ requestId, timestamp }) => {
    const fetch = fetches.get(requestId);
    if (fetch) fetch.failedAt = timestamp;
  });

  await page.goto(targetUrl);
  await expect.poll(() => [...fetches.values()].filter(({ prefetch, finishedAt }) => prefetch && finishedAt !== undefined).length, { timeout: 20_000 }).toBeGreaterThan(0);
  await page.evaluate((flags) => history.replaceState(null, '', `/?${flags}`), BOOT_FLAGS);

  currentDoor = 'town';
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await openBoard(page);

  currentDoor = 'contract1';
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await forceSecure(page);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 15_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town', { timeout: 8_000 });

  currentDoor = 'town-return';
  await page.getByTestId('stake-again').click();
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  await dismissStoryBeat(page);

  currentDoor = 'contract2';
  await page.getByTestId('contract-launch-e1-dry-gulch').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => [...fetches.values()].filter(({ finishedAt, failedAt }) => finishedAt === undefined && failedAt === undefined).length, { timeout: 20_000 }).toBe(0);

  const observed = [...fetches.values()].sort((a, b) => a.startedAt - b.startedAt);
  const demands = observed.filter(({ prefetch }) => !prefetch);
  const classified = demands.map((fetch) => ({ fetch, bucket: classify(fetch, observed) }));
  const doors = ['menu', 'town', 'contract1', 'town-return', 'contract2'];
  const doorRows = doors.map((door) => {
    const buckets = classified.filter(({ fetch }) => fetch.door === door).map(({ bucket }) => bucket);
    return {
      door,
      doubleDownload: buckets.filter((bucket) => bucket === 'DOUBLE-DOWNLOAD').length,
      revalidated: buckets.filter((bucket) => bucket === 'REVALIDATED').length,
      overlap: buckets.filter((bucket) => bucket === 'OVERLAP').length,
      cacheHit: buckets.filter((bucket) => bucket === 'CACHE-HIT').length,
      wireBytes: observed.filter((fetch) => fetch.door === door).reduce((sum, fetch) => sum + (fetch.encodedDataLength ?? 0), 0),
    };
  });
  const repeatedUrls = [...new Set(observed.map(({ url }) => url))]
    .map((url) => ({ url, fetches: observed.filter((fetch) => fetch.url === url) }))
    .filter(({ fetches: urlFetches }) => urlFetches.length > 1);

  expect(errors).toEqual([]);
  expect(observed.some(({ prefetch, finishedAt }) => prefetch && finishedAt !== undefined)).toBe(true);
  expect(demands.length).toBeGreaterThan(0);
  const cacheControl = [...new Set(observed.map((fetch) => fetch.cacheControl).filter((value): value is string => value !== undefined))];
  expect(cacheControl.length, 'at least one GLB response must expose cache-control').toBeGreaterThan(0);

  await cdp.detach();
  return { arm, project: testInfo.project.name, cacheControl, doorRows, observed, repeatedUrls };
}

function classify(fetch: Fetch, allFetches: Fetch[]): Bucket {
  if (fetch.status === 304) return 'REVALIDATED';
  if (fetch.servedFromCache || fetch.fromDiskCache || fetch.fromPrefetchCache) return 'CACHE-HIT';
  const completedPrefetch = allFetches.some(
    (candidate) => candidate.url === fetch.url && candidate.prefetch && candidate.finishedAt !== undefined && candidate.finishedAt < fetch.startedAt,
  );
  return completedPrefetch && (fetch.encodedDataLength ?? 0) > 0
    ? 'DOUBLE-DOWNLOAD'
    : 'OVERLAP';
}

async function startPreview(): Promise<{ server: PreviewServer; url: string }> {
  await ensureBuiltBundle();
  const server = await startVitePreview({
    logLevel: 'warn',
    preview: {
      host: '127.0.0.1',
      port: 0,
      strictPort: false,
      headers: { 'Cache-Control': PRODUCTION_CACHE_CONTROL },
    },
  });
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') throw new Error('Vite preview did not expose a TCP port');
  return { server, url: `http://127.0.0.1:${address.port}` };
}

async function ensureBuiltBundle(): Promise<void> {
  const lock = join(tmpdir(), `gold-rush-cache-reuse-${process.ppid}.lock`);
  const ready = `${lock}.ready`;
  if (await access(ready).then(() => true).catch(() => false)) return;
  try {
    await mkdir(lock);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    await expect.poll(() => access(ready).then(() => true).catch(() => false), { timeout: 120_000 }).toBe(true);
    return;
  }
  try {
    await execFileAsync('npm', ['run', 'build'], { cwd: process.cwd(), maxBuffer: 50 * 1024 * 1024 });
    await writeFile(ready, 'ready');
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

async function writeReport(path: string, report: string): Promise<void> {
  console.log(`\n${report}`);
  await mkdir('artifacts', { recursive: true });
  await writeFile(path, report);
}

function renderArm(result: ProbeResult): string {
  return [
    '# Advance-stream cache reuse',
    '',
    `Boot flags: \`${BOOT_FLAGS}\` · arm: ${result.arm} · route interception: none · network emulation: none · project: ${result.project}`,
    `Observed \`cache-control\` via CDP \`Network.responseReceived\`: ${result.cacheControl.map((value) => `\`${value}\``).join(', ')}`,
    '',
    '| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT | Wire bytes |',
    '|---|---:|---:|---:|---:|---:|',
    ...result.doorRows.map(({ door, doubleDownload, revalidated, overlap, cacheHit, wireBytes }) => `| ${door} | ${doubleDownload} | ${revalidated} | ${overlap} | ${cacheHit} | ${wireBytes} |`),
    '',
    '| URL | Prefetch bytes | Subsequent fetch bytes and bucket |',
    '|---|---:|---|',
    ...result.repeatedUrls.map(({ url, fetches }) => {
      const prefetchBytes = fetches.filter(({ prefetch }) => prefetch).map(({ encodedDataLength }) => encodedDataLength ?? 0).join('<br>') || '—';
      const subsequent = fetches.filter(({ prefetch }) => !prefetch).map((fetch) => `${fetch.encodedDataLength ?? 0} (${classify(fetch, result.observed)})`).join('<br>') || '—';
      return `| ${shortUrl(url)} | ${prefetchBytes} | ${subsequent} |`;
    }),
    '',
  ].join('\n');
}

function renderComparison(dev: ProbeResult, production: ProbeResult): string {
  const rows = dev.doorRows.map((devRow, index) => {
    const productionRow = production.doorRows[index];
    return `| ${devRow.door} | ${devRow.doubleDownload} | ${devRow.revalidated} | ${devRow.overlap} | ${devRow.cacheHit} | ${devRow.wireBytes} | ${productionRow.doubleDownload} | ${productionRow.revalidated} | ${productionRow.overlap} | ${productionRow.cacheHit} | ${productionRow.wireBytes} |`;
  });
  return [
    '# Advance-stream cache reuse: dev vs production headers',
    '',
    `Boot flags: \`${BOOT_FLAGS}\` · route interception: none · network emulation: none · project: ${dev.project}`,
    `Dev \`cache-control\` observed via CDP \`Network.responseReceived\`: ${dev.cacheControl.map((value) => `\`${value}\``).join(', ')}`,
    `Production \`cache-control\` observed via CDP \`Network.responseReceived\` from Vite preview's native header option: ${production.cacheControl.map((value) => `\`${value}\``).join(', ')}`,
    '',
    '| Door | Dev DOUBLE-DOWNLOAD | Dev REVALIDATED | Dev OVERLAP | Dev CACHE-HIT | Dev wire bytes | Production DOUBLE-DOWNLOAD | Production REVALIDATED | Production OVERLAP | Production CACHE-HIT | Production wire bytes |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...rows,
    '',
    '## Dev-server detail',
    '',
    renderArm(dev),
    '## Production-headers detail',
    '',
    renderArm(production),
  ].join('\n');
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, scoreKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(scoreKey, '[]');
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openBoard(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function forceSecure(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('run.secureWave', 1);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.25);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.resetRun();
  });
}

async function dismissStoryBeat(page: Page): Promise<void> {
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) {
    await page.mouse.click(6, 6);
    await page.waitForTimeout(150);
  }
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function shortUrl(url: string): string {
  return new URL(url).pathname;
}

function isGlbRequest(url: string): boolean {
  const parsed = new URL(url);
  return parsed.pathname.endsWith('.glb') && parsed.search === '';
}
