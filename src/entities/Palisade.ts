import * as THREE from 'three';
import { Balance } from '../game/Balance';

export type PalisadeBlocker = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const timber = '#c99a61';
const timberLight = '#d9b77d';
const brass = '#8b7d3c';

export class PalisadePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly blockers: PalisadeBlocker[] = [];
  private readonly postGeometry = new THREE.BoxGeometry(0.16, 0.92, 0.16);
  private readonly railGeometry = new THREE.BoxGeometry(0.18, 0.16, Balance.palisade.depth);
  private readonly braceGeometry = new THREE.BoxGeometry(0.08, 0.22, Balance.palisade.depth * 0.86);
  private readonly postMaterial = new THREE.MeshStandardMaterial({ color: timberLight, roughness: 0.82, metalness: 0.02 });
  private readonly railMaterial = new THREE.MeshStandardMaterial({ color: timber, roughness: 0.86, metalness: 0.02 });
  private readonly braceMaterial = new THREE.MeshStandardMaterial({ color: brass, roughness: 0.74, metalness: 0.18 });
  private readonly posts = new THREE.InstancedMesh(this.postGeometry, this.postMaterial, Balance.palisade.maxCount * 2);
  private readonly rails = new THREE.InstancedMesh(this.railGeometry, this.railMaterial, Balance.palisade.maxCount * 2);
  private readonly braces = new THREE.InstancedMesh(this.braceGeometry, this.braceMaterial, Balance.palisade.maxCount);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor() {
    this.group.name = 'PalisadePool';
    for (const mesh of [this.posts, this.rails, this.braces]) {
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      this.group.add(mesh);
    }
    for (let i = 0; i < Balance.palisade.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.hide(i);
    }
    this.markNeedsUpdate();
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return Balance.palisade.maxCount;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  get activeBlockers(): readonly PalisadeBlocker[] {
    return this.blockers;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  place(position: THREE.Vector3): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.positions[i]?.copy(position);
      this.blockers.push({
        x: position.x,
        z: position.z,
        halfX: Balance.palisade.width / 2,
        halfZ: Balance.palisade.depth / 2,
      });
      this.alive += 1;
      this.sync(i);
      this.markNeedsUpdate();
      return i;
    }
    return -1;
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.hide(i);
    }
    this.blockers.length = 0;
    this.alive = 0;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.postGeometry.dispose();
    this.railGeometry.dispose();
    this.braceGeometry.dispose();
    this.postMaterial.dispose();
    this.railMaterial.dispose();
    this.braceMaterial.dispose();
  }

  private sync(index: number): void {
    const position = this.positions[index];
    if (!position) return;
    this.syncPart(this.posts, index * 2, position.x, 0.46, position.z - Balance.palisade.depth / 2 + 0.1, 1);
    this.syncPart(this.posts, index * 2 + 1, position.x, 0.46, position.z + Balance.palisade.depth / 2 - 0.1, 1);
    this.syncPart(this.rails, index * 2, position.x, 0.35, position.z, 1);
    this.syncPart(this.rails, index * 2 + 1, position.x, 0.68, position.z, 0.92);
    this.syncObject.rotation.set(0, 0, 0.12);
    this.syncObject.position.set(position.x, 0.53, position.z);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.braces.setMatrixAt(index, this.syncObject.matrix);
  }

  private syncPart(mesh: THREE.InstancedMesh, index: number, x: number, y: number, z: number, scale: number): void {
    this.syncObject.position.set(x, y, z);
    this.syncObject.rotation.set(0, 0, 0);
    this.syncObject.scale.setScalar(scale);
    this.syncObject.updateMatrix();
    mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.posts.setMatrixAt(index * 2, hiddenMatrix);
    this.posts.setMatrixAt(index * 2 + 1, hiddenMatrix);
    this.rails.setMatrixAt(index * 2, hiddenMatrix);
    this.rails.setMatrixAt(index * 2 + 1, hiddenMatrix);
    this.braces.setMatrixAt(index, hiddenMatrix);
  }

  private markNeedsUpdate(): void {
    this.posts.instanceMatrix.needsUpdate = true;
    this.rails.instanceMatrix.needsUpdate = true;
    this.braces.instanceMatrix.needsUpdate = true;
  }
}
