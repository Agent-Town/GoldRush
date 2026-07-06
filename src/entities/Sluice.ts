import * as THREE from 'three';
import type { ClaimJumperEnemy } from './Enemy';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import * as Terrain from '../world/Terrain';

export type SluiceSnapshot = {
  id: string;
  active: boolean;
  position: { x: number; z: number };
  progress: number;
  panRateMult: number;
  contested: boolean;
  capped: boolean;
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const troughTierColors = [new THREE.Color('#b9824c'), new THREE.Color('#8b7d3c'), new THREE.Color('#5b8a8a')];
const waterTierColors = [new THREE.Color('#5b8a8a'), new THREE.Color('#6fa0a0'), new THREE.Color('#83ded7')];
const water = '#5b8a8a';

export class SluicePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly timers: number[] = [];
  private readonly tiers: number[] = [];
  private readonly panRateMults: number[] = [];
  private readonly contested: boolean[] = [];
  private readonly capped: boolean[] = [];
  private readonly troughGeometry = new THREE.BoxGeometry(1.7, 0.32, 0.62);
  private readonly waterGeometry = new THREE.BoxGeometry(1.34, 0.035, 0.34);
  private readonly troughMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.86, metalness: 0.02, vertexColors: true });
  private readonly waterMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: water,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.72,
    roughness: 0.26,
    metalness: 0.04,
    vertexColors: true,
  });
  private readonly troughs = new THREE.InstancedMesh(this.troughGeometry, this.troughMaterial, Balance.sluice.maxCount);
  private readonly waters = new THREE.InstancedMesh(this.waterGeometry, this.waterMaterial, Balance.sluice.maxCount);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor() {
    this.group.name = 'SluicePool';
    this.group.visible = false;
    for (const mesh of [this.troughs, this.waters]) {
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      this.group.add(mesh);
    }
    for (let i = 0; i < Balance.sluice.maxCount; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.timers.push(0);
      this.tiers.push(1);
      this.panRateMults.push(1);
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

  place(position: THREE.Vector3): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.group.visible = true;
      this.positions[i]?.copy(position);
      this.timers[i] = 0;
      this.tiers[i] = 1;
      this.panRateMults[i] = 1;
      this.contested[i] = false;
      this.capped[i] = false;
      this.alive += 1;
      this.syncTrough(i);
      this.syncWater(i, 0, true);
      this.markNeedsUpdate();
      return i;
    }
    return -1;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.timers[index] = 0;
    this.tiers[index] = 1;
    this.panRateMults[index] = 1;
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
  ): void {
    if (this.alive === 0) return;
    const amount = Balance.sluice.goldPerCycle;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      this.panRateMults[i] = Math.max(0.001, panRateMult(i));
      const cycleSeconds = Balance.sluice.cycleSeconds / this.panRateMults[i];
      if (!enabled(i)) {
        this.syncWater(i, at, false);
        continue;
      }
      const position = this.positions[i];
      if (!position) continue;

      const contested = this.isContested(position, enemies);
      this.contested[i] = contested;
      if (!contested) this.timers[i] = (this.timers[i] ?? 0) + delta;

      if (!contested && (this.timers[i] ?? 0) >= cycleSeconds) {
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
    }
    this.waters.instanceMatrix.needsUpdate = true;
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.timers[i] = 0;
      this.tiers[i] = 1;
      this.panRateMults[i] = 1;
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
    this.troughMaterial.dispose();
    this.waterMaterial.dispose();
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
    this.syncObject.rotation.set(0, 0.08, 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.troughs.setMatrixAt(index, this.syncObject.matrix);
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
    this.syncObject.rotation.set(0, 0.08, 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.waters.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.troughs.setMatrixAt(index, hiddenMatrix);
    this.waters.setMatrixAt(index, hiddenMatrix);
  }

  private syncColors(index: number): void {
    const tierIndex = Math.max(0, Math.min(2, (this.tiers[index] ?? 1) - 1));
    this.troughs.setColorAt(index, troughTierColors[tierIndex] ?? troughTierColors[0]);
    this.waters.setColorAt(index, waterTierColors[tierIndex] ?? waterTierColors[0]);
    if (this.troughs.instanceColor) this.troughs.instanceColor.needsUpdate = true;
    if (this.waters.instanceColor) this.waters.instanceColor.needsUpdate = true;
  }

  private markNeedsUpdate(): void {
    this.troughs.instanceMatrix.needsUpdate = true;
    this.waters.instanceMatrix.needsUpdate = true;
  }
}

function eventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `sluice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
