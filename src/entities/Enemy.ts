import * as THREE from 'three';
import { OrientationResolver, type RotationDirection } from '../assets/OrientationResolver';
import { type CharacterSpriteClip } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import { hasElevationTile, resolveTerrainMove, terrainDetourWaypoint, terrainSpeedMultiplier } from '../sim/TileHeight';
import type { BuildingTarget, GoldHolding } from '../systems/TargetingSystem';
import * as Terrain from '../world/Terrain';
import type { PalisadeBlocker } from './Palisade';

export type CompassEdge = 'north' | 'south' | 'east' | 'west';
export type ThiefState = 'none' | 'seekHolding' | 'grabbing' | 'fleeing';
export type WreckerState = 'none' | 'seekBuilding' | 'swinging';
export type EnemyEliteKind = 'baron';

export type ClaimJumperAssets = {
  ponchoGeometry: THREE.ConeGeometry;
  sackGeometry: THREE.DodecahedronGeometry;
  faceGeometry: THREE.SphereGeometry;
  brimGeometry: THREE.CylinderGeometry;
  crownGeometry: THREE.CylinderGeometry;
  shadowGeometry: THREE.CircleGeometry;
  ponchoMaterial: THREE.MeshStandardMaterial;
  sackMaterial: THREE.MeshStandardMaterial;
  faceMaterial: THREE.MeshStandardMaterial;
  hatMaterial: THREE.MeshStandardMaterial;
  shadowMaterial: THREE.MeshBasicMaterial;
};

export type EnemySpawnParams = {
  speedScale?: number;
  hpScale?: number;
  activationDelay?: number;
  edge?: CompassEdge;
  thief?: boolean;
  wrecker?: boolean;
  formationSeed?: number;
  eliteKind?: EnemyEliteKind;
  visualScale?: number;
  banner?: boolean;
};

export type ThiefUpdateContext = {
  nearestGoldHolding: (from: THREE.Vector3) => GoldHolding | null;
  claimGold: (enemy: ClaimJumperEnemy, holding: GoldHolding) => number;
  onThiefFled: (enemy: ClaimJumperEnemy) => void;
};

export type WreckerUpdateContext = {
  nearestBuilding: (from: THREE.Vector3) => BuildingTarget | null;
  hitBuilding: (enemy: ClaimJumperEnemy, target: BuildingTarget) => void;
};

const THIEF_RETARGET_SECONDS = 0.35;
const WRECKER_RETARGET_SECONDS = 0.35;
const FLEE_EDGE = 37.5;
const FORMATION_STEER = 0.38;
const FORMATION_GAP_CLEARANCE = 0.25;
const FORMATION_LANES = 7;
const FORMATION_JITTER = 0.16;

