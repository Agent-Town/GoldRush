import * as THREE from 'three';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';

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

  spawn(position: THREE.Vector3, speedScale: number): void {
    this.alive = true;
    this.hp = Balance.enemy.hp;
    this.speed = Balance.enemy.speed * speedScale;
    this.contactCooldown = 0;
    this.velocity.set(0, 0, 0);
    this.heading.set(0, 0, -1);
    this.group.position.copy(position);
    this.group.position.y = Balance.enemy.groundY;
    this.group.rotation.y = 0;
    this.group.visible = true;
  }

  update(delta: number, heroPosition: THREE.Vector3, separationX: number, separationZ: number): boolean {
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

    this.group.position.addScaledVector(this.velocity, this.speed * delta);
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
