import { activeTileDescriptor } from '../meta/ContractFamilies';
import { Balance } from '../game/Balance';

const ACTIVE_TILE = activeTileDescriptor();
const FLAT_SLOPE = Object.freeze({ dx: 0, dz: 0 });
const SLIDE_STEP_SCALES = [1, 0.75, 0.5, 0.25, 0.125] as const;
const SLIDE_ROTATION_DEGREES = [15, 30, 45, 60, 75] as const;
const LOS_STEPS = 12;
const LOS_EYE_HEIGHT = 0.72;
const LOS_TARGET_HEIGHT = 0.5;
const LOS_CLEARANCE = 0.1;
const LOS_CACHE_LIMIT = 512;
const PROBES = [
  ['heroStart', 0, 12],
  ['ford', 0, 0],
  ['farBank', 12, -18],
] as const;

export type TerrainLosCheck = {
  flat: boolean;
  clear: boolean;
  samples: number;
  from: { x: number; z: number; h: number };
  to: { x: number; z: number; h: number };
  blockedAt: { x: number; z: number; h: number; lineH: number; step: number } | null;
};

const losCache = new Map<string, TerrainLosCheck>();
let lastLosCheck: TerrainLosCheck = initialLosCheck();

export function simHeight(x: number, z: number): number {
  if (!ACTIVE_TILE.elevation) return 0;
  const analytic = ACTIVE_TILE.elevation.analytic ?? {};
  if (analytic.hillMine === 1) return hillMineHeight(x, z, analytic);
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

export function highGroundRange(baseRange: number, x: number, z: number): number {
  if (!ACTIVE_TILE.elevation) return baseRange;
  return baseRange + Math.max(0, simHeight(x, z)) * Balance.gt.highGroundRangeBonus;
}

export function terrainLineOfSight(from: { x: number; z: number }, to: { x: number; z: number }): boolean {
  if (!ACTIVE_TILE.elevation) {
    lastLosCheck = flatLosCheck(from, to);
    return true;
  }

  const key = losKey(from.x, from.z, to.x, to.z);
  const cached = losCache.get(key);
  if (cached) {
    lastLosCheck = cached;
    return cached.clear;
  }

  const fromTerrain = simHeight(from.x, from.z);
  const toTerrain = simHeight(to.x, to.z);
  const fromH = fromTerrain + LOS_EYE_HEIGHT;
  const toH = toTerrain + LOS_TARGET_HEIGHT;
  const check: TerrainLosCheck = {
    flat: false,
    clear: true,
    samples: LOS_STEPS - 1,
    from: { x: round3(from.x), z: round3(from.z), h: round3(fromTerrain) },
    to: { x: round3(to.x), z: round3(to.z), h: round3(toTerrain) },
    blockedAt: null,
  };

  for (let step = 1; step < LOS_STEPS; step += 1) {
    const t = step / LOS_STEPS;
    const x = from.x + (to.x - from.x) * t;
    const z = from.z + (to.z - from.z) * t;
    const terrainH = simHeight(x, z);
    const lineH = fromH + (toH - fromH) * t;
    if (terrainH <= lineH - LOS_CLEARANCE) continue;
    check.clear = false;
    check.blockedAt = { x: round3(x), z: round3(z), h: round3(terrainH), lineH: round3(lineH), step };
    break;
  }

  cacheLos(key, check);
  lastLosCheck = check;
  return check.clear;
}

export function resolveTerrainMove(
  previousX: number,
  previousZ: number,
  targetX: number,
  targetZ: number,
  isWalkable: (x: number, z: number) => boolean,
  goal?: { x: number; z: number; fallbackX?: number; fallbackZ?: number },
): { x: number; z: number; moved: boolean } {
  if (isWalkable(targetX, targetZ)) return { x: targetX, z: targetZ, moved: true };

  const dx = targetX - previousX;
  const dz = targetZ - previousZ;
  const distance = Math.hypot(dx, dz);
  if (distance <= 0.000001) return { x: previousX, z: previousZ, moved: false };
  const goalDistance = goal ? Math.hypot(goal.x - previousX, goal.z - previousZ) : 0;
  const fallbackLength = Math.hypot(goal?.fallbackX ?? 0, goal?.fallbackZ ?? 0);
  const fallbackX = fallbackLength > 0 ? (goal?.fallbackX ?? 0) / fallbackLength : 0;
  const fallbackZ = fallbackLength > 0 ? (goal?.fallbackZ ?? 0) / fallbackLength : 0;

  let bestX = previousX;
  let bestZ = previousZ;
  let bestScore = 0;

  const consider = (moveX: number, moveZ: number) => {
    if (Math.hypot(moveX, moveZ) <= 0.000001) return;
    const alignment = moveX * dx + moveZ * dz;
    const canUseBias = goal !== undefined || fallbackLength > 0;
    if (!canUseBias && alignment <= bestScore + 0.000001) return;
    for (const scale of SLIDE_STEP_SCALES) {
      const score = alignment * scale;
      if (!canUseBias && score <= bestScore + 0.000001) continue;
      const x = previousX + moveX * scale;
      const z = previousZ + moveZ * scale;
      if (!isWalkable(x, z)) continue;
      const goalBias = goal ? Math.max(0, goalDistance - Math.hypot(goal.x - x, goal.z - z)) * distance : 0;
      const fallbackBias = fallbackLength > 0 ? Math.max(0, moveX * fallbackX + moveZ * fallbackZ) * distance * 0.5 : 0;
      const biasedScore = score + goalBias + fallbackBias;
      if (biasedScore <= bestScore + 0.000001) continue;
      bestX = x;
      bestZ = z;
      bestScore = biasedScore;
      break;
    }
  };

  const considerSlide = (normalX: number, normalZ: number) => {
    const normalLength = Math.hypot(normalX, normalZ);
    if (normalLength <= 0.000001) return;
    const nx = normalX / normalLength;
    const nz = normalZ / normalLength;
    const into = dx * nx + dz * nz;
    consider(dx - nx * into, dz - nz * into);
  };

  const previousSlope = simSlope(previousX, previousZ);
  if (fallbackLength > 0) {
    const normalLength = Math.hypot(previousSlope.dx, previousSlope.dz);
    if (normalLength > 0.000001) {
      const nx = previousSlope.dx / normalLength;
      const nz = previousSlope.dz / normalLength;
      const into = fallbackX * nx + fallbackZ * nz;
      consider((fallbackX - nx * into) * distance, (fallbackZ - nz * into) * distance);
    }
    consider(fallbackX * distance, fallbackZ * distance);
  }
  consider(dx, 0);
  consider(0, dz);
  const moveAngle = Math.atan2(dz, dx);
  for (const degrees of SLIDE_ROTATION_DEGREES) {
    const turn = (degrees * Math.PI) / 180;
    const projectedDistance = distance * Math.cos(turn);
    for (const sign of [-1, 1] as const) {
      const angle = moveAngle + sign * turn;
      consider(Math.cos(angle) * projectedDistance, Math.sin(angle) * projectedDistance);
    }
  }

  const probe = Math.max(0.25, Math.min(0.5, distance * 2));
  const blockedEast = isWalkable(previousX + probe, previousZ) ? 0 : 1;
  const blockedWest = isWalkable(previousX - probe, previousZ) ? 0 : 1;
  const blockedSouth = isWalkable(previousX, previousZ + probe) ? 0 : 1;
  const blockedNorth = isWalkable(previousX, previousZ - probe) ? 0 : 1;
  const normalX = blockedEast - blockedWest;
  const normalZ = blockedSouth - blockedNorth;
  considerSlide(normalX, 0);
  considerSlide(0, normalZ);
  considerSlide(normalX, normalZ);

  considerSlide(previousSlope.dx, previousSlope.dz);
  const targetSlope = simSlope(targetX, targetZ);
  considerSlide(targetSlope.dx, targetSlope.dz);

  return { x: bestX, z: bestZ, moved: bestScore > 0 };
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

export function terrainDetourWaypoint(
  x: number,
  z: number,
  goalX: number,
  goalZ: number,
): { x: number; z: number } | null {
  const analytic = ACTIVE_TILE.elevation?.analytic;
  if (!analytic) return null;
  const minX = analytic.cliffMinX;
  const maxX = analytic.cliffMaxX;
  const minZ = analytic.cliffMinZ;
  const maxZ = analytic.cliffMaxZ;
  if (minX === undefined || maxX === undefined || minZ === undefined || maxZ === undefined) return null;

  const pad = Math.max(1.25, (analytic.cliffFeather ?? 0) + 0.5);
  const crossesFromSouth = z < minZ - pad && goalZ > minZ;
  const crossesFromNorth = z > maxZ + pad && goalZ < maxZ;
  const inApproachBand = z >= minZ - pad && z <= maxZ + pad && goalZ !== z;
  if (!crossesFromSouth && !crossesFromNorth && !inApproachBand) return null;

  const spanMinX = minX - pad;
  const spanMaxX = maxX + pad;
  if (x <= spanMinX || x >= spanMaxX) return null;
  let detourX = x <= (minX + maxX) * 0.5 ? spanMinX : spanMaxX;
  if (goalX <= spanMinX) detourX = spanMinX;
  else if (goalX >= spanMaxX) detourX = spanMaxX;
  return { x: detourX, z };
}

export function simHeightDiagnostics(): {
  flat: boolean;
  tile: string;
  balance: typeof Balance.terrainSim;
  gt: typeof Balance.gt;
  lastLos: TerrainLosCheck;
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
  return { flat: !ACTIVE_TILE.elevation, tile: ACTIVE_TILE.id, balance: Balance.terrainSim, gt: Balance.gt, lastLos: lastLosCheck, probes };
}

function flatLosCheck(from: { x: number; z: number }, to: { x: number; z: number }): TerrainLosCheck {
  return {
    flat: true,
    clear: true,
    samples: 0,
    from: { x: round3(from.x), z: round3(from.z), h: 0 },
    to: { x: round3(to.x), z: round3(to.z), h: 0 },
    blockedAt: null,
  };
}

function initialLosCheck(): TerrainLosCheck {
  const origin = { x: 0, z: 0 };
  if (!ACTIVE_TILE.elevation) return flatLosCheck(origin, origin);
  return {
    flat: false,
    clear: true,
    samples: 0,
    from: { x: 0, z: 0, h: round3(simHeight(0, 0)) },
    to: { x: 0, z: 0, h: round3(simHeight(0, 0)) },
    blockedAt: null,
  };
}

function losKey(ax: number, az: number, bx: number, bz: number): string {
  return `${keyCoord(ax)},${keyCoord(az)},${keyCoord(bx)},${keyCoord(bz)}`;
}

function keyCoord(value: number): string {
  return Object.is(value, -0) ? '0' : String(value);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function cacheLos(key: string, check: TerrainLosCheck): void {
  if (losCache.size >= LOS_CACHE_LIMIT) {
    const first = losCache.keys().next().value;
    if (first !== undefined) losCache.delete(first);
  }
  losCache.set(key, check);
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

function hillMineHeight(x: number, z: number, analytic: Record<string, number>): number {
  const creek = analytic.creekHeight ?? -0.5;
  const rail = analytic.railHeight ?? 0;
  const t1 = analytic.t1Height ?? 1.5;
  const t2 = analytic.t2Height ?? 3;
  const t3 = analytic.t3Height ?? 4.5;
  let height = rail;
  height += (creek - rail) * (1 - smoothstep(analytic.creekBlendStart ?? -12, analytic.creekBlendEnd ?? -5, z));
  height += (t1 - rail) * smoothstep(analytic.t1RampStart ?? 5, analytic.t1RampEnd ?? 14, z);
  height += (t2 - t1) * smoothstep(analytic.t2RampStart ?? 18, analytic.t2RampEnd ?? 26, z);
  height += (t3 - t2) * smoothstep(analytic.t3RampStart ?? 32, analytic.t3RampEnd ?? 40, z);

  const cliffFeather = Math.max(0.001, analytic.cliffFeather ?? 1);
  const cliffMask =
    smoothstep((analytic.cliffMinX ?? -16) - cliffFeather, analytic.cliffMinX ?? -16, x) *
    (1 - smoothstep(analytic.cliffMaxX ?? 16, (analytic.cliffMaxX ?? 16) + cliffFeather, x)) *
    smoothstep((analytic.cliffMinZ ?? 18) - cliffFeather, analytic.cliffMinZ ?? 18, z) *
    (1 - smoothstep(analytic.cliffMaxZ ?? 23, (analytic.cliffMaxZ ?? 23) + cliffFeather, z));
  height += (analytic.cliffAmp ?? 0) * cliffMask;

  const mouthRadius = Math.max(0.001, analytic.mineMouthRadius ?? 1);
  const mouthX = x - (analytic.mineMouthX ?? 0);
  const mouthZ = z - (analytic.mineMouthZ ?? 40);
  const mouth = Math.exp(-(mouthX * mouthX + mouthZ * mouthZ) / (2 * mouthRadius * mouthRadius));
  return height + (analytic.mineMouthCrown ?? 0) * mouth;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
