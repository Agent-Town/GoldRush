import * as THREE from 'three';
import { install, type AgentBuildingRef, type AgentGameAdapter, type GoldRushToolSurface, type ToolReceipt } from '../agent/ToolSurface';
import {
  observeStandingOrders,
  snapshotStandingOrders,
  type StandingOrdersView,
} from '../agent/StandingOrders';
import type { AgentView } from '../agent/View';
import type { SoundSystem } from '../audio/SoundSystem';
import { createRng } from '../core/Rng';
import { EventBus, type GameEvent } from '../core/EventBus';
import type { Intents } from '../core/InputController';
import { BlastChargePool } from '../entities/BlastCharge';
import { EnemyPool } from '../entities/pools';
import { Hero } from '../entities/Hero';
import { ProjectilePool } from '../entities/Projectile';
import { ProspectorEmbodiment } from '../agent/Embodiment';
import { RUN_CAST_SCALE } from '../entities/runCastScale';
import { XpMotePool } from '../entities/XpMote';
import { Balance } from '../game/Balance';
import { Economy, type EconomyEvent } from '../game/Economy';
import { isBuildableId } from '../game/buildables';
import { loadContract, type ContractManifest } from '../meta/ContractFamilies';
import { stableHash } from '../mp/LockstepClient';
import { BuildSystem } from '../systems/BuildSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { CombatVfx } from '../systems/CombatVfx';
import { HarvestSystem, type HarvestSnapshot, type HarvestTarget } from '../systems/HarvestSystem';
import { TargetingSystem, type GoldHolding } from '../systems/TargetingSystem';
import { WaveSystem } from '../systems/WaveSystem';
import * as Terrain from '../world/Terrain';

const STEP_SECONDS = 1 / 30;
const SUPPORTED_CONTRACTS = new Set(['e1-dry-gulch', 'the-claim', 'e1-night-shift']);

export type GrSimOutcome = {
  secured: boolean;
  waves: number;
  timeMs: number;
  gold: number;
  kills: number;
  calls: number;
  eventLogHash: string;
};

export type GrSimTurn = {
  view: AgentView;
  terminal: boolean;
};

const NO_AUDIO = {
  playBuildingDamage: () => undefined,
  playDetonation: () => undefined,
  playHit: () => undefined,
  playKill: () => undefined,
  playShot: () => undefined,
} as unknown as SoundSystem;

const IDLE_INTENTS: Intents = {
  move: new THREE.Vector2(),
  confirm: false,
  upgrade: false,
  rotateBuild: false,
  weaponToggle: false,
  build: false,
  cancel: false,
  buildSlot: null,
  restart: false,
  pause: false,
  mute: false,
  debugSpawn: false,
  debugXp: false,
  debugPlant: false,
};

export class HeadlessContractSim {
  readonly manifest: ContractManifest;

  private readonly events = new EventBus();
  private readonly economy = new Economy();
  private readonly enemies = new EnemyPool();
  private readonly hero = new Hero(RUN_CAST_SCALE);
  private readonly prospector = new ProspectorEmbodiment(() => undefined);
  private readonly projectiles = new ProjectilePool();
  private readonly blastCharges = new BlastChargePool();
  private readonly xpMotes = new XpMotePool();
  private readonly combatVfx = new CombatVfx();
  private readonly targeting = new TargetingSystem();
  private readonly harvest: HarvestSystem;
  private readonly combat: CombatSystem;
  private readonly build: BuildSystem;
  private readonly waves: WaveSystem;
  private readonly stockpileHoldings: GoldHolding[] = Array.from(
    { length: Balance.stockpile.maxCount },
    (_, index) => ({
      id: `stockpile:${index}`,
      kind: 'stockpile',
      position: new THREE.Vector3(),
      active: false,
      amount: 0,
    }),
  );
  private readonly replayEvents: unknown[] = [];
  private readonly surface: GoldRushToolSurface;
  private harvestSnapshot: HarvestSnapshot;
  private timeAlive = 0;
  private kills = 0;
  private calls = 0;
  private economySequence = 0;
  private secured = false;
  private dead = false;
  private lastTurnWave = -1;
  private lastSurpriseSeq = 0;
  private advanceCpuMs = 0;
  private prospectorHarvesting = false;
  private buildingHits = 0;

  constructor(readonly contractId: string, readonly seed: string) {
    if (!SUPPORTED_CONTRACTS.has(contractId)) {
      throw new Error(`AP-07 supports only ${[...SUPPORTED_CONTRACTS].join(', ')}; received ${contractId}.`);
    }
    this.manifest = loadContract(contractId);
    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.lossCondition);
    const start = new THREE.Vector3(stake?.x ?? 0, 0.06, stake?.z ?? 12);
    this.hero.resetRun(start);
    this.prospector.reset(start);

