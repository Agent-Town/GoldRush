import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { GoldHolding } from '../systems/TargetingSystem';
import * as Terrain from '../world/Terrain';

export type GoldPickupSnapshot = {
  active: boolean;
  amount: number;
  position: { x: number; z: number };
};
export type GoldPickupCollectResult = {
  index: number;
  amount: number;
  position: { x: number; z: number };
};

const pickupY = 0.42;
const collectRadiusSq = (Balance.hero.radius + 0.35) * (Balance.hero.radius + 0.35);

export class GoldPickupPool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly amounts: number[] = [];
  private readonly age: number[] = [];
  private readonly blockedCooldown: number[] = [];
  private readonly geometry = new THREE.DodecahedronGeometry(0.2, 0);
  private readonly material = new THREE.MeshStandardMaterial({
    color: '#c4883a',
    emissive: '#8b7d3c',
    emissiveIntensity: 0.45,
    roughness: 0.38,
    metalness: 0.28,
  });
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.steal.pickupCap);
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly holdings: GoldHolding[] = [];
  private alive = 0;
  private total = 0;

  constructor() {
    this.group.name = 'GoldPickupPool';
    this.mesh.count = Balance.steal.pickupCap;
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    for (let i = 0; i < Balance.steal.pickupCap; i += 1) {
      const position = new THREE.Vector3();
      this.active.push(false);
      this.positions.push(position);
      this.amounts.push(0);
      this.age.push(0);
      this.blockedCooldown.push(0);
      this.holdings.push({
        id: `pickup:${i}`,
        kind: 'pickup',
        position,
        active: false,
        amount: 0,
        pickupIndex: i,
      });
      this.hide(i);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  get activeCount(): number {
    return this.alive;
  }

  get totalAmount(): number {
    return this.total;
  }

  get goldHoldings(): readonly GoldHolding[] {
    return this.holdings;
  }

  spawn(position: THREE.Vector3, amount: number): number {
    if (amount <= 0) return -1;
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.positions[i]?.set(position.x, Terrain.visualY(position.x, position.z, pickupY), position.z);
      this.amounts[i] = amount;
      this.age[i] = 0;
      this.blockedCooldown[i] = 0;
      this.alive += 1;
      this.total += amount;
      this.syncHolding(i);
      this.sync(i);
      this.mesh.instanceMatrix.needsUpdate = true;
      return i;
    }
    return this.mergeNearest(position, amount);
  }

  take(index: number): number {
    if (!this.active[index]) return 0;
    const amount = this.amounts[index] ?? 0;
    this.deactivate(index);
    return amount;
  }

  hasCollectibleNear(position: THREE.Vector3, radius: number): boolean {
    return this.nearestActiveIndex(position, radius) >= 0;
  }

  collectNear(
    collectorPosition: THREE.Vector3,
    radius: number,
    canCollect: (amount: number) => boolean,
    onCollect: (position: THREE.Vector3, amount: number) => void,
    onBlocked: (position: THREE.Vector3) => void,
  ): GoldPickupCollectResult | false {
    const index = this.nearestActiveIndex(collectorPosition, radius);
    if (index < 0) return false;
    const position = this.positions[index];
    const amount = this.amounts[index] ?? 0;
    if (!position || amount <= 0) return false;
    if (!canCollect(amount)) {
      onBlocked(position);
      return false;
    }
    const collectedAt = { x: position.x, z: position.z };
    onCollect(position, amount);
    this.deactivate(index);
    return { index, amount, position: collectedAt };
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3,
    canCollect: (amount: number) => boolean,
    onCollect: (position: THREE.Vector3, amount: number) => void,
    onBlocked: (position: THREE.Vector3) => void,
  ): void {
    let dirty = false;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const position = this.positions[i];
      if (!position) continue;

      this.age[i] = (this.age[i] ?? 0) + delta;
      this.blockedCooldown[i] = Math.max(0, (this.blockedCooldown[i] ?? 0) - delta);
      const dx = heroPosition.x - position.x;
      const dz = heroPosition.z - position.z;
      if (dx * dx + dz * dz <= collectRadiusSq) {
        const amount = this.amounts[i] ?? 0;
        if (canCollect(amount)) {
          onCollect(position, amount);
          this.deactivate(i);
          dirty = true;
          continue;
        }
        if ((this.blockedCooldown[i] ?? 0) <= 0) {
          onBlocked(position);
          this.blockedCooldown[i] = 0.8;
        }
      }

      position.y = Terrain.visualY(position.x, position.z, pickupY + Math.sin((this.age[i] ?? 0) * 4.5) * 0.06);
      this.sync(i);
      dirty = true;
    }
    if (dirty) this.mesh.instanceMatrix.needsUpdate = true;
  }

  recycleAll(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.amounts[i] = 0;
      this.age[i] = 0;
      this.blockedCooldown[i] = 0;
      this.syncHolding(i);
      this.hide(i);
    }
    this.alive = 0;
    this.total = 0;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  snapshot(): GoldPickupSnapshot[] {
    return this.positions.map((position, index) => ({
      active: this.active[index] === true,
      amount: this.amounts[index] ?? 0,
      position: { x: position.x, z: position.z },
    }));
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  private mergeNearest(position: THREE.Vector3, amount: number): number {
    let best = -1;
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const pickupPosition = this.positions[i];
      if (!pickupPosition) continue;
      const dx = pickupPosition.x - position.x;
      const dz = pickupPosition.z - position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < bestDistanceSq) {
        best = i;
        bestDistanceSq = distanceSq;
      }
    }
    if (best < 0) return -1;
    this.amounts[best] = (this.amounts[best] ?? 0) + amount;
    this.total += amount;
    this.syncHolding(best);
    return best;
  }

  private nearestActiveIndex(position: THREE.Vector3, radius: number): number {
    let best = -1;
    let bestDistanceSq = Math.max(0, radius) * Math.max(0, radius);
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const pickupPosition = this.positions[i];
      if (!pickupPosition) continue;
      const dx = pickupPosition.x - position.x;
      const dz = pickupPosition.z - position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq <= bestDistanceSq) {
        best = i;
        bestDistanceSq = distanceSq;
      }
    }
    return best;
  }

  private deactivate(index: number): void {
    if (!this.active[index]) return;
    this.total = Math.max(0, this.total - (this.amounts[index] ?? 0));
    this.active[index] = false;
    this.amounts[index] = 0;
    this.age[index] = 0;
    this.blockedCooldown[index] = 0;
    this.alive = Math.max(0, this.alive - 1);
    this.syncHolding(index);
    this.hide(index);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private sync(index: number): void {
    const position = this.positions[index];
    if (!position) return;
    const scale = 0.84 + Math.min(1.2, (this.amounts[index] ?? 0) / Math.max(1, Balance.steal.grabAmount)) * 0.22;
    this.syncObject.position.copy(position);
    this.syncObject.rotation.set(0.45, (this.age[index] ?? 0) * 1.8, 0.2);
    this.syncObject.scale.setScalar(scale);
    this.syncObject.updateMatrix();
    this.mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private syncHolding(index: number): void {
    const holding = this.holdings[index];
    if (!holding) return;
    holding.active = this.active[index] === true;
    holding.amount = this.amounts[index] ?? 0;
  }

  private hide(index: number): void {
    this.mesh.setMatrixAt(index, this.hiddenMatrix);
  }
}
