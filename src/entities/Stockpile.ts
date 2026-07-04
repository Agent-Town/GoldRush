import * as THREE from 'three';
import { Balance } from '../game/Balance';

export type StockpileSnapshot = {
  active: boolean;
  position: { x: number; z: number };
  pileStep: number;
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const nugget = '#c4883a';

export class StockpilePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly pileSteps: number[] = [];
  private readonly geometry = createPileGeometry();
  private readonly material = new THREE.MeshStandardMaterial({
    color: nugget,
    roughness: 0.45,
    metalness: 0.2,
  });
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.stockpile.maxCount);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor() {
    this.group.name = 'StockpilePool';
    this.group.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = true;
    this.group.add(this.mesh);
    for (let i = 0; i < Balance.stockpile.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.pileSteps.push(0);
      this.mesh.setMatrixAt(i, hiddenMatrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return Balance.stockpile.maxCount;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  get maxPileStep(): number {
    let max = 0;
    for (let i = 0; i < this.pileSteps.length; i += 1) {
      if (this.active[i]) max = Math.max(max, this.pileSteps[i] ?? 0);
    }
    return max;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  place(position: THREE.Vector3): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.group.visible = true;
      this.positions[i]?.copy(position);
      this.alive += 1;
      this.sync(i);
      this.mesh.instanceMatrix.needsUpdate = true;
      return i;
    }
    return -1;
  }

  update(banked: number, cap: number): void {
    if (this.alive === 0) return;
    const step = Math.max(0, Math.min(4, Math.floor((banked / Math.max(1, cap)) * 5)));
    let dirty = false;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i] || this.pileSteps[i] === step) continue;
      this.pileSteps[i] = step;
      this.sync(i);
      dirty = true;
    }
    if (dirty) this.mesh.instanceMatrix.needsUpdate = true;
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.pileSteps[i] = 0;
      this.mesh.setMatrixAt(i, hiddenMatrix);
    }
    this.alive = 0;
    this.group.visible = false;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  snapshot(): StockpileSnapshot[] {
    return this.positions.map((position, index) => ({
      active: this.active[index] === true,
      position: { x: position.x, z: position.z },
      pileStep: this.pileSteps[index] ?? 0,
    }));
  }

  private sync(index: number): void {
    const position = this.positions[index];
    if (!position) return;
    const step = this.pileSteps[index] ?? 0;
    const scale = 0.64 + step * 0.16;
    this.syncObject.position.set(position.x, 0.1 + step * 0.025, position.z);
    this.syncObject.rotation.set(0, index * 0.7, 0);
    this.syncObject.scale.set(scale, scale, scale);
    this.syncObject.updateMatrix();
    this.mesh.setMatrixAt(index, this.syncObject.matrix);
  }
}

function createPileGeometry(): THREE.BufferGeometry {
  const source = new THREE.DodecahedronGeometry(0.18, 0);
  const sourcePosition = source.getAttribute('position') as THREE.BufferAttribute;
  const sourceNormal = source.getAttribute('normal') as THREE.BufferAttribute;
  const offsets = [
    [-0.28, 0.1, -0.08, 1],
    [0.04, 0.13, 0.04, 1.14],
    [0.28, 0.09, -0.1, 0.92],
    [-0.08, 0.2, 0.2, 0.78],
    [0.18, 0.18, 0.2, 0.72],
  ] as const;
  const positions: number[] = [];
  const normals: number[] = [];

  for (const [x, y, z, scale] of offsets) {
    for (let index = 0; index < sourcePosition.count; index += 1) {
      positions.push(
        sourcePosition.getX(index) * scale + x,
        sourcePosition.getY(index) * scale + y,
        sourcePosition.getZ(index) * scale + z,
      );
      normals.push(sourceNormal.getX(index), sourceNormal.getY(index), sourceNormal.getZ(index));
    }
  }

  source.dispose();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return geometry;
}