    this.harvest = new HarvestSystem(
      this.economy,
      this.manifest.tileParams.harvestAnchors ?? Terrain.nodeAnchors,
      createRng(`${seed}:harvest`),
    );
    this.harvest.applyStats(1, 0, 0, this.manifest.twist.seamYieldMult ?? 1);
    this.harvestSnapshot = this.harvest.snapshot;

    this.combat = new CombatSystem(
      this.events,
      [this.hero],
      this.enemies,
      this.projectiles,
      this.blastCharges,
      this.xpMotes,
      this.combatVfx,
      NO_AUDIO,
      () => {
        this.dead = true;
      },
    );
    this.registerHeroShooter();
    this.build = new BuildSystem(
      headlessCanvas(),
      new THREE.PerspectiveCamera(),
      this.economy,
      this.combat,
      this.targeting,
      this.prospector.position,
      () => this.waves?.diagnostics.wave ?? 0,
    );
    for (const fixture of this.manifest.tileParams.prePlacedBuildables ?? []) {
      this.build.placeFree(fixture.id, fixture, fixture.rotationSteps ?? 0, {
        wrecked: fixture.wrecked,
        repairCost: fixture.relightCost,
        preplaced: true,
      });
    }
    for (const holding of this.stockpileHoldings) this.targeting.registerGoldHolding(holding);

