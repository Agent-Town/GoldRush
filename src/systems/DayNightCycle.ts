export type DayNightCycleConfig = Readonly<{
  periodSeconds: number;
  duskRampSeconds: number;
  dawnRampSeconds: number;
  nightDepth: number;
  nightLocked?: boolean;
}>;

export type DayNightPhase = 'full' | 'dusk' | 'dark' | 'dawn';

export type DayNightSnapshot = Readonly<{
  phase: DayNightPhase;
  darkness: number;
  phaseProgress: number;
  cycleProgress: number;
  cycle: number;
  simTime: number;
}>;

export const DEBUG_DAY_NIGHT_CONFIG: DayNightCycleConfig = Object.freeze({
  periodSeconds: 24,
  duskRampSeconds: 4,
  dawnRampSeconds: 4,
  nightDepth: 1,
});

export class DayNightCycle {
  constructor(readonly config: DayNightCycleConfig) {
    if (!validDayNightConfig(config)) throw new Error('Invalid day/night cycle config.');
  }

  sample(simTime: number): DayNightSnapshot {
    const time = Number.isFinite(simTime) ? Math.max(0, simTime) : 0;
    const { periodSeconds: period, duskRampSeconds: dusk, dawnRampSeconds: dawn, nightDepth } = this.config;
    const cycle = Math.floor(time / period);
    const within = time - cycle * period;
    if (this.config.nightLocked) {
      const duskFloor = nightDepth * 0.75;
      if (within < dusk) {
        const phaseProgress = within / dusk;
        return { phase: 'dusk', darkness: duskFloor + (nightDepth - duskFloor) * phaseProgress, phaseProgress, cycleProgress: within / period, cycle, simTime: time };
      }
      if (within >= period - dawn) {
        const phaseProgress = (within - (period - dawn)) / dawn;
        return { phase: 'dawn', darkness: nightDepth - (nightDepth - duskFloor) * phaseProgress, phaseProgress, cycleProgress: within / period, cycle, simTime: time };
      }
      return { phase: 'dark', darkness: nightDepth, phaseProgress: (within - dusk) / (period - dusk - dawn), cycleProgress: within / period, cycle, simTime: time };
    }
    const hold = (period - dusk - dawn) / 2;
    const duskStart = hold;
    const nightStart = duskStart + dusk;
    const dawnStart = nightStart + hold;

    let phase: DayNightPhase = 'full';
    let phaseProgress = hold > 0 ? within / hold : 0;
    let darkness = 0;
    if (within >= dawnStart) {
      phase = 'dawn';
      phaseProgress = (within - dawnStart) / dawn;
      darkness = nightDepth * (1 - phaseProgress);
    } else if (within >= nightStart) {
      phase = 'dark';
      phaseProgress = hold > 0 ? (within - nightStart) / hold : 0;
      darkness = nightDepth;
    } else if (within >= duskStart) {
      phase = 'dusk';
      phaseProgress = (within - duskStart) / dusk;
      darkness = nightDepth * phaseProgress;
    }

    return {
      phase,
      darkness: clamp01(darkness),
      phaseProgress: clamp01(phaseProgress),
      cycleProgress: within / period,
      cycle,
      simTime: time,
    };
  }
}

export function validDayNightConfig(config: DayNightCycleConfig): boolean {
  return Number.isFinite(config.periodSeconds)
    && Number.isFinite(config.duskRampSeconds)
    && Number.isFinite(config.dawnRampSeconds)
    && Number.isFinite(config.nightDepth)
    && config.periodSeconds > 0
    && config.duskRampSeconds > 0
    && config.dawnRampSeconds > 0
    && config.duskRampSeconds + config.dawnRampSeconds < config.periodSeconds
    && config.nightDepth >= 0
    && config.nightDepth <= 1;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
