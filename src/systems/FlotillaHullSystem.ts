import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { BoatRiderPosition } from '../entities/ClaimBoat';
import type { ContractManifest } from '../meta/ContractFamilies';

type Point = Readonly<{ x: number; z: number }>;
type HullConfig = Point & Readonly<{ id: string; district: string; radius: number }>;
type HullState = { id: string; district: string; radius: number; x: number; z: number; integrity: number; lost: boolean };

export type FlotillaHullDiagnostics = Readonly<{
  hulls: readonly Readonly<HullConfig & { integrity: number; lost: boolean; straggler: boolean }>[];
  centroid: Point;
  allLost: boolean;
  reshapeCooldownSeconds: number;
}>;

export const FLOTILLA_HULL_RULES = Object.freeze({
  integrity: 96,
  contactCooldownSeconds: 0.8,
  reshapeCooldownSeconds: 8,
  reshapeDistance: 6,
  minimumHullsAlive: 1,
});

export class FlotillaHullSystem {
  private hulls: HullState[];
  private readonly nextContactAt = new Map<number, number>();
  private nextReshapeAt = 0;
  private currentAt = 0;

  private constructor(private readonly config: readonly HullConfig[], private readonly onHullLost: (id: string) => void) {
    this.hulls = config.map((hull) => ({ ...hull, integrity: FLOTILLA_HULL_RULES.integrity, lost: false }));
  }

  static create(contract: ContractManifest, onHullLost: (id: string) => void = () => undefined): FlotillaHullSystem | null {
    const config = contract.id === 'e5-flotilla' ? contract.tileParams.flotilla?.hulls : undefined;
    if (!config) return null;
    if (config.length !== 3 || config.some(({ id, district, x, z, radius }) => !id || !district || !Number.isFinite(x + z) || radius <= 0)) {
      throw new Error('The Flotilla hull data is incomplete.');
    }
    return new FlotillaHullSystem(config, onHullLost);
  }

  advance(at: number, enemies: readonly ClaimJumperEnemy[]): boolean {
    this.currentAt = at;
    for (const enemy of enemies) {
      if (!enemy.isAlive || (this.nextContactAt.get(enemy.id) ?? 0) > at) continue;
      const hull = this.hulls.find((entry) => !entry.lost && Math.hypot(enemy.position.x - entry.x, enemy.position.z - entry.z) <= entry.radius + enemy.hitRadius);
      if (!hull) continue;
      this.nextContactAt.set(enemy.id, at + FLOTILLA_HULL_RULES.contactCooldownSeconds);
      hull.integrity = Math.max(0, hull.integrity - enemy.contactDamage);
      if (hull.integrity > 0) continue;
      hull.lost = true;
      this.onHullLost(hull.id);
    }
    return this.hulls.every(({ lost }) => lost);
  }

  reanchor(hullId: string, riders: readonly BoatRiderPosition[] = []): boolean {
    const hull = this.hulls.find(({ id }) => id === hullId);
    if (!hull || hull.lost || this.currentAt < this.nextReshapeAt) return false;
    const centroid = this.centroid();
    const dx = centroid.x - hull.x;
    const dz = centroid.z - hull.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= 0.01) return false;
    let step = Math.min(FLOTILLA_HULL_RULES.reshapeDistance, distance);
    const ux = dx / distance, uz = dz / distance;
    for (const other of this.hulls) {
      if (other === hull || other.lost) continue;
      const ox = hull.x - other.x, oz = hull.z - other.z;
      const approach = -(ox * ux + oz * uz);
      const radius = hull.radius + other.radius;
      const discriminant = approach * approach - (ox * ox + oz * oz - radius * radius);
      if (approach > 0 && discriminant > 0) {
        step = Math.min(step, Math.max(0, approach - Math.sqrt(discriminant)));
      }
    }
    if (step <= 0.01) return false;
    for (const rider of riders) {
      if (Math.hypot(rider.x - hull.x, rider.z - hull.z) > hull.radius) continue;
      rider.x += dx / distance * step;
      rider.z += dz / distance * step;
    }
    hull.x += dx / distance * step;
    hull.z += dz / distance * step;
    this.nextReshapeAt = this.currentAt + FLOTILLA_HULL_RULES.reshapeCooldownSeconds;
    return true;
  }

  targetPosition(fallback: Point): Point {
    return this.straggler() ?? fallback;
  }

  /** Move the surviving formation between authored anchorages, retaining its current shape. */
  moveAnchorage(dx: number, dz: number, riders: readonly BoatRiderPosition[]): void {
    const alive = this.hulls.filter(({ lost }) => !lost);
    for (const rider of riders) {
      if (!alive.some(hull => Math.hypot(rider.x - hull.x, rider.z - hull.z) <= hull.radius)) continue;
      rider.x += dx; rider.z += dz;
    }
    for (const hull of alive) { hull.x += dx; hull.z += dz; }
  }

  reset(): void {
    this.hulls = this.config.map((hull) => ({ ...hull, integrity: FLOTILLA_HULL_RULES.integrity, lost: false }));
    this.nextContactAt.clear();
    this.nextReshapeAt = 0;
    this.currentAt = 0;
  }

  get diagnostics(): FlotillaHullDiagnostics {
    const straggler = this.straggler();
    return {
      hulls: this.hulls.map((hull) => ({ ...hull, straggler: hull.id === straggler?.id })),
      centroid: this.centroid(),
      allLost: this.hulls.every(({ lost }) => lost),
      reshapeCooldownSeconds: Math.max(0, this.nextReshapeAt - this.currentAt),
    };
  }

  private centroid(): Point {
    const alive = this.hulls.filter(({ lost }) => !lost);
    const source = alive.length > 0 ? alive : this.hulls;
    return {
      x: source.reduce((sum, hull) => sum + hull.x, 0) / source.length,
      z: source.reduce((sum, hull) => sum + hull.z, 0) / source.length,
    };
  }

  private straggler(): HullState | null {
    const centroid = this.centroid();
    return this.hulls
      .filter(({ lost }) => !lost)
      .reduce<HullState | null>((best, hull) => {
        if (!best) return hull;
        const distance = (hull.x - centroid.x) ** 2 + (hull.z - centroid.z) ** 2;
        const bestDistance = (best.x - centroid.x) ** 2 + (best.z - centroid.z) ** 2;
        return distance > bestDistance ? hull : best;
      }, null);
  }
}
