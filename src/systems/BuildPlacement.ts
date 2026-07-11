import type { BuildPlacement, BuildableId } from '../game/buildables';

export type PlacementPoint = { x: number; z: number };

export type PlacementDescriptor = PlacementPoint & {
  id: BuildableId;
  rotationSteps: number;
  halfX: number;
  halfZ: number;
  overlapRadius: number;
};

export type ReservedPlacement = PlacementPoint & { halfX: number; halfZ: number };

export function matchesPlacement(
  placement: BuildPlacement,
  surface: { walkable: boolean; buildable: boolean; waterSourceAdjacent: boolean },
): boolean {
  if (placement === 'any') return surface.walkable;
  if (placement === 'bank') return surface.buildable;
  return surface.buildable && surface.waterSourceAdjacent;
}

export function overlapsExisting(
  candidate: PlacementDescriptor,
  existing: readonly PlacementDescriptor[],
  reserved: readonly ReservedPlacement[],
): boolean {
  for (const placed of existing) {
    if (candidate.id === 'sentry_beacon' && placed.id === 'sentry_beacon') {
      const dx = candidate.x - placed.x;
      const dz = candidate.z - placed.z;
      if (dx * dx + dz * dz < candidate.overlapRadius * candidate.overlapRadius) return true;
      continue;
    }
    if (Math.abs(candidate.x - placed.x) < candidate.halfX + placed.halfX && Math.abs(candidate.z - placed.z) < candidate.halfZ + placed.halfZ) {
      return true;
    }
  }
  return reserved.some(
    (placed) =>
      Math.abs(candidate.x - placed.x) < candidate.halfX + placed.halfX &&
      Math.abs(candidate.z - placed.z) < candidate.halfZ + placed.halfZ,
  );
}
