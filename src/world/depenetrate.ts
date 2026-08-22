type PlanarBlocker = { x: number; z: number; halfX: number; halfZ: number };

export function blockerContains(blocker: PlanarBlocker, x: number, z: number, pad = 0): boolean {
  return Math.abs(x - blocker.x) <= blocker.halfX + pad && Math.abs(z - blocker.z) <= blocker.halfZ + pad;
}

export function depenetrateToWalkable(
  point: { x: number; z: number },
  walkable: (x: number, z: number) => boolean,
  maxDistance: number,
): boolean {
  if (walkable(point.x, point.z)) return false;
  const probe = 0.05;
  // ponytail: 16 m covers every authored solid; replace with shape projection if that ceiling grows.
  for (let distance = probe; distance <= 16; distance += probe) {
    for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      if (!walkable(point.x + dx * distance, point.z + dz * distance)) continue;
      const step = Math.min(distance, Math.max(0, maxDistance));
      point.x += dx * step;
      point.z += dz * step;
      return true;
    }
  }
  return false;
}

export function depenetrateFromBlockers(
  point: { x: number; z: number },
  blockers: readonly PlanarBlocker[],
  pad: number,
  maxDistance: number,
): boolean {
  return depenetrateToWalkable(
    point,
    (x, z) => !blockers.some((blocker) => blockerContains(blocker, x, z, pad)),
    maxDistance,
  );
}
