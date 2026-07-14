import * as THREE from 'three';
import { getStressCount, isSpawnDisabled } from '../core/DebugParams';
import type { CompassEdge, EnemyEliteKind } from '../entities/Enemy';
import type { Rng, RngState } from '../core/Rng';
import type { EnemyPool } from '../entities/pools';
import { OreCart, type OreCartDiagnostics } from '../entities/OreCart';
import { Balance } from '../game/Balance';
import {
  activeContract,
  type ContractEnemySpawnGate,
  type ContractEnemyVariant,
  type ContractManifest,
  type RailPathPoint,
} from '../meta/ContractFamilies';
import * as Terrain from '../world/Terrain';
import type { BuildingTarget } from './TargetingSystem';

export type SpawnPackOptions = {
  speedScale?: number;
  speedMult?: number;
  hpScale?: number;
  thief?: boolean;
  eliteKind?: EnemyEliteKind;
  visualScale?: number;
  banner?: boolean;
  wrecker?: boolean;
  carriedLantern?: boolean;
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
  spawnGates?: readonly ContractEnemySpawnGate[];
};

type PlannedPulse = {
  wave: number;
  pulse: number;
  spawnAt: number;
  edges: CompassEdge[];
  counts: number[];
  budget: number;
  telegraphed: boolean[];
  spawned: boolean;
};

export type WaveDiagnostics = {
  wave: number;
  nextWaveInSim: number;
  trickleInterval: number;
  waveSpawnedTotal: number;
  waveState: 'quiet' | 'warning' | 'active' | 'cleared';
  pulse: number;
  edge: CompassEdge | null;
  budget: number;
  lastPulseAt: number;
  escort: (OreCartDiagnostics & { enabled: true; objectiveLost: boolean; arrived: number; required: number; payout: number }) | { enabled: false };
};

const TELEGRAPH_SECONDS = 2;
const TELEGRAPH_STAGGER_SECONDS = 0.5;
const DEFAULT_CONTRACT = activeContract();
export const WAVE_SPAWN_EDGES: readonly CompassEdge[] = DEFAULT_CONTRACT.tileParams.lanes.spawnEdges;

const EDGE_COPY: Record<CompassEdge, readonly string[]> = {
  north: [
    'Claim Jumpers from the north bank!',
    'Brass warning on the north bank!',
    'Hold the north bank for the assay!',
    'North bank shadows want the gold!',
  ],
  south: [
    'Claim Jumpers from the south bank!',
    'Stake lights on the south bank!',
    'Hold the south bank for the assay!',
    'South bank dust is moving!',
  ],
  east: [
    'Claim Jumpers from the east ridge!',
    'Beacon coils hum eastward!',
    'Hold the east ridge for the assay!',
    'East ridge dust is moving!',
  ],
  west: [
    'Claim Jumpers from the west ridge!',
    'Brass warning on the west ridge!',
    'Hold the west ridge for the assay!',
    'West ridge shadows want the gold!',
  ],
};

const EDGE_PLACES: Record<CompassEdge, string> = {
  north: 'north bank',
  south: 'south bank',
  east: 'east ridge',
  west: 'west ridge',
};

export class WaveSystem {
  private readonly spawnPosition = new THREE.Vector3();
  private readonly debugCenter = new THREE.Vector3();
  private nextTrickleAt: number = Balance.waves.graceSeconds + Balance.waves.trickleInterval;
  private nextWaveAt: number = Balance.waves.waveInterval;
  private nextPlanWaveAt: number = Balance.waves.waveInterval;
  private nextPlanWave = 1;
  private readonly plannedPulses: PlannedPulse[] = [];
  private wave = 0;
  private pulse = 0;
  private edge: CompassEdge | null = null;
  private budget = 0;
  private waveSpawnedTotal = 0;
  private copyCursor = 0;
  private lastCopy = '';
  private currentAtSim = 0;
  private waveState: WaveDiagnostics['waveState'] = 'quiet';
  private lastPulseAt = Number.NEGATIVE_INFINITY;
  private baronSpawned = false;
  private readonly escortCart: OreCart | null;
  private escortArrived = 0;
  private escortLost = false;
  private escortSettled = false;

