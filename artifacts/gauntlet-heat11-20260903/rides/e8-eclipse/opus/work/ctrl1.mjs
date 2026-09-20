// e8-eclipse controller v1
// Map: Mare Claim terrain. Hero welded at claim (0,12). Build ground: dome-cluster pads z -6..6.
// No wreckers / no thieves in the e8 roster -> works are never attacked, gold never stolen.
// No now.air on this contract -> no regolith gate; secure is plain wave 20 (Balance default).
// Envelope: no twist.secureWave -> flat 18000 ticks; answer pendingSecure with a BLANK LINE.

const HERO = { x: 0, z: 12 };

// turrets: range 16, want max northern reach -> as close to the hero as legal ground allows (z=6)
const TURRETS = [
  { x: -6, z: 6 }, { x: 6, z: 6 }, { x: -2, z: 6 }, { x: 2, z: 6 },
  { x: -6, z: 4 }, { x: 6, z: 4 }, { x: -4, z: 2 }, { x: 4, z: 2 },
  { x: 0, z: 2 }, { x: -6, z: 0 }, { x: 6, z: 0 }, { x: 0, z: -2 },
];
// beacons: range 8 -> only |x| <= 5.3 at z=6 actually covers the hero
const BEACONS = [
  { x: -4, z: 6 }, { x: 4, z: 6 }, { x: 0, z: 6 }, { x: -4, z: 4 },
  { x: 4, z: 4 }, { x: 0, z: 4 }, { x: -2, z: 3 }, { x: 2, z: 3 },
  { x: -5, z: 5 }, { x: 5, z: 5 }, { x: 0, z: 0 }, { x: -2, z: -2 },
];

const blacklist = new Set();
const key = (kind, p) => `${kind}:${p.x},${p.z}`;

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  let s = 0;
  if (/plating|max hp|health|armor|armour|vitality|tough/.test(t)) s += 100;
  if (/heal|regen|mend/.test(t)) s += 60;
  if (/damage|spark|dmg|power|heavy/.test(t)) s += 40;
  if (/fire rate|rate of fire|tap|coil|reload|speed/.test(t)) s += 35;
  if (/range|reach/.test(t)) s += 20;
  if (/pierce|split|chain|multi/.test(t)) s += 25;
  if (/gold|pan|seam|income/.test(t)) s += 5;
  return s;
}

export default function controller(view) {
  const now = view.now;

  // pendingSecure: blank line -> the default `bank` fires with NO recorded entry at the terminal tick
  if (now.pendingSecure) return null;

  const orders = [];

  // 1) draft first (replace semantics: it must own the tick)
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // learn which candidate slots have refused, from the live works list
  const entries = (now.works && now.works.entries) || [];
  const placed = { turret: [], sentry_beacon: [] };
  for (const e of entries) {
    if (placed[e.id]) placed[e.id].push(e);
  }
  const occupied = (p) => entries.some(e => Math.hypot(e.position.x - p.x, e.position.z - p.z) < 1.5);

  const mech = view.stablePrefix.mechanics && view.stablePrefix.mechanics.buildables || [];
  const costsFor = (id) => (mech.find(b => b.id === id) || {}).costs || [];
  const nextCost = (id, n) => {
    const c = costsFor(id);
    if (n < c.length) return c[n];
    return Math.ceil((c[c.length - 1] * 1.3) / 5) * 5;
  };
  const maxOf = (id) => (mech.find(b => b.id === id) || {}).maxCount || 0;

  // 2) build ladder: turrets first (57dps/50g) then beacons. Emit only what is affordable NOW
  //    (plan-time affordability), suffix-gated inside that batch so one trip lands the whole batch.
  const nT = placed.turret.length, nB = placed.sentry_beacon.length;
  const rungs = [];
  let t = nT, b = nB;
  while (rungs.length < 6) {
    if (t < maxOf('turret')) { rungs.push({ id: 'turret', cost: nextCost('turret', t) }); t++; }
    else if (b < maxOf('sentry_beacon')) { rungs.push({ id: 'sentry_beacon', cost: nextCost('sentry_beacon', b) }); b++; }
    else break;
  }
  const batch = [];
  let spend = 0;
  for (const r of rungs) {
    if (spend + r.cost <= now.gold) { spend += r.cost; batch.push(r); } else break;
  }
  let tIdx = nT, bIdx = nB;
  for (let i = 0; i < batch.length; i++) {
    const r = batch[i];
    const pool = r.id === 'turret' ? TURRETS : BEACONS;
    let spot = null;
    const already = r.id === 'turret' ? tIdx : bIdx;
    let seen = 0;
    for (const p of pool) {
      if (blacklist.has(key(r.id, p)) || occupied(p)) continue;
      if (seen === (r.id === 'turret' ? tIdx - nT : bIdx - nB)) { spot = p; break; }
      seen++;
    }
    if (!spot) continue;
    const suffix = batch.slice(i).reduce((a, x) => a + x.cost, 0);
    orders.push({ verb: 'BUILD', what: r.id, where: spot, when: { goldGte: suffix } });
    if (r.id === 'turret') tIdx++; else bIdx++;
    void already;
  }

  // 3) once the ladder is full, sink surplus gold into tier upgrades.
  //    CONTEXT_ACTION does not travel -> pair each with an explicit MOVE_TO.
  const ladderFull = placed.turret.length >= maxOf('turret') && placed.sentry_beacon.length >= maxOf('sentry_beacon');
  if (ladderFull && now.gold >= 150) {
    const target = entries
      .filter(e => e.id === 'turret')
      .sort((a, b2) => (a.tier || 1) - (b2.tier || 1))[0];
    if (target && (target.tier || 1) < 3) {
      orders.push({ verb: 'MOVE_TO', pos: { x: target.position.x, z: target.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: target.index } });
    }
  }

  // 4) free damage: the blast lobs 24m under feelG 0.6. Enemies converge on the welded hero.
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 16 } });
  }

  // 5) the tail: pan the nearest live seam, stacked on one id (seams are 19-35wu out)
  const live = (now.seams || []).filter(s => s.active && s.x !== null);
  live.sort((a, b2) => Math.hypot(a.x - HERO.x, a.z - HERO.z) - Math.hypot(b2.x - HERO.x, b2.z - HERO.z));
  if (live.length) {
    const room = 32 - orders.length;
    for (let i = 0; i < room; i++) {
      orders.push({ verb: 'HARVEST', seam: live[Math.min(i < room - 6 ? 0 : 1, live.length - 1)].id });
    }
  }
  return orders.slice(0, 32);
}
