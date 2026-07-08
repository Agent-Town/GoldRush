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
  type ContractBaronTwist,
  type ContractManifest,
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
import { loadEpoch } from '../meta/ContractFamilies';
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
import { install as installRunManager, type RunManager } from './RunManager';
import { agentAutonomyLevel, freshMetaProgress, type MetaProgress, type MetaTrack } from './MetaProgress';
import { awardBaronMedal, hasRocketCartCaptured, loadMedals } from './Medals';
import { AgentConsentStore } from '../agent/AgentConsent';
import { install as installAgentStub, type AgentStub } from '../agent/AgentStub';
import { ProspectorEmbodiment, type ProspectorPoint } from '../agent/Embodiment';
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
  isLevelUpDisabled,
  isPauseDisabled,
  isPingDisabled,
  isProfileEnabled,
  isSpawnDisabled,
  isStealDisabled,
  isWreckDisabled,
} from '../core/DebugParams';
import { InputController, type Intents } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { RenderLayers, renderLayerOf } from '../core/RenderLayers';
import { createRng } from '../core/Rng';
import { Hero } from '../entities/Hero';
import { BlastChargePool } from '../entities/BlastCharge';
import { GoldPickupPool } from '../entities/GoldPickup';
import { ProjectilePool } from '../entities/Projectile';
import { XpMotePool } from '../entities/XpMote';
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
import { DebugTools, setBalance, type DebugTuning } from '../systems/DebugTools';
import { HarvestSystem } from '../systems/HarvestSystem';
import { PowerGraphSystem, devPowerGraphDefinition, emptyPowerGraphDiagnostics } from '../systems/PowerGraph';
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
import { LightRig, type LightRigNightShiftState, type NightShiftPhase } from '../world/LightRig';
import { DetailScatter, type DetailScatterClearPoint } from '../world/Scatter';
import { readTownName } from '../town/TownNaming';
import { GameState } from './GameState';
import { Progression } from './Progression';
import { applyUpgradeBudgetsFromBalance, isUpgradeUnlocked, resolveFiller, upgradeEffect, upgradeFamilyId } from './Upgrades';
import { clearScores, recordScore } from './Scoreboard';
import type { EffectiveStats } from './StatSheet';
import { upgradeDefById, upgradeDefs, type UpgradeDef, type UpgradeId } from './Upgrades';
import { buildableDefs, type BuildableId } from './buildables';
import { readRunSuspend, type RunSuspendWrite } from './RunSuspend';
import { defaultSaveSlotName, formatBudgetWarning, saveManualSlot, saveSlotsBudget } from './SaveSlots';

