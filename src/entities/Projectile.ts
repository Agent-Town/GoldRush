import * as THREE from 'three';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';

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
  ): boolean {
    for (let i = 0; i < this.active.length; i += 1) {
      if (this.active[i]) continue;
      const position = this.positions[i];
      const velocity = this.velocities[i];
      if (!position || !velocity) return false;

      this.active[i] = true;
      this.alive += 1;
      position.set(origin.x, 0.72, origin.z);
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

  deactivate(index: number): void {
    if (!this.active[index]) return;
    this.active[index] = false;
    this.life[index] = 0;
    this.damage[index] = 0;
    this.ownerIds[index] = 'hero';
    this.shooterIds[index] = -1;
    this.targetIds[index] = -1;
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
      this.hide(i);
    }
    this.alive = 0;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.boltGeometry.dispose();
    this.tracerGeometry.dispose();
    this.boltMaterial.dispose();
    this.tracerMaterial.dispose();
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
