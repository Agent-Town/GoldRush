import * as THREE from 'three';
import { loadGeneratedTexture } from '../assets/generated';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

const brass = '#8a6b3a';
const bronze = '#6f5732';
const teal = '#83ded7';
const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

export class SentryBeaconPool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly legGeometry = new THREE.CylinderGeometry(0.035, 0.045, 1.05, 6);
  private readonly capGeometry = new THREE.CylinderGeometry(0.2, 0.24, 0.12, 12);
  private readonly glassGeometry = new THREE.CylinderGeometry(0.18, 0.16, 0.34, 12);
  private readonly coreGeometry = new THREE.SphereGeometry(0.11, 12, 8);
  private readonly legMaterial = new THREE.MeshStandardMaterial({
    color: brass,
    emissive: '#7a5132',
    emissiveIntensity: 0.24,
    roughness: 0.5,
    metalness: 0.38,
  });
  private readonly capMaterial = new THREE.MeshStandardMaterial({
    color: bronze,
    emissive: '#7a5132',
    emissiveIntensity: 0.24,
    roughness: 0.48,
    metalness: 0.42,
  });
  private readonly glassMaterial = new THREE.MeshStandardMaterial({
    color: teal,
    emissive: teal,
    emissiveIntensity: 0.42,
    transparent: true,
    opacity: 0.62,
    roughness: 0.18,
    metalness: 0.04,
  });
  private readonly coreMaterial = new THREE.MeshStandardMaterial({
    color: teal,
    emissive: teal,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.06,
  });
  private readonly legMesh = new THREE.InstancedMesh(this.legGeometry, this.legMaterial, Balance.beacon.maxCount * 3);
  private readonly capMesh = new THREE.InstancedMesh(this.capGeometry, this.capMaterial, Balance.beacon.maxCount);
  private readonly glassMesh = new THREE.InstancedMesh(this.glassGeometry, this.glassMaterial, Balance.beacon.maxCount);
  private readonly coreMesh = new THREE.InstancedMesh(this.coreGeometry, this.coreMaterial, Balance.beacon.maxCount);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor() {
    this.group.name = 'SentryBeaconPool';
    // Art slot: bld.sentry_beacon
    this.legMesh.name = 'SentryBeaconLegs';
    this.legMesh.frustumCulled = false;
    this.legMesh.castShadow = false;
    this.group.add(this.legMesh);
    for (const mesh of [this.capMesh, this.glassMesh, this.coreMesh]) {
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      this.group.add(mesh);
    }
    tagPlaceholder(this.group, assetSlots.bldSentryBeacon);
    void loadGeneratedTexture(assetSlots.bldSentryBeacon);
    for (let i = 0; i < Balance.beacon.maxCount; i += 1) {
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
    return Balance.beacon.maxCount;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  place(position: THREE.Vector3, preferredSlot?: number): number {
    const slot = preferredSlot ?? this.active.findIndex((active) => !active);
    if (!Number.isInteger(slot) || slot < 0 || slot >= this.active.length || this.active[slot]) return -1;
    this.active[slot] = true;
    this.positions[slot]?.copy(position);
    this.alive += 1;
    this.sync(slot, 0);
    this.markNeedsUpdate();
    return slot;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.markNeedsUpdate();
    return true;
  }

  update(at: number): void {
    (this.coreMaterial as THREE.MeshStandardMaterial).emissiveIntensity = 1.55 + Math.sin(at * Math.PI * 2) * 0.35;
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) this.sync(i, at);
    }
    this.markNeedsUpdate();
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.hide(i);
    }
    this.alive = 0;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.legGeometry.dispose();
    this.capGeometry.dispose();
    this.glassGeometry.dispose();
    this.coreGeometry.dispose();
    this.legMaterial.dispose();
    this.capMaterial.dispose();
    this.glassMaterial.dispose();
    this.coreMaterial.dispose();
  }

  private sync(index: number, at: number): void {
    const position = this.positions[index];
    if (!position) return;
    const groundY = Terrain.visualY(position.x, position.z, 0, Balance.beacon.overlapRadius);
    for (let leg = 0; leg < 3; leg += 1) {
      const angle = leg * ((Math.PI * 2) / 3) + 0.2;
      this.syncObject.position.set(position.x + Math.cos(angle) * 0.27, groundY + 0.47, position.z + Math.sin(angle) * 0.27);
      this.syncObject.rotation.set(0.42 * Math.sin(angle), angle, 0.42 * Math.cos(angle));
      this.syncObject.scale.set(1, 1, 1);
      this.syncObject.updateMatrix();
      this.legMesh.setMatrixAt(index * 3 + leg, this.syncObject.matrix);
    }

    this.syncPart(this.capMesh, index, position.x, groundY + 1.04, position.z, 1);
    this.syncPart(this.glassMesh, index, position.x, groundY + 0.82, position.z, 1);
    this.syncPart(this.coreMesh, index, position.x, groundY + 0.82, position.z, 0.92 + Math.sin(at * Math.PI * 2) * 0.08);
  }

  private syncPart(mesh: THREE.InstancedMesh, index: number, x: number, y: number, z: number, scale: number): void {
    this.syncObject.position.set(x, y, z);
    this.syncObject.rotation.set(0, 0, 0);
    this.syncObject.scale.setScalar(scale);
    this.syncObject.updateMatrix();
    mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    for (let leg = 0; leg < 3; leg += 1) this.legMesh.setMatrixAt(index * 3 + leg, hiddenMatrix);
    this.capMesh.setMatrixAt(index, hiddenMatrix);
    this.glassMesh.setMatrixAt(index, hiddenMatrix);
    this.coreMesh.setMatrixAt(index, hiddenMatrix);
  }

  private markNeedsUpdate(): void {
    this.legMesh.instanceMatrix.needsUpdate = true;
    this.capMesh.instanceMatrix.needsUpdate = true;
    this.glassMesh.instanceMatrix.needsUpdate = true;
    this.coreMesh.instanceMatrix.needsUpdate = true;
  }
}
