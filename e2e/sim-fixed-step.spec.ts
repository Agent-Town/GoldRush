import { expect, test, type Browser, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TimelineEntry = {
  tick: number;
  time: number;
  enemies: number;
  bolts: number;
  blasts: number;
  goldPickups: number;
  xpMotes: number;
  wave: number;
  economyLog: number;
  prospectorX: number;
  prospectorZ: number;
  prospectorWorking: boolean;
};
type ScheduleResult = {
  fps: number;
  renderFrames: number;
  simTicks: number;
  loop: {
    fixed: boolean;
    stepSeconds: number;
    totalSteps: number;
    droppedSeconds: number;
    droppedTicks: number;
  };
  economyHash: string;
  economyLogLength: number;
  timeline: TimelineEntry[];
  errors: ErrorBucket;
};

const SEED = 'sim-fixed-step-render-schedules';
const SIM_SECONDS = 10;

test('30/60/144 fps render schedules produce the same 300-tick simulation', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves the render-schedule invariant');
  test.setTimeout(120_000);

  const results: ScheduleResult[] = [];
  for (const fps of [30, 60, 144]) results.push(await runSchedule(browser, fps));

  for (const result of results) {
    expect(result.renderFrames).toBe(SIM_SECONDS * result.fps);
    expect(result.simTicks).toBe(SIM_SECONDS * 30);
    expect(result.timeline).toHaveLength(SIM_SECONDS * 30);
    expect(result.loop.fixed).toBe(true);
    expect(result.loop.stepSeconds).toBeCloseTo(1 / 30, 12);
    expect(result.loop.totalSteps).toBe(SIM_SECONDS * 30);
    expect(result.loop.droppedSeconds).toBe(0);
    expect(result.loop.droppedTicks).toBe(0);
    expect(result.economyLogLength).toBeGreaterThan(1);
    expect(result.errors.consoleErrors).toEqual([]);
    expect(result.errors.pageErrors).toEqual([]);
  }

  const evidence = results.map(({ fps, renderFrames, simTicks, economyHash, economyLogLength, loop }) => ({
    fps,
    renderFrames,
    simTicks,
    economyHash,
    economyLogLength,
    loop,
  }));
  await testInfo.attach('sim-fixed-step-render-schedules.json', {
    body: `${JSON.stringify(evidence, null, 2)}\n`,
    contentType: 'application/json',
  });
  console.log(`[sim-fixed-step] ${JSON.stringify(evidence)}`);

  expect(results[1]!.economyHash).toBe(results[0]!.economyHash);
  expect(results[2]!.economyHash).toBe(results[0]!.economyHash);
  expect(results[1]!.timeline).toEqual(results[0]!.timeline);
  expect(results[2]!.timeline).toEqual(results[0]!.timeline);
});

