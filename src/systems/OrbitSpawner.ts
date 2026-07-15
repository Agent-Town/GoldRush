export type OrbitPoint = Readonly<{ x: number; z: number }>;

export type OrbitSpawnConfig = Readonly<{
  contractId: string;
  enabled: boolean;
  center: OrbitPoint;
  radius: number;
  angularSpeed: number;
  lapsBeforePeel: number;
  peelSpeed: number;
  telegraphSeconds: number;
  peelPoints: readonly Readonly<{ id: string; angle: number }>[];
}>;

export type OrbitSpawnSnapshot = Readonly<{
  contractId: string;
  enabled: boolean;
  radius: number;
  members: readonly Readonly<{
    id: string;
    wave: number;
    state: 'orbiting' | 'peeled';
    x: number;
    z: number;
    radius: number;
    peelPointId: string;
    telegraphed: boolean;
    telegraphAt: number;
    peelAt: number;
  }>[];
}>;

type OrbitMember = {
  id: string;
  wave: number;
  startAt: number;
  startAngle: number;
  peelAngle: number;
  peelPointId: string;
  peelAt: number;
  telegraphAt: number;
};

export class OrbitSpawner {
  private readonly members: OrbitMember[] = [];

  constructor(private readonly config: OrbitSpawnConfig) {
    const values = [config.center.x, config.center.z, config.radius, config.angularSpeed, config.lapsBeforePeel, config.peelSpeed, config.telegraphSeconds];
    if (!config.contractId || values.some((value) => !Number.isFinite(value)) || config.radius <= 0 || config.angularSpeed <= 0 || config.peelSpeed <= 0 || config.telegraphSeconds < 0) {
      throw new Error('Orbit spawn config needs a contract, positive motion, and a non-negative telegraph.');
    }
    if (config.peelPoints.length === 0 || config.peelPoints.some((point) => !point.id || !Number.isFinite(point.angle))) {
      throw new Error('Orbit spawn config needs finite, named peel points.');
    }
  }

  spawnWave(wave: number, count: number, at: number): number {
    if (!this.config.enabled) return 0;
    if (![wave, count, at].every(Number.isFinite)) return 0;
    const safeWave = Math.max(1, Math.floor(wave));
    const safeCount = Math.max(0, Math.floor(count));
    for (let index = 0; index < safeCount; index += 1) {
      const startAngle = -Math.PI / 2 + index * 0.08;
      const peelPoint = this.config.peelPoints[(safeWave + index - 1) % this.config.peelPoints.length]!;
      const arc = positiveAngle(peelPoint.angle - startAngle) + Math.max(0, this.config.lapsBeforePeel) * Math.PI * 2;
      const peelAt = at + arc / this.config.angularSpeed;
      this.members.push({
        id: `wave-${safeWave}-${index + 1}`,
        wave: safeWave,
        startAt: at,
        startAngle,
        peelAngle: peelPoint.angle,
        peelPointId: peelPoint.id,
        peelAt,
        telegraphAt: peelAt - this.config.telegraphSeconds,
      });
    }
    return safeCount;
  }

  reset(): void {
    this.members.length = 0;
  }

  snapshot(at: number): OrbitSpawnSnapshot {
    return {
      contractId: this.config.contractId,
      enabled: this.config.enabled,
      radius: this.config.radius,
      members: this.members.map((member) => {
        const peeled = at >= member.peelAt;
        const peeledFor = Math.max(0, at - member.peelAt);
        const radius = Math.max(0, this.config.radius - peeledFor * this.config.peelSpeed);
        const angle = peeled
          ? member.peelAngle
          : member.startAngle + Math.max(0, at - member.startAt) * this.config.angularSpeed;
        return {
          id: member.id,
          wave: member.wave,
          state: peeled ? 'peeled' : 'orbiting',
          x: round3(this.config.center.x + Math.cos(angle) * radius),
          z: round3(this.config.center.z + Math.sin(angle) * radius),
          radius: round3(radius),
          peelPointId: member.peelPointId,
          telegraphed: at >= member.telegraphAt,
          telegraphAt: round3(member.telegraphAt),
          peelAt: round3(member.peelAt),
        };
      }),
    };
  }
}

function positiveAngle(value: number): number {
  return ((value % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
