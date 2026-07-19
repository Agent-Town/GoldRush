export type LightSource = Readonly<{
  id: string;
  kind: 'hero' | 'prospector' | 'lantern' | 'powered-lamp' | 'watch' | 'enemy-lantern';
  x: number;
  z: number;
  radius: number;
  height?: number;
  targetWeight?: number;
}>;

export type LightFieldSnapshot = Readonly<{
  darkness: number;
  sources: readonly LightSource[];
}>;

export type LightFieldDiagnostics = Readonly<{
  darkness: number;
  minLight: number;
  falloff: number;
  litThreshold: number;
  sources: number;
  lanterns: number;
  poweredLamps: number;
}>;

export type LightFieldConfig = Readonly<{
  minLight: number;
  falloff: number;
  litThreshold: number;
}>;

export class LightField {
  private darkness = 0;
  private sources: readonly LightSource[] = [];

  constructor(private readonly config: LightFieldConfig) {}

  update(darkness: number, sources: readonly LightSource[]): void {
    this.darkness = clamp01(darkness);
    this.sources = [...sources].sort((a, b) => a.id.localeCompare(b.id));
  }

  coverageAt(x: number, z: number): number {
    if (this.darkness === 0) return 1;

    let sourceLight = this.config.minLight;
    for (const source of this.sources) {
      if (source.kind === 'enemy-lantern') continue;
      const distance = Math.hypot(x - source.x, z - source.z);
      const falloffT = clamp01((distance - Math.max(0, source.radius)) / this.config.falloff);
      const contribution = this.config.minLight + (1 - this.config.minLight) * (1 - falloffT) ** 3;
      sourceLight = Math.max(sourceLight, contribution);
    }
    return clamp01(1 - this.darkness * (1 - sourceLight));
  }

  diagnostics(): LightFieldDiagnostics {
    const infrastructure = this.sources.filter((source) => source.kind === 'lantern' || source.kind === 'powered-lamp');
    return {
      darkness: this.darkness,
      minLight: this.config.minLight,
      falloff: this.config.falloff,
      litThreshold: this.config.litThreshold,
      sources: infrastructure.length,
      lanterns: infrastructure.filter((source) => source.kind === 'lantern').length,
      poweredLamps: infrastructure.filter((source) => source.kind === 'powered-lamp').length,
    };
  }

  snapshot(): LightFieldSnapshot {
    return { darkness: this.darkness, sources: this.sources };
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}
