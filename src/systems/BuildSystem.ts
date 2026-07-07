import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { PalisadePool, type PalisadeBlocker } from '../entities/Palisade';
import { SentryBeaconPool } from '../entities/SentryBeacon';
import { SluicePool, type SluiceSnapshot } from '../entities/Sluice';
import { StockpilePool, type StockpileSnapshot } from '../entities/Stockpile';
import { TurretPool } from '../entities/Turret';
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
import type { BuildingTarget, TargetingSystem } from './TargetingSystem';
import { RenderLayers } from '../core/RenderLayers';
import * as Terrain from '../world/Terrain';

export type BuildableSnapshot = {
  id: BuildableId;
  displayName: string;
  blurb?: string;
  cost: number;
  count: number;
  maxCount: number;
  canAfford: boolean;
  selected: boolean;
  iconSlot: `ui.build.icon.${BuildableId}`;
  portraitSlug?: string;
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
  turrets: number;
  assayOffices: number;
  beaconPositions: Array<{ x: number; z: number }>;
  palisadePositions: Array<{ x: number; z: number }>;
  sluicePositions: Array<{ x: number; z: number }>;
  stockpilePositions: Array<{ x: number; z: number }>;
  turretPositions: Array<{ x: number; z: number }>;
  assayOfficePositions: Array<{ x: number; z: number }>;
  buildables: Array<{ id: BuildableId; count: number }>;
  sluicesState: SluiceSnapshot[];
  stockpilesState: StockpileSnapshot[];
  pileStep: number;
  nextCost: number;
  hp: Array<{
    id: BuildableId;
    index: number;
    tier: number;
    hp: number;
    maxHp: number;
    wrecked: boolean;
    worn: boolean;
    effectiveDamage?: number;
    effectiveFireRate?: number;
    panRateMult?: number;
    yieldPerCycle?: number;
    repairProgress: number;
    position: { x: number; z: number };
  }>;
  ruins: number;
  hpBars: number;
  hpBarsVisible: boolean;
  hpBarDetails: Array<{
    id: BuildableId;
    index: number;
    visible: boolean;
    ratio: number;
    color: 'ink' | 'amber' | 'red';
    rotationSteps: number;
    yaw: number;
  }>;
  repair: { active: boolean; id: BuildableId | null; index: number; progress: number; blocked: boolean };
  shooterRegistrations: number;
  turretPulses: number;
  activeTurretPulses: number;
  tierUpgrades: number;
  repairs: number;
  repairGold: number;
};

export type DemolishCandidate = {
  id: BuildableId;
  index: number;
  displayName: string;
  invested: number;
  refund: number;
  position: { x: number; z: number };
};

export type UpgradeCandidate = {
  id: BuildableId;
  index: number;
  displayName: string;
  tier: number;
  maxTier: number;
  nextTier: number | null;
  cost: number;
  canUpgrade: boolean;
  reason: 'ready' | 'max' | 'insufficient_gold' | 'gated';
  gain: string;
  position: { x: number; z: number };
};

