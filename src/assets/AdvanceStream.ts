import { loadScores } from '../game/Scoreboard';
import { readRunSuspend } from '../game/RunSuspend';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import {
  DEFAULT_CONTRACT_ID,
  DEFAULT_EPOCH_ID,
  listBoardContracts,
  loadEpoch,
} from '../meta/ContractFamilies';
import { contractUnlockStatus } from '../meta/ContractUnlock';

export type AdvanceStreamScene =
  | { kind: 'menu' }
  | { kind: 'town' }
  | { kind: 'run'; contractId: string };

export type AdvanceStreamTarget = {
  kind: 'town' | 'contract';
  id: string;
  priority: 1 | 2 | 3 | 4;
};

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const FETCH_BATCH = 2;
export const ADVANCE_STREAM_BYTE_ALLOWANCE = { desktop: 24_000_000, mobile: 12_000_000 } as const;
export const ADVANCE_STREAM_BYTES_KEY = 'gr.asset-prefetch.bytes.v1';
export const WARM_EVERY_MAP_KEY = 'gr.asset-prefetch.every-map.v1';

export function warmEveryMapEnabled(): boolean {
  try { return localStorage.getItem(WARM_EVERY_MAP_KEY) === 'true'; } catch { return false; }
}

export function setWarmEveryMapEnabled(enabled: boolean): void {
  try { localStorage.setItem(WARM_EVERY_MAP_KEY, String(enabled)); } catch { return; }
  window.dispatchEvent(new Event(WARM_EVERY_MAP_KEY));
}

const townUrls = (saveData: boolean) => import('../town/TownTavernPilot').then(({ townPrefetchUrls }) =>
  townPrefetchUrls().filter((url) => !saveData || !/stamp-mill|dynamo-hall/.test(url)));
const contractUrls = (id: string) =>
  import('../world/Terrain3dClaimPilot').then(({ contractPrefetchUrls }) => contractPrefetchUrls(id));

export function advanceStreamPriority(scene: AdvanceStreamScene): AdvanceStreamTarget[] {
  const board = listBoardContracts();
  const suspended = readRunSuspend()?.contractId;
  const scores = loadScores();
  const beaten = new Set(scores.filter(({ secured }) => secured).map(({ contractId }) => contractId ?? DEFAULT_CONTRACT_ID));
  const frontier =
    (suspended ? board.find(({ id }) => id === suspended) : undefined) ??
    board.find((contract) => !beaten.has(contract.id) && contractUnlockStatus(contract).unlocked) ??
    board[0];
  const lastPlayed = [...scores].sort((left, right) => right.at - left.at)[0]?.contractId;
  const likely =
    scene.kind === 'menu'
      ? board.find(({ id }) => id === (suspended ?? lastPlayed ?? DEFAULT_CONTRACT_ID)) ?? frontier
      : frontier;
  const nextFrom = scene.kind === 'run' ? scene.contractId : likely?.id;
  const nextIndex = board.findIndex(({ id }) => id === nextFrom);
  const successor = board[nextIndex + 1] ?? frontier;
  const targets: AdvanceStreamTarget[] = [];
  const seen = new Set<string>();
  const add = (kind: AdvanceStreamTarget['kind'], id: string | undefined, priority: AdvanceStreamTarget['priority']) => {
    if (!id) return;
    const key = `${kind}:${id}`;
    if (seen.has(key)) return;
    seen.add(key);
    targets.push({ kind, id, priority });
  };

  if (scene.kind === 'menu') {
    add('town', 'town', 1);
    add('contract', likely?.id, 2);
  } else if (scene.kind === 'town') {
    add('contract', likely?.id, 1);
    add('contract', successor?.id, 2);
  } else {
    add('town', 'town', 1);
    add('contract', successor?.id, 2);
  }
  if (warmEveryMapEnabled()) {
    const e1 = new Set(loadEpoch(DEFAULT_EPOCH_ID).contracts.map(({ id }) => id));
    for (const contract of board) if (e1.has(contract.id)) add('contract', contract.id, 3);
    for (const contract of board) add('contract', contract.id, 4);
  }
  return targets;
}

