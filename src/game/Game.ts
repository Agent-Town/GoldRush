import * as THREE from 'three';
import { applyGeneratedMap, disposeGeneratedAssets, generatedAssetRenderCounts, generatedAssetStatuses } from '../assets/generated';
import {
  beginSpriteStatsFrame,
  setSpriteTestClip,
  spriteAnimationDiagnostics,
  spriteStatsDiagnostics,
} from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder, type AssetSlotId } from '../assets/slots';
import { EventBus } from '../core/EventBus';
import {
  activeContract as selectActiveContract,
  activeContractDiagnostics,
  activeEpoch as selectActiveEpoch,
  activeTileDescriptor,
  DEFAULT_EPOCH_ID,
  listEpochs,
  loadEpoch,
  type ContractBaronTwist,
  type ContractLightKeyframe,
  type ContractManifest,
  type ContractPowerGrid,
  type RailPathDescriptor,
} from '../meta/ContractFamilies';
import {
  availablePicks,
  browserResearchStorage,
  contractTierForResearch,
  continuedStudyBonuses,
  hasResearchNode,
  loadResearchState,
  pinnedResearchPath,
  researchNodeById,
  saveResearchState,
  scienceMeter,
  skipResearchPick,
  takeNode,
  type ResearchUnlockFlags,
  type ResearchState,
} from '../meta/ResearchTree';
import {
  activeMegaprojectManifest,
  advanceMegaprojectBuild as advanceMegaprojectStateBuild,
  damageMegaprojectStage,
  ensureMegaprojectProject,
  fundMegaprojectStage as fundMegaprojectStateStage,
  isMegaprojectUnlocked,
  loadMegaprojectState,
  megaprojectComplete,
  megaprojectDiagnostics,
  megaprojectStageCost,
  saveMegaprojectState,
  stageMaxHp,
  type MegaprojectDiagnostics,
  type MegaprojectManifest,
  type MegaprojectProjectState,
  type MegaprojectSiteReadDiagnostics,
  type MegaprojectState,
  type MegaprojectStorage,
} from '../meta/Megaproject';
import { emitStorySignal } from '../story/signals';
import { discoverLedgerBuildable, discoverLedgerEntry, ledgerEnemyEntryId, revealLedgerEnemyStats } from '../encyclopedia/state';
import type { EnemyLedgerEntryId, LedgerEntryId } from '../encyclopedia/registry';
import { RunManager } from './RunManager';
import { agentAutonomyLevel, freshMetaProgress, type MetaProgress, type MetaTrack } from './MetaProgress';
import { awardBaronMedal, hasBaronMedal, hasRocketCartCaptured, loadMedals } from './Medals';
import { AgentConsentStore, type AgentAbility } from '../agent/AgentConsent';
import type { AgentPermissionLevel } from '../agent/PermissionLadder';
import { install as installAgentStub, type AgentStub } from '../agent/AgentStub';
import { ProspectorEmbodiment, type ProspectorPoint } from '../agent/Embodiment';
import { RUN_CAST_SCALE } from '../entities/runCastScale';
import { DEV_TRAM_CONSUMER, TramPath, devTramPowerGraphDefinition } from '../entities/TramPath';
import { Vehicle } from '../entities/Vehicle';
import type {
  AgentBuildingRef,
  AgentCollectGoldResult,
  AgentCollectXpOptions,
  AgentCollectXpResult,
  ToolReceipt,
} from '../agent/ToolSurface';
import {
  areWavesDisabled,
  getDebugSeed,
  getStressCount,
  getTimescale,
  isCharmPauseDisabled,
  isDebugEnabled,
  isLevelUpDisabled,
  isPauseDisabled,
  isPingDisabled,
  isProfileEnabled,
  isSpawnDisabled,
  isStealDisabled,
  isWreckDisabled,
} from '../core/DebugParams';
import { InputController, type Intents } from '../core/InputController';
import { FIXED_SIM_STEP_SECONDS, Loop, MAX_FIXED_STEPS_PER_FRAME, type LoopFrame } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { RenderLayers, renderLayerOf } from '../core/RenderLayers';
import { createRng } from '../core/Rng';
import {
  LockstepClient,
  intentsFromLockstepInput,
  lockstepInputFromIntents,
  multiplayerConfigFromSearch,
  stableHash,
  type LockstepAction,
  type LockstepTick,
  type MultiplayerPlayer,
} from '../mp/LockstepClient';
import { consumeStagedRideConfig, currentMultiplayerSetup } from '../mp/RideTogether';
import { Hero } from '../entities/Hero';
import { BlastChargePool } from '../entities/BlastCharge';
import { GoldPickupPool } from '../entities/GoldPickup';
import { ProjectilePool } from '../entities/Projectile';
import { XpMotePool } from '../entities/XpMote';
import { PressureSystem } from '../systems/PressureSystem';
import { FuelSystem } from '../systems/FuelSystem';
import { PressureArsenalSystem } from '../systems/PressureArsenalSystem';
import { DayNightCycle, DEBUG_DAY_NIGHT_CONFIG, type DayNightSnapshot } from '../systems/DayNightCycle';
import { LightField, type LightSource } from '../systems/LightField';
import { MothSwarm } from '../systems/MothSwarm';
import { EnemyPool, type EnemyLightSource } from '../entities/pools';
import type { ClaimJumperEnemy, CompassEdge } from '../entities/Enemy';
import { normalizeQueueProfile } from '../crafting/CraftingQueueContract';
import {
  applyDifficultyPreset,
  Balance,
  normalizeDifficultyPreset,
  readDifficultyPreset,
  saveDifficultyPreset,
  type BlastAimMode,
  type DifficultyPresetId,
} from './Balance';
import { SoundSystem } from '../audio/SoundSystem';
import { readAudioMuted, setAudioMuted } from '../audio/settings';
import {
  Economy,
  initialEconomyState,
  reduce as reduceEconomy,
  summarizeLog,
  type EconomyEvent,
  type EconomySummary,
} from './Economy';
import { CameraRig } from '../systems/CameraRig';
import { BuildSystem, type DemolishCandidate, type ReservedFootprint, type UpgradeCandidate } from '../systems/BuildSystem';
import { CombatSystem } from '../systems/CombatSystem';
import type { ShooterHandle } from '../systems/CombatSystem';
import { CrawlerBossSystem } from '../systems/CrawlerBossSystem';
import { DamSurgeEvent } from '../systems/DamSurgeEvent';
import { DebugTools, setBalance, type DebugTuning } from '../systems/DebugTools';
import { HarvestSystem } from '../systems/HarvestSystem';
import { PowerGraphSystem, devPowerGraphDefinition, emptyPowerGraphDiagnostics, powerWireId, type PowerGraphCommand, type PowerGraphDefinition } from '../systems/PowerGraph';
import { UiBridge, type UiSnapshot } from '../systems/UiBridge';
import { WaveSystem, type SpawnPackOptions } from '../systems/WaveSystem';
import { CombatVfx } from '../systems/CombatVfx';
import { Vfx } from '../systems/Vfx';
import { TargetingSystem, type BuildingTarget, type GoldHolding } from '../systems/TargetingSystem';
import {
  DeathOverlay,
  type DeathLedger,
  type DeathOverlayOptions,
  type DeathResearchState,
  type DeathRunStatsSnapshot,
} from '../ui/DeathOverlay';
import { Hud, type ContractBriefingSnapshot, type PauseMetaSnapshot, type UiIntent } from '../ui/Hud';
import { AssayOfficePrompt } from '../ui/AssayOfficePrompt';
import { BuildingContextPrompt, type MegaprojectFundCandidate } from '../ui/BuildingContextPrompt';
import { WorldInfoNotePrompt, type WorldInfoNoteTarget, type WorldInfoObjectClass } from '../ui/WorldInfoNotes';
import { UpgradeOverlay, type UpgradeIntent } from '../ui/UpgradeOverlay';
import { hasElevationTile, highGroundRange, simHeightDiagnostics, terrainLineOfSight, terrainSimSample, terrainSpeedMultiplier } from '../sim/TileHeight';
import * as Terrain from '../world/Terrain';
import type { TerrainView } from '../world/Terrain';
import { emptyRailPathDiagnostics, RailPathView } from '../world/RailPath';
import { PowerWireView } from '../world/PowerWireView';
import {
  LightRig,
  type LightRigNightShiftState,
  type LightRigRampPalette,
  type NightPoolSource,
  type NightShiftPhase,
} from '../world/LightRig';
import { DetailScatter, type DetailScatterClearPoint } from '../world/Scatter';
import { readTownName } from '../town/TownNaming';
import { installRunTelemetry } from '../telemetry/runBeacon';
import { GameState } from './GameState';
import { performanceTierDiagnostics } from './PerformanceTier';
import { Progression } from './Progression';
import { applyUpgradeBudgetsFromBalance, isUpgradeUnlocked, resolveFiller, upgradeEffect, upgradeFamilyId } from './Upgrades';
import { clearScores, loadScores, recordScore } from './Scoreboard';
import type { EffectiveStats } from './StatSheet';
import { upgradeDefById, upgradeDefs, type UpgradeDef, type UpgradeId } from './Upgrades';
import { buildableDefs, isBuildableId, type BuildableId } from './buildables';
import {
  captureRunSuspendSnapshot,
  multiplayerRunSuspendFutureState,
  normalizeRunSuspendDatum,
  readRunSuspend,
  restoreRunSuspendSnapshot,
  type RunSuspendEnvelope,
  type RunSuspendWrite,
} from './RunSuspend';
import { defaultSaveSlotName, formatBudgetWarning, saveManualSlot, saveSlotsBudget } from './SaveSlots';

// Replay Law: Frontier upgrades remain available after later epochs activate.
const replayEpoch = loadEpoch(DEFAULT_EPOCH_ID);
const STAMP_MILL_ID = 'stamp-mill';
const STAMP_MILL_COMPLETE_LINE = 'The Stamp Mill stands ready. The era waits on its whistle.';
const STAMP_MILL_PROGRESS_LINES = [
  'The Stamp Mill rises: the rail spur is staked.',
  'The Stamp Mill rises: the boilers are seated.',
  'The Stamp Mill rises: the stamps are set.',
];
const STAMP_MILL_RAIL_SPUR: RailPathDescriptor[] = [
  {
    style: 'mine-spur',
    points: [
      { x: -29, z: 18 },
      { x: -20, z: 17.4 },
      { x: -13, z: 16.6 },
      { x: -8, z: 16 },
    ],
  },
];
const BARON_ARRIVAL_TITLE = 'THE CLAIM-JUMPER BARON';
const BARON_DEFEAT_TITLE = 'THE BARON IS DEFEATED';
const BARON_KILL_STOP_SECONDS = 2.2;
const BARON_DEFEAT_CARD_SECONDS = 4;
const BARON_ROCKET_OWNER_PREFIX = 'baron_rocket';
const MULTIPLAYER_SPAWN_RADIUS = 1.2;
const MULTIPLAYER_TINTS = ['#5b8a8a', '#c4883a', '#8fbc8f', '#a78bfa'] as const;
type MultiplayerActorMeta = {
  playerId: string;
  slot: number;
  name: string;
  town: string;
  local: boolean;
};
type MultiplayerActorSnapshot = {
  hp: number;
  iframeRemaining: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  visible: boolean;
};
type MultiplayerRunSuspendSnapshot = RunSuspendEnvelope & {
  mpActors?: MultiplayerActorSnapshot[];
};
type BaronRocketTargetKind = 'hero' | 'building';
type BaronRocketVolleyConfig = NonNullable<ContractBaronTwist['rocketVolley']>;

