import * as THREE from 'three';

const PUFFS = 32;
const TICKS = 48;

export class CombatVfx {
  readonly group = new THREE.Group();

  private readonly puffActive: boolean[] = [];
  private readonly puffAge: number[] = [];
  private readonly puffPos: THREE.Vector3[] = [];
  private readonly tickActive: boolean[] = [];
  private readonly tickAge: number[] = [];
  private readonly tickPos: THREE.Vector3[] = [];
  private readonly puffGeometry = new THREE.CircleGeometry(0.42, 18);
  private readonly tickGeometry = new THREE.BoxGeometry(0.08, 0.34, 0.035);
  private readonly puffMaterial = new THREE.MeshBasicMaterial({
    color: '#c4883a',
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  private readonly tickMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8e8',
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  private readonly puffs = new THREE.InstancedMesh(this.puffGeometry, this.puffMaterial, PUFFS);
  private readonly ticks = new THREE.InstancedMesh(this.tickGeometry, this.tickMaterial, TICKS);
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

  constructor() {
    this.group.name = 'CombatVfx';
    this.puffs.frustumCulled = false;
    this.ticks.frustumCulled = false;
    this.group.add(this.puffs, this.ticks);
    for (let i = 0; i < PUFFS; i += 1) {
      this.puffActive.push(false);
      this.puffAge.push(0);
      this.puffPos.push(new THREE.Vector3());
      this.puffs.setMatrixAt(i, this.hiddenMatrix);
    }
    for (let i = 0; i < TICKS; i += 1) {
      this.tickActive.push(false);
      this.tickAge.push(0);
      this.tickPos.push(new THREE.Vector3());
      this.ticks.setMatrixAt(i, this.hiddenMatrix);
    }
    this.markNeedsUpdate();
  }

  hit(position: THREE.Vector3): void {
    this.spawnTick(position);
  }

  dustPuff(position: THREE.Vector3): void {
    for (let i = 0; i < PUFFS; i += 1) {
      if (this.puffActive[i]) continue;
      this.puffActive[i] = true;
      this.puffAge[i] = 0;
      this.puffPos[i]?.set(position.x, 0.08, position.z);
      this.syncPuff(i);
      this.puffs.instanceMatrix.needsUpdate = true;
      return;
    }
  }

  update(delta: number): void {
    for (let i = 0; i < PUFFS; i += 1) {
      if (!this.puffActive[i]) continue;
      this.puffAge[i] = (this.puffAge[i] ?? 0) + delta;
      if ((this.puffAge[i] ?? 0) >= 0.38) {
        this.puffActive[i] = false;
        this.puffs.setMatrixAt(i, this.hiddenMatrix);
      } else {
        this.syncPuff(i);
      }
    }
    for (let i = 0; i < TICKS; i += 1) {
      if (!this.tickActive[i]) continue;
      this.tickAge[i] = (this.tickAge[i] ?? 0) + delta;
      if ((this.tickAge[i] ?? 0) >= 0.42) {
        this.tickActive[i] = false;
        this.ticks.setMatrixAt(i, this.hiddenMatrix);
      } else {
        this.syncTick(i);
      }
    }
    this.markNeedsUpdate();
  }

  reset(): void {
    for (let i = 0; i < PUFFS; i += 1) {
      this.puffActive[i] = false;
      this.puffAge[i] = 0;
      this.puffs.setMatrixAt(i, this.hiddenMatrix);
    }
    for (let i = 0; i < TICKS; i += 1) {
      this.tickActive[i] = false;
      this.tickAge[i] = 0;
      this.ticks.setMatrixAt(i, this.hiddenMatrix);
    }
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.puffGeometry.dispose();
    this.tickGeometry.dispose();
    this.puffMaterial.dispose();
    this.tickMaterial.dispose();
  }

  private spawnTick(position: THREE.Vector3): void {
    for (let i = 0; i < TICKS; i += 1) {
      if (this.tickActive[i]) continue;
      this.tickActive[i] = true;
      this.tickAge[i] = 0;
      this.tickPos[i]?.set(position.x, 0.95, position.z);
      this.syncTick(i);
      this.ticks.instanceMatrix.needsUpdate = true;
      return;
    }
  }

  private syncPuff(index: number): void {
    const age = this.puffAge[index] ?? 0;
    const scale = 0.4 + age * 3.8;
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
    this.syncObject.scale.setScalar(1 - age * 1.3);
    this.syncObject.updateMatrix();
    this.ticks.setMatrixAt(index, this.syncObject.matrix);
  }

  private markNeedsUpdate(): void {
    this.puffs.instanceMatrix.needsUpdate = true;
    this.ticks.instanceMatrix.needsUpdate = true;
  }
}
