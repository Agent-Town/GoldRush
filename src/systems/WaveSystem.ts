import * as THREE from 'three';
import { getStressCount, isSpawnDisabled } from '../core/DebugParams';
import type { CompassEdge } from '../entities/Enemy';
import type { Rng } from '../core/Rng';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import { activeContract } from '../meta/ContractFamilies';
import * as Terrain from '../world/Terrain';

export type SpawnPackOptions = {
  speedScale?: number;
  wrecker?: boolean;
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
};

const TELEGRAPH_SECONDS = 2;
const TELEGRAPH_STAGGER_SECONDS = 0.5;
const ACTIVE_CONTRACT = activeContract();
export const WAVE_SPAWN_EDGES: readonly CompassEdge[] = ACTIVE_CONTRACT.tileParams.lanes.spawnEdges;

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

  constructor(
    private readonly enemies: EnemyPool,
    private readonly heroPosition: THREE.Vector3,
    private readonly rng: Rng,
    private readonly announce: (text: string, atSim: number) => void,
    private readonly onWaveStarted: (wave: number, atSim: number) => boolean | void,
    private readonly scheduledDisabled: () => boolean,
    private readonly canSpawnThieves: () => boolean = () => false,
    private readonly canSpawnWreckers: () => boolean = () => false,
    private readonly liveThiefCount: () => number = () => 0,
    private readonly hasTerritoryRing: () => boolean = () => false,
    private readonly territoryRingCenter: THREE.Vector3 = heroPosition,
  ) {}

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
    };
  }

  update(atSim: number): void {
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
      this.pulse = 0;
      this.spawnAt(this.pickEdge(), 0, this.wave);
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
    this.nextTrickleAt = Balance.waves.graceSeconds + Balance.waves.trickleInterval;
    this.nextWaveAt = Balance.waves.waveInterval;
    this.nextPlanWaveAt = Balance.waves.waveInterval;
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
      const angle = (i / Math.max(1, count)) * Math.PI * 2;
      this.spawnPosition.set(
        this.heroPosition.x + Math.cos(angle) * 15,
        Balance.enemy.groundY,
        this.heroPosition.z + Math.sin(angle) * 15,
      );
      if (this.spawnAtPosition(this.wave, false)) spawned += 1;
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
      if (startedNewWave && this.onWaveStarted(pulse.wave, pulse.spawnAt) === false) {
        this.wave = Math.max(this.wave, pulse.wave);
        this.pulse = pulse.pulse;
        this.budget = pulse.budget;
        return false;
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
        this.edge = edge;
        const thieves = this.thiefCount(count, pulse.wave);
        const shared = Balance.waves.pressureBudgetShared;
        const wreckers = this.wreckerCount(shared ? count - thieves : count, pulse.wave, pulse.pulse);
        const total = shared ? count : count + thieves + wreckers;
        for (let i = 0; i < total; i += 1) {
          this.spawnAt(edge, i, pulse.wave, total, i < thieves, i >= thieves && i < thieves + wreckers);
        }
      }

      if (startedNewWave) return false;
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
  ): boolean {
    if (Balance.waves.aliveCap - this.enemies.activeCount <= 0) return false;

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

    this.spawnPosition.x = this.clampSpawn(this.spawnPosition.x);
    this.spawnPosition.z = this.clampSpawn(this.spawnPosition.z);
    this.keepSpawnOutOfDeepWater(edge);
    return this.spawnAtPosition(wave, true, { edge, thief, wrecker });
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
      hpScale: Math.pow(Balance.waves.hpScalePerWave, wave),
      speedScale: params.speedScale ?? speedScale,
      edge: params.edge,
      thief: params.thief === true,
      wrecker: params.wrecker === true,
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
    return WAVE_SPAWN_EDGES[this.rng.int(0, WAVE_SPAWN_EDGES.length)] ?? 'west';
  }

  private pickEdges(count: number): CompassEdge[] {
    const available = [...WAVE_SPAWN_EDGES];
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
    return Math.max(1, Math.min(WAVE_SPAWN_EDGES.length, Math.floor(Balance.waves.edgesPerPulse)));
  }

  private waveInterval(): number {
    return Math.max(0.1, Balance.waves.waveInterval);
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
    const bias = THREE.MathUtils.clamp(ACTIVE_CONTRACT.tileParams.lanes.territoryRingLaneBias, 0, 1);
    return lateral * (1 - bias);
  }

  private territoryRingSpawnCenter(wave: number): THREE.Vector3 {
    return this.usesTerritoryRingLane(wave) ? this.territoryRingCenter : this.heroPosition;
  }

  private usesTerritoryRingLane(wave: number): boolean {
    return this.hasTerritoryRing() && wave <= ACTIVE_CONTRACT.tileParams.lanes.territoryRingBiasWaves;
  }

  private clampSpawn(value: number): number {
    return Math.max(-38, Math.min(38, value));
  }
}
