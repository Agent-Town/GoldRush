import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { PalisadePool, type PalisadeBlocker } from '../entities/Palisade';
import { SentryBeaconPool } from '../entities/SentryBeacon';
import { SluicePool, type SluiceSnapshot } from '../entities/Sluice';
import { StockpilePool, type StockpileSnapshot } from '../entities/Stockpile';
import { Balance } from '../game/Balance';
import {
  beaconCost as registryBeaconCost,
  buildableDefs,
  getBuildableDef,
  type BuildableDef,
  type BuildableId,
} from '../game/buildables';
import type { BuildSink, Economy } from '../game/Economy';
import type { ShooterHandle } from './CombatSystem';
import type { CombatSystem } from './CombatSystem';
import * as Terrain from '../world/Terrain';

export type BuildableSnapshot = {
  id: BuildableId;
  displayName: string;
  cost: number;
  count: number;
  maxCount: number;
  canAfford: boolean;
  selected: boolean;
  iconSlot: `ui.build.icon.${BuildableId}`;
};

export type BuildDiagnostics = {
  mode: boolean;
  selectedBuildable: BuildableId;
  ghostValid: boolean;
  ghostPos: { x: number; z: number };
  ghostRotationSteps: number;
  ghostFootprint: { w: number; d: number };
  beacons: number;
  palisades: number;
  sluices: number;
  stockpiles: number;
  beaconPositions: Array<{ x: number; z: number }>;
  palisadePositions: Array<{ x: number; z: number }>;
  sluicePositions: Array<{ x: number; z: number }>;
  stockpilePositions: Array<{ x: number; z: number }>;
  buildables: Array<{ id: BuildableId; count: number }>;
  sluicesState: SluiceSnapshot[];
  stockpilesState: StockpileSnapshot[];
  pileStep: number;
  nextCost: number;
};

const validColor = new THREE.Color('#2f8f85');
const invalidColor = new THREE.Color('#8a4a2a');
const emptyPositions: Array<{ x: number; z: number }> = [];
const emptySluiceSnapshots: SluiceSnapshot[] = [];
const emptyStockpileSnapshots: StockpileSnapshot[] = [];

export class BuildSystem {
  readonly group = new THREE.Group();

