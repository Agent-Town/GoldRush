import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

export type BoilerHouseSnapshot = {
  index: number;
  active: boolean;
  position: { x: number; z: number };
  hot: boolean;
  cooling: boolean;
};

const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

export class BoilerHousePool {
  readonly group = new THREE.Group();
  private readonly active = Array<boolean>(Balance.boilerHouse.maxCount).fill(false);
  private readonly positions = Array.from({ length: Balance.boilerHouse.maxCount }, () => new THREE.Vector3());
  private readonly bodies = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.7, 1.05, 1.3),
    new THREE.MeshStandardMaterial({ color: '#5b4634', roughness: 0.72, metalness: 0.2 }),
    Balance.boilerHouse.maxCount,
  );
  private readonly drums = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.42, 0.42, 1.45, 14),
    new THREE.MeshStandardMaterial({ color: '#8b7d3c', emissive: '#2f8f85', emissiveIntensity: 0.08, roughness: 0.48, metalness: 0.42 }),
    Balance.boilerHouse.maxCount,
  );
  private readonly stacks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.12, 0.17, 1.25, 10),
    new THREE.MeshStandardMaterial({ color: '#3e332b', roughness: 0.7, metalness: 0.28 }),
    Balance.boilerHouse.maxCount,
  );
  private readonly signs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.9, 0.28, 0.08),
    new THREE.MeshStandardMaterial({ color: '#2f8f85', emissive: '#8b7d3c', emissiveIntensity: 0.12, roughness: 0.58, metalness: 0.3 }),
    Balance.boilerHouse.maxCount,
  );
  private readonly steam = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.38, 10, 8),
    new THREE.MeshBasicMaterial({ color: '#fff8e8', transparent: true, opacity: 0.68, depthWrite: false }),
    Balance.boilerHouse.maxCount,
  );
  private readonly object = new THREE.Object3D();

  constructor() {
    this.group.name = 'BoilerHousePool';
    this.group.visible = false;
    this.bodies.name = 'BoilerHousePlaceholder';
    this.drums.name = 'BoilerHouseBrassDrum';
    this.stacks.name = 'BoilerHouseStack';
    this.signs.name = 'BoilerHouseSign';
    this.steam.name = 'BoilerHouseSteamPlume';
    for (const mesh of [this.bodies, this.drums, this.stacks, this.signs, this.steam]) {
      mesh.frustumCulled = false;
      this.group.add(mesh);
    }
    this.reset();
  }

  get activeCount(): number {
    return this.active.filter(Boolean).length;
  }

  get capacity(): number {
    return this.active.length;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  place(position: THREE.Vector3, preferredSlot?: number): number {
    const index = preferredSlot ?? this.active.findIndex((value) => !value);
    if (!Number.isInteger(index) || index < 0 || index >= this.capacity || this.active[index]) return -1;
    this.active[index] = true;
    this.group.visible = true;
    this.positions[index]!.copy(position);
    this.sync(index, false, false, 0);
    return index;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.hide(index);
    this.group.visible = this.activeCount > 0;
    return true;
  }

  update(states: readonly { hot: boolean; cooling: boolean }[], at: number): void {
    for (let index = 0; index < this.capacity; index += 1) {
      if (this.active[index]) this.sync(index, states[index]?.hot === true, states[index]?.cooling === true, at);
    }
  }

  snapshots(states: readonly { hot: boolean; cooling: boolean }[]): BoilerHouseSnapshot[] {
    return this.active.map((active, index) => ({
      index,
      active,
      position: { x: this.positions[index]!.x, z: this.positions[index]!.z },
      hot: active && states[index]?.hot === true,
      cooling: active && states[index]?.cooling === true,
    }));
  }

  reset(): void {
    this.active.fill(false);
    this.group.visible = false;
    for (let index = 0; index < this.capacity; index += 1) this.hide(index);
  }

  dispose(): void {
    for (const mesh of [this.bodies, this.drums, this.stacks, this.signs, this.steam]) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  }

  private sync(index: number, hot: boolean, cooling: boolean, at: number): void {
    const position = this.positions[index]!;
    const y = Terrain.visualY(position.x, position.z, 0, 1.1);
    this.set(this.bodies, index, position.x, y + 0.52, position.z);
    this.set(this.drums, index, position.x, y + 1.04, position.z, Math.PI / 2, hot ? 1.02 : 1);
    this.set(this.stacks, index, position.x + 0.55, y + 1.65, position.z + 0.32);
    this.set(this.signs, index, position.x, y + 0.65, position.z + 0.68);
    if (cooling) {
      const plume = 1 + Math.sin(at * 9 + index) * 0.14;
      this.set(this.steam, index, position.x + 0.55, y + 2.45 + (at % 0.5), position.z + 0.32, 0, plume);
    } else {
      this.steam.setMatrixAt(index, hidden);
    }
    this.mark();
  }

  private set(mesh: THREE.InstancedMesh, index: number, x: number, y: number, z: number, zRotation = 0, scale = 1): void {
    this.object.position.set(x, y, z);
    this.object.rotation.set(0, 0, zRotation);
    this.object.scale.setScalar(scale);
    this.object.updateMatrix();
    mesh.setMatrixAt(index, this.object.matrix);
  }

  private hide(index: number): void {
    for (const mesh of [this.bodies, this.drums, this.stacks, this.signs, this.steam]) mesh.setMatrixAt(index, hidden);
    this.mark();
  }

  private mark(): void {
    for (const mesh of [this.bodies, this.drums, this.stacks, this.signs, this.steam]) mesh.instanceMatrix.needsUpdate = true;
  }
}
