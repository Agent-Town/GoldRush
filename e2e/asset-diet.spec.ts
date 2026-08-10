// Measures the built, dieted production bundle; Vite's dev server serves undieted originals.
// Run with GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet
// Town-transfer reconciliation (F-1620-7; preview-config, 2026-08-10). THREE instruments, one ceiling:
// - cue window: enters BEFORE prefetch-ready, begins settling at town loading-ready. The release gate
//   (scripts/deploy.sh) reads ONLY this test's `townResponses:` line — keep that string intact.
// - A/B normal/saveData arms: wait for prefetch-ready, disable cache, begin settling at loading-ready.
// - the four-cell decomposition below varies prefetch-wait and cache-disabled independently.
// ⚠️ DO NOT QUOTE A SINGLE RUN OF THIS INSTRUMENT AS A FACT — use the three-run evidence.
// Three consecutive settled runs, fixed built bundle, desktop / mobile (F-1623-1):
//            run 1                    run 2                    run 3
// cue        48,297,062 / 48,297,062  48,297,062 / 47,998,506  48,582,362 / 48,582,362
// normal     53,553,550 / 53,268,250  53,268,250 / 52,684,394  52,684,394 / 53,268,250
// false/false 48,297,062 / 48,297,062 47,713,206 / 48,297,062  47,998,506 / 48,582,362
// `cue-window totalBytes` is the candidate stable release-gate instrument: every reading is
// within ±1% of its project mean (max deviation desktop 0.39%, mobile 0.61%). The cue and all
// normal/decomposition arms hit the 20 s settle cap; only saveData reached 1500 ms network idle.
// Thus the release quantity is stable but cap-bounded, not evidence that prefetch idles in 20 s.
// Duplicate bytes are only 2,970–2,674,662 and do not explain the former 3.08x swing. The
// content-length control remains 27 absent / 0 unparseable in every arm; no GLB or PNG is absent.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Request, type Response } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const ARTIFACT_DIR = path.resolve('artifacts/asset-diet');
const MAPS = [{ id: 'the-claim', era: 1 }, { id: 'e1-dry-gulch', era: 1 }] as const;
const BUILT_BUNDLE_ONLY = 'asset diet measures the BUILT production bundle; set GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet';
export const TOWN_TRANSFER_CEILING_BYTES = 25_000_000;

type TownResponse = { url: string; bytes: number; contentLengthIssue: 'absent' | 'unparseable' | null };
type TownMeasurement = {
  responses: TownResponse[];
  settleDurationMs: number;
  settleCapHit: boolean;
};

const cueWindowResponsesByProject = new Map<string, TownMeasurement>();

function measuredResponse(url: URL, contentLength: string | undefined): TownResponse {
  const bytes = Number(contentLength ?? 0);
  const contentLengthIssue = contentLength === undefined
    ? 'absent'
    : contentLength.trim() === '' || !Number.isFinite(bytes) || bytes < 0
      ? 'unparseable'
      : null;
  return { url: `${url.pathname}${url.search}`, bytes, contentLengthIssue };
}

function startTownTransferMeter(page: Page) {
  const responses: TownResponse[] = [];
  const inFlight = new Set<Request>();
  let townOrigin = '';
  let idleSince = Date.now();

  const onRequest = (request: Request) => {
    const url = new URL(request.url());
    if (!townOrigin && request.isNavigationRequest()) townOrigin = url.origin;
    if (url.protocol === 'blob:' || url.origin !== townOrigin) return;
    inFlight.add(request);
    idleSince = 0;
  };
  const onRequestDone = (request: Request) => {
    if (inFlight.delete(request) && inFlight.size === 0) idleSince = Date.now();
  };
  const onResponse = (response: Response) => {
    const url = new URL(response.url());
    if (url.protocol === 'blob:' || url.origin !== townOrigin) return;
    responses.push(measuredResponse(url, response.headers()['content-length']));
  };
  page.on('request', onRequest);
  page.on('requestfinished', onRequestDone);
  page.on('requestfailed', onRequestDone);
  page.on('response', onResponse);

  return async (): Promise<TownMeasurement> => {
    const startedAt = Date.now();
    const capAt = startedAt + 20_000;
    while ((!idleSince || Date.now() - idleSince < 1_500) && Date.now() < capAt) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const settleCapHit = !idleSince || Date.now() - idleSince < 1_500;
    page.off('request', onRequest);
    page.off('requestfinished', onRequestDone);
    page.off('requestfailed', onRequestDone);
    page.off('response', onResponse);
    return { responses, settleDurationMs: Date.now() - startedAt, settleCapHit };
  };
}