export type RunReturnResult = 'secured' | 'overrun';

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly events = new EventBus();
  private readonly input: InputController;
  private readonly actors = [new Hero(RUN_CAST_SCALE)];
  private mpClient?: LockstepClient;
  private mpHadParty = false;
  private mpTickThisFrame: number | null = null;
  private mpActorIntents: Intents[] | null = null;
  private mpActionsThisTick: Array<{ slot: number; action: LockstepAction }> = [];
  private readonly mpQueuedActions: LockstepAction[] = [];
  private readonly mpDeathActionHandlers: Partial<Record<'done' | 'secondary', () => void>> = {};
  private readonly mpResearchActionHandlers: {
    pick?: (id: string) => DeathResearchState;
    skip?: () => DeathResearchState;
  } = {};
  private readonly mpDeferredActions: Array<() => void> = [];
  private mpCancelSuppressPause = false;
  private mpLocalSlot = 0;
  private mpActionSlot = 0;
  private lastMultiplayerHashState: { tick: number; state: unknown } | null = null;
  private mpPauseBeforeResync: { paused: boolean; playerPauseActive: boolean } | null = null;
  private mpCard?: HTMLElement;
  private readonly mpActorMeta = new Map<Hero, MultiplayerActorMeta>();
  private readonly mpHeroChips = new Map<string, HTMLElement>();
  private readonly heroShooterUnsubscribes: Array<() => void> = [];
  private readonly actionActorPosition = new THREE.Vector3();
  private readonly enemies = new EnemyPool(this.camera);
  private readonly enemyLedgerKinds = new Map<number, EnemyLedgerEntryId>();
  private readonly enemyLedgerEntriesSeenThisRun = new Set<EnemyLedgerEntryId>();
  private readonly enemyLedgerStatsSeenThisRun = new Set<EnemyLedgerEntryId>();
  private readonly projectiles = new ProjectilePool();
  private readonly blastCharges = new BlastChargePool();
  private readonly xpMotes = new XpMotePool();
  private readonly goldPickups = new GoldPickupPool();
  private readonly combatVfx = new CombatVfx();
  private readonly baronStandardGroup = new THREE.Group();
  private readonly baronStandardPoleGeometry = new THREE.CylinderGeometry(0.035, 0.045, 1.75, 8);
  private readonly baronStandardClothGeometry = new THREE.PlaneGeometry(0.86, 0.58);
  private readonly baronStandardPoleMaterial = new THREE.MeshStandardMaterial({ color: '#4b2a17', roughness: 0.82 });
  private readonly baronStandardClothMaterial = new THREE.MeshStandardMaterial({
    color: '#7f2633',
    roughness: 0.76,
    metalness: 0.03,
    transparent: true,
    alphaTest: 0.04,
    side: THREE.DoubleSide,
  });
  private readonly baronRocketCartGroup = new THREE.Group();
  private readonly baronRocketCartBodyGeometry = new THREE.BoxGeometry(0.92, 0.3, 0.58);
  private readonly baronRocketCartWheelGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 14);
  private readonly baronRocketCartRailGeometry = new THREE.BoxGeometry(1.12, 0.08, 0.08);
  private readonly baronRocketCartRocketGeometry = new THREE.CylinderGeometry(0.055, 0.075, 0.76, 10);
  private readonly baronRocketCartFuseGeometry = new THREE.SphereGeometry(0.07, 8, 6);
  private readonly baronRocketCartWoodMaterial = new THREE.MeshStandardMaterial({ color: '#4b2a17', roughness: 0.88 });
  private readonly baronRocketCartWheelMaterial = new THREE.MeshStandardMaterial({ color: '#2f2a22', roughness: 0.74, metalness: 0.18 });
  private readonly baronRocketCartBrassMaterial = new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.42, metalness: 0.42 });
  private readonly baronRocketCartTealMaterial = new THREE.MeshStandardMaterial({
    color: '#83ded7',
    emissive: '#2f8f85',
    emissiveIntensity: 0.35,
    roughness: 0.4,
    metalness: 0.18,
  });
  private readonly audio = new SoundSystem();
  private readonly state = new GameState();
  private readonly economy = new Economy();
  private readonly goldTargeting = new TargetingSystem();
  private readonly stockpileHoldingPositions = Array.from(
    { length: Balance.stockpile.maxCount },
    () => new THREE.Vector3(),
  );
  private readonly stockpileHoldings: GoldHolding[] = this.stockpileHoldingPositions.map((position, index) => ({
    id: `stockpile:${index}`,
    kind: 'stockpile',
    position,
    active: false,
    amount: 0,
  }));
  private readonly harvestSystem = new HarvestSystem(this.economy, Terrain.nodeAnchors, undefined, () => {
    if (Balance.charm.coinTick > 0) this.audio.playCoin();
  }, (position) => this.vfx.floatText(position, 'Vault full!', '#a0522d'));
  private readonly vfx = new Vfx();
  private deathPending = false;
  private readonly combat = new CombatSystem(
    this.events,
    this.actors,
    this.enemies,
    this.projectiles,
    this.blastCharges,
    this.xpMotes,
    this.combatVfx,
    this.audio,
    () => {
      this.deathPending = true;
    },
    (position, value) => this.vfx.floatText(position, `+${value}`, '#83ded7'),
    (position) => this.onEnemyKilled(position),
    (at, origin, target) => {
      this.lightRig?.triggerMuzzleFlash(at, origin, target);
      const actor = this.nearestActorTo(origin);
      if (this.activeWeapon === 'rig' && actor.group.position.distanceToSquared(origin) < 0.0001) actor.playAttackPose(target);
    },
  );
  private readonly prospector = new ProspectorEmbodiment((position, text, color) => this.vfx.floatText(position, text, color));
  private readonly buildSystem: BuildSystem;
  private readonly pressureSystem: PressureSystem;
  private readonly pressureArsenalSystem: PressureArsenalSystem;
  private readonly progression: Progression;
  private difficultyPreset: DifficultyPresetId = readDifficultyPreset();
  private activeWeapon: 'rig' | 'blast' = 'rig';
  private blastDamageMult = 1;
  private blastRadiusMult = 1;
  private blastCooldownMult = 1;
  private weaponToggleCount = 0;
  private blastTime = 0;
  private pointerAimReady = false;
  private readonly aimRaycaster = new THREE.Raycaster();
  private readonly aimPointerNdc = new THREE.Vector2();
  private readonly aimGroundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly pointerAimPoint = new THREE.Vector3();
  private readonly blastAimPoint = new THREE.Vector3(0, 0.08, 2);
  private readonly blastAimRaw = new THREE.Vector3();
  private blastAimReticleRadius: number = Balance.blast.radius;
  private readonly blastAimReticle = new THREE.Mesh(
    new THREE.RingGeometry(Balance.blast.radius * 0.88, Balance.blast.radius, 40),
    new THREE.MeshBasicMaterial({
      color: '#83ded7',
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      side: THREE.DoubleSide,
    }),
  );
  private readonly heroShooter: ShooterHandle = {
    resumeKey: 'hero:0:rig',
    id: 'hero',
    enabled: () => this.activeWeapon === 'rig' && this.heroWeaponsEnabledFor(this.primaryActor),
    getPos: () => this.primaryActor.group.position,
    range: Balance.sparkRig.range,
    cooldown: 1 / Balance.sparkRig.fireRate,
    damage: Balance.sparkRig.damage,
    canTarget: hasElevationTile() ? (target) => terrainLineOfSight(this.primaryActor.group.position, target.position) : undefined,
    effectiveRange: hasElevationTile()
      ? () => highGroundRange(this.heroShooter.range, this.primaryActor.group.position.x, this.primaryActor.group.position.z)
      : undefined,
    projSpeed: Balance.sparkRig.boltSpeed,
    volley: Balance.sparkRig.volley,
  };
  private readonly blastShooter: ShooterHandle = {
    resumeKey: 'hero:0:blast',
    id: 'hero_blast',
    kind: 'lob',
    enabled: () => this.activeWeapon === 'blast' && this.heroWeaponsEnabledFor(this.primaryActor),
    getPos: () => this.primaryActor.group.position,
    range: Balance.blast.range,
    cooldown: Balance.blast.cooldown,
    damage: Balance.blast.damage,
    getDamage: () => this.currentBlastDamage(),
    targetPoint: (_origin, target) => this.currentBlastTargetFor(this.primaryActor, target.position),
    projSpeed: 0,
    volley: Balance.blast.volley,
    aoe: { radius: Balance.blast.radius, airTime: Balance.blast.airTime },
  };
  private readonly heroShooters: ShooterHandle[] = [this.heroShooter];
  private readonly blastShooters: ShooterHandle[] = [this.blastShooter];
  private readonly simTimeScale = getTimescale();
  private manualSimForTest = false;
  private manualAdvanceForTest = false;
  private manualResumeAtMpTickForTest: number | null = null;
  private harvestSnapshot = this.harvestSystem.snapshot;
  private readonly uiBridge = new UiBridge();
  private readonly hud: Hud;
  private readonly promptStack = document.createElement('div');
  private readonly assayOfficePrompt: AssayOfficePrompt;
  private readonly buildingContextPrompt: BuildingContextPrompt;
  private readonly worldInfoNotePrompt: WorldInfoNotePrompt;
  private readonly deathOverlay: DeathOverlay;
  private readonly upgradeOverlay: UpgradeOverlay;
  private readonly damageVignette = document.createElement('div');
  private readonly activeEpoch = selectActiveEpoch();
  private readonly activeContract = selectActiveContract();
  private readonly dayNightCycle = createDayNightCycle(this.activeContract);
  private readonly lightField = new LightField({
    minLight: Balance.contracts.nightShift.minLight,
    falloff: Balance.contracts.nightShift.lightFalloff,
    litThreshold: Balance.contracts.nightShift.renderVisibilityCutoff,
  });
  private readonly mothSwarm = new MothSwarm(
    Boolean(this.activeContract.twist.mothSeason) || (new URLSearchParams(window.location.search).has('debug') && new URLSearchParams(window.location.search).has('daynight')),
    this.enemies.capacity,
    (x, z) => this.lightField.coverageAt(x, z),
    {
      radiusWeight: this.activeContract.twist.mothSeason?.radiusWeight ?? 1,
      attachDamagePerSecond: this.activeContract.twist.mothSeason?.attachDamagePerSecond ?? 0,
    },
    (sourceId, amount) => {
      if (!sourceId.startsWith('decoy:')) return;
      const target = this.buildSystem.buildingTarget('decoy_shed', Number.parseInt(sourceId.slice(6), 10));
      if (target?.active) this.combat.damageBuilding(target, amount, -1);
    },
  );
  private mothLightSources: LightSource[] = [];
  private dayNightSnapshot: DayNightSnapshot | null = null;
  private dayNightTimeOverride: number | null = null;
  private readonly contractEpoch = listEpochs().find((epoch) => loadEpoch(epoch.id).contracts.some((contract) => contract.id === this.activeContract.id));
  private runSuspendSaveLine = runSuspendPauseLine(this.activeContract.id);
  private manualSaveMessage = '';
  private readonly heroStart = contractHeroStart(this.activeContract);
  private readonly heroVisualYAt = (x: number, z: number): number => Terrain.visualY(x, z, this.heroStart.y);
  private readonly debugSpawnPosition = new THREE.Vector3();
  private terrainView?: TerrainView;
  private railPath?: RailPathView;
  private megaprojectRailPath?: RailPathView;
  private powerGraph?: PowerGraphSystem;
  private powerWireView?: PowerWireView;
  private damSurge?: DamSurgeEvent;
  private tram?: TramPath;
  private canyonConnectAnnounced = false;
  private canyonConnectCompletedByDeadline = false;
  private canyonConnectFailed = false;
  private fuelSystem?: FuelSystem;
  private vehicle?: Vehicle;
  private lightRig?: LightRig;
  private detailScatter?: DetailScatter;
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly megaprojectManifest: MegaprojectManifest | null = activeMegaprojectManifest(this.activeEpoch);
  private readonly megaprojectStorage: MegaprojectStorage | undefined = browserMegaprojectStorage();
  private megaprojectState: MegaprojectState = loadMegaprojectState(this.megaprojectStorage);
  private megaprojectProject: MegaprojectProjectState | null = this.megaprojectManifest
    ? ensureMegaprojectProject(this.megaprojectState, this.megaprojectManifest)
    : null;
  private readonly megaprojectGroup = new THREE.Group();
  private readonly megaprojectGeometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly megaprojectBarrelGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.38, 12);
  private readonly megaprojectPlaqueGeometry = new THREE.PlaneGeometry(1.18, 0.46);
  private readonly megaprojectBaseMaterial = new THREE.MeshStandardMaterial({
    color: '#d8b778',
    transparent: true,
    opacity: 0.56,
    roughness: 0.82,
    metalness: 0.04,
  });
  private readonly megaprojectStageMaterial = new THREE.MeshStandardMaterial({
    color: '#c4883a',
    emissive: '#4b2b12',
    emissiveIntensity: 0.12,
    roughness: 0.76,
    metalness: 0.08,
  });
  private readonly megaprojectGhostMaterial = new THREE.MeshStandardMaterial({
    color: '#f5e6c8',
    transparent: true,
    opacity: 0.66,
    roughness: 0.9,
    metalness: 0.02,
  });
  private readonly megaprojectStakeMaterial = new THREE.MeshStandardMaterial({
    color: '#6f5732',
    roughness: 0.86,
    metalness: 0.02,
  });
  private readonly megaprojectStringMaterial = new THREE.MeshStandardMaterial({
    color: '#d8a45a',
    emissive: '#5b3a16',
    emissiveIntensity: 0.08,
    roughness: 0.72,
    metalness: 0.02,
  });
  private readonly megaprojectWalkwayMaterial = new THREE.MeshStandardMaterial({
    color: '#7a5132',
    roughness: 0.82,
    metalness: 0.03,
  });
  private readonly megaprojectSignMaterial = new THREE.MeshStandardMaterial({
    color: '#6a4728',
    roughness: 0.84,
    metalness: 0.03,
  });
  private readonly megaprojectCrateMaterial = new THREE.MeshStandardMaterial({
    color: '#8a5a30',
    roughness: 0.82,
    metalness: 0.03,
  });
  private readonly megaprojectBarrelMaterial = new THREE.MeshStandardMaterial({
    color: '#805034',
    roughness: 0.76,
    metalness: 0.05,
  });
  private readonly megaprojectPlaqueTexture = createMegaprojectPlaqueTexture([
    'STAMP MILL & RAIL SPUR',
    'surveyed for the town',
    'Claim Office takes pledges',
  ]);
  private readonly megaprojectPlaqueMaterial = new THREE.MeshBasicMaterial({
    map: this.megaprojectPlaqueTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  private readonly megaprojectVisuals: THREE.Mesh[] = [];
  private readonly megaprojectSurveyVisuals: THREE.Object3D[] = [];
  private readonly megaprojectSignVisuals: THREE.Object3D[] = [];
  private readonly megaprojectConstructionDressing: THREE.Object3D[] = [];
  private megaprojectPlaqueText = 'STAMP MILL & RAIL SPUR / surveyed for the town / Claim Office takes pledges';
  private stampSiteBeatEmitted = false;
  private readonly megaprojectTarget: BuildingTarget = {
    id: 'megaproject:none',
    family: 'megaproject',
    index: 0,
    position: new THREE.Vector3(),
    halfX: 0,
    halfZ: 0,
    active: false,
    hp: 0,
    maxHp: 0,
    reachRadius: 0,
  };
  private baronSpawnImpulses = 0;
  private readonly waveSystem = new WaveSystem(
    this.enemies,
    this.primaryActor.group.position,
    createRng(`${getDebugSeed() ?? 'gold-rush'}:waves`),
    (text, atSim) => this.announceWaveBanner(text, atSim),
    (wave, atSim) => {
      this.events.emit({ type: 'wave_started', at: atSim, wave });
      this.spawnMothSeasonWave(wave);
      this.advanceMegaprojectOnWave(atSim);
      return !this.secureClaimChoicePending();
    },
    areWavesDisabled,
    () => this.activeContract,
    () => !isStealDisabled() && this.hasBuiltStockpile(),
    () => !isWreckDisabled() && (this.buildSystem.hasAnyBuildable || this.megaprojectTarget.active),
    () => this.liveThiefCount(),
    () => this.territoryRingPresent,
    this.heroStart,
    (position) => {
      this.baronSpawnImpulses += 1;
      this.cameraRig.impulse(position, 0.12);
    },
    (target) => this.goldTargeting.registerBuilding(target),
    (amount, position, atSim) => {
      this.economy.apply({ id: crypto.randomUUID(), at: atSim, type: 'gold_granted', source: 'escort', amount });
      this.vfx.floatText(position, `+${amount}`, '#c4883a');
    },
    () => [
      this.localActor.group.position,
      ...((this.agentStub?.state.permissionLevel ?? 0) >= 1 ? [this.prospector.position] : []),
    ],
  );
  private readonly crawlerBoss = new CrawlerBossSystem(
    () => this.enemies.all,
    () => this.powerGraph?.snapshot().nodes ?? [],
    (command) => this.powerGraph?.queueCommand(command) === true,
    (origin, target, damage, radius) => this.combat.launchLob(origin, target, 0.05, damage, radius, 'baron_rocket:-3'),
  );
  private readonly loop = new Loop(
    (delta) => this.update(delta),
    (frame) => this.present(frame),
    {
      stepSeconds: FIXED_SIM_STEP_SECONDS,
      maxStepsPerFrame: MAX_FIXED_STEPS_PER_FRAME,
    },
  );

  private get primaryActor(): Hero {
    return this.actors[0];
  }

  private get localActor(): Hero {
    return this.actors[this.mpLocalSlot] ?? this.primaryActor;
  }

  private get actionActor(): Hero {
    return this.actors[this.mpActionSlot] ?? this.primaryActor;
  }

  private nearestActorTo(position: THREE.Vector3): Hero {
    let best = this.primaryActor;
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    for (const actor of this.actors) {
      if (!actor.group.visible) continue;
      const dx = actor.group.position.x - position.x;
      const dz = actor.group.position.z - position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < bestDistanceSq) {
        best = actor;
        bestDistanceSq = distanceSq;
      }
    }
    return best;
  }

  private visibleActorPositions(): THREE.Vector3[] {
    return this.actors.filter((actor) => actor.group.visible).map((actor) => actor.group.position);
  }

  private visibleHarvestTargets(): Array<{ actorId: string; position: THREE.Vector3; speed: number }> {
    const targets = this.actors
      .map((actor, slot) => ({ actor, slot }))
      .filter(({ actor }) => actor.group.visible)
      .map(({ actor, slot }) => ({ actorId: String(slot), position: actor.group.position, speed: actor.velocity.length() }));
    return targets.length > 0
      ? targets
      : [{ actorId: '0', position: this.primaryActor.group.position, speed: this.primaryActor.velocity.length() }];
  }

  private lastHarvestGoldPosition(): THREE.Vector3 {
    const position = this.harvestSnapshot.lastGoldPosition;
    return position ? new THREE.Vector3(position.x, position.y, position.z) : this.primaryActor.group.position;
  }

  private multiplayerActive(): boolean {
    const state = this.mpClient?.state();
    return state?.connected === true && state.roster.length >= 2;
  }

  private releaseFailedMultiplayer(): boolean {
    const state = this.mpClient?.state();
    if (!state) return false;
    if (state.roster.length >= 2) this.mpHadParty = true;
    const failedBeforeRide = !state.connected && !!state.error;
    const droppedParty = this.mpHadParty && state.connected && state.roster.length < 2;
    const closedParty = this.mpHadParty && !state.connected;
    if (!failedBeforeRide && !droppedParty && !closedParty) return false;
    this.mpClient?.dispose();
    this.mpClient = undefined;
    this.mpHadParty = false;
    if (this.mpPauseBeforeResync) {
      this.state.setPaused(this.mpPauseBeforeResync.paused);
      this.playerPauseActive = this.mpPauseBeforeResync.playerPauseActive;
      this.mpPauseBeforeResync = null;
    }
    this.syncMultiplayerActors();
    this.showMultiplayerCard(
      'Riding solo',
      failedBeforeRide ? "That claim's gone quiet. Starting this ride solo." : 'The other rider dropped. The next wave carries on solo.',
    );
    return true;
  }

  private updateActionActorPosition(): void {
    this.actionActorPosition.copy(this.actionActor.group.position);
  }

  private registerHeroShooters(actor: Hero, heroShooter = this.createHeroShooter(actor), blastShooter = this.createBlastShooter(actor)): void {
    this.heroShooters.push(...(heroShooter === this.heroShooter ? [] : [heroShooter]));
    this.blastShooters.push(...(blastShooter === this.blastShooter ? [] : [blastShooter]));
    this.heroShooterUnsubscribes.push(this.combat.registerShooter(heroShooter), this.combat.registerShooter(blastShooter));
  }

  private createHeroShooter(actor: Hero): ShooterHandle {
    const slot = Math.max(0, this.actors.indexOf(actor));
    const handle: ShooterHandle = {
      resumeKey: `hero:${slot}:rig`,
      id: 'hero',
      enabled: () => this.activeWeapon === 'rig' && this.heroWeaponsEnabledFor(actor),
      getPos: () => actor.group.position,
      range: Balance.sparkRig.range,
      cooldown: 1 / Balance.sparkRig.fireRate,
      damage: Balance.sparkRig.damage,
      canTarget: hasElevationTile() ? (target) => terrainLineOfSight(actor.group.position, target.position) : undefined,
      effectiveRange: hasElevationTile()
        ? () => highGroundRange(handle.range, actor.group.position.x, actor.group.position.z)
        : undefined,
      projSpeed: Balance.sparkRig.boltSpeed,
      volley: Balance.sparkRig.volley,
    };
    return handle;
  }

  private createBlastShooter(actor: Hero): ShooterHandle {
    const slot = Math.max(0, this.actors.indexOf(actor));
    return {
      resumeKey: `hero:${slot}:blast`,
      id: 'hero_blast',
      kind: 'lob',
      enabled: () => this.activeWeapon === 'blast' && this.heroWeaponsEnabledFor(actor),
      getPos: () => actor.group.position,
      range: Balance.blast.range,
      cooldown: Balance.blast.cooldown,
      damage: Balance.blast.damage,
      getDamage: () => this.currentBlastDamage(),
      targetPoint: (_origin, target) => this.currentBlastTargetFor(actor, target.position),
      projSpeed: 0,
      volley: Balance.blast.volley,
      aoe: { radius: Balance.blast.radius, airTime: Balance.blast.airTime },
    };
  }

  private readonly tuning: DebugTuning = {
    exposure: Balance.render.exposure,
    maxDpr: Balance.render.maxDpr,
    cameraLag: Balance.camera.lag,
    cameraLookAhead: Balance.camera.lookAhead,
    cameraOffsetY: Balance.camera.offset.y,
    cameraOffsetZ: Balance.camera.offset.z,
    cameraDownScreenLookOffset: Balance.camera.downScreenLookOffset,
  };

  private readonly debugTools: DebugTools;
  private frame = 0;
  private simTick = 0;
  private elapsed = 0;
  private fixedTickElapsed = 0;
  private activeTickElapsed = 0;
  private timeAlive = 0;
  private kills = 0;
  private baronBeatenThisRun = false;
  private baronCeremony: { atSim: number; startedTickElapsed: number } | null = null;
  private readonly baronStandardPosition = new THREE.Vector3();
  private baronStandardPlanted = false;
  private baronStandardDropStartedAt = 0;
  private baronRocketNextAt = 0;
  private baronRocketTelegraphStartedAt = -1;
  private baronRocketVolleys = 0;
  private baronRocketSuppressed = false;
  private baronRocketTargetKind: BaronRocketTargetKind | null = null;
  private readonly baronRocketTarget = new THREE.Vector3();
  private readonly baronRocketLastTarget = new THREE.Vector3();
  private baronRocketLastOwnerId = '';
  private baronAnnouncementTimer = 0;
  private pendingBaronBanner: { text: string; atSim: number; title: string } | null = null;
  private damageFlashRemaining = 0;
  private charmPauseRemaining = 0;
  private charmPauseCooldown = 0;
  private charmPauseActive = false;
  private readonly frameMsSamples: number[] = [];
  private readonly profileFrameMs: number[] = [];
  private readonly profileDrawCalls: number[] = [];
  private frameMsCursor = 0;
  private frameMsLast = 0;
  private frameMsAvg = 0;
  private frameMsP95 = 0;
  private profileElapsed = 0;
  private debugBeaconWaveOverride: number | null = null;
  private stolenTotal = 0;
  private reclaimedTotal = 0;
  private buildingHitsResolved = 0;
  private buildingsWrecked = 0;
  private territoryRingPresent = false;
  private readonly thiefContext = {
    nearestGoldHolding: (from: THREE.Vector3) => this.goldTargeting.nearestGoldHolding(from),
    claimGold: (enemy: ClaimJumperEnemy, holding: GoldHolding) => this.claimGoldForThief(enemy, holding),
    onThiefFled: (enemy: ClaimJumperEnemy) => this.onThiefFled(enemy),
  };
  private readonly wreckerContext = {
    nearestBuilding: (from: THREE.Vector3) => this.waveSystem.preferredEscortTarget(from) ?? this.goldTargeting.nearestBuilding(from),
    hitBuilding: (enemy: ClaimJumperEnemy, target: BuildingTarget, amount?: number) => this.combat.handleBuildingHit(enemy, target, amount),
    palisadeRoute: (from: THREE.Vector3, to: THREE.Vector3, clearance: number) => this.buildSystem.palisadeRoute(from, to, clearance),
  };
  private buildMenuOpen = false;
  private demolishCandidate: DemolishCandidate | null = null;
  private demolishSuppressedKey: string | null = null;
  private upgradeCandidate: UpgradeCandidate | null = null;
  private lastPauseIntent = false;
  private lastRestartIntent = false;
  private lastBuildIntent = false;
  private lastCancelIntent = false;
  private lastConfirmIntent = false;
  private lastUpgradeIntent = false;
  private lastRotateIntent = false;
  lastWeaponToggleIntent = false; // RunSuspend v2 compatibility latch.
  private lastMuteIntent = false;
  private lastDebugSpawnIntent = false;
  private lastDebugXpIntent = false;
  private playerPauseActive = false;
  private uiSnapshot?: UiSnapshot;
  private wetPowderHintCooldown = 0;
  private deathLedger: DeathLedger = {
    timeAlive: 0,
    kills: 0,
    goldPanned: 0,
    spent: 0,
    beaconsBuilt: 0,
    wavesSurvived: 0,
    weaponToggles: 0,
    blastTime: 0,
  };

  private runManager?: RunManager;
  private agentStub?: AgentStub;
  private readonly agentConsent = new AgentConsentStore();
  private unsubscribeAgentReceipts?: () => void;
  private nextProspectorXpSweepAt = 0;
  private nextProspectorGoldSweepAt = 0;
  private nextProspectorRepairSweepAt = 0;
  private prospectorRepairTarget: AgentBuildingRef | null = null;
  private prospectorRepairDwellStartedAt: number | null = null;
  private prospectorIntroShown = false;
  private agentPolicySlotBonus = 0;
  private readonly researchStorage = browserResearchStorage();
  private researchState: ResearchState = loadResearchState(this.researchStorage, this.researchStorage, this.researchUnlockFlags());
  private appliedMetaProgress: MetaProgress = freshMetaProgress();
  private runStartMetaRecapPending = false;
  private readonly craftingProfile = normalizeQueueProfile(new URLSearchParams(window.location.search).get('profile'));
  private lastHarvestChanneling = false;
  private lastUpgradeOfferAudioKey = '';
  private disposeRunTelemetry: () => void = () => undefined;
  private run3dPilot?: { update: () => void; dispose: () => void };
  private terrain3dPilotDispose?: () => void;
  private terrain3dPilotCancelled = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly openAssayBench?: () => void,
    private readonly onReturnToMenu?: (result: RunReturnResult) => void,
  ) {
    this.assertActorMode();
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;
    this.blastAimReticle.name = 'BlastAimReticle';
    this.blastAimReticle.rotation.x = -Math.PI / 2;
    this.blastAimReticle.renderOrder = RenderLayers.groundDecals;
    this.blastAimReticle.visible = false;
    this.canvas.addEventListener('pointermove', this.onBlastAimPointerMove);
    this.updateActionActorPosition();
    this.buildSystem = new BuildSystem(
      canvas,
      this.camera,
      this.economy,
      this.combat,
      this.goldTargeting,
      this.actionActorPosition,
      () => this.debugBeaconWaveOverride ?? this.waveSystem.diagnostics.wave,
      (position, text, color) => this.vfx.floatText(position, text, color),
      (sound) => this.audio.play(sound),
      (id) => this.isBuildableEnabled(id),
      (position) => {
        if (!this.mpClient) return false;
        const build = this.buildSystem.diagnostics;
        this.mpQueuedActions.push({
          type: 'place_build',
          id: build.selectedBuildable,
          position,
          rotationSteps: build.ghostRotationSteps,
        });
        return true;
      },
      (id, _index, position) => id !== 'turret' || this.powerConsumerAt(position.x, position.z, 'turret'),
    );
    this.pressureSystem = new PressureSystem(
      this.economy,
      this.buildSystem.boilerHouses,
      () => this.activeContract.twist.pressureEnabled === true && !this.multiplayerActive(),
      (index) => this.buildSystem.buildingTarget('boiler_house', index)?.active === true,
      (id) => hasResearchNode(this.researchState, id),
      (position, text, color) => this.vfx.floatText(position, text, color),
      (sound) => this.audio.play(sound),
    );
    this.pressureArsenalSystem = new PressureArsenalSystem(
      this.combat,
      this.pressureSystem,
      () => this.primaryActor.group.position,
      (id) => hasResearchNode(this.researchState, id),
      () => hasBaronMedal(),
      () =>
        this.activeEpoch.id === 'epoch-2-steamworks' &&
        !this.multiplayerActive() &&
        this.heroWeaponsEnabledFor(this.primaryActor),
    );
    this.buildSystem.setMegaprojectDamageResolver((target, amount) => this.resolveMegaprojectDamage(target, amount));
    this.progression = new Progression({
      state: this.state,
      rng: createRng(`${getDebugSeed() ?? 'gold-rush'}:upgrades`),
      getBeaconCount: () => this.buildSystem.beaconCount,
      getWave: () => this.waveSystem.diagnostics.wave,
      getMaxHp: () => this.primaryActor.maxHp,
      onStatsChanged: (stats, pickedId) => this.applyStats(stats, pickedId),
      onGoldGranted: (amount) => {
        this.economy.apply({
          id: crypto.randomUUID(),
          at: this.timeAlive,
          type: 'gold_granted',
          source: 'upgrade_assay',
          amount,
        });
        this.vfx.floatText(this.localActor.group.position, `+${amount}`, '#c4883a');
      },
      onHeal: (amount) => {
        let healed = 0;
        for (const actor of this.actors) {
          const before = actor.hp;
          actor.heal(amount);
          healed = Math.max(healed, Math.round(actor.hp - before));
        }
        if (healed > 0) this.vfx.floatText(this.localActor.group.position, `+${healed}`, '#6bb36b');
      },
      hasResearchNode: (id) => hasResearchNode(this.researchState, id),
      getCraftingProfile: () => this.craftingProfile,
      isChoiceDisabled: isLevelUpDisabled,
    });
    this.applyStats(this.progression.snapshot.stats, null);

    const stick = this.getElement('#touch-stick');
    const knob = this.getElement('#touch-knob');
    const confirmButton = this.getElement('#confirm-button');
    this.input = new InputController(stick, knob, confirmButton);
    this.hud = new Hud(this.getElement('#hud'), (intent) => this.handleUiIntent(intent));
    this.promptStack.className = 'prompt-stack';
    this.promptStack.dataset.testid = 'prompt-stack';
    this.getElement('#hud').append(this.promptStack);
    this.buildingContextPrompt = new BuildingContextPrompt(
      this.promptStack,
      () => {
        if (!this.mpClient) return void this.confirmUpgrade();
        const target = this.upgradeCandidate;
        if (target) this.mpQueuedActions.push({ type: 'context_action', action: 'upgrade', target });
      },
      () => {
        if (!this.mpClient) return void this.confirmDemolish();
        const target = this.demolishCandidate;
        if (target) this.mpQueuedActions.push({ type: 'context_action', action: 'demolish', target });
      },
      () => {
        if (this.mpClient) this.mpQueuedActions.push({ type: 'context_action', action: 'fund' });
        else this.fundMegaprojectStage(this.actionActor.group.position);
      },
    );
    this.assayOfficePrompt = new AssayOfficePrompt(this.promptStack);
    this.worldInfoNotePrompt = new WorldInfoNotePrompt(this.promptStack);
    this.deathOverlay = new DeathOverlay(this.getElement('#app'), () => this.finishRunLedger());
    this.upgradeOverlay = new UpgradeOverlay(this.getElement('#app'), (intent) => this.handleUpgradeIntent(intent));
    this.damageVignette.className = 'damage-vignette';
    this.getElement('#app').append(this.damageVignette);
    window.addEventListener('pointerdown', this.skipBaronCeremony, { passive: true });
    window.addEventListener('keydown', this.skipBaronCeremony);
    this.registerHeroShooters(this.primaryActor, this.heroShooter, this.blastShooter);
    this.events.on('hero_damaged', () => {
      this.damageFlashRemaining = Balance.hero.iframes;
    });
    this.events.on('hero_died', (event) => {
      this.audio.play('defeat-sting');
      this.audio.play('ledger-open', 0.75);
      const scoreAt = Date.now();
      const economySummary = summarizeLog(this.economy.log);
      const runStats = this.deathRunStats(economySummary);
      this.deathLedger = {
        timeAlive: event.timeAlive,
        kills: event.kills,
        goldPanned: event.goldPanned,
        spent: event.spent,
        beaconsBuilt: event.beaconsBuilt,
        wavesSurvived: event.wavesSurvived,
        weaponToggles: event.weaponToggles,
        blastTime: event.blastTime,
      };
      const scores = recordScore({
        waves: event.wavesSurvived,
        kills: event.kills,
        gold: event.goldPanned,
        timeAlive: event.timeAlive,
        at: scoreAt,
        secured: this.runWasSecured(event.wavesSurvived),
        baseValue: Math.round(economySummary.baseValue),
        weaponSplit: this.weaponSplit(runStats),
        contractId: this.activeContract.id,
      });
      const returnResult: RunReturnResult = this.runWasSecured(event.wavesSurvived) ? 'secured' : 'overrun';
      const onDone = () => this.returnToTown(returnResult);
      const onSecondary = () => this.resetRun();
      this.setMultiplayerDeathActions(onDone, onSecondary);
      this.deathOverlay.show(this.deathLedger, scores.slice(0, 5), scoreAt, {
        ...this.researchOverlayOptions(1),
        actionLabel: 'Return to Town',
        secondaryActionLabel: 'Try Again',
        runStats,
        agentAutonomyDelta: this.agentAutonomyDelta(returnResult === 'secured'),
        townName: readTownName(),
        onDone: () => this.requestDeathAction('done', onDone),
        onSecondaryAction: () => this.requestDeathAction('secondary', onSecondary),
      });
      this.syncMultiplayerLedgerRiders();
    });
    this.events.on('run_ended', (event) => {
      discoverLedgerEntry('assay_office_records');
      if (event.reason !== 'secured') return;
      emitStorySignal({ type: 'first-victory' });
      this.audio.play('victory-sting');
      this.audio.play('ledger-open', 0.75);
      const scoreAt = Date.now();
      const economySummary = summarizeLog(this.economy.log);
      const runStats = this.deathRunStats(economySummary);
      const scores = recordScore({
        waves: event.summary.wavesSurvived,
        kills: this.kills,
        gold: event.summary.goldPanned,
        timeAlive: event.at,
        at: scoreAt,
        secured: true,
        baseValue: Math.round(economySummary.baseValue),
        weaponSplit: this.weaponSplit(runStats),
        contractId: this.activeContract.id,
      });
      const ledger: DeathLedger = {
        timeAlive: event.at,
        kills: this.kills,
        goldPanned: event.summary.goldPanned,
        spent: economySummary.spent,
        beaconsBuilt: event.summary.buildingsBuilt,
        wavesSurvived: event.summary.wavesSurvived,
        weaponToggles: this.weaponToggleCount,
        blastTime: this.blastTime,
      };
      const agentAutonomyDelta = this.agentAutonomyDelta(true);
      window.setTimeout(() => {
        this.state.setPaused(true);
        const onDone = () => {
          this.runStartMetaRecapPending = false;
          this.returnToTown('secured');
        };
        const onSecondary = () => this.finishSecuredLedgerQuickLoop();
        this.setMultiplayerDeathActions(onDone, onSecondary);
        this.deathOverlay.show(ledger, scores.slice(0, 5), scoreAt, {
          ...this.researchOverlayOptions(2),
          outcome: 'secured',
          actionLabel: 'Return to Town',
          secondaryActionLabel: 'New Claim',
          runStats,
          agentAutonomyDelta,
          townName: readTownName(),
          onDone: () => this.requestDeathAction('done', onDone),
          onSecondaryAction: () => this.requestDeathAction('secondary', onSecondary),
        });
        this.syncMultiplayerLedgerRiders();
      }, 0);
    });
    this.disposeRunTelemetry = installRunTelemetry({
      events: this.events,
      contract: () => this.activeContract.id,
      upgradeStacks: () => this.progression.snapshot.stacks,
    });
    this.events.on('enemy_killed', (event) => {
      this.kills += 1;
      const isCrawlerComponent = event.variantId === 'dynamo_crawler';
      if (!isCrawlerComponent) {
        const entryId = this.enemyLedgerKinds.get(event.enemyId) ?? ledgerEnemyEntryId(event);
        this.discoverLedgerEnemyEntry(entryId);
        this.revealLedgerEnemyStats(entryId);
      }
      if (isCrawlerComponent) {
        const enemy = this.enemies.all.find((entry) => entry.id === event.enemyId);
        this.crawlerBoss.onComponentKilled(event.bossComponentId, enemy?.position ?? this.primaryActor.group.position, event.at);
      }
      if (event.eliteKind === 'baron' || (event.eliteKind === 'railcar' && event.bossRemaining === 0)) {
        this.onBaronDefeated(event.at, event.enemyId);
      }
    });
    this.events.on('building_damaged', () => {
      this.buildingHitsResolved += 1;
    });
    this.events.on('building_wrecked', () => {
      this.buildingsWrecked += 1;
      emitStorySignal({ type: 'building-lost' });
    });
    this.events.on('wave_started', (event) => {
      const baron = this.activeContract.twist.baron;
      const isSilentCrawlerFlicker = baron?.variantId === 'dynamo_crawler' && event.wave === baron.wave - 2;
      if (!isSilentCrawlerFlicker) this.audio.play('wave-start-horn');
      this.announceBaronBeat(event.wave, event.at);
      this.crawlerBoss.onWaveStarted(event.wave, baron?.variantId === 'dynamo_crawler' ? baron.wave : Number.POSITIVE_INFINITY, event.at);
    });

    this.debugTools = new DebugTools(this.tuning, () => {
      (Balance.render as { exposure: number; maxDpr: number }).exposure = this.tuning.exposure;
      (Balance.render as { exposure: number; maxDpr: number }).maxDpr = this.tuning.maxDpr;
      this.renderer.toneMappingExposure = this.tuning.exposure;
      this.applyCameraTuning();
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    });

    this.createScene();
    const terrain3dPilot = new URLSearchParams(window.location.search).has('terrain3dPilot');
    this.canvas.dataset.terrain3dPilotState = terrain3dPilot ? 'loading' : 'off';
    this.canvas.dataset.terrain3dPilotRenderSource = 'painted';
    if (terrain3dPilot) void import('../world/Terrain3dClaimPilot').then(({ installTerrain3dClaimPilot }) => {
      if (this.terrain3dPilotCancelled) return;
      this.terrain3dPilotDispose = installTerrain3dClaimPilot({
        scene: this.scene,
        canvas: this.canvas,
        contractId: this.activeContract.id,
        tileId: activeTileDescriptor().id,
        paintedGround: this.terrainView?.group.children.find((child) => child.userData.terrainRelief === true),
      });
    });
    const run3dSelection = new URLSearchParams(window.location.search).get('run3dPilot');
    this.canvas.dataset.run3dPilotState = run3dSelection ? 'loading' : 'off';
    if (run3dSelection) void import('./Run3dPilot').then(({ installRun3dPilot }) => (this.run3dPilot = installRun3dPilot({ scene: this.scene, canvas: this.canvas, diagnostics: () => this.buildSystem.diagnostics })));
    this.registerGoldHoldings();
    this.syncMegaprojectSite();
    this.placeContractFixtures();
    this.dressScene();
    if (new URLSearchParams(window.location.search).has('debug')) {
      // Test/debug harness: parking-free positioning for interaction e2e.
      window.__GR_TEST__ = {
        teleport: (x: number, z: number) => {
          this.localActor.group.position.set(x, this.localActor.group.position.y, z);
          this.syncHeroVisualHeight();
          this.localActor.velocity.set(0, 0, 0);
          this.localActor.snapRenderState();
        },
        spawnPack: (n: number, radius?: number, opts?: SpawnPackOptions) =>
          this.spawnHarnessPack(n, radius, opts ?? legacySpawnPackOptions(n, radius)),
        spawnThief: (edge?: CompassEdge) => this.spawnHarnessThief(edge),
        spawnWrecker: (edge?: CompassEdge) => this.spawnHarnessWrecker(edge),
        wreck: (family: BuildableId, index: number) => this.wreckHarnessBuilding(family, index),
        repair: (family: BuildableId, index: number) => {
          const repaired = this.buildSystem.repairBuilding(family, index, this.timeAlive, this.localActor.group.position);
          this.publishDiagnostics();
          return repaired;
        },
        screenPoint: (x: number, z: number, y = 0.8) => {
          this.camera.updateMatrixWorld();
          const point = new THREE.Vector3(x, y, z).project(this.camera);
          const rect = this.canvas.getBoundingClientRect();
          return {
            x: (point.x * 0.5 + 0.5) * rect.width,
            y: (-point.y * 0.5 + 0.5) * rect.height,
            z: point.z,
            inView: point.x >= -1 && point.x <= 1 && point.y >= -1 && point.y <= 1 && point.z >= -1 && point.z <= 1,
          };
        },
        demolish: (family: BuildableId, index: number) => this.demolishBuilding(family, index),
        upgradeBuilding: (family: BuildableId, index: number) => this.upgradeBuilding(family, index),
        setManualSim: (enabled: boolean) => {
          this.manualSimForTest = enabled;
          if (!enabled) this.manualResumeAtMpTickForTest = null;
          return this.manualSimForTest;
        },
        resumeManualSimAtMpTick: (tick: number) => {
          this.manualSimForTest = true;
          this.manualResumeAtMpTickForTest = Math.max(0, Math.floor(tick));
          return this.manualResumeAtMpTickForTest;
        },
        queuePowerGraphCommand: (command: PowerGraphCommand) => this.queueDevPowerGraphCommand(command),
        driveVehicle: (x: number, z: number) => {
          this.vehicle?.driveTo(x, z);
          return this.vehicle !== undefined;
        },
        advanceSim: (seconds: number, onTick?: (sample: GrSimulationTickSample) => void) => this.advanceSimForTest(seconds, onTick),
        driveRenderSchedule: (seconds: number, renderFps: number) => this.driveRenderScheduleForTest(seconds, renderFps),
        triggerDamSurge: () => this.damSurge?.trigger(this.timeAlive) ?? false,
        damSurge: () => this.damSurge?.diagnostics() ?? null,
        resetRun: () => this.resetRun(),
        endRunForTest: () => {
          for (const actor of this.actors) if (actor.group.visible) actor.hp = 0;
          this.endRun();
        },
        toggleWeapon: () => this.toggleWeapon(),
        setBlastAim: (x: number, z: number) => this.setBlastAimForTest(x, z),
        setDifficultyPreset: (preset: string) => this.setDifficultyPreset(preset),
        warmVfx: () =>
          Promise.all([this.vfx.warm(this.localActor.group.position), this.enemies.warmHitFlashes(this.localActor.group.position)]).then(
            () => undefined,
          ),
        clearScores: () => clearScores(),
        setBalance: (path: string, value: number | boolean | string) => setBalance(path, value),
        grantGold: (n: number) => {
          this.economy.apply({
            id: crypto.randomUUID(),
            at: this.timeAlive,
            type: 'gold_granted',
            source: 'debug',
            amount: n,
          });
        },
        grantPressure: (n: number, actor = 'player') => {
          this.economy.apply({
            id: crypto.randomUUID(),
            at: this.timeAlive,
            type: 'resource_granted',
            resource: 'pressure',
            source: 'debug',
            amount: n,
            actor: actor === 'prospector' ? 'prospector' : 'player',
          });
        },
        grantXp: (n: number) => {
          if (!this.secureClaimChoicePending()) this.progression.debugGrant(n);
        },
        maxUpgrades: () => this.progression.maxCoreForTest(),
        setUpgradeStacks: (stacks) => this.progression.setStacksForTest(stacks as Partial<Record<UpgradeId, number>>),
        rollUpgradeOffer: () => this.progression.rollOfferForTest(),
        setFillersDisabled: (disabled: boolean) => this.progression.setFillersDisabled(disabled),
        researchState: () => this.researchDiagnostics(),
        takeResearchNode: (id: string) => this.takeResearchNodeForTest(id),
        availableResearchPicks: () => availablePicks(this.researchState).map((node) => node.id),
        economyLog: () => this.economy.log,
        summarizeLog: (log) => summarizeLog(log as readonly EconomyEvent[]),
        setBeaconWave: (wave: number | null) => {
          this.debugBeaconWaveOverride = wave;
        },
        setDayNightTime: (seconds: number | null) => {
          this.dayNightTimeOverride = seconds === null ? null : Math.max(0, Number.isFinite(seconds) ? seconds : 0);
          return this.dayNightCycle?.sample(this.dayNightTimeOverride ?? this.timeAlive) ?? null;
        },
        lightCoverage: (x: number, z: number) => this.lightField.coverageAt(x, z),
        spawnMoths: (count: number, x: number, z: number) => this.mothSwarm.spawn(this.enemies, count, x, z),
        announceForTest: (text: string, kind: 'wave' | 'baron' | 'baron-defeat' = 'wave') => {
          this.uiBridge.announce(text, this.timeAlive, null, 4, kind);
          this.syncUi();
          this.publishDiagnostics();
        },
        setWave: (wave: number) => this.waveSystem.setWaveForTest(wave),
        startWaveForTest: (wave: number) => this.startWaveForTest(wave),
        activeContract: () => this.activeContract,
        megaproject: () => this.megaprojectDiagnostics(),
        fundMegaproject: () => this.fundMegaprojectStage(),
        damageMegaproject: (amount: number) => this.damageMegaprojectForTest(amount),
        escort: () => this.waveSystem.escortDiagnostics,
        damageEscort: (amount: number) => {
          const target = this.waveSystem.activeEscortTarget;
          if (!target) return false;
          this.combat.setTime(this.timeAlive);
          this.combat.damageBuilding(target, amount, -1);
          this.publishDiagnostics();
          return true;
        },
        terrainSample: (x: number, z: number) => Terrain.sample(x, z),
        terrainVisualY: (x: number, z: number, base = 0, padRadius = 0) => Terrain.visualY(x, z, base, padRadius),
        terrainSim: (x: number, z: number) => terrainSimSample(x, z),
        setTestClip: (slot: string, frames: string[], fps: number) => setSpriteTestClip(slot as AssetSlotId, frames, fps),
        setBuildMode: (on: boolean) => this.buildSystem.setBuildMode(on),
        selectBuildable: (id: string) => this.selectBuildable(id),
        rotateBuildGhost: () => this.buildSystem.rotateGhost(),
        placeFree: (id: BuildableId, x: number, z: number, rotationSteps = 0) => {
          const placed = this.buildSystem.placeFree(id, { x, z }, rotationSteps);
          if (placed) discoverLedgerBuildable(id);
          this.publishDiagnostics();
          return placed;
        },
        confirmBuild: () => {
          const id = this.buildSystem.diagnostics.selectedBuildable;
          const placed = this.buildSystem.confirm(this.timeAlive);
          if (placed) discoverLedgerBuildable(id);
          this.publishDiagnostics();
          return placed;
        },
        testAudio: (name: string) => this.audio.play(name),
        enemyPositions: () =>
          this.enemies.all
            .filter((enemy) => enemy.isAlive)
            .map((enemy) => {
              const sim = terrainSimSample(enemy.position.x, enemy.position.z);
              const terrainSample = Terrain.sample(enemy.position.x, enemy.position.z);
              return {
                x: enemy.position.x,
                y: enemy.position.y,
                z: enemy.position.z,
                id: enemy.id,
                spreadOffset: enemy.spreadOffset,
                hp: enemy.currentHp,
                maxHp: enemy.maxHp,
                speed: enemy.moveSpeed,
                contactDamage: enemy.contactDamage,
                buildingDamage: enemy.buildingDamage,
                supportBuildingDamage: enemy.supportBuildingDamage,
                heroPursuitRange: enemy.heroPursuitRange,
                hitRadius: enemy.hitRadius,
                eliteKind: enemy.eliteKind ?? undefined,
                variantId: enemy.variantId ?? undefined,
                variantLabel: enemy.variantLabel ?? undefined,
                boltDamageMult: enemy.boltDamageMult,
                bossGroupId: enemy.bossGroupId ?? undefined,
                bossGroupSize: enemy.bossGroupSize,
                bossGroupTotalHp: enemy.bossGroupTotalHp,
                bossComponentId: enemy.bossComponentId ?? undefined,
                bossComponentLabel: enemy.bossComponentLabel ?? undefined,
                bossDegradeSpeedMult: enemy.bossDegradeSpeedMult,
                presentation: this.enemies.railcarPresentation(enemy),
                scale: enemy.visualScale,
                hasBanner: enemy.hasBanner,
                vx: enemy.velocityX,
                vz: enemy.velocityZ,
                thief: enemy.isThief,
                wrecker: enemy.isWrecker,
                state: enemy.stealState,
                wreckState: enemy.wreckState,
                carried: enemy.carriedAmount,
                edge: enemy.ownEdge,
                zone: terrainSample.zone,
                light: Number(this.enemies.lightFactorFor(enemy).toFixed(3)),
                watchPainted: this.enemies.watchPaintedFor(enemy),
                terrain: {
                  grounded: Math.abs(enemy.position.y - Terrain.visualY(enemy.position.x, enemy.position.z, Balance.enemy.groundY)) < 0.01,
                  slope: sim.slope,
                  traversable: sim.traversable,
                  speedMul: terrainSample.speedMul * terrainSpeedMultiplier(enemy.position.x, enemy.position.z, enemy.velocityX, enemy.velocityZ),
                },
              };
            }),
        spawnEnemyAt: (x: number, z: number) => this.enemies.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z), { activationDelay: 0.05 }) !== null,
        scriptEnemyAt: (x: number, z: number, targetX: number, targetZ: number, speed: number) => {
          const enemy = this.enemies.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z));
          if (!enemy) return false;
          enemy.scriptMoveTo(targetX, targetZ, speed);
          return true;
        },
        clearEnemies: () => this.enemies.recycleAll(),
        captureSuspend: () => this.captureMultiplayerRunSuspendSnapshot(),
        restoreSuspend: (snapshot: unknown) => this.restoreMultiplayerRunSuspendSnapshot(snapshot),
        lastMultiplayerHashState: () => structuredClone(this.lastMultiplayerHashState),
        spawnGoldPickup: (x: number, z: number, amount: number) =>
          this.goldPickups.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z), amount) >= 0,
        spawnXpMote: (x: number, z: number, value: number) =>
          this.xpMotes.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z), value),
        launchBlastAt: (x: number, z: number, airTime = 1) =>
          this.combat.launchLob(
            this.primaryActor.group.position,
            new THREE.Vector3(x, Balance.enemy.groundY, z),
            airTime,
            this.currentBlastDamage(),
            this.blastShooter.aoe?.radius ?? Balance.blast.radius,
            'hero_blast',
          ),
        goldPickups: () => this.goldPickups.snapshot(),
        placeBeacon: () => {
          this.buildSystem.selectBuildable('sentry_beacon', true);
          return this.buildSystem.confirm(this.timeAlive);
        },
        projectileVisuals: () => this.combat.projectileVisuals,
        state: () => ({
          enemiesAlive: this.enemies.activeCount,
          xp: this.combat.xpCount,
          boltsAlive: this.combat.boltsAlive,
          combat: this.combat.boltDiagnostics,
          arsenal: this.arsenalDiagnostics(),
          buildables: this.buildSystem.buildableCounts,
          economy: {
            banked: this.economy.gold,
            bankCap: this.economy.bankCap,
          },
          steal: this.stealDiagnostics(),
          wreck: this.wreckDiagnostics(),
          balance: {
            difficultyPreset: this.difficultyPreset,
            enemyHp: Balance.enemy.hp,
            xpPerKill: Balance.xp.perKill,
            offerInvestBonus: Balance.offers.investBonus,
            doubleTapCoilMaxStacks: Balance.upgrades.doubleTapCoilMaxStacks,
            rig: {
              fireRate: Balance.sparkRig.fireRate,
            },
          },
        }),
      };
    }
    this.cameraRig.snapTo(this.localActor.group.position);
    this.state.transition('playing');
    this.uiBridge.announce('Stake your claim.', 0);
    this.prefetchContractPresentation();
    // ADR-002 section 4: M3 exposes install(game); wiring happens at merge (m3-01 gate, s31).
    // Meta defenses need to exist before the opening stress spawns pick lanes.
    this.runManager = new RunManager(this, {
      onSecureChoice: (choice) => {
        if (!this.mpClient) return false;
        this.mpQueuedActions.push({ type: 'secure_choice', choice });
        return true;
      },
    });
    this.runManager.install();
    this.installMultiplayerDev();
    this.waveSystem.spawnStressEnemies();
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.applyStats(this.progression.stats, null);
    this.syncUi();
    this.publishDiagnostics();
    this.showContractBriefing();
    this.showRunStartMetaRecap();
    // ADR-002 section 4: M4 exposes install(game); wiring happens at merge (m4-01 gate, s32).
    const game = this;
    this.agentStub = installAgentStub(
      {
        diagnostics: () => window.__THREE_GAME_DIAGNOSTICS__,
        economyLog: () => this.economy.log,
        repair: (building) => this.repairProspectorBuilding(building),
        collectXp: (options) => this.collectProspectorXp(options),
        collectGold: () => this.collectProspectorGold(),
      },
      {
        clock: () => this.timeAlive,
        metaProgress: {
          get agentAutonomyLevel() {
            return (game.runManager ? agentAutonomyLevel(game.runManager.metaProgress) : 0) + game.agentPolicySlotBonus;
          },
        },
      },
    );
    this.unsubscribeAgentReceipts = this.agentStub.subscribe((receipt) => {
      this.prospector.handleReceipt(receipt, this.resolveProspectorReceiptPoint(receipt));
      if (receipt.tool === 'et.goldrush.get_state') return;
      if (receipt.outcome.ok) this.audio.play('chirp-acknowledge');
      else if (receipt.outcome.reason !== 'NO_SYSTEM_API') this.audio.play('chirp-refuse');
    });
    this.agentStub.heartbeat();
    this.showProspectorIntro();
  }

  start(): void {
    this.loop.start();
  }

  openClaimLedger(entryId?: LedgerEntryId): void {
    // The ledger is local presentation in multiplayer. Pausing here would stop
    // only this client's GameState while the lockstep client kept consuming
    // ticks, guaranteeing a hash disagreement on the next boundary.
    const pauseBeforeLedger =
      !this.mpClient && this.state.current === 'playing'
        ? { paused: this.state.isPaused, playerPauseActive: this.playerPauseActive }
        : null;
    if (pauseBeforeLedger && !pauseBeforeLedger.paused) {
      this.state.setPaused(true);
      this.playerPauseActive = false;
      this.syncUi();
    }
    void import('../encyclopedia/reader').then(({ openClaimLedger }) =>
      openClaimLedger({
        entryId,
        onClose: () => {
          if (pauseBeforeLedger) {
            this.state.setPaused(pauseBeforeLedger.paused);
            this.playerPauseActive = pauseBeforeLedger.playerPauseActive;
          }
          this.syncUi();
          this.publishDiagnostics();
        },
      }),
    );
  }

  dispose(): void {
    this.runManager?.dispose();
    this.unsubscribeAgentReceipts?.();
    this.agentStub?.dispose();
    this.mpClient?.dispose();
    window.__GR_MP__ = undefined;
    this.loop.stop();
    window.clearTimeout(this.baronAnnouncementTimer);
    window.removeEventListener('pointerdown', this.skipBaronCeremony);
    window.removeEventListener('keydown', this.skipBaronCeremony);
    this.canvas.removeEventListener('pointermove', this.onBlastAimPointerMove);
    this.input.dispose();
    this.hud.dispose();
    this.assayOfficePrompt.dispose();
    this.buildingContextPrompt.dispose();
    this.worldInfoNotePrompt.dispose();
    this.promptStack.remove();
    this.deathOverlay.dispose();
    this.upgradeOverlay.dispose();
    this.damageVignette.remove();
    this.debugTools.dispose();
    this.run3dPilot?.dispose();
    this.terrain3dPilotCancelled = true;
    this.terrain3dPilotDispose?.();
    this.buildSystem.dispose();
    this.pressureSystem.dispose();
    this.pressureArsenalSystem.dispose();
    this.crawlerBoss.dispose();
    this.megaprojectGroup.clear();
    this.megaprojectGeometry.dispose();
    this.megaprojectBarrelGeometry.dispose();
    this.megaprojectPlaqueGeometry.dispose();
    this.megaprojectBaseMaterial.dispose();
    this.megaprojectStageMaterial.dispose();
    this.megaprojectGhostMaterial.dispose();
    this.megaprojectStakeMaterial.dispose();
    this.megaprojectStringMaterial.dispose();
    this.megaprojectWalkwayMaterial.dispose();
    this.megaprojectSignMaterial.dispose();
    this.megaprojectCrateMaterial.dispose();
    this.megaprojectBarrelMaterial.dispose();
    this.megaprojectPlaqueTexture.dispose();
    this.megaprojectPlaqueMaterial.dispose();
    for (const unsubscribe of this.heroShooterUnsubscribes) unsubscribe();
    this.heroShooterUnsubscribes.length = 0;
    for (const chip of this.mpHeroChips.values()) chip.remove();
    this.mpHeroChips.clear();
    this.mpActorMeta.clear();
    this.mpCard?.remove();
    this.baronStandardGroup.clear();
    this.baronStandardPoleGeometry.dispose();
    this.baronStandardClothGeometry.dispose();
    this.baronStandardPoleMaterial.dispose();
    this.baronStandardClothMaterial.dispose();
    this.baronRocketCartGroup.clear();
    this.baronRocketCartBodyGeometry.dispose();
    this.baronRocketCartWheelGeometry.dispose();
    this.baronRocketCartRailGeometry.dispose();
    this.baronRocketCartRocketGeometry.dispose();
    this.baronRocketCartFuseGeometry.dispose();
    this.baronRocketCartWoodMaterial.dispose();
    this.baronRocketCartWheelMaterial.dispose();
    this.baronRocketCartBrassMaterial.dispose();
    this.baronRocketCartTealMaterial.dispose();
    this.railPath?.dispose();
    this.megaprojectRailPath?.dispose();
    this.powerWireView?.dispose();
    this.damSurge?.dispose();
    this.tram?.dispose();
    this.vehicle?.dispose();
    this.fuelSystem?.dispose();
    this.detailScatter?.dispose();
    this.lightRig?.dispose();
    this.harvestSystem.dispose();
    this.combat.dispose();
    this.audio.dispose();
    this.prospector.dispose();
    this.vfx.dispose();
    this.blastAimReticle.geometry.dispose();
    (this.blastAimReticle.material as THREE.Material).dispose();
    this.goldPickups.dispose();
    this.mothSwarm.dispose();
    this.enemies.dispose();
    for (const actor of this.actors) actor.dispose();
    disposeGeneratedAssets();
    this.disposeRunTelemetry();
    this.events.clear();
    this.renderer.dispose();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): boolean {
    this.mpTickThisFrame = null;
    this.mpActorIntents = null;
    this.mpActionsThisTick = [];
    const sampledIntents = this.input.readIntents();
    const cancelConsumed = this.mpClient ? this.applyLocalMultiplayerPresentation(sampledIntents) : false;
    const lockstepSample = this.mpClient
      ? lockstepInputFromIntents(sampledIntents, {
          pauseTarget: sampledIntents.pause ? !this.state.isPaused : null,
          queuedActions: this.multiplayerSampleActions(sampledIntents),
        })
      : null;
    if (lockstepSample && cancelConsumed) lockstepSample.pause = false;
    const lockstepTick = this.mpClient && lockstepSample ? this.mpClient.pump(lockstepSample) : null;
    if (this.mpClient && !lockstepTick) {
      if (!this.releaseFailedMultiplayer()) return false;
    }
    const intents = lockstepTick ? this.consumeMultiplayerTick(lockstepTick) : sampledIntents;
    if (lockstepTick) delta = this.mpClient!.stepSeconds / Math.max(0.001, this.simTimeScale);
    if (
      lockstepTick &&
      this.manualResumeAtMpTickForTest !== null &&
      lockstepTick.tick >= this.manualResumeAtMpTickForTest
    ) {
      this.manualSimForTest = false;
      this.manualResumeAtMpTickForTest = null;
    }
    this.simTick += 1;
    this.fixedTickElapsed += delta;
    this.updateActionActorPosition();
    this.updateBuildingContextCandidates();
    if (sampledIntents.mute && !this.lastMuteIntent) this.toggleAudioMute();
    this.lastMuteIntent = sampledIntents.mute;
    if (lockstepTick) this.applyMultiplayerActions();
    if (this.baronCeremony) {
      if (this.fixedTickElapsed - this.baronCeremony.startedTickElapsed >= BARON_KILL_STOP_SECONDS) {
        this.finishBaronCeremony();
      }
      if (this.baronCeremony) {
        this.rememberIntents(intents);
        this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
        this.captureRenderState();
        this.finishMultiplayerTick();
        return true;
      }
    }
    if (this.secureClaimChoicePending()) {
      this.rememberIntents(intents);
      this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
      this.updateCharmPause(delta);
      this.captureRenderState();
      this.finishMultiplayerTick();
      return true;
    }
    if (intents.build && !this.lastBuildIntent) this.toggleBuildMenu();
    if (intents.buildSlot !== null && this.buildMenuOpen) this.selectBuildableByIndex(intents.buildSlot);
    if (intents.cancel && !this.lastCancelIntent && (this.upgradeCandidate || this.demolishCandidate)) {
      this.cancelInteractionPrompts();
    } else if (intents.cancel && !this.lastCancelIntent && (this.buildMenuOpen || this.buildSystem.isBuildMode)) {
      this.closeBuildMenu();
    } else if (intents.pause && !this.lastPauseIntent && !this.secureClaimChoicePending()) {
      this.togglePlayerPause();
    }
    if (intents.restart && !this.lastRestartIntent && this.state.current === 'dead') this.resetRun();
    const upgradedThisFrame = intents.upgrade && !this.lastUpgradeIntent ? this.confirmUpgrade() : false;
    if (intents.rotateBuild && !this.lastRotateIntent && this.buildSystem.isBuildMode) this.buildSystem.rotateGhost();
    if (intents.weaponToggle) this.toggleWeapon();
    if (intents.debugSpawn && !this.lastDebugSpawnIntent) this.spawnDebugPack();
    if (
      intents.debugXp &&
      !this.lastDebugXpIntent &&
      new URLSearchParams(window.location.search).has('debug') &&
      !this.secureClaimChoicePending()
    ) {
      // Debug XP enters Progression's cumulative counter directly so motes and tests share one threshold path.
      this.progression.debugGrant(50);
    }
    if (intents.confirm && !this.lastConfirmIntent && !upgradedThisFrame) this.confirmAction();
    this.lastPauseIntent = intents.pause;
    this.lastRestartIntent = intents.restart;
    this.lastBuildIntent = intents.build;
    this.lastCancelIntent = intents.cancel;
    this.lastConfirmIntent = intents.confirm;
    this.lastUpgradeIntent = intents.upgrade;
    this.lastRotateIntent = intents.rotateBuild;
    this.lastWeaponToggleIntent = intents.weaponToggle;
    this.lastMuteIntent = sampledIntents.mute;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.lastDebugXpIntent = intents.debugXp;
    this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
    this.updateCharmPause(delta);

    if (this.state.simActive && (!this.manualSimForTest || this.manualAdvanceForTest)) {
      this.captureRenderState();
      this.activeTickElapsed += delta;
      const simDelta = delta * this.simTimeScale;
      this.timeAlive += simDelta;
      if (this.activeWeapon === 'blast') this.blastTime += simDelta;
      this.updateActors(simDelta, intents);
      this.syncHeroVisualHeight();
      this.updateBlastAim(intents);
      this.updateWetPowderHint(simDelta);
      this.combat.setTime(this.timeAlive);
      this.damSurge?.update(this.timeAlive);
      if (this.finishPendingDeath()) return true;
      this.waveSystem.update(this.timeAlive);
      if (this.activeContract.twist.baron?.variantId === 'dynamo_crawler' && this.baronBeatenThisRun) {
        this.crawlerBoss.restoreWreck(this.baronStandardPosition);
      }
      this.crawlerBoss.update(this.timeAlive);
      if (this.secureClaimChoicePending()) {
        this.finishMultiplayerTick();
        return true;
      }
      this.buildSystem.update(
        simDelta,
        this.timeAlive,
        this.enemies.all,
        (position, amount) => {
          if (Balance.charm.coinTick > 0) this.audio.playCoin();
          if (this.hasBuiltStockpile()) this.audio.play('stockpile-deposit', 0.8);
          this.vfx.floatText(position, `+${amount}`, '#c4883a');
        },
        (position) => this.vfx.floatText(position, 'Vault full!', '#a0522d'),
        this.localActor.group.position,
      );
      this.pressureSystem.update(simDelta, this.timeAlive, this.visibleActorPositions(), this.waveSystem.diagnostics.wave);
      this.fuelSystem?.update(simDelta, this.visibleActorPositions());
      this.vehicle?.update(simDelta);
      this.buildSystem.applyTurretPressureFireRateMult(this.pressureArsenalSystem.turretFireRateMult * this.crawlerBoss.turretFireRateMult);
      this.applyHarvestStats(
        this.pressureArsenalSystem.updateAutoPan(
          simDelta,
          this.timeAlive,
          this.harvestSnapshot.channeling,
          (this.progression.snapshot.stacks.auto_pan ?? 0) > 0,
        ),
      );
      this.syncContractPowerGrid();
      this.powerGraph?.step(this.simTick);
      this.syncCanyonConnectObjective();
      if (this.tram && this.powerGraph) {
        const state = this.powerGraph.snapshot().nodes.find((node) => node.id === this.tram!.consumer.id)?.state ?? 'dark';
        this.tram.update(simDelta, state);
      }
      this.syncStockpileHoldings();
      this.mothSwarm.update(simDelta, this.mothLightSources, this.enemies.all);
      this.enemies.update(
        simDelta,
        this.visibleActorPositions(),
        (enemy) => {
          this.combat.handleEnemyContact(enemy);
          return this.deathPending;
        },
        this.buildSystem.palisadeBlockers,
        isStealDisabled() ? undefined : this.thiefContext,
        isWreckDisabled() ? undefined : this.wreckerContext,
        (enemy) => this.mothSeasonSpeedMultiplier(enemy),
      );
      if (this.finishPendingDeath()) return true;
      this.discoverVisibleLedgerEnemies();
      this.harvestSnapshot = this.harvestSystem.update(
        simDelta,
        this.timeAlive,
        this.visibleHarvestTargets(),
      );
      if (this.harvestSnapshot.channeling && !this.lastHarvestChanneling) this.audio.play('pan-swish');
      this.lastHarvestChanneling = this.harvestSnapshot.channeling;
      if (this.harvestSnapshot.lastGoldGain > 0) {
        if (this.hasBuiltStockpile()) this.audio.play('stockpile-deposit', 0.8);
        this.vfx.floatText(this.lastHarvestGoldPosition(), `+${this.harvestSnapshot.lastGoldGain}`, '#c4883a');
      }
      this.updateBaronRocketVolley();
      this.combat.update(simDelta, this.timeAlive);
      if (this.finishPendingDeath()) return true;
      this.maybeProspectorRepair();
      this.maybeProspectorCollectGold();
      this.maybeProspectorCollectXp();
      this.goldPickups.update(
        simDelta,
        this.visibleActorPositions(),
        (amount) => this.economy.canReceiveIncome(this.reclaimAmount(amount)),
        (position, amount) => this.reclaimGold(position, amount),
        (position) => this.blockedGoldPickup(position),
      );
      this.progression.consumeXpTotal(this.combat.xpCount);
      this.prospector.updateSimulation(delta, this.timeAlive, this.primaryActor.group.position);
    } else {
      this.captureRenderState();
    }
    this.finishMultiplayerTick();
    return true;
  }

  private present(frame: Readonly<LoopFrame>, draw = true): void {
    this.frame += 1;
    beginSpriteStatsFrame(this.frame);
    this.recordFrameMs(frame.deltaSeconds * 1000);
    this.elapsed += frame.presentationDeltaSeconds;
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    if (this.state.simActive && (!this.manualSimForTest || this.manualAdvanceForTest)) {
      this.terrainView?.update(frame.presentationDeltaSeconds * this.simTimeScale);
    }
    this.applyRenderInterpolation(frame.alpha);
    this.prospector.updatePresentation(this.state.isPaused ? 0 : frame.presentationDeltaSeconds, frame.alpha);
    if (this.powerGraph && this.powerWireView) this.powerWireView.update(this.powerGraph.snapshot());
    this.updatePresentation(frame.presentationDeltaSeconds);
    this.run3dPilot?.update();
    if (draw) this.render();
  }

  private captureRenderState(): void {
    for (const actor of this.actors) actor.captureRenderState();
    this.enemies.captureRenderState();
    this.combat.captureRenderState();
    this.goldPickups.captureRenderState();
    this.prospector.captureRenderState();
  }

  private applyRenderInterpolation(alpha: number): void {
    for (const actor of this.actors) {
      actor.applyRenderInterpolation(alpha, this.heroVisualYAt);
    }
    this.enemies.applyRenderInterpolation(alpha);
    this.combat.applyRenderInterpolation(alpha);
    this.goldPickups.applyRenderInterpolation(alpha);
  }

  private discoverVisibleLedgerEnemies(): void {
    for (const enemy of this.enemies.all) {
      if (!enemy.isAlive || enemy.variantId === 'dynamo_crawler') continue;
      const entryId = ledgerEnemyEntryId(enemy);
      this.enemyLedgerKinds.set(enemy.id, entryId);
      this.discoverLedgerEnemyEntry(entryId);
    }
  }

  private discoverLedgerEnemyEntry(entryId: EnemyLedgerEntryId): void {
    if (this.enemyLedgerEntriesSeenThisRun.has(entryId)) return;
    this.enemyLedgerEntriesSeenThisRun.add(entryId);
    discoverLedgerEntry(entryId);
  }

  private revealLedgerEnemyStats(entryId: EnemyLedgerEntryId): void {
    if (this.enemyLedgerStatsSeenThisRun.has(entryId)) return;
    this.enemyLedgerStatsSeenThisRun.add(entryId);
    revealLedgerEnemyStats(entryId);
  }

  private updateActors(simDelta: number, fallbackIntents: Intents): void {
    if (!this.mpActorIntents) {
      this.primaryActor.update(simDelta, fallbackIntents, { bounds: Terrain.bounds, sample: Terrain.sample }, this.harvestSnapshot.channeling);
      return;
    }
    for (let slot = 0; slot < this.actors.length; slot += 1) {
      const actor = this.actors[slot];
      if (!actor?.group.visible) continue;
      actor.update(simDelta, this.mpActorIntents[slot] ?? intentsFromLockstepInput(null), {
        bounds: Terrain.bounds,
        sample: Terrain.sample,
      }, this.harvestSnapshot.channeling && slot === this.mpActionSlot);
    }
  }

  private updatePresentation(delta: number): void {
    this.syncAudioLoops();
    this.vfx.update(delta);
    this.combatVfx.update(delta);
    this.syncBaronStandardDrop();
    this.syncBaronRocketCart();
    const visualStress =
      this.enemies.activeCount >= Balance.world.detailStressEnemyThreshold ||
      this.waveSystem.diagnostics.wave >= Balance.world.detailStressWaveThreshold;
    this.detailScatter?.syncBuildingClearings(this.detailClearings());
    this.cameraRig.update(delta, this.localActor.renderPosition, this.localActor.velocity);
    this.syncMultiplayerNameChips();
    this.lightRig?.setStressFallback(visualStress);
    this.syncNightShiftLighting();
    this.lightRig?.update(this.timeAlive);
    this.damageVignette.style.opacity = (this.damageFlashRemaining / Balance.hero.iframes).toFixed(3);
    this.syncUpgradeOverlay();
    this.syncUi();
    this.syncAssayOfficePrompt();
    this.syncBuildingContextPrompt();
    this.syncWorldInfoNotePrompt();
    this.publishDiagnostics();
  }

  private consumeMultiplayerTick(bundle: LockstepTick): Intents {
    this.mpTickThisFrame = bundle.tick;
    this.syncMultiplayerActors();
    const roster = bundle.roster.slice(0, 4);
    const byPlayer = new Map(bundle.inputs.map((entry) => [entry.playerId, entry.input]));
    this.mpActorIntents = roster.map((player) => intentsFromLockstepInput(byPlayer.get(player.playerId)));
    this.mpActionsThisTick = roster.flatMap((player, slot) =>
      (byPlayer.get(player.playerId)?.actions ?? []).map((action) => ({ slot, action })),
    );
    return this.mpActorIntents[this.mpLocalSlot] ?? intentsFromLockstepInput(null);
  }

  private applyMultiplayerActions(): void {
    for (const entry of this.mpActionsThisTick) {
      this.mpActionSlot = entry.slot;
      this.updateActionActorPosition();
      if (this.applyMultiplayerAction(entry.action)) break;
    }
    this.mpActionSlot = 0;
    this.updateActionActorPosition();
    this.updateBuildingContextCandidates(this.localActor.group.position);
  }

  /** Returns true when the action schedules a run transition and later actions from this tick must be ignored. */
  private applyMultiplayerAction(action: LockstepAction): boolean {
    if (action.type === 'place_build') {
      if (this.buildSystem.confirmPlacement(this.timeAlive, action)) discoverLedgerBuildable(action.id as BuildableId);
    }
    if (action.type === 'weapon_toggle') this.toggleWeapon();
    if (action.type === 'restart' && this.state.current === 'dead') {
      this.deferMultiplayerTransition(() => this.resetRun());
      return true;
    }
    if (action.type === 'set_pause' && !this.secureClaimChoicePending() && this.state.isPaused !== action.paused) {
      this.togglePlayerPause();
    }
    if (action.type === 'debug_spawn') this.spawnDebugPack();
    if (
      action.type === 'debug_xp' &&
      new URLSearchParams(window.location.search).has('debug') &&
      !this.secureClaimChoicePending()
    ) {
      this.progression.debugGrant(50);
    }
    if (action.type === 'pick_upgrade' && this.state.current === 'levelup') {
      const picked = this.progression.offer?.find((choice) => choice.id === action.id);
      if (picked) this.progression.applyUpgrade(picked.id);
    }
    if (action.type === 'skip_ceremony' && this.baronCeremony) this.finishBaronCeremony();
    if (action.type === 'death_action') {
      const handler = this.mpDeathActionHandlers[action.choice];
      if (handler) {
        this.deferMultiplayerTransition(handler);
        return true;
      }
    }
    if (action.type === 'research_pick') {
      const research = this.mpResearchActionHandlers.pick?.(action.id);
      if (research) this.deathOverlay.updateResearch(research);
    }
    if (action.type === 'research_skip') {
      const research = this.mpResearchActionHandlers.skip?.();
      if (research) this.deathOverlay.updateResearch(research);
    }
    if (action.type === 'secure_choice') {
      if (action.choice === 'bank') {
        this.deferMultiplayerTransition(() => this.runManager?.endSecuredRun());
        return true;
      }
      this.deferMultiplayerTransition(() => this.runManager?.stayForRush());
      return true;
    }
    if (action.type === 'context_action') {
      if (action.action !== 'fund' && !isBuildableId(action.target.id)) return false;
      if (action.action === 'upgrade') this.upgradeBuilding(action.target.id as BuildableId, action.target.index);
      if (action.action === 'demolish') this.demolishBuilding(action.target.id as BuildableId, action.target.index);
      if (action.action === 'fund') this.fundMegaprojectStage(this.actionActor.group.position);
    }
    if (action.type === 'set_agent_rung') this.agentConsent.setRung(action.level as AgentPermissionLevel, action.granted);
    if (action.type === 'set_agent_ability') this.agentConsent.setAbility(action.ability as AgentAbility, action.granted);
    return false;
  }

  private multiplayerSampleActions(intents: Intents): LockstepAction[] {
    const actions = this.mpQueuedActions.splice(0);
    if (intents.upgrade && this.upgradeCandidate) {
      actions.push({ type: 'context_action', action: 'upgrade', target: this.upgradeCandidate });
    }
    if (!intents.confirm) return actions;
    if (this.buildSystem.isBuildMode) {
      const build = this.buildSystem.diagnostics;
      actions.push({
        type: 'place_build',
        id: build.selectedBuildable,
        position: this.buildSystem.placementPoint(this.localActor.group.position),
        rotationSteps: build.ghostRotationSteps,
      });
      return actions;
    }
    if (this.buildSystem.assayOfficeInRange(this.localActor.group.position)) {
      this.audio.play('ledger-open');
      this.openAssayBench?.();
      return actions;
    }
    if (this.megaprojectFundCandidate(this.localActor.group.position)) {
      actions.push({ type: 'context_action', action: 'fund' });
    } else if (this.demolishCandidate) {
      actions.push({ type: 'context_action', action: 'demolish', target: this.demolishCandidate });
    }
    return actions;
  }

  private applyLocalMultiplayerPresentation(intents: Intents): boolean {
    if (!intents.cancel) this.mpCancelSuppressPause = false;
    if (intents.build) this.toggleBuildMenu();
    if (intents.buildSlot !== null && this.buildMenuOpen) this.selectBuildableByIndex(intents.buildSlot);
    if (intents.rotateBuild && this.buildSystem.isBuildMode) this.buildSystem.rotateGhost();
    if (intents.cancel && !this.mpCancelSuppressPause) this.mpCancelSuppressPause = this.applyLocalCancelAction();
    return this.mpCancelSuppressPause;
  }

  private applyLocalCancelAction(): boolean {
    if (this.upgradeCandidate || this.demolishCandidate) {
      this.cancelInteractionPrompts();
      return true;
    } else if (this.buildMenuOpen || this.buildSystem.isBuildMode) {
      this.closeBuildMenu();
      return true;
    }
    return false;
  }

  private deferMultiplayerTransition(action: () => void): void {
    this.mpDeferredActions.push(() => {
      this.clearMultiplayerOverlayActions();
      action();
    });
  }

  private clearMultiplayerOverlayActions(): void {
    delete this.mpDeathActionHandlers.done;
    delete this.mpDeathActionHandlers.secondary;
    delete this.mpResearchActionHandlers.pick;
    delete this.mpResearchActionHandlers.skip;
  }

  private finishMultiplayerTick(): void {
    const tick = this.mpTickThisFrame;
    if (!this.mpClient || tick === null) return;
    const snapshot = this.mpClient.shouldExchangeHash(tick) ? this.captureMultiplayerRunSuspendSnapshot() : null;
    this.mpClient.afterSimTick(tick, snapshot ? this.multiplayerStateHash(tick, snapshot) : '', snapshot);
    this.mpTickThisFrame = null;
    for (const action of this.mpDeferredActions.splice(0)) action();
  }

  private captureMultiplayerRunSuspendSnapshot(): MultiplayerRunSuspendSnapshot {
    const snapshot = captureRunSuspendSnapshot(
      this,
      this.runManager?.metaProgress ?? this.appliedMetaProgress,
      this.waveSystem.diagnostics.wave,
      this.timeAlive,
    ) as MultiplayerRunSuspendSnapshot;
    if (this.actors.length > 1) {
      snapshot.mpActors = this.actors.filter((actor) => actor.group.visible).map((actor) => ({
        hp: actor.hp,
        iframeRemaining: actor.iframeSecondsRemaining,
        position: {
          x: actor.group.position.x,
          y: actor.group.position.y,
          z: actor.group.position.z,
        },
        velocity: {
          x: actor.velocity.x,
          y: actor.velocity.y,
          z: actor.velocity.z,
        },
        visible: actor.group.visible,
      }));
    }
    return snapshot;
  }

  private restoreMultiplayerRunSuspendSnapshot(snapshot: unknown): boolean {
    const rosterSize = this.mpClient?.state().roster.length ?? 0;
    const normalized = normalizeRunSuspendDatum(snapshot);
    if (!normalized) return false;
    if (normalized.contractId !== this.activeContract.id) return false;
    const mpActors = multiplayerActorsForRestore(snapshot, normalized, rosterSize);
    if (rosterSize >= 2 && !mpActors) return false;
    if (mpActors && mpActors.length > this.actors.length) this.syncMultiplayerActors();
    const restored = restoreRunSuspendSnapshot(this, normalized, { persistProfile: false });
    if (!restored) return false;
    return this.restoreMultiplayerActorSnapshots(mpActors);
  }

  private restoreMultiplayerActorSnapshots(mpActors: readonly MultiplayerActorSnapshot[] | null): boolean {
    if (!mpActors?.length) return true;
    this.syncMultiplayerActors();
    if (mpActors.length !== this.actors.filter((actor) => actor.group.visible).length) return false;
    const restoredActors: Array<{ actor: Hero; saved: MultiplayerActorSnapshot }> = [];
    for (let slot = 0; slot < mpActors.length; slot += 1) {
      const actor = this.actors[slot];
      const saved = mpActors[slot];
      if (!actor || !saved) return false;
      const position = new THREE.Vector3(saved.position.x, saved.position.y, saved.position.z);
      actor.resetRun(position);
      restoredActors.push({ actor, saved });
    }
    this.applyStats(this.progression.stats, null);
    for (const { actor, saved } of restoredActors) {
      actor.hp = Math.min(actor.maxHp, Math.max(0, saved.hp));
      actor.restoreIframes(saved.iframeRemaining);
      actor.velocity.set(saved.velocity.x, saved.velocity.y, saved.velocity.z);
      actor.group.visible = saved.visible;
    }
    this.syncHeroVisualHeight();
    for (const actor of this.actors) actor.snapRenderState();
    this.cameraRig.snapTo(this.localActor.group.position);
    return true;
  }

  private multiplayerStateHash(tick: number, snapshot: MultiplayerRunSuspendSnapshot): string {
    const state = planarHashState({
      tick,
      roster: (this.mpClient?.state().roster ?? []).map(({ playerId, name, town }) => ({ playerId, name, town })),
      run: multiplayerRunSuspendFutureState(snapshot),
      actors: snapshot.mpActors ?? null,
    });
    if (new URLSearchParams(window.location.search).has('debug')) {
      this.lastMultiplayerHashState = { tick, state };
    }
    return stableHash(state);
  }

  private installMultiplayerDev(): void {
    const config = multiplayerConfigFromSearch() ?? consumeStagedRideConfig();
    if (!config) return;
    this.mpClient = new LockstepClient({
      ...config,
      setup: currentMultiplayerSetup(this.activeContract.id),
      onDesync: (tick) => {
        this.mpPauseBeforeResync ??= { paused: this.state.isPaused, playerPauseActive: this.playerPauseActive };
        this.state.setPaused(true);
        this.playerPauseActive = false;
        this.showMultiplayerCard('The wire crossed', `Tick ${tick} disagreed. Restoring the latest trail ledger.`);
      },
      onSnapshot: (snapshot, tick) => {
        const restored = this.restoreMultiplayerRunSuspendSnapshot(snapshot);
        if (restored) {
          this.mpPauseBeforeResync = null;
          this.simTick = tick + 1;
          this.showMultiplayerCard('The wire crossed', 'Trail ledger restored. Riding together again.');
        }
        return restored;
      },
    });
    window.__GR_MP__ = {
      state: () => this.mpClient?.state() ?? null,
      injectDesyncAt: (tick: number) => this.mpClient?.injectDesyncAt(tick),
    };
    void this.mpClient.connect();
  }

  private showMultiplayerCard(title: string, message: string): void {
    if (!this.mpCard) {
      const card = document.createElement('section');
      card.className = 'death-overlay death-overlay--visible gr-mp-card';
      card.dataset.testid = 'mp-desync-card';
      card.setAttribute('aria-label', 'Multiplayer sync');
      card.innerHTML = `
        <div class="death-overlay__panel">
          <p class="death-overlay__eyebrow">Ride Together</p>
          <h1 data-mp-card-title></h1>
          <p class="death-overlay__flavor" data-mp-card-message></p>
        </div>
      `;
      this.getElement('#app').append(card);
      this.mpCard = card;
    }
    this.mpCard.querySelector('[data-mp-card-title]')!.textContent = title;
    this.mpCard.querySelector('[data-mp-card-message]')!.textContent = message;
    this.mpCard.classList.add('death-overlay--visible');
  }

  private syncMultiplayerActors(): void {
    const state = this.mpClient?.state();
    if (!state?.connected || state.roster.length < 2) {
      this.mpLocalSlot = 0;
      this.mpActionSlot = 0;
      this.primaryActor.setIdentityTint(null);
      for (let slot = 1; slot < this.actors.length; slot += 1) {
        const actor = this.actors[slot];
        if (actor) actor.group.visible = false;
      }
      this.mpActorMeta.clear();
      this.removeAllMultiplayerChips();
      return;
    }

    const roster: MultiplayerPlayer[] = state.roster.slice(0, 4);
    const localSlot = roster.findIndex((player) => player.playerId === state.playerId);
    this.mpLocalSlot = localSlot >= 0 ? localSlot : 0;

    let createdActor = false;
    while (this.actors.length < roster.length) {
      const actor = new Hero(RUN_CAST_SCALE);
      actor.group.name = `MultiplayerHero-${this.actors.length}`;
      this.actors.push(actor);
      this.registerHeroShooters(actor);
      this.scene.add(actor.group);
      createdActor = true;
    }
    for (let slot = 0; slot < this.actors.length; slot += 1) {
      const actor = this.actors[slot];
      if (!actor) continue;
      const player = roster[slot];
      if (!player) {
        actor.group.visible = false;
        continue;
      }
      actor.group.visible = true;
      const local = player.playerId === state.playerId;
      const previous = this.mpActorMeta.get(actor);
      this.mpActorMeta.set(actor, { playerId: player.playerId, slot, name: player.name, town: player.town, local });
      actor.setIdentityTint(local ? null : multiplayerTint(slot));
      if (!previous || previous.playerId !== player.playerId || previous.slot !== slot) {
        actor.resetRun(this.multiplayerSpawnPosition(slot, roster.length));
      }
    }
    if (createdActor) this.applyStats(this.progression.stats, null);

    for (const [playerId, chip] of this.mpHeroChips) {
      if (roster.some((player) => player.playerId === playerId)) continue;
      chip.remove();
      this.mpHeroChips.delete(playerId);
    }
    this.updateActionActorPosition();
  }

  private multiplayerSpawnPosition(slot: number, total: number): THREE.Vector3 {
    const center = Terrain.lossStakeMarker() ?? this.heroStart;
    const count = Math.max(2, total);
    const angle = -Math.PI / 2 + (Math.PI * 2 * slot) / count;
    const position = new THREE.Vector3(
      center.x + Math.cos(angle) * MULTIPLAYER_SPAWN_RADIUS,
      this.heroStart.y,
      center.z + Math.sin(angle) * MULTIPLAYER_SPAWN_RADIUS,
    );
    position.x = THREE.MathUtils.clamp(position.x, Terrain.bounds.minX + Balance.hero.radius, Terrain.bounds.maxX - Balance.hero.radius);
    position.z = THREE.MathUtils.clamp(position.z, Terrain.bounds.minZ + Balance.hero.radius, Terrain.bounds.maxZ - Balance.hero.radius);
    for (let attempt = 0; attempt < count; attempt += 1) {
      if (Terrain.sample(position.x, position.z).walkable) break;
      const nextAngle = angle + ((attempt + 1) * Math.PI * 2) / count;
      position.x = THREE.MathUtils.clamp(
        center.x + Math.cos(nextAngle) * MULTIPLAYER_SPAWN_RADIUS,
        Terrain.bounds.minX + Balance.hero.radius,
        Terrain.bounds.maxX - Balance.hero.radius,
      );
      position.z = THREE.MathUtils.clamp(
        center.z + Math.sin(nextAngle) * MULTIPLAYER_SPAWN_RADIUS,
        Terrain.bounds.minZ + Balance.hero.radius,
        Terrain.bounds.maxZ - Balance.hero.radius,
      );
    }
    position.y = Terrain.visualY(position.x, position.z, this.heroStart.y);
    return position;
  }

  private syncMultiplayerNameChips(): void {
    if (!this.mpClient?.state().connected) {
      this.removeAllMultiplayerChips();
      return;
    }
    for (const actor of this.actors) {
      const meta = this.mpActorMeta.get(actor);
      if (!meta || meta.local || !actor.group.visible) continue;
      const chip = this.mpHeroChips.get(meta.playerId) ?? this.createMultiplayerNameChip(meta);
      chip.querySelector('[data-mp-rider-name]')!.textContent = meta.name;
      chip.querySelector('[data-mp-rider-town]')!.textContent = meta.town;
      const screen = actor.renderPosition.clone();
      screen.y += 2.15;
      screen.project(this.camera);
      chip.hidden = screen.z < -1 || screen.z > 1;
      if (chip.hidden) continue;
      chip.style.left = `${(screen.x * 0.5 + 0.5) * 100}%`;
      chip.style.top = `${(-screen.y * 0.5 + 0.5) * 100}%`;
    }
  }

  private createMultiplayerNameChip(meta: MultiplayerActorMeta): HTMLElement {
    const chip = document.createElement('div');
    chip.dataset.testid = 'mp-rider-chip';
    chip.dataset.playerId = meta.playerId;
    chip.style.position = 'absolute';
    chip.style.transform = 'translate(-50%, -100%)';
    chip.style.zIndex = '12';
    chip.style.pointerEvents = 'none';
    chip.style.padding = '4px 8px';
    chip.style.border = '2px solid #2e1b0e';
    chip.style.borderRadius = '6px';
    chip.style.background = 'rgba(245, 230, 200, 0.94)';
    chip.style.boxShadow = '0 2px 0 rgba(46, 27, 14, 0.35)';
    chip.style.color = '#2e1b0e';
    chip.style.fontFamily = 'Wellfleet, serif';
    chip.style.fontSize = '12px';
    chip.style.lineHeight = '1.1';
    chip.style.textAlign = 'center';
    chip.style.whiteSpace = 'nowrap';
    chip.innerHTML = '<strong data-mp-rider-name></strong><span data-mp-rider-town style="display:block; opacity:0.72;"></span>';
    this.getElement('#app').append(chip);
    this.mpHeroChips.set(meta.playerId, chip);
    return chip;
  }

  private removeAllMultiplayerChips(): void {
    for (const chip of this.mpHeroChips.values()) chip.remove();
    this.mpHeroChips.clear();
  }

  private syncMultiplayerLedgerRiders(): void {
    const roster = (this.mpClient?.state().roster ?? []).slice(0, 4);
    const existing = this.getElement('#app').querySelector<HTMLElement>('[data-testid="mp-run-riders"]');
    if (roster.length < 2) {
      existing?.remove();
      return;
    }
    const panel = this.getElement('#app').querySelector<HTMLElement>('.death-overlay--visible .death-overlay__panel');
    if (!panel) return;
    const line = roster.map((player) => `${player.name} of ${player.town}`).join(' + ');
    const node = existing ?? document.createElement('p');
    node.className = 'death-overlay__town';
    node.dataset.testid = 'mp-run-riders';
    node.textContent = `Riders credited: ${line}.`;
    if (!existing) panel.append(node);
  }

  private syncAudioLoops(): void {
    const inRun = this.state.current === 'playing';
    const active = inRun && !this.state.isPaused;
    const musicLoop = this.contractEpoch?.id === 'epoch-2-steamworks'
      ? 'era-e2-steamworks-loop'
      : (this.contractEpoch?.order ?? 1) >= 3
        ? 'era-e3-voltage-loop'
        : 'era-e1-frontier-loop';
    for (const loop of ['era-e1-frontier-loop', 'era-e2-steamworks-loop', 'era-e3-voltage-loop'] as const) {
      // Music rides through pause overlays (level-up choices pause on most kills —
      // stopping the voice restarted the track every time; owner, Baron run 2026-07-13).
      this.audio.setLoop(loop, inRun && loop === musicLoop);
    }
    if (!active) {
      this.audio.setLoop('river-ambience-loop', false);
      this.audio.setLoop('sluice-water-loop', false);
      this.audio.setLoop('prospector-hover-loop', false);
      return;
    }

    this.audio.setLoop('river-ambience-loop', true, 0.35 + this.spatialAudioVolume({ x: this.camera.position.x, z: 0 }, 34) * 0.65);

    const sluices = this.buildSystem.diagnostics.sluicePositions;
    let sluiceVolume = 0;
    for (const position of sluices) sluiceVolume = Math.max(sluiceVolume, this.spatialAudioVolume(position, 26));
    this.audio.setLoop('sluice-water-loop', sluices.length > 0 && sluiceVolume > 0.04, sluiceVolume);

    const prospector = this.prospector.snapshot;
    const moving = prospector.moving || prospector.drifting;
    this.audio.setLoop('prospector-hover-loop', moving, this.spatialAudioVolume(prospector.position, 20));
  }

  private spatialAudioVolume(point: { x: number; z: number }, radius: number): number {
    const dx = this.camera.position.x - point.x;
    const dz = this.camera.position.z - point.z;
    return Math.max(0, Math.min(1, 1 - Math.hypot(dx, dz) / Math.max(1, radius)));
  }

  private rememberIntents(intents: Intents): void {
    this.lastPauseIntent = intents.pause;
    this.lastRestartIntent = intents.restart;
    this.lastBuildIntent = intents.build;
    this.lastCancelIntent = intents.cancel;
    this.lastConfirmIntent = intents.confirm;
    this.lastUpgradeIntent = intents.upgrade;
    this.lastRotateIntent = intents.rotateBuild;
    this.lastWeaponToggleIntent = intents.weaponToggle;
    this.lastMuteIntent = intents.mute;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.lastDebugXpIntent = intents.debugXp;
  }

  private deathRunStats(summary: EconomySummary): DeathRunStatsSnapshot {
    return {
      sluiced: summary.sluiced,
      stolen: summary.stolen,
      reclaimed: summary.reclaimed,
      pannedByProspector: summary.pannedByProspector,
      sluicedByProspector: summary.sluicedByProspector,
      reclaimedByProspector: summary.reclaimedByProspector,
      buildingsBuilt: summary.buildingsBuilt,
      buildingsLost: this.buildingsWrecked,
      buildingsRepaired: summary.repairs,
      damageByOwner: { ...this.combat.damageByOwner },
      upgradeStacks: { ...this.progression.snapshot.stacks },
    };
  }

  private weaponSplit(stats: DeathRunStatsSnapshot): { spark: number; blast: number } {
    return {
      spark: Math.round(stats.damageByOwner.hero ?? 0),
      blast: Math.round(stats.damageByOwner.hero_blast ?? 0),
    };
  }

  private render(): void {
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.camera);
    this.lightRig?.renderPost(this.renderer);
    this.recordProfileSample();
  }

  private onEnemyKilled(position: THREE.Vector3): void {
    this.dropCarrierGold(position);
    if (isCharmPauseDisabled() || this.state.current !== 'playing' || this.state.isPaused) return;
    this.cameraRig.impulse(position, Balance.charm.camImpulse);
    if (this.charmPauseCooldown > 0 || Balance.charm.hitPauseMs <= 0) return;

    this.charmPauseRemaining = Math.min(60, Balance.charm.hitPauseMs) / 1000;
    this.charmPauseCooldown = Math.max(0, Balance.charm.hitPauseCooldownMs) / 1000;
    this.charmPauseActive = this.charmPauseRemaining > 0;
    if (this.charmPauseActive) this.state.setPaused(true);
  }

  private updateCharmPause(delta: number): void {
    this.charmPauseCooldown = Math.max(0, this.charmPauseCooldown - delta);
    if (this.secureClaimChoicePending()) {
      this.charmPauseActive = false;
      this.charmPauseRemaining = 0;
      return;
    }
    if (!this.charmPauseActive) return;
    if (this.state.current !== 'playing') {
      this.charmPauseActive = false;
      this.charmPauseRemaining = 0;
      return;
    }
    this.charmPauseRemaining = Math.max(0, this.charmPauseRemaining - delta);
    if (this.charmPauseRemaining <= 0) {
      this.charmPauseActive = false;
      this.state.setPaused(false);
    }
  }

  private applyCameraTuning(): void {
    const cameraBalance = Balance.camera as {
      offset: THREE.Vector3;
      lag: number;
      lookAhead: number;
      downScreenLookOffset: number;
    };
    cameraBalance.lag = this.tuning.cameraLag;
    cameraBalance.lookAhead = this.tuning.cameraLookAhead;
    cameraBalance.offset.y = this.tuning.cameraOffsetY;
    cameraBalance.offset.z = this.tuning.cameraOffsetZ;
    cameraBalance.downScreenLookOffset = this.tuning.cameraDownScreenLookOffset;
  }

  private createScene(): void {
    this.lightRig = new LightRig(this.scene, this.renderer);

    this.terrainView = Terrain.createTerrainView();
    this.scene.add(this.terrainView.group);
    this.damSurge = new DamSurgeEvent(
      this.actors,
      Terrain.bounds,
      Terrain.sample,
      (actorIndex, amount, sourceId) => {
        const actor = this.actors[actorIndex];
        if (actor) this.combat.damageActor(amount, sourceId, actor);
      },
    );
    if (isDebugEnabled() && new URLSearchParams(window.location.search).has('damsurge')) this.damSurge.trigger(this.timeAlive);
    this.scene.add(this.damSurge.group);
    const rails = activeTileDescriptor().rails ?? [];
    if (rails.length > 0) {
      this.railPath = new RailPathView(rails);
      this.scene.add(this.railPath.group);
    }
    if (this.megaprojectManifest?.id === STAMP_MILL_ID) {
      this.megaprojectRailPath = new RailPathView(STAMP_MILL_RAIL_SPUR);
      this.megaprojectRailPath.group.visible = false;
      this.scene.add(this.megaprojectRailPath.group);
    }
    const contractGrid = this.activeContract.twist.powerGrid;
    if (isDevPowerGraphEnabled() || contractGrid) {
      this.powerGraph = new PowerGraphSystem(
        contractGrid ? contractPowerDefinition(this.activeContract.id, contractGrid) : isDevTramEnabled() ? devTramPowerGraphDefinition() : devPowerGraphDefinition(),
        contractGrid?.maxSpanLength,
      );
      this.powerWireView = new PowerWireView();
      this.powerWireView.update(this.powerGraph.snapshot());
      this.scene.add(this.powerWireView.group);
    const pylonMarkers = createPylonSiteMarkers(this.activeContract);
      if (pylonMarkers) this.scene.add(pylonMarkers);
      const ridgeGlow = createRidgeGlow(this.activeContract);
      if (ridgeGlow) this.scene.add(ridgeGlow);
      const tramConsumer = contractGrid?.nodes.find((node) => node.kind === 'consumer' && node.role === 'tram');
      if ((isDevTramEnabled() || tramConsumer) && rails[0]) {
        this.tram = new TramPath(rails[0].points, {
          speed: 6,
          loop: true,
          consumer: tramConsumer && tramConsumer.kind === 'consumer'
            ? { id: tramConsumer.id, labelKey: tramConsumer.label, kind: 'consumer', x: tramConsumer.x, z: tramConsumer.z, online: true, drawWatts: tramConsumer.drawWatts, priority: tramConsumer.priority }
            : DEV_TRAM_CONSUMER,
          cargo: [
            { id: 'capacitor-a', family: 'capacitor-crate', occupied: true },
            { id: 'capacitor-b', family: 'capacitor-crate', occupied: true },
          ],
        });
        this.scene.add(this.tram.group);
      }
    }
    if (isDevVehiclesEnabled()) {
      this.fuelSystem = new FuelSystem(isDevVehiclesEnabled);
      this.vehicle = new Vehicle(this.fuelSystem, { start: { x: -20, z: -8 } });
      this.scene.add(this.fuelSystem.group, this.vehicle.group);
    }
    this.detailScatter = new DetailScatter();
    this.scene.add(this.detailScatter.group);
    this.scene.add(this.harvestSystem.group);
    this.scene.add(this.buildSystem.group);
    this.scene.add(this.pressureSystem.group);
    this.createMegaprojectVisuals();
    this.scene.add(this.megaprojectGroup);
    this.createBaronStandardVisual();
    this.scene.add(this.baronStandardGroup);
    this.createBaronRocketCartVisual();
    this.scene.add(this.baronRocketCartGroup);
    this.scene.add(this.projectiles.group);
    this.scene.add(this.blastCharges.group);
    this.scene.add(this.blastAimReticle);
    this.scene.add(this.xpMotes.group);
    this.scene.add(this.goldPickups.group);
    this.scene.add(this.combatVfx.group);
    this.primaryActor.group.position.copy(this.heroStart);
    this.syncHeroVisualHeight();
    for (const actor of this.actors) actor.snapRenderState();
    this.updateActionActorPosition();
    this.prospector.reset(this.primaryActor.group.position);
    this.scene.add(this.prospector.group);
    this.scene.add(this.vfx.group);
    this.scene.add(this.enemies.group);
    this.scene.add(this.crawlerBoss.group);
    this.scene.add(this.mothSwarm.group);
    this.scene.add(this.primaryActor.group);
  }

  private dressScene(): void {
    this.syncNightShiftLighting();
    this.lightRig?.update(this.timeAlive);
  }

  private createMegaprojectVisuals(): void {
    this.megaprojectGroup.name = 'MegaprojectSite';
    this.megaprojectGroup.clear();
    this.megaprojectVisuals.length = 0;
    this.megaprojectSurveyVisuals.length = 0;
    this.megaprojectSignVisuals.length = 0;
    this.megaprojectConstructionDressing.length = 0;
    const manifest = this.megaprojectManifest;
    if (!manifest) return;

    const base = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectBaseMaterial);
    base.name = 'MegaprojectSiteBase';
    base.position.y = 0.025;
    base.scale.set(manifest.siteFootprint.w, 0.05, manifest.siteFootprint.d);
    this.megaprojectGroup.add(base);
    this.megaprojectVisuals.push(base);
    this.createStampMillSiteDressing(manifest);

    const total = Math.max(1, manifest.stages.length);
    const stampMillStages =
      manifest.id === STAMP_MILL_ID
        ? [
            {
              name: 'MegaprojectStage-1-RailScaffold',
              x: -manifest.siteFootprint.w * 0.28,
              y: 0.5,
              z: 0,
              sx: 0.34,
              sy: 0.78,
              sz: manifest.siteFootprint.d * 0.78,
            },
            {
              name: 'MegaprojectStage-2-BoilerHouse',
              x: 0,
              y: 0.42,
              z: -manifest.siteFootprint.d * 0.12,
              sx: manifest.siteFootprint.w * 0.42,
              sy: 0.66,
              sz: manifest.siteFootprint.d * 0.62,
            },
            {
              name: 'MegaprojectStage-3-StampMill',
              x: manifest.siteFootprint.w * 0.25,
              y: 0.76,
              z: manifest.siteFootprint.d * 0.1,
              sx: manifest.siteFootprint.w * 0.34,
              sy: 1.28,
              sz: manifest.siteFootprint.d * 0.56,
            },
          ]
        : null;
    for (let i = 0; i < total; i += 1) {
      const beam = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectGhostMaterial);
      const stampMillStage = stampMillStages?.[i];
      beam.name = stampMillStage?.name ?? `MegaprojectStage-${i + 1}`;
      const height = 0.55 + i * 0.22;
      beam.position.set(
        stampMillStage?.x ?? -manifest.siteFootprint.w * 0.5 + ((i + 1) / (total + 1)) * manifest.siteFootprint.w,
        stampMillStage?.y ?? 0.12 + height * 0.5,
        stampMillStage?.z ?? 0,
      );
      beam.scale.set(stampMillStage?.sx ?? 0.32, stampMillStage?.sy ?? height, stampMillStage?.sz ?? manifest.siteFootprint.d * 0.72);
      this.megaprojectGroup.add(beam);
      this.megaprojectVisuals.push(beam);
    }
    this.megaprojectGroup.visible = false;
  }

  private createBaronStandardVisual(): void {
    if (this.baronStandardGroup.children.length > 0) return;
    this.baronStandardGroup.name = 'BaronStandard';
    this.baronStandardGroup.visible = false;
    if (this.activeContractUsesBaronPresentation()) applyGeneratedMap(this.baronStandardClothMaterial, assetSlots.propBaronBanner);

    const pole = new THREE.Mesh(this.baronStandardPoleGeometry, this.baronStandardPoleMaterial);
    pole.name = 'BaronStandardPole';
    pole.position.y = 0.88;
    const cloth = new THREE.Mesh(this.baronStandardClothGeometry, this.baronStandardClothMaterial);
    cloth.name = 'BaronStandardCloth';
    cloth.position.set(0.42, 1.3, 0.035);
    cloth.rotation.y = -0.08;
    this.baronStandardGroup.add(pole, cloth);
  }

  private createBaronRocketCartVisual(): void {
    if (this.baronRocketCartGroup.children.length > 0) return;
    this.baronRocketCartGroup.name = 'BaronRocketCart';
    this.baronRocketCartGroup.visible = false;

    const railLeft = new THREE.Mesh(this.baronRocketCartRailGeometry, this.baronRocketCartBrassMaterial);
    railLeft.name = 'BaronRocketCartRailLeft';
    railLeft.position.set(0, 0.5, -0.18);
    const railRight = new THREE.Mesh(this.baronRocketCartRailGeometry, this.baronRocketCartBrassMaterial);
    railRight.name = 'BaronRocketCartRailRight';
    railRight.position.set(0, 0.5, 0.18);

    const rockets: THREE.Object3D[] = [];
    for (const x of [-0.24, 0, 0.24]) {
      const rocket = new THREE.Mesh(this.baronRocketCartRocketGeometry, this.baronRocketCartBrassMaterial);
      rocket.name = 'BaronRocketCartRocket';
      rocket.rotation.x = Math.PI / 2;
      rocket.position.set(x, 0.66, 0);
      const fuse = new THREE.Mesh(this.baronRocketCartFuseGeometry, this.baronRocketCartTealMaterial);
      fuse.name = 'BaronRocketCartFuse';
      fuse.position.set(x, 0.66, -0.4);
      rockets.push(rocket, fuse);
    }

    this.baronRocketCartGroup.add(railLeft, railRight, ...rockets);
    tagPlaceholder(this.baronRocketCartGroup, assetSlots.propRocketCart);
  }

  private createStampMillSiteDressing(manifest: MegaprojectManifest): void {
    if (manifest.id !== STAMP_MILL_ID) return;
    const { w, d } = manifest.siteFootprint;
    const halfX = w * 0.5;
    const halfZ = d * 0.5;

    for (const [x, z] of [
      [-halfX, -halfZ],
      [halfX, -halfZ],
      [halfX, halfZ],
      [-halfX, halfZ],
    ] as const) {
      const stake = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectStakeMaterial);
      stake.name = 'MegaprojectSurveyStake';
      stake.position.set(x, 0.42, z);
      stake.scale.set(0.1, 0.72, 0.1);
      this.megaprojectGroup.add(stake);
      this.megaprojectSurveyVisuals.push(stake);
    }

    for (const line of [
      { x: 0, z: -halfZ, sx: w, sz: 0.035 },
      { x: 0, z: halfZ, sx: w, sz: 0.035 },
      { x: -halfX, z: 0, sx: 0.035, sz: d },
      { x: halfX, z: 0, sx: 0.035, sz: d },
    ]) {
      const stringLine = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectStringMaterial);
      stringLine.name = 'MegaprojectSurveyStringLine';
      stringLine.position.set(line.x, 0.32, line.z);
      stringLine.scale.set(line.sx, 0.035, line.sz);
      this.megaprojectGroup.add(stringLine);
      this.megaprojectSurveyVisuals.push(stringLine);
    }

    for (let i = 0; i < 5; i += 1) {
      const plank = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectWalkwayMaterial);
      plank.name = 'MegaprojectWalkwayPlank';
      plank.position.set(-halfX + 0.55 + i * 0.92, 0.15, -halfZ - 0.44);
      plank.rotation.y = i % 2 === 0 ? 0.06 : -0.04;
      plank.scale.set(0.74, 0.08, 0.2);
      this.megaprojectGroup.add(plank);
      this.megaprojectSurveyVisuals.push(plank);
    }

    const signX = halfX - 0.8;
    const signZ = -halfZ - 0.66;
    for (const xOffset of [-0.48, 0.48]) {
      const post = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectStakeMaterial);
      post.name = 'MegaprojectSurveySignPost';
      post.position.set(signX + xOffset, 0.58, signZ);
      post.scale.set(0.08, 1.02, 0.08);
      this.megaprojectGroup.add(post);
      this.megaprojectSignVisuals.push(post);
    }

    const board = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectSignMaterial);
    board.name = 'MegaprojectSurveySignboard';
    board.position.set(signX, 0.9, signZ - 0.04);
    board.scale.set(1.36, 0.62, 0.08);
    board.renderOrder = 1;
    this.megaprojectGroup.add(board);
    this.megaprojectSignVisuals.push(board);

    const plaque = new THREE.Mesh(this.megaprojectPlaqueGeometry, this.megaprojectPlaqueMaterial);
    plaque.name = 'MegaprojectLedgerPlaque';
    plaque.position.set(signX, 0.9, signZ - 0.13);
    plaque.rotation.y = Math.PI;
    plaque.renderOrder = 2;
    this.megaprojectGroup.add(plaque);
    this.megaprojectSignVisuals.push(plaque);

    const reversePlaque = new THREE.Mesh(this.megaprojectPlaqueGeometry, this.megaprojectPlaqueMaterial);
    reversePlaque.name = 'MegaprojectLedgerPlaque';
    reversePlaque.position.set(signX, 0.9, signZ + 0.03);
    reversePlaque.renderOrder = 2;
    this.megaprojectGroup.add(reversePlaque);
    this.megaprojectSignVisuals.push(reversePlaque);

    for (const [x, z] of [
      [-halfX + 0.55, halfZ - 0.42],
      [halfX - 0.55, halfZ - 0.34],
      [0.15, -halfZ + 0.52],
    ] as const) {
      const crate = new THREE.Mesh(this.megaprojectGeometry, this.megaprojectCrateMaterial);
      crate.name = 'MegaprojectConstructionCrate';
      crate.position.set(x, 0.25, z);
      crate.scale.set(0.42, 0.42, 0.42);
      crate.visible = false;
      this.megaprojectGroup.add(crate);
      this.megaprojectConstructionDressing.push(crate);
    }

    for (const [x, z] of [
      [-halfX + 1.1, -halfZ + 0.42],
      [halfX - 0.42, 0.16],
    ] as const) {
      const barrel = new THREE.Mesh(this.megaprojectBarrelGeometry, this.megaprojectBarrelMaterial);
      barrel.name = 'MegaprojectConstructionBarrel';
      barrel.position.set(x, 0.25, z);
      barrel.visible = false;
      this.megaprojectGroup.add(barrel);
      this.megaprojectConstructionDressing.push(barrel);
    }
  }

  private placeContractFixtures(): void {
    for (const fixture of this.activeContract.tileParams.prePlacedBuildables ?? []) {
      this.buildSystem.placeFree(fixture.id, fixture, fixture.rotationSteps ?? 0, {
        wrecked: fixture.wrecked,
        repairCost: fixture.relightCost,
        preplaced: true,
      });
    }
  }

  private syncMegaprojectSite(): void {
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    const unlocked = this.megaprojectUnlocked();
    const visible = !!manifest && !!project && unlocked;
    const complete = !!manifest && !!project && megaprojectComplete(manifest, project);
    const footprint = manifest?.siteFootprint;

    this.megaprojectGroup.visible = visible;
    if (!manifest || !project || !footprint || !visible) {
      this.megaprojectTarget.active = false;
      this.megaprojectTarget.hp = 0;
      if (this.megaprojectRailPath) this.megaprojectRailPath.group.visible = false;
      this.buildSystem.setReservedFootprints([]);
      return;
    }

    const halfX = footprint.w * 0.5;
    const halfZ = footprint.d * 0.5;
    const y = Terrain.visualY(footprint.x, footprint.z, 0.08, Math.max(halfX, halfZ));
    const maxHp = stageMaxHp(manifest, project);
    const targetActive = project.funded && !complete;
    this.megaprojectGroup.position.set(footprint.x, y, footprint.z);
    this.megaprojectTarget.id = `megaproject:${manifest.id}`;
    this.megaprojectTarget.position.set(footprint.x, y, footprint.z);
    this.megaprojectTarget.halfX = halfX;
    this.megaprojectTarget.halfZ = halfZ;
    this.megaprojectTarget.active = targetActive;
    this.megaprojectTarget.hp = targetActive ? project.hp : 0;
    this.megaprojectTarget.maxHp = maxHp;
    this.megaprojectTarget.reachRadius = Math.max(halfX, halfZ);
    this.buildSystem.setReservedFootprints([this.megaprojectReservedFootprint(manifest)]);
    if (targetActive) this.goldTargeting.registerBuilding(this.megaprojectTarget);
    if (this.megaprojectRailPath) this.megaprojectRailPath.group.visible = project.stage > 0 || project.funded;
    this.syncMegaprojectVisuals(project);
  }

  private syncMegaprojectVisuals(project: MegaprojectProjectState): void {
    const preFundingSurvey = project.stage === 0 && !project.funded;
    const complete = this.megaprojectManifest ? megaprojectComplete(this.megaprojectManifest, project) : false;
    const visibleStages = Math.max(1, Math.min(this.megaprojectVisuals.length - 1, project.stage + (project.funded ? 1 : 0)));
    for (const visual of this.megaprojectSurveyVisuals) visual.visible = preFundingSurvey;
    for (const visual of this.megaprojectSignVisuals) visual.visible = true;
    for (const visual of this.megaprojectConstructionDressing) visual.visible = !preFundingSurvey && !complete;
    this.updateMegaprojectPlaque(project);
    for (let i = 1; i < this.megaprojectVisuals.length; i += 1) {
      const mesh = this.megaprojectVisuals[i];
      if (!mesh) continue;
      mesh.visible = i <= visibleStages;
      mesh.material = i <= project.stage ? this.megaprojectStageMaterial : this.megaprojectGhostMaterial;
    }
  }

  private updateMegaprojectPlaque(project: MegaprojectProjectState): void {
    const manifest = this.megaprojectManifest;
    if (!manifest || manifest.id !== STAMP_MILL_ID) return;
    const lines =
      project.stage === 0 && !project.funded
        ? ['STAMP MILL & RAIL SPUR', 'surveyed for the town', 'Claim Office takes pledges']
        : ['STAMP MILL & RAIL SPUR', `stage ${Math.min(project.stage + 1, manifest.stages.length)} of ${manifest.stages.length}`, this.megaprojectProgressLine()];
    this.megaprojectPlaqueText = lines.join(' / ');
    drawMegaprojectPlaque(this.megaprojectPlaqueTexture, lines);
  }

  private megaprojectReservedFootprint(manifest: MegaprojectManifest): ReservedFootprint {
    const { x, z, w, d } = manifest.siteFootprint;
    return { id: manifest.id, x, z, halfX: w * 0.5, halfZ: d * 0.5, active: true };
  }

  private megaprojectUnlocked(): boolean {
    return isMegaprojectUnlocked(this.megaprojectManifest, scienceMeter(this.researchState).steps);
  }

  private stampMillBuildStarted(): boolean {
    if (this.megaprojectManifest?.id !== STAMP_MILL_ID || !this.megaprojectProject) return false;
    return this.megaprojectProject.funded || this.megaprojectProject.stage > 0;
  }

  private fundMegaprojectStage(position?: THREE.Vector3): boolean {
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    if (!manifest || !project || !this.megaprojectUnlocked() || megaprojectComplete(manifest, project) || project.funded) return false;
    if (position && !this.megaprojectInRange(position)) return false;

    const cost = megaprojectStageCost(manifest, project);
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at: this.timeAlive,
      type: 'gold_spent',
      sink: `megaproject_${manifest.id}`,
      amount: cost,
    });
    if (!result.ok) {
      this.vfx.floatText(this.megaprojectTarget.position, 'Need gold!', '#a0522d');
      return false;
    }
    if (!fundMegaprojectStateStage(manifest, project)) return false;

    this.persistMegaprojectState();
    this.syncMegaprojectSite();
    this.audio.play('ledger-open', 0.75);
    this.uiBridge.announce(this.megaprojectProgressLine(), this.timeAlive, null, 4.8);
    if (cost > 0) this.vfx.floatText(this.megaprojectTarget.position, `-${cost}`, '#a0522d');
    this.publishDiagnostics();
    return true;
  }

  private advanceMegaprojectOnWave(atSim: number): void {
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    if (!manifest || !project || !this.megaprojectUnlocked()) return;
    const result = advanceMegaprojectStateBuild(manifest, project);
    if (result.type === 'idle') return;

    this.persistMegaprojectState();
    this.syncMegaprojectSite();
    if (result.type === 'delayed') {
      this.uiBridge.announce(`${manifest.name} crews patch the works.`, atSim, null, 3.8);
    } else if (result.type === 'waiting') {
      this.uiBridge.announce(`${manifest.name} crews hold the site.`, atSim, null, 3.8);
    } else if (result.type === 'stage_complete' && result.complete) {
      this.uiBridge.announce(this.megaprojectCompletionLine(), atSim, null, 5.2);
    } else {
      this.uiBridge.announce(this.megaprojectProgressLine(), atSim, null, 4.8);
    }
  }

  private resolveMegaprojectDamage(target: BuildingTarget, amount: number): {
    applied: boolean;
    family: string;
    index: number;
    hp: number;
    maxHp: number;
    wrecked: boolean;
  } {
    const escort = this.waveSystem.resolveEscortDamage(target, amount);
    if (escort) return escort;
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    if (target !== this.megaprojectTarget || !manifest || !project || !this.megaprojectUnlocked()) {
      return { applied: false, family: target.family, index: target.index, hp: target.hp, maxHp: target.maxHp, wrecked: false };
    }

    const result = damageMegaprojectStage(manifest, project, amount);
    if (!result.applied) return { applied: false, family: target.family, index: target.index, hp: result.hp, maxHp: result.maxHp, wrecked: false };
    this.persistMegaprojectState();
    this.syncMegaprojectSite();
    if (result.delayed) this.uiBridge.announce(`${manifest.name} loses a build wave.`, this.timeAlive, null, 3.8);
    return { applied: true, family: target.family, index: target.index, hp: project.hp, maxHp: result.maxHp, wrecked: false };
  }

  private damageMegaprojectForTest(amount: number): boolean {
    if (!this.megaprojectTarget.active) return false;
    this.combat.setTime(this.timeAlive);
    this.combat.damageBuilding(this.megaprojectTarget, amount, -1);
    this.publishDiagnostics();
    return true;
  }

  private persistMegaprojectState(): void {
    this.megaprojectState = saveMegaprojectState(this.megaprojectStorage, this.megaprojectState);
    this.megaprojectProject = this.megaprojectManifest
      ? ensureMegaprojectProject(this.megaprojectState, this.megaprojectManifest)
      : null;
  }

  private megaprojectInRange(position: THREE.Vector3, radius = 2.2): boolean {
    const target = this.megaprojectTarget;
    const dx = Math.max(Math.abs(position.x - target.position.x) - target.halfX, 0);
    const dz = Math.max(Math.abs(position.z - target.position.z) - target.halfZ, 0);
    return dx * dx + dz * dz <= radius * radius;
  }

  private megaprojectFundCandidate(position: THREE.Vector3): MegaprojectFundCandidate | null {
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    if (!manifest || !project || !this.megaprojectUnlocked() || megaprojectComplete(manifest, project) || project.funded) return null;
    if (!this.megaprojectInRange(position, 2.8)) return null;
    return {
      title: manifest.id === STAMP_MILL_ID ? 'STAMP MILL & RAIL SPUR' : manifest.name,
      stage: project.stage + 1,
      cost: megaprojectStageCost(manifest, project),
      line:
        manifest.id === STAMP_MILL_ID && project.stage === 0
          ? 'Surveyed for the town. The Claim Office takes pledges.'
          : this.megaprojectProgressLine(),
    };
  }

  private maybeEmitStampSiteBeat(fund: MegaprojectFundCandidate | null): void {
    if (!fund || this.stampSiteBeatEmitted || this.megaprojectManifest?.id !== STAMP_MILL_ID) return;
    this.stampSiteBeatEmitted = true;
    emitStorySignal({ type: 'stamp-site-found' });
  }

  private megaprojectProgressLine(): string {
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    if (!manifest || !project) return '';
    if (megaprojectComplete(manifest, project)) return this.megaprojectCompletionLine();
    if (manifest.id === STAMP_MILL_ID) return STAMP_MILL_PROGRESS_LINES[project.stage] ?? STAMP_MILL_PROGRESS_LINES[0]!;
    return `${manifest.name} rises: stage ${project.stage + 1} of ${manifest.stages.length}`;
  }

  private megaprojectCompletionLine(): string {
    return this.megaprojectManifest?.id === STAMP_MILL_ID
      ? STAMP_MILL_COMPLETE_LINE
      : `${this.megaprojectManifest?.name ?? 'Megaproject'} stands complete.`;
  }

  private megaprojectDiagnostics(): MegaprojectDiagnostics {
    const diagnostics = megaprojectDiagnostics(this.megaprojectManifest, this.megaprojectProject, this.megaprojectUnlocked());
    return { ...diagnostics, siteRead: this.megaprojectSiteReadDiagnostics(diagnostics.active) };
  }

  private megaprojectSiteReadDiagnostics(active: boolean): MegaprojectSiteReadDiagnostics | null {
    if (this.megaprojectManifest?.id !== STAMP_MILL_ID) return null;
    return {
      packedEarth: active && this.megaprojectGroup.visible,
      stakes: this.visibleMegaprojectObjects('MegaprojectSurveyStake'),
      stringLines: this.visibleMegaprojectObjects('MegaprojectSurveyStringLine'),
      walkwayPlanks: this.visibleMegaprojectObjects('MegaprojectWalkwayPlank'),
      signboard: active && this.megaprojectSignVisuals.some((visual) => visual.visible && visual.name === 'MegaprojectSurveySignboard'),
      plaque: this.megaprojectPlaqueText,
      constructionProps: this.megaprojectConstructionDressing.filter((visual) => visual.visible).length,
      promptReady: this.megaprojectFundCandidate(this.localActor.group.position) !== null,
      surveyVisible: active && this.megaprojectGroup.visible && this.megaprojectSurveyVisuals.some((visual) => visual.visible),
    };
  }

  private visibleMegaprojectObjects(name: string): number {
    if (!this.megaprojectGroup.visible) return 0;
    return this.megaprojectGroup.children.filter((child) => child.visible && child.name === name).length;
  }

  private railDiagnostics() {
    if (this.megaprojectRailPath?.group.visible) return this.megaprojectRailPath.diagnostics();
    return this.railPath?.diagnostics() ?? emptyRailPathDiagnostics();
  }

  private publishDiagnostics(): void {
    const info = this.renderer.info;
    const assets = generatedAssetStatuses();
    if (!this.activeContractUsesBaronPresentation()) {
      delete assets[assetSlots.charBaron];
      delete assets[assetSlots.propBaronBanner];
    }
    const localActor = this.localActor;
    const heroPos = {
      x: localActor.group.position.x,
      y: localActor.group.position.y,
      z: localActor.group.position.z,
    };
    const speed = localActor.velocity.length();
    const economyLog = this.economy.log;
    const economyReplay = economyLog.reduce(reduceEconomy, initialEconomyState);
    const economySummary = summarizeLog(economyLog);
    const buildDiagnostics = this.buildSystem.diagnostics;
    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      timeAlive: this.timeAlive,
      simulation: {
        tick: this.simTick,
        ...this.loop.diagnostics,
      },
      runState: this.state.current,
      paused: this.state.isPaused,
      state: this.state.isPaused ? 'paused' : this.state.current,
      mp: this.mpClient?.state() ?? null,
      difficultyPreset: this.difficultyPreset,
      renderLayers: RenderLayers,
      renderLayerOf,
      ui: this.uiSnapshot,
      hp: localActor.hp,
      maxHp: localActor.maxHp,
      heroIframes: localActor.hasIframes,
      enemiesAlive: this.enemies.activeCount,
      enemyPoolSize: this.enemies.capacity,
      boltsAlive: this.combat.boltsAlive,
      arsenal: this.arsenalDiagnostics(),
      xp: this.combat.xpCount,
      xpMotesAlive: this.xpMotes.activeCount,
      xpAudit: this.combat.xpAudit,
      kills: this.kills,
      goldPanned: economySummary.panned,
      deathLedger: this.deathLedger,
      wave: this.waveSystem.diagnostics.wave,
      nextWaveInSim: this.waveSystem.diagnostics.nextWaveInSim,
      trickleInterval: this.waveSystem.diagnostics.trickleInterval,
      waveSpawnedTotal: this.waveSystem.diagnostics.waveSpawnedTotal,
      waveState: this.waveSystem.diagnostics.waveState,
      pulse: this.waveSystem.diagnostics.pulse,
      edge: this.waveSystem.diagnostics.edge,
      budget: this.waveSystem.diagnostics.budget,
      lastPulseAt: this.waveSystem.diagnostics.lastPulseAt,
      spawnDisabled: isSpawnDisabled(),
      stressCount: getStressCount(),
      score: 0,
      targetScore: 0,
      complete: false,
      heroPos,
      heroRenderPos: {
        x: localActor.renderPosition.x,
        y: localActor.renderPosition.y,
        z: localActor.renderPosition.z,
      },
      speed,
      player: {
        position: heroPos,
        speed,
      },
      actors: this.actors.map((actor, slot) => {
        const meta = this.mpActorMeta.get(actor);
        return {
          slot,
          playerId: meta?.playerId ?? (slot === 0 ? 'local' : `actor-${slot}`),
          name: meta?.name ?? (slot === 0 ? 'Rider' : `Rider ${slot + 1}`),
          town: meta?.town ?? null,
          local: meta?.local ?? actor === localActor,
          hp: actor.hp,
          maxHp: actor.maxHp,
          position: {
            x: actor.group.position.x,
            y: actor.group.position.y,
            z: actor.group.position.z,
          },
          speed: actor.velocity.length(),
          visible: actor.group.visible,
        };
      }),
      economy: {
        gold: this.economy.gold,
        banked: this.economy.gold,
        bankCap: this.economy.bankCap,
        resources: this.economy.resources,
        activeResources: this.activeResourceSnapshots(),
        logLength: economyLog.length,
        state: this.economy.state,
        replay: economyReplay,
        summary: economySummary,
      },
      pressure: this.pressureSystem.diagnostics,
      pressureArsenal: this.pressureArsenalSystem.diagnostics,
      run: this.runManager?.diagnostics ?? {
        secured: false,
        rush: false,
        lastRunEndedReason: null,
        meta: null,
        victoryPayout: null,
        suspend: {
          hasSuspend: false,
          restored: false,
          restoredWave: null,
          lastWriteAt: null,
          lastWriteMs: null,
          sizeBytes: 0,
        },
      },
      contract: {
        ...activeContractDiagnostics(),
        epochId: this.activeEpoch.id,
        epochResources: this.activeEpoch.resources,
        claimOffice: this.activeEpoch.claimOffice,
        name: this.activeContract.name,
        tileParams: this.activeContract.tileParams,
        boardRow: this.activeContract.boardRow,
        briefing: this.activeContract.briefing,
        seamYieldMult: this.contractSeamYieldMult(),
        secureWave: this.secureWaveForRun(),
        waveCadenceMult: this.activeContract.twist.waveCadenceMult ?? 1,
        lightRamp: this.activeContract.twist.lightRamp ?? null,
        dayNightCycle: this.activeContract.twist.dayNightCycle ?? null,
        baron: this.activeContract.twist.baron ?? null,
        medals: loadMedals(),
      },
      research: this.researchDiagnostics(),
      megaproject: this.megaprojectDiagnostics(),
      escort: this.waveSystem.escortDiagnostics,
      tram: this.tram?.diagnostics ?? null,
      fuel: this.fuelSystem?.diagnostics ?? null,
      vehicle: this.vehicle?.diagnostics ?? null,
      power: this.powerGraph?.diagnostics(this.powerWireView?.diagnostics()) ?? emptyPowerGraphDiagnostics(),
      canyonWorks: this.canyonConnectDiagnostics(),
      crawlerBoss: this.activeContract.twist.baron?.variantId === 'dynamo_crawler' ? this.crawlerBoss.diagnostics() : null,
      agent: {
        stub: this.agentStub?.state ?? null,
        embodiment: this.prospector.snapshot,
      },
      audio: this.audio.diagnostics(),
      build: {
        ...buildDiagnostics,
        killsByOwner: this.combat.killsByOwner,
        damageByOwner: this.combat.damageByOwner,
      },
      progression: this.progression.snapshot,
      harvest: this.harvestSnapshot,
      steal: this.stealDiagnostics(),
      wreck: this.wreckDiagnostics(),
      charmPause: this.charmPauseActive,
      camImpulseActive: this.cameraRig.impulseActive,
      baronSpawnImpulses: this.baronSpawnImpulses,
      baronCeremony: this.baronCeremony
        ? {
            active: true,
            elapsed: this.fixedTickElapsed - this.baronCeremony.startedTickElapsed,
            holdSeconds: BARON_KILL_STOP_SECONDS,
          }
        : { active: false, elapsed: 0, holdSeconds: BARON_KILL_STOP_SECONDS },
      baronStandard: {
        visible: this.baronStandardGroup.visible,
        x: this.baronStandardPosition.x,
        z: this.baronStandardPosition.z,
        dropElapsed: this.baronStandardPlanted ? this.elapsed - this.baronStandardDropStartedAt : 0,
      },
      baronRocket: this.baronRocketDiagnostics(),
      damSurge: this.damSurge?.diagnostics() ?? null,
      lighting: this.lightRig
        ? { ...this.lightRig.diagnostics(), dayNight: this.dayNightSnapshot, coverage: this.lightField.diagnostics() }
        : undefined,
      mothSwarm: this.mothSwarm.diagnostics(),
      enemyDimming: this.enemies.dimmingDiagnostics,
      vfx: {
        activeFloatTexts: this.vfx.activeFloatTexts,
        floatTextPool: this.vfx.capacity,
        combat: this.combatVfx.diagnostics(),
      },
      performance: performanceTierDiagnostics(),
      readability: {
        enemyHitFlashes: this.enemies.hitFlashCount,
        activeEnemyFlashes: this.enemies.activeFlashCount,
        buildingHpBars: buildDiagnostics.hpBars,
        bossHpBar: this.enemies.bossHpBarDiagnostics,
        turretPulses: buildDiagnostics.turretPulses,
        activeTurretPulses: buildDiagnostics.activeTurretPulses,
      },
      renderer: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
      assets,
      assetSprites: generatedAssetRenderCounts(),
      spriteAnimations: spriteAnimationDiagnostics(),
      spriteStats: spriteStatsDiagnostics(this.fadeOverlaysActive()),
      terrain: {
        playerZone: Terrain.sample(localActor.group.position.x, localActor.group.position.z).zone,
        ground: this.terrainView?.groundDiagnostics(),
        sim: simHeightDiagnostics(),
        water: this.terrainView?.diagnostics(),
        rails: this.railDiagnostics(),
        vista: Terrain.vistaDiagnostics(),
        detailScatter: this.detailScatter?.diagnostics(),
        height: {
          ...Terrain.heightDiagnostics(),
          heroGround: Terrain.sampleHeight(localActor.group.position.x, localActor.group.position.z),
          heroVisualY: localActor.group.position.y,
        },
        probes: {
          bank: Terrain.sample(-12, -12),
          shallows: Terrain.sample(-12, -5.5),
          river: Terrain.sample(-12, 0),
          ford: Terrain.sample(0, 0),
          northBank: Terrain.sample(12, 12),
          out: Terrain.sample(40, 0),
        },
      },
      canvas: {
        clientWidth: this.canvas.clientWidth,
        clientHeight: this.canvas.clientHeight,
        width: this.canvas.width,
        height: this.canvas.height,
        dpr: Math.min(window.devicePixelRatio || 1, this.tuning.maxDpr),
      },
      frameMs: {
        last: this.frameMsLast,
        avg: this.frameMsAvg,
        p95: this.frameMsP95,
        sampleCount: this.frameMsSamples.length,
      },
    };
  }

  private recordFrameMs(frameMs: number): void {
    this.frameMsLast = frameMs;
    if (this.frameMsSamples.length < 180) {
      this.frameMsSamples.push(frameMs);
    } else {
      this.frameMsSamples[this.frameMsCursor] = frameMs;
      this.frameMsCursor = (this.frameMsCursor + 1) % this.frameMsSamples.length;
    }

    let total = 0;
    for (const sample of this.frameMsSamples) total += sample;
    this.frameMsAvg = total / this.frameMsSamples.length;

    const sorted = [...this.frameMsSamples].sort((a, b) => a - b);
    const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    this.frameMsP95 = sorted[p95Index] ?? 0;
  }

  secureWaveForRun(): number {
    return Math.max(0, Math.floor(this.activeContract.twist.secureWave ?? Balance.run.secureWave));
  }

  autoSecureWaveForRun(): number {
    return this.waitsForBaronDefeat() || (this.activeContract.twist.powerGrid?.connect && !this.canyonConnectCompletedByDeadline)
      ? Number.MAX_SAFE_INTEGER
      : this.secureWaveForRun();
  }

  private runWasSecured(wavesSurvived: number): boolean {
    return this.runManager?.diagnostics.secured === true || wavesSurvived >= this.autoSecureWaveForRun();
  }

  securePayoutMultForRun(): Partial<Record<MetaTrack, number>> | undefined {
    const baron = this.activeContract.twist.baron;
    if (!baron || !this.baronBeatenThisRun) return undefined;
    return { science: Math.max(1, baron.sciencePayoutMult) };
  }

  secureBarkForRun(): string | undefined {
    const baron = this.activeContract.twist.baron;
    return baron && this.baronBeatenThisRun ? `${bossDefeatLine(baron)} ${baron.defeatBeat}` : undefined;
  }

  secureLedgerLineForRun(): string | undefined {
    const baron = this.activeContract.twist.baron;
    return baron && this.baronBeatenThisRun ? `${bossLedgerLabel(baron)} — DEFEATED, wave ${baron.wave}` : undefined;
  }

  secureCalloutForRun(): string | undefined {
    const baron = this.activeContract.twist.baron;
    return baron && this.baronBeatenThisRun ? bossSecureCallout(baron) : undefined;
  }

  private waitsForBaronDefeat(): boolean {
    const baron = this.activeContract.twist.baron;
    if (!baron || this.baronBeatenThisRun) return false;
    return baron.variantId !== 'dynamo_crawler' || this.waveSystem.diagnostics.wave >= baron.wave;
  }

  private announceBaronBeat(wave: number, atSim: number): void {
    const baron = this.activeContract.twist.baron;
    if (!baron) return;
    if (wave === baron.wave) {
      emitStorySignal({ type: 'boss-arrival', contractId: this.activeContract.id, contractName: this.activeContract.name });
      this.queueBaronBanner(baron.taunt, atSim, bossArrivalTitle(baron));
      return;
    }
    if (!baron.tauntWaves.includes(wave)) return;
    this.queueBaronBanner(baron.taunt, atSim, bossTauntTitle(baron));
  }

  private announceWaveBanner(text: string, atSim: number): void {
    if (this.pendingBaronBanner?.title === bossArrivalTitle(this.activeContract.twist.baron) || this.baronArrivalBannerVisible()) return;
    this.uiBridge.announce(text, atSim);
  }

  private queueBaronBanner(text: string, atSim: number, title: string): void {
    window.clearTimeout(this.baronAnnouncementTimer);
    const banner = { text, atSim, title };
    const show = () => {
      this.showBaronBanner(banner);
    };
    if (this.waveAnnouncementVisible()) {
      this.pendingBaronBanner = banner;
      this.baronAnnouncementTimer = window.setTimeout(show, this.waveAnnouncementDelayMs());
      return;
    }
    show();
  }

  private showBaronBanner(banner: { text: string; atSim: number; title: string }): void {
    this.baronAnnouncementTimer = 0;
    if (this.pendingBaronBanner === banner) this.pendingBaronBanner = null;
    this.uiBridge.announce(banner.text, banner.atSim, null, 3.8, 'baron', banner.title);
    this.syncUi();
    this.publishDiagnostics();
  }

  private waveAnnouncementVisible(): boolean {
    const root = globalThis.document?.querySelector<HTMLElement>('#hud');
    return root?.classList.contains('hud--announcement-visible') === true && root.dataset.announcementKind === 'wave';
  }

  private baronArrivalBannerVisible(): boolean {
    const root = globalThis.document?.querySelector<HTMLElement>('#hud');
    return (
      root?.classList.contains('hud--announcement-visible') === true &&
      root.dataset.announcementKind === 'baron' &&
      this.uiSnapshot?.announcementTitle === bossArrivalTitle(this.activeContract.twist.baron)
    );
  }

  private waveAnnouncementDelayMs(): number {
    const snapshot = this.uiSnapshot;
    const remainingSim =
      snapshot?.announcementKind === 'wave'
        ? Math.max(0, snapshot.announcementAt + snapshot.announcementDurationSeconds - this.timeAlive)
        : 0;
    const timeScale = Math.max(0.001, this.simTimeScale);
    return Math.round((remainingSim / timeScale + 2) * 1000);
  }

  private startWaveForTest(wave: number): void {
    const safeWave = Math.max(0, Math.floor(wave));
    this.waveSystem.setWaveForTest(safeWave);
    this.events.emit({ type: 'wave_started', at: this.timeAlive, wave: safeWave });
    this.spawnMothSeasonWave(safeWave);
    this.publishDiagnostics();
  }

  private spawnMothSeasonWave(wave: number): void {
    const config = this.activeContract.twist.mothSeason;
    if (!config || wave <= 0 || this.nightShiftLightingState().darkness < 0.5) return;
    const count = Math.max(2, Math.floor(Math.max(1, this.mothLightSources.length) * config.mothsPerLightPerWave));
    this.mothSwarm.spawn(this.enemies, count, this.heroStart.x, this.heroStart.z - 12);
  }

  private mothSeasonSpeedMultiplier(enemy: ClaimJumperEnemy): number {
    const config = this.activeContract.twist.mothSeason;
    if (!config || enemy.variantId === 'moth_swarm') return 1;
    return this.lightField.coverageAt(enemy.position.x, enemy.position.z) < config.litThreshold ? config.nightSpeedOutsideLight : 1;
  }

  private onBaronDefeated(atSim: number, enemyId: number): void {
    if (this.baronBeatenThisRun || this.baronCeremony || this.state.current !== 'playing') return;
    const baron = this.activeContract.twist.baron;
    if (!baron) return;
    const enemy = this.enemies.all.find((entry) => entry.id === enemyId);
    const position = enemy?.position.clone() ?? this.primaryActor.group.position.clone();
    const pendingArrivalBanner = this.pendingBaronBanner?.title === bossArrivalTitle(baron) ? this.pendingBaronBanner : null;
    window.clearTimeout(this.baronAnnouncementTimer);
    this.baronAnnouncementTimer = 0;
    this.charmPauseActive = false;
    this.charmPauseRemaining = 0;
    this.charmPauseCooldown = 0;
    if (baron.variantId === 'dynamo_crawler') this.baronStandardPosition.copy(position);
    else this.plantBaronStandard(position);
    const burstScale = Math.max(3, enemy?.visualScale ?? 3);
    this.combatVfx.dustPuff(position, burstScale);
    this.combatVfx.detonationRing(position, Math.min(7, burstScale * 1.45));
    this.audio.play('victory-sting');
    if (pendingArrivalBanner) {
      this.showBaronBanner(pendingArrivalBanner);
    } else {
      this.pendingBaronBanner = null;
      this.uiBridge.announce(baron.defeatBeat, atSim, null, BARON_DEFEAT_CARD_SECONDS, 'baron-defeat', bossDefeatTitle(baron));
    }
    if (isPauseDisabled()) {
      this.completeBaronDefeat(atSim);
      return;
    }

    this.playerPauseActive = false;
    this.baronCeremony = { atSim, startedTickElapsed: this.fixedTickElapsed };
    this.state.setPaused(true);
    this.syncUi();
    this.publishDiagnostics();
  }

  private finishBaronCeremony(): void {
    const ceremony = this.baronCeremony;
    if (!ceremony) return;
    this.baronCeremony = null;
    this.state.setPaused(false);
    this.completeBaronDefeat(ceremony.atSim);
  }

  private completeBaronDefeat(atSim: number): void {
    if (this.baronBeatenThisRun || this.state.current !== 'playing') return;
    const baron = this.activeContract.twist.baron;
    if (!baron) return;
    this.baronBeatenThisRun = true;
    const alreadySecured = this.runManager?.diagnostics.secured === true;
    const objectiveAllowsSecure = !this.activeContract.twist.powerGrid || this.canyonConnectCompletedByDeadline;
    const secured = alreadySecured
      || (objectiveAllowsSecure && this.runManager?.secureCurrentRun(this.waveSystem.diagnostics.wave) === true);
    if (!secured) {
      this.baronBeatenThisRun = false;
      return;
    }
    window.clearTimeout(this.baronAnnouncementTimer);
    this.pendingBaronBanner = null;
    this.baronAnnouncementTimer = 0;
    if (baron.awardMedal !== false) awardBaronMedal();
    emitStorySignal({ type: 'boss-defeat', contractId: this.activeContract.id, contractName: this.activeContract.name });
    this.researchState = saveResearchState(
      this.researchStorage,
      loadResearchState(this.researchStorage, this.researchStorage, this.researchUnlockFlags()),
    );
    this.publishDiagnostics();
    this.uiBridge.announce(baron.defeatBeat, atSim, null, BARON_DEFEAT_CARD_SECONDS, 'baron-defeat', bossDefeatTitle(baron));
  }

  private readonly skipBaronCeremony = (event: Event): void => {
    if (!this.baronCeremony || (event instanceof KeyboardEvent && event.repeat)) return;
    if (this.mpClient) {
      this.mpQueuedActions.push({ type: 'skip_ceremony' });
      return;
    }
    this.finishBaronCeremony();
  };

  private plantBaronStandard(position: THREE.Vector3): void {
    this.baronStandardPosition.set(position.x, 0, position.z);
    this.baronStandardPlanted = true;
    this.baronStandardDropStartedAt = this.elapsed;
    this.baronStandardGroup.visible = true;
    this.syncBaronStandardDrop();
  }

  private syncBaronStandardDrop(): void {
    if (!this.baronStandardPlanted) return;
    const t = THREE.MathUtils.clamp((this.elapsed - this.baronStandardDropStartedAt) / 0.72, 0, 1);
    const eased = easeOutCubic(t);
    const y = Terrain.visualY(this.baronStandardPosition.x, this.baronStandardPosition.z, 0.04);
    this.baronStandardGroup.position.set(this.baronStandardPosition.x, y + (1 - eased) * 0.78, this.baronStandardPosition.z);
    this.baronStandardGroup.rotation.set(0, -0.28, -0.96 + eased * 0.78);
  }

  private updateBaronRocketVolley(): void {
    const config = this.baronRocketConfig();
    const baron = config ? this.activeBaronEnemy() : null;
    if (!config || !baron || this.baronBeatenThisRun || this.baronCeremony || this.state.current !== 'playing') {
      this.clearBaronRocketTelegraph();
      this.baronRocketSuppressed = false;
      return;
    }

    const suppressed = this.baronRocketMeleeSuppressed(baron);
    this.baronRocketSuppressed = suppressed;
    if (suppressed) {
      this.clearBaronRocketTelegraph();
      return;
    }

    if (this.baronRocketTelegraphStartedAt >= 0) {
      const telegraphSeconds = Math.max(0.1, config.telegraphSeconds);
      if (this.timeAlive - this.baronRocketTelegraphStartedAt < telegraphSeconds) return;
      this.launchBaronRocketVolley(baron, config);
      this.clearBaronRocketTelegraph();
      this.baronRocketNextAt = this.timeAlive + Math.max(0.2, config.cadenceSeconds);
      return;
    }

    if (this.timeAlive < this.baronRocketNextAt) return;
    if (!this.acquireBaronRocketTarget(baron)) {
      this.baronRocketNextAt = this.timeAlive + 0.25;
      return;
    }

    this.baronRocketTelegraphStartedAt = this.timeAlive;
    this.audio.play('blast-charge-arm');
    baron.setAnimationClip('grab');
  }

  private baronRocketConfig(): BaronRocketVolleyConfig | null {
    return this.activeContract.twist.baron?.rocketVolley ?? null;
  }

  private activeBaronEnemy(): ClaimJumperEnemy | null {
    return this.enemies.all.find((enemy) => enemy.isAlive && enemy.eliteKind === 'baron') ?? null;
  }

  private clearBaronRocketTelegraph(): void {
    this.baronRocketTelegraphStartedAt = -1;
    this.baronRocketTargetKind = null;
  }

  private baronRocketMeleeSuppressed(baron: ClaimJumperEnemy): boolean {
    const heroRadius = baron.hitRadius + Balance.hero.radius + 0.35;
    const hero = this.nearestActorTo(baron.position).group.position;
    if (distanceSq2(baron.position.x, baron.position.z, hero.x, hero.z) <= heroRadius * heroRadius) {
      return true;
    }

    const building = this.goldTargeting.nearestBuilding(baron.position);
    if (!building) return false;
    const reach = Balance.wreck.reach * Math.max(1, baron.visualScale) + 0.35;
    return distanceSqToBuildingPoint(baron.position, building) <= reach * reach;
  }

  private acquireBaronRocketTarget(baron: ClaimJumperEnemy): boolean {
    const building = this.goldTargeting.nearestBuilding(baron.position);
    const hero = this.nearestActorTo(baron.position).group.position;
    const heroRange = Math.max(16, baron.heroPursuitRange || 45);
    const heroInRange = distanceSq2(baron.position.x, baron.position.z, hero.x, hero.z) <= heroRange * heroRange;
    if (heroInRange || !building) {
      this.baronRocketTarget.copy(hero);
      this.baronRocketTargetKind = 'hero';
      return true;
    }

    this.baronRocketTarget.copy(building.position);
    this.baronRocketTargetKind = 'building';
    return true;
  }

  private launchBaronRocketVolley(baron: ClaimJumperEnemy, config: BaronRocketVolleyConfig): void {
    const count = THREE.MathUtils.clamp(Math.floor(config.count), 1, 6);
    const radius = Math.max(0.2, config.radius);
    const spreadRadius = Math.max(0, config.spreadRadius);
    const ownerId = `${BARON_ROCKET_OWNER_PREFIX}:${baron.id}`;
    const seed = getDebugSeed() ?? 'gold-rush';
    const origin = baron.position;
    const target = new THREE.Vector3();
    this.baronRocketLastOwnerId = ownerId;
    this.baronRocketLastTarget.copy(this.baronRocketTarget);

    for (let index = 0; index < count; index += 1) {
      const rng = createRng(`${seed}:baron-rocket:${this.baronRocketVolleys}:${index}`);
      const angle = (Math.PI * 2 * index) / count + rng.range(-0.24, 0.24);
      const spread = index === 0 ? 0 : spreadRadius * rng.range(0.55, 1);
      target.set(
        this.baronRocketTarget.x + Math.cos(angle) * spread,
        this.baronRocketTarget.y,
        this.baronRocketTarget.z + Math.sin(angle) * spread,
      );
      this.combat.launchLob(origin, target, Math.max(0.1, config.airTime), Math.max(0, config.damage), radius, ownerId);
    }
    this.baronRocketVolleys += 1;
  }

  private syncBaronRocketCart(): void {
    const baron = this.activeBaronEnemy();
    if (!baron) {
      this.baronRocketCartGroup.visible = false;
      return;
    }

    const scale = Math.max(1, baron.visualScale * 0.5);
    const position = this.enemies.renderPositionOf(baron);
    const yaw = this.enemies.renderRotationOf(baron);
    const distance = baron.visualScale * 0.12;
    const x = position.x - Math.sin(yaw) * distance;
    const z = position.z + Math.cos(yaw) * distance;
    const active = this.baronRocketTelegraphStartedAt >= 0;
    const pulse = active ? 0.5 + Math.sin(this.elapsed * 18) * 0.5 : 0;
    this.baronRocketCartTealMaterial.emissiveIntensity = active ? 0.55 + pulse * 0.55 : 0.3;
    this.baronRocketCartGroup.visible = true;
    this.baronRocketCartGroup.position.set(x, position.y + baron.visualScale * 0.42, z);
    this.baronRocketCartGroup.rotation.set(active ? -0.08 - pulse * 0.05 : 0, yaw, active ? 0.08 : 0);
    this.baronRocketCartGroup.scale.setScalar(scale);
  }

  private baronRocketDiagnostics() {
    const manifest = this.baronRocketConfig();
    const baron = this.activeBaronEnemy();
    const baronPosition = baron ? this.enemies.renderPositionOf(baron) : null;
    return {
      cartVisible: this.baronRocketCartGroup.visible,
      carried: baron !== null,
      distanceFromBaron: baronPosition ? this.baronRocketCartGroup.position.distanceTo(baronPosition) : 0,
      telegraphActive: this.baronRocketTelegraphStartedAt >= 0,
      telegraphElapsed: this.baronRocketTelegraphStartedAt >= 0 ? this.timeAlive - this.baronRocketTelegraphStartedAt : 0,
      nextVolleyIn: Math.max(0, this.baronRocketNextAt - this.timeAlive),
      volleys: this.baronRocketVolleys,
      suppressed: this.baronRocketSuppressed,
      targetKind: this.baronRocketTargetKind,
      lastOwnerId: this.baronRocketLastOwnerId,
      lastTarget: {
        x: this.baronRocketLastTarget.x,
        z: this.baronRocketLastTarget.z,
      },
      target: {
        x: this.baronRocketTarget.x,
        z: this.baronRocketTarget.z,
      },
      manifest: manifest ? { ...manifest } : null,
    };
  }

  private syncNightShiftLighting(): void {
    const state = this.nightShiftLightingState();
    if (this.crawlerBoss.overchargeActive) {
      state.phase = 'full';
      state.darkness = 0;
      delete state.palette;
    }
    state.lampIntensityMult = this.crawlerBoss.lampIntensityMult;
    if (!state.enabled || state.darkness <= 0) {
      this.lightRig?.setNightShift(state);
      this.lightField.update(state.darkness, []);
      this.mothLightSources = [];
      this.buildSystem.setNightLighting(0, []);
      this.enemies.setLightDimming({
        enabled: false,
        darkness: 0,
        minLight: 1,
        falloff: Balance.contracts.nightShift.lightFalloff,
        sources: [],
      });
      return;
    }

    const diagnostics = this.buildSystem.diagnostics;
    const sources: EnemyLightSource[] = this.actors
      .filter((actor) => actor.group.visible)
      .map((actor) => ({
        x: actor.group.position.x,
        z: actor.group.position.z,
        radius: Balance.contracts.nightShift.heroLightRadius,
        kind: 'light' as const,
      }));
    const liveLightPositions = (id: BuildableId): Array<{ index: number; x: number; z: number }> =>
      diagnostics.hp
        .filter((entry) => entry.id === id && entry.hp > 0 && !entry.wrecked)
        .map((entry) => ({ index: entry.index, ...entry.position }));
    const lanternPositions = liveLightPositions('lantern_post').filter((position) => this.powerConsumerAt(position.x, position.z, 'lamp'));
    const decoyPositions = liveLightPositions('decoy_shed');
    const fieldSources: LightSource[] = lanternPositions.map((position) => ({
      id: `lantern:${position.index}`,
      kind: 'lantern',
      x: position.x,
      z: position.z,
      radius: Balance.contracts.nightShift.lanternPostLightRadius,
    }));
    fieldSources.push(...decoyPositions.map((position) => ({
      id: `decoy:${position.index}`,
      kind: 'powered-lamp' as const,
      x: position.x,
      z: position.z,
      radius: Balance.decoyShed.lightRadius,
      targetWeight: this.activeContract.twist.mothSeason?.decoyWeight ?? 1,
    })));
    this.mothLightSources = fieldSources;
    this.lightField.update(this.dayNightCycle ? state.darkness : 0, this.dayNightCycle ? this.mothSwarm.dimSources(fieldSources) : []);

    for (const position of liveLightPositions('sentry_beacon')) {
      sources.push({ x: position.x, z: position.z, radius: Balance.beacon.range * Balance.contracts.nightShift.beaconLightMult, kind: 'watch' });
    }
    for (const position of liveLightPositions('turret')) {
      sources.push({ x: position.x, z: position.z, radius: Balance.contracts.nightShift.turretLightRadius, kind: 'watch' });
    }
    for (const position of lanternPositions) {
      sources.push({ x: position.x, z: position.z, radius: Balance.contracts.nightShift.lanternPostLightRadius, kind: 'light' });
    }
    for (const position of decoyPositions) {
      sources.push({ x: position.x, z: position.z, radius: Balance.decoyShed.lightRadius, kind: 'light' });
    }

    const enemyLanterns = this.enemies.all
      .filter((enemy) => enemy.isAlive && enemy.carriesLantern)
      .map((enemy) => {
        const position = this.enemies.renderPositionOf(enemy);
        const swing = this.timeAlive * 3.4 + enemy.id * 1.7;
        return {
          x: position.x + Math.sin(swing) * 0.18,
          z: position.z + Math.cos(swing) * 0.18,
          radius: Balance.contracts.nightShift.enemyLanternRadius,
        };
      });
    for (const lantern of enemyLanterns) sources.push({ ...lantern, kind: 'light' });

    const agentLight = this.prospectorCan('light_duty') && this.prospector.group.visible
      ? {
          x: this.localActor.renderPosition.x + Math.sin(this.localActor.group.rotation.y) * 2.2,
          z: this.localActor.renderPosition.z - Math.cos(this.localActor.group.rotation.y) * 2.2,
          radius: Balance.contracts.nightShift.agentLightRadius,
        }
      : null;
    if (agentLight) sources.push({ ...agentLight, kind: 'light' });

    const nightPools: NightPoolSource[] = [
      ...lanternPositions.map((position) => ({
        x: position.x,
        z: position.z,
        radius: Balance.contracts.nightShift.lanternPostLightRadius,
        kind: 'lantern' as const,
      })),
      ...decoyPositions.map((position) => ({
        x: position.x,
        z: position.z,
        radius: Balance.decoyShed.lightRadius,
        kind: 'lantern' as const,
      })),
      ...this.actors.filter((actor) => actor.group.visible).map((actor) => ({
        x: actor.renderPosition.x,
        z: actor.renderPosition.z,
        radius: Balance.contracts.nightShift.heroLightRadius,
        kind: 'hero' as const,
      })),
      ...(agentLight ? [{ ...agentLight, height: 1.15, kind: 'prospector' as const }] : []),
      ...enemyLanterns.map((lantern) => ({ ...lantern, height: 0.82, kind: 'enemy-lantern' as const })),
    ];
    this.lightRig?.setNightShift(state, nightPools);
    this.buildSystem.setNightLighting(state.darkness, nightPools);

    this.enemies.setLightDimming(this.isNightShiftContract()
      ? {
          enabled: true,
          darkness: state.darkness,
          minLight: Balance.contracts.nightShift.minLight,
          falloff: Balance.contracts.nightShift.lightFalloff,
          sources,
        }
      : { enabled: false, darkness: 0, minLight: 1, falloff: Balance.contracts.nightShift.lightFalloff, sources: [] });
  }

  private nightShiftLightingState(): LightRigNightShiftState {
    const waveSchedule = this.activeContract.twist.dayNightCycle?.waveSchedule;
    if (waveSchedule) {
      const wave = this.waveSystem.diagnostics.wave;
      const span = Math.max(1, waveSchedule.darkWave - waveSchedule.duskWave);
      const progress = THREE.MathUtils.clamp((wave - waveSchedule.duskWave) / span, 0, 1);
      const phase = wave < waveSchedule.duskWave ? 'full' : wave < waveSchedule.darkWave ? 'dusk' : 'dark';
      const darkness = phase === 'full' ? 0 : progress * (this.activeContract.twist.dayNightCycle?.nightDepth ?? 1);
      this.dayNightSnapshot = { phase, darkness, phaseProgress: progress, cycleProgress: progress, cycle: 0, simTime: this.timeAlive };
      const keyframes = this.activeContract.twist.lightRamp?.keyframes;
      return { enabled: true, phase, darkness, ...(keyframes?.length ? { palette: lightRampPalette(keyframes, wave) } : {}) };
    }
    if (this.dayNightCycle) {
      const snapshot = this.dayNightCycle.sample(this.dayNightTimeOverride ?? this.timeAlive);
      this.dayNightSnapshot = snapshot;
      const keyframes = this.activeContract.twist.lightRamp?.keyframes;
      if (!keyframes?.length) return { enabled: true, phase: snapshot.phase, darkness: snapshot.darkness };
      const first = keyframes[0]!.wave;
      const span = keyframes.at(-1)!.wave - first;
      const position = snapshot.phase === 'full'
        ? first
        : snapshot.phase === 'dusk'
          ? first + span * snapshot.phaseProgress
          : snapshot.phase === 'dark'
            ? first + span
            : first + span * (1 + snapshot.phaseProgress);
      return {
        enabled: true,
        phase: snapshot.phase,
        darkness: snapshot.darkness,
        palette: lightRampPalette(keyframes, position, true),
      };
    }
    this.dayNightSnapshot = null;
    if (!this.isNightShiftContract()) return { enabled: false, phase: 'full', darkness: 0 };
    const ramp = this.activeContract.twist.lightRamp ?? Balance.contracts.nightShift;
    const diagnostics = this.waveSystem.diagnostics;
    const waveInterval = Math.max(0.1, Balance.waves.waveInterval / Math.max(0.1, this.activeContract.twist.waveCadenceMult ?? 1));
    const wave = Math.max(0, diagnostics.wave + THREE.MathUtils.clamp(1 - diagnostics.nextWaveInSim / waveInterval, 0, 1));
    let phase: NightShiftPhase = 'full';
    let darkness = 0;
    if (wave >= ramp.dawnWave) {
      phase = 'dawn';
    } else if ('keyframes' in ramp && ramp.keyframes?.length) {
      const palette = lightRampPalette(ramp.keyframes, wave);
      const phase: NightShiftPhase = palette.phase === 'full' ? 'full' : palette.phase === 'dark' ? 'dark' : 'dusk';
      return { enabled: true, phase, darkness: palette.darkness, palette };
    } else if (wave >= ramp.darkWave) {
      phase = 'dark';
      darkness = Balance.contracts.nightShift.darkDarkness;
    } else if (wave >= ramp.duskWave) {
      phase = 'dusk';
      const span = Math.max(1, ramp.darkWave - ramp.duskWave);
      const t = THREE.MathUtils.clamp((wave - ramp.duskWave) / span, 0, 1);
      darkness = THREE.MathUtils.lerp(Balance.contracts.nightShift.duskDarkness, Balance.contracts.nightShift.darkDarkness, t);
    }
    return { enabled: true, phase, darkness };
  }

  private isNightShiftContract(): boolean {
    return Boolean(this.activeContract.twist.lightRamp || this.activeContract.twist.dayNightCycle);
  }

  private isBuildableEnabled(id: BuildableId): boolean {
    if (this.activeContract.twist.powerGrid && (id === 'turret' || id === 'lantern_post')) return false;
    if (id === 'lantern_post') return this.isNightShiftContract();
    if (id === 'decoy_shed') return this.activeContract.id === 'e3-moth-season';
    if (id === 'capacitor_bank') return this.activeContract.id === 'e3-blackout-ridge';
    if (id === 'boiler_house') return this.activeContract.twist.pressureEnabled === true && !this.multiplayerActive();
    return true;
  }

  private detailClearings(): DetailScatterClearPoint[] {
    const diagnostics = this.buildSystem.diagnostics;
    return [
      ...diagnostics.beaconPositions,
      ...diagnostics.palisadePositions,
      ...diagnostics.sluicePositions,
      ...diagnostics.stockpilePositions,
      ...diagnostics.boilerHousePositions,
      ...diagnostics.turretPositions,
      ...diagnostics.lanternPostPositions,
      ...diagnostics.capacitorBankPositions,
      ...diagnostics.assayOfficePositions,
      ...diagnostics.reservedFootprints,
    ].map((position) => ({ x: position.x, z: position.z, radius: Balance.world.detailBuildingClearRadius }));
  }

  private recordProfileSample(): void {
    if (!isProfileEnabled()) return;

    this.profileElapsed += this.frameMsLast / 1000;
    this.profileFrameMs.push(this.frameMsLast);
    this.profileDrawCalls.push(this.renderer.info.render.calls);
    if (this.profileElapsed < 5) return;

    const sortedFrameMs = [...this.profileFrameMs].sort((a, b) => a - b);
    console.table([
      {
        windowSec: Number(this.profileElapsed.toFixed(2)),
        frames: this.profileFrameMs.length,
        frameMsP50: round1(percentile(sortedFrameMs, 0.5)),
        frameMsP95: round1(percentile(sortedFrameMs, 0.95)),
        drawCalls: Math.max(...this.profileDrawCalls),
      },
    ]);
    this.profileElapsed = 0;
    this.profileFrameMs.length = 0;
    this.profileDrawCalls.length = 0;
  }

  private fadeOverlaysActive(): number {
    return Number(this.damageFlashRemaining > 0) + Number(this.state.current === 'dead') + Number(this.state.current === 'levelup');
  }

  private syncUi(): void {
    this.uiSnapshot = this.uiBridge.build(
      this.state,
      this.timeAlive,
      this.localActor.hp,
      this.localActor.maxHp,
      this.enemies.activeCount,
      this.economy.gold,
      this.economy.bankCap,
      this.activeResourceSnapshots(),
      this.powerUiSnapshot(),
      this.progression.xpInto,
      this.progression.xpNeed,
      this.progression.level,
      this.waveSystem.diagnostics.wave,
      this.waveSystem.diagnostics.waveState,
      this.buildSystem.isBuildMode,
      this.buildMenuOpen,
      this.buildSystem.selectedBuildable,
      this.buildSystem.buildableSnapshots,
      this.buildSystem.buildableCounts.find((entry) => entry.id === 'stockpile')?.count ?? 0,
      this.buildSystem.beaconCount,
      Balance.beacon.maxCount,
      this.buildSystem.nextCost,
      this.buildSystem.canAffordNext,
      this.activeWeapon,
      this.agentUiState(),
    );
    this.hud.update(this.uiSnapshot, this.pauseMetaSnapshot(), this.playerPauseActive && this.state.isPaused);
  }

  private activeResourceSnapshots(): UiSnapshot['resources'] {
    const objective = this.pressureSystem.diagnostics.objective;
    // Contract-scoped resources: no pressure gauge on tiles without boilers (owner finding 2026-07-12).
    const resources = this.activeEpoch.resources.filter(
      (resource) => resource.id !== 'pressure' || this.pressureSystem.diagnostics.enabled,
    );
    return resources.map((resource) => {
      const balance = this.economy.resourceBalance(resource.id);
      return {
        ...resource,
        amount: Math.floor(balance.amount),
        cap: Math.floor(balance.cap || resource.capDefault),
        ...(resource.id === 'pressure' && hasResearchNode(this.researchState, 'pressure_assay')
          ? { safeMin: Balance.boilerHouse.safeMin, safeMax: Balance.boilerHouse.safeMax }
          : {}),
        ...(resource.id === 'pressure' && this.activeContract.twist.pressureEnabled === true
          ? { objective: `PRESSURIZE ${objective.complete ? 'COMPLETE' : objective.failed ? 'FAILED' : `${objective.hotBoilers}/2 · W8–12`}` }
          : {}),
      };
    });
  }

  private powerUiSnapshot(): UiSnapshot['power'] {
    if (!this.powerGraph) return null;
    const power = this.powerGraph.snapshot();
    return {
      supplyWatts: power.totalSupplyWatts,
      demandWatts: power.totalDemandWatts,
      lit: power.components.filter((component) => component.state === 'lit').length,
      brown: power.components.filter((component) => component.state === 'brown').length,
      dark: power.components.filter((component) => component.state === 'dark').length,
      nextDark: power.components.flatMap((component) => component.shedOrder).map((id) => power.nodes.find((node) => node.id === id)).find((node) => node?.state === 'powered')?.labelKey ?? null,
      connect: this.canyonConnectDiagnostics(),
    };
  }

  private syncContractPowerGrid(): void {
    const sites = this.activeContract.tileParams.pylonSites;
    const graph = this.powerGraph;
    if (!sites?.length || !graph) return;
    const buildings = this.buildSystem.diagnostics.hp.filter((entry) => entry.id === 'sentry_beacon');
    const snapshot = graph.snapshot();
    for (const site of sites) {
      const online = buildings.some((entry) => entry.hp > 0 && !entry.wrecked && Math.hypot(entry.position.x - site.x, entry.position.z - site.z) <= site.radius);
      if (snapshot.nodes.find((node) => node.id === site.nodeId)?.online !== online) {
        graph.queueCommand({ type: 'set-node-online', nodeId: site.nodeId, online });
      }
      const wireId = powerWireId({ a: site.wireFrom, b: site.nodeId });
      const state = online ? 'intact' : 'cut';
      if (snapshot.wires.find((wire) => wire.id === wireId)?.state !== state) {
        graph.queueCommand({ type: 'set-wire-state', wireId, state });
      }
    }
    const capacitorBuildings = this.buildSystem.diagnostics.hp.filter((entry) => entry.id === 'capacitor_bank');
    for (const site of this.activeContract.tileParams.capacitorSites ?? []) {
      const online = capacitorBuildings.some((entry) => entry.hp > 0 && !entry.wrecked && Math.hypot(entry.position.x - site.x, entry.position.z - site.z) <= site.radius);
      if (snapshot.nodes.find((node) => node.id === site.nodeId)?.online !== online) {
        graph.queueCommand({ type: 'set-node-online', nodeId: site.nodeId, online });
      }
    }
  }

  private canyonConnectDiagnostics(): null | { powered: number; required: number; byWave: number; complete: boolean; failed: boolean } {
    const grid = this.activeContract.twist.powerGrid;
    const graph = this.powerGraph;
    if (!grid?.connect || !graph) return null;
    const galleries = new Set(grid.nodes.filter((node) => node.kind === 'consumer' && node.role === 'gallery').map((node) => node.id));
    const powered = graph.snapshot().nodes.filter((node) => galleries.has(node.id) && node.state === 'powered').length;
    return {
      powered,
      required: grid.connect.required,
      byWave: grid.connect.byWave,
      complete: this.canyonConnectCompletedByDeadline,
      failed: this.canyonConnectFailed,
    };
  }

  private syncCanyonConnectObjective(): void {
    const grid = this.activeContract.twist.powerGrid;
    const connect = this.canyonConnectDiagnostics();
    if (!grid?.connect || !connect) return;
    const wave = this.waveSystem.diagnostics.wave;
    if (!this.canyonConnectCompletedByDeadline && !this.canyonConnectFailed && wave <= grid.connect.byWave && connect.powered >= connect.required) {
      this.canyonConnectCompletedByDeadline = true;
    }
    if (!this.canyonConnectCompletedByDeadline && wave > grid.connect.byWave) this.canyonConnectFailed = true;
    if (!this.canyonConnectCompletedByDeadline || this.canyonConnectAnnounced) return;
    this.canyonConnectAnnounced = true;
    this.uiBridge.announce('CONNECT COMPLETE - both galleries carry current.', this.timeAlive);
  }

  private powerConsumerAt(x: number, z: number, role: 'lamp' | 'turret'): boolean {
    const grid = this.activeContract.twist.powerGrid;
    const graph = this.powerGraph;
    if (!grid || !graph) return true;
    const candidates = grid.nodes.filter((node) => node.kind === 'consumer' && node.role === role);
    const target = candidates.reduce<(typeof candidates)[number] | null>((best, node) => {
      if (!best) return node;
      return Math.hypot(node.x - x, node.z - z) < Math.hypot(best.x - x, best.z - z) ? node : best;
    }, null);
    return !target || graph.snapshot().nodes.find((node) => node.id === target.id)?.state === 'powered';
  }

  private agentUiState(): UiSnapshot['agent'] {
    const state = this.agentStub?.state ?? null;
    if (!state) return null;
    const receiptFeed =
      this.agentPolicySlotBonus > 0
        ? [`Schooling: +${this.agentPolicySlotBonus} policy slot`, ...state.receiptFeed].slice(0, 8)
        : state.receiptFeed;
    return {
      ...state,
      autonomyTrack: this.runManager?.metaProgress.tracks.agent ?? 0,
      policySlotBonus: this.agentPolicySlotBonus,
      receiptFeed,
      consent: this.agentConsent.snapshot(state.permissionLevel),
    };
  }

  private agentAutonomyDelta(securedThisRun: boolean): { before: number; after: number } | undefined {
    const run = this.runManager?.diagnostics;
    const moved = run?.victoryPayout?.agent ?? 0;
    const rawAfter = Math.max(0, run?.meta.tracks.agent ?? 0);
    const before = Math.min(3, Math.max(0, rawAfter - moved));
    const after = Math.min(3, rawAfter);
    if (!securedThisRun || moved <= 0 || after <= before) return undefined;
    return { before, after };
  }

  private showProspectorIntro(): void {
    if (this.prospectorIntroShown || !this.agentStub) return;
    const { permissionLevel } = this.agentStub.state;
    this.prospectorIntroShown = true;
    this.uiBridge.announce(
      `the Prospector: ${prospectorIntroAbility(permissionLevel)} Chip by weapon; claim wins grow it.`,
      this.timeAlive,
      null,
      5.6,
    );
    this.prospector.speak('Prospector ready');
  }

  private maybeProspectorCollectXp(): void {
    if (
      !this.prospectorCan('auto_collect') ||
      this.prospector.hasActiveTask ||
      this.timeAlive < this.nextProspectorXpSweepAt
    ) {
      return;
    }
    const options = { minAgeS: Balance.agent.xpMoteAgeS };
    if (!this.combat.hasProspectorXp(options, this.prospector.position)) {
      this.nextProspectorXpSweepAt = this.timeAlive + 0.8;
      return;
    }
    this.agentStub?.collectXp();
    this.nextProspectorXpSweepAt = this.timeAlive + 2.4;
  }

  private collectProspectorXp(options: AgentCollectXpOptions): AgentCollectXpResult {
    const result = this.combat.collectXpForProspector(options, this.prospector.position);
    if (result.xp > 0) emitStorySignal({ type: 'xp-collected' });
    return result;
  }

  private maybeProspectorCollectGold(): void {
    if (
      !this.prospectorCan('auto_collect') ||
      this.prospector.hasActiveTask ||
      this.timeAlive < this.nextProspectorGoldSweepAt
    ) {
      return;
    }
    if (!this.goldPickups.hasCollectibleNear(this.prospector.position, Balance.sparkRig.range)) {
      this.nextProspectorGoldSweepAt = this.timeAlive + 0.8;
      return;
    }
    this.agentStub?.collectGold();
    this.nextProspectorGoldSweepAt = this.timeAlive + 2.4;
  }

  private collectProspectorGold(): AgentCollectGoldResult | false {
    const start = pointFromVector(this.prospector.position);
    const collected = this.goldPickups.collectNear(
      this.prospector.position,
      Balance.sparkRig.range,
      (amount) => this.economy.canReceiveIncome(this.reclaimAmount(amount)),
      (position, amount) => this.reclaimGold(position, amount, 'prospector'),
      (position) => this.blockedGoldPickup(position),
    );
    if (!collected) return false;
    const gold = this.reclaimAmount(collected.amount);
    return {
      gold,
      pickups: 1,
      message: `Gathered ${gold} gold`,
      collector: 'prospector',
      agentPath: [start, collected.position],
      sweptIds: [`pickup:${collected.index}`],
    };
  }

  private maybeProspectorRepair(): void {
    if (
      !this.prospectorCan('auto_repair') ||
      this.timeAlive < this.nextProspectorRepairSweepAt
    ) {
      return;
    }
    if (this.prospector.hasActiveTask) {
      this.previewProspectorRepair();
      return;
    }
    this.prospectorRepairDwellStartedAt = null;

    const hadTarget = this.prospectorRepairTarget !== null;
    const target =
      this.prospectorRepairTargetFor(this.prospectorRepairTarget) ?? this.nearestProspectorRepairTarget();
    if (!target) {
      this.prospectorRepairTarget = null;
      this.nextProspectorRepairSweepAt = this.timeAlive + 0.8;
      return;
    }

    this.prospectorRepairTarget = { id: target.id, index: target.index };
    const distanceSq = distanceSq2(this.prospector.position.x, this.prospector.position.z, target.position.x, target.position.z);
    if (!hadTarget || distanceSq > Balance.wreck.repairRadius * Balance.wreck.repairRadius) {
      this.prospector.assignWork(target.position, Balance.wreck.repairSeconds);
      this.prospectorRepairDwellStartedAt = null;
      this.nextProspectorRepairSweepAt = this.timeAlive + 0.2;
      return;
    }

    const receipt = this.agentStub?.repair({ id: target.id, index: target.index });
    if (receipt?.outcome.ok) this.prospectorRepairTarget = null;
    this.nextProspectorRepairSweepAt = this.timeAlive + 1.2;
  }

  private previewProspectorRepair(): void {
    const target = this.prospectorRepairTargetFor(this.prospectorRepairTarget);
    if (!target || !this.prospector.snapshot.working) {
      this.prospectorRepairDwellStartedAt = null;
      return;
    }
    this.prospectorRepairDwellStartedAt ??= this.activeTickElapsed;
    const progress = (this.activeTickElapsed - this.prospectorRepairDwellStartedAt) / Balance.wreck.repairSeconds;
    this.buildSystem.previewRepairProgress(target.id, target.index, progress, this.timeAlive);
  }

  private repairProspectorBuilding(building: AgentBuildingRef): unknown {
    const id = buildableIdFromString(building.id);
    const index = Number.isInteger(building.index) ? building.index! : 0;
    if (!id || index < 0) return false;
    const start = pointFromVector(this.prospector.position);
    const result = this.buildSystem.repairBuilding(id, index, this.timeAlive, this.prospector.position);
    if (!result) return false;
    this.syncStockpileHoldings();
    this.publishDiagnostics();
    return {
      ...result,
      collector: 'prospector',
      agentPath: [start, result.position],
    };
  }

  private prospectorCan(ability: 'auto_collect' | 'auto_repair' | 'light_duty'): boolean {
    if (!this.agentStub) return false;
    const level = this.agentStub.state.permissionLevel;
    return level > 0 && this.agentConsent.allows(ability, level);
  }

  private prospectorRepairTargetFor(ref: AgentBuildingRef | null): {
    id: BuildableId;
    index: number;
    position: ProspectorPoint;
  } | null {
    if (!ref) return null;
    const id = buildableIdFromString(ref.id);
    const index = Number.isInteger(ref.index) ? ref.index! : 0;
    if (!id || index < 0) return null;
    const entry = this.buildSystem.diagnostics.hp.find((candidate) => candidate.id === id && candidate.index === index);
    if (!entry || !buildingNeedsRepair(entry)) return null;
    const rangeSq = Balance.sparkRig.range * Balance.sparkRig.range;
    const distanceSq = distanceSq2(this.prospector.position.x, this.prospector.position.z, entry.position.x, entry.position.z);
    if (distanceSq > rangeSq) return null;
    return { id, index, position: entry.position };
  }

  private nearestProspectorRepairTarget(): { id: BuildableId; index: number; position: ProspectorPoint } | null {
    let best: { id: BuildableId; index: number; position: ProspectorPoint } | null = null;
    let bestDistanceSq = Balance.sparkRig.range * Balance.sparkRig.range;
    for (const entry of this.buildSystem.diagnostics.hp) {
      if (!buildingNeedsRepair(entry)) continue;
      const distanceSq = distanceSq2(this.prospector.position.x, this.prospector.position.z, entry.position.x, entry.position.z);
      if (distanceSq <= bestDistanceSq) {
        best = { id: entry.id, index: entry.index, position: entry.position };
        bestDistanceSq = distanceSq;
      }
    }
    return best;
  }

  private syncAssayOfficePrompt(): void {
    this.assayOfficePrompt.update(
      this.state.current === 'playing' &&
        !this.buildSystem.isBuildMode &&
        this.buildSystem.assayOfficeInRange(this.localActor.group.position),
    );
  }

  private syncBuildingContextPrompt(): void {
    const benchOpen = document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null;
    const assayInRange = this.buildSystem.assayOfficeInRange(this.localActor.group.position);
    const canInteract = this.state.current === 'playing' && !this.state.isPaused && !benchOpen;
    const fund = canInteract && !this.buildMenuOpen && !this.buildSystem.isBuildMode ? this.megaprojectFundCandidate(this.localActor.group.position) : null;
    const demolish = canInteract && this.buildSystem.isBuildMode && !fund ? this.demolishCandidate : null;
    const upgrade = demolish ? this.upgradeCandidate : null;
    this.buildingContextPrompt.update(demolish, upgrade, !assayInRange, fund);
  }

  private updateBuildingContextCandidates(position = this.localActor.group.position): void {
    const canInteract = this.state.current === 'playing' && !this.state.isPaused;
    const fund = canInteract && !this.buildMenuOpen && !this.buildSystem.isBuildMode ? this.megaprojectFundCandidate(position) : null;
    let demolish = canInteract && this.buildSystem.isBuildMode && !fund ? this.buildSystem.nearestBuildingTo(position) : null;
    const key = demolish ? demolishKey(demolish) : null;
    if (!key) this.demolishSuppressedKey = null;
    if (key && this.demolishSuppressedKey && key !== this.demolishSuppressedKey) this.demolishSuppressedKey = null;
    if (key && key === this.demolishSuppressedKey) demolish = null;
    const upgrade = demolish ? this.buildSystem.upgradeCandidateFor(demolish.id, demolish.index) : null;
    this.demolishCandidate = demolish;
    this.upgradeCandidate = upgrade;
    this.maybeEmitStampSiteBeat(fund);
  }

  private syncWorldInfoNotePrompt(): void {
    const blocked =
      this.state.current !== 'playing' ||
      this.state.isPaused ||
      this.buildMenuOpen ||
      this.buildSystem.isBuildMode ||
      document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null ||
      document.querySelector('[data-testid="contract-briefing"]:not([hidden])') !== null;
    this.worldInfoNotePrompt.update(blocked ? null : this.nearestWorldInfoTarget(this.localActor.group.position));
  }

  private nearestWorldInfoTarget(position: THREE.Vector3): WorldInfoNoteTarget | null {
    const candidates: Array<{ objectClass: WorldInfoObjectClass; distanceSq: number; priority: number }> = [];
    const add = (objectClass: WorldInfoObjectClass, x: number, z: number, radius: number, priority = 0) => {
      const distanceSq = distanceSq2(position.x, position.z, x, z);
      if (distanceSq <= radius * radius) candidates.push({ objectClass, distanceSq, priority });
    };

    for (const node of this.harvestSnapshot.activeNodes) {
      if (node.active) add('gold_seam', node.position.x, node.position.z, 2.25, 3);
    }
    for (const entry of this.buildSystem.diagnostics.hp) {
      if (entry.wrecked || entry.hp <= 0) {
        if (entry.id === 'lantern_post' && entry.wrecked) add('lantern_post', entry.position.x, entry.position.z, 2.35, 2);
        continue;
      }
      add(buildingInfoClass(entry.id), entry.position.x, entry.position.z, 2.35, 2);
    }
    const stake = Terrain.lossStakeMarker() ?? this.heroStart;
    add('claim_stake', stake.x, stake.z, 2.4, 1);
    for (const source of Terrain.waterSources()) {
      add('spring_pond', source.x, source.z, source.radius + 1.4);
    }
    for (const ford of Terrain.fordRanges()) {
      add('ford', ford.centerX, 0, ford.halfWidth + 1.35);
    }
    if (this.baronStandardPlanted) add('baron_standard', this.baronStandardPosition.x, this.baronStandardPosition.z, 2.5, 4);
    if (this.territoryRingPresent) {
      for (const gap of this.territoryRingGapCenters()) add('territory_ring_gap', gap.x, gap.z, 2.4, 2);
    }
    const megaproject = this.megaprojectDiagnostics();
    if (megaproject.unlocked && !megaproject.complete && megaproject.siteFootprint) {
      const footprint = megaproject.siteFootprint;
      add('megaproject_site', footprint.x, footprint.z, Math.max(footprint.w, footprint.d) * 0.5 + 2.2, 2);
    }
    add('prospector', this.prospector.snapshot.position.x, this.prospector.snapshot.position.z, 1.8);

    candidates.sort((a, b) => a.distanceSq - b.distanceSq || b.priority - a.priority);
    return candidates[0] ? { objectClass: candidates[0].objectClass } : null;
  }

  private territoryRingGapCenters(): Array<{ x: number; z: number }> {
    const center = this.heroStart;
    const gapHalf = Balance.meta.territoryRingGapHalfWidth;
    const wallHalf = Balance.palisade.width / 2;
    const capOffset = gapHalf + Balance.palisade.depth - wallHalf;
    const sideOffset = gapHalf + Balance.palisade.depth + wallHalf;
    const gaps: Array<{ x: number; z: number }> = [];
    for (const edge of this.activeContract.tileParams.lanes.spawnEdges) {
      if (edge === 'north' || edge === 'south') {
        gaps.push({ x: center.x, z: center.z + (edge === 'north' ? capOffset : -capOffset) });
      } else {
        gaps.push({ x: center.x + (edge === 'east' ? sideOffset : -sideOffset), z: center.z });
      }
    }
    return gaps;
  }

  private handleUiIntent(intent: UiIntent): void {
    if (this.mpClient) {
      if (intent.type === 'set_agent_rung') {
        this.mpQueuedActions.push({ type: 'set_agent_rung', level: intent.level, granted: intent.granted });
        return;
      }
      if (intent.type === 'set_agent_ability') {
        this.mpQueuedActions.push({ type: 'set_agent_ability', ability: intent.ability, granted: intent.granted });
        return;
      }
      if (intent.type === 'pause') this.mpQueuedActions.push({ type: 'set_pause', paused: !this.state.isPaused });
      if (intent.type === 'restart') this.mpQueuedActions.push({ type: 'restart' });
      if (intent.type === 'pause' || intent.type === 'restart') {
        return;
      }
    }
    if (intent.type === 'set_agent_rung') this.agentConsent.setRung(intent.level, intent.granted);
    if (intent.type === 'set_agent_ability') this.agentConsent.setAbility(intent.ability, intent.granted);
    if (intent.type === 'set_agent_rung' || intent.type === 'set_agent_ability') return;
    if (intent.type === 'open_ledger') {
      this.audio.play('ledger-open');
      this.openClaimLedger();
      return;
    }
    if (intent.type === 'save_claim') {
      this.audio.play('ledger-open');
      this.saveManualClaim(intent.name);
      return;
    }
    if (intent.type === 'back_to_town') {
      // Plain boot exits the ?contract auto-launch loop; pagehide flushes the
      // run-suspend on the way out, so Continue picks this run back up.
      window.location.assign(`${window.location.origin}${window.location.pathname}`);
      return;
    }
    if (this.secureClaimChoicePending()) return;
    this.audio.play('menu-tap');
    if (intent.type === 'pause') this.togglePlayerPause();
    if (intent.type === 'restart' && this.state.current === 'dead') this.resetRun();
    if (intent.type === 'toggle_build_menu') this.toggleBuildMenu();
    if (intent.type === 'close_build_menu') this.collapseBuildMenu();
    if (intent.type === 'select_buildable') this.selectBuildable(intent.id);
  }

  private secureClaimChoicePending(): boolean {
    const run = this.runManager?.diagnostics;
    return run?.secured === true && run.rush !== true;
  }

  private handleUpgradeIntent(intent: UpgradeIntent): void {
    if (intent.type !== 'pick_upgrade' || this.state.current !== 'levelup') return;
    const picked = this.progression.offer?.[intent.index];
    if (!picked) return;
    if (this.mpClient) {
      this.mpQueuedActions.push({ type: 'pick_upgrade', id: picked.id });
      return;
    }
    this.progression.applyUpgrade(picked.id);
  }

  private advanceSimForTest(seconds: number, onTick?: (sample: GrSimulationTickSample) => void): void {
    const total = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const ticks = Math.round(total / FIXED_SIM_STEP_SECONDS);
    const scale = Math.max(0.001, this.simTimeScale);
    let pendingPresentationSteps = 0;
    const presentPendingSteps = () => {
      if (pendingPresentationSteps === 0) return;
      const presentationDelta = (pendingPresentationSteps * FIXED_SIM_STEP_SECONDS) / scale;
      this.present(
        {
          deltaSeconds: presentationDelta,
          presentationDeltaSeconds: presentationDelta,
          alpha: 1,
          steps: pendingPresentationSteps,
          droppedSeconds: 0,
        },
        false,
      );
      pendingPresentationSteps = 0;
    };
    this.manualAdvanceForTest = true;
    try {
      for (let tick = 0; tick < ticks; tick += 1) {
        const frameDelta = FIXED_SIM_STEP_SECONDS / scale;
        if (!this.update(frameDelta)) break;
        onTick?.({
          time: this.timeAlive,
          enemies: this.enemies.activeCount,
          bolts: this.combat.boltsAlive,
          blasts: this.combat.blastsAlive,
          goldPickups: this.goldPickups.activeCount,
          xpMotes: this.xpMotes.activeCount,
          wave: this.waveSystem.diagnostics.wave,
          economyLog: this.economy.log.length,
        });
        pendingPresentationSteps += 1;
        if (pendingPresentationSteps === MAX_FIXED_STEPS_PER_FRAME) presentPendingSteps();
      }
      presentPendingSteps();
    } finally {
      this.manualAdvanceForTest = false;
    }
  }

  private driveRenderScheduleForTest(seconds: number, renderFps: number) {
    const total = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const fps = Number.isFinite(renderFps) ? Math.max(1, renderFps) : 1;
    const renderFrames = Math.round(total * fps);
    const startFrame = this.frame;
    const startTick = this.simTick;
    const previousManualAdvance = this.manualAdvanceForTest;
    this.loop.stop();
    this.loop.resetTiming();
    this.manualAdvanceForTest = true;
    try {
      for (let i = 0; i < renderFrames; i += 1) this.loop.advanceFrame(1 / fps);
    } finally {
      this.manualAdvanceForTest = previousManualAdvance;
    }
    return {
      renderFrames: this.frame - startFrame,
      simTicks: this.simTick - startTick,
      loop: { ...this.loop.diagnostics },
    };
  }

  private queueDevPowerGraphCommand(command: PowerGraphCommand): boolean {
    return !this.mpClient && (isDevPowerGraphEnabled() || (isDebugEnabled() && Boolean(this.activeContract.twist.powerGrid))) && this.powerGraph?.queueCommand(command) === true;
  }

  resetRun(): void {
    const deferMetaRecap =
      this.runManager?.diagnostics.secured === true && this.runManager.diagnostics.lastRunEndedReason === 'secured';
    this.timeAlive = 0;
    this.simTick = 0;
    this.deathPending = false;
    if (this.powerGraph) {
      this.powerGraph.reset(0);
      this.powerWireView?.invalidate();
    }
    this.canyonConnectAnnounced = false;
    this.canyonConnectCompletedByDeadline = false;
    this.canyonConnectFailed = false;
    this.crawlerBoss.reset();
    this.tram?.reset();
    this.fuelSystem?.reset();
    this.vehicle?.reset();
    this.applyRunPreset(readDifficultyPreset(), false);
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'run_reset' });
    this.enemies.recycleAll();
    this.mothSwarm.reset();
    this.goldPickups.recycleAll();
    this.waveSystem.reset();
    this.buildMenuOpen = false;
    this.upgradeCandidate = null;
    this.demolishCandidate = null;
    this.demolishSuppressedKey = null;
    this.buildSystem.reset();
    this.pressureSystem.reset();
    this.pressureArsenalSystem.reset();
    this.syncMegaprojectSite();
    this.placeContractFixtures();
    if (this.runManager) this.applyMetaProgress(this.runManager.metaProgress);
    this.harvestSystem.reset();
    this.combat.reset();
    this.damSurge?.reset();
    if (isDebugEnabled() && new URLSearchParams(window.location.search).has('damsurge')) this.damSurge?.trigger(this.timeAlive);
    this.lightRig?.resetTransientLights();
    this.activeWeapon = 'rig';
    this.blastAimReticle.visible = false;
    this.canvas.classList.remove('aim-reticle--disarmed');
    this.weaponToggleCount = 0;
    this.blastTime = 0;
    this.wetPowderHintCooldown = 0;
    this.progression.reset();
    this.agentConsent.reset();
    const roster = (this.mpClient?.state().roster ?? []).slice(0, 4);
    if (roster.length >= 2) {
      this.syncMultiplayerActors();
      for (let slot = 0; slot < this.actors.length; slot += 1) {
        const actor = this.actors[slot];
        if (!actor || !roster[slot]) continue;
        actor.resetRun(this.multiplayerSpawnPosition(slot, roster.length));
      }
    } else {
      this.primaryActor.resetRun(this.heroStart);
      for (let slot = 1; slot < this.actors.length; slot += 1) {
        const actor = this.actors[slot];
        if (actor) actor.group.visible = false;
      }
    }
    this.syncHeroVisualHeight();
    for (const actor of this.actors) actor.snapRenderState();
    this.updateActionActorPosition();
    this.cameraRig.snapTo(this.localActor.group.position);
    this.nextProspectorXpSweepAt = 0;
    this.nextProspectorGoldSweepAt = 0;
    this.nextProspectorRepairSweepAt = 0;
    this.prospectorRepairTarget = null;
    this.prospectorRepairDwellStartedAt = null;
    this.prospectorIntroShown = false;
    this.lastHarvestChanneling = false;
    this.lastUpgradeOfferAudioKey = '';
    this.kills = 0;
    this.baronBeatenThisRun = false;
    this.baronCeremony = null;
    this.baronStandardPlanted = false;
    this.baronStandardGroup.visible = false;
    this.baronRocketCartGroup.visible = false;
    this.baronRocketNextAt = 0;
    this.baronRocketTelegraphStartedAt = -1;
    this.baronRocketVolleys = 0;
    this.baronRocketSuppressed = false;
    this.baronRocketTargetKind = null;
    this.baronRocketLastOwnerId = '';
    this.baronSpawnImpulses = 0;
    window.clearTimeout(this.baronAnnouncementTimer);
    this.pendingBaronBanner = null;
    this.stolenTotal = 0;
    this.reclaimedTotal = 0;
    this.buildingHitsResolved = 0;
    this.buildingsWrecked = 0;
    this.syncStockpileHoldings();
    this.charmPauseRemaining = 0;
    this.charmPauseCooldown = 0;
    this.charmPauseActive = false;
    this.damageFlashRemaining = 0;
    this.damageVignette.style.opacity = '0';
    this.deathOverlay.hide();
    this.deathLedger = {
      timeAlive: 0,
      kills: 0,
      goldPanned: 0,
      spent: 0,
      beaconsBuilt: 0,
      wavesSurvived: 0,
      weaponToggles: 0,
      blastTime: 0,
    };
    this.state.restart();
    this.playerPauseActive = false;
    this.prospector.reset(this.primaryActor.group.position);
    this.prefetchContractPresentation();
    this.showProspectorIntro();
    this.uiBridge.announce('Stake your claim.', 0);
    this.syncUi();
    this.showContractBriefing();
    if (deferMetaRecap) {
      this.runStartMetaRecapPending = true;
    } else {
      this.showRunStartMetaRecap();
    }
    this.upgradeOverlay.hide();
    this.buildingContextPrompt.update(null, null, false);
  }

  private finishRunLedger(): void {
    this.returnToTown('overrun');
  }

  private setMultiplayerDeathActions(done: () => void, secondary: () => void): void {
    this.mpDeathActionHandlers.done = done;
    this.mpDeathActionHandlers.secondary = secondary;
  }

  private requestDeathAction(choice: 'done' | 'secondary', action: () => void): void {
    if (this.mpClient) {
      this.mpQueuedActions.push({ type: 'death_action', choice });
      return;
    }
    action();
  }

  restoreDeathOverlayForSuspend(): void {
    const economySummary = summarizeLog(this.economy.log);
    const runStats = this.deathRunStats(economySummary);
    this.deathLedger = {
      timeAlive: this.timeAlive,
      kills: this.kills,
      goldPanned: economySummary.panned,
      spent: economySummary.spent,
      beaconsBuilt: economySummary.beaconsBuilt,
      wavesSurvived: this.waveSystem.diagnostics.wave,
      weaponToggles: this.weaponToggleCount,
      blastTime: this.blastTime,
    };
    const scores = loadScores();
    const matchingScore = scores.find(
      (score) =>
        score.waves === this.deathLedger.wavesSurvived &&
        score.kills === this.deathLedger.kills &&
        score.gold === this.deathLedger.goldPanned &&
        score.timeAlive === this.deathLedger.timeAlive,
    );
    const onDone = () => this.returnToTown('overrun');
    const onSecondary = () => this.resetRun();
    this.setMultiplayerDeathActions(onDone, onSecondary);
    this.deathOverlay.show(this.deathLedger, scores.slice(0, 5), matchingScore?.at ?? 0, {
      ...this.researchOverlayOptions(1),
      actionLabel: 'Return to Town',
      secondaryActionLabel: 'Try Again',
      runStats,
      townName: readTownName(),
      onDone: () => this.requestDeathAction('done', onDone),
      onSecondaryAction: () => this.requestDeathAction('secondary', onSecondary),
    });
    this.syncMultiplayerLedgerRiders();
  }

  private returnToTown(result: RunReturnResult): void {
    if (!this.onReturnToMenu) throw new Error('Return to Town requested without a return callback.');
    this.onReturnToMenu(result);
  }

  private finishSecuredLedgerQuickLoop(): void {
    this.deathOverlay.hide();
    this.state.setPaused(false);
    this.flushRunStartMetaRecap();
  }

  private prefetchContractPresentation(): void {
    if (this.activeContractUsesBaronPresentation()) this.enemies.prefetchBaronPresentation();
  }

  private activeContractUsesBaronPresentation(): boolean {
    const baron = this.activeContract.twist.baron;
    return !!baron && (baron.bossKind ?? 'baron') === 'baron';
  }

  private togglePlayerPause(): void {
    const paused = this.state.togglePause();
    this.playerPauseActive = this.state.current === 'playing' && paused;
  }

  private toggleAudioMute(): void {
    const muted = setAudioMuted(!readAudioMuted());
    this.hud.showMetaRecap(muted ? 'The claim goes quiet.' : 'Sound returns.', 1.8);
  }

  applyMetaProgress(meta: MetaProgress, options: { placeDefenses?: boolean } = {}): void {
    this.appliedMetaProgress = cloneMetaProgress(meta);
    if (options.placeDefenses === false) return;
    this.territoryRingPresent = false;
    if (meta.tracks.territory < Balance.meta.territoryTier1) return;
    let placed = 0;
    for (const segment of this.territoryRingSegments()) {
      if (this.buildSystem.placeFree('palisade', segment, segment.rotationSteps)) placed += 1;
    }
    this.territoryRingPresent = placed > 0;
  }

  private territoryRingSegments(): Array<{ x: number; z: number; rotationSteps: number }> {
    const center = this.heroStart;
    const gapHalf = Balance.meta.territoryRingGapHalfWidth;
    const segmentHalf = Balance.palisade.depth / 2;
    const wallHalf = Balance.palisade.width / 2;
    const segmentOffset = gapHalf + segmentHalf;
    const capOffset = gapHalf + Balance.palisade.depth - wallHalf;
    const sideOffset = gapHalf + Balance.palisade.depth + wallHalf;
    const segments: Array<{ x: number; z: number; rotationSteps: number }> = [];
    for (const edge of this.activeContract.tileParams.lanes.spawnEdges) {
      for (const side of [-1, 1] as const) {
        if (edge === 'north' || edge === 'south') {
          segments.push({
            x: center.x + side * segmentOffset,
            z: center.z + (edge === 'north' ? capOffset : -capOffset),
            rotationSteps: 1,
          });
        } else {
          segments.push({
            x: center.x + (edge === 'east' ? sideOffset : -sideOffset),
            z: center.z + side * segmentOffset,
            rotationSteps: 0,
          });
        }
      }
    }
    return segments;
  }

  private endRun(): void {
    this.deathPending = false;
    if (this.state.current === 'dead') return;
    this.playerPauseActive = false;
    this.state.transition('dead');
    const economySummary = summarizeLog(this.economy.log);
    this.events.emit({
      type: 'hero_died',
      at: this.timeAlive,
      timeAlive: this.timeAlive,
      kills: this.kills,
      goldPanned: economySummary.panned,
      spent: economySummary.spent,
      beaconsBuilt: economySummary.beaconsBuilt,
      wavesSurvived: this.waveSystem.diagnostics.wave,
      weaponToggles: this.weaponToggleCount,
      blastTime: this.blastTime,
    });
  }

  private finishPendingDeath(): boolean {
    if (!this.deathPending) return false;
    this.endRun();
    this.finishMultiplayerTick();
    return true;
  }

  private registerGoldHoldings(): void {
    this.goldTargeting.clearGoldHoldings();
    for (const holding of this.stockpileHoldings) this.goldTargeting.registerGoldHolding(holding);
    for (const holding of this.goldPickups.goldHoldings) this.goldTargeting.registerGoldHolding(holding);
    this.syncStockpileHoldings();
  }

  private syncStockpileHoldings(): void {
    const snapshots = this.buildSystem.diagnostics.stockpilesState;
    for (let i = 0; i < this.stockpileHoldings.length; i += 1) {
      const holding = this.stockpileHoldings[i];
      if (!holding) continue;
      const snapshot = snapshots[i];
      holding.active = snapshot?.active === true;
      holding.amount = holding.active ? this.economy.gold : 0;
      if (snapshot) holding.position.set(snapshot.position.x, Terrain.visualY(snapshot.position.x, snapshot.position.z, Balance.enemy.groundY), snapshot.position.z);
    }
  }

  private hasBuiltStockpile(): boolean {
    return this.buildSystem.diagnostics.stockpilesState.some((entry) => entry.active);
  }

  private claimGoldForThief(enemy: ClaimJumperEnemy, holding: GoldHolding): number {
    if (holding.kind === 'pickup') {
      const amount = this.goldPickups.take(holding.pickupIndex ?? -1);
      this.onThiefGrabbed(enemy, amount);
      return amount;
    }

    const amount = Math.min(Balance.steal.grabAmount, this.economy.gold);
    if (amount <= 0) return 0;
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at: this.timeAlive,
      type: 'gold_stolen',
      amount,
    });
    if (!result.ok) return 0;
    this.stolenTotal += amount;
    this.syncStockpileHoldings();
    this.vfx.floatText(holding.position, `-${amount}`, '#a0522d');
    this.onThiefGrabbed(enemy, amount);
    return amount;
  }

  private onThiefGrabbed(enemy: ClaimJumperEnemy, amount: number): void {
    if (amount <= 0 || isPingDisabled()) return;
    const edge = enemy.ownEdge ?? edgeFromPosition(enemy.position);
    this.uiBridge.announce(`Gold snatched - ${edgePlace(edge)}!`, this.timeAlive, edge, Balance.steal.pingSeconds);
    this.audio.playPing();
  }

  private onThiefFled(enemy: ClaimJumperEnemy): void {
    enemy.releaseCarriedGold();
    this.enemies.recycle(enemy);
  }

  private toggleWeapon(): 'rig' | 'blast' {
    this.activeWeapon = this.activeWeapon === 'rig' ? 'blast' : 'rig';
    if (this.activeWeapon !== 'blast') this.blastAimReticle.visible = false;
    this.weaponToggleCount += 1;
    return this.activeWeapon;
  }

  private readonly onBlastAimPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.aimPointerNdc.set(
      ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1),
    );
    this.aimRaycaster.setFromCamera(this.aimPointerNdc, this.camera);
    if (!this.aimRaycaster.ray.intersectPlane(this.aimGroundPlane, this.pointerAimPoint)) return;
    this.pointerAimReady = true;
  };

  private setBlastAimForTest(x: number, z: number): { x: number; z: number } {
    this.pointerAimPoint.set(x, 0.08, z);
    this.pointerAimReady = true;
    this.clampBlastAim(this.localActor.group.position, this.pointerAimPoint, this.blastAimPoint);
    return { x: this.blastAimPoint.x, z: this.blastAimPoint.z };
  }

  private setDifficultyPreset(value: string): DifficultyPresetId {
    const preset = normalizeDifficultyPreset(value);
    saveDifficultyPreset(preset);
    return this.applyRunPreset(preset, false);
  }

  private applyRunPreset(preset: DifficultyPresetId, persist: boolean): DifficultyPresetId {
    if (persist) saveDifficultyPreset(preset);
    this.difficultyPreset = applyDifficultyPreset(preset);
    applyUpgradeBudgetsFromBalance();
    return this.difficultyPreset;
  }

  private updateBlastAim(intents: Intents): void {
    const aimMode = Balance.blast.aimMode as BlastAimMode;
    const disarmed = this.heroWeaponsDisarmed();
    this.canvas.classList.toggle('aim-reticle--disarmed', disarmed);
    if (this.activeWeapon !== 'blast' || aimMode === 'auto' || this.multiplayerActive() || disarmed) {
      this.blastAimReticle.visible = false;
      return;
    }

    if (this.pointerAimReady) {
      this.clampBlastAim(this.localActor.group.position, this.pointerAimPoint, this.blastAimPoint);
    } else {
      this.leadBlastAim(intents);
    }

    this.blastAimReticle.position.set(this.blastAimPoint.x, 0.09, this.blastAimPoint.z);
    this.blastAimReticle.visible = true;
  }

  private updateWetPowderHint(delta: number): void {
    this.wetPowderHintCooldown = Math.max(0, this.wetPowderHintCooldown - delta);
    if (!this.heroWeaponsDisarmed() || this.enemies.activeCount <= 0 || this.wetPowderHintCooldown > 0) return;
    this.uiBridge.announce('Wet powder.', this.timeAlive, null, 1.4);
    this.wetPowderHintCooldown = 1.4;
  }

  private heroWeaponsDisarmed(): boolean {
    return this.heroWeaponsDisarmedFor(this.localActor);
  }

  private heroWeaponsEnabledFor(actor: Hero): boolean {
    return actor.group.visible && !this.heroWeaponsDisarmedFor(actor);
  }

  private heroWeaponsDisarmedFor(actor: Hero): boolean {
    return Balance.pathing.deepWaterDisarmsHero && Terrain.sample(actor.group.position.x, actor.group.position.z).waterClass === 'deep';
  }

  private currentBlastTargetFor(actor: Hero, autoTarget: THREE.Vector3): THREE.Vector3 {
    if ((Balance.blast.aimMode as BlastAimMode) === 'auto' || this.multiplayerActive()) return autoTarget;
    if (actor !== this.localActor) return autoTarget;
    return this.blastAimPoint;
  }

  private leadBlastAim(intents: Intents): void {
    const origin = this.localActor.group.position;
    const dx = Math.abs(intents.move.x) > 0.01 ? intents.move.x : this.localActor.velocity.x;
    const dz = Math.abs(intents.move.y) > 0.01 ? intents.move.y : this.localActor.velocity.z;
    const len = Math.hypot(dx, dz);
    const range = Balance.blast.range * 0.72;
    if (len > 0.01) {
      this.blastAimRaw.set(origin.x + (dx / len) * range, 0.08, origin.z + (dz / len) * range);
    } else {
      this.blastAimRaw.set(origin.x, 0.08, origin.z - range);
    }
    this.clampBlastAim(origin, this.blastAimRaw, this.blastAimPoint);
  }

  private clampBlastAim(origin: THREE.Vector3, raw: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
    const dx = raw.x - origin.x;
    const dz = raw.z - origin.z;
    const len = Math.hypot(dx, dz);
    if (len <= 0.001) {
      out.set(origin.x, 0.08, origin.z);
      return out;
    }
    const distance = Math.min(len, Balance.blast.range);
    out.set(origin.x + (dx / len) * distance, 0.08, origin.z + (dz / len) * distance);
    return out;
  }

  private arsenalDiagnostics(): {
    active: 'rig' | 'blast';
    blastsAlive: number;
    detonations: number;
    blastKills: number;
    turretKills: number;
    weaponToggles: number;
    blastTime: number;
    blastDamage: number;
    blastRadius: number;
    disarmed: boolean;
    aimReticleRadius: number;
    aimMode: BlastAimMode;
    aimTarget: { x: number; z: number };
    lastDetonation: { x: number; y: number; z: number } | null;
  } {
    const detonation = this.combat.lastBlastDetonation;
    return {
      active: this.activeWeapon,
      blastsAlive: this.combat.blastsAlive,
      detonations: this.combat.detonations,
      blastKills: this.combat.killsByOwner.hero_blast ?? 0,
      turretKills: this.combat.killsByOwner.turrets ?? 0,
      weaponToggles: this.weaponToggleCount,
      blastTime: this.blastTime,
      blastDamage: this.currentBlastDamage(),
      blastRadius: this.blastShooter.aoe?.radius ?? Balance.blast.radius,
      disarmed: this.heroWeaponsDisarmed(),
      aimReticleRadius: this.blastAimReticleRadius,
      aimMode: Balance.blast.aimMode as BlastAimMode,
      aimTarget: { x: Number(this.blastAimPoint.x.toFixed(3)), z: Number(this.blastAimPoint.z.toFixed(3)) },
      lastDetonation: detonation
        ? { x: Number(detonation.x.toFixed(3)), y: Number(detonation.y.toFixed(3)), z: Number(detonation.z.toFixed(3)) }
        : null,
    };
  }

  private currentBlastDamage(): number {
    const waveMult = 1 + Math.max(0, this.waveSystem.diagnostics.wave) * Balance.blast.dmgPerWave;
    return Balance.blast.damage * this.blastDamageMult * waveMult;
  }

  private dropCarrierGold(position: THREE.Vector3): void {
    const carrier = this.carrierAt(position);
    const amount = carrier?.releaseCarriedGold() ?? 0;
    if (amount > 0) this.goldPickups.spawn(position, amount);
  }

  private carrierAt(position: THREE.Vector3): ClaimJumperEnemy | null {
    for (const enemy of this.enemies.all) {
      if (!enemy.isAlive || enemy.carriedAmount <= 0) continue;
      const dx = enemy.position.x - position.x;
      const dz = enemy.position.z - position.z;
      if (dx * dx + dz * dz <= 0.01) return enemy;
    }
    return null;
  }

  private reclaimGold(position: THREE.Vector3, amount: number, actor: 'player' | 'prospector' = 'player'): void {
    const reclaimed = this.reclaimAmount(amount);
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at: this.timeAlive,
      type: 'gold_reclaimed',
      amount: reclaimed,
      ...(actor === 'prospector' ? { actor } : {}),
    });
    if (!result.ok) return;
    this.reclaimedTotal += reclaimed;
    if (Balance.charm.coinTick > 0) this.audio.playCoin();
    if (this.hasBuiltStockpile()) this.audio.play('stockpile-deposit', 0.8);
    this.vfx.floatText(position, `+${reclaimed}`, '#c4883a');
  }

  private reclaimAmount(amount: number): number {
    const bonus = this.hasBuiltStockpile() ? Balance.steal.reclaimStockpileBonus : 0;
    return Math.ceil(amount * (1 + Math.max(0, bonus)));
  }

  private blockedGoldPickup(position: THREE.Vector3): void {
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'gold_capped', amount: 0 });
    this.vfx.floatText(position, 'Vault full!', '#a0522d');
  }

  private syncHeroVisualHeight(): void {
    for (const actor of this.actors) {
      actor.group.position.y = Terrain.visualY(actor.group.position.x, actor.group.position.z, this.heroStart.y);
    }
  }

  private resolveProspectorReceiptPoint(receipt: ToolReceipt): ProspectorPoint | null {
    const args = receipt.args as {
      node?: unknown;
      building?: { id?: unknown; index?: unknown };
      thief?: { id?: unknown; index?: unknown };
      pos?: unknown;
    };

    if (receipt.tool === 'et.goldrush.pan_at') {
      const node = typeof args.node === 'string' ? args.node : '';
      const exact = this.harvestSnapshot.activeNodes.find((entry) => entry.id === node);
      if (exact) return exact.position;
      const oneBased = Number(node.match(/\d+/)?.[0] ?? 0) - 1;
      return this.harvestSnapshot.activeNodes[oneBased]?.position ?? null;
    }

    if (receipt.tool === 'et.goldrush.place_building') return pointFromUnknown(args.pos);

    if (receipt.tool === 'et.goldrush.repair') {
      const id = typeof args.building?.id === 'string' ? args.building.id : '';
      const index = typeof args.building?.index === 'number' ? args.building.index : undefined;
      const target = this.buildSystem.diagnostics.hp.find(
        (entry) => entry.id === id && (index === undefined || entry.index === index),
      );
      return target?.position ?? null;
    }

    if (receipt.tool === 'et.goldrush.chase_mark') {
      const ref = args.thief;
      const id = typeof ref?.id === 'number' ? ref.id : undefined;
      const index = typeof ref?.index === 'number' ? ref.index : undefined;
      const target = this.enemies.all.find(
        (enemy, enemyIndex) => enemy.isAlive && (enemy.id === id || enemyIndex === index),
      );
      return target ? { x: target.position.x, z: target.position.z } : null;
    }

    if (receipt.tool === 'et.goldrush.collect_xp' && receipt.outcome.ok) {
      const result = receipt.outcome.result as { agentPath?: unknown[] } | undefined;
      return pointFromUnknown(result?.agentPath?.at(-1));
    }

    if (receipt.tool === 'et.goldrush.collect_gold' && receipt.outcome.ok) {
      const result = receipt.outcome.result as { agentPath?: unknown[] } | undefined;
      return pointFromUnknown(result?.agentPath?.at(-1));
    }

    return null;
  }

  private stealDiagnostics(): {
    thieves: number;
    fleeing: number;
    carriedTotal: number;
    stolenTotal: number;
    reclaimedTotal: number;
    pickups: number;
    pickupTotal: number;
  } {
    let thieves = 0;
    let fleeing = 0;
    let carriedTotal = 0;
    for (const enemy of this.enemies.all) {
      if (!enemy.isAlive || !enemy.isThief) continue;
      thieves += 1;
      if (enemy.isFleeingWithGold) fleeing += 1;
      carriedTotal += enemy.carriedAmount;
    }
    return {
      thieves,
      fleeing,
      carriedTotal,
      stolenTotal: this.stolenTotal,
      reclaimedTotal: this.reclaimedTotal,
      pickups: this.goldPickups.activeCount,
      pickupTotal: this.goldPickups.totalAmount,
    };
  }

  private liveThiefCount(): number {
    let thieves = 0;
    for (const enemy of this.enemies.all) {
      if (enemy.isAlive && enemy.isThief) thieves += 1;
    }
    return thieves;
  }

  private wreckDiagnostics(): {
    wreckers: number;
    swinging: number;
    gnawing: number;
    stuckWatchdogTrips: number;
    ruins: number;
    hitsResolved: number;
    wrecked: number;
    repairs: number;
    repairGold: number;
  } {
    let wreckers = 0;
    let swinging = 0;
    let gnawing = 0;
    let stuckWatchdogTrips = 0;
    for (const enemy of this.enemies.all) {
      if (!enemy.isAlive) continue;
      stuckWatchdogTrips += enemy.stuckWatchdogTrips;
      if (enemy.isGnawing) gnawing += 1;
      if (enemy.isWrecker) {
        wreckers += 1;
        if (enemy.wreckState === 'swinging') swinging += 1;
      }
    }
    return {
      wreckers,
      swinging,
      gnawing,
      stuckWatchdogTrips,
      ruins: this.buildSystem.ruinCount,
      hitsResolved: this.buildingHitsResolved,
      wrecked: this.buildingsWrecked,
      repairs: this.buildSystem.diagnostics.repairs,
      repairGold: this.buildSystem.diagnostics.repairGold,
    };
  }

  private spawnDebugPack(
    count: number = Balance.enemy.debugPackSize,
    radius: number = Balance.enemy.debugPackRadius,
    opts: SpawnPackOptions = {},
  ): void {
    if (isSpawnDisabled() || this.state.current !== 'playing') return;
    this.waveSystem.spawnDebugPack(count, radius, opts);
  }

  private spawnHarnessPack(
    count: number = Balance.enemy.debugPackSize,
    radius: number = Balance.enemy.debugPackRadius,
    opts: SpawnPackOptions = {},
  ): void {
    if (isSpawnDisabled() || this.state.current !== 'playing') return;
    const effectiveRadius =
      opts.speedScale === 0 ? Math.min(radius, Balance.xp.moteMagnetRadius * 0.9) : radius;
    this.spawnDebugPack(count, effectiveRadius, opts);
  }

  private spawnHarnessThief(edge?: CompassEdge): boolean {
    if (isSpawnDisabled() || this.state.current !== 'playing' || isStealDisabled()) return false;
    const radius = Math.min(14, Balance.waves.spawnRingRadius);
    const x = this.localActor.group.position.x;
    const z = this.localActor.group.position.z;
    if (edge === 'south') this.debugSpawnPosition.set(x, Balance.enemy.groundY, z - radius);
    else if (edge === 'east') this.debugSpawnPosition.set(x + radius, Balance.enemy.groundY, z);
    else if (edge === 'west') this.debugSpawnPosition.set(x - radius, Balance.enemy.groundY, z);
    else this.debugSpawnPosition.set(x, Balance.enemy.groundY, z + radius);
    this.debugSpawnPosition.x = Math.max(-38, Math.min(38, this.debugSpawnPosition.x));
    this.debugSpawnPosition.z = Math.max(-38, Math.min(38, this.debugSpawnPosition.z));
    return this.enemies.spawn(this.debugSpawnPosition, { edge, thief: true }) !== null;
  }

  private spawnHarnessWrecker(edge?: CompassEdge): boolean {
    if (isSpawnDisabled() || this.state.current !== 'playing' || isWreckDisabled()) return false;
    const radius = Math.min(14, Balance.waves.spawnRingRadius);
    const x = this.localActor.group.position.x;
    const z = this.localActor.group.position.z;
    if (edge === 'south') this.debugSpawnPosition.set(x, Balance.enemy.groundY, z - radius);
    else if (edge === 'east') this.debugSpawnPosition.set(x + radius, Balance.enemy.groundY, z);
    else if (edge === 'west') this.debugSpawnPosition.set(x - radius, Balance.enemy.groundY, z);
    else this.debugSpawnPosition.set(x, Balance.enemy.groundY, z + radius);
    this.debugSpawnPosition.x = Math.max(-38, Math.min(38, this.debugSpawnPosition.x));
    this.debugSpawnPosition.z = Math.max(-38, Math.min(38, this.debugSpawnPosition.z));
    return this.enemies.spawn(this.debugSpawnPosition, { edge, wrecker: true }) !== null;
  }

  private wreckHarnessBuilding(family: BuildableId, index: number): boolean {
    const target = this.buildSystem.buildingTarget(family, index);
    if (!target || target.hp <= 0) return false;
    this.combat.setTime(this.timeAlive);
    this.combat.damageBuilding(target, this.buildSystem.remainingHp(family, index), -1);
    return true;
  }

  private toggleBuildMenu(): void {
    if (this.buildMenuOpen || this.buildSystem.isBuildMode) {
      this.closeBuildMenu();
      return;
    }
    this.buildMenuOpen = true;
    this.buildSystem.setBuildMode(true);
  }

  private closeBuildMenu(): void {
    this.buildMenuOpen = false;
    this.buildSystem.setBuildMode(false);
  }

  /** Outside-pointerdown folds the menu UI but keeps placement mode: the pointerdown
   * fires before the canvas 'click', so exiting mode here would eat every mouse placement. */
  private collapseBuildMenu(): void {
    this.buildMenuOpen = false;
  }

  private confirmAction(): void {
    if (this.buildSystem.isBuildMode) {
      const id = this.buildSystem.diagnostics.selectedBuildable;
      this.updateActionActorPosition();
      if (this.buildSystem.confirm(this.timeAlive)) discoverLedgerBuildable(id);
      return;
    }
    if (this.buildSystem.assayOfficeInRange(this.actionActor.group.position)) {
      this.audio.play('ledger-open');
      this.openAssayBench?.();
      return;
    }
    if (this.fundMegaprojectStage(this.actionActor.group.position)) return;
    this.confirmDemolish();
  }

  private confirmUpgrade(): boolean {
    const candidate = this.upgradeCandidate;
    if (!candidate) return false;
    const upgraded = this.upgradeBuilding(candidate.id, candidate.index);
    if (upgraded) {
      this.upgradeCandidate = null;
      this.demolishCandidate = null;
      this.buildingContextPrompt.update(null, null, false);
    }
    return upgraded;
  }

  private confirmDemolish(): boolean {
    const candidate = this.demolishCandidate;
    if (!candidate) return false;
    const removed = this.demolishBuilding(candidate.id, candidate.index);
    if (removed) {
      this.demolishCandidate = null;
      this.demolishSuppressedKey = null;
      this.upgradeCandidate = null;
      this.buildingContextPrompt.update(null, null, false);
    }
    return removed;
  }

  private cancelInteractionPrompts(): void {
    if (this.demolishCandidate) this.demolishSuppressedKey = demolishKey(this.demolishCandidate);
    this.upgradeCandidate = null;
    this.demolishCandidate = null;
    this.buildingContextPrompt.update(null, null, false);
  }

  private upgradeBuilding(id: BuildableId, index: number): boolean {
    const upgraded = this.buildSystem.upgradeBuilding(id, index, this.timeAlive, this.actionActor.group.position);
    if (!upgraded) return false;
    this.syncStockpileHoldings();
    this.publishDiagnostics();
    return true;
  }

  private demolishBuilding(id: BuildableId, index: number): boolean {
    const removed = this.buildSystem.demolish(id, index, this.timeAlive, this.actionActor.group.position);
    if (!removed) return false;
    this.syncStockpileHoldings();
    this.publishDiagnostics();
    return true;
  }

  private selectBuildable(id: string): boolean {
    return this.buildSystem.selectBuildable(id, true);
  }

  private selectBuildableByIndex(index: number): void {
    const snapshot = this.buildSystem.buildableSnapshots[index];
    if (snapshot) this.selectBuildable(snapshot.id);
  }

  private applyStats(stats: EffectiveStats, pickedId: UpgradeId | null): void {
    for (const shooter of this.heroShooters) {
      shooter.cooldown = 1 / (Balance.sparkRig.fireRate * stats.fireRateMult);
      shooter.damage = Balance.sparkRig.damage * stats.damageMult;
      shooter.range = Balance.sparkRig.range * stats.rangeMult;
      shooter.projSpeed = Balance.sparkRig.boltSpeed * stats.boltSpeedMult;
      shooter.volley = Balance.sparkRig.volley + stats.volleyBonus;
    }
    this.blastDamageMult = stats.blastDamageMult;
    this.blastRadiusMult = stats.blastRadiusMult;
    this.blastCooldownMult = stats.blastCooldownMult;
    const blastRadius = Balance.blast.radius * this.blastRadiusMult;
    for (const shooter of this.blastShooters) {
      shooter.cooldown = Math.max(0.35, Balance.blast.cooldown * this.blastCooldownMult);
      if (shooter.aoe) shooter.aoe.radius = blastRadius;
    }
    this.syncBlastReticleRadius(blastRadius);
    for (const actor of this.actors) actor.applyStats(stats.maxHpBonus, stats.moveSpeedMult);
    const platingHeal = upgradeDefById.tinkers_plating.deltas.heal;
    if (pickedId === 'tinkers_plating' && platingHeal !== undefined) {
      for (const actor of this.actors) actor.heal(platingHeal);
    }
    const continued = continuedStudyBonuses(this.researchState);
    this.applyHarvestStats();
    this.buildSystem.applyStats(stats.beaconFireRateMult, 1 + continued.turretDamageMult);
    this.agentPolicySlotBonus = Math.max(0, Math.floor(stats.agentPolicySlots));
    this.applyUpgradeCapEffects(stats);
    this.applyResearchEffects();
  }

  private applyHarvestStats(autoPanMult = 1): void {
    const snapshot = this.progression.snapshot;
    const stats = snapshot.stats;
    const autoPanDelta = (snapshot.stacks.auto_pan ?? 0) > 0 ? Balance.steamworksArsenal.autoPan.panTickMult : 0;
    const continued = continuedStudyBonuses(this.researchState);
    this.harvestSystem.applyStats(
      stats.panTickMult - autoPanDelta + (autoPanMult - 1),
      stats.seamCapacityBonus,
      stats.seamRespawnReduction,
      (1 + continued.seamYieldMult) * this.contractSeamYieldMult(),
    );
  }

  private contractSeamYieldMult(): number {
    if (this.activeContract.id === 'e1-dry-gulch') return Balance.contracts.dryGulch.seamYieldMult;
    return Math.max(0.1, this.activeContract.twist.seamYieldMult ?? 1);
  }

  private applyUpgradeCapEffects(stats: EffectiveStats): void {
    if (stats.stockpileCapBonus > 0) {
      this.economy.addCapSource('upgrade:stockpile_cap', stats.stockpileCapBonus);
    } else {
      this.economy.removeCapSource('upgrade:stockpile_cap');
    }
  }

  private applyResearchEffects(): void {
    const stacks = this.progression.snapshot.stacks;
    const prospectingStacks = upgradeDefs.reduce((total, def) => {
      if (def.iconFamily !== 'prospecting' || def.deltas.seamCapacityBonus === undefined) return total;
      return total + (stacks[def.id] ?? 0);
    }, 0);
    const capBonus = hasResearchNode(this.researchState, 'assay_grading')
      ? prospectingStacks * Balance.research.assayGradingStockpileCapBonus
      : 0;
    const continuedCapBonus = continuedStudyBonuses(this.researchState).stockpileCapBonus;
    const totalCapBonus = capBonus + continuedCapBonus;
    if (totalCapBonus > 0) {
      this.economy.addCapSource('research:assay_grading', totalCapBonus);
    } else {
      this.economy.removeCapSource('research:assay_grading');
    }
  }

  private researchUnlockFlags(): ResearchUnlockFlags {
    return { rocketCartCaptured: hasRocketCartCaptured() };
  }

  private researchOverlayOptions(totalRounds: number): DeathOverlayOptions {
    this.researchState = loadResearchState(this.researchStorage, this.researchStorage, this.researchUnlockFlags());
    let roundsRemaining = Math.max(0, totalRounds);
    const state = (): DeathResearchState => ({
      totalRounds,
      roundsRemaining,
      science: scienceMeter(this.researchState, this.stampMillBuildStarted() ? 'building' : 'awaiting-town'),
      proposals: roundsRemaining > 0 ? availablePicks(this.researchState) : [],
      pinnedPath: pinnedResearchPath(this.researchState),
    });
    const applyPick = (id: string): DeathResearchState => {
      if (roundsRemaining <= 0) return state();
      const next = takeNode(this.researchState, id);
      if (next !== this.researchState) {
        this.researchState = saveResearchState(this.researchStorage, next);
        this.audio.play('research-pick');
        roundsRemaining = Math.max(0, roundsRemaining - 1);
        this.applyResearchEffects();
        this.syncMegaprojectSite();
        this.emitScienceCompleteIfReady();
        this.publishDiagnostics();
      }
      return state();
    };
    const applySkip = (): DeathResearchState => {
      if (roundsRemaining <= 0) return state();
      this.researchState = saveResearchState(this.researchStorage, skipResearchPick(this.researchState));
      roundsRemaining = 0;
      this.publishDiagnostics();
      return state();
    };
    this.mpResearchActionHandlers.pick = applyPick;
    this.mpResearchActionHandlers.skip = applySkip;

    return {
      research: state(),
      onResearchPick: (id) => {
        if (this.mpClient) {
          this.mpQueuedActions.push({ type: 'research_pick', id });
          return state();
        }
        return applyPick(id);
      },
      onResearchSkip: () => {
        if (this.mpClient) {
          this.mpQueuedActions.push({ type: 'research_skip' });
          return state();
        }
        return applySkip();
      },
    };
  }

  private takeResearchNodeForTest(id: string): boolean {
    this.researchState = loadResearchState(this.researchStorage, this.researchStorage, this.researchUnlockFlags());
    for (let guard = 0; guard < 8 && !availablePicks(this.researchState).some((node) => node.id === id); guard += 1) {
      this.researchState = skipResearchPick(this.researchState);
    }
    const next = takeNode(this.researchState, id);
    if (next === this.researchState) return false;
    this.researchState = saveResearchState(this.researchStorage, next);
    this.applyResearchEffects();
    this.syncMegaprojectSite();
    this.emitScienceCompleteIfReady();
    this.publishDiagnostics();
    return true;
  }

  private emitScienceCompleteIfReady(): void {
    if (scienceMeter(this.researchState).complete) emitStorySignal({ type: 'science-complete' });
  }

  private researchDiagnostics(): {
    taken: string[];
    available: string[];
    steps: number;
    remaining: number;
    threshold: number;
    overflow: number;
    meter: string;
    continued: ReturnType<typeof continuedStudyBonuses>;
    assayOrderSlots: number;
    contractTier: number;
    pinnedTarget: string | null;
  } {
    const meter = scienceMeter(this.researchState, this.stampMillBuildStarted() ? 'building' : 'awaiting-town');
    return {
      taken: [...this.researchState.taken],
      available: availablePicks(this.researchState).map((node) => node.id),
      steps: meter.steps,
      remaining: meter.remaining,
      threshold: meter.threshold,
      overflow: meter.overflow,
      meter: meter.text,
      continued: continuedStudyBonuses(this.researchState),
      assayOrderSlots: hasResearchNode(this.researchState, 'second_order_slot') ? Balance.research.secondOrderSlots : 1,
      contractTier: contractTierForResearch(this.researchState),
      pinnedTarget: this.researchState.pinnedTarget,
    };
  }

  private showRunStartMetaRecap(): void {
    this.hud.showMetaRecap(runStartMetaRecap(this.metaProgressForPresence(), this.researchState, readTownName(), this.activeContract), 4);
  }

  private showContractBriefing(): void {
    this.hud.showContractBriefing(this.contractBriefingSnapshot());
  }

  private flushRunStartMetaRecap(): void {
    if (!this.runStartMetaRecapPending) return;
    this.runStartMetaRecapPending = false;
    this.showRunStartMetaRecap();
  }

  private pauseMetaSnapshot(): PauseMetaSnapshot {
    const meter = scienceMeter(this.researchState);
    return {
      save: this.runSuspendSaveLine,
      manualSave: this.manualSaveSnapshot(),
      contract: this.contractBriefingSnapshot(),
      science: `Science: ${meter.steps}/${meter.threshold} steps; banked +${meter.overflow}`,
      territory: territoryPauseLine(this.metaProgressForPresence()),
      boons: activeResearchBoons(this.researchState).map(({ name, effect }) => ({ name, effect })),
      mastery: this.masteryProgressLines(),
    };
  }

  onRunSuspendWrite(write: RunSuspendWrite): void {
    this.runSuspendSaveLine = runSuspendSavedLine(write.wave);
    this.hud.showMetaRecap(`Wave ${write.wave} ledgered ✓`, 2);
  }

  private manualSaveSnapshot(): PauseMetaSnapshot['manualSave'] {
    const snapshot = readRunSuspend();
    if (!snapshot || snapshot.contractId !== this.activeContract.id) {
      return {
        canSave: false,
        defaultName: '',
        message: this.manualSaveMessage || "Manual saves unlock after a wave's end.",
        open: this.manualSaveMessage !== '',
      };
    }
    const warning = formatBudgetWarning(saveSlotsBudget());
    return {
      canSave: true,
      defaultName: defaultSaveSlotName(snapshot, readTownName()),
      message: this.manualSaveMessage || warning || `Last completed wave ready: ${snapshot.wave}.`,
      open: this.manualSaveMessage !== '',
    };
  }

  private saveManualClaim(name: string): void {
    const snapshot = readRunSuspend();
    if (!snapshot || snapshot.contractId !== this.activeContract.id) {
      this.manualSaveMessage = "Finish a wave first; the ledger only pins completed-wave states.";
      this.syncUi();
      return;
    }
    const result = saveManualSlot({
      name,
      snapshot,
      contractName: this.activeContract.name,
      townName: readTownName(),
    });
    if (result.ok) {
      const warning = formatBudgetWarning(result.budget);
      this.manualSaveMessage = warning ? `${result.message} ${warning}` : result.message;
      this.hud.showMetaRecap(result.message, 2.4);
    } else {
      this.manualSaveMessage = result.message;
    }
    this.syncUi();
    this.publishDiagnostics();
  }

  private contractBriefingSnapshot(): ContractBriefingSnapshot {
    return {
      name: this.activeContract.name,
      goals: this.activeContract.briefing.goals,
      rules: this.activeContract.briefing.rules,
      geographyLine: this.activeContract.briefing.geographyLine,
    };
  }

  private metaProgressForPresence(): MetaProgress {
    return this.appliedMetaProgress;
  }

  private masteryProgressLines(): PauseMetaSnapshot['mastery'] {
    const stacks = this.progression.snapshot.stacks;
    const hasNode = (id: string) => hasResearchNode(this.researchState, id);
    return replayEpoch.masteryConversions
      .map((rule) => {
        const family = upgradeDefs.filter(
          (def) =>
            upgradeFamilyId(def) === rule.whenFamilyMaxed &&
            isUpgradeUnlocked(def, hasNode) &&
            Number.isFinite(def.maxStacks),
        );
        const total = family.reduce((sum, def) => sum + def.maxStacks, 0);
        if (total <= 0) return null;
        const current = family.reduce((sum, def) => sum + Math.min(stacks[def.id] ?? 0, def.maxStacks), 0);
        const offers = rule.offers.map((id) => upgradeDefById[id]?.name ?? id).join(', ');
        return {
          name: `${familyName(rule.whenFamilyMaxed)} mastery`,
          effect: `${current}/${total} stacks toward ${offers}`,
        };
      })
      .filter((line): line is { name: string; effect: string } => line !== null);
  }

  private upgradeProvenance(def: UpgradeDef, effect: string): { label: string; line: string } | undefined {
    const lines: string[] = [];
    let label: string | undefined;
    if (def.familyGate && hasResearchNode(this.researchState, def.familyGate)) {
      const node = researchNodeById[def.familyGate];
      if (node) {
        label = `${node.name} earned`;
        lines.push(`${node.name} opened ${def.name}${effect ? ` - ${effect}.` : '.'}`);
      }
    }
    if (def.iconFamily === 'prospecting' && hasResearchNode(this.researchState, 'assay_grading')) {
      label ??= 'Assay Grading earned';
      lines.push(
        `Assay Grading raised Prospecting - +${Balance.research.assayGradingStockpileCapBonus} stockpile cap rides seam cards.`,
      );
    }
    return lines.length > 0 ? { label: label ?? 'Research earned', line: lines.join(' ') } : undefined;
  }

  private syncBlastReticleRadius(radius: number): void {
    const nextRadius = Math.max(0.1, radius);
    if (Math.abs(this.blastAimReticleRadius - nextRadius) < 0.001) return;
    const previousGeometry = this.blastAimReticle.geometry;
    this.blastAimReticle.geometry = new THREE.RingGeometry(nextRadius * 0.88, nextRadius, 40);
    previousGeometry.dispose();
    this.blastAimReticleRadius = nextRadius;
  }

  private syncUpgradeOverlay(): void {
    const offer = this.progression.offer;
    if (this.state.current !== 'levelup' || !offer) {
      this.upgradeOverlay.hide();
      this.lastUpgradeOfferAudioKey = '';
      return;
    }
    const offerKey = offer.map((def) => def.id).join('|');
    if (offerKey !== this.lastUpgradeOfferAudioKey) {
      this.audio.play('tier-up');
      this.lastUpgradeOfferAudioKey = offerKey;
    }
    const stacks = this.progression.snapshot.stacks;
    this.upgradeOverlay.show(
      offer.map((def) => {
        const effect =
          'filler' in def && def.filler === true
            ? resolveFiller(def, { wave: this.waveSystem.diagnostics.wave, maxHp: this.primaryActor.maxHp }).effectText
            : upgradeEffect(def);
        return {
          def,
          familyStacks: upgradeDefs.reduce(
            (total, upgrade) => total + (upgrade.iconFamily === def.iconFamily ? (stacks[upgrade.id] ?? 0) : 0),
            0,
          ),
          effect,
          provenance: this.upgradeProvenance(def, effect),
        };
      }),
    );
  }

  private assertActorMode(): void {
    if (Balance.actors.enabled) throw new Error('Balance.actors.enabled is reserved for the M6 multi-actor follow-up.');
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }
}

