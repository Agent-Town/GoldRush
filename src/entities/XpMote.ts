import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

export type XpMoteSweepResult = {
  xp: number;
  motes: number;
  agentPath: Array<{ x: number; z: number }>;
  sweptIds: string[];
};

export type XpMoteSuspendSnapshot = {
  slot: number;
  value: number;
  age: number;
  position: { x: number; y: number; z: number };
};

export class XpMotePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly previousActive: boolean[] = [];
  private readonly previousPositions: THREE.Vector3[] = [];
  private readonly values: number[] = [];
  private readonly age: number[] = [];
  private readonly previousAge: number[] = [];
  private readonly geometry = new THREE.TetrahedronGeometry(0.16, 0);
  private readonly material = new THREE.MeshStandardMaterial({
    color: '#a8fff4',
    emissive: '#2f8f89',
    emissiveIntensity: 1.6,
    roughness: 0.42,
    metalness: 0.12,
  });
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.xp.motePool);
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private alive = 0;

  constructor() {
    this.group.name = 'XpMotePool';
    this.mesh.count = Balance.xp.motePool;
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    for (let i = 0; i < Balance.xp.motePool; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.previousActive.push(false);
      this.previousPositions.push(new THREE.Vector3());
      this.values.push(0);
      this.age.push(0);
      this.previousAge.push(0);
      this.hide(i);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  get activeCount(): number {
    return this.alive;
  }

  spawn(position: THREE.Vector3, value: number): boolean {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      const motePosition = this.positions[i];
      if (!motePosition) return false;
      this.active[i] = true;
      this.previousActive[i] = false;
      this.values[i] = value;
      this.age[i] = 0;
      this.alive += 1;
      motePosition.set(position.x, Terrain.visualY(position.x, position.z, 0.52), position.z);
      this.sync(i);
      this.mesh.instanceMatrix.needsUpdate = true;
      return true;
    }
    return false;
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3 | readonly THREE.Vector3[],
    onCollect?: (position: THREE.Vector3, value: number) => void,
  ): number {
    let gained = 0;
    const collectors = Array.isArray(heroPosition) ? heroPosition : [heroPosition];
    const magnetRadiusSq = Balance.xp.moteMagnetRadius * Balance.xp.moteMagnetRadius;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const position = this.positions[i];
      if (!position) continue;

      this.age[i] = (this.age[i] ?? 0) + delta;
      const collector = nearestCollector(collectors, position);
      const dx = collector.x - position.x;
      const dz = collector.z - position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq <= 0.16) {
        const value = this.values[i] ?? 0;
        gained += value;
        if (onCollect && value > 0) onCollect(position, value);
        this.deactivate(i);
        continue;
      }

      if (distanceSq <= magnetRadiusSq && distanceSq > 0.0001) {
        const distance = Math.sqrt(distanceSq);
        const speed = 3.5 + (1 - distance / Balance.xp.moteMagnetRadius) * 5.5;
        position.x += (dx / distance) * speed * delta;
        position.z += (dz / distance) * speed * delta;
      }
      position.y = Terrain.visualY(position.x, position.z, 0.52 + Math.sin((this.age[i] ?? 0) * 8) * 0.07);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    return gained;
  }

  captureRenderState(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.previousActive[i] = this.active[i] === true;
      this.previousPositions[i]?.copy(this.positions[i] ?? this.previousPositions[i]!);
      this.previousAge[i] = this.age[i] ?? 0;
    }
  }

  applyRenderInterpolation(alpha: number): void {
    const amount = THREE.MathUtils.clamp(alpha, 0, 1);
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const position = this.positions[i];
      const previous = this.previousPositions[i];
      if (!position || !previous || !this.previousActive[i]) {
        this.sync(i);
        continue;
      }
      const x = position.x;
      const y = position.y;
      const z = position.z;
      const currentAge = this.age[i] ?? 0;
      position.lerpVectors(previous, position, amount);
      this.age[i] = THREE.MathUtils.lerp(this.previousAge[i] ?? currentAge, currentAge, amount);
      this.sync(i);
      position.set(x, y, z);
      this.age[i] = currentAge;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  hasCollectible(minAgeS: number, from: THREE.Vector3, maxDistance: number): boolean {
    const maxDistanceSq = maxDistance * maxDistance;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i] || (this.age[i] ?? 0) <= minAgeS) continue;
      const position = this.positions[i];
      if (!position || Terrain.sample(position.x, position.z).zone === 'river') continue;
      const dx = position.x - from.x;
      const dz = position.z - from.z;
      if (dx * dx + dz * dz <= maxDistanceSq) return true;
    }
    return false;
  }

  collectAged(
    minAgeS: number,
    from: THREE.Vector3,
    maxDistance: number,
    onCollect?: (position: THREE.Vector3, value: number) => void,
  ): XpMoteSweepResult {
    const maxDistanceSq = maxDistance * maxDistance;
    const path: Array<{ x: number; z: number }> = [];
    const sweptIds: string[] = [];
    let xp = 0;
    let cursor = { x: from.x, z: from.z };

    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i] || (this.age[i] ?? 0) <= minAgeS) continue;
      const position = this.positions[i];
      if (!position || Terrain.sample(position.x, position.z).zone === 'river') continue;
      const dx = position.x - from.x;
      const dz = position.z - from.z;
      if (dx * dx + dz * dz > maxDistanceSq) continue;

      const value = this.values[i] ?? 0;
      path.push(...sampleRoute(routeThroughFord(cursor, position)));
      cursor = { x: position.x, z: position.z };
      sweptIds.push(`mote-${i}`);
      xp += value;
      if (onCollect && value > 0) onCollect(position, value);
      this.deactivate(i);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    return { xp, motes: sweptIds.length, agentPath: path, sweptIds };
  }

  captureSuspend(): XpMoteSuspendSnapshot[] {
    const snapshots: XpMoteSuspendSnapshot[] = [];
    for (let slot = 0; slot < this.active.length; slot += 1) {
      if (!this.active[slot]) continue;
      const position = this.positions[slot];
      if (!position) continue;
      snapshots.push({
        slot,
        value: this.values[slot] ?? 0,
        age: this.age[slot] ?? 0,
        position: { x: position.x, y: position.y, z: position.z },
      });
    }
    return snapshots;
  }

  restoreSuspend(snapshots: readonly XpMoteSuspendSnapshot[]): boolean {
    const slots = new Set<number>();
    for (const snapshot of snapshots) {
      if (!Number.isInteger(snapshot.slot) || snapshot.slot < 0 || snapshot.slot >= this.active.length || slots.has(snapshot.slot)) return false;
      slots.add(snapshot.slot);
    }

    this.recycleAll();
    for (const snapshot of snapshots) {
      const slot = snapshot.slot;
      const position = this.positions[slot];
      if (!position) return false;
      this.active[slot] = true;
      this.previousActive[slot] = false;
      position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
      this.previousPositions[slot]?.copy(position);
      this.values[slot] = snapshot.value;
      this.age[slot] = snapshot.age;
      this.previousAge[slot] = snapshot.age;
      this.alive += 1;
      this.sync(slot);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    return true;
  }

  recycleAll(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.previousActive[i] = false;
      this.values[i] = 0;
      this.age[i] = 0;
      this.hide(i);
    }
    this.alive = 0;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  private deactivate(index: number): void {
    if (!this.active[index]) return;
    this.active[index] = false;
    this.values[index] = 0;
    this.age[index] = 0;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
  }

  private sync(index: number): void {
    const position = this.positions[index];
    if (!position) return;
    this.syncObject.position.copy(position);
    this.syncObject.rotation.set(0.8, (this.age[index] ?? 0) * 3, 0.4);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.mesh.setMatrixAt(index, this.hiddenMatrix);
  }
}

