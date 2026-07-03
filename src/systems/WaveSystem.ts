import * as THREE from 'three';
import { getStressCount, isSpawnDisabled } from '../core/DebugParams';
import type { Rng } from '../core/Rng';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';

type CompassEdge = 'north' | 'south' | 'east' | 'west';

export type WaveDiagnostics = {
  wave: number;
  nextWaveInSim: number;
  trickleInterval: number;
  waveSpawnedTotal: number;
  waveState: 'quiet' | 'warning' | 'active' | 'cleared';
};

const EDGE_COPY: Record<CompassEdge, readonly string[]> = {
  north: [
    'Rustlers on the north bank!',
    'Keep the sluice running!',
    'The claim holds if you do.',
    'They want the gold, not the glory.',
  ],
  south: [
    'Claim Jumpers press the south bank!',
    'Stake lights to the south!',
    'Hold steady for the assay.',
    'The river keeps our receipt.',
  ],
  east: [
    'Claim Jumpers massing east!',
    'Beacon coils hum eastward!',
    'Prosperity needs a guard.',
    'The claim office stands ready.',
  ],
  west: [
    'Rustlers on the west ridge!',
    'Brass warnings from the west!',
    'Keep the ledgers clean.',
    'No one takes tomorrow from us.',
  ],
};

export class WaveSystem {
  private readonly spawnPosition = new THREE.Vector3();
  private readonly debugCenter = new THREE.Vector3();
  private nextTrickleAt = Balance.waves.graceSeconds + Balance.waves.trickleInterval;
  private nextWaveAt = Balance.waves.waveInterval;
  private wave = 0;
  private waveSpawnedTotal = 0;
  private copyCursor = 0;
  private lastCopy = '';
  private currentAtSim = 0;
  private waveState: WaveDiagnostics['waveState'] = 'quiet';

  constructor(
    private readonly enemies: EnemyPool,
    private readonly heroPosition: THREE.Vector3,
    private readonly rng: Rng,
    private readonly announce: (text: string, atSim: number) => void,
    private readonly scheduledDisabled: () => boolean,
  ) {}

  get diagnostics(): WaveDiagnostics {
    return {
      wave: this.wave,
      nextWaveInSim: Math.max(0, this.nextWaveAt - this.currentAtSim),
      trickleInterval: this.currentTrickleInterval(this.currentAtSim),
      waveSpawnedTotal: this.waveSpawnedTotal,
      waveState: this.waveState,
    };
  }

  update(atSim: number): void {
    this.currentAtSim = atSim;
    if (this.scheduledDisabled()) {
      this.waveState = 'quiet';
      return;
    }

    this.waveState = atSim < Balance.waves.graceSeconds ? 'quiet' : 'active';

    while (atSim >= this.nextWaveAt) {
      this.wave += 1;
      this.spawnWavePulse(atSim);
      this.nextWaveAt += Balance.waves.waveInterval;
    }

    while (atSim >= this.nextTrickleAt) {
      this.spawnAt(this.pickEdge(), 0, this.wave);
      this.nextTrickleAt += this.currentTrickleInterval(this.waveElapsedAt(this.nextTrickleAt));
    }
  }

  reset(): void {
    this.nextTrickleAt = Balance.waves.graceSeconds + Balance.waves.trickleInterval;
    this.nextWaveAt = Balance.waves.waveInterval;
    this.wave = 0;
    this.waveSpawnedTotal = 0;
    this.copyCursor = 0;
    this.lastCopy = '';
    this.currentAtSim = 0;
    this.waveState = 'quiet';
  }

  spawnDebugPack(count: number = Balance.enemy.debugPackSize, radius: number = Balance.enemy.debugPackRadius): number {
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
      if (this.spawnAtPosition(this.wave)) spawned += 1;
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

  private spawnWavePulse(atSim: number): void {
    const edge = this.pickEdge();
    const count = Balance.waves.pulseBase + Balance.waves.pulsePerWave * this.wave;
    this.announce(this.waveCopy(edge), atSim);
    for (let i = 0; i < count; i += 1) {
      this.spawnAt(edge, i, this.wave);
    }
  }

  private spawnAt(edge: CompassEdge, index: number, wave: number): boolean {
    if (Balance.waves.aliveCap - this.enemies.activeCount <= 0) return false;

    const radius = Balance.waves.spawnRingRadius;
    const spread = (index - 0.5 * Math.max(0, Balance.waves.pulseBase + Balance.waves.pulsePerWave * wave - 1)) * 1.35;
    const jitter = this.rng.range(-1.2, 1.2);
    const lateral = spread + jitter;

    if (edge === 'north') {
      this.spawnPosition.set(this.heroPosition.x + lateral, Balance.enemy.groundY, this.heroPosition.z + radius);
    } else if (edge === 'south') {
      this.spawnPosition.set(this.heroPosition.x + lateral, Balance.enemy.groundY, this.heroPosition.z - radius);
    } else if (edge === 'east') {
      this.spawnPosition.set(this.heroPosition.x + radius, Balance.enemy.groundY, this.heroPosition.z + lateral);
    } else {
      this.spawnPosition.set(this.heroPosition.x - radius, Balance.enemy.groundY, this.heroPosition.z + lateral);
    }

    this.spawnPosition.x = this.clampSpawn(this.spawnPosition.x);
    this.spawnPosition.z = this.clampSpawn(this.spawnPosition.z);
    return this.spawnAtPosition(wave);
  }

  private spawnAtPosition(wave: number, respectAliveCap = true): boolean {
    if (respectAliveCap && Balance.waves.aliveCap - this.enemies.activeCount <= 0) return false;

    const speedScale = Math.min(
      Balance.waves.speedScaleCap,
      Math.pow(Balance.waves.speedScalePerWave, wave) * this.speedVariance(),
    );
    const enemy = this.enemies.spawn(this.spawnPosition, {
      hpScale: Math.pow(Balance.waves.hpScalePerWave, wave),
      speedScale,
    });
    if (!enemy) return false;
    this.waveSpawnedTotal += 1;
    return true;
  }

  private pickEdge(): CompassEdge {
    const value = this.rng.int(0, 4);
    if (value === 0) return 'north';
    if (value === 1) return 'south';
    if (value === 2) return 'east';
    return 'west';
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

  private speedVariance(): number {
    return 1 + this.rng.range(-Balance.enemy.speedVariance, Balance.enemy.speedVariance);
  }

  private clampSpawn(value: number): number {
    return Math.max(-38, Math.min(38, value));
  }
}
