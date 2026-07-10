import * as THREE from 'three';
import { assetSlots } from '../assets/slots';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';
import { createBuildingSign, disposeBuildingSign } from './BuildingSign';

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const tierColors = [new THREE.Color('#8b7d3c'), new THREE.Color('#c4883a'), new THREE.Color('#5b8a8a')];

export class TurretPool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly pulseUntil: number[] = [];
  private readonly tiers: number[] = [];
  private readonly baseGeometry = new THREE.BoxGeometry(0.78, 0.18, 0.78);
  private readonly legGeometry = new THREE.CylinderGeometry(0.035, 0.05, 0.72, 6);
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
    color: '#ffffff',
    emissive: '#5b8a8a',
    emissiveIntensity: 0.58,
    roughness: 0.48,
    metalness: 0.32,
    flatShading: true,
  });
  private readonly baseMaterial = new THREE.MeshStandardMaterial({
    color: '#6b4a2f',
    emissive: '#3b2a1a',
    emissiveIntensity: 0.14,
    roughness: 0.82,
    metalness: 0.02,
    flatShading: true,
  });
  private readonly baseMesh = new THREE.InstancedMesh(this.baseGeometry, this.baseMaterial, Balance.turret.maxCount);
  private readonly legMesh = new THREE.InstancedMesh(this.legGeometry, this.baseMaterial, Balance.turret.maxCount * 3);
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.turret.maxCount);
  private readonly signs = createBuildingSign(assetSlots.bldPortraitTurret, Balance.turret.maxCount, 'TurretPortraitSigns');
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;
  private pulses = 0;
  private activePulses = 0;

  constructor() {
    this.group.name = 'TurretPool';
    this.baseMesh.name = 'TurretTimberBases';
    this.legMesh.name = 'TurretTripodLegs';
    this.mesh.name = 'TurretSignalMasts';
    for (const mesh of [this.baseMesh, this.legMesh, this.mesh, this.signs]) {
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    this.mesh.visible = false;
    this.baseMesh.visible = false;
    this.legMesh.visible = false;
    this.signs.visible = false;
    for (let i = 0; i < Balance.turret.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.pulseUntil.push(0);
      this.tiers.push(1);
      this.hide(i);
      this.syncColor(i);
    }
    this.markNeedsUpdate();
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

  get pulseCount(): number {
    return this.pulses;
  }

  get activePulseCount(): number {
    return this.activePulses;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  setTier(index: number, tier: number): void {
    if (index < 0 || index >= this.tiers.length) return;
    this.tiers[index] = Math.max(1, Math.min(3, Math.floor(tier)));
    this.syncColor(index);
  }

  pulse(index: number, at: number): void {
    if (!this.active[index]) return;
    this.pulseUntil[index] = at + Balance.combatReadability.turretPulseSeconds;
    this.pulses += 1;
  }

  place(position: THREE.Vector3, preferredSlot?: number): number {
    const slot = preferredSlot ?? this.active.findIndex((active) => !active);
    if (!Number.isInteger(slot) || slot < 0 || slot >= this.active.length || this.active[slot]) return -1;
    this.active[slot] = true;
    this.positions[slot]?.copy(position);
    this.pulseUntil[slot] = 0;
    this.tiers[slot] = 1;
    this.alive += 1;
    this.sync(slot, 0);
    this.setVisible(true);
    this.markNeedsUpdate();
    return slot;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.pulseUntil[index] = 0;
    this.tiers[index] = 1;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.setVisible(this.alive > 0);
    this.markNeedsUpdate();
    return true;
  }

  update(at: number): void {
    let maxPulse = 0;
    this.activePulses = 0;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const pulse = this.pulseAmount(i, at);
      maxPulse = Math.max(maxPulse, pulse);
      if (pulse > 0) this.activePulses += 1;
      this.sync(i, at, pulse);
    }
    this.material.emissiveIntensity =
      0.34 + Math.sin(at * Math.PI * 2) * 0.08 + maxPulse * Balance.combatReadability.turretPulseIntensity * 3.2;
    this.markNeedsUpdate();
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.pulseUntil[i] = 0;
      this.tiers[i] = 1;
      this.hide(i);
    }
    this.alive = 0;
    this.pulses = 0;
    this.activePulses = 0;
    this.setVisible(false);
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.baseGeometry.dispose();
    this.legGeometry.dispose();
    this.geometry.dispose();
    this.baseMaterial.dispose();
    this.material.dispose();
    disposeBuildingSign(this.signs);
  }

  diagnostics(): { active: number; signs: number; meshes: string[]; lit: boolean } {
    return {
      active: this.alive,
      signs: this.alive,
      meshes: [this.baseMesh.name, this.legMesh.name, this.mesh.name, this.signs.name],
      lit: true,
    };
  }

  private sync(index: number, at: number, pulse = 0): void {
    const position = this.positions[index];
    if (!position) return;
    const groundY = Terrain.visualY(position.x, position.z, 0, Balance.turret.overlapRadius);
    const yaw = Math.sin(at * 0.9 + index) * 0.12;
    this.syncObject.position.set(position.x, groundY + 0.09, position.z);
    this.syncObject.rotation.set(0, yaw, 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.baseMesh.setMatrixAt(index, this.syncObject.matrix);
    for (let leg = 0; leg < 3; leg += 1) {
      const angle = leg * ((Math.PI * 2) / 3) + 0.25 + yaw;
      this.syncObject.position.set(position.x + Math.cos(angle) * 0.3, groundY + 0.38, position.z + Math.sin(angle) * 0.3);
      this.syncObject.rotation.set(0.42 * Math.sin(angle), angle, 0.42 * Math.cos(angle));
      this.syncObject.scale.set(1, 1, 1);
      this.syncObject.updateMatrix();
      this.legMesh.setMatrixAt(index * 3 + leg, this.syncObject.matrix);
    }
    this.syncLocal(this.signs, index, position, groundY, 0, 0.47, -0.5, yaw, 0.78, 0.52, 1, -1.05);
    this.syncObject.position.set(position.x, groundY, position.z);
    this.syncObject.rotation.set(0, yaw, 0);
    const pulseScale = 1 + pulse * Balance.combatReadability.turretPulseIntensity;
    const tierLift = 1 + Math.max(0, (this.tiers[index] ?? 1) - 1) * 0.08;
    this.syncObject.scale.set(pulseScale, pulseScale * tierLift, pulseScale);
    this.syncObject.updateMatrix();
    this.mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private pulseAmount(index: number, at: number): number {
    const remaining = Math.max(0, (this.pulseUntil[index] ?? 0) - at);
    if (remaining <= 0) return 0;
    return remaining / Math.max(0.001, Balance.combatReadability.turretPulseSeconds);
  }

  private hide(index: number): void {
    this.baseMesh.setMatrixAt(index, hiddenMatrix);
    for (let leg = 0; leg < 3; leg += 1) this.legMesh.setMatrixAt(index * 3 + leg, hiddenMatrix);
    this.mesh.setMatrixAt(index, hiddenMatrix);
    this.signs.setMatrixAt(index, hiddenMatrix);
  }

  private syncColor(index: number): void {
    const tierIndex = Math.max(0, Math.min(2, (this.tiers[index] ?? 1) - 1));
    this.mesh.setColorAt(index, tierColors[tierIndex] ?? tierColors[0]);
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  private setVisible(visible: boolean): void {
    this.baseMesh.visible = visible;
    this.legMesh.visible = visible;
    this.mesh.visible = visible;
    this.signs.visible = visible;
  }

  private markNeedsUpdate(): void {
    this.baseMesh.instanceMatrix.needsUpdate = true;
    this.legMesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceMatrix.needsUpdate = true;
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
