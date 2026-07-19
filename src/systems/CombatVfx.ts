import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

type CombatVfxDiagnostics = {
  puffs: { active: number; capacity: number };
  ticks: { active: number; capacity: number };
  rings: { active: number; capacity: number };
};

export class CombatVfx {
  readonly group = new THREE.Group();

  private readonly puffCapacity = poolSize('combatVfxPuffs', 32);
  private readonly tickCapacity = poolSize('combatVfxTicks', 48);
  private readonly ringCapacity = poolSize('combatVfxRings', 8);
  private readonly puffActive: boolean[] = [];
  private readonly puffAge: number[] = [];
  private readonly puffPos: THREE.Vector3[] = [];
  private readonly puffScale: number[] = [];
  private readonly tickActive: boolean[] = [];
  private readonly tickAge: number[] = [];
  private readonly tickPos: THREE.Vector3[] = [];
  private readonly tickScale: number[] = [];
  private readonly ringActive: boolean[] = [];
  private readonly ringAge: number[] = [];
  private readonly ringPos: THREE.Vector3[] = [];
  private readonly ringRadius: number[] = [];
  private readonly puffGeometry = new THREE.CircleGeometry(0.42, 18);
  private readonly tickGeometry = new THREE.BoxGeometry(0.08, 0.34, 0.035);
  private readonly ringGeometry = new THREE.RingGeometry(0.82, 1, 28);
  private readonly puffMaterial = new THREE.MeshBasicMaterial({
    color: '#c4883a',
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  private readonly tickMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8e8',
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  private readonly ringMaterial = new THREE.MeshBasicMaterial({
    color: '#83ded7',
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  private readonly puffs = new THREE.InstancedMesh(this.puffGeometry, this.puffMaterial, this.puffCapacity);
  private readonly ticks = new THREE.InstancedMesh(this.tickGeometry, this.tickMaterial, this.tickCapacity);
  private readonly rings = new THREE.InstancedMesh(this.ringGeometry, this.ringMaterial, this.ringCapacity);
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private ringAlive = 0;

  constructor() {
    this.group.name = 'CombatVfx';
    this.puffs.frustumCulled = false;
    this.ticks.frustumCulled = false;
    this.rings.frustumCulled = false;
    this.puffs.renderOrder = RenderLayers.impactVfx;
    this.ticks.renderOrder = RenderLayers.impactVfx;
    this.rings.renderOrder = RenderLayers.impactVfx;
    this.rings.visible = false;
    this.group.add(this.puffs, this.ticks, this.rings);
    for (let i = 0; i < this.puffCapacity; i += 1) {
      this.puffActive.push(false);
      this.puffAge.push(0);
      this.puffPos.push(new THREE.Vector3());
      this.puffScale.push(1);
      this.puffs.setMatrixAt(i, this.hiddenMatrix);
    }
    for (let i = 0; i < this.tickCapacity; i += 1) {
      this.tickActive.push(false);
      this.tickAge.push(0);
      this.tickPos.push(new THREE.Vector3());
      this.tickScale.push(1);
      this.ticks.setMatrixAt(i, this.hiddenMatrix);
    }
    for (let i = 0; i < this.ringCapacity; i += 1) {
      this.ringActive.push(false);
      this.ringAge.push(0);
      this.ringPos.push(new THREE.Vector3());
      this.ringRadius.push(1);
      this.rings.setMatrixAt(i, this.hiddenMatrix);
    }
    this.markNeedsUpdate();
  }

  hit(position: THREE.Vector3, scale = 1): void {
    this.spawnTick(position, scale);
  }

  dustPuff(position: THREE.Vector3, scale = 1): void {
    for (let i = 0; i < this.puffCapacity; i += 1) {
      if (this.puffActive[i]) continue;
      this.puffActive[i] = true;
      this.puffAge[i] = 0;
      this.puffScale[i] = Math.max(1, scale);
      this.puffPos[i]?.set(position.x, Terrain.visualAnchorY(position, 0.08), position.z);
      this.syncPuff(i);
      this.puffs.instanceMatrix.needsUpdate = true;
      return;
    }
  }

  detonationRing(position: THREE.Vector3, radius: number): void {
    for (let i = 0; i < this.ringCapacity; i += 1) {
      if (this.ringActive[i]) continue;
      this.ringActive[i] = true;
      this.ringAge[i] = 0;
      this.ringRadius[i] = radius;
      this.ringPos[i]?.set(position.x, Terrain.visualAnchorY(position, 0.1), position.z);
      this.ringAlive += 1;
      this.rings.visible = true;
      this.syncRing(i);
      this.rings.instanceMatrix.needsUpdate = true;
      return;
    }
  }

  update(delta: number): void {
    for (let i = 0; i < this.puffCapacity; i += 1) {
      if (!this.puffActive[i]) continue;
      this.puffAge[i] = (this.puffAge[i] ?? 0) + delta;
      if ((this.puffAge[i] ?? 0) >= 0.38) {
        this.puffActive[i] = false;
        this.puffs.setMatrixAt(i, this.hiddenMatrix);
      } else {
        this.syncPuff(i);
      }
    }
    for (let i = 0; i < this.tickCapacity; i += 1) {
      if (!this.tickActive[i]) continue;
      this.tickAge[i] = (this.tickAge[i] ?? 0) + delta;
      if ((this.tickAge[i] ?? 0) >= 0.42) {
        this.tickActive[i] = false;
        this.ticks.setMatrixAt(i, this.hiddenMatrix);
      } else {
        this.syncTick(i);
      }
    }
    for (let i = 0; i < this.ringCapacity; i += 1) {
      if (!this.ringActive[i]) continue;
      this.ringAge[i] = (this.ringAge[i] ?? 0) + delta;
      if ((this.ringAge[i] ?? 0) >= 0.48) {
        this.ringActive[i] = false;
        this.ringAge[i] = 0;
        this.ringAlive = Math.max(0, this.ringAlive - 1);
        this.rings.setMatrixAt(i, this.hiddenMatrix);
      } else {
        this.syncRing(i);
      }
    }
    this.rings.visible = this.ringAlive > 0;
    this.markNeedsUpdate();
  }

  reset(): void {
    for (let i = 0; i < this.puffCapacity; i += 1) {
      this.puffActive[i] = false;
      this.puffAge[i] = 0;
      this.puffScale[i] = 1;
      this.puffs.setMatrixAt(i, this.hiddenMatrix);
    }
    for (let i = 0; i < this.tickCapacity; i += 1) {
      this.tickActive[i] = false;
      this.tickAge[i] = 0;
      this.tickScale[i] = 1;
      this.ticks.setMatrixAt(i, this.hiddenMatrix);
    }
    for (let i = 0; i < this.ringCapacity; i += 1) {
      this.ringActive[i] = false;
      this.ringAge[i] = 0;
      this.ringRadius[i] = 1;
      this.rings.setMatrixAt(i, this.hiddenMatrix);
    }
    this.ringAlive = 0;
    this.rings.visible = false;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.puffGeometry.dispose();
    this.tickGeometry.dispose();
    this.ringGeometry.dispose();
    this.puffMaterial.dispose();
    this.tickMaterial.dispose();
    this.ringMaterial.dispose();
  }

  diagnostics(): CombatVfxDiagnostics {
    return {
      puffs: { active: this.puffActive.filter(Boolean).length, capacity: this.puffCapacity },
      ticks: { active: this.tickActive.filter(Boolean).length, capacity: this.tickCapacity },
      rings: { active: this.ringAlive, capacity: this.ringCapacity },
    };
  }

  private spawnTick(position: THREE.Vector3, scale = 1): void {
    for (let i = 0; i < this.tickCapacity; i += 1) {
      if (this.tickActive[i]) continue;
      this.tickActive[i] = true;
      this.tickAge[i] = 0;
      this.tickScale[i] = Math.max(1, scale);
      this.tickPos[i]?.set(position.x, Terrain.visualAnchorY(position, 0.95), position.z);
      this.syncTick(i);
      this.ticks.instanceMatrix.needsUpdate = true;
      return;
    }
  }

  private syncPuff(index: number): void {
    const age = this.puffAge[index] ?? 0;
    const scale = (0.4 + age * 3.8) * (this.puffScale[index] ?? 1);
    const pos = this.puffPos[index];
    if (!pos) return;
    this.syncObject.position.copy(pos);
    this.syncObject.rotation.set(-Math.PI / 2, 0, age * 7);
    this.syncObject.scale.setScalar(scale);
    this.syncObject.updateMatrix();
    this.puffs.setMatrixAt(index, this.syncObject.matrix);
  }

  private syncTick(index: number): void {
    const age = this.tickAge[index] ?? 0;
    const pos = this.tickPos[index];
    if (!pos) return;
    this.syncObject.position.set(pos.x, pos.y + age * 1.25, pos.z);
    this.syncObject.rotation.set(0.2, age * 4, -0.35);
    this.syncObject.scale.setScalar(Math.max(0.05, 1 - age * 1.3) * (this.tickScale[index] ?? 1));
    this.syncObject.updateMatrix();
    this.ticks.setMatrixAt(index, this.syncObject.matrix);
  }

  private syncRing(index: number): void {
    const age = this.ringAge[index] ?? 0;
    const pos = this.ringPos[index];
    if (!pos) return;
    this.syncObject.position.copy(pos);
    this.syncObject.rotation.set(-Math.PI / 2, 0, age * 2.5);
    this.syncObject.scale.setScalar((this.ringRadius[index] ?? 1) * (0.35 + age * 2.4));
    this.syncObject.updateMatrix();
    this.rings.setMatrixAt(index, this.syncObject.matrix);
  }

  private markNeedsUpdate(): void {
    this.puffs.instanceMatrix.needsUpdate = true;
    this.ticks.instanceMatrix.needsUpdate = true;
    this.rings.instanceMatrix.needsUpdate = true;
  }
}

function poolSize(key: 'combatVfxPuffs' | 'combatVfxTicks' | 'combatVfxRings', fallback: number): number {
  const value = Number((Balance.render as Record<typeof key, number>)[key] ?? fallback);
  return Math.max(1, Math.floor(Number.isFinite(value) ? value : fallback));
}
