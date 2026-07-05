import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SoakSample = {
  kind: 'wave' | 'done' | 'dead';
  wave: number;
  frame: number;
  timeAlive: number;
  runState: string;
  hp: number;
  enemiesAlive: number;
  kills: number;
  drawCalls: number;
  drawCallsMin: number;
  drawCallsMax: number;
  fpsAvg: number;
  fpsP95: number;
  fpsFloor: number;
  realFrameMsMax: number;
  realFrameCount: number;
  renderer: { calls: number; triangles: number; geometries: number; textures: number };
  pools: {
    enemies: number;
    enemyCap: number;
    bolts: number;
    motes: number;
    blasts: number;
    pickups: number;
    floatTexts: number;
  };
  buildables: Record<BuildableId, number>;
};
type SoakState = {
  targetWave: number;
  done: boolean;
  failure: string | null;
  samples: SoakSample[];
  glEvents: string[];
  build: { placed: number; failed: number; index: number; total: number };
  upgradePicks: number;
};

declare global {
  interface Window {
    __GR_SOAK_30__?: SoakState;
  }
}

const targetWave = 30;
const reportPath = path.resolve('test-results/soak/soak-30.json');
const buildCaps: Record<BuildableId, number> = {
  sentry_beacon: Balance.beacon.maxCount,
  palisade: Balance.palisade.maxCount,
  sluice: Balance.sluice.maxCount,
  stockpile: Balance.stockpile.maxCount,
  turret: Balance.turret.maxCount,
};

