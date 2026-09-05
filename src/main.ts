import './styles.css';
import './ui/theme.css';
import { createAdvanceStream } from './assets/AdvanceStream';
import { markStartupFrameReady, prefetchNonCriticalGeneratedTextures } from './assets/generated';
import { accountSync } from './game/AccountSync';
import { applyStoredDifficultyPreset } from './game/Balance';
import type { RunReturnResult } from './game/Game';
import { FIRST_CLAIM_DONE_KEY, loadProfileState } from './game/ProfileStorage';
import { hasStoryBeatSeen, markStoryBeatSeen } from './story/seenState';
import { applyStoredPerformanceTier } from './game/PerformanceTier';
import { install as installProfiles } from './game/ProfileManager';
import { readRunSuspend } from './game/RunSuspend';
import {
  activeContract,
  activeEpochId,
  DEFAULT_CONTRACT_ID,
  loadContract,
  readCharterLaunch,
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
  void import('./crafting/StatSimHarness').then(({ installStatSimHarnessFromSearch }) => installStatSimHarnessFromSearch());
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('determinism')) {
  void import('./diagnostics/DeterminismHarness').then(({ installDeterminismHarnessFromSearch }) => installDeterminismHarnessFromSearch());
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('mpbalance')) {
  void import('./mp/MultiplayerBalanceHarness').then(({ installMultiplayerBalanceHarnessFromSearch }) =>
    installMultiplayerBalanceHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('e4convoyweather')) {
  void import('./diagnostics/E4ConvoyWeatherHarness').then(({ installE4ConvoyWeatherHarnessFromSearch }) =>
    installE4ConvoyWeatherHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('e4orbit')) {
  void import('./diagnostics/E4OrbitRoadHarness').then(({ installE4OrbitRoadHarnessFromSearch }) =>
    installE4OrbitRoadHarnessFromSearch(),
  );
}

if (!__GR_RELEASE_E1__ && initialSearch.has('debug') && initialSearch.has('deepwater')) {
  void import('./diagnostics/E5DeepwaterHarness').then(({ installE5DeepwaterHarnessFromSearch }) =>
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
  void import('./spikes/playbook/PlaybookLab').then(({ installPlaybookLab }) => installPlaybookLab(app));
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
const FIRST_BOOT_SEEN_KEY = 'signal:first-boot';

// ⚠️ NOT `hasStoryBeatSeen` alone. Both story-seen helpers reach `activeProfile`/`markHintSeen`,
// and BOTH funnel through `ensureProfileState` (ProfileStorage.ts:129), which CREATES and SAVES a
// default "Robin" profile when none exists. Asking the question before the player has answered
// "Who's prospecting?" would therefore answer it for them and skip profile creation entirely — so
// a boot with no profile state simply is not a profile's first boot yet, and the next load (the
// launch reload) carries the signal instead.
function claimFirstBootForProfile(): boolean {
  try {
    if (!loadProfileState(window.localStorage)) return false;
    if (hasStoryBeatSeen(FIRST_BOOT_SEEN_KEY)) return false;
    return markStoryBeatSeen(FIRST_BOOT_SEEN_KEY);
  } catch {
    // Storage is optional; a boot that cannot remember is not one we announce.
    return false;
  }
}

afterFirstFrame(() => {
  void import('./story').then(({ emitStorySignal, installStoryRuntime }) => {
    installStoryRuntime(app);
    if (claimFirstBootForProfile()) emitStorySignal({ type: 'first-boot' });
  });
});

async function startGame(boot: GameBoot = {}): Promise<void> {
  if (__GR_RELEASE_E1__) reconcileActiveEpoch();
  if (!boot.replay) reverifyStagedContractLaunch();
  seedDebugEraFromSearch(gameCanvas);
  advanceStream.enter({ kind: 'run', contractId: activeContract().id });
  const currentSearch = new URLSearchParams(window.location.search);
  const { Game } = await import('./game/Game');
  applyStoredDifficultyPreset();
  applyStoredPerformanceTier(activeContract().id);
  applyUpgradeBudgetsFromBalance();
  game = new Game(gameCanvas, () => assayBench?.focus(), runReturnCallback, { ...runBootFromSearch(currentSearch), ...boot });
  game.start();
  if (!__GR_RELEASE_E1__ && currentSearch.has('editor')) {
    void import('./editor/DescriptorInspector').then(({ installDescriptorInspector }) => installDescriptorInspector(app));
  }
  releaseStartupAssetGateOnFirstGameFrame();
  installWaveTelegraphPrefetch();
  if (!boot.replay) {
    afterFirstFrame(() => {
      void import('./crafting/AssayBench').then(({ install }) => {
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
  void import('./ui/menu/StartMenu').then(({ install }) => {
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

// Visual pilot flags are menu-safe: they configure the town/run scenes but must
// not hijack the boot into a contract launch (owner hit /?town3dPilot=all → The Claim).
// townDusk/townNight join them (U7). townNight has existed in TownScene since the town
// shipped and has never had a door: /?townNight fell through to startWithProfiles and booted
// a CONTRACT RUN, so the only way to see the night town was to enter it and then rewrite
// history. A visual flag nobody can reach is a visual that does not exist (Mistake #10).
// townSky joins the town's look flags for the same reason townDusk/townNight did (F-BT-1): a
// search key that is not menu-safe falls through to startWithProfiles() and launches a contract
// run, so a sky variant nobody can reach by typing its URL is a variant that does not exist.
const MENU_SAFE_PARAMS = new Set(['town3dPilot', 'run3dPilot', 'tier', 'townDusk', 'townNight', 'townSky']);
if (history.state?.goldRushScene === 'town') {
  openTown();
} else if (history.state?.goldRushScene === 'menu') {
  showStartMenu();
} else if (initialSearch.has('watch')) {
  void openWatchDeepLink(initialSearch);
} else if ([...initialSearch.keys()].every((key) => MENU_SAFE_PARAMS.has(key))) {
  showStartMenu();
} else {
  startWithProfiles();
}

if (!__GR_RELEASE_E1__ && initialSearch.get('bench') === 'fullbase') {
  void import('./diagnostics/fullBaseBenchmark').then(({ installFullBaseBenchmark }) => installFullBaseBenchmark());
}

function openTown(options: { openBoard?: boolean; returnResult?: RunReturnResult; initialBoardContractId?: string } = {}): void {
  applyStoredPerformanceTier(null);
  markStartupFrameReady();
  advanceStream.enter({ kind: 'town' });
  void import('./town/TownScene').then(({ TownScene }) => {
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
  void import('./ui/LanternShow').then(({ openTapeShelf }) => openTapeShelf(localStorage, watchRunTape));
}

async function watchRunTape(tape: RunTape, epochId = activeEpochId(), closeToMenu = false, freshPage = false): Promise<void> {
  const initialOptions = new URLSearchParams(window.location.search);
  const tactical = initialOptions.get('reel') === 'tactical';
  const { usesLanternWorker } = await import('./replay/LanternController');
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
  const { isolateReplayStorage } = await import('./ui/LanternShow');
  restoreReplayStorage = isolateReplayStorage(localStorage, independent);
  try {
    const shareUrl = reelUrl(tape.id, tape.contract, epochId);
    if (independent) {
      advanceStream.pause();
      const { bootLantern } = await import('./replay/LanternBoot');
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
  const { LANTERN_REEL_UNAVAILABLE, LANTERN_VERSION_REFUSAL, openLanternRefusal, readStandingsReel } = await import('./ui/LanternShow');
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
  void import('./encyclopedia/reader').then(({ openClaimLedger }) => openClaimLedger({ entryId, onWatchTape: watchRunTape }));
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
  void import('./assets/SpriteAnimator').then(({ prefetchNonCriticalSpriteRuntimes }) => prefetchNonCriticalSpriteRuntimes());
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
