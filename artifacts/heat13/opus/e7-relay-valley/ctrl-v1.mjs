// e7-relay-valley controller v1
// Thesis: the loss is hero_down ONLY (no wrecker on the roster => works are
// invulnerable, the claim is not a loss condition). MOVE_HERO lets the hero
// LEAVE the unfortifiable claim and stand inside relay-site-r3, where a fort
// CAN be built around it. That same fort's first work lights the relay for
// PLAYBOOK_USE, so the era gate and the defence are the same purchase.

const POST = { x: 25, z: 38 };            // hero post, inside relay-site-r3
const ZONE = { minX: 20, maxX: 30, minZ: 36, maxZ: 46 };

// candidates: more spots than slots, all inside the zone and in range of POST
const TURRET_SPOTS = [
  { x: 21, z: 37 }, { x: 29, z: 37 }, { x: 21, z: 43 }, { x: 29, z: 43 },
  { x: 24, z: 45 }, { x: 27, z: 45 }, { x: 20.5, z: 40 }, { x: 29.5, z: 40 },
];
const BEACON_SPOTS = [
  { x: 25, z: 36.5 }, { x: 25, z: 41 }, { x: 22, z: 40 }, { x: 28, z: 40 },
  { x: 23, z: 36.5 }, { x: 27, z: 36.5 }, { x: 22.5, z: 43 }, { x: 27.5, z: 43 },
  { x: 25, z: 44 }, { x: 20.5, z: 37.5 }, { x: 29.5, z: 37.5 },
];

const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

// strategy order: cheapest beacon first (it is the relay latch AND the opening
// gun), then turrets front-loaded, then the rest of the beacons.
const LADDER = [
  { what: 'sentry_beacon', i: 0 }, { what: 'turret', i: 0 },
  { what: 'turret', i: 1 }, { what: 'sentry_beacon', i: 1 },
  { what: 'turret', i: 2 }, { what: 'sentry_beacon', i: 2 },
  { what: 'turret', i: 3 }, { what: 'sentry_beacon', i: 3 },
  { what: 'sentry_beacon', i: 4 }, { what: 'sentry_beacon', i: 5 },
];
const costOf = (r) => (r.what === 'turret' ? TURRET_COSTS : BEACON_COSTS)[r.i];

const GROUND_REFUSALS = /out_of_zone|collision|cap_reached|UNREACHABLE|out_of_reach|not legal/i;

const banned = new Set();          // poisoned coordinates (GROUND refusals only)
let usedName = null;               // playbook name already spent
let quietNext = false;             // blank-line the view after a PLAYBOOK_USE
const key = (p) => `${p.x},${p.z}`;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  let v = 0;
  if (/plating|max health|max hp|hit points|vitality|grit|tough/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 60;
  if (/damage|spark|coil|tap|power|blast/.test(s)) v += 25;
  if (/rate|fire|speed|reload|cooldown/.test(s)) v += 20;
  if (/range|reach/.test(s)) v += 10;
  return v;
}

export default function controller(view, n) {
  const now = view.now;

  // secure boundary: answer with silence so the configured bank default fires
  // one call cheaper and the last accepted order stays inside the envelope.
  if (now.pendingSecure) return null;

  if (quietNext) { quietNext = false; return null; }

  // harvest refusals poison nothing; ground refusals poison the coordinate.
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD') continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (rec.status === 'failed' && GROUND_REFUSALS.test(reason) && o.where) banned.add(key(o.where));
  }

  const out = [];

  // 1. draft first, under replace semantics
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free supplementary damage; BLAST_AT falls through either way
  if (now.blastReadyInMs === 0) {
    out.push({ verb: 'BLAST_AT', pos: { x: POST.x, z: POST.z - 6 } });
  }

  // 3. the era gate: a relay work standing inside the site + a running program.
  const pb = now.playbookUse || {};
  const entries = now.works?.entries || [];
  const relayStanding = entries.some((e) =>
    (e.id === 'turret' || e.id === 'sentry_beacon') && !e.wrecked &&
    e.position && e.position.x >= ZONE.minX && e.position.x <= ZONE.maxX &&
    e.position.z >= ZONE.minZ && e.position.z <= ZONE.maxZ);
  let firedUse = false;
  if (pb.declared && !pb.objectiveMet && relayStanding) {
    const name = `relay-valley-${n}`;
    if (name !== usedName) { out.push({ verb: 'PLAYBOOK_USE', name }); usedName = name; firedUse = true; }
  }

  // 4. hold the post. Blocks while walking (intended), falls through on arrival.
  out.push({ verb: 'MOVE_HERO', pos: POST });

  // 5. build ladder, cumulative-gated so a cheap rung cannot steal from a dear one.
  const byKind = now.works?.byKind || {};
  const standT = entries.filter((e) => e.id === 'turret' && !e.wrecked).length || byKind.turret || 0;
  const standB = entries.filter((e) => e.id === 'sentry_beacon' && !e.wrecked).length || byKind.sentry_beacon || 0;
  const taken = new Set(entries.map((e) => e.position ? key({ x: e.position.x, z: e.position.z }) : ''));
  const pending = LADDER.filter((r) => (r.what === 'turret' ? r.i >= standT : r.i >= standB));
  let cum = 0, emitted = 0;
  const usedSpot = new Set();
  for (const rung of pending) {
    if (emitted >= 4) break;
    cum += costOf(rung);
    const pool = rung.what === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const spot = pool.find((p) => !banned.has(key(p)) && !taken.has(key(p)) && !usedSpot.has(key(p)));
    if (!spot) continue;
    usedSpot.add(key(spot));
    out.push({ verb: 'BUILD', what: rung.what, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    emitted++;
  }

  // 6. tail: drain the nearest live seam in a block. Inactive seams publish
  // null coordinates; one non-finite number refuses the WHOLE array.
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const px = now.prospector?.x ?? POST.x, pz = now.prospector?.z ?? POST.z;
  live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const room = 32 - out.length;
  if (live.length && room > 0) {
    const chain = [];
    // drain the nearest seam in a block of 7, then the next, and repeat.
    for (let pass = 0; chain.length < room; pass++) {
      const s = live[pass % live.length];
      for (let k = 0; k < 7 && chain.length < room; k++) chain.push({ verb: 'HARVEST', seam: s.id });
      if (live.length === 1 && chain.length >= room) break;
      if (pass > 12) break;
    }
    out.push(...chain.slice(0, room));
  }

  if (firedUse) quietNext = true;
  return out.slice(0, 32);
}
