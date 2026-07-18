import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import type { CombatSystem, ShooterHandle } from './CombatSystem';

type E8WeaponId = 'sunlineBeam' | 'kineticLobber' | 'magnetGrapple';

export type E8ArsenalDiagnostics = {
  available: boolean;
  multiplayerPosture: 'single-player-gated';
  items: {
    sunlineBeam: boolean;
    kineticLobber: boolean;
    magnetGrapple: boolean;
    lensTurret: boolean;
    breachPatchSeals: boolean;
  };
  fires: Record<E8WeaponId, number>;
  grapplePulls: number;
  silentCollisions: number;
  vfxClasses: readonly ['light', 'kinetic', 'magnetic'];
  lensSilhouette: { base: number; transformed: number };
  breachSealLimit: number;
};

export class E8ArsenalSystem {
  private readonly fires: Record<E8WeaponId, number> = { sunlineBeam: 0, kineticLobber: 0, magnetGrapple: 0 };
  private readonly unsubscribes: Array<() => void> = [];
  private grapplePulls = 0;
  private silentCollisions = 0;

  constructor(
    combat: CombatSystem,
    private readonly enemies: EnemyPool,
    getPosition: () => THREE.Vector3,
    private readonly hasResearch: (id: string) => boolean,
    private readonly eraAvailable: () => boolean,
    private readonly combatEnabled: () => boolean,
  ) {
    const arsenal = Balance.e8Arsenal;
    this.unsubscribes.push(
      combat.registerShooter(this.shooter('sunlineBeam', 'vacuum_lenses', getPosition, {
        range: arsenal.sunlineBeam.range,
        cooldown: 1 / arsenal.sunlineBeam.fireRate,
        damage: arsenal.sunlineBeam.damage,
        projSpeed: arsenal.sunlineBeam.boltSpeed,
        volley: 1,
      })),
      combat.registerShooter(this.shooter('kineticLobber', 'vacuum_lenses', getPosition, {
        kind: 'lob',
        range: arsenal.kineticLobber.range,
        cooldown: arsenal.kineticLobber.cooldown,
        damage: arsenal.kineticLobber.damage,
        projSpeed: 0,
        volley: 1,
        aoe: { radius: arsenal.kineticLobber.radius, airTime: arsenal.kineticLobber.airTime },
      })),
      combat.registerShooter(this.shooter('magnetGrapple', 'magnet_grapple', getPosition, {
        range: arsenal.magnetGrapple.range,
        cooldown: arsenal.magnetGrapple.cooldown,
        damage: 0,
        projSpeed: arsenal.magnetGrapple.boltSpeed,
        volley: 1,
        canTarget: (enemy) => this.canGrapple(enemy),
        onFire: () => {
          const pair = this.nearestPair(getPosition());
          if (pair) this.pullTogether(pair[0], pair[1]);
        },
      })),
    );
  }

  get lensTurretEnabled(): boolean {
    return this.itemAvailable('lens_turret');
  }

  get breachSealsEnabled(): boolean {
    return this.itemAvailable('breach_seals');
  }

  get diagnostics(): E8ArsenalDiagnostics {
    return {
      available: this.eraAvailable(),
      multiplayerPosture: 'single-player-gated',
      items: {
        sunlineBeam: this.itemAvailable('vacuum_lenses'),
        kineticLobber: this.itemAvailable('vacuum_lenses'),
        magnetGrapple: this.itemAvailable('magnet_grapple'),
        lensTurret: this.lensTurretEnabled,
        breachPatchSeals: this.breachSealsEnabled,
      },
      fires: { ...this.fires },
      grapplePulls: this.grapplePulls,
      silentCollisions: this.silentCollisions,
      vfxClasses: ['light', 'kinetic', 'magnetic'],
      lensSilhouette: {
        base: Balance.e8Arsenal.lensTurret.silhouetteHeight,
        transformed: Balance.e8Arsenal.lensTurret.silhouetteHeight,
      },
      breachSealLimit: Balance.e8Arsenal.breachSeal.maxActive,
    };
  }

  reset(): void {
    Object.assign(this.fires, { sunlineBeam: 0, kineticLobber: 0, magnetGrapple: 0 });
    this.grapplePulls = 0;
    this.silentCollisions = 0;
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribes) unsubscribe();
  }

  private shooter(
    id: E8WeaponId,
    researchId: string,
    getPos: () => THREE.Vector3,
    config: Omit<ShooterHandle, 'resumeKey' | 'id' | 'enabled' | 'getPos' | 'onVolleyFired'>,
  ): ShooterHandle {
    return {
      ...config,
      resumeKey: `orbital:${id}`,
      id: `orbital_${id}`,
      suspend: false,
      getPos,
      enabled: () => this.combatEnabled() && this.itemAvailable(researchId),
      onVolleyFired: () => { this.fires[id] += 1; },
    };
  }

  private itemAvailable(researchId: string): boolean {
    return this.eraAvailable() && this.hasResearch(researchId);
  }

  private nearestPair(origin: THREE.Vector3): [ClaimJumperEnemy, ClaimJumperEnemy] | null {
    const rangeSq = Balance.e8Arsenal.magnetGrapple.range ** 2;
    const candidates = this.enemies.all
      .filter((enemy) => this.canGrapple(enemy) && enemy.position.distanceToSquared(origin) <= rangeSq)
      .sort((a, b) => a.position.distanceToSquared(origin) - b.position.distanceToSquared(origin) || a.id - b.id);
    return candidates.length >= 2 ? [candidates[0]!, candidates[1]!] : null;
  }

  private canGrapple(enemy: ClaimJumperEnemy): boolean {
    return enemy.isAlive && !enemy.eliteKind && !enemy.bossGroupId;
  }

  private pullTogether(a: ClaimJumperEnemy, b: ClaimJumperEnemy): void {
    const dx = b.position.x - a.position.x;
    const dz = b.position.z - a.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= 0.001) return;
    const step = Math.min(Balance.e8Arsenal.magnetGrapple.pullDistance, distance / 2);
    const x = (dx / distance) * step;
    const z = (dz / distance) * step;
    a.position.x += x;
    a.position.z += z;
    b.position.x -= x;
    b.position.z -= z;
    this.grapplePulls += 1;
    if (distance - step * 2 <= Balance.e8Arsenal.magnetGrapple.collisionRadius) {
      a.stagger(Balance.e8Arsenal.magnetGrapple.staggerSeconds);
      b.stagger(Balance.e8Arsenal.magnetGrapple.staggerSeconds);
      this.silentCollisions += 1;
    }
  }
}
