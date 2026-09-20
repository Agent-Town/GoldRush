// Diagnostic: map the walkable east edge along z=0 by MOVE_HERO refusal.
// An unwalkable MOVE_HERO fails IMMEDIATELY (UNREACHABLE_TERRAIN, checked before any walking),
// so a descending ladder of targets in one array reports the wall in a single view.
import fs from 'node:fs';
const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-long-road';

let stage = 0;
const log = [];

function mh(x, z) { return { verb: 'MOVE_HERO', pos: { x, z } }; }

export default function controller(view) {
  const now = view.now || {};
  const orders = (now.orders || []).map(r => ({
    v: r.order?.verb, x: r.order?.pos?.x, z: r.order?.pos?.z, st: r.status, why: r.reason,
  }));
  log.push({ t: now.timers?.runSeconds, hx: now.hero?.x, hz: now.hero?.z, stage, orders });
  fs.writeFileSync(`${WS}/wall-trace.json`, JSON.stringify(log, null, 1));

  if (now.pendingSecure) return null;

  const out = [];
  if (stage === 0) {
    for (let i = 0; i < 32; i++) out.push(mh(199.5 - i * 0.5, 0));
  } else if (stage === 1) {
    for (let i = 0; i < 32; i++) out.push(mh(184.0 - i * 0.2, 0));
  } else if (stage === 2) {
    // probe z extremes and the map's own east seam/zone line
    for (let i = 0; i < 16; i++) out.push(mh(178.0 - i * 0.5, 0));
    for (let i = 0; i < 8; i++) out.push(mh(190, -20 + i * 5));
  } else {
    return null;
  }
  stage++;
  return out;
}