test('144 fps presentation interpolates hero motion between fixed ticks', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves visual interpolation');
  const errors = collectErrors(page);
  await openGame(page);
  await page.keyboard.down('KeyD');
  const result = await captureHeroRenderChanges(page, 2, 144);
  await page.keyboard.up('KeyD');

  expect(result.run.simTicks).toBe(60);
  expect(result.run.renderFrames).toBe(288);
  expect(result.interpolatedFrames).toBeGreaterThan(0);
  expect(result.renderPositionChanges).toBeGreaterThan(result.simPositionChanges);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('paused fixed ticks keep the last rendered hero position stable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves paused snapshots collapse');
  const errors = collectErrors(page);
  await openGame(page);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyD');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.paused === true);

  const positions = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    const seen = new Set<string>();
    const descriptor = Object.getOwnPropertyDescriptor(window, '__THREE_GAME_DIAGNOSTICS__');
    let current = window.__THREE_GAME_DIAGNOSTICS__;
    Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', {
      configurable: true,
      get: () => current,
      set: (next: ThreeGameDiagnostics | undefined) => {
        current = next;
        if (next) seen.add(`${next.heroRenderPos.x.toFixed(6)},${next.heroRenderPos.z.toFixed(6)}`);
      },
    });
    try {
      harness.driveRenderSchedule(0.5, 144);
    } finally {
      if (descriptor) Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', descriptor);
      else {
        delete (window as Partial<Window>).__THREE_GAME_DIAGNOSTICS__;
        window.__THREE_GAME_DIAGNOSTICS__ = current;
      }
    }
    return [...seen];
  });

  expect(positions).toHaveLength(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('a stalled frame runs at most five ticks and reports dropped time', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves the catch-up clamp');
  const errors = collectErrors(page);
  await openGame(page);

  const result = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.resetRun();
    harness.setManualSim(true);
    return harness.driveRenderSchedule(1, 1);
  });

  expect(result.renderFrames).toBe(1);
  expect(result.simTicks).toBe(5);
  expect(result.loop.totalSteps).toBe(5);
  expect(result.loop.droppedTicks).toBe(25);
  expect(result.loop.droppedSeconds).toBeCloseTo(25 / 30, 12);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('lethal contact ends the tick before XP and gold pickups mutate the run', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves the death boundary');
  const errors = collectErrors(page);
  await openGame(page);

  const result = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.resetRun();
    harness.setManualSim(true);
    const { x, z } = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
    const goldSpawned = harness.spawnGoldPickup(x, z, 17);
    const xpSpawned = harness.spawnXpMote(x, z, 7);
    harness.spawnPack(1, 0, { speedScale: 0, hpScale: 1_000, contactDamageScale: 100 });
    harness.advanceSim(1 / 30);
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      goldSpawned,
      xpSpawned,
      state: diagnostics.state,
      gold: diagnostics.economy.gold,
      xp: diagnostics.xp,
      xpMotes: diagnostics.xpMotesAlive,
      goldPickups: harness.goldPickups().filter((pickup) => pickup.active),
    };
  });

  expect(result.goldSpawned).toBe(true);
  expect(result.xpSpawned).toBe(true);
  expect(result.state).toBe('dead');
  expect(result.gold).toBe(0);
  expect(result.xp).toBe(0);
  expect(result.xpMotes).toBe(1);
  expect(result.goldPickups).toEqual([{ active: true, amount: 17, position: expect.any(Object) }]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('scripted waypoint arrival uses planar distance despite visual height', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves planar arrival');
  const errors = collectErrors(page);
  await openGame(page);

  const result = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.resetRun();
    harness.setManualSim(true);
    const start = { x: 10, z: 10 };
    const target = { x: start.x + 0.01, z: start.z };
    harness.clearEnemies();
    harness.scriptEnemyAt(start.x, start.z, target.x, target.z, 1);
    const snapshot = harness.captureSuspend() as any;
    const enemy = snapshot.enemies.active[0];
    enemy.scriptedIgnoresTerrain = true;
    enemy.scriptedTarget.y = enemy.position.y + 1;
    const restored = harness.restoreSuspend(snapshot);
    harness.advanceSim(0.2);
    const arrived = harness.enemyPositions()[0]!;
    return {
      restored,
      verticalGap: Math.abs(enemy.position.y - enemy.scriptedTarget.y),
      target,
      arrived: { x: arrived.x, z: arrived.z },
    };
  });

  expect(result.restored).toBe(true);
  expect(result.verticalGap).toBeGreaterThan(0.05);
  expect(result.arrived.x).toBeCloseTo(result.target.x, 8);
  expect(result.arrived.z).toBeCloseTo(result.target.z, 8);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('fixed ticks carry fractional cooldown debt instead of losing volleys', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves cooldown accounting');
  const errors = collectErrors(page);
  await openGame(page);

  const result = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.resetRun();
    harness.setManualSim(true);
    harness.setBalance('sparkRig.fireRate', 7);
    harness.setBalance('sparkRig.damage', 0);
    harness.setUpgradeStacks({});
    harness.spawnPack(1, 4, { speedScale: 0, hpScale: 1000 });
    const run = harness.driveRenderSchedule(10, 144);
    return { run, shots: harness.state().combat.shots.bolt };
  });

  expect(result.run.simTicks).toBe(300);
  expect(result.shots).toBe(71);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Baron ceremony completion is independent of render cadence', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one browser proves the fixed-tick ceremony clock');
  test.setTimeout(120_000);

  for (const fps of [30, 60, 144]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = collectErrors(page);
    try {
      await page.goto(`/?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&seed=${SEED}-${fps}`);
      await expect(page.locator('#game-canvas')).toBeVisible();
      await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
      await page.evaluate((renderFps) => {
        const harness = window.__GR_TEST__!;
        harness.setManualSim(true);
        harness.resetRun();
        harness.setManualSim(true);
        harness.driveRenderSchedule(0, renderFps);
        for (const [key, value] of Object.entries({
          'enemy.hp': 1,
          'sparkRig.damage': 9999,
          'sparkRig.fireRate': 60,
          'sparkRig.range': 300,
          'sparkRig.boltRadius': 5,
          'sparkRig.boltSpeed': 18,
          'sparkRig.boltLife': 3,
        })) {
          harness.setBalance(key, value);
        }
        harness.setUpgradeStacks({});
        harness.setWave(20);
        harness.spawnPack(1, 5, { eliteKind: 'baron', hpScale: 1, speedScale: 0, visualScale: 4, banner: true });
      }, fps);

      for (let attempt = 0; attempt < 40; attempt += 1) {
        await page.evaluate((renderFps) => window.__GR_TEST__!.driveRenderSchedule(1 / 30, renderFps), fps);
        if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? false)) break;
      }
      await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? false)).resolves.toBe(true);

      const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.timeAlive);
      await page.evaluate((renderFps) => window.__GR_TEST__!.driveRenderSchedule(2, renderFps), fps);
      await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? false)).resolves.toBe(true);
      await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.timeAlive)).resolves.toBe(before);

      await page.evaluate((renderFps) => window.__GR_TEST__!.driveRenderSchedule(0.3, renderFps), fps);
      await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony.active ?? true)).resolves.toBe(false);
      expect(errors.consoleErrors).toEqual([]);
      expect(errors.pageErrors).toEqual([]);
    } finally {
      await context.close();
    }
  }
});