function responseStats(responses: TownResponse[]) {
  const counts = new Map<string, { bytes: number; count: number }>();
  let totalBytes = 0;
  for (const response of responses) {
    totalBytes += response.bytes;
    const seen = counts.get(response.url);
    counts.set(response.url, { bytes: seen?.bytes ?? response.bytes, count: (seen?.count ?? 0) + 1 });
  }
  const uniqueBytes = [...counts.values()].reduce((sum, response) => sum + response.bytes, 0);
  const duplicateUrls = [...counts.entries()].filter(([, response]) => response.count > 1);
  return { totalBytes, uniqueBytes, duplicateBytes: totalBytes - uniqueBytes, duplicateUrls };
}

async function throttleGlbs(page: Page, baseURL: string | undefined, cacheDisabled = false) {
  const cdp = await page.context().newCDPSession(page);
  if (cacheDisabled) await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditionsByRule', {
    matchedNetworkConditions: [{
      urlPattern: new URL('/assets/*.glb', baseURL).href,
      latency: 600,
      downloadThroughput: -1,
      uploadThroughput: -1,
    }],
  });
  return cdp;
}

function contentLengthAudit(label: string, responses: TownResponse[]): string[] {
  const issues = responses.reduce((counts, response) => {
    if (response.contentLengthIssue) {
      const key = `${response.url}\n${response.contentLengthIssue}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, new Map<string, number>());
  const count = [...issues.values()].reduce((sum, occurrences) => sum + occurrences, 0);
  return [
    `### ${label}`,
    '',
    `Missing or unparseable \`content-length\`: **${count} responses**.`,
    '',
    '| URL | reason | occurrences |',
    '| --- | --- | ---: |',
    ...([...issues.entries()].map(([key, occurrences]) => {
      const [url, reason] = key.split('\n');
      return `| ${url.replaceAll('|', '\\|')} | ${reason} | ${occurrences} |`;
    })),
    ...(count === 0 ? ['| _none_ | — | 0 |'] : []),
    '',
  ];
}

if (process.env.GR_ASSET_DIET_BUNDLE !== '1') console.warn(`[asset-diet] SKIPPED: ${BUILT_BUNDLE_ONLY}`);
test.skip(process.env.GR_ASSET_DIET_BUNDLE !== '1', BUILT_BUNDLE_ONLY);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
});

test('dieted output keeps two terrain census views and town within screenshot tolerance', async ({ page }) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  for (const { id, era } of MAPS) {
    await page.goto(`/?debug&era=${era}&contract=${id}&nowaves&nolevel&nokill&nopause&tier=full&seed=asset-diet-${id}`);
    await page.waitForFunction(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
      return (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20
        && canvas?.dataset.terrain3dPilotState === 'ready'
        && canvas.dataset.assetLoadingState === 'ready';
    });
    const briefing = page.getByTestId('contract-briefing-dismiss');
    if (await briefing.isVisible().catch(() => false)) await briefing.click();
    await expect(page.locator('#game-canvas')).toHaveScreenshot(`${id}.png`, {
      animations: 'disabled',
      threshold: 0.3,
      maxDiffPixelRatio: 0.15,
    });
  }

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20 && canvas?.dataset.assetLoadingState === 'ready';
  });
  await expect(page.locator('#game-canvas')).toHaveScreenshot('town.png', {
    animations: 'disabled',
    threshold: 0.3,
    maxDiffPixelRatio: 0.15,
  });
  expectNoConsoleErrors(watch);
});

test('honest town and claim cues appear while GLBs are throttled and leave at ready', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  const settleTownTransfer = startTownTransferMeter(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const cdp = await throttleGlbs(page, testInfo.project.use.baseURL);

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  const cue = page.getByTestId('asset-loading-cue');
  await expect(cue).toBeVisible();
  await expect(cue).toHaveText(/^the town is raising… \d+\/\d+$/);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-town-throttled.png`) });
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();
  const cueWindowMeasurement = await settleTownTransfer();
  cueWindowResponsesByProject.set(testInfo.project.name, cueWindowMeasurement);
  await writeFile(
    path.join(ARTIFACT_DIR, `cue-window-${testInfo.project.name}.json`),
    JSON.stringify(cueWindowMeasurement),
  );
  const cueWindowResponseBytes = responseStats(cueWindowMeasurement.responses).totalBytes;
  console.info(`[asset-diet] ${testInfo.project.name} townResponses: ${cueWindowResponseBytes} bytes`);
  expect(cueWindowResponseBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);

  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await expect(cue).toBeVisible();
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-loading-ready', '0');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();

  await page.goto('/?debug&era=1&contract=the-claim&nowaves&nolevel&nokill&nopause&tier=full&seed=asset-diet-cue');
  await expect(cue).toBeVisible();
  await expect(cue).toHaveText(/^the claim is raising… \d+\/\d+$/);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-claim-throttled.png`) });
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();
  await cdp.detach();
  expectNoConsoleErrors(watch);
});