type InterpolatedLightRamp = LightRigRampPalette & { phase: NightShiftPhase | 'golden'; darkness: number };

const lightRampColors = new Map<string, THREE.Color>();
const interpolatedLightRamp: InterpolatedLightRamp = {
  phase: 'full',
  darkness: 0,
  background: new THREE.Color(),
  fog: new THREE.Color(),
  sun: new THREE.Color(),
  sunIntensity: 0,
  fill: new THREE.Color(),
  ground: new THREE.Color(),
  fillIntensity: 0,
  sunHeight: 0,
  spriteTint: new THREE.Color(),
};

function lightRampColor(value: string): THREE.Color {
  let color = lightRampColors.get(value);
  if (!color) {
    color = new THREE.Color(value);
    lightRampColors.set(value, color);
  }
  return color;
}

function lightRampPalette(keyframes: readonly ContractLightKeyframe[], wave: number, loop = false): InterpolatedLightRamp {
  const first = keyframes[0]!;
  const last = keyframes.at(-1)!;
  if (loop && wave > last.wave) {
    const t = THREE.MathUtils.clamp((wave - last.wave) / Math.max(0.001, last.wave - first.wave), 0, 1);
    interpolateLightRamp(last, first, t, 'dawn');
    return interpolatedLightRamp;
  }
  const clampedWave = THREE.MathUtils.clamp(wave, first.wave, last.wave);
  const nextIndex = Math.max(1, keyframes.findIndex((keyframe) => keyframe.wave >= clampedWave));
  const next = keyframes[nextIndex]!;
  const previous = keyframes[nextIndex - 1]!;
  const t = THREE.MathUtils.clamp((clampedWave - previous.wave) / Math.max(0.001, next.wave - previous.wave), 0, 1);
  interpolateLightRamp(previous, next, t, clampedWave === next.wave ? next.phase : previous.phase);
  return interpolatedLightRamp;
}