async function runSchedule(browser: Browser, fps: number): Promise<ScheduleResult> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = collectErrors(page);
  try {
    await openGame(page);
    const result = await page.evaluate(
      ({ seconds, renderFps }) => {
        const harness = window.__GR_TEST__!;
        harness.setManualSim(true);
        harness.resetRun();
        harness.setManualSim(true);
        harness.setBalance('enemy.contactDamage', 0);
        const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active);
        if (node) harness.teleport(node.position.x, node.position.z);

        const timeline: TimelineEntry[] = [];
        const descriptor = Object.getOwnPropertyDescriptor(window, '__THREE_GAME_DIAGNOSTICS__');
        let current = window.__THREE_GAME_DIAGNOSTICS__;
        let lastTick = 0;
        Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', {
          configurable: true,
          get: () => current,
          set: (next: ThreeGameDiagnostics | undefined) => {
            current = next;
            if (!next || next.simulation.tick === lastTick) return;
            lastTick = next.simulation.tick;
            timeline.push({
              tick: next.simulation.tick,
              time: round(next.timeAlive, 3),
              enemies: next.enemiesAlive,
              bolts: next.boltsAlive,
              blasts: next.arsenal.blastsAlive,
              goldPickups: next.steal.pickups,
              xpMotes: next.xpMotesAlive,
              wave: next.wave,
              economyLog: next.economy.logLength,
              prospectorX: next.agent.embodiment.position.x,
              prospectorZ: next.agent.embodiment.position.z,
              prospectorWorking: next.agent.embodiment.working,
            });
          },
        });

        let run: ReturnType<typeof harness.driveRenderSchedule>;
        try {
          run = harness.driveRenderSchedule(seconds, renderFps);
        } finally {
          if (descriptor) Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', descriptor);
          else {
            delete (window as Partial<Window>).__THREE_GAME_DIAGNOSTICS__;
            window.__THREE_GAME_DIAGNOSTICS__ = current;
          }
        }

        const economyLog = harness.economyLog();
        const economy = harness.summarizeLog(economyLog);
        return {
          ...run,
          economyHash: hashText(stableStringify({ economy, logLength: economyLog.length })),
          economyLogLength: economyLog.length,
          timeline,
        };

        function round(value: number, places: number): number {
          const scale = 10 ** places;
          return Math.round(value * scale) / scale;
        }

        function stableStringify(value: unknown): string {
          if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
          if (typeof value !== 'object' || value === null) return JSON.stringify(value);
          const record = value as Record<string, unknown>;
          return `{${Object.keys(record)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
            .join(',')}}`;
        }

        function hashText(text: string): string {
          let hash = 2166136261;
          for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
        }
      },
      { seconds: SIM_SECONDS, renderFps: fps },
    );
    return { fps, ...result, errors };
  } finally {
    await context.close();
  }
}

async function captureHeroRenderChanges(page: Page, seconds: number, fps: number) {
  return page.evaluate(
    ({ duration, renderFps }) => {
      const harness = window.__GR_TEST__!;
      harness.setManualSim(true);
      harness.resetRun();
      harness.setManualSim(true);
      let current = window.__THREE_GAME_DIAGNOSTICS__;
      let lastRenderPosition = '';
      let lastSimPosition = '';
      let renderPositionChanges = 0;
      let simPositionChanges = 0;
      let interpolatedFrames = 0;
      const descriptor = Object.getOwnPropertyDescriptor(window, '__THREE_GAME_DIAGNOSTICS__');
      Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', {
        configurable: true,
        get: () => current,
        set: (next: ThreeGameDiagnostics | undefined) => {
          current = next;
          if (!next) return;
          const renderPosition = `${next.heroRenderPos.x.toFixed(6)},${next.heroRenderPos.z.toFixed(6)}`;
          const simPosition = `${next.heroPos.x.toFixed(6)},${next.heroPos.z.toFixed(6)}`;
          if (lastRenderPosition && renderPosition !== lastRenderPosition) renderPositionChanges += 1;
          if (lastSimPosition && simPosition !== lastSimPosition) simPositionChanges += 1;
          if (renderPosition !== simPosition) interpolatedFrames += 1;
          lastRenderPosition = renderPosition;
          lastSimPosition = simPosition;
        },
      });
      let run: ReturnType<typeof harness.driveRenderSchedule>;
      try {
        run = harness.driveRenderSchedule(duration, renderFps);
      } finally {
        if (descriptor) Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', descriptor);
        else {
          delete (window as Partial<Window>).__THREE_GAME_DIAGNOSTICS__;
          window.__THREE_GAME_DIAGNOSTICS__ = current;
        }
      }
      return { run, renderPositionChanges, simPositionChanges, interpolatedFrames };
    },
    { duration: seconds, renderFps: fps },
  );
}

async function openGame(page: Page): Promise<void> {
  await page.goto(`/?debug&nolevel&nopause&seed=${SEED}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