  constructor(
    private readonly enemies: EnemyPool,
    private readonly heroPosition: THREE.Vector3,
    private readonly rng: Rng,
    private readonly announce: (text: string, atSim: number) => void,
    private readonly onWaveStarted: (wave: number, atSim: number) => boolean | void,
    private readonly scheduledDisabled: () => boolean,
    private readonly liveContract: () => ContractManifest = activeContract,
    private readonly canSpawnThieves: () => boolean = () => false,
    private readonly canSpawnWreckers: () => boolean = () => false,
    private readonly liveThiefCount: () => number = () => 0,
    private readonly hasTerritoryRing: () => boolean = () => false,
    private readonly territoryRingCenter: THREE.Vector3 = heroPosition,
    private readonly onBaronSpawned: (position: THREE.Vector3, atSim: number) => void = () => {},
    registerEscortTarget: (target: BuildingTarget) => void = () => {},
    private readonly onEscortPayout: (amount: number, position: THREE.Vector3, atSim: number) => void = () => {},
    private readonly escortRepairers: () => readonly THREE.Vector3[] = () => [heroPosition],
  ) {
    this.nextWaveAt = this.waveInterval();
    this.nextPlanWaveAt = this.nextWaveAt;
    const mode = this.escortMode;
    const route = mode ? this.contract.tileParams.rails?.[mode.railRouteIndex] : undefined;
    this.escortCart = mode && route?.points.length
      ? new OreCart(
          route.points,
          Balance.contracts.escortCart.speed,
          Balance.contracts.escortCart.hp,
          Balance.contracts.escortCart.stopHpRatio,
          Balance.contracts.escortCart.repairSeconds,
          Balance.contracts.escortCart.repairRadius,
        )
      : null;
    if (this.escortCart) {
      this.enemies.group.add(this.escortCart.group);
      registerEscortTarget(this.escortCart.target);
    }
  }

  private get contract(): ContractManifest {
    return this.liveContract();
  }

  private get spawnEdges(): readonly CompassEdge[] {
    return this.contract.tileParams.lanes.spawnEdges;
  }

  private get escortMode() {
    const params = new URLSearchParams(globalThis.location?.search ?? '');
    if (params.get('mode') !== 'escort' || params.get('mp') === 'dev') return undefined;
    return this.contract.modes?.find((mode) => mode.id === 'escort');
  }

  get diagnostics(): WaveDiagnostics {
    return {
      wave: this.wave,
      nextWaveInSim: Math.max(0, this.nextWaveAt - this.currentAtSim),
      trickleInterval: this.currentTrickleInterval(this.currentAtSim),
      waveSpawnedTotal: this.waveSpawnedTotal,
      waveState: this.waveState,
      pulse: this.pulse,
      edge: this.edge,
      budget: this.budget,
      lastPulseAt: this.lastPulseAt,
      escort: this.escortDiagnostics,
    };
  }

  get escortDiagnostics(): WaveDiagnostics['escort'] {
    const mode = this.escortMode;
    if (!mode || !this.escortCart) return { enabled: false };
    return {
      enabled: true,
      ...this.escortCart.diagnostics,
      objectiveLost: this.escortLost,
      arrived: this.escortArrived,
      required: mode.cartsRequired,
      payout: mode.payout,
    };
  }

  preferredEscortTarget(from: THREE.Vector3): BuildingTarget | null {
    const target = this.escortCart?.target;
    if (!target?.active) return null;
    return from.distanceToSquared(target.position) <= Balance.contracts.escortCart.enemyPreferenceRange ** 2 ? target : null;
  }

  get activeEscortTarget(): BuildingTarget | null {
    return this.escortCart?.target.active ? this.escortCart.target : null;
  }

  resolveEscortDamage(target: BuildingTarget, amount: number) {
    if (target !== this.escortCart?.target) return null;
    return this.escortCart.damage(amount);
  }

  captureRngState(): RngState {
    return this.rng.snapshot();
  }

  restoreRngState(state: RngState): void {
    this.rng.restore(state);
  }

  update(atSim: number): void {
    this.updateEscort(atSim);
    this.currentAtSim = atSim;
    if (this.scheduledDisabled()) {
      this.waveState = 'quiet';
      return;
    }

    this.planDueWaves(atSim);
    this.telegraphDuePulses(atSim);
    if (!this.spawnDuePulses(atSim)) return;

    while (atSim >= this.nextTrickleAt) {
      const lullUntil = this.trickleLullUntil();
      if (this.nextTrickleAt < lullUntil) {
        this.nextTrickleAt = lullUntil;
        continue;
      }
      if (this.lastPulseAt > 0 && this.nextTrickleAt <= this.lastPulseAt) {
        this.nextTrickleAt = this.lastPulseAt + this.currentTrickleInterval(this.lastPulseAt);
        continue;
      }
      const edge = this.pickEdge();
      this.pulse = 0;
      this.spawnAt(edge, 0, this.wave, this.waveBudget(this.wave), false, false, this.variantOptionsFor(Math.max(1, this.wave), edge, 0));
      this.nextTrickleAt += this.currentTrickleInterval(this.waveElapsedAt(this.nextTrickleAt));
    }

    const firstPending = this.plannedPulses.findIndex((pulse) => !pulse.spawned);
    if (firstPending < 0) {
      this.plannedPulses.length = 0;
    } else if (firstPending > 0) {
      this.plannedPulses.splice(0, firstPending);
    }
    this.waveState = this.resolveWaveState(atSim);
  }