const validColor = new THREE.Color('#2f8f85');
const invalidColor = new THREE.Color('#8a4a2a');
const emptyPositions: Array<{ x: number; z: number }> = [];
const emptySluiceSnapshots: SluiceSnapshot[] = [];
const emptyStockpileSnapshots: StockpileSnapshot[] = [];
const buildableIds: readonly BuildableId[] = ['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'turret', 'assay_office'];
const upgradeableBuildableIds = ['palisade', 'sluice', 'turret'] as const;
const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const hpBackingColor = new THREE.Color('#f5e6c8');
const hpInkColor = new THREE.Color('#3b2a1a');
const hpAmberColor = new THREE.Color('#c4883a');
const hpDangerColor = new THREE.Color('#a0522d');
const rubbleColor = new THREE.Color('#8b7d3c');
const repairColor = new THREE.Color('#ffe4a0');
const blockedRepairColor = new THREE.Color('#a0522d');
const hpBarWidth = 1.46;
const hpBarHeight = 0.12;
const hpBarDepth = 0.28;

type BuildingFamilyStore<T> = Record<BuildableId, T[]>;
type UpgradeableBuildableId = (typeof upgradeableBuildableIds)[number];
type TierRung = (typeof Balance.tiers)[UpgradeableBuildableId][number];
type TierStat = 'maxHpMult' | 'panRateMult' | 'yieldMult' | 'damageMult' | 'fireRateMult';
type BuildingDamageResult = {
  applied: boolean;
  family: string;
  index: number;
  hp: number;
  maxHp: number;
  wrecked: boolean;
};

export class BuildSystem {
  readonly group = new THREE.Group();

  private readonly beacons = new SentryBeaconPool();
  private readonly palisades = new PalisadePool();
  private readonly sluices = new SluicePool();
  private readonly stockpiles = new StockpilePool();
  private readonly turrets = new TurretPool();
  private readonly assayOffice = new THREE.Group();
  private readonly ghost = new THREE.Group();
  private readonly beaconGhost = new THREE.Group();
  private readonly palisadeGhost = new THREE.Group();
  private readonly sluiceGhost = new THREE.Group();
  private readonly stockpileGhost = new THREE.Group();
  private readonly turretGhost = new THREE.Group();
  private readonly assayOfficeGhost = new THREE.Group();
  private readonly assayOfficePosition = new THREE.Vector3();
  private assayOfficeActive = false;
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
  private readonly visualObject = new THREE.Object3D();
  private readonly hp = createNumberStore();
  private readonly hpMax = createNumberStore();
  private readonly tier = createNumberStore();
  private readonly buildCosts = createNumberStore();
  private readonly wrecked = createBooleanStore();
  private readonly repairProgress = createNumberStore();
  private readonly repairNeedGoldShown = createBooleanStore();
  private readonly targets = createTargetStore();
  private readonly unregisterShooters = createFunctionStore();
  private readonly shooterByInstance = createShooterStore();
  private readonly shooterHandles: ShooterHandle[] = [];
  private readonly filteredBlockers: PalisadeBlocker[] = [];
  private readonly buildingVisualGeometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly buildingVisualMaterial = new THREE.MeshStandardMaterial({
    color: '#fff8e8',
    roughness: 0.86,
    metalness: 0.02,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  private readonly hpVisualMaterial = new THREE.MeshStandardMaterial({
    color: '#fff8e8',
    roughness: 0.86,
    metalness: 0.02,
    transparent: true,
    depthWrite: false,
  });
  private readonly buildingVisuals = new THREE.InstancedMesh(
    this.buildingVisualGeometry,
    this.buildingVisualMaterial,
    totalBuildableCapacity(),
  );
  private readonly hpVisuals = new THREE.InstancedMesh(
    this.buildingVisualGeometry,
    this.hpVisualMaterial,
    totalBuildableCapacity() * 2,
  );
  private readonly repairRing = new THREE.Mesh(
    new THREE.RingGeometry(0.78, 0.92, 48),
    new THREE.MeshBasicMaterial({
      color: repairColor,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  private readonly repairRingIndexCount: number;
  private readonly assayOfficeMaterial = new THREE.MeshStandardMaterial({
    color: '#f5e6c8',
    emissive: '#7a5132',
    emissiveIntensity: 0.18,
    roughness: 0.82,
    metalness: 0.03,
  });
  private readonly assayRoofMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#7a5132',
    emissiveIntensity: 0.24,
    roughness: 0.72,
    metalness: 0.12,
  });
  private selectedId: BuildableId = 'sentry_beacon';
  private ghostRotationSteps = 0;
  private beaconFireRateMult = 1;
  private turretDamageMult = 1;
  private pointerReady = false;
  private pointerClientX = 0;
  private pointerClientY = 0;
  private mode = false;
  private valid = false;
  private currentAt = 0;
  private visualDirty = true;
  private activeHpBars = 0;
  private activeRuins = 0;
  private activeRepairId: BuildableId | null = null;
  private activeRepairIndex = -1;
  private activeRepairBlocked = false;
  private tierUpgrades = 0;
  private repairs = 0;
  private repairGold = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: THREE.Camera,
    private readonly economy: Economy,
    private readonly combat: CombatSystem,
    private readonly targeting: TargetingSystem,
    private readonly heroPosition: THREE.Vector3,
    private readonly getWave: () => number = () => 0,
    private readonly onFloatText?: (position: THREE.Vector3, text: string, color: string) => void,
  ) {
    this.group.name = 'BuildSystem';
    this.group.add(
      this.beacons.group,
      this.palisades.group,
      this.sluices.group,
      this.stockpiles.group,
      this.turrets.group,
      this.assayOffice,
      this.buildingVisuals,
      this.hpVisuals,
      this.repairRing,
      this.ghost,
    );
    this.createAssayOffice();
    this.createGhost();
    this.createBuildingTargets();
    this.combat.registerBuildingDamageResolver((target, amount) => this.resolveBuildingDamage(target, amount));
    this.repairRing.rotation.x = -Math.PI / 2;
    this.repairRing.renderOrder = RenderLayers.groundDecals;
    this.repairRing.visible = false;
    this.repairRingIndexCount = this.repairRing.geometry.index?.count ?? this.repairRing.geometry.attributes.position.count;
    this.repairRing.geometry.setDrawRange(0, 0);
    this.buildingVisuals.frustumCulled = false;
    this.buildingVisuals.renderOrder = RenderLayers.groundDecals;
    this.buildingVisuals.visible = false;
    this.hpVisuals.frustumCulled = false;
    this.hpVisuals.renderOrder = RenderLayers.worldUi;
    this.hpVisuals.visible = false;
    for (let i = 0; i < totalBuildableCapacity(); i += 1) {
      this.buildingVisuals.setMatrixAt(i, hiddenMatrix);
      this.buildingVisuals.setColorAt(i, rubbleColor);
    }
    for (let i = 0; i < totalBuildableCapacity() * 2; i += 1) {
      this.hpVisuals.setMatrixAt(i, hiddenMatrix);
      this.hpVisuals.setColorAt(i, hpBackingColor);
    }
    this.buildingVisuals.instanceMatrix.needsUpdate = true;
    if (this.buildingVisuals.instanceColor) this.buildingVisuals.instanceColor.needsUpdate = true;
    this.hpVisuals.instanceMatrix.needsUpdate = true;
    if (this.hpVisuals.instanceColor) this.hpVisuals.instanceColor.needsUpdate = true;
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
        blurb: def.blurb,
        cost,
        count,
        maxCount: def.maxCount,
        canAfford: this.economy.gold >= cost && count < def.maxCount,
        selected: def.id === this.selectedId,
        iconSlot: def.iconSlot,
        portraitSlug: def.portraitSlug,
      };
    });
  }

  get buildableCounts(): Array<{ id: BuildableId; count: number }> {
    return buildableDefs.map((def) => ({ id: def.id, count: this.countFor(def.id) }));
  }

  get palisadeBlockers(): readonly PalisadeBlocker[] {
    this.filteredBlockers.length = 0;
    for (let i = 0; i < this.palisades.activeBlockers.length; i += 1) {
      if (this.wrecked.palisade[i]) continue;
      const blocker = this.palisades.activeBlockers[i];
      if (blocker) this.filteredBlockers.push(blocker);
    }
    return this.filteredBlockers;
  }

  get hasAnyBuildable(): boolean {
    for (const id of buildableIds) {
      if (this.countFor(id) > 0) return true;
    }
    return false;
  }

  get ruinCount(): number {
    return this.activeRuins;
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
      turrets: this.turrets.activeCount,
      assayOffices: this.assayOfficeActive ? 1 : 0,
      beaconPositions: this.activePositions(this.beacons),
      palisadePositions: this.activePositions(this.palisades),
      sluicePositions: sluicesActive ? this.activePositions(this.sluices) : emptyPositions,
      stockpilePositions: stockpilesActive ? this.activePositions(this.stockpiles) : emptyPositions,
      turretPositions: this.activePositions(this.turrets),
      assayOfficePositions: this.assayOfficeActive ? [{ x: this.assayOfficePosition.x, z: this.assayOfficePosition.z }] : emptyPositions,
      buildables: this.buildableCounts,
      sluicesState: sluicesActive ? this.sluiceSnapshots() : emptySluiceSnapshots,
      stockpilesState: stockpilesActive ? this.stockpileSnapshots() : emptyStockpileSnapshots,
      pileStep: this.stockpiles.maxPileStep,
      nextCost: this.nextCost,
      hp: this.hpDiagnostics(),
      ruins: this.activeRuins,
      hpBars: this.activeHpBars,
      hpBarsVisible: this.activeHpBars > 0,
      hpBarDetails: this.hpBarDiagnostics(),
      repair: {
        active: this.activeRepairId !== null,
        id: this.activeRepairId,
        index: this.activeRepairIndex,
        progress: this.activeRepairId ? this.repairProgress[this.activeRepairId][this.activeRepairIndex] ?? 0 : 0,
        blocked: this.activeRepairBlocked,
      },
      shooterRegistrations: this.shooterHandles.length,
      turretPulses: this.turrets.pulseCount,
      activeTurretPulses: this.turrets.activePulseCount,
      tierUpgrades: this.tierUpgrades,
      repairs: this.repairs,
      repairGold: this.repairGold,
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
    this.turrets.update(at);
    this.sluices.update(
      delta,
      at,
      enemies,
      this.economy,
      onSluiceGold,
      onBankFull,
      (index) => !this.wrecked.sluice[index],
      (index) => this.effectiveSluicePanRateMult(index),
      (index) => this.effectiveSluiceYieldPerCycle(index),
    );
    this.stockpiles.update(this.economy.gold, this.economy.bankCap);
    this.updateRepairs(delta, at);
    this.updateBuildingVisuals(at);
    if (!this.mode) return;
    this.updateGhostPosition();
    this.valid = this.computeValid();
    this.ghost.position.set(
      this.ghostPos.x,
      this.visualYFor(this.selectedId, this.ghostPos, this.ghostRotationSteps),
      this.ghostPos.z,
    );
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
    this.finishPlacement(def.id, placed, cost);
    this.valid = this.computeValid();
    return true;
  }

  placeFree(id: BuildableId, position: { x: number; z: number }, rotationSteps = 0): boolean {
    const def = getBuildableDef(id);
    if (!def || this.countFor(def.id) >= def.maxCount) return false;

    const previousRotation = this.ghostRotationSteps;
    this.ghostRotationSteps = ((Math.round(rotationSteps) % 4) + 4) % 4;
    const target = new THREE.Vector3(position.x, 0, position.z);
    this.snap(target);
    const ok = this.matchesPlacement(def, target) && !this.overlapsExisting(def.id, target);
    const placed = ok ? this.place(def.id, target) : -1;
    if (placed >= 0) this.finishPlacement(def.id, placed, 0);
    this.ghostRotationSteps = previousRotation;
    this.syncGhostShape();
    return placed >= 0;
  }

  reset(): void {
    for (const id of buildableIds) {
      for (let i = 0; i < this.unregisterShooters[id].length; i += 1) this.unregisterShooter(id, i);
      for (let i = 0; i < this.hp[id].length; i += 1) {
        this.hp[id][i] = 0;
        this.hpMax[id][i] = 0;
        this.tier[id][i] = 0;
        this.buildCosts[id][i] = 0;
        this.wrecked[id][i] = false;
        this.repairProgress[id][i] = 0;
        this.repairNeedGoldShown[id][i] = false;
        const target = this.targets[id][i];
        if (target) {
          target.active = false;
          target.hp = 0;
        }
      }
    }
    this.shooterHandles.length = 0;
    this.beaconFireRateMult = 1;
    this.turretDamageMult = 1;
    this.targeting.clearBuildings();
    this.beacons.reset();
    this.palisades.reset();
    this.sluices.reset();
    this.turrets.reset();
    for (let i = 0; i < this.stockpiles.capacity; i += 1) this.economy.removeCapSource(stockpileCapSource(i));
    this.stockpiles.reset();
    this.assayOfficeActive = false;
    this.assayOffice.visible = false;
    this.assayOfficePosition.set(0, 0, 0);
    this.selectedId = 'sentry_beacon';
    this.ghostRotationSteps = 0;
    this.syncGhostShape();
    this.setBuildMode(false);
    this.activeRepairId = null;
    this.activeRepairIndex = -1;
    this.activeRepairBlocked = false;
    this.activeHpBars = 0;
    this.activeRuins = 0;
    this.tierUpgrades = 0;
    this.repairs = 0;
    this.repairGold = 0;
    this.repairRing.visible = false;
    this.repairRing.geometry.setDrawRange(0, 0);
    this.hideAllBuildingVisuals();
  }

  applyStats(beaconFireRateMult: number, turretDamageMult = 1): void {
    this.beaconFireRateMult = beaconFireRateMult;
    this.turretDamageMult = Math.max(0.1, turretDamageMult);
    for (const id of buildableIds) {
      for (let index = 0; index < this.shooterByInstance[id].length; index += 1) {
        this.refreshShooterStats(id, index);
      }
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
    this.turrets.dispose();
    this.ghost.traverse((child) => {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
    });
    this.ghostMaterial.dispose();
    this.buildingVisualGeometry.dispose();
    this.buildingVisualMaterial.dispose();
    this.hpVisualMaterial.dispose();
    this.repairRing.geometry.dispose();
    this.repairRing.material.dispose();
    this.assayOffice.traverse((child) => {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
    });
    this.assayOfficeMaterial.dispose();
    this.assayRoofMaterial.dispose();
  }

  buildingTarget(id: BuildableId, index: number): BuildingTarget | null {
    return this.targets[id][index] ?? null;
  }

  assayOfficeInRange(position: THREE.Vector3, radius = Balance.assayOffice.interactRadius): boolean {
    if (!this.assayOfficeActive || this.wrecked.assay_office[0]) return false;
    const dx = this.assayOfficePosition.x - position.x;
    const dz = this.assayOfficePosition.z - position.z;
    return dx * dx + dz * dz <= radius * radius;
  }

  nearestBuildingTo(position: THREE.Vector3, radius = Balance.demolish.interactRadius): DemolishCandidate | null {
    let best: DemolishCandidate | null = null;
    let bestDistanceSq = radius * radius;
    for (const id of buildableIds) {
      const def = getBuildableDef(id);
      for (let index = 0; index < this.hp[id].length; index += 1) {
        if (!this.isSlotActive(id, index)) continue;
        const buildingPosition = this.positionFor(id, index);
        if (!buildingPosition) continue;
        const dx = buildingPosition.x - position.x;
        const dz = buildingPosition.z - position.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq <= bestDistanceSq) {
          bestDistanceSq = distanceSq;
          best = {
            id,
            index,
            displayName: def?.displayName ?? id,
            invested: this.buildCosts[id][index] ?? 0,
            refund: this.demolishRefund(id, index),
            position: { x: buildingPosition.x, z: buildingPosition.z },
          };
        }
      }
    }
    return best;
  }

  nearestUpgradeableTo(position: THREE.Vector3, radius = Balance.demolish.interactRadius): UpgradeCandidate | null {
    let best: UpgradeCandidate | null = null;
    let bestDistanceSq = radius * radius;
    for (const id of upgradeableBuildableIds) {
      for (let index = 0; index < this.hp[id].length; index += 1) {
        if (!this.isSlotActive(id, index)) continue;
        const buildingPosition = this.positionFor(id, index);
        if (!buildingPosition) continue;
        const dx = buildingPosition.x - position.x;
        const dz = buildingPosition.z - position.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq <= bestDistanceSq) {
          const candidate = this.upgradeCandidate(id, index, buildingPosition);
          if (!candidate) continue;
          bestDistanceSq = distanceSq;
          best = candidate;
        }
      }
    }
    return best;
  }

  upgradeCandidateFor(id: BuildableId, index: number): UpgradeCandidate | null {
    if (!isUpgradeableBuildable(id) || !this.isSlotActive(id, index)) return null;
    const buildingPosition = this.positionFor(id, index);
    return buildingPosition ? this.upgradeCandidate(id, index, buildingPosition) : null;
  }

  upgradeBuilding(
    id: BuildableId,
    index: number,
    at: number,
    position: THREE.Vector3 = this.heroPosition,
    radius = Balance.demolish.interactRadius,
  ): boolean {
    if (!isUpgradeableBuildable(id) || !this.isSlotActive(id, index) || this.wrecked[id][index]) return false;
    const buildingPosition = this.positionFor(id, index);
    if (!buildingPosition) return false;
    const dx = buildingPosition.x - position.x;
    const dz = buildingPosition.z - position.z;
    if (dx * dx + dz * dz > radius * radius) return false;

    const candidate = this.upgradeCandidate(id, index, buildingPosition);
    if (!candidate?.canUpgrade || candidate.nextTier === null) return false;

    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_spent',
      sink: upgradeSink(id),
      amount: candidate.cost,
    });
    if (!result.ok) return false;

    this.tier[id][index] = candidate.nextTier;
    this.buildCosts[id][index] = (this.buildCosts[id][index] ?? 0) + candidate.cost;
    if (id === 'palisade') this.hp[id][index] = this.maxHpForInstance(id, index);
    this.syncBuildingTarget(id, index, true);
    this.syncTierVisual(id, index);
    this.refreshShooterStats(id, index);
    this.tierUpgrades += 1;
    this.visualDirty = true;
    this.onFloatText?.(buildingPosition, this.upgradeFloatText(id, candidate.nextTier), '#5b8a8a');
    return true;
  }

  demolish(
    id: BuildableId,
    index: number,
    at: number,
    position: THREE.Vector3 = this.heroPosition,
    radius = Balance.demolish.interactRadius,
  ): boolean {
    if (!this.isSlotActive(id, index)) return false;
    const buildingPosition = this.positionFor(id, index);
    if (!buildingPosition) return false;
    const dx = buildingPosition.x - position.x;
    const dz = buildingPosition.z - position.z;
    if (dx * dx + dz * dz > radius * radius) return false;

    const buildCost = this.buildCosts[id][index] ?? 0;
    const refund = this.demolishRefund(id, index);
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_granted',
      source: 'demolish',
      amount: refund,
      buildCost,
    });
    if (!result.ok) return false;

    this.teardownBuilding(id, index);
    this.clearBuildingState(id, index);
    if (!this.deactivateSlot(id, index)) return false;
    if (this.activeRepairId === id && this.activeRepairIndex === index) {
      this.activeRepairId = null;
      this.activeRepairIndex = -1;
      this.activeRepairBlocked = false;
      this.repairRing.visible = false;
      this.repairRing.geometry.setDrawRange(0, 0);
    }
    if (refund > 0) this.onFloatText?.(buildingPosition, `+${refund}`, '#c4883a');
    this.visualDirty = true;
    return true;
  }

  remainingHp(id: BuildableId, index: number): number {
    return this.hp[id][index] ?? 0;
  }

  resolveBuildingDamage(target: BuildingTarget, amount: number): BuildingDamageResult {
    const id = target.family as BuildableId;
    const index = target.index;
    const maxHp = this.maxHpForInstance(id, index);
    if (!target.active || this.wrecked[id][index] || maxHp <= 0) {
      return { applied: false, family: id, index, hp: this.hp[id][index] ?? 0, maxHp, wrecked: false };
    }

    const nextHp = Math.max(0, (this.hp[id][index] ?? maxHp) - Math.max(0, amount));
    this.hp[id][index] = nextHp;
    target.hp = nextHp;
    const wrecked = nextHp <= 0;
    if (wrecked) this.wreck(id, index);
    this.visualDirty = true;
    return { applied: true, family: id, index, hp: nextHp, maxHp, wrecked };
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
    const placeRadius = this.placeRadius(def.id);
    if (dx * dx + dz * dz > placeRadius * placeRadius) return false;
    return !this.overlapsExisting(def.id, this.ghostPos);
  }

  private matchesPlacement(def: BuildableDef, position: THREE.Vector3): boolean {
    if (def.placement === 'any') return Terrain.sample(position.x, position.z).walkable;
    if (def.placement === 'bank') return Terrain.isBuildable(position.x, position.z);
    return this.isWaterSourceAdjacent(position);
  }

  private isWaterSourceAdjacent(position: THREE.Vector3): boolean {
    return Terrain.isWaterSourceAdjacent(position.x, position.z, Balance.sluice.riverPad);
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
    for (let i = 0; i < this.turrets.capacity; i += 1) {
      if (!this.turrets.isActive(i)) continue;
      const pos = this.turrets.allPositions[i];
      if (pos && this.overlapsBuildable(id, position, this.ghostRotationSteps, 'turret', pos, 0)) return true;
    }
    if (this.assayOfficeActive && this.overlapsBuildable(id, position, this.ghostRotationSteps, 'assay_office', this.assayOfficePosition, 0)) {
      return true;
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
    if (id === 'palisade') return Balance.palisade.overlapRadius;
    if (id === 'turret') return Balance.turret.overlapRadius;
    return Balance.beacon.overlapRadius;
  }

  private placeRadius(id: BuildableId): number {
    return id === 'turret' ? Balance.turret.placeRadius : Balance.beacon.placeRadius;
  }

  private footprintHalfExtents(id: BuildableId, rotationSteps = 0): { x: number; z: number } {
    const footprint = this.footprint(getBuildableDef(id), rotationSteps);
    return { x: footprint.w / 2, z: footprint.d / 2 };
  }

  private footprint(def: BuildableDef | undefined, rotationSteps = 0): { w: number; d: number } {
    const footprint = def?.footprint ?? { w: 1, d: 1 };
    return rotationSteps % 2 === 1 ? { w: footprint.d, d: footprint.w } : footprint;
  }

  private visualYFor(id: BuildableId, position: THREE.Vector3, rotationSteps = 0, base = 0): number {
    const half = this.footprintHalfExtents(id, rotationSteps);
    return Terrain.visualY(position.x, position.z, base, Math.max(half.x, half.z));
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
    if (id === 'turret') return this.turrets.activeCount;
    if (id === 'assay_office') return this.assayOfficeActive ? 1 : 0;
    return this.beacons.activeCount;
  }

  private place(id: BuildableId, position: THREE.Vector3): number {
    if (id === 'palisade') return this.palisades.place(position, this.ghostRotationSteps);
    if (id === 'sluice') return this.sluices.place(position);
    if (id === 'stockpile') return this.stockpiles.place(position);
    if (id === 'turret') return this.turrets.place(position);
    if (id === 'assay_office') return this.placeAssayOffice(position);
    return this.beacons.place(position);
  }

  private isSlotActive(id: BuildableId, index: number): boolean {
    if (id === 'assay_office') return index === 0 && this.assayOfficeActive;
    if (id === 'palisade') return this.palisades.isActive(index);
    if (id === 'sluice') return this.sluices.isActive(index);
    if (id === 'stockpile') return this.stockpiles.isActive(index);
    if (id === 'turret') return this.turrets.isActive(index);
    return this.beacons.isActive(index);
  }

  private deactivateSlot(id: BuildableId, index: number): boolean {
    if (id === 'assay_office') {
      if (index !== 0 || !this.assayOfficeActive) return false;
      this.assayOfficeActive = false;
      this.assayOffice.visible = false;
      return true;
    }
    if (id === 'palisade') return this.palisades.deactivate(index);
    if (id === 'sluice') return this.sluices.deactivate(index);
    if (id === 'stockpile') return this.stockpiles.deactivate(index);
    if (id === 'turret') return this.turrets.deactivate(index);
    return this.beacons.deactivate(index);
  }

  private finishPlacement(id: BuildableId, index: number, cost: number): void {
    const maxHp = this.maxHpForPlacement(id);
    this.tier[id][index] = 1;
    this.hpMax[id][index] = maxHp;
    this.buildCosts[id][index] = cost;
    this.hp[id][index] = maxHp;
    this.wrecked[id][index] = false;
    this.repairProgress[id][index] = 0;
    this.repairNeedGoldShown[id][index] = false;
    this.syncBuildingTarget(id, index, true);
    if (id === 'sentry_beacon') this.registerBeaconShooter(index);
    if (id === 'turret') this.registerTurretShooter(index);
    if (id === 'stockpile') this.economy.addCapSource(stockpileCapSource(index), Balance.stockpile.capBonus);
    this.syncTierVisual(id, index);
    this.visualDirty = true;
  }

  private wreck(id: BuildableId, index: number): void {
    if (this.wrecked[id][index]) return;
    this.wrecked[id][index] = true;
    this.teardownBuilding(id, index);
  }

  private teardownBuilding(id: BuildableId, index: number): void {
    this.repairProgress[id][index] = 0;
    this.repairNeedGoldShown[id][index] = false;
    this.syncBuildingTarget(id, index, false);
    this.unregisterShooter(id, index);
    if (id === 'stockpile') this.economy.removeCapSource(stockpileCapSource(index));
    this.visualDirty = true;
  }

  private clearBuildingState(id: BuildableId, index: number): void {
    this.hp[id][index] = 0;
    this.hpMax[id][index] = 0;
    this.tier[id][index] = 0;
    this.buildCosts[id][index] = 0;
    this.wrecked[id][index] = false;
    this.repairProgress[id][index] = 0;
    this.repairNeedGoldShown[id][index] = false;
  }

  private repair(id: BuildableId, index: number): void {
    const maxHp = this.maxHpForInstance(id, index);
    this.hp[id][index] = maxHp;
    this.wrecked[id][index] = false;
    this.repairProgress[id][index] = 0;
    this.repairNeedGoldShown[id][index] = false;
    this.syncBuildingTarget(id, index, true);
    if (id === 'sentry_beacon') this.registerBeaconShooter(index);
    if (id === 'turret') this.registerTurretShooter(index);
    if (id === 'stockpile') this.economy.addCapSource(stockpileCapSource(index), Balance.stockpile.capBonus);
    this.syncTierVisual(id, index);
    this.visualDirty = true;
  }

  private selectedDef(): BuildableDef {
    return getBuildableDef(this.selectedId) ?? buildableDefs[0];
  }

  private activePositions(
    pool: SentryBeaconPool | PalisadePool | SluicePool | StockpilePool | TurretPool,
  ): Array<{ x: number; z: number }> {
    return pool.allPositions
      .map((pos, i) => ({ x: pos.x, z: pos.z, active: pool.isActive(i) }))
      .filter((entry) => entry.active)
      .map(({ x, z }) => ({ x, z }));
  }

  private createBuildingTargets(): void {
    for (const id of buildableIds) {
      for (let i = 0; i < this.targets[id].length; i += 1) {
        const target = this.targets[id][i];
        if (target) this.targeting.registerBuilding(target);
      }
    }
  }

  private syncBuildingTarget(id: BuildableId, index: number, active: boolean): void {
    const target = this.targets[id][index];
    const position = this.positionFor(id, index);
    if (!target || !position) return;
    target.position.set(position.x, this.visualYFor(id, position, id === 'palisade' ? this.palisades.rotationStepsAt(index) : 0), position.z);
    const half = this.footprintHalfExtents(id, id === 'palisade' ? this.palisades.rotationStepsAt(index) : 0);
    target.halfX = half.x;
    target.halfZ = half.z;
    target.active = active;
    target.hp = this.hp[id][index] ?? 0;
    target.maxHp = this.maxHpForInstance(id, index);
    target.reachRadius = Math.max(half.x, half.z);
    this.targeting.registerBuilding(target);
  }

  private positionFor(id: BuildableId, index: number): THREE.Vector3 | undefined {
    if (id === 'assay_office') return index === 0 && this.assayOfficeActive ? this.assayOfficePosition : undefined;
    if (id === 'palisade') return this.palisades.allPositions[index];
    if (id === 'sluice') return this.sluices.allPositions[index];
    if (id === 'stockpile') return this.stockpiles.allPositions[index];
    if (id === 'turret') return this.turrets.allPositions[index];
    return this.beacons.allPositions[index];
  }

  private maxHpForInstance(id: BuildableId, index: number): number {
    return this.effectiveMaxHp(id, index, this.hpMax[id][index] || this.maxHpForPlacement(id));
  }

  private maxHpForPlacement(id: BuildableId): number {
    const base = Balance.wreck.hp[id];
    const scale = Balance.wreck.hpWaveScale[id as keyof typeof Balance.wreck.hpWaveScale];
    if (!scale) return base;

    const wave = Math.max(0, Math.floor(this.getWave()));
    const steps = Math.max(0, wave - Math.max(0, Math.floor(scale.startWave)) + 1);
    const scaled = base + steps * Math.max(0, scale.perWave);
    return Math.round(Math.min(base * Math.max(1, scale.capMult), scaled));
  }

  private hpDiagnostics(): BuildDiagnostics['hp'] {
    const entries: BuildDiagnostics['hp'] = [];
    for (const id of buildableIds) {
      for (let index = 0; index < this.hp[id].length; index += 1) {
        const hp = this.hp[id][index] ?? 0;
        const wrecked = this.wrecked[id][index] === true;
        if (hp <= 0 && !wrecked) continue;
        const position = this.positionFor(id, index);
        const maxHp = this.maxHpForInstance(id, index);
        entries.push({
          id,
          index,
          tier: this.tierFor(id, index),
          hp,
          maxHp,
          wrecked,
          worn: id === 'palisade' && this.palisades.isWorn(index),
          effectiveDamage: id === 'turret' ? this.effectiveTurretDamage(index) : undefined,
          effectiveFireRate: id === 'turret' ? this.effectiveTurretFireRate(index) : undefined,
          panRateMult: id === 'sluice' ? this.effectiveSluicePanRateMult(index) : undefined,
          yieldPerCycle: id === 'sluice' ? this.effectiveSluiceYieldPerCycle(index) : undefined,
          repairProgress: this.repairProgress[id][index] ?? 0,
          position: { x: position?.x ?? 0, z: position?.z ?? 0 },
        });
      }
    }
    return entries;
  }

  private hpBarDiagnostics(): BuildDiagnostics['hpBarDetails'] {
    const entries: BuildDiagnostics['hpBarDetails'] = [];
    for (const id of buildableIds) {
      for (let index = 0; index < this.hp[id].length; index += 1) {
        const hp = this.hp[id][index] ?? 0;
        const maxHp = this.maxHpForInstance(id, index);
        if (hp <= 0 || maxHp <= 0 || hp >= maxHp || this.wrecked[id][index]) continue;
        const ratio = THREE.MathUtils.clamp(hp / maxHp, 0, 1);
        entries.push({
          id,
          index,
          visible: true,
          ratio: Number(ratio.toFixed(3)),
          color: this.hpBarColorName(ratio),
          rotationSteps: this.hpBarRotationSteps(id, index),
          yaw: Number(this.hpBarYaw(id, index).toFixed(3)),
        });
      }
    }
    return entries;
  }

  private sluiceSnapshots(): SluiceSnapshot[] {
    const snapshots = this.sluices.snapshot();
    for (let i = 0; i < snapshots.length; i += 1) {
      const snapshot = snapshots[i];
      if (snapshot && this.wrecked.sluice[i]) snapshot.active = false;
    }
    return snapshots;
  }

  private stockpileSnapshots(): StockpileSnapshot[] {
    const snapshots = this.stockpiles.snapshot();
    for (let i = 0; i < snapshots.length; i += 1) {
      const snapshot = snapshots[i];
      if (snapshot && this.wrecked.stockpile[i]) snapshot.active = false;
    }
    return snapshots;
  }

  private upgradeCandidate(id: UpgradeableBuildableId, index: number, position: THREE.Vector3): UpgradeCandidate | null {
    if (this.wrecked[id][index]) return null;
    const def = getBuildableDef(id);
    const tier = this.tierFor(id, index);
    const maxTier = Balance.tiers[id].length;
    const nextTier = tier < maxTier ? tier + 1 : null;
    const cost = nextTier === null ? 0 : (Balance.tiers[id][nextTier - 1]?.cost ?? 0);
    let reason: UpgradeCandidate['reason'] = 'ready';
    if (nextTier === null) reason = 'max';
    else if (!tierUnlockAllowed(id, nextTier)) reason = 'gated';
    else if (this.economy.gold < cost) reason = 'insufficient_gold';
    return {
      id,
      index,
      displayName: def?.displayName ?? id,
      tier,
      maxTier,
      nextTier,
      cost,
      canUpgrade: reason === 'ready',
      reason,
      gain: nextTier === null ? 'the frontier crew has no higher pattern yet' : this.tierGain(id, nextTier),
      position: { x: position.x, z: position.z },
    };
  }

  private tierFor(id: BuildableId, index: number): number {
    return Math.max(1, Math.floor(this.tier[id][index] || 1));
  }

  private tierRung(id: BuildableId, index: number): TierRung | null {
    if (!isUpgradeableBuildable(id)) return null;
    return Balance.tiers[id][this.tierFor(id, index) - 1] ?? Balance.tiers[id][0] ?? null;
  }

  private effectiveStat(id: BuildableId, index: number, base: number, stat: TierStat): number {
    const value = (this.tierRung(id, index) as Partial<Record<TierStat, number>> | null)?.[stat];
    return base * (typeof value === 'number' ? value : 1);
  }

  private effectiveMaxHp(id: BuildableId, index: number, base: number): number {
    return Math.round(this.effectiveStat(id, index, base, 'maxHpMult'));
  }

  private effectiveSluicePanRateMult(index: number): number {
    return this.effectiveStat('sluice', index, 1, 'panRateMult');
  }

  private effectiveSluiceYieldPerCycle(index: number): number {
    return Math.max(1, Math.round(this.effectiveStat('sluice', index, Balance.sluice.goldPerCycle, 'yieldMult')));
  }

  private effectiveTurretDamage(index: number): number {
    return this.effectiveStat('turret', index, Balance.turret.damage, 'damageMult') * this.turretDamageMult;
  }

  private effectiveTurretFireRate(index: number): number {
    return this.effectiveStat('turret', index, Balance.turret.fireRate, 'fireRateMult');
  }

  private syncTierVisual(id: BuildableId, index: number): void {
    const tier = this.tierFor(id, index);
    if (id === 'palisade') this.palisades.setTier(index, tier);
    if (id === 'sluice') {
      this.sluices.setTier(index, tier);
      this.sluices.setPanRateMult(index, this.effectiveSluicePanRateMult(index));
      this.sluices.setYieldPerCycle(index, this.effectiveSluiceYieldPerCycle(index));
    }
    if (id === 'turret') this.turrets.setTier(index, tier);
  }

  private tierGain(id: UpgradeableBuildableId, tier: number): string {
    if (id === 'palisade') return tier === 2 ? 'timber that holds longer' : 'brass bands and teal braces';
    if (id === 'sluice') return tier === 2 ? 'richer pan-outs and quicker water' : 'a brighter agent-flow channel';
    return tier === 2 ? 'a stronger brass cadence' : 'a steadier teal signal';
  }

  private upgradeFloatText(id: UpgradeableBuildableId, tier: number): string {
    const suffix = ['', 'I', 'II', 'III'][tier] ?? String(tier);
    if (id === 'sluice') return `Sluice ${suffix} - the works run richer`;
    if (id === 'palisade') return `Palisade ${suffix} - timber holds longer`;
    return `Turret ${suffix} - brass cadence quickens`;
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
    this.registerShooter('sentry_beacon', placed, handle);
  }

  private registerTurretShooter(placed: number): void {
    const handle: ShooterHandle = {
      id: 'turrets',
      getPos: () => this.shooterPos.copy(this.turrets.allPositions[placed] ?? this.ghostPos),
      range: Balance.turret.range,
      cooldown: 1 / this.effectiveTurretFireRate(placed),
      damage: this.effectiveTurretDamage(placed),
      getDamage: () => this.effectiveTurretDamage(placed),
      onFire: (at) => this.turrets.pulse(placed, at),
      projSpeed: Balance.turret.boltSpeed,
      volley: Balance.turret.volley,
      projectileKind: (origin, _target, targetPoint) => (this.firingLineCrossesPalisade(origin, targetPoint) ? 'lob' : 'bolt'),
      airTime: (origin, targetPoint) =>
        Math.max(
          Balance.projectile.turretLobMinAirTime,
          Math.hypot(targetPoint.x - origin.x, targetPoint.z - origin.z) / Math.max(0.001, Balance.turret.boltSpeed),
        ),
      aoe: {
        radius: Balance.sparkRig.boltRadius + Balance.enemy.touchRadius,
        airTime: Balance.projectile.turretLobMinAirTime,
      },
    };
    this.registerShooter('turret', placed, handle);
  }

  private refreshShooterStats(id: BuildableId, index: number): void {
    const handle = this.shooterByInstance[id][index];
    if (!handle) return;
    if (id === 'sentry_beacon') {
      handle.cooldown = 1 / (Balance.beacon.fireRate * this.beaconFireRateMult);
      handle.damage = Balance.beacon.damage;
      return;
    }
    if (id === 'turret') {
      handle.cooldown = 1 / this.effectiveTurretFireRate(index);
      handle.damage = this.effectiveTurretDamage(index);
    }
  }

  private registerShooter(id: BuildableId, index: number, handle: ShooterHandle): void {
    this.unregisterShooter(id, index);
    this.shooterByInstance[id][index] = handle;
    this.shooterHandles.push(handle);
    this.unregisterShooters[id][index] = this.combat.registerShooter(handle);
  }

  private unregisterShooter(id: BuildableId, index: number): void {
    const unregister = this.unregisterShooters[id][index];
    if (unregister) unregister();
    this.unregisterShooters[id][index] = undefined;
    const handle = this.shooterByInstance[id][index];
    this.shooterByInstance[id][index] = undefined;
    if (!handle) return;
    const handleIndex = this.shooterHandles.indexOf(handle);
    if (handleIndex >= 0) this.shooterHandles.splice(handleIndex, 1);
  }

  private updateRepairs(delta: number, at: number): void {
    let bestId: BuildableId | null = null;
    let bestIndex = -1;
    let bestDistanceSq = Balance.wreck.repairRadius * Balance.wreck.repairRadius;

    for (const id of buildableIds) {
      for (let i = 0; i < this.wrecked[id].length; i += 1) {
        const maxHp = this.maxHpForInstance(id, i);
        const hp = this.hp[id][i] ?? 0;
        if (maxHp <= 0 || (!this.wrecked[id][i] && (hp <= 0 || hp >= maxHp))) {
          this.repairProgress[id][i] = 0;
          continue;
        }
        const position = this.positionFor(id, i);
        if (!position) continue;
        const dx = position.x - this.heroPosition.x;
        const dz = position.z - this.heroPosition.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq <= bestDistanceSq) {
          bestId = id;
          bestIndex = i;
          bestDistanceSq = distanceSq;
        } else {
          this.repairProgress[id][i] = 0;
        }
      }
    }

    this.activeRepairId = bestId;
    this.activeRepairIndex = bestIndex;
    this.activeRepairBlocked = false;

    if (!bestId || bestIndex < 0) {
      this.repairRing.visible = false;
      this.repairRing.geometry.setDrawRange(0, 0);
      return;
    }

    const cost = this.repairCost(bestId, bestIndex);
    const position = this.positionFor(bestId, bestIndex);
    if (!position) return;

    this.repairRing.visible = true;
    this.repairRing.position.set(position.x, this.visualYFor(bestId, position, bestId === 'palisade' ? this.palisades.rotationStepsAt(bestIndex) : 0, 0.1), position.z);
    this.repairRing.rotation.y = at * 0.8;
    this.repairRing.scale.setScalar(1 + Math.sin(at * 8.5 + bestIndex) * 0.04);

    if (this.economy.gold < cost) {
      this.repairProgress[bestId][bestIndex] = 0;
      this.activeRepairBlocked = true;
      (this.repairRing.material as THREE.MeshBasicMaterial).color.copy(blockedRepairColor);
      this.repairRing.geometry.setDrawRange(0, this.repairRingIndexCount);
      if (!this.repairNeedGoldShown[bestId][bestIndex]) {
        this.onFloatText?.(position, 'Need gold!', '#a0522d');
        this.repairNeedGoldShown[bestId][bestIndex] = true;
      }
      return;
    }

    this.repairNeedGoldShown[bestId][bestIndex] = false;
    (this.repairRing.material as THREE.MeshBasicMaterial).color.copy(repairColor);
    const progress = Math.min(1, (this.repairProgress[bestId][bestIndex] ?? 0) + delta / Balance.wreck.repairSeconds);
    this.repairProgress[bestId][bestIndex] = progress;
    this.repairRing.geometry.setDrawRange(0, Math.floor(this.repairRingIndexCount * progress));
    if (progress < 1) return;

    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_spent',
      sink: repairSink(bestId),
      amount: cost,
    });
    if (!result.ok) return;
    this.onFloatText?.(position, `-${cost}`, '#a0522d');
    this.repairs += 1;
    this.repairGold += cost;
    this.repair(bestId, bestIndex);
    this.activeRepairId = null;
    this.activeRepairIndex = -1;
    this.repairRing.visible = false;
    this.repairRing.geometry.setDrawRange(0, 0);
  }

  private updateBuildingVisuals(_at: number): void {
    if (!this.visualDirty && this.activeHpBars <= 0) return;
    this.activeHpBars = 0;
    this.activeRuins = 0;

    for (const id of buildableIds) {
      for (let i = 0; i < this.hp[id].length; i += 1) {
        const baseSlot = this.visualSlot(id, i);
        const hpBackSlot = baseSlot * 2;
        const hpFillSlot = hpBackSlot + 1;
        const rubbleSlot = baseSlot;
        this.hpVisuals.setMatrixAt(hpBackSlot, hiddenMatrix);
        this.hpVisuals.setMatrixAt(hpFillSlot, hiddenMatrix);
        this.buildingVisuals.setMatrixAt(rubbleSlot, hiddenMatrix);

        const position = this.positionFor(id, i);
        const maxHp = this.maxHpForInstance(id, i);
        const hp = this.hp[id][i] ?? 0;
        if (id === 'palisade') this.palisades.setWear(i, position !== undefined && !this.wrecked[id][i] && maxHp > 0 && hp / maxHp < 0.5);
        if (!position || hp <= 0 || maxHp <= 0) {
          if (this.wrecked[id][i] && position) {
            this.syncRubble(rubbleSlot, id, i, position);
            this.activeRuins += 1;
          }
          continue;
        }

        if (this.wrecked[id][i]) {
          this.syncRubble(rubbleSlot, id, i, position);
          this.activeRuins += 1;
        } else if (hp < maxHp) {
          this.syncHpBar(hpBackSlot, hpFillSlot, id, i, position, hp / maxHp);
          this.activeHpBars += 1;
        }
      }
    }

    this.buildingVisuals.visible = this.activeRuins > 0;
    this.hpVisuals.visible = this.activeHpBars > 0;
    this.buildingVisuals.instanceMatrix.needsUpdate = true;
    if (this.buildingVisuals.instanceColor) this.buildingVisuals.instanceColor.needsUpdate = true;
    this.hpVisuals.instanceMatrix.needsUpdate = true;
    if (this.hpVisuals.instanceColor) this.hpVisuals.instanceColor.needsUpdate = true;
    this.visualDirty = false;
  }

  private syncHpBar(backSlot: number, fillSlot: number, id: BuildableId, index: number, position: THREE.Vector3, ratio: number): void {
    const safeRatio = THREE.MathUtils.clamp(ratio, 0, 1);
    const rotationSteps = this.hpBarRotationSteps(id, index);
    const yaw = this.hpBarYaw(id, index);
    const y = this.visualYFor(id, position, rotationSteps, 1.72);

    this.visualObject.position.set(position.x, y, position.z);
    this.visualObject.rotation.set(0, yaw, 0);
    this.visualObject.scale.set(hpBarWidth, hpBarHeight, hpBarDepth);
    this.visualObject.updateMatrix();
    this.hpVisuals.setMatrixAt(backSlot, this.visualObject.matrix);
    this.hpVisuals.setColorAt(backSlot, hpBackingColor);

    const fillWidth = Math.max(0.08, hpBarWidth * safeRatio);
    const leftOffset = -hpBarWidth * (1 - safeRatio) * 0.5;
    const fillHeight = hpBarHeight * 0.34;
    const fillDepth = hpBarDepth * 0.72;
    const fillLift = hpBarHeight * 0.5 + fillHeight * 0.5 + 0.004;
    // Top-mounted fill keeps fixed-orientation bars readable from either side.
    this.visualObject.position.set(
      position.x + Math.cos(yaw) * leftOffset,
      y + fillLift,
      position.z - Math.sin(yaw) * leftOffset,
    );
    this.visualObject.scale.set(fillWidth, fillHeight, fillDepth);
    this.visualObject.updateMatrix();
    this.hpVisuals.setMatrixAt(fillSlot, this.visualObject.matrix);
    this.hpVisuals.setColorAt(fillSlot, this.hpBarFillColor(safeRatio));
  }

  private syncRubble(slot: number, id: BuildableId, index: number, position: THREE.Vector3): void {
    const footprint = this.footprint(getBuildableDef(id), id === 'palisade' ? this.palisades.rotationStepsAt(index) : 0);
    this.visualObject.position.set(position.x, this.visualYFor(id, position, id === 'palisade' ? this.palisades.rotationStepsAt(index) : 0, 0.08), position.z);
    this.visualObject.rotation.set(0, id === 'palisade' ? this.palisades.rotationStepsAt(index) * (Math.PI / 2) : 0, 0);
    this.visualObject.scale.set(Math.max(0.5, footprint.w * 0.72), 0.14, Math.max(0.5, footprint.d * 0.72));
    this.visualObject.updateMatrix();
    this.buildingVisuals.setMatrixAt(slot, this.visualObject.matrix);
    this.buildingVisuals.setColorAt(slot, rubbleColor);
  }

  private hideAllBuildingVisuals(): void {
    for (let i = 0; i < totalBuildableCapacity(); i += 1) this.buildingVisuals.setMatrixAt(i, hiddenMatrix);
    for (let i = 0; i < totalBuildableCapacity() * 2; i += 1) this.hpVisuals.setMatrixAt(i, hiddenMatrix);
    this.buildingVisuals.visible = false;
    this.hpVisuals.visible = false;
    this.buildingVisuals.instanceMatrix.needsUpdate = true;
    this.hpVisuals.instanceMatrix.needsUpdate = true;
    this.visualDirty = false;
  }

  private hpBarRotationSteps(id: BuildableId, index: number): number {
    return id === 'palisade' ? this.palisades.rotationStepsAt(index) : 0;
  }

  private hpBarYaw(id: BuildableId, index: number): number {
    if (id !== 'palisade') return 0;
    return this.palisades.rotationStepsAt(index) * (Math.PI / 2) - Math.PI / 2;
  }

  private hpBarFillColor(ratio: number): THREE.Color {
    if (ratio < 0.33) return hpDangerColor;
    if (ratio < 0.66) return hpAmberColor;
    return hpInkColor;
  }

  private hpBarColorName(ratio: number): 'ink' | 'amber' | 'red' {
    if (ratio < 0.33) return 'red';
    if (ratio < 0.66) return 'amber';
    return 'ink';
  }

  private visualSlot(id: BuildableId, index: number): number {
    let offset = 0;
    for (const candidate of buildableIds) {
      if (candidate === id) return offset + index;
      offset += this.hp[candidate].length;
    }
    return index;
  }

  private repairCost(id: BuildableId, index: number): number {
    const def = getBuildableDef(id);
    const maxHp = this.maxHpForInstance(id, index);
    const hp = this.wrecked[id][index] ? 0 : (this.hp[id][index] ?? maxHp);
    const missingFraction = maxHp > 0 ? Math.max(0, maxHp - hp) / maxHp : 0;
    if (missingFraction <= 0) return 0;
    const cost = this.buildCosts[id][index] || def?.costCurve(0) || 0;
    const pct = Math.min(Balance.repair.capPctOfCost, Balance.repair.pctOfCost * missingFraction);
    return Math.ceil(cost * Math.max(0, pct));
  }

  private demolishRefund(id: BuildableId, index: number): number {
    const maxHp = this.maxHpForInstance(id, index);
    const hp = this.wrecked[id][index] ? 0 : Math.max(0, Math.min(maxHp, this.hp[id][index] ?? maxHp));
    const cost = this.baseBuildCost(id, index);
    return Math.floor(Math.max(0, Balance.demolish.refundPctOfCost * cost * (maxHp > 0 ? hp / maxHp : 0)));
  }

  private baseBuildCost(id: BuildableId, index: number): number {
    const invested = this.buildCosts[id][index] ?? 0;
    if (!isUpgradeableBuildable(id)) return invested;
    let tierSpend = 0;
    for (let tier = 2; tier <= this.tierFor(id, index); tier += 1) {
      tierSpend += Balance.tiers[id][tier - 1]?.cost ?? 0;
    }
    return Math.max(0, invested - tierSpend);
  }

  private syncGhostShape(): void {
    this.beaconGhost.visible = this.selectedId === 'sentry_beacon';
    this.palisadeGhost.visible = this.selectedId === 'palisade';
    this.sluiceGhost.visible = this.selectedId === 'sluice';
    this.stockpileGhost.visible = this.selectedId === 'stockpile';
    this.turretGhost.visible = this.selectedId === 'turret';
    this.assayOfficeGhost.visible = this.selectedId === 'assay_office';
  }

  private createGhost(): void {
    this.createBeaconGhost();
    this.createPalisadeGhost();
    this.createSluiceGhost();
    this.createStockpileGhost();
    this.createTurretGhost();
    this.createAssayOfficeGhost();
    this.ghost.add(this.beaconGhost, this.palisadeGhost, this.sluiceGhost, this.stockpileGhost, this.turretGhost, this.assayOfficeGhost);
  }

  private placeAssayOffice(position: THREE.Vector3): number {
    if (this.assayOfficeActive) return -1;
    this.assayOfficeActive = true;
    this.assayOfficePosition.copy(position);
    this.assayOffice.position.set(position.x, this.visualYFor('assay_office', position), position.z);
    this.assayOffice.visible = true;
    return 0;
  }

  private createAssayOffice(): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.1), this.assayOfficeMaterial);
    base.position.y = 0.45;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 1.28), this.assayRoofMaterial);
    roof.position.y = 0.98;
    roof.rotation.z = 0.04;
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.04), this.assayRoofMaterial);
    plaque.position.set(0, 0.62, -0.57);
    this.assayOffice.add(base, roof, plaque);
    this.assayOffice.visible = false;
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

  private createTurretGhost(): void {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.74, 10), this.ghostMaterial);
    body.position.set(0, 0.42, 0);
    this.turretGhost.add(body);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.36, 10), this.ghostMaterial);
    head.position.set(0, 0.92, 0);
    this.turretGhost.add(head);
  }

  private createAssayOfficeGhost(): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.1), this.ghostMaterial);
    base.position.y = 0.45;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 1.28), this.ghostMaterial);
    roof.position.y = 0.98;
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.04), this.ghostMaterial);
    plaque.position.set(0, 0.62, -0.57);
    this.assayOfficeGhost.add(base, roof, plaque);
  }

  private firingLineCrossesPalisade(from: THREE.Vector3, to: THREE.Vector3): boolean {
    for (const blocker of this.palisadeBlockers) {
      if (this.segmentIntersectsBlocker(from.x, from.z, to.x, to.z, blocker)) return true;
    }
    return false;
  }

  private segmentIntersectsBlocker(ax: number, az: number, bx: number, bz: number, blocker: PalisadeBlocker): boolean {
    const minX = blocker.x - blocker.halfX;
    const maxX = blocker.x + blocker.halfX;
    const minZ = blocker.z - blocker.halfZ;
    const maxZ = blocker.z + blocker.halfZ;
    let tMin = 0;
    let tMax = 1;
    const dx = bx - ax;
    const dz = bz - az;

    if (Math.abs(dx) < 0.0001) {
      if (ax < minX || ax > maxX) return false;
    } else {
      const inv = 1 / dx;
      let t1 = (minX - ax) * inv;
      let t2 = (maxX - ax) * inv;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }

    if (Math.abs(dz) < 0.0001) {
      return az >= minZ && az <= maxZ;
    }
    const inv = 1 / dz;
    let t1 = (minZ - az) * inv;
    let t2 = (maxZ - az) * inv;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    return tMin <= tMax;
  }
}

