import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { Hero } from '../entities/Hero';
import type { BlastChargePool, BlastChargeSuspendSnapshot } from '../entities/BlastCharge';
import type { ProjectilePool, ProjectileSuspendSnapshot, ProjectileVisualSample } from '../entities/Projectile';
import type { XpMotePool, XpMoteSuspendSnapshot } from '../entities/XpMote';
import type { EnemyPool } from '../entities/pools';
import { isCombatDamageDisabled } from '../core/DebugParams';
import { Balance } from '../game/Balance';
import type { AgentCollectXpOptions, AgentCollectXpResult } from '../agent/ToolSurface';
import * as Terrain from '../world/Terrain';
import type { SoundSystem } from '../audio/SoundSystem';
import { TargetingSystem, type BuildingTarget } from './TargetingSystem';
import type { CombatVfx } from './CombatVfx';
import { FreedWalkerVfx } from './FreedWalkerVfx';

export type ProjectileKind = 'bolt' | 'lob';

export type ShooterHandle = {
  resumeKey: string;
  id?: string;
  kind?: ProjectileKind;
  projectileKind?: (origin: THREE.Vector3, target: ClaimJumperEnemy, targetPoint: THREE.Vector3) => ProjectileKind;
  enabled?: () => boolean;
  canTarget?: (target: ClaimJumperEnemy) => boolean;
  effectiveRange?: (target: ClaimJumperEnemy) => number;
  targetPoint?: (origin: THREE.Vector3, target: ClaimJumperEnemy) => THREE.Vector3 | null;
  visualOriginPadRadius?: () => number;
  aoe?: { radius: number; airTime: number };
  spreadRadius?: number;
  spreadRadians?: number;
  airTime?: (origin: THREE.Vector3, targetPoint: THREE.Vector3) => number;
  getPos: () => THREE.Vector3;
  range: number;
  cooldown: number;
  damage: number;
  getDamage?: () => number;
  suspend?: boolean;
  onVolleyFired?: (at: number) => void;
  onFire?: (at: number) => void;
  projSpeed: number;
  volley: number;
};

type ShooterState = {
  handle: ShooterHandle;
  timer: number;
  targeting: TargetingSystem<ClaimJumperEnemy>;
  missTargetId: number;
  misses: number;
};

export type ShooterSuspendSnapshot = {
  resumeKey: string;
  timer: number;
  targetId: number;
  missTargetId: number;
  misses: number;
};

