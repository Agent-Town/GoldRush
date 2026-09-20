// Probe controller: run the E4 convoy errand under the new (post-ADR-005) grammar.
// GRADE and HAUL both read the HERO's position now, so the whole errand is a MOVE_HERO worklist.
import fs from 'node:fs';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-long-road';
const NODES = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }];

let dumped = false;
const trace = [];

function mh(x, z) { return { verb: 'MOVE_HERO', pos: { x, z } }; }

export default function controller(view, state) {
  const now = view.now || {};
  const m = now.motor || {};
  const obj = m.objective || {};
  const fuel = m.fuel || {};
  const cv = m.convoy || {};
  const stop = obj.stop || { x: 190, z: 0 };

  if (!dumped) {
    dumped = true;
    fs.writeFileSync(`${WS}/view0.json`, JSON.stringify(view, null, 1));
  }
  trace.push({
    t: now.timers?.runSeconds, hx: now.hero?.x, hz: now.hero?.z,
    vx: m.vehicle?.x, vz: m.vehicle?.z, vst: m.vehicle?.state,
    lead: cv.leaderDistance, total: cv.total, arrived: obj.arrived,
    stored: fuel.stored, tar: fuel.tar, drawn: fuel.drawn,
    nodes: (fuel.nodes || []).map(n => `${n.harvested ? 'H' : '-'}${(n.progress ?? 0).toFixed(2)}`),
    graded: (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id),
    dispatch: m.vehicle?.dispatch,
  });
  fs.writeFileSync(`${WS}/errand-trace.json`, JSON.stringify(trace, null, 1));

  if (now.pendingSecure) return null; // blank line -> default bank

  const orders = [];
  if (now.pendingOffer?.length) orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });

  const gradedIds = (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id);
  const roadGraded = gradedIds.includes('the-long-road');
  const allTar = (fuel.nodes || []).every(n => n.harvested);

  if (!roadGraded) {
    orders.push(mh(-188.5, 0));
    orders.push({ verb: 'GRADE' });
  }
  if (!allTar) {
    for (const n of (fuel.nodes || [])) {
      if (n.harvested) continue;
      orders.push(mh(n.x, n.z));
      orders.push(mh(n.x, n.z + 0.7));
      orders.push(mh(n.x, n.z - 0.7));
      orders.push(mh(n.x, n.z + 0.7));
    }
  }
  if (!obj.arrived) {
    orders.push(mh(stop.x, stop.z));
    orders.push({ verb: 'HAUL' });
  }
  if (orders.length === 0) orders.push(mh(stop.x, stop.z));
  return orders.slice(0, 32);
}

function pick(offer) {
  const rank = (o) => {
    const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
    if (/plating|max health|health|dressing|heal|armou?r|vigor/.test(s)) return 3;
    if (/speed|boot|heel|swift/.test(s)) return 2;
    return 1;
  };
  return [...offer].sort((a, b) => rank(b) - rank(a))[0].id;
}
