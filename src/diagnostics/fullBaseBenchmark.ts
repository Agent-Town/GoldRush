import { Balance } from '../game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type Placement = { id: BuildableId; x: number; z: number };
type BenchWindow = {
  label: string;
  wave: number | null;
  samples: number;
  frameMsP50: number;
  frameMsP95: number;
  drawCallsMin: number;
  drawCallsMax: number;
  renderer: { calls: number; triangles: number; geometries: number; textures: number };
  spriteStats: {
    maxActiveAnimators: number;
    maxTextureSwapsPerFrame: number;
    maxFadeOverlaysActive: number;
    textureSwapViolation: boolean;
  };
  pools: {
    maxEnemies: number;
    maxBolts: number;
    maxBlasts: number;
    maxPickups: number;
    maxFloatTexts: number;
  };
  glErrors: string[];
};

type BenchReport = {
  name: 'fullbase';
  version: 1;
  status: 'pass' | 'fail';
  seed: string;
  timescale: number;
  budgets: { drawCallsMax: number; p95RatioMax: number };
  build: { target: number; placed: number; failed: Placement[]; layout: Placement[] };
  baseline: BenchWindow;
  waves: BenchWindow[];
  summary: {
    maxDrawCalls: number;
    p95RatioMax: number;
    glErrors: string[];
    findings: string[];
  };
  error: string | null;
};

const DRAW_CALL_BUDGET = 200;
const P95_RATIO_BUDGET = 2;
const SAMPLE_MS = 1_500;
const BENCH_WAVES = [12, 13, 14, 15] as const;
const FULL_BASE: Placement[] = [
  { id: 'sluice', x: -12, z: 7 },
  { id: 'sluice', x: 0, z: 7 },
  { id: 'sluice', x: 12, z: 7 },
  { id: 'assay_office', x: 20, z: 7 },
  { id: 'stockpile', x: -10, z: 11 },
  { id: 'stockpile', x: 10, z: 11 },
  { id: 'sentry_beacon', x: -15, z: 12 },
  { id: 'sentry_beacon', x: -6, z: 12 },
  { id: 'sentry_beacon', x: -3, z: 12 },
  { id: 'sentry_beacon', x: 3, z: 12 },
  { id: 'sentry_beacon', x: 6, z: 12 },
  { id: 'sentry_beacon', x: 15, z: 12 },
  { id: 'turret', x: -12, z: 16 },
  { id: 'turret', x: -4, z: 16 },
  { id: 'turret', x: 4, z: 16 },
  { id: 'turret', x: 12, z: 16 },
  { id: 'palisade', x: -6, z: 20 },
  { id: 'palisade', x: -2, z: 20 },
  { id: 'palisade', x: 2, z: 20 },
  { id: 'palisade', x: 6, z: 20 },
];

export function installFullBaseBenchmark(): void {
  if (new URLSearchParams(window.location.search).get('bench') !== 'fullbase') return;
  void runFullBaseBenchmark();
}

async function runFullBaseBenchmark(): Promise<void> {
  const report = await createReport().catch((error: unknown) => failedReport(error));
  window.__BENCH_REPORT__ = report;
  console.log(JSON.stringify(report));
}

async function createReport(): Promise<BenchReport> {
  await waitFor(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__ && window.__GR_TEST__), 5_000, 'debug harness');

  const test = window.__GR_TEST__!;
  const gl = getGl();
  const glEvents = installGlEventTracker();
  const originalAliveCap = Balance.waves.aliveCap;
  test.setBalance('enemy.contactDamage', 0);
  test.setBalance('waves.waveInterval', 9999);
  test.setBalance('waves.trickleInterval', 9999);
  test.grantGold(5_000);
  await test.warmVfx();
  test.setBalance('waves.aliveCap', 0);
  test.clearEnemies();
  test.setWave(0);
  await waitFrames(8);

  const baseline = await sampleWindow('empty-map', null, gl);
  test.setBalance('waves.aliveCap', originalAliveCap);
  await warmEnemySprites();
  const build = await buildFullBase();
  const waves: BenchWindow[] = [];

  for (const wave of BENCH_WAVES) {
    await prepareWave(wave);
    waves.push(await sampleWindow(`wave-${wave}`, wave, gl));
  }

  const summary = summarize(baseline, waves, glEvents);
  return {
    name: 'fullbase',
    version: 1,
    status: summary.findings.length === 0 ? 'pass' : 'fail',
    seed: new URLSearchParams(window.location.search).get('seed') ?? 'perf-02-fullbase',
    timescale: Number(new URLSearchParams(window.location.search).get('timescale') ?? 24),
    budgets: { drawCallsMax: DRAW_CALL_BUDGET, p95RatioMax: P95_RATIO_BUDGET },
    build,
    baseline,
    waves,
    summary,
    error: null,
  };
}

