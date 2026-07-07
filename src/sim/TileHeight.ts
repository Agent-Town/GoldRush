import { activeTileDescriptor } from '../meta/ContractFamilies';
import { Balance } from '../game/Balance';

const ACTIVE_TILE = activeTileDescriptor();
const FLAT_SLOPE = Object.freeze({ dx: 0, dz: 0 });
const PROBES = [
  ['heroStart', 0, 12],
  ['ford', 0, 0],
  ['farBank', 12, -18],
] as const;

export function simHeight(x: number, z: number): number {
  if (!ACTIVE_TILE.elevation) return 0;
  const analytic = ACTIVE_TILE.elevation.analytic ?? {};
  const bowlDepth = analytic.bowlDepth ?? 0;
  const bowlRadius = Math.max(0.001, analytic.bowlRadius ?? 1);
  const bowlX = x - (analytic.bowlCenterX ?? 0);
  const bowlZ = z - (analytic.bowlCenterZ ?? 0);
  const bowl = -bowlDepth * Math.exp(-(bowlX * bowlX + bowlZ * bowlZ) / (2 * bowlRadius * bowlRadius));

  const ridgeWidth = Math.max(0.001, analytic.ridgeWidth ?? 1);
  const ridgeLength = Math.max(0.001, analytic.ridgeLength ?? 1);
  const ridgeX = x - (analytic.ridgeX ?? 0);
  const ridgeZ = z - (analytic.ridgeZ ?? 0);
  const ridge =
    (analytic.ridgeAmp ?? 0) *
    Math.exp(-(ridgeX * ridgeX) / (2 * ridgeWidth * ridgeWidth)) *
    Math.exp(-(ridgeZ * ridgeZ) / (2 * ridgeLength * ridgeLength));

  const cliffMinX = analytic.cliffMinX ?? 0;
  const cliffMaxX = analytic.cliffMaxX ?? 0;
  const cliffMinZ = analytic.cliffMinZ ?? 0;
  const cliffMaxZ = analytic.cliffMaxZ ?? 0;
  const cliffFeather = Math.max(0.001, analytic.cliffFeather ?? 1);
  const cliffMask =
    smoothstep(cliffMinX, cliffMinX + cliffFeather, x) * (1 - smoothstep(cliffMaxX - cliffFeather, cliffMaxX, x));
  const cliffBand = smoothstep(cliffMinZ - cliffFeather, cliffMinZ, z) * (1 - smoothstep(cliffMaxZ, cliffMaxZ + cliffFeather, z));
  const cliff = (analytic.cliffAmp ?? 0) * cliffMask * cliffBand;

  return bowl + ridge + cliff;
}

export function simSlope(x: number, z: number): { dx: number; dz: number } {
  if (!ACTIVE_TILE.elevation) return FLAT_SLOPE;
  const step = Math.max(0.25, ACTIVE_TILE.elevation.cellSize * 0.25);
  const dx = (simHeight(x + step, z) - simHeight(x - step, z)) / (step * 2);
  const dz = (simHeight(x, z + step) - simHeight(x, z - step)) / (step * 2);
  if (dx === 0 && dz === 0) return FLAT_SLOPE;
  return { dx, dz };
}

export function terrainSpeedMultiplier(x: number, z: number, dirX: number, dirZ: number): number {
  if (!ACTIVE_TILE.elevation) return 1;
  const directionLength = Math.hypot(dirX, dirZ);
  if (directionLength <= 0.000001) return 1;
  const slope = simSlope(x, z);
  const grade = (slope.dx * dirX + slope.dz * dirZ) / directionLength;
  const slopeMax = Math.max(0.000001, Balance.terrainSim.slopeMax);
  if (grade > 0) {
    return 1 - (1 - Balance.terrainSim.uphillMin) * Math.min(1, grade / slopeMax);
  }
  if (grade < 0) {
    return 1 + (Balance.terrainSim.downhillMax - 1) * Math.min(1, -grade / slopeMax);
  }
  return 1;
}

export function hasElevationTile(): boolean {
  return Boolean(ACTIVE_TILE.elevation);
}

export function isTraversable(x: number, z: number): boolean {
  if (!ACTIVE_TILE.elevation) return true;
  if (insideCliffBand(x, z)) return false;
  const slope = simSlope(x, z);
  return Math.hypot(slope.dx, slope.dz) <= Balance.terrainSim.slopeMax;
}

export function terrainSimSample(x: number, z: number): {
  height: number;
  slope: { dx: number; dz: number };
  traversable: boolean;
  speedEast: number;
  speedWest: number;
} {
  return {
    height: simHeight(x, z),
    slope: simSlope(x, z),
    traversable: isTraversable(x, z),
    speedEast: terrainSpeedMultiplier(x, z, 1, 0),
    speedWest: terrainSpeedMultiplier(x, z, -1, 0),
  };
}

export function simHeightDiagnostics(): {
  flat: boolean;
  tile: string;
  balance: typeof Balance.terrainSim;
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
  return { flat: !ACTIVE_TILE.elevation, tile: ACTIVE_TILE.id, balance: Balance.terrainSim, probes };
}

function insideCliffBand(x: number, z: number): boolean {
  const analytic = ACTIVE_TILE.elevation?.analytic;
  if (!analytic) return false;
  return (
    x >= (analytic.cliffMinX ?? Number.POSITIVE_INFINITY) &&
    x <= (analytic.cliffMaxX ?? Number.NEGATIVE_INFINITY) &&
    z >= (analytic.cliffMinZ ?? Number.POSITIVE_INFINITY) &&
    z <= (analytic.cliffMaxZ ?? Number.NEGATIVE_INFINITY)
  );
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
