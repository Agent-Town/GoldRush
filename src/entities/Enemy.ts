import * as THREE from 'three';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import type { PalisadeBlocker } from './Palisade';

export type ClaimJumperAssets = {
  ponchoGeometry: THREE.ConeGeometry;
  faceGeometry: THREE.SphereGeometry;
  brimGeometry: THREE.CylinderGeometry;
  crownGeometry: THREE.CylinderGeometry;
  shadowGeometry: THREE.CircleGeometry;
  ponchoMaterial: THREE.MeshStandardMaterial;
  faceMaterial: THREE.MeshStandardMaterial;
  hatMaterial: THREE.MeshStandardMaterial;
  shadowMaterial: THREE.MeshBasicMaterial;
};

export type EnemySpawnParams = {
  speedScale?: number;
  hpScale?: number;
};

export function createClaimJumperAssets(): ClaimJumperAssets {
  return {
    ponchoGeometry: new THREE.ConeGeometry(0.54, 1.08, 7),
    faceGeometry: new THREE.SphereGeometry(0.18, 12, 8),
    brimGeometry: new THREE.CylinderGeometry(0.42, 0.42, 0.055, 18),
    crownGeometry: new THREE.CylinderGeometry(0.27, 0.31, 0.28, 16),
    shadowGeometry: new THREE.CircleGeometry(0.54, 20),
    ponchoMaterial: new THREE.MeshStandardMaterial({
      color: '#a0522d',
      roughness: 0.88,
      metalness: 0.02,
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
  private alive = false;
  private hp = 0;
  private speed: number = Balance.enemy.speed;
  private contactCooldown = 0;

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

  spawn(position: THREE.Vector3, params: EnemySpawnParams = {}): void {
    this.alive = true;
    this.hp = Balance.enemy.hp * (params.hpScale ?? 1);
    this.speed = Balance.enemy.speed * (params.speedScale ?? 1);
    this.contactCooldown = 0;
    this.velocity.set(0, 0, 0);
    this.heading.set(0, 0, -1);
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
  ): boolean {
    if (!this.alive) return false;

    this.contactCooldown = Math.max(0, this.contactCooldown - delta);

    this.heading.set(heroPosition.x - this.group.position.x, 0, heroPosition.z - this.group.position.z);
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

    if (blockers.length === 0) {
      this.group.position.addScaledVector(this.velocity, this.speed * delta);
    } else {
      this.move(delta, blockers);
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
    this.velocity.set(0, 0, 0);
    this.group.visible = false;
    this.group.position.set(0, Balance.enemy.groundY, 0);
  }

  dispose(): void {
    this.group.clear();
  }

  private move(delta: number, blockers: readonly PalisadeBlocker[]): void {
    const distance = this.speed * delta;
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
  assets.faceGeometry.dispose();
  assets.brimGeometry.dispose();
  assets.crownGeometry.dispose();
  assets.shadowGeometry.dispose();
  assets.ponchoMaterial.dispose();
  assets.faceMaterial.dispose();
  assets.hatMaterial.dispose();
  assets.shadowMaterial.dispose();
}