  reset(): void {
    this.rng.reset();
    this.nextTrickleAt = Balance.waves.graceSeconds + Balance.waves.trickleInterval;
    this.nextWaveAt = this.waveInterval();
    this.nextPlanWaveAt = this.nextWaveAt;
    this.nextPlanWave = 1;
    this.plannedPulses.length = 0;
    this.wave = 0;
    this.pulse = 0;
    this.edge = null;
    this.budget = 0;
    this.waveSpawnedTotal = 0;
    this.copyCursor = 0;
    this.lastCopy = '';
    this.currentAtSim = 0;
    this.waveState = 'quiet';
    this.lastPulseAt = Number.NEGATIVE_INFINITY;
    this.baronSpawned = false;
    this.escortArrived = 0;
    this.escortLost = false;
    this.escortSettled = false;
    this.escortCart?.reset();
  }

  private updateEscort(atSim: number): void {
    if (!this.escortCart || this.escortSettled) return;
    const state = this.escortCart.update(Math.max(0, atSim - this.currentAtSim), this.escortRepairers());
    if (state === 'destroyed') {
      this.escortLost = true;
      this.escortSettled = true;
      this.announce('ORE CART LOST - the run continues.', atSim);
      return;
    }
    if (state !== 'arrived') return;
    const mode = this.escortMode;
    this.escortArrived += 1;
    this.escortSettled = true;
    if (mode) this.onEscortPayout(mode.payout, this.escortCart.group.position, atSim);
    this.announce(`ORE CART DELIVERED - +${mode?.payout ?? 0} gold at the railhead.`, atSim);
  }

  setWaveForTest(wave: number): void {
    this.wave = Math.max(0, Math.floor(wave));
    this.pulse = 0;
    this.edge = null;
    this.budget = 0;
    this.waveSpawnedTotal = 0;
    this.plannedPulses.length = 0;
    this.nextWaveAt = this.currentAtSim + this.waveInterval();
    this.nextPlanWaveAt = this.nextWaveAt;
    this.nextPlanWave = this.wave + 1;
    this.lastPulseAt = this.currentAtSim;
    this.baronSpawned = this.wave >= (this.contract.twist.baron?.wave ?? Number.POSITIVE_INFINITY);
  }

  spawnDebugPack(
    count: number = Balance.enemy.debugPackSize,
    radius: number = Balance.enemy.debugPackRadius,
    opts: SpawnPackOptions = {},
  ): number {
    if (isSpawnDisabled()) return 0;

    let spawned = 0;
    this.debugCenter.copy(this.heroPosition);
    const startAngle = Math.PI * -0.5;
    for (let i = 0; i < count; i += 1) {
      const angle = startAngle + (i / Math.max(1, count)) * Math.PI * 2;
      this.spawnPosition.set(
        this.debugCenter.x + Math.cos(angle) * radius,
        Balance.enemy.groundY,
        this.debugCenter.z + Math.sin(angle) * radius,
      );
      if (this.spawnAtPosition(this.wave, true, opts)) spawned += 1;
    }
    return spawned;
  }

  spawnStressEnemies(): number {
    if (isSpawnDisabled()) return 0;

    const count = getStressCount();
    let spawned = 0;
    for (let i = 0; i < count; i += 1) {
      if (this.enemies.activeCount >= this.enemies.capacity) break;
      const edge = this.spawnEdges[i % Math.max(1, this.spawnEdges.length)] ?? 'west';
      const wave = Math.max(1, this.wave);
      if (this.spawnAt(edge, i, wave, count, false, false, this.variantOptionsFor(wave, edge, i), false)) spawned += 1;
    }
    return spawned;
  }

  private planDueWaves(atSim: number): void {
    while (atSim >= this.nextPlanWaveAt - this.maxTelegraphLead()) {
      this.planWave(this.nextPlanWave, this.nextPlanWaveAt);
      this.nextPlanWave += 1;
      this.nextPlanWaveAt += this.waveInterval();
    }
  }

