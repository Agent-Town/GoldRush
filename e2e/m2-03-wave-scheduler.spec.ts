import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SpawnEvent = { time: number; total: number; wave: number; next: number };
type BannerEvent = { time: number; at: number; text: string; total: number };
type WaveTrack = { spawns: SpawnEvent[]; banners: BannerEvent[]; lastTotal: number; lastText: string; lastAt: number };
type TimerTrack = {
  maxError: number;
  samples: number;
  last: { time: number; next: number; wave: number } | null;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setWaveBalance(page: Page, values: Record<string, number>): Promise<void> {
  await page.evaluate((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      if (!window.__GR_TEST__?.setBalance(`waves.${key}`, value)) {
        throw new Error(`Failed to set waves.${key}`);
      }
    }
    window.__GR_TEST__?.resetRun();
  }, values);
}

async function installWaveTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __m203WaveTrack: WaveTrack };
    const state = window.__THREE_GAME_DIAGNOSTICS__;
    w.__m203WaveTrack = {
      spawns: [],
      banners: [],
      lastTotal: state?.waveSpawnedTotal ?? 0,
      lastText: state?.ui?.announcement ?? '',
      lastAt: state?.ui?.announcementAt ?? -1,
    };

    const tick = () => {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__;
      if (snapshot) {
        const track = w.__m203WaveTrack;
        if (snapshot.waveSpawnedTotal !== track.lastTotal) {
          track.spawns.push({
            time: snapshot.timeAlive,
            total: snapshot.waveSpawnedTotal,
            wave: snapshot.wave,
            next: snapshot.nextWaveInSim,
          });
          track.lastTotal = snapshot.waveSpawnedTotal;
        }

        const text = snapshot.ui?.announcement ?? '';
        const at = snapshot.ui?.announcementAt ?? -1;
        if (text && (text !== track.lastText || at !== track.lastAt)) {
          track.banners.push({ time: snapshot.timeAlive, at, text, total: snapshot.waveSpawnedTotal });
          track.lastText = text;
          track.lastAt = at;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function installTimerTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __m203TimerTrack: TimerTrack };
    w.__m203TimerTrack = { maxError: 0, samples: 0, last: null };

    const tick = () => {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__;
      if (snapshot) {
        const track = w.__m203TimerTrack;
        const current = { time: snapshot.timeAlive, next: snapshot.nextWaveInSim, wave: snapshot.wave };
        if (track.last && current.wave === track.last.wave && current.next <= track.last.next + 0.001) {
          const timeDelta = current.time - track.last.time;
          const timerDelta = track.last.next - current.next;
          track.maxError = Math.max(track.maxError, Math.abs(timeDelta - timerDelta));
          track.samples += 1;
        }
        track.last = current;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function waveTrack(page: Page): Promise<WaveTrack> {
  return page.evaluate(() => (window as unknown as { __m203WaveTrack: WaveTrack }).__m203WaveTrack);
}

function expectedBudget(wave: number, balance: Record<string, number>): number {
  const linear = balance.pulseBase + balance.pulsePerWave * wave;
  if (wave <= balance.kneeWave) return Math.max(1, Math.round(linear));

  const kneeBudget = balance.pulseBase + balance.pulsePerWave * balance.kneeWave;
  const ceiling = Math.max(kneeBudget, balance.budgetCeiling);
  const excess = Math.max(0, linear - kneeBudget);
  const eased = ceiling - (ceiling - kneeBudget) * Math.exp(-excess / Math.max(0.01, balance.kneeSharpness));
  return Math.max(1, Math.round(Math.min(ceiling, eased)));
}

function expectedCumulative(wave: number, balance: Record<string, number>): number {
  let total = 0;
  for (let i = 1; i <= wave; i += 1) total += expectedBudget(i, balance);
  return total;
}

test('spawn accounting follows the knee budget at waves 8, 10, and 14', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&seed=m2-03-knee');
  const balance = {
    waveInterval: 3,
    trickleInterval: 9999,
    pulseBase: 0,
    pulsePerWave: 0.5,
    kneeWave: 10,
    kneeSharpness: 1.5,
    budgetCeiling: 7,
    lullSeconds: 1,
    pulsesPerWave: 1,
    edgesPerPulse: 1,
    aliveCap: 96,
  };
  await setWaveBalance(page, balance);
  await installWaveTracker(page);

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(14);
  const track = await waveTrack(page);
  for (const wave of [8, 10, 14]) {
    const event = track.spawns.find((spawn) => spawn.wave === wave);
    expect(event?.total).toBe(expectedCumulative(wave, balance));
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('lull window stays spawn-free between scheduled pulses', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=4&nokill&nolevel&seed=m2-03-lull');
  await setWaveBalance(page, {
    waveInterval: 14,
    trickleInterval: 9999,
    pulseBase: 4,
    pulsePerWave: 0,
    kneeWave: 10,
    kneeSharpness: 4,
    budgetCeiling: 4,
    lullSeconds: 4,
    pulsesPerWave: 2,
    edgesPerPulse: 1,
  });
  await installWaveTracker(page);

  await page.waitForFunction(() => {
    const track = (window as unknown as { __m203WaveTrack: WaveTrack }).__m203WaveTrack;
    return track.spawns.length >= 2;
  });
  const track = await waveTrack(page);
  const first = track.spawns[0];
  const second = track.spawns[1];
  expect(second.time - first.time).toBeGreaterThanOrEqual(3.95);
  expect(track.spawns.slice(1, -1)).toEqual([]);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('edge telegraphs precede the pulse spawn', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=2&nokill&nolevel&seed=m2-03-telegraph');
  await setWaveBalance(page, {
    waveInterval: 8,
    trickleInterval: 9999,
    pulseBase: 4,
    pulsePerWave: 0,
    kneeWave: 10,
    kneeSharpness: 4,
    budgetCeiling: 4,
    lullSeconds: 4,
    pulsesPerWave: 1,
    edgesPerPulse: 2,
  });
  await installWaveTracker(page);

  await page.waitForFunction(() => {
    const track = (window as unknown as { __m203WaveTrack: WaveTrack }).__m203WaveTrack;
    return track.spawns.length >= 1 && track.banners.filter((event) => /(north|south|east|west)/i.test(event.text)).length >= 2;
  });
  const track = await waveTrack(page);
  const firstSpawn = track.spawns[0];
  const banners = track.banners.filter((event) => /(north|south|east|west)/i.test(event.text));
  expect(banners).toHaveLength(2);
  for (const banner of banners) {
    expect(banner.time).toBeLessThan(firstSpawn.time);
    expect(banner.at).toBeLessThan(firstSpawn.time);
    expect(banner.total).toBe(0);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('next-wave timer stays locked to sim time across three waves', async ({ page }) => {
  // s16 retro-gate: on slow VMs the 30s default only reaches wave 2 in-window,
  // so the cross-wave drift assert below never evaluated (proof-of-innocence in
  // reviews/vp-02-retro-gate.md). Give the three-wave window room to complete.
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=6&nokill&nolevel&seed=m2-03-timer');
  await setWaveBalance(page, {
    waveInterval: 8,
    trickleInterval: 9999,
    pulseBase: 2,
    pulsePerWave: 0,
    kneeWave: 10,
    kneeSharpness: 4,
    budgetCeiling: 2,
    lullSeconds: 4,
    pulsesPerWave: 1,
    edgesPerPulse: 1,
  });
  await installTimerTracker(page);

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(3);
  const track = await page.evaluate(() => (window as unknown as { __m203TimerTrack: TimerTrack }).__m203TimerTrack);
  expect(track.samples).toBeGreaterThan(10);
  expect(track.maxError).toBeLessThan(0.08);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
