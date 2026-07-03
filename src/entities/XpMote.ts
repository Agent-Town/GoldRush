import * as THREE from 'three';
import { Balance } from '../game/Balance';

export class XpMotePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly values: number[] = [];
  private readonly age: number[] = [];
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
      this.values.push(0);
      this.age.push(0);
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
      this.values[i] = value;
      this.age[i] = 0;
      this.alive += 1;
      motePosition.set(position.x, 0.52, position.z);
      this.sync(i);
      this.mesh.instanceMatrix.needsUpdate = true;
      return true;
    }
    return false;
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3,
    onCollect?: (position: THREE.Vector3, value: number) => void,
  ): number {
    let gained = 0;
    const magnetRadiusSq = Balance.xp.moteMagnetRadius * Balance.xp.moteMagnetRadius;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const position = this.positions[i];
      if (!position) continue;

      this.age[i] = (this.age[i] ?? 0) + delta;
      const dx = heroPosition.x - position.x;
      const dz = heroPosition.z - position.z;
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
      position.y = 0.52 + Math.sin((this.age[i] ?? 0) * 8) * 0.07;
      this.sync(i);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    return gained;
  }

  recycleAll(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
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
