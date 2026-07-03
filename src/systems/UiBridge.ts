import type { GameState, RunState } from '../game/GameState';

export type WaveState = 'quiet' | 'warning' | 'active' | 'cleared';

export type UiSnapshot = {
  hp: number;
  maxHp: number;
  gold: number;
  xp: number;
  xpNeed: number;
  level: number;
  wave: number;
  waveState: WaveState;
  enemiesAlive: number;
  timeAlive: number;
  state: RunState;
  paused: boolean;
  canAffordBeacon: boolean;
};

export class UiBridge {
  private readonly snapshot: UiSnapshot = {
    hp: 100,
    maxHp: 100,
    gold: 0,
    xp: 0,
    xpNeed: 12,
    level: 1,
    wave: 0,
    waveState: 'quiet',
    enemiesAlive: 0,
    timeAlive: 0,
    state: 'boot',
    paused: false,
    canAffordBeacon: false,
  };

  build(state: GameState, timeAlive: number, hp: number, maxHp: number, enemiesAlive: number): UiSnapshot {
    this.snapshot.timeAlive = timeAlive;
    this.snapshot.state = state.current;
    this.snapshot.paused = state.isPaused;
    this.snapshot.hp = hp;
    this.snapshot.maxHp = maxHp;
    this.snapshot.enemiesAlive = enemiesAlive;
    return this.snapshot;
  }
}
