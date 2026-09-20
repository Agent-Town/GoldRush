// e2-trestle controller — the secure is the RAILCAR KILL (bossKillSecuresRun, 3 components).
// Boss HP ~ 25.2 * 1.115^11 * 12.5 * (0.9+1.25+0.85) ~= 3071.
// Rail route 0 is the straight line x=0, z -46..46 at railSpeed 1.9, pursuitRange 0.
// So DAMAGE-TO-THE-RAIL is the whole gold game: every work goes where its range covers x=0,
// but OFF the rail itself (baron buildingDamageScale 7).
const POST = { x: 5, z: -11 };
const RAIL_AIM = { x: 0, z: -11 };

const TURRETS = [
  { x: 6, z: -9 }, { x: -6, z: -9 }, { x: 6, z: -15 }, { x: -6, z: -15 },
  { x: 8, z: -12 }, { x: -8, z: -12 }, { x: 7, z: -18 }, { x: -7, z: -18 },
  { x: 9, z: -9 }, { x: -9, z: -9 },
];
const BEACONS = [
  { x: 5, z: -8 }, { x: -5, z: -8 }, { x: 5, z: -14 }, { x: -5, z: -14 },
  { x: 5, z: -17 }, { x: -5, z: -17 }, { x: 8, z: -8 }, { x: -8, z: -8 },
  { x: 3, z: -19 }, { x: -3, z: -19 }, { x: 9, z: -14 }, { x: -9, z: -14 },
];
const SLUICES = [
  { x: 12, z: -8 }, { x: -12, z: -8 }, { x: 16, z: -8 }, { x: -16, z: -8 },
  { x: 12, z: -9 }, { x: -12, z: -9 }, { x: 20, z: -8 }, { x: -20, z: -8 },
  { x: 14, z: -7.5 }, { x: -14, z: -7.5 }, { x: 18, z: -9 }, { x: -18, z: -9 },
];

// strategy order: first gun, cheap income, then the rest of the rail battery.
const LADDER = [
  { id: 'turret', spots: TURRETS },
  { id: 'sluice', spots: SLUICES },
  { id: 'sluice', spots: SLUICES },
  { id: 'sluice', spots: SLUICES },
  { id: 'turret', spots: TURRETS },
  { id: 'turret', spots: TURRETS },
  { id: 'turret', spots: TURRETS },
  { id: 'sentry_beacon', spots: BEACONS },
  { id: 'sentry_beacon', spots: BEACONS },
  { id: 'sentry_beacon', spots: BEACONS },
  { id: 'sentry_beacon', spots: BEACONS },
  { id: 'sentry_beacon', spots: BEACONS },
  { id: 'sentry_beacon', spots: BEACONS },
];

const bad = new Set();          // poisoned coordinates (GROUND refusals only)
const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach/i;

function key(id, s) { return `${id}@${s.x},${s.z}`; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function scoreUpgrade(o, hero) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  const needHp = (hero.maxHp || 100) < 170;
  let s = 0;
  if (/plating|health|max hp|maxhp|vigor|dressing|heal/.test(t)) s += needHp ? 100 : 30;
  if (/spark|damage|coil|tap|volley|bolt|power/.test(t)) s += 60;
  if (/blast|charge/.test(t)) s += 40;
  if (/fire rate|rate/.test(t)) s += 45;
  if (/gold|pan|luck|seam/.test(t)) s += 5;
  return s;
}

export default function controller(now) {
  const o = [];

  if (now.pendingSecure) return '\n';   // blank line banks the default, costs no entry

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const c of now.pendingOffer) { const s = scoreUpgrade(c, now.hero || {}); if (s > bs) { bs = s; best = c; } }
    o.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // learn refusals from the previous array
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const ord = rec.order || rec;
    if (ord.verb !== 'BUILD' || !ord.where) continue;
    const why = `${rec.reason || ''} ${rec.detail || ''}`;
    if (/insufficient_gold/i.test(why)) continue;
    if (GROUND.test(why) || why.trim() === '') bad.add(key(ord.what, ord.where));
  }

  const entries = (now.works && now.works.entries) || [];
  const built = {};
  for (const e of entries) built[e.id] = (built[e.id] || 0) + 1;
  const occupied = entries.map(e => e.position || { x: e.x, z: e.z }).filter(p => p && Number.isFinite(p.x));

  // free damage, always safe (returns {} on success and on failure)
  if ((now.blastReadyInMs ?? 1) === 0) o.push({ verb: 'BLAST_AT', pos: RAIL_AIM });

  const hero = now.hero || { x: 0, z: 0 };
  const heroAt = { x: hero.x, z: hero.z };

  // tier-2 turret errand once the ladder has capped: pure boss damage (x1.65 dps)
  let errand = null;
  const ladderDone = (built.turret || 0) >= 4 && (built.sentry_beacon || 0) >= 6;
  if (ladderDone && (now.gold || 0) >= 150) {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (e.id !== 'turret' || (e.tier || 1) > 1 || e.wrecked) continue;
      const p = e.position || {};
      if (!Number.isFinite(p.x)) continue;
      const dx = POST.x - p.x, dz = POST.z - p.z, d = Math.hypot(dx, dz) || 1;
      errand = { pos: { x: p.x + dx / d * 0.7, z: p.z + dz / d * 0.7 }, act: { id: e.id, index: e.index ?? i } };
      break;
    }
  }
  if (errand) {
    o.push({ verb: 'MOVE_HERO', pos: errand.pos });
    o.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: errand.act });
  } else if (dist(heroAt, POST) > 1.0) {
    o.push({ verb: 'MOVE_HERO', pos: POST });
  }

  // mending is cheap and ADR-005 bounds it to the rig sweep: never gate it on gold
  o.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // ladder: emit the next unbuilt rung, plan-time affordable, one trip at a time
  const need = {};
  for (const r of LADDER) need[r.id] = (need[r.id] || 0) + 1;
  const have = {};
  const gold = now.gold || 0;
  let emitted = 0;
  for (const rung of LADDER) {
    have[rung.id] = (have[rung.id] || 0) + 1;
    if ((built[rung.id] || 0) >= have[rung.id]) continue;      // this rung already stands
    const idx = built[rung.id] || 0;
    const costs = COSTS[rung.id] || [];
    const cost = costs[Math.min(idx, costs.length - 1)] || 999;
    if (gold < cost) break;                                     // cumulative: nothing behind it fires
    const spot = rung.spots.find(s => !bad.has(key(rung.id, s)) &&
      !occupied.some(p => dist(p, s) < 1.6));
    if (!spot) continue;                                        // retire the rung, do not stall
    o.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cost } });
    if (++emitted >= 2) break;
    break;
  }

  // harvest tail: one live seam drained in a block, nearest to the post
  const live = (now.seams || []).filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(a, POST) - dist(b, POST));
  const chain = live.slice(0, 2);
  const room = 31 - o.length;
  for (let i = 0; i < room; i++) {
    const s = chain[Math.floor(i / 7) % Math.max(1, chain.length)] || live[0];
    if (!s) break;
    o.push({ verb: 'HARVEST', seam: s.id });
  }
  if (!o.length) o.push({ verb: 'REPAIR_UNDER', pct: 99 });
  return JSON.stringify(o.slice(0, 32));
}

const COSTS = {
  turret: [50, 70, 95, 125],
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  sluice: [40, 40, 40],
  palisade: [10, 10, 10, 10],
};