function interpolateLightRamp(
  previous: ContractLightKeyframe,
  next: ContractLightKeyframe,
  t: number,
  phase: NightShiftPhase | ContractLightKeyframe['phase'],
): void {
  interpolatedLightRamp.phase = phase;
  interpolatedLightRamp.darkness = THREE.MathUtils.lerp(previous.darkness, next.darkness, t);
  interpolatedLightRamp.background.copy(lightRampColor(previous.background)).lerp(lightRampColor(next.background), t);
  interpolatedLightRamp.fog.copy(lightRampColor(previous.fog)).lerp(lightRampColor(next.fog), t);
  interpolatedLightRamp.sun.copy(lightRampColor(previous.sun)).lerp(lightRampColor(next.sun), t);
  interpolatedLightRamp.sunIntensity = THREE.MathUtils.lerp(previous.sunIntensity, next.sunIntensity, t);
  interpolatedLightRamp.fill.copy(lightRampColor(previous.fill)).lerp(lightRampColor(next.fill), t);
  interpolatedLightRamp.ground.copy(lightRampColor(previous.ground)).lerp(lightRampColor(next.ground), t);
  interpolatedLightRamp.fillIntensity = THREE.MathUtils.lerp(previous.fillIntensity, next.fillIntensity, t);
  interpolatedLightRamp.sunHeight = THREE.MathUtils.lerp(previous.sunHeight, next.sunHeight, t);
  interpolatedLightRamp.spriteTint.copy(lightRampColor(previous.spriteTint)).lerp(lightRampColor(next.spriteTint), t);
}

