import './styles.css';
import './ui/theme.css';
import { install as installAssayBench } from './crafting/AssayBench';
import { applyStoredDifficultyPreset } from './game/Balance';
import { Game } from './game/Game';
import { applyUpgradeBudgetsFromBalance } from './game/Upgrades';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');

if (!canvas) {
  throw new Error('Missing #game-canvas element.');
}

applyStoredDifficultyPreset();
applyUpgradeBudgetsFromBalance();

const game = new Game(canvas);
game.start();
const assayBench = installAssayBench(document.querySelector<HTMLElement>('#app') ?? document.body);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    assayBench?.dispose();
    game.dispose();
  });
}
