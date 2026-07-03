import * as THREE from 'three';

export type Damageable = {
  readonly isAlive: boolean;
  readonly position: THREE.Vector3;
};

export class TargetingSystem<T extends Damageable = Damageable> {
  private current: T | null = null;

  findNearest(from: THREE.Vector3, range: number, targets: readonly T[]): T | null {
    const stickyRange = range + 1;
    if (this.current?.isAlive && this.distanceSqXZ(from, this.current.position) <= stickyRange * stickyRange) {
      return this.current;
    }

    let best: T | null = null;
    let bestDistanceSq = range * range;
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      if (!target?.isAlive) continue;
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

  private distanceSqXZ(a: THREE.Vector3, b: THREE.Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return dx * dx + dz * dz;
  }
}
