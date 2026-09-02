type EngineEraLineage = {
  pins: readonly { engineHash: string; aliases?: readonly string[] }[];
};

export function engineEraIncludes(lineage: EngineEraLineage, engineHash: string): boolean;
