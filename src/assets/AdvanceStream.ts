// THE ADVANCE STREAM — one warm step ahead of the player, under a per-session byte allowance.
//
// THE STATE MACHINE (published verbatim as `canvas.dataset.assetPrefetchState`, and as the
// `data-asset-prefetch-state` attribute an e2e spec reads). Seven values, three of them terminal:
//
//        enter(scene) ──▶ settling ──▶ resolving ──▶ fetching ──┐
//                            ▲            ▲   │                 │
//                            │            └───┘ (next target)   │
//                            │                                  │
//        pause()/dispose() ──┴──▶ paused          ┌─────────────┘
//                                                 ▼
//                        plan drained? ──yes──▶ ready      (terminal, no failures)
//                              │                partial    (terminal, ≥1 target or fetch failed)
//                              no
//                              ▼
//                     bytes >= allowance? ──yes──▶ allowance (terminal, work still queued)
//                              │
//                              no ──▶ keep fetching
//
//  settling   transient: `enter()` published the new plan; the first two rAFs have not fired yet.
//  resolving  transient: a target's URL list is being imported+resolved (town or contract module).
//  fetching   working: a two-file batch is in flight, or the next one is scheduled on idle. Since
//             F-BUDGET-3 this also covers the SCENE HOLD: while the current scene's own loader
//             publishes `assetLoadingState=loading`, a CONTRACT target neither resolves nor
//             fetches — it re-arms on the same idle callback until the scene is ready. The state
//             stays `fetching` because that is exactly what it means ("scheduled on idle"); no new
//             state was minted, and the town target is never held.
//  paused     NOT terminal: `pause()`/`dispose()`/a scene change stopped the stream; `enter()`
//             resumes it. This is the only non-terminal stop, and the only one that aborts in-flight
//             fetches.
//  ready      TERMINAL: every target resolved and every URL of the plan completed, no failures.
//  partial    TERMINAL: the plan drained but at least one resolve or fetch failed.
//  allowance  TERMINAL: the per-session byte allowance (`ADVANCE_STREAM_BYTE_ALLOWANCE`, published
//             as `assetPrefetchAllowance`) was reached with work STILL QUEUED, so the stream refused
//             to start another batch. Distinct from `ready`/`partial` (which mean the plan finished)
//             and from `paused` (which resumes). Only `enter()` leaves it, and only if the tab's
//             accumulated `assetPrefetchBytes` — persisted in sessionStorage, so a reload does not
//             refill it — is still under the allowance. F-BPTH-1: this state used to preempt the
//             drained-plan check, so a plan that COMPLETED at or over the allowance reported an
//             early stop; the drained-plan check now runs first and `allowance` means "stopped
//             short", nothing else. It shipped as `budget-exhausted` in c7856dca7.
//
// A SEPARATE, SMALLER MACHINE rides alongside on `assetPrefetchTownState`: `pending` (the town's URL
// list is not resolved yet), `partial` (resolved, not every URL completed) and `ready` (every town
// URL completed — the cue in AssetLoading.ts:75 uses this to stay silent on an already-warm town).
// It answers "is the town warm?" independently of which target the stream is currently on, because
// the town is priority 1 in the menu and run scenes but absent from the plan while the player is
// standing in it.
//
// THE TOWN'S PRIORITY-1 SET INCLUDES ITS BULK HALLS (stamp mill + dynamo hall) on normal
// connections — they are the town. Save Data still trims them (townUrls below). Measured on the
// built tree, 2026-09-05: the town costs 2,614,544 B at era 1 and at most 3,764,624 B (era 4, its
// worst era), of which the two halls are 334,760 B / 490,268 B — 2.8%–4.1% of the 12,000,000 B
// mobile allowance. The worst town + worst single destination is 8,394,980 B (70.0%), so the
// allowance can never evict the halls from a shipped build.

// A DEFAULT import, not a named one: Node's JSON modules export only `default`, so the named form
// broke every Node loader of this module (the whole-suite collection guard, F-FTP-5, 2026-09-07);
// Vite bundles both forms to the same bytes.
import firstTownPayload from '../../assets/first-town-payload.json' with { type: 'json' };
const { saveDataTrim } = firstTownPayload;
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

