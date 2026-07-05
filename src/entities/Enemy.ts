import * as THREE from 'three';
import { type CharacterSpriteClip } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import type { BuildingTarget, GoldHolding } from '../systems/TargetingSystem';
import type { PalisadeBlocker } from './Palisade';

export type CompassEdge = 'north' | 'south' | 'east' | 'west';
export type ThiefState = 'none' | 'seekHolding' | 'grabbing' | 'fleeing';
export type WreckerState = 'none' | 'seekBuilding' | 'swinging';

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
  edge?: CompassEdge;
  thief?: boolean;
  wrecker?: boolean;
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
    }),
  };
}

export class ClaimJumperEnemy {
  readonly group = new THREE.Group();

  private readonly velocity = new THREE.Vector3();
  private readonly heading = new THREE.Vector3(0, 0, -1);
  private readonly nextPosition = new THREE.Vector3();
  private readonly fleeTarget = new THREE.Vector3();
  private alive = false;
  private hp = 0;
  private speed: number = Balance.enemy.speed;
  private contactCooldown = 0;
  private spriteClip: CharacterSpriteClip = 'idle';
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

  get animationClip(): CharacterSpriteClip {
    return this.spriteClip;
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

  setAnimationClip(clip: CharacterSpriteClip): void {
    this.spriteClip = clip;
  }

  spawn(position: THREE.Vector3, params: EnemySpawnParams = {}): void {
    this.alive = true;
    this.hp = Balance.enemy.hp * (params.hpScale ?? 1);
    this.speed = Balance.enemy.speed * (params.speedScale ?? 1);
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
    this.velocity.set(0, 0, 0);
    this.heading.set(0, 0, -1);
    this.spriteClip = 'walk';
    this.group.position.copy(position);
    this.group.position.y = Balance.enemy.groundY;
    this.group.rotation.y = 0;
    this.group.visible = true;
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3,
    separationX: number,
    separationZ: number,
    blockers: readonly PalisadeBlocker[] = [],
    thiefContext?: ThiefUpdateContext,
    wreckerContext?: WreckerUpdateContext,
  ): boolean {
    if (!this.alive) return false;

    this.contactCooldown = Math.max(0, this.contactCooldown - delta);

    const targetPosition = this.updateThief(delta, thiefContext) ?? this.updateWrecker(delta, wreckerContext) ?? heroPosition;
    const speed = this.thiefState === 'fleeing' ? this.speed * Balance.steal.fleeSpeedMult : this.speed;

    this.heading.set(targetPosition.x - this.group.position.x, 0, targetPosition.z - this.group.position.z);
    const distanceSq = this.heading.lengthSq();
    if (distanceSq > 0.0001) {
      this.heading.normalize();
    } else {
      this.heading.set(0, 0, 0);
    }

    this.velocity.set(
      this.heading.x + separationX * Balance.enemy.separationStrength,
      0,
      this.heading.z + separationZ * Balance.enemy.separationStrength,
    );
    if (this.velocity.lengthSq() > 1) this.velocity.normalize();

    if (this.thiefState === 'grabbing' || this.wreckerState === 'swinging') {
      this.velocity.set(0, 0, 0);
    } else if (blockers.length === 0) {
      this.group.position.addScaledVector(this.velocity, speed * delta);
    } else {
      this.move(delta, blockers, speed);
    }
    this.group.position.y = Balance.enemy.groundY;

    if (this.velocity.lengthSq() > 0.0025) {
      this.group.rotation.y = Math.atan2(this.velocity.x, -this.velocity.z);
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
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  recycle(): void {
    this.alive = false;
    this.hp = 0;
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
    this.velocity.set(0, 0, 0);
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

  private move(delta: number, blockers: readonly PalisadeBlocker[], speed: number): void {
    const distance = speed * delta;
    const steps = blockers.length > 0 ? Math.max(1, Math.min(8, Math.ceil(distance / 0.25))) : 1;
    const stepDistance = distance / steps;
    for (let step = 0; step < steps; step += 1) {
      this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, stepDistance);
      for (const blocker of blockers) this.resolveBlocker(blocker, stepDistance);
      this.group.position.copy(this.nextPosition);
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