test.describe.configure({ mode: 'serial' });

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&soak=${targetWave}&timescale=24&nopause&seed=soak-30`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function installSoakBot(page: Page): Promise<void> {
  await page.evaluate(
    ({ caps, fallbackTarget }) => {
      type Placement = { id: BuildableId; x: number; z: number };
      const target = Number(new URLSearchParams(window.location.search).get('soak') ?? fallbackTarget) || fallbackTarget;
      const placements: Placement[] = [
        { id: 'stockpile', x: -8, z: 12 },
        { id: 'stockpile', x: 8, z: 12 },
        { id: 'sluice', x: 0, z: 7 },
        { id: 'sentry_beacon', x: -7, z: 12 },
        { id: 'sentry_beacon', x: -4, z: 12 },
        { id: 'sentry_beacon', x: -1, z: 12 },
        { id: 'sentry_beacon', x: 2, z: 12 },
        { id: 'sentry_beacon', x: 5, z: 12 },
        { id: 'sentry_beacon', x: 8, z: 12 },
        { id: 'turret', x: -6, z: 15 },
        { id: 'turret', x: -2, z: 15 },
        { id: 'turret', x: 2, z: 15 },
        { id: 'turret', x: 6, z: 15 },
        { id: 'palisade', x: -5, z: 18 },
        { id: 'palisade', x: -3, z: 18 },
        { id: 'palisade', x: -1, z: 18 },
        { id: 'palisade', x: 1, z: 18 },
        { id: 'palisade', x: 3, z: 18 },
        { id: 'palisade', x: 5, z: 18 },
      ];
      const state: SoakState = {
        targetWave: target,
        done: false,
        failure: null,
        samples: [],
        glEvents: [],
        build: { placed: 0, failed: 0, index: 0, total: placements.length },
        upgradePicks: 0,
      };
      window.__GR_SOAK_30__ = state;
      window.__GR_TEST__?.grantGold(5_000);
      window.__GR_TEST__?.warmVfx();

      const canvas = document.querySelector('#game-canvas');
      canvas?.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        state.glEvents.push('webglcontextlost');
      });
      canvas?.addEventListener('webglcontextrestored', () => state.glEvents.push('webglcontextrestored'));

      let lastTs = 0;
      let lastWave = window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0;
      let callsMin = Number.POSITIVE_INFINITY;
      let callsMax = 0;
      let realFrameMsMax = 0;
      let realFrameCount = 0;
      let buildFrames = 0;

      function buildableCounts(): Record<BuildableId, number> {
        const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.buildables ?? [];
        return {
          sentry_beacon: entries.find((entry) => entry.id === 'sentry_beacon')?.count ?? 0,
          palisade: entries.find((entry) => entry.id === 'palisade')?.count ?? 0,
          sluice: entries.find((entry) => entry.id === 'sluice')?.count ?? 0,
          stockpile: entries.find((entry) => entry.id === 'stockpile')?.count ?? 0,
          turret: entries.find((entry) => entry.id === 'turret')?.count ?? 0,
        };
      }

      function sample(kind: SoakSample['kind']): void {
        const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
        if (!diagnostics) return;
        const counts = buildableCounts();
        state.samples.push({
          kind,
          wave: diagnostics.wave,
          frame: diagnostics.frame,
          timeAlive: diagnostics.timeAlive,
          runState: diagnostics.runState,
          hp: diagnostics.hp,
          enemiesAlive: diagnostics.enemiesAlive,
          kills: diagnostics.kills,
          drawCalls: diagnostics.renderer.calls,
          drawCallsMin: Number.isFinite(callsMin) ? callsMin : diagnostics.renderer.calls,
          drawCallsMax: callsMax,
          fpsAvg: diagnostics.frameMs.avg > 0 ? 1000 / diagnostics.frameMs.avg : 0,
          fpsP95: diagnostics.frameMs.p95 > 0 ? 1000 / diagnostics.frameMs.p95 : 0,
          fpsFloor: realFrameMsMax > 0 ? 1000 / realFrameMsMax : 0,
          realFrameMsMax,
          realFrameCount,
          renderer: { ...diagnostics.renderer },
          pools: {
            enemies: diagnostics.enemiesAlive,
            enemyCap: diagnostics.enemyPoolSize,
            bolts: diagnostics.boltsAlive,
            motes: diagnostics.xpMotesAlive,
            blasts: diagnostics.arsenal.blastsAlive,
            pickups: diagnostics.steal.pickups,
            floatTexts: diagnostics.vfx.activeFloatTexts,
          },
          buildables: counts,
        });
        callsMin = diagnostics.renderer.calls;
        callsMax = diagnostics.renderer.calls;
        realFrameMsMax = 0;
        realFrameCount = 0;
      }

      function pickFirstCard(): void {
        if (window.__THREE_GAME_DIAGNOSTICS__?.runState !== 'levelup') return;
        const card = document.querySelector<HTMLButtonElement>('[data-testid="upgrade-card-0"]');
        if (!card || card.disabled || card.hidden) return;
        card.click();
        state.upgradePicks += 1;
      }

      function runBuildScript(): void {
        const placement = placements[state.build.index];
        if (!placement) return;
        const before = buildableCounts()[placement.id];
        if (before >= caps[placement.id]) {
          state.build.index += 1;
          buildFrames = 0;
          return;
        }
        window.__GR_TEST__?.teleport(placement.x, placement.z + 2);
        window.__GR_TEST__?.selectBuildable(placement.id);
        if (window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid && window.__GR_TEST__?.confirmBuild()) {
          state.build.placed += 1;
          state.build.index += 1;
          buildFrames = 0;
          return;
        }
        buildFrames += 1;
        if (buildFrames > 18) {
          state.build.failed += 1;
          state.build.index += 1;
          buildFrames = 0;
        }
      }

      function kiteRing(): void {
        const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
        const time = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
        let best = { x: Math.cos(time * 0.65) * 10, z: 11 + Math.sin(time * 0.65) * 7 };
        let bestDistance = -1;
        for (let i = 0; i < 18; i += 1) {
          const angle = time * 0.35 + (i / 18) * Math.PI * 2;
          const candidate = { x: Math.cos(angle) * 10, z: 11 + Math.sin(angle) * 7 };
          let nearest = Number.POSITIVE_INFINITY;
          for (const enemy of enemies) {
            const dx = candidate.x - enemy.x;
            const dz = candidate.z - enemy.z;
            nearest = Math.min(nearest, dx * dx + dz * dz);
          }
          if (nearest > bestDistance) {
            bestDistance = nearest;
            best = candidate;
          }
        }
        window.__GR_TEST__?.teleport(best.x, best.z);
      }

      function tick(ts: number): void {
        try {
          const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
          if (!diagnostics || state.done) return;
          if (lastTs > 0) {
            const realFrameMs = ts - lastTs;
            realFrameMsMax = Math.max(realFrameMsMax, realFrameMs);
            realFrameCount += 1;
            callsMin = Math.min(callsMin, diagnostics.renderer.calls);
            callsMax = Math.max(callsMax, diagnostics.renderer.calls);
          }
          lastTs = ts;

          if (diagnostics.wave !== lastWave && diagnostics.wave > 0) {
            sample('wave');
            lastWave = diagnostics.wave;
          }
          pickFirstCard();

          if (diagnostics.runState === 'dead') {
            state.failure = `dead at wave ${diagnostics.wave}`;
            sample('dead');
            state.done = true;
            return;
          }
          if (diagnostics.wave >= target) {
            sample('done');
            state.done = true;
            return;
          }

          if (state.build.index < placements.length) runBuildScript();
          else kiteRing();
          requestAnimationFrame(tick);
        } catch (error) {
          state.failure = error instanceof Error ? error.message : String(error);
          state.done = true;
        }
      }

      requestAnimationFrame(tick);
    },
    { caps: buildCaps, fallbackTarget: targetWave },
  );
}

function sampleForWave(samples: SoakSample[], wave: number): SoakSample {
  const sample = samples.find((entry) => entry.wave >= wave);
  if (!sample) throw new Error(`Missing soak sample for wave ${wave}`);
  return sample;
}

function assertPoolCaps(sample: SoakSample): void {
  expect(sample.pools.enemies).toBeLessThanOrEqual(sample.pools.enemyCap);
  expect(sample.pools.enemyCap).toBeLessThanOrEqual(Balance.enemy.poolSize);
  expect(sample.pools.bolts).toBeLessThanOrEqual(Balance.projectile.pool);
  expect(sample.pools.motes).toBeLessThanOrEqual(Balance.xp.motePool);
  expect(sample.pools.blasts).toBeLessThanOrEqual(Balance.blast.pool);
  expect(sample.pools.pickups).toBeLessThanOrEqual(Balance.steal.pickupCap);
  expect(sample.pools.floatTexts).toBeLessThanOrEqual(12);
  for (const [id, cap] of Object.entries(buildCaps) as Array<[BuildableId, number]>) {
    expect(sample.buildables[id]).toBeLessThanOrEqual(cap);
  }
}

function assertCheckpoint(sample: SoakSample): void {
  assertPoolCaps(sample);
  expect(sample.drawCallsMin).toBeLessThanOrEqual(200);
  expect(sample.fpsFloor).toBeGreaterThanOrEqual(12);
}

async function writeReport(testInfo: TestInfo, output: unknown, name = 'soak-30-report'): Promise<void> {
  const body = `${JSON.stringify(output, null, 2)}\n`;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, body);
  await testInfo.attach(name, { body, contentType: 'application/json' });
}

test('scripted auto-play reaches wave 30 inside perf and pool envelopes', async ({ page }, testInfo: TestInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'soak harness runs once on desktop');
  test.setTimeout(180_000);
  const errors = await openGame(page);
  await installSoakBot(page);

  const deadline = Date.now() + 150_000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({
      done: window.__GR_SOAK_30__?.done === true,
      runState: window.__THREE_GAME_DIAGNOSTICS__?.runState,
    }));
    if (state.done) break;
    if (state.runState === 'levelup') {
      await page.keyboard.press('Digit1');
      await page.evaluate(() => {
        if (window.__GR_SOAK_30__) window.__GR_SOAK_30__.upgradePicks += 1;
      });
    }
    await page.waitForTimeout(250);
  }

  const report = await page.evaluate(() => window.__GR_SOAK_30__);
  await writeReport(testInfo, { report, errors });
  expect(report).toBeTruthy();
  if (!report) return;
  expect(report.done).toBe(true);

  const checkpoints = [5, 10, 15, 20, 25, 30].map((wave) => sampleForWave(report.samples, wave));
  for (const sample of checkpoints) assertCheckpoint(sample);
  const warmEnvelope = checkpoints.slice(0, 2).reduce(
    (max, sample) => ({
      geometries: Math.max(max.geometries, sample.renderer.geometries),
      textures: Math.max(max.textures, sample.renderer.textures),
    }),
    { geometries: 0, textures: 0 },
  );
  for (const sample of checkpoints.slice(2)) {
    expect(sample.renderer.geometries).toBeLessThanOrEqual(warmEnvelope.geometries);
    expect(sample.renderer.textures).toBeLessThanOrEqual(warmEnvelope.textures);
  }

  const output = { ...report, errors, checkpoints, warmEnvelope };
  await writeReport(testInfo, output, 'soak-30-report-final');

  expect(report.failure).toBeNull();
  expect(report.samples.at(-1)?.wave).toBeGreaterThanOrEqual(targetWave);
  expect(report.build.placed).toBeGreaterThanOrEqual(8);
  expect(report.upgradePicks).toBeGreaterThan(0);
  expect(report.glEvents).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
