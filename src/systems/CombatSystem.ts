import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { Hero } from '../entities/Hero';
import type { ProjectilePool } from '../entities/Projectile';
import type { XpMotePool } from '../entities/XpMote';
import type { EnemyPool } from '../entities/pools';
import { isCombatDamageDisabled } from '../core/DebugParams';
import { Balance } from '../game/Balance';
import type { AudioSystem } from './AudioSystem';
import { TargetingSystem } from './TargetingSystem';
import type { CombatVfx } from './CombatVfx';

export type ShooterHandle = {
  id?: string;
  getPos: () => THREE.Vector3;
  range: number;
  cooldown: number;
  damage: number;
  getDamage?: () => number;
  projSpeed: number;
  volley: number;
};

type ShooterState = {
  handle: ShooterHandle;
  timer: number;
  targeting: TargetingSystem<ClaimJumperEnemy>;
};

export class CombatSystem {
  private readonly rigs: ShooterState[] = [];
  private readonly scratchOrigin = new THREE.Vector3();
  private readonly ownerKills: Record<string, number> = {};
  private xp = 0;
  private currentAt = 0;

  constructor(
    private readonly events: EventBus,
    private readonly hero: Hero,
    private readonly enemies: EnemyPool,
    private readonly projectiles: ProjectilePool,
    private readonly motes: XpMotePool,
    private readonly vfx: CombatVfx,
    private readonly audio: AudioSystem,
    private readonly onHeroDied: () => void,
    private readonly onXpCollect?: (position: THREE.Vector3, value: number) => void,
    private readonly onEnemyKilled?: (position: THREE.Vector3) => void,
  ) {}

  get xpCount(): number {
    return this.xp;
  }

  get boltsAlive(): number {
    return this.projectiles.activeCount;
  }

  get killsByOwner(): Readonly<Record<string, number>> {
    return this.ownerKills;
  }

  registerShooter(handle: ShooterHandle): () => void {
    const state = { handle, timer: 0, targeting: new TargetingSystem<ClaimJumperEnemy>() };
    this.rigs.push(state);
    return () => {
      const index = this.rigs.indexOf(state);
      if (index >= 0) this.rigs.splice(index, 1);
    };
  }

  setTime(at: number): void {
    this.currentAt = at;
  }

  update(delta: number, at: number): void {
    this.currentAt = at;
    this.updateRigArcs(delta);

    let remaining = delta;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 30);
      this.projectiles.update(step);
      this.resolveBoltHits(at);
      remaining -= step;
    }

    const gained = this.motes.update(delta, this.hero.group.position, this.onXpCollect);
    if (gained > 0) this.xp += gained;
  }

  readonly handleEnemyContact = (enemy: ClaimJumperEnemy): void => {
    if (isCombatDamageDisabled()) return;

    const result = this.hero.takeDamage(Balance.enemy.contactDamage);
    if (!result.applied) return;

    this.events.emit({
      type: 'hero_damaged',
      at: this.currentAt,
      amount: Balance.enemy.contactDamage,
      hp: this.hero.hp,
      maxHp: this.hero.maxHp,
      sourceId: enemy.id,
    });

    if (result.died) this.onHeroDied();
  };

  reset(): void {
    this.xp = 0;
    this.projectiles.recycleAll();
    this.motes.recycleAll();
    this.vfx.reset();
    for (const ownerId of Object.keys(this.ownerKills)) delete this.ownerKills[ownerId];
    for (let i = 0; i < this.rigs.length; i += 1) {
      const state = this.rigs[i];
      if (!state) continue;
      state.timer = 0;
      state.targeting.reset();
    }
  }

  dispose(): void {
    this.projectiles.dispose();
    this.motes.dispose();
    this.vfx.dispose();
  }

  private updateRigArcs(delta: number): void {
    for (let i = 0; i < this.rigs.length; i += 1) {
      const state = this.rigs[i];
      if (!state) continue;
      state.timer -= delta;
      if (state.timer > 0) continue;

      const handle = state.handle;
      const origin = handle.getPos();
      const target = state.targeting.findNearest(origin, handle.range, this.enemies.all);
      if (!target) {
        state.timer = Math.max(0, state.timer);
        continue;
      }

      this.emitVolley(handle, origin, target);
      state.timer += handle.cooldown;
      if (state.timer < 0) state.timer = handle.cooldown;
    }
  }

  private emitVolley(handle: ShooterHandle, origin: THREE.Vector3, target: ClaimJumperEnemy): void {
    this.scratchOrigin.copy(origin);
    const dx = target.position.x - this.scratchOrigin.x;
    const dz = target.position.z - this.scratchOrigin.z;
    const lenSq = dx * dx + dz * dz;
    if (lenSq <= 0.0001) return;

    const invLen = 1 / Math.sqrt(lenSq);
    const dirX = dx * invLen;
    const dirZ = dz * invLen;
    const count = Math.max(1, handle.volley);
    for (let i = 0; i < count; i += 1) {
      const damage = handle.getDamage?.() ?? handle.damage;
      if (this.projectiles.activate(this.scratchOrigin, dirX, dirZ, handle.projSpeed, damage, handle.id ?? 'hero')) {
        this.audio.playArc();
      }
    }
  }

  private resolveBoltHits(at: number): void {
    if (isCombatDamageDisabled()) return;

    const hitRadius = Balance.sparkRig.boltRadius + Balance.enemy.touchRadius;
    const hitRadiusSq = hitRadius * hitRadius;
    for (let boltIndex = 0; boltIndex < this.projectiles.capacity; boltIndex += 1) {
      if (!this.projectiles.isActive(boltIndex)) continue;
      const boltPosition = this.projectiles.positionAt(boltIndex);

      for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
        const enemy = this.enemies.all[enemyIndex];
        if (!enemy?.isAlive) continue;
        const dx = enemy.position.x - boltPosition.x;
        const dz = enemy.position.z - boltPosition.z;
        if (dx * dx + dz * dz > hitRadiusSq) continue;

        const damage = this.projectiles.damageAt(boltIndex);
        const ownerId = this.projectiles.ownerIdAt(boltIndex) ?? 'hero';
        this.projectiles.deactivate(boltIndex);
        const died = enemy.takeDamage(damage);
        this.vfx.hit(enemy.position);
        this.audio.playHit();
        if (died) this.killEnemy(enemy, at, ownerId);
        break;
      }
    }
  }

  private killEnemy(enemy: ClaimJumperEnemy, at: number, ownerId: string): void {
    this.ownerKills[ownerId] = (this.ownerKills[ownerId] ?? 0) + 1;
    this.motes.spawn(enemy.position, Balance.xp.perKill);
    this.vfx.dustPuff(enemy.position);
    this.audio.playKill();
    this.onEnemyKilled?.(enemy.position);
    this.events.emit({
      type: 'enemy_killed',
      at,
      enemyId: enemy.id,
      xp: Balance.xp.perKill,
    });
    this.enemies.recycle(enemy);
  }

}
