// FIRST, before every other import: arming the boot guard is the point of putting it here. Module
// bodies evaluate in import order, so `./core/BootGuard` is listening for `error`,
// `unhandledrejection` and `vite:preloadError` before any line below it can fail (UX-2, the outside
// review of 2026-09-24: a failed chunk used to leave a BLANK PAGE).
import { guardedImport, installBootGuard, markBootReached, showBootFailureCard, webgl2Available } from './core/BootGuard';
import './styles.css';
import './ui/theme.css';
import { createAdvanceStream } from './assets/AdvanceStream';
import { markStartupFrameReady, prefetchNonCriticalGeneratedTextures } from './assets/generated';
import { accountSync } from './game/AccountSync';
import { applyStoredDifficultyPreset } from './game/Balance';
import type { RunReturnResult } from './game/Game';
import { FIRST_CLAIM_DONE_KEY, activeProfile, loadProfileState, profileDataKey } from './game/ProfileStorage';
import { applyStoredPerformanceTier } from './game/PerformanceTier';
import { install as installProfiles } from './game/ProfileManager';
import { readRunSuspend } from './game/RunSuspend';
import {
  activeContract,
  activeEpochId,
  DEFAULT_CONTRACT_ID,
  loadContract,
  readCharterLaunch,
  stagedPlayerContractLaunch,
  stageReplayContract,
  stagePlayerContractLaunch,
  type ContractRunBoot,
} from './meta/ContractFamilies';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';
import { installClaimLedgerRequestHandler } from './encyclopedia/events';
import { installEpochLedgerDiscovery } from './encyclopedia/state';
import type { LedgerEntryId } from './encyclopedia/registry';
import { installBuildFreshness } from './app/BuildFreshness';
import { gameApiUrl } from './app/GameApi';
import { seedDebugEraFromSearch } from './meta/DebugEraSeed';
import { reverifyStagedContractLaunch } from './meta/ContractUnlock';
import { reconcileActiveEpoch } from './meta/ResearchTree';

type AssayBench = ReturnType<(typeof import('./crafting/AssayBench'))['install']>;
type Game = import('./game/Game').Game;
type GameBoot = import('./game/Game').GameBoot;
type RunTape = import('./game/RunTape').RunTape;
type StartMenu = import('./ui/menu/StartMenu').StartMenu;
type TownScene = import('./town/TownScene').TownScene;

installBootGuard();

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Missing #game-canvas element.');
}
const gameCanvas = canvas;
const advanceStream = createAdvanceStream(gameCanvas);