function failedReport(error: unknown): BenchReport {
  const message = error instanceof Error ? error.message : String(error);
  const empty = emptyWindow('failed');
  return {
    name: 'fullbase',
    version: 1,
    status: 'fail',
    seed: new URLSearchParams(window.location.search).get('seed') ?? 'perf-02-fullbase',
    timescale: Number(new URLSearchParams(window.location.search).get('timescale') ?? 24),
    budgets: { drawCallsMax: DRAW_CALL_BUDGET, p95RatioMax: P95_RATIO_BUDGET },
    build: { target: FULL_BASE.length, placed: 0, failed: FULL_BASE, layout: FULL_BASE },
    baseline: empty,
    waves: [],
    summary: { maxDrawCalls: 0, p95RatioMax: 0, glErrors: [], findings: [message] },
    error: message,
  };
}

async function buildFullBase(): Promise<BenchReport['build']> {
  const failed: Placement[] = [];
  for (const placement of FULL_BASE) {
    const before = buildableCount(placement.id);
    window.__GR_TEST__?.teleport(placement.x, placement.z + 2);
    window.__GR_TEST__?.selectBuildable(placement.id);
    await waitFor(() => isGhostReady(placement), 1_000, `${placement.id} ghost`);
    const placed = window.__GR_TEST__?.confirmBuild() === true;
    await waitFrames(1);
    if (!placed || buildableCount(placement.id) !== before + 1) failed.push(placement);
  }
  if (failed.length > 0) throw new Error(`fullbase placement failed: ${failed.map((entry) => entry.id).join(', ')}`);
  return { target: FULL_BASE.length, placed: FULL_BASE.length, failed, layout: FULL_BASE };
}

async function warmEnemySprites(): Promise<void> {
  window.__GR_TEST__?.spawnPack(4, 10);
  await waitFrames(24);
  window.__GR_TEST__?.clearEnemies();
  await waitFrames(4);
}

async function prepareWave(wave: number): Promise<void> {
  window.__GR_TEST__?.clearEnemies();
  window.__GR_TEST__?.setWave(wave);
  window.__GR_TEST__?.setBeaconWave(wave);
  window.__GR_TEST__?.teleport(0, 12);
  window.__GR_TEST__?.spawnPack(Balance.waves.aliveCap, 16);
  await waitFor(() => (window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0) > 0, 1_000, `wave ${wave} enemies`);
  await waitFrames(6);
}

function sampleWindow(label: string, wave: number | null, gl: WebGLRenderingContext | WebGL2RenderingContext | null): Promise<BenchWindow> {
  const frameMs: number[] = [];
  const glErrors: string[] = [];
  let lastTs = 0;
  let drawCallsMin = Number.POSITIVE_INFINITY;
  let drawCallsMax = 0;
  let renderer = { calls: 0, triangles: 0, geometries: 0, textures: 0 };
  const spriteStats = { maxActiveAnimators: 0, maxTextureSwapsPerFrame: 0, maxFadeOverlaysActive: 0, textureSwapViolation: false };
  const pools = { maxEnemies: 0, maxBolts: 0, maxBlasts: 0, maxPickups: 0, maxFloatTexts: 0 };

  return new Promise((resolve) => {
    const started = performance.now();
    const tick = (ts: number) => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (lastTs > 0) frameMs.push(ts - lastTs);
      lastTs = ts;
      if (diagnostics) {
        renderer = { ...diagnostics.renderer };
        drawCallsMin = Math.min(drawCallsMin, diagnostics.renderer.calls);
        drawCallsMax = Math.max(drawCallsMax, diagnostics.renderer.calls);
        spriteStats.maxActiveAnimators = Math.max(spriteStats.maxActiveAnimators, diagnostics.spriteStats.activeAnimators);
        spriteStats.maxTextureSwapsPerFrame = Math.max(spriteStats.maxTextureSwapsPerFrame, diagnostics.spriteStats.textureSwapsPerFrame);
        spriteStats.maxFadeOverlaysActive = Math.max(spriteStats.maxFadeOverlaysActive, diagnostics.spriteStats.fadeOverlaysActive);
        spriteStats.textureSwapViolation ||= diagnostics.spriteStats.textureSwapsPerFrame > diagnostics.spriteStats.activeAnimators;
        pools.maxEnemies = Math.max(pools.maxEnemies, diagnostics.enemiesAlive);
        pools.maxBolts = Math.max(pools.maxBolts, diagnostics.boltsAlive);
        pools.maxBlasts = Math.max(pools.maxBlasts, diagnostics.arsenal.blastsAlive);
        pools.maxPickups = Math.max(pools.maxPickups, diagnostics.steal.pickups);
        pools.maxFloatTexts = Math.max(pools.maxFloatTexts, diagnostics.vfx.activeFloatTexts);
      }
      collectGlErrors(gl, glErrors);
      if (performance.now() - started < SAMPLE_MS) {
        requestAnimationFrame(tick);
        return;
      }
      resolve({
        label,
        wave,
        samples: frameMs.length,
        frameMsP50: round1(percentile(frameMs, 0.5)),
        frameMsP95: round1(percentile(frameMs, 0.95)),
        drawCallsMin: Number.isFinite(drawCallsMin) ? drawCallsMin : renderer.calls,
        drawCallsMax,
        renderer,
        spriteStats,
        pools,
        glErrors,
      });
    };
    requestAnimationFrame(tick);
  });
}

