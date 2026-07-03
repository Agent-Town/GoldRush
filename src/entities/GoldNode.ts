import * as THREE from 'three';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import type { Vec2 } from '../world/Terrain';

export type GoldNodeSnapshot = {
  id: string;
  active: boolean;
  anchorIndex: number;
  position: { x: number; z: number };
  remaining: number;
  respawnIn: number;
};

const nuggetClusterGeometry = createNuggetClusterGeometry();
const glintGeometry = new THREE.OctahedronGeometry(0.13, 0);
const nuggetMaterial = new THREE.MeshStandardMaterial({
  color: '#c4883a',
  roughness: 0.38,
  metalness: 0.26,
});
const glintMaterial = new THREE.MeshStandardMaterial({
  color: '#ffe4a0',
  emissive: '#ffe4a0',
  emissiveIntensity: 0.85,
  roughness: 0.2,
  metalness: 0.15,
});
const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

export class GoldNodeVisualBatch {
  readonly group = new THREE.Group();

  private readonly clusterMesh: THREE.InstancedMesh;
  private readonly glintMesh: THREE.InstancedMesh;
  private readonly matrix = new THREE.Matrix4();
  private readonly position = new THREE.Vector3();
  private readonly rotation = new THREE.Quaternion();
  private readonly scale = new THREE.Vector3();

  constructor(capacity: number) {
    this.group.name = 'GoldSeamVisualBatch';
    this.clusterMesh = new THREE.InstancedMesh(nuggetClusterGeometry, nuggetMaterial, capacity);
    this.clusterMesh.name = 'GoldSeamNuggetInstances';
    this.clusterMesh.castShadow = true;
    this.clusterMesh.receiveShadow = true;

    this.glintMesh = new THREE.InstancedMesh(glintGeometry, glintMaterial, capacity);
    this.glintMesh.name = 'GoldSeamGlintInstances';
    this.glintMesh.castShadow = false;
    this.glintMesh.receiveShadow = false;

    for (let index = 0; index < capacity; index += 1) {
      this.clusterMesh.setMatrixAt(index, hiddenMatrix);
      this.glintMesh.setMatrixAt(index, hiddenMatrix);
    }
    this.clusterMesh.instanceMatrix.needsUpdate = true;
    this.glintMesh.instanceMatrix.needsUpdate = true;

    this.group.add(this.clusterMesh, this.glintMesh);
    tagPlaceholder(this.group, assetSlots.nodeGoldSeam);
  }

  show(index: number, anchor: Vec2): void {
    this.position.set(anchor.x, 0.05, anchor.z);
    this.scale.setScalar(1);
    this.matrix.compose(this.position, this.rotation, this.scale);
    this.clusterMesh.setMatrixAt(index, this.matrix);
    this.clusterMesh.instanceMatrix.needsUpdate = true;
    this.updateGlint(index, anchor, 0, 0);
  }

  hide(index: number): void {
    this.clusterMesh.setMatrixAt(index, hiddenMatrix);
    this.glintMesh.setMatrixAt(index, hiddenMatrix);
    this.clusterMesh.instanceMatrix.needsUpdate = true;
    this.glintMesh.instanceMatrix.needsUpdate = true;
  }

  updateGlint(index: number, anchor: Vec2, anchorIndex: number, at: number): void {
    const pulse = 0.82 + Math.sin(at * 5.4 + anchorIndex) * 0.18;
    this.position.set(anchor.x + 0.08, 0.47, anchor.z - 0.04);
    this.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), at * 5.2);
    this.scale.setScalar(pulse);
    this.matrix.compose(this.position, this.rotation, this.scale);
    this.glintMesh.setMatrixAt(index, this.matrix);
    this.glintMesh.instanceMatrix.needsUpdate = true;
  }
}

export class GoldNode {
  readonly group = new THREE.Group();

  private capacity: number = Balance.goldSeam.capacity;
  private respawnSeconds: number = Balance.goldSeam.respawnSeconds;
  private remaining: number = Balance.goldSeam.capacity;
  private active = false;
  private anchorIndex = -1;
  private respawnAt = 0;
  private anchor: Vec2 = { x: 0, z: 0 };

  constructor(
    readonly id: string,
    private readonly visualIndex: number,
    private readonly visuals: GoldNodeVisualBatch,
  ) {
    this.group.name = `GoldSeam:${id}`;
  }

  get isActive(): boolean {
    return this.active;
  }

  get remainingGold(): number {
    return this.remaining;
  }

  get currentAnchorIndex(): number {
    return this.anchorIndex;
  }

  place(anchor: Vec2, anchorIndex: number): void {
    this.anchor = anchor;
    this.anchorIndex = anchorIndex;
    this.remaining = this.capacity;
    this.respawnAt = 0;
    this.active = true;
    this.group.visible = true;
    this.group.position.set(anchor.x, 0.05, anchor.z);
    this.visuals.show(this.visualIndex, anchor);
  }

  takeGold(amount: number): number {
    if (!this.active) return 0;
    const gained = Math.min(amount, this.remaining);
    this.remaining -= gained;
    return gained;
  }

  deactivateUntil(at: number): void {
    this.active = false;
    this.group.visible = false;
    this.respawnAt = at + this.respawnSeconds;
    this.visuals.hide(this.visualIndex);
  }

  resetInactive(): void {
    this.capacity = Balance.goldSeam.capacity;
    this.respawnSeconds = Balance.goldSeam.respawnSeconds;
    this.remaining = this.capacity;
    this.active = false;
    this.anchorIndex = -1;
    this.respawnAt = 0;
    this.group.visible = false;
    this.group.position.set(0, 0.05, 0);
    this.visuals.hide(this.visualIndex);
  }

  isRespawnReady(at: number): boolean {
    return !this.active && this.respawnAt > 0 && at >= this.respawnAt;
  }

  update(_delta: number, at: number): void {
    if (!this.active) return;
    this.visuals.updateGlint(this.visualIndex, this.anchor, this.anchorIndex, at);
  }

  applyStats(capacity: number, respawnSeconds: number): void {
    const previousCapacity = this.capacity;
    this.capacity = capacity;
    this.respawnSeconds = respawnSeconds;
    if (this.active && capacity > previousCapacity) {
      this.remaining += capacity - previousCapacity;
    } else if (this.remaining > capacity) {
      this.remaining = capacity;
    }
  }

  snapshot(at: number): GoldNodeSnapshot {
    return {
      id: this.id,
      active: this.active,
      anchorIndex: this.anchorIndex,
      position: {
        x: this.group.position.x,
        z: this.group.position.z,
      },
      remaining: this.remaining,
      respawnIn: this.active || this.respawnAt === 0 ? 0 : Math.max(0, this.respawnAt - at),
    };
  }
}

function createNuggetClusterGeometry(): THREE.BufferGeometry {
  const source = new THREE.DodecahedronGeometry(0.2, 0);
  const sourcePosition = source.getAttribute('position') as THREE.BufferAttribute;
  const sourceNormal = source.getAttribute('normal') as THREE.BufferAttribute;
  const offsets = [
    [-0.28, 0.13, -0.08, 0.92],
    [0.02, 0.17, 0.04, 1.12],
    [0.28, 0.12, -0.12, 0.82],
    [-0.08, 0.1, 0.24, 0.72],
    [0.22, 0.09, 0.21, 0.66],
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