function createDayNightCycle(contract: ContractManifest): DayNightCycle | null {
  const params = new URLSearchParams(window.location.search);
  const config = contract.twist.dayNightCycle ?? (params.has('debug') && params.has('daynight') ? DEBUG_DAY_NIGHT_CONFIG : null);
  return config ? new DayNightCycle(config) : null;
}

function contractPowerDefinition(contractId: string, grid: ContractPowerGrid): PowerGraphDefinition {
  return {
    id: `${contractId}-grid`,
    nodes: grid.nodes.map((node) => node.kind === 'producer'
      ? { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: true, outputWatts: node.outputWatts }
      : node.kind === 'relay'
        ? { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: false }
        : node.kind === 'storage'
          ? { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: false, capacityWh: node.capacityWh, chargeWatts: node.chargeWatts, dischargeWatts: node.dischargeWatts }
          : { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: node.role !== 'crawler-drain', drawWatts: node.drawWatts, priority: node.priority }),
    wires: grid.wires.map((wire) => ({ ...wire, state: 'intact' })),
  };
}

function createPylonSiteMarkers(contract: ContractManifest): THREE.Group | null {
  const sites = contract.tileParams.pylonSites;
  if (!sites?.length) return null;
  const group = new THREE.Group();
  group.name = 'PowerPylonSites';
  const ringGeometry = new THREE.RingGeometry(1.8, 2.35, 24);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#5ea6a0', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
  const postGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1.1, 6);
  const postMaterial = new THREE.MeshStandardMaterial({ color: '#b98545', emissive: '#39756f', emissiveIntensity: 0.35, roughness: 0.65 });
  for (const site of sites) {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.name = `PylonSite.${site.id}`;
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(site.x, Terrain.visualY(site.x, site.z, 0.035), site.z);
    ring.renderOrder = RenderLayers.groundDecals;
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(site.x, Terrain.visualY(site.x, site.z, 0.55), site.z);
    group.add(ring, post);
  }
  return group;
}

