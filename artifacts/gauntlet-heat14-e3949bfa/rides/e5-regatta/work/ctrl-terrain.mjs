// Terrain probe: which ground will MOVE_HERO accept on e5-regatta?
// A ladder of targets in one array reports the whole prefix in a single view (gen 70): an
// unwalkable target fails in one tick and yields, so the first ACTIVE record is the first
// walkable point and everything above it is refused ground.
const CAND = [
  [-49, 0], [-49, -1], [-48, -1], [-47, -1], [-45, -1], [-49, 2], [-49, -4],
  [-45, 0], [-40, 0], [-30, 0], [-20, 0], [-10, 0], [0, 0], [10, 0], [20, 0], [30, 0], [40, 0], [49, 0],
  [0, 5], [0, 10], [0, 18], [0, 30], [0, 38], [-28, 38], [28, 38], [-20, 20], [20, 20], [0, -18],
];
export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null;
  const live = (now.seams || []).filter((s) => s.active !== false && Number.isFinite(s.x));
  const o = CAND.map(([x, z]) => ({ verb: 'MOVE_HERO', pos: { x, z } }));
  if (live.length) o.push({ verb: 'HARVEST', seam: live[0].id });
  return o.slice(0, 32);
}
