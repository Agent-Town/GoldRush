export type RunState = 'boot' | 'playing' | 'levelup' | 'dead';

const transitions: Record<RunState, readonly RunState[]> = {
  boot: ['playing'],
  playing: ['levelup', 'dead'],
  levelup: ['playing', 'dead'],
  dead: ['playing'],
};

export class GameState {
  private state: RunState = 'boot';
  private paused = false;

  get current(): RunState {
    return this.state;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get simActive(): boolean {
    return this.state === 'playing' && !this.paused;
  }

  transition(next: RunState): void {
    if (next === this.state) return;
    if (!transitions[this.state].includes(next)) {
      throw new Error(`Invalid run-state transition: ${this.state} -> ${next}`);
    }
    this.state = next;
    if (next !== 'playing') this.paused = false;
  }

  togglePause(): boolean {
    if (this.state !== 'playing') return this.paused;
    this.paused = !this.paused;
    return this.paused;
  }

  restart(): void {
    this.state = 'playing';
    this.paused = false;
  }
}