/** Every value `assetPrefetchState` can publish. See the state machine at the top of this file. */
export type AdvanceStreamState =
  | 'settling'
  | 'resolving'
  | 'fetching'
  | 'paused'
  | 'ready'
  | 'partial'
  | 'allowance';

/**
 * The states from which the stream will not schedule another fetch on its own: the plan drained
 * (`ready`/`partial`) or the byte allowance stopped it with work still queued (`allowance`).
 * `paused` is NOT here — it resumes. Wait on membership of this list, never on `ready` alone, or a
 * spec hangs the moment the allowance bites.
 */
export const ADVANCE_STREAM_TERMINAL_STATES: readonly AdvanceStreamState[] = ['ready', 'partial', 'allowance'];

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

// THE SAVE DATA TRIM IS DATA, AND THE GATE READS THE SAME ROW (task first-town-payload-gate,
// 2026-09-07, owner desk answer A7). The two bulk halls used to be a literal `/stamp-mill|dynamo-
// hall/` here and nowhere else, so the deploy's first-town budget had no way to know which files
// leave the town's plan on a metered connection — it could only guess, and a guess that drifts is
// how F-BUDGET-4 happened. `saveDataTrim` in assets/first-town-payload.json is now the one source:
// this filter is built from it, and scripts/first-town-payload.mjs subtracts the same names for its
// Save Data subtotal. Same list, same behaviour as the literal it replaces; add a hall in one place.
const SAVE_DATA_TRIM = new RegExp(saveDataTrim.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
const townUrls = (saveData: boolean) => import('../town/TownTavernPilot').then(({ townPrefetchUrls }) =>
  townPrefetchUrls().filter((url) => !saveData || !SAVE_DATA_TRIM.test(url)));
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
  let targetKind: AdvanceStreamTarget['kind'] = 'town';
  let idleHandle = 0;
  let frameHandle = 0;
  let abort: AbortController | undefined;
  let state: AdvanceStreamState = 'paused';
  let enabled = true;
  let warmedClipGroups = false;
  const idleWindow = window as IdleWindow;

  // THE WARM-ON-IDLE PATH FOR DEFERRED SPRITE CLIP GROUPS (task hero-slot-clip-split, 2026-09-07).
  // A scene loads only the clip groups it declares, so in the town the hero's claim animations
  // (char-hero-sheet-work8 + char-hero-sheet-attack8, 35 cells, 4,310,829 B) are never fetched at
  // entry. They ride THIS callback instead — the same idle tick the stream already uses — and they
  // ride it LAST, behind the stream's own plan.
  //
  // WHY LAST, AND NOT MERELY "ONCE THE SCENE READS READY". Measured, and it is the whole reason
  // this sits where it sits: firing on the first idle tick after `assetLoadingState=ready` put all
  // 35 cells straight back into the measured first-town window, 8,901,114 B / 141 hero responses
  // before and after, not one byte moved. The window's END is OBSERVED by a poll over CDP, not
  // taken from the page's own clock, so between the page publishing `ready` and the probe seeing it
  // there is a skirt of hundreds of milliseconds (the F-AUDIO-3 note in e2e/asset-diet.spec.ts
  // measures 507 ms of it at 8 Mbps) — and on loopback 4.3 MB fits in that skirt with room to
  // spare. Deferring to a signal the probe cannot see is not deferring.
  //
  // The plan draining is the honest cue, and it is the right one for the player too: the plan holds
  // the map the player is about to enter, which they will need before they need a swing animation.
  // Terminal-by-completion only — `allowance` is deliberately excluded, because that state means a
  // metered connection already spent its budget, and 4.3 MB of animation is exactly what such a
  // connection should be made to pay for on claim entry instead (the claim scene's own declaration
  // in src/game/Game.ts loads it then, from a cold cache, which is correct rather than merely
  // cheap). Dynamic import so the advance-stream chunk does not pull three.js and the sprite tables
  // in; by the time this fires SpriteAnimator is long loaded, so it costs no request. One shot per
  // stream, and a scene change makes a new stream.
  const warmClipGroups = () => {
    if (warmedClipGroups) return;
    if (canvas.dataset.assetLoadingState !== 'ready') return;
    warmedClipGroups = true;
    void import('./SpriteAnimator').then(({ warmDeferredSpriteClipGroups }) => warmDeferredSpriteClipGroups());
  };

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
    // F-BPTH-1 — DRAINED BEFORE STOPPED-SHORT, in that order. The allowance check used to sit above
    // this one, so a plan that fetched everything and happened to land on the allowance published
    // the early-stop state and never `ready`: "we finished" and "we gave up" were the same word, and
    // a spec waiting for `ready` hung on a stream that had nothing left to do. Terminal-by-completion
    // is decided first; `allowance` below can now only mean "work still queued".
    if (urls.length === 0 && targets.length === 0) {
      state = failed ? 'partial' : 'ready';
      priority = 0;
      target = '';
      publish();
      // The plan is done and the scene is standing: the last thing the connection owes is the
      // deferred sprite clip groups. See warmClipGroups above for why this is the cue and not
      // `assetLoadingState=ready` on its own. In the `town` scene this is guaranteed to run with
      // the scene ready, because the F-BUDGET-3 hold below refuses to resolve or fetch a contract
      // target while the scene reads `loading` — so the plan CANNOT drain first. In the `menu`
      // scene it usually does not fire (no scene loader is mounted, so there is no `ready` to
      // read), which is correct: no sprite slot is live there to warm.
      warmClipGroups();
      return;
    }
    // The current two-file batch may finish over budget; never start another one.
    if (enabled && bytes >= allowance) {
      state = 'allowance';
      publish();
      return;
    }
    // F-BUDGET-3 — THE SCENE THE PLAYER IS STANDING IN OUTRANKS THE ONE THEY MIGHT ENTER.
    // In the `town` and `run` scenes the plan's priority-1 target is a CONTRACT (see
    // advanceStreamPriority above), so the stream used to pull the NEXT map's terrain while the
    // town the player just entered was still raising. Measured with the deploy's own budget probe
    // on the built e1 bundle at main 37c8beda6 (2026-09-06): the first-town cue window carried
    // `the-claim-terrain.glb` + `the-claim-panorama.glb`, 1,052,408 bytes, before the town was
    // playable — 4.9% of a 21,638,025-byte transfer spent on a map the player cannot reach yet.
    // While the CURRENT SCENE's own loader still says `loading`, re-schedule instead of resolving
    // or fetching a contract: warm-ahead work can wait, the town's own load cannot.
    // Scoped to `contract` targets on purpose — the town target IS the first town, and delaying it
    // would slow the very thing this guard protects (the menu scene warms the town at priority 1).
    // FAIL-OPEN by construction: an absent attribute (no scene loader mounted, e.g. the
    // advance-stream fixture) and `ready` never hold, and the hold re-arms on the same idle
    // callback the stream already uses, so no scene can stall it permanently — it resumes the
    // moment `assetLoadingState` leaves `loading`.
    // HONEST LIMIT: `assetLoadingState` tracks the scene's GLTF LoadingManager only
    // (AssetLoading.ts:19-37); the character sprite sheets are not on it, so the hold releases
    // while those are still streaming. It buys the GLB half of the window, not all of it.
    const pendingKind = urls.length === 0 ? targets[0]?.kind : targetKind;
    if (pendingKind === 'contract' && canvas.dataset.assetLoadingState === 'loading') {
      state = 'fetching';
      publish();
      schedule(() => run(ownGeneration));
      return;
    }
    if (urls.length === 0) {
      const next = targets.shift();
      // Unreachable — the drained check above already returned on an empty plan — but a bare
      // `return` here would stall the stream with nothing scheduled, so re-publish terminal.
      if (!next) {
        state = failed ? 'partial' : 'ready';
        priority = 0;
        target = '';
        publish();
        return;
      }
      priority = next.priority;
      target = next.id;
      targetKind = next.kind;
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
    // Re-armed per scene, not per page: a new scene can bring new sprite slots, and a menu that
    // drained its plan with no slot live must not spend the town's one shot.
    warmedClipGroups = false;
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
    targetKind = targets[0]?.kind ?? 'town';
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
