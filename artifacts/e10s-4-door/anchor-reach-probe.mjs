/**
 * E10S-4 anchor reach probe — the table `tasks/e10s-4-ember-shore-door.md` scope 1 asks for.
 *
 *   node artifacts/e10s-4-door/anchor-reach-probe.mjs > artifacts/e10s-4-door/anchor-reach.json
 *
 * "Inside walkable reach of both buildZones" is measured, not asserted, and in the two senses the
 * words carry:
 *   - DISTANCE — the shortest span from each authored buildZone rectangle to the anchor (0 when the
 *     anchor is inside the box), plus the same from the vent stake the stoke disc sits on, plus the
 *     one-way walk in seconds at `Balance.hero.speed`.
 *   - WALKABILITY — `Terrain.sample` stepped along the straight line from each zone's nearest point
 *     to the anchor at 0.5wu, AND an 8-connected grid search over the same sampler at 1wu when the
 *     straight line is obstructed. The straight line is the cheap answer and it is often WRONG on
 *     this tile: `last-warm-vent-altar` is a 4.2x3.5wu landmark blocker standing ON the vent stake
 *     at (3,-10), so any line drawn from the stake's own centre starts inside a wall. The grid
 *     search is the honest one, and it is what "walkable reach" is reported from.
 *
 * Terrain binds `ACTIVE_CONTRACT` at module load (F-E6PA-2), so `globalThis.location` names the
 * contract BEFORE the first import. Read that finding before repurposing this probe.
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const STEP = 0.5;

const location = new URL(`http://e10s4.probe/?debug&contract=${CONTRACT}&seed=${CONTRACT}-01`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const say = console.log;
console.log = console.info = console.debug = () => undefined;
let report;
try {
  const { listBoardContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');

  const contract = listBoardContracts().find((entry) => entry.id === CONTRACT);
  const zones = contract.tileParams.buildZones;
  const anchors = contract.tileParams.harvestAnchors ?? [];
  const vent = contract.tileParams.stakeMarkers.find((marker) => marker.id === 'last-warm-vent');
  const speed = Balance.hero.speed;

  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const nearestIn = (zone, point) => ({ x: clamp(point.x, zone.minX, zone.maxX), z: clamp(point.z, zone.minZ, zone.maxZ) });
  const span = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  const walkLine = (from, to) => {
    const total = span(from, to);
    const steps = Math.max(1, Math.ceil(total / STEP));
    let blocked = 0;
    let firstBlockedAt = null;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const z = from.z + (to.z - from.z) * t;
      if (Terrain.sample(x, z).walkable) continue;
      blocked += 1;
      if (firstBlockedAt === null) firstBlockedAt = { x: Number(x.toFixed(2)), z: Number(z.toFixed(2)) };
    }
    return { samples: steps + 1, blocked, firstBlockedAt, clear: blocked === 0 };
  };

  // 8-connected Dijkstra over `Terrain.sample` at 1wu. Endpoints snap to their nearest walkable
  // cell (the vent stake's own cell is inside `last-warm-vent-altar`), and the snap distance is
  // reported so a reader can see how far the answer sits from the point that was asked about.
  const HALF = contract.tileParams.size / 2;
  const key = (x, z) => `${x},${z}`;
  const walkableCell = (x, z) => Terrain.sample(x, z).walkable;
  const nearestWalkable = (point) => {
    const start = { x: Math.round(point.x), z: Math.round(point.z) };
    for (let ring = 0; ring <= 12; ring += 1) {
      // The WHOLE ring is scanned and the closest cell in it kept: taking the first hit would
      // report a corner as the snap and make the vent look further from open ground than it is.
      let best = null;
      for (let dx = -ring; dx <= ring; dx += 1) {
        for (let dz = -ring; dz <= ring; dz += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
          const cell = { x: start.x + dx, z: start.z + dz };
          if (Math.abs(cell.x) > HALF || Math.abs(cell.z) > HALF) continue;
          if (!walkableCell(cell.x, cell.z)) continue;
          const away = span(point, cell);
          if (!best || away < best.away) best = { cell, away };
        }
      }
      if (best) return { cell: best.cell, snapWu: Number(best.away.toFixed(2)) };
    }
    return null;
  };
  const walkPath = (from, to) => {
    const source = nearestWalkable(from);
    const target = nearestWalkable(to);
    if (!source || !target) return { reachable: false, reason: 'no walkable cell within 12wu of an endpoint' };
    const dist = new Map([[key(source.cell.x, source.cell.z), 0]]);
    const queue = [{ ...source.cell, d: 0 }];
    let head = 0;
    while (head < queue.length) {
      queue.sort((a, b) => a.d - b.d);
      const node = queue[head];
      head += 1;
      if (node.x === target.cell.x && node.z === target.cell.z) break;
      if (node.d > (dist.get(key(node.x, node.z)) ?? Infinity)) continue;
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          if (dx === 0 && dz === 0) continue;
          const nx = node.x + dx;
          const nz = node.z + dz;
          if (Math.abs(nx) > HALF || Math.abs(nz) > HALF) continue;
          if (!walkableCell(nx, nz)) continue;
          const next = node.d + Math.hypot(dx, dz);
          if (next >= (dist.get(key(nx, nz)) ?? Infinity)) continue;
          dist.set(key(nx, nz), next);
          queue.push({ x: nx, z: nz, d: next });
        }
      }
    }
    const reached = dist.get(key(target.cell.x, target.cell.z));
    return reached === undefined
      ? { reachable: false, reason: 'no 8-connected walkable path at 1wu' }
      : {
        reachable: true,
        pathWu: Number(reached.toFixed(2)),
        walkSeconds: Number((reached / speed).toFixed(2)),
        fromSnapWu: source.snapWu,
        toSnapWu: target.snapWu,
      };
  };

  report = {
    contract: CONTRACT,
    heroSpeed: speed,
    stokeDisc: (() => {
      // The disc is only usable if a Prospector can STAND in it, and the vent stake itself is
      // inside `last-warm-vent-altar`. Sampled at 0.25wu so the answer is ground truth, not faith.
      const radius = contract.twist.emberShore.preserve.stoke.radius;
      let inside = 0;
      let walkable = 0;
      let closestWalkable = null;
      for (let x = vent.x - radius; x <= vent.x + radius + 1e-9; x += 0.25) {
        for (let z = vent.z - radius; z <= vent.z + radius + 1e-9; z += 0.25) {
          const away = Math.hypot(x - vent.x, z - vent.z);
          if (away > radius) continue;
          inside += 1;
          if (!Terrain.sample(x, z).walkable) continue;
          walkable += 1;
          if (!closestWalkable || away < closestWalkable.away) {
            closestWalkable = { x: Number(x.toFixed(2)), z: Number(z.toFixed(2)), away: Number(away.toFixed(2)) };
          }
        }
      }
      return { ...vent, radius, sampledAt: 0.25, cellsInside: inside, cellsWalkable: walkable, closestWalkable };
    })(),
    buildZones: zones,
    landmarkBlockers: Terrain.landmarkBlockers().length,
    stepWu: STEP,
    anchors: anchors.map((anchor, index) => ({
      index,
      x: anchor.x,
      z: anchor.z,
      walkableHere: Terrain.sample(anchor.x, anchor.z).walkable,
      fromVent: {
        wu: Number(span(anchor, vent).toFixed(2)),
        walkSeconds: Number((span(anchor, vent) / speed).toFixed(2)),
        line: walkLine(vent, anchor),
        path: walkPath(vent, anchor),
      },
      fromZones: zones.map((zone) => {
        const nearest = nearestIn(zone, anchor);
        return {
          zone: zone.id,
          nearestPoint: nearest,
          wu: Number(span(anchor, nearest).toFixed(2)),
          walkSeconds: Number((span(anchor, nearest) / speed).toFixed(2)),
          line: walkLine(nearest, anchor),
          path: walkPath(nearest, anchor),
        };
      }),
    })),
  };
} finally {
  await vite.close();
}
say(JSON.stringify(report, null, 2));
