import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';

// perf-r2 census rig — the instrument, not a gate.
//
// It answers the question round 1 could not: WHAT are the ~120-139 draw calls per E1 map?
// It is a `.rig.ts`, so the default config's `testIgnore` keeps it out of the shared battery
// permanently — no machine's wall-clock can become someone else's red (F-1440-2's cure, taken
// one layer further than the opt-in env flag).
//
// Every assertion here is machine-independent: the 200-call budget, the absolute shed line, and
// zero console/page errors. Timing is PUBLISHED, never asserted against a foreign baseline.
const ARTIFACT_DIR = path.resolve(process.env.PERFR2_ARTIFACT_DIR ?? 'artifacts/perf-e1-r2');
const STAGE = process.env.PERFR2_STAGE ?? 'latest';
// Extra query string appended to every boot — the A/B lever. Both arms of an A/B must run in the
// SAME window (this box swings 6x on background load), so an arm is a flag, never a second run.
const BOOT_SUFFIX = process.env.PERFR2_BOOT_SUFFIX ?? '';
const CONTRACTS = ['e1-night-shift', 'the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'] as const;

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, contract: string, enemies: number, lightCap = 8): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&tier=full&seed=e1-perf-${contract}${BOOT_SUFFIX}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20
      && canvas?.dataset.run3dPilotState === 'ready'
      && canvas?.dataset.terrain3dPilotState === 'ready';
  });
  await page.evaluate(({ contractId, count, cap }) => {
    const api = window.__GR_TEST__!;
    api.setBalance('render.night.maxDynamicLights', cap);
    api.setBalance('render.night.collapseSeconds', 9999);
    api.setBalance('enemy.contactDamage', 0);
    api.setBalance('waves.aliveCap', 90);
    api.setWave(contractId === 'e1-baron' ? 18 : contractId === 'e1-night-shift' ? 10 : 8);
    if (count > 0) api.spawnPack(count, 22, { speedScale: 0, hpScale: 999, carriedLantern: contractId === 'e1-night-shift' });
  }, { contractId: contract, count: enemies, cap: lightCap });
  if (enemies > 0) await page.waitForFunction((count) => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= count, enemies);
  await page.waitForTimeout(250);
}

async function sample(page: Page, frames = 120) {
  const windowSample = await page.evaluate(async (count) => {
    const frameMs: number[] = [];
    let drawCalls = 0;
    let previous = performance.now();
    for (let index = 0; index < count; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      frameMs.push(now - previous);
      previous = now;
      drawCalls = Math.max(drawCalls, window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? 0);
    }
    frameMs.sort((a, b) => a - b);
    return {
      p95Ms: frameMs[Math.floor(frameMs.length * 0.95)] ?? 0,
      avgMs: frameMs.reduce((sum, value) => sum + value, 0) / frameMs.length,
      maxDrawCalls: drawCalls,
    };
  }, frames);

  // Driven work is the machine-noise-resistant number: it drives a fixed render schedule and
  // takes the MEDIAN of three trials, so a single scheduler hiccup cannot set the figure.
  const driven = await page.evaluate(() => {
    const trials: number[] = [];
    for (let trial = 0; trial < 3; trial += 1) {
      const started = performance.now();
      const schedule = window.__GR_TEST__!.driveRenderSchedule(1 / 6, 60);
      trials.push((performance.now() - started) / schedule.renderFrames);
    }
    trials.sort((a, b) => a - b);
    return {
      workMsPerFrame: trials[1]!,
      census: window.__GR_TEST__!.renderCensus(),
      draws: window.__GR_TEST__!.drawCallCensus(),
    };
  });
  return { ...windowSample, ...driven };
}

test('E1 draw-call census: what the calls ARE', async ({ page }, testInfo: TestInfo) => {
  const errors = collectErrors(page);
  const report: Array<Record<string, unknown>> = [];

  for (const contract of CONTRACTS) {
    await boot(page, contract, 60);
    const pressure = await sample(page);
    await boot(page, contract, 0);
    const empty = await sample(page);
    report.push({ contract, pressure, empty });

    expect(pressure.maxDrawCalls, `${contract} draw-call budget`).toBeLessThanOrEqual(200);
    expect(pressure.p95Ms, `${contract} absolute shed line`)
      .toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
  }

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `draws-${STAGE}-${testInfo.project.name}.json`),
    `${JSON.stringify({
      stage: STAGE,
      bootSuffix: BOOT_SUFFIX,
      project: testInfo.project.name,
      viewport: page.viewportSize(),
      gpu: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.gpuRenderer),
      shedLineMs: Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio,
      report,
    }, null, 2)}\n`,
  );

  expect(errors).toEqual({ console: [], page: [] });
});
