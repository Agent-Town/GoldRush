import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { ClaimJumperEnemy } from './Enemy';
import * as Terrain from '../world/Terrain';

type FenceField = {
  activeUntil: number;
  position: THREE.Vector3;
  group: THREE.Group;
};

export type E9ArsenalPresentationDiagnostics = {
  stormDraw: { visible: boolean; smoke: false };
  stormLance: {
    active: number;
    tracking: number;
    silhouetteHeight: number;
    previousTurretSilhouetteHeight: number;
  };
  stormFence: { active: number; fields: Array<{ x: number; z: number }> };
  terraformCannon: { visible: boolean; ammunition: 'map' };
};

export class E9ArsenalPresentation {
  readonly group = new THREE.Group();

  private readonly beamPositions = new Float32Array(6);
  private readonly beamGeometry = new THREE.BufferGeometry();
  private readonly beamMaterial = new THREE.LineBasicMaterial({ color: '#b9fff3', transparent: true, opacity: 0.92 });
  private readonly beam = new THREE.Line(this.beamGeometry, this.beamMaterial);
  private readonly lanceGeometry = new THREE.OctahedronGeometry(Balance.e9Arsenal.stormLance.lensRadius, 1);
  private readonly lanceMaterial = new THREE.MeshStandardMaterial({
    color: '#dffbf6', emissive: '#5bced0', emissiveIntensity: 0.85, roughness: 0.2, metalness: 0.62,
  });
  private readonly lances = new THREE.InstancedMesh(this.lanceGeometry, this.lanceMaterial, Balance.turret.maxCount);
  private readonly fenceRingGeometry = new THREE.TorusGeometry(Balance.e9Arsenal.stormFence.radius, 0.045, 6, 32);
  private readonly fencePostGeometry = new THREE.CylinderGeometry(0.045, 0.065, Balance.e9Arsenal.stormFence.postHeight, 6);
  private readonly fenceMaterial = new THREE.MeshStandardMaterial({
    color: '#6ec8c6', emissive: '#4bb2b5', emissiveIntensity: 0.65, transparent: true, opacity: 0.72,
  });
  private readonly earthGeometry = new THREE.DodecahedronGeometry(Balance.e9Arsenal.terraformCannon.clodRadius, 0);
  private readonly earthMaterial = new THREE.MeshStandardMaterial({ color: '#a94f39', roughness: 0.94, flatShading: true });
  private readonly earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial);
  private readonly fields: FenceField[] = [];
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly earthOrigin = new THREE.Vector3();
  private readonly earthTarget = new THREE.Vector3();
  private beamUntil = 0;
  private earthStartedAt = Number.NEGATIVE_INFINITY;
  private lanceCount = 0;
  private lanceTracking = 0;

  constructor() {
    this.group.name = 'E9ArsenalPresentation';
    this.beam.name = 'StormDrawWeatherBeam';
    this.beamGeometry.setAttribute('position', new THREE.BufferAttribute(this.beamPositions, 3));
    this.beam.visible = false;
    this.lances.name = 'StormLanceWeatherLenses';
    this.lances.frustumCulled = false;
    for (let index = 0; index < Balance.turret.maxCount; index += 1) this.lances.setMatrixAt(index, this.hiddenMatrix);
    this.lances.instanceMatrix.needsUpdate = true;
    this.createFenceFields();
    this.earth.name = 'TerraformCannonEarthClod';
    this.earth.visible = false;
    this.group.add(this.beam, this.lances, this.earth);
  }

  flashStormDraw(origin: THREE.Vector3, target: THREE.Vector3, at: number): void {
    this.beamPositions.set([
      origin.x, Terrain.visualY(origin.x, origin.z, 0.8), origin.z,
      target.x, Terrain.visualY(target.x, target.z, 0.8), target.z,
    ]);
    (this.beamGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    this.beamUntil = at + Balance.e9Arsenal.stormDraw.visualSeconds;
    this.beam.visible = true;
  }

  launchEarth(origin: THREE.Vector3, target: THREE.Vector3, at: number): void {
    this.earthOrigin.copy(origin);
    this.earthTarget.copy(target);
    this.earthStartedAt = at;
    this.earth.visible = true;
  }

  deployFence(position: THREE.Vector3, at: number): boolean {
    const config = Balance.e9Arsenal.stormFence;
    if (this.fields.some((field) => field.activeUntil > at && field.position.distanceToSquared(position) < config.overlapRadius ** 2)) return false;
    const field = this.fields.find((candidate) => candidate.activeUntil <= at);
    if (!field) return false;
    field.activeUntil = at + config.durationSeconds;
    field.position.set(position.x, Terrain.visualY(position.x, position.z), position.z);
    field.group.position.copy(field.position);
    field.group.visible = true;
    return true;
  }

  fenceAt(position: THREE.Vector3, at: number): THREE.Vector3 | null {
    const radiusSq = Balance.e9Arsenal.stormFence.radius ** 2;
    for (const field of this.fields) {
      if (field.activeUntil <= at) continue;
      const dx = position.x - field.position.x;
      const dz = position.z - field.position.z;
      if (dx * dx + dz * dz <= radiusSq) return field.position;
    }
    return null;
  }

  update(
    enabled: boolean,
    lanceEnabled: boolean,
    at: number,
    turretPosition: (index: number) => THREE.Vector3 | null,
    enemies: readonly ClaimJumperEnemy[],
  ): void {
    this.group.visible = enabled;
    if (!enabled) return;
    this.beam.visible = at < this.beamUntil;
    this.updateEarth(at);
    if (lanceEnabled) this.updateLances(turretPosition, enemies);
    else this.hideLances();
    for (const field of this.fields) {
      field.group.visible = field.activeUntil > at;
      if (field.group.visible) field.group.rotation.y = at * 0.7;
    }
  }

  reset(): void {
    this.beamUntil = 0;
    this.beam.visible = false;
    this.earthStartedAt = Number.NEGATIVE_INFINITY;
    this.earth.visible = false;
    for (const field of this.fields) {
      field.activeUntil = Number.NEGATIVE_INFINITY;
      field.group.visible = false;
    }
    this.hideLances();
  }

  diagnostics(at: number): E9ArsenalPresentationDiagnostics {
    const activeFields = this.fields.filter((field) => field.activeUntil > at);
    return {
      stormDraw: { visible: this.beam.visible && this.group.visible, smoke: false },
      stormLance: {
        active: this.lanceCount,
        tracking: this.lanceTracking,
        silhouetteHeight: Balance.e9Arsenal.stormLance.silhouetteHeight,
        previousTurretSilhouetteHeight: Balance.e9Arsenal.stormLance.previousTurretSilhouetteHeight,
      },
      stormFence: {
        active: activeFields.length,
        fields: activeFields.map((field) => ({ x: round3(field.position.x), z: round3(field.position.z) })),
      },
      terraformCannon: { visible: this.earth.visible && this.group.visible, ammunition: 'map' },
    };
  }

  dispose(): void {
    this.reset();
    this.beamGeometry.dispose();
    this.beamMaterial.dispose();
    this.lanceGeometry.dispose();
    this.lanceMaterial.dispose();
    this.fenceRingGeometry.dispose();
    this.fencePostGeometry.dispose();
    this.fenceMaterial.dispose();
    this.earthGeometry.dispose();
    this.earthMaterial.dispose();
  }

  private createFenceFields(): void {
    const config = Balance.e9Arsenal.stormFence;
    for (let slot = 0; slot < config.pool; slot += 1) {
      const group = new THREE.Group();
      group.name = `StormFenceField${slot}`;
      const ring = new THREE.Mesh(this.fenceRingGeometry, this.fenceMaterial);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      for (let index = 0; index < 8; index += 1) {
        const angle = (index / 8) * Math.PI * 2;
        const post = new THREE.Mesh(this.fencePostGeometry, this.fenceMaterial);
        post.position.set(Math.cos(angle) * config.radius, config.postHeight * 0.5, Math.sin(angle) * config.radius);
        post.rotation.z = Math.sin(angle) * 0.18;
        post.rotation.x = Math.cos(angle) * 0.18;
        group.add(post);
      }
      group.visible = false;
      this.group.add(group);
      this.fields.push({ activeUntil: Number.NEGATIVE_INFINITY, position: new THREE.Vector3(), group });
    }
  }

  private updateEarth(at: number): void {
    const config = Balance.e9Arsenal.terraformCannon;
    const progress = (at - this.earthStartedAt) / config.airTime;
    if (progress < 0 || progress >= 1) {
      this.earth.visible = false;
      return;
    }
    this.earth.visible = true;
    this.earth.position.lerpVectors(this.earthOrigin, this.earthTarget, progress);
    this.earth.position.y = THREE.MathUtils.lerp(
      Terrain.visualY(this.earthOrigin.x, this.earthOrigin.z, 0.45),
      Terrain.visualY(this.earthTarget.x, this.earthTarget.z, 0.12),
      progress,
    ) + Math.sin(progress * Math.PI) * config.arcHeight;
    this.earth.rotation.set(progress * Math.PI * 3, progress * Math.PI * 2, progress * Math.PI);
  }

  private updateLances(turretPosition: (index: number) => THREE.Vector3 | null, enemies: readonly ClaimJumperEnemy[]): void {
    this.lanceCount = 0;
    this.lanceTracking = 0;
    const config = Balance.e9Arsenal.stormLance;
    for (let index = 0; index < Balance.turret.maxCount; index += 1) {
      const position = turretPosition(index);
      if (!position) {
        this.lances.setMatrixAt(index, this.hiddenMatrix);
        continue;
      }
      this.lanceCount += 1;
      const target = nearestEnemy(position, enemies, config.range);
      const yaw = target ? Math.atan2(target.position.x - position.x, target.position.z - position.z) : 0;
      if (target) this.lanceTracking += 1;
      const groundY = Terrain.visualY(position.x, position.z, 0, Balance.turret.overlapRadius);
      this.syncObject.position.set(position.x, groundY + config.silhouetteHeight - config.lensRadius, position.z);
      this.syncObject.rotation.set(0, yaw, Math.PI / 4);
      this.syncObject.scale.set(1, 1, 1);
      this.syncObject.updateMatrix();
      this.lances.setMatrixAt(index, this.syncObject.matrix);
    }
    this.lances.instanceMatrix.needsUpdate = true;
  }

  private hideLances(): void {
    for (let index = 0; index < Balance.turret.maxCount; index += 1) this.lances.setMatrixAt(index, this.hiddenMatrix);
    this.lances.instanceMatrix.needsUpdate = true;
    this.lanceCount = 0;
    this.lanceTracking = 0;
  }
}

function nearestEnemy(origin: THREE.Vector3, enemies: readonly ClaimJumperEnemy[], range: number): ClaimJumperEnemy | null {
  let nearest: ClaimJumperEnemy | null = null;
  let nearestSq = range * range;
  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;
    const distanceSq = origin.distanceToSquared(enemy.position);
    if (distanceSq >= nearestSq) continue;
    nearest = enemy;
    nearestSq = distanceSq;
  }
  return nearest;
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}
