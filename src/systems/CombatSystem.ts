import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { Hero } from '../entities/Hero';
import type { BlastChargePool } from '../entities/BlastCharge';
import type { ProjectilePool, ProjectileVisualSample } from '../entities/Projectile';
import type { XpMotePool } from '../entities/XpMote';
import type { EnemyPool } from '../entities/pools';
import { isCombatDamageDisabled } from '../core/DebugParams';
import { Balance } from '../game/Balance';
import type { AgentCollectXpOptions, AgentCollectXpResult } from '../agent/ToolSurface';
import * as Terrain from '../world/Terrain';
import type { SoundSystem } from '../audio/SoundSystem';
import { TargetingSystem, type BuildingTarget } from './TargetingSystem';
import type { CombatVfx } from './CombatVfx';

export type ProjectileKind = 'bolt' | 'lob';

export type ShooterHandle = {
  id?: string;
  kind?: ProjectileKind;
  projectileKind?: (origin: THREE.Vector3, target: ClaimJumperEnemy, targetPoint: THREE.Vector3) => ProjectileKind;
  enabled?: () => boolean;
  canTarget?: (target: ClaimJumperEnemy) => boolean;
  effectiveRange?: (target: ClaimJumperEnemy) => number;
  targetPoint?: (origin: THREE.Vector3, target: ClaimJumperEnemy) => THREE.Vector3 | null;
  visualOriginPadRadius?: () => number;
  aoe?: { radius: number; airTime: number };
  airTime?: (origin: THREE.Vector3, targetPoint: THREE.Vector3) => number;
  getPos: () => THREE.Vector3;
  range: number;
  cooldown: number;
  damage: number;
  getDamage?: () => number;
  onFire?: (at: number) => void;
  projSpeed: number;
  volley: number;
};

type ShooterState = {
  handle: ShooterHandle;
  id: number;
  timer: number;
  targeting: TargetingSystem<ClaimJumperEnemy>;
  missTargetId: number;
  misses: number;
};

type BuildingDamageResult = {
  applied: boolean;
  family: string;
  index: number;
  hp: number;
  maxHp: number;
  wrecked: boolean;
};

export type XpAuditDiagnostics = {
  deaths: number;
  motesSpawned: number;
  motesCollected: number;
  motesCollectedXp: number;
  overflowBanked: number;
  expiredBanked: number;
  autoBanked: number;
  dropped: number;
  xpAwarded: number;
  xpPerKill: number;
  motePool: number;
  expiryBanks: boolean;
};

export type BoltDiagnostics = {
  hits: number;
  misses: number;
  staleSwitches: number;
  shots: Record<ProjectileKind, number>;
  lastShotKind: ProjectileKind | null;
  lastShotOwnerId: string | null;
};

export class CombatSystem {
  private readonly rigs: ShooterState[] = [];
  private readonly scratchOrigin = new THREE.Vector3();
  private readonly scratchAimPoint = new THREE.Vector3();
  private readonly ownerKills: Record<string, number> = {};
  private readonly ownerDamage: Record<string, number> = {};
  private nextShooterId = 1;
  private boltHits = 0;
  private boltMisses = 0;
  private staleTargetSwitches = 0;
  private readonly shotsByKind: Record<ProjectileKind, number> = { bolt: 0, lob: 0 };
  private lastShotKind: ProjectileKind | null = null;
  private lastShotOwnerId: string | null = null;
  private xp = 0;
  private xpDeaths = 0;
  private xpMotesSpawned = 0;
  private xpMotesCollected = 0;
  private xpMotesCollectedValue = 0;
  private xpOverflowBanked = 0;
  private xpExpiredBanked = 0;
  private currentAt = 0;
  private blastDetonationCount = 0;
  private readonly lastBlastDetonationPosition = new THREE.Vector3();
  private hasLastBlastDetonation = false;
  private buildingDamageResolver: ((target: BuildingTarget, amount: number) => BuildingDamageResult) | null = null;
  private buildingTargetsResolver: ((position: THREE.Vector3, radius: number) => BuildingTarget[]) | null = null;