// A number worth measuring is not yet a number worth asserting: asset changes may move the totals and delta.
test('town byte budget reports normal and saveData arms by URL', async ({ browser, page }, testInfo) => {
  test.setTimeout(240_000);
  const measureTown = async (armPage: typeof page, options: { prefetchWait: boolean; cacheDisabled: boolean }) => {
    const cdp = await throttleGlbs(armPage, testInfo.project.use.baseURL, options.cacheDisabled);
    const settleTownTransfer = startTownTransferMeter(armPage);
    await armPage.goto('/?town3dPilot=all&tier=full');
    if (options.prefetchWait) {
      await expect(armPage.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-town-state', 'ready', { timeout: 45_000 });
    }
    await armPage.getByTestId('start-menu-enter-town').click();
    await expect.poll(() => armPage.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
    const measurement = await settleTownTransfer();
    await cdp.detach();
    return measurement;
  };

  const use = testInfo.project.use;
  const createArm = async (metered: boolean) => {
    const context = await browser.newContext({
      baseURL: use.baseURL,
      deviceScaleFactor: use.deviceScaleFactor,
      hasTouch: use.hasTouch,
      isMobile: use.isMobile,
      userAgent: use.userAgent,
      viewport: use.viewport,
    });
    const armPage = await context.newPage();
    await armPage.addInitScript(({ profileKey, townKey, metaKey, guideKey }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(guideKey, '1');
    }, {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    });
    if (metered) {
      await armPage.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
      });
    }
    return { context, page: armPage, watch: watchErrors(armPage) };
  };

  const normalArm = await createArm(false);
  const normal = await measureTown(normalArm.page, { prefetchWait: true, cacheDisabled: true });
  const saveDataArm = await createArm(true);
  const saveData = await measureTown(saveDataArm.page, { prefetchWait: true, cacheDisabled: true });
  const decomposition: Array<{ prefetchWait: boolean; cacheDisabled: boolean; measurement: TownMeasurement }> = [];
  for (const prefetchWait of [false, true]) {
    for (const cacheDisabled of [false, true]) {
      const arm = await createArm(false);
      const measurement = await measureTown(arm.page, { prefetchWait, cacheDisabled });
      expectNoConsoleErrors(arm.watch, `normal prefetchWait=${prefetchWait} cacheDisabled=${cacheDisabled}`);
      await arm.context.close();
      decomposition.push({ prefetchWait, cacheDisabled, measurement });
    }
  }
  const byUrl = (responses: TownResponse[]) => responses.reduce((urls, response) => {
    urls.set(response.url, (urls.get(response.url) ?? 0) + response.bytes);
    return urls;
  }, new Map<string, number>());
  const normalStats = responseStats(normal.responses);
  const saveDataStats = responseStats(saveData.responses);
  const normalBytes = normalStats.totalBytes;
  const saveDataBytes = saveDataStats.totalBytes;
  const decompositionBytes = decomposition.map((cell) => ({ ...cell, stats: responseStats(cell.measurement.responses) }));
  const decompositionBaseline = decompositionBytes.find((cell) => !cell.prefetchWait && !cell.cacheDisabled)?.stats.totalBytes;
  if (decompositionBaseline === undefined) throw new Error('missing town-budget decomposition baseline');
  const normalByUrl = byUrl(normal.responses);
  const saveDataByUrl = byUrl(saveData.responses);
  const changedUrls = [...new Set([...normalByUrl.keys(), ...saveDataByUrl.keys()])]
    .map((url) => [url, normalByUrl.get(url) ?? 0, saveDataByUrl.get(url) ?? 0] as const)
    .filter(([, normalUrlBytes, saveDataUrlBytes]) => normalUrlBytes !== saveDataUrlBytes)
    .sort((left, right) => Math.max(right[1], right[2]) - Math.max(left[1], left[2]));
  const rows = changedUrls.map(([url, normalUrlBytes, saveDataUrlBytes]) =>
    `| ${url.replaceAll('|', '\\|')} | ${normalUrlBytes} | ${saveDataUrlBytes} | ${normalUrlBytes - saveDataUrlBytes} |`);
  const cueWindowMeasurement = cueWindowResponsesByProject.get(testInfo.project.name)
    ?? JSON.parse(await readFile(path.join(ARTIFACT_DIR, `cue-window-${testInfo.project.name}.json`), 'utf8')) as TownMeasurement;
  const measurements = [
    { label: 'cue window', measurement: cueWindowMeasurement },
    { label: 'normal', measurement: normal },
    { label: 'saveData', measurement: saveData },
    ...decompositionBytes.map((cell) => ({
      label: `prefetchWait=${cell.prefetchWait}, cacheDisabled=${cell.cacheDisabled}`,
      measurement: cell.measurement,
    })),
  ];
  const measurementStats = measurements.map(({ label, measurement }) => ({ label, measurement, stats: responseStats(measurement.responses) }));
  const report = [
    `# Town byte budget — ${testInfo.project.name}`,
    '',
    '| Arm | totalBytes | uniqueBytes | duplicateBytes | Headroom against 25,000,000 |',
    '| --- | ---: | ---: | ---: | ---: |',
    `| normal | ${normalBytes} | ${normalStats.uniqueBytes} | ${normalStats.duplicateBytes} | ${TOWN_TRANSFER_CEILING_BYTES - normalBytes} |`,
    `| saveData | ${saveDataBytes} | ${saveDataStats.uniqueBytes} | ${saveDataStats.duplicateBytes} | ${TOWN_TRANSFER_CEILING_BYTES - saveDataBytes} |`,
    '',
    `Delta (normal - saveData): **${normalBytes - saveDataBytes} bytes**.`,
    '',
    '## Transfer totals and settle point',
    '',
    '| Arm | totalBytes | uniqueBytes | duplicateBytes | duplicate URL count | settle duration (ms) | 20 s cap hit |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...measurementStats.map(({ label, measurement, stats }) =>
      `| ${label} | ${stats.totalBytes} | ${stats.uniqueBytes} | ${stats.duplicateBytes} | ${stats.duplicateUrls.length} | ${measurement.settleDurationMs} | ${measurement.settleCapHit} |`),
    '',
    '### URLs fetched more than once',
    '',
    '| Arm | URL | fetch count |',
    '| --- | --- | ---: |',
    ...measurementStats.flatMap(({ label, stats }) => stats.duplicateUrls.length
      ? stats.duplicateUrls.map(([url, response]) => `| ${label} | ${url.replaceAll('|', '\\|')} | ${response.count} |`)
      : [`| ${label} | _none_ | 0 |`]),
    '',
    'The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.',
    '',
    '| URL | normal bytes | saveData bytes | delta |',
    '| --- | ---: | ---: | ---: |',
    ...rows,
    '',
    '## Normal-arm decomposition',
    '',
    '| prefetchWait | cacheDisabled | totalBytes | uniqueBytes | duplicateBytes | delta from false/false |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
    ...decompositionBytes.map((cell) =>
      `| ${cell.prefetchWait} | ${cell.cacheDisabled} | ${cell.stats.totalBytes} | ${cell.stats.uniqueBytes} | ${cell.stats.duplicateBytes} | ${cell.stats.totalBytes - decompositionBaseline} |`),
    '',
    '## Missing or unparseable content-length audit',
    '',
    ...contentLengthAudit('Cue-window instrument', cueWindowMeasurement.responses),
    ...contentLengthAudit('A/B normal arm', normal.responses),
    ...contentLengthAudit('A/B saveData arm', saveData.responses),
    ...decompositionBytes.flatMap((cell) => contentLengthAudit(
      `A/B normal cell (prefetchWait=${cell.prefetchWait}, cacheDisabled=${cell.cacheDisabled})`,
      cell.measurement.responses,
    )),
  ].join('\n');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `town-budget-${testInfo.project.name}.md`), report);

  expectNoConsoleErrors(normalArm.watch, 'normal');
  expectNoConsoleErrors(saveDataArm.watch, 'saveData');
  await normalArm.context.close();
  await saveDataArm.context.close();
  expect(normalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);
  expect(saveDataBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);
  expect(saveDataBytes).toBeLessThanOrEqual(normalBytes);
});
