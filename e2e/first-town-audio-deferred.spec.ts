// THE MUSIC LEAVES THE FIRST TOWN'S WINDOW — instrument and audible proof in one file.
//
// WHY. Owner, 2026-09-06: "now it loads veerrry slowly" / "are the assets optimized for size?".
// The first-town bisect (reviews/first-town-transfer-bisect.md) decomposed the window and found
// 3,010,289 B of mp3 in three responses, 13.9% of the transfer, of which the two MUSIC tracks
// (title-theme 1,800,881 B + era-e1-frontier-loop 1,200,587 B) are 3,001,468 B that cannot be
// heard until the player has gestured. The gesture that unlocks the AudioContext is normally the
// very click that enters the town, so "lazy until a gesture" — which the code already did — still
// put both files in flight alongside the town's own 21.6 MB.
//
// WHAT THIS ASSERTS. Not bytes: the release-gated byte quantity measures host speed, not payload
// (F-BUDGET-4, a 2.05x swing on one fixed build). ORDER and PRESENCE:
//   1. no music file is fetched while the scene the player is standing in still reads `loading`;
//   2. the era loop IS fetched and IS playing once the town is playable — the deferral is a delay,
//      never a mute;
//   3. the title theme still answers a gesture made on the MENU, where nothing is raising.
// The timeline each run measures is written to artifacts/first-town-audio-deferred/ so the
// before/after comparison is a file, not a memory.
//
// LINK ARM: GR_AUDIO_LINK=8mbps throttles the whole page to 8 Mbps (the bisect's slow-link arm);
// anything else is loopback. Default runs pay for loopback only.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const ARTIFACT_DIR = path.resolve('artifacts/first-town-audio-deferred');
const LINK = process.env.GR_AUDIO_LINK === '8mbps' ? '8mbps' : 'loopback';
const EIGHT_MBPS_BYTES_PER_SECOND = (8 * 1024 * 1024) / 8;

// The `music` group of src/audio/manifest.ts, by file stem. SFX and ambience are deliberately NOT
// here: a first click legitimately needs `menu-tap.mp3` (8,821 B, measured in the same window),
// and this test must not quietly grow into a ban on all audio.
const MUSIC_STEMS = ['title-theme', 'era-e1-frontier-loop', 'era-e2-steamworks-loop', 'era-e3-voltage-loop'];

type AudioFetch = { url: string; at: number; label: string; state: string; progress: string };
type LoadingPhase = { at: number; label: string; state: string; progress: string };

declare global {
  interface Window {
    __audioFetches: AudioFetch[];
    __loadingPhases: LoadingPhase[];
  }
}

/**
 * Records every mp3 fetch with the DOM's own loading state AT THE MOMENT OF THE REQUEST, and every
 * transition of that state. The second half matters: `assetLoadingState` is not monotonic — a new
 * GLTF starting after a lull publishes `loading` again — so "was the town ready when this was
 * fetched?" and "was this fetched before the town was ready?" are different questions with
 * different answers, and only the transition log tells them apart.
 */
function observeAudioFetches() {
  window.__audioFetches = [];
  window.__loadingPhases = [];
  const read = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return {
      label: canvas?.dataset.assetLoadingLabel ?? '',
      state: canvas?.dataset.assetLoadingState ?? '',
      progress: canvas?.dataset.assetLoadingProgress ?? '',
    };
  };
  const samplePhase = () => {
    const phase = read();
    const last = window.__loadingPhases.at(-1);
    if (last?.label !== phase.label || last?.state !== phase.state) {
      window.__loadingPhases.push({ at: Math.round(performance.now()), ...phase });
    }
    requestAnimationFrame(samplePhase);
  };
  requestAnimationFrame(samplePhase);
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(typeof input === 'object' && 'url' in input ? input.url : input);
    if (url.includes('.mp3')) window.__audioFetches.push({ url, at: Math.round(performance.now()), ...read() });
    return nativeFetch(input, init);
  };
}

