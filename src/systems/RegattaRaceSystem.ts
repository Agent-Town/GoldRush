import type { ContractManifest } from '../meta/ContractFamilies';

type Point = Readonly<{ x: number; z: number }>;
type Gate = Point & Readonly<{ id: string; radius?: number }>;

export type RegattaRaceDiagnostics = Readonly<{
  nextGate: Gate | null;
  gatesPassed: readonly Readonly<{ id: string; passedAt: number }>[];
  finished: boolean;
  finishedAt: number | null;
  fastWaterMultiplier: number;
}>;

const DEFAULT_GATE_RADIUS = 6;
const DEFAULT_FAST_WATER_MULTIPLIER = 1.35;

export class RegattaRaceSystem {
  private nextGateIndex = 0;
  private readonly passed: Array<{ id: string; passedAt: number }> = [];
  private finishedAt: number | null = null;

  private constructor(
    private readonly gates: readonly Gate[],
    private readonly finish: Gate,
    private readonly fastWaterZone: NonNullable<ContractManifest['tileParams']['raceCourse']>['fastWaterZone'],
    private readonly secureWave: number,
  ) {}

  static create(contract: ContractManifest): RegattaRaceSystem | null {
    const course = contract.tileParams.raceCourse;
    if (!course) return null;
    const finish = contract.tileParams.stakeMarkers?.find(({ heroStart }) => heroStart);
    if (!finish || course.beacons.length === 0 || contract.twist.secureWave === undefined) {
      throw new Error('The Regatta race data is incomplete.');
    }
    return new RegattaRaceSystem(course.beacons, finish, course.fastWaterZone, contract.twist.secureWave);
  }

  advance(at: number, wave: number, racers: readonly Point[]): void {
    if (this.finishedAt !== null || wave >= this.secureWave) return;
    const gate = this.nextGateIndex < this.gates.length ? this.gates[this.nextGateIndex] : this.finish;
    const radius = Number.isFinite(gate.radius) && gate.radius! > 0 ? gate.radius! : DEFAULT_GATE_RADIUS;
    if (!racers.some(({ x, z }) => Math.hypot(x - gate.x, z - gate.z) <= radius)) return;
    if (this.nextGateIndex < this.gates.length) {
      this.passed.push({ id: gate.id, passedAt: at });
      this.nextGateIndex += 1;
    } else {
      this.finishedAt = at;
    }
  }

  movementMultiplierAt(x: number, z: number): number {
    const zone = this.fastWaterZone;
    return x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ
      ? DEFAULT_FAST_WATER_MULTIPLIER
      : 1;
  }

  reset(): void {
    this.nextGateIndex = 0;
    this.passed.length = 0;
    this.finishedAt = null;
  }

  get diagnostics(): RegattaRaceDiagnostics {
    const gate = this.nextGateIndex < this.gates.length ? this.gates[this.nextGateIndex] : this.finish;
    return {
      nextGate: this.finishedAt === null ? { ...gate } : null,
      gatesPassed: this.passed.map((entry) => ({ ...entry })),
      finished: this.finishedAt !== null,
      finishedAt: this.finishedAt,
      fastWaterMultiplier: DEFAULT_FAST_WATER_MULTIPLIER,
    };
  }
}
