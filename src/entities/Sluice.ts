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
  contested: boolean;
  capped: boolean;
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const timber = '#b9824c';
const water = '#5b8a8a';

export class SluicePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly timers: number[] = [];
  private readonly contested: boolean[] = [];
  private readonly capped: boolean[] = [];
  private readonly troughGeometry = new THREE.BoxGeometry(1.7, 0.32, 0.62);
  private readonly waterGeometry = new THREE.BoxGeometry(1.34, 0.035, 0.34);
  private readonly troughMaterial = new THREE.MeshStandardMaterial({ color: timber, roughness: 0.86, metalness: 0.02 });
  private readonly waterMaterial = new THREE.MeshStandardMaterial({
    color: water,
    emissive: water,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.72,
    roughness: 0.26,
    metalness: 0.04,
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
      this.contested.push(false);
      this.capped.push(false);
      this.hide(i);
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

  place(position: THREE.Vector3): number {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.group.visible = true;
      this.positions[i]?.copy(position);
      this.timers[i] = 0;
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

  update(
    delta: number,
    at: number,
    enemies: readonly ClaimJumperEnemy[],
    economy: Economy,
    onGold: (position: THREE.Vector3, amount: number) => void,
    onBlocked: (position: THREE.Vector3) => void,
    enabled: (index: number) => boolean = () => true,
  ): void {
    if (this.alive === 0) return;
    const amount = Balance.sluice.goldPerCycle;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      if (!enabled(i)) {
        this.syncWater(i, at, false);
        continue;
      }
      const position = this.positions[i];
      if (!position) continue;

      const contested = this.isContested(position, enemies);
      this.contested[i] = contested;
      if (!contested) this.timers[i] = (this.timers[i] ?? 0) + delta;

      if (!contested && (this.timers[i] ?? 0) >= Balance.sluice.cycleSeconds) {
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
            this.timers[i] = (this.timers[i] ?? 0) - Balance.sluice.cycleSeconds;
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
    return this.positions.map((position, index) => ({
      id: `sluice-${index + 1}`,
      active: this.active[index] === true,
      position: { x: position.x, z: position.z },
      progress: Math.min(1, (this.timers[index] ?? 0) / Balance.sluice.cycleSeconds),
      contested: this.contested[index] === true,
      capped: this.capped[index] === true,
    }));
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

  private markNeedsUpdate(): void {
    this.troughs.instanceMatrix.needsUpdate = true;
    this.waters.instanceMatrix.needsUpdate = true;
  }
}

function eventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `sluice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