function isMusic(url: string): boolean {
  const base = url.split('?')[0].split('/').pop() ?? url;
  return MUSIC_STEMS.some((stem) => base.startsWith(`${stem}-`) || base === `${stem}.mp3`);
}

async function throttleLink(page: Page) {
  if (LINK !== '8mbps') return undefined;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 20,
    downloadThroughput: EIGHT_MBPS_BYTES_PER_SECOND,
    uploadThroughput: EIGHT_MBPS_BYTES_PER_SECOND,
  });
  return cdp;
}

async function waitForTownAssets(page: Page) {
  await expect.poll(async () => Number(await page.locator('#game-canvas').getAttribute('data-asset-loading-total')), { timeout: 90_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 90_000 }).toBe('ready');
}

// Same seed as e2e/asset-diet.spec.ts: without a profile the boot shows the profile screen, not the
// start menu, and every `start-menu-*` locator waits forever on the wrong page.
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

test(`music is fetched only after the first town is playable (${LINK})`, async ({ page }, testInfo) => {
  test.setTimeout(LINK === '8mbps' ? 240_000 : 120_000);
  const watch = watchErrors(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.addInitScript(observeAudioFetches);

  const responses: Array<{ url: string; bytes: number; at: number }> = [];
  const startedAt = Date.now();
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.protocol === 'blob:') return;
    responses.push({
      url: `${url.pathname}${url.search}`,
      bytes: Number(response.headers()['content-length'] ?? 0),
      at: Date.now() - startedAt,
    });
  });

  const cdp = await throttleLink(page);
  await page.goto('/?town3dPilot=all&tier=full');
  const navigatedAt = Date.now() - startedAt;
  await page.getByTestId('start-menu-enter-town').click();
  const clickedAt = Date.now() - startedAt;
  await waitForTownAssets(page);
  const townReadyAt = Date.now() - startedAt;

  const cueWindow = [...responses];
  // Recorded, NOT asserted — F-AUDIO-4. This window's end is OBSERVED by polling a DOM attribute
  // over CDP, so its boundary is fuzzy by up to one poll interval: measured at 8 Mbps, the page
  // published `ready` at 5,883 ms and this poll saw it at 6,449 ms, a 507 ms skirt. A fetch the
  // cure releases the instant the town is playable therefore lands "inside" a window that had
  // already closed. The invariant below is asserted on the PAGE's own clock instead, where the
  // question has an exact answer.
  const cueWindowMusic = cueWindow.filter(({ url }) => isMusic(url));

  // The era loop must still arrive — deferral is a delay, never a mute.
  await expect
    .poll(() => page.evaluate(() => (window.__GR_AUDIO_DIAGNOSTICS__?.loops ?? []).some((loop) => loop.startsWith('era-'))), { timeout: 30_000 })
    .toBe(true);
  const afterReady = responses.filter(({ at, url }) => at > townReadyAt && isMusic(url));
  const audioFetches = await page.evaluate(() => window.__audioFetches);
  const loadingPhases = await page.evaluate(() => window.__loadingPhases);
  const duringTheRaising = audioFetches.filter(({ label, state, url }) => label === 'the town' && state === 'loading' && isMusic(url));
  // The page's own clock. `assetLoadingState` is not monotonic (a GLTF starting after a lull
  // republishes `loading`), so "playable" is the first `ready` AFTER the town began raising.
  const townRaisingAt = loadingPhases.find(({ label, state }) => label === 'the town' && state === 'loading')?.at;
  const townPlayableAt = townRaisingAt === undefined
    ? undefined
    : loadingPhases.find(({ label, state, at }) => label === 'the town' && state === 'ready' && at > townRaisingAt)?.at;
  const musicBeforePlayable = audioFetches.filter(({ url, at }) => isMusic(url) && (townPlayableAt === undefined || at < townPlayableAt));
  const musicFetched = audioFetches.filter(({ url }) => isMusic(url));

  const timeline = {
    project: testInfo.project.name,
    link: LINK,
    bundle: process.env.GR_ASSET_DIET_BUNDLE === '1',
    navigatedAtMs: navigatedAt,
    clickedAtMs: clickedAt,
    townReadyAtMs: townReadyAt,
    cueWindow: {
      responses: cueWindow.length,
      bytes: cueWindow.reduce((sum, response) => sum + response.bytes, 0),
      mp3: cueWindow.filter(({ url }) => url.includes('.mp3')).map(({ url, bytes, at }) => ({ url, bytes, at })),
    },
    townRaisingAtMs: townRaisingAt,
    townPlayableAtMs: townPlayableAt,
    afterTownReady: { music: afterReady },
    musicFetchedWhileTownRaising: duringTheRaising,
    musicFetchedBeforeTownPlayable: musicBeforePlayable,
    audioFetches,
    loadingPhases,
  };
  await writeFile(path.join(ARTIFACT_DIR, `timeline-${testInfo.project.name}-${LINK}.json`), `${JSON.stringify(timeline, null, 2)}\n`);
  console.info(`[audio-defer] ${testInfo.project.name}/${LINK} cue ${timeline.cueWindow.responses} responses ${timeline.cueWindow.bytes} bytes; townReady observed ${townReadyAt} ms, published ${townPlayableAt} ms; cue-window music ${cueWindowMusic.length}; music before playable ${musicBeforePlayable.length}; after-ready music ${afterReady.length}`);
  for (const music of musicFetched) console.info(`[audio-defer] ${testInfo.project.name}/${LINK} music fetch ${music.url.split('/').pop()} at ${music.at} ms (scene ${music.label || '-'} ${music.state || '-'})`);
  for (const mp3 of timeline.cueWindow.mp3) console.info(`[audio-defer] ${testInfo.project.name}/${LINK} cue-window mp3 ${mp3.url} ${mp3.bytes} B at ${mp3.at} ms`);
  for (const mp3 of afterReady) console.info(`[audio-defer] ${testInfo.project.name}/${LINK} after-ready mp3 ${mp3.url} ${mp3.bytes} B at ${mp3.at} ms`);

  expect(townPlayableAt, 'the town never published a ready phase after it started raising').toBeDefined();
  expect(duringTheRaising, 'a music file was fetched while the town was still raising').toEqual([]);
  expect(musicBeforePlayable, 'a music file was fetched before the town published itself playable').toEqual([]);
  expect(musicFetched.length, 'no music was fetched at all — the deferral muted the game').toBeGreaterThan(0);
  await cdp?.detach();
  expectNoConsoleErrors(watch);
});

