import * as THREE from 'three';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

const BOLT_VISUAL_Y = 0.72;
const ORIGIN_HEIGHT_CACHE_LIMIT = 256;

export type ProjectileVisualSample = {
  ownerId: string;
  targetId: number;
  x: number;
  y: number;
  z: number;
  startY: number;
  endY: number;
  progress: number;
};

export class ProjectilePool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly velocities: THREE.Vector3[] = [];
  private readonly life: number[] = [];
  private readonly damage: number[] = [];
  private readonly ownerIds: string[] = [];
  private readonly shooterIds: number[] = [];
  private readonly targetIds: number[] = [];
  private readonly visualStartY: number[] = [];
  private readonly visualEndY: number[] = [];
  private readonly visualDistance: number[] = [];
  private readonly visualTravel: number[] = [];
  private readonly originHeightCache = new Map<string, number>();
  private readonly boltGeometry = new THREE.SphereGeometry(0.12, 10, 6);
  private readonly tracerGeometry = new THREE.BoxGeometry(0.055, 0.055, 0.62);
  private readonly boltMaterial = new THREE.MeshStandardMaterial({
    color: '#7bd7d0',
    emissive: '#5b8a8a',
    emissiveIntensity: 1.8,
    roughness: 0.28,
    metalness: 0.08,
  });
  private readonly tracerMaterial = new THREE.MeshBasicMaterial({
    color: '#9ce4dd',
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
  });
  private readonly boltMesh = new THREE.InstancedMesh(
    this.boltGeometry,
    this.boltMaterial,
    Balance.projectile.pool,
  );
  private readonly tracerMesh = new THREE.InstancedMesh(
    this.tracerGeometry,
    this.tracerMaterial,
    Balance.projectile.pool,
  );
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private alive = 0;

  constructor() {
    this.group.name = 'SparkRigBoltPool';
    this.boltMesh.count = Balance.projectile.pool;
    this.tracerMesh.count = Balance.projectile.pool;
    this.boltMesh.frustumCulled = false;
    this.tracerMesh.frustumCulled = false;
    this.boltMesh.renderOrder = RenderLayers.impactVfx;
    this.tracerMesh.renderOrder = RenderLayers.impactVfx;
    tagPlaceholder(this.boltMesh, assetSlots.vfxBolt);
    tagPlaceholder(this.tracerMesh, assetSlots.vfxBolt);
    this.group.add(this.tracerMesh, this.boltMesh);

    for (let i = 0; i < Balance.projectile.pool; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.velocities.push(new THREE.Vector3());
      this.life.push(0);
      this.damage.push(0);
      this.ownerIds.push('hero');
      this.shooterIds.push(-1);
      this.targetIds.push(-1);
      this.visualStartY.push(BOLT_VISUAL_Y);
      this.visualEndY.push(BOLT_VISUAL_Y);
      this.visualDistance.push(1);
      this.visualTravel.push(0);
      this.hide(i);
    }
    this.markNeedsUpdate();
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return Balance.projectile.pool;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  positionAt(index: number): THREE.Vector3 {
    return this.positions[index] ?? this.positions[0];
  }

  damageAt(index: number): number {
    return this.damage[index] ?? 0;
  }

  ownerIdAt(index: number): string | null {
    return this.ownerIds[index] ?? null;
  }

  shooterIdAt(index: number): number {
    return this.shooterIds[index] ?? -1;
  }

  targetIdAt(index: number): number {
    return this.targetIds[index] ?? -1;
  }

  activate(
    origin: THREE.Vector3,
    dirX: number,
    dirZ: number,
    speed: number,
    damage: number,
    ownerId = 'hero',
    shooterId = -1,
    targetId = -1,
    targetPoint?: THREE.Vector3,
    visualOriginPadRadius = 0,
  ): boolean {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      const position = this.positions[i];
      const velocity = this.velocities[i];
      if (!position || !velocity) return false;

      this.active[i] = true;
      this.alive += 1;
      const targetX = targetPoint?.x ?? origin.x;
      const targetZ = targetPoint?.z ?? origin.z;
      this.visualStartY[i] = this.originVisualY(origin.x, origin.z, visualOriginPadRadius);
      this.visualEndY[i] = Terrain.visualY(targetX, targetZ, BOLT_VISUAL_Y);
      this.visualDistance[i] = Math.max(0.001, Math.hypot(targetX - origin.x, targetZ - origin.z));
      this.visualTravel[i] = 0;
      position.set(origin.x, this.visualStartY[i] ?? BOLT_VISUAL_Y, origin.z);
      velocity.set(dirX * speed, 0, dirZ * speed);
      this.life[i] = Balance.sparkRig.boltLife;
      this.damage[i] = damage;
      this.ownerIds[i] = ownerId;
      this.shooterIds[i] = shooterId;
      this.targetIds[i] = targetId;
      this.sync(i);
      return true;
    }
    return false;
  }

  update(delta: number, onExpired?: (shooterId: number, targetId: number) => void): void {
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const position = this.positions[i];
      const velocity = this.velocities[i];
      if (!position || !velocity) continue;
      position.addScaledVector(velocity, delta);
      this.visualTravel[i] = (this.visualTravel[i] ?? 0) + Math.hypot(velocity.x, velocity.z) * delta;
      this.syncVisualY(i);
      this.life[i] = (this.life[i] ?? 0) - delta;
      if ((this.life[i] ?? 0) <= 0) {
        onExpired?.(this.shooterIdAt(i), this.targetIdAt(i));
        this.deactivate(i);
      } else {
        this.sync(i);
      }
    }
    this.markNeedsUpdate();
  }

  visualDiagnostics(limit = 8): ProjectileVisualSample[] {
    const samples: ProjectileVisualSample[] = [];
    for (let i = 0; i < this.active.length && samples.length < limit; i += 1) {
      if (!this.active[i]) continue;
      const position = this.positions[i];
      if (!position) continue;
      samples.push({
        ownerId: this.ownerIds[i] ?? 'hero',
        targetId: this.targetIds[i] ?? -1,
        x: round3(position.x),
        y: round3(position.y),
        z: round3(position.z),
        startY: round3(this.visualStartY[i] ?? BOLT_VISUAL_Y),
        endY: round3(this.visualEndY[i] ?? BOLT_VISUAL_Y),
        progress: round3(this.visualProgress(i)),
      });
    }
    return samples;
  }

  deactivate(index: number): void {
    if (!this.active[index]) return;
    this.active[index] = false;
    this.life[index] = 0;
    this.damage[index] = 0;
    this.ownerIds[index] = 'hero';
    this.shooterIds[index] = -1;
    this.targetIds[index] = -1;
    this.visualStartY[index] = BOLT_VISUAL_Y;
    this.visualEndY[index] = BOLT_VISUAL_Y;
    this.visualDistance[index] = 1;
    this.visualTravel[index] = 0;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
  }

  recycleAll(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.life[i] = 0;
      this.damage[i] = 0;
      this.ownerIds[i] = 'hero';
      this.shooterIds[i] = -1;
      this.targetIds[i] = -1;
      this.visualStartY[i] = BOLT_VISUAL_Y;
      this.visualEndY[i] = BOLT_VISUAL_Y;
      this.visualDistance[i] = 1;
      this.visualTravel[i] = 0;
      this.hide(i);
    }
    this.alive = 0;
    this.originHeightCache.clear();
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.originHeightCache.clear();
    this.boltGeometry.dispose();
    this.tracerGeometry.dispose();
    this.boltMaterial.dispose();
    this.tracerMaterial.dispose();
  }

  private originVisualY(x: number, z: number, padRadius: number): number {
    if (padRadius <= 0.01) return Terrain.visualY(x, z, BOLT_VISUAL_Y);
    const key = `${round3(x)}:${round3(z)}:${round3(padRadius)}`;
    const cached = this.originHeightCache.get(key);
    if (cached !== undefined) return cached;
    const y = Terrain.visualY(x, z, BOLT_VISUAL_Y, padRadius);
    const oldest = this.originHeightCache.keys().next().value;
    if (this.originHeightCache.size >= ORIGIN_HEIGHT_CACHE_LIMIT && oldest !== undefined) this.originHeightCache.delete(oldest);
    this.originHeightCache.set(key, y);
    return y;
  }

  private syncVisualY(index: number): void {
    const position = this.positions[index];
    if (!position) return;
    position.y = THREE.MathUtils.lerp(
      this.visualStartY[index] ?? BOLT_VISUAL_Y,
      this.visualEndY[index] ?? BOLT_VISUAL_Y,
      this.visualProgress(index),
    );
  }

  private visualProgress(index: number): number {
    return Math.min(1, Math.max(0, (this.visualTravel[index] ?? 0) / Math.max(0.001, this.visualDistance[index] ?? 1)));
  }

  private sync(index: number): void {
    const position = this.positions[index];
    const velocity = this.velocities[index];
    if (!position || !velocity) return;

    this.syncObject.position.copy(position);
    this.syncObject.rotation.set(0, Math.atan2(velocity.x, velocity.z), 0);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.boltMesh.setMatrixAt(index, this.syncObject.matrix);

    this.syncObject.position.set(position.x - velocity.x * 0.012, position.y, position.z - velocity.z * 0.012);
    this.syncObject.updateMatrix();
    this.tracerMesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.boltMesh.setMatrixAt(index, this.hiddenMatrix);
    this.tracerMesh.setMatrixAt(index, this.hiddenMatrix);
  }

  private markNeedsUpdate(): void {
    this.boltMesh.instanceMatrix.needsUpdate = true;
    this.tracerMesh.instanceMatrix.needsUpdate = true;
  }
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
