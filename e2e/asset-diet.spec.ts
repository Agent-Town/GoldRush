// Measures the built, dieted production bundle; Vite's dev server serves undieted originals.
// Run with GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet
// Town-transfer reconciliation (F-1620-7; preview-config, 2026-08-10). THREE instruments, one ceiling:
// - cue window: enters BEFORE prefetch-ready, samples at town loading-ready. The release gate
//   (scripts/deploy.sh) reads ONLY this test's cue-window `townResponses:` line — keep that string intact.
// - settled <=20 s: continues the same capture until 1500 ms idle or the cap; recorded, not gated.
// - A/B normal/saveData arms: wait for prefetch-ready and disable cache before the same two measurements.
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
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test, type Page, type Request, type Response } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const ARTIFACT_DIR = path.resolve('artifacts/asset-diet');
const MAPS = [{ id: 'the-claim', era: 1 }, { id: 'e1-dry-gulch', era: 1 }] as const;
const BUILT_BUNDLE_ONLY = 'asset diet measures the BUILT production bundle; set GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet';
export const TOWN_TRANSFER_CEILING_BYTES = 25_000_000;

type TownResponse = { url: string; bytes: number; contentLengthIssue: 'absent' | 'unparseable' | null };
type SettledTownMeasurement = {
  responses: TownResponse[];
  settleDurationMs: number;
  settleCapHit: boolean;
};
type TownTransferMeasurements = {
  cueWindowResponses: TownResponse[];
  settled: SettledTownMeasurement;
};

const execFileAsync = promisify(execFile);
const cueTestMeasurementsByProject = new Map<string, TownTransferMeasurements>();

declare global {
  interface Window {
    __assetDietCues: Array<{ text: string; ready: string | undefined }>;
    __assetDietPrefetches: Array<{ url: string; label: string; state: string; target: string }>;
    __assetDietAudio: Array<{ url: string; at: number }>;
    __assetDietPhases: Array<{ at: number; label: string; state: string }>;
  }
}

// The `music` group of src/audio/manifest.ts, by file stem. SFX and ambience are deliberately absent:
// `menu-tap.mp3` (8,821 B) is a first click's own sound and belongs in the window.
const MUSIC_STEMS = ['title-theme', 'era-e1-frontier-loop', 'era-e2-steamworks-loop', 'era-e3-voltage-loop'];

function isMusicRequest(url: string): boolean {
  const base = url.split('?')[0].split('/').pop() ?? url;
  return MUSIC_STEMS.some((stem) => base.startsWith(`${stem}-`) || base === `${stem}.mp3`);
}

