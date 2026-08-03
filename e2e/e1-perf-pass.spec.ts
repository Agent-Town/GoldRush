import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';

const ARTIFACT_DIR = path.resolve(process.env.E1_PERF_ARTIFACT_DIR ?? 'artifacts/e1-perf-pass');
const STAGE = process.env.E1_PERF_STAGE ?? 'after';
// Cross-run timing, draw-call, and pixel baselines are machine-specific; enable only for a deliberate
// A/B run. The default gate stays machine-independent and never reads committed before artifacts.
const COMPARE_BASELINE = process.env.E1_PERF_COMPARE_BASELINE === '1';
// Drill Yard is the practice contract, not one of the five terrain-backed E1 maps.
const CONTRACTS = ['e1-night-shift', 'the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'] as const;

type Arm = {
  p95Ms: number;
  avgMs: number;
  workMsPerFrame: number;
  textureBindsPerFrame: number;
  maxDrawCalls: number;
  census: ReturnType<NonNullable<Window['__GR_TEST__']>['renderCensus']>;
};
type ContractReport = {
  contract: string;
  pressure: Arm;
  painted: Arm;
  probes: {
    terrain3dWorkMs: number;
    empty?: Arm;
    enemyPressureWorkMs?: number;
    uncappedNight?: Arm;
    uncappedNightWorkMs?: number;
  };
};
type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function installTextureBindProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__E1_TEXTURE_BINDS__ = 0;
    const prototype = WebGL2RenderingContext.prototype as WebGL2RenderingContext & { __e1BindProbe?: boolean };
    if (prototype.__e1BindProbe) return;
    prototype.__e1BindProbe = true;
    const bindTexture = prototype.bindTexture;
    prototype.bindTexture = function (...args: Parameters<WebGL2RenderingContext['bindTexture']>) {
      window.__E1_TEXTURE_BINDS__ = (window.__E1_TEXTURE_BINDS__ ?? 0) + 1;
      return bindTexture.apply(this, args);
    };
  });
}

async function boot(page: Page, contract: string, terrain2d: boolean, enemies: number, lightCap = 8): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&tier=full&seed=e1-perf-${contract}${terrain2d ? '&terrain2d' : ''}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.waitForFunction((painted) => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20
      && canvas?.dataset.run3dPilotState === 'ready'
      && (painted || canvas?.dataset.terrain3dPilotState === 'ready');
  }, terrain2d);
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

async function sample(page: Page, frames = 120): Promise<Arm> {
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
  const driven = await page.evaluate(() => {
    const trials: Array<{ workMsPerFrame: number; textureBindsPerFrame: number }> = [];
    for (let trial = 0; trial < 3; trial += 1) {
      const bindsBefore = window.__E1_TEXTURE_BINDS__ ?? 0;
      const started = performance.now();
      const schedule = window.__GR_TEST__!.driveRenderSchedule(1 / 6, 60);
      trials.push({
        workMsPerFrame: (performance.now() - started) / schedule.renderFrames,
        textureBindsPerFrame: ((window.__E1_TEXTURE_BINDS__ ?? 0) - bindsBefore) / schedule.renderFrames,
      });
    }
    trials.sort((a, b) => a.workMsPerFrame - b.workMsPerFrame);
    const median = trials[Math.floor(trials.length / 2)]!;
    return {
      ...median,
      census: window.__GR_TEST__!.renderCensus(),
    };
  });
  return { ...windowSample, ...driven };
}

async function measure(page: Page, contract: string, terrain2d: boolean, enemies: number, lightCap = 8): Promise<Arm> {
  await boot(page, contract, terrain2d, enemies, lightCap);
  return sample(page);
}

async function captureStaticMaps(page: Page, testInfo: TestInfo): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(performance, 'now', { configurable: true, value: () => 10_000 });
  });
  for (const contract of CONTRACTS) {
    await bootSnapshot(page, contract, false);
    const image = await page.locator('#game-canvas').screenshot();
    const filename = `${testInfo.project.name}-${contract}.png`;
    const destination = path.join(ARTIFACT_DIR, STAGE, filename);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, image);
    if (COMPARE_BASELINE && STAGE !== 'before') {
      assertPixelEquivalent(image, await readFile(path.join(ARTIFACT_DIR, 'before', filename)), `${contract} normal pixels`);
    }

    await bootSnapshot(page, contract, true);
    const pressureImage = await page.locator('#game-canvas').screenshot();
    const pressureFilename = `${testInfo.project.name}-${contract}-pressure.png`;
    await writeFile(path.join(ARTIFACT_DIR, STAGE, pressureFilename), pressureImage);
    if (COMPARE_BASELINE && STAGE !== 'before') {
      assertPixelEquivalent(pressureImage, await readFile(path.join(ARTIFACT_DIR, 'before', pressureFilename)), `${contract} pressure pixels`);
    }
  }
}

