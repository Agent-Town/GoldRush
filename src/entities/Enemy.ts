import * as THREE from 'three';
import { OrientationResolver, rotationDirections, type RotationDirection } from '../assets/OrientationResolver';
import { type CharacterSpriteClip } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import { activeTileDescriptor } from '../meta/ContractFamilies';
import { hasElevationTile, resolveTerrainMove, terrainDetourWaypoint, terrainSpeedMultiplier } from '../sim/TileHeight';
import type { PalisadeRoute } from '../systems/BuildSystem';
import type { BuildingTarget, GoldHolding } from '../systems/TargetingSystem';
import * as Terrain from '../world/Terrain';
import type { PalisadeBlocker } from './Palisade';

export type CompassEdge = 'north' | 'south' | 'east' | 'west';
export type ThiefState = 'none' | 'seekHolding' | 'grabbing' | 'fleeing';
export type WreckerState = 'none' | 'seekBuilding' | 'swinging';
export type EnemyEliteKind = 'baron' | 'railcar';

export type ClaimJumperAssets = {
  ponchoGeometry: THREE.ConeGeometry;
  sackGeometry: THREE.DodecahedronGeometry;
  faceGeometry: THREE.SphereGeometry;
  brimGeometry: THREE.CylinderGeometry;
  crownGeometry: THREE.CylinderGeometry;
  shadowGeometry: THREE.CircleGeometry;
  ponchoMaterial: THREE.MeshStandardMaterial;
  sackMaterial: THREE.MeshStandardMaterial;
  faceMaterial: THREE.MeshStandardMaterial;
  hatMaterial: THREE.MeshStandardMaterial;
  shadowMaterial: THREE.MeshBasicMaterial;
};

export type EnemySpawnParams = {
  speedScale?: number;
  hpScale?: number;
  activationDelay?: number;
  edge?: CompassEdge;
  thief?: boolean;
  wrecker?: boolean;
  carriedLantern?: boolean;
  formationSeed?: number;
  eliteKind?: EnemyEliteKind;
  visualScale?: number;
  banner?: boolean;
  contactDamageScale?: number;
  buildingDamageScale?: number;
  supportBuildingDamageScale?: number;
  heroPursuitRange?: number;
  variantId?: string;
  variantLabel?: string;
  tint?: string;
  boltDamageMult?: number;
  bossGroupId?: string;
  bossGroupSize?: number;
  bossGroupTotalHp?: number;
  bossComponentId?: string;
  bossComponentLabel?: string;
  bossDegradeSpeedMult?: number;
};

export type EnemySuspendSnapshot = {
  slot: number;
  hp: number;
  maxHp: number;
  speed: number;
  eliteKind: EnemyEliteKind | null;
  visualScale: number;
  banner: boolean;
  contactDamageScale: number;
  buildingDamageScale: number;
  supportBuildingDamageScale: number;
  heroPursuitRange: number;
  variantId: string | null;
  variantLabel: string | null;
  variantTint: string | null;
  boltDamageMult: number;
  bossGroupId: string | null;
  bossGroupSize: number;
  bossGroupTotalHp: number;
  bossComponentId: string | null;
  bossComponentLabel: string | null;
  bossDegradeSpeedMult: number;
  activationDelay: number;
  contactCooldown: number;
  thief: boolean;
  wrecker: boolean;
  carriedLantern: boolean;
  thiefState: ThiefState;
  wreckerState: WreckerState;
  carriedGold: number;
  grabTimer: number;
  swingTimer: number;
  retargetTimer: number;
  wreckerRetargetTimer: number;
  currentHoldingId: string | null;
  currentBuildingId: string | null;
  edge: CompassEdge | null;
  formationOffset: number;
  flashRemaining: number;
  flashCount: number;
  terrainSlideSide: number;
  gapBlockerId: string | null;
  gapWaypoint: { x: number; y: number; z: number };
  watchdogElapsed: number;
  watchdogAnchor: { x: number; y: number; z: number };
  watchdogTrips: number;
  gnawTargetId: string | null;
  gnawing: boolean;
  scripted: boolean;
  scriptedSpeed: number;
  scriptedIgnoresTerrain: boolean;
  scriptedRoute: Array<{ x: number; y: number; z: number }>;
  scriptedRouteIndex: number;
  railcarEnteredField: boolean;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  leadVelocity: { x: number; y: number; z: number };
  heading: { x: number; y: number; z: number };
  scriptedTarget: { x: number; y: number; z: number };
  rotationY: number;
  spriteClip: CharacterSpriteClip;
  spriteOrientation: RotationDirection;
};

export type EnemySuspendRestoreRefs = {
  goldHoldingById?: (id: string) => GoldHolding | null;
  buildingById?: (id: string) => BuildingTarget | null;
};

export type ThiefUpdateContext = {
  nearestGoldHolding: (from: THREE.Vector3) => GoldHolding | null;
  claimGold: (enemy: ClaimJumperEnemy, holding: GoldHolding) => number;
  onThiefFled: (enemy: ClaimJumperEnemy) => void;
};

export type WreckerUpdateContext = {
  nearestBuilding: (from: THREE.Vector3) => BuildingTarget | null;
  hitBuilding: (enemy: ClaimJumperEnemy, target: BuildingTarget, amount?: number) => void;
  palisadeRoute: (from: THREE.Vector3, to: THREE.Vector3, clearance: number) => PalisadeRoute | null;
};

const THIEF_RETARGET_SECONDS = 0.35;
const WRECKER_RETARGET_SECONDS = 0.35;
const FORD_ENTRY_INSET = 0.1;
const FLEE_EDGE = 37.5;
const FORMATION_STEER = 0.38;
const FORMATION_GAP_CLEARANCE = 0.25;
const FORMATION_LANES = 7;
const FORMATION_JITTER = 0.16;
const ENEMY_FLAT_WATER_SPEED = activeTileDescriptor().id !== 'frontier-river-claim';