export function createAdvanceStream(canvas: HTMLCanvasElement): {
  enter: (scene: AdvanceStreamScene) => void;
  pause: () => void;
  dispose: () => void;
} {
  const completed = new Set<string>();
  let townAssets = new Set<string>();
  let targets: AdvanceStreamTarget[] = [];
  let urls: string[] = [];
  let planUrls = new Set<string>();
  let generation = 0;
  let ready = 0;
  let total = 0;
  let failed = 0;
  let bytes = 0;
  try {
    const stored = Number(sessionStorage.getItem(ADVANCE_STREAM_BYTES_KEY));
    if (Number.isFinite(stored) && stored >= 0) bytes = stored;
  } catch {}
  let allowance: number = ADVANCE_STREAM_BYTE_ALLOWANCE.mobile;
  let scene: AdvanceStreamScene = { kind: 'menu' };
  let priority = 0;
  let target = '';
  let idleHandle = 0;
  let frameHandle = 0;
  let abort: AbortController | undefined;
  let state = 'paused';
  let enabled = true;
  const idleWindow = window as IdleWindow;

  const publish = () => {
    canvas.dataset.assetPrefetchScene = scene.kind;
    canvas.dataset.assetPrefetchState = state;
    canvas.dataset.assetPrefetchReady = String(ready);
    canvas.dataset.assetPrefetchTotal = String(total);
    canvas.dataset.assetPrefetchProgress = `${ready}/${total}`;
    canvas.dataset.assetPrefetchFailed = String(failed);
    canvas.dataset.assetPrefetchPriority = String(priority);
    canvas.dataset.assetPrefetchTarget = target;
    canvas.dataset.assetPrefetchSaveData = String(saveDataEnabled());
    canvas.dataset.assetPrefetchEnabled = String(enabled);
    canvas.dataset.assetPrefetchAllowance = String(allowance);
    canvas.dataset.assetPrefetchBytes = String(bytes);
    canvas.dataset.assetPrefetchTownState =
      !enabled ? 'ready' : townAssets.size === 0 ? 'pending' : [...townAssets].every((url) => completed.has(url)) ? 'ready' : 'partial';
  };

  const cancelIdle = () => {
    if (!idleHandle) return;
    if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleHandle);
    else window.clearTimeout(idleHandle);
    idleHandle = 0;
  };

  const pause = () => {
    generation += 1;
    cancelAnimationFrame(frameHandle);
    frameHandle = 0;
    cancelIdle();
    abort?.abort();
    abort = undefined;
    state = 'paused';
    publish();
  };

  const schedule = (run: () => void) => {
    cancelIdle();
    idleHandle = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(run, { timeout: 1_000 })
      : window.setTimeout(run, 80);
  };

  const resolveTarget = async (next: AdvanceStreamTarget): Promise<string[]> => {
    const resolved = next.kind === 'town' ? await townUrls(saveDataEnabled()) : await contractUrls(next.id);
    if (next.kind === 'town') townAssets = new Set(resolved);
    return resolved;
  };

  const run = (ownGeneration: number) => {
    if (ownGeneration !== generation) return;
    idleHandle = 0;
    // The current two-file batch may finish over budget; never start another one.
    if (enabled && bytes >= allowance) {
      state = 'budget-exhausted';
      publish();
      return;
    }
    if (urls.length === 0) {
      const next = targets.shift();
      if (!next) {
        state = failed ? 'partial' : 'ready';
        priority = 0;
        target = '';
        publish();
        return;
      }
      priority = next.priority;
      target = next.id;
      state = 'resolving';
      publish();
      void resolveTarget(next).then((resolved) => {
        if (ownGeneration !== generation) return;
        for (const url of resolved) {
          if (planUrls.has(url)) continue;
          planUrls.add(url);
          total += 1;
          if (completed.has(url)) ready += 1;
          else urls.push(url);
        }
        state = 'fetching';
        publish();
        schedule(() => run(ownGeneration));
      }, () => {
        if (ownGeneration !== generation) return;
        failed += 1;
        state = 'fetching';
        publish();
        schedule(() => run(ownGeneration));
      });
      return;
    }

    const batch = urls.splice(0, FETCH_BATCH);
    abort = new AbortController();
    const signal = abort.signal;
    void Promise.all(
      batch.map(async (url) => {
        try {
          const response = await fetch(url, {
            cache: 'force-cache',
            headers: { 'x-gold-rush-prefetch': '1' },
            priority: 'low',
            signal,
          } as RequestInit & { priority: 'low' });
          if (!response.ok) throw new Error(String(response.status));
          const body = await response.arrayBuffer();
          bytes += body.byteLength;
          try { sessionStorage.setItem(ADVANCE_STREAM_BYTES_KEY, String(bytes)); } catch {}
          publish();
          if (ownGeneration !== generation) return;
          completed.add(url);
          ready += 1;
        } catch {
          if (ownGeneration === generation && !signal.aborted) failed += 1;
        }
      }),
    ).then(() => {
      if (ownGeneration !== generation) return;
      abort = undefined;
      publish();
      schedule(() => run(ownGeneration));
    });
  };

  const enter = (nextScene: AdvanceStreamScene) => {
    pause();
    scene = nextScene;
    enabled = threeDimensionalAssetsEnabled();
    allowance = performanceTierDiagnostics().tier !== 'full' || window.matchMedia('(pointer: coarse)').matches
      ? ADVANCE_STREAM_BYTE_ALLOWANCE.mobile : ADVANCE_STREAM_BYTE_ALLOWANCE.desktop;
    targets = enabled ? advanceStreamPriority(nextScene) : [];
    if (saveDataEnabled()) targets = targets.filter(({ priority }) => priority === 1);
    urls = [];
    planUrls = new Set();
    ready = 0;
    total = 0;
    failed = 0;
    priority = targets[0]?.priority ?? 0;
    target = targets[0]?.id ?? '';
    state = 'settling';
    const ownGeneration = generation;
    publish();
    townAssets = new Set();
    if (enabled) {
      void townUrls(saveDataEnabled()).then((resolved) => {
        if (ownGeneration !== generation) return;
        townAssets = new Set(resolved);
        publish();
      });
    }
    frameHandle = requestAnimationFrame(() => {
      frameHandle = requestAnimationFrame(() => schedule(() => run(ownGeneration)));
    });
  };

  const replan = () => { if (state !== 'paused') enter(scene); };
  window.addEventListener(WARM_EVERY_MAP_KEY, replan);
  publish();
  return { enter, pause, dispose: () => {
    pause();
    window.removeEventListener(WARM_EVERY_MAP_KEY, replan);
  } };
}

function saveDataEnabled(): boolean {
  return (navigator as NavigatorWithConnection).connection?.saveData === true;
}

function threeDimensionalAssetsEnabled(): boolean {
  const search = new URLSearchParams(window.location.search);
  return !search.has('terrain2d') && search.get('tier') !== 'lite' && performanceTierDiagnostics().tier !== 'lite';
}
