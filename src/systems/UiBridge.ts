import { Balance } from '../game/Balance';
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
  announcement: string | null;
  announcementAt: number;
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
    xpNeed: Balance.xp.needBase,
    level: 1,
    wave: 0,
    waveState: 'quiet',
    announcement: 'Stake your claim.',
    announcementAt: 0,
    enemiesAlive: 0,
    timeAlive: 0,
    state: 'boot',
    paused: false,
    canAffordBeacon: false,
  };

  announce(text: string, atSim: number): void {
    this.snapshot.announcement = text;
    this.snapshot.announcementAt = atSim;
  }

  build(
    state: GameState,
    timeAlive: number,
    hp: number,
    maxHp: number,
    enemiesAlive: number,
    gold: number,
    xp: number,
    wave: number,
    waveState: WaveState,
  ): UiSnapshot {
    this.snapshot.gold = gold;
    this.snapshot.xp = xp;
    this.snapshot.xpNeed = Balance.xp.needBase;
    this.snapshot.timeAlive = timeAlive;
    this.snapshot.state = state.current;
    this.snapshot.paused = state.isPaused;
    this.snapshot.hp = hp;
    this.snapshot.maxHp = maxHp;
    this.snapshot.enemiesAlive = enemiesAlive;
    this.snapshot.wave = wave;
    this.snapshot.waveState = waveState;
    return this.snapshot;
  }
}
