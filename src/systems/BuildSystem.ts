import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { createBuildingSignFromUrlLoader, disposeBuildingSign } from '../entities/BuildingSign';
import { PalisadePool, type PalisadeBlocker } from '../entities/Palisade';
import { SentryBeaconPool } from '../entities/SentryBeacon';
import { SluicePool, type SluiceFutureState, type SluiceSnapshot } from '../entities/Sluice';
import { StockpilePool, type StockpileSnapshot } from '../entities/Stockpile';
import { BoilerHousePool } from '../entities/BoilerHouse';
import { TurretPool } from '../entities/Turret';
import { Balance } from '../game/Balance';
import {
  beaconCost as registryBeaconCost,
  buildableBlurb,
  buildableDefs,
  buildableTierEffectLine,
  getBuildableDef,
  isBuildableId,
  type BuildableDef,
  type BuildableId,
} from '../game/buildables';
import type { BuildSink, Economy } from '../game/Economy';
import type { ShooterHandle } from './CombatSystem';
import type { CombatSystem } from './CombatSystem';
import type { BuildingTarget, TargetingSystem } from './TargetingSystem';
import { RenderLayers } from '../core/RenderLayers';
import { hasElevationTile, highGroundRange, terrainLineOfSight } from '../sim/TileHeight';
import * as Terrain from '../world/Terrain';
import { matchesPlacement, overlapsExisting, type PlacementDescriptor } from './BuildPlacement';

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
  tierLine?: string;
};

export type BuildDiagnostics = {
  mode: boolean;
  selectedBuildable: BuildableId;
  ghostValid: boolean;
  ghostLight: number;
  ghostPos: { x: number; z: number };
  ghostY: number;
  ghostVisible: boolean;
  ghostRotationSteps: number;
  ghostFootprint: { w: number; d: number };
  beacons: number;
  palisades: number;
  sluices: number;
  stockpiles: number;
  boilerHouses: number;
  turrets: number;
  assayOffices: number;
  lanternPosts: number;
  capacitorBanks: number;
  beaconPositions: Array<{ x: number; z: number }>;
  palisadePositions: Array<{ x: number; z: number }>;
  sluicePositions: Array<{ x: number; z: number }>;
  stockpilePositions: Array<{ x: number; z: number }>;
  boilerHousePositions: Array<{ x: number; z: number }>;
  turretPositions: Array<{ x: number; z: number }>;
  assayOfficePositions: Array<{ x: number; z: number }>;
  lanternPostPositions: Array<{ x: number; z: number }>;
  capacitorBankPositions: Array<{ x: number; z: number }>;
  lanternPostRotations: number[];
  reservedFootprints: Array<{ id: string; x: number; z: number; halfX: number; halfZ: number }>;
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
    repairCost: number;
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
  breachSeals: number;
  lensTurrets: number;
  tierUpgrades: number;
  repairs: number;
  repairGold: number;
  shells: Record<'palisade' | 'sluice' | 'stockpile' | 'boiler_house' | 'turret' | 'assay_office', BuildingShellDiagnostics>;
};

export type PalisadeRoute = {
  blocker: BuildingTarget;
  routeId: string;
  open: boolean;
  waypoint: { x: number; z: number };
};

export type BuildingShellDiagnostics = {
  active: number;
  signs: number;
  meshes: string[];
  lit: boolean;
  wheelPhase?: number;
};

export type DemolishCandidate = {
  id: BuildableId;
  index: number;
  displayName: string;
  invested: number;
  refund: number;
  position: { x: number; z: number };
};

type FreePlacementOptions = {
  wrecked?: boolean;
  repairCost?: number;
  preplaced?: boolean;
};

