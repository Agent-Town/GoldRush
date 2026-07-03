import * as THREE from 'three';
import { SentryBeaconPool } from '../entities/SentryBeacon';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import type { ShooterHandle } from './CombatSystem';
import type { CombatSystem } from './CombatSystem';
import * as Terrain from '../world/Terrain';

export type BuildDiagnostics = {
  mode: boolean;
  ghostValid: boolean;
  ghostPos: { x: number; z: number };
  beacons: number;
  beaconPositions: Array<{ x: number; z: number }>;
  nextCost: number;
};

const validColor = new THREE.Color('#2f8f85');
const invalidColor = new THREE.Color('#8a4a2a');

export class BuildSystem {
  readonly group = new THREE.Group();

  private readonly beacons = new SentryBeaconPool();
  private readonly ghost = new THREE.Group();
  private readonly ghostMaterial = new THREE.MeshStandardMaterial({
    color: validColor,
    emissive: validColor,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.62,
    roughness: 0.34,
    metalness: 0.12,
    depthWrite: false,
  });
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly rayHit = new THREE.Vector3();
  private readonly ghostPos = new THREE.Vector3();
  private readonly shooterPos = new THREE.Vector3();
  private readonly unregisterShooters: Array<() => void> = [];
  private pointerReady = false;
  private pointerClientX = 0;
  private pointerClientY = 0;
  private mode = false;
  private valid = false;
  private currentAt = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: THREE.Camera,
    private readonly economy: Economy,
    private readonly combat: CombatSystem,
    private readonly heroPosition: THREE.Vector3,
  ) {
    this.group.name = 'BuildSystem';
    this.group.add(this.beacons.group, this.ghost);
    this.createGhost();
    this.ghost.visible = false;
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('click', this.onCanvasClick);
  }

  get isBuildMode(): boolean {
    return this.mode;
  }

  get ghostValid(): boolean {
    return this.valid;
  }

  get beaconCount(): number {
    return this.beacons.activeCount;
  }

  get nextCost(): number {
    return beaconCost(this.beaconCount);
  }

  get canAffordNext(): boolean {
    return this.economy.gold >= this.nextCost && this.beaconCount < Balance.beacon.maxCount;
  }

  get diagnostics(): BuildDiagnostics {
    return {
      mode: this.mode,
      ghostValid: this.valid,
      ghostPos: { x: this.ghostPos.x, z: this.ghostPos.z },
      beacons: this.beaconCount,
      beaconPositions: this.beacons.allPositions
        .map((pos, i) => ({ x: pos.x, z: pos.z, active: this.beacons.isActive(i) }))
        .filter((entry) => entry.active)
        .map(({ x, z }) => ({ x, z })),
      nextCost: this.nextCost,
    };
  }

  setBuildMode(on: boolean): void {
    this.mode = on;
    this.ghost.visible = on;
  }

  toggleBuildMode(): void {
    this.setBuildMode(!this.mode);
  }

  update(at: number): void {
    this.currentAt = at;
    this.beacons.update(at);
    if (!this.mode) return;
    this.updateGhostPosition();
    this.valid = this.computeValid();
    this.ghost.position.copy(this.ghostPos);
    this.ghostMaterial.color.copy(this.valid ? validColor : invalidColor);
    this.ghostMaterial.emissive.copy(this.valid ? validColor : invalidColor);
    const pulse = 1 + Math.sin(at * Math.PI * 2) * 0.03;
    this.ghost.scale.setScalar(pulse);
  }

  confirm(at: number): boolean {
    if (!this.mode || !this.valid || this.beaconCount >= Balance.beacon.maxCount) return false;
    const cost = this.nextCost;
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_spent',
      sink: 'build_sentry_beacon',
      amount: cost,
    });
    if (!result.ok) return false;

    const placed = this.beacons.place(this.ghostPos);
    if (placed < 0) return false;
    const handle: ShooterHandle = {
      id: 'beacons',
      getPos: () => this.shooterPos.copy(this.beacons.allPositions[placed] ?? this.ghostPos),
      range: Balance.beacon.range,
      cooldown: 1 / Balance.beacon.fireRate,
      damage: Balance.beacon.damage,
      projSpeed: Balance.beacon.boltSpeed,
      volley: Balance.beacon.volley,
    };
    this.unregisterShooters.push(this.combat.registerShooter(handle));
    this.valid = this.computeValid();
    return true;
  }

  reset(): void {
    for (const unregister of this.unregisterShooters) unregister();
    this.unregisterShooters.length = 0;
    this.beacons.reset();
    this.setBuildMode(false);
    this.valid = false;
  }

  dispose(): void {
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.reset();
    this.beacons.dispose();
    this.ghost.traverse((child) => {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
    });
    this.ghostMaterial.dispose();
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointerReady = true;
    this.pointerClientX = event.clientX;
    this.pointerClientY = event.clientY;
  };

  private readonly onCanvasClick = (): void => {
    this.confirm(this.currentAt);
  };

  private updateGhostPosition(): void {
    if (this.pointerReady) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerNdc.set(
        ((this.pointerClientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
        -(((this.pointerClientY - rect.top) / Math.max(1, rect.height)) * 2 - 1),
      );
      this.raycaster.setFromCamera(this.pointerNdc, this.camera);
      if (this.raycaster.ray.intersectPlane(this.groundPlane, this.rayHit)) {
        this.ghostPos.copy(this.rayHit);
      }
    } else {
      // Keyboard fallback: 2 m north of the hero so the ghost reads on screen
      // instead of vanishing inside the hero mesh (review m1-05 finding A).
      this.ghostPos.copy(this.heroPosition);
      this.ghostPos.z -= 2;
    }
    this.snap(this.ghostPos);
  }

  private computeValid(): boolean {
    if (this.beaconCount >= Balance.beacon.maxCount) return false;
    if (this.economy.gold < this.nextCost) return false;
    if (!Terrain.isBuildable(this.ghostPos.x, this.ghostPos.z)) return false;
    const dx = this.ghostPos.x - this.heroPosition.x;
    const dz = this.ghostPos.z - this.heroPosition.z;
    if (dx * dx + dz * dz > Balance.beacon.placeRadius * Balance.beacon.placeRadius) return false;
    const overlapSq = Balance.beacon.overlapRadius * Balance.beacon.overlapRadius;
    for (let i = 0; i < this.beacons.capacity; i += 1) {
      if (!this.beacons.isActive(i)) continue;
      const pos = this.beacons.allPositions[i];
      if (!pos) continue;
      const ox = this.ghostPos.x - pos.x;
      const oz = this.ghostPos.z - pos.z;
      if (ox * ox + oz * oz < overlapSq) return false;
    }
    return true;
  }

  private snap(position: THREE.Vector3): void {
    const snap = Balance.beacon.gridSnap;
    position.x = Math.round(position.x / snap) * snap;
    position.y = 0;
    position.z = Math.round(position.z / snap) * snap;
  }

  private createGhost(): void {
    const legGeometry = new THREE.CylinderGeometry(0.035, 0.045, 1.05, 6);
    for (let i = 0; i < 3; i += 1) {
      const angle = i * ((Math.PI * 2) / 3) + 0.2;
      const leg = new THREE.Mesh(legGeometry, this.ghostMaterial);
      leg.position.set(Math.cos(angle) * 0.27, 0.47, Math.sin(angle) * 0.27);
      leg.rotation.set(0.42 * Math.sin(angle), angle, 0.42 * Math.cos(angle));
      this.ghost.add(leg);
    }
    this.ghost.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 12), this.ghostMaterial));
    this.ghost.children[3]?.position.set(0, 1.04, 0);
    this.ghost.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.34, 12), this.ghostMaterial));
    this.ghost.children[4]?.position.set(0, 0.82, 0);
    this.ghost.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), this.ghostMaterial));
    this.ghost.children[5]?.position.set(0, 0.82, 0);
  }
}

export function beaconCost(index: number): number {
  return Math.ceil((Balance.beacon.costBase * Balance.beacon.costGrowth ** index) / 5) * 5;
}
