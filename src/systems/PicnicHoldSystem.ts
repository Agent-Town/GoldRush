import type { ContractStakeMarker } from '../meta/ContractFamilies';

export const PICNIC_HOLD_RADIUS = 3;
export const PICNIC_HOLD_SECONDS = 6;

type Positioned = { position: { x: number; z: number } };

export type PicnicStakeState = Readonly<{
  id: string;
  position: { x: number; z: number };
  held: boolean;
  claimed: boolean;
  contested: boolean;
  timer: number;
}>;

export class PicnicHoldSystem {
  private readonly stakes: Array<{
    id: string;
    position: { x: number; z: number };
    claimed: boolean;
    contested: boolean;
    timer: number;
  }>;
  private lost = false;

  constructor(
    private readonly enabled: boolean,
    markers: readonly ContractStakeMarker[],
    private readonly onAllClaimed: () => void,
  ) {
    this.stakes = enabled
      ? markers.map(({ id, x, z }) => ({ id, position: { x, z }, claimed: false, contested: false, timer: 0 }))
      : [];
  }

  update(delta: number, enemies: readonly Positioned[], defenders: readonly Positioned[]): void {
    if (!this.enabled || this.lost) return;
    for (const stake of this.stakes) {
      if (stake.claimed) continue;
      const enemyPresent = enemies.some((enemy) => inside(enemy.position, stake.position));
      const defenderPresent = defenders.some((defender) => inside(defender.position, stake.position));
      stake.contested = enemyPresent && defenderPresent;
      stake.timer = enemyPresent && !defenderPresent
        ? Math.min(PICNIC_HOLD_SECONDS, stake.timer + delta)
        : 0;
      if (stake.timer >= PICNIC_HOLD_SECONDS) stake.claimed = true;
    }
    if (this.stakes.length > 0 && this.stakes.every(({ claimed }) => claimed)) {
      this.lost = true;
      this.onAllClaimed();
    }
  }

  reset(): void {
    this.lost = false;
    for (const stake of this.stakes) Object.assign(stake, { claimed: false, contested: false, timer: 0 });
  }

  get diagnostics(): readonly PicnicStakeState[] {
    return this.stakes.map(({ id, position, claimed, contested, timer }) => ({
      id,
      position: { ...position },
      held: !claimed,
      claimed,
      contested,
      timer,
    }));
  }
}

function inside(point: { x: number; z: number }, center: { x: number; z: number }): boolean {
  return Math.hypot(point.x - center.x, point.z - center.z) <= PICNIC_HOLD_RADIUS;
}
