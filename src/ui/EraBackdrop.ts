import { performanceTierDiagnostics } from '../game/PerformanceTier';

const eraArtLoaders = import.meta.glob<string>('../../assets/processed/kit-era-*.png', {
  query: '?url',
  import: 'default',
});

export function eraBackdropRef(epochId: string): string {
  const era = Number(epochId.match(/^epoch-(\d+)-/)?.[1] ?? 1);
  return `kit-era-${era}`;
}

export async function loadEraBackdrop(epochId: string): Promise<string | undefined> {
  if (performanceTierDiagnostics().tier === 'lite') return undefined;
  return eraArtLoaders[`../../assets/processed/${eraBackdropRef(epochId)}.png`]?.().catch(() => undefined);
}
