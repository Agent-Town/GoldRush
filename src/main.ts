import './styles.css';
import './ui/theme.css';
import { install as installAssayBench } from './crafting/AssayBench';
import { installFullBaseBenchmark } from './diagnostics/fullBaseBenchmark';
import { applyStoredDifficultyPreset } from './game/Balance';
import { Game } from './game/Game';
import { install as installProfiles } from './game/ProfileManager';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';
import { TownScene } from './town/TownScene';
import { install as installStartMenu, type StartMenu } from './ui/menu/StartMenu';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Missing #game-canvas element.');
}
const gameCanvas = canvas;

const initialSearch = new URLSearchParams(window.location.search);
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
const search = new URLSearchParams(window.location.search);
let game: Game | undefined;
let assayBench: ReturnType<typeof installAssayBench> | undefined;
let profiles: ReturnType<typeof installProfiles> | undefined;
let startMenu: StartMenu | undefined;
let town: TownScene | undefined;

function startGame(returnToMenu: boolean): void {
  applyStoredDifficultyPreset();
  applyUpgradeBudgetsFromBalance();
  assayBench = installAssayBench(app, {
    initiallyOpen: search.has('profile') || search.has('queueNow'),
  });
  game = new Game(gameCanvas, () => assayBench?.focus(), returnToMenu ? returnToStartMenu : undefined);
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
      startMenu?.dispose();
      startMenu = undefined;
      startWithProfiles({ skipTitle: true, returnToMenu: true });
    },
    onContinue: () => {
      startMenu?.dispose();
      startMenu = undefined;
      startWithProfiles({ skipTitle: true, returnToMenu: true });
    },
    onEnterTown: () => {
      startMenu?.dispose();
      startMenu = undefined;
      town = new TownScene(gameCanvas, returnToStartMenu);
      town.start();
    },
    onProfile: () => {
      startMenu?.dispose();
      startMenu = undefined;
      startWithProfiles({ showTitle: true, returnToMenu: true });
    },
  });
}

function returnToStartMenu(): void {
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
