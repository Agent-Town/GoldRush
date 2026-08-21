import type { ContractManifest, ContractStakeMarker } from '../meta/ContractFamilies';

export const PICNIC_HOLD_RADIUS = 3;
export const PICNIC_HOLD_SECONDS = 6;
export const PICNIC_STAKE_PRESS_WEIGHT = 0.25;
export const PICNIC_ACTIVE_DEFENSE_SECONDS = 5;

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
  private lastHeroDamageAt = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly enabled: boolean,
    markers: readonly ContractStakeMarker[],
    private readonly onAllClaimed: () => void,
  ) {
    this.stakes = enabled
      ? markers.map(({ id, x, z }) => ({ id, position: { x, z }, claimed: false, contested: false, timer: 0 }))
      : [];
  }

  /**
   * OWNER RULING (2026-08-22), verbatim: "flip the stakes"
   *
   * The second half of the 2026-08-21 ruling quoted at `contested()` below, and the half that makes
   * it bite. With the predicate built and correct, `e6-picnic` STILL idle-secured both bench seeds
   * (`fnv1a32:b9f476a6` / `fnv1a32:612de94b`, wave 20, `calls: 0`) — because all three
   * `stakeMarkers` carried `heroStart: true`, the hero opened the run standing inside one of the
   * three discs, and the headless hero auto-fires (`HeadlessContractSim.ts:480` — `heroShooter`'s
   * gate has no policy term), so its own stake's active-defense window refreshed every second and
   * that stake could never fall. Two stakes fell; the third was the hero's body.
   *
   * The ruling flips all three to `heroStart: false`, so the hero starts at the engine default
   * (0,12) — inside `mesa-meadow`, outside every disc — and the ruled pressure reaches all three.
   * Nothing in this file changed for it: the cure is contract DATA, and the mechanic was already
   * right. `reviews/e6-picnic-admission.md` carries the measurement on both sides of the flip.
   */
  static isEnabled(contract: Pick<ContractManifest, 'twist'>): boolean {
    return contract.twist.picnicHold === true;
  }

  get active(): boolean {
    return this.enabled;
  }

  recordHeroDamage(at: number): void {
    if (this.enabled) this.lastHeroDamageAt = at;
  }

  pressureTarget(
    enemy: { id: number; position: { x: number; z: number } },
    structures: readonly Positioned[],
    hero: Positioned,
    at: number,
  ): { x: number; z: number } | null {
    if (!this.enabled || enemy.id % Math.round(1 / PICNIC_STAKE_PRESS_WEIGHT) !== 0) return null;
    const undefended = this.stakes.filter((stake) => !stake.claimed && !this.contested(stake, structures, hero, at));
    if (undefended.length === 0) return null;
    return { ...undefended.reduce((nearest, stake) => (
      distanceSquared(enemy.position, stake.position) < distanceSquared(enemy.position, nearest.position) ? stake : nearest
    )).position };
  }

  update(delta: number, at: number, enemies: readonly Positioned[], structures: readonly Positioned[], hero: Positioned): void {
    if (!this.enabled || this.lost) return;
    for (const stake of this.stakes) {
      if (stake.claimed) continue;
      const enemyPresent = enemies.some((enemy) => inside(enemy.position, stake.position));
      const defenderPresent = this.contested(stake, structures, hero, at);
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
    this.lastHeroDamageAt = Number.NEGATIVE_INFINITY;
    for (const stake of this.stakes) Object.assign(stake, { claimed: false, contested: false, timer: 0 });
  }

  private contested(
    stake: { position: { x: number; z: number } },
    structures: readonly Positioned[],
    hero: Positioned,
    at: number,
  ): boolean {
    // OWNER RULING (2026-08-21), verbatim: "picnic - no, just standing there should not win"
    return structures.some((structure) => inside(structure.position, stake.position))
      || (at - this.lastHeroDamageAt <= PICNIC_ACTIVE_DEFENSE_SECONDS && inside(hero.position, stake.position));
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

function distanceSquared(point: { x: number; z: number }, center: { x: number; z: number }): number {
  return (point.x - center.x) ** 2 + (point.z - center.z) ** 2;
}