export type BuildingRestoreState = {
  id: BuildableId;
  index: number;
  tier: number;
  hp: number;
  maxHp: number;
  baseMaxHp?: number;
  buildCost: number;
  repairCostOverride?: number;
  wrecked: boolean;
  repairProgress: number;
  position: { x: number; z: number };
  rotationSteps: number;
  sluice: SluiceFutureState | null;
  preplaced?: boolean;
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

export type BuildingRepairResult = {
  id: BuildableId;
  index: number;
  displayName: string;
  cost: number;
  hp: number;
  maxHp: number;
  position: { x: number; z: number };
  message: string;
};

export type ReservedFootprint = {
  id: string;
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
  active: boolean;
  blocksRouting?: boolean;
};

const validColor = new THREE.Color('#2f8f85');
const invalidColor = new THREE.Color('#8a4a2a');
const emptyPositions: Array<{ x: number; z: number }> = [];
const emptySluiceSnapshots: SluiceSnapshot[] = [];
const emptyStockpileSnapshots: StockpileSnapshot[] = [];
const buildableIds: readonly BuildableId[] = [
  'sentry_beacon',
  'palisade',
  'sluice',
  'stockpile',
  'boiler_house',
  'turret',
  'lantern_post',
  'decoy_shed',
  'capacitor_bank',
  'assay_office',
];
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
const assayOfficeSignUrlLoader = () => import('../../assets/processed/bld-claim-office.png?url').then((module) => module.default);

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
type BuildSystemSound = 'agent-works' | 'build-place' | 'demolish' | 'invalid' | 'tier-up';

export class BuildSystem {
  readonly group = new THREE.Group();

  private readonly beacons = new SentryBeaconPool();
  private readonly palisades = new PalisadePool();
  private readonly sluices = new SluicePool();
  private readonly stockpiles = new StockpilePool();
  readonly boilerHouses = new BoilerHousePool();
  private readonly turrets = new TurretPool();
  private readonly lanternPosts = new LanternPostPool();
  private readonly decoySheds = new LanternPostPool(true);
  private readonly capacitorBanks = new LanternPostPool(false, true);
  private readonly assayOffice = new THREE.Group();
  private readonly ghost = new THREE.Group();
  private readonly beaconGhost = new THREE.Group();
  private readonly palisadeGhost = new THREE.Group();
  private readonly sluiceGhost = new THREE.Group();
  private readonly stockpileGhost = new THREE.Group();
  private readonly boilerHouseGhost = new THREE.Group();
  private readonly turretGhost = new THREE.Group();
  private readonly lanternPostGhost = new THREE.Group();
  private readonly decoyShedGhost = new THREE.Group();
  private readonly capacitorBankGhost = new THREE.Group();
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
  private nightDarkness = 0;
  private nightLightSources: readonly { x: number; z: number; radius: number }[] = [];
  private ghostLight = 1;
  private readonly shooterPos = new THREE.Vector3();
  private readonly visualObject = new THREE.Object3D();
  private readonly hp = createNumberStore();
  private readonly hpMax = createNumberStore();
  private readonly tier = createNumberStore();
  private readonly buildCosts = createNumberStore();
  private readonly repairCostOverrides = createNumberStore();
  private readonly preplaced = createBooleanStore();
  private readonly wrecked = createBooleanStore();
  private readonly repairProgress = createNumberStore();
  private readonly repairNeedGoldShown = createBooleanStore();
  private readonly targets = createTargetStore();
  private readonly unregisterShooters = createFunctionStore();
  private readonly shooterByInstance = createShooterStore();
  private readonly shooterHandles: ShooterHandle[] = [];
  private readonly filteredBlockers: PalisadeBlocker[] = [];
  private readonly suspendedBuildings = new Set<string>();
  private readonly reservedFootprints: ReservedFootprint[] = [];
  private megaprojectDamageResolver: ((target: BuildingTarget, amount: number) => BuildingDamageResult) | null = null;
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
    flatShading: true,
  });
  private readonly assayRoofMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#7a5132',
    emissiveIntensity: 0.24,
    roughness: 0.72,
    metalness: 0.12,
    flatShading: true,
  });
  private readonly assayOfficeSign = createBuildingSignFromUrlLoader(assayOfficeSignUrlLoader, 1, 'AssayOfficePortraitSign');
  private selectedId: BuildableId = 'sentry_beacon';
  private ghostRotationSteps = 0;
  private beaconFireRateMult = 1;
  private turretDamageMult = 1;
  private turretPressureFireRateMult = 1;
  private e8LensTurret = false;
  private e8BreachSeals = false;
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
    private readonly onSound?: (name: BuildSystemSound, position?: THREE.Vector3) => void,
    private readonly isBuildableEnabled: (id: BuildableId) => boolean = () => true,
    private readonly onPlacementRequest?: (position: { x: number; z: number }) => boolean,
    private readonly isShooterPowered: (id: 'sentry_beacon' | 'turret', index: number, position: THREE.Vector3) => boolean = () => true,
  ) {
    this.group.name = 'BuildSystem';
    this.group.add(
      this.beacons.group,
      this.palisades.group,
      this.sluices.group,
      this.stockpiles.group,
      this.boilerHouses.group,
      this.turrets.group,
      this.lanternPosts.group,
      this.decoySheds.group,
      this.capacitorBanks.group,
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
    this.combat.registerBuildingTargetsResolver((position, radius) => this.targeting.buildingsInRadius(position, radius));
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
    return buildableDefs.filter((def) => this.isBuildableEnabled(def.id)).map((def) => {
      const count = this.countFor(def.id);
      const cost = def.costCurve(count);
      const breachSeal = def.id === 'palisade' && this.e8BreachSeals;
      const maxCount = this.maxCountFor(def);
      return {
        id: def.id,
        displayName: breachSeal ? 'Breach Seal' : def.displayName,
        blurb: breachSeal ? 'A numbered instant wall: the wall you carry.' : buildableBlurb(def),
        cost,
        count,
        maxCount,
        canAfford: this.economy.gold >= cost && count < maxCount,
        selected: def.id === this.selectedId,
        iconSlot: def.iconSlot,
        portraitSlug: def.portraitSlug,
        tierLine: buildableTierEffectLine(def.id, this.menuTierFor(def.id)),
      };
    });
  }

  get buildableCounts(): Array<{ id: BuildableId; count: number }> {
    return buildableDefs.map((def) => ({ id: def.id, count: this.countFor(def.id) }));
  }

  get palisadeBlockers(): readonly PalisadeBlocker[] {
    this.filteredBlockers.length = 0;
    for (let i = 0; i < this.palisades.activeBlockers.length; i += 1) {
      if (this.wrecked.palisade[i] || this.suspendedBuildings.has(`palisade:${i}`)) continue;
      const blocker = this.palisades.activeBlockers[i];
      if (blocker) this.filteredBlockers.push(blocker);
    }
    for (const footprint of this.reservedFootprints) {
      if (footprint.active && footprint.blocksRouting !== false) this.filteredBlockers.push(footprint);
    }
    return this.filteredBlockers;
  }

  palisadeRoute(from: THREE.Vector3, to: THREE.Vector3, clearance: number): PalisadeRoute | null {
    // ponytail: The 48-segment cap keeps this direct scan cheap; add a spatial index if that cap grows.
    let blocker: BuildingTarget | null = null;
    let hitAt = Number.POSITIVE_INFINITY;
    for (const target of this.targets.palisade) {
      if (!target?.active || target.hp <= 0) continue;
      const hit = segmentAabbHit(
        from.x,
        from.z,
        to.x,
        to.z,
        target.position.x - target.halfX - clearance,
        target.position.x + target.halfX + clearance,
        target.position.z - target.halfZ - clearance,
        target.position.z + target.halfZ + clearance,
      );
      if (hit !== null && hit < hitAt) {
        blocker = target;
        hitAt = hit;
      }
    }
    if (!blocker) return null;

    const alongX = blocker.halfX >= blocker.halfZ;
    let runMin = (alongX ? blocker.position.x - blocker.halfX : blocker.position.z - blocker.halfZ) - clearance;
    let runMax = (alongX ? blocker.position.x + blocker.halfX : blocker.position.z + blocker.halfZ) + clearance;
    let changed = true;
    while (changed) {
      changed = false;
      for (const target of this.targets.palisade) {
        if (!target?.active || target.hp <= 0 || (target.halfX >= target.halfZ) !== alongX) continue;
        const normalDistance = alongX
          ? Math.abs(target.position.z - blocker.position.z)
          : Math.abs(target.position.x - blocker.position.x);
        const normalReach = alongX
          ? target.halfZ + blocker.halfZ + 0.1
          : target.halfX + blocker.halfX + 0.1;
        if (normalDistance > normalReach) continue;
        const min = (alongX ? target.position.x - target.halfX : target.position.z - target.halfZ) - clearance;
        const max = (alongX ? target.position.x + target.halfX : target.position.z + target.halfZ) + clearance;
        if (max < runMin - 0.1 || min > runMax + 0.1) continue;
        if (min < runMin || max > runMax) {
          runMin = Math.min(runMin, min);
          runMax = Math.max(runMax, max);
          changed = true;
        }
      }
    }

    const nearNormal = alongX
      ? blocker.position.z + Math.sign(from.z - blocker.position.z || 1) * (blocker.halfZ + clearance)
      : blocker.position.x + Math.sign(from.x - blocker.position.x || 1) * (blocker.halfX + clearance);
    const component = this.palisadeComponent(blocker, clearance);
    const openingDistance = this.palisadeOpeningDistances(component, clearance);
    const endpointPad = 0.08;
    const componentCenter = component.reduce(
      (sum, target) => ({ x: sum.x + target.position.x / component.length, z: sum.z + target.position.z / component.length }),
      { x: 0, z: 0 },
    );
    const candidates = component.filter((target) => openingDistance.get(target) === 0).flatMap((step) => {
      const neighbors = palisadeNeighbors(step, component, clearance * 2 + 0.1);
      const neighbor = neighbors[0];
      const stepAlongX = neighbor
        ? Math.abs(neighbor.position.x - step.position.x) >= Math.abs(neighbor.position.z - step.position.z)
        : step.halfX >= step.halfZ;
      const signs = neighbors.length > 0
        ? neighbors.map((target) => -Math.sign((stepAlongX ? target.position.x - step.position.x : target.position.z - step.position.z) || 1))
        : [-1, 1];
      return [...new Set(signs)].flatMap((sign) => {
        const major = (stepAlongX ? step.halfX : step.halfZ) + clearance + endpointPad;
        const normal = (stepAlongX ? step.halfZ : step.halfX) + clearance + endpointPad;
        const centerDelta = stepAlongX ? step.position.z - componentCenter.z : step.position.x - componentCenter.x;
        const normalSigns = Math.abs(centerDelta) > 0.1 ? [Math.sign(centerDelta)] : [-1, 1];
        return stepAlongX
          ? normalSigns.map((normalSign) => ({ target: step, x: step.position.x + sign * major, z: step.position.z + normalSign * normal }))
          : normalSigns.map((normalSign) => ({ target: step, x: step.position.x + normalSign * normal, z: step.position.z + sign * major }));
      });
    }).filter((point) =>
      !this.pointInsidePalisade(point.x, point.z, clearance)
      && distanceSq2(point.x, point.z, from.x, from.z) > 0.4 * 0.4,
    );
    const pathLength = (point: { x: number; z: number }) =>
      Math.hypot(point.x - from.x, point.z - from.z) + Math.hypot(to.x - point.x, to.z - point.z);
    const chosen = candidates.sort((a, b) => pathLength(a) - pathLength(b) || a.target.id.localeCompare(b.target.id) || a.x - b.x || a.z - b.z)[0];
    const waypoint = chosen
      ? { x: chosen.x, z: chosen.z }
      : alongX
          ? { x: THREE.MathUtils.clamp(from.x, runMin, runMax), z: nearNormal }
          : { x: nearNormal, z: THREE.MathUtils.clamp(from.z, runMin, runMax) };
    const routeId = component.map((target) => target.id).sort().join('|');
    return { blocker, routeId, open: chosen !== undefined, waypoint };
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

  turretPosition(index: number): THREE.Vector3 | null {
    return this.turrets.isActive(index) ? (this.turrets.allPositions[index] ?? null) : null;
  }

  get nextCost(): number {
    const def = this.selectedDef();
    return def.costCurve(this.countFor(def.id));
  }

  get canAffordNext(): boolean {
    const def = this.selectedDef();
    return this.economy.gold >= this.nextCost && this.countFor(def.id) < this.maxCountFor(def);
  }

  get diagnostics(): BuildDiagnostics {
    const footprint = this.footprint(this.selectedDef(), this.ghostRotationSteps);
    const sluicesActive = this.sluices.activeCount > 0;
    const stockpilesActive = this.stockpiles.activeCount > 0;
    return {
      mode: this.mode,
      selectedBuildable: this.selectedId,
      ghostValid: this.valid,
      ghostLight: this.ghostLight,
      ghostPos: { x: this.ghostPos.x, z: this.ghostPos.z },
      ghostY: this.ghost.position.y,
      ghostVisible: this.ghost.visible,
      ghostRotationSteps: this.ghostRotationSteps,
      ghostFootprint: footprint,
      beacons: this.beaconCount,
      palisades: this.palisades.activeCount,
      sluices: this.sluices.activeCount,
      stockpiles: this.stockpiles.activeCount,
      boilerHouses: this.boilerHouses.activeCount,
      turrets: this.turrets.activeCount,
      assayOffices: this.assayOfficeActive ? 1 : 0,
      lanternPosts: this.lanternPosts.activeCount,
      capacitorBanks: this.capacitorBanks.activeCount,
      beaconPositions: this.activePositions(this.beacons),
      palisadePositions: this.activePositions(this.palisades),
      sluicePositions: sluicesActive ? this.activePositions(this.sluices) : emptyPositions,
      stockpilePositions: stockpilesActive ? this.activePositions(this.stockpiles) : emptyPositions,
      boilerHousePositions: this.activePositions(this.boilerHouses),
      turretPositions: this.activePositions(this.turrets),
      assayOfficePositions: this.assayOfficeActive ? [{ x: this.assayOfficePosition.x, z: this.assayOfficePosition.z }] : emptyPositions,
      lanternPostPositions: this.activePositions(this.lanternPosts),
      capacitorBankPositions: this.activePositions(this.capacitorBanks),
      lanternPostRotations: this.lanternPosts.activeRotations,
      reservedFootprints: this.reservedFootprints
        .filter((entry) => entry.active)
        .map(({ id, x, z, halfX, halfZ }) => ({ id, x, z, halfX, halfZ })),
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
      breachSeals: this.e8BreachSeals ? this.palisades.activeCount : 0,
      lensTurrets: this.e8LensTurret ? this.turrets.activeCount : 0,
      tierUpgrades: this.tierUpgrades,
      repairs: this.repairs,
      repairGold: this.repairGold,
      shells: this.shellDiagnostics(),
    };
  }

  setBuildMode(on: boolean): void {
    this.mode = on;
    this.ghost.visible = on;
    if (!on) this.valid = false;
  }

  setNightLighting(darkness: number, sources: readonly { x: number; z: number; radius: number }[]): void {
    this.nightDarkness = THREE.MathUtils.clamp(darkness, 0, 1);
    this.nightLightSources = sources;
  }

  toggleBuildMode(): void {
    this.setBuildMode(!this.mode);
  }

  selectBuildable(id: string, arm = true): boolean {
    const def = getBuildableDef(id);
    if (!def || !this.isBuildableEnabled(def.id)) return false;
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

  setReservedFootprints(footprints: readonly ReservedFootprint[]): void {
    this.reservedFootprints.length = 0;
    this.reservedFootprints.push(...footprints);
  }

  setMegaprojectDamageResolver(resolve: ((target: BuildingTarget, amount: number) => BuildingDamageResult) | null): void {
    this.megaprojectDamageResolver = resolve;
  }

  update(
    delta: number,
    at: number,
    enemies: readonly ClaimJumperEnemy[],
    onSluiceGold: (position: THREE.Vector3, amount: number) => void,
    onBankFull: (position: THREE.Vector3) => void,
    previewOrigin: THREE.Vector3 = this.heroPosition,
  ): void {
    this.currentAt = at;
    this.beacons.update(at);
    this.turrets.update(at);
    this.lanternPosts.update(at, (index) => !this.wrecked.lantern_post[index]);
    this.decoySheds.update(at, (index) => !this.wrecked.decoy_shed[index]);
    this.capacitorBanks.update(at, (index) => !this.wrecked.capacitor_bank[index]);
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
    this.updateGhostPosition(previewOrigin);
    this.valid = this.computeValid(previewOrigin);
    this.ghost.position.set(
      this.ghostPos.x,
      this.visualYFor(this.selectedId, this.ghostPos, this.ghostRotationSteps),
      this.ghostPos.z,
    );
    this.ghost.rotation.y = this.ghostRotationSteps * (Math.PI / 2);
    this.ghostMaterial.color.copy(this.valid ? validColor : invalidColor);
    this.ghostMaterial.emissive.copy(this.valid ? validColor : invalidColor);
    this.ghostLight = this.lightAt(this.ghostPos.x, this.ghostPos.z);
    this.ghostMaterial.opacity = THREE.MathUtils.lerp(0.12, 0.78, this.ghostLight);
    this.ghostMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.04, 0.55, this.ghostLight);
    const pulse = 1 + Math.sin(at * Math.PI * 2) * 0.03;
    this.ghost.scale.setScalar(pulse);
  }

  private lightAt(x: number, z: number): number {
    if (this.nightDarkness <= 0) return 1;
    let light = 0;
    for (const source of this.nightLightSources) {
      const distance = Math.hypot(x - source.x, z - source.z);
      light = Math.max(light, THREE.MathUtils.clamp(1 - distance / source.radius, 0, 1));
    }
    return THREE.MathUtils.lerp(1, light, this.nightDarkness);
  }

  placementPoint(origin: THREE.Vector3 = this.heroPosition): { x: number; z: number } {
    this.updateGhostPosition(origin);
    return { x: this.ghostPos.x, z: this.ghostPos.z };
  }

  confirm(at: number, position?: { x: number; z: number }): boolean {
    if (!this.mode) return false;
    if (position) {
      this.ghostPos.set(position.x, 0, position.z);
      this.snap(this.ghostPos);
    } else {
      this.updateGhostPosition();
    }
    this.valid = this.computeValid();
    if (!this.valid) return this.invalidBuild();

    const def = this.selectedDef();
    const cost = def.costCurve(this.countFor(def.id));
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_spent',
      sink: buildSink(def.id),
      amount: cost,
    });
    if (!result.ok) return this.invalidBuild();

    const placed = this.place(def.id, this.ghostPos);
    if (placed < 0) return this.invalidBuild();
    this.finishPlacement(def.id, placed, cost);
    this.onSound?.('build-place', this.ghostPos);
    if (def.id === 'boiler_house') this.onSound?.('agent-works', this.ghostPos);
    this.valid = this.computeValid();
    return true;
  }

  confirmPlacement(
    at: number,
    placement: { id: string; position: { x: number; z: number }; rotationSteps: number },
  ): boolean {
    const previous = {
      id: this.selectedId,
      mode: this.mode,
      rotationSteps: this.ghostRotationSteps,
      valid: this.valid,
      position: this.ghostPos.clone(),
    };
    try {
      if (!this.selectBuildable(placement.id, true)) return false;
      this.ghostRotationSteps = ((Math.round(placement.rotationSteps) % 4) + 4) % 4;
      this.syncGhostShape();
      return this.confirm(at, placement.position);
    } finally {
      this.selectedId = previous.id;
      this.ghostRotationSteps = previous.rotationSteps;
      this.ghostPos.copy(previous.position);
      this.valid = previous.valid;
      this.syncGhostShape();
      this.setBuildMode(previous.mode);
    }
  }

  placeFree(id: BuildableId, position: { x: number; z: number }, rotationSteps = 0, options: FreePlacementOptions = {}): boolean {
    const def = getBuildableDef(id);
    if (!def || (!options.preplaced && !this.isBuildableEnabled(def.id)) || this.countFor(def.id) >= this.maxCountFor(def)) return false;

    const previousRotation = this.ghostRotationSteps;
    this.ghostRotationSteps = ((Math.round(rotationSteps) % 4) + 4) % 4;
    const target = new THREE.Vector3(position.x, 0, position.z);
    this.snap(target);
    const ok = this.matchesPlacement(def, target) && !this.overlapsExisting(def.id, target);
    const placed = ok ? this.place(def.id, target) : -1;
    if (placed >= 0) {
      this.finishPlacement(def.id, placed, 0);
      this.preplaced[def.id][placed] = options.preplaced === true;
      this.repairCostOverrides[def.id][placed] = Math.max(0, Math.ceil(options.repairCost ?? 0));
      if (options.wrecked) {
        this.hp[def.id][placed] = 0;
        this.wreck(def.id, placed);
      }
    }
    this.ghostRotationSteps = previousRotation;
    this.syncGhostShape();
    return placed >= 0;
  }

  restoreBuilding(state: BuildingRestoreState): boolean {
    const def = getBuildableDef(state.id);
    if (!def) return false;
    const capacity = state.id === 'lantern_post' ? this.lanternPosts.capacity : state.id === 'decoy_shed' ? this.decoySheds.capacity : def.maxCount;
    if (!Number.isInteger(state.index) || state.index < 0 || state.index >= capacity) return false;

    const previousRotation = this.ghostRotationSteps;
    this.ghostRotationSteps = ((Math.round(state.rotationSteps) % 4) + 4) % 4;
    const position = new THREE.Vector3(state.position.x, 0, state.position.z);
    const placed = this.place(state.id, position, state.index);
    this.ghostRotationSteps = previousRotation;
    if (placed !== state.index) return false;

    this.finishPlacement(state.id, state.index, state.buildCost);
    this.preplaced[state.id][state.index] = state.preplaced === true;
    this.tier[state.id][state.index] = Math.max(1, Math.floor(state.tier));
    const maxHpMultiplier = this.effectiveStat(state.id, state.index, 1, 'maxHpMult');
    this.hpMax[state.id][state.index] =
      typeof state.baseMaxHp === 'number' && Number.isFinite(state.baseMaxHp)
        ? state.baseMaxHp
        : Math.round(state.maxHp / Math.max(0.001, maxHpMultiplier));
    this.hp[state.id][state.index] = state.hp;
    this.buildCosts[state.id][state.index] = state.buildCost;
    this.repairCostOverrides[state.id][state.index] = state.repairCostOverride ?? 0;
    this.repairProgress[state.id][state.index] = state.repairProgress;
    this.wrecked[state.id][state.index] = false;
    this.syncTierVisual(state.id, state.index);
    if (state.wrecked) {
      this.wreck(state.id, state.index);
      this.repairProgress[state.id][state.index] = state.repairProgress;
    } else {
      this.syncBuildingTarget(state.id, state.index, true);
    }
    this.refreshShooterStats(state.id, state.index);
    if (state.id === 'sluice' && (!state.sluice || !this.sluices.restoreFutureState(state.index, state.sluice))) return false;
    if (state.id !== 'sluice' && state.sluice !== null) return false;
    this.visualDirty = true;
    return true;
  }

  captureBuildingFutureState(id: BuildableId, index: number): Pick<BuildingRestoreState, 'sluice'> {
    return { sluice: id === 'sluice' ? this.sluices.captureFutureState(index) : null };
  }

  reset(): void {
    this.suspendedBuildings.clear();
    for (const id of buildableIds) {
      for (let i = 0; i < this.unregisterShooters[id].length; i += 1) this.unregisterShooter(id, i);
      for (let i = 0; i < this.hp[id].length; i += 1) {
        this.hp[id][i] = 0;
        this.hpMax[id][i] = 0;
        this.tier[id][i] = 0;
        this.buildCosts[id][i] = 0;
        this.repairCostOverrides[id][i] = 0;
        this.wrecked[id][i] = false;
        this.repairProgress[id][i] = 0;
        this.repairNeedGoldShown[id][i] = false;
        this.preplaced[id][i] = false;
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
    this.turretPressureFireRateMult = 1;
    this.targeting.clearBuildings();
    this.beacons.reset();
    this.palisades.reset();
    this.sluices.reset();
    this.turrets.reset();
    this.lanternPosts.reset();
    this.decoySheds.reset();
    this.capacitorBanks.reset();
    for (let i = 0; i < this.stockpiles.capacity; i += 1) this.economy.removeCapSource(stockpileCapSource(i));
    this.stockpiles.reset();
    this.boilerHouses.reset();
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

  applyTurretPressureFireRateMult(mult: number): void {
    const next = Math.max(1, mult);
    if (next === this.turretPressureFireRateMult) return;
    this.turretPressureFireRateMult = next;
    for (let index = 0; index < this.turrets.capacity; index += 1) this.refreshShooterStats('turret', index);
  }

  applyE8Arsenal(lensTurret: boolean, breachSeals: boolean): void {
    if (this.e8LensTurret !== lensTurret) {
      this.e8LensTurret = lensTurret;
      this.turrets.setLensMode(lensTurret);
      for (let index = 0; index < this.turrets.capacity; index += 1) this.refreshShooterStats('turret', index);
    }
    if (this.e8BreachSeals !== breachSeals) {
      this.e8BreachSeals = breachSeals;
      for (let index = 0; index < this.palisades.capacity; index += 1) this.palisades.setSeal(index, breachSeals);
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
    this.boilerHouses.dispose();
    this.turrets.dispose();
    this.lanternPosts.dispose();
    this.decoySheds.dispose();
    this.capacitorBanks.dispose();
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
      if (child === this.assayOfficeSign) return;
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
    });
    this.assayOfficeMaterial.dispose();
    this.assayRoofMaterial.dispose();
    disposeBuildingSign(this.assayOfficeSign);
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
    this.onSound?.('tier-up', buildingPosition);
    return true;
  }

  demolish(
    id: BuildableId,
    index: number,
    at: number,
    position: THREE.Vector3 = this.heroPosition,
    radius: number = Balance.demolish.interactRadius,
    refundOverride?: number,
    refundDrop?: (position: THREE.Vector3, amount: number) => boolean,
  ): boolean {
    if (!isBuildableId(id) || !this.isSlotActive(id, index)) return false;
    const buildingPosition = this.positionFor(id, index);
    if (!buildingPosition) return false;
    const dx = buildingPosition.x - position.x;
    const dz = buildingPosition.z - position.z;
    if (dx * dx + dz * dz > radius * radius) return false;

    const buildCost = this.buildCosts[id][index] ?? 0;
    const refund = refundOverride ?? this.demolishRefund(id, index);
    const dropRefund = refund > 0 && refundDrop !== undefined;
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_granted',
      source: 'demolish',
      amount: dropRefund ? 0 : refund,
      buildCost,
    });
    if (!result.ok) return false;
    const dropped = dropRefund && refundDrop(buildingPosition, refund);
    if (dropRefund && !dropped) {
      const fallback = this.economy.apply({
        id: crypto.randomUUID(),
        at,
        type: 'gold_granted',
        source: 'demolish',
        amount: refund,
        buildCost: 0,
      });
      if (!fallback.ok) return false;
    }

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
    if (refund > 0 && !dropped) this.onFloatText?.(buildingPosition, `+${refund}`, '#c4883a');
    this.onSound?.('demolish', buildingPosition);
    this.visualDirty = true;
    return true;
  }

  setBuildingSuspended(target: BuildingTarget, suspended: boolean): void {
    if (!isBuildableId(target.family)) return;
    const key = `${target.family}:${target.index}`;
    if (suspended) this.suspendedBuildings.add(key);
    else this.suspendedBuildings.delete(key);
    target.active = !suspended && this.isSlotActive(target.family, target.index) && !this.wrecked[target.family][target.index];
  }

  collectDemolishRefund(position: THREE.Vector3, amount: number, at: number): boolean {
    if (!this.economy.canReceiveIncome(amount)) return false;
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_granted',
      source: 'demolish_pickup',
      amount,
    });
    if (!result.ok) return false;
    this.onFloatText?.(position, `+${amount}`, '#c4883a');
    return true;
  }

  repairBuilding(
    id: BuildableId,
    index: number,
    at: number,
    position: THREE.Vector3 = this.heroPosition,
    radius = Balance.wreck.repairRadius,
  ): BuildingRepairResult | false {
    if (!this.isSlotActive(id, index)) return false;
    const buildingPosition = this.positionFor(id, index);
    if (!buildingPosition) return false;
    const dx = buildingPosition.x - position.x;
    const dz = buildingPosition.z - position.z;
    if (dx * dx + dz * dz > radius * radius) return false;
    const maxHp = this.maxHpForInstance(id, index);
    const hp = this.wrecked[id][index] ? 0 : (this.hp[id][index] ?? maxHp);
    if (maxHp <= 0 || hp >= maxHp) return false;
    const cost = this.repairCost(id, index);
    if (cost <= 0) return false;
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at,
      type: 'gold_spent',
      sink: repairSink(id),
      amount: cost,
    });
    if (!result.ok) return false;

    this.onFloatText?.(buildingPosition, `-${cost}`, '#a0522d');
    this.repairs += 1;
    this.repairGold += cost;
    this.repair(id, index);
    if (this.activeRepairId === id && this.activeRepairIndex === index) {
      this.activeRepairId = null;
      this.activeRepairIndex = -1;
      this.activeRepairBlocked = false;
      this.repairRing.visible = false;
      this.repairRing.geometry.setDrawRange(0, 0);
    }
    const displayName = getBuildableDef(id)?.displayName ?? id;
    return {
      id,
      index,
      displayName,
      cost,
      hp: this.hp[id][index] ?? maxHp,
      maxHp,
      position: { x: buildingPosition.x, z: buildingPosition.z },
      message: `Mended ${displayName}`,
    };
  }

  previewRepairProgress(id: BuildableId, index: number, progress: number, at: number): boolean {
    if (!this.isSlotActive(id, index)) return false;
    const position = this.positionFor(id, index);
    if (!position) return false;
    const safeProgress = Math.max(0, Math.min(1, progress));
    this.activeRepairId = id;
    this.activeRepairIndex = index;
    this.activeRepairBlocked = false;
    this.repairProgress[id][index] = safeProgress;
    this.repairRing.visible = safeProgress > 0;
    this.repairRing.position.set(position.x, this.visualYFor(id, position, id === 'palisade' ? this.palisades.rotationStepsAt(index) : 0, 0.1), position.z);
    this.repairRing.rotation.y = at * 0.8;
    this.repairRing.scale.setScalar(1 + Math.sin(at * 8.5 + index) * 0.04);
    (this.repairRing.material as THREE.MeshBasicMaterial).color.copy(repairColor);
    this.repairRing.geometry.setDrawRange(0, Math.floor(this.repairRingIndexCount * safeProgress));
    return true;
  }

  private invalidBuild(): false {
    this.onSound?.('invalid', this.ghostPos);
    return false;
  }

  remainingHp(id: BuildableId, index: number): number {
    return this.hp[id][index] ?? 0;
  }

  resolveBuildingDamage(target: BuildingTarget, amount: number): BuildingDamageResult {
    if (target.family === 'megaproject') {
      return (
        this.megaprojectDamageResolver?.(target, amount) ?? {
          applied: false,
          family: target.family,
          index: target.index,
          hp: target.hp,
          maxHp: target.maxHp,
          wrecked: false,
        }
      );
    }

    const id = target.family as BuildableId;
    const index = target.index;
    if (!isBuildableId(id)) {
      return { applied: false, family: target.family, index, hp: target.hp, maxHp: target.maxHp, wrecked: false };
    }
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

  private readonly onCanvasClick = (event: MouseEvent): void => {
    if (!this.mode) return;
    this.pointerReady = true;
    this.pointerClientX = event.clientX;
    this.pointerClientY = event.clientY;
    const position = this.placementPoint();
    if (this.onPlacementRequest?.(position)) return;
    this.confirm(this.currentAt, position);
  };

  private updateGhostPosition(origin: THREE.Vector3 = this.heroPosition): void {
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
      this.ghostPos.copy(origin);
      this.ghostPos.z -= 2;
    }
    this.snap(this.ghostPos);
  }

  private computeValid(origin: THREE.Vector3 = this.heroPosition): boolean {
    const def = this.selectedDef();
    if (this.countFor(def.id) >= this.maxCountFor(def)) return false;
    if (this.economy.gold < def.costCurve(this.countFor(def.id))) return false;
    if (!this.matchesPlacement(def, this.ghostPos)) return false;
    const dx = this.ghostPos.x - origin.x;
    const dz = this.ghostPos.z - origin.z;
    const placeRadius = this.placeRadius(def.id);
    if (dx * dx + dz * dz > placeRadius * placeRadius) return false;
    return !this.overlapsExisting(def.id, this.ghostPos);
  }

  private matchesPlacement(def: BuildableDef, position: THREE.Vector3): boolean {
    const buildable = Terrain.isBuildable(position.x, position.z);
    return matchesPlacement(def.placement, {
      walkable: Terrain.sample(position.x, position.z).walkable,
      buildable,
      waterSourceAdjacent: buildable && Terrain.isWaterSourceAdjacent(position.x, position.z, Balance.sluice.riverPad),
    });
  }

  private overlapsExisting(id: BuildableId, position: THREE.Vector3): boolean {
    const existing: PlacementDescriptor[] = [];
    for (let i = 0; i < this.beacons.capacity; i += 1) {
      if (!this.beacons.isActive(i)) continue;
      const pos = this.beacons.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('sentry_beacon', pos, 0));
    }
    for (let i = 0; i < this.palisades.capacity; i += 1) {
      if (!this.palisades.isActive(i)) continue;
      const pos = this.palisades.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('palisade', pos, this.palisades.rotationStepsAt(i)));
    }
    for (let i = 0; i < this.sluices.capacity; i += 1) {
      if (!this.sluices.isActive(i)) continue;
      const pos = this.sluices.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('sluice', pos, 0));
    }
    for (let i = 0; i < this.stockpiles.capacity; i += 1) {
      if (!this.stockpiles.isActive(i)) continue;
      const pos = this.stockpiles.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('stockpile', pos, 0));
    }
    for (let i = 0; i < this.boilerHouses.capacity; i += 1) {
      if (!this.boilerHouses.isActive(i)) continue;
      const pos = this.boilerHouses.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('boiler_house', pos, 0));
    }
    for (let i = 0; i < this.turrets.capacity; i += 1) {
      if (!this.turrets.isActive(i)) continue;
      const pos = this.turrets.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('turret', pos, 0));
    }
    for (let i = 0; i < this.lanternPosts.capacity; i += 1) {
      if (!this.lanternPosts.isActive(i)) continue;
      const pos = this.lanternPosts.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('lantern_post', pos, this.lanternPosts.rotationStepsAt(i)));
    }
    for (let i = 0; i < this.decoySheds.capacity; i += 1) {
      if (!this.decoySheds.isActive(i)) continue;
      const pos = this.decoySheds.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('decoy_shed', pos, this.decoySheds.rotationStepsAt(i)));
    }
    for (let i = 0; i < this.capacitorBanks.capacity; i += 1) {
      if (!this.capacitorBanks.isActive(i)) continue;
      const pos = this.capacitorBanks.allPositions[i];
      if (pos) existing.push(this.placementDescriptor('capacitor_bank', pos, 0));
    }
    if (this.assayOfficeActive) existing.push(this.placementDescriptor('assay_office', this.assayOfficePosition, 0));
    return overlapsExisting(this.placementDescriptor(id, position, this.ghostRotationSteps), existing, this.reservedFootprints.filter((entry) => entry.active));
  }

  private placementDescriptor(id: BuildableId, position: { x: number; z: number }, rotationSteps: number): PlacementDescriptor {
    const half = this.footprintHalfExtents(id, rotationSteps);
    return { id, x: position.x, z: position.z, rotationSteps, halfX: half.x, halfZ: half.z, overlapRadius: this.overlapRadius(id) };
  }

  private overlapRadius(id: BuildableId): number {
    if (id === 'palisade') return Balance.palisade.overlapRadius;
    if (id === 'turret') return Balance.turret.overlapRadius;
    if (id === 'lantern_post') return Balance.lanternPost.overlapRadius;
    if (id === 'decoy_shed') return Balance.decoyShed.overlapRadius;
    if (id === 'capacitor_bank') return Balance.e3Power.storage.overlapRadius;
    return Balance.beacon.overlapRadius;
  }

  private placeRadius(id: BuildableId): number {
    if (id === 'palisade' && this.e8BreachSeals) return Balance.e8Arsenal.breachSeal.placeRadius;
    if (id === 'lantern_post') return Balance.lanternPost.placeRadius;
    if (id === 'decoy_shed') return Balance.decoyShed.placeRadius;
    if (id === 'capacitor_bank') return Balance.e3Power.storage.placeRadius;
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
    if (id === 'boiler_house') return this.boilerHouses.activeCount;
    if (id === 'turret') return this.turrets.activeCount;
    if (id === 'lantern_post') {
      return this.preplaced.lantern_post.reduce(
        (count, fixture, index) => count + (this.lanternPosts.isActive(index) && !fixture ? 1 : 0),
        0,
      );
    }
    if (id === 'decoy_shed') return this.decoySheds.activeCount;
    if (id === 'capacitor_bank') return this.capacitorBanks.activeCount;
    if (id === 'assay_office') return this.assayOfficeActive ? 1 : 0;
    return this.beacons.activeCount;
  }

  private place(id: BuildableId, position: THREE.Vector3, preferredSlot?: number): number {
    if (id === 'palisade') {
      const placed = this.palisades.place(position, this.ghostRotationSteps, preferredSlot);
      if (placed >= 0) this.palisades.setSeal(placed, this.e8BreachSeals);
      return placed;
    }
    if (id === 'sluice') return this.sluices.place(position, preferredSlot);
    if (id === 'stockpile') return this.stockpiles.place(position, preferredSlot);
    if (id === 'boiler_house') return this.boilerHouses.place(position, preferredSlot);
    if (id === 'turret') return this.turrets.place(position, preferredSlot);
    if (id === 'lantern_post') return this.lanternPosts.place(position, this.ghostRotationSteps, preferredSlot);
    if (id === 'decoy_shed') return this.decoySheds.place(position, this.ghostRotationSteps, preferredSlot);
    if (id === 'capacitor_bank') return this.capacitorBanks.place(position, 0, preferredSlot);
    if (id === 'assay_office') return this.placeAssayOffice(position, preferredSlot);
    return this.beacons.place(position, preferredSlot);
  }

  private isSlotActive(id: BuildableId, index: number): boolean {
    if (id === 'assay_office') return index === 0 && this.assayOfficeActive;
    if (id === 'palisade') return this.palisades.isActive(index);
    if (id === 'sluice') return this.sluices.isActive(index);
    if (id === 'stockpile') return this.stockpiles.isActive(index);
    if (id === 'boiler_house') return this.boilerHouses.isActive(index);
    if (id === 'turret') return this.turrets.isActive(index);
    if (id === 'lantern_post') return this.lanternPosts.isActive(index);
    if (id === 'decoy_shed') return this.decoySheds.isActive(index);
    if (id === 'capacitor_bank') return this.capacitorBanks.isActive(index);
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
    if (id === 'boiler_house') return this.boilerHouses.deactivate(index);
    if (id === 'turret') return this.turrets.deactivate(index);
    if (id === 'lantern_post') return this.lanternPosts.deactivate(index);
    if (id === 'decoy_shed') return this.decoySheds.deactivate(index);
    if (id === 'capacitor_bank') return this.capacitorBanks.deactivate(index);
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
    this.repairCostOverrides[id][index] = 0;
    this.preplaced[id][index] = false;
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
    pool: SentryBeaconPool | PalisadePool | SluicePool | StockpilePool | BoilerHousePool | TurretPool | LanternPostPool,
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

  private pointInsidePalisade(x: number, z: number, clearance: number): boolean {
    return this.targets.palisade.some((target) =>
      target?.active === true && target.hp > 0
      && Math.abs(x - target.position.x) <= target.halfX + clearance
      && Math.abs(z - target.position.z) <= target.halfZ + clearance,
    );
  }

  private palisadeComponent(start: BuildingTarget, clearance: number): BuildingTarget[] {
    const component: BuildingTarget[] = [];
    const seen = new Set<BuildingTarget>([start]);
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      component.push(current);
      for (const target of this.targets.palisade) {
        if (!target?.active || target.hp <= 0 || seen.has(target) || !palisadesConnect(current, target, clearance * 2 + 0.1)) continue;
        seen.add(target);
        queue.push(target);
      }
    }
    return component;
  }

  private palisadeOpeningDistances(component: readonly BuildingTarget[], clearance: number): Map<BuildingTarget, number> {
    const distances = new Map<BuildingTarget, number>();
    const queue: BuildingTarget[] = [];
    for (const target of component) {
      if (palisadeNeighbors(target, component, clearance * 2 + 0.1).length > 1) continue;
      distances.set(target, 0);
      queue.push(target);
    }
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      const distance = distances.get(current) ?? 0;
      for (const target of palisadeNeighbors(current, component, clearance * 2 + 0.1)) {
        if (distances.has(target)) continue;
        distances.set(target, distance + 1);
        queue.push(target);
      }
    }
    return distances;
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
    if (id === 'boiler_house') return this.boilerHouses.allPositions[index];
    if (id === 'turret') return this.turrets.allPositions[index];
    if (id === 'lantern_post') return this.lanternPosts.allPositions[index];
    if (id === 'decoy_shed') return this.decoySheds.allPositions[index];
    if (id === 'capacitor_bank') return this.capacitorBanks.allPositions[index];
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
          repairCost: this.repairCost(id, index),
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

  private menuTierFor(id: BuildableId): number {
    if (!isUpgradeableBuildable(id)) return 1;
    let tier = 1;
    for (const value of this.tier[id]) tier = Math.max(tier, Math.floor(value || 1));
    return tier;
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
    const lensMult = this.e8LensTurret ? Balance.e8Arsenal.lensTurret.damageMult : 1;
    return this.effectiveStat('turret', index, Balance.turret.damage, 'damageMult') * this.turretDamageMult * lensMult;
  }

  private effectiveTurretFireRate(index: number): number {
    const lensMult = this.e8LensTurret ? Balance.e8Arsenal.lensTurret.fireRateMult : 1;
    return this.effectiveStat('turret', index, Balance.turret.fireRate, 'fireRateMult') * this.turretPressureFireRateMult * lensMult;
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
      resumeKey: `building:sentry_beacon:${placed}`,
      enabled: () => !this.suspendedBuildings.has(`sentry_beacon:${placed}`),
      getPos: () => this.shooterPos.copy(this.beacons.allPositions[placed] ?? this.ghostPos),
      range: Balance.beacon.range,
      cooldown: 1 / (Balance.beacon.fireRate * this.beaconFireRateMult),
      damage: Balance.beacon.damage,
      getDamage: () => Balance.beacon.damage + Balance.beacon.damagePerWave * this.getWave(),
      visualOriginPadRadius: () => Balance.beacon.overlapRadius,
      canTarget: hasElevationTile()
        ? (target) => {
            const origin = this.beacons.allPositions[placed] ?? this.ghostPos;
            return terrainLineOfSight(origin, target.position);
          }
        : undefined,
      projSpeed: Balance.beacon.boltSpeed,
      volley: Balance.beacon.volley,
    };
    this.registerShooter('sentry_beacon', placed, handle);
  }

  private registerTurretShooter(placed: number): void {
    const handle: ShooterHandle = {
      id: this.e8LensTurret ? 'lens_turrets' : 'turrets',
      resumeKey: `building:turret:${placed}`,
      getPos: () => this.shooterPos.copy(this.turrets.allPositions[placed] ?? this.ghostPos),
      enabled: () => !this.suspendedBuildings.has(`turret:${placed}`)
        && this.isShooterPowered('turret', placed, this.turrets.allPositions[placed] ?? this.ghostPos),
      range: Balance.turret.range,
      cooldown: 1 / this.effectiveTurretFireRate(placed),
      damage: this.effectiveTurretDamage(placed),
      getDamage: () => this.effectiveTurretDamage(placed),
      visualOriginPadRadius: () => Balance.turret.overlapRadius,
      canTarget: hasElevationTile()
        ? (target) => {
            const origin = this.turrets.allPositions[placed] ?? this.ghostPos;
            return this.firingLineCrossesPalisade(origin, target.position) || terrainLineOfSight(origin, target.position);
          }
        : undefined,
      effectiveRange: hasElevationTile()
        ? () => {
            const origin = this.turrets.allPositions[placed] ?? this.ghostPos;
            return highGroundRange(handle.range, origin.x, origin.z);
          }
        : undefined,
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
      handle.id = this.e8LensTurret ? 'lens_turrets' : 'turrets';
      handle.cooldown = 1 / this.effectiveTurretFireRate(index);
      handle.damage = this.effectiveTurretDamage(index);
    }
  }

  private maxCountFor(def: BuildableDef): number {
    return def.id === 'palisade' && this.e8BreachSeals
      ? Math.min(def.maxCount, Balance.e8Arsenal.breachSeal.maxActive)
      : def.maxCount;
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
    const override = this.repairCostOverrides[id][index] ?? 0;
    if (override > 0 && this.wrecked[id][index]) return override;
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
    this.boilerHouseGhost.visible = this.selectedId === 'boiler_house';
    this.turretGhost.visible = this.selectedId === 'turret';
    this.lanternPostGhost.visible = this.selectedId === 'lantern_post';
    this.decoyShedGhost.visible = this.selectedId === 'decoy_shed';
    this.capacitorBankGhost.visible = this.selectedId === 'capacitor_bank';
    this.assayOfficeGhost.visible = this.selectedId === 'assay_office';
  }

  private shellDiagnostics(): BuildDiagnostics['shells'] {
    return {
      palisade: this.palisades.diagnostics(),
      sluice: this.sluices.diagnostics(),
      stockpile: this.stockpiles.diagnostics(),
      boiler_house: { active: this.boilerHouses.activeCount, signs: this.boilerHouses.activeCount, meshes: ['BoilerHousePlaceholder', 'BoilerHouseBrassDrum', 'BoilerHouseStack', 'BoilerHouseSign'], lit: true },
      turret: this.turrets.diagnostics(),
      assay_office: {
        active: this.assayOfficeActive ? 1 : 0,
        signs: this.assayOfficeActive ? 1 : 0,
        meshes: ['AssayOfficeTimberShell', 'AssayOfficeBrassRoof', 'AssayOfficePlaqueFrame', 'AssayOfficeTimberLintel', this.assayOfficeSign.name],
        lit: true,
      },
    };
  }

  private createGhost(): void {
    this.createBeaconGhost();
    this.createPalisadeGhost();
    this.createSluiceGhost();
    this.createStockpileGhost();
    this.createBoilerHouseGhost();
    this.createTurretGhost();
    this.createLanternPostGhost();
    this.createDecoyShedGhost();
    this.createCapacitorBankGhost();
    this.createAssayOfficeGhost();
    this.ghost.add(
      this.beaconGhost,
      this.palisadeGhost,
      this.sluiceGhost,
      this.stockpileGhost,
      this.boilerHouseGhost,
      this.turretGhost,
      this.lanternPostGhost,
      this.decoyShedGhost,
      this.capacitorBankGhost,
      this.assayOfficeGhost,
    );
    this.ghost.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
  }

  private placeAssayOffice(position: THREE.Vector3, preferredSlot?: number): number {
    if ((preferredSlot !== undefined && preferredSlot !== 0) || this.assayOfficeActive) return -1;
    this.assayOfficeActive = true;
    this.assayOfficePosition.copy(position);
    this.assayOffice.position.set(position.x, this.visualYFor('assay_office', position), position.z);
    this.assayOffice.visible = true;
    return 0;
  }

  private createAssayOffice(): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.1), this.assayOfficeMaterial);
    base.name = 'AssayOfficeTimberShell';
    base.position.y = 0.45;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 1.28), this.assayRoofMaterial);
    roof.name = 'AssayOfficeBrassRoof';
    roof.position.y = 0.98;
    roof.rotation.z = 0.04;
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.04), this.assayRoofMaterial);
    plaque.name = 'AssayOfficePlaqueFrame';
    plaque.position.set(0, 0.62, -0.57);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 0.08), this.assayRoofMaterial);
    lintel.name = 'AssayOfficeTimberLintel';
    lintel.position.set(0, 0.84, -0.6);
    this.visualObject.position.set(0, 1.12, -0.46);
    this.visualObject.rotation.set(-1.05, 0, 0);
    this.visualObject.scale.set(1.08, 0.66, 1);
    this.visualObject.updateMatrix();
    this.assayOfficeSign.setMatrixAt(0, this.visualObject.matrix);
    this.assayOfficeSign.instanceMatrix.needsUpdate = true;
    this.assayOffice.add(base, roof, plaque, lintel, this.assayOfficeSign);
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

  private createBoilerHouseGhost(): void {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 1.3), this.ghostMaterial);
    body.position.y = 0.52;
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.45, 14), this.ghostMaterial);
    drum.position.y = 1.04;
    drum.rotation.z = Math.PI / 2;
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 1.25, 10), this.ghostMaterial);
    stack.position.set(0.55, 1.65, 0.32);
    this.boilerHouseGhost.add(body, drum, stack);
  }

  private createLanternPostGhost(): void {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.35, 6), this.ghostMaterial);
    post.position.set(0, 0.66, 0);
    this.lanternPostGhost.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.07), this.ghostMaterial);
    arm.position.set(0.22, 1.22, 0);
    this.lanternPostGhost.add(arm);
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.18), this.ghostMaterial);
    lantern.position.set(0.52, 1.03, 0);
    this.lanternPostGhost.add(lantern);
  }

  private createDecoyShedGhost(): void {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.9, 1.25), this.ghostMaterial);
    body.position.y = 0.45;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 1.5), this.ghostMaterial);
    roof.position.y = 1;
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.18), this.ghostMaterial);
    lamp.position.set(0, 0.62, -0.72);
    this.decoyShedGhost.add(body, roof, lamp);
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

  private createCapacitorBankGhost(): void {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.18, 1.25), this.ghostMaterial);
    frame.position.y = 0.12;
    this.capacitorBankGhost.add(frame);
    for (const x of [-0.42, 0, 0.42]) {
      const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.82, 12), this.ghostMaterial);
      cell.position.set(x, 0.55, 0);
      this.capacitorBankGhost.add(cell);
    }
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

