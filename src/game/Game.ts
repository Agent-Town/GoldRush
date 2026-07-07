import * as THREE from 'three';
import { disposeGeneratedAssets, generatedAssetRenderCounts, generatedAssetStatuses } from '../assets/generated';
import {
  beginSpriteStatsFrame,
  setSpriteTestClip,
  spriteAnimationDiagnostics,
  spriteStatsDiagnostics,
} from '../assets/SpriteAnimator';
import { type AssetSlotId } from '../assets/slots';
import { EventBus } from '../core/EventBus';
import {
  availablePicks,
  browserResearchStorage,
  contractTierForResearch,
  continuedStudyBonuses,
  hasResearchNode,
  loadResearchState,
  saveResearchState,
  scienceMeter,
  skipResearchPick,
  takeNode,
  type ResearchState,
} from '../meta/ResearchTree';
import { install as installRunManager, type RunManager } from './RunManager';
import { agentAutonomyLevel, type MetaProgress } from './MetaProgress';
import { AgentConsentStore } from '../agent/AgentConsent';
import { install as installAgentStub, type AgentStub } from '../agent/AgentStub';
import { ProspectorEmbodiment, type ProspectorPoint } from '../agent/Embodiment';
import type { AgentCollectXpOptions, AgentCollectXpResult, ToolReceipt } from '../agent/ToolSurface';
import {
  areWavesDisabled,
  getDebugSeed,
  getStressCount,
  getTimescale,
  isCharmPauseDisabled,
  isLevelUpDisabled,
  isPingDisabled,
  isProfileEnabled,
  isSpawnDisabled,
  isStealDisabled,
  isWreckDisabled,
} from '../core/DebugParams';
import { InputController, type Intents } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { createRng } from '../core/Rng';
import { Hero } from '../entities/Hero';
import { BlastChargePool } from '../entities/BlastCharge';
import { GoldPickupPool } from '../entities/GoldPickup';
import { ProjectilePool } from '../entities/Projectile';
import { XpMotePool } from '../entities/XpMote';
import { EnemyPool } from '../entities/pools';
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
import { AudioSystem } from '../systems/AudioSystem';
import {
  Economy,
  initialEconomyState,
  reduce as reduceEconomy,
  summarizeLog,
  type EconomyEvent,
  type EconomySummary,
} from './Economy';
import { CameraRig } from '../systems/CameraRig';
import { BuildSystem, type DemolishCandidate, type UpgradeCandidate } from '../systems/BuildSystem';
import { CombatSystem } from '../systems/CombatSystem';
import type { ShooterHandle } from '../systems/CombatSystem';
import { DebugTools, setBalance, type DebugTuning } from '../systems/DebugTools';
import { HarvestSystem } from '../systems/HarvestSystem';
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
import { Hud, type UiIntent } from '../ui/Hud';
import { AssayOfficePrompt } from '../ui/AssayOfficePrompt';
import { DemolishPrompt } from '../ui/DemolishPrompt';
import { UpgradePrompt } from '../ui/UpgradePrompt';
import { UpgradeOverlay, type UpgradeIntent } from '../ui/UpgradeOverlay';
import * as Terrain from '../world/Terrain';
import type { TerrainView } from '../world/Terrain';
import { LightRig } from '../world/LightRig';
import { DetailScatter, type DetailScatterClearPoint } from '../world/Scatter';
import { GameState } from './GameState';
import { Progression } from './Progression';
import { applyUpgradeBudgetsFromBalance, resolveFiller } from './Upgrades';
import { clearScores, recordScore } from './Scoreboard';
import type { EffectiveStats } from './StatSheet';
import { upgradeDefById, upgradeDefs, type UpgradeId } from './Upgrades';
import { buildableDefs, type BuildableId } from './buildables';

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly events = new EventBus();
  private readonly input: InputController;
  private readonly hero = new Hero();
  private readonly enemies = new EnemyPool();
  private readonly projectiles = new ProjectilePool();
  private readonly blastCharges = new BlastChargePool();
  private readonly xpMotes = new XpMotePool();
  private readonly goldPickups = new GoldPickupPool();
  private readonly combatVfx = new CombatVfx();
  private readonly audio = new AudioSystem();
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
    this.hero,
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
      side: THREE.DoubleSide,
    }),
  );
  private readonly heroShooter: ShooterHandle = {
    id: 'hero',
    enabled: () => this.activeWeapon === 'rig' && this.heroWeaponsEnabled(),
    getPos: () => this.hero.group.position,
    range: Balance.sparkRig.range,
    cooldown: 1 / Balance.sparkRig.fireRate,
    damage: Balance.sparkRig.damage,
    projSpeed: Balance.sparkRig.boltSpeed,
    volley: Balance.sparkRig.volley,
  };
  private readonly blastShooter: ShooterHandle = {
    id: 'hero_blast',
    kind: 'lob',
    enabled: () => this.activeWeapon === 'blast' && this.heroWeaponsEnabled(),
    getPos: () => this.hero.group.position,
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
  private harvestSnapshot = this.harvestSystem.snapshot;
  private readonly uiBridge = new UiBridge();
  private readonly hud: Hud;
  private readonly assayOfficePrompt: AssayOfficePrompt;
  private readonly demolishPrompt: DemolishPrompt;
  private readonly upgradePrompt: UpgradePrompt;
  private readonly deathOverlay: DeathOverlay;
  private readonly upgradeOverlay: UpgradeOverlay;
  private readonly damageVignette = document.createElement('div');
  private readonly heroStart = new THREE.Vector3(0, 0.06, 12);
  private readonly debugSpawnPosition = new THREE.Vector3();
  private terrainView?: TerrainView;
  private lightRig?: LightRig;
  private detailScatter?: DetailScatter;
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly waveSystem = new WaveSystem(
    this.enemies,
    this.hero.group.position,
    createRng(`${getDebugSeed() ?? 'gold-rush'}:waves`),
    (text, atSim) => this.uiBridge.announce(text, atSim),
    (wave, atSim) => {
      this.events.emit({ type: 'wave_started', at: atSim, wave });
      return !this.secureClaimChoicePending();
    },
    areWavesDisabled,
    () => !isStealDisabled() && this.hasBuiltStockpile(),
    () => !isWreckDisabled() && this.buildSystem.hasAnyBuildable,
    () => this.liveThiefCount(),
  );
  private readonly loop = new Loop(
    (delta) => this.update(delta),
    () => this.render(),
  );

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
  private upgradeSuppressedKey: string | null = null;
  private lastPauseIntent = false;
  private lastRestartIntent = false;
  private lastBuildIntent = false;
  private lastCancelIntent = false;
  private lastConfirmIntent = false;
  private lastRotateIntent = false;
  private lastWeaponToggleIntent = false;
  private lastDebugSpawnIntent = false;
  private lastDebugXpIntent = false;
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
  private prospectorIntroShown = false;
  private agentPolicySlotBonus = 0;
  private readonly researchStorage = browserResearchStorage();
  private researchState: ResearchState = loadResearchState(this.researchStorage);
  private readonly craftingProfile = normalizeQueueProfile(new URLSearchParams(window.location.search).get('profile'));

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly openAssayBench?: () => void,
    private readonly onReturnToMenu?: () => void,
  ) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;
    this.blastAimReticle.name = 'BlastAimReticle';
    this.blastAimReticle.rotation.x = -Math.PI / 2;
    this.blastAimReticle.visible = false;
    this.canvas.addEventListener('pointermove', this.onBlastAimPointerMove);
    this.buildSystem = new BuildSystem(
      canvas,
      this.camera,
      this.economy,
      this.combat,
      this.goldTargeting,
      this.hero.group.position,
      () => this.debugBeaconWaveOverride ?? this.waveSystem.diagnostics.wave,
      (position, text, color) => this.vfx.floatText(position, text, color),
    );
    this.progression = new Progression({
      state: this.state,
      rng: createRng(`${getDebugSeed() ?? 'gold-rush'}:upgrades`),
      getBeaconCount: () => this.buildSystem.beaconCount,
      getWave: () => this.waveSystem.diagnostics.wave,
      getMaxHp: () => this.hero.maxHp,
      onStatsChanged: (stats, pickedId) => this.applyStats(stats, pickedId),
      onGoldGranted: (amount) => {
        this.economy.apply({
          id: crypto.randomUUID(),
          at: this.timeAlive,
          type: 'gold_granted',
          source: 'upgrade_assay',
          amount,
        });
        this.vfx.floatText(this.hero.group.position, `+${amount}`, '#c4883a');
      },
      onHeal: (amount) => {
        const before = this.hero.hp;
        this.hero.heal(amount);
        const healed = Math.round(this.hero.hp - before);
        if (healed > 0) this.vfx.floatText(this.hero.group.position, `+${healed}`, '#6bb36b');
      },
      hasResearchNode: (id) => hasResearchNode(this.researchState, id),
      getCraftingProfile: () => this.craftingProfile,
      isChoiceDisabled: isLevelUpDisabled,
    });

    const stick = this.getElement('#touch-stick');
    const knob = this.getElement('#touch-knob');
    const confirmButton = this.getElement('#confirm-button');
    this.input = new InputController(stick, knob, confirmButton);
    this.hud = new Hud(this.getElement('#hud'), (intent) => this.handleUiIntent(intent));
    this.assayOfficePrompt = new AssayOfficePrompt(this.getElement('#hud'));
    this.demolishPrompt = new DemolishPrompt(this.getElement('#hud'), () => this.confirmDemolish());
    this.upgradePrompt = new UpgradePrompt(this.getElement('#hud'), () => this.confirmUpgrade());
    this.deathOverlay = new DeathOverlay(this.getElement('#app'), () => this.finishRunLedger());
    this.upgradeOverlay = new UpgradeOverlay(this.getElement('#app'), (intent) => this.handleUpgradeIntent(intent));
    this.damageVignette.className = 'damage-vignette';
    this.getElement('#app').append(this.damageVignette);
    this.combat.registerShooter(this.heroShooter);
    this.combat.registerShooter(this.blastShooter);
    this.events.on('hero_damaged', () => {
      this.damageFlashRemaining = Balance.hero.iframes;
    });
    this.events.on('hero_died', (event) => {
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
        secured: this.runManager?.diagnostics.secured === true || event.wavesSurvived >= Balance.run.secureWave,
        baseValue: Math.round(economySummary.baseValue),
        weaponSplit: this.weaponSplit(runStats),
      });
      this.deathOverlay.show(this.deathLedger, scores, scoreAt, { ...this.researchOverlayOptions(1), runStats });
    });
    this.events.on('run_ended', (event) => {
      if (event.reason !== 'secured') return;
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
      window.setTimeout(() => {
        this.state.setPaused(true);
        this.deathOverlay.show(ledger, scores, scoreAt, {
          ...this.researchOverlayOptions(2),
          outcome: 'secured',
          actionLabel: 'Enter New Claim',
          runStats,
          onDone: () => {
            if (this.onReturnToMenu) {
              this.onReturnToMenu();
              return;
            }
            this.deathOverlay.hide();
            this.state.setPaused(false);
          },
        });
      }, 0);
    });
    this.events.on('enemy_killed', () => {
      this.kills += 1;
    });
    this.events.on('building_damaged', () => {
      this.buildingHitsResolved += 1;
    });
    this.events.on('building_wrecked', () => {
      this.buildingsWrecked += 1;
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
    if (new URLSearchParams(window.location.search).has('debug')) {
      // Test/debug harness: parking-free positioning for interaction e2e.
      window.__GR_TEST__ = {
        teleport: (x: number, z: number) => {
          this.hero.group.position.set(x, this.hero.group.position.y, z);
          this.syncHeroVisualHeight();
          this.hero.velocity.set(0, 0, 0);
        },
        spawnPack: (n: number, radius?: number, opts?: SpawnPackOptions) =>
          this.spawnHarnessPack(n, radius, opts ?? legacySpawnPackOptions(n, radius)),
        spawnThief: (edge?: CompassEdge) => this.spawnHarnessThief(edge),
        spawnWrecker: (edge?: CompassEdge) => this.spawnHarnessWrecker(edge),
        wreck: (family: BuildableId, index: number) => this.wreckHarnessBuilding(family, index),
        demolish: (family: BuildableId, index: number) => this.demolishBuilding(family, index),
        upgradeBuilding: (family: BuildableId, index: number) => this.upgradeBuilding(family, index),
        resetRun: () => this.resetRun(),
        toggleWeapon: () => this.toggleWeapon(),
        setBlastAim: (x: number, z: number) => this.setBlastAimForTest(x, z),
        setDifficultyPreset: (preset: string) => this.setDifficultyPreset(preset),
        warmVfx: () =>
          Promise.all([this.vfx.warm(this.hero.group.position), this.enemies.warmHitFlashes(this.hero.group.position)]).then(
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
        setWave: (wave: number) => this.waveSystem.setWaveForTest(wave),
        setTestClip: (slot: string, frames: string[], fps: number) => setSpriteTestClip(slot as AssetSlotId, frames, fps),
        setBuildMode: (on: boolean) => this.buildSystem.setBuildMode(on),
        selectBuildable: (id: string) => this.selectBuildable(id),
        rotateBuildGhost: () => this.buildSystem.rotateGhost(),
        confirmBuild: () => {
          const placed = this.buildSystem.confirm(this.timeAlive);
          this.publishDiagnostics();
          return placed;
        },
        enemyPositions: () =>
          this.enemies.all
            .filter((enemy) => enemy.isAlive)
            .map((enemy) => ({
              x: enemy.position.x,
              y: enemy.position.y,
              z: enemy.position.z,
              id: enemy.id,
              hp: enemy.currentHp,
              vx: enemy.velocityX,
              vz: enemy.velocityZ,
              thief: enemy.isThief,
              wrecker: enemy.isWrecker,
              state: enemy.stealState,
              wreckState: enemy.wreckState,
              carried: enemy.carriedAmount,
              edge: enemy.ownEdge,
              zone: Terrain.sample(enemy.position.x, enemy.position.z).zone,
            })),
        spawnEnemyAt: (x: number, z: number) => this.enemies.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z)) !== null,
        scriptEnemyAt: (x: number, z: number, targetX: number, targetZ: number, speed: number) => {
          const enemy = this.enemies.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z));
          if (!enemy) return false;
          enemy.scriptMoveTo(targetX, targetZ, speed);
          return true;
        },
        clearEnemies: () => this.enemies.recycleAll(),
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
    this.cameraRig.snapTo(this.hero.group.position);
    this.state.transition('playing');
    this.uiBridge.announce('Stake your claim.', 0);
    this.waveSystem.spawnStressEnemies();
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.syncUi();
    this.publishDiagnostics();
    // ADR-002 section 4: M3 exposes install(game); wiring happens at merge (m3-01 gate, s31).
    this.runManager = installRunManager(this);
    // ADR-002 section 4: M4 exposes install(game); wiring happens at merge (m4-01 gate, s32).
    const game = this;
    this.agentStub = installAgentStub(
      {
        diagnostics: () => window.__THREE_GAME_DIAGNOSTICS__,
        economyLog: () => this.economy.log,
        collectXp: (options) => this.collectProspectorXp(options),
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
    this.unsubscribeAgentReceipts = this.agentStub.subscribe((receipt) =>
      this.prospector.handleReceipt(receipt, this.resolveProspectorReceiptPoint(receipt)),
    );
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
    this.canvas.removeEventListener('pointermove', this.onBlastAimPointerMove);
    this.input.dispose();
    this.hud.dispose();
    this.assayOfficePrompt.dispose();
    this.demolishPrompt.dispose();
    this.upgradePrompt.dispose();
    this.deathOverlay.dispose();
    this.upgradeOverlay.dispose();
    this.damageVignette.remove();
    this.debugTools.dispose();
    this.buildSystem.dispose();
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
    this.hero.dispose();
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
      this.state.togglePause();
    }
    if (intents.restart && !this.lastRestartIntent && this.state.current === 'dead') this.resetRun();
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
    if (intents.confirm && !this.lastConfirmIntent) this.confirmAction();
    this.lastPauseIntent = intents.pause;
    this.lastRestartIntent = intents.restart;
    this.lastBuildIntent = intents.build;
    this.lastCancelIntent = intents.cancel;
    this.lastConfirmIntent = intents.confirm;
    this.lastRotateIntent = intents.rotateBuild;
    this.lastWeaponToggleIntent = intents.weaponToggle;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.lastDebugXpIntent = intents.debugXp;
    this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
    this.updateCharmPause(delta);

    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    if (this.state.simActive) {
      const simDelta = delta * this.simTimeScale;
      this.timeAlive += simDelta;
      if (this.activeWeapon === 'blast') this.blastTime += simDelta;
      this.terrainView?.update(simDelta);
      this.hero.update(simDelta, intents, { bounds: Terrain.bounds, sample: Terrain.sample });
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
          this.vfx.floatText(position, `+${amount}`, '#c4883a');
        },
        (position) => this.vfx.floatText(position, 'Vault full!', '#a0522d'),
      );
      this.syncStockpileHoldings();
      this.enemies.update(
        simDelta,
        this.hero.group.position,
        this.combat.handleEnemyContact,
        this.buildSystem.palisadeBlockers,
        isStealDisabled() ? undefined : this.thiefContext,
        isWreckDisabled() ? undefined : this.wreckerContext,
      );
      this.harvestSnapshot = this.harvestSystem.update(
        simDelta,
        this.timeAlive,
        this.hero.group.position,
        this.hero.velocity.length(),
      );
      if (this.harvestSnapshot.lastGoldGain > 0) {
        this.vfx.floatText(this.hero.group.position, `+${this.harvestSnapshot.lastGoldGain}`, '#c4883a');
      }
      this.combat.update(simDelta, this.timeAlive);
      this.maybeProspectorCollectXp();
      this.goldPickups.update(
        simDelta,
        this.hero.group.position,
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
    this.prospector.update(delta, this.timeAlive, this.hero.group.position);
    this.vfx.update(delta);
    this.syncHeroVisualHeight();
    const visualStress =
      this.enemies.activeCount >= Balance.world.detailStressEnemyThreshold ||
      this.waveSystem.diagnostics.wave >= Balance.world.detailStressWaveThreshold;
    this.detailScatter?.syncBuildingClearings(this.detailClearings());
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.lightRig?.setStressFallback(visualStress);
    this.lightRig?.update();
    this.damageVignette.style.opacity = (this.damageFlashRemaining / Balance.hero.iframes).toFixed(3);
    this.syncUpgradeOverlay();
    this.syncUi();
    this.syncAssayOfficePrompt();
    this.syncUpgradePrompt();
    this.syncDemolishPrompt();
    this.publishDiagnostics();
  }

  private rememberIntents(intents: Intents): void {
    this.lastPauseIntent = intents.pause;
    this.lastRestartIntent = intents.restart;
    this.lastBuildIntent = intents.build;
    this.lastCancelIntent = intents.cancel;
    this.lastConfirmIntent = intents.confirm;
    this.lastRotateIntent = intents.rotateBuild;
    this.lastWeaponToggleIntent = intents.weaponToggle;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.lastDebugXpIntent = intents.debugXp;
  }

  private deathRunStats(summary: EconomySummary): DeathRunStatsSnapshot {
    return {
      sluiced: summary.sluiced,
      stolen: summary.stolen,
      reclaimed: summary.reclaimed,
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
    this.detailScatter = new DetailScatter();
    this.scene.add(this.detailScatter.group);
    this.scene.add(this.harvestSystem.group);
    this.scene.add(this.buildSystem.group);
    this.scene.add(this.projectiles.group);
    this.scene.add(this.blastCharges.group);
    this.scene.add(this.blastAimReticle);
    this.scene.add(this.xpMotes.group);
    this.scene.add(this.goldPickups.group);
    this.scene.add(this.combatVfx.group);
    this.hero.group.position.copy(this.heroStart);
    this.syncHeroVisualHeight();
    this.prospector.reset(this.hero.group.position);
    this.scene.add(this.prospector.group);
    this.scene.add(this.vfx.group);
    this.scene.add(this.enemies.group);
    this.scene.add(this.hero.group);
  }

  private publishDiagnostics(): void {
    const info = this.renderer.info;
    const heroPos = {
      x: this.hero.group.position.x,
      y: this.hero.group.position.y,
      z: this.hero.group.position.z,
    };
    const speed = this.hero.velocity.length();
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
      ui: this.uiSnapshot,
      hp: this.hero.hp,
      maxHp: this.hero.maxHp,
      heroIframes: this.hero.hasIframes,
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
      },
      research: this.researchDiagnostics(),
      agent: {
        stub: this.agentStub?.state ?? null,
        embodiment: this.prospector.snapshot,
      },
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
      lighting: this.lightRig?.diagnostics(),
      vfx: {
        activeFloatTexts: this.vfx.activeFloatTexts,
      },
      readability: {
        enemyHitFlashes: this.enemies.hitFlashCount,
        activeEnemyFlashes: this.enemies.activeFlashCount,
        buildingHpBars: buildDiagnostics.hpBars,
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
        playerZone: Terrain.sample(this.hero.group.position.x, this.hero.group.position.z).zone,
        water: this.terrainView?.diagnostics(),
        vista: Terrain.vistaDiagnostics(),
        detailScatter: this.detailScatter?.diagnostics(),
        height: {
          ...Terrain.heightDiagnostics(),
          heroGround: Terrain.sampleHeight(this.hero.group.position.x, this.hero.group.position.z),
          heroVisualY: this.hero.group.position.y,
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

  private detailClearings(): DetailScatterClearPoint[] {
    const diagnostics = this.buildSystem.diagnostics;
    return [
      ...diagnostics.beaconPositions,
      ...diagnostics.palisadePositions,
      ...diagnostics.sluicePositions,
      ...diagnostics.stockpilePositions,
      ...diagnostics.turretPositions,
      ...diagnostics.assayOfficePositions,
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
      this.hero.hp,
      this.hero.maxHp,
      this.enemies.activeCount,
      this.economy.gold,
      this.economy.bankCap,
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
    this.hud.update(this.uiSnapshot);
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
      receiptFeed,
      consent: this.agentConsent.snapshot(state.permissionLevel),
    };
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
      !this.agentStub ||
      this.agentStub.state.permissionLevel <= 0 ||
      !this.agentConsent.allows('auto_collect', this.agentStub.state.permissionLevel) ||
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
    this.agentStub.collectXp();
    this.nextProspectorXpSweepAt = this.timeAlive + 2.4;
  }

  private collectProspectorXp(options: AgentCollectXpOptions): AgentCollectXpResult {
    return this.combat.collectXpForProspector(options, this.prospector.position);
  }

  private syncAssayOfficePrompt(): void {
    this.assayOfficePrompt.update(
      this.state.current === 'playing' &&
        !this.buildSystem.isBuildMode &&
        this.buildSystem.assayOfficeInRange(this.hero.group.position),
    );
  }

  private syncDemolishPrompt(): void {
    const benchOpen = document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null;
    const assayInRange = this.buildSystem.assayOfficeInRange(this.hero.group.position);
    let candidate =
      this.state.current === 'playing' && !benchOpen && !this.buildMenuOpen && !this.buildSystem.isBuildMode
        ? this.buildSystem.nearestBuildingTo(this.hero.group.position)
        : null;
    const key = candidate ? demolishKey(candidate) : null;
    if (!key) this.demolishSuppressedKey = null;
    if (key && this.demolishSuppressedKey && key !== this.demolishSuppressedKey) this.demolishSuppressedKey = null;
    if (key && key === this.demolishSuppressedKey) candidate = null;
    this.demolishCandidate = candidate;
    this.demolishPrompt.update(candidate, !assayInRange && this.upgradeCandidate?.canUpgrade !== true);
  }

  private syncUpgradePrompt(): void {
    const benchOpen = document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null;
    const assayInRange = this.buildSystem.assayOfficeInRange(this.hero.group.position);
    let candidate =
      this.state.current === 'playing' && !benchOpen && !this.buildMenuOpen && !this.buildSystem.isBuildMode
        ? this.buildSystem.nearestUpgradeableTo(this.hero.group.position)
        : null;
    const key = candidate ? upgradeKey(candidate) : null;
    if (!key) this.upgradeSuppressedKey = null;
    if (key && this.upgradeSuppressedKey && key !== this.upgradeSuppressedKey) this.upgradeSuppressedKey = null;
    if (key && key === this.upgradeSuppressedKey) candidate = null;
    this.upgradeCandidate = candidate;
    this.upgradePrompt.update(candidate, !assayInRange);
  }

  private handleUiIntent(intent: UiIntent): void {
    if (intent.type === 'set_agent_rung') this.agentConsent.setRung(intent.level, intent.granted);
    if (intent.type === 'set_agent_ability') this.agentConsent.setAbility(intent.ability, intent.granted);
    if (intent.type === 'set_agent_rung' || intent.type === 'set_agent_ability') return;
    if (this.secureClaimChoicePending()) return;
    if (intent.type === 'pause') this.state.togglePause();
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

  resetRun(): void {
    this.applyRunPreset(readDifficultyPreset(), false);
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'run_reset' });
    this.enemies.recycleAll();
    this.goldPickups.recycleAll();
    this.waveSystem.reset();
    this.buildMenuOpen = false;
    this.upgradeCandidate = null;
    this.upgradeSuppressedKey = null;
    this.demolishCandidate = null;
    this.demolishSuppressedKey = null;
    this.buildSystem.reset();
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
    this.hero.resetRun(this.heroStart);
    this.syncHeroVisualHeight();
    this.cameraRig.snapTo(this.hero.group.position);
    this.timeAlive = 0;
    this.nextProspectorXpSweepAt = 0;
    this.prospectorIntroShown = false;
    this.kills = 0;
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
    this.prospector.reset(this.hero.group.position);
    this.uiBridge.announce('Stake your claim.', 0);
    this.showProspectorIntro();
    this.upgradeOverlay.hide();
    this.upgradePrompt.update(null, true);
    this.demolishPrompt.update(null, true);
  }

  private finishRunLedger(): void {
    if (this.onReturnToMenu) {
      this.onReturnToMenu();
      return;
    }
    this.resetRun();
  }

  applyMetaProgress(meta: MetaProgress): void {
    if (meta.tracks.territory < Balance.meta.territoryTier1) return;
    for (const segment of Balance.meta.territoryRing) {
      this.buildSystem.placeFree('palisade', segment, segment.rotationSteps);
    }
  }

  private endRun(): void {
    if (this.state.current === 'dead') return;
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
    this.clampBlastAim(this.hero.group.position, this.pointerAimPoint, this.blastAimPoint);
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
      this.clampBlastAim(this.hero.group.position, this.pointerAimPoint, this.blastAimPoint);
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
    return Balance.pathing.deepWaterDisarmsHero && Terrain.sample(this.hero.group.position.x, this.hero.group.position.z).zone === 'river';
  }

  private currentBlastTarget(autoTarget: THREE.Vector3): THREE.Vector3 {
    if ((Balance.blast.aimMode as BlastAimMode) === 'auto') return autoTarget;
    return this.blastAimPoint;
  }

  private leadBlastAim(intents: Intents): void {
    const origin = this.hero.group.position;
    const dx = Math.abs(intents.move.x) > 0.01 ? intents.move.x : this.hero.velocity.x;
    const dz = Math.abs(intents.move.y) > 0.01 ? intents.move.y : this.hero.velocity.z;
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
    lastDetonation: { x: number; z: number } | null;
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
      lastDetonation: detonation ? { x: Number(detonation.x.toFixed(3)), z: Number(detonation.z.toFixed(3)) } : null,
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

  private reclaimGold(position: THREE.Vector3, amount: number): void {
    const reclaimed = this.reclaimAmount(amount);
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at: this.timeAlive,
      type: 'gold_reclaimed',
      amount: reclaimed,
    });
    if (!result.ok) return;
    this.reclaimedTotal += reclaimed;
    if (Balance.charm.coinTick > 0) this.audio.playCoin();
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
    this.hero.group.position.y = Terrain.visualY(this.hero.group.position.x, this.hero.group.position.z, this.heroStart.y);
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
    const x = this.hero.group.position.x;
    const z = this.hero.group.position.z;
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
    const x = this.hero.group.position.x;
    const z = this.hero.group.position.z;
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
    if (this.buildSystem.assayOfficeInRange(this.hero.group.position)) {
      this.openAssayBench?.();
      return;
    }
    if (this.upgradeCandidate) {
      if (this.confirmUpgrade()) return;
    }
    this.confirmDemolish();
  }

  private confirmUpgrade(): boolean {
    const candidate = this.upgradeCandidate;
    if (!candidate) return false;
    const upgraded = this.upgradeBuilding(candidate.id, candidate.index);
    if (upgraded) {
      this.upgradeCandidate = null;
      this.upgradeSuppressedKey = null;
      this.upgradePrompt.update(null, true);
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
      this.demolishPrompt.update(null, true);
    }
    return removed;
  }

  private cancelInteractionPrompts(): void {
    if (this.upgradeCandidate) this.upgradeSuppressedKey = upgradeKey(this.upgradeCandidate);
    if (this.demolishCandidate) this.demolishSuppressedKey = demolishKey(this.demolishCandidate);
    this.upgradeCandidate = null;
    this.demolishCandidate = null;
    this.upgradePrompt.update(null, true);
    this.demolishPrompt.update(null, true);
  }

  private upgradeBuilding(id: BuildableId, index: number): boolean {
    const upgraded = this.buildSystem.upgradeBuilding(id, index, this.timeAlive, this.hero.group.position);
    if (!upgraded) return false;
    this.syncStockpileHoldings();
    this.publishDiagnostics();
    return true;
  }

  private demolishBuilding(id: BuildableId, index: number): boolean {
    const removed = this.buildSystem.demolish(id, index, this.timeAlive, this.hero.group.position);
    if (!removed) return false;
    this.syncStockpileHoldings();
    this.publishDiagnostics();
    return true;
  }

  private selectBuildable(id: string): boolean {
    const selected = this.buildSystem.selectBuildable(id, true);
    if (selected) this.buildMenuOpen = false;
    return selected;
  }

  private selectBuildableByIndex(index: number): void {
    const def = buildableDefs[index];
    if (def) this.selectBuildable(def.id);
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
    this.hero.applyStats(stats.maxHpBonus, stats.moveSpeedMult);
    const platingHeal = upgradeDefById.tinkers_plating.deltas.heal;
    if (pickedId === 'tinkers_plating' && platingHeal !== undefined) {
      this.hero.heal(platingHeal);
    }
    const continued = continuedStudyBonuses(this.researchState);
    this.harvestSystem.applyStats(stats.panTickMult, stats.seamCapacityBonus, stats.seamRespawnReduction, 1 + continued.seamYieldMult);
    this.buildSystem.applyStats(stats.beaconFireRateMult, 1 + continued.turretDamageMult);
    this.agentPolicySlotBonus = Math.max(0, Math.floor(stats.agentPolicySlots));
    this.applyUpgradeCapEffects(stats);
    this.applyResearchEffects();
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

  private researchOverlayOptions(totalRounds: number): DeathOverlayOptions {
    this.researchState = loadResearchState(this.researchStorage);
    let roundsRemaining = Math.max(0, totalRounds);
    const state = (): DeathResearchState => ({
      totalRounds,
      roundsRemaining,
      science: scienceMeter(this.researchState),
      proposals: roundsRemaining > 0 ? availablePicks(this.researchState) : [],
    });

    return {
      research: state(),
      onResearchPick: (id) => {
        const next = takeNode(this.researchState, id);
        if (next !== this.researchState) {
          this.researchState = saveResearchState(this.researchStorage, next);
          roundsRemaining = Math.max(0, roundsRemaining - 1);
          this.applyResearchEffects();
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
    this.researchState = loadResearchState(this.researchStorage);
    for (let guard = 0; guard < 8 && !availablePicks(this.researchState).some((node) => node.id === id); guard += 1) {
      this.researchState = skipResearchPick(this.researchState);
    }
    const next = takeNode(this.researchState, id);
    if (next === this.researchState) return false;
    this.researchState = saveResearchState(this.researchStorage, next);
    this.applyResearchEffects();
    this.publishDiagnostics();
    return true;
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
  } {
    const meter = scienceMeter(this.researchState);
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
    };
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
      return;
    }
    const stacks = this.progression.snapshot.stacks;
    this.upgradeOverlay.show(
      offer.map((def) => ({
        def,
        familyStacks: upgradeDefs.reduce(
          (total, upgrade) => total + (upgrade.iconFamily === def.iconFamily ? (stacks[upgrade.id] ?? 0) : 0),
          0,
        ),
        effect:
          'filler' in def && def.filler === true
            ? resolveFiller(def, { wave: this.waveSystem.diagnostics.wave, maxHp: this.hero.maxHp }).effectText
            : undefined,
      })),
    );
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }
}

function legacySpawnPackOptions(count: number, radius?: number): SpawnPackOptions | undefined {
  return count === 5 && radius === 3 ? { speedScale: 0 } : undefined;
}

function demolishKey(candidate: DemolishCandidate): string {
  return `${candidate.id}:${candidate.index}`;
}

function upgradeKey(candidate: UpgradeCandidate): string {
  return `${candidate.id}:${candidate.index}:${candidate.tier}`;
}

function edgeFromPosition(position: THREE.Vector3): CompassEdge {
  return Math.abs(position.x) > Math.abs(position.z) ? (position.x >= 0 ? 'east' : 'west') : position.z >= 0 ? 'north' : 'south';
}

function edgePlace(edge: CompassEdge): string {
  if (edge === 'north') return 'north bank';
  if (edge === 'south') return 'south bank';
  if (edge === 'east') return 'east ridge';
  return 'west ridge';
}

function prospectorIntroAbility(level: number): string {
  if (level >= 2) return 'does trusted chores.';
  if (level >= 1) return 'can gather XP with approval.';
  return 'follows and observes.';
}

function pointFromUnknown(value: unknown): ProspectorPoint | null {
  if (typeof value !== 'object' || value === null) return null;
  const point = value as { x?: unknown; z?: unknown };
  return typeof point.x === 'number' && Number.isFinite(point.x) && typeof point.z === 'number' && Number.isFinite(point.z)
    ? { x: point.x, z: point.z }
    : null;
}

function percentile(sorted: readonly number[], ratio: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
