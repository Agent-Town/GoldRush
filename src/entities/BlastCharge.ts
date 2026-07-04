import * as THREE from 'three';
import { Balance } from '../game/Balance';

export type BlastDetonation = (position: THREE.Vector3, damage: number, radius: number, ownerId: string) => void;

const ARC_SEGMENTS = 10;
const MARKER_SEGMENTS = 24;
const LINES_PER_SLOT = ARC_SEGMENTS + MARKER_SEGMENTS;
const FLOATS_PER_SEGMENT = 6;

export class BlastChargePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly origins: THREE.Vector3[] = [];
  private readonly targets: THREE.Vector3[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly age: number[] = [];
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
  });
  private readonly lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private alive = 0;

  constructor() {
    this.group.name = 'BlastChargePool';
    this.chargeMesh.frustumCulled = false;
    this.lines.frustumCulled = false;
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.group.add(this.lines, this.chargeMesh);
    for (let i = 0; i < Balance.blast.pool; i += 1) {
      this.active.push(false);
      this.origins.push(new THREE.Vector3());
      this.targets.push(new THREE.Vector3());
      this.positions.push(new THREE.Vector3());
      this.age.push(0);
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
      this.alive += 1;
      this.origins[i]?.set(origin.x, 0.78, origin.z);
      this.targets[i]?.set(target.x, 0.08, target.z);
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

  update(delta: number, onDetonate: BlastDetonation): void {
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      this.age[i] = (this.age[i] ?? 0) + delta;
      if ((this.age[i] ?? 0) >= (this.duration[i] ?? 0)) {
        const target = this.targets[i];
        if (target) onDetonate(target, this.damage[i] ?? 0, this.radius[i] ?? 0, this.ownerIds[i] ?? 'hero_blast');
        this.deactivate(i);
      } else {
        this.sync(i);
      }
    }
    this.markNeedsUpdate();
  }

  recycleAll(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.age[i] = 0;
      this.duration[i] = 0;
      this.damage[i] = 0;
      this.radius[i] = 0;
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
    this.pointOnArc(origin, target, t, radius, position);
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
      offset = this.writeArcSegment(offset, origin, target, a, b, radius);
    }

    for (let i = 0; i < MARKER_SEGMENTS; i += 1) {
      const a = i * ((Math.PI * 2) / MARKER_SEGMENTS);
      const b = (i + 1) * ((Math.PI * 2) / MARKER_SEGMENTS);
      this.linePositions[offset++] = target.x + Math.cos(a) * radius;
      this.linePositions[offset++] = 0.07;
      this.linePositions[offset++] = target.z + Math.sin(a) * radius;
      this.linePositions[offset++] = target.x + Math.cos(b) * radius;
      this.linePositions[offset++] = 0.07;
      this.linePositions[offset++] = target.z + Math.sin(b) * radius;
    }
  }

  private writeArcSegment(offset: number, origin: THREE.Vector3, target: THREE.Vector3, a: number, b: number, radius: number): number {
    const height = Math.max(1.2, radius * 0.75);
    this.writeArcPoint(offset, origin, target, a, height);
    this.writeArcPoint(offset + 3, origin, target, b, height);
    return offset + FLOATS_PER_SEGMENT;
  }

  private writeArcPoint(offset: number, origin: THREE.Vector3, target: THREE.Vector3, t: number, height: number): void {
    this.linePositions[offset] = origin.x + (target.x - origin.x) * t;
    this.linePositions[offset + 1] = origin.y + (target.y - origin.y) * t + Math.sin(t * Math.PI) * height;
    this.linePositions[offset + 2] = origin.z + (target.z - origin.z) * t;
  }

  private pointOnArc(origin: THREE.Vector3, target: THREE.Vector3, t: number, radius: number, out: THREE.Vector3): void {
    const height = Math.max(1.2, radius * 0.75);
    out.set(
      origin.x + (target.x - origin.x) * t,
      origin.y + (target.y - origin.y) * t + Math.sin(t * Math.PI) * height,
      origin.z + (target.z - origin.z) * t,
    );
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
