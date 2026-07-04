import * as THREE from 'three';

export type Damageable = {
  readonly isAlive: boolean;
  readonly position: THREE.Vector3;
};

export type GoldHolding = {
  id: string;
  kind: 'stockpile' | 'pickup';
  position: THREE.Vector3;
  active: boolean;
  amount: number;
  pickupIndex?: number;
};

export type BuildingTarget = {
  id: string;
  family: string;
  index: number;
  position: THREE.Vector3;
  active: boolean;
  hp: number;
  maxHp: number;
  reachRadius: number;
};

export class TargetingSystem<T extends Damageable = Damageable> {
  private current: T | null = null;
  private readonly goldHoldings: GoldHolding[] = [];
  private readonly buildings: BuildingTarget[] = [];

  findNearest(from: THREE.Vector3, range: number, targets: readonly T[], eligible?: (target: T) => boolean): T | null {
    const stickyRange = range + 1;
    if (
      this.current?.isAlive &&
      (!eligible || eligible(this.current)) &&
      this.distanceSqXZ(from, this.current.position) <= stickyRange * stickyRange
    ) {
      return this.current;
    }

    let best: T | null = null;
    let bestDistanceSq = range * range;
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      if (!target?.isAlive) continue;
      if (eligible && !eligible(target)) continue;
      const distanceSq = this.distanceSqXZ(from, target.position);
      if (distanceSq < bestDistanceSq) {
        best = target;
        bestDistanceSq = distanceSq;
      }
    }

    this.current = best;
    return best;
  }

  reset(): void {
    this.current = null;
  }

  registerGoldHolding(holding: GoldHolding): void {
    if (!this.goldHoldings.includes(holding)) this.goldHoldings.push(holding);
  }

  clearGoldHoldings(): void {
    this.goldHoldings.length = 0;
  }

  nearestGoldHolding(from: THREE.Vector3): GoldHolding | null {
    let bestStockpile: GoldHolding | null = null;
    let bestStockpileDistanceSq = Number.POSITIVE_INFINITY;
    let bestPickup: GoldHolding | null = null;
    let bestPickupDistanceSq = Number.POSITIVE_INFINITY;

    for (let i = 0; i < this.goldHoldings.length; i += 1) {
      const holding = this.goldHoldings[i];
      if (!holding?.active || holding.amount <= 0) continue;
      const distanceSq = this.distanceSqXZ(from, holding.position);
      if (holding.kind === 'stockpile') {
        if (distanceSq < bestStockpileDistanceSq) {
          bestStockpile = holding;
          bestStockpileDistanceSq = distanceSq;
        }
      } else if (distanceSq < bestPickupDistanceSq) {
        bestPickup = holding;
        bestPickupDistanceSq = distanceSq;
      }
    }

    return bestStockpile ?? bestPickup;
  }

  registerBuilding(building: BuildingTarget): void {
    if (!this.buildings.includes(building)) this.buildings.push(building);
  }

  clearBuildings(): void {
    this.buildings.length = 0;
  }

  nearestBuilding(from: THREE.Vector3): BuildingTarget | null {
    let best: BuildingTarget | null = null;
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.buildings.length; i += 1) {
      const building = this.buildings[i];
      if (!building?.active || building.hp <= 0) continue;
      const distanceSq = this.distanceSqXZ(from, building.position);
      if (distanceSq < bestDistanceSq) {
        best = building;
        bestDistanceSq = distanceSq;
      }
    }
    return best;
  }

  private distanceSqXZ(a: THREE.Vector3, b: THREE.Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return dx * dx + dz * dz;
  }
}
