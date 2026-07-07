import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const tierColors = [new THREE.Color('#8b7d3c'), new THREE.Color('#c4883a'), new THREE.Color('#5b8a8a')];

export class TurretPool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly pulseUntil: number[] = [];
  private readonly tiers: number[] = [];
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
  });
  private readonly mesh = new THREE.InstancedMesh(this.geometry, this.material, Balance.turret.maxCount);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;
  private pulses = 0;
  private activePulses = 0;

  constructor() {
    this.group.name = 'TurretPool';
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.visible = false;
    this.group.add(this.mesh);
    for (let i = 0; i < Balance.turret.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.pulseUntil.push(0);
      this.tiers.push(1);
      this.hide(i);
      this.syncColor(i);
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

  place(position: THREE.Vector3): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.positions[i]?.copy(position);
      this.tiers[i] = 1;
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
    this.pulseUntil[index] = 0;
    this.tiers[index] = 1;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.mesh.visible = this.alive > 0;
    this.mesh.instanceMatrix.needsUpdate = true;
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
    this.mesh.instanceMatrix.needsUpdate = true;
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
    this.mesh.visible = false;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  private sync(index: number, at: number, pulse = 0): void {
    const position = this.positions[index];
    if (!position) return;
    this.syncObject.position.set(position.x, Terrain.visualY(position.x, position.z, 0, Balance.turret.overlapRadius), position.z);
    this.syncObject.rotation.set(0, Math.sin(at * 0.9 + index) * 0.12, 0);
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
    this.mesh.setMatrixAt(index, hiddenMatrix);
  }

  private syncColor(index: number): void {
    const tierIndex = Math.max(0, Math.min(2, (this.tiers[index] ?? 1) - 1));
    this.mesh.setColorAt(index, tierColors[tierIndex] ?? tierColors[0]);
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
