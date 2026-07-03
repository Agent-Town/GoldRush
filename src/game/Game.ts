import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
import {
  areWavesDisabled,
  getDebugSeed,
  getStressCount,
  getTimescale,
  isCharmPauseDisabled,
  isLevelUpDisabled,
  isSpawnDisabled,
} from '../core/DebugParams';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { createRng } from '../core/Rng';
import { Hero } from '../entities/Hero';
import { ProjectilePool } from '../entities/Projectile';
import { XpMotePool } from '../entities/XpMote';
import { EnemyPool } from '../entities/pools';
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
import { WaveSystem } from '../systems/WaveSystem';
import { CombatVfx } from '../systems/CombatVfx';
import { Vfx } from '../systems/Vfx';
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

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly events = new EventBus();
  private readonly input: InputController;
  private readonly hero = new Hero();
  private readonly enemies = new EnemyPool();
  private readonly projectiles = new ProjectilePool();
  private readonly xpMotes = new XpMotePool();
  private readonly combatVfx = new CombatVfx();
  private readonly audio = new AudioSystem();
  private readonly state = new GameState();
  private readonly economy = new Economy();
  private readonly harvestSystem = new HarvestSystem(this.economy, Terrain.nodeAnchors, undefined, () => {
    if (Balance.charm.coinTick > 0) this.audio.playCoin();
  });
  private readonly vfx = new Vfx();
  private readonly combat = new CombatSystem(
    this.events,
    this.hero,
    this.enemies,
    this.projectiles,
    this.xpMotes,
    this.combatVfx,
    this.audio,
    () => this.endRun(),
    (position, value) => this.vfx.floatText(position, `+${value}`, '#83ded7'),
    (position) => this.onEnemyKilled(position),
  );
  private readonly buildSystem: BuildSystem;
  private readonly progression: Progression;
  private readonly heroShooter: ShooterHandle = {
    getPos: () => this.hero.group.position,
    range: Balance.sparkRig.range,
    cooldown: 1 / Balance.sparkRig.fireRate,
    damage: Balance.sparkRig.damage,
    projSpeed: Balance.sparkRig.boltSpeed,
    volley: Balance.sparkRig.volley,
  };
  private readonly simTimeScale = getTimescale();
  private harvestSnapshot = this.harvestSystem.snapshot;
  private readonly uiBridge = new UiBridge();
  private readonly hud: Hud;
  private readonly deathOverlay: DeathOverlay;
  private readonly upgradeOverlay: UpgradeOverlay;
  private readonly damageVignette = document.createElement('div');
  private readonly heroStart = new THREE.Vector3(0, 0.06, 12);
  private terrainView?: TerrainView;
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly waveSystem = new WaveSystem(
    this.enemies,
    this.hero.group.position,
    createRng(`${getDebugSeed() ?? 'gold-rush'}:waves`),
    (text, atSim) => this.uiBridge.announce(text, atSim),
    areWavesDisabled,
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
  private lastPauseIntent = false;
  private lastRestartIntent = false;
  private lastBuildIntent = false;
  private lastConfirmIntent = false;
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
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;
    this.buildSystem = new BuildSystem(
      canvas,
      this.camera,
      this.economy,
      this.combat,
      this.hero.group.position,
      () => this.debugBeaconWaveOverride ?? this.waveSystem.diagnostics.wave,
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

    this.debugTools = new DebugTools(this.tuning, () => {
      (Balance.render as { exposure: number; maxDpr: number }).exposure = this.tuning.exposure;
      (Balance.render as { exposure: number; maxDpr: number }).maxDpr = this.tuning.maxDpr;
      this.renderer.toneMappingExposure = this.tuning.exposure;
      this.applyCameraTuning();
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    });

    this.createScene();
    if (new URLSearchParams(window.location.search).has('debug')) {
      // Test/debug harness: parking-free positioning for interaction e2e.
      window.__GR_TEST__ = {
        teleport: (x: number, z: number) => {
          this.hero.group.position.set(x, this.hero.group.position.y, z);
          this.hero.velocity.set(0, 0, 0);
        },
        spawnPack: (n: number, radius?: number) => this.spawnDebugPack(n, radius),
        resetRun: () => this.resetRun(),
        warmVfx: () => this.vfx.warm(this.hero.group.position),
        clearScores: () => clearScores(),
        setBalance: (path: string, value: number) => setBalance(path, value),
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
        setBuildMode: (on: boolean) => this.buildSystem.setBuildMode(on),
        placeBeacon: () => {
          this.buildSystem.setBuildMode(true);
          return this.buildSystem.confirm(this.timeAlive);
        },
        state: () => ({
          enemiesAlive: this.enemies.activeCount,
          xp: this.combat.xpCount,
          boltsAlive: this.combat.boltsAlive,
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
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
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
    this.enemies.dispose();
    this.hero.dispose();
    this.events.clear();
    this.renderer.dispose();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): void {
    this.frame += 1;
    this.recordFrameMs(delta * 1000);
    this.elapsed += delta;
    const intents = this.input.readIntents();
    if (intents.pause && !this.lastPauseIntent) this.state.togglePause();
    if (intents.restart && !this.lastRestartIntent && this.state.current === 'dead') this.resetRun();
    if (intents.build && !this.lastBuildIntent) this.buildSystem.toggleBuildMode();
    if (intents.debugSpawn && !this.lastDebugSpawnIntent) this.spawnDebugPack();
    if (intents.debugXp && !this.lastDebugXpIntent && new URLSearchParams(window.location.search).has('debug')) {
      // Debug XP enters Progression's cumulative counter directly so motes and tests share one threshold path.
      this.progression.debugGrant(50);
    }
    if (intents.confirm && !this.lastConfirmIntent) this.buildSystem.confirm(this.timeAlive);
    this.lastPauseIntent = intents.pause;
    this.lastRestartIntent = intents.restart;
    this.lastBuildIntent = intents.build;
    this.lastConfirmIntent = intents.confirm;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.lastDebugXpIntent = intents.debugXp;
    this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);
    this.updateCharmPause(delta);

    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    if (this.state.simActive) {
      const simDelta = delta * this.simTimeScale;
      this.timeAlive += simDelta;
      this.terrainView?.update(simDelta);
      this.hero.update(simDelta, intents, { bounds: Terrain.bounds, sample: Terrain.sample });
      this.combat.setTime(this.timeAlive);
      this.waveSystem.update(this.timeAlive);
      this.buildSystem.update(this.timeAlive);
      this.enemies.update(simDelta, this.hero.group.position, this.combat.handleEnemyContact);
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
    this.scene.add(this.xpMotes.group);
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
      this.progression.xpInto,
      this.progression.xpNeed,
      this.progression.level,
      this.waveSystem.diagnostics.wave,
      this.waveSystem.diagnostics.waveState,
      this.buildSystem.isBuildMode,
      this.buildSystem.beaconCount,
      Balance.beacon.maxCount,
      this.buildSystem.nextCost,
      this.buildSystem.canAffordNext,
    );
    this.hud.update(this.uiSnapshot);
  }

  private handleUiIntent(intent: UiIntent): void {
    if (intent.type === 'pause') this.state.togglePause();
    if (intent.type === 'restart' && this.state.current === 'dead') this.resetRun();
    if (intent.type === 'toggle_build') this.buildSystem.toggleBuildMode();
  }

  private handleUpgradeIntent(intent: UpgradeIntent): void {
    if (intent.type !== 'pick_upgrade' || this.state.current !== 'levelup') return;
    const picked = this.progression.offer?.[intent.index];
    if (picked) this.progression.applyUpgrade(picked.id);
  }

  resetRun(): void {
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'run_reset' });
    this.enemies.recycleAll();
    this.waveSystem.reset();
    this.buildSystem.reset();
    this.harvestSystem.reset();
    this.combat.reset();
    this.progression.reset();
    this.hero.resetRun(this.heroStart);
    this.cameraRig.snapTo(this.hero.group.position);
    this.timeAlive = 0;
    this.kills = 0;
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
    });
  }

  private spawnDebugPack(count: number = Balance.enemy.debugPackSize, radius: number = Balance.enemy.debugPackRadius): void {
    if (isSpawnDisabled() || this.state.current !== 'playing') return;
    this.waveSystem.spawnDebugPack(count, radius);
  }

  private applyStats(stats: EffectiveStats, pickedId: UpgradeId | null): void {
    this.heroShooter.cooldown = 1 / (Balance.sparkRig.fireRate * stats.fireRateMult);
    this.heroShooter.damage = Balance.sparkRig.damage * stats.damageMult;
    this.heroShooter.range = Balance.sparkRig.range * stats.rangeMult;
    this.heroShooter.projSpeed = Balance.sparkRig.boltSpeed * stats.boltSpeedMult;
    this.heroShooter.volley = Balance.sparkRig.volley + stats.volleyBonus;
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
