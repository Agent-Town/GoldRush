export type WeatherPhase = 'clear' | 'telegraph' | 'storm';

export type WeatherConfig = Readonly<{
  era: number;
  contractId: string;
  cycleSeconds: number;
  clearSeconds: number;
  telegraphSeconds: number;
  stormSeconds: number;
  stormMovementMultiplier: number;
  stormVisibilityMultiplier: number;
  hazeColor: string;
  hazeStrength: number;
}>;

export type WeatherSnapshot = Readonly<{
  era: number;
  contractId: string;
  phase: WeatherPhase;
  phaseProgress: number;
  cycle: number;
  simTime: number;
  movementMultiplier: number;
  visibilityMultiplier: number;
  hazeColor: string;
  hazeStrength: number;
  warning: boolean;
}>;

export class WeatherSystem {
  constructor(readonly config: WeatherConfig) {
    if (!validWeatherConfig(config)) throw new Error('Invalid weather config.');
  }

  sample(simTime: number): WeatherSnapshot {
    const time = Number.isFinite(simTime) ? Math.max(0, simTime) : 0;
    const cycle = Math.floor(time / this.config.cycleSeconds);
    const within = time - cycle * this.config.cycleSeconds;
    const telegraphAt = this.config.clearSeconds;
    const stormAt = telegraphAt + this.config.telegraphSeconds;
    const clearAt = stormAt + this.config.stormSeconds;
    let phase: WeatherPhase = 'clear';
    let phaseProgress = within < telegraphAt
      ? within / Math.max(this.config.clearSeconds, 1)
      : (within - clearAt) / (this.config.cycleSeconds - clearAt);
    if (within >= stormAt && within < clearAt) {
      phase = 'storm';
      phaseProgress = (within - stormAt) / this.config.stormSeconds;
    } else if (within >= telegraphAt && within < stormAt) {
      phase = 'telegraph';
      phaseProgress = (within - telegraphAt) / this.config.telegraphSeconds;
    }
    const storm = phase === 'storm';
    return {
      era: this.config.era,
      contractId: this.config.contractId,
      phase,
      phaseProgress: clamp01(phaseProgress),
      cycle,
      simTime: time,
      movementMultiplier: storm ? this.config.stormMovementMultiplier : 1,
      visibilityMultiplier: storm ? this.config.stormVisibilityMultiplier : 1,
      hazeColor: this.config.hazeColor,
      hazeStrength: storm ? this.config.hazeStrength : phase === 'telegraph' ? this.config.hazeStrength * phaseProgress : 0,
      warning: phase === 'telegraph',
    };
  }
}

export function validWeatherConfig(config: WeatherConfig): boolean {
  return Number.isInteger(config.era)
    && config.era > 0
    && config.contractId.length > 0
    && Number.isFinite(config.cycleSeconds)
    && Number.isFinite(config.clearSeconds)
    && Number.isFinite(config.telegraphSeconds)
    && Number.isFinite(config.stormSeconds)
    && config.cycleSeconds > 0
    && config.clearSeconds >= 0
    && config.telegraphSeconds > 0
    && config.stormSeconds > 0
    && config.clearSeconds + config.telegraphSeconds + config.stormSeconds < config.cycleSeconds
    && config.stormMovementMultiplier > 0
    && config.stormMovementMultiplier <= 1
    && config.stormVisibilityMultiplier > 0
    && config.stormVisibilityMultiplier <= 1
    && config.hazeStrength >= 0
    && config.hazeStrength <= 1;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
