import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
import { getStressCount, getTimescale, isSpawnDisabled } from '../core/DebugParams';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { Hero } from '../entities/Hero';
import { EnemyPool } from '../entities/pools';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { Balance } from './Balance';
import { Economy, initialEconomyState, reduce as reduceEconomy } from './Economy';
import { CameraRig } from '../systems/CameraRig';
import { DebugTools, type DebugTuning } from '../systems/DebugTools';
import { HarvestSystem } from '../systems/HarvestSystem';
import { UiBridge, type UiSnapshot } from '../systems/UiBridge';
import { Vfx } from '../systems/Vfx';
import { DeathOverlay, type DeathLedger } from '../ui/DeathOverlay';
import { Hud, type UiIntent } from '../ui/Hud';
import * as Terrain from '../world/Terrain';
import type { TerrainView } from '../world/Terrain';
import { GameState } from './GameState';

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly events = new EventBus();
  private readonly input: InputController;
  private readonly hero = new Hero();
  private readonly enemies = new EnemyPool();
  private readonly state = new GameState();
  private readonly economy = new Economy();
  private readonly harvestSystem = new HarvestSystem(this.economy, Terrain.nodeAnchors);
  private readonly vfx = new Vfx();
  private readonly simTimeScale = getTimescale();
  private harvestSnapshot = this.harvestSystem.snapshot;
  private readonly uiBridge = new UiBridge();
  private readonly hud: Hud;
  private readonly deathOverlay: DeathOverlay;
  private readonly damageVignette = document.createElement('div');
  private readonly heroStart = new THREE.Vector3(0, 0.06, 12);
  private readonly spawnCenter = new THREE.Vector3();
  private terrainView?: TerrainView;
  private readonly cameraRig = new CameraRig(this.camera);
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
  private goldPanned = 0;
  private damageFlashRemaining = 0;
  private readonly frameMsSamples: number[] = [];
  private frameMsCursor = 0;
  private frameMsLast = 0;
  private frameMsAvg = 0;
  private frameMsP95 = 0;
  private lastPauseIntent = false;
  private lastRestartIntent = false;
  private lastDebugSpawnIntent = false;
  private uiSnapshot?: UiSnapshot;
  private deathLedger: DeathLedger = {
    timeAlive: 0,
    kills: 0,
    goldPanned: 0,
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;

    const stick = this.getElement('#touch-stick');
    const knob = this.getElement('#touch-knob');
    const confirmButton = this.getElement('#confirm-button');
    this.input = new InputController(stick, knob, confirmButton);
    this.hud = new Hud(this.getElement('#hud'), (intent) => this.handleUiIntent(intent));
    this.deathOverlay = new DeathOverlay(this.getElement('#app'), () => this.resetRun());
    this.damageVignette.className = 'damage-vignette';
    this.getElement('#app').append(this.damageVignette);
    this.events.on('hero_died', (event) => {
      this.deathLedger = {
        timeAlive: event.timeAlive,
        kills: event.kills,
        goldPanned: event.goldPanned,
      };
      this.deathOverlay.show(this.deathLedger);
    });

    this.debugTools = new DebugTools(this.tuning, () => {
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
      };
    }
    this.cameraRig.snapTo(this.hero.group.position);
    this.state.transition('playing');
    this.spawnStressEnemies();
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
    this.damageVignette.remove();
    this.debugTools.dispose();
    this.harvestSystem.dispose();
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
    if (intents.debugSpawn && !this.lastDebugSpawnIntent) this.spawnDebugPack();
    this.lastPauseIntent = intents.pause;
    this.lastRestartIntent = intents.restart;
    this.lastDebugSpawnIntent = intents.debugSpawn;
    this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - delta);

    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    if (this.state.simActive) {
      const simDelta = delta * this.simTimeScale;
      this.timeAlive += simDelta;
      this.terrainView?.update(simDelta);
      this.hero.update(simDelta, intents, { bounds: Terrain.bounds, sample: Terrain.sample });
      this.enemies.update(simDelta, this.hero.group.position, (enemy) => this.handleEnemyContact(enemy));
      this.harvestSnapshot = this.harvestSystem.update(
        simDelta,
        this.timeAlive,
        this.hero.group.position,
        this.hero.velocity.length(),
      );
      if (this.harvestSnapshot.lastGoldGain > 0) {
        this.goldPanned += this.harvestSnapshot.lastGoldGain;
        this.vfx.floatText(this.hero.group.position, `+${this.harvestSnapshot.lastGoldGain}`, '#c4883a');
      }
    }
    this.vfx.update(delta);
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.damageVignette.style.opacity = (this.damageFlashRemaining / Balance.hero.iframes).toFixed(3);
    this.syncUi();
    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
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
      kills: this.kills,
      goldPanned: this.goldPanned,
      deathLedger: this.deathLedger,
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
      },
      harvest: this.harvestSnapshot,
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
    );
    this.hud.update(this.uiSnapshot);
  }

  private handleUiIntent(intent: UiIntent): void {
    if (intent.type === 'pause') this.state.togglePause();
    if (intent.type === 'restart' && this.state.current === 'dead') this.resetRun();
  }

  resetRun(): void {
    this.economy.apply({ id: crypto.randomUUID(), at: this.timeAlive, type: 'run_reset' });
    this.enemies.recycleAll();
    this.hero.resetRun(this.heroStart);
    this.cameraRig.snapTo(this.hero.group.position);
    this.timeAlive = 0;
    this.kills = 0;
    this.goldPanned = 0;
    this.damageFlashRemaining = 0;
    this.damageVignette.style.opacity = '0';
    this.deathOverlay.hide();
    this.deathLedger = {
      timeAlive: 0,
      kills: 0,
      goldPanned: 0,
    };
    this.state.restart();
  }

  private handleEnemyContact(enemy: ClaimJumperEnemy): void {
    const result = this.hero.takeDamage(Balance.enemy.contactDamage);
    if (!result.applied) return;

    this.damageFlashRemaining = Balance.hero.iframes;
    this.events.emit({
      type: 'hero_damaged',
      at: this.timeAlive,
      amount: Balance.enemy.contactDamage,
      hp: this.hero.hp,
      maxHp: this.hero.maxHp,
      sourceId: enemy.id,
    });

    if (result.died) {
      this.endRun();
    }
  }

  private endRun(): void {
    if (this.state.current === 'dead') return;
    this.state.transition('dead');
    this.events.emit({
      type: 'hero_died',
      at: this.timeAlive,
      timeAlive: this.timeAlive,
      kills: this.kills,
      goldPanned: this.economy.gold,
    });
  }

  private spawnDebugPack(): void {
    if (isSpawnDisabled() || this.state.current !== 'playing') return;
    this.spawnCenter.copy(this.hero.group.position);
    this.enemies.spawnPack(this.spawnCenter, Balance.enemy.debugPackSize);
  }

  private spawnStressEnemies(): void {
    if (isSpawnDisabled()) return;
    const stressCount = getStressCount();
    if (stressCount <= 0) return;

    const center = this.hero.group.position;
    const radius = 15;
    for (let i = 0; i < stressCount; i += 1) {
      const angle = (i / Math.max(1, stressCount)) * Math.PI * 2;
      const speedScale = 1 + (((i % 7) - 3) / 3) * Balance.enemy.speedVariance;
      const position = new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        Balance.enemy.groundY,
        center.z + Math.sin(angle) * radius,
      );
      if (!this.enemies.spawn(position, speedScale)) return;
    }
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }
}
