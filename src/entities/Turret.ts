import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

export class TurretPool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly geometry = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.16, 0),
      new THREE.Vector2(0.22, 0.18),
      new THREE.Vector2(0.13, 0.54),
      new THREE.Vector2(0.32, 0.76),
      new THREE.Vector2(0.34, 1.02),
      new THREE.Vector2(0.18, 1.1),
    ],
    10,
  );
  private readonly material = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#5b8a8a',
    emissiveIntensity: 0.38,
    roughness: 0.48,
    metalness: 0.32,
  });
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.turret.maxCount);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor() {
    this.group.name = 'TurretPool';
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = true;
    this.mesh.visible = false;
    this.group.add(this.mesh);
    for (let i = 0; i < Balance.turret.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.hide(i);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return Balance.turret.maxCount;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  place(position: THREE.Vector3): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.positions[i]?.copy(position);
      this.alive += 1;
      this.sync(i, 0);
      this.mesh.visible = true;
      this.mesh.instanceMatrix.needsUpdate = true;
      return i;
    }
    return -1;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.mesh.visible = this.alive > 0;
    this.mesh.instanceMatrix.needsUpdate = true;
    return true;
  }

  update(at: number): void {
    this.material.emissiveIntensity = 0.34 + Math.sin(at * Math.PI * 2) * 0.08;
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) this.sync(i, at);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.hide(i);
    }
    this.alive = 0;
    this.mesh.visible = false;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  private sync(index: number, at: number): void {
    const position = this.positions[index];
    if (!position) return;
    this.syncObject.position.set(position.x, Terrain.visualY(position.x, position.z, 0, Balance.turret.overlapRadius), position.z);
    this.syncObject.rotation.set(0, Math.sin(at * 0.9 + index) * 0.12, 0);
    this.syncObject.scale.setScalar(1);
    this.syncObject.updateMatrix();
    this.mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.mesh.setMatrixAt(index, hiddenMatrix);
  }
}
