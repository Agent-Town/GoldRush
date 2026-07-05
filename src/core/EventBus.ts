export type RunSummary = {
  wavesSurvived: number;
  goldPanned: number;
  goldStolen: number;
  goldReclaimed: number;
  buildingsBuilt: number;
};

export type RunEndReason = 'death' | 'secured' | 'rush';

export type GameEvent =
  | {
      type: 'hero_damaged';
      at: number;
      amount: number;
      hp: number;
      maxHp: number;
      sourceId: number;
    }
  | {
      type: 'hero_died';
      at: number;
      timeAlive: number;
      kills: number;
      goldPanned: number;
      spent: number;
      beaconsBuilt: number;
      wavesSurvived: number;
      weaponToggles: number;
      blastTime: number;
    }
  | {
      type: 'enemy_killed';
      at: number;
      enemyId: number;
      xp: number;
    }
  | {
      type: 'building_damaged';
      at: number;
      family: string;
      index: number;
      hp: number;
      maxHp: number;
      sourceId: number;
    }
  | {
      type: 'building_wrecked';
      at: number;
      family: string;
      index: number;
      sourceId: number;
    }
  | {
      type: 'wave_started';
      at: number;
      wave: number;
    }
  | {
      type: 'run_started';
      at: number;
      runId: number;
    }
  | {
      type: 'run_ended';
      at: number;
      runId: number;
      reason: RunEndReason;
      summary: RunSummary;
    };

type Handler<T extends GameEvent['type']> = (event: Extract<GameEvent, { type: T }>) => void;

export class EventBus {
  private readonly handlers = new Map<GameEvent['type'], Set<(event: GameEvent) => void>>();

  on<T extends GameEvent['type']>(type: T, handler: Handler<T>): () => void {
    let handlersForType = this.handlers.get(type);
    if (!handlersForType) {
      handlersForType = new Set();
      this.handlers.set(type, handlersForType);
    }

    const wrapped = handler as (event: GameEvent) => void;
    handlersForType.add(wrapped);
    return () => {
      handlersForType?.delete(wrapped);
    };
  }

  emit(event: GameEvent): void {
    const handlersForType = this.handlers.get(event.type);
    if (!handlersForType) return;

    for (const handler of handlersForType) {
      handler(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
