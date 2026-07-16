import { getDebugSeed, getTimescale } from '../core/DebugParams';
import { normalizeSeed } from '../core/Rng';
import { runSuspendFutureState } from '../game/RunSuspend';

type TimelineEntry = {
  tick: number;
  time: number;
  enemies: number;
  bolts: number;
  blasts: number;
  goldPickups: number;
  xpMotes: number;
  wave: number;
  kills: number;
  gold: number;
  economyLog: number;
};

type DeterminismReport = {
  name: 'determinism';
  version: 1;
  status: 'pass' | 'fail';
  seed: string;
  normalizedSeed: number;
  timescale: number;
  stepSeconds: number;
  simSeconds: number;
  ticks: number;
  simHash: string;
  economyHash: string;
  futureStateHash: string;
  economy: ReturnType<NonNullable<Window['__GR_TEST__']>['summarizeLog']>;
  economyLogLength: number;
  entityTimeline: TimelineEntry[];
  findings: string[];
  error: string | null;
};

type DeterminismWindow = Window & {
  __GR_DETERMINISM__?: { status: 'running' } | DeterminismReport;
};

const STEP_SECONDS = 1 / 30;
const SIM_SECONDS = 600;

export function installDeterminismHarnessFromSearch(search = window.location.search): void {
  const params = new URLSearchParams(search);
  if (!params.has('debug') || !params.has('determinism')) return;

  const target = window as DeterminismWindow;
  target.__GR_DETERMINISM__ = { status: 'running' };
  void runDeterminismHarness()
    .then((report) => {
      target.__GR_DETERMINISM__ = report;
    })
    .catch((error: unknown) => {
      target.__GR_DETERMINISM__ = failedReport(error);
    });
}

async function runDeterminismHarness(): Promise<DeterminismReport> {
  await waitFor(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__), 5_000, 'debug harness');

  const test = window.__GR_TEST__!;
  const seed = getDebugSeed() ?? 'gold-rush';
  const params = new URLSearchParams(window.location.search);
  params.set('nolevel', '');
  window.history.replaceState(null, '', `${window.location.pathname}?${params}${window.location.hash}`);
  test.setManualSim(true);
  await waitFrames(2);
  test.resetRun();
  test.setManualSim(true);
  test.setBalance('enemy.contactDamage', 0);
  test.setBalance('waves.aliveCap', 12);
  await waitFrames(1);
  moveToHarvestNode();

  const entityTimeline: TimelineEntry[] = [];
  test.advanceSim(SIM_SECONDS, (sample) => entityTimeline.push({ tick: entityTimeline.length + 1, ...sample, time: round(sample.time, 3) }));

  const economyLog = test.economyLog();
  const economy = test.summarizeLog(economyLog);
  const simHash = hashText(stableStringify(entityTimeline));
  const economyHash = hashText(stableStringify({ economy, logLength: economyLog.length }));
  const futureStateHash = hashText(stableStringify(runSuspendFutureState(test.captureSuspend())));
  return {
    name: 'determinism',
    version: 1,
    status: 'pass',
    seed,
    normalizedSeed: normalizeSeed(seed),
    timescale: getTimescale(),
    stepSeconds: STEP_SECONDS,
    simSeconds: SIM_SECONDS,
    ticks: entityTimeline.length,
    simHash,
    economyHash,
    futureStateHash,
    economy,
    economyLogLength: economyLog.length,
    entityTimeline,
    findings: [],
    error: null,
  };
}

function failedReport(error: unknown): DeterminismReport {
  const seed = getDebugSeed() ?? 'gold-rush';
  return {
    name: 'determinism',
    version: 1,
    status: 'fail',
    seed,
    normalizedSeed: normalizeSeed(seed),
    timescale: getTimescale(),
    stepSeconds: STEP_SECONDS,
    simSeconds: SIM_SECONDS,
    ticks: 0,
    simHash: 'fnv1a32:00000000',
    economyHash: 'fnv1a32:00000000',
    futureStateHash: 'fnv1a32:00000000',
    economy: emptyEconomySummary(),
    economyLogLength: 0,
    entityTimeline: [],
    findings: [error instanceof Error ? error.message : String(error)],
    error: error instanceof Error ? error.message : String(error),
  };
}

function moveToHarvestNode(): void {
  const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active);
  if (node) window.__GR_TEST__?.teleport(node.position.x, node.position.z);
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

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  const entries = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(',')}}`;
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function emptyEconomySummary(): DeterminismReport['economy'] {
  return {
    panned: 0,
    sluiced: 0,
    granted: 0,
    stolen: 0,
    reclaimed: 0,
    pannedByProspector: 0,
    sluicedByProspector: 0,
    reclaimedByProspector: 0,
    spent: 0,
    baseValue: 0,
    buildingsBuilt: 0,
    beaconsBuilt: 0,
    repairSpent: 0,
    repairs: 0,
  };
}

function round(value: number, places: number): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
