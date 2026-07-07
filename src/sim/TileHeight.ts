import { activeTileDescriptor } from '../meta/ContractFamilies';

const ACTIVE_TILE = activeTileDescriptor();
const FLAT_SLOPE = Object.freeze({ dx: 0, dz: 0 });
const PROBES = [
  ['heroStart', 0, 12],
  ['ford', 0, 0],
  ['farBank', 12, -18],
] as const;

export function simHeight(x: number, z: number): number {
  void x;
  void z;
  // ponytail: real elevation evaluators land with the first non-flat tile; GT-01 only proves flat identity.
  if (!ACTIVE_TILE.elevation) return 0;
  return 0;
}

export function simSlope(x: number, z: number): { dx: number; dz: number } {
  void x;
  void z;
  return FLAT_SLOPE;
}

export function isTraversable(x: number, z: number): boolean {
  void x;
  void z;
  return true;
}

export function simHeightDiagnostics(): {
  flat: boolean;
  tile: string;
  probes: Record<string, { height: number; slope: { dx: number; dz: number }; traversable: boolean }>;
} {
  const probes: Record<string, { height: number; slope: { dx: number; dz: number }; traversable: boolean }> = {};
  for (const [id, x, z] of PROBES) {
    probes[id] = {
      height: simHeight(x, z),
      slope: simSlope(x, z),
      traversable: isTraversable(x, z),
    };
  }
  return { flat: !ACTIVE_TILE.elevation, tile: ACTIVE_TILE.id, probes };
}
