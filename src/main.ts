import './styles.css';
import './ui/theme.css';
import { install as installAssayBench } from './crafting/AssayBench';
import { applyStoredDifficultyPreset } from './game/Balance';
import { Game } from './game/Game';
import { install as installProfiles } from './game/ProfileManager';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Missing #game-canvas element.');
}

const app = document.querySelector<HTMLElement>('#app') ?? document.body;
const search = new URLSearchParams(window.location.search);
let game: Game | undefined;
let assayBench: ReturnType<typeof installAssayBench>;

const profiles = installProfiles(() => {
  applyStoredDifficultyPreset();
  applyUpgradeBudgetsFromBalance();
  assayBench = installAssayBench(app, {
    initiallyOpen: search.has('profile') || search.has('queueNow'),
  });
  game = new Game(canvas, () => assayBench?.focus());
  game.start();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    profiles.dispose();
    assayBench?.dispose();
    game?.dispose();
  });
}