async function bootSnapshot(page: Page, contract: string, pressure: boolean): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&tier=full&seed=e1-perf-pixels-${contract}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.run3dPilotState === 'ready';
  });
  if (pressure) {
    await page.evaluate((contractId) => {
      const api = window.__GR_TEST__!;
      api.setWave(contractId === 'e1-baron' ? 18 : contractId === 'e1-night-shift' ? 10 : 8);
      api.scriptEnemyAt(-8, 0, 8, 0, 0);
      api.spawnPack(59, 22, { speedScale: 0, hpScale: 999, carriedLantern: false });
      api.setManualSim(true);
      api.advanceSim(1 / 30);
    }, contract);
    await page.waitForFunction(() => window.__GR_TEST__!.enemyPositions().length >= 60);
  } else await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  await page.evaluate(() => {
    for (const selector of ['.lil-gui', '#hud', '#touch-controls']) {
      document.querySelector<HTMLElement>(selector)?.style.setProperty('display', 'none');
    }
    window.__GR_TEST__!.driveRenderSchedule(0.5, 60);
  });
}

function pixelDifference(actual: Buffer, expected: Buffer): { changed: number; meanChannelDelta: number; pixels: number } {
  const [a, b] = [PNG.sync.read(actual), PNG.sync.read(expected)];
  if (a.width !== b.width || a.height !== b.height) return { changed: Number.POSITIVE_INFINITY, meanChannelDelta: Number.POSITIVE_INFINITY, pixels: 0 };
  let changed = 0;
  let totalDelta = 0;
  for (let offset = 0; offset < a.data.length; offset += 4) {
    const red = Math.abs(a.data[offset]! - b.data[offset]!);
    const green = Math.abs(a.data[offset + 1]! - b.data[offset + 1]!);
    const blue = Math.abs(a.data[offset + 2]! - b.data[offset + 2]!);
    const alpha = Math.abs(a.data[offset + 3]! - b.data[offset + 3]!);
    totalDelta += red + green + blue + alpha;
    if (Math.max(red, green, blue, alpha) > 4) changed += 1;
  }
  return { changed, meanChannelDelta: totalDelta / a.data.length, pixels: a.width * a.height };
}

function assertPixelEquivalent(actual: Buffer, expected: Buffer, label: string): void {
  const diff = pixelDifference(actual, expected);
  expect(diff.changed, `${label}: >4-channel pixels`).toBeLessThanOrEqual(Math.ceil(diff.pixels * 0.01));
  expect(diff.meanChannelDelta, `${label}: mean channel delta`).toBeLessThanOrEqual(0.25);
}

test('E1 maps publish a pressure census and preserve pressure pixels', async ({ page, context }, testInfo) => {
  test.setTimeout(480_000);
  const errors = collectErrors(page);
  await installTextureBindProbe(page);
  const report: ContractReport[] = [];

  for (const contract of CONTRACTS) {
    const pressure = await measure(page, contract, false, 60);
    const painted = await measure(page, contract, true, 60);
    const probes: ContractReport['probes'] = {
      terrain3dWorkMs: pressure.workMsPerFrame - painted.workMsPerFrame,
    };
    if (contract === 'e1-night-shift') {
      probes.empty = await measure(page, contract, false, 0);
      probes.enemyPressureWorkMs = pressure.workMsPerFrame - probes.empty.workMsPerFrame;
      probes.uncappedNight = await measure(page, contract, false, 60, 32);
      probes.uncappedNightWorkMs = probes.uncappedNight.workMsPerFrame - pressure.workMsPerFrame;
    }
    expect(pressure.maxDrawCalls, contract).toBeLessThanOrEqual(200);
    expect(pressure.p95Ms, contract).toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
    report.push({ contract, pressure, painted, probes });
  }

  await mkdir(ARTIFACT_DIR, { recursive: true });
  const reportPath = path.join(ARTIFACT_DIR, `census-${STAGE}-${testInfo.project.name}.json`);
  await writeFile(reportPath, `${JSON.stringify({
    stage: STAGE,
    project: testInfo.project.name,
    viewport: page.viewportSize(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    gpu: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.gpuRenderer),
    shedLineMs: Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio,
    report,
  }, null, 2)}\n`);

  if (COMPARE_BASELINE && STAGE !== 'before') {
    const before = JSON.parse(await readFile(path.join(ARTIFACT_DIR, `census-before-${testInfo.project.name}.json`), 'utf8')) as { report: ContractReport[] };
    const leanP95Ms = Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio * 0.75;
    for (const row of report) {
      const baseline = before.report.find(({ contract }) => contract === row.contract)!;
      expect(row.pressure.maxDrawCalls, `${row.contract} draw calls`).toBeLessThanOrEqual(baseline.pressure.maxDrawCalls);
      expect(row.pressure.p95Ms, `${row.contract} p95 regression`).toBeLessThanOrEqual(Math.max(leanP95Ms, baseline.pressure.p95Ms * 1.2, baseline.pressure.p95Ms + 2));
      expect(row.pressure.workMsPerFrame, `${row.contract} driven-work regression`).toBeLessThanOrEqual(Math.max(baseline.pressure.workMsPerFrame * 1.35, baseline.pressure.workMsPerFrame + 0.5));
    }
  }

  const snapshotPage = await context.newPage();
  const snapshotErrors = collectErrors(snapshotPage);
  await captureStaticMaps(snapshotPage, testInfo);
  await snapshotPage.close();
  expect(errors).toEqual({ console: [], page: [] });
  expect(snapshotErrors).toEqual({ console: [], page: [] });
});

declare global {
  interface Window {
    __E1_TEXTURE_BINDS__?: number;
  }
}