function summarize(baseline: BenchWindow, waves: BenchWindow[], glEvents: string[]): BenchReport['summary'] {
  const maxDrawCalls = Math.max(0, ...waves.map((sample) => sample.drawCallsMax));
  const baselineP95 = Math.max(1, baseline.frameMsP95);
  const p95RatioMax = round2(Math.max(0, ...waves.map((sample) => sample.frameMsP95 / baselineP95)));
  const glErrors = [...glEvents, ...baseline.glErrors, ...waves.flatMap((sample) => sample.glErrors)];
  const findings: string[] = [];
  if (maxDrawCalls > DRAW_CALL_BUDGET) findings.push(`draw calls ${maxDrawCalls} > ${DRAW_CALL_BUDGET}: check buildable instancing fallback`);
  if (p95RatioMax > P95_RATIO_BUDGET) findings.push(`frame p95 ratio ${p95RatioMax}x > ${P95_RATIO_BUDGET}x: check sprites, vfx pools, or CPU update cost`);
  if (waves.some((sample) => sample.spriteStats.textureSwapViolation)) findings.push('sprite swaps exceeded active animators: check SpriteAnimator frame cache');
  if (glErrors.length > 0) findings.push(`GL errors/events: ${glErrors.join(', ')}`);
  return { maxDrawCalls, p95RatioMax, glErrors, findings };
}

function isGhostReady(placement: Placement): boolean {
  const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
  return (
    build?.selectedBuildable === placement.id &&
    build.ghostValid &&
    Math.abs(build.ghostPos.x - placement.x) < 0.05 &&
    Math.abs(build.ghostPos.z - placement.z) < 0.05
  );
}

function buildableCount(id: BuildableId): number {
  return window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === id)?.count ?? 0;
}

function waitFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function waitFor(check: () => boolean, timeoutMs: number, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const tick = () => {
      if (check()) {
        resolve();
        return;
      }
      if (performance.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${label}`));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function getGl(): WebGLRenderingContext | WebGL2RenderingContext | null {
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  return canvas?.getContext('webgl2') ?? canvas?.getContext('webgl') ?? null;
}

function installGlEventTracker(): string[] {
  const events: string[] = [];
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  canvas?.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    events.push('webglcontextlost');
  });
  canvas?.addEventListener('webglcontextrestored', () => events.push('webglcontextrestored'));
  return events;
}

function collectGlErrors(gl: WebGLRenderingContext | WebGL2RenderingContext | null, errors: string[]): void {
  if (!gl) return;
  for (let code = gl.getError(); code !== gl.NO_ERROR; code = gl.getError()) errors.push(`0x${code.toString(16)}`);
}

function emptyWindow(label: string): BenchWindow {
  return {
    label,
    wave: null,
    samples: 0,
    frameMsP50: 0,
    frameMsP95: 0,
    drawCallsMin: 0,
    drawCallsMax: 0,
    renderer: { calls: 0, triangles: 0, geometries: 0, textures: 0 },
    spriteStats: { maxActiveAnimators: 0, maxTextureSwapsPerFrame: 0, maxFadeOverlaysActive: 0, textureSwapViolation: false },
    pools: { maxEnemies: 0, maxBolts: 0, maxBlasts: 0, maxPickups: 0, maxFloatTexts: 0 },
    glErrors: [],
  };
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
