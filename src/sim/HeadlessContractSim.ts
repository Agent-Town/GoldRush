import * as THREE from 'three';
import { mechanicsBuildableIds } from '../agent/MechanicsManifest';
import { install, type AgentBuildingRef, type AgentGameAdapter, type GoldRushToolSurface, type ToolReceipt } from '../agent/ToolSurface';
import {
  bindStandingOrderBlast,
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
import { Economy, summarizeLog, type EconomyEvent } from '../game/Economy';
import { GameState } from '../game/GameState';
import { Progression } from '../game/Progression';
import type { EffectiveStats } from '../game/StatSheet';
import { upgradeDefById } from '../game/Upgrades';
import { isBuildableId } from '../game/buildables';
import { RunManager } from '../game/RunManager';
import { loadContract, type ContractBaronTwist, type ContractManifest, type ContractPowerGrid, type ContractRunBoot } from '../meta/ContractFamilies';
import { stableHash, type LockstepAction } from '../mp/LockstepClient';
import { AtomicSocket } from './AtomicSocket';
import { DeepwaterSocket } from './DeepwaterSocket';
import { BuildSystem } from '../systems/BuildSystem';
import { CombatSystem, type ShooterHandle } from '../systems/CombatSystem';
import { CombatVfx } from '../systems/CombatVfx';
import { CrawlerBossSystem } from '../systems/CrawlerBossSystem';
import { DayNightCycle, type DayNightSnapshot } from '../systems/DayNightCycle';
import { HarvestSystem, type HarvestSnapshot, type HarvestTarget } from '../systems/HarvestSystem';
import { LightField, type LightSource } from '../systems/LightField';
import { MothSwarm } from '../systems/MothSwarm';
import { PowerGraphSystem, powerWireId, type PowerGraphDefinition } from '../systems/PowerGraph';
import { PressureSystem } from '../systems/PressureSystem';
import { TargetingSystem, type GoldHolding } from '../systems/TargetingSystem';
import { WaveSystem } from '../systems/WaveSystem';
import * as Terrain from '../world/Terrain';

const STEP_SECONDS = 1 / 30;
// F-E2S-1: boss fights get six full waves after the later posting boundary.
const BOSS_GRACE_WAVES = 6;
const SUPPORTED_CONTRACTS = new Set([
  'e1-dry-gulch',
  'the-claim',
  'e1-night-shift',
  'e1-twin-banks',
  'e1-baron',
  'e2-pressure-garden',
  // The three E2 railcar contracts stay out under the F-E2S-3 owner ruling of 2026-08-09 until
  // the second master lands their era-true pressure-to-damage socket.
  'e3-blackout-ridge',
  'e3-moth-season',
  'e3-canyon-works',
  // E5/E6 stay out DESPITE their era sockets now running headlessly (DeepwaterSocket,
  // AtomicSocket). Admission was attempted and MEASURED, and the measurement refused it:
  // see reviews/milk-twin-sockets.md and the two census docs for the four numbers.
]);
const HEADLESS_META_STORAGE = { getItem: () => null, setItem: () => undefined };
/**
 * Names the engine inside every seated determinism hash. A browser rider hashes a
 * run-suspend snapshot (Game.multiplayerStateHash); this sim hashes its own planar
 * state. Two DIFFERENT engines will disagree by construction, and when they do the
 * seat must be able to say WHICH — an unlabelled mismatch reads like corruption.
 */
export const SEAT_HASH_ENGINE = 'gr-sim.headless.v1';

export function bossKillSecuresRun(
  baron: ContractBaronTwist | undefined,
  contractId: string,
  event: Extract<GameEvent, { type: 'enemy_killed' }>,
): boolean {
  const expectedKind = baron?.bossKind ?? 'baron';
  const expectedGroupId = baron?.components?.length
    ? `${contractId}:wave-${baron.wave}:${(baron.variantId ?? 'baron_railcar') === 'baron_railcar' ? 'railcar' : 'component-boss'}`
    : undefined;
  const groupDown = expectedGroupId === undefined
    ? event.bossGroupId === undefined
    : event.bossGroupId === expectedGroupId && event.bossRemaining === 0;
  return event.eliteKind === expectedKind && groupDown;
}

export type GrSimOutcome = {
  secured: boolean;
  waves: number;
  timeMs: number;
  gold: number;
  kills: number;
  calls: number;
  eventLogHash: string;
  securedWave?: number;
  overtimeWaves?: number;
  homestead?: {
    goldPanned: number;
    goldSpent: number;
    peakWorks: number;
    worksByTier: Record<string, number>;
    worksLost: number;
  };
};

export type GrSimTurn = {
  view: HeadlessAgentView;
  terminal: boolean;
};

export type HeadlessAgentView = AgentView & {
  now: AgentView['now'] & {
    overtime?: true;
    hero: AgentView['now']['hero'] & {
      level: number;
      upgradesTaken: Record<string, number>;
      upgradeChoiceRule: 'first-offer';
    };
    threats: AgentView['now']['threats'] & {
      spawnedTotal: number;
      defeatedTotal: number;
      defeatedBasis: 'all enemies, including continuous tricklers';
    };
  };
  almanac: AgentView['almanac'] & {
    nextWave: AgentView['almanac']['nextWave'] & {
      compositionScope: 'wave-horn packs only; continuous tricklers are additional';
      continuousTrickle: {
        currentIntervalSeconds: number;
        includedInComposition: false;
        includedInDefeatedTotal: true;
      };
    };
  };
};

export type HeadlessContractBoot = ContractRunBoot & {
  contractId: string;
  seed: string;
  overtime?: boolean;
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
  readonly contractId: string;
  readonly seed: string;

  private readonly events = new EventBus();
  // Overtime is capped at 50 waves, so retaining its full economy log is bounded and keeps lifetime totals exact.
  private readonly economy = new Economy(Number.POSITIVE_INFINITY);
  private readonly enemies = new EnemyPool();
  private readonly hero = new Hero(RUN_CAST_SCALE);
  private readonly prospector = new ProspectorEmbodiment(() => undefined);
  private readonly projectiles = new ProjectilePool();
  private readonly blastCharges = new BlastChargePool();
  private readonly xpMotes = new XpMotePool();
  private readonly combatVfx = new CombatVfx();
  private readonly targeting = new TargetingSystem();
  private blastReadyAt = 0;
  private readonly heroShooter: ShooterHandle = {
    id: 'hero',
    resumeKey: 'hero:0:rig',
    enabled: () => !this.dead,
    getPos: () => this.hero.group.position,
    range: Balance.sparkRig.range,
    cooldown: 1 / Balance.sparkRig.fireRate,
    damage: Balance.sparkRig.damage,
    projSpeed: Balance.sparkRig.boltSpeed,
    volley: Balance.sparkRig.volley,
  };
  private readonly progressionState = new GameState();
  private readonly harvest: HarvestSystem;
  private readonly combat: CombatSystem;
  private readonly build: BuildSystem;
  private readonly pressure: PressureSystem;
  private readonly powerGraph: PowerGraphSystem | null;
  private readonly dayNightCycle: DayNightCycle | null;
  private readonly lightField: LightField | null;
  private readonly mothSwarm: MothSwarm | null;
  private readonly crawler: CrawlerBossSystem | null;
  private readonly deepwater: DeepwaterSocket | null;
  private readonly atomic: AtomicSocket | null;
  private readonly waves: WaveSystem;
  private readonly progression: Progression;
  private readonly runManager: RunManager;
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
  private dayNightSnapshot: DayNightSnapshot | null = null;
  private mothLightSources: LightSource[] = [];
  private simTick = 0;
  private timeAlive = 0;
  private kills = 0;
  private calls = 0;
  private economySequence = 0;
  private secured = false;
  private securedWave: number | null = null;
  private dead = false;
  private lastTurnWave = -1;
  private lastSurpriseSeq = 0;
  private advanceCpuMs = 0;
  private buildingHits = 0;
  private baronBeaten = false;
  private baronRocketNextAt = 0;
  private baronRocketTelegraphAt = -1;
  private baronRocketVolleys = 0;
  private readonly baronRocketTarget = new THREE.Vector3();
  private canyonConnectCompletedByDeadline = false;
  private canyonConnectFailed = false;

  constructor(readonly boot: HeadlessContractBoot) {
    this.contractId = boot.contractId;
    this.seed = boot.seed;
    this.manifest = loadContract(this.contractId);
    const mode = this.manifest.modes?.find(({ id }) => id === boot.mode);
    if (boot.mode && !mode) throw new Error(`${this.contractId} does not declare mode ${boot.mode}.`);
    if (!SUPPORTED_CONTRACTS.has(this.contractId) && !mode) {
      throw new Error(`AP-07 supports only ${[...SUPPORTED_CONTRACTS].join(', ')}; received ${this.contractId}.`);
    }
    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
    const start = new THREE.Vector3(stake?.x ?? 0, 0.06, stake?.z ?? 12);
    this.hero.resetRun(start);
    this.prospector.reset(start);

    this.harvest = new HarvestSystem(
      this.economy,
      this.manifest.tileParams.harvestAnchors ?? Terrain.nodeAnchors,
      createRng(`${this.seed}:harvest`),
    );
    this.harvest.applyStats(1, 0, 0, this.manifest.twist.seamYieldMult ?? 1);
    this.harvestSnapshot = this.harvest.snapshot;

    // The Atomic socket is built before combat because the browser routes two of its
    // couplings THROUGH CombatSystem's own hooks (Game.ts:534 and Game.ts:536).
    this.atomic = AtomicSocket.create(this.manifest, this.events, this.enemies, this.economy);
    this.combat = new CombatSystem(
      this.events,
      [this.hero],
      this.enemies,
      this.projectiles,
      this.blastCharges,
      this.xpMotes,
      this.combatVfx,
      NO_AUDIO,
      () => this.postHeroDeath(),
      undefined,
      undefined,
      undefined,
      undefined,
      (enemy, amount, died) => this.atomic?.onEnemyDamaged(enemy, amount, died),
      (enemy) => this.atomic?.isHostile(enemy) !== false,
    );
    this.registerHeroShooter();
    const offeredBuildables = mechanicsBuildableIds(this.manifest);
    this.build = new BuildSystem(
      headlessCanvas(),
      new THREE.PerspectiveCamera(),
      this.economy,
      this.combat,
      this.targeting,
      this.prospector.position,
      () => this.waves?.diagnostics.wave ?? 0,
      undefined,
      undefined,
      (id) => offeredBuildables.has(id),
    );
    for (const fixture of this.manifest.tileParams.prePlacedBuildables ?? []) {
      this.build.placeFree(fixture.id, fixture, fixture.rotationSteps ?? 0, {
        wrecked: fixture.wrecked,
        repairCost: fixture.relightCost,
        preplaced: true,
      });
    }
    for (const holding of this.stockpileHoldings) this.targeting.registerGoldHolding(holding);
    this.pressure = new PressureSystem(
      this.economy,
      this.build.boilerHouses,
      () => this.manifest.twist.pressureEnabled === true,
      (index) => this.build.buildingTarget('boiler_house', index)?.active === true,
      () => false,
      () => undefined,
      () => undefined,
    );
    const powerGrid = this.manifest.twist.powerGrid;
    this.powerGraph = powerGrid
      ? new PowerGraphSystem(contractPowerDefinition(this.contractId, powerGrid), powerGrid.maxSpanLength)
      : null;
    this.crawler = this.manifest.twist.baron?.variantId === 'dynamo_crawler'
      ? new CrawlerBossSystem(
          () => this.enemies.all,
          () => this.powerGraph?.snapshot().nodes ?? [],
          (command) => this.powerGraph?.queueCommand(command) === true,
          (origin, target, damage, radius) => this.combat.launchLob(origin, target, 0.05, damage, radius, 'baron_rocket:-3'),
        )
      : null;
    this.dayNightCycle = this.manifest.twist.dayNightCycle
      ? new DayNightCycle(this.manifest.twist.dayNightCycle)
      : null;
    this.dayNightSnapshot = this.dayNightCycle?.sample(0) ?? null;
    const mothSeason = this.manifest.twist.mothSeason;
    this.lightField = mothSeason || this.isNightShiftContract()
      ? new LightField({
          minLight: Balance.contracts.nightShift.minLight,
          falloff: Balance.contracts.nightShift.lightFalloff,
          litThreshold: Balance.contracts.nightShift.renderVisibilityCutoff,
        })
      : null;
    this.mothSwarm = mothSeason && this.lightField
      ? new MothSwarm(
          true,
          this.enemies.capacity,
          (x, z) => this.lightField!.coverageAt(x, z),
          {
            radiusWeight: mothSeason.radiusWeight,
            attachDamagePerSecond: mothSeason.attachDamagePerSecond,
            mothsBaselinePerWave: mothSeason.mothsBaselinePerWave ?? 0,
            mothsPerLightPerWave: mothSeason.mothsPerLightPerWave,
          },
          (sourceId, amount) => {
            if (!sourceId.startsWith('decoy:')) return;
            const target = this.build.buildingTarget('decoy_shed', Number.parseInt(sourceId.slice(6), 10));
            if (target?.active) this.combat.damageBuilding(target, amount, -1);
          },
        )
      : null;
    this.syncLightState();
    this.deepwater = DeepwaterSocket.create(
      this.manifest,
      this.enemies,
      this.combat,
      () => this.hero.group.position,
      (wave, at) => this.events.emit({ type: 'wave_started', at, wave }),
    );

    this.waves = new WaveSystem(
      this.enemies,
      this.hero.group.position,
      createRng(`${this.seed}:waves`),
      (text, at, wave) => this.replayEvents.push({ type: 'announcement', at, wave: wave ?? null, text }),
      (wave, at) => this.startWave(wave, at),
      // Game.ts:1251 — the Deepwater Claim runs no generic schedule; its storm track is the clock.
      () => this.deepwater !== null,
      () => this.manifest,
      boot,
      () => this.build.diagnostics.stockpilesState.some((entry) => entry.active),
      () => this.build.hasAnyBuildable,
      () => this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isThief).length,
      () => false,
      this.hero.group.position,
      (position, at, escorts) => this.postBaronSpawn(position, at, escorts),
    );
    this.progressionState.transition('playing');
    this.progression = new Progression({
      state: this.progressionState,
      rng: createRng(`${this.seed}:upgrades`),
      getBeaconCount: () => this.build.beaconCount,
      getWave: () => this.waves.diagnostics.wave,
      getMaxHp: () => this.hero.maxHp,
      onStatsChanged: (stats, pickedId) => this.applyProgressionStats(stats, pickedId),
      onGoldGranted: (amount) => this.economy.apply(this.economyEvent({
        type: 'gold_granted',
        source: 'upgrade_assay',
        amount,
      })),
      onHeal: (amount) => this.hero.heal(amount),
    });
    this.applyProgressionStats(this.progression.stats, null);

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
    bindStandingOrderBlast((pos) => this.blastAt(pos));
    this.bindEventLog();
    this.economy.apply(this.economyEvent({ type: 'run_reset' }));
    const sim = this;
    this.runManager = new RunManager(
      {
        events: this.events,
        economy: this.economy,
        waveSystem: this.waves,
        activeContract: this.manifest,
        secureWaveForRun: () => this.manifest.twist.secureWave ?? Balance.run.secureWave,
        autoSecureWaveForRun: () => (this.manifest.twist.baron && !this.baronBeaten)
          || (this.manifest.twist.powerGrid?.connect && !this.canyonConnectCompletedByDeadline)
          ? Number.MAX_SAFE_INTEGER
          : this.manifest.twist.secureWave ?? Balance.run.secureWave,
        securePayoutMultForRun: () => this.baronBeaten
          ? { science: Math.max(1, this.manifest.twist.baron?.sciencePayoutMult ?? 1) }
          : undefined,
        get timeAlive() {
          return sim.timeAlive;
        },
      },
      { now: () => Math.round(this.timeAlive * 1000), storage: HEADLESS_META_STORAGE },
    ).install();
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
    const finalWave = this.manifest.twist.baron
      ? Math.max(secureWave, this.manifest.twist.baron.wave) + BOSS_GRACE_WAVES
      : secureWave + 2;
    const maxTicks = Math.ceil((finalWave * Balance.waves.waveInterval) / STEP_SECONDS);
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
    const canyonConnect = this.canyonConnectDiagnostics();
    const crawler = this.crawler?.diagnostics();
    const base = {
      secured: this.secured,
      waves,
      timeMs: Math.round(this.timeAlive * 1000),
      gold: round(this.economy.gold),
      kills: this.kills,
      calls: this.calls,
    };
    const overtime = this.boot.overtime && this.securedWave !== null
      ? {
          securedWave: this.securedWave,
          overtimeWaves: waves - this.securedWave,
          homestead: this.homesteadOutcome(),
        }
      : {};
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
        ...(this.powerGraph ? { power: this.powerGraph.snapshot() } : {}),
        ...(this.dayNightSnapshot ? { dayNight: this.dayNightSnapshot } : {}),
        ...(canyonConnect ? { canyonConnect } : {}),
        ...(crawler ? { crawler: (({ crawler3dState: _, ...simulation }) => simulation)(crawler) } : {}),
        ...(this.deepwater ? { deepwater: this.deepwater.simulationSnapshot } : {}),
        ...(this.atomic ? { atomic: this.atomic.diagnostics } : {}),
      },
    });
    return { ...base, eventLogHash, ...overtime };
  }

  // ---------------------------------------------------------------------------
  // TRANSPORT SEAM — the agent seat (src/sim/SeatedLockstepSim.ts).
  // Purely additive: `advanceToTurn()`, `outcome()` and every pinned hash above are
  // untouched, so the gr-sim determinism pins keep meaning what they meant.
  // ---------------------------------------------------------------------------

  /**
   * Advances exactly ONE fixed step — the grain a lockstep tick bundle buys.
   * `advanceToTurn()` runs a whole wave of these on its own authority; a seated sim
   * may only ever run the one tick the room has already agreed on.
   */
  advanceOneTick(): void {
    if (!this.terminal) this.step();
  }

  /** True once the run has ended — secured, or the rider went down. */
  get isTerminal(): boolean {
    return this.terminal;
  }

  /**
   * True when the rider is owed a turn: the same wave-boundary / surprise trigger
   * `advanceToTurn()` fires on, asked WITHOUT advancing the sim. A seated loop cannot
   * use `advanceToTurn()` — it would run ticks the room has not handed it.
   */
  turnDue(): boolean {
    const orders = snapshotStandingOrders();
    return this.terminal
      || this.waves.diagnostics.wave !== this.lastTurnWave
      || latestSurpriseSeq(orders) > this.lastSurpriseSeq;
  }

  /**
   * The per-tick determinism fingerprint exchanged on the lockstep wire: the same
   * planar state `outcome()` folds into its terminal hash, minus the event log (which
   * only exists once, at the end). Two seats running this engine over one shared tick
   * stream MUST agree on this value, tick for tick — that agreement is the whole
   * desync test, and `SEAT_HASH_ENGINE` makes a cross-engine disagreement legible.
   */
  tickHash(tick: number): string {
    return stableHash({
      engine: SEAT_HASH_ENGINE,
      tick,
      contractId: this.contractId,
      seed: this.seed,
      wave: this.waves.diagnostics.wave,
      timeMs: Math.round(this.timeAlive * 1000),
      gold: round(this.economy.gold),
      kills: this.kills,
      hero: point(this.hero.group.position),
      hp: round(this.hero.hp),
      enemies: this.enemies.all
        .filter((enemy) => enemy.isAlive)
        .map((enemy) => ({ id: enemy.id, hp: round(enemy.currentHp), position: point(enemy.position) })),
      buildings: this.build.diagnostics.hp,
    });
  }

  /**
   * Applies one lockstep action arriving in a shared tick bundle — the ONLY door
   * through which another rider's act may touch this sim. Mirrors
   * `Game.applyMultiplayerAction` for the subset a headless sim can honour. Returns
   * false for everything else so the seat can REPORT what it could not honour rather
   * than swallow it; a silently-dropped peer action is a desync waiting to happen.
   */
  applyWireAction(action: LockstepAction): boolean {
    if (action.type !== 'place_build') return false;
    return this.build.confirmPlacement(this.timeAlive, action);
  }

  get wavesPerSecond(): number {
    return this.advanceCpuMs > 0 ? this.waves.diagnostics.wave / (this.advanceCpuMs / 1000) : 0;
  }

  get escortDiagnostics() {
    return this.waves.escortDiagnostics;
  }

  get bankedSecureWave(): number | null {
    return this.securedWave;
  }

  private get terminal(): boolean {
    return this.dead || (this.secured && !this.boot.overtime);
  }

  private step(): void {
    this.simTick += 1;
    this.timeAlive += STEP_SECONDS;
    // Era sockets keep the browser's own relative order (Game.ts:2527-2541):
    //   decay.tick -> syncDeepwaterClaim -> actors -> e6TileConsumers -> arsenal -> waves -> wrangle.
    // Every call is null-guarded, so no already-admitted contract's tick changes.
    this.atomic?.tickDecay();
    this.deepwater?.advance(this.timeAlive);
    this.hero.update(STEP_SECONDS, IDLE_INTENTS, { bounds: Terrain.bounds, sample: Terrain.sample });
    this.atomic?.updateTileConsumers(STEP_SECONDS, this.timeAlive, this.harvestTargets());
    this.deepwater?.updateArsenal(this.timeAlive);
    this.combat.setTime(this.timeAlive);
    this.waves.update(this.timeAlive);
    this.atomic?.updateWrangle(STEP_SECONDS, this.timeAlive);
    this.crawler?.step(this.timeAlive);
    this.build.update(
      STEP_SECONDS,
      this.timeAlive,
      this.enemies.all,
      () => undefined,
      () => undefined,
      this.prospector.position,
    );
    this.pressure.update(STEP_SECONDS, this.timeAlive, [this.hero.group.position], this.waves.diagnostics.wave);
    this.syncContractPowerGrid();
    this.powerGraph?.step(this.simTick);
    this.syncCanyonConnectObjective();
    this.syncStockpileHoldings();
    this.mothSwarm?.update(STEP_SECONDS, this.mothLightSources, this.enemies.all);
    this.enemies.update(STEP_SECONDS, this.hero.group.position, (enemy) => {
      if (this.atomic?.isHostile(enemy) !== false) this.combat.handleEnemyContact(enemy);
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
    }, (enemy) => this.nightSpeedMultiplier(enemy) * (this.atomic?.movementMultiplier(enemy) ?? 1));
    this.deepwater?.recycleCorsairsAtExit();
    this.harvestSnapshot = this.harvest.update(STEP_SECONDS, this.timeAlive, this.harvestTargets());
    this.updateBaronRocketVolley();
    this.combat.update(STEP_SECONDS, this.timeAlive);
    this.deepwater?.resolveTreatments();
    this.progression.consumeXpTotal(this.combat.xpCount);
    while (this.progression.offer?.[0]) this.progression.applyUpgrade(this.progression.offer[0].id);
    this.prospector.updateSimulation(STEP_SECONDS, this.timeAlive, this.hero.group.position);
    this.dayNightSnapshot = this.sampleDayNightSnapshot();
    this.syncLightState();
    observeStandingOrders();
  }

  private makeTurn(orders = snapshotStandingOrders()): GrSimTurn {
    this.lastTurnWave = this.waves.diagnostics.wave;
    this.lastSurpriseSeq = latestSurpriseSeq(orders);
    const receipt = this.surface.tools.view();
    if (!receipt.outcome.ok || !receipt.outcome.state) throw new Error('THE VIEW was unavailable.');
    const view = receipt.outcome.state as HeadlessAgentView;
    const progression = this.progression.snapshot;
    Object.assign(view.now.hero, {
      level: progression.level,
      upgradesTaken: progression.stacks,
      upgradeChoiceRule: 'first-offer' as const,
    });
    Object.assign(view.now.threats, {
      spawnedTotal: this.waves.diagnostics.waveSpawnedTotal,
      defeatedTotal: this.kills,
      defeatedBasis: 'all enemies, including continuous tricklers' as const,
    });
    if (this.boot.overtime && this.secured) view.now.overtime = true;
    Object.assign(view.almanac.nextWave, {
      compositionScope: 'wave-horn packs only; continuous tricklers are additional' as const,
      continuousTrickle: {
        currentIntervalSeconds: round(this.waves.diagnostics.trickleInterval),
        includedInComposition: false as const,
        includedInDefeatedTotal: true as const,
      },
    });
    return { view, terminal: this.terminal };
  }

  private startWave(wave: number, at: number): boolean | void {
    this.events.emit({ type: 'wave_started', at, wave });
    this.spawnMothSeasonWave(wave);
    const baron = this.manifest.twist.baron;
    if (baron && (wave === baron.wave || baron.tauntWaves.includes(wave))) {
      this.replayEvents.push({
        type: 'baron_announcement',
        at,
        wave,
        kind: wave === baron.wave ? 'arrival' : 'taunt',
        text: baron.taunt,
      });
    }
    if (this.runManager.diagnostics.secured && !this.boot.overtime) return false;
  }

  private bindEventLog(): void {
    for (const type of [
      'hero_damaged',
      'hero_died',
      'enemy_killed',
      'wave_started',
      'building_damaged',
      'building_wrecked',
      'run_started',
      'run_secured',
      'run_ended',
    ] as const) {
      this.events.on(type, (event) => {
        if (event.type === 'enemy_killed') this.kills += 1;
        if (event.type === 'building_damaged') this.buildingHits += 1;
        if (event.type === 'run_secured') {
          this.secured = true;
          this.securedWave = event.secureWave;
        }
        if (event.type === 'run_ended' && event.reason !== 'secured') this.dead = true;
        if (event.type === 'enemy_killed' && event.variantId === 'dynamo_crawler') {
          const enemy = this.enemies.all.find((entry) => entry.id === event.enemyId);
          this.crawler?.onComponentKilled(event.bossComponentId, enemy?.position ?? this.hero.group.position, event.at);
        }
        if (event.type === 'wave_started') {
          const baron = this.manifest.twist.baron;
          this.crawler?.onWaveStarted(event.wave, baron?.variantId === 'dynamo_crawler' ? baron.wave : Number.POSITIVE_INFINITY, event.at);
        }
        this.replayEvents.push(canonicalEvent(event));
        if (event.type === 'enemy_killed') {
          const baron = this.manifest.twist.baron;
          if (bossKillSecuresRun(baron, this.contractId, event)) this.postBaronDefeat(event.at);
        }
      });
    }
  }

  private postBaronSpawn(position: THREE.Vector3, at: number, escorts: number): void {
    const baron = this.manifest.twist.baron;
    if (!baron) return;
    this.baronRocketNextAt = at;
    this.replayEvents.push({
      type: 'baron_spawned',
      at,
      position: point(position),
      wave: baron.wave,
      hpScale: baron.hpScale,
      speedScale: baron.speedScale,
      scale: baron.scale,
      pursuitRange: baron.pursuitRange ?? null,
      escorts,
    });
  }

  private postBaronDefeat(at: number): void {
    const baron = this.manifest.twist.baron;
    if (!baron || this.baronBeaten) return;
    this.baronBeaten = true;
    // Keys on `connect`, not on any powerGrid (F-1471-1): only syncCanyonConnectObjective sets the
    // flag below, and it early-returns on `!grid?.connect` — so a powerGrid without a connect
    // objective would pin this false forever and beating the Baron would silently fail to secure.
    // Mirrors src/game/Game.ts byte-for-byte; the browser moved first.
    const objectiveAllowsSecure = !this.manifest.twist.powerGrid?.connect || this.canyonConnectCompletedByDeadline;
    const secured = this.runManager.diagnostics.secured
      || (objectiveAllowsSecure && this.runManager.secureCurrentRun(this.waves.diagnostics.wave));
    if (!secured) {
      this.baronBeaten = false;
      return;
    }
    this.replayEvents.push({
      type: 'baron_defeated',
      at,
      wave: this.waves.diagnostics.wave,
      defeatBeat: baron.defeatBeat,
      sciencePayoutMult: baron.sciencePayoutMult,
      medal: {
        eligible: baron.awardMedal !== false,
        blurb: baron.medalBlurb,
        awarded: false,
        sideEffects: false,
      },
    });
  }

  private updateBaronRocketVolley(): void {
    const config = this.manifest.twist.baron?.rocketVolley;
    const baron = config
      ? this.enemies.all.find((enemy) => enemy.isAlive && enemy.eliteKind === 'baron')
      : undefined;
    if (!config || !baron || this.baronBeaten) {
      this.baronRocketTelegraphAt = -1;
      return;
    }
    if (this.baronRocketMeleeSuppressed(baron)) {
      this.baronRocketTelegraphAt = -1;
      return;
    }
    if (this.baronRocketTelegraphAt >= 0) {
      if (this.timeAlive - this.baronRocketTelegraphAt < Math.max(0.1, config.telegraphSeconds)) return;
      const count = THREE.MathUtils.clamp(Math.floor(config.count), 1, 6);
      const ownerId = `baron_rocket:${baron.id}`;
      const target = new THREE.Vector3();
      for (let index = 0; index < count; index += 1) {
        const rng = createRng(`${this.seed}:baron-rocket:${this.baronRocketVolleys}:${index}`);
        const angle = (Math.PI * 2 * index) / count + rng.range(-0.24, 0.24);
        const spread = index === 0 ? 0 : Math.max(0, config.spreadRadius) * rng.range(0.55, 1);
        target.set(
          this.baronRocketTarget.x + Math.cos(angle) * spread,
          this.baronRocketTarget.y,
          this.baronRocketTarget.z + Math.sin(angle) * spread,
        );
        this.combat.launchLob(
          baron.position,
          target,
          Math.max(0.1, config.airTime),
          Math.max(0, config.damage),
          Math.max(0.2, config.radius),
          ownerId,
        );
      }
      this.replayEvents.push({
        type: 'baron_rocket_volley',
        at: round(this.timeAlive),
        volley: this.baronRocketVolleys,
        count,
        damage: config.damage,
        radius: config.radius,
        target: point(this.baronRocketTarget),
      });
      this.baronRocketVolleys += 1;
      this.baronRocketTelegraphAt = -1;
      this.baronRocketNextAt = this.timeAlive + Math.max(0.2, config.cadenceSeconds);
      return;
    }
    if (this.timeAlive < this.baronRocketNextAt) return;
    const building = this.targeting.nearestBuilding(baron.position);
    const heroRange = Math.max(16, baron.heroPursuitRange || 45);
    const heroInRange = baron.position.distanceToSquared(this.hero.group.position) <= heroRange * heroRange;
    this.baronRocketTarget.copy(heroInRange || !building ? this.hero.group.position : building.position);
    this.baronRocketTelegraphAt = this.timeAlive;
    this.replayEvents.push({
      type: 'baron_rocket_telegraph',
      at: round(this.timeAlive),
      target: heroInRange || !building ? 'hero' : 'building',
      position: point(this.baronRocketTarget),
    });
  }

  private baronRocketMeleeSuppressed(baron: (typeof this.enemies.all)[number]): boolean {
    const heroReach = baron.hitRadius + Balance.hero.radius + 0.35;
    if (baron.position.distanceToSquared(this.hero.group.position) <= heroReach * heroReach) return true;
    const building = this.targeting.nearestBuilding(baron.position);
    if (!building) return false;
    const dx = Math.max(0, Math.abs(baron.position.x - building.position.x) - building.halfX);
    const dz = Math.max(0, Math.abs(baron.position.z - building.position.z) - building.halfZ);
    const reach = Balance.wreck.reach * Math.max(1, baron.visualScale) + 0.35;
    return dx * dx + dz * dz <= reach * reach;
  }

  private postHeroDeath(): void {
    const summary = summarizeLog(this.economy.log);
    this.events.emit({
      type: 'hero_died',
      at: this.timeAlive,
      timeAlive: this.timeAlive,
      kills: this.kills,
      goldPanned: summary.panned,
      spent: summary.spent,
      beaconsBuilt: summary.beaconsBuilt,
      wavesSurvived: this.waves.diagnostics.wave,
      weaponToggles: 0,
      blastTime: 0,
    });
  }

  private registerHeroShooter(): void {
    this.combat.registerShooter(this.heroShooter);
  }

  private diagnostics(): unknown {
    const wave = this.waves.diagnostics;
    const orders = snapshotStandingOrders();
    const canyonConnect = this.canyonConnectDiagnostics();
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
      blastReadyInMs: Math.max(0, Math.round((this.blastReadyAt - this.timeAlive) * 1000)),
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
      pressure: this.pressure.diagnostics,
      power: this.powerGraph?.snapshot() ?? null,
      dayNight: this.dayNightSnapshot,
      ...(canyonConnect ? { canyonConnect } : {}),
      crawler: this.crawler?.diagnostics() ?? null,
      deepwater: this.deepwater?.diagnostics ?? null,
      atomic: this.atomic?.diagnostics ?? null,
      mothSwarm: this.mothSwarm?.diagnostics() ?? null,
      lightField: this.lightField?.diagnostics() ?? null,
      kills: this.kills,
      runState: this.dead ? 'dead' : this.secured ? 'secured' : 'playing',
      run: { secured: this.secured },
      progression: { ...this.progression.snapshot, choiceRule: 'first-offer' },
      agent: {
        needsRider: orders.needsRider,
        orders: orders.orders,
        surprises: orders.log.flatMap((event) => event.type === 'surprise' && event.surprise ? [event.surprise] : []),
        embodiment: this.prospector.snapshot,
      },
    };
  }

  private homesteadOutcome(): NonNullable<GrSimOutcome['homestead']> {
    const summary = summarizeLog(this.economy.log);
    const works = this.build.diagnostics.hp;
    const worksByTier: Record<string, number> = {};
    for (const work of works) worksByTier[work.tier] = (worksByTier[work.tier] ?? 0) + 1;
    return {
      goldPanned: round(summary.panned),
      goldSpent: round(summary.spent),
      peakWorks: works.length,
      worksByTier,
      worksLost: this.replayEvents.filter((event) =>
        typeof event === 'object' && event !== null && 'type' in event && event.type === 'building_wrecked').length,
    };
  }

  private syncContractPowerGrid(): void {
    const sites = this.manifest.tileParams.pylonSites;
    const graph = this.powerGraph;
    if (!sites?.length || !graph) return;
    const buildings = this.build.diagnostics.hp;
    const snapshot = graph.snapshot();
    for (const site of sites) {
      const online = buildings.some((entry) => entry.id === 'sentry_beacon' && entry.hp > 0 && !entry.wrecked
        && Math.hypot(entry.position.x - site.x, entry.position.z - site.z) <= site.radius);
      if (snapshot.nodes.find((node) => node.id === site.nodeId)?.online !== online) {
        graph.queueCommand({ type: 'set-node-online', nodeId: site.nodeId, online });
      }
      const wireId = powerWireId({ a: site.wireFrom, b: site.nodeId });
      const state = online ? 'intact' : 'cut';
      if (snapshot.wires.find((wire) => wire.id === wireId)?.state !== state) {
        graph.queueCommand({ type: 'set-wire-state', wireId, state });
      }
    }
    for (const site of this.manifest.tileParams.capacitorSites ?? []) {
      const online = buildings.some((entry) => entry.id === 'capacitor_bank' && entry.hp > 0 && !entry.wrecked
        && Math.hypot(entry.position.x - site.x, entry.position.z - site.z) <= site.radius);
      if (snapshot.nodes.find((node) => node.id === site.nodeId)?.online !== online) {
        graph.queueCommand({ type: 'set-node-online', nodeId: site.nodeId, online });
      }
    }
  }

  private canyonConnectDiagnostics(): null | { powered: number; required: number; byWave: number; complete: boolean; failed: boolean } {
    const grid = this.manifest.twist.powerGrid;
    if (!grid?.connect || !this.powerGraph) return null;
    const galleries = new Set(grid.nodes.filter((node) => node.kind === 'consumer' && node.role === 'gallery').map((node) => node.id));
    const powered = this.powerGraph.snapshot().nodes.filter((node) => galleries.has(node.id) && node.state === 'powered').length;
    return {
      powered,
      required: grid.connect.required,
      byWave: grid.connect.byWave,
      complete: this.canyonConnectCompletedByDeadline,
      failed: this.canyonConnectFailed,
    };
  }

  private syncCanyonConnectObjective(): void {
    const connect = this.canyonConnectDiagnostics();
    if (!connect) return;
    const wave = this.waves.diagnostics.wave;
    if (!this.canyonConnectCompletedByDeadline && !this.canyonConnectFailed && wave <= connect.byWave && connect.powered >= connect.required) {
      this.canyonConnectCompletedByDeadline = true;
    }
    if (!this.canyonConnectCompletedByDeadline && wave > connect.byWave) this.canyonConnectFailed = true;
  }

  private sampleDayNightSnapshot(): DayNightSnapshot | null {
    const cycle = this.manifest.twist.dayNightCycle;
    const waveSchedule = cycle?.waveSchedule;
    if (!waveSchedule) return this.dayNightCycle?.sample(this.timeAlive) ?? null;
    const wave = this.waves.diagnostics.wave;
    const span = Math.max(1, waveSchedule.darkWave - waveSchedule.duskWave);
    const progress = Math.max(0, Math.min(1, (wave - waveSchedule.duskWave) / span));
    const phase = wave < waveSchedule.duskWave ? 'full' : wave < waveSchedule.darkWave ? 'dusk' : 'dark';
    const darkness = phase === 'full' ? 0 : progress * cycle.nightDepth;
    return { phase, darkness, phaseProgress: progress, cycleProgress: progress, cycle: 0, simTime: this.timeAlive };
  }

  private lightRampDarkness(): number {
    const ramp = this.manifest.twist.lightRamp;
    if (!ramp) return 0;
    const waveInterval = Math.max(0.1, Balance.waves.waveInterval / Math.max(0.1, this.manifest.twist.waveCadenceMult ?? 1));
    const diagnostics = this.waves?.diagnostics;
    if (!diagnostics) return 0;
    const wave = Math.max(0, diagnostics.wave + Math.min(1, Math.max(0, 1 - diagnostics.nextWaveInSim / waveInterval)));
    if (wave >= ramp.dawnWave) return 0;
    const keyframes = ramp.keyframes;
    if (!keyframes?.length) {
      if (wave < ramp.duskWave) return 0;
      if (wave >= ramp.darkWave) return Balance.contracts.nightShift.darkDarkness;
      const progress = Math.min(1, Math.max(0, (wave - ramp.duskWave) / Math.max(1, ramp.darkWave - ramp.duskWave)));
      return Balance.contracts.nightShift.duskDarkness
        + (Balance.contracts.nightShift.darkDarkness - Balance.contracts.nightShift.duskDarkness) * progress;
    }
    const clampedWave = Math.min(keyframes.at(-1)!.wave, Math.max(keyframes[0]!.wave, wave));
    const nextIndex = Math.max(1, keyframes.findIndex((keyframe) => keyframe.wave >= clampedWave));
    const previous = keyframes[nextIndex - 1]!;
    const next = keyframes[nextIndex]!;
    const progress = Math.min(1, Math.max(0, (clampedWave - previous.wave) / Math.max(0.001, next.wave - previous.wave)));
    return previous.darkness + (next.darkness - previous.darkness) * progress;
  }

  private spawnMothSeasonWave(wave: number): void {
    const config = this.manifest.twist.mothSeason;
    if (!config || !this.mothSwarm || wave <= 0 || (this.dayNightSnapshot?.darkness ?? 0) < 0.5) return;
    const count = this.mothSwarm.waveSize(this.mothLightSources.length);
    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
    this.mothSwarm.spawn(this.enemies, count, stake?.x ?? 0, (stake?.z ?? 12) - 12);
  }

  private syncLightState(): void {
    if (!this.lightField) return;
    const config = this.manifest.twist.mothSeason;
    const buildings = this.build.diagnostics.hp;
    const positions = (id: 'lantern_post' | 'decoy_shed') => buildings
      .filter((entry) => entry.id === id && entry.hp > 0 && !entry.wrecked)
      .map((entry) => ({ index: entry.index, ...entry.position }));
    const lanterns: LightSource[] = positions('lantern_post')
      .filter((position) => this.powerConsumerAt(position.x, position.z, 'lamp'))
      .map((position) => ({
        id: `lantern:${position.index}`,
        kind: 'lantern',
        x: position.x,
        z: position.z,
        radius: Balance.contracts.nightShift.lanternPostLightRadius,
      }));
    const decoys: LightSource[] = positions('decoy_shed').map((position) => ({
      id: `decoy:${position.index}`,
      kind: 'powered-lamp',
      x: position.x,
      z: position.z,
      radius: Balance.decoyShed.lightRadius,
      targetWeight: config?.decoyWeight ?? 1,
    }));
    this.mothLightSources = [
      ...lanterns,
      ...decoys,
    ];
    const darkness = this.dayNightSnapshot?.darkness ?? this.lightRampDarkness();
    const enemyLanterns: LightSource[] = this.enemies.all
      .filter((enemy) => enemy.isAlive && enemy.carriesLantern)
      .map((enemy) => {
        const swing = Math.sin(this.timeAlive * 3.4 + enemy.id * 1.7) * Balance.contracts.nightShift.enemyLanternSwing;
        const offset = Balance.contracts.nightShift.enemyLanternHandOffset + swing;
        return {
          id: `enemy:${enemy.id}`,
          kind: 'enemy-lantern',
          x: enemy.position.x + Math.cos(enemy.group.rotation.y) * offset,
          z: enemy.position.z + Math.sin(enemy.group.rotation.y) * offset,
          radius: Balance.contracts.nightShift.enemyLanternRadius,
          height: Balance.contracts.nightShift.enemyLanternConeHeight,
        };
      });
    const sources: LightSource[] = [{
        id: 'hero:0',
        kind: 'hero',
        x: this.hero.group.position.x,
        z: this.hero.group.position.z,
        radius: Balance.contracts.nightShift.heroLightRadius,
      }, ...this.mothLightSources, ...enemyLanterns];
    if (config && this.mothSwarm) {
      const dimmed = new Map(this.mothSwarm.dimSources(this.mothLightSources).map((source) => [source.id, source]));
      this.lightField.update(darkness, sources.map((source) => dimmed.get(source.id) ?? source));
      return;
    }
    this.lightField.update(darkness, sources);
  }

  private isNightShiftContract(): boolean {
    return Boolean(this.manifest.twist.lightRamp || this.manifest.twist.dayNightCycle);
  }

  private nightSpeedMultiplier(enemy: { variantId?: string | null; isWrecker: boolean; position: { x: number; z: number } }): number {
    const config = this.manifest.twist.mothSeason;
    if (enemy.variantId === 'moth_swarm') return 1;
    if (!config && (!this.isNightShiftContract() || !enemy.isWrecker)) return 1;
    const multiplier = config?.nightSpeedOutsideLight
      ?? Balance.contracts.nightShift.nightSpeedOutsideLight;
    const threshold = config?.litThreshold ?? Balance.contracts.nightShift.renderVisibilityCutoff;
    return (this.lightField?.coverageAt(enemy.position.x, enemy.position.z) ?? 1) < threshold ? multiplier : 1;
  }

  private powerConsumerAt(x: number, z: number, role: 'lamp' | 'turret'): boolean {
    const grid = this.manifest.twist.powerGrid;
    const graph = this.powerGraph;
    if (!grid || !graph) return true;
    const candidates = grid.nodes.filter((node) => node.kind === 'consumer' && node.role === role);
    const target = candidates.reduce<(typeof candidates)[number] | null>((best, node) => {
      if (!best) return node;
      return Math.hypot(node.x - x, node.z - z) < Math.hypot(best.x - x, best.z - z) ? node : best;
    }, null);
    return !target || graph.snapshot().nodes.find((node) => node.id === target.id)?.state === 'powered';
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
    if (Math.hypot(this.prospector.position.x - position.x, this.prospector.position.z - position.z) > Balance.goldSeam.channelRange) {
      return false;
    }
    if (!seam) return { node, position };

    const before = seam.remaining;
    const previous = this.harvest.captureFutureState(this.timeAlive);
    const panned = this.harvest.update(
      Balance.goldSeam.tickSeconds * Math.max(0.1, this.progression.stats.panTickMult),
      this.timeAlive,
      this.harvestTargets(),
    );
    const pannedTarget = panned.activeNodes.find((entry) => entry.id === node);
    const nodes = previous.nodes.map((entry) => entry.id === node && pannedTarget ? pannedTarget : entry);
    const activeNodes = new Set(nodes.filter((entry) => entry.active).map((entry) => entry.id));
    const channels = previous.channels?.map((channel) =>
      channel.channelNodeId === null || activeNodes.has(channel.channelNodeId)
        ? channel
        : { ...channel, channelNodeId: null, progress: 0, panCapBlocked: false, channeling: false },
    );
    const primary = channels?.find((channel) => channel.actorId === '0');
    const channelNodeId = primary?.channelNodeId
      ?? (previous.channelNodeId !== null && activeNodes.has(previous.channelNodeId) ? previous.channelNodeId : null);
    this.harvest.restoreFutureState({
      ...previous,
      nodes,
      channelNodeId,
      progress: channelNodeId === null ? 0 : (primary?.progress ?? previous.progress),
      panCapBlocked: channelNodeId === null ? false : (primary?.panCapBlocked ?? previous.panCapBlocked),
      channels,
    }, this.timeAlive);
    this.harvestSnapshot = this.harvest.update(0, this.timeAlive, this.harvestTargets());
    return (pannedTarget?.remaining ?? before) < before;
  }

  private harvestTargets(): HarvestTarget[] {
    const prospector = this.prospector.snapshot;
    return [{
      actorId: '0',
      position: this.prospector.position,
      speed: prospector.moving || prospector.drifting ? Balance.agent.moveSpeed : 0,
    }];
  }

  private applyProgressionStats(stats: EffectiveStats, pickedId: string | null): void {
    this.heroShooter.cooldown = 1 / (Balance.sparkRig.fireRate * stats.fireRateMult);
    this.heroShooter.damage = Balance.sparkRig.damage * stats.damageMult;
    this.heroShooter.range = Balance.sparkRig.range * stats.rangeMult;
    this.heroShooter.projSpeed = Balance.sparkRig.boltSpeed * stats.boltSpeedMult;
    this.heroShooter.volley = Balance.sparkRig.volley + stats.volleyBonus;
    this.hero.applyStats(Math.max(stats.maxHpBonus, this.hero.maxHp - Balance.hero.maxHp), stats.moveSpeedMult);
    if (pickedId === 'tinkers_plating') this.hero.heal(upgradeDefById.tinkers_plating.deltas.heal ?? 0);
    this.harvest.applyStats(
      stats.panTickMult,
      stats.seamCapacityBonus,
      stats.seamRespawnReduction,
      this.manifest.twist.seamYieldMult ?? 1,
    );
    this.build.applyStats(stats.beaconFireRateMult, 1);
    if (stats.stockpileCapBonus > 0) this.economy.addCapSource('upgrade:stockpile_cap', stats.stockpileCapBonus);
    else this.economy.removeCapSource('upgrade:stockpile_cap');
  }

  private blastAt(pos: { x: number; z: number }): { ok: true } | { ok: false; reason: string } {
    const readyInMs = Math.max(0, Math.round((this.blastReadyAt - this.timeAlive) * 1000));
    if (readyInMs > 0) return { ok: false, reason: `COOLDOWN: Blast Charge ready in ${readyInMs}ms.` };
    const origin = this.hero.group.position;
    if (Math.hypot(pos.x - origin.x, pos.z - origin.z) > Balance.blast.range) {
      return { ok: false, reason: `OUT_OF_RANGE: BLAST_AT must be within ${Balance.blast.range}m of the hero.` };
    }
    const stats = this.progression.stats;
    const waveMult = 1 + Math.max(0, this.waves.diagnostics.wave) * Balance.blast.dmgPerWave;
    const launched = this.combat.launchLob(
      origin,
      new THREE.Vector3(pos.x, Balance.enemy.groundY, pos.z),
      Balance.blast.airTime,
      Balance.blast.damage * stats.blastDamageMult * waveMult,
      Balance.blast.radius * stats.blastRadiusMult,
      'hero_blast',
    );
    if (!launched) return { ok: false, reason: 'BLAST_POOL_FULL: no blast charge slot is available.' };
    this.blastReadyAt = this.timeAlive + Math.max(0.35, Balance.blast.cooldown * stats.blastCooldownMult);
    this.replayEvents.push({ type: 'blast_at', at: round(this.timeAlive), pos: point(pos) });
    return { ok: true };
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
