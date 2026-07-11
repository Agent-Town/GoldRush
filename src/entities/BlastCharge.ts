import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

/** Returns true when the detonation ends the run and later charges must not resolve this tick. */
export type BlastDetonation = (position: THREE.Vector3, damage: number, radius: number, ownerId: string) => boolean;

export type BlastChargeSuspendSnapshot = {
  slot: number;
  origin: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  age: number;
  duration: number;
  damage: number;
  radius: number;
  ownerId: string;
  apexY: number;
};

const ARC_SEGMENTS = 10;
const MARKER_SEGMENTS = 24;
const LINES_PER_SLOT = ARC_SEGMENTS + MARKER_SEGMENTS;
const FLOATS_PER_SEGMENT = 6;
const LAUNCH_Y = 0.78;
const IMPACT_Y = 0.08;
const MARKER_Y = 0.07;

export class BlastChargePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly previousActive: boolean[] = [];
  private readonly origins: THREE.Vector3[] = [];
  private readonly targets: THREE.Vector3[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly apexY: number[] = [];
  private readonly age: number[] = [];
  private readonly previousAge: number[] = [];
  private readonly duration: number[] = [];
  private readonly damage: number[] = [];
  private readonly radius: number[] = [];
  private readonly ownerIds: string[] = [];
  private readonly chargeGeometry = new THREE.DodecahedronGeometry(0.2, 0);
  private readonly chargeMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#83ded7',
    emissiveIntensity: 0.72,
    roughness: 0.42,
    metalness: 0.18,
  });
  private readonly chargeMesh = new THREE.InstancedMesh(this.chargeGeometry, this.chargeMaterial, Balance.blast.pool);
  private readonly linePositions = new Float32Array(Balance.blast.pool * LINES_PER_SLOT * FLOATS_PER_SEGMENT);
  private readonly lineGeometry = new THREE.BufferGeometry();
  private readonly lineMaterial = new THREE.LineBasicMaterial({
    color: '#83ded7',
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    depthTest: false,
  });
  private readonly lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private alive = 0;

  constructor() {
    this.group.name = 'BlastChargePool';
    this.chargeMesh.frustumCulled = false;
    this.lines.frustumCulled = false;
    this.chargeMesh.renderOrder = RenderLayers.impactVfx;
    this.lines.renderOrder = RenderLayers.impactVfx;
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.group.add(this.lines, this.chargeMesh);
    for (let i = 0; i < Balance.blast.pool; i += 1) {
      this.active.push(false);
      this.previousActive.push(false);
      this.origins.push(new THREE.Vector3());
      this.targets.push(new THREE.Vector3());
      this.positions.push(new THREE.Vector3());
      this.apexY.push(0);
      this.age.push(0);
      this.previousAge.push(0);
      this.duration.push(0);
      this.damage.push(0);
      this.radius.push(0);
      this.ownerIds.push('hero_blast');
      this.hide(i);
    }
    this.setVisible(false);
    this.markNeedsUpdate();
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return Balance.blast.pool;
  }

  activate(origin: THREE.Vector3, target: THREE.Vector3, airTime: number, damage: number, radius: number, ownerId: string): boolean {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      this.active[i] = true;
      this.previousActive[i] = false;
      this.alive += 1;
      this.origins[i]?.set(origin.x, Terrain.visualY(origin.x, origin.z, LAUNCH_Y), origin.z);
      this.targets[i]?.set(target.x, Terrain.visualY(target.x, target.z, IMPACT_Y), target.z);
      this.apexY[i] = Terrain.visualY((origin.x + target.x) * 0.5, (origin.z + target.z) * 0.5, (LAUNCH_Y + IMPACT_Y) * 0.5);
      this.positions[i]?.copy(this.origins[i] ?? origin);
      this.age[i] = 0;
      this.duration[i] = Math.max(0.1, airTime);
      this.damage[i] = damage;
      this.radius[i] = radius;
      this.ownerIds[i] = ownerId;
      this.sync(i);
      this.setVisible(true);
      this.markNeedsUpdate();
      return true;
    }
    return false;
  }

  update(delta: number, onDetonate: BlastDetonation): boolean {
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      this.age[i] = (this.age[i] ?? 0) + delta;
      if ((this.age[i] ?? 0) >= (this.duration[i] ?? 0)) {
        const target = this.targets[i];
        const stop = target
          ? onDetonate(target, this.damage[i] ?? 0, this.radius[i] ?? 0, this.ownerIds[i] ?? 'hero_blast')
          : false;
        this.deactivate(i);
        if (stop) {
          this.markNeedsUpdate();
          return true;
        }
      }
    }
    this.markNeedsUpdate();
    return false;
  }

  captureRenderState(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.previousActive[i] = this.active[i] === true;
      this.previousAge[i] = this.age[i] ?? 0;
    }
  }

  applyRenderInterpolation(alpha: number): void {
    const amount = THREE.MathUtils.clamp(alpha, 0, 1);
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const currentAge = this.age[i] ?? 0;
      if (this.previousActive[i]) this.age[i] = THREE.MathUtils.lerp(this.previousAge[i] ?? currentAge, currentAge, amount);
      this.sync(i);
      this.age[i] = currentAge;
    }
    this.markNeedsUpdate();
  }

  captureSuspend(): BlastChargeSuspendSnapshot[] {
    const snapshots: BlastChargeSuspendSnapshot[] = [];
    for (let slot = 0; slot < this.active.length; slot += 1) {
      if (!this.active[slot]) continue;
      const origin = this.origins[slot];
      const target = this.targets[slot];
      if (!origin || !target) continue;
      snapshots.push({
        slot,
        origin: { x: origin.x, y: origin.y, z: origin.z },
        target: { x: target.x, y: target.y, z: target.z },
        age: this.age[slot] ?? 0,
        duration: this.duration[slot] ?? 0,
        damage: this.damage[slot] ?? 0,
        radius: this.radius[slot] ?? 0,
        ownerId: this.ownerIds[slot] ?? 'hero_blast',
        apexY: this.apexY[slot] ?? 0,
      });
    }
    return snapshots;
  }

  restoreSuspend(snapshots: readonly BlastChargeSuspendSnapshot[]): boolean {
    const slots = new Set<number>();
    for (const snapshot of snapshots) {
      if (!Number.isInteger(snapshot.slot) || snapshot.slot < 0 || snapshot.slot >= this.active.length || slots.has(snapshot.slot)) return false;
      slots.add(snapshot.slot);
    }

    this.recycleAll();
    for (const snapshot of snapshots) {
      const slot = snapshot.slot;
      const origin = this.origins[slot];
      const target = this.targets[slot];
      if (!origin || !target) return false;
      this.active[slot] = true;
      this.previousActive[slot] = false;
      origin.set(snapshot.origin.x, snapshot.origin.y, snapshot.origin.z);
      target.set(snapshot.target.x, snapshot.target.y, snapshot.target.z);
      this.age[slot] = snapshot.age;
      this.previousAge[slot] = snapshot.age;
      this.duration[slot] = snapshot.duration;
      this.damage[slot] = snapshot.damage;
      this.radius[slot] = snapshot.radius;
      this.ownerIds[slot] = snapshot.ownerId;
      this.apexY[slot] = snapshot.apexY;
      this.alive += 1;
      this.sync(slot);
    }
    this.setVisible(this.alive > 0);
    this.markNeedsUpdate();
    return true;
  }

  recycleAll(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.previousActive[i] = false;
      this.age[i] = 0;
      this.duration[i] = 0;
      this.damage[i] = 0;
      this.radius[i] = 0;
      this.apexY[i] = 0;
      this.ownerIds[i] = 'hero_blast';
      this.hide(i);
    }
    this.alive = 0;
    this.setVisible(false);
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.chargeGeometry.dispose();
    this.chargeMaterial.dispose();
    this.lineGeometry.dispose();
    this.lineMaterial.dispose();
  }

  private deactivate(index: number): void {
    if (!this.active[index]) return;
    this.active[index] = false;
    this.age[index] = 0;
    this.duration[index] = 0;
    this.damage[index] = 0;
    this.radius[index] = 0;
    this.apexY[index] = 0;
    this.ownerIds[index] = 'hero_blast';
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    if (this.alive === 0) this.setVisible(false);
  }

  private sync(index: number): void {
    const origin = this.origins[index];
    const target = this.targets[index];
    const position = this.positions[index];
    if (!origin || !target || !position) return;

    const t = Math.min(1, (this.age[index] ?? 0) / Math.max(0.1, this.duration[index] ?? 0.1));
    const radius = this.radius[index] ?? Balance.blast.radius;
    this.pointOnArc(origin, target, t, radius, this.apexY[index] ?? 0, position);
    this.syncObject.position.copy(position);
    this.syncObject.rotation.set(t * Math.PI * 2, t * Math.PI * 4, 0.25);
    this.syncObject.scale.setScalar(1);
    this.syncObject.updateMatrix();
    this.chargeMesh.setMatrixAt(index, this.syncObject.matrix);
    this.syncTelegraph(index, origin, target, radius);
  }

  private syncTelegraph(index: number, origin: THREE.Vector3, target: THREE.Vector3, radius: number): void {
    let offset = index * LINES_PER_SLOT * FLOATS_PER_SEGMENT;
    for (let i = 0; i < ARC_SEGMENTS; i += 1) {
      const a = i / ARC_SEGMENTS;
      const b = (i + 1) / ARC_SEGMENTS;
      offset = this.writeArcSegment(offset, origin, target, a, b, radius, this.apexY[index] ?? 0);
    }

    for (let i = 0; i < MARKER_SEGMENTS; i += 1) {
      const a = i * ((Math.PI * 2) / MARKER_SEGMENTS);
      const b = (i + 1) * ((Math.PI * 2) / MARKER_SEGMENTS);
      const ax = target.x + Math.cos(a) * radius;
      const az = target.z + Math.sin(a) * radius;
      const bx = target.x + Math.cos(b) * radius;
      const bz = target.z + Math.sin(b) * radius;
      this.linePositions[offset++] = ax;
      this.linePositions[offset++] = Terrain.visualY(ax, az, MARKER_Y);
      this.linePositions[offset++] = az;
      this.linePositions[offset++] = bx;
      this.linePositions[offset++] = Terrain.visualY(bx, bz, MARKER_Y);
      this.linePositions[offset++] = bz;
    }
  }

  private writeArcSegment(offset: number, origin: THREE.Vector3, target: THREE.Vector3, a: number, b: number, radius: number, apexY: number): number {
    const height = Math.max(1.2, radius * 0.75);
    this.writeArcPoint(offset, origin, target, a, height, apexY);
    this.writeArcPoint(offset + 3, origin, target, b, height, apexY);
    return offset + FLOATS_PER_SEGMENT;
  }

  private writeArcPoint(offset: number, origin: THREE.Vector3, target: THREE.Vector3, t: number, height: number, apexY: number): void {
    this.linePositions[offset] = origin.x + (target.x - origin.x) * t;
    this.linePositions[offset + 1] = this.arcBaseY(origin.y, target.y, apexY, t) + Math.sin(t * Math.PI) * height;
    this.linePositions[offset + 2] = origin.z + (target.z - origin.z) * t;
  }

  private pointOnArc(origin: THREE.Vector3, target: THREE.Vector3, t: number, radius: number, apexY: number, out: THREE.Vector3): void {
    const height = Math.max(1.2, radius * 0.75);
    out.set(
      origin.x + (target.x - origin.x) * t,
      this.arcBaseY(origin.y, target.y, apexY, t) + Math.sin(t * Math.PI) * height,
      origin.z + (target.z - origin.z) * t,
    );
  }

  private arcBaseY(originY: number, targetY: number, apexY: number, t: number): number {
    return t < 0.5
      ? THREE.MathUtils.lerp(originY, apexY, t * 2)
      : THREE.MathUtils.lerp(apexY, targetY, (t - 0.5) * 2);
  }

  private hide(index: number): void {
    this.chargeMesh.setMatrixAt(index, this.hiddenMatrix);
    const start = index * LINES_PER_SLOT * FLOATS_PER_SEGMENT;
    const end = start + LINES_PER_SLOT * FLOATS_PER_SEGMENT;
    this.linePositions.fill(0, start, end);
  }

  private markNeedsUpdate(): void {
    this.chargeMesh.instanceMatrix.needsUpdate = true;
    const attribute = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (attribute) attribute.needsUpdate = true;
  }

  private setVisible(visible: boolean): void {
    this.chargeMesh.visible = visible;
    this.lines.visible = visible;
  }
}