  constructor(
    private readonly events: EventBus,
    private readonly actors: readonly Hero[],
    private readonly enemies: EnemyPool,
    private readonly projectiles: ProjectilePool,
    private readonly blastCharges: BlastChargePool,
    private readonly motes: XpMotePool,
    private readonly vfx: CombatVfx,
    private readonly audio: SoundSystem,
    private readonly onHeroDied: () => void,
    private readonly onXpCollect?: (position: THREE.Vector3, value: number) => void,
    private readonly onEnemyKilled?: (position: THREE.Vector3) => void,
  ) {}

  private get primaryActor(): Hero {
    return this.actors[0];
  }

  get xpCount(): number {
    return this.xp;
  }

  get boltsAlive(): number {
    return this.projectiles.activeCount;
  }

  get projectileVisuals(): ProjectileVisualSample[] {
    return this.projectiles.visualDiagnostics();
  }

  get blastsAlive(): number {
    return this.blastCharges.activeCount;
  }

  get detonations(): number {
    return this.blastDetonationCount;
  }

  get lastBlastDetonation(): THREE.Vector3 | null {
    return this.hasLastBlastDetonation ? this.lastBlastDetonationPosition : null;
  }

  get killsByOwner(): Readonly<Record<string, number>> {
    return this.ownerKills;
  }

  get damageByOwner(): Readonly<Record<string, number>> {
    return this.ownerDamage;
  }

  get xpAudit(): XpAuditDiagnostics {
    return {
      deaths: this.xpDeaths,
      motesSpawned: this.xpMotesSpawned,
      motesCollected: this.xpMotesCollected,
      motesCollectedXp: this.xpMotesCollectedValue,
      overflowBanked: this.xpOverflowBanked,
      expiredBanked: this.xpExpiredBanked,
      autoBanked: this.xpOverflowBanked + this.xpExpiredBanked,
      dropped: 0,
      xpAwarded: this.xp,
      xpPerKill: Balance.xp.perKill,
      motePool: Balance.xp.motePool,
      expiryBanks: Balance.xp.expiryBanks,
    };
  }

  get boltDiagnostics(): BoltDiagnostics {
    return {
      hits: this.boltHits,
      misses: this.boltMisses,
      staleSwitches: this.staleTargetSwitches,
      shots: { ...this.shotsByKind },
      lastShotKind: this.lastShotKind,
      lastShotOwnerId: this.lastShotOwnerId,
    };
  }

  registerShooter(handle: ShooterHandle): () => void {
    const state = {
      handle,
      id: this.nextShooterId,
      timer: 0,
      targeting: new TargetingSystem<ClaimJumperEnemy>(),
      missTargetId: -1,
      misses: 0,
    };
    this.nextShooterId += 1;
    this.rigs.push(state);
    return () => {
      const index = this.rigs.indexOf(state);
      if (index >= 0) this.rigs.splice(index, 1);
    };
  }

  registerBuildingDamageResolver(resolve: (target: BuildingTarget, amount: number) => BuildingDamageResult): void {
    this.buildingDamageResolver = resolve;
  }

  registerBuildingTargetsResolver(resolve: (position: THREE.Vector3, radius: number) => BuildingTarget[]): void {
    this.buildingTargetsResolver = resolve;
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
      this.projectiles.update(step, this.handleBoltExpired);
      this.blastCharges.update(step, this.onBlastDetonated);
      this.resolveBoltHits(at);
      remaining -= step;
    }

