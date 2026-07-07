import * as THREE from 'three';
import { assetSlots } from '../assets/slots';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';
import { createBuildingSign, disposeBuildingSign } from './BuildingSign';

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
  private readonly cribGeometry = new THREE.BoxGeometry(1.12, 0.18, 1.12);
  private readonly strongboxGeometry = new THREE.BoxGeometry(0.62, 0.36, 0.48);
  private readonly material = new THREE.MeshStandardMaterial({
    color: nugget,
    emissive: '#7a5132',
    emissiveIntensity: 0.18,
    roughness: 0.58,
    metalness: 0.22,
    flatShading: true,
  });
  private readonly cribMaterial = new THREE.MeshStandardMaterial({
    color: '#6b4a2f',
    emissive: '#3b2a1a',
    emissiveIntensity: 0.12,
    roughness: 0.84,
    metalness: 0.02,
    flatShading: true,
  });
  private readonly strongboxMaterial = new THREE.MeshStandardMaterial({
    color: '#e8d5a8',
    emissive: '#8b7d3c',
    emissiveIntensity: 0.16,
    roughness: 0.72,
    metalness: 0.12,
    flatShading: true,
  });
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.stockpile.maxCount);
  private readonly cribs = new THREE.InstancedMesh(this.cribGeometry, this.cribMaterial, Balance.stockpile.maxCount);
  private readonly strongboxes = new THREE.InstancedMesh(this.strongboxGeometry, this.strongboxMaterial, Balance.stockpile.maxCount);
  private readonly signs = createBuildingSign(assetSlots.bldPortraitStockpile, Balance.stockpile.maxCount, 'StockpilePortraitSigns');
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor() {
    this.group.name = 'StockpilePool';
    this.group.visible = false;
    this.mesh.name = 'StockpileGoldNuggets';
    this.cribs.name = 'StockpileTimberCribs';
    this.strongboxes.name = 'StockpileStrongboxes';
    for (const mesh of [this.cribs, this.strongboxes, this.mesh, this.signs]) {
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    for (let i = 0; i < Balance.stockpile.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.pileSteps.push(0);
      this.hide(i);
    }
    this.markNeedsUpdate();
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
      this.markNeedsUpdate();
      return i;
    }
    return -1;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.pileSteps[index] = 0;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.group.visible = this.alive > 0;
    this.markNeedsUpdate();
    return true;
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
    if (dirty) this.markNeedsUpdate();
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.pileSteps[i] = 0;
      this.hide(i);
    }
    this.alive = 0;
    this.group.visible = false;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.geometry.dispose();
    this.cribGeometry.dispose();
    this.strongboxGeometry.dispose();
    this.material.dispose();
    this.cribMaterial.dispose();
    this.strongboxMaterial.dispose();
    disposeBuildingSign(this.signs);
  }

  diagnostics(): { active: number; signs: number; meshes: string[]; lit: boolean } {
    return {
      active: this.alive,
      signs: this.alive,
      meshes: [this.cribs.name, this.strongboxes.name, this.mesh.name, this.signs.name],
      lit: true,
    };
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
    const yaw = index * 0.7;
    const groundY = Terrain.visualY(position.x, position.z, 0, 0.7);
    this.syncObject.position.set(position.x, groundY + 0.12, position.z);
    this.syncObject.rotation.set(0, yaw, 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.cribs.setMatrixAt(index, this.syncObject.matrix);
    this.syncLocal(this.strongboxes, index, position, groundY, -0.22, 0.34, -0.14, yaw, 1, 1, 1);
    this.syncLocal(this.signs, index, position, groundY, 0.38, 0.7, -0.5, yaw, 0.78, 0.52, 1, -1.05);
    this.syncObject.position.set(position.x, groundY + 0.1 + step * 0.025, position.z);
    this.syncObject.rotation.set(0, yaw, 0);
    this.syncObject.scale.set(scale, scale, scale);
    this.syncObject.updateMatrix();
    this.mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.mesh.setMatrixAt(index, hiddenMatrix);
    this.cribs.setMatrixAt(index, hiddenMatrix);
    this.strongboxes.setMatrixAt(index, hiddenMatrix);
    this.signs.setMatrixAt(index, hiddenMatrix);
  }

  private markNeedsUpdate(): void {
    this.mesh.instanceMatrix.needsUpdate = true;
    this.cribs.instanceMatrix.needsUpdate = true;
    this.strongboxes.instanceMatrix.needsUpdate = true;
    this.signs.instanceMatrix.needsUpdate = true;
  }

  private syncLocal(
    mesh: THREE.InstancedMesh,
    index: number,
    position: THREE.Vector3,
    groundY: number,
    localX: number,
    localY: number,
    localZ: number,
    yaw: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
    pitch = 0,
  ): void {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    this.syncObject.position.set(position.x + localX * cos + localZ * sin, groundY + localY, position.z - localX * sin + localZ * cos);
    this.syncObject.rotation.set(pitch, yaw, 0);
    this.syncObject.scale.set(scaleX, scaleY, scaleZ);
    this.syncObject.updateMatrix();
    mesh.setMatrixAt(index, this.syncObject.matrix);
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