  private planWave(wave: number, startAt: number): void {
    const pulseCount = this.effectivePulsesPerWave(wave);
    const edgeCount = this.effectiveEdgesPerPulse();
    const budget = Math.max(pulseCount * edgeCount, this.waveBudget(wave));
    const slots = pulseCount * edgeCount;
    const baseCount = Math.floor(budget / slots);
    let extra = budget % slots;
    const lull = this.lullSecondsFor(wave);

    for (let pulse = 1; pulse <= pulseCount; pulse += 1) {
      const edges = this.pickEdges(edgeCount);
      const counts = edges.map(() => {
        const count = baseCount + (extra > 0 ? 1 : 0);
        extra = Math.max(0, extra - 1);
        return count;
      });
      this.plannedPulses.push({
        wave,
        pulse,
        spawnAt: startAt + (pulse - 1) * lull,
        edges,
        counts,
        budget,
        telegraphed: edges.map(() => false),
        spawned: false,
      });
    }
  }

  private telegraphDuePulses(atSim: number): void {
    for (const pulse of this.plannedPulses) {
      if (pulse.spawned) continue;
      for (let i = 0; i < pulse.edges.length; i += 1) {
        if (pulse.telegraphed[i]) continue;
        const edge = pulse.edges[i];
        if (!edge) continue;
        const telegraphAt = pulse.spawnAt - this.telegraphLead(i, pulse.edges.length);
        if (atSim < telegraphAt) continue;
        pulse.telegraphed[i] = true;
        this.pulse = pulse.pulse;
        this.edge = edge;
        this.budget = pulse.budget;
        this.announce(this.waveCopy(edge), telegraphAt);
        if (this.isWreckerPulse(pulse.counts[i] ?? 0, pulse.wave, pulse.pulse)) {
          this.announce(this.wreckerCopy(edge), telegraphAt);
        }
      }
    }
  }

  private spawnDuePulses(atSim: number): boolean {
    for (const pulse of this.plannedPulses) {
      if (pulse.spawned || atSim < pulse.spawnAt) continue;
      const startedNewWave = pulse.wave > this.wave;
      if (startedNewWave) {
        if (this.onWaveStarted(pulse.wave, pulse.spawnAt) === false) {
          this.wave = Math.max(this.wave, pulse.wave);
          this.pulse = pulse.pulse;
          this.budget = pulse.budget;
          return false;
        }
      }
      pulse.spawned = true;
      this.wave = Math.max(this.wave, pulse.wave);
      this.pulse = pulse.pulse;
      this.budget = pulse.budget;
      this.lastPulseAt = pulse.spawnAt;
      this.advanceNextWaveAt(pulse.spawnAt);

      for (let edgeIndex = 0; edgeIndex < pulse.edges.length; edgeIndex += 1) {
        const edge = pulse.edges[edgeIndex];
        const count = pulse.counts[edgeIndex] ?? 0;
        if (!edge) continue;
        const roster = this.enemyRosterFor(pulse.wave, edge);
        if (roster.length > 0) {
          this.edge = edge;
          for (let i = 0; i < count; i += 1) {
            const variant = this.variantFor(roster, pulse.wave, edge, i);
            this.spawnAt(edge, i, pulse.wave, count, false, false, this.optionsForVariant(variant));
          }
        } else {
          this.edge = edge;
          const thieves = this.thiefCount(count, pulse.wave);
          const shared = Balance.waves.pressureBudgetShared;
          const wreckers = this.wreckerCount(shared ? count - thieves : count, pulse.wave, pulse.pulse);
          const total = shared ? count : count + thieves + wreckers;
          for (let i = 0; i < total; i += 1) {
            this.spawnAt(edge, i, pulse.wave, total, i < thieves, i >= thieves && i < thieves + wreckers);
          }
        }
      }

      if (startedNewWave) {
        this.spawnBaronWave(pulse.wave, pulse.edges[0] ?? this.pickEdge());
        return false;
      }
    }
    return true;
  }

  private spawnAt(
    edge: CompassEdge,
    index: number,
    wave: number,
    groupCount = this.waveBudget(wave),
    thief = false,
    wrecker = false,
    options: SpawnPackOptions = {},
    respectAliveCap = true,
  ): boolean {
    if (respectAliveCap && Balance.waves.aliveCap - this.enemies.activeCount <= 0) return false;

    const radius = Balance.waves.spawnRingRadius;
    const spread = (index - 0.5 * Math.max(0, groupCount - 1)) * 1.35;
    const jitter = this.rng.range(-1.2, 1.2);
    const lateral = this.territoryRingLateral(spread + jitter, wave);
    const center = this.territoryRingSpawnCenter(wave);

    if (edge === 'north') {
      this.spawnPosition.set(center.x + lateral, Balance.enemy.groundY, center.z + radius);
    } else if (edge === 'south') {
      this.spawnPosition.set(center.x + lateral, Balance.enemy.groundY, center.z - radius);
    } else if (edge === 'east') {
      this.spawnPosition.set(center.x + radius, Balance.enemy.groundY, center.z + lateral);
    } else {
      this.spawnPosition.set(center.x - radius, Balance.enemy.groundY, center.z + lateral);
    }

    const gated = this.applyVariantSpawnGate(edge, spread + jitter, options.spawnGates);
    if (!gated) {
      this.spawnPosition.x = this.clampSpawn(this.spawnPosition.x);
      this.spawnPosition.z = this.clampSpawn(this.spawnPosition.z);
    }
    this.keepSpawnOutOfDeepWater(edge);
    return this.spawnAtPosition(wave, respectAliveCap, { edge, thief, wrecker, ...options });
  }