export function createClaimJumperAssets(): ClaimJumperAssets {
  return {
    ponchoGeometry: new THREE.ConeGeometry(0.54, 1.08, 7),
    sackGeometry: new THREE.DodecahedronGeometry(0.23, 0),
    faceGeometry: new THREE.SphereGeometry(0.18, 12, 8),
    brimGeometry: new THREE.CylinderGeometry(0.42, 0.42, 0.055, 18),
    crownGeometry: new THREE.CylinderGeometry(0.27, 0.31, 0.28, 16),
    shadowGeometry: new THREE.CircleGeometry(0.54, 20),
    ponchoMaterial: new THREE.MeshStandardMaterial({
      color: '#a0522d',
      roughness: 0.88,
      metalness: 0.02,
    }),
    sackMaterial: new THREE.MeshStandardMaterial({
      color: '#8b7d3c',
      roughness: 0.72,
      metalness: 0.06,
    }),
    faceMaterial: new THREE.MeshStandardMaterial({
      color: '#d9a268',
      roughness: 0.8,
      metalness: 0.01,
    }),
    hatMaterial: new THREE.MeshStandardMaterial({
      color: '#4b2a17',
      roughness: 0.78,
      metalness: 0.02,
    }),
    shadowMaterial: new THREE.MeshBasicMaterial({
      color: '#2e1b0e',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  };
}

export class ClaimJumperEnemy {
  readonly group = new THREE.Group();

  private readonly velocity = new THREE.Vector3();
  private readonly leadVelocity = new THREE.Vector3();
  private readonly heading = new THREE.Vector3(0, 0, -1);
  private readonly orientationResolver = new OrientationResolver();
  private readonly nextPosition = new THREE.Vector3();
  private readonly fleeTarget = new THREE.Vector3();
  private readonly routeTarget = new THREE.Vector3();
  private readonly terrainRouteTarget = new THREE.Vector3();
  private readonly scriptedTarget = new THREE.Vector3();
  private alive = false;
  private hp = 0;
  private maxHpValue = 0;
  private speed: number = Balance.enemy.speed;
  private elite: EnemyEliteKind | null = null;
  private visualScaleValue = 1;
  private banner = false;
  private scriptedSpeed = 0;
  private scripted = false;
  private activationDelay = 0;
  private contactCooldown = 0;
  private spriteClip: CharacterSpriteClip = 'idle';
  private spriteOrientation: RotationDirection = 's';
  private thief = false;
  private wrecker = false;
  private thiefState: ThiefState = 'none';
  private wreckerState: WreckerState = 'none';
  private carriedGold = 0;
  private grabTimer = 0;
  private swingTimer = 0;
  private retargetTimer = 0;
  private wreckerRetargetTimer = 0;
  private currentHolding: GoldHolding | null = null;
  private currentBuilding: BuildingTarget | null = null;
  private spawnEdge: CompassEdge | null = null;
  private formationOffset = 0;
  private flashRemaining = 0;
  private flashCount = 0;
  private terrainSlideSide = 0;

  constructor(readonly id: number, assets: ClaimJumperAssets) {
    void assets;
    this.group.name = `ClaimJumperEnemy-${id}`;
    this.group.visible = false;
    tagPlaceholder(this.group, assetSlots.charClaimJumper);
  }

  get isAlive(): boolean {
    return this.alive;
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get currentHp(): number {
    return this.hp;
  }

  get maxHp(): number {
    return this.maxHpValue;
  }

  get moveSpeed(): number {
    return this.speed;
  }

  get eliteKind(): EnemyEliteKind | null {
    return this.elite;
  }

  get visualScale(): number {
    return this.visualScaleValue;
  }

  get hasBanner(): boolean {
    return this.banner;
  }

  get animationClip(): CharacterSpriteClip {
    return this.spriteClip;
  }

  get animationOrientation(): RotationDirection {
    return this.spriteOrientation;
  }

  get isThief(): boolean {
    return this.thief;
  }

  get isWrecker(): boolean {
    return this.wrecker;
  }

  get stealState(): ThiefState {
    return this.thiefState;
  }

  get wreckState(): WreckerState {
    return this.wreckerState;
  }

  get carriedAmount(): number {
    return this.carriedGold;
  }

  get isFleeingWithGold(): boolean {
    return this.thiefState === 'fleeing' && this.carriedGold > 0;
  }

  get ownEdge(): CompassEdge | null {
    return this.spawnEdge;
  }

  get velocityX(): number {
    return this.leadVelocity.x;
  }

  get velocityZ(): number {
    return this.leadVelocity.z;
  }

  get spreadOffset(): number {
    return this.formationOffset;
  }

  get hitFlashRemaining(): number {
    return this.flashRemaining;
  }

  get hitFlashCount(): number {
    return this.flashCount;
  }

  setAnimationClip(clip: CharacterSpriteClip): void {
    this.spriteClip = clip;
  }

  spawn(position: THREE.Vector3, params: EnemySpawnParams = {}): void {
    this.alive = true;
    this.maxHpValue = Balance.enemy.hp * (params.hpScale ?? 1);
    this.hp = this.maxHpValue;
    this.speed = Balance.enemy.speed * (params.speedScale ?? 1);
    this.elite = params.eliteKind ?? null;
    this.visualScaleValue = Math.max(0.1, params.visualScale ?? 1);
    this.banner = params.banner === true;
    this.activationDelay = Math.max(0, params.activationDelay ?? 0);
    this.contactCooldown = 0;
    this.thief = params.thief === true;
    this.wrecker = !this.thief && params.wrecker === true;
    this.thiefState = this.thief ? 'seekHolding' : 'none';
    this.wreckerState = this.wrecker ? 'seekBuilding' : 'none';
    this.carriedGold = 0;
    this.grabTimer = 0;
    this.swingTimer = 0;
    this.retargetTimer = 0;
    this.wreckerRetargetTimer = 0;
    this.currentHolding = null;
    this.currentBuilding = null;
    this.spawnEdge = params.edge ?? null;
    this.formationOffset = seededOffset(params.formationSeed ?? this.id);
    this.flashRemaining = 0;
    this.terrainSlideSide = 0;
    this.scripted = false;
    this.scriptedSpeed = 0;
    this.velocity.set(0, 0, 0);
    this.leadVelocity.set(0, 0, 0);
    this.heading.set(0, 0, -1);
    this.orientationResolver.reset();
    this.spriteOrientation = 's';
    this.spriteClip = 'walk';
    this.group.position.copy(position);
    this.syncVisualY();
    this.group.rotation.y = 0;
    this.group.visible = true;
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3,
    separationX: number,
    separationZ: number,
    formationSeparationX: number,
    formationSeparationZ: number,
    blockers: readonly PalisadeBlocker[] = [],
    thiefContext?: ThiefUpdateContext,
    wreckerContext?: WreckerUpdateContext,
  ): boolean {
    if (!this.alive) return false;

    const previousX = this.group.position.x;
    const previousZ = this.group.position.z;
    this.contactCooldown = Math.max(0, this.contactCooldown - delta);
    this.flashRemaining = Math.max(0, this.flashRemaining - delta);
    if (this.activationDelay > 0) {
      this.activationDelay = Math.max(0, this.activationDelay - delta);
      this.velocity.set(0, 0, 0);
      this.leadVelocity.set(0, 0, 0);
      this.spriteOrientation = this.orientationResolver.idleDirection();
      this.syncVisualY();
      return false;
    }

    const targetPosition = this.scripted
      ? this.scriptedTarget
      : this.updateThief(delta, thiefContext) ?? this.updateWrecker(delta, wreckerContext) ?? heroPosition;
    const moveTarget = this.terrainAwareTarget(this.routedTarget(targetPosition));
    const speed = this.scripted ? this.scriptedSpeed : this.thiefState === 'fleeing' ? this.speed * Balance.steal.fleeSpeedMult : this.speed;

    this.heading.set(moveTarget.x - this.group.position.x, 0, moveTarget.z - this.group.position.z);
    const distanceSq = this.heading.lengthSq();
    if (distanceSq > 0.0001) {
      this.heading.normalize();
    } else {
      this.heading.set(0, 0, 0);
    }

    const spread = safeFormationSpread();
    const lateralOffset = THREE.MathUtils.clamp(this.formationOffset, -spread, spread);
    let spreadBiasX = 0;
    let spreadBiasZ = 0;
    if (spread > 0) {
      if (Math.abs(this.heading.z) >= Math.abs(this.heading.x)) {
        spreadBiasX = THREE.MathUtils.clamp((moveTarget.x + lateralOffset - this.group.position.x) / spread, -1, 1) * FORMATION_STEER;
      } else {
        let laneZ = moveTarget.z + lateralOffset;
        const currentSide = riverSide(this.group.position.z);
        if (Balance.pathing.riverBlocksEnemies && currentSide === 'north') {
          laneZ = Math.max(laneZ, Terrain.RIVER_MAX_Z + FORMATION_GAP_CLEARANCE);
        } else if (Balance.pathing.riverBlocksEnemies && currentSide === 'south') {
          laneZ = Math.min(laneZ, Terrain.RIVER_MIN_Z - FORMATION_GAP_CLEARANCE);
        }
        spreadBiasZ = THREE.MathUtils.clamp((laneZ - this.group.position.z) / spread, -1, 1) * FORMATION_STEER;
      }
    }
    this.velocity.set(
      this.heading.x +
        spreadBiasX +
        separationX * Balance.enemy.separationStrength +
        formationSeparationX * Balance.enemy.formationSeparationStrength,
      0,
      this.heading.z +
        spreadBiasZ +
        separationZ * Balance.enemy.separationStrength +
        formationSeparationZ * Balance.enemy.formationSeparationStrength,
    );
    if (this.velocity.lengthSq() > 1) this.velocity.normalize();

    if (this.thiefState === 'grabbing' || this.wreckerState === 'swinging') {
      this.velocity.set(0, 0, 0);
    } else {
      this.move(delta, blockers, speed, moveTarget);
    }
    this.syncVisualY();
    if (delta > 0) {
      this.leadVelocity.set((this.group.position.x - previousX) / delta, 0, (this.group.position.z - previousZ) / delta);
    } else {
      this.leadVelocity.set(0, 0, 0);
    }

    if (this.velocity.lengthSq() > 0.0025) {
      this.group.rotation.y = Math.atan2(this.velocity.x, -this.velocity.z);
      this.spriteOrientation = this.orientationResolver.resolve(this.velocity.x, this.velocity.z);
    } else {
      this.spriteOrientation = this.orientationResolver.idleDirection();
    }

    const touchRadius = Balance.hero.radius + Balance.enemy.touchRadius;
    const dx = heroPosition.x - this.group.position.x;
    const dz = heroPosition.z - this.group.position.z;
    if (this.contactCooldown <= 0 && dx * dx + dz * dz <= touchRadius * touchRadius) {
      this.contactCooldown = Balance.enemy.contactCooldown;
      return true;
    }

    if (this.thiefState === 'fleeing' && this.reachedFleeEdge()) {
      thiefContext?.onThiefFled(this);
    }

    return false;
  }

  takeDamage(amount: number): boolean {
    if (!this.alive) return false;
    if (amount > 0 && Balance.combatReadability.enemyFlashSeconds > 0 && Balance.combatReadability.enemyFlashIntensity > 0) {
      this.flashRemaining = Balance.combatReadability.enemyFlashSeconds;
      this.flashCount += 1;
    }
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  recycle(): void {
    this.alive = false;
    this.hp = 0;
    this.maxHpValue = 0;
    this.elite = null;
    this.visualScaleValue = 1;
    this.banner = false;
    this.activationDelay = 0;
    this.contactCooldown = 0;
    this.thief = false;
    this.wrecker = false;
    this.thiefState = 'none';
    this.wreckerState = 'none';
    this.carriedGold = 0;
    this.grabTimer = 0;
    this.swingTimer = 0;
    this.retargetTimer = 0;
    this.wreckerRetargetTimer = 0;
    this.currentHolding = null;
    this.currentBuilding = null;
    this.spawnEdge = null;
    this.formationOffset = 0;
    this.flashRemaining = 0;
    this.terrainSlideSide = 0;
    this.scripted = false;
    this.scriptedSpeed = 0;
    this.velocity.set(0, 0, 0);
    this.leadVelocity.set(0, 0, 0);
    this.orientationResolver.reset();
    this.spriteOrientation = 's';
    this.spriteClip = 'idle';
    this.group.visible = false;
    this.group.position.set(0, Balance.enemy.groundY, 0);
  }

  dispose(): void {
    this.group.clear();
  }

  releaseCarriedGold(): number {
    const amount = this.carriedGold;
    this.carriedGold = 0;
    if (this.thief) this.thiefState = 'seekHolding';
    return amount;
  }

  scriptMoveTo(x: number, z: number, speed: number): void {
    this.scriptedTarget.set(x, Balance.enemy.groundY, z);
    this.scriptedSpeed = Math.max(0, speed);
    this.scripted = true;
  }

  private updateThief(delta: number, context?: ThiefUpdateContext): THREE.Vector3 | null {
    if (!this.thief || !context) return null;

    if (this.carriedGold > 0) {
      this.thiefState = 'fleeing';
      this.spriteClip = 'flee';
      this.updateFleeTarget();
      return this.fleeTarget;
    }

    if (this.thiefState === 'grabbing') {
      this.spriteClip = 'grab';
      this.grabTimer = Math.max(0, this.grabTimer - delta);
      if (this.grabTimer <= 0) {
        const holding = this.currentHolding;
        const amount = holding?.active === true ? context.claimGold(this, holding) : 0;
        if (amount > 0) {
          this.carriedGold = amount;
          this.thiefState = 'fleeing';
          this.currentHolding = null;
          this.updateFleeTarget();
          this.spriteClip = 'flee';
          return this.fleeTarget;
        }
        this.thiefState = 'seekHolding';
        this.currentHolding = null;
        this.retargetTimer = 0;
      }
      return this.currentHolding?.position ?? null;
    }

    this.thiefState = 'seekHolding';
    this.retargetTimer = Math.max(0, this.retargetTimer - delta);
    if (!this.isHoldingValid(this.currentHolding) || this.retargetTimer <= 0) {
      this.currentHolding = context.nearestGoldHolding(this.group.position);
      this.retargetTimer = THIEF_RETARGET_SECONDS;
    }

    if (!this.isHoldingValid(this.currentHolding)) {
      this.currentHolding = null;
      this.spriteClip = 'walk';
      return null;
    }

    const dx = this.currentHolding.position.x - this.group.position.x;
    const dz = this.currentHolding.position.z - this.group.position.z;
    if (dx * dx + dz * dz <= Balance.steal.grabRadius * Balance.steal.grabRadius) {
      this.thiefState = 'grabbing';
      this.grabTimer = Balance.steal.grabSeconds;
      this.spriteClip = 'grab';
    } else {
      this.spriteClip = 'walk';
    }
    return this.currentHolding.position;
  }

  private isHoldingValid(holding: GoldHolding | null): holding is GoldHolding {
    return holding?.active === true && holding.amount > 0;
  }

  private updateWrecker(delta: number, context?: WreckerUpdateContext): THREE.Vector3 | null {
    if (!this.wrecker || !context) return null;

    this.wreckerRetargetTimer = Math.max(0, this.wreckerRetargetTimer - delta);
    if (!this.isBuildingValid(this.currentBuilding) || this.wreckerRetargetTimer <= 0) {
      this.currentBuilding = context.nearestBuilding(this.group.position);
      this.wreckerRetargetTimer = WRECKER_RETARGET_SECONDS;
    }

    if (!this.isBuildingValid(this.currentBuilding)) {
      this.currentBuilding = null;
      this.wreckerState = 'seekBuilding';
      this.spriteClip = 'walk';
      return null;
    }

    if (this.distanceSqToBuilding(this.currentBuilding) <= Balance.wreck.reach * Balance.wreck.reach) {
      this.wreckerState = 'swinging';
      this.spriteClip = 'grab';
      this.swingTimer -= delta;
      if (this.swingTimer <= 0) {
        context.hitBuilding(this, this.currentBuilding);
        this.swingTimer += Balance.wreck.hitCooldown;
        if (!this.isBuildingValid(this.currentBuilding)) {
          this.currentBuilding = null;
          this.wreckerState = 'seekBuilding';
          this.wreckerRetargetTimer = 0;
        }
      }
    } else {
      this.wreckerState = 'seekBuilding';
      this.spriteClip = 'walk';
    }
    return this.currentBuilding?.position ?? null;
  }

  private isBuildingValid(building: BuildingTarget | null): building is BuildingTarget {
    return building?.active === true && building.hp > 0;
  }

  private distanceSqToBuilding(building: BuildingTarget): number {
    const dx = Math.max(Math.abs(this.group.position.x - building.position.x) - building.halfX, 0);
    const dz = Math.max(Math.abs(this.group.position.z - building.position.z) - building.halfZ, 0);
    return dx * dx + dz * dz;
  }

  private updateFleeTarget(): void {
    const edge = this.spawnEdge ?? this.nearestEdge();
    if (edge === 'north') this.fleeTarget.set(this.group.position.x, Balance.enemy.groundY, FLEE_EDGE);
    else if (edge === 'south') this.fleeTarget.set(this.group.position.x, Balance.enemy.groundY, -FLEE_EDGE);
    else if (edge === 'east') this.fleeTarget.set(FLEE_EDGE, Balance.enemy.groundY, this.group.position.z);
    else this.fleeTarget.set(-FLEE_EDGE, Balance.enemy.groundY, this.group.position.z);
  }

  private reachedFleeEdge(): boolean {
    const edge = this.spawnEdge ?? this.nearestEdge();
    return (
      (edge === 'north' && this.group.position.z >= FLEE_EDGE - 0.2) ||
      (edge === 'south' && this.group.position.z <= -FLEE_EDGE + 0.2) ||
      (edge === 'east' && this.group.position.x >= FLEE_EDGE - 0.2) ||
      (edge === 'west' && this.group.position.x <= -FLEE_EDGE + 0.2)
    );
  }

  private nearestEdge(): CompassEdge {
    const north = FLEE_EDGE - this.group.position.z;
    const south = this.group.position.z + FLEE_EDGE;
    const east = FLEE_EDGE - this.group.position.x;
    const west = this.group.position.x + FLEE_EDGE;
    const best = Math.min(north, south, east, west);
    if (best === north) return 'north';
    if (best === south) return 'south';
    if (best === east) return 'east';
    return 'west';
  }

  private routedTarget(target: THREE.Vector3): THREE.Vector3 {
    if (!Balance.pathing.riverBlocksEnemies) return target;

    const current = this.group.position;
    const currentZone = Terrain.sample(current.x, current.z).zone;
    const targetSide = riverSide(target.z);
    const ford = Terrain.nearestFordRange(current.x);
    if (currentZone === 'ford') {
      if (targetSide === 'north' && current.z < Terrain.RIVER_MAX_Z - 0.1) {
        return this.routeTarget.set(ford.centerX, Balance.enemy.groundY, Terrain.RIVER_MAX_Z);
      }
      if (targetSide === 'south' && current.z > Terrain.RIVER_MIN_Z + 0.1) {
        return this.routeTarget.set(ford.centerX, Balance.enemy.groundY, Terrain.RIVER_MIN_Z);
      }
      return target;
    }

    const currentSide = riverSide(current.z);
    if (currentSide && targetSide && currentSide !== targetSide) {
      return this.routeTarget.set(ford.centerX, Balance.enemy.groundY, currentSide === 'north' ? Terrain.RIVER_MAX_Z : Terrain.RIVER_MIN_Z);
    }

    if (currentZone === 'river') {
      return this.routeTarget.set(THREE.MathUtils.clamp(current.x, ford.minX, ford.maxX), Balance.enemy.groundY, current.z);
    }

    return target;
  }

  private terrainAwareTarget(target: THREE.Vector3): THREE.Vector3 {
    if (!hasElevationTile()) return target;
    const detour = terrainDetourWaypoint(this.group.position.x, this.group.position.z, target.x, target.z);
    if (!detour) return target;
    return this.terrainRouteTarget.set(detour.x, Balance.enemy.groundY, detour.z);
  }

  private move(delta: number, blockers: readonly PalisadeBlocker[], speed: number, moveTarget: THREE.Vector3): void {
    const elevation = hasElevationTile();
    if (!elevation) {
      const distance = speed * delta;
      const steps = blockers.length > 0 || Balance.pathing.riverBlocksEnemies ? Math.max(1, Math.min(8, Math.ceil(distance / 0.25))) : 1;
      const stepDistance = distance / steps;
      for (let step = 0; step < steps; step += 1) {
        this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, stepDistance);
        for (const blocker of blockers) this.resolveBlocker(blocker, stepDistance);
        this.resolveRiver(stepDistance);
        this.group.position.copy(this.nextPosition);
      }
      return;
    }

    const maxDistance = speed * Balance.terrainSim.downhillMax * delta;
    const steps = Math.max(1, Math.min(8, Math.ceil(maxDistance / 0.25)));
    const stepDelta = delta / steps;
    for (let step = 0; step < steps; step += 1) {
      const stepDistance =
        speed * terrainSpeedMultiplier(this.group.position.x, this.group.position.z, this.velocity.x, this.velocity.z) * stepDelta;
      this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, stepDistance);
      for (const blocker of blockers) this.resolveBlocker(blocker, stepDistance);
      this.resolveRiver(stepDistance);
      this.resolveTerrain(moveTarget);
      this.group.position.copy(this.nextPosition);
    }
  }

  private resolveTerrain(moveTarget: THREE.Vector3): void {
    const previous = this.group.position;
    const stepX = this.nextPosition.x - previous.x;
    const stepZ = this.nextPosition.z - previous.z;
    const stepDistance = Math.hypot(stepX, stepZ);
    const goalX = moveTarget.x - previous.x;
    const goalZ = moveTarget.z - previous.z;
    const northSouth = Math.abs(goalZ) >= Math.abs(goalX);
    const tangentX = northSouth ? 1 : 0;
    const tangentZ = northSouth ? 0 : 1;
    const goalDistance = Math.hypot(goalX, goalZ);
    let obstacleAhead = false;

    if (Terrain.sample(this.nextPosition.x, this.nextPosition.z).walkable) {
      if (stepDistance <= 0.000001 || goalDistance <= 0.000001) return;
      const lookahead = Math.max(0.6, stepDistance * 2);
      const aheadX = previous.x + (goalX / goalDistance) * lookahead;
      const aheadZ = previous.z + (goalZ / goalDistance) * lookahead;
      if (Terrain.sample(aheadX, aheadZ).walkable) {
        this.terrainSlideSide = 0;
        return;
      }
      if (this.terrainSlideSide === 0) {
        this.terrainSlideSide = (northSouth ? Math.sign(previous.x) : Math.sign(previous.z)) || this.avoidanceSide();
      }
      obstacleAhead = true;
      this.nextPosition.set(
        previous.x + tangentX * this.terrainSlideSide * stepDistance,
        this.nextPosition.y,
        previous.z + tangentZ * this.terrainSlideSide * stepDistance,
      );
    }

    if (this.terrainSlideSide === 0) {
      this.terrainSlideSide = (northSouth ? Math.sign(previous.x) : Math.sign(previous.z)) || this.avoidanceSide();
    }
    if (stepDistance > 0.000001 && goalDistance > 0.000001) {
      const lookahead = Math.max(0.6, stepDistance * 2);
      const aheadX = previous.x + (goalX / goalDistance) * lookahead;
      const aheadZ = previous.z + (goalZ / goalDistance) * lookahead;
      obstacleAhead ||= !Terrain.sample(aheadX, aheadZ).walkable;
    }
    const probe = 0.4;
    const sideWalkable = Terrain.sample(
      previous.x + tangentX * this.terrainSlideSide * probe,
      previous.z + tangentZ * this.terrainSlideSide * probe,
    ).walkable;
    let fallbackX = tangentX * this.terrainSlideSide;
    let fallbackZ = tangentZ * this.terrainSlideSide;
    if (!sideWalkable) {
      fallbackX += northSouth ? 0 : -Math.sign(goalX || 1) * 0.75;
      fallbackZ += northSouth ? -Math.sign(goalZ || 1) * 0.75 : 0;
      const fallbackLength = Math.hypot(fallbackX, fallbackZ);
      if (fallbackLength > 0.000001) {
        fallbackX /= fallbackLength;
        fallbackZ /= fallbackLength;
      }
    }
    if (obstacleAhead && stepDistance > 0.000001) {
      this.nextPosition.set(previous.x + fallbackX * stepDistance, this.nextPosition.y, previous.z + fallbackZ * stepDistance);
    }
    const resolved = resolveTerrainMove(previous.x, previous.z, this.nextPosition.x, this.nextPosition.z, (x, z) => Terrain.sample(x, z).walkable, {
      x: moveTarget.x,
      z: moveTarget.z,
      fallbackX,
      fallbackZ,
    });
    this.nextPosition.set(resolved.x, this.nextPosition.y, resolved.z);
  }

  private resolveRiver(stepDistance: number): void {
    if (!Balance.pathing.riverBlocksEnemies || Terrain.sample(this.nextPosition.x, this.nextPosition.z).zone !== 'river') return;

    const outsideNudge = 0.05;
    const previous = this.group.position;
    if (previous.z <= Terrain.RIVER_MIN_Z) {
      this.nextPosition.z = Terrain.RIVER_MIN_Z - outsideNudge;
      const ford = Terrain.nearestFordRange(previous.x);
      this.nextPosition.x += Math.sign(ford.centerX - this.nextPosition.x || this.avoidanceSide()) * stepDistance * Balance.palisade.slideBias;
    } else if (previous.z >= Terrain.RIVER_MAX_Z) {
      this.nextPosition.z = Terrain.RIVER_MAX_Z + outsideNudge;
      const ford = Terrain.nearestFordRange(previous.x);
      this.nextPosition.x += Math.sign(ford.centerX - this.nextPosition.x || this.avoidanceSide()) * stepDistance * Balance.palisade.slideBias;
    } else {
      const ford = Terrain.nearestFordRange(previous.x);
      if (previous.x < ford.minX) {
        this.nextPosition.x = ford.minX + outsideNudge;
      } else if (previous.x > ford.maxX) {
        this.nextPosition.x = ford.maxX - outsideNudge;
      } else {
        this.nextPosition.x = THREE.MathUtils.clamp(this.nextPosition.x, ford.minX, ford.maxX);
      }
    }
  }

  private resolveBlocker(blocker: PalisadeBlocker, stepDistance: number): void {
    const pad = Balance.palisade.avoidancePad;
    const minX = blocker.x - blocker.halfX - pad;
    const maxX = blocker.x + blocker.halfX + pad;
    const minZ = blocker.z - blocker.halfZ - pad;
    const maxZ = blocker.z + blocker.halfZ + pad;
    const outsideNudge = 0.05;
    if (this.nextPosition.x < minX || this.nextPosition.x > maxX) return;
    if (this.nextPosition.z < minZ || this.nextPosition.z > maxZ) return;

    const previous = this.group.position;
    const fromWest = previous.x <= minX;
    const fromEast = previous.x >= maxX;
    const fromSouth = previous.z <= minZ;
    const fromNorth = previous.z >= maxZ;

    if (fromWest) {
      this.nextPosition.x = minX - outsideNudge;
      this.nextPosition.z += this.avoidanceSide() * stepDistance * Balance.palisade.slideBias;
    } else if (fromEast) {
      this.nextPosition.x = maxX + outsideNudge;
      this.nextPosition.z += this.avoidanceSide() * stepDistance * Balance.palisade.slideBias;
    } else if (fromSouth) {
      this.nextPosition.z = minZ - outsideNudge;
      this.nextPosition.x += this.avoidanceSide() * stepDistance * Balance.palisade.slideBias;
    } else if (fromNorth) {
      this.nextPosition.z = maxZ + outsideNudge;
      this.nextPosition.x += this.avoidanceSide() * stepDistance * Balance.palisade.slideBias;
    } else {
      const pushWest = Math.abs(this.nextPosition.x - minX);
      const pushEast = Math.abs(maxX - this.nextPosition.x);
      const pushSouth = Math.abs(this.nextPosition.z - minZ);
      const pushNorth = Math.abs(maxZ - this.nextPosition.z);
      const push = Math.min(pushWest, pushEast, pushSouth, pushNorth);
      if (push === pushWest) this.nextPosition.x = minX;
      else if (push === pushEast) this.nextPosition.x = maxX;
      else if (push === pushSouth) this.nextPosition.z = minZ;
      else this.nextPosition.z = maxZ;
    }
  }

  private avoidanceSide(): number {
    return this.id % 2 === 0 ? 1 : -1;
  }

  private syncVisualY(): void {
    this.group.position.y = Terrain.visualY(this.group.position.x, this.group.position.z, Balance.enemy.groundY);
  }
}

function riverSide(z: number): 'north' | 'south' | null {
  if (z > Terrain.RIVER_MAX_Z) return 'north';
  if (z < Terrain.RIVER_MIN_Z) return 'south';
  return null;
}

function seededOffset(seed: number): number {
  const lane = (seed >>> 0) % FORMATION_LANES;
  const laneUnit = FORMATION_LANES <= 1 ? 0 : (lane / (FORMATION_LANES - 1)) * 2 - 1;
  return (laneUnit + hashUnit(seed) * FORMATION_JITTER) * Balance.enemy.formationSpreadWidth;
}

function hashUnit(seed: number): number {
  let value = Math.imul((seed >>> 0) ^ 0x9e3779b9, 0x85ebca6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35);
  value ^= value >>> 16;
  return ((value >>> 0) / 0xffffffff) * 2 - 1;
}

function safeFormationSpread(): number {
  const ringGap = Math.max(0, Balance.meta.territoryRingGapHalfWidth - FORMATION_GAP_CLEARANCE);
  const fordGap = Math.max(
    0,
    Math.min(...Terrain.fordRanges().map((range) => range.halfWidth), (Terrain.FORD_MAX_X - Terrain.FORD_MIN_X) * 0.5) -
      FORMATION_GAP_CLEARANCE,
  );
  return Math.min(Balance.enemy.formationSpreadWidth, ringGap, fordGap);
}

export function disposeClaimJumperAssets(assets: ClaimJumperAssets): void {
  assets.ponchoGeometry.dispose();
  assets.sackGeometry.dispose();
  assets.faceGeometry.dispose();
  assets.brimGeometry.dispose();
  assets.crownGeometry.dispose();
  assets.shadowGeometry.dispose();
  assets.ponchoMaterial.dispose();
  assets.sackMaterial.dispose();
  assets.faceMaterial.dispose();
  assets.hatMaterial.dispose();
  assets.shadowMaterial.dispose();
}
