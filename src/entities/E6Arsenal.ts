import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { DecayHandle, DecayScheduler } from '../systems/DecaySystem';
import type { ClaimJumperEnemy } from './Enemy';
import * as Terrain from '../world/Terrain';

type CaltropField = {
  active: boolean;
  handle: DecayHandle | null;
  position: THREE.Vector3;
  group: THREE.Group;
  hand: THREE.Group;
};

export type E6ArsenalPresentationDiagnostics = {
  beam: { visible: boolean; smoke: false };
  mount: {
    active: number;
    tracking: number;
    silhouetteHeight: number;
    previousTurretSilhouetteHeight: number;
  };
  caltrops: {
    active: number;
    visibleDials: number;
    fields: Array<{ x: number; z: number; remaining: number }>;
  };
  tongs: { visible: boolean; delivery: 'underhand-arc' };
};

export class E6ArsenalPresentation {
  readonly group = new THREE.Group();

  private readonly beamPositions = new Float32Array(6);
  private readonly beamGeometry = new THREE.BufferGeometry();
  private readonly beamMaterial = new THREE.LineBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.9 });
  private readonly beam = new THREE.Line(this.beamGeometry, this.beamMaterial);
  private readonly mirrorGeometry = new THREE.CylinderGeometry(
    Balance.e6Arsenal.sunlineMount.mirrorRadius,
    Balance.e6Arsenal.sunlineMount.mirrorRadius * 0.24,
    Balance.e6Arsenal.sunlineMount.mirrorRadius * 0.32,
    18,
  );
  private readonly mirrorMaterial = new THREE.MeshStandardMaterial({
    color: '#fff8e8',
    emissive: '#ffe4a0',
    emissiveIntensity: 0.7,
    roughness: 0.18,
    metalness: 0.72,
  });
  private readonly mirrors = new THREE.InstancedMesh(this.mirrorGeometry, this.mirrorMaterial, Balance.turret.maxCount);
  private readonly caltropGeometry = new THREE.ConeGeometry(0.09, 0.28, 4);
  private readonly caltropMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#5b8a8a',
    emissiveIntensity: 0.36,
    roughness: 0.42,
    metalness: 0.48,
  });
  private readonly dialGeometry = new THREE.RingGeometry(
    Balance.e6Arsenal.halfLifeCaltrops.dialRadius * 0.78,
    Balance.e6Arsenal.halfLifeCaltrops.dialRadius,
    28,
  );
  private readonly dialMaterial = new THREE.MeshBasicMaterial({ color: '#83ded7', side: THREE.DoubleSide });
  private readonly handGeometry = new THREE.BoxGeometry(0.035, 0.025, Balance.e6Arsenal.halfLifeCaltrops.dialRadius * 0.72);
  private readonly handMaterial = new THREE.MeshBasicMaterial({ color: '#fff8e8' });
  private readonly tongsGeometry = new THREE.BoxGeometry(0.055, 0.055, Balance.e6Arsenal.tongsThrown.tongsLength);
  private readonly tongsMaterial = new THREE.MeshStandardMaterial({
    color: '#c4883a',
    emissive: '#ffe4a0',
    emissiveIntensity: 0.42,
    roughness: 0.35,
    metalness: 0.55,
  });
  private readonly tongs = new THREE.Group();
  private readonly fields: CaltropField[] = [];
  private readonly syncObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly tongsOrigin = new THREE.Vector3();
  private readonly tongsTarget = new THREE.Vector3();
  private beamUntil = 0;
  private tongsStartedAt = Number.NEGATIVE_INFINITY;
  private mountCount = 0;
  private trackingCount = 0;
  private nextFieldId = 1;

  constructor(private readonly decay: DecayScheduler) {
    this.group.name = 'E6ArsenalPresentation';
    this.beam.name = 'SunlineBeamFocusedLight';
    this.beamGeometry.setAttribute('position', new THREE.BufferAttribute(this.beamPositions, 3));
    this.beam.visible = false;
    this.mirrors.name = 'SunlineMountTrackingMirrorHeads';
    this.mirrors.frustumCulled = false;
    for (let i = 0; i < Balance.turret.maxCount; i += 1) this.mirrors.setMatrixAt(i, this.hiddenMatrix);
    this.mirrors.instanceMatrix.needsUpdate = true;
    this.createTongs();
    this.createCaltropFields();
    this.group.add(this.beam, this.mirrors, this.tongs);
  }

  flashBeam(origin: THREE.Vector3, target: THREE.Vector3, at: number): void {
    this.beamPositions.set([
      origin.x,
      Terrain.visualY(origin.x, origin.z, 0.8),
      origin.z,
      target.x,
      Terrain.visualY(target.x, target.z, 0.8),
      target.z,
    ]);
    (this.beamGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    this.beamUntil = at + Balance.e6Arsenal.sunlineBeam.visualSeconds;
    this.beam.visible = true;
  }

  throwTongs(origin: THREE.Vector3, target: THREE.Vector3, at: number): void {
    this.tongsOrigin.copy(origin);
    this.tongsTarget.copy(target);
    this.tongsStartedAt = at;
    this.tongs.visible = true;
  }

  deployCaltrops(position: THREE.Vector3): boolean {
    const config = Balance.e6Arsenal.halfLifeCaltrops;
    for (const field of this.fields) {
      if (!field.active) continue;
      if (field.position.distanceToSquared(position) < config.overlapRadius * config.overlapRadius) return false;
    }
    const index = this.fields.findIndex((field) => !field.active);
    const field = this.fields[index];
    if (!field) return false;
    field.active = true;
    field.position.set(position.x, Terrain.visualY(position.x, position.z, config.dialHeight), position.z);
    field.group.position.copy(field.position);
    field.group.visible = true;
    field.handle = this.decay.register({
      id: `e6:half-life-caltrops:${this.nextFieldId++}`,
      durationTicks: config.durationTicks,
      onExpire: () => this.deactivateField(index, false),
    });
    return true;
  }

  movementMultiplier(position: THREE.Vector3): number {
    const config = Balance.e6Arsenal.halfLifeCaltrops;
    const radiusSq = config.radius * config.radius;
    for (const field of this.fields) {
      if (!field.active) continue;
      const dx = field.position.x - position.x;
      const dz = field.position.z - position.z;
      if (dx * dx + dz * dz <= radiusSq) return config.slowMultiplier;
    }
    return 1;
  }

  update(
    enabled: boolean,
    mountEnabled: boolean,
    at: number,
    turretPosition: (index: number) => THREE.Vector3 | null,
    enemies: readonly ClaimJumperEnemy[],
  ): void {
    this.group.visible = enabled;
    if (!enabled) return;
    this.beam.visible = at < this.beamUntil;
    this.updateTongs(at);
    if (mountEnabled) this.updateMounts(turretPosition, enemies);
    else this.hideMounts();
    for (const field of this.fields) {
      if (!field.active || field.handle === null) continue;
      const fraction = this.decay.fraction(field.handle) ?? 0;
      field.hand.rotation.y = -fraction * Math.PI * 2;
    }
  }

  reset(): void {
    this.beamUntil = 0;
    this.beam.visible = false;
    this.tongsStartedAt = Number.NEGATIVE_INFINITY;
    this.tongs.visible = false;
    for (let i = 0; i < this.fields.length; i += 1) this.deactivateField(i, true);
    for (let i = 0; i < Balance.turret.maxCount; i += 1) this.mirrors.setMatrixAt(i, this.hiddenMatrix);
    this.mirrors.instanceMatrix.needsUpdate = true;
    this.mountCount = 0;
    this.trackingCount = 0;
  }

  diagnostics(): E6ArsenalPresentationDiagnostics {
    const activeFields = this.fields.filter((field) => field.active);
    return {
      beam: { visible: this.beam.visible && this.group.visible, smoke: false },
      mount: {
        active: this.mountCount,
        tracking: this.trackingCount,
        silhouetteHeight: Balance.e6Arsenal.sunlineMount.silhouetteHeight,
        previousTurretSilhouetteHeight: Balance.e6Arsenal.sunlineMount.silhouetteHeight,
      },
      caltrops: {
        active: activeFields.length,
        visibleDials: activeFields.filter((field) => field.group.visible && this.group.visible).length,
        fields: activeFields.map((field) => ({
          x: round3(field.position.x),
          z: round3(field.position.z),
          remaining: round3(field.handle === null ? 0 : (this.decay.fraction(field.handle) ?? 0)),
        })),
      },
      tongs: { visible: this.tongs.visible && this.group.visible, delivery: 'underhand-arc' },
    };
  }

  dispose(): void {
    this.reset();
    this.beamGeometry.dispose();
    this.beamMaterial.dispose();
    this.mirrorGeometry.dispose();
    this.mirrorMaterial.dispose();
    this.caltropGeometry.dispose();
    this.caltropMaterial.dispose();
    this.dialGeometry.dispose();
    this.dialMaterial.dispose();
    this.handGeometry.dispose();
    this.handMaterial.dispose();
    this.tongsGeometry.dispose();
    this.tongsMaterial.dispose();
  }

  private createTongs(): void {
    this.tongs.name = 'TongsThrownUnderhandPresentation';
    for (const angle of [-0.16, 0.16]) {
      const arm = new THREE.Mesh(this.tongsGeometry, this.tongsMaterial);
      arm.rotation.y = angle;
      arm.position.x = Math.sign(angle) * 0.08;
      this.tongs.add(arm);
    }
    this.tongs.visible = false;
  }

  private createCaltropFields(): void {
    const config = Balance.e6Arsenal.halfLifeCaltrops;
    for (let slot = 0; slot < config.pool; slot += 1) {
      const group = new THREE.Group();
      group.name = `HalfLifeCaltropsField${slot}`;
      for (let i = 0; i < config.spikes; i += 1) {
        const angle = (i / config.spikes) * Math.PI * 2;
        const spike = new THREE.Mesh(this.caltropGeometry, this.caltropMaterial);
        spike.position.set(Math.cos(angle) * config.radius * 0.58, 0.08, Math.sin(angle) * config.radius * 0.58);
        spike.rotation.z = Math.sin(angle) * 0.45;
        spike.rotation.x = Math.cos(angle) * 0.45;
        group.add(spike);
      }
      const dial = new THREE.Mesh(this.dialGeometry, this.dialMaterial);
      dial.name = 'HalfLifeDecayDial';
      dial.rotation.x = -Math.PI / 2;
      const hand = new THREE.Group();
      const needle = new THREE.Mesh(this.handGeometry, this.handMaterial);
      needle.position.z = config.dialRadius * 0.34;
      hand.add(needle);
      group.add(dial, hand);
      group.visible = false;
      this.group.add(group);
      this.fields.push({ active: false, handle: null, position: new THREE.Vector3(), group, hand });
    }
  }

  private updateTongs(at: number): void {
    const config = Balance.e6Arsenal.tongsThrown;
    const progress = (at - this.tongsStartedAt) / config.airTime;
    if (progress < 0 || progress >= 1) {
      this.tongs.visible = false;
      return;
    }
    this.tongs.visible = true;
    this.tongs.position.lerpVectors(this.tongsOrigin, this.tongsTarget, progress);
    this.tongs.position.y =
      THREE.MathUtils.lerp(
        Terrain.visualY(this.tongsOrigin.x, this.tongsOrigin.z, 0.62),
        Terrain.visualY(this.tongsTarget.x, this.tongsTarget.z, 0.12),
        progress,
      ) + Math.sin(progress * Math.PI) * config.arcHeight;
    this.tongs.rotation.set(progress * Math.PI * 0.5, progress * Math.PI * 2, 0.25);
  }

  private updateMounts(turretPosition: (index: number) => THREE.Vector3 | null, enemies: readonly ClaimJumperEnemy[]): void {
    this.mountCount = 0;
    this.trackingCount = 0;
    const config = Balance.e6Arsenal.sunlineMount;
    for (let index = 0; index < Balance.turret.maxCount; index += 1) {
      const position = turretPosition(index);
      if (!position) {
        this.mirrors.setMatrixAt(index, this.hiddenMatrix);
        continue;
      }
      this.mountCount += 1;
      const target = nearestEnemy(position, enemies, config.range);
      const yaw = target ? Math.atan2(target.position.x - position.x, target.position.z - position.z) : 0;
      if (target) this.trackingCount += 1;
      const groundY = Terrain.visualY(position.x, position.z, 0, Balance.turret.overlapRadius);
      this.syncObject.position.set(position.x, groundY + config.silhouetteHeight - config.mirrorRadius, position.z);
      this.syncObject.rotation.set(Math.PI / 2, yaw, 0);
      this.syncObject.scale.set(1, 1, 1);
      this.syncObject.updateMatrix();
      this.mirrors.setMatrixAt(index, this.syncObject.matrix);
    }
    this.mirrors.instanceMatrix.needsUpdate = true;
  }

  private hideMounts(): void {
    if (this.mountCount === 0 && this.trackingCount === 0) return;
    for (let index = 0; index < Balance.turret.maxCount; index += 1) this.mirrors.setMatrixAt(index, this.hiddenMatrix);
    this.mirrors.instanceMatrix.needsUpdate = true;
    this.mountCount = 0;
    this.trackingCount = 0;
  }

  private deactivateField(index: number, cancel: boolean): void {
    const field = this.fields[index];
    if (!field) return;
    if (cancel && field.handle !== null) this.decay.cancel(field.handle);
    field.active = false;
    field.handle = null;
    field.group.visible = false;
  }
}

function nearestEnemy(origin: THREE.Vector3, enemies: readonly ClaimJumperEnemy[], range: number): ClaimJumperEnemy | null {
  let nearest: ClaimJumperEnemy | null = null;
  let nearestSq = range * range;
  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;
    const dx = enemy.position.x - origin.x;
    const dz = enemy.position.z - origin.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq >= nearestSq) continue;
    nearest = enemy;
    nearestSq = distanceSq;
  }
  return nearest;
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}