  private spawnAtPosition(
    wave: number,
    respectAliveCap = true,
    params: SpawnPackOptions & { edge?: CompassEdge; thief?: boolean; wrecker?: boolean } = {},
  ): boolean {
    if (respectAliveCap && Balance.waves.aliveCap - this.enemies.activeCount <= 0) return false;
    this.keepSpawnOutOfDeepWater(params.edge);

    const speedScale = Math.min(
      Balance.waves.speedScaleCap,
      Math.pow(Balance.waves.speedScalePerWave, wave) * this.speedVariance(),
    );
    const enemy = this.enemies.spawn(this.spawnPosition, {
      hpScale: Math.pow(Balance.waves.hpScalePerWave, wave) * (params.hpScale ?? 1),
      speedScale: params.speedScale ?? speedScale * (params.speedMult ?? 1),
      edge: params.edge,
      thief: params.thief === true,
      wrecker: params.wrecker === true,
      carriedLantern: params.carriedLantern ?? this.enemyCarriesLantern(params.thief === true, params.wrecker === true),
      eliteKind: params.eliteKind,
      visualScale: params.visualScale,
      banner: params.banner,
      contactDamageScale: params.contactDamageScale,
      buildingDamageScale: params.buildingDamageScale,
      supportBuildingDamageScale: params.supportBuildingDamageScale,
      heroPursuitRange: params.heroPursuitRange,
      variantId: params.variantId,
      variantLabel: params.variantLabel,
      tint: params.tint,
      boltDamageMult: params.boltDamageMult,
      bossGroupId: params.bossGroupId,
      bossGroupSize: params.bossGroupSize,
      bossGroupTotalHp: params.bossGroupTotalHp,
      bossComponentId: params.bossComponentId,
      bossComponentLabel: params.bossComponentLabel,
      bossDegradeSpeedMult: params.bossDegradeSpeedMult,
    });
    if (!enemy) return false;
    this.waveSpawnedTotal += 1;
    return true;
  }

  private keepSpawnOutOfDeepWater(edge?: CompassEdge): void {
    if (!Balance.pathing.riverBlocksEnemies || Terrain.sample(this.spawnPosition.x, this.spawnPosition.z).zone !== 'river') return;

    if (edge === 'north') this.spawnPosition.z = Terrain.RIVER_MAX_Z + Terrain.SHALLOWS_WIDTH;
    else if (edge === 'south') this.spawnPosition.z = Terrain.RIVER_MIN_Z - Terrain.SHALLOWS_WIDTH;
    else this.spawnPosition.z = this.heroPosition.z >= 0 ? Terrain.RIVER_MAX_Z + Terrain.SHALLOWS_WIDTH : Terrain.RIVER_MIN_Z - Terrain.SHALLOWS_WIDTH;
  }

  private pickEdge(): CompassEdge {
    const edges = this.spawnEdges;
    return edges[this.rng.int(0, edges.length)] ?? 'west';
  }

  private pickEdges(count: number): CompassEdge[] {
    const available = [...this.spawnEdges];
    const edges: CompassEdge[] = [];
    for (let i = 0; i < count && available.length > 0; i += 1) {
      const index = this.rng.int(0, available.length);
      const edge = available.splice(index, 1)[0];
      if (edge) edges.push(edge);
    }
    return edges;
  }

  private thiefCount(groupCount: number, wave: number): number {
    if (!this.canSpawnThieves() || wave < Balance.steal.minWave) return 0;
    const count = Math.floor(groupCount * Balance.steal.share);
    const slots = this.thiefCap(wave) - this.liveThiefCount();
    if (slots <= 0) return 0;
    return Math.min(groupCount, slots, Math.max(1, count));
  }

  private enemyCarriesLantern(thief: boolean, wrecker: boolean): boolean {
    const classes = this.contract.twist.enemyLanternClasses ?? [];
    return thief ? classes.includes('thief') : !wrecker && classes.includes('rusher');
  }