function createRidgeGlow(contract: ContractManifest): THREE.Group | null {
  const glow = contract.tileParams.ridgeGlow;
  if (!glow) return null;
  const group = new THREE.Group();
  group.name = 'BlackoutRidgeOffMapGlow';
  const material = new THREE.MeshBasicMaterial({ color: glow.color, transparent: true, opacity: 0.32, depthWrite: false });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(4.5, 18, 12), material);
  halo.position.set(glow.x, Terrain.visualY(glow.x, glow.z, 4), glow.z);
  halo.renderOrder = RenderLayers.worldUi - 1;
  const light = new THREE.PointLight(glow.color, glow.intensity, 26, 2);
  light.position.copy(halo.position);
  group.add(halo, light);
  return group;
}

type MetaPresenceLine = { name: string; effect: string; recap: string };

function runStartMetaRecap(meta: MetaProgress, research: ResearchState, townName: string | null, contract: ContractManifest): string | null {
  const items: string[] = [];
  if (contract.id === 'e1-baron') items.push("The Baron's outfit rides at 20 — cadence runs hot (+15%).");
  if (meta.tracks.territory >= Balance.meta.territoryTier1) {
    items.push(`palisade ring (Territory ${romanNumeral(meta.tracks.territory)})`);
  }
  for (const boon of activeResearchBoons(research)) items.push(boon.recap);
  const prefix = townName ? `${townName} remembers` : 'Your claim remembers';
  return items.length > 0 ? `${prefix}: ${items.slice(0, 3).join(' | ')}` : null;
}

