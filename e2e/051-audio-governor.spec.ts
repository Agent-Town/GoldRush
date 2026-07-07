import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type GovernorAudio = {
  unlocked: boolean;
  missing: number;
  concurrentVoices: number;
  voiceCap: number;
  dropsPerSecond: number;
  headroomGain: number;
  loops: string[];
  loopSourceCounts: Record<string, number>;
  loopVolumes: Record<string, number>;
  startedBySound: Record<string, number>;
  droppedByFamily: Record<string, number>;
  droppedByPriority: Record<string, number>;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function openGame(page: Page, query = '?debug&timescale=6&nowaves&nolevel&seed=051-audio'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('hud-vitals')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
  return errors;
}

async function unlockAudio(page: Page): Promise<void> {
  await page.mouse.click(24, 24);
  await expect.poll(() => audio(page).then((state) => state.unlocked), { timeout: 8_000 }).toBe(true);
}

async function audio(page: Page): Promise<GovernorAudio> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio as unknown as GovernorAudio);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function placeOneSluice(page: Page): Promise<void> {
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.sluices ?? 0);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('sluice.cost', 0);
    window.__GR_TEST__?.grantGold(5000);
    window.__GR_TEST__?.teleport(0, 9);
    window.__GR_TEST__?.selectBuildable('sluice');
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false), { timeout: 8_000 }).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.sluices ?? 0), { timeout: 8_000 }).toBe(before + 1);
}

async function emulateSluiceSources(page: Page, count: number): Promise<void> {
  await page.evaluate((sources) => {
    const tick = () => {
      const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
      const first = build?.sluicePositions[0];
      if (build && first) {
        build.sluices = sources;
        build.sluicePositions = Array.from({ length: sources }, (_, index) => ({ x: first.x + index * 0.1, z: first.z }));
      }
      requestAnimationFrame(tick);
    };
    tick();
  }, count);
}

test('20-source sluice mix uses one deduped water loop with source-count scaling', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=051-sluice-loop');
  await placeOneSluice(page);
  await emulateSluiceSources(page, 20);
  await unlockAudio(page);

  await expect.poll(() => audio(page).then((state) => state.loopSourceCounts['sluice-water-loop'] ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(20);
  const state = await audio(page);
  expect(state.loops.filter((name) => name === 'sluice-water-loop')).toHaveLength(1);
  expect(state.loopVolumes['sluice-water-loop']).toBeGreaterThan(0);
  expect(state.concurrentVoices).toBeLessThanOrEqual(state.voiceCap);
  assertNoErrors(errors);
});

test('global voice cap holds and UI displaces low-priority ambience', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=051-voice-cap');
  await unlockAudio(page);

  const before = await audio(page);
  const syncState = await page.evaluate(() => {
    for (const name of ['river-ambience-loop', 'prospector-hover-loop', 'wind-gust']) {
      for (let i = 0; i < 4; i += 1) window.__GR_TEST__?.testAudio(name);
    }
    const saturated = window.__THREE_GAME_DIAGNOSTICS__?.audio as unknown as GovernorAudio;
    window.__GR_TEST__?.testAudio('ledger-open');
    const afterUi = window.__THREE_GAME_DIAGNOSTICS__?.audio as unknown as GovernorAudio;
    return {
      saturatedVoices: saturated.concurrentVoices,
      voiceCap: saturated.voiceCap,
      afterUiVoices: afterUi.concurrentVoices,
      ambientDrops: afterUi.droppedByPriority.ambient ?? 0,
      headroomGain: afterUi.headroomGain,
    };
  });

  expect(syncState.saturatedVoices).toBe(syncState.voiceCap);
  expect(syncState.afterUiVoices).toBeLessThanOrEqual(syncState.voiceCap);
  expect(syncState.ambientDrops).toBeGreaterThan(before.droppedByPriority.ambient ?? 0);
  expect(syncState.headroomGain).toBeLessThan(1);
  await expect
    .poll(() => audio(page).then((state) => state.startedBySound['ledger-open'] ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(before.startedBySound['ledger-open'] ?? 0);
  assertNoErrors(errors);
});

test('gold and hit families share global cooldowns', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=051-family-cooldown');
  await unlockAudio(page);

  await page.evaluate(() => {
    for (let i = 0; i < 8; i += 1) window.__GR_TEST__?.testAudio('gold-chime');
  });
  await expect.poll(() => audio(page).then((state) => state.droppedByFamily.gold ?? 0), { timeout: 8_000 }).toBeGreaterThan(0);

  const beforeHitDrops = (await audio(page)).droppedByFamily.hit ?? 0;
  await page.evaluate(() => {
    window.__GR_TEST__?.testAudio('spark-bolt-hit');
    window.__GR_TEST__?.testAudio('palisade-hit');
    window.__GR_TEST__?.testAudio('spark-bolt-hit');
  });
  await expect.poll(() => audio(page).then((state) => state.droppedByFamily.hit ?? 0), { timeout: 8_000 }).toBeGreaterThan(beforeHitDrops);
  expect((await audio(page)).dropsPerSecond).toBeGreaterThan(0);
  assertNoErrors(errors);
});

test('audio-absent stress releases governor slots cleanly', async ({ page }) => {
  await page.route(/\/assets\/audio\/raw\/[^?]+\.mp3$/, (route) => route.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' }));
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=051-audio-absent');
  await unlockAudio(page);

  const before = await audio(page);
  await page.evaluate(() => {
    for (let i = 0; i < 18; i += 1) window.__GR_TEST__?.testAudio(i % 2 === 0 ? 'wind-gust' : 'ledger-open');
  });

  await expect.poll(() => audio(page).then((state) => state.missing), { timeout: 8_000 }).toBeGreaterThan(before.missing);
  const after = await audio(page);
  expect(after.concurrentVoices).toBeLessThanOrEqual(after.voiceCap);
  assertNoErrors(errors);
});