function buildSink(id: BuildableId): BuildSink {
  return `build_${id}`;
}

function repairSink(id: BuildableId): BuildSink {
  return `repair_${id}`;
}

function upgradeSink(id: BuildableId): BuildSink {
  return `upgrade_${id}`;
}

function stockpileCapSource(index: number): string {
  return `stockpile:${index}`;
}

function isUpgradeableBuildable(id: BuildableId): id is UpgradeableBuildableId {
  return id === 'palisade' || id === 'sluice' || id === 'turret';
}

export function tierUnlockAllowed(_id: BuildableId, _tier: number): boolean {
  // TODO(SCI-03): read tier gates from families.json
  return true;
}

export function beaconCost(index: number): number {
  return registryBeaconCost(index);
}

function totalBuildableCapacity(): number {
  let total = 0;
  for (const def of buildableDefs) total += def.maxCount;
  return total;
}

function createNumberStore(): BuildingFamilyStore<number> {
  return createStore(() => 0);
}

function createBooleanStore(): BuildingFamilyStore<boolean> {
  return createStore(() => false);
}

function createFunctionStore(): BuildingFamilyStore<(() => void) | undefined> {
  return createStore(() => undefined);
}

function createShooterStore(): BuildingFamilyStore<ShooterHandle | undefined> {
  return createStore(() => undefined);
}

function createTargetStore(): BuildingFamilyStore<BuildingTarget> {
  return createStore((id, index) => ({
    id: `${id}:${index}`,
    family: id,
    index,
    position: new THREE.Vector3(),
    halfX: 0.5,
    halfZ: 0.5,
    active: false,
    hp: 0,
    maxHp: 0,
    reachRadius: 0,
  }));
}

function createStore<T>(make: (id: BuildableId, index: number) => T): BuildingFamilyStore<T> {
  return {
    sentry_beacon: createFamily('sentry_beacon', make),
    palisade: createFamily('palisade', make),
    sluice: createFamily('sluice', make),
    stockpile: createFamily('stockpile', make),
    turret: createFamily('turret', make),
    assay_office: createFamily('assay_office', make),
  };
}

function createFamily<T>(id: BuildableId, make: (id: BuildableId, index: number) => T): T[] {
  const def = getBuildableDef(id);
  return Array.from({ length: def?.maxCount ?? 0 }, (_, index) => make(id, index));
}
