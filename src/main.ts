import './styles.css';
import './ui/theme.css';
import { createAdvanceStream } from './assets/AdvanceStream';
import { markStartupFrameReady, prefetchNonCriticalGeneratedTextures } from './assets/generated';
import { accountSync } from './game/AccountSync';
import { applyStoredDifficultyPreset } from './game/Balance';
import type { RunReturnResult } from './game/Game';
import { FIRST_CLAIM_DONE_KEY } from './game/ProfileStorage';
import { applyStoredPerformanceTier } from './game/PerformanceTier';
import { install as installProfiles } from './game/ProfileManager';
import { readRunSuspend } from './game/RunSuspend';
import { activeContract, DEFAULT_CONTRACT_ID, readCharterLaunch, stagePlayerContractLaunch } from './meta/ContractFamilies';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';
import { installClaimLedgerRequestHandler } from './encyclopedia/events';
import { installEpochLedgerDiscovery } from './encyclopedia/state';
import type { LedgerEntryId } from './encyclopedia/registry';
import { installBuildFreshness } from './app/BuildFreshness';
import { seedDebugEraFromSearch } from './meta/DebugEraSeed';
import { reverifyStagedContractLaunch } from './meta/ContractUnlock';
import { reconcileActiveEpoch } from './meta/ResearchTree';

type AssayBench = ReturnType<(typeof import('./crafting/AssayBench'))['install']>;
type Game = import('./game/Game').Game;
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
let assayBench: AssayBench | undefined;
let profiles: ReturnType<typeof installProfiles> | undefined;
let startMenu: StartMenu | undefined;
let town: TownScene | undefined;
const uninstallBuildFreshness = installBuildFreshness(app, () => !game && !profiles && Boolean(startMenu || town));
const uninstallClaimLedgerRequest = installClaimLedgerRequestHandler((entryId) => openClaimLedger(entryId));
installEpochLedgerDiscovery();

const RUN_ROUTE_PARAMS = ['contract', 'seed', 'mode', 'press'] as const;

afterFirstFrame(() => {
  void import('./story').then(({ installStoryRuntime }) => installStoryRuntime(app));
});

async function startGame(): Promise<void> {
  if (__GR_RELEASE_E1__) reconcileActiveEpoch();
  reverifyStagedContractLaunch();
  seedDebugEraFromSearch(gameCanvas);
  advanceStream.enter({ kind: 'run', contractId: activeContract().id });
  const currentSearch = new URLSearchParams(window.location.search);
  const { Game } = await import('./game/Game');
  applyStoredDifficultyPreset();
  applyStoredPerformanceTier(activeContract().id);
  applyUpgradeBudgetsFromBalance();
  game = new Game(gameCanvas, () => assayBench?.focus(), runReturnCallback);
  game.start();
  if (!__GR_RELEASE_E1__ && currentSearch.has('editor')) {
    void import('./editor/DescriptorInspector').then(({ installDescriptorInspector }) => installDescriptorInspector(app));
  }
  releaseStartupAssetGateOnFirstGameFrame();
  installWaveTelegraphPrefetch();
  afterFirstFrame(() => {
    void import('./crafting/AssayBench').then(({ install }) => {
      if (!game) return;
      assayBench = install(app, {
        initiallyOpen: currentSearch.has('profile') || currentSearch.has('queueNow'),
      });
    });
  });
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

function launchContract(contractId: string): void {
  advanceStream.pause();
  markFirstClaimDone();
  stagePlayerContractLaunch(contractId);
  const nextSearch = new URLSearchParams(window.location.search);
  nextSearch.set('contract', contractId);
  history.pushState(null, '', `${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
  window.location.reload();
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
    ['assay bench', assayBench],
    ['profiles', profiles],
    ['start menu', startMenu],
  ] as const;
  town = undefined;
  game = undefined;
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
const MENU_SAFE_PARAMS = new Set(['town3dPilot', 'run3dPilot', 'tier']);
if (history.state?.goldRushScene === 'town') {
  openTown();
} else if (history.state?.goldRushScene === 'menu') {
  showStartMenu();
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
    town = new TownScene(gameCanvas, returnToStartMenu, { ...options, onLaunchContract: launchContract });
    town.start();
  });
}

function openClaimLedger(entryId?: LedgerEntryId): void {
  if (game) {
    game.openClaimLedger(entryId);
    return;
  }
  void import('./encyclopedia/reader').then(({ openClaimLedger }) => openClaimLedger({ entryId }));
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