  private readonly beacons = new SentryBeaconPool();
  private readonly palisades = new PalisadePool();
  private readonly sluices = new SluicePool();
  private readonly stockpiles = new StockpilePool();
  private readonly ghost = new THREE.Group();
  private readonly beaconGhost = new THREE.Group();
  private readonly palisadeGhost = new THREE.Group();
  private readonly sluiceGhost = new THREE.Group();
  private readonly stockpileGhost = new THREE.Group();
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
  private readonly shooterHandles: ShooterHandle[] = [];
  private selectedId: BuildableId = 'sentry_beacon';
  private ghostRotationSteps = 0;
  private beaconFireRateMult = 1;
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
    private readonly getWave: () => number = () => 0,
  ) {
    this.group.name = 'BuildSystem';
    this.group.add(this.beacons.group, this.palisades.group, this.sluices.group, this.stockpiles.group, this.ghost);
    this.createGhost();
    this.syncGhostShape();
    this.ghost.visible = false;
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('click', this.onCanvasClick);
  }

  get isBuildMode(): boolean {
    return this.mode;
  }

  get selectedBuildable(): BuildableId {
    return this.selectedId;
  }

  get ghostValid(): boolean {
    return this.valid;
  }

  get beaconCount(): number {
    return this.beacons.activeCount;
  }

  get buildableSnapshots(): BuildableSnapshot[] {
    return buildableDefs.map((def) => {
      const count = this.countFor(def.id);
      const cost = def.costCurve(count);
      return {
        id: def.id,
        displayName: def.displayName,
        cost,
        count,
        maxCount: def.maxCount,
        canAfford: this.economy.gold >= cost && count < def.maxCount,
        selected: def.id === this.selectedId,
        iconSlot: def.iconSlot,
      };
    });
  }

  get buildableCounts(): Array<{ id: BuildableId; count: number }> {
    return buildableDefs.map((def) => ({ id: def.id, count: this.countFor(def.id) }));
  }

  get palisadeBlockers(): readonly PalisadeBlocker[] {
    return this.palisades.activeBlockers;
  }

  get nextCost(): number {
    const def = this.selectedDef();
    return def.costCurve(this.countFor(def.id));
  }

  get canAffordNext(): boolean {
    const def = this.selectedDef();
    return this.economy.gold >= this.nextCost && this.countFor(def.id) < def.maxCount;
  }

  get diagnostics(): BuildDiagnostics {
    const footprint = this.footprint(this.selectedDef(), this.ghostRotationSteps);
    const sluicesActive = this.sluices.activeCount > 0;
    const stockpilesActive = this.stockpiles.activeCount > 0;
    return {
      mode: this.mode,
      selectedBuildable: this.selectedId,
      ghostValid: this.valid,
      ghostPos: { x: this.ghostPos.x, z: this.ghostPos.z },
      ghostRotationSteps: this.ghostRotationSteps,
      ghostFootprint: footprint,
      beacons: this.beaconCount,
      palisades: this.palisades.activeCount,
      sluices: this.sluices.activeCount,
      stockpiles: this.stockpiles.activeCount,
      beaconPositions: this.activePositions(this.beacons),
      palisadePositions: this.activePositions(this.palisades),
      sluicePositions: sluicesActive ? this.activePositions(this.sluices) : emptyPositions,
      stockpilePositions: stockpilesActive ? this.activePositions(this.stockpiles) : emptyPositions,
      buildables: this.buildableCounts,
      sluicesState: sluicesActive ? this.sluices.snapshot() : emptySluiceSnapshots,
      stockpilesState: stockpilesActive ? this.stockpiles.snapshot() : emptyStockpileSnapshots,
      pileStep: this.stockpiles.maxPileStep,
      nextCost: this.nextCost,
    };
  }

  setBuildMode(on: boolean): void {
    this.mode = on;
    this.ghost.visible = on;
    if (!on) this.valid = false;
  }

  toggleBuildMode(): void {
    this.setBuildMode(!this.mode);
  }

  selectBuildable(id: string, arm = true): boolean {
    const def = getBuildableDef(id);
    if (!def) return false;
    this.selectedId = def.id;
    if (!def.rotatable) this.ghostRotationSteps = 0;
    this.syncGhostShape();
    if (arm) this.setBuildMode(true);
    return true;
  }

  rotateGhost(): boolean {
    if (!this.selectedDef().rotatable) return false;
    this.ghostRotationSteps = (this.ghostRotationSteps + 1) % 4;
    this.syncGhostShape();
    return true;
  }

  update(
    delta: number,
    at: number,
    enemies: readonly ClaimJumperEnemy[],
    onSluiceGold: (position: THREE.Vector3, amount: number) => void,
    onBankFull: (position: THREE.Vector3) => void,
  ): void {
    this.currentAt = at;
    this.beacons.update(at);
    this.sluices.update(delta, at, enemies, this.economy, onSluiceGold, onBankFull);
    this.stockpiles.update(this.economy.gold, this.economy.bankCap);
    if (!this.mode) return;
    this.updateGhostPosition();
    this.valid = this.computeValid();
    this.ghost.position.copy(this.ghostPos);
    this.ghost.rotation.y = this.ghostRotationSteps * (Math.PI / 2);
    this.ghostMaterial.color.copy(this.valid ? validColor : invalidColor);
    this.ghostMaterial.emissive.copy(this.valid ? validColor : invalidColor);
    const pulse = 1 + Math.sin(at * Math.PI * 2) * 0.03;
    this.ghost.scale.setScalar(pulse);
  }

  confirm(at: number): boolean {
    if (!this.mode) return false;
    this.updateGhostPosition();
    this.valid = this.computeValid();
    if (!this.valid) return false;

    const def = this.selectedDef();
    const cost = def.costCurve(this.countFor(def.id));
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_spent',
      sink: buildSink(def.id),
      amount: cost,
    });
    if (!result.ok) return false;

    const placed = this.place(def.id, this.ghostPos);
    if (placed < 0) return false;
    if (def.id === 'sentry_beacon') this.registerBeaconShooter(placed);
    if (def.id === 'stockpile') this.economy.addCapSource(stockpileCapSource(placed), Balance.stockpile.capBonus);
    this.valid = this.computeValid();
    return true;
  }

  reset(): void {
    for (const unregister of this.unregisterShooters) unregister();
    this.unregisterShooters.length = 0;
    this.shooterHandles.length = 0;
    this.beaconFireRateMult = 1;
    this.beacons.reset();
    this.palisades.reset();
    this.sluices.reset();
    for (let i = 0; i < this.stockpiles.capacity; i += 1) this.economy.removeCapSource(stockpileCapSource(i));
    this.stockpiles.reset();
    this.selectedId = 'sentry_beacon';
    this.ghostRotationSteps = 0;
    this.syncGhostShape();
    this.setBuildMode(false);
  }

  applyStats(beaconFireRateMult: number): void {
    this.beaconFireRateMult = beaconFireRateMult;
    for (const handle of this.shooterHandles) {
      handle.cooldown = 1 / (Balance.beacon.fireRate * this.beaconFireRateMult);
    }
  }

  dispose(): void {
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.reset();
    this.beacons.dispose();
    this.palisades.dispose();
    this.sluices.dispose();
    this.stockpiles.dispose();
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
    const def = this.selectedDef();
    if (this.countFor(def.id) >= def.maxCount) return false;
    if (this.economy.gold < def.costCurve(this.countFor(def.id))) return false;
    if (!this.matchesPlacement(def, this.ghostPos)) return false;
    const dx = this.ghostPos.x - this.heroPosition.x;
    const dz = this.ghostPos.z - this.heroPosition.z;
    if (dx * dx + dz * dz > Balance.beacon.placeRadius * Balance.beacon.placeRadius) return false;
    return !this.overlapsExisting(def.id, this.ghostPos);
  }

  private matchesPlacement(def: BuildableDef, position: THREE.Vector3): boolean {
    if (def.placement === 'any') return Terrain.sample(position.x, position.z).walkable;
    if (def.placement === 'bank') return Terrain.isBuildable(position.x, position.z);
    return this.isRiverAdjacent(position);
  }

  private isRiverAdjacent(position: THREE.Vector3): boolean {
    const sample = Terrain.sample(position.x, position.z);
    if (sample.zone !== 'bank' && sample.zone !== 'shallows') return false;
    const river = Terrain.riverGeometry();
    if (position.x < river.minX || position.x > river.maxX) return false;
    const distance =
      position.z < river.minZ ? river.minZ - position.z : position.z > river.maxZ ? position.z - river.maxZ : 0;
    return distance <= Balance.sluice.riverPad;
  }

  private overlapsExisting(id: BuildableId, position: THREE.Vector3): boolean {
    for (let i = 0; i < this.beacons.capacity; i += 1) {
      if (!this.beacons.isActive(i)) continue;
      const pos = this.beacons.allPositions[i];
      if (pos && this.overlapsBuildable(id, position, this.ghostRotationSteps, 'sentry_beacon', pos, 0)) return true;
    }
    for (let i = 0; i < this.palisades.capacity; i += 1) {
      if (!this.palisades.isActive(i)) continue;
      const pos = this.palisades.allPositions[i];
      if (pos && this.overlapsBuildable(id, position, this.ghostRotationSteps, 'palisade', pos, this.palisades.rotationStepsAt(i))) {
        return true;
      }
    }
    for (let i = 0; i < this.sluices.capacity; i += 1) {
      if (!this.sluices.isActive(i)) continue;
      const pos = this.sluices.allPositions[i];
      if (pos && this.overlapsBuildable(id, position, this.ghostRotationSteps, 'sluice', pos, 0)) return true;
    }
    for (let i = 0; i < this.stockpiles.capacity; i += 1) {
      if (!this.stockpiles.isActive(i)) continue;
      const pos = this.stockpiles.allPositions[i];
      if (pos && this.overlapsBuildable(id, position, this.ghostRotationSteps, 'stockpile', pos, 0)) return true;
    }
    return false;
  }

  private overlapsBuildable(
    aId: BuildableId,
    a: THREE.Vector3,
    aRotationSteps: number,
    bId: BuildableId,
    b: THREE.Vector3,
    bRotationSteps: number,
  ): boolean {
    if (aId === 'sentry_beacon' && bId === 'sentry_beacon') {
      return this.overlaps(a, b, this.overlapRadius('sentry_beacon'));
    }
    const aHalf = this.footprintHalfExtents(aId, aRotationSteps);
    const bHalf = this.footprintHalfExtents(bId, bRotationSteps);
    return Math.abs(a.x - b.x) < aHalf.x + bHalf.x && Math.abs(a.z - b.z) < aHalf.z + bHalf.z;
  }

  private overlaps(a: THREE.Vector3, b: THREE.Vector3, radius: number): boolean {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return dx * dx + dz * dz < radius * radius;
  }

  private overlapRadius(id: BuildableId): number {
    return id === 'palisade' ? Balance.palisade.overlapRadius : Balance.beacon.overlapRadius;
  }

  private footprintHalfExtents(id: BuildableId, rotationSteps = 0): { x: number; z: number } {
    const footprint = this.footprint(getBuildableDef(id), rotationSteps);
    return { x: footprint.w / 2, z: footprint.d / 2 };
  }

  private footprint(def: BuildableDef | undefined, rotationSteps = 0): { w: number; d: number } {
    const footprint = def?.footprint ?? { w: 1, d: 1 };
    return rotationSteps % 2 === 1 ? { w: footprint.d, d: footprint.w } : footprint;
  }

  private snap(position: THREE.Vector3): void {
    const snap = Balance.beacon.gridSnap;
    position.x = Math.round(position.x / snap) * snap;
    position.y = 0;
    position.z = Math.round(position.z / snap) * snap;
  }

  private countFor(id: BuildableId): number {
    if (id === 'palisade') return this.palisades.activeCount;
    if (id === 'sluice') return this.sluices.activeCount;
    if (id === 'stockpile') return this.stockpiles.activeCount;
    return this.beacons.activeCount;
  }

  private place(id: BuildableId, position: THREE.Vector3): number {
    if (id === 'palisade') return this.palisades.place(position, this.ghostRotationSteps);
    if (id === 'sluice') return this.sluices.place(position);
    if (id === 'stockpile') return this.stockpiles.place(position);
    return this.beacons.place(position);
  }

  private selectedDef(): BuildableDef {
    return getBuildableDef(this.selectedId) ?? buildableDefs[0];
  }

  private activePositions(
    pool: SentryBeaconPool | PalisadePool | SluicePool | StockpilePool,
  ): Array<{ x: number; z: number }> {
    return pool.allPositions
      .map((pos, i) => ({ x: pos.x, z: pos.z, active: pool.isActive(i) }))
      .filter((entry) => entry.active)
      .map(({ x, z }) => ({ x, z }));
  }

  private registerBeaconShooter(placed: number): void {
    const handle: ShooterHandle = {
      id: 'beacons',
      getPos: () => this.shooterPos.copy(this.beacons.allPositions[placed] ?? this.ghostPos),
      range: Balance.beacon.range,
      cooldown: 1 / (Balance.beacon.fireRate * this.beaconFireRateMult),
      damage: Balance.beacon.damage,
      getDamage: () => Balance.beacon.damage + Balance.beacon.damagePerWave * this.getWave(),
      projSpeed: Balance.beacon.boltSpeed,
      volley: Balance.beacon.volley,
    };
    this.shooterHandles.push(handle);
    this.unregisterShooters.push(this.combat.registerShooter(handle));
  }

  private syncGhostShape(): void {
    this.beaconGhost.visible = this.selectedId === 'sentry_beacon';
    this.palisadeGhost.visible = this.selectedId === 'palisade';
    this.sluiceGhost.visible = this.selectedId === 'sluice';
    this.stockpileGhost.visible = this.selectedId === 'stockpile';
  }

  private createGhost(): void {
    this.createBeaconGhost();
    this.createPalisadeGhost();
    this.createSluiceGhost();
    this.createStockpileGhost();
    this.ghost.add(this.beaconGhost, this.palisadeGhost, this.sluiceGhost, this.stockpileGhost);
  }

  private createBeaconGhost(): void {
    const legGeometry = new THREE.CylinderGeometry(0.035, 0.045, 1.05, 6);
    for (let i = 0; i < 3; i += 1) {
      const angle = i * ((Math.PI * 2) / 3) + 0.2;
      const leg = new THREE.Mesh(legGeometry, this.ghostMaterial);
      leg.position.set(Math.cos(angle) * 0.27, 0.47, Math.sin(angle) * 0.27);
      leg.rotation.set(0.42 * Math.sin(angle), angle, 0.42 * Math.cos(angle));
      this.beaconGhost.add(leg);
    }
    this.beaconGhost.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 12), this.ghostMaterial));
    this.beaconGhost.children[3]?.position.set(0, 1.04, 0);
    this.beaconGhost.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.34, 12), this.ghostMaterial));
    this.beaconGhost.children[4]?.position.set(0, 0.82, 0);
    this.beaconGhost.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), this.ghostMaterial));
    this.beaconGhost.children[5]?.position.set(0, 0.82, 0);
  }

  private createPalisadeGhost(): void {
    const postGeometry = new THREE.BoxGeometry(0.16, 0.92, 0.16);
    const railGeometry = new THREE.BoxGeometry(0.18, 0.16, Balance.palisade.depth);
    for (const z of [-Balance.palisade.depth / 2 + 0.1, Balance.palisade.depth / 2 - 0.1]) {
      const post = new THREE.Mesh(postGeometry, this.ghostMaterial);
      post.position.set(0, 0.46, z);
      this.palisadeGhost.add(post);
    }
    for (const y of [0.35, 0.68]) {
      const rail = new THREE.Mesh(railGeometry, this.ghostMaterial);
      rail.position.set(0, y, 0);
      this.palisadeGhost.add(rail);
    }
  }

  private createSluiceGhost(): void {
    const trough = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.32, 0.62), this.ghostMaterial);
    trough.position.set(0, 0.2, 0);
    trough.rotation.y = 0.08;
    this.sluiceGhost.add(trough);
    const water = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.035, 0.34), this.ghostMaterial);
    water.position.set(0, 0.39, 0);
    water.rotation.y = 0.08;
    this.sluiceGhost.add(water);
  }

  private createStockpileGhost(): void {
    const base = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), this.ghostMaterial);
    base.position.set(0, 0.28, 0);
    this.stockpileGhost.add(base);
    for (const [x, z, scale] of [
      [-0.34, -0.1, 0.54],
      [0.28, -0.16, 0.48],
      [0.05, 0.3, 0.44],
    ] as const) {
      const nugget = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), this.ghostMaterial);
      nugget.position.set(x, 0.18, z);
      nugget.scale.setScalar(scale);
      this.stockpileGhost.add(nugget);
    }
  }
}

function buildSink(id: BuildableId): BuildSink {
  return `build_${id}`;
}

function stockpileCapSource(index: number): string {
  return `stockpile:${index}`;
}

export function beaconCost(index: number): number {
  return registryBeaconCost(index);
}