    this.waves = new WaveSystem(
      this.enemies,
      this.hero.group.position,
      createRng(`${seed}:waves`),
      (text, at, wave) => this.replayEvents.push({ type: 'announcement', at, wave: wave ?? null, text }),
      (wave, at) => this.startWave(wave, at),
      () => false,
      () => this.manifest,
      () => this.build.diagnostics.stockpilesState.some((entry) => entry.active),
      () => this.build.hasAnyBuildable,
      () => this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isThief).length,
    );

    const adapter: AgentGameAdapter = {
      diagnostics: () => this.diagnostics(),
      economyLog: () => this.economy.log,
      standingOrders: () => snapshotStandingOrders(),
      placeBuilding: (def, pos, rot = 0) => this.build.confirmPlacement(this.timeAlive, {
        id: def,
        position: pos,
        rotationSteps: normalizeRotation(rot),
      }),
      panAt: (node) => this.panAt(node),
      repair: (building) => this.repairBuilding(building),
    };
    this.surface = install(adapter, { permissionLevel: 3 });
    this.bindEventLog();
    this.economy.apply(this.economyEvent({ type: 'run_reset' }));
    this.replayEvents.push({ type: 'run_started', at: 0, contractId, seed });
  }

  currentTurn(): GrSimTurn {
    return this.makeTurn();
  }

  submitOrders(orders: unknown): ToolReceipt<'et.goldrush.orders', { orders: unknown }> {
    this.calls += 1;
    const receipt = this.surface.tools.submit_orders(orders);
    this.replayEvents.push({
      type: 'orders',
      at: round(this.timeAlive),
      orders: structuredClone(orders),
      ok: receipt.outcome.ok,
      ...(receipt.outcome.ok ? {} : { reason: receipt.outcome.reason, message: receipt.outcome.message }),
    });
    return receipt;
  }

  advanceToTurn(): GrSimTurn {
    const started = performance.now();
    const secureWave = this.manifest.twist.secureWave ?? Balance.run.secureWave;
    const maxTicks = Math.ceil(((secureWave + 2) * Balance.waves.waveInterval) / STEP_SECONDS);
    for (let tick = 0; tick < maxTicks && !this.terminal; tick += 1) {
      this.step();
      const orders = snapshotStandingOrders();
      const surpriseSeq = latestSurpriseSeq(orders);
      if (this.terminal || this.waves.diagnostics.wave !== this.lastTurnWave || surpriseSeq > this.lastSurpriseSeq) {
        this.advanceCpuMs += performance.now() - started;
        return this.makeTurn(orders);
      }
    }
    this.advanceCpuMs += performance.now() - started;
    throw new Error(`Contract did not terminate within ${maxTicks} fixed steps.`);
  }

  outcome(): GrSimOutcome {
    if (!this.terminal) throw new Error('Outcome requested before the contract terminated.');
    const waves = this.waves.diagnostics.wave;
    const base = {
      secured: this.secured,
      waves,
      timeMs: Math.round(this.timeAlive * 1000),
      gold: round(this.economy.gold),
      kills: this.kills,
      calls: this.calls,
    };
    const eventLogHash = stableHash({
      contractId: this.contractId,
      seed: this.seed,
      events: this.replayEvents,
      economy: this.economy.log.map(({ id: _id, ...event }) => event),
      orders: snapshotStandingOrders(),
      final: {
        ...base,
        hero: point(this.hero.group.position),
        hp: round(this.hero.hp),
        enemies: this.enemies.all
          .filter((enemy) => enemy.isAlive)
          .map((enemy) => ({ id: enemy.id, hp: round(enemy.currentHp), position: point(enemy.position) })),
        buildings: this.build.diagnostics.hp,
      },
    });
    return { ...base, eventLogHash };
  }

  get wavesPerSecond(): number {
    return this.advanceCpuMs > 0 ? this.waves.diagnostics.wave / (this.advanceCpuMs / 1000) : 0;
  }

  private get terminal(): boolean {
    return this.secured || this.dead;
  }

  private step(): void {
    this.timeAlive += STEP_SECONDS;
    this.hero.update(STEP_SECONDS, IDLE_INTENTS, { bounds: Terrain.bounds, sample: Terrain.sample });
    this.combat.setTime(this.timeAlive);
    this.waves.update(this.timeAlive);
    this.build.update(
      STEP_SECONDS,
      this.timeAlive,
      this.enemies.all,
      () => undefined,
      () => undefined,
      this.prospector.position,
    );
    this.syncStockpileHoldings();
    this.enemies.update(STEP_SECONDS, this.hero.group.position, (enemy) => {
      this.combat.handleEnemyContact(enemy);
      return this.dead;
    }, this.build.palisadeBlockers, {
      nearestGoldHolding: (from) => this.targeting.nearestGoldHolding(from),
      claimGold: (enemy, holding) => this.claimGold(enemy, holding),
      onThiefFled: (enemy) => {
        enemy.releaseCarriedGold();
        this.enemies.recycle(enemy);
      },
    }, {
      nearestBuilding: (from) => this.waves.preferredEscortTarget(from) ?? this.targeting.nearestBuilding(from),
      hitBuilding: (enemy, target, amount) => this.combat.handleBuildingHit(enemy, target, amount),
      palisadeRoute: (from, to, clearance) => this.build.palisadeRoute(from, to, clearance),
    });
    this.harvestSnapshot = this.harvest.update(STEP_SECONDS, this.timeAlive, this.harvestTargets());
    this.combat.update(STEP_SECONDS, this.timeAlive);
    this.prospector.updateSimulation(STEP_SECONDS, this.timeAlive, this.hero.group.position);
    observeStandingOrders();
  }

  private makeTurn(orders = snapshotStandingOrders()): GrSimTurn {
    this.lastTurnWave = this.waves.diagnostics.wave;
    this.lastSurpriseSeq = latestSurpriseSeq(orders);
    const receipt = this.surface.tools.view();
    if (!receipt.outcome.ok || !receipt.outcome.state) throw new Error('THE VIEW was unavailable.');
    return { view: receipt.outcome.state as AgentView, terminal: this.terminal };
  }

  private startWave(wave: number, at: number): boolean | void {
    this.events.emit({ type: 'wave_started', at, wave });
    if (wave < (this.manifest.twist.secureWave ?? Balance.run.secureWave)) return;
    this.secured = true;
    this.replayEvents.push({ type: 'run_secured', at, wave });
    return false;
  }

  private bindEventLog(): void {
    for (const type of ['hero_damaged', 'enemy_killed', 'wave_started', 'building_damaged', 'building_wrecked'] as const) {
      this.events.on(type, (event) => {
        if (event.type === 'enemy_killed') this.kills += 1;
        if (event.type === 'building_damaged') this.buildingHits += 1;
        this.replayEvents.push(canonicalEvent(event));
      });
    }
  }

  private registerHeroShooter(): void {
    this.combat.registerShooter({
      id: 'hero',
      resumeKey: 'hero:0:rig',
      enabled: () => !this.dead,
      getPos: () => this.hero.group.position,
      range: Balance.sparkRig.range,
      cooldown: 1 / Balance.sparkRig.fireRate,
      damage: Balance.sparkRig.damage,
      projSpeed: Balance.sparkRig.boltSpeed,
      volley: Balance.sparkRig.volley,
    });
  }

  private diagnostics(): unknown {
    const wave = this.waves.diagnostics;
    const orders = snapshotStandingOrders();
    return {
      contract: {
        activeId: this.manifest.id,
        name: this.manifest.name,
        tileParams: this.manifest.tileParams,
        briefing: this.manifest.briefing,
        waveCadenceMult: this.manifest.twist.waveCadenceMult ?? 1,
      },
      wave: wave.wave,
      timeAlive: this.timeAlive,
      nextWaveInSim: wave.nextWaveInSim,
      economy: this.economy.state,
      hp: this.hero.hp,
      maxHp: this.hero.maxHp,
      heroPos: point(this.hero.group.position),
      build: {
        hp: this.build.diagnostics.hp,
        sluicePositions: this.build.diagnostics.sluicePositions,
      },
      enemiesAlive: this.enemies.activeCount,
      waveState: wave.waveState,
      edge: wave.edge,
      steal: { thieves: this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isThief).length },
      wreck: {
        wreckers: this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isWrecker).length,
        hitsResolved: this.buildingHits,
      },
      harvest: this.harvestSnapshot,
      kills: this.kills,
      runState: this.dead ? 'dead' : this.secured ? 'secured' : 'playing',
      run: { secured: this.secured },
      progression: {
        stats: {
          damageMult: 1,
          fireRateMult: 1,
          rangeMult: 1,
          moveSpeedMult: 1,
          panTickMult: 1,
          maxHpBonus: 0,
          beaconFireRateMult: 1,
        },
      },
      agent: {
        needsRider: orders.needsRider,
        orders: orders.orders,
        surprises: orders.log.flatMap((event) => event.type === 'surprise' && event.surprise ? [event.surprise] : []),
        embodiment: this.prospector.snapshot,
      },
    };
  }

  private repairBuilding(ref: AgentBuildingRef): unknown {
    if (!isBuildableId(ref.id)) return false;
    const index = Number.isInteger(ref.index) ? ref.index! : 0;
    return this.build.repairBuilding(ref.id, index, this.timeAlive, this.prospector.position);
  }

  private panAt(node: string): unknown {
    const seam = this.harvestSnapshot.activeNodes.find((entry) => entry.id === node && entry.active);
    const sluiceIndex = /^sluice-(\d+)$/.exec(node)?.[1];
    const sluice = sluiceIndex ? this.build.diagnostics.sluicePositions[Number(sluiceIndex) - 1] : undefined;
    const position = seam?.position ?? sluice;
    if (!position) return false;
    this.prospectorHarvesting = Boolean(seam);
    this.prospector.assignWork(position);
    return { node, position };
  }

  private harvestTargets(): HarvestTarget[] {
    const targets: HarvestTarget[] = [{ actorId: '0', position: this.hero.group.position, speed: this.hero.velocity.length() }];
    if (this.prospectorHarvesting) {
      targets.push({ actorId: 'prospector', position: this.prospector.position, speed: 0 });
    }
    return targets;
  }

  private syncStockpileHoldings(): void {
    const stockpiles = this.build.diagnostics.stockpilesState;
    for (let index = 0; index < this.stockpileHoldings.length; index += 1) {
      const holding = this.stockpileHoldings[index];
      const stockpile = stockpiles[index];
      if (!holding) continue;
      holding.active = stockpile?.active === true;
      holding.amount = holding.active ? this.economy.gold : 0;
      if (stockpile) holding.position.set(stockpile.position.x, 0, stockpile.position.z);
    }
  }

  private claimGold(_enemy: { releaseCarriedGold(): number }, holding: GoldHolding): number {
    const amount = Math.min(Balance.steal.grabAmount, this.economy.gold);
    if (holding.kind !== 'stockpile' || amount <= 0) return 0;
    const result = this.economy.apply(this.economyEvent({ type: 'gold_stolen', amount }));
    if (!result.ok) return 0;
    this.syncStockpileHoldings();
    return amount;
  }

  private economyEvent<T extends Omit<EconomyEvent, 'id' | 'at'>>(event: T): EconomyEvent {
    return {
      id: `gr-sim-${++this.economySequence}`,
      at: this.timeAlive,
      ...event,
    } as EconomyEvent;
  }
}

function canonicalEvent(event: GameEvent): unknown {
  return structuredClone(event);
}

function latestSurpriseSeq(orders: StandingOrdersView): number {
  return orders.log.reduce((seq, event) => event.type === 'surprise' ? Math.max(seq, event.seq) : seq, 0);
}

function normalizeRotation(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const steps = Number.isInteger(value) ? value : Math.round(value / (Math.PI / 2));
  return ((steps % 4) + 4) % 4;
}

function point(value: { x: number; z: number }): { x: number; z: number } {
  return { x: round(value.x), z: round(value.z) };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function headlessCanvas(): HTMLCanvasElement {
  return {
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  } as unknown as HTMLCanvasElement;
}