export function createClaimJumperAssets(): ClaimJumperAssets {
  return {
    ponchoGeometry: new THREE.ConeGeometry(0.54, 1.08, 7),
    sackGeometry: new THREE.DodecahedronGeometry(0.23, 0),
    faceGeometry: new THREE.SphereGeometry(0.18, 12, 8),
    brimGeometry: new THREE.CylinderGeometry(0.42, 0.42, 0.055, 18),
    crownGeometry: new THREE.CylinderGeometry(0.27, 0.31, 0.28, 16),
    shadowGeometry: new THREE.CircleGeometry(0.54, 20),
    ponchoMaterial: new THREE.MeshStandardMaterial({
      color: '#a0522d',
      roughness: 0.88,
      metalness: 0.02,
    }),
    sackMaterial: new THREE.MeshStandardMaterial({
      color: '#8b7d3c',
      roughness: 0.72,
      metalness: 0.06,
    }),
    faceMaterial: new THREE.MeshStandardMaterial({
      color: '#d9a268',
      roughness: 0.8,
      metalness: 0.01,
    }),
    hatMaterial: new THREE.MeshStandardMaterial({
      color: '#4b2a17',
      roughness: 0.78,
      metalness: 0.02,
    }),
    shadowMaterial: new THREE.MeshBasicMaterial({
      color: '#2e1b0e',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  };
}

export class ClaimJumperEnemy {
  readonly group = new THREE.Group();

  private readonly velocity = new THREE.Vector3();
  private readonly leadVelocity = new THREE.Vector3();
  private readonly heading = new THREE.Vector3(0, 0, -1);
  private readonly orientationResolver = new OrientationResolver();
  private readonly nextPosition = new THREE.Vector3();
  private readonly fleeTarget = new THREE.Vector3();
  private readonly routeTarget = new THREE.Vector3();
  private readonly terrainRouteTarget = new THREE.Vector3();
  private readonly scriptedTarget = new THREE.Vector3();
  private readonly scriptedRoute: THREE.Vector3[] = [];
  private alive = false;
  private hp = 0;
  private maxHpValue = 0;
  private speed: number = Balance.enemy.speed;
  private elite: EnemyEliteKind | null = null;
  private visualScaleValue = 1;
  private banner = false;
  private contactDamageScaleValue = 1;
  private buildingDamageScaleValue = 1;
  private supportBuildingDamageScaleValue = 1;
  private heroPursuitRangeValue = 0;
  private variantIdValue: string | null = null;
  private variantLabelValue: string | null = null;
  private variantTintColorValue: THREE.Color | null = null;
  private boltDamageMultValue = 1;
  private bossGroupIdValue: string | null = null;
  private bossGroupSizeValue = 0;
  private bossGroupTotalHpValue = 0;
  private bossComponentIdValue: string | null = null;
  private bossComponentLabelValue: string | null = null;
  private bossDegradeSpeedMultValue = 1;
  private scriptedSpeed = 0;
  private scripted = false;
  private scriptedIgnoresTerrain = false;
  private scriptedRouteIndex = 0;
  private railcarEnteredFieldValue = false;
  private activationDelay = 0;
  private contactCooldown = 0;
  private spriteClip: CharacterSpriteClip = 'idle';
  private spriteOrientation: RotationDirection = 's';
  private thief = false;
  private wrecker = false;
  private carriedLanternValue = false;
  private thiefState: ThiefState = 'none';
  private wreckerState: WreckerState = 'none';
  private carriedGold = 0;
  private grabTimer = 0;
  private swingTimer = 0;
  private retargetTimer = 0;
  private wreckerRetargetTimer = 0;
  private currentHolding: GoldHolding | null = null;
  private currentBuilding: BuildingTarget | null = null;
  private spawnEdge: CompassEdge | null = null;
  private formationOffset = 0;
  private flashRemaining = 0;
  private flashCount = 0;
  private terrainSlideSide = 0;
  private readonly gapWaypoint = new THREE.Vector3();
  private gapBlockerId: string | null = null;
  private watchdogElapsed = 0;
  private readonly watchdogAnchor = new THREE.Vector3();
  private watchdogTrips = 0;
  private gnawTarget: BuildingTarget | null = null;
  private gnawing = false;

  constructor(readonly id: number, assets: ClaimJumperAssets) {
    void assets;
    this.group.name = `ClaimJumperEnemy-${id}`;
    this.group.visible = false;
    tagPlaceholder(this.group, assetSlots.charClaimJumper);
  }

  get isAlive(): boolean {
    return this.alive;
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get currentHp(): number {
    return this.hp;
  }

  get maxHp(): number {
    return this.maxHpValue;
  }

  get moveSpeed(): number {
    return this.speed;
  }

  get eliteKind(): EnemyEliteKind | null {
    return this.elite;
  }

  get visualScale(): number {
    return this.visualScaleValue;
  }

  get hasBanner(): boolean {
    return this.banner;
  }

  get contactDamage(): number {
    return Balance.enemy.contactDamage * this.contactDamageScaleValue;
  }

  get buildingDamage(): number {
    return Balance.wreck.damage * this.buildingDamageScaleValue;
  }

  get supportBuildingDamage(): number {
    return Balance.wreck.damage * this.supportBuildingDamageScaleValue;
  }

  get heroPursuitRange(): number {
    return this.heroPursuitRangeValue;
  }

  get variantId(): string | null {
    return this.variantIdValue;
  }

  get variantLabel(): string | null {
    return this.variantLabelValue;
  }

  get variantTintColor(): THREE.Color | null {
    return this.variantTintColorValue;
  }

  get boltDamageMult(): number {
    return this.boltDamageMultValue;
  }

  get bossGroupId(): string | null {
    return this.bossGroupIdValue;
  }

  get bossGroupSize(): number {
    return this.bossGroupSizeValue;
  }

  get bossGroupTotalHp(): number {
    return this.bossGroupTotalHpValue;
  }

  get bossComponentId(): string | null {
    return this.bossComponentIdValue;
  }

  get bossComponentLabel(): string | null {
    return this.bossComponentLabelValue;
  }

  get bossDegradeSpeedMult(): number {
    return this.bossDegradeSpeedMultValue;
  }

  get railcarEnteredField(): boolean {
    return this.railcarEnteredFieldValue;
  }

  markRailcarEnteredField(): void {
    this.railcarEnteredFieldValue = true;
  }

  get impactScale(): number {
    return this.elite ? Math.max(1, this.visualScaleValue) : 1;
  }

  get hitRadius(): number {
    return Balance.enemy.touchRadius * Math.max(1, this.visualScaleValue);
  }

  buildingDamageFor(family: string): number {
    if (this.elite && (family === 'sluice' || family === 'turret')) return this.supportBuildingDamage;
    return this.buildingDamage;
  }

  get animationClip(): CharacterSpriteClip {
    return this.spriteClip;
  }

  get animationOrientation(): RotationDirection {
    return this.spriteOrientation;
  }

  get isThief(): boolean {
    return this.thief;
  }

  get isWrecker(): boolean {
    return this.wrecker;
  }

  get carriesLantern(): boolean {
    return this.carriedLanternValue;
  }

  get stealState(): ThiefState {
    return this.thiefState;
  }

  get wreckState(): WreckerState {
    return this.wreckerState;
  }

  get isGnawing(): boolean {
    return this.gnawing;
  }

  get stuckWatchdogTrips(): number {
    return this.watchdogTrips;
  }

  get carriedAmount(): number {
    return this.carriedGold;
  }

  get isFleeingWithGold(): boolean {
    return this.thiefState === 'fleeing' && this.carriedGold > 0;
  }

  get ownEdge(): CompassEdge | null {
    return this.spawnEdge;
  }

  get velocityX(): number {
    return this.leadVelocity.x;
  }

  get velocityZ(): number {
    return this.leadVelocity.z;
  }

  get spreadOffset(): number {
    return this.formationOffset;
  }

  get hitFlashRemaining(): number {
    return this.flashRemaining;
  }

  get hitFlashCount(): number {
    return this.flashCount;
  }

  setAnimationClip(clip: CharacterSpriteClip): void {
    this.spriteClip = clip;
  }

  captureSuspend(): EnemySuspendSnapshot {
    return {
      slot: this.id,
      hp: this.hp,
      maxHp: this.maxHpValue,
      speed: this.speed,
      eliteKind: this.elite,
      visualScale: this.visualScaleValue,
      banner: this.banner,
      contactDamageScale: this.contactDamageScaleValue,
      buildingDamageScale: this.buildingDamageScaleValue,
      supportBuildingDamageScale: this.supportBuildingDamageScaleValue,
      heroPursuitRange: this.heroPursuitRangeValue,
      variantId: this.variantIdValue,
      variantLabel: this.variantLabelValue,
      variantTint: this.variantTintColorValue ? `#${this.variantTintColorValue.getHexString()}` : null,
      boltDamageMult: this.boltDamageMultValue,
      bossGroupId: this.bossGroupIdValue,
      bossGroupSize: this.bossGroupSizeValue,
      bossGroupTotalHp: this.bossGroupTotalHpValue,
      bossComponentId: this.bossComponentIdValue,
      bossComponentLabel: this.bossComponentLabelValue,
      bossDegradeSpeedMult: this.bossDegradeSpeedMultValue,
      activationDelay: this.activationDelay,
      contactCooldown: this.contactCooldown,
      thief: this.thief,
      wrecker: this.wrecker,
      carriedLantern: this.carriedLanternValue,
      thiefState: this.thiefState,
      wreckerState: this.wreckerState,
      carriedGold: this.carriedGold,
      grabTimer: this.grabTimer,
      swingTimer: this.swingTimer,
      retargetTimer: this.retargetTimer,
      wreckerRetargetTimer: this.wreckerRetargetTimer,
      currentHoldingId: this.isHoldingValid(this.currentHolding) ? this.currentHolding.id : null,
      currentBuildingId: this.isBuildingValid(this.currentBuilding) ? this.currentBuilding.id : null,
      edge: this.spawnEdge,
      formationOffset: this.formationOffset,
      flashRemaining: this.flashRemaining,
      flashCount: this.flashCount,
      terrainSlideSide: this.terrainSlideSide,
      gapBlockerId: this.gapBlockerId,
      gapWaypoint: vectorSnapshot(this.gapWaypoint),
      watchdogElapsed: this.watchdogElapsed,
      watchdogAnchor: vectorSnapshot(this.watchdogAnchor),
      watchdogTrips: this.watchdogTrips,
      gnawTargetId: this.isBuildingValid(this.gnawTarget) ? this.gnawTarget.id : null,
      gnawing: this.gnawing,
      scripted: this.scripted,
      scriptedSpeed: this.scriptedSpeed,
      scriptedIgnoresTerrain: this.scriptedIgnoresTerrain,
      scriptedRoute: this.scriptedRoute.map(vectorSnapshot),
      scriptedRouteIndex: this.scriptedRouteIndex,
      railcarEnteredField: this.railcarEnteredFieldValue,
      position: vectorSnapshot(this.group.position),
      velocity: vectorSnapshot(this.velocity),
      leadVelocity: vectorSnapshot(this.leadVelocity),
      heading: vectorSnapshot(this.heading),
      scriptedTarget: vectorSnapshot(this.scriptedTarget),
      rotationY: this.group.rotation.y,
      spriteClip: this.spriteClip,
      spriteOrientation: this.spriteOrientation,
    };
  }

  restoreRuntime(snapshot: EnemySuspendSnapshot, refs: EnemySuspendRestoreRefs = {}): void {
    this.alive = true;
    this.hp = snapshot.hp;
    this.maxHpValue = snapshot.maxHp;
    this.speed = snapshot.speed;
    this.elite = snapshot.eliteKind;
    this.visualScaleValue = snapshot.visualScale;
    this.banner = snapshot.banner;
    this.contactDamageScaleValue = snapshot.contactDamageScale;
    this.buildingDamageScaleValue = snapshot.buildingDamageScale;
    this.supportBuildingDamageScaleValue = snapshot.supportBuildingDamageScale;
    this.heroPursuitRangeValue = snapshot.heroPursuitRange;
    this.variantIdValue = snapshot.variantId;
    this.variantLabelValue = snapshot.variantLabel;
    this.variantTintColorValue = snapshot.variantTint ? new THREE.Color(snapshot.variantTint) : null;
    this.boltDamageMultValue = snapshot.boltDamageMult;
    this.bossGroupIdValue = snapshot.bossGroupId;
    this.bossGroupSizeValue = snapshot.bossGroupSize;
    this.bossGroupTotalHpValue = snapshot.bossGroupTotalHp;
    this.bossComponentIdValue = snapshot.bossComponentId;
    this.bossComponentLabelValue = snapshot.bossComponentLabel;
    this.bossDegradeSpeedMultValue = snapshot.bossDegradeSpeedMult;
    this.activationDelay = snapshot.activationDelay;
    this.contactCooldown = snapshot.contactCooldown;
    this.thief = snapshot.thief;
    this.wrecker = snapshot.wrecker;
    this.carriedLanternValue = snapshot.carriedLantern;
    this.thiefState = snapshot.thiefState;
    this.wreckerState = snapshot.wreckerState;
    this.carriedGold = snapshot.carriedGold;
    this.grabTimer = snapshot.grabTimer;
    this.swingTimer = snapshot.swingTimer;
    this.retargetTimer = snapshot.retargetTimer;
    this.wreckerRetargetTimer = snapshot.wreckerRetargetTimer;
    this.currentHolding = snapshot.currentHoldingId ? refs.goldHoldingById?.(snapshot.currentHoldingId) ?? null : null;
    this.currentBuilding = snapshot.currentBuildingId ? refs.buildingById?.(snapshot.currentBuildingId) ?? null : null;
    this.spawnEdge = snapshot.edge;
    this.formationOffset = snapshot.formationOffset;
    this.flashRemaining = snapshot.flashRemaining;
    this.flashCount = snapshot.flashCount;
    this.terrainSlideSide = snapshot.terrainSlideSide;
    this.scripted = snapshot.scripted;
    this.scriptedSpeed = snapshot.scriptedSpeed;
    this.scriptedIgnoresTerrain = snapshot.scriptedIgnoresTerrain;
    this.scriptedRoute.length = 0;
    for (const point of snapshot.scriptedRoute) this.scriptedRoute.push(new THREE.Vector3(point.x, point.y, point.z));
    this.scriptedRouteIndex = Math.max(0, Math.min(snapshot.scriptedRouteIndex, Math.max(0, this.scriptedRoute.length - 1)));
    this.railcarEnteredFieldValue = snapshot.railcarEnteredField;
    this.group.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
    this.velocity.set(snapshot.velocity.x, snapshot.velocity.y, snapshot.velocity.z);
    this.leadVelocity.set(snapshot.leadVelocity.x, snapshot.leadVelocity.y, snapshot.leadVelocity.z);
    this.heading.set(snapshot.heading.x, snapshot.heading.y, snapshot.heading.z);
    this.scriptedTarget.set(snapshot.scriptedTarget.x, snapshot.scriptedTarget.y, snapshot.scriptedTarget.z);
    this.gapBlockerId = snapshot.gapBlockerId;
    this.gapWaypoint.set(snapshot.gapWaypoint.x, snapshot.gapWaypoint.y, snapshot.gapWaypoint.z);
    this.watchdogElapsed = snapshot.watchdogElapsed;
    this.watchdogAnchor.set(snapshot.watchdogAnchor.x, snapshot.watchdogAnchor.y, snapshot.watchdogAnchor.z);
    this.watchdogTrips = snapshot.watchdogTrips;
    this.gnawTarget = snapshot.gnawTargetId ? refs.buildingById?.(snapshot.gnawTargetId) ?? null : null;
    this.gnawing = snapshot.gnawing && this.isBuildingValid(this.gnawTarget);
    this.group.rotation.y = snapshot.rotationY;
    this.group.visible = true;
    this.spriteClip = snapshot.spriteClip;
    this.spriteOrientation = snapshot.spriteOrientation;
    this.orientationResolver.reset(snapshot.spriteOrientation);
    const orientationAngle = rotationDirections.indexOf(snapshot.spriteOrientation) * (Math.PI / 4);
    this.orientationResolver.resolve(Math.sin(orientationAngle), Math.cos(orientationAngle));
  }

  spawn(position: THREE.Vector3, params: EnemySpawnParams = {}): void {
    this.alive = true;
    this.maxHpValue = Balance.enemy.hp * (params.hpScale ?? 1);
    this.hp = this.maxHpValue;
    this.speed = Balance.enemy.speed * (params.speedScale ?? 1);
    this.elite = params.eliteKind ?? null;
    this.visualScaleValue = Math.max(0.1, params.visualScale ?? 1);
    this.banner = params.banner === true;
    this.contactDamageScaleValue = Math.max(0, params.contactDamageScale ?? 1);
    this.buildingDamageScaleValue = Math.max(0, params.buildingDamageScale ?? 1);
    this.supportBuildingDamageScaleValue = Math.max(0, params.supportBuildingDamageScale ?? params.buildingDamageScale ?? 1);
    this.heroPursuitRangeValue = Math.max(0, params.heroPursuitRange ?? 0);
    this.variantIdValue = params.variantId ?? null;
    this.variantLabelValue = params.variantLabel ?? null;
    this.variantTintColorValue = params.tint ? new THREE.Color(params.tint) : null;
    this.boltDamageMultValue = Math.max(0, params.boltDamageMult ?? 1);
    this.bossGroupIdValue = params.bossGroupId ?? null;
    this.bossGroupSizeValue = Math.max(0, Math.floor(params.bossGroupSize ?? 0));
    this.bossGroupTotalHpValue = Math.max(0, params.bossGroupTotalHp ?? 0);
    this.bossComponentIdValue = params.bossComponentId ?? null;
    this.bossComponentLabelValue = params.bossComponentLabel ?? null;
    this.bossDegradeSpeedMultValue = Math.max(0, params.bossDegradeSpeedMult ?? 1);
    this.activationDelay = Math.max(0, params.activationDelay ?? 0);
    this.contactCooldown = 0;
    this.thief = params.thief === true;
    this.wrecker = !this.thief && params.wrecker === true;
    this.carriedLanternValue = params.carriedLantern === true;
    this.thiefState = this.thief ? 'seekHolding' : 'none';
    this.wreckerState = this.wrecker ? 'seekBuilding' : 'none';
    this.carriedGold = 0;
    this.grabTimer = 0;
    this.swingTimer = 0;
    this.retargetTimer = 0;
    this.wreckerRetargetTimer = 0;
    this.currentHolding = null;
    this.currentBuilding = null;
    this.spawnEdge = params.edge ?? null;
    this.formationOffset = seededOffset(params.formationSeed ?? this.id);
    this.flashRemaining = 0;
    this.terrainSlideSide = 0;
    this.resetGapFlow();
    this.watchdogTrips = 0;
    this.scripted = false;
    this.scriptedSpeed = 0;
    this.railcarEnteredFieldValue = false;
    this.velocity.set(0, 0, 0);
    this.leadVelocity.set(0, 0, 0);
    this.heading.set(0, 0, -1);
    this.orientationResolver.reset();
    this.spriteOrientation = 's';
    this.spriteClip = 'walk';
    this.group.position.copy(position);
    this.syncVisualY();
    this.group.rotation.y = 0;
    this.group.visible = true;
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3,
    separationX: number,
    separationZ: number,
    formationSeparationX: number,
    formationSeparationZ: number,
    blockers: readonly PalisadeBlocker[] = [],
    thiefContext?: ThiefUpdateContext,
    wreckerContext?: WreckerUpdateContext,
    movementSpeedMultiplier = 1,
  ): boolean {
    if (!this.alive) return false;

    const previousX = this.group.position.x;
    const previousZ = this.group.position.z;
    this.contactCooldown = Math.max(0, this.contactCooldown - delta);
    this.flashRemaining = Math.max(0, this.flashRemaining - delta);
    if (this.activationDelay > 0) {
      this.activationDelay = Math.max(0, this.activationDelay - delta);
      this.velocity.set(0, 0, 0);
      this.leadVelocity.set(0, 0, 0);
      this.spriteOrientation = this.orientationResolver.idleDirection();
      this.syncVisualY();
      return false;
    }

    const scriptedRailRoute = this.scripted && this.scriptedIgnoresTerrain;
    const targetPosition = this.scripted ? this.scriptedTarget : this.chooseTarget(delta, heroPosition, thiefContext, wreckerContext);
    const escortRailTarget = this.currentBuilding?.id === 'escort:ore-cart';
    const gapTarget = !this.scripted && !this.thief && !this.wrecker
      ? this.updateGapFlow(delta, targetPosition, wreckerContext)
      : targetPosition;
    const moveTarget = scriptedRailRoute || escortRailTarget ? gapTarget : this.terrainAwareTarget(this.routedTarget(gapTarget));
    const speed = (this.scripted ? this.scriptedSpeed : this.thiefState === 'fleeing' ? this.speed * Balance.steal.fleeSpeedMult : this.speed)
      * Math.max(0, movementSpeedMultiplier);

    this.heading.set(moveTarget.x - this.group.position.x, 0, moveTarget.z - this.group.position.z);
    const distanceSq = this.heading.lengthSq();
    if (distanceSq > 0.0001) {
      this.heading.normalize();
    } else {
      this.heading.set(0, 0, 0);
    }

    if (scriptedRailRoute) {
      this.velocity.copy(this.heading);
    } else {
      const spread = safeFormationSpread();
      const lateralOffset = THREE.MathUtils.clamp(this.formationOffset, -spread, spread);
      let spreadBiasX = 0;
      let spreadBiasZ = 0;
      if (spread > 0) {
        if (Math.abs(this.heading.z) >= Math.abs(this.heading.x)) {
          spreadBiasX = THREE.MathUtils.clamp((moveTarget.x + lateralOffset - this.group.position.x) / spread, -1, 1) * FORMATION_STEER;
        } else {
          let laneZ = moveTarget.z + lateralOffset;
          const currentSide = riverSide(this.group.position.z);
          if (Balance.pathing.riverBlocksEnemies && currentSide === 'north') {
            laneZ = Math.max(laneZ, Terrain.RIVER_MAX_Z + FORMATION_GAP_CLEARANCE);
          } else if (Balance.pathing.riverBlocksEnemies && currentSide === 'south') {
            laneZ = Math.min(laneZ, Terrain.RIVER_MIN_Z - FORMATION_GAP_CLEARANCE);
          }
          spreadBiasZ = THREE.MathUtils.clamp((laneZ - this.group.position.z) / spread, -1, 1) * FORMATION_STEER;
        }
      }
      this.velocity.set(
        this.heading.x +
          spreadBiasX +
          separationX * Balance.enemy.separationStrength +
          formationSeparationX * Balance.enemy.formationSeparationStrength,
        0,
        this.heading.z +
          spreadBiasZ +
          separationZ * Balance.enemy.separationStrength +
          formationSeparationZ * Balance.enemy.formationSeparationStrength,
      );
    }
    if (this.velocity.lengthSq() > 1) this.velocity.normalize();

    if (this.thiefState === 'grabbing' || this.wreckerState === 'swinging' || this.gnawing) {
      this.velocity.set(0, 0, 0);
    } else if (scriptedRailRoute) {
      this.moveScripted(delta, speed, moveTarget);
    } else if (escortRailTarget) {
      this.moveIgnoringTerrain(delta, speed, moveTarget);
    } else {
      this.move(delta, blockers, speed, moveTarget);
    }
    this.syncVisualY();
    if (delta > 0) {
      this.leadVelocity.set((this.group.position.x - previousX) / delta, 0, (this.group.position.z - previousZ) / delta);
    } else {
      this.leadVelocity.set(0, 0, 0);
    }

    if (this.velocity.lengthSq() > 0.0025) {
      this.group.rotation.y = Math.atan2(this.velocity.x, -this.velocity.z);
      this.spriteOrientation = this.orientationResolver.resolve(this.velocity.x, this.velocity.z);
    } else {
      this.spriteOrientation = this.orientationResolver.idleDirection();
    }

    const touchRadius = Balance.hero.radius + this.hitRadius;
    const dx = heroPosition.x - this.group.position.x;
    const dz = heroPosition.z - this.group.position.z;
    if (this.contactCooldown <= 0 && dx * dx + dz * dz <= touchRadius * touchRadius) {
      this.contactCooldown = Balance.enemy.contactCooldown;
      return true;
    }

    if (this.thiefState === 'fleeing' && this.reachedFleeEdge()) {
      thiefContext?.onThiefFled(this);
    }

    return false;
  }

  takeDamage(amount: number): boolean {
    if (!this.alive) return false;
    if (amount > 0 && Balance.combatReadability.enemyFlashSeconds > 0 && Balance.combatReadability.enemyFlashIntensity > 0) {
      this.flashRemaining = Balance.combatReadability.enemyFlashSeconds;
      this.flashCount += 1;
    }
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  applyBossDegradation(speedMult: number): void {
    if (!this.alive) return;
    const clamped = THREE.MathUtils.clamp(speedMult, 0.1, 1);
    this.speed *= clamped;
    this.scriptedSpeed *= clamped;
  }

  recycle(): void {
    this.alive = false;
    this.hp = 0;
    this.maxHpValue = 0;
    this.elite = null;
    this.visualScaleValue = 1;
    this.banner = false;
    this.contactDamageScaleValue = 1;
    this.buildingDamageScaleValue = 1;
    this.supportBuildingDamageScaleValue = 1;
    this.heroPursuitRangeValue = 0;
    this.variantIdValue = null;
    this.variantLabelValue = null;
    this.variantTintColorValue = null;
    this.boltDamageMultValue = 1;
    this.bossGroupIdValue = null;
    this.bossGroupSizeValue = 0;
    this.bossGroupTotalHpValue = 0;
    this.bossComponentIdValue = null;
    this.bossComponentLabelValue = null;
    this.bossDegradeSpeedMultValue = 1;
    this.activationDelay = 0;
    this.contactCooldown = 0;
    this.thief = false;
    this.wrecker = false;
    this.carriedLanternValue = false;
    this.thiefState = 'none';
    this.wreckerState = 'none';
    this.carriedGold = 0;
    this.grabTimer = 0;
    this.swingTimer = 0;
    this.retargetTimer = 0;
    this.wreckerRetargetTimer = 0;
    this.currentHolding = null;
    this.currentBuilding = null;
    this.spawnEdge = null;
    this.formationOffset = 0;
    this.flashRemaining = 0;
    this.terrainSlideSide = 0;
    this.resetGapFlow();
    this.watchdogTrips = 0;
    this.scripted = false;
    this.scriptedSpeed = 0;
    this.scriptedIgnoresTerrain = false;
    this.scriptedRoute.length = 0;
    this.scriptedRouteIndex = 0;
    this.railcarEnteredFieldValue = false;
    this.velocity.set(0, 0, 0);
    this.leadVelocity.set(0, 0, 0);
    this.orientationResolver.reset();
    this.spriteOrientation = 's';
    this.spriteClip = 'idle';
    this.group.visible = false;
    this.group.position.set(0, Balance.enemy.groundY, 0);
  }

  dispose(): void {
    this.group.clear();
  }

  releaseCarriedGold(): number {
    const amount = this.carriedGold;
    this.carriedGold = 0;
    if (this.thief) this.thiefState = 'seekHolding';
    return amount;
  }

  scriptMoveTo(x: number, z: number, speed: number, options?: { ignoreTerrain?: boolean }): void {
    this.scriptedTarget.set(x, Balance.enemy.groundY, z);
    this.scriptedSpeed = Math.max(0, speed);
    this.scripted = true;
    this.scriptedIgnoresTerrain = options?.ignoreTerrain === true;
    this.scriptedRoute.length = 0;
    this.scriptedRouteIndex = 0;
  }

  scriptMoveRoute(
    points: readonly { x: number; z: number }[],
    speed: number,
    options?: { ignoreTerrain?: boolean; offsetX?: number; offsetZ?: number },
  ): void {
    this.scriptedRoute.length = 0;
    const offsetX = options?.offsetX ?? 0;
    const offsetZ = options?.offsetZ ?? 0;
    for (const point of points) this.scriptedRoute.push(new THREE.Vector3(point.x + offsetX, Balance.enemy.groundY, point.z + offsetZ));
    this.scriptedSpeed = Math.max(0, speed);
    this.scripted = this.scriptedRoute.length > 0;
    this.scriptedIgnoresTerrain = options?.ignoreTerrain === true;
    this.scriptedRouteIndex = Math.min(1, Math.max(0, this.scriptedRoute.length - 1));
    const target = this.scriptedRoute[this.scriptedRouteIndex];
    if (target) this.scriptedTarget.copy(target);
  }

  private updateThief(delta: number, context?: ThiefUpdateContext): THREE.Vector3 | null {
    if (!this.thief || !context) return null;

    if (this.carriedGold > 0) {
      this.thiefState = 'fleeing';
      this.spriteClip = 'flee';
      this.updateFleeTarget();
      return this.fleeTarget;
    }

    if (this.thiefState === 'grabbing') {
      this.spriteClip = 'grab';
      this.grabTimer = Math.max(0, this.grabTimer - delta);
      if (this.grabTimer <= 0) {
        const holding = this.currentHolding;
        const amount = holding?.active === true ? context.claimGold(this, holding) : 0;
        if (amount > 0) {
          this.carriedGold = amount;
          this.thiefState = 'fleeing';
          this.currentHolding = null;
          this.updateFleeTarget();
          this.spriteClip = 'flee';
          return this.fleeTarget;
        }
        this.thiefState = 'seekHolding';
        this.currentHolding = null;
        this.retargetTimer = 0;
      }
      return this.currentHolding?.position ?? null;
    }

    this.thiefState = 'seekHolding';
    this.retargetTimer = Math.max(0, this.retargetTimer - delta);
    if (!this.isHoldingValid(this.currentHolding) || this.retargetTimer <= 0) {
      this.currentHolding = context.nearestGoldHolding(this.group.position);
      this.retargetTimer = THIEF_RETARGET_SECONDS;
    }

    if (!this.isHoldingValid(this.currentHolding)) {
      this.currentHolding = null;
      this.spriteClip = 'walk';
      return null;
    }

    const dx = this.currentHolding.position.x - this.group.position.x;
    const dz = this.currentHolding.position.z - this.group.position.z;
    if (dx * dx + dz * dz <= Balance.steal.grabRadius * Balance.steal.grabRadius) {
      this.thiefState = 'grabbing';
      this.grabTimer = Balance.steal.grabSeconds;
      this.spriteClip = 'grab';
    } else {
      this.spriteClip = 'walk';
    }
    return this.currentHolding.position;
  }

  private isHoldingValid(holding: GoldHolding | null): holding is GoldHolding {
    return holding?.active === true && holding.amount > 0;
  }

  private chooseTarget(
    delta: number,
    heroPosition: THREE.Vector3,
    thiefContext?: ThiefUpdateContext,
    wreckerContext?: WreckerUpdateContext,
  ): THREE.Vector3 {
    const thiefTarget = this.updateThief(delta, thiefContext);
    if (thiefTarget) return thiefTarget;
    if (this.wrecker && this.shouldPursueHero(heroPosition)) {
      this.currentBuilding = null;
      this.wreckerState = 'seekBuilding';
      this.spriteClip = 'walk';
      return heroPosition;
    }
    return this.updateWrecker(delta, wreckerContext) ?? heroPosition;
  }

  private shouldPursueHero(heroPosition: THREE.Vector3): boolean {
    if (this.heroPursuitRangeValue <= 0) return false;
    const dx = heroPosition.x - this.group.position.x;
    const dz = heroPosition.z - this.group.position.z;
    return dx * dx + dz * dz <= this.heroPursuitRangeValue * this.heroPursuitRangeValue;
  }

  private updateGapFlow(delta: number, target: THREE.Vector3, context?: WreckerUpdateContext): THREE.Vector3 {
    if (!context) {
      this.resetGapFlow();
      return target;
    }
    const clearance = Balance.palisade.avoidancePad + this.hitRadius - Balance.enemy.touchRadius;
    const route = context.palisadeRoute(this.group.position, target, clearance);
    if (!route) {
      this.resetGapFlow();
      return target;
    }

    if (this.gnawTarget) {
      if (route.open || route.blocker !== this.gnawTarget || !this.isBuildingValid(this.gnawTarget)) {
        this.gnawTarget = null;
        this.gnawing = false;
      } else if (this.distanceSqToBuilding(this.gnawTarget) <= Balance.wreck.reach * Balance.wreck.reach) {
        this.gnawing = true;
        this.spriteClip = 'grab';
        this.swingTimer -= delta;
        if (this.swingTimer <= 0) {
          context.hitBuilding(this, this.gnawTarget, this.buildingDamageFor(this.gnawTarget.family) * Balance.wreck.gnawMult);
          this.swingTimer += Balance.wreck.hitCooldown;
        }
        return this.gnawTarget.position;
      } else {
        this.gnawing = false;
      }
    }

    if (this.gapBlockerId !== route.routeId) {
      const startingRun = this.gapBlockerId === null;
      this.gapBlockerId = route.routeId;
      if (startingRun) {
        this.watchdogAnchor.copy(this.group.position);
        this.watchdogElapsed = 0;
      }
      this.gapWaypoint.set(route.waypoint.x, Balance.enemy.groundY, route.waypoint.z);
    } else if (
      (this.group.position.x - this.gapWaypoint.x) ** 2 + (this.group.position.z - this.gapWaypoint.z) ** 2 <= 0.3 * 0.3
    ) {
      this.gapWaypoint.set(route.waypoint.x, Balance.enemy.groundY, route.waypoint.z);
    }

    const displacementSq = this.group.position.distanceToSquared(this.watchdogAnchor);
    if (displacementSq >= Balance.pathing.stuckWatchdogDisplacement ** 2) {
      this.watchdogAnchor.copy(this.group.position);
      this.watchdogElapsed = 0;
    } else {
      this.watchdogElapsed += delta;
    }
    if (this.watchdogElapsed >= Balance.pathing.stuckWatchdogSeconds) {
      this.watchdogTrips += 1;
      this.watchdogElapsed = 0;
      this.gnawTarget = route.blocker;
      this.gnawing = this.distanceSqToBuilding(route.blocker) <= Balance.wreck.reach * Balance.wreck.reach;
      this.swingTimer = 0;
      this.spriteClip = this.gnawing ? 'grab' : 'walk';
      return route.blocker.position;
    }

    this.spriteClip = 'walk';
    return this.gapWaypoint;
  }

  private resetGapFlow(): void {
    this.gapBlockerId = null;
    this.watchdogElapsed = 0;
    this.watchdogAnchor.copy(this.group.position);
    this.gnawTarget = null;
    this.gnawing = false;
  }

  private updateWrecker(delta: number, context?: WreckerUpdateContext): THREE.Vector3 | null {
    if (!this.wrecker || !context) return null;

    this.wreckerRetargetTimer = Math.max(0, this.wreckerRetargetTimer - delta);
    if (!this.isBuildingValid(this.currentBuilding) || this.wreckerRetargetTimer <= 0) {
      this.currentBuilding = context.nearestBuilding(this.group.position);
      this.wreckerRetargetTimer = WRECKER_RETARGET_SECONDS;
    }

    if (!this.isBuildingValid(this.currentBuilding)) {
      this.currentBuilding = null;
      this.wreckerState = 'seekBuilding';
      this.spriteClip = 'walk';
      return null;
    }

    const reach = this.wreckerReach();
    if (this.distanceSqToBuilding(this.currentBuilding) <= reach * reach) {
      this.wreckerState = 'swinging';
      this.spriteClip = 'grab';
      this.swingTimer -= delta;
      if (this.swingTimer <= 0) {
        context.hitBuilding(this, this.currentBuilding);
        this.swingTimer += Balance.wreck.hitCooldown;
        if (!this.isBuildingValid(this.currentBuilding)) {
          this.currentBuilding = null;
          this.wreckerState = 'seekBuilding';
          this.wreckerRetargetTimer = 0;
        }
      }
    } else {
      this.wreckerState = 'seekBuilding';
      this.spriteClip = 'walk';
    }
    return this.currentBuilding?.position ?? null;
  }

  private isBuildingValid(building: BuildingTarget | null): building is BuildingTarget {
    return building?.active === true && building.hp > 0;
  }

  private distanceSqToBuilding(building: BuildingTarget): number {
    const dx = Math.max(Math.abs(this.group.position.x - building.position.x) - building.halfX, 0);
    const dz = Math.max(Math.abs(this.group.position.z - building.position.z) - building.halfZ, 0);
    return dx * dx + dz * dz;
  }

  private wreckerReach(): number {
    return Balance.wreck.reach * Math.max(1, this.visualScaleValue);
  }

  private updateFleeTarget(): void {
    const edge = this.spawnEdge ?? this.nearestEdge();
    if (edge === 'north') this.fleeTarget.set(this.group.position.x, Balance.enemy.groundY, FLEE_EDGE);
    else if (edge === 'south') this.fleeTarget.set(this.group.position.x, Balance.enemy.groundY, -FLEE_EDGE);
    else if (edge === 'east') this.fleeTarget.set(FLEE_EDGE, Balance.enemy.groundY, this.group.position.z);
    else this.fleeTarget.set(-FLEE_EDGE, Balance.enemy.groundY, this.group.position.z);
  }

  private reachedFleeEdge(): boolean {
    const edge = this.spawnEdge ?? this.nearestEdge();
    return (
      (edge === 'north' && this.group.position.z >= FLEE_EDGE - 0.2) ||
      (edge === 'south' && this.group.position.z <= -FLEE_EDGE + 0.2) ||
      (edge === 'east' && this.group.position.x >= FLEE_EDGE - 0.2) ||
      (edge === 'west' && this.group.position.x <= -FLEE_EDGE + 0.2)
    );
  }

  private nearestEdge(): CompassEdge {
    const north = FLEE_EDGE - this.group.position.z;
    const south = this.group.position.z + FLEE_EDGE;
    const east = FLEE_EDGE - this.group.position.x;
    const west = this.group.position.x + FLEE_EDGE;
    const best = Math.min(north, south, east, west);
    if (best === north) return 'north';
    if (best === south) return 'south';
    if (best === east) return 'east';
    return 'west';
  }

  private routedTarget(target: THREE.Vector3): THREE.Vector3 {
    if (!Balance.pathing.riverBlocksEnemies) return target;

    const current = this.group.position;
    const currentSample = Terrain.sample(current.x, current.z);
    const currentZone = currentSample.zone;
    const targetSide = riverSide(target.z);
    const ford = Terrain.nearestFordRange(current.x);
    if (currentZone === 'ford') {
      if (targetSide === 'north' && current.z < Terrain.RIVER_MAX_Z - 0.1) {
        return this.routeTarget.set(ford.centerX, Balance.enemy.groundY, Terrain.RIVER_MAX_Z);
      }
      if (targetSide === 'south' && current.z > Terrain.RIVER_MIN_Z + 0.1) {
        return this.routeTarget.set(ford.centerX, Balance.enemy.groundY, Terrain.RIVER_MIN_Z);
      }
      return target;
    }

    const currentSide = riverSide(current.z);
    if (currentSide && targetSide && currentSide !== targetSide && riverBlocksEnemyCrossingAt(current.x)) {
      const entryZ =
        currentSide === 'north' ? Terrain.RIVER_MAX_Z - FORD_ENTRY_INSET : Terrain.RIVER_MIN_Z + FORD_ENTRY_INSET;
      return this.routeTarget.set(ford.centerX, Balance.enemy.groundY, entryZ);
    }

    if (currentZone === 'river' && riverBlocksEnemyAt(current.x, current.z)) {
      return this.routeTarget.set(THREE.MathUtils.clamp(current.x, ford.minX, ford.maxX), Balance.enemy.groundY, current.z);
    }

    return target;
  }

  private terrainAwareTarget(target: THREE.Vector3): THREE.Vector3 {
    if (!hasElevationTile()) return target;
    const detour = terrainDetourWaypoint(this.group.position.x, this.group.position.z, target.x, target.z);
    if (!detour) return target;
    return this.terrainRouteTarget.set(detour.x, Balance.enemy.groundY, detour.z);
  }

  private move(delta: number, blockers: readonly PalisadeBlocker[], speed: number, moveTarget: THREE.Vector3): void {
    const elevation = hasElevationTile();
    if (!elevation) {
      const maxDistance = speed * delta;
      const steps = blockers.length > 0 || Balance.pathing.riverBlocksEnemies ? Math.max(1, Math.min(8, Math.ceil(maxDistance / 0.25))) : 1;
      const stepDelta = delta / steps;
      for (let step = 0; step < steps; step += 1) {
        const waterSpeed = ENEMY_FLAT_WATER_SPEED ? Terrain.sample(this.group.position.x, this.group.position.z).speedMul : 1;
        const stepDistance = speed * waterSpeed * stepDelta;
        this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, stepDistance);
        for (const blocker of blockers) this.resolveBlocker(blocker, stepDistance);
        this.resolveRiver(stepDistance);
        this.group.position.copy(this.nextPosition);
      }
      return;
    }

    const maxDistance = speed * Balance.terrainSim.downhillMax * delta;
    const steps = Math.max(1, Math.min(8, Math.ceil(maxDistance / 0.25)));
    const stepDelta = delta / steps;
    for (let step = 0; step < steps; step += 1) {
      const waterSpeed = Terrain.sample(this.group.position.x, this.group.position.z).speedMul;
      const stepDistance =
        speed * waterSpeed * terrainSpeedMultiplier(this.group.position.x, this.group.position.z, this.velocity.x, this.velocity.z) * stepDelta;
      this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, stepDistance);
      for (const blocker of blockers) this.resolveBlocker(blocker, stepDistance);
      this.resolveRiver(stepDistance);
      this.resolveTerrain(moveTarget);
      this.group.position.copy(this.nextPosition);
    }
  }

  private moveScripted(delta: number, speed: number, moveTarget: THREE.Vector3): void {
    const stepDistance = Math.max(0, speed * delta);
    if (stepDistance <= 0) return;
    // Arrival must be checked BEFORE the velocity guard: within the heading epsilon the
    // velocity zeroes, and the final snap would otherwise be unreachable (planar law).
    const remainingX = moveTarget.x - this.group.position.x;
    const remainingZ = moveTarget.z - this.group.position.z;
    const remainingSq = remainingX * remainingX + remainingZ * remainingZ;
    if (remainingSq <= stepDistance * stepDistance) {
      this.group.position.x = moveTarget.x;
      this.group.position.z = moveTarget.z;
      this.advanceScriptedRoute();
      return;
    }
    if (this.velocity.lengthSq() <= 0.0001) return;
    this.group.position.addScaledVector(this.velocity, stepDistance);
  }

  private moveIgnoringTerrain(delta: number, speed: number, target: THREE.Vector3): void {
    const distance = Math.hypot(target.x - this.group.position.x, target.z - this.group.position.z);
    const step = Math.min(distance, Math.max(0, speed * delta));
    this.group.position.addScaledVector(this.velocity, step);
  }

  private advanceScriptedRoute(): void {
    if (this.scriptedRoute.length < 2) return;
    if (this.scriptedRouteIndex >= this.scriptedRoute.length - 1) {
      this.scriptedRoute.reverse();
      this.scriptedRouteIndex = 1;
    } else {
      this.scriptedRouteIndex += 1;
    }
    const target = this.scriptedRoute[this.scriptedRouteIndex];
    if (target) this.scriptedTarget.copy(target);
  }

  private resolveTerrain(moveTarget: THREE.Vector3): void {
    const previous = this.group.position;
    const stepX = this.nextPosition.x - previous.x;
    const stepZ = this.nextPosition.z - previous.z;
    const stepDistance = Math.hypot(stepX, stepZ);
    const goalX = moveTarget.x - previous.x;
    const goalZ = moveTarget.z - previous.z;
    const northSouth = Math.abs(goalZ) >= Math.abs(goalX);
    const tangentX = northSouth ? 1 : 0;
    const tangentZ = northSouth ? 0 : 1;
    const goalDistance = Math.hypot(goalX, goalZ);
    let obstacleAhead = false;

    if (Terrain.sample(this.nextPosition.x, this.nextPosition.z).walkable) {
      if (stepDistance <= 0.000001 || goalDistance <= 0.000001) return;
      const lookahead = Math.max(0.6, stepDistance * 2);
      const aheadX = previous.x + (goalX / goalDistance) * lookahead;
      const aheadZ = previous.z + (goalZ / goalDistance) * lookahead;
      if (Terrain.sample(aheadX, aheadZ).walkable) {
        this.terrainSlideSide = 0;
        return;
      }
      if (this.terrainSlideSide === 0) {
        this.terrainSlideSide = (northSouth ? Math.sign(previous.x) : Math.sign(previous.z)) || this.avoidanceSide();
      }
      obstacleAhead = true;
      this.nextPosition.set(
        previous.x + tangentX * this.terrainSlideSide * stepDistance,
        this.nextPosition.y,
        previous.z + tangentZ * this.terrainSlideSide * stepDistance,
      );
    }

    if (this.terrainSlideSide === 0) {
      this.terrainSlideSide = (northSouth ? Math.sign(previous.x) : Math.sign(previous.z)) || this.avoidanceSide();
    }
    if (stepDistance > 0.000001 && goalDistance > 0.000001) {
      const lookahead = Math.max(0.6, stepDistance * 2);
      const aheadX = previous.x + (goalX / goalDistance) * lookahead;
      const aheadZ = previous.z + (goalZ / goalDistance) * lookahead;
      obstacleAhead ||= !Terrain.sample(aheadX, aheadZ).walkable;
    }
    const probe = 0.4;
    const sideWalkable = Terrain.sample(
      previous.x + tangentX * this.terrainSlideSide * probe,
      previous.z + tangentZ * this.terrainSlideSide * probe,
    ).walkable;
    let fallbackX = tangentX * this.terrainSlideSide;
    let fallbackZ = tangentZ * this.terrainSlideSide;
    if (!sideWalkable) {
      fallbackX += northSouth ? 0 : -Math.sign(goalX || 1) * 0.75;
      fallbackZ += northSouth ? -Math.sign(goalZ || 1) * 0.75 : 0;
      const fallbackLength = Math.hypot(fallbackX, fallbackZ);
      if (fallbackLength > 0.000001) {
        fallbackX /= fallbackLength;
        fallbackZ /= fallbackLength;
      }
    }
    if (obstacleAhead && stepDistance > 0.000001) {
      this.nextPosition.set(previous.x + fallbackX * stepDistance, this.nextPosition.y, previous.z + fallbackZ * stepDistance);
    }
    const resolved = resolveTerrainMove(previous.x, previous.z, this.nextPosition.x, this.nextPosition.z, (x, z) => Terrain.sample(x, z).walkable, {
      x: moveTarget.x,
      z: moveTarget.z,
      fallbackX,
      fallbackZ,
    });
    this.nextPosition.set(resolved.x, this.nextPosition.y, resolved.z);
  }

  private resolveRiver(stepDistance: number): void {
    if (!Balance.pathing.riverBlocksEnemies || !riverBlocksEnemyAt(this.nextPosition.x, this.nextPosition.z)) return;

    const outsideNudge = 0.05;
    const previous = this.group.position;
    if (previous.z <= Terrain.RIVER_MIN_Z) {
      this.nextPosition.z = Terrain.RIVER_MIN_Z - outsideNudge;
      const ford = Terrain.nearestFordRange(previous.x);
      this.nextPosition.x += Math.sign(ford.centerX - this.nextPosition.x || this.avoidanceSide()) * stepDistance * Balance.palisade.slideBias;
    } else if (previous.z >= Terrain.RIVER_MAX_Z) {
      this.nextPosition.z = Terrain.RIVER_MAX_Z + outsideNudge;
      const ford = Terrain.nearestFordRange(previous.x);
      this.nextPosition.x += Math.sign(ford.centerX - this.nextPosition.x || this.avoidanceSide()) * stepDistance * Balance.palisade.slideBias;
    } else {
      const ford = Terrain.nearestFordRange(previous.x);
      if (previous.x < ford.minX) {
        this.nextPosition.x = ford.minX + outsideNudge;
      } else if (previous.x > ford.maxX) {
        this.nextPosition.x = ford.maxX - outsideNudge;
      } else {
        this.nextPosition.x = THREE.MathUtils.clamp(this.nextPosition.x, ford.minX, ford.maxX);
      }
    }
  }

  private resolveBlocker(blocker: PalisadeBlocker, stepDistance: number): void {
    const pad = Balance.palisade.avoidancePad + this.hitRadius - Balance.enemy.touchRadius;
    const minX = blocker.x - blocker.halfX - pad;
    const maxX = blocker.x + blocker.halfX + pad;
    const minZ = blocker.z - blocker.halfZ - pad;
    const maxZ = blocker.z + blocker.halfZ + pad;
    const outsideNudge = 0.05;
    if (this.nextPosition.x < minX || this.nextPosition.x > maxX) return;
    if (this.nextPosition.z < minZ || this.nextPosition.z > maxZ) return;

    const previous = this.group.position;
    const fromWest = previous.x <= minX;
    const fromEast = previous.x >= maxX;
    const fromSouth = previous.z <= minZ;
    const fromNorth = previous.z >= maxZ;

    if (fromWest) {
      this.nextPosition.x = minX - outsideNudge;
      this.nextPosition.z += this.blockerSlideDirection('z') * stepDistance * Balance.palisade.slideBias;
    } else if (fromEast) {
      this.nextPosition.x = maxX + outsideNudge;
      this.nextPosition.z += this.blockerSlideDirection('z') * stepDistance * Balance.palisade.slideBias;
    } else if (fromSouth) {
      this.nextPosition.z = minZ - outsideNudge;
      this.nextPosition.x += this.blockerSlideDirection('x') * stepDistance * Balance.palisade.slideBias;
    } else if (fromNorth) {
      this.nextPosition.z = maxZ + outsideNudge;
      this.nextPosition.x += this.blockerSlideDirection('x') * stepDistance * Balance.palisade.slideBias;
    } else {
      const pushWest = Math.abs(this.nextPosition.x - minX);
      const pushEast = Math.abs(maxX - this.nextPosition.x);
      const pushSouth = Math.abs(this.nextPosition.z - minZ);
      const pushNorth = Math.abs(maxZ - this.nextPosition.z);
      const push = Math.min(pushWest, pushEast, pushSouth, pushNorth);
      if (push === pushWest) this.nextPosition.x = minX;
      else if (push === pushEast) this.nextPosition.x = maxX;
      else if (push === pushSouth) this.nextPosition.z = minZ;
      else this.nextPosition.z = maxZ;
    }
  }

  private blockerSlideDirection(axis: 'x' | 'z'): number {
    if (this.gapBlockerId !== null) {
      const delta = this.gapWaypoint[axis] - this.group.position[axis];
      return Math.abs(delta) > 0.01 ? Math.sign(delta) : 0;
    }
    return this.avoidanceSide();
  }

  private avoidanceSide(): number {
    return this.id % 2 === 0 ? 1 : -1;
  }

  private syncVisualY(): void {
    this.group.position.y = Terrain.visualY(this.group.position.x, this.group.position.z, Balance.enemy.groundY);
  }
}

function riverSide(z: number): 'north' | 'south' | null {
  if (z > Terrain.RIVER_MAX_Z) return 'north';
  if (z < Terrain.RIVER_MIN_Z) return 'south';
  return null;
}

function riverBlocksEnemyAt(x: number, z: number): boolean {
  const sample = Terrain.sample(x, z);
  return sample.zone === 'river' && !riverDepthWadeableForEnemy(sample.waterDepth);
}

function riverBlocksEnemyCrossingAt(x: number): boolean {
  const riverCenterZ = (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2;
  const sample = Terrain.sample(x, riverCenterZ);
  if (sample.zone !== 'ford') return sample.zone === 'river' && !riverDepthWadeableForEnemy(sample.waterDepth);
  const ford = Terrain.nearestFordRange(x);
  const westX = ford.minX - 0.5;
  const eastX = ford.maxX + 0.5;
  return riverBlocksEnemyAt(Math.abs(x - westX) < Math.abs(x - eastX) ? westX : eastX, riverCenterZ);
}

function riverDepthWadeableForEnemy(depth: number | undefined): boolean {
  return (depth ?? Number.POSITIVE_INFINITY) <= Balance.terrainSim.wadeDepth;
}

function vectorSnapshot(vector: THREE.Vector3): { x: number; y: number; z: number } {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function seededOffset(seed: number): number {
  const lane = (seed >>> 0) % FORMATION_LANES;
  const laneUnit = FORMATION_LANES <= 1 ? 0 : (lane / (FORMATION_LANES - 1)) * 2 - 1;
  return (laneUnit + hashUnit(seed) * FORMATION_JITTER) * Balance.enemy.formationSpreadWidth;
}

function hashUnit(seed: number): number {
  let value = Math.imul((seed >>> 0) ^ 0x9e3779b9, 0x85ebca6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35);
  value ^= value >>> 16;
  return ((value >>> 0) / 0xffffffff) * 2 - 1;
}

function safeFormationSpread(): number {
  const ringGap = Math.max(0, Balance.meta.territoryRingGapHalfWidth - FORMATION_GAP_CLEARANCE);
  const fordGap = Math.max(
    0,
    Math.min(...Terrain.fordRanges().map((range) => range.halfWidth), (Terrain.FORD_MAX_X - Terrain.FORD_MIN_X) * 0.5) -
      FORMATION_GAP_CLEARANCE,
  );
  return Math.min(Balance.enemy.formationSpreadWidth, ringGap, fordGap);
}

export function disposeClaimJumperAssets(assets: ClaimJumperAssets): void {
  assets.ponchoGeometry.dispose();
  assets.sackGeometry.dispose();
  assets.faceGeometry.dispose();
  assets.brimGeometry.dispose();
  assets.crownGeometry.dispose();
  assets.shadowGeometry.dispose();
  assets.ponchoMaterial.dispose();
  assets.sackMaterial.dispose();
  assets.faceMaterial.dispose();
  assets.hatMaterial.dispose();
  assets.shadowMaterial.dispose();
}
