import * as THREE from 'three';
import { disposeGeneratedAssets, generatedAssetRenderCounts, generatedAssetStatuses } from '../assets/generated';
import { setSpriteTestClip, spriteAnimationDiagnostics } from '../assets/SpriteAnimator';
import { type AssetSlotId } from '../assets/slots';
import { EventBus } from '../core/EventBus';
import { install as installRunManager, type RunManager } from './RunManager';
import { install as installAgentStub, type AgentStub } from '../agent/AgentStub';
import {
  areWavesDisabled,
  getDebugSeed,
  getStressCount,
  getTimescale,
  isCharmPauseDisabled,
  isLevelUpDisabled,
  isPingDisabled,
  isSpawnDisabled,
  isStealDisabled,
  isWreckDisabled,
} from '../core/DebugParams';
import { InputController } from '../core/InputController';
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
import { Balance } from './Balance';
import { AudioSystem } from '../systems/AudioSystem';
import { Economy, initialEconomyState, reduce as reduceEconomy, summarizeLog, type EconomyEvent } from './Economy';
import { CameraRig } from '../systems/CameraRig';
import { BuildSystem } from '../systems/BuildSystem';
import { CombatSystem } from '../systems/CombatSystem';
import type { ShooterHandle } from '../systems/CombatSystem';
import { DebugTools, setBalance, type DebugTuning } from '../systems/DebugTools';
import { HarvestSystem } from '../systems/HarvestSystem';
import { UiBridge, type UiSnapshot } from '../systems/UiBridge';
import { WaveSystem, type SpawnPackOptions } from '../systems/WaveSystem';
import { CombatVfx } from '../systems/CombatVfx';
import { Vfx } from '../systems/Vfx';
import { TargetingSystem, type BuildingTarget, type GoldHolding } from '../systems/TargetingSystem';
import { DeathOverlay, type DeathLedger } from '../ui/DeathOverlay';
import { Hud, type UiIntent } from '../ui/Hud';
import { UpgradeOverlay, type UpgradeIntent } from '../ui/UpgradeOverlay';
import * as Terrain from '../world/Terrain';
import type { TerrainView } from '../world/Terrain';
import { GameState } from './GameState';
import { Progression } from './Progression';
import { resolveFiller } from './Upgrades';
import { clearScores, recordScore } from './Scoreboard';
import type { EffectiveStats } from './StatSheet';
import { upgradeDefById, type UpgradeId } from './Upgrades';
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
  private readonly buildSystem: BuildSystem;
  private readonly progression: Progression;
  private activeWeapon: 'rig' | 'blast' = 'rig';
  private blastDamageMult = 1;
  private blastRadiusMult = 1;
  private blastCooldownMult = 1;
  private weaponToggleCount = 0;
  private blastTime = 0;
  private readonly heroShooter: ShooterHandle = {
    id: 'hero',
    enabled: () => this.activeWeapon === 'rig',
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
    enabled: () => this.activeWeapon === 'blast',
    getPos: () => this.hero.group.position,
    range: Balance.blast.range,
    cooldown: Balance.blast.cooldown,
    damage: Balance.blast.damage,
    getDamage: () => this.currentBlastDamage(),
    projSpeed: 0,
    volley: Balance.blast.volley,
    aoe: { radius: Balance.blast.radius, airTime: Balance.blast.airTime },
  };
  private readonly simTimeScale = getTimescale();
  private harvestSnapshot = this.harvestSystem.snapshot;
  private readonly uiBridge = new UiBridge();
  private readonly hud: Hud;
  private readonly deathOverlay: DeathOverlay;
  private readonly upgradeOverlay: UpgradeOverlay;
  private readonly damageVignette = document.createElement('div');
  private readonly heroStart = new THREE.Vector3(0, 0.06, 12);
  private readonly debugSpawnPosition = new THREE.Vector3();
  private terrainView?: TerrainView;
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly waveSystem = new WaveSystem(
    this.enemies,
    this.hero.group.position,
    createRng(`${getDebugSeed() ?? 'gold-rush'}:waves`),
    (text, atSim) => this.uiBridge.announce(text, atSim),
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
  private frameMsCursor = 0;
  private frameMsLast = 0;
  private frameMsAvg = 0;
  private frameMsP95 = 0;
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

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;
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
      isChoiceDisabled: isLevelUpDisabled,
    });

    const stick = this.getElement('#touch-stick');
    const knob = this.getElement('#touch-knob');
    const confirmButton = this.getElement('#confirm-button');
    this.input = new InputController(stick, knob, confirmButton);
    this.hud = new Hud(this.getElement('#hud'), (intent) => this.handleUiIntent(intent));
    this.deathOverlay = new DeathOverlay(this.getElement('#app'), () => this.resetRun());
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
      });
      this.deathOverlay.show(this.deathLedger, scores, scoreAt);
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
          this.hero.velocity.set(0, 0, 0);
        },
        spawnPack: (n: number, radius?: number, opts?: SpawnPackOptions) =>
          this.spawnHarnessPack(n, radius, opts ?? legacySpawnPackOptions(n, radius)),
        spawnThief: (edge?: CompassEdge) => this.spawnHarnessThief(edge),
        spawnWrecker: (edge?: CompassEdge) => this.spawnHarnessWrecker(edge),
        wreck: (family: BuildableId, index: number) => this.wreckHarnessBuilding(family, index),
        resetRun: () => this.resetRun(),
        toggleWeapon: () => this.toggleWeapon(),
        warmVfx: () => this.vfx.warm(this.hero.group.position),
        clearScores: () => clearScores(),
        setBalance: (path: string, value: number | boolean) => setBalance(path, value),
        grantGold: (n: number) => {
          this.economy.apply({
            id: crypto.randomUUID(),
            at: this.timeAlive,
            type: 'gold_granted',
            source: 'debug',
            amount: n,
          });
        },
        grantXp: (n: number) => this.progression.debugGrant(n),
        maxUpgrades: () => this.progression.maxCoreForTest(),
        setFillersDisabled: (disabled: boolean) => this.progression.setFillersDisabled(disabled),
        economyLog: () => this.economy.log,
        summarizeLog: (log) => summarizeLog(log as readonly EconomyEvent[]),
        setBeaconWave: (wave: number | null) => {
          this.debugBeaconWaveOverride = wave;
        },
        setTestClip: (slot: string, frames: string[], fps: number) => setSpriteTestClip(slot as AssetSlotId, frames, fps),
        setBuildMode: (on: boolean) => this.buildSystem.setBuildMode(on),
        selectBuildable: (id: string) => this.selectBuildable(id),
        rotateBuildGhost: () => this.buildSystem.rotateGhost(),
        confirmBuild: () => this.buildSystem.confirm(this.timeAlive),
        enemyPositions: () =>
          this.enemies.all
            .filter((enemy) => enemy.isAlive)
            .map((enemy) => ({
              x: enemy.position.x,
              z: enemy.position.z,
              hp: enemy.currentHp,
              thief: enemy.isThief,
              wrecker: enemy.isWrecker,
              state: enemy.stealState,
              wreckState: enemy.wreckState,
              carried: enemy.carriedAmount,
              edge: enemy.ownEdge,
            })),
        spawnEnemyAt: (x: number, z: number) => this.enemies.spawn(new THREE.Vector3(x, Balance.enemy.groundY, z)) !== null,
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
          arsenal: this.arsenalDiagnostics(),
          buildables: this.buildSystem.buildableCounts,
          economy: {
            banked: this.economy.gold,
            bankCap: this.economy.bankCap,
          },
          steal: this.stealDiagnostics(),
          wreck: this.wreckDiagnostics(),
          balance: {
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
    this.agentStub = installAgentStub({ economyLog: () => this.economy.log });
    this.agentStub.heartbeat();
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.runManager?.dispose();
    this.agentStub?.dispose();
    this.loop.stop();
    this.input.dispose();
    this.hud.dispose();
    this.deathOverlay.dispose();
    this.upgradeOverlay.dispose();
    this.damageVignette.remove();
    this.debugTools.dispose();
    this.buildSystem.dispose();
    this.harvestSystem.dispose();
    this.combat.dispose();
    this.audio.dispose();
    this.vfx.dispose();
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
    this.recordFrameMs(delta * 1000);
    this.elapsed += delta;
    const intents = this.input.readIntents();
    if (intents.build && !this.lastBuildIntent) this.toggleBuildMenu();
    if (intents.buildSlot !== null && this.buildMenuOpen) this.selectBuildableByIndex(intents.buildSlot);
    if (intents.cancel && !this.lastCancelIntent && (this.buildMenuOpen || this.buildSystem.isBuildMode)) {
      this.closeBuildMenu();
    } else if (intents.pause && !this.lastPauseIntent) {
      this.state.togglePause();
    }
    if (intents.restart && !this.lastRestartIntent && this.state.current === 'dead') this.resetRun();
    if (intents.rotateBuild && !this.lastRotateIntent && this.buildSystem.isBuildMode) this.buildSystem.rotateGhost();
    if (intents.weaponToggle && !this.lastWeaponToggleIntent) this.toggleWeapon();
    if (intents.debugSpawn && !this.lastDebugSpawnIntent) this.spawnDebugPack();
    if (intents.debugXp && !this.lastDebugXpIntent && new URLSearchParams(window.location.search).has('debug')) {
      // Debug XP enters Progression's cumulative counter directly so motes and tests share one threshold path.
      this.progression.debugGrant(50);
    }
    if (intents.confirm && !this.lastConfirmIntent) this.buildSystem.confirm(this.timeAlive);
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
      this.combat.setTime(this.timeAlive);
      this.waveSystem.update(this.timeAlive);
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
    this.vfx.update(delta);
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.damageVignette.style.opacity = (this.damageFlashRemaining / Balance.hero.iframes).toFixed(3);
    this.syncUpgradeOverlay();
    this.syncUi();
    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
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
    this.scene.background = new THREE.Color('#c2e6ff');
    this.scene.fog = new THREE.Fog('#f5e6c8', 34, 70);

    const hemisphere = new THREE.HemisphereLight('#fff8e8', '#8b7d3c', 1.45);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight('#ffe4a0', 2.7);
    sun.position.set(-10, 14, -8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -48;
    sun.shadow.camera.right = 48;
    sun.shadow.camera.top = 48;
    sun.shadow.camera.bottom = -48;
    this.scene.add(sun);

    this.terrainView = Terrain.createTerrainView();
    this.scene.add(this.terrainView.group);
    this.scene.add(this.harvestSystem.group);
    this.scene.add(this.buildSystem.group);
    this.scene.add(this.projectiles.group);
    this.scene.add(this.blastCharges.group);
    this.scene.add(this.xpMotes.group);
    this.scene.add(this.goldPickups.group);
    this.scene.add(this.combatVfx.group);
    this.scene.add(this.vfx.group);
    this.scene.add(this.enemies.group);
    this.hero.group.position.copy(this.heroStart);
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
    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      timeAlive: this.timeAlive,
      runState: this.state.current,
      paused: this.state.isPaused,
      state: this.state.isPaused ? 'paused' : this.state.current,
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
      build: {
        ...this.buildSystem.diagnostics,
        killsByOwner: this.combat.killsByOwner,
      },
      progression: this.progression.snapshot,
      harvest: this.harvestSnapshot,
      steal: this.stealDiagnostics(),
      wreck: this.wreckDiagnostics(),
      charmPause: this.charmPauseActive,
      camImpulseActive: this.cameraRig.impulseActive,
      vfx: {
        activeFloatTexts: this.vfx.activeFloatTexts,
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
      terrain: {
        playerZone: Terrain.sample(this.hero.group.position.x, this.hero.group.position.z).zone,
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
    );
    this.hud.update(this.uiSnapshot);
  }

  private handleUiIntent(intent: UiIntent): void {
    if (intent.type === 'pause') this.state.togglePause();
    if (intent.type === 'restart' && this.state.current === 'dead') this.resetRun();
    if (intent.type === 'toggle_build_menu') this.toggleBuildMenu();
    if (intent.type === 'close_build_menu') this.closeBuildMenu();
    if (intent.type === 'select_buildable') this.selectBuildable(intent.id);
  }

  private handleUpgradeIntent(intent: UpgradeIntent): void {
    if (intent.type !== 'pick_upgrade' || this.state.current !== 'levelup') return;
    const picked = this.progression.offer?.[intent.index];
    if (picked) this.progression.applyUpgrade(picked.id);
  }

  resetRun(): void {
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'run_reset' });
    this.enemies.recycleAll();
    this.goldPickups.recycleAll();
    this.waveSystem.reset();
    this.buildMenuOpen = false;
    this.buildSystem.reset();
    this.harvestSystem.reset();
    this.combat.reset();
    this.activeWeapon = 'rig';
    this.weaponToggleCount = 0;
    this.blastTime = 0;
    this.progression.reset();
    this.hero.resetRun(this.heroStart);
    this.cameraRig.snapTo(this.hero.group.position);
    this.timeAlive = 0;
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
    this.uiBridge.announce('Stake your claim.', 0);
    this.upgradeOverlay.hide();
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
      if (snapshot) holding.position.set(snapshot.position.x, Balance.enemy.groundY, snapshot.position.z);
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
    this.weaponToggleCount += 1;
    return this.activeWeapon;
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
  } {
    return {
      active: this.activeWeapon,
      blastsAlive: this.combat.blastsAlive,
      detonations: this.combat.detonations,
      blastKills: this.combat.killsByOwner.hero_blast ?? 0,
      turretKills: this.combat.killsByOwner.turrets ?? 0,
      weaponToggles: this.weaponToggleCount,
      blastTime: this.blastTime,
      blastDamage: this.currentBlastDamage(),
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
    if (this.blastShooter.aoe) this.blastShooter.aoe.radius = Balance.blast.radius * this.blastRadiusMult;
    this.hero.applyStats(stats.maxHpBonus, stats.moveSpeedMult);
    if (pickedId === 'tinkers_plating' && 'heal' in upgradeDefById.tinkers_plating.deltas) {
      this.hero.heal(upgradeDefById.tinkers_plating.deltas.heal);
    }
    this.harvestSystem.applyStats(stats.panTickMult, stats.seamCapacityBonus, stats.seamRespawnReduction);
    this.buildSystem.applyStats(stats.beaconFireRateMult);
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
        stacks: stacks[def.id] ?? 0,
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

function edgeFromPosition(position: THREE.Vector3): CompassEdge {
  return Math.abs(position.x) > Math.abs(position.z) ? (position.x >= 0 ? 'east' : 'west') : position.z >= 0 ? 'north' : 'south';
}

function edgePlace(edge: CompassEdge): string {
  if (edge === 'north') return 'north bank';
  if (edge === 'south') return 'south bank';
  if (edge === 'east') return 'east ridge';
  return 'west ridge';
}