export type CombatSuspendSnapshot = {
  xp: number;
  audit: {
    ownerKills: Record<string, number>;
    ownerDamage: Record<string, number>;
    boltHits: number;
    boltMisses: number;
    staleTargetSwitches: number;
    shots: Record<ProjectileKind, number>;
    lastShotKind: ProjectileKind | null;
    lastShotOwnerId: string | null;
    xpDeaths: number;
    xpMotesSpawned: number;
    xpMotesCollected: number;
    xpMotesCollectedValue: number;
    xpOverflowBanked: number;
    xpExpiredBanked: number;
    blastDetonationCount: number;
    lastBlastDetonation: { x: number; y: number; z: number } | null;
  };
  shooters: ShooterSuspendSnapshot[];
  projectiles: ProjectileSuspendSnapshot[];
  blastCharges: BlastChargeSuspendSnapshot[];
  xpMotes: XpMoteSuspendSnapshot[];
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
  private readonly scratchVolleyTarget = new THREE.Vector3();
  private readonly ownerKills: Record<string, number> = {};
  private readonly ownerDamage: Record<string, number> = {};
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
  private readonly freedWalkers: FreedWalkerVfx;

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
    private readonly onEnemyKilled?: (position: THREE.Vector3, freedOrdinal: number) => void,
    private readonly onShot?: (at: number, origin: THREE.Vector3, target: THREE.Vector3) => void,
    private readonly onEnemyDamaged?: (enemy: ClaimJumperEnemy, amount: number, died: boolean) => void,
    private readonly canDamageEnemy: (enemy: ClaimJumperEnemy) => boolean = () => true,
  ) {
    this.freedWalkers = new FreedWalkerVfx(
      vfx,
      () => this.actors.filter((actor) => actor.group.visible).map((actor) => actor.group.position),
    );
  }

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
    if (!handle.resumeKey || this.rigs.some((state) => state.handle.resumeKey === handle.resumeKey)) {
      throw new Error(`duplicate or missing shooter resumeKey: ${handle.resumeKey || '(empty)'}`);
    }
    const state = {
      handle,
      timer: 0,
      targeting: new TargetingSystem<ClaimJumperEnemy>(),
      missTargetId: -1,
      misses: 0,
    };
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

  captureSuspend(): CombatSuspendSnapshot {
    return {
      xp: this.xp,
      audit: {
        ownerKills: { ...this.ownerKills },
        ownerDamage: { ...this.ownerDamage },
        boltHits: this.boltHits,
        boltMisses: this.boltMisses,
        staleTargetSwitches: this.staleTargetSwitches,
        shots: { ...this.shotsByKind },
        lastShotKind: this.lastShotKind,
        lastShotOwnerId: this.lastShotOwnerId,
        xpDeaths: this.xpDeaths,
        xpMotesSpawned: this.xpMotesSpawned,
        xpMotesCollected: this.xpMotesCollected,
        xpMotesCollectedValue: this.xpMotesCollectedValue,
        xpOverflowBanked: this.xpOverflowBanked,
        xpExpiredBanked: this.xpExpiredBanked,
        blastDetonationCount: this.blastDetonationCount,
        lastBlastDetonation: this.hasLastBlastDetonation
          ? {
              x: this.lastBlastDetonationPosition.x,
              y: this.lastBlastDetonationPosition.y,
              z: this.lastBlastDetonationPosition.z,
            }
          : null,
      },
      shooters: this.rigs
        .filter((state) => state.handle.suspend !== false)
        .map((state) => ({
          resumeKey: state.handle.resumeKey,
          timer: state.timer,
          targetId: state.targeting.currentTarget?.isAlive ? state.targeting.currentTarget.id : -1,
          missTargetId: state.missTargetId,
          misses: state.misses,
        })),
      projectiles: this.projectiles.captureSuspend(),
      blastCharges: this.blastCharges.captureSuspend(),
      xpMotes: this.motes.captureSuspend(),
    };
  }

  restoreSuspend(snapshot: CombatSuspendSnapshot): boolean {
    if (!this.canRestoreSuspend(snapshot)) return false;
    const liveByKey = new Map(this.rigs.map((state) => [state.handle.resumeKey, state]));
    const orderedRigs = snapshot.shooters.map((saved) => liveByKey.get(saved.resumeKey)!);
    const transientRigs = this.rigs.filter((state) => state.handle.suspend === false);
    const savedByKey = new Map<string, ShooterSuspendSnapshot>();
    for (const saved of snapshot.shooters) {
      savedByKey.set(saved.resumeKey, saved);
    }
    if (!this.projectiles.restoreSuspend(snapshot.projectiles)) return false;
    if (!this.blastCharges.restoreSuspend(snapshot.blastCharges)) return false;
    if (!this.motes.restoreSuspend(snapshot.xpMotes)) return false;
    this.rigs.splice(0, this.rigs.length, ...orderedRigs, ...transientRigs);

    this.xp = snapshot.xp;
    replaceNumberRecord(this.ownerKills, snapshot.audit.ownerKills);
    replaceNumberRecord(this.ownerDamage, snapshot.audit.ownerDamage);
    this.boltHits = snapshot.audit.boltHits;
    this.boltMisses = snapshot.audit.boltMisses;
    this.staleTargetSwitches = snapshot.audit.staleTargetSwitches;
    this.shotsByKind.bolt = snapshot.audit.shots.bolt;
    this.shotsByKind.lob = snapshot.audit.shots.lob;
    this.lastShotKind = snapshot.audit.lastShotKind;
    this.lastShotOwnerId = snapshot.audit.lastShotOwnerId;
    this.xpDeaths = snapshot.audit.xpDeaths;
    this.xpMotesSpawned = snapshot.audit.xpMotesSpawned;
    this.xpMotesCollected = snapshot.audit.xpMotesCollected;
    this.xpMotesCollectedValue = snapshot.audit.xpMotesCollectedValue;
    this.xpOverflowBanked = snapshot.audit.xpOverflowBanked;
    this.xpExpiredBanked = snapshot.audit.xpExpiredBanked;
    this.blastDetonationCount = snapshot.audit.blastDetonationCount;
    this.hasLastBlastDetonation = snapshot.audit.lastBlastDetonation !== null;
    if (snapshot.audit.lastBlastDetonation) {
      this.lastBlastDetonationPosition.set(
        snapshot.audit.lastBlastDetonation.x,
        snapshot.audit.lastBlastDetonation.y,
        snapshot.audit.lastBlastDetonation.z,
      );
    } else {
      this.lastBlastDetonationPosition.set(0, 0, 0);
    }
    for (const state of this.rigs) {
      const saved = savedByKey.get(state.handle.resumeKey);
      state.timer = saved?.timer ?? 0;
      state.missTargetId = saved?.missTargetId ?? -1;
      state.misses = saved?.misses ?? 0;
      const target = saved && saved.targetId >= 0 ? this.enemies.all[saved.targetId] ?? null : null;
      state.targeting.restoreCurrent(target?.isAlive ? target : null);
    }
    return true;
  }

  canRestoreSuspend(
    snapshot: CombatSuspendSnapshot,
    expectedKeys: readonly string[] = this.rigs
      .filter((state) => state.handle.suspend !== false)
      .map((state) => state.handle.resumeKey),
  ): boolean {
    const savedKeys = new Set(snapshot.shooters.map((saved) => saved.resumeKey));
    const expected = new Set(expectedKeys);
    return (
      savedKeys.size === snapshot.shooters.length &&
      savedKeys.size === expected.size &&
      [...savedKeys].every((key) => key.length > 0 && expected.has(key)) &&
      hasUniqueSlots(snapshot.projectiles, this.projectiles.capacity) &&
      hasUniqueSlots(snapshot.blastCharges, this.blastCharges.capacity) &&
      hasUniqueSlots(snapshot.xpMotes, Balance.xp.motePool)
    );
  }

  update(delta: number, at: number): void {
    this.currentAt = at;
    this.updateRigArcs(delta);

    let remaining = delta;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 30);
      this.projectiles.update(step, this.handleBoltExpired);
      if (this.blastCharges.update(step, this.onBlastDetonated)) return;
      this.resolveBoltHits(at);
      remaining -= step;
    }

    const gained = this.motes.update(delta, this.visibleActorPositions(), this.handleXpCollect);
    if (gained > 0) this.xp += gained;
  }

  captureRenderState(): void {
    this.projectiles.captureRenderState();
    this.blastCharges.captureRenderState();
    this.motes.captureRenderState();
  }

  applyRenderInterpolation(alpha: number): void {
    this.projectiles.applyRenderInterpolation(alpha);
    this.blastCharges.applyRenderInterpolation(alpha);
    this.motes.applyRenderInterpolation(alpha);
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

  damageActor(amount: number, sourceId: number, actor: Hero = this.primaryActor): boolean {
    if (isCombatDamageDisabled()) return false;
    return this.damageHero(amount, sourceId, actor);
  }

  presentFreedEnemy(enemy: ClaimJumperEnemy): void {
    this.vfx.dustPuff(enemy.position);
    this.freedWalkers.spawn(enemy);
  }

  launchLob(origin: THREE.Vector3, target: THREE.Vector3, airTime: number, damage: number, radius: number, ownerId: string): boolean {
    const launched = this.blastCharges.activate(origin, target, airTime, damage, radius, ownerId);
    if (!launched) return false;
    this.recordShot('lob', ownerId);
    this.onShot?.(this.currentAt, origin, target);
    this.audio.playShot('lob', ownerId);
    return true;
  }

  private damageHero(amount: number, sourceId: number, actor: Hero = this.primaryActor): boolean {
    if (amount <= 0) return false;
    const result = actor.takeDamage(amount);
    if (!result.applied) return false;

    this.events.emit({
      type: 'hero_damaged',
      at: this.currentAt,
      amount,
      hp: actor.hp,
      maxHp: actor.maxHp,
      sourceId,
    });

    if (!result.died) return false;
    this.onHeroDied();
    return true;
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
    this.freedWalkers.reset();
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
    this.freedWalkers.dispose();
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
      const target = state.targeting.findNearest(
        origin,
        handle.range,
        this.enemies.all,
        (enemy) => this.canDamageEnemy(enemy) && (handle.canTarget?.(enemy) ?? true),
        handle.effectiveRange,
      );
      if (!target) {
        state.timer = Math.max(0, state.timer);
        continue;
      }
      if (this.emitVolley(state, origin, target)) state.timer += handle.cooldown;
      else state.timer = Math.max(0, state.timer);
    }
  }

  private emitVolley(state: ShooterState, origin: THREE.Vector3, target: ClaimJumperEnemy): boolean {
    const handle = state.handle;
    let fired = false;
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
        const volleyTarget = this.scratchVolleyTarget.copy(targetPoint);
        if (handle.spreadRadius && count > 1) {
          const angle = (i / count) * Math.PI * 2;
          volleyTarget.x += Math.cos(angle) * handle.spreadRadius;
          volleyTarget.z += Math.sin(angle) * handle.spreadRadius;
        }
        if (this.blastCharges.activate(this.scratchOrigin, volleyTarget, airTime, damage, aoe.radius, ownerId)) {
          fired = true;
          this.recordShot('lob', ownerId);
          this.onShot?.(this.currentAt, this.scratchOrigin, targetPoint);
          handle.onFire?.(this.currentAt);
          this.audio.playShot('lob', ownerId);
        }
      }
      if (fired) handle.onVolleyFired?.(this.currentAt);
      return fired;
    }

    const dx = targetPoint.x - this.scratchOrigin.x;
    const dz = targetPoint.z - this.scratchOrigin.z;
    const lenSq = dx * dx + dz * dz;
    if (lenSq <= 0.0001) return false;

    const invLen = 1 / Math.sqrt(lenSq);
    const dirX = dx * invLen;
    const dirZ = dz * invLen;
    const count = Math.max(1, handle.volley);
    for (let i = 0; i < count; i += 1) {
      const damage = handle.getDamage?.() ?? handle.damage;
      const ownerId = handle.id ?? 'hero';
      const offset = count > 1 ? ((i / (count - 1)) - 0.5) * (handle.spreadRadians ?? 0) : 0;
      const shotDirX = offset === 0 ? dirX : dirX * Math.cos(offset) - dirZ * Math.sin(offset);
      const shotDirZ = offset === 0 ? dirZ : dirX * Math.sin(offset) + dirZ * Math.cos(offset);
      if (
        this.projectiles.activate(
          this.scratchOrigin,
          shotDirX,
          shotDirZ,
          handle.projSpeed,
          damage,
          ownerId,
          handle.resumeKey,
          target.id,
          targetPoint,
          handle.visualOriginPadRadius?.() ?? 0,
        )
      ) {
        fired = true;
        this.recordShot('bolt', ownerId);
        this.onShot?.(this.currentAt, this.scratchOrigin, targetPoint);
        handle.onFire?.(this.currentAt);
        this.audio.playShot('bolt', ownerId);
      }
    }
    if (fired) handle.onVolleyFired?.(this.currentAt);
    return fired;
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

  private readonly onBlastDetonated = (position: THREE.Vector3, damage: number, radius: number, ownerId: string): boolean => {
    this.blastDetonationCount += 1;
    this.lastBlastDetonationPosition.copy(position);
    this.hasLastBlastDetonation = true;
    this.vfx.detonationRing(position, radius);
    this.audio.playDetonation(ownerId);
    if (isCombatDamageDisabled()) return false;

    if (ownerId.startsWith('baron_rocket')) {
      const sourceId = Number(ownerId.split(':')[1] ?? -1);
      const heroRadius = radius + Balance.hero.radius;
      let heroDied = false;
      for (const actor of this.actors) {
        if (!actor.group.visible) continue;
        const heroDx = actor.group.position.x - position.x;
        const heroDz = actor.group.position.z - position.z;
        if (heroDx * heroDx + heroDz * heroDz <= heroRadius * heroRadius) {
          heroDied = this.damageHero(damage, sourceId, actor) || heroDied;
        }
      }
      for (const target of this.buildingTargetsResolver?.(position, radius) ?? []) {
        this.damageBuilding(target, damage, sourceId, Math.max(1, radius * 0.65), true);
      }
      return heroDied;
    }

    if (ownerId === 'turrets') {
      let closest: ClaimJumperEnemy | null = null;
      let closestSq = Number.POSITIVE_INFINITY;
      for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
        const enemy = this.enemies.all[enemyIndex];
        if (!enemy?.isAlive || !this.canDamageEnemy(enemy)) continue;
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
        this.onEnemyDamaged?.(closest, damage, died);
        this.vfx.hit(closest.position);
        if (died) this.killEnemy(closest, this.currentAt, ownerId);
      }
      return false;
    }

    for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
      const enemy = this.enemies.all[enemyIndex];
      if (!enemy?.isAlive || !this.canDamageEnemy(enemy)) continue;
      const dx = enemy.position.x - position.x;
      const dz = enemy.position.z - position.z;
      const hitRadius = radius + enemy.hitRadius;
      if (dx * dx + dz * dz > hitRadius * hitRadius) continue;
      this.recordDamage(ownerId, Math.min(enemy.currentHp, damage));
      const died = enemy.takeDamage(damage);
      this.onEnemyDamaged?.(enemy, damage, died);
      this.vfx.hit(enemy.position);
      if (died) this.killEnemy(enemy, this.currentAt, ownerId);
    }
    return false;
  };

  private resolveBoltHits(at: number): void {
    if (isCombatDamageDisabled()) return;

    for (let boltIndex = 0; boltIndex < this.projectiles.capacity; boltIndex += 1) {
      if (!this.projectiles.isActive(boltIndex)) continue;
      const boltPosition = this.projectiles.positionAt(boltIndex);

      for (let enemyIndex = 0; enemyIndex < this.enemies.all.length; enemyIndex += 1) {
        const enemy = this.enemies.all[enemyIndex];
        if (!enemy?.isAlive || !this.canDamageEnemy(enemy)) continue;
        const dx = enemy.position.x - boltPosition.x;
        const dz = enemy.position.z - boltPosition.z;
        const hitRadius = Balance.sparkRig.boltRadius + enemy.hitRadius;
        const hitRadiusSq = hitRadius * hitRadius;
        if (dx * dx + dz * dz > hitRadiusSq) continue;

        const damage = this.projectiles.damageAt(boltIndex) * enemy.boltDamageMult;
        const ownerId = this.projectiles.ownerIdAt(boltIndex) ?? 'hero';
        const shooterKey = this.projectiles.shooterKeyAt(boltIndex);
        const targetId = this.projectiles.targetIdAt(boltIndex);
        this.projectiles.deactivate(boltIndex);
        this.recordBoltHit(shooterKey, targetId, enemy.id);
        this.recordDamage(ownerId, Math.min(enemy.currentHp, damage));
        const died = enemy.takeDamage(damage);
        this.onEnemyDamaged?.(enemy, damage, died);
        this.vfx.hit(enemy.position);
        this.audio.playHit();
        if (died) this.killEnemy(enemy, at, ownerId);
        break;
      }
    }
  }

  private readonly handleBoltExpired = (shooterKey: string, targetId: number): void => {
    this.recordBoltMiss(shooterKey, targetId);
  };

  private recordBoltHit(shooterKey: string, targetId: number, hitId: number): void {
    this.boltHits += 1;
    if (targetId === hitId) {
      const state = this.shooterByKey(shooterKey);
      if (state && state.missTargetId === targetId) {
        state.missTargetId = -1;
        state.misses = 0;
      }
      return;
    }
    this.recordBoltMiss(shooterKey, targetId);
  }

  private recordBoltMiss(shooterKey: string, targetId: number): void {
    if (targetId < 0) return;
    this.boltMisses += 1;
    const switchCount = Math.floor(Balance.sparkRig.missSwitchCount);
    if (switchCount <= 0) return;

    const state = this.shooterByKey(shooterKey);
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

  private shooterByKey(resumeKey: string): ShooterState | null {
    for (let i = 0; i < this.rigs.length; i += 1) {
      const state = this.rigs[i];
      if (state?.handle.resumeKey === resumeKey) return state;
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
    const freed = this.freedWalkers.spawn(enemy);
    this.audio.playKill();
    this.onEnemyKilled?.(enemy.position, freed ? this.freedWalkers.diagnostics.spawned : 0);
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

function replaceNumberRecord(target: Record<string, number>, source: Readonly<Record<string, number>>): void {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

function hasUniqueSlots(snapshots: readonly { slot: number }[], capacity: number): boolean {
  const slots = new Set<number>();
  for (const snapshot of snapshots) {
    if (!Number.isInteger(snapshot.slot) || snapshot.slot < 0 || snapshot.slot >= capacity || slots.has(snapshot.slot)) return false;
    slots.add(snapshot.slot);
  }
  return true;
}
