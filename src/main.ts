import './styles.css';
import './ui/theme.css';
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

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.dispose();
  });
}
