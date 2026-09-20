// Errand v2: route the hero OFF the road (the parked convoy blocks z=0 at the west stake),
// east along z=-8 through the three tar nodes, then onto the stop, then HAUL.
// Measures how close the convoy latch can be driven now that HAUL reads the hero's position.
import fs from 'node:fs';
const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-long-road';

const LANE = -8;
let dumped = false;
const trace = [];
function mh(x, z) { return { verb: 'MOVE_HERO', pos: { x, z } }; }

export default function controller(view) {
  const now = view.now || {};
  const m = now.motor || {};
  const obj = m.objective || {};
  const fuel = m.fuel || {};
  const cv = m.convoy || {};
  const stop = obj.stop || { x: 190, z: 0 };

  trace.push({
    t: now.timers?.runSeconds, hp: now.hero?.hp,
    hx: now.hero?.x, hz: now.hero?.z,
    vx: m.vehicle?.x, vz: m.vehicle?.z, vst: m.vehicle?.state,
    lead: cv.leaderDistance, total: cv.total, arrived: obj.arrived,
    stored: fuel.stored, tar: fuel.tar, drawn: fuel.drawn,
    nodes: (fuel.nodes || []).map(n => (n.harvested ? 'H' : (n.progress ?? 0).toFixed(2))),
    graded: (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id),
    dispatch: m.vehicle?.dispatch,
    alive: now.threats?.alive,
    orders: (now.orders || []).filter(r => r.status === 'failed').map(r => `${r.order?.verb}@${r.order?.pos?.x},${r.order?.pos?.z}:${(r.reason || '').slice(0, 34)}`),
  });
  fs.writeFileSync(`${WS}/errand2-trace.json`, JSON.stringify(trace, null, 1));
  if (!dumped) { dumped = true; }

  if (now.pendingSecure) return null;

  const o = [];
  if (now.pendingOffer?.length) o.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });

  const graded = (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id);
  const nodes = fuel.nodes || [];
  const unharvested = nodes.filter(n => !n.harvested);

  if (!graded.includes('the-long-road')) {
    o.push(mh(-182, LANE));          // step off the road; the parked convoy owns z=0 here
    o.push({ verb: 'GRADE' });
  }
  for (const n of unharvested) {
    o.push(mh(n.x, n.z));
    o.push(mh(n.x, n.z + 0.7));
    o.push(mh(n.x, n.z - 0.7));
    o.push(mh(n.x, n.z + 0.7));
  }
  if (!obj.arrived) {
    const near = now.hero && Math.hypot(now.hero.x - stop.x, now.hero.z - stop.z) < 12;
    if (!near) o.push(mh(stop.x, LANE));
    // jiggle-and-haul: each MOVE_HERO rests at a slightly different point, each HAUL
    // re-dispatches, and bestRemaining keeps the minimum over every sample.
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
    o.push(mh(stop.x, stop.z + 0.8));
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
    o.push(mh(stop.x - 0.8, stop.z));
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
  }
  if (!o.length) o.push(mh(stop.x, LANE));
  return o.slice(0, 32);
}

function pick(offer) {
  const rank = (x) => {
    const s = `${x.id} ${x.name} ${x.effectText}`.toLowerCase();
    if (/plating|max health|health|dressing|heal|armou?r|vigor/.test(s)) return 3;
    if (/speed|boot|heel|swift/.test(s)) return 2;
    return 1;
  };
  return [...offer].sort((a, b) => rank(b) - rank(a))[0].id;
}
