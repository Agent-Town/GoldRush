import { activeTileDescriptor } from '../meta/ContractFamilies';
import { Balance } from '../game/Balance';

const ACTIVE_TILE = activeTileDescriptor();
const FLAT_SLOPE = Object.freeze({ dx: 0, dz: 0 });
const SLIDE_STEP_SCALES = [1, 0.75, 0.5, 0.25, 0.125] as const;
const SLIDE_ROTATION_DEGREES = [15, 30, 45, 60, 75] as const;
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