function routeThroughFord(from: { x: number; z: number }, to: { x: number; z: number }): Array<{ x: number; z: number }> {
  if (from.z > Terrain.RIVER_MAX_Z && to.z < Terrain.RIVER_MIN_Z) return [from, { x: 0, z: from.z }, { x: 0, z: to.z }, to];
  if (from.z < Terrain.RIVER_MIN_Z && to.z > Terrain.RIVER_MAX_Z) return [from, { x: 0, z: from.z }, { x: 0, z: to.z }, to];
  return [from, to];
}

function nearestCollector(collectors: readonly THREE.Vector3[], position: THREE.Vector3): THREE.Vector3 {
  let best = collectors[0] ?? position;
  let bestDistanceSq = Number.POSITIVE_INFINITY;
  for (const collector of collectors) {
    const dx = collector.x - position.x;
    const dz = collector.z - position.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < bestDistanceSq) {
      best = collector;
      bestDistanceSq = distanceSq;
    }
  }
  return best;
}

function sampleRoute(route: Array<{ x: number; z: number }>): Array<{ x: number; z: number }> {
  const samples: Array<{ x: number; z: number }> = [];
  for (let i = 1; i < route.length; i += 1) {
    const a = route[i - 1]!;
    const b = route[i]!;
    const distance = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = Math.max(1, Math.ceil(distance / 0.5));
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      samples.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return samples;
}