function runSuspendPauseLine(contractId: string): string {
  const saved = readRunSuspend();
  return saved?.contractId === contractId ? runSuspendSavedLine(saved.wave) : runSuspendEmptyLine();
}

function runSuspendSavedLine(wave: number): string {
  return `📒 Ledger saved at wave ${wave} — closing the tab keeps your place.`;
}

function runSuspendEmptyLine(): string {
  return "The ledger saves at each wave's end.";
}

function territoryPauseLine(meta: MetaProgress): string {
  if (meta.tracks.territory >= Balance.meta.territoryTier1) {
    return `Territory ${romanNumeral(meta.tracks.territory)}: palisade ring active (${Balance.meta.territoryRing.length} segments)`;
  }
  return `Territory 0/${Balance.meta.territoryTier1}: palisade ring not earned`;
}

function activeResearchBoons(state: ResearchState): MetaPresenceLine[] {
  const lines: MetaPresenceLine[] = [];
  for (const id of state.taken) {
    const node = researchNodeById[id];
    if (!node?.live) continue;
    lines.push({ name: node.name, effect: node.effect, recap: researchRecap(id) });
  }
  const continued = continuedStudyBonuses(state);
  if (continued.seamYieldMult > 0) {
    const percent = percentBonus(continued.seamYieldMult);
    lines.push({
      name: 'Continued Study: Seam Yield',
      effect: `+${percent}% seam panning yield.`,
      recap: `+${percent}% seam yield (Continued Study)`,
    });
  }
  if (continued.turretDamageMult > 0) {
    const percent = percentBonus(continued.turretDamageMult);
    lines.push({
      name: 'Continued Study: Turret Damage',
      effect: `+${percent}% turret spark damage.`,
      recap: `+${percent}% turret damage (Continued Study)`,
    });
  }
  if (continued.stockpileCapBonus > 0) {
    lines.push({
      name: 'Continued Study: Stockpile Ledger',
      effect: `+${continued.stockpileCapBonus} stockpile cap.`,
      recap: `+${continued.stockpileCapBonus} stockpile cap (Continued Study)`,
    });
  }
  return lines;
}