  private thiefCap(wave: number): number {
    const base = Math.max(0, Math.floor(Balance.steal.maxConcurrent));
    const every = Math.max(1, Math.floor(Balance.steal.maxConcurrentPerWaves));
    const hardCap = Math.max(0, Math.floor(Balance.steal.maxConcurrentCap));
    return Math.min(hardCap, base + Math.floor(Math.max(0, wave) / every));
  }

  private wreckerCount(remainder: number, wave: number, pulse: number): number {
    if (remainder <= 0 || !this.canSpawnWreckers()) return 0;
    if (wave < Balance.wreck.minWave) return 0;
    if (pulse % Math.max(1, Math.floor(Balance.wreck.pulseEvery)) !== 0) return 0;
    const count = Math.floor(remainder * Balance.wreck.share);
    const cap = wave >= 20 ? Math.max(1, Math.floor(Balance.wreck.maxPerEdgeWave20)) : remainder;
    return Math.min(remainder, cap, Math.max(1, count));
  }

  private isWreckerPulse(groupCount: number, wave: number, pulse: number): boolean {
    const thieves = this.thiefCount(groupCount, wave);
    return this.wreckerCount(groupCount - thieves, wave, pulse) > 0;
  }

  private enemyRosterFor(wave: number, edge: CompassEdge): readonly ContractEnemyVariant[] {
    const roster = this.contract.twist.enemyRoster ?? [];
    if (roster.length === 0) return [];
    const edgeRoster = roster.filter((entry) => wave >= (entry.waveMin ?? 1) && (!entry.spawnEdges || entry.spawnEdges.includes(edge)));
    return edgeRoster.length > 0 ? edgeRoster : roster.filter((entry) => wave >= (entry.waveMin ?? 1));
  }

  private variantFor(roster: readonly ContractEnemyVariant[], wave: number, edge: CompassEdge, index: number): ContractEnemyVariant {
    const edgeOffset = edge === 'north' ? 0 : edge === 'east' ? 1 : edge === 'south' ? 2 : 3;
    return roster[(wave + edgeOffset + index) % roster.length] ?? roster[0]!;
  }

  private variantOptionsFor(wave: number, edge: CompassEdge, index: number): SpawnPackOptions {
    const roster = this.enemyRosterFor(wave, edge);
    if (roster.length === 0) return {};
    return this.optionsForVariant(this.variantFor(roster, wave, edge, index));
  }

  private optionsForVariant(variant: ContractEnemyVariant): SpawnPackOptions {
    return {
      thief: variant.thief,
      wrecker: variant.wrecker || (this.escortCart?.target.active === true && variant.id === 'rail_tough'),
      variantId: variant.id,
      variantLabel: variant.label,
      hpScale: variant.hpScale,
      speedMult: variant.speedMult,
      visualScale: variant.visualScale,
      tint: variant.tint,
      boltDamageMult: variant.boltDamageMult,
      contactDamageScale: variant.contactDamageScale,
      buildingDamageScale: variant.buildingDamageScale,
      supportBuildingDamageScale: variant.supportBuildingDamageScale,
      heroPursuitRange: variant.heroPursuitRange,
      spawnGates: variant.spawnGates,
    };
  }

  private currentTrickleInterval(atSim: number): number {
    const decaySteps = Math.floor(Math.max(0, atSim - Balance.waves.graceSeconds) / Balance.waves.trickleDecayEvery);
    return Math.max(
      Balance.waves.trickleFloor,
      Balance.waves.trickleInterval * Math.pow(Balance.waves.trickleDecay, decaySteps),
    );
  }

  private waveElapsedAt(atSim: number): number {
    return Math.max(Balance.waves.graceSeconds, atSim);
  }

  private waveBudget(wave: number): number {
    const linear = Balance.waves.pulseBase + Balance.waves.pulsePerWave * wave;
    const kneeWave = Math.max(0, Balance.waves.kneeWave);
    if (wave <= kneeWave) return Math.max(1, Math.round(linear));

    const kneeBudget = Balance.waves.pulseBase + Balance.waves.pulsePerWave * kneeWave;
    const ceiling = Math.max(kneeBudget, Balance.waves.budgetCeiling);
    const excess = Math.max(0, linear - kneeBudget);
    const sharpness = Math.max(0.01, Balance.waves.kneeSharpness);
    const eased = ceiling - (ceiling - kneeBudget) * Math.exp(-excess / sharpness);
    return Math.max(1, Math.round(Math.min(ceiling, eased)));
  }

  private effectivePulsesPerWave(wave = this.nextPlanWave): number {
    const requested = Math.max(1, Math.floor(Balance.waves.pulsesPerWave));
    const lull = Math.max(0.1, this.lullSecondsFor(wave));
    const maxByInterval = Math.max(1, Math.floor((this.waveInterval() - TELEGRAPH_SECONDS) / lull) + 1);
    return Math.min(requested, maxByInterval);
  }

