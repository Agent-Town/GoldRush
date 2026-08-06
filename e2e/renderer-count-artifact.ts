import { readFile, writeFile } from 'node:fs/promises';

type RendererPhase = {
  calls?: number;
  triangles?: number;
  geometries: number;
  textures: number;
};

type Tolerance = {
  measured: [number, number];
  tolerance: [number, number];
};

type RendererCountArtifact = {
  phases: Record<string, Record<string, number | Tolerance>>;
  deltas: Record<string, { geometries: number; textures: number }>;
};

export async function verifyAndWriteRendererCounts(
  artifactPath: string,
  actual: Record<string, RendererPhase>,
): Promise<void> {
  // F-1478-1 (s1478): the artifact is a REQUIRED INPUT, not an output. Missing file =
  // ENOENT, on purpose. Do NOT "fix" this by writing a baseline when it is absent: a
  // self-creating baseline cannot detect a regression on its first run, it just blesses
  // whatever it saw — which is the write-only behaviour F-1476-1 was filed against.
  // A new spec adds its expectations by MEASURING them (see artifacts/f1476-1/measure.mjs).
  const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as RendererCountArtifact;

  for (const [phase, metrics] of Object.entries(artifact.phases)) {
    for (const [metric, expected] of Object.entries(metrics)) {
      const value = actual[phase]?.[metric as keyof RendererPhase];
      const label = `${phase}.${metric}`;
      if (typeof value !== 'number') throw new Error(`renderer count ${label} is missing`);
      if (typeof expected === 'number') {
        if (value !== expected) throw new Error(`renderer count ${label} expected exact ${expected}, got ${value}`);
      } else if (value < expected.tolerance[0] || value > expected.tolerance[1]) {
        throw new Error(`renderer count ${label}=${value} outside band [${expected.tolerance.join(', ')}]`);
      }
    }
  }

  for (const [pair, expected] of Object.entries(artifact.deltas)) {
    const [from, to] = pair.split('->');
    for (const metric of ['geometries', 'textures'] as const) {
      const value = actual[to][metric] - actual[from][metric];
      if (value !== expected[metric]) {
        throw new Error(`renderer count delta ${pair}.${metric} expected exact ${expected[metric]}, got ${value}`);
      }
    }
  }

  await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
}