function researchRecap(id: string): string {
  if (id === 'assay_grading') {
    return `Prospecting cards +${Balance.research.assayGradingStockpileCapBonus} cap/stack (Assay Grading)`;
  }
  if (id === 'chain_spark_primer') return 'Chain Spark Arc (Chain Spark Primer +12%)';
  if (id === 'beacon_cadence') return 'Beacon Handoff (Beacon Cadence +18%)';
  if (id === 'pact_ledger') return 'Rich Seam Pact (Pact Ledger +18 seam gold)';
  if (id === 'second_order_slot') return `+${Balance.research.secondOrderSlots - 1} order slot (Second Order Slot)`;
  if (id === 'refined_assay') return 'tier 2 orders (Refined Assay +20%)';
  if (id === 'pattern_library') return '2 crafted offers (Pattern Library)';
  if (id === 'agent_schooling') return 'Agent Schooling card after wave 15 (+1 policy slot)';
  return researchNodeById[id]?.name ?? id;
}

function familyName(id: string): string {
  if (id === 'firerate') return 'Firerate';
  if (id === 'prospecting') return 'Prospecting';
  return id.replace(/_/g, ' ');
}

function romanNumeral(value: number): string {
  const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const whole = Math.max(0, Math.floor(value));
  return numerals[whole] ?? String(whole);
}

function percentBonus(value: number): number {
  return Math.round(value * 100);
}

function cloneMetaProgress(meta: MetaProgress): MetaProgress {
  return { version: 1, tracks: { ...meta.tracks } };
}

function legacySpawnPackOptions(count: number, radius?: number): SpawnPackOptions | undefined {
  return count === 5 && radius === 3 ? { speedScale: 0 } : undefined;
}

function demolishKey(candidate: DemolishCandidate): string {
  return `${candidate.id}:${candidate.index}`;
}

function buildingInfoClass(id: BuildableId): WorldInfoObjectClass {
  return id;
}

function edgeFromPosition(position: THREE.Vector3): CompassEdge {
  return Math.abs(position.x) > Math.abs(position.z) ? (position.x >= 0 ? 'east' : 'west') : position.z >= 0 ? 'north' : 'south';
}

function contractHeroStart(contract: ContractManifest): THREE.Vector3 {
  const lossStake = contract.tileParams.stakeMarkers?.find((marker) => marker.lossCondition);
  return new THREE.Vector3(lossStake?.x ?? 0, 0.06, lossStake?.z ?? 12);
}

function multiplayerTint(index: number): string {
  return MULTIPLAYER_TINTS[index % MULTIPLAYER_TINTS.length]!;
}

function edgePlace(edge: CompassEdge): string {
  if (edge === 'north') return 'north bank';
  if (edge === 'south') return 'south bank';
  if (edge === 'east') return 'east ridge';
  return 'west ridge';
}

function bossArrivalTitle(baron?: ContractBaronTwist | null): string {
  return baron?.arrivalTitle ?? BARON_ARRIVAL_TITLE;
}

function bossTauntTitle(baron: ContractBaronTwist): string {
  return baron.tauntTitle ?? 'The Claim-Jumper Baron';
}

function bossDefeatTitle(baron: ContractBaronTwist): string {
  return baron.defeatTitle ?? BARON_DEFEAT_TITLE;
}

function bossDefeatLine(baron: ContractBaronTwist): string {
  return baron.defeatLine ?? 'The Baron is DEFEATED.';
}

function bossLedgerLabel(baron: ContractBaronTwist): string {
  return baron.ledgerLabel ?? 'THE BARON';
}

function bossSecureCallout(baron: ContractBaronTwist): string {
  return baron.secureCallout ?? '+double science';
}

function prospectorIntroAbility(level: number): string {
  if (level >= 2) return 'does trusted chores.';
  if (level >= 1) return 'can gather and mend with approval.';
  return 'follows and observes.';
}

function pointFromUnknown(value: unknown): ProspectorPoint | null {
  if (typeof value !== 'object' || value === null) return null;
  const point = value as { x?: unknown; z?: unknown };
  return typeof point.x === 'number' && Number.isFinite(point.x) && typeof point.z === 'number' && Number.isFinite(point.z)
    ? { x: point.x, z: point.z }
    : null;
}

function multiplayerActorsForRestore(
  value: unknown,
  base: RunSuspendEnvelope,
  rosterSize: number,
): MultiplayerActorSnapshot[] | null {
  if (!value || typeof value !== 'object') return null;
  const mpActors = (value as { mpActors?: unknown }).mpActors;
  if (mpActors === undefined) return null;
  if (!Array.isArray(mpActors) || mpActors.length !== rosterSize || !mpActors.every(isMultiplayerActorSnapshot)) return null;
  if (mpActors.some((actor) => !actor.visible || actor.hp < 0 || actor.hp > base.hero.maxHp)) return null;

  const primary = mpActors[0];
  if (
    !primary ||
    primary.hp !== base.hero.hp ||
    primary.iframeRemaining !== base.hero.iframeRemaining ||
    !sameFiniteVector3(primary.position, base.hero.position) ||
    !sameFiniteVector3(primary.velocity, base.hero.velocity)
  ) {
    return null;
  }
  return mpActors;
}

function isMultiplayerActorSnapshot(value: unknown): value is MultiplayerActorSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as MultiplayerActorSnapshot;
  return (
    isFiniteVector3(snapshot.position) &&
    isFiniteVector3(snapshot.velocity) &&
    typeof snapshot.hp === 'number' &&
    Number.isFinite(snapshot.hp) &&
    typeof snapshot.iframeRemaining === 'number' &&
    Number.isFinite(snapshot.iframeRemaining) &&
    snapshot.iframeRemaining >= 0 &&
    typeof snapshot.visible === 'boolean'
  );
}

function isFiniteVector3(value: unknown): value is { x: number; y: number; z: number } {
  if (!value || typeof value !== 'object') return false;
  const vector = value as { x?: unknown; y?: unknown; z?: unknown };
  return (
    typeof vector.x === 'number' &&
    Number.isFinite(vector.x) &&
    typeof vector.y === 'number' &&
    Number.isFinite(vector.y) &&
    typeof vector.z === 'number' &&
    Number.isFinite(vector.z)
  );
}

function sameFiniteVector3(
  left: { x: number; y: number; z: number },
  right: { x: number; y: number; z: number },
): boolean {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}

function pointFromVector(value: THREE.Vector3): ProspectorPoint {
  return { x: value.x, z: value.z };
}

function distanceSq2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function planarHashState(value: unknown): unknown {
  // Lockstep is planar; suspend snapshots retain y only for restore and rendering.
  if (Array.isArray(value)) return value.map(planarHashState);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== 'y')
      .map(([key, nested]) => [key, planarHashState(nested)]),
  );
}

function distanceSqToBuildingPoint(point: THREE.Vector3, building: Pick<BuildingTarget, 'position' | 'halfX' | 'halfZ'>): number {
  const dx = Math.max(Math.abs(point.x - building.position.x) - building.halfX, 0);
  const dz = Math.max(Math.abs(point.z - building.position.z) - building.halfZ, 0);
  return dx * dx + dz * dz;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function buildableIdFromString(value: string): BuildableId | null {
  return buildableDefs.some((def) => def.id === value) ? (value as BuildableId) : null;
}

function buildingNeedsRepair(entry: { hp: number; maxHp: number; wrecked: boolean }): boolean {
  return entry.maxHp > 0 && (entry.wrecked || (entry.hp > 0 && entry.hp < entry.maxHp));
}

function browserMegaprojectStorage(): MegaprojectStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

function isDevPowerGraphEnabled(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('debug') && (params.has('powergraph') || params.has('tram') || params.get('power') === 'dev');
}

function isDevTramEnabled(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('debug') && params.has('tram');
}

function isDevVehiclesEnabled(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('debug') && params.has('vehicles');
}

function createMegaprojectPlaqueTexture(lines: readonly string[]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  drawMegaprojectPlaque(texture, lines);
  return texture;
}

function drawMegaprojectPlaque(texture: THREE.CanvasTexture, lines: readonly string[]): void {
  const canvas = texture.image as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#2e1b0e';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  ctx.fillStyle = '#2e1b0e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const displayLines = lines.slice(0, 3);
  for (const [index, line] of displayLines.entries()) {
    const baseSize = index === 0 ? 42 : 30;
    ctx.font = fitPlaqueFont(ctx, line, index === 0 ? 442 : 468, baseSize);
    ctx.fillText(line, canvas.width * 0.5, 52 + index * 55);
  }
  texture.needsUpdate = true;
}

function fitPlaqueFont(ctx: CanvasRenderingContext2D, line: string, maxWidth: number, baseSize: number): string {
  for (let size = baseSize; size >= 18; size -= 2) {
    const font = `700 ${size}px Georgia`;
    ctx.font = font;
    if (ctx.measureText(line).width <= maxWidth) return font;
  }
  return '700 18px Georgia';
}

function percentile(sorted: readonly number[], ratio: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
