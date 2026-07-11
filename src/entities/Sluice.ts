import * as THREE from 'three';
import { assetSlots } from '../assets/slots';
import type { ClaimJumperEnemy } from './Enemy';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import * as Terrain from '../world/Terrain';
import { createBuildingSign, disposeBuildingSign } from './BuildingSign';

export type SluiceSnapshot = {
  id: string;
  active: boolean;
  position: { x: number; z: number };
  progress: number;
  panRateMult: number;
  yieldPerCycle: number;
  contested: boolean;
  capped: boolean;
};

export type SluiceFutureState = {
  timer: number;
  contested: boolean;
  capped: boolean;
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const troughTierColors = [new THREE.Color('#b9824c'), new THREE.Color('#8b7d3c'), new THREE.Color('#5b8a8a')];
const waterTierColors = [new THREE.Color('#5b8a8a'), new THREE.Color('#6fa0a0'), new THREE.Color('#83ded7')];
const frameTierColors = [new THREE.Color('#6b4a2f'), new THREE.Color('#8b7d3c'), new THREE.Color('#c4883a')];
const water = '#5b8a8a';
const sluiceYaw = 0.08;

export class SluicePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly timers: number[] = [];
  private readonly tiers: number[] = [];
  private readonly panRateMults: number[] = [];
  private readonly yieldPerCycles: number[] = [];
  private readonly contested: boolean[] = [];
  private readonly capped: boolean[] = [];
  private readonly troughGeometry = new THREE.BoxGeometry(1.7, 0.32, 0.62);
  private readonly waterGeometry = new THREE.BoxGeometry(1.34, 0.035, 0.34);
  private readonly frameGeometry = new THREE.BoxGeometry(1.88, 0.1, 0.1);
  private readonly legGeometry = new THREE.BoxGeometry(0.1, 0.42, 0.1);
  private readonly wheelGeometry = new THREE.TorusGeometry(0.23, 0.03, 6, 16);
  private readonly spokeGeometry = new THREE.BoxGeometry(0.055, 0.42, 0.035);
  private readonly troughMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#7a5132',
    emissiveIntensity: 0.32,
    roughness: 0.86,
    metalness: 0.02,
    flatShading: true,
  });
  private readonly waterMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: water,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.72,
    roughness: 0.26,
    metalness: 0.04,
  });
  private readonly frameMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#3b2a1a',
    emissiveIntensity: 0.12,
    roughness: 0.82,
    metalness: 0.02,
    flatShading: true,
  });
  private readonly wheelMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#7a5132',
    emissiveIntensity: 0.22,
    roughness: 0.58,
    metalness: 0.28,
    flatShading: true,
  });
  private readonly troughs = new THREE.InstancedMesh(this.troughGeometry, this.troughMaterial, Balance.sluice.maxCount);
  private readonly waters = new THREE.InstancedMesh(this.waterGeometry, this.waterMaterial, Balance.sluice.maxCount);
  private readonly frames = new THREE.InstancedMesh(this.frameGeometry, this.frameMaterial, Balance.sluice.maxCount * 2);
  private readonly legs = new THREE.InstancedMesh(this.legGeometry, this.frameMaterial, Balance.sluice.maxCount * 4);
  private readonly wheelRims = new THREE.InstancedMesh(this.wheelGeometry, this.wheelMaterial, Balance.sluice.maxCount);
  private readonly wheelSpokesA = new THREE.InstancedMesh(this.spokeGeometry, this.wheelMaterial, Balance.sluice.maxCount);
  private readonly wheelSpokesB = new THREE.InstancedMesh(this.spokeGeometry, this.wheelMaterial, Balance.sluice.maxCount);
  private readonly signs = createBuildingSign(assetSlots.bldPortraitSluice, Balance.sluice.maxCount, 'SluicePortraitSigns');
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;
  private wheelPhase = 0;

  constructor() {
    this.group.name = 'SluicePool';
    this.group.visible = false;
    this.troughs.name = 'SluiceTroughs';
    this.waters.name = 'SluiceWaterChannels';
    this.frames.name = 'SluiceTimberRails';
    this.legs.name = 'SluiceTimberLegs';
    this.wheelRims.name = 'SluiceWheelRims';
    this.wheelSpokesA.name = 'SluiceWheelSpokesA';
    this.wheelSpokesB.name = 'SluiceWheelSpokesB';
    for (const mesh of [this.troughs, this.waters, this.frames, this.legs, this.wheelRims, this.wheelSpokesA, this.wheelSpokesB, this.signs]) {
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    for (let i = 0; i < Balance.sluice.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.timers.push(0);
      this.tiers.push(1);
      this.panRateMults.push(1);
      this.yieldPerCycles.push(Balance.sluice.goldPerCycle);
      this.contested.push(false);
      this.capped.push(false);
      this.hide(i);
      this.syncColors(i);
    }
    this.markNeedsUpdate();
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return Balance.sluice.maxCount;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  setTier(index: number, tier: number): void {
    if (index < 0 || index >= this.tiers.length) return;
    this.tiers[index] = Math.max(1, Math.min(3, Math.floor(tier)));
    this.syncColors(index);
  }

  setPanRateMult(index: number, panRateMult: number): void {
    if (index < 0 || index >= this.panRateMults.length) return;
    this.panRateMults[index] = Math.max(0.001, panRateMult);
  }

  setYieldPerCycle(index: number, amount: number): void {
    if (index < 0 || index >= this.yieldPerCycles.length) return;
    this.yieldPerCycles[index] = cleanYield(amount);
  }

  captureFutureState(index: number): SluiceFutureState | null {
    if (!this.active[index]) return null;
    return {
      timer: this.timers[index] ?? 0,
      contested: this.contested[index] === true,
      capped: this.capped[index] === true,
    };
  }

  restoreFutureState(index: number, state: SluiceFutureState): boolean {
    if (!this.active[index] || !Number.isFinite(state.timer) || state.timer < 0) return false;
    this.timers[index] = state.timer;
    this.contested[index] = state.contested;
    this.capped[index] = state.capped;
    return true;
  }

  place(position: THREE.Vector3, preferredSlot?: number): number {
    const slot = preferredSlot ?? this.active.findIndex((active) => !active);
    if (!Number.isInteger(slot) || slot < 0 || slot >= this.active.length || this.active[slot]) return -1;
    this.active[slot] = true;
    this.group.visible = true;
    this.positions[slot]?.copy(position);
    this.timers[slot] = 0;
    this.tiers[slot] = 1;
    this.panRateMults[slot] = 1;
    this.yieldPerCycles[slot] = Balance.sluice.goldPerCycle;
    this.contested[slot] = false;
    this.capped[slot] = false;
    this.alive += 1;
    this.syncTrough(slot);
    this.syncWater(slot, 0, true);
    this.markNeedsUpdate();
    return slot;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.timers[index] = 0;
    this.tiers[index] = 1;
    this.panRateMults[index] = 1;
    this.yieldPerCycles[index] = Balance.sluice.goldPerCycle;
    this.contested[index] = false;
    this.capped[index] = false;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.group.visible = this.alive > 0;
    this.markNeedsUpdate();
    return true;
  }

  update(
    delta: number,
    at: number,
    enemies: readonly ClaimJumperEnemy[],
    economy: Economy,
    onGold: (position: THREE.Vector3, amount: number) => void,
    onBlocked: (position: THREE.Vector3) => void,
    enabled: (index: number) => boolean = () => true,
    panRateMult: (index: number) => number = () => 1,
    yieldPerCycle: (index: number) => number = () => Balance.sluice.goldPerCycle,
  ): void {
    if (this.alive === 0) return;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      this.panRateMults[i] = Math.max(0.001, panRateMult(i));
      this.yieldPerCycles[i] = cleanYield(yieldPerCycle(i));
      const cycleSeconds = Balance.sluice.cycleSeconds / this.panRateMults[i];
      if (!enabled(i)) {
        this.syncWater(i, at, false);
        this.syncWheel(i, at);
        continue;
      }
      const position = this.positions[i];
      if (!position) continue;

      const contested = this.isContested(position, enemies);
      this.contested[i] = contested;
      if (!contested) this.timers[i] = (this.timers[i] ?? 0) + delta;

      if (!contested && (this.timers[i] ?? 0) >= cycleSeconds) {
        const amount = this.yieldPerCycles[i] ?? Balance.sluice.goldPerCycle;
        if (!economy.canReceiveIncome(amount)) {
          if (!this.capped[i]) {
            economy.apply({ id: eventId(), at, type: 'gold_capped', amount: 0 });
            onBlocked(position);
          }
          this.capped[i] = true;
        } else {
          this.capped[i] = false;
          const result = economy.apply({
            id: eventId(),
            at,
            type: 'gold_sluiced',
            sluiceId: `sluice-${i + 1}`,
            amount,
          });
          if (result.ok) {
            this.timers[i] = (this.timers[i] ?? 0) - cycleSeconds;
            onGold(position, amount);
          }
        }
      }

      this.syncWater(i, at, !this.contested[i] && !this.capped[i]);
      this.syncWheel(i, at);
    }
    this.waters.instanceMatrix.needsUpdate = true;
    this.wheelRims.instanceMatrix.needsUpdate = true;
    this.wheelSpokesA.instanceMatrix.needsUpdate = true;
    this.wheelSpokesB.instanceMatrix.needsUpdate = true;
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.timers[i] = 0;
      this.tiers[i] = 1;
      this.panRateMults[i] = 1;
      this.yieldPerCycles[i] = Balance.sluice.goldPerCycle;
      this.contested[i] = false;
      this.capped[i] = false;
      this.hide(i);
    }
    this.alive = 0;
    this.group.visible = false;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.troughGeometry.dispose();
    this.waterGeometry.dispose();
    this.frameGeometry.dispose();
    this.legGeometry.dispose();
    this.wheelGeometry.dispose();
    this.spokeGeometry.dispose();
    this.troughMaterial.dispose();
    this.waterMaterial.dispose();
    this.frameMaterial.dispose();
    this.wheelMaterial.dispose();
    disposeBuildingSign(this.signs);
  }

  diagnostics(): { active: number; signs: number; meshes: string[]; lit: boolean; wheelPhase: number } {
    return {
      active: this.alive,
      signs: this.alive,
      meshes: [
        this.troughs.name,
        this.waters.name,
        this.frames.name,
        this.legs.name,
        this.wheelRims.name,
        this.wheelSpokesA.name,
        this.wheelSpokesB.name,
        this.signs.name,
      ],
      lit: true,
      wheelPhase: Number((this.wheelPhase % (Math.PI * 2)).toFixed(3)),
    };
  }

  snapshot(): SluiceSnapshot[] {
    return this.positions.map((position, index) => {
      const panRateMult = this.panRateMults[index] ?? 1;
      const cycleSeconds = Balance.sluice.cycleSeconds / Math.max(0.001, panRateMult);
      return {
        id: `sluice-${index + 1}`,
        active: this.active[index] === true,
        position: { x: position.x, z: position.z },
        progress: Math.min(1, (this.timers[index] ?? 0) / cycleSeconds),
        panRateMult,
        yieldPerCycle: this.yieldPerCycles[index] ?? Balance.sluice.goldPerCycle,
        contested: this.contested[index] === true,
        capped: this.capped[index] === true,
      };
    });
  }

  private isContested(position: THREE.Vector3, enemies: readonly ClaimJumperEnemy[]): boolean {
    const radiusSq = Balance.sluice.contestedRadius * Balance.sluice.contestedRadius;
    for (let i = 0; i < enemies.length; i += 1) {
      const enemy = enemies[i];
      if (!enemy?.isAlive) continue;
      const dx = enemy.position.x - position.x;
      const dz = enemy.position.z - position.z;
      if (dx * dx + dz * dz <= radiusSq) return true;
    }
    return false;
  }

  private syncTrough(index: number): void {
    const position = this.positions[index];
    if (!position) return;
    const groundY = Terrain.visualY(position.x, position.z, 0, 0.9);
    this.syncObject.position.set(position.x, groundY + 0.2, position.z);
    this.syncObject.rotation.set(0, sluiceYaw, 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.troughs.setMatrixAt(index, this.syncObject.matrix);
    this.syncLocal(this.frames, index * 2, position, groundY, 0, 0.47, -0.38, 1, 1, 1);
    this.syncLocal(this.frames, index * 2 + 1, position, groundY, 0, 0.47, 0.38, 1, 1, 1);
    let leg = index * 4;
    for (const x of [-0.8, 0.8]) {
      for (const z of [-0.32, 0.32]) {
        this.syncLocal(this.legs, leg, position, groundY, x, 0.22, z, 1, 1, 1);
        leg += 1;
      }
    }
    this.syncLocal(this.signs, index, position, groundY, 0.46, 0.86, -0.48, 0.94, 0.6, 1, 0, -1.05);
    this.syncWheel(index, 0);
  }

  private syncWater(index: number, at: number, visible: boolean): void {
    if (!visible) {
      this.waters.setMatrixAt(index, hiddenMatrix);
      return;
    }
    const position = this.positions[index];
    if (!position) return;
    const groundY = Terrain.visualY(position.x, position.z, 0, 0.9);
    this.syncObject.position.set(position.x, groundY + 0.39 + Math.sin(at * 3.2 + index) * 0.018, position.z);
    this.syncObject.rotation.set(0, sluiceYaw, 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.waters.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.troughs.setMatrixAt(index, hiddenMatrix);
    this.waters.setMatrixAt(index, hiddenMatrix);
    this.frames.setMatrixAt(index * 2, hiddenMatrix);
    this.frames.setMatrixAt(index * 2 + 1, hiddenMatrix);
    for (let leg = 0; leg < 4; leg += 1) this.legs.setMatrixAt(index * 4 + leg, hiddenMatrix);
    this.wheelRims.setMatrixAt(index, hiddenMatrix);
    this.wheelSpokesA.setMatrixAt(index, hiddenMatrix);
    this.wheelSpokesB.setMatrixAt(index, hiddenMatrix);
    this.signs.setMatrixAt(index, hiddenMatrix);
  }

  private syncColors(index: number): void {
    const tierIndex = Math.max(0, Math.min(2, (this.tiers[index] ?? 1) - 1));
    this.troughs.setColorAt(index, troughTierColors[tierIndex] ?? troughTierColors[0]);
    this.waters.setColorAt(index, waterTierColors[tierIndex] ?? waterTierColors[0]);
    this.frames.setColorAt(index * 2, frameTierColors[tierIndex] ?? frameTierColors[0]);
    this.frames.setColorAt(index * 2 + 1, frameTierColors[tierIndex] ?? frameTierColors[0]);
    if (this.troughs.instanceColor) this.troughs.instanceColor.needsUpdate = true;
    if (this.waters.instanceColor) this.waters.instanceColor.needsUpdate = true;
    if (this.frames.instanceColor) this.frames.instanceColor.needsUpdate = true;
  }

  private markNeedsUpdate(): void {
    this.troughs.instanceMatrix.needsUpdate = true;
    this.waters.instanceMatrix.needsUpdate = true;
    this.frames.instanceMatrix.needsUpdate = true;
    this.legs.instanceMatrix.needsUpdate = true;
    this.wheelRims.instanceMatrix.needsUpdate = true;
    this.wheelSpokesA.instanceMatrix.needsUpdate = true;
    this.wheelSpokesB.instanceMatrix.needsUpdate = true;
    this.signs.instanceMatrix.needsUpdate = true;
  }

  private syncWheel(index: number, at: number): void {
    const position = this.positions[index];
    if (!position) return;
    const groundY = Terrain.visualY(position.x, position.z, 0, 0.9);
    this.wheelPhase = at * 2.4;
    const spin = this.wheelPhase + index * 0.45;
    this.syncLocal(this.wheelRims, index, position, groundY, -0.72, 0.48, -0.48, 1, 1, 1, spin);
    this.syncLocal(this.wheelSpokesA, index, position, groundY, -0.72, 0.48, -0.48, 1, 1, 1, spin);
    this.syncLocal(this.wheelSpokesB, index, position, groundY, -0.72, 0.48, -0.48, 1, 1, 1, spin + Math.PI / 2);
  }

  private syncLocal(
    mesh: THREE.InstancedMesh,
    instance: number,
    position: THREE.Vector3,
    groundY: number,
    localX: number,
    localY: number,
    localZ: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
    roll = 0,
    pitch = 0,
  ): void {
    const cos = Math.cos(sluiceYaw);
    const sin = Math.sin(sluiceYaw);
    this.syncObject.position.set(position.x + localX * cos + localZ * sin, groundY + localY, position.z - localX * sin + localZ * cos);
    this.syncObject.rotation.set(pitch, sluiceYaw, roll);
    this.syncObject.scale.set(scaleX, scaleY, scaleZ);
    this.syncObject.updateMatrix();
    mesh.setMatrixAt(instance, this.syncObject.matrix);
  }
}

function eventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `sluice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanYield(amount: number): number {
  return Math.max(1, Math.round(Number.isFinite(amount) ? amount : Balance.sluice.goldPerCycle));
}