test('the title theme answers a gesture made on the menu', async ({ page }) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  await page.addInitScript(observeAudioFetches);
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  expect(await page.evaluate(() => window.__audioFetches.length), 'audio fetched before any gesture').toBe(0);

  await page.getByTestId('start-menu-settings').click();
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.unlocked)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops), { timeout: 30_000 }).toContain('title-theme');
  expectNoConsoleErrors(watch);
});

test('the era loop plays in the town after the entering click', async ({ page }) => {
  test.setTimeout(120_000);
  const watch = watchErrors(page);
  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  await waitForTownAssets(page);
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.unlocked), { timeout: 30_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops), { timeout: 30_000 }).toContain('era-e1-frontier-loop');
  // `startedBySound`, not `loopElapsedSeconds`. F-AUDIO-2 (measured on the uncured tree, 2026-09-06):
  // the diagnostics object is only republished when an audio event happens, and a quiet town has
  // none after the loop starts, so `loopElapsedSeconds` sits at the value it had when the loop
  // began and reads 0 for as long as you poll it. It is a snapshot, not a clock. This counter is
  // incremented immediately after `source.start()`, so it proves the buffer decoded and a real
  // source is running — which is the audible claim.
  await expect
    .poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.startedBySound?.['era-e1-frontier-loop'] ?? 0), { timeout: 30_000 })
    .toBeGreaterThan(0);
  expectNoConsoleErrors(watch);
});