    const gained = this.motes.update(delta, this.visibleActorPositions(), this.handleXpCollect);
    if (gained > 0) this.xp += gained;
  }

  hasProspectorXp(options: AgentCollectXpOptions, agentPosition: THREE.Vector3): boolean {
    return this.motes.hasCollectible(options.minAgeS, agentPosition, Balance.sparkRig.range);
  }

  collectXpForProspector(options: AgentCollectXpOptions, agentPosition: THREE.Vector3): AgentCollectXpResult {
    const sweep = this.motes.collectAged(options.minAgeS, agentPosition, Balance.sparkRig.range, this.handleXpCollect);
    if (sweep.xp > 0) this.xp += sweep.xp;
    return {
      ...sweep,
      collector: 'prospector',
      message: `Gathered ${sweep.xp} XP`,
    };
  }

  readonly handleEnemyContact = (enemy: ClaimJumperEnemy): void => {
    if (isCombatDamageDisabled()) return;

    this.damageHero(enemy.contactDamage, enemy.id, this.actorNearestTo(enemy.position));
  };

  launchLob(origin: THREE.Vector3, target: THREE.Vector3, airTime: number, damage: number, radius: number, ownerId: string): boolean {
    const launched = this.blastCharges.activate(origin, target, airTime, damage, radius, ownerId);
    if (!launched) return false;
    this.recordShot('lob', ownerId);
    this.audio.playShot('lob', ownerId);
    return true;
  }

  private damageHero(amount: number, sourceId: number, actor: Hero = this.primaryActor): void {
    const result = actor.takeDamage(amount);
    if (!result.applied) return;

    this.events.emit({
      type: 'hero_damaged',
      at: this.currentAt,
      amount,
      hp: actor.hp,
      maxHp: actor.maxHp,
      sourceId,
    });

    if (result.died) this.onHeroDied();
  }

  readonly handleBuildingHit = (enemy: ClaimJumperEnemy, target: BuildingTarget, amount?: number): void => {
    this.damageBuilding(target, amount ?? enemy.buildingDamageFor(target.family), enemy.id, enemy.impactScale, enemy.eliteKind === 'baron');
  };

  damageBuilding(target: BuildingTarget, amount: number = Balance.wreck.damage, sourceId = -1, impactScale = 1, forceCrack = false): void {
    if (!this.buildingDamageResolver) return;

    const result = this.buildingDamageResolver(target, amount);
    if (!result.applied) return;

    this.vfx.hit(target.position, impactScale);
    this.vfx.dustPuff(target.position, impactScale);
    if (impactScale > 1.01) this.vfx.detonationRing(target.position, Math.min(4.5, impactScale));
    this.audio.playBuildingDamage(result.family, result.hp, result.maxHp, result.wrecked, forceCrack);
    this.events.emit({
      type: 'building_damaged',
      at: this.currentAt,
      family: result.family,
      index: result.index,
      hp: result.hp,
      maxHp: result.maxHp,
      sourceId,
    });
    if (result.wrecked) {
      this.events.emit({
        type: 'building_wrecked',
        at: this.currentAt,
        family: result.family,
        index: result.index,
        sourceId,
      });
    }
  }

  reset(): void {
    this.xp = 0;
    this.xpDeaths = 0;
    this.xpMotesSpawned = 0;
    this.xpMotesCollected = 0;
    this.xpMotesCollectedValue = 0;
    this.xpOverflowBanked = 0;
    this.xpExpiredBanked = 0;
    this.projectiles.recycleAll();
    this.blastCharges.recycleAll();
    this.motes.recycleAll();
    this.vfx.reset();
    this.blastDetonationCount = 0;
    this.hasLastBlastDetonation = false;
    this.boltHits = 0;
    this.boltMisses = 0;
    this.staleTargetSwitches = 0;
    this.shotsByKind.bolt = 0;
    this.shotsByKind.lob = 0;
    this.lastShotKind = null;
    this.lastShotOwnerId = null;
    for (const ownerId of Object.keys(this.ownerKills)) delete this.ownerKills[ownerId];
    for (const ownerId of Object.keys(this.ownerDamage)) delete this.ownerDamage[ownerId];
    for (let i = 0; i < this.rigs.length; i += 1) {
      const state = this.rigs[i];
      if (!state) continue;
      state.timer = 0;
      state.targeting.reset();
      state.missTargetId = -1;
      state.misses = 0;
    }
  }

  dispose(): void {
    this.projectiles.dispose();
    this.blastCharges.dispose();
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
      if (handle.enabled && !handle.enabled()) {
        state.timer = Math.max(0, state.timer);
        continue;
      }
      const origin = handle.getPos();
      const target = state.targeting.findNearest(origin, handle.range, this.enemies.all, handle.canTarget, handle.effectiveRange);
      if (!target) {
        state.timer = Math.max(0, state.timer);
        continue;
      }

      this.emitVolley(state, origin, target);
      state.timer += handle.cooldown;
      if (state.timer < 0) state.timer = handle.cooldown;
    }
  }

  private emitVolley(state: ShooterState, origin: THREE.Vector3, target: ClaimJumperEnemy): void {
    const handle = state.handle;
    this.scratchOrigin.copy(origin);
    const targetPoint = handle.targetPoint?.(this.scratchOrigin, target) ?? this.boltAimPoint(handle, target);
    const kind = handle.projectileKind?.(this.scratchOrigin, target, targetPoint) ?? handle.kind ?? 'bolt';
    if (kind === 'lob') {
      const aoe = handle.aoe ?? Balance.blast;
      const airTime = handle.airTime?.(this.scratchOrigin, targetPoint) ?? aoe.airTime;
      const count = Math.max(1, handle.volley);
      for (let i = 0; i < count; i += 1) {
        const damage = handle.getDamage?.() ?? handle.damage;
        const ownerId = handle.id ?? 'hero_blast';
        if (this.blastCharges.activate(this.scratchOrigin, targetPoint, airTime, damage, aoe.radius, ownerId)) {
          this.recordShot('lob', ownerId);
          handle.onFire?.(this.currentAt);
          this.audio.playShot('lob', ownerId);
        }
      }
      return;
    }

    const dx = targetPoint.x - this.scratchOrigin.x;
    const dz = targetPoint.z - this.scratchOrigin.z;
    const lenSq = dx * dx + dz * dz;
    if (lenSq <= 0.0001) return;

    const invLen = 1 / Math.sqrt(lenSq);
    const dirX = dx * invLen;
    const dirZ = dz * invLen;
    const count = Math.max(1, handle.volley);
    for (let i = 0; i < count; i += 1) {
      const damage = handle.getDamage?.() ?? handle.damage;
      const ownerId = handle.id ?? 'hero';
      if (
        this.projectiles.activate(
          this.scratchOrigin,
          dirX,
          dirZ,
          handle.projSpeed,
          damage,
          ownerId,
          state.id,
          target.id,
          targetPoint,
          handle.visualOriginPadRadius?.() ?? 0,
        )
      ) {
        this.recordShot('bolt', ownerId);
        handle.onFire?.(this.currentAt);
        this.audio.playShot('bolt', ownerId);
      }
    }
  }

  private recordShot(kind: ProjectileKind, ownerId: string): void {
    this.shotsByKind[kind] += 1;
    this.lastShotKind = kind;
    this.lastShotOwnerId = ownerId;
  }

  private boltAimPoint(handle: ShooterHandle, target: ClaimJumperEnemy): THREE.Vector3 {
    this.scratchAimPoint.copy(target.position);
    if (!Balance.sparkRig.leading || handle.projSpeed <= 0) return this.scratchAimPoint;

    const distance = Math.hypot(target.position.x - this.scratchOrigin.x, target.position.z - this.scratchOrigin.z);
    const flightTime = distance / handle.projSpeed;
    let leadX = target.velocityX * flightTime;
    let leadZ = target.velocityZ * flightTime;
    const maxLead = Math.max(0, Balance.sparkRig.maxLeadRad);
    if (maxLead <= 0) return this.scratchAimPoint;
    const leadLenSq = leadX * leadX + leadZ * leadZ;
    if (leadLenSq > maxLead * maxLead) {
      const scale = maxLead / Math.sqrt(leadLenSq);
      leadX *= scale;
      leadZ *= scale;
    }
    this.scratchAimPoint.x += leadX;
    this.scratchAimPoint.z += leadZ;
    return this.scratchAimPoint;
  }

  private readonly onBlastDetonated = (position: THREE.Vector3, damage: number, radius: number, ownerId: string): void => {
    this.blastDetonationCount += 1;
    this.lastBlastDetonationPosition.copy(position);
    this.hasLastBlastDetonation = true;
    this.vfx.detonationRing(position, radius);
    this.audio.playDetonation(ownerId);
    if (isCombatDamageDisabled()) return;

    if (ownerId.startsWith('baron_rocket')) {
      const sourceId = Number(ownerId.split(':')[1] ?? -1);
      const heroRadius = radius + Balance.hero.radius;
      for (const actor of this.actors) {
        if (!actor.group.visible) continue;
        const heroDx = actor.group.position.x - position.x;
        const heroDz = actor.group.position.z - position.z;
        if (heroDx * heroDx + heroDz * heroDz <= heroRadius * heroRadius) this.damageHero(damage, sourceId, actor);
      }
      for (const target of this.buildingTargetsResolver?.(position, radius) ?? []) {
        this.damageBuilding(target, damage, sourceId, Math.max(1, radius * 0.65), true);
      }
      return;
    }

    if (ownerId === 'turrets') {
      let closest: ClaimJumperEnemy | null = null;
      let closestSq = Number.POSITIVE_INFINITY;
      for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
        const enemy = this.enemies.all[enemyIndex];
        if (!enemy?.isAlive) continue;
        const dx = enemy.position.x - position.x;
        const dz = enemy.position.z - position.z;
        const distanceSq = dx * dx + dz * dz;
        const hitRadius = radius + enemy.hitRadius;
        if (distanceSq > hitRadius * hitRadius || distanceSq > closestSq) continue;
        closest = enemy;
        closestSq = distanceSq;
      }
      if (closest) {
        this.recordDamage(ownerId, Math.min(closest.currentHp, damage));
        const died = closest.takeDamage(damage);
        this.vfx.hit(closest.position);
        if (died) this.killEnemy(closest, this.currentAt, ownerId);
      }
      return;
    }

    for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
      const enemy = this.enemies.all[enemyIndex];
      if (!enemy?.isAlive) continue;
      const dx = enemy.position.x - position.x;
      const dz = enemy.position.z - position.z;
      const hitRadius = radius + enemy.hitRadius;
      if (dx * dx + dz * dz > hitRadius * hitRadius) continue;
      this.recordDamage(ownerId, Math.min(enemy.currentHp, damage));
      const died = enemy.takeDamage(damage);
      this.vfx.hit(enemy.position);
      if (died) this.killEnemy(enemy, this.currentAt, ownerId);
    }
  };

  private resolveBoltHits(at: number): void {
    if (isCombatDamageDisabled()) return;

    for (let boltIndex = 0; boltIndex < this.projectiles.capacity; boltIndex += 1) {
      if (!this.projectiles.isActive(boltIndex)) continue;
      const boltPosition = this.projectiles.positionAt(boltIndex);

      for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
        const enemy = this.enemies.all[enemyIndex];
        if (!enemy?.isAlive) continue;
        const dx = enemy.position.x - boltPosition.x;
        const dz = enemy.position.z - boltPosition.z;
        const hitRadius = Balance.sparkRig.boltRadius + enemy.hitRadius;
        const hitRadiusSq = hitRadius * hitRadius;
        if (dx * dx + dz * dz > hitRadiusSq) continue;

        const damage = this.projectiles.damageAt(boltIndex) * enemy.boltDamageMult;
        const ownerId = this.projectiles.ownerIdAt(boltIndex) ?? 'hero';
        const shooterId = this.projectiles.shooterIdAt(boltIndex);
        const targetId = this.projectiles.targetIdAt(boltIndex);
        this.projectiles.deactivate(boltIndex);
        this.recordBoltHit(shooterId, targetId, enemy.id);
        this.recordDamage(ownerId, Math.min(enemy.currentHp, damage));
        const died = enemy.takeDamage(damage);
        this.vfx.hit(enemy.position);
        this.audio.playHit();
        if (died) this.killEnemy(enemy, at, ownerId);
        break;
      }
    }
  }

  private readonly handleBoltExpired = (shooterId: number, targetId: number): void => {
    this.recordBoltMiss(shooterId, targetId);
  };

  private recordBoltHit(shooterId: number, targetId: number, hitId: number): void {
    this.boltHits += 1;
    if (targetId === hitId) {
      const state = this.shooterById(shooterId);
      if (state && state.missTargetId === targetId) {
        state.missTargetId = -1;
        state.misses = 0;
      }
      return;
    }
    this.recordBoltMiss(shooterId, targetId);
  }

  private recordBoltMiss(shooterId: number, targetId: number): void {
    if (targetId < 0) return;
    this.boltMisses += 1;
    const switchCount = Math.floor(Balance.sparkRig.missSwitchCount);
    if (switchCount <= 0) return;

    const state = this.shooterById(shooterId);
    if (!state) return;
    if (state.missTargetId === targetId) state.misses += 1;
    else {
      state.missTargetId = targetId;
      state.misses = 1;
    }

    if (state.misses < switchCount || state.targeting.currentTarget?.id !== targetId) return;
    state.targeting.reset();
    state.missTargetId = -1;
    state.misses = 0;
    this.staleTargetSwitches += 1;
  }

  private shooterById(id: number): ShooterState | null {
    for (let i = 0; i < this.rigs.length; i += 1) {
      const state = this.rigs[i];
      if (state?.id === id) return state;
    }
    return null;
  }

  private killEnemy(enemy: ClaimJumperEnemy, at: number, ownerId: string): void {
    const xp = Balance.xp.perKill;
    const bossState = this.enemies.degradeBossGroup(enemy);
    this.ownerKills[ownerId] = (this.ownerKills[ownerId] ?? 0) + 1;
    this.xpDeaths += 1;
    if (Terrain.sample(enemy.position.x, enemy.position.z).zone !== 'river' && this.motes.spawn(enemy.position, xp)) {
      this.xpMotesSpawned += 1;
    } else {
      this.bankXp(enemy.position, xp, 'overflow');
    }
    this.vfx.dustPuff(enemy.position);
    this.audio.playKill();
    this.onEnemyKilled?.(enemy.position);
    this.events.emit({
      type: 'enemy_killed',
      at,
      enemyId: enemy.id,
      xp,
      eliteKind: enemy.eliteKind ?? undefined,
      variantId: enemy.variantId ?? undefined,
      bossGroupId: enemy.bossGroupId ?? undefined,
      bossComponentId: enemy.bossComponentId ?? undefined,
      bossRemaining: bossState?.remaining,
      bossComponents: bossState?.total,
    });
    this.enemies.recycle(enemy);
  }

  private recordDamage(ownerId: string, amount: number): void {
    if (amount <= 0) return;
    this.ownerDamage[ownerId] = (this.ownerDamage[ownerId] ?? 0) + amount;
  }

  private visibleActorPositions(): THREE.Vector3[] {
    return this.actors.filter((actor) => actor.group.visible).map((actor) => actor.group.position);
  }

  private actorNearestTo(position: THREE.Vector3): Hero {
    let best = this.primaryActor;
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    for (const actor of this.actors) {
      if (!actor.group.visible) continue;
      const dx = actor.group.position.x - position.x;
      const dz = actor.group.position.z - position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < bestDistanceSq) {
        best = actor;
        bestDistanceSq = distanceSq;
      }
    }
    return best;
  }

  private readonly handleXpCollect = (position: THREE.Vector3, value: number): void => {
    if (value <= 0) return;
    this.xpMotesCollected += 1;
    this.xpMotesCollectedValue += value;
    this.onXpCollect?.(position, value);
  };

  private bankXp(position: THREE.Vector3, value: number, reason: 'overflow' | 'expiry'): void {
    if (value <= 0) return;
    this.xp += value;
    if (reason === 'overflow') this.xpOverflowBanked += 1;
    else this.xpExpiredBanked += 1;
    this.onXpCollect?.(position, value);
  }
}
