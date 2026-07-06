import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

export type PalisadeBlocker = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
};

type PalisadeBlockerSlot = PalisadeBlocker | undefined;

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const timber = '#c99a61';
const timberLight = '#d9b77d';
const brass = '#8b7d3c';
const postNormalColor = new THREE.Color(timberLight);
const railNormalColor = new THREE.Color(timber);
const braceNormalColor = new THREE.Color(brass);
const postWornColor = new THREE.Color('#92704a');
const railWornColor = new THREE.Color('#7a5132');
const braceWornColor = new THREE.Color('#5d5630');
const postTierColors = [postNormalColor, new THREE.Color('#d9b77d'), new THREE.Color('#ffe4a0')];
const railTierColors = [railNormalColor, new THREE.Color('#b9824c'), new THREE.Color('#c4883a')];
const braceTierColors = [braceNormalColor, new THREE.Color('#9f8f4a'), new THREE.Color('#5b8a8a')];

export class PalisadePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly rotationSteps: number[] = [];
  private readonly worn: boolean[] = [];
  private readonly tiers: number[] = [];
  private readonly blockers: PalisadeBlockerSlot[] = [];
  private readonly postGeometry = new THREE.BoxGeometry(0.16, 0.92, 0.16);
  private readonly railGeometry = new THREE.BoxGeometry(0.18, 0.16, Balance.palisade.depth);
  private readonly braceGeometry = new THREE.BoxGeometry(0.08, 0.22, Balance.palisade.depth * 0.86);
  private readonly postMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.82, metalness: 0.02, vertexColors: true });
  private readonly railMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.86, metalness: 0.02, vertexColors: true });
  private readonly braceMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.74, metalness: 0.18, vertexColors: true });
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
      this.rotationSteps.push(0);
      this.worn.push(false);
      this.tiers.push(1);
      this.hide(i);
      this.syncColors(i);
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

  get activeBlockers(): readonly PalisadeBlockerSlot[] {
    return this.blockers;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  rotationStepsAt(index: number): number {
    return this.rotationSteps[index] ?? 0;
  }

  setWear(index: number, worn: boolean): void {
    if (!this.active[index] || this.worn[index] === worn) return;
    this.worn[index] = worn;
    this.syncColors(index);
  }

  isWorn(index: number): boolean {
    return this.worn[index] === true;
  }

  setTier(index: number, tier: number): void {
    if (index < 0 || index >= this.tiers.length) return;
    this.tiers[index] = Math.max(1, Math.min(3, Math.floor(tier)));
    this.syncColors(index);
  }

  place(position: THREE.Vector3, rotationSteps = 0): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.positions[i]?.copy(position);
      this.rotationSteps[i] = rotationSteps % 4;
      this.worn[i] = false;
      this.tiers[i] = 1;
      const rotated = this.rotationSteps[i] % 2 === 1;
      this.blockers[i] = {
        x: position.x,
        z: position.z,
        halfX: (rotated ? Balance.palisade.depth : Balance.palisade.width) / 2,
        halfZ: (rotated ? Balance.palisade.width : Balance.palisade.depth) / 2,
      };
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
    this.rotationSteps[index] = 0;
    this.worn[index] = false;
    this.tiers[index] = 1;
    this.blockers[index] = undefined;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.markNeedsUpdate();
    return true;
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.rotationSteps[i] = 0;
      this.worn[i] = false;
      this.tiers[i] = 1;
      this.hide(i);
      this.syncColors(i);
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
    const angle = this.rotationStepsAt(index) * (Math.PI / 2);
    const padRadius = Math.max(Balance.palisade.width, Balance.palisade.depth) / 2;
    const groundY = Terrain.visualY(position.x, position.z, 0, padRadius);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const postA = -Balance.palisade.depth / 2 + 0.1;
    const postB = Balance.palisade.depth / 2 - 0.1;
    this.syncPart(this.posts, index * 2, position.x + postA * sin, groundY + 0.46, position.z + postA * cos, 1, angle);
    this.syncPart(this.posts, index * 2 + 1, position.x + postB * sin, groundY + 0.46, position.z + postB * cos, 1, angle);
    this.syncPart(this.rails, index * 2, position.x, groundY + 0.35, position.z, 1, angle);
    this.syncPart(this.rails, index * 2 + 1, position.x, groundY + 0.68, position.z, 0.92, angle);
    this.syncObject.rotation.set(0, angle, 0.12);
    this.syncObject.position.set(position.x, groundY + 0.53, position.z);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.braces.setMatrixAt(index, this.syncObject.matrix);
    this.syncColors(index);
  }

  private syncPart(mesh: THREE.InstancedMesh, index: number, x: number, y: number, z: number, scale: number, angle = 0): void {
    this.syncObject.position.set(x, y, z);
    this.syncObject.rotation.set(0, angle, 0);
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

  private syncColors(index: number): void {
    const worn = this.worn[index] === true;
    const tierIndex = Math.max(0, Math.min(2, (this.tiers[index] ?? 1) - 1));
    const postColor = worn ? postWornColor : (postTierColors[tierIndex] ?? postTierColors[0]);
    const railColor = worn ? railWornColor : (railTierColors[tierIndex] ?? railTierColors[0]);
    const braceColor = worn ? braceWornColor : (braceTierColors[tierIndex] ?? braceTierColors[0]);
    this.posts.setColorAt(index * 2, postColor);
    this.posts.setColorAt(index * 2 + 1, postColor);
    this.rails.setColorAt(index * 2, railColor);
    this.rails.setColorAt(index * 2 + 1, railColor);
    this.braces.setColorAt(index, braceColor);
    if (this.posts.instanceColor) this.posts.instanceColor.needsUpdate = true;
    if (this.rails.instanceColor) this.rails.instanceColor.needsUpdate = true;
    if (this.braces.instanceColor) this.braces.instanceColor.needsUpdate = true;
  }

  private markNeedsUpdate(): void {
    this.posts.instanceMatrix.needsUpdate = true;
    this.rails.instanceMatrix.needsUpdate = true;
    this.braces.instanceMatrix.needsUpdate = true;
  }
}
