import registryText from '../../assets/pilots/map-rebuild-spike/landmark-collision-contract.json?raw';

export type LandmarkFootprint =
  | { kind: 'rect'; w: number; d: number }
  | { kind: 'radius'; radius: number };

export type LandmarkBlocker = {
  id: string;
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
};

type LandmarkRecord = {
  id: string;
  position: [number, number];
  rotation: number;
  scale: [number, number];
  footprint: LandmarkFootprint;
};
const registry = JSON.parse(registryText) as { version: 1; maps: Record<string, LandmarkRecord[]> };
const aliases: Record<string, string> = {
  'e5-stillwater': 'deepwater-claim',
  'e5-flotilla': 'deepwater-claim',
  'e6-picnic': 'glow-mesa',
  'e7-dead-band': 'relay-valley',
  'e7-relay-rush': 'relay-valley',
  'e8-far-side': 'mare-claim',
  'e8-eclipse': 'mare-claim',
};

export function landmarkBlockersFor(contractId: string): LandmarkBlocker[] {
  const map = aliases[contractId] ?? contractId.replace(/^e\d+-/, '');
  return (registry.maps[map] ?? []).map((mount) => {
    const scaleX = Math.abs(mount.scale[0]);
    const scaleZ = Math.abs(mount.scale[1]);
    let halfX: number;
    let halfZ: number;
    if (mount.footprint.kind === 'radius') {
      halfX = halfZ = mount.footprint.radius * Math.max(scaleX, scaleZ);
    } else {
      const cos = Math.abs(Math.cos(mount.rotation));
      const sin = Math.abs(Math.sin(mount.rotation));
      halfX = (mount.footprint.w * scaleX * cos + mount.footprint.d * scaleZ * sin) / 2;
      halfZ = (mount.footprint.w * scaleX * sin + mount.footprint.d * scaleZ * cos) / 2;
    }
    return { id: `${map}:${mount.id}`, x: mount.position[0], z: mount.position[1], halfX, halfZ };
  });
}

type PlanarBlocker = Pick<LandmarkBlocker, 'x' | 'z' | 'halfX' | 'halfZ'>;

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
