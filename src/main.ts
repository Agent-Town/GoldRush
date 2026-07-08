import './styles.css';
import './ui/theme.css';
import { install as installAssayBench } from './crafting/AssayBench';
import { installFullBaseBenchmark } from './diagnostics/fullBaseBenchmark';
import { accountSync } from './game/AccountSync';
import { applyStoredDifficultyPreset } from './game/Balance';
import { Game } from './game/Game';
import { install as installProfiles } from './game/ProfileManager';
import { readRunSuspend } from './game/RunSuspend';
import { DEFAULT_CONTRACT_ID, stagePlayerContractLaunch } from './meta/ContractFamilies';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';
import { installStoryRuntime } from './story';
import { TownScene } from './town/TownScene';
import { install as installStartMenu, type StartMenu } from './ui/menu/StartMenu';

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
installStoryRuntime(app);
accountSync.install();
let game: Game | undefined;
let assayBench: ReturnType<typeof installAssayBench> | undefined;
let profiles: ReturnType<typeof installProfiles> | undefined;
let startMenu: StartMenu | undefined;
let town: TownScene | undefined;
let runReturnTarget: 'menu' | 'board' = 'menu';

function startGame(returnToMenu: boolean): void {
  const currentSearch = new URLSearchParams(window.location.search);
  applyStoredDifficultyPreset();
  applyUpgradeBudgetsFromBalance();
  assayBench = installAssayBench(app, {
    initiallyOpen: currentSearch.has('profile') || currentSearch.has('queueNow'),
  });
  game = new Game(gameCanvas, () => assayBench?.focus(), returnToMenu ? runReturnCallback : undefined);
  game.start();
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
  startMenu = installStartMenu(app, {
    onNewClaim: () => {
      launchContract(DEFAULT_CONTRACT_ID);
    },
    onContinue: () => {
      continueSavedRun();
    },
    onEnterTown: () => {
      startMenu?.dispose();
      startMenu = undefined;
      town = new TownScene(gameCanvas, returnToStartMenu, { onLaunchContract: launchContract });
      town.start();
    },
    onProfile: () => {
      startMenu?.dispose();
      startMenu = undefined;
      startWithProfiles({ showTitle: true, returnToMenu: true });
    },
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

function runReturnCallback(): void {
  if (runReturnTarget === 'board') returnToTownBoard();
  else returnToStartMenu();
}

function returnToTownBoard(): void {
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
  town = new TownScene(gameCanvas, returnToStartMenu, { openBoard: true, onLaunchContract: launchContract });
  town.start();
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

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    startMenu?.dispose();
    profiles?.dispose();
    assayBench?.dispose();
    town?.dispose();
    game?.dispose();
  });
}