// Observe rendered transient cues before navigation/entry; a protocol round trip can miss them.
function observeLoadingCues() {
  window.__assetDietCues = [];
  const sample = () => {
    const cue = document.querySelector<HTMLElement>('[data-testid="asset-loading-cue"]');
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    if (cue && cue.getBoundingClientRect().height > 0 && getComputedStyle(cue).visibility === 'visible') {
      const text = cue.textContent ?? '';
      const ready = canvas?.dataset.assetLoadingReady;
      const last = window.__assetDietCues.at(-1);
      if (last?.text !== text || last?.ready !== ready) window.__assetDietCues.push({ text, ready });
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}

function measuredResponse(url: URL, contentLength: string | undefined): TownResponse {
  const bytes = Number(contentLength ?? 0);
  const contentLengthIssue = contentLength === undefined
    ? 'absent'
    : contentLength.trim() === '' || !Number.isFinite(bytes) || bytes < 0
      ? 'unparseable'
      : null;
  return { url: `${url.pathname}${url.search}`, bytes, contentLengthIssue };
}

function startTownTransferMeasurements(page: Page) {
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

  return {
    sampleCueWindowResponses: () => [...responses],
    settle: async (): Promise<SettledTownMeasurement> => {
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
    },
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

async function waitForTownAssets(page: Page) {
  // Town starts at ready 0/0 before its asynchronous pilot import installs the loaders.
  await expect.poll(async () => Number(await page.locator('#game-canvas').getAttribute('data-asset-loading-total')), { timeout: 45_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
}

async function matchesCommittedFile(filePath: string) {
  const repoPath = path.relative(process.cwd(), filePath);
  try {
    const [{ stdout }, diskContents] = await Promise.all([
      execFileAsync('git', ['show', `HEAD:${repoPath}`], { maxBuffer: 1_000_000 }),
      readFile(filePath, 'utf8'),
    ]);
    return stdout === diskContents;
  } catch {
    return false;
  }
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

test('town cue-window budget through player entry', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  const townTransfer = startTownTransferMeasurements(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const cdp = await throttleGlbs(page, testInfo.project.use.baseURL);

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  const cue = page.getByTestId('asset-loading-cue');
  await waitForTownAssets(page);
  await expect(cue).toBeHidden();
  const cueWindowResponses = townTransfer.sampleCueWindowResponses();
  const settledCueMeasurement = await townTransfer.settle();
  const cueTestMeasurements = { cueWindowResponses, settled: settledCueMeasurement };
  cueTestMeasurementsByProject.set(testInfo.project.name, cueTestMeasurements);
  await writeFile(
    path.join(ARTIFACT_DIR, `town-transfer-${testInfo.project.name}.json`),
    JSON.stringify(cueTestMeasurements),
  );
  const cueWindowResponseBytes = responseStats(cueWindowResponses).totalBytes;
  const settledCueResponseBytes = responseStats(settledCueMeasurement.responses).totalBytes;
  console.info(`[asset-diet] ${testInfo.project.name} townResponses: ${cueWindowResponseBytes} bytes`);
  console.info(`[asset-diet] ${testInfo.project.name} settledTownResponses: ${settledCueResponseBytes} bytes settleCapHit: ${settledCueMeasurement.settleCapHit}`);
  // HONESTY (F-1625-4): this gate blocks on the known-unreliable cue-window instrument (3.08x
  // observed swing). The stable-looking settled <=20 s quantity is measured beside it but gated
  // on nothing. Which quantity should govern releases, and at what value, remains an open owner fork.
  expect(cueWindowResponseBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);
  await cdp.detach();
  expectNoConsoleErrors(watch);
});

// F-BUDGET-3 (2026-09-06) — NOTHING OUTSIDE THE FIRST TOWN IS FETCHED BEFORE THE FIRST TOWN IS
// PLAYABLE. In the `town` scene the advance stream's priority-1 target is a CONTRACT, so the
// stream used to pull `the-claim-terrain.glb` + `the-claim-panorama.glb` (1,052,408 B, measured on
// the built e1 bundle at main e5f3ac820) while the town the player had just entered was still
// raising. AdvanceStream.ts now re-schedules a contract target while the scene's own loader
// publishes `assetLoadingState=loading`. This asserts the ORDER, which is what the cure changes:
// every prefetch issued while the town was raising is a TOWN asset, and a contract is warmed only
// afterwards. The byte gate above cannot see this — its window ends on the very signal the hold
// waits for — so the invariant needs its own assertion. Reads the stream's published target rather
// than a URL shape, so a renamed map cannot silently retire the check.
test('the advance stream holds contract prefetch until the town is playable', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  await page.addInitScript(() => {
    window.__assetDietPrefetches = [];
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (new Headers(init?.headers).get('x-gold-rush-prefetch') === '1') {
        const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
        window.__assetDietPrefetches.push({
          url: String(input),
          label: canvas?.dataset.assetLoadingLabel ?? '',
          state: canvas?.dataset.assetLoadingState ?? '',
          target: canvas?.dataset.assetPrefetchTarget ?? '',
        });
      }
      return nativeFetch(input, init);
    };
  });
  const cdp = await throttleGlbs(page, testInfo.project.use.baseURL);

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  await waitForTownAssets(page);

  const duringTheRaising = await page.evaluate(() => window.__assetDietPrefetches
    .filter(({ label, state, target }) => label === 'the town' && state === 'loading' && target !== 'town'));
  expect(duringTheRaising, 'contract prefetch issued while the town was still raising').toEqual([]);

  await expect
    .poll(() => page.evaluate(() => window.__assetDietPrefetches.some(({ target }) => target !== '' && target !== 'town')), { timeout: 30_000 })
    .toBe(true);
  await cdp.detach();
  expectNoConsoleErrors(watch);
});

// F-AUDIO-3 (2026-09-06) — NO MUSIC RIDES THE WINDOW THAT MAKES THE FIRST TOWN PLAYABLE.
// Owner: "now it loads veerrry slowly" / "are the assets optimized for size?". The bisect measured
// 3,010,289 B of mp3 inside the first-town window, of which 3,001,468 B is music that the autoplay
// policy forbids playing until the player has gestured. The code was already lazy-until-a-gesture,
// which was the wrong gate: the gesture is normally the same click that enters the town, so both
// tracks were fetched at the head of the town's own queue (measured on the release e1 bundle,
// loopback: title-theme 1,200,587 B at 223 ms and era-e1-frontier-loop 1,800,881 B at 387 ms, of a
// window that closed at 555 ms). SoundSystem now holds music until the scene the player is standing
// in publishes itself playable — the same rule the advance stream follows for contract prefetch.
//
// ASSERTS ORDER, ON THE PAGE'S OWN CLOCK, for the same reason the advance-stream test does and one
// more. The byte gate cannot see this (its window ends on the very signal the hold waits for), and
// the window's END is OBSERVED by polling a DOM attribute over CDP — at 8 Mbps the page published
// `ready` at 5,883 ms and the poll saw it at 6,449 ms, a 507 ms skirt in which a correctly deferred
// fetch still looks late. `performance.now()` inside the page has no such skirt.
//
// WHY THE PHASE FORM AND NOT THE STATE AT FETCH TIME: `assetLoadingState` is not monotonic, and the
// town publishes `ready 0/0` at construction before its first GLTF starts. On the UNCURED build the
// era loop was fetched in exactly that gap, reading `state=ready`, so a state-at-fetch-time check
// passes on the bug. Proven to bite: this assertion fails 2/2 projects on the uncured build, naming
// both tracks; the state-at-fetch-time form fails 0/2.
test('music is not fetched before the first town is playable', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  await page.addInitScript(() => {
    window.__assetDietAudio = [];
    window.__assetDietPhases = [];
    const samplePhase = () => {
      const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
      const phase = { label: canvas?.dataset.assetLoadingLabel ?? '', state: canvas?.dataset.assetLoadingState ?? '' };
      const last = window.__assetDietPhases.at(-1);
      if (last?.label !== phase.label || last?.state !== phase.state) {
        window.__assetDietPhases.push({ at: Math.round(performance.now()), ...phase });
      }
      requestAnimationFrame(samplePhase);
    };
    requestAnimationFrame(samplePhase);
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(typeof input === 'object' && 'url' in input ? input.url : input);
      if (url.includes('.mp3')) window.__assetDietAudio.push({ url, at: Math.round(performance.now()) });
      return nativeFetch(input, init);
    };
  });
  const cdp = await throttleGlbs(page, testInfo.project.use.baseURL);

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  await waitForTownAssets(page);

  const phases = await page.evaluate(() => window.__assetDietPhases);
  const raisingAt = phases.find(({ label, state }) => label === 'the town' && state === 'loading')?.at;
  expect(raisingAt, 'the town never published a raising phase').toBeDefined();
  const playableAt = phases.find(({ label, state, at }) => label === 'the town' && state === 'ready' && at > (raisingAt ?? 0))?.at;
  expect(playableAt, 'the town never published itself playable').toBeDefined();

  const music = (await page.evaluate(() => window.__assetDietAudio)).filter(({ url }) => isMusicRequest(url));
  const earlyMusic = music.filter(({ at }) => at < (playableAt ?? 0)).map(({ url, at }) => `${url.split('/').pop()} at ${at} ms (playable at ${playableAt} ms)`);
  expect(earlyMusic, 'a music track was fetched before the first town was playable').toEqual([]);

  // PRESENCE, not just absence: a deferral that never ends is a mute, not a saving.
  await expect
    .poll(async () => (await page.evaluate(() => window.__assetDietAudio)).filter(({ url }) => isMusicRequest(url)).length, { timeout: 30_000 })
    .toBeGreaterThan(0);
  await cdp.detach();
  expectNoConsoleErrors(watch);
});

test('honest town cues appear while GLBs are throttled and leave at ready', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.addInitScript(observeLoadingCues);
  const cdp = await throttleGlbs(page, testInfo.project.use.baseURL);
  const cue = page.getByTestId('asset-loading-cue');

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  await expect.poll(() => page.evaluate(() => window.__assetDietCues.some(({ text }) => /^the town is raising… \d+\/\d+$/.test(text)))).toBe(true);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-town-throttled.png`) });
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();

  await page.getByTestId('town-exit').click();
  await page.evaluate(() => { window.__assetDietCues = []; });
  await page.getByTestId('start-menu-enter-town').click();
  await expect.poll(() => page.evaluate(() => window.__assetDietCues.some(({ text, ready }) => /^the town is raising… \d+\/\d+$/.test(text) && ready === '0'))).toBe(true);
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();
  await cdp.detach();
  expectNoConsoleErrors(watch);
});

// Fresh context: town prefetch can warm Claim's GLBs before navigation and erase its cold cue.
// Full built bundle only: the Claim debug door is deliberately stripped from GR_RELEASE=e1.
test('honest claim cue appears while GLBs are throttled and leaves at ready', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.addInitScript(observeLoadingCues);
  const cdp = await throttleGlbs(page, testInfo.project.use.baseURL);
  const cue = page.getByTestId('asset-loading-cue');
  await page.goto('/?debug&era=1&contract=the-claim&nowaves&nolevel&nokill&nopause&tier=full&seed=asset-diet-cue');
  await expect.poll(() => page.evaluate(() => window.__assetDietCues.some(({ text }) => /^the claim is raising… \d+\/\d+$/.test(text)))).toBe(true);
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
    const townTransfer = startTownTransferMeasurements(armPage);
    await armPage.goto('/?town3dPilot=all&tier=full');
    if (options.prefetchWait) {
      await expect(armPage.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-town-state', 'ready', { timeout: 45_000 });
    }
    await armPage.getByTestId('start-menu-enter-town').click();
    await waitForTownAssets(armPage);
    const cueWindowResponses = townTransfer.sampleCueWindowResponses();
    const settled = await townTransfer.settle();
    await cdp.detach();
    return { cueWindowResponses, settled };
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
  const decomposition: Array<{ prefetchWait: boolean; cacheDisabled: boolean; measurements: TownTransferMeasurements }> = [];
  for (const prefetchWait of [false, true]) {
    for (const cacheDisabled of [false, true]) {
      const arm = await createArm(false);
      const measurements = await measureTown(arm.page, { prefetchWait, cacheDisabled });
      expectNoConsoleErrors(arm.watch, `normal prefetchWait=${prefetchWait} cacheDisabled=${cacheDisabled}`);
      await arm.context.close();
      decomposition.push({ prefetchWait, cacheDisabled, measurements });
    }
  }
  const byUrl = (responses: TownResponse[]) => responses.reduce((urls, response) => {
    urls.set(response.url, (urls.get(response.url) ?? 0) + response.bytes);
    return urls;
  }, new Map<string, number>());
  const normalCueStats = responseStats(normal.cueWindowResponses);
  const saveDataCueStats = responseStats(saveData.cueWindowResponses);
  const normalCueWindowBytes = normalCueStats.totalBytes;
  const saveDataCueWindowBytes = saveDataCueStats.totalBytes;
  const decompositionBytes = decomposition.map((cell) => ({
    ...cell,
    cueStats: responseStats(cell.measurements.cueWindowResponses),
    settledStats: responseStats(cell.measurements.settled.responses),
  }));
  const decompositionBaseline = decompositionBytes.find((cell) => !cell.prefetchWait && !cell.cacheDisabled)?.settledStats.totalBytes;
  if (decompositionBaseline === undefined) throw new Error('missing town-budget decomposition baseline');
  const normalByUrl = byUrl(normal.settled.responses);
  const saveDataByUrl = byUrl(saveData.settled.responses);
  const changedUrls = [...new Set([...normalByUrl.keys(), ...saveDataByUrl.keys()])]
    .map((url) => [url, normalByUrl.get(url) ?? 0, saveDataByUrl.get(url) ?? 0] as const)
    .filter(([, normalUrlBytes, saveDataUrlBytes]) => normalUrlBytes !== saveDataUrlBytes)
    .sort((left, right) => Math.max(right[1], right[2]) - Math.max(left[1], left[2]));
  const rows = changedUrls.map(([url, normalUrlBytes, saveDataUrlBytes]) =>
    `| ${url.replaceAll('|', '\\|')} | ${normalUrlBytes} | ${saveDataUrlBytes} | ${normalUrlBytes - saveDataUrlBytes} |`);
  const cueTestMeasurementsMeasuredInThisRun = cueTestMeasurementsByProject.has(testInfo.project.name);
  const cueTestArtifactPath = path.join(ARTIFACT_DIR, `town-transfer-${testInfo.project.name}.json`);
  // F-1629-1: map hit = this run's cue test measured it; clean map miss = committed town-transfer-<project>.json.
  const cueTestMeasurements = cueTestMeasurementsByProject.get(testInfo.project.name)
    ?? JSON.parse(await readFile(cueTestArtifactPath, 'utf8')) as TownTransferMeasurements;
  const cueTestMeasurementProvenance = cueTestMeasurementsMeasuredInThisRun
    ? 'measured in this run'
    : await matchesCommittedFile(cueTestArtifactPath)
      ? 'read from the committed artifact'
      : 'read from the on-disk fallback artifact (not measured in this run)';
  const cueTestStats = responseStats(cueTestMeasurements.cueWindowResponses);
  const settledMeasurements = [
    { label: 'cue test', measurement: cueTestMeasurements.settled },
    { label: 'normal', measurement: normal.settled },
    { label: 'saveData', measurement: saveData.settled },
    ...decompositionBytes.map((cell) => ({
      label: `prefetchWait=${cell.prefetchWait}, cacheDisabled=${cell.cacheDisabled}`,
      measurement: cell.measurements.settled,
    })),
  ];
  const settledMeasurementStats = settledMeasurements.map(({ label, measurement }) => ({ label, measurement, stats: responseStats(measurement.responses) }));
  const report = [
    `# Town byte budget — ${testInfo.project.name}`,
    '',
    '## Release-gated cue-window transfer total',
    '',
    '| Release-gated cue-window arm | provenance | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes | Headroom against 25,000,000 |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
    `| cue test | ${cueTestMeasurementProvenance} | ${cueTestStats.totalBytes} | ${cueTestStats.uniqueBytes} | ${cueTestStats.duplicateBytes} | ${TOWN_TRANSFER_CEILING_BYTES - cueTestStats.totalBytes} |`,
    '',
    '## A/B cue-window transfer totals (recorded, not release-gated)',
    '',
    '| A/B cue-window arm | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes |',
    '| --- | ---: | ---: | ---: |',
    `| normal | ${normalCueWindowBytes} | ${normalCueStats.uniqueBytes} | ${normalCueStats.duplicateBytes} |`,
    `| saveData | ${saveDataCueWindowBytes} | ${saveDataCueStats.uniqueBytes} | ${saveDataCueStats.duplicateBytes} |`,
    '',
    'Desktop normal measured 24,604,025 bytes at f1621-1 (`75632a7e3`), 26,115,186 in the f1625-1 runner, and 23,259,297 at the f1625-1 drain: a 12.3% swing across the 25,000,000 ceiling.',
    '',
    `Cue-window delta (normal - saveData): **${normalCueWindowBytes - saveDataCueWindowBytes} bytes**.`,
    '',
    '## Settled <=20 s transfer totals (recorded, not gated)',
    '',
    '| Settled arm | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled duplicate URL count | settle duration (ms) | settleCapHit |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...settledMeasurementStats.map(({ label, measurement, stats }) =>
      `| ${label} | ${stats.totalBytes} | ${stats.uniqueBytes} | ${stats.duplicateBytes} | ${stats.duplicateUrls.length} | ${measurement.settleDurationMs} | ${measurement.settleCapHit} |`),
    '',
    '### URLs fetched more than once',
    '',
    '| Settled arm | URL | fetch count |',
    '| --- | --- | ---: |',
    ...settledMeasurementStats.flatMap(({ label, stats }) => stats.duplicateUrls.length
      ? stats.duplicateUrls.map(([url, response]) => `| ${label} | ${url.replaceAll('|', '\\|')} | ${response.count} |`)
      : [`| ${label} | _none_ | 0 |`]),
    '',
    'The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.',
    '',
    '| URL | normal settled bytes | saveData settled bytes | settled delta |',
    '| --- | ---: | ---: | ---: |',
    ...rows,
    '',
    '## Normal-arm decomposition',
    '',
    '| prefetchWait | cacheDisabled | cueWindowTotalBytes | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled delta from false/false | settleCapHit |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...decompositionBytes.map((cell) =>
      `| ${cell.prefetchWait} | ${cell.cacheDisabled} | ${cell.cueStats.totalBytes} | ${cell.settledStats.totalBytes} | ${cell.settledStats.uniqueBytes} | ${cell.settledStats.duplicateBytes} | ${cell.settledStats.totalBytes - decompositionBaseline} | ${cell.measurements.settled.settleCapHit} |`),
    '',
    '## Missing or unparseable content-length audit',
    '',
    ...contentLengthAudit('Cue test — cue-window sample', cueTestMeasurements.cueWindowResponses),
    ...contentLengthAudit('Cue test — settled <=20 s capture', cueTestMeasurements.settled.responses),
    ...contentLengthAudit('A/B normal — cue-window sample', normal.cueWindowResponses),
    ...contentLengthAudit('A/B normal — settled <=20 s capture', normal.settled.responses),
    ...contentLengthAudit('A/B saveData — cue-window sample', saveData.cueWindowResponses),
    ...contentLengthAudit('A/B saveData — settled <=20 s capture', saveData.settled.responses),
    ...decompositionBytes.flatMap((cell) => contentLengthAudit(
      `A/B normal settled <=20 s cell (prefetchWait=${cell.prefetchWait}, cacheDisabled=${cell.cacheDisabled})`,
      cell.measurements.settled.responses,
    )),
  ].join('\n');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `town-budget-${testInfo.project.name}.md`), report);

  expectNoConsoleErrors(normalArm.watch, 'normal');
  expectNoConsoleErrors(saveDataArm.watch, 'saveData');
  await normalArm.context.close();
  await saveDataArm.context.close();
  // Gate only the cue test's release quantity, also asserted at its own site. The A/B cue-window
  // totals stay recorded, not release-gated: F-1627-2 measured desktop normal at 24,604,025
  // (f1621-1), 26,115,186 (f1625-1 runner), and 23,259,297 (f1625-1 drain), straddling the ceiling.
  // Refusing that flaky gate is deliberate; F-1625-4 is the open owner fork.
  // F-1629-1: the assertion message names whether it gated fresh bytes or the fallback artifact.
  expect(
    cueTestStats.totalBytes,
    `release-gated cue test bytes were ${cueTestMeasurementProvenance}`,
  ).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);
  expect(saveDataCueWindowBytes).toBeLessThanOrEqual(normalCueWindowBytes);
});