const frontierEpoch = loadEpoch('epoch-1-frontier');
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
type BaronRocketTargetKind = 'hero' | 'building';
type BaronRocketVolleyConfig = NonNullable<ContractBaronTwist['rocketVolley']>;

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly events = new EventBus();
  private readonly input: InputController;
  private readonly actors = [new Hero()];
  private readonly enemies = new EnemyPool(this.camera);
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
  private readonly combat = new CombatSystem(
    this.events,
    this.actors,
    this.enemies,
    this.projectiles,
    this.blastCharges,
    this.xpMotes,
    this.combatVfx,
    this.audio,
    () => this.endRun(),
    (position, value) => this.vfx.floatText(position, `+${value}`, '#83ded7'),
    (position) => this.onEnemyKilled(position),
  );
  private readonly prospector = new ProspectorEmbodiment((position, text, color) => this.vfx.floatText(position, text, color));
  private readonly buildSystem: BuildSystem;
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
    id: 'hero',
    enabled: () => this.activeWeapon === 'rig' && this.heroWeaponsEnabled(),
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
    id: 'hero_blast',
    kind: 'lob',
    enabled: () => this.activeWeapon === 'blast' && this.heroWeaponsEnabled(),
    getPos: () => this.primaryActor.group.position,
    range: Balance.blast.range,
    cooldown: Balance.blast.cooldown,
    damage: Balance.blast.damage,
    getDamage: () => this.currentBlastDamage(),
    targetPoint: (_origin, target) => this.currentBlastTarget(target.position),
    projSpeed: 0,
    volley: Balance.blast.volley,
    aoe: { radius: Balance.blast.radius, airTime: Balance.blast.airTime },
  };
  private readonly simTimeScale = getTimescale();
  private manualSimForTest = false;
  private manualAdvanceForTest = false;
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
  private runSuspendSaveLine = runSuspendPauseLine(this.activeContract.id);
  private manualSaveMessage = '';
  private readonly heroStart = contractHeroStart(this.activeContract);
  private readonly debugSpawnPosition = new THREE.Vector3();
  private terrainView?: TerrainView;
  private railPath?: RailPathView;
  private megaprojectRailPath?: RailPathView;
  private powerGraph?: PowerGraphSystem;
  private lightRig?: LightRig;
  private detailScatter?: DetailScatter;
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly megaprojectManifest: MegaprojectManifest | null = activeMegaprojectManifest(frontierEpoch);
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
  );
  private readonly loop = new Loop(
    (delta) => this.update(delta),
    () => this.render(),
  );

  private get primaryActor(): Hero {
    return this.actors[0];
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
  private elapsed = 0;
  private timeAlive = 0;
  private kills = 0;
  private baronBeatenThisRun = false;
  private baronCeremony: { atSim: number; startedElapsed: number } | null = null;
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
    nearestBuilding: (from: THREE.Vector3) => this.goldTargeting.nearestBuilding(from),
    hitBuilding: (enemy: ClaimJumperEnemy, target: BuildingTarget) => this.combat.handleBuildingHit(enemy, target),
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
  private lastWeaponToggleIntent = false;
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

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly openAssayBench?: () => void,
    private readonly onReturnToMenu?: () => void,
  ) {
    this.assertActorMode();
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;
    this.blastAimReticle.name = 'BlastAimReticle';
    this.blastAimReticle.rotation.x = -Math.PI / 2;
    this.blastAimReticle.renderOrder = RenderLayers.groundDecals;
    this.blastAimReticle.visible = false;
    this.canvas.addEventListener('pointermove', this.onBlastAimPointerMove);
    this.buildSystem = new BuildSystem(
      canvas,
      this.camera,
      this.economy,
      this.combat,
      this.goldTargeting,
      this.primaryActor.group.position,
      () => this.debugBeaconWaveOverride ?? this.waveSystem.diagnostics.wave,
      (position, text, color) => this.vfx.floatText(position, text, color),
      (sound) => this.audio.play(sound),
      (id) => this.isBuildableEnabled(id),
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
        this.vfx.floatText(this.primaryActor.group.position, `+${amount}`, '#c4883a');
      },
      onHeal: (amount) => {
        const before = this.primaryActor.hp;
        this.primaryActor.heal(amount);
        const healed = Math.round(this.primaryActor.hp - before);
        if (healed > 0) this.vfx.floatText(this.primaryActor.group.position, `+${healed}`, '#6bb36b');
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
      () => this.confirmUpgrade(),
      () => this.confirmDemolish(),
      () => this.fundMegaprojectStage(this.primaryActor.group.position),
    );
    this.assayOfficePrompt = new AssayOfficePrompt(this.promptStack);
    this.worldInfoNotePrompt = new WorldInfoNotePrompt(this.promptStack);
    this.deathOverlay = new DeathOverlay(this.getElement('#app'), () => this.finishRunLedger());
    this.upgradeOverlay = new UpgradeOverlay(this.getElement('#app'), (intent) => this.handleUpgradeIntent(intent));
    this.damageVignette.className = 'damage-vignette';
    this.getElement('#app').append(this.damageVignette);
    window.addEventListener('pointerdown', this.skipBaronCeremony, { passive: true });
    window.addEventListener('keydown', this.skipBaronCeremony);
    this.combat.registerShooter(this.heroShooter);
    this.combat.registerShooter(this.blastShooter);
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
        secured: this.runManager?.diagnostics.secured === true || event.wavesSurvived >= this.autoSecureWaveForRun(),
        baseValue: Math.round(economySummary.baseValue),
        weaponSplit: this.weaponSplit(runStats),
        contractId: this.activeContract.id,
      });
      this.deathOverlay.show(this.deathLedger, scores, scoreAt, {
        ...this.researchOverlayOptions(1),
        actionLabel: this.onReturnToMenu ? 'Contract Board' : undefined,
        runStats,
        agentAutonomyDelta: this.agentAutonomyDelta(this.runManager?.diagnostics.secured === true),
        townName: readTownName(),
      });
    });
    this.events.on('run_ended', (event) => {
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
        this.deathOverlay.show(ledger, scores, scoreAt, {
          ...this.researchOverlayOptions(2),
          outcome: 'secured',
          actionLabel: this.onReturnToMenu ? 'Contract Board' : 'Enter New Claim',
          runStats,
          agentAutonomyDelta,
          townName: readTownName(),
          onDone: () => {
            if (this.onReturnToMenu) {
              this.runStartMetaRecapPending = false;
              this.onReturnToMenu();
              return;
            }
            this.deathOverlay.hide();
            this.state.setPaused(false);
            this.flushRunStartMetaRecap();
          },
        });
      }, 0);
    });
    this.events.on('enemy_killed', (event) => {
      this.kills += 1;
      if (event.eliteKind === 'baron') this.onBaronDefeated(event.at, event.enemyId);
    });
    this.events.on('building_damaged', () => {
      this.buildingHitsResolved += 1;
    });
    this.events.on('building_wrecked', () => {
      this.buildingsWrecked += 1;
      emitStorySignal({ type: 'building-lost' });
    });
    this.events.on('wave_started', (event) => {
      this.audio.play('wave-start-horn');
      this.announceBaronBeat(event.wave, event.at);
    });

    this.debugTools = new DebugTools(this.tuning, () => {
      (Balance.render as { exposure: number; maxDpr: number }).exposure = this.tuning.exposure;
      (Balance.render as { exposure: number; maxDpr: number }).maxDpr = this.tuning.maxDpr;
      this.renderer.toneMappingExposure = this.tuning.exposure;
      this.applyCameraTuning();
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    });

    this.createScene();
    this.registerGoldHoldings();
    this.syncMegaprojectSite();
    this.placeContractFixtures();
    if (new URLSearchParams(window.location.search).has('debug')) {
      // Test/debug harness: parking-free positioning for interaction e2e.
      window.__GR_TEST__ = {
        teleport: (x: number, z: number) => {
          this.primaryActor.group.position.set(x, this.primaryActor.group.position.y, z);
          this.syncHeroVisualHeight();
          this.primaryActor.velocity.set(0, 0, 0);
        },
        spawnPack: (n: number, radius?: number, opts?: SpawnPackOptions) =>
          this.spawnHarnessPack(n, radius, opts ?? legacySpawnPackOptions(n, radius)),
        spawnThief: (edge?: CompassEdge) => this.spawnHarnessThief(edge),
        spawnWrecker: (edge?: CompassEdge) => this.spawnHarnessWrecker(edge),
        wreck: (family: BuildableId, index: number) => this.wreckHarnessBuilding(family, index),
        repair: (family: BuildableId, index: number) => {
          const repaired = this.buildSystem.repairBuilding(family, index, this.timeAlive, this.primaryActor.group.position);
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
          return this.manualSimForTest;
        },
        advanceSim: (seconds: number, stepSeconds?: number) => this.advanceSimForTest(seconds, stepSeconds),
        resetRun: () => this.resetRun(),
        toggleWeapon: () => this.toggleWeapon(),
        setBlastAim: (x: number, z: number) => this.setBlastAimForTest(x, z),
        setDifficultyPreset: (preset: string) => this.setDifficultyPreset(preset),
        warmVfx: () =>
          Promise.all([this.vfx.warm(this.primaryActor.group.position), this.enemies.warmHitFlashes(this.primaryActor.group.position)]).then(
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
        terrainSample: (x: number, z: number) => Terrain.sample(x, z),
        terrainVisualY: (x: number, z: number, base = 0, padRadius = 0) => Terrain.visualY(x, z, base, padRadius),
        terrainSim: (x: number, z: number) => terrainSimSample(x, z),
        setTestClip: (slot: string, frames: string[], fps: number) => setSpriteTestClip(slot as AssetSlotId, frames, fps),
        setBuildMode: (on: boolean) => this.buildSystem.setBuildMode(on),
        selectBuildable: (id: string) => this.selectBuildable(id),
        rotateBuildGhost: () => this.buildSystem.rotateGhost(),
        placeFree: (id: BuildableId, x: number, z: number, rotationSteps = 0) => {
          const placed = this.buildSystem.placeFree(id, { x, z }, rotationSteps);
          this.publishDiagnostics();
          return placed;
        },
        confirmBuild: () => {
          const placed = this.buildSystem.confirm(this.timeAlive);
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
        spawnGoldPickup: (x: number, z: number, amount: number) =>
          this.goldPickups.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z), amount) >= 0,
        spawnXpMote: (x: number, z: number, value: number) =>
          this.xpMotes.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z), value),
        goldPickups: () => this.goldPickups.snapshot(),
        placeBeacon: () => {
          this.buildSystem.selectBuildable('sentry_beacon', true);
          return this.buildSystem.confirm(this.timeAlive);
        },
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
    this.cameraRig.snapTo(this.primaryActor.group.position);
    this.state.transition('playing');
    this.uiBridge.announce('Stake your claim.', 0);
    this.prefetchContractPresentation();
    // ADR-002 section 4: M3 exposes install(game); wiring happens at merge (m3-01 gate, s31).
    // Meta defenses need to exist before the opening stress spawns pick lanes.
    this.runManager = installRunManager(this);
    this.waveSystem.spawnStressEnemies();
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.applyStats(this.progression.stats, null);
    this.syncUi();
    this.publishDiagnostics();
    this.showRunStartMetaRecap();
    this.showContractBriefing();
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

  dispose(): void {
    this.runManager?.dispose();
    this.unsubscribeAgentReceipts?.();
    this.agentStub?.dispose();
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
    this.buildSystem.dispose();
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
    this.powerGraph?.dispose();
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
    this.enemies.dispose();
    this.primaryActor.dispose();
    disposeGeneratedAssets();
    this.events.clear();
    this.renderer.dispose();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): void {
    this.frame += 1;
    beginSpriteStatsFrame(this.frame);
    this.recordFrameMs(delta * 1000);
    this.elapsed += delta;
    const intents = this.input.readIntents();
    if (intents.mute && !this.lastMuteIntent) this.toggleAudioMute();
    this.lastMuteIntent = intents.mute;
    if (this.baronCeremony) {
      if (this.elapsed - this.baronCeremony.startedElapsed >= BARON_KILL_STOP_SECONDS) this.finishBaronCeremony();
      if (this.baronCeremony) {
        this.rememberIntents(intents);
        this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
        resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
        this.updatePresentation(delta);
        return;
      }
    }
    if (this.secureClaimChoicePending()) {
      this.rememberIntents(intents);
      this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
      this.updateCharmPause(delta);
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
      this.updatePresentation(delta);
      return;
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
    if (intents.weaponToggle && !this.lastWeaponToggleIntent) this.toggleWeapon();
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
    this.lastMuteIntent = intents.mute;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.lastDebugXpIntent = intents.debugXp;
    this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
    this.updateCharmPause(delta);

    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    if (this.state.simActive && (!this.manualSimForTest || this.manualAdvanceForTest)) {
      const simDelta = delta * this.simTimeScale;
      this.timeAlive += simDelta;
      if (this.activeWeapon === 'blast') this.blastTime += simDelta;
      this.terrainView?.update(simDelta);
      this.primaryActor.update(simDelta, intents, { bounds: Terrain.bounds, sample: Terrain.sample });
      this.updateBlastAim(intents);
      this.updateWetPowderHint(simDelta);
      this.combat.setTime(this.timeAlive);
      this.waveSystem.update(this.timeAlive);
      if (this.secureClaimChoicePending()) {
        this.updatePresentation(delta);
        return;
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
      );
      this.powerGraph?.update(this.timeAlive);
      this.syncStockpileHoldings();
      this.enemies.update(
        simDelta,
        this.primaryActor.group.position,
        this.combat.handleEnemyContact,
        this.buildSystem.palisadeBlockers,
        isStealDisabled() ? undefined : this.thiefContext,
        isWreckDisabled() ? undefined : this.wreckerContext,
      );
      this.harvestSnapshot = this.harvestSystem.update(
        simDelta,
        this.timeAlive,
        this.primaryActor.group.position,
        this.primaryActor.velocity.length(),
      );
      if (this.harvestSnapshot.channeling && !this.lastHarvestChanneling) this.audio.play('pan-swish');
      this.lastHarvestChanneling = this.harvestSnapshot.channeling;
      if (this.harvestSnapshot.lastGoldGain > 0) {
        if (this.hasBuiltStockpile()) this.audio.play('stockpile-deposit', 0.8);
        this.vfx.floatText(this.primaryActor.group.position, `+${this.harvestSnapshot.lastGoldGain}`, '#c4883a');
      }
      this.updateBaronRocketVolley();
      this.combat.update(simDelta, this.timeAlive);
      this.maybeProspectorRepair();
      this.maybeProspectorCollectGold();
      this.maybeProspectorCollectXp();
      this.goldPickups.update(
        simDelta,
        this.primaryActor.group.position,
        (amount) => this.economy.canReceiveIncome(this.reclaimAmount(amount)),
        (position, amount) => this.reclaimGold(position, amount),
        (position) => this.blockedGoldPickup(position),
      );
      this.progression.consumeXpTotal(this.combat.xpCount);
      this.combatVfx.update(simDelta);
    }
    this.updatePresentation(delta);
  }

  private updatePresentation(delta: number): void {
    const prospectorDelta = this.state.isPaused ? 0 : delta;
    this.prospector.update(prospectorDelta, this.timeAlive, this.state.isPaused ? undefined : this.primaryActor.group.position);
    this.syncAudioLoops();
    this.vfx.update(delta);
    if (this.baronCeremony) this.combatVfx.update(delta);
    this.syncBaronStandardDrop();
    this.syncBaronRocketCart();
    this.syncHeroVisualHeight();
    const visualStress =
      this.enemies.activeCount >= Balance.world.detailStressEnemyThreshold ||
      this.waveSystem.diagnostics.wave >= Balance.world.detailStressWaveThreshold;
    this.detailScatter?.syncBuildingClearings(this.detailClearings());
    this.cameraRig.update(delta, this.primaryActor.group.position, this.primaryActor.velocity);
    this.lightRig?.setStressFallback(visualStress);
    this.syncNightShiftLighting();
    this.lightRig?.update();
    this.damageVignette.style.opacity = (this.damageFlashRemaining / Balance.hero.iframes).toFixed(3);
    this.syncUpgradeOverlay();
    this.syncUi();
    this.syncAssayOfficePrompt();
    this.syncBuildingContextPrompt();
    this.syncWorldInfoNotePrompt();
    this.publishDiagnostics();
  }

  private syncAudioLoops(): void {
    const active = this.state.current === 'playing' && !this.state.isPaused;
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
    if (isDevPowerGraphEnabled()) {
      this.powerGraph = new PowerGraphSystem(devPowerGraphDefinition());
      this.scene.add(this.powerGraph.group);
    }
    this.detailScatter = new DetailScatter();
    this.scene.add(this.detailScatter.group);
    this.scene.add(this.harvestSystem.group);
    this.scene.add(this.buildSystem.group);
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
    this.prospector.reset(this.primaryActor.group.position);
    this.scene.add(this.prospector.group);
    this.scene.add(this.vfx.group);
    this.scene.add(this.enemies.group);
    this.scene.add(this.primaryActor.group);
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
    if (this.activeContract.twist.baron) applyGeneratedMap(this.baronStandardClothMaterial, assetSlots.propBaronBanner);

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

    const body = new THREE.Mesh(this.baronRocketCartBodyGeometry, this.baronRocketCartWoodMaterial);
    body.name = 'BaronRocketCartBody';
    body.position.y = 0.28;

    const railLeft = new THREE.Mesh(this.baronRocketCartRailGeometry, this.baronRocketCartBrassMaterial);
    railLeft.name = 'BaronRocketCartRailLeft';
    railLeft.position.set(0, 0.5, -0.18);
    const railRight = new THREE.Mesh(this.baronRocketCartRailGeometry, this.baronRocketCartBrassMaterial);
    railRight.name = 'BaronRocketCartRailRight';
    railRight.position.set(0, 0.5, 0.18);

    const wheels: THREE.Mesh[] = [];
    for (const x of [-0.34, 0.34]) {
      for (const z of [-0.34, 0.34]) {
        const wheel = new THREE.Mesh(this.baronRocketCartWheelGeometry, this.baronRocketCartWheelMaterial);
        wheel.name = 'BaronRocketCartWheel';
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.17, z);
        wheels.push(wheel);
      }
    }

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

    this.baronRocketCartGroup.add(body, railLeft, railRight, ...wheels, ...rockets);
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
      if (fixture.id === 'lantern_post') {
        this.buildSystem.placeFree(fixture.id, fixture, fixture.rotationSteps ?? 0, {
          wrecked: fixture.wrecked,
          repairCost: fixture.relightCost,
        });
      }
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
      promptReady: this.megaprojectFundCandidate(this.primaryActor.group.position) !== null,
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
    const heroPos = {
      x: this.primaryActor.group.position.x,
      y: this.primaryActor.group.position.y,
      z: this.primaryActor.group.position.z,
    };
    const speed = this.primaryActor.velocity.length();
    const economyLog = this.economy.log;
    const economyReplay = economyLog.reduce(reduceEconomy, initialEconomyState);
    const economySummary = summarizeLog(economyLog);
    const buildDiagnostics = this.buildSystem.diagnostics;
    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      timeAlive: this.timeAlive,
      runState: this.state.current,
      paused: this.state.isPaused,
      state: this.state.isPaused ? 'paused' : this.state.current,
      difficultyPreset: this.difficultyPreset,
      renderLayers: RenderLayers,
      renderLayerOf,
      ui: this.uiSnapshot,
      hp: this.primaryActor.hp,
      maxHp: this.primaryActor.maxHp,
      heroIframes: this.primaryActor.hasIframes,
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
      speed,
      player: {
        position: heroPos,
        speed,
      },
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
        baron: this.activeContract.twist.baron ?? null,
        medals: loadMedals(),
      },
      research: this.researchDiagnostics(),
      megaproject: this.megaprojectDiagnostics(),
      power: this.powerGraph?.diagnostics() ?? emptyPowerGraphDiagnostics(),
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
            elapsed: this.elapsed - this.baronCeremony.startedElapsed,
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
      lighting: this.lightRig?.diagnostics(),
      enemyDimming: this.enemies.dimmingDiagnostics,
      vfx: {
        activeFloatTexts: this.vfx.activeFloatTexts,
      },
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
      assets: generatedAssetStatuses(),
      assetSprites: generatedAssetRenderCounts(),
      spriteAnimations: spriteAnimationDiagnostics(),
      spriteStats: spriteStatsDiagnostics(this.fadeOverlaysActive()),
      terrain: {
        playerZone: Terrain.sample(this.primaryActor.group.position.x, this.primaryActor.group.position.z).zone,
        ground: this.terrainView?.groundDiagnostics(),
        sim: simHeightDiagnostics(),
        water: this.terrainView?.diagnostics(),
        rails: this.railDiagnostics(),
        vista: Terrain.vistaDiagnostics(),
        detailScatter: this.detailScatter?.diagnostics(),
        height: {
          ...Terrain.heightDiagnostics(),
          heroGround: Terrain.sampleHeight(this.primaryActor.group.position.x, this.primaryActor.group.position.z),
          heroVisualY: this.primaryActor.group.position.y,
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
    return this.waitsForBaronDefeat() ? Number.MAX_SAFE_INTEGER : this.secureWaveForRun();
  }

  securePayoutMultForRun(): Partial<Record<MetaTrack, number>> | undefined {
    const baron = this.activeContract.twist.baron;
    if (!baron || !this.baronBeatenThisRun) return undefined;
    return { science: Math.max(1, baron.sciencePayoutMult) };
  }

  secureBarkForRun(): string | undefined {
    const baron = this.activeContract.twist.baron;
    return baron && this.baronBeatenThisRun ? `The Baron is DEFEATED. ${baron.defeatBeat}` : undefined;
  }

  secureLedgerLineForRun(): string | undefined {
    const baron = this.activeContract.twist.baron;
    return baron && this.baronBeatenThisRun ? `THE BARON — DEFEATED, wave ${baron.wave}` : undefined;
  }

  secureCalloutForRun(): string | undefined {
    return this.activeContract.twist.baron && this.baronBeatenThisRun ? '+double science' : undefined;
  }

  private waitsForBaronDefeat(): boolean {
    return Boolean(this.activeContract.twist.baron && !this.baronBeatenThisRun);
  }

  private announceBaronBeat(wave: number, atSim: number): void {
    const baron = this.activeContract.twist.baron;
    if (!baron) return;
    if (wave === baron.wave) {
      this.queueBaronBanner(baron.taunt, atSim, BARON_ARRIVAL_TITLE);
      return;
    }
    if (!baron.tauntWaves.includes(wave)) return;
    this.queueBaronBanner(baron.taunt, atSim, 'The Claim-Jumper Baron');
  }

  private announceWaveBanner(text: string, atSim: number): void {
    if (this.pendingBaronBanner?.title === BARON_ARRIVAL_TITLE || this.baronArrivalBannerVisible()) return;
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
      this.uiSnapshot?.announcementTitle === BARON_ARRIVAL_TITLE
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
    this.publishDiagnostics();
  }

  private onBaronDefeated(atSim: number, enemyId: number): void {
    if (this.baronBeatenThisRun || this.baronCeremony || this.state.current !== 'playing') return;
    const baron = this.activeContract.twist.baron;
    if (!baron) return;
    const enemy = this.enemies.all.find((entry) => entry.id === enemyId);
    const position = enemy?.position.clone() ?? this.primaryActor.group.position.clone();
    const pendingArrivalBanner = this.pendingBaronBanner?.title === BARON_ARRIVAL_TITLE ? this.pendingBaronBanner : null;
    window.clearTimeout(this.baronAnnouncementTimer);
    this.baronAnnouncementTimer = 0;
    this.charmPauseActive = false;
    this.charmPauseRemaining = 0;
    this.charmPauseCooldown = 0;
    this.plantBaronStandard(position);
    const burstScale = Math.max(3, enemy?.visualScale ?? 3);
    this.combatVfx.dustPuff(position, burstScale);
    this.combatVfx.detonationRing(position, Math.min(7, burstScale * 1.45));
    this.audio.play('victory-sting');
    if (pendingArrivalBanner) {
      this.showBaronBanner(pendingArrivalBanner);
    } else {
      this.pendingBaronBanner = null;
      this.uiBridge.announce(baron.defeatBeat, atSim, null, BARON_DEFEAT_CARD_SECONDS, 'baron-defeat', BARON_DEFEAT_TITLE);
    }
    if (isPauseDisabled()) {
      this.completeBaronDefeat(atSim);
      return;
    }

    this.playerPauseActive = false;
    this.baronCeremony = { atSim, startedElapsed: this.elapsed };
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
    const secured = this.runManager?.secureCurrentRun(this.waveSystem.diagnostics.wave) === true;
    if (!secured) {
      this.baronBeatenThisRun = false;
      return;
    }
    window.clearTimeout(this.baronAnnouncementTimer);
    this.pendingBaronBanner = null;
    this.baronAnnouncementTimer = 0;
    awardBaronMedal();
    this.researchState = saveResearchState(
      this.researchStorage,
      loadResearchState(this.researchStorage, this.researchStorage, this.researchUnlockFlags()),
    );
    this.uiBridge.announce(baron.defeatBeat, atSim, null, BARON_DEFEAT_CARD_SECONDS, 'baron-defeat', BARON_DEFEAT_TITLE);
  }

  private readonly skipBaronCeremony = (event: Event): void => {
    if (!this.baronCeremony || (event instanceof KeyboardEvent && event.repeat)) return;
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
    if (distanceSq2(baron.position.x, baron.position.z, this.primaryActor.group.position.x, this.primaryActor.group.position.z) <= heroRadius * heroRadius) {
      return true;
    }

    const building = this.goldTargeting.nearestBuilding(baron.position);
    if (!building) return false;
    const reach = Balance.wreck.reach * Math.max(1, baron.visualScale) + 0.35;
    return distanceSqToBuildingPoint(baron.position, building) <= reach * reach;
  }

  private acquireBaronRocketTarget(baron: ClaimJumperEnemy): boolean {
    const building = this.goldTargeting.nearestBuilding(baron.position);
    const hero = this.primaryActor.group.position;
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
    const yaw = baron.group.rotation.y;
    const distance = Math.max(0.9, baron.visualScale * 0.72);
    const x = baron.position.x - Math.sin(yaw) * distance;
    const z = baron.position.z + Math.cos(yaw) * distance;
    const active = this.baronRocketTelegraphStartedAt >= 0;
    const pulse = active ? 0.5 + Math.sin(this.elapsed * 18) * 0.5 : 0;
    this.baronRocketCartTealMaterial.emissiveIntensity = active ? 0.55 + pulse * 0.55 : 0.3;
    this.baronRocketCartGroup.visible = true;
    this.baronRocketCartGroup.position.set(x, Terrain.visualY(x, z, 0.06), z);
    this.baronRocketCartGroup.rotation.set(active ? -0.08 - pulse * 0.05 : 0, yaw, active ? 0.08 : 0);
    this.baronRocketCartGroup.scale.setScalar(scale);
  }

  private baronRocketDiagnostics() {
    const manifest = this.baronRocketConfig();
    return {
      cartVisible: this.baronRocketCartGroup.visible,
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
    this.lightRig?.setNightShift(state);
    if (!state.enabled || state.darkness <= 0) {
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
    const sources: EnemyLightSource[] = [
      {
        x: this.primaryActor.group.position.x,
        z: this.primaryActor.group.position.z,
        radius: Balance.contracts.nightShift.heroLightRadius,
      },
    ];
    const liveLightPositions = (id: BuildableId): Array<{ x: number; z: number }> =>
      diagnostics.hp
        .filter((entry) => entry.id === id && entry.hp > 0 && !entry.wrecked)
        .map((entry) => entry.position);

    for (const position of liveLightPositions('sentry_beacon')) {
      sources.push({ x: position.x, z: position.z, radius: Balance.beacon.range * Balance.contracts.nightShift.beaconLightMult });
    }
    for (const position of liveLightPositions('turret')) {
      sources.push({ x: position.x, z: position.z, radius: Balance.contracts.nightShift.turretLightRadius });
    }
    for (const position of liveLightPositions('lantern_post')) {
      sources.push({ x: position.x, z: position.z, radius: Balance.contracts.nightShift.lanternPostLightRadius });
    }

    this.enemies.setLightDimming({
      enabled: true,
      darkness: state.darkness,
      minLight: Balance.contracts.nightShift.minLight,
      falloff: Balance.contracts.nightShift.lightFalloff,
      sources,
    });
  }

  private nightShiftLightingState(): LightRigNightShiftState {
    if (!this.isNightShiftContract()) return { enabled: false, phase: 'full', darkness: 0 };
    const ramp = this.activeContract.twist.lightRamp ?? Balance.contracts.nightShift;
    const wave = Math.max(0, Math.floor(this.waveSystem.diagnostics.wave));
    let phase: NightShiftPhase = 'full';
    let darkness = 0;
    if (wave >= ramp.dawnWave) {
      phase = 'dawn';
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
    return this.activeContract.id === 'e1-night-shift';
  }

  private isBuildableEnabled(id: BuildableId): boolean {
    return id !== 'lantern_post' || this.isNightShiftContract();
  }

  private detailClearings(): DetailScatterClearPoint[] {
    const diagnostics = this.buildSystem.diagnostics;
    return [
      ...diagnostics.beaconPositions,
      ...diagnostics.palisadePositions,
      ...diagnostics.sluicePositions,
      ...diagnostics.stockpilePositions,
      ...diagnostics.turretPositions,
      ...diagnostics.lanternPostPositions,
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
      this.primaryActor.hp,
      this.primaryActor.maxHp,
      this.enemies.activeCount,
      this.economy.gold,
      this.economy.bankCap,
      this.activeResourceSnapshots(),
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
    return this.activeEpoch.resources.map((resource) => {
      const balance = this.economy.resourceBalance(resource.id);
      return {
        ...resource,
        amount: Math.floor(balance.amount),
        cap: Math.floor(balance.cap || resource.capDefault),
      };
    });
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
    this.prospectorRepairDwellStartedAt ??= this.elapsed;
    const progress = (this.elapsed - this.prospectorRepairDwellStartedAt) / Balance.wreck.repairSeconds;
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

  private prospectorCan(ability: 'auto_collect' | 'auto_repair'): boolean {
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
        this.buildSystem.assayOfficeInRange(this.primaryActor.group.position),
    );
  }

  private syncBuildingContextPrompt(): void {
    const benchOpen = document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null;
    const assayInRange = this.buildSystem.assayOfficeInRange(this.primaryActor.group.position);
    const canShowPrompt = this.state.current === 'playing' && !benchOpen && !this.buildMenuOpen && !this.buildSystem.isBuildMode;
    const fund = canShowPrompt ? this.megaprojectFundCandidate(this.primaryActor.group.position) : null;
    let demolish =
      canShowPrompt && !fund
        ? this.buildSystem.nearestBuildingTo(this.primaryActor.group.position)
        : null;
    const key = demolish ? demolishKey(demolish) : null;
    if (!key) this.demolishSuppressedKey = null;
    if (key && this.demolishSuppressedKey && key !== this.demolishSuppressedKey) this.demolishSuppressedKey = null;
    if (key && key === this.demolishSuppressedKey) demolish = null;
    const upgrade = demolish ? this.buildSystem.upgradeCandidateFor(demolish.id, demolish.index) : null;
    this.demolishCandidate = demolish;
    this.upgradeCandidate = upgrade;
    this.maybeEmitStampSiteBeat(fund);
    this.buildingContextPrompt.update(demolish, upgrade, !assayInRange, fund);
  }

  private syncWorldInfoNotePrompt(): void {
    const blocked =
      this.state.current !== 'playing' ||
      this.state.isPaused ||
      this.buildMenuOpen ||
      this.buildSystem.isBuildMode ||
      document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null ||
      document.querySelector('[data-testid="contract-briefing"]:not([hidden])') !== null;
    this.worldInfoNotePrompt.update(blocked ? null : this.nearestWorldInfoTarget(this.primaryActor.group.position));
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
    if (intent.type === 'set_agent_rung') this.agentConsent.setRung(intent.level, intent.granted);
    if (intent.type === 'set_agent_ability') this.agentConsent.setAbility(intent.ability, intent.granted);
    if (intent.type === 'set_agent_rung' || intent.type === 'set_agent_ability') return;
    if (intent.type === 'save_claim') {
      this.audio.play('ledger-open');
      this.saveManualClaim(intent.name);
      return;
    }
    if (this.secureClaimChoicePending()) return;
    this.audio.play('menu-tap');
    if (intent.type === 'pause') this.togglePlayerPause();
    if (intent.type === 'restart' && this.state.current === 'dead') this.resetRun();
    if (intent.type === 'toggle_build_menu') this.toggleBuildMenu();
    if (intent.type === 'close_build_menu') this.closeBuildMenu();
    if (intent.type === 'select_buildable') this.selectBuildable(intent.id);
  }

  private secureClaimChoicePending(): boolean {
    const run = this.runManager?.diagnostics;
    return run?.secured === true && run.rush !== true;
  }

  private handleUpgradeIntent(intent: UpgradeIntent): void {
    if (intent.type !== 'pick_upgrade' || this.state.current !== 'levelup') return;
    const picked = this.progression.offer?.[intent.index];
    if (picked) this.progression.applyUpgrade(picked.id);
  }

  private advanceSimForTest(seconds: number, stepSeconds = 1 / 5): void {
    const total = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const step = Number.isFinite(stepSeconds) ? Math.max(0.001, stepSeconds) : 1 / 5;
    const scale = Math.max(0.001, this.simTimeScale);
    let remaining = total;
    this.manualAdvanceForTest = true;
    try {
      while (remaining > 0) {
        const simStep = Math.min(step, remaining);
        this.update(simStep / scale);
        remaining -= simStep;
      }
    } finally {
      this.manualAdvanceForTest = false;
    }
  }

  resetRun(): void {
    const deferMetaRecap =
      this.runManager?.diagnostics.secured === true && this.runManager.diagnostics.lastRunEndedReason === 'secured';
    this.applyRunPreset(readDifficultyPreset(), false);
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'run_reset' });
    this.enemies.recycleAll();
    this.goldPickups.recycleAll();
    this.waveSystem.reset();
    this.buildMenuOpen = false;
    this.upgradeCandidate = null;
    this.demolishCandidate = null;
    this.demolishSuppressedKey = null;
    this.buildSystem.reset();
    this.syncMegaprojectSite();
    this.placeContractFixtures();
    if (this.runManager) this.applyMetaProgress(this.runManager.metaProgress);
    this.harvestSystem.reset();
    this.combat.reset();
    this.activeWeapon = 'rig';
    this.blastAimReticle.visible = false;
    this.canvas.classList.remove('aim-reticle--disarmed');
    this.weaponToggleCount = 0;
    this.blastTime = 0;
    this.wetPowderHintCooldown = 0;
    this.progression.reset();
    this.agentConsent.reset();
    this.primaryActor.resetRun(this.heroStart);
    this.syncHeroVisualHeight();
    this.cameraRig.snapTo(this.primaryActor.group.position);
    this.timeAlive = 0;
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
    if (deferMetaRecap) {
      this.runStartMetaRecapPending = true;
    } else {
      this.showRunStartMetaRecap();
    }
    this.showContractBriefing();
    this.upgradeOverlay.hide();
    this.buildingContextPrompt.update(null, null, false);
  }

  private finishRunLedger(): void {
    if (this.onReturnToMenu) {
      this.onReturnToMenu();
      return;
    }
    this.resetRun();
  }

  private prefetchContractPresentation(): void {
    if (this.activeContract.twist.baron) this.enemies.prefetchBaronPresentation();
  }

  private togglePlayerPause(): void {
    const paused = this.state.togglePause();
    this.playerPauseActive = this.state.current === 'playing' && paused;
  }

  private toggleAudioMute(): void {
    const muted = setAudioMuted(!readAudioMuted());
    this.hud.showMetaRecap(muted ? 'The claim goes quiet.' : 'Sound returns.', 1.8);
  }

  applyMetaProgress(meta: MetaProgress): void {
    this.appliedMetaProgress = cloneMetaProgress(meta);
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
    this.clampBlastAim(this.primaryActor.group.position, this.pointerAimPoint, this.blastAimPoint);
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
    if (this.activeWeapon !== 'blast' || aimMode === 'auto' || disarmed) {
      this.blastAimReticle.visible = false;
      return;
    }

    if (this.pointerAimReady) {
      this.clampBlastAim(this.primaryActor.group.position, this.pointerAimPoint, this.blastAimPoint);
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

  private heroWeaponsEnabled(): boolean {
    return !this.heroWeaponsDisarmed();
  }

  private heroWeaponsDisarmed(): boolean {
    return Balance.pathing.deepWaterDisarmsHero && Terrain.sample(this.primaryActor.group.position.x, this.primaryActor.group.position.z).waterClass === 'deep';
  }

  private currentBlastTarget(autoTarget: THREE.Vector3): THREE.Vector3 {
    if ((Balance.blast.aimMode as BlastAimMode) === 'auto') return autoTarget;
    return this.blastAimPoint;
  }

  private leadBlastAim(intents: Intents): void {
    const origin = this.primaryActor.group.position;
    const dx = Math.abs(intents.move.x) > 0.01 ? intents.move.x : this.primaryActor.velocity.x;
    const dz = Math.abs(intents.move.y) > 0.01 ? intents.move.y : this.primaryActor.velocity.z;
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
    this.primaryActor.group.position.y = Terrain.visualY(this.primaryActor.group.position.x, this.primaryActor.group.position.z, this.heroStart.y);
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
    ruins: number;
    hitsResolved: number;
    wrecked: number;
    repairs: number;
    repairGold: number;
  } {
    let wreckers = 0;
    let swinging = 0;
    for (const enemy of this.enemies.all) {
      if (!enemy.isAlive || !enemy.isWrecker) continue;
      wreckers += 1;
      if (enemy.wreckState === 'swinging') swinging += 1;
    }
    return {
      wreckers,
      swinging,
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
    const x = this.primaryActor.group.position.x;
    const z = this.primaryActor.group.position.z;
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
    const x = this.primaryActor.group.position.x;
    const z = this.primaryActor.group.position.z;
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

  private confirmAction(): void {
    if (this.buildSystem.isBuildMode) {
      this.buildSystem.confirm(this.timeAlive);
      return;
    }
    if (this.buildSystem.assayOfficeInRange(this.primaryActor.group.position)) {
      this.audio.play('ledger-open');
      this.openAssayBench?.();
      return;
    }
    if (this.fundMegaprojectStage(this.primaryActor.group.position)) return;
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
    const upgraded = this.buildSystem.upgradeBuilding(id, index, this.timeAlive, this.primaryActor.group.position);
    if (!upgraded) return false;
    this.syncStockpileHoldings();
    this.publishDiagnostics();
    return true;
  }

  private demolishBuilding(id: BuildableId, index: number): boolean {
    const removed = this.buildSystem.demolish(id, index, this.timeAlive, this.primaryActor.group.position);
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
    this.heroShooter.cooldown = 1 / (Balance.sparkRig.fireRate * stats.fireRateMult);
    this.heroShooter.damage = Balance.sparkRig.damage * stats.damageMult;
    this.heroShooter.range = Balance.sparkRig.range * stats.rangeMult;
    this.heroShooter.projSpeed = Balance.sparkRig.boltSpeed * stats.boltSpeedMult;
    this.heroShooter.volley = Balance.sparkRig.volley + stats.volleyBonus;
    this.blastDamageMult = stats.blastDamageMult;
    this.blastRadiusMult = stats.blastRadiusMult;
    this.blastCooldownMult = stats.blastCooldownMult;
    this.blastShooter.cooldown = Math.max(0.35, Balance.blast.cooldown * this.blastCooldownMult);
    const blastRadius = Balance.blast.radius * this.blastRadiusMult;
    if (this.blastShooter.aoe) this.blastShooter.aoe.radius = blastRadius;
    this.syncBlastReticleRadius(blastRadius);
    this.primaryActor.applyStats(stats.maxHpBonus, stats.moveSpeedMult);
    const platingHeal = upgradeDefById.tinkers_plating.deltas.heal;
    if (pickedId === 'tinkers_plating' && platingHeal !== undefined) {
      this.primaryActor.heal(platingHeal);
    }
    const continued = continuedStudyBonuses(this.researchState);
    this.harvestSystem.applyStats(
      stats.panTickMult,
      stats.seamCapacityBonus,
      stats.seamRespawnReduction,
      (1 + continued.seamYieldMult) * this.contractSeamYieldMult(),
    );
    this.buildSystem.applyStats(stats.beaconFireRateMult, 1 + continued.turretDamageMult);
    this.agentPolicySlotBonus = Math.max(0, Math.floor(stats.agentPolicySlots));
    this.applyUpgradeCapEffects(stats);
    this.applyResearchEffects();
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

    return {
      research: state(),
      onResearchPick: (id) => {
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
      },
      onResearchSkip: () => {
        this.researchState = saveResearchState(this.researchStorage, skipResearchPick(this.researchState));
        roundsRemaining = 0;
        this.publishDiagnostics();
        return state();
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
    return frontierEpoch.masteryConversions
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

function edgePlace(edge: CompassEdge): string {
  if (edge === 'north') return 'north bank';
  if (edge === 'south') return 'south bank';
  if (edge === 'east') return 'east ridge';
  return 'west ridge';
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

function pointFromVector(value: THREE.Vector3): ProspectorPoint {
  return { x: value.x, z: value.z };
}

function distanceSq2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
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
  return params.has('debug') && params.get('power') === 'dev';
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