if (__GR_RELEASE_E1__) {
  const url = new URL(window.location.href);
  const blocked = ['debug', 'editor', 'bench', 'era'];
  let changed = false;
  for (const key of blocked) {
    changed = url.searchParams.has(key) || changed;
    url.searchParams.delete(key);
  }
  if (changed) history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

const initialSearch = new URLSearchParams(window.location.search);
if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('simitem')) {
  void guardedImport('crafting/StatSimHarness', () => import('./crafting/StatSimHarness')).then(({ installStatSimHarnessFromSearch }) => installStatSimHarnessFromSearch());
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('determinism')) {
  void guardedImport('diagnostics/DeterminismHarness', () => import('./diagnostics/DeterminismHarness')).then(({ installDeterminismHarnessFromSearch }) => installDeterminismHarnessFromSearch());
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('mpbalance')) {
  void guardedImport('mp/MultiplayerBalanceHarness', () => import('./mp/MultiplayerBalanceHarness')).then(({ installMultiplayerBalanceHarnessFromSearch }) =>
    installMultiplayerBalanceHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('e4convoyweather')) {
  void guardedImport('diagnostics/E4ConvoyWeatherHarness', () => import('./diagnostics/E4ConvoyWeatherHarness')).then(({ installE4ConvoyWeatherHarnessFromSearch }) =>
    installE4ConvoyWeatherHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('e4orbit')) {
  void guardedImport('diagnostics/E4OrbitRoadHarness', () => import('./diagnostics/E4OrbitRoadHarness')).then(({ installE4OrbitRoadHarnessFromSearch }) =>
    installE4OrbitRoadHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('deepwater')) {
  void guardedImport('diagnostics/E5DeepwaterHarness', () => import('./diagnostics/E5DeepwaterHarness')).then(({ installE5DeepwaterHarnessFromSearch }) =>
    installE5DeepwaterHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.get('bench') === 'fullbase') {
  const defaults = { debug: '', nolevel: '', nopause: '', seed: 'perf-02-fullbase', timescale: '24' };
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    if (initialSearch.has(key)) continue;
    initialSearch.set(key, value);
    changed = true;
  }
  if (changed) {
    history.replaceState(null, '', `${window.location.pathname}?${initialSearch.toString()}${window.location.hash}`);
  }
}

const app = document.querySelector<HTMLElement>('#app') ?? document.body;
if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('playbook')) {
  void guardedImport('spikes/playbook/PlaybookLab', () => import('./spikes/playbook/PlaybookLab')).then(({ installPlaybookLab }) => installPlaybookLab(app));
}
accountSync.install();
let game: Game | undefined;
let lanternBoot: { dispose: () => void } | undefined;
const PENDING_LANTERN_KEY = 'gr.lantern.pending.v1';
let assayBench: AssayBench | undefined;
let profiles: ReturnType<typeof installProfiles> | undefined;
let startMenu: StartMenu | undefined;
let town: TownScene | undefined;
let restoreReplayStorage: (() => void) | undefined;
const uninstallBuildFreshness = installBuildFreshness(app, () => !game && !profiles && Boolean(startMenu || town));
const uninstallClaimLedgerRequest = installClaimLedgerRequestHandler((entryId) => openClaimLedger(entryId));
installEpochLedgerDiscovery();

const RUN_ROUTE_PARAMS = ['contract', 'seed', 'difficulty', 'mode', 'press', 'replay', 'watch'] as const;

// F-SS05-1: `first-boot` is a declared signal that nothing in `src/` emitted. The boot path is
// the only honest site for it, and it fires exactly once per profile.
const FIRST_BOOT_SIGNAL_KEY = 'gr.story.firstBoot.v1';

// Two traps live in this six-line function, and both were paid for once.
//
// 1. ⚠️ NOT the story seen-state helpers. `hasStoryBeatSeen`/`markStoryBeatSeen` reach
//    `activeProfile`/`markHintSeen`, and BOTH funnel through `ensureProfileState`
//    (ProfileStorage.ts:129), which CREATES and SAVES a default "Robin" profile when none exists.
//    Asking the question before the player has answered "Who's prospecting?" would answer it for
//    them and skip profile creation (e2e/profile-first-boot.spec.ts:41 asserts no Robin ghost). So
//    a boot with no profile state is not yet a profile's first boot; the next load carries it.
// 2. ⚠️ NOT the profile's `hintsSeen` list either. That list is the record of which BEATS a player
//    has been shown, and `e2e/ss-02-beats.spec.ts:212` asserts its exact contents; a signal-level
//    marker filed there is a beat that was never shown. This keeps its own per-profile datum.
function claimFirstBootForProfile(): boolean {
  try {
    // `loadProfileState` first: it never creates a profile, and `activeProfile` is only safe to
    // call once one exists.
    if (!loadProfileState(window.localStorage)) return false;
    const key = profileDataKey(activeProfile(window.localStorage).id, FIRST_BOOT_SIGNAL_KEY);
    if (window.localStorage.getItem(key) !== null) return false;
    window.localStorage.setItem(key, '1');
    return true;
  } catch {
    // Storage is optional; a boot that cannot remember is not one we announce.
    return false;
  }
}

/**
 * THE ONE WRITER of the `first-boot` signal (UX-7, outside review 2026-09-24). It installs the
 * runtime FIRST and claims SECOND, in that order and never the other way: `emitStorySignal` with no
 * listener subscribed drops the signal on the floor while the claim has already spent the datum, and
 * the Tavernkeeper's opening card would be lost for the life of that profile.
 *
 * Called from two places, and the datum (not the caller) is the one-shot guard:
 *  - `afterFirstFrame` below, for every load that already has a profile.
 *  - `onEnterTown` in `showStartMenu`, which is where the naming flow lands. On a FRESH store the
 *    boot-path claim cannot fire (no profile exists yet - see `claimFirstBootForProfile`), so before
 *    this the greeting waited for the NEXT load and arrived after the founding beat, out of story
 *    order. `StartMenu.createFirstProfile` calls `onEnterTown()` as its last statement, in-page and
 *    before `openTown()` mounts the town, which is exactly the seam the beat needs.
 */
function announceFirstBootIfUnclaimed(): void {
  void guardedImport('story', () => import('./story')).then(({ emitStorySignal, installStoryRuntime }) => {
    installStoryRuntime(app);
    if (claimFirstBootForProfile()) emitStorySignal({ type: 'first-boot' });
  });
}

afterFirstFrame(() => {
  // A scene has had two frames to appear: from here an error belongs to a running game, not to the
  // boot, and the guard stops raising its card over a working page.
  markBootReached();
  announceFirstBootIfUnclaimed();
});

async function startGame(boot: GameBoot = {}): Promise<void> {
  // Before the renderer, never after: `createRenderer` (core/Renderer.ts:28) constructs
  // THREE.WebGLRenderer with no probe and no try/catch, so on a machine or browser refusing webgl2
  // the boot died silently and the player got a blank page (UX-2).
  if (!webgl2Available()) {
    showBootFailureCard('webgl', 'webgl2 context refused before the run renderer');
    return;
  }
  if (__GR_RELEASE_E1__) reconcileActiveEpoch();
  if (!boot.replay) reverifyStagedContractLaunch();
  seedDebugEraFromSearch(gameCanvas);
  advanceStream.enter({ kind: 'run', contractId: activeContract().id });
  const currentSearch = new URLSearchParams(window.location.search);
  const { Game } = await guardedImport('game/Game', () => import('./game/Game'));
  applyStoredDifficultyPreset();
  applyStoredPerformanceTier(activeContract().id);
  applyUpgradeBudgetsFromBalance();
  game = new Game(gameCanvas, () => assayBench?.focus(), runReturnCallback, { ...runBootFromSearch(currentSearch), ...boot });
  game.start();
  if (!__GR_RELEASE_E1__ && currentSearch.has('editor')) {
    void guardedImport('editor/DescriptorInspector', () => import('./editor/DescriptorInspector')).then(({ installDescriptorInspector }) => installDescriptorInspector(app));
  }
  releaseStartupAssetGateOnFirstGameFrame();
  installWaveTelegraphPrefetch();
  if (!boot.replay) {
    afterFirstFrame(() => {
      void guardedImport('crafting/AssayBench', () => import('./crafting/AssayBench')).then(({ install }) => {
        if (!game) return;
        assayBench = install(app, {
          initiallyOpen: currentSearch.has('profile') || currentSearch.has('queueNow'),
        });
      });
    });
  }
}

function startWithProfiles(options: { showTitle?: boolean; skipTitle?: boolean; onBack?: () => void } = {}): void {
  advanceStream.pause();
  profiles?.dispose();
  profiles = installProfiles(() => startGame(), {
    showTitle: options.showTitle,
    skipTitle: options.skipTitle,
    onBack: options.onBack,
  });
}

function showStartMenu(): void {
  applyStoredPerformanceTier(null);
  startMenu?.dispose();
  void guardedImport('ui/menu/StartMenu', () => import('./ui/menu/StartMenu')).then(({ install }) => {
    if (game || town || profiles) return;
    startMenu?.dispose();
    startMenu = install(app, {
      onContinue: () => {
        continueSavedRun();
      },
      onLoadSlot: () => {
        continueSavedRun();
      },
      onEnterTown: () => {
        startMenu?.dispose();
        startMenu = undefined;
        // UX-7 (item 4): the naming flow lands HERE. `StartMenu.createFirstProfile` creates the
        // profile and then calls this as its last statement, so on a fresh store this is the first
        // moment a profile exists - and it is still in-page, before `openTown` mounts the town. The
        // greeting therefore plays in story order (greeting, then the trail, then the founding beat)
        // instead of waiting for the next load and arriving after the town was named. Harmless on
        // the ordinary Enter Town click: the per-profile datum was already spent by the boot path,
        // and the datum, not the call site, is the one-shot guard.
        announceFirstBootIfUnclaimed();
        openTown();
      },
      onOpenLedger: () => openClaimLedger(),
      onProfile: () => openProfilesFromStartMenu(),
    });
    advanceStream.enter({ kind: 'menu' });
  });
}

function openProfilesFromStartMenu(): void {
  advanceStream.pause();
  const menuRoot = document.querySelector<HTMLElement>('[data-testid="start-menu"]');
  menuRoot?.setAttribute('inert', '');
  menuRoot?.setAttribute('aria-hidden', 'true');
  let closedDuringInstall = false;
  const close = () => {
    closedDuringInstall = true;
    profiles?.dispose();
    profiles = undefined;
    startMenu?.refresh();
    menuRoot?.removeAttribute('inert');
    menuRoot?.removeAttribute('aria-hidden');
    advanceStream.enter({ kind: 'menu' });
    menuRoot?.querySelector<HTMLButtonElement>('[data-testid="start-menu-profile"]')?.focus({ preventScroll: true });
  };
  profiles?.dispose();
  profiles = undefined;
  const nextProfiles = installProfiles(close, { showTitle: true, onBack: close });
  if (closedDuringInstall) nextProfiles.dispose();
  else profiles = nextProfiles;
}

function continueSavedRun(): void {
  advanceStream.pause();
  const suspend = readRunSuspend();
  if (suspend?.contractId) {
    stagePlayerContractLaunch(suspend.contractId);
    const nextSearch = new URLSearchParams(window.location.search);
    nextSearch.set('contract', suspend.contractId);
    history.pushState(null, '', `${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
    window.location.reload();
    return;
  }
  startMenu?.dispose();
  startMenu = undefined;
  startWithProfiles({ skipTitle: true });
}

function launchContract(contractId: string, boot: ContractRunBoot = {}): void {
  advanceStream.pause();
  if (!loadContract(contractId).practice) markFirstClaimDone();
  stagePlayerContractLaunch(contractId);
  const nextSearch = new URLSearchParams(window.location.search);
  nextSearch.set('contract', contractId);
  boot.mode ? nextSearch.set('mode', boot.mode) : nextSearch.delete('mode');
  history.pushState(null, '', `${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
  window.location.reload();
}

function runBootFromSearch(search: URLSearchParams): ContractRunBoot {
  return { mode: search.get('mode') === 'escort' && search.get('mp') !== 'dev' ? 'escort' : undefined };
}

function markFirstClaimDone(): void {
  try {
    window.localStorage.setItem(FIRST_CLAIM_DONE_KEY, '1');
  } catch {
    // Storage is optional; the run should still launch.
  }
}

function runReturnCallback(result: RunReturnResult): void {
  if (returnRunToCharterPress(result)) return;
  returnToTownBoard(result);
}

// A run the Charter Press launched returns to the Press, not the town board.
// The staged charter-launch entry exists only after a Press launch, so every
// other run keeps its ordinary return path untouched.
function returnRunToCharterPress(result: RunReturnResult): boolean {
  const launch = readCharterLaunch();
  const search = new URLSearchParams(window.location.search);
  if (!launch || search.has('editor') || search.get('contract') !== launch.templateId) return false;
  const next = new URLSearchParams();
  next.set('editor', '');
  next.set('contract', launch.templateId);
  next.set('press', `return-${result}`);
  window.location.href = `${window.location.pathname}?${next.toString()}`;
  return true;
}

function returnToTownBoard(result: RunReturnResult): void {
  const returnedContractId = new URLSearchParams(window.location.search).get('contract') || DEFAULT_CONTRACT_ID;
  teardownActiveScene();
  replaceRunRoute('town');
  openTown({ openBoard: true, returnResult: result, initialBoardContractId: returnedContractId });
}

function returnToStartMenu(): void {
  teardownActiveScene();
  replaceRunRoute('menu');
  showStartMenu();
}

function teardownActiveScene(): void {
  advanceStream.pause();
  const parts = [
    ['town', town],
    ['game', game],
    ['lantern', lanternBoot],
    ['assay bench', assayBench],
    ['profiles', profiles],
    ['start menu', startMenu],
  ] as const;
  town = undefined;
  game = undefined;
  lanternBoot = undefined;
  assayBench = undefined;
  profiles = undefined;
  startMenu = undefined;
  for (const [name, part] of parts) {
    try {
      part?.dispose();
    } catch (error) {
      console.error(`[scene-swap] ${name} disposal failed; continuing.`, error);
    }
  }
  const hud = document.querySelector<HTMLElement>('#hud');
  hud?.replaceChildren();
  if (hud) {
    hud.classList.remove('hud--announcement-visible', 'hud--pressure-visible');
    delete hud.dataset.announcementKind;
    delete hud.dataset.paused;
    delete hud.dataset.runState;
  }
}

function replaceRunRoute(scene: 'town' | 'menu'): void {
  const search = new URLSearchParams(window.location.search);
  for (const key of RUN_ROUTE_PARAMS) search.delete(key);
  const query = search.toString();
  history.replaceState(
    { goldRushScene: scene },
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  );
}

// THE MENU DECISION — an ALLOWLIST OF RUN ROUTES, inverted here by UX-1 (outside review
// 2026-09-24, observed live in Chromium).
//
// It used to be a denylist: show the menu only if EVERY query key is menu-safe, otherwise launch a
// run. That made the DEFAULT for an unrecognised parameter "skip the menu and start playing", and
// the internet is full of unrecognised parameters. A newsletter link carrying `?utm_source=`, a
// Facebook `?fbclid=`, a Google `?gclid=`, a `?contract=` a player pasted to a friend: every one of
// them fell through to `startWithProfiles()`, which on a fresh browser MINTED AND SAVED a profile
// named after the owner (ProfileStorage.ts:144) and started a run. The player never saw the start
// menu, never named their claim-holder, and the once-per-profile first-boot signal was spent.
//
// So the default is the menu now, exactly as `/` behaves, and a run launches only when the query
// NAMES a route into one. Two groups, both closed:
//
//  1. RUN ROUTES — honoured by a release build. `contract` is the one conditional member and is
//     handled below; `watch` has its own branch above.
//  2. THE DEBUG HARNESS — every key `src/core/DebugParams.ts` honours, plus its two aliases
//     (`bench=fullbase`, `editor`, DebugParams.ts:40) and the multiplayer/era harness doors. None of
//     these mean anything in a release build (`readDebugParams` returns DEFAULT_PARAMS when
//     `__GR_RELEASE_E1__`, DebugParams.ts:34), so the release build's only run routes are group 1.
//
// ⚠️ A NEW HARNESS KEY MUST BE ADDED HERE or a URL carrying only that key lands on the menu instead
// of in a run. Measured when this landed: 482 e2e files, 759 `goto` calls, zero flipped verdicts.
//
// The menu-safe pilot flags are NOT on either list and keep their old behaviour deliberately: the
// owner hit /?town3dPilot=all and got dropped into The Claim, townDusk/townNight/townSky were
// unreachable variants for the same reason (F-BT-1, U7, Mistake #10). Under the inverted rule they
// are no longer a special case at all - they are simply not run routes, like every other key.
const RUN_ROUTE_LAUNCH_PARAMS = new Set([
  // 1. Run routes.
  'seed', 'difficulty', 'mode', 'press', 'replay', 'epoch', 'profiles',
  // 2. The debug harness, compiled out of the release build.
  'debug', 'bench', 'editor', 'timescale', 'nospawn', 'nowaves', 'nolevel', 'nokill', 'nopause',
  'nosteal', 'nowreck', 'noping', 'stress', 'profile', 'nobeauty', 'nopoolgrade', 'performance',
  'era', 'mp', 'mpRelay', 'mpCode', 'mpName', 'mpTown', 'mpParty', 'mpDesyncAt',
]);

// `?contract=` is the one key that cannot answer for itself. A board click, a reload-resume and a
// Charter Press return all reach the run through it - and they all STAGE the launch in sessionStorage
// first (`stagePlayerContractLaunch`, and `launchContract`/`continueSavedRun` below). A typed or
// shared `?contract=` stages nothing, so it is a share link, not a launch: it goes to the menu. This
// closes no door the release build keeps open, because `?contract=` without a staged launch never
// opened the named contract anyway - it fell back to the Claim (specs/release-e1/README.md §4,
// F-TOUR-1). `?debug` keeps the testing door: the factory boots contracts by URL all day.
function contractParamNamesARun(search: URLSearchParams): boolean {
  if (!search.has('contract')) return false;
  if (!__GR_RELEASE_E1__ && search.has('debug')) return true;
  return stagedPlayerContractLaunch() !== null;
}

function searchNamesARun(search: URLSearchParams): boolean {
  return [...search.keys()].some((key) => RUN_ROUTE_LAUNCH_PARAMS.has(key)) || contractParamNamesARun(search);
}

if (history.state?.goldRushScene === 'town') {
  openTown();
} else if (history.state?.goldRushScene === 'menu') {
  showStartMenu();
} else if (initialSearch.has('watch')) {
  void openWatchDeepLink(initialSearch);
} else if (searchNamesARun(initialSearch)) {
  startWithProfiles();
} else {
  showStartMenu();
}

if (!__GR_RELEASE_E1__ && initialSearch.get('bench') === 'fullbase') {
  void guardedImport('diagnostics/fullBaseBenchmark', () => import('./diagnostics/fullBaseBenchmark')).then(({ installFullBaseBenchmark }) => installFullBaseBenchmark());
}

function openTown(options: { openBoard?: boolean; returnResult?: RunReturnResult; initialBoardContractId?: string } = {}): void {
  // Same probe, same reason as `startGame`: the town builds a renderer too (UX-2).
  if (!webgl2Available()) {
    showBootFailureCard('webgl', 'webgl2 context refused before the town renderer');
    return;
  }
  applyStoredPerformanceTier(null);
  markStartupFrameReady();
  advanceStream.enter({ kind: 'town' });
  void guardedImport('town/TownScene', () => import('./town/TownScene')).then(({ TownScene }) => {
    if (game || profiles) return;
    town?.dispose();
    town = new TownScene(gameCanvas, returnToStartMenu, {
      ...options,
      onLaunchContract: launchContract,
      onOpenTapeShelf: openRunTapeShelf,
    });
    town.start();
  });
}

function openRunTapeShelf(): void {
  void guardedImport('ui/LanternShow', () => import('./ui/LanternShow')).then(({ openTapeShelf }) => openTapeShelf(localStorage, watchRunTape));
}

async function watchRunTape(tape: RunTape, epochId = activeEpochId(), closeToMenu = false, freshPage = false): Promise<void> {
  const initialOptions = new URLSearchParams(window.location.search);
  const tactical = initialOptions.get('reel') === 'tactical';
  const { usesLanternWorker } = await guardedImport('replay/LanternController', () => import('./replay/LanternController'));
  const independent = usesLanternWorker(tape);
  // Town/Game may already have evaluated Terrain for another contract. A fresh page is the
  // contract boundary, including local-only shelf reels which cannot be fetched from standings.
  if (independent && !closeToMenu && !freshPage) {
    sessionStorage.setItem(PENDING_LANTERN_KEY, JSON.stringify({ tape, epochId }));
    window.location.assign(reelUrl(tape.id, tape.contract, epochId));
    return;
  }
  teardownActiveScene();
  stageReplayContract(tape.contract);
  const bootSearch = new URLSearchParams({ contract: tape.contract, seed: tape.seed, difficulty: tape.difficulty, replay: tape.id, epoch: epochId });
  if (tactical) bootSearch.set('reel', 'tactical');
  if (initialOptions.has('tier')) bootSearch.set('tier', initialOptions.get('tier')!);
  history.replaceState({ goldRushScene: 'replay' }, '', `${window.location.pathname}?${bootSearch.toString()}${window.location.hash}`);
  const { isolateReplayStorage } = await guardedImport('ui/LanternShow', () => import('./ui/LanternShow'));
  restoreReplayStorage = isolateReplayStorage(localStorage, independent);
  try {
    const shareUrl = reelUrl(tape.id, tape.contract, epochId);
    if (independent) {
      advanceStream.pause();
      const { bootLantern } = await guardedImport('replay/LanternBoot', () => import('./replay/LanternBoot'));
      lanternBoot = await bootLantern(app, tape, { shareUrl, tactical, close: closeToMenu ? closeDeepLinkToMenu : closeRunTapeReplay });
    } else await startGame({ replay: { tape, shareUrl, onClose: closeToMenu ? closeDeepLinkToMenu : closeRunTapeReplay } });
    history.replaceState({ goldRushScene: 'replay' }, '', shareUrl);
  } catch (error) {
    (closeToMenu ? closeDeepLinkToMenu : closeRunTapeReplay)();
    throw error;
  }
}

async function openWatchDeepLink(search: URLSearchParams): Promise<void> {
  const reelId = search.get('watch')?.trim();
  const contractId = search.get('contract')?.trim();
  const epochId = search.get('epoch')?.trim();
  let payload: unknown = null;
  let localShelf = false;
  const pending = sessionStorage.getItem(PENDING_LANTERN_KEY);
  if (pending) {
    sessionStorage.removeItem(PENDING_LANTERN_KEY);
    try {
      const saved = JSON.parse(pending);
      if (saved.tape?.id === reelId && saved.tape?.contract === contractId && saved.epochId === epochId) { payload = { reel: saved.tape }; localShelf = true; }
    } catch { /* A stale local handoff falls back to the public reel lookup. */ }
  }
  if (!payload && reelId && contractId && epochId) {
    const url = new URL(gameApiUrl('/api/standings'));
    url.searchParams.set('reel', reelId);
    url.searchParams.set('contract', contractId);
    url.searchParams.set('epoch', epochId);
    try {
      const response = await fetch(url);
      if (response.ok) payload = await response.json();
    } catch {
      // The Lantern Show gives the same quiet refusal as the county board.
    }
  }
  const { LANTERN_REEL_UNAVAILABLE, LANTERN_VERSION_REFUSAL, openLanternRefusal, readStandingsReel } = await guardedImport('ui/LanternShow', () => import('./ui/LanternShow'));
  const verdict = readStandingsReel(payload);
  if (verdict.ok) {
    await watchRunTape(verdict.tape, epochId!, !localShelf, true);
    return;
  }
  openLanternRefusal(app, verdict.reason === 'version' ? LANTERN_VERSION_REFUSAL : LANTERN_REEL_UNAVAILABLE, closeDeepLinkToMenu);
}

function reelUrl(reelId: string, contractId: string, epochId: string): string {
  const url = new URL(window.location.href);
  const search = new URLSearchParams({ watch: reelId, contract: contractId, epoch: epochId });
  if (url.searchParams.get('reel') === 'tactical') search.set('reel', 'tactical');
  if (url.searchParams.has('tier')) search.set('tier', url.searchParams.get('tier')!);
  url.search = search.toString();
  return url.href;
}

function closeRunTapeReplay(): void {
  const independent = Boolean(lanternBoot);
  teardownActiveScene();
  restoreReplayStorage?.();
  restoreReplayStorage = undefined;
  stageReplayContract(null);
  replaceRunRoute('town');
  if (independent) window.location.reload();
  else openTown();
}

function closeDeepLinkToMenu(): void {
  const independent = Boolean(lanternBoot);
  teardownActiveScene();
  restoreReplayStorage?.();
  restoreReplayStorage = undefined;
  stageReplayContract(null);
  history.replaceState({ goldRushScene: 'menu' }, '', window.location.pathname);
  if (independent) window.location.reload();
  else showStartMenu();
}

function openClaimLedger(entryId?: LedgerEntryId): void {
  if (game) {
    game.openClaimLedger(entryId);
    return;
  }
  // TAPE-03: WATCH THIS RUN on a standings row rides the SAME viewer as the tape shelf's WATCH.
  // Only this out-of-game path hands it in — Game.ts's in-run ledger deliberately does not, so a
  // reel can never tear down a live run from behind the modal.
  void guardedImport('encyclopedia/reader', () => import('./encyclopedia/reader')).then(({ openClaimLedger }) => openClaimLedger({ entryId, onWatchTape: watchRunTape }));
}

function afterFirstFrame(task: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(task));
}

function installWaveTelegraphPrefetch(): void {
  let prefetched = false;
  const tick = () => {
    if (prefetched || !game) return;
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    if (diagnostics?.waveState === 'warning' && diagnostics.wave <= 1) {
      prefetched = true;
      prefetchNonCriticalStartupAssets();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function releaseStartupAssetGateOnFirstGameFrame(): void {
  const tick = () => {
    if (!game) return;
    if ((window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 0) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          markStartupFrameReady();
          prefetchNonCriticalStartupAssets();
        }),
      );
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function prefetchNonCriticalStartupAssets(): void {
  void prefetchNonCriticalGeneratedTextures();
  void guardedImport('assets/SpriteAnimator', () => import('./assets/SpriteAnimator')).then(({ prefetchNonCriticalSpriteRuntimes }) => prefetchNonCriticalSpriteRuntimes());
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    uninstallClaimLedgerRequest();
    uninstallBuildFreshness();
    advanceStream.dispose();
    startMenu?.dispose();
    profiles?.dispose();
    assayBench?.dispose();
    town?.dispose();
    game?.dispose();
  });
}
