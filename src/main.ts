import './styles.css';
import './ui/theme.css';
import { markStartupFrameReady, prefetchNonCriticalGeneratedTextures } from './assets/generated';
import { prefetchNonCriticalSpriteRuntimes } from './assets/SpriteAnimator';
import { installFullBaseBenchmark } from './diagnostics/fullBaseBenchmark';
import { accountSync } from './game/AccountSync';
import { applyStoredDifficultyPreset } from './game/Balance';
import { Game } from './game/Game';
import type { RunReturnResult } from './game/Game';
import { install as installProfiles } from './game/ProfileManager';
import { readRunSuspend } from './game/RunSuspend';
import { DEFAULT_CONTRACT_ID, stagePlayerContractLaunch } from './meta/ContractFamilies';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';

type AssayBench = ReturnType<(typeof import('./crafting/AssayBench'))['install']>;
type StartMenu = import('./ui/menu/StartMenu').StartMenu;
type TownScene = import('./town/TownScene').TownScene;

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Missing #game-canvas element.');
}
const gameCanvas = canvas;

const initialSearch = new URLSearchParams(window.location.search);
if (initialSearch.has('debug') && initialSearch.has('simitem')) {
  void import('./crafting/StatSimHarness').then(({ installStatSimHarnessFromSearch }) => installStatSimHarnessFromSearch());
}

if (initialSearch.has('debug') && initialSearch.has('determinism')) {
  void import('./diagnostics/DeterminismHarness').then(({ installDeterminismHarnessFromSearch }) => installDeterminismHarnessFromSearch());
}

if (initialSearch.get('bench') === 'fullbase') {
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
accountSync.install();
let game: Game | undefined;
let assayBench: AssayBench | undefined;
let profiles: ReturnType<typeof installProfiles> | undefined;
let startMenu: StartMenu | undefined;
let town: TownScene | undefined;
let runReturnTarget: 'menu' | 'board' = 'menu';

afterFirstFrame(() => {
  void import('./story').then(({ installStoryRuntime }) => installStoryRuntime(app));
});

function startGame(returnToMenu: boolean): void {
  const currentSearch = new URLSearchParams(window.location.search);
  applyStoredDifficultyPreset();
  applyUpgradeBudgetsFromBalance();
  game = new Game(gameCanvas, () => assayBench?.focus(), returnToMenu ? runReturnCallback : undefined);
  game.start();
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

function startWithProfiles(options: { showTitle?: boolean; skipTitle?: boolean; returnToMenu?: boolean } = {}): void {
  profiles?.dispose();
  profiles = installProfiles(() => startGame(options.returnToMenu === true), {
    showTitle: options.showTitle,
    skipTitle: options.skipTitle,
  });
}

function showStartMenu(): void {
  startMenu?.dispose();
  void import('./ui/menu/StartMenu').then(({ install }) => {
    if (game || town || profiles) return;
    startMenu?.dispose();
    startMenu = install(app, {
      onNewClaim: () => {
        launchContract(DEFAULT_CONTRACT_ID);
      },
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
      onProfile: () => {
        startMenu?.dispose();
        startMenu = undefined;
        startWithProfiles({ showTitle: true, returnToMenu: true });
      },
    });
  });
}

function continueSavedRun(): void {
  const suspend = readRunSuspend();
  if (suspend?.contractId) {
    stagePlayerContractLaunch(suspend.contractId);
    const nextSearch = new URLSearchParams(window.location.search);
    nextSearch.set('contract', suspend.contractId);
    history.pushState(null, '', `${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
  }
  startMenu?.dispose();
  startMenu = undefined;
  startWithProfiles({ skipTitle: true, returnToMenu: true });
}

function launchContract(contractId: string): void {
  runReturnTarget = 'board';
  stagePlayerContractLaunch(contractId);
  const nextSearch = new URLSearchParams(window.location.search);
  nextSearch.set('contract', contractId);
  history.pushState(null, '', `${window.location.pathname}?${nextSearch.toString()}${window.location.hash}`);
  startMenu?.dispose();
  startMenu = undefined;
  town?.dispose();
  town = undefined;
  startWithProfiles({ skipTitle: true, returnToMenu: true });
}

function runReturnCallback(result: RunReturnResult): void {
  if (runReturnTarget === 'board') returnToTownBoard(result);
  else returnToStartMenu();
}

function returnToTownBoard(result: RunReturnResult): void {
  town?.dispose();
  town = undefined;
  game?.dispose();
  game = undefined;
  assayBench?.dispose();
  assayBench = undefined;
  profiles?.dispose();
  profiles = undefined;
  startMenu?.dispose();
  startMenu = undefined;
  openTown({ openBoard: true, returnResult: result });
}

function returnToStartMenu(): void {
  runReturnTarget = 'menu';
  town?.dispose();
  town = undefined;
  game?.dispose();
  game = undefined;
  assayBench?.dispose();
  assayBench = undefined;
  profiles?.dispose();
  profiles = undefined;
  showStartMenu();
}

if (window.location.search === '') {
  showStartMenu();
} else {
  startWithProfiles();
}

installFullBaseBenchmark();

function openTown(options: { openBoard?: boolean; returnResult?: RunReturnResult } = {}): void {
  markStartupFrameReady();
  void import('./town/TownScene').then(({ TownScene }) => {
    if (game || profiles) return;
    town?.dispose();
    town = new TownScene(gameCanvas, returnToStartMenu, { ...options, onLaunchContract: launchContract });
    town.start();
  });
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
  void prefetchNonCriticalSpriteRuntimes();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    startMenu?.dispose();
    profiles?.dispose();
    assayBench?.dispose();
    town?.dispose();
    game?.dispose();
  });
}