  private lullSecondsFor(wave: number): number {
    const base = Math.max(0, Balance.waves.lullSeconds);
    return wave >= 12 ? Math.max(base, Balance.waves.lullFloor12) : base;
  }

  private effectiveEdgesPerPulse(): number {
    return Math.max(1, Math.min(this.spawnEdges.length, Math.floor(Balance.waves.edgesPerPulse)));
  }

  private waveInterval(): number {
    const cadence = Math.max(0.1, this.contract.twist.waveCadenceMult ?? 1);
    return Math.max(0.1, Balance.waves.waveInterval / cadence);
  }

  private spawnBaronWave(wave: number, edge: CompassEdge): void {
    const baron = this.contract.twist.baron;
    if (!baron || this.baronSpawned || wave !== baron.wave) return;
    this.baronSpawned = true;
    const escorts = Math.max(0, Math.floor(baron.escortCount));
    const groupCount = escorts + 1;
    for (let index = 0; index < escorts; index += 1) {
      this.spawnAt(edge, index, wave, groupCount, false, false, this.variantOptionsFor(wave, edge, index));
    }
    if ((baron.components?.length ?? 0) > 0) {
      this.spawnComponentBossWave(wave);
      return;
    }
    const spawned = this.spawnAt(
      edge,
      escorts,
      wave,
      groupCount,
      false,
      true,
      {
        eliteKind: baron.bossKind ?? 'baron',
        hpScale: baron.hpScale,
        speedMult: baron.speedScale,
        visualScale: baron.scale,
        banner: true,
        wrecker: true,
        contactDamageScale: baron.contactDamageScale,
        buildingDamageScale: baron.buildingDamageScale,
        supportBuildingDamageScale: baron.supportBuildingDamageScale,
        heroPursuitRange: baron.pursuitRange,
      },
      false,
    );
    if (spawned) this.onBaronSpawned(this.spawnPosition, this.currentAtSim);
  }

  private spawnComponentBossWave(wave: number): void {
    const baron = this.contract.twist.baron;
    const components = baron?.components ?? [];
    if (!baron || components.length === 0) return;
    const route = this.contract.tileParams.rails?.[baron.railRouteIndex ?? 0];
    const start = route?.points[0] ?? ({ x: -Balance.waves.spawnRingRadius, z: 0 } satisfies RailPathPoint);
    const end = route?.points[(route?.points.length ?? 1) - 1] ?? ({ x: Balance.waves.spawnRingRadius, z: 0 } satisfies RailPathPoint);
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.max(0.001, Math.hypot(dx, dz));
    const alongX = dx / length;
    const alongZ = dz / length;
    const sideX = -alongZ;
    const sideZ = alongX;
    const waveHpScale = Math.pow(Balance.waves.hpScalePerWave, wave);
    const waveSpeedScale = Math.min(Balance.waves.speedScaleCap, Math.pow(Balance.waves.speedScalePerWave, wave));
    const totalHp = Balance.enemy.hp * waveHpScale * baron.hpScale * components.reduce((sum, component) => sum + component.hpScale, 0);
    const groupKind = (baron.variantId ?? 'baron_railcar') === 'baron_railcar' ? 'railcar' : 'component-boss';
    const groupId = `${this.contract.id}:wave-${wave}:${groupKind}`;
    let spawned = 0;
    for (const component of components) {
      const along = component.xOffset ?? spawned * 1.1;
      const side = component.zOffset ?? 0;
      this.spawnPosition.set(
        start.x + alongX * along + sideX * side,
        Balance.enemy.groundY,
        start.z + alongZ * along + sideZ * side,
      );
      const enemy = this.enemies.spawn(this.spawnPosition, {
        eliteKind: baron.bossKind ?? 'railcar',
        hpScale: waveHpScale * baron.hpScale * component.hpScale,
        speedScale: waveSpeedScale * (baron.railSpeed ?? baron.speedScale),
        visualScale: (component.visualScale ?? 1) * baron.scale,
        wrecker: true,
        edge: edgeFromPoint(start),
        contactDamageScale: component.contactDamageScale ?? baron.contactDamageScale,
        buildingDamageScale: (baron.buildingDamageScale ?? 1) * (component.buildingDamageScale ?? 1),
        supportBuildingDamageScale: (baron.supportBuildingDamageScale ?? baron.buildingDamageScale ?? 1) * (component.supportBuildingDamageScale ?? 1),
        heroPursuitRange: baron.pursuitRange,
        variantId: baron.variantId ?? 'baron_railcar',
        variantLabel: baron.variantLabel ?? 'Armored Railcar',
        tint: component.tint,
        boltDamageMult: component.boltDamageMult,
        bossGroupId: groupId,
        bossGroupSize: components.length,
        bossGroupTotalHp: totalHp,
        bossComponentId: component.id,
        bossComponentLabel: component.label,
        bossDegradeSpeedMult: baron.componentDegradeSpeedMult,
      });
      if (!enemy) continue;
      enemy.scriptMoveRoute(route?.points ?? [start, end], Math.max(0, baron.railSpeed ?? baron.speedScale), {
        ignoreTerrain: true,
        offsetX: alongX * along + sideX * side,
        offsetZ: alongZ * along + sideZ * side,
      });
      this.waveSpawnedTotal += 1;
      spawned += 1;
    }
    if (spawned > 0) this.onBaronSpawned(this.spawnPosition, this.currentAtSim);
  }

