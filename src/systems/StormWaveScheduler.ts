import { WeatherSystem, type WeatherConfig } from './WeatherSystem';

export type StormWaveEvent = Readonly<{
  wave: number;
  cycle: number;
  scheduledAt: number;
  direction: 'west-to-east';
  fromX: number;
  toX: number;
}>;

export type StormWaveSchedulerConfig = Readonly<{
  weather: WeatherConfig;
  westX: number;
  eastX: number;
}>;

export class StormWaveScheduler {
  private readonly weather: WeatherSystem;
  private readonly events: StormWaveEvent[] = [];
  private time = 0;

  constructor(readonly config: StormWaveSchedulerConfig, private readonly onWave: (event: StormWaveEvent) => void = () => {}) {
    if (!Number.isFinite(config.westX) || !Number.isFinite(config.eastX) || config.westX >= config.eastX) {
      throw new Error('Invalid storm-front bounds.');
    }
    this.weather = new WeatherSystem(config.weather);
  }

  advance(simTime: number): void {
    if (!Number.isFinite(simTime) || simTime < this.time) throw new Error('Storm time must advance monotonically.');
    this.time = simTime;
    const stormOffset = this.config.weather.clearSeconds + this.config.weather.telegraphSeconds;
    for (let cycle = this.events.length; stormOffset + cycle * this.config.weather.cycleSeconds <= simTime; cycle += 1) {
      const event: StormWaveEvent = {
        wave: cycle + 1,
        cycle,
        scheduledAt: stormOffset + cycle * this.config.weather.cycleSeconds,
        direction: 'west-to-east',
        fromX: this.config.westX,
        toX: this.config.eastX,
      };
      this.events.push(event);
      this.onWave(event);
    }
  }

  reset(): void {
    this.time = 0;
    this.events.length = 0;
  }

  snapshot() {
    const weather = this.weather.sample(this.time);
    return {
      time: this.time,
      weather,
      frontX: weather.phase === 'storm'
        ? this.config.westX + (this.config.eastX - this.config.westX) * weather.phaseProgress
        : null,
      waves: [...this.events],
    } as const;
  }
}