class LanternPostPool {
  readonly group = new THREE.Group();

  private readonly active: boolean[] = [];
  private readonly positions: THREE.Vector3[] = [];
  private readonly rotationSteps: number[] = [];
  private readonly postGeometry = new THREE.CylinderGeometry(0.045, 0.06, 1.35, 6);
  private readonly armGeometry = new THREE.BoxGeometry(0.62, 0.07, 0.07);
  private readonly lanternGeometry = new THREE.BoxGeometry(0.22, 0.28, 0.18);
  private readonly haloGeometry = new THREE.SphereGeometry(0.42, 12, 8);
  private readonly shedGeometry = new THREE.BoxGeometry(1.55, 0.9, 1.25);
  private readonly roofGeometry = new THREE.BoxGeometry(1.8, 0.18, 1.5);
  private readonly postMaterial = new THREE.MeshStandardMaterial({
    color: '#6f5732',
    emissive: '#3b2a1a',
    emissiveIntensity: 0.12,
    roughness: 0.72,
    metalness: 0.08,
  });
  private readonly lanternMaterial = new THREE.MeshStandardMaterial({
    color: '#f5e6c8',
    emissive: '#ffd28a',
    emissiveIntensity: 1.45,
    roughness: 0.28,
    metalness: 0.12,
  });
  private readonly haloMaterial = new THREE.MeshBasicMaterial({
    color: '#ffd28a',
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  private readonly capacityLimit = Balance.lanternPost.maxCount * 2;
  private readonly postMesh = new THREE.InstancedMesh(this.postGeometry, this.postMaterial, this.capacityLimit);
  private readonly armMesh = new THREE.InstancedMesh(this.armGeometry, this.postMaterial, this.capacityLimit);
  private readonly lanternMesh = new THREE.InstancedMesh(this.lanternGeometry, this.lanternMaterial, this.capacityLimit);
  private readonly haloMesh = new THREE.InstancedMesh(this.haloGeometry, this.haloMaterial, this.capacityLimit);
  private readonly shedMesh = new THREE.InstancedMesh(this.shedGeometry, this.postMaterial, this.capacityLimit);
  private readonly roofMesh = new THREE.InstancedMesh(this.roofGeometry, this.postMaterial, this.capacityLimit);
  private readonly syncObject = new THREE.Object3D();
  private alive = 0;

  constructor(private readonly shed = false, private readonly capacitor = false) {
    this.group.name = capacitor ? 'CapacitorBankPool' : shed ? 'DecoyShedPool' : 'LanternPostPool';
    if (capacitor) {
      this.postMaterial.color.set('#8b7d3c');
      this.postMaterial.emissive.set('#39756f');
      this.postMaterial.emissiveIntensity = 0.28;
    }
    for (const mesh of [this.postMesh, this.armMesh, this.lanternMesh, this.haloMesh]) {
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      this.group.add(mesh);
    }
    if (shed || capacitor) this.group.add(this.shedMesh, this.roofMesh);
    this.haloMesh.renderOrder = RenderLayers.groundDecals + 1;
    this.haloMesh.visible = false;
    for (let i = 0; i < this.capacityLimit; i += 1) {
      this.active.push(false);
      this.positions.push(new THREE.Vector3());
      this.rotationSteps.push(0);
      this.hide(i);
    }
    this.markNeedsUpdate();
  }

  get activeCount(): number {
    return this.alive;
  }

  get capacity(): number {
    return this.capacityLimit;
  }

  get allPositions(): readonly THREE.Vector3[] {
    return this.positions;
  }

  get activeRotations(): number[] {
    return this.rotationSteps.filter((_, index) => this.active[index]);
  }

  rotationStepsAt(index: number): number {
    return this.rotationSteps[index] ?? 0;
  }

  isActive(index: number): boolean {
    return this.active[index] === true;
  }

  place(position: THREE.Vector3, rotationSteps = 0, preferredSlot?: number): number {
    const slot = preferredSlot ?? this.active.findIndex((active) => !active);
    if (!Number.isInteger(slot) || slot < 0 || slot >= this.active.length || this.active[slot]) return -1;
    this.active[slot] = true;
    this.positions[slot]?.copy(position);
    this.rotationSteps[slot] = ((rotationSteps % 4) + 4) % 4;
    this.alive += 1;
    this.sync(slot, 0);
    this.markNeedsUpdate();
    return slot;
  }

  deactivate(index: number): boolean {
    if (!this.active[index]) return false;
    this.active[index] = false;
    this.rotationSteps[index] = 0;
    this.alive = Math.max(0, this.alive - 1);
    this.hide(index);
    this.markNeedsUpdate();
    return true;
  }

  update(at: number, isLit: (index: number) => boolean = () => true): void {
    const pulse = 0.82 + Math.sin(at * Math.PI * 1.7) * 0.18;
    this.lanternMaterial.emissiveIntensity = 1.25 + pulse * 0.55;
    this.haloMaterial.opacity = 0.16 + pulse * 0.08;
    let litCount = 0;
    for (let i = 0; i < this.active.length; i += 1) {
      if (!this.active[i]) continue;
      const lit = isLit(i);
      if (lit) litCount += 1;
      this.sync(i, at, lit);
    }
    this.haloMesh.visible = litCount > 0;
    this.markNeedsUpdate();
  }

  reset(): void {
    for (let i = 0; i < this.active.length; i += 1) {
      this.active[i] = false;
      this.rotationSteps[i] = 0;
      this.hide(i);
    }
    this.alive = 0;
    this.haloMesh.visible = false;
    this.markNeedsUpdate();
  }

  dispose(): void {
    this.postGeometry.dispose();
    this.armGeometry.dispose();
    this.lanternGeometry.dispose();
    this.haloGeometry.dispose();
    this.shedGeometry.dispose();
    this.roofGeometry.dispose();
    this.postMaterial.dispose();
    this.lanternMaterial.dispose();
    this.haloMaterial.dispose();
  }

  private sync(index: number, at: number, lit = true): void {
    const position = this.positions[index];
    if (!position) return;
    const groundY = Terrain.visualY(position.x, position.z, 0, Balance.lanternPost.overlapRadius);
    const sway = Math.sin(at * 0.85 + index) * 0.035;
    const yaw = this.rotationStepsAt(index) * (Math.PI / 2);
    const sideX = Math.cos(yaw);
    const sideZ = -Math.sin(yaw);
    if (this.capacitor) {
      this.postMesh.setMatrixAt(index, hiddenMatrix);
      this.armMesh.setMatrixAt(index, hiddenMatrix);
      this.hideLight(index);
      this.syncPart(this.shedMesh, index, position.x, groundY + 0.45, position.z, 0.78, 0);
      this.syncPart(this.roofMesh, index, position.x, groundY + 0.92, position.z, 0.64, Math.PI / 2);
      return;
    }
    if (this.shed || this.capacitor) {
      this.syncPart(this.shedMesh, index, position.x, groundY + 0.45, position.z, 1, yaw);
      this.syncPart(this.roofMesh, index, position.x, groundY + 1, position.z, 1, yaw);
    }
    this.syncPart(this.postMesh, index, position.x, groundY + 0.66, position.z, 1, 0);
    this.syncPart(this.armMesh, index, position.x + sideX * 0.22, groundY + 1.22, position.z + sideZ * 0.22, 1, yaw + sway);
    if (!lit) {
      this.hideLight(index);
      return;
    }
    this.syncPart(this.lanternMesh, index, position.x + sideX * 0.52, groundY + 1.03, position.z + sideZ * 0.52, 1, yaw + sway * 1.4);
    this.syncPart(this.haloMesh, index, position.x + sideX * 0.52, groundY + 1.03, position.z + sideZ * 0.52, 1 + Math.sin(at * 1.6 + index) * 0.06, 0);
  }

  private syncPart(mesh: THREE.InstancedMesh, index: number, x: number, y: number, z: number, scale: number, yaw: number): void {
    this.syncObject.position.set(x, y, z);
    this.syncObject.rotation.set(0, yaw, 0);
    this.syncObject.scale.setScalar(scale);
    this.syncObject.updateMatrix();
    mesh.setMatrixAt(index, this.syncObject.matrix);
  }

  private hide(index: number): void {
    this.postMesh.setMatrixAt(index, hiddenMatrix);
    this.armMesh.setMatrixAt(index, hiddenMatrix);
    this.hideLight(index);
    if (this.shed || this.capacitor) {
      this.shedMesh.setMatrixAt(index, hiddenMatrix);
      this.roofMesh.setMatrixAt(index, hiddenMatrix);
    }
  }

  private hideLight(index: number): void {
    this.lanternMesh.setMatrixAt(index, hiddenMatrix);
    this.haloMesh.setMatrixAt(index, hiddenMatrix);
  }

  private markNeedsUpdate(): void {
    this.postMesh.instanceMatrix.needsUpdate = true;
    this.armMesh.instanceMatrix.needsUpdate = true;
    this.lanternMesh.instanceMatrix.needsUpdate = true;
    this.haloMesh.instanceMatrix.needsUpdate = true;
    if (this.shed || this.capacitor) {
      this.shedMesh.instanceMatrix.needsUpdate = true;
      this.roofMesh.instanceMatrix.needsUpdate = true;
    }
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

function distanceSq2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function palisadesConnect(a: BuildingTarget, b: BuildingTarget, joinPad = 0.1): boolean {
  return Math.abs(a.position.x - b.position.x) <= a.halfX + b.halfX + joinPad
    && Math.abs(a.position.z - b.position.z) <= a.halfZ + b.halfZ + joinPad;
}

function palisadeNeighbors(target: BuildingTarget, component: readonly BuildingTarget[], joinPad: number): BuildingTarget[] {
  const nearestByDirection = new Map<number, { target: BuildingTarget; distanceSq: number }>();
  for (const other of component) {
    if (other === target || !palisadesConnect(target, other, joinPad)) continue;
    const dx = other.position.x - target.position.x;
    const dz = other.position.z - target.position.z;
    const direction = Math.round(Math.atan2(dz, dx) / (Math.PI / 4));
    const distanceSq = dx * dx + dz * dz;
    const nearest = nearestByDirection.get(direction);
    if (!nearest || distanceSq < nearest.distanceSq) nearestByDirection.set(direction, { target: other, distanceSq });
  }
  return [...nearestByDirection.values()].map((entry) => entry.target);
}

function segmentAabbHit(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
): number | null {
  let near = 0;
  let far = 1;
  for (const [start, delta, min, max] of [[ax, bx - ax, minX, maxX], [az, bz - az, minZ, maxZ]] as const) {
    if (Math.abs(delta) < 1e-9) {
      if (start < min || start > max) return null;
      continue;
    }
    const first = (min - start) / delta;
    const second = (max - start) / delta;
    near = Math.max(near, Math.min(first, second));
    far = Math.min(far, Math.max(first, second));
    if (near > far) return null;
  }
  return near;
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
    boiler_house: createFamily('boiler_house', make),
    turret: createFamily('turret', make),
    lantern_post: createFamily('lantern_post', make),
    decoy_shed: createFamily('decoy_shed', make),
    capacitor_bank: createFamily('capacitor_bank', make),
    assay_office: createFamily('assay_office', make),
  };
}

function createFamily<T>(id: BuildableId, make: (id: BuildableId, index: number) => T): T[] {
  const def = getBuildableDef(id);
  return Array.from({ length: def?.maxCount ?? 0 }, (_, index) => make(id, index));
}