  private maxTelegraphLead(): number {
    return this.telegraphLead(0, this.effectiveEdgesPerPulse());
  }

  private telegraphLead(index: number, count: number): number {
    return TELEGRAPH_SECONDS + Math.max(0, count - index - 1) * TELEGRAPH_STAGGER_SECONDS;
  }

  private advanceNextWaveAt(atSim: number): void {
    while (this.nextWaveAt <= atSim) this.nextWaveAt += this.waveInterval();
  }

  private trickleLullUntil(): number {
    if (this.lastPulseAt <= 0) return Number.NEGATIVE_INFINITY;
    const nextPulse = this.plannedPulses.find(
      (pulse) => !pulse.spawned && pulse.wave === this.wave && pulse.spawnAt > this.lastPulseAt,
    );
    if (!nextPulse) return this.lastPulseAt;
    return Math.min(nextPulse.spawnAt, this.lastPulseAt + this.lullSecondsFor(this.wave));
  }

  private resolveWaveState(atSim: number): WaveDiagnostics['waveState'] {
    if (atSim < Balance.waves.graceSeconds) return 'quiet';
    const warning = this.plannedPulses.some(
      (pulse) => !pulse.spawned && atSim < pulse.spawnAt && pulse.telegraphed.some(Boolean),
    );
    return warning ? 'warning' : 'active';
  }

  private waveCopy(edge: CompassEdge): string {
    const pool = EDGE_COPY[edge];
    let text = pool[this.copyCursor % pool.length] ?? pool[0];
    this.copyCursor += 1;
    if (text === this.lastCopy) {
      text = pool[this.copyCursor % pool.length] ?? text;
      this.copyCursor += 1;
    }
    this.lastCopy = text;
    return text;
  }

  private wreckerCopy(edge: CompassEdge): string {
    return `Wrecking crew sighted - ${EDGE_PLACES[edge]}.`;
  }

  private speedVariance(): number {
    return 1 + this.rng.range(-Balance.enemy.speedVariance, Balance.enemy.speedVariance);
  }

  private territoryRingLateral(lateral: number, wave: number): number {
    if (!this.usesTerritoryRingLane(wave)) return lateral;
    const bias = THREE.MathUtils.clamp(this.contract.tileParams.lanes.territoryRingLaneBias, 0, 1);
    return lateral * (1 - bias);
  }

  private territoryRingSpawnCenter(wave: number): THREE.Vector3 {
    return this.usesTerritoryRingLane(wave) ? this.territoryRingCenter : this.heroPosition;
  }

  private usesTerritoryRingLane(wave: number): boolean {
    return this.hasTerritoryRing() && wave <= this.contract.tileParams.lanes.territoryRingBiasWaves;
  }

  private applyVariantSpawnGate(edge: CompassEdge, lateral: number, gates?: readonly ContractEnemySpawnGate[]): boolean {
    const gate = gates?.find((entry) => entry.edge === edge);
    if (!gate) return false;
    const offset = THREE.MathUtils.clamp(lateral, -6, 6) * 0.35;
    const tangentX = edge === 'north' || edge === 'south' ? 1 : 0;
    const tangentZ = edge === 'east' || edge === 'west' ? 1 : 0;
    this.spawnPosition.set(gate.x + tangentX * offset, Balance.enemy.groundY, gate.z + tangentZ * offset);
    return true;
  }

  private clampSpawn(value: number): number {
    return THREE.MathUtils.clamp(value, -Terrain.CLAIM_HALF, Terrain.CLAIM_HALF);
  }
}

function edgeFromPoint(point: RailPathPoint): CompassEdge {
  return Math.abs(point.x) > Math.abs(point.z) ? (point.x >= 0 ? 'east' : 'west') : point.z >= 0 ? 'north' : 'south';
}
