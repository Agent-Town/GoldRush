// v3: grade at the west stake, run the tar line, then drive the convoy latch as close as the
// new grammar allows. HAUL reads the HERO's position, so the Hauler can only rest where the hero
// can stand — this measures exactly how close that is to the stop at (190,0).
import fs from 'node:fs';
const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-long-road';
const LANE = -8;
const trace = [];
function mh(x, z) { return { verb: 'MOVE_HERO', pos: { x, z } }; }

export default function controller(view, st) {
  const now = view.now || {};
  const m = now.motor || {};
  const obj = m.objective || {};
  const fuel = m.fuel || {};
  const cv = m.convoy || {};
  const stop = obj.stop || { x: 190, z: 0 };
  const hero = now.hero || {};

  trace.push({
    t: now.timers?.runSeconds, hp: hero.hp,
    h: [hero.x, hero.z],
    v: [m.vehicle?.x, m.vehicle?.z, m.vehicle?.state],
    lead: cv.leaderDistance, arrived: obj.arrived,
    f: [fuel.stored, fuel.tar, fuel.drawn],
    n: (fuel.nodes || []).map(n => (n.harvested ? 'H' : (n.progress ?? 0).toFixed(2))).join(''),
    g: (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id).join(','),
    disp: m.vehicle?.dispatch,
    alive: now.threats?.alive,
    fail: (now.orders || []).filter(r => r.status === 'failed')
      .map(r => `${r.order?.verb}(${r.order?.pos?.x ?? ''},${r.order?.pos?.z ?? ''}) ${(r.reason || '').slice(0, 26)}`),
  });
  fs.writeFileSync(`${WS}/v3-trace.json`, JSON.stringify(trace, null, 1));

  if (now.pendingSecure) return null;

  const o = [];
  if (now.pendingOffer?.length) o.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });

  const graded = (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id);
  st.gradeTries = st.gradeTries || 0;
  if (!graded.includes('the-long-road') && st.gradeTries < 3) {
    st.gradeTries++;
    o.push(mh(-188.5, 0));
    o.push({ verb: 'GRADE' });
    o.push(mh(-188.5, -1.5));
    o.push({ verb: 'GRADE' });
    return o.slice(0, 32);
  }

  const unharvested = (fuel.nodes || []).filter(n => !n.harvested);
  // only detour for tar while the tank cannot fund the drive
  const totalFuel = (fuel.stored ?? 0) + (fuel.tar ?? 0) * 4;
  if (unharvested.length && totalFuel < 34 && (hero.x ?? 0) < 60) {
    for (const n of unharvested) {
      o.push(mh(n.x, n.z));
      o.push(mh(n.x, n.z + 0.7));
      o.push(mh(n.x, n.z - 0.7));
      o.push(mh(n.x, n.z + 0.7));
    }
  }

  if (!obj.arrived) {
    if ((hero.x ?? -180) < stop.x - 10) o.push(mh(stop.x, LANE));
    // walk north onto the stop in steps, then haul; jiggle to sample several rest positions
    o.push(mh(stop.x, -3));
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
    o.push(mh(stop.x, 1.2));
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
    o.push(mh(stop.x - 1.3, stop.z));
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
    o.push(mh(stop.x + 1.1, stop.z));
    o.push(mh(stop.x, stop.z));
    o.push({ verb: 'HAUL' });
  } else {
    o.push(mh(stop.x, LANE));
  }
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
