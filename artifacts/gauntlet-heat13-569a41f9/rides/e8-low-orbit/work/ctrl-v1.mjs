// e8-low-orbit controller, heat 13, post-ADR-005 grammar.
//
// The map: claim (0,12) inside `claw-carcass-yard` (x -18..18, z -14..14), the ONLY pressurised
// ground. The two outboard scaffold decks (x |26..48|, z -10..10) are vacuum and are the crossings:
// the secure needs BOTH stood in on air AND 4 credited entries, at most one per 120 s window.
// Suit 60 s, refill 4/s inside the yard, 5 hp/s when empty. Roster is one id with no wrecker and no
// thief, so no work can be attacked and no gold stolen; the fort is a monotone investment.
//
// The plan: move HOME to (-14,2), 8.6 units of vacuum from the west deck instead of 26.6 from the
// claim, and spend the empty opening board on the one expensive trip (east). Then one cheap west
// dash per window. The handhold spine runs z=0 from x=-48 to -18, so the dash keeps full control.

const HOME = { x: -14, z: 2 };
const WEST = { x: -27, z: 2 };   // inside west-scaffold-deck, on the spine
const EAST = { x: 27, z: 2 };    // inside east-scaffold-deck, on the spine

const TURRET_SPOTS = [
  { x: -17, z: 8 }, { x: -17, z: -4 }, { x: -7, z: 6 }, { x: -7, z: -2 },
  { x: -14, z: 12 }, { x: -14, z: -8 }, { x: -2, z: 2 }, { x: -17, z: -10 },
  { x: -4, z: 10 }, { x: -6, z: -9 }, { x: 2, z: 6 }, { x: 2, z: -4 },
];
const BEACON_SPOTS = [
  { x: -14, z: 6 }, { x: -14, z: -2 }, { x: -10, z: 2 }, { x: -18, z: 2 },
  { x: -11, z: 5 }, { x: -11, z: -1 }, { x: -17, z: 5 }, { x: -17, z: -1 },
  { x: -14, z: 9 }, { x: -8, z: 4 }, { x: -8, z: 0 }, { x: -14, z: -5 },
];

// The ladder, interleaved so dps lands early and cumulatively gated so a cheap rung can never
// steal gold an expensive one is waiting for. Prices come off the view's own cost curve.
const LADDER = [
  ['turret', 0], ['sentry_beacon', 0], ['turret', 1], ['sentry_beacon', 1],
  ['turret', 2], ['sentry_beacon', 2], ['turret', 3], ['sentry_beacon', 3],
  ['sentry_beacon', 4], ['sentry_beacon', 5],
];

const TIER2_COST = 150;

// GROUND refusals poison the coordinate; ECONOMY refusals poison nothing (gen 51).
const GROUND = /out_of_zone|collision|UNREACHABLE|outside buildable|out_of_reach|cap_reached|OUT_OF_ZONE|COLLISION/i;
const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plating|max health|maximum health|max hp|vitality|tough/.test(t)) s += 100;
  if (/dressing|heal|regen|mend|restore/.test(t)) s += 60;
  if (/spark|damage|coil|tap|volley|bolt|power/.test(t)) s += 30;
  if (/rate|fire|reload|speed of fire/.test(t)) s += 22;
  if (/range|reach/.test(t)) s += 12;
  if (/pan|gold|luck|prospect|sluice|seam/.test(t)) s += 4;
  return s;
}

export default function controller(view, rows) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;

  // Record refusals from the accepted-order snapshot before planning anything.
  for (const rec of now.orders || []) {
    const ord = rec.order || rec;
    if (rec.status === 'failed' && ord && ord.verb === 'BUILD' && ord.where) {
      const reason = String(rec.reason || '');
      if (GROUND.test(reason)) blacklist.add(key(ord.where));
    }
  }

  const air = now.air || {};
  const cross = air.crossing || null;
  const suit = air.suit || {};

  rows.push({
    t: +t.toFixed(1), w: now.wave, hp: now.hero.hp, max: now.hero.maxHp,
    hero: [+now.hero.x.toFixed(1), +now.hero.z.toFixed(1)],
    gold: now.gold, pan: now.score?.goldPanned ?? 0,
    alive: now.threats?.alive, wrecked: now.works?.wrecked,
    works: now.works?.byKind, tiers: (now.works?.entries || []).map((e) => e.tier).join(''),
    suit: suit.seconds, dome: suit.inDome,
    cr: cross ? `${cross.credited}/${cross.required} w${cross.window} tw${cross.creditedThisWindow} r=${cross.reached.join('+')} held=${cross.windowHeldEntries} breath=${cross.breathlessEntries}` : null,
  });

  // The secure boundary: a blank line banks it for free and keeps the last accepted order inside
  // the tick envelope.
  if (now.pendingSecure) return null;

  const orders = [];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Free supplementary damage. Aimed OUTWARD from home so the 4.8x orbital return re-enters at
  // home + 2*offset, out in the empty north debris band, never on the fort.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: HOME.x, z: HOME.z + 12 } });
  }

  // ── THE CROSSING ERRAND ────────────────────────────────────────────────────────────────────
  // One credit per window; take it at the window's first view. The east deck is reached once, on
  // the opening empty board; every later trip is the 12.6-unit west dash.
  let sortie = false;
  if (cross && !cross.complete && cross.creditedThisWindow === 0) {
    const needEast = !cross.reached.includes('east-scaffold-deck');
    const needWest = !cross.reached.includes('west-scaffold-deck');
    let target = WEST;
    if (needEast && (t < 25 || !needWest)) target = EAST;
    else if (needEast && cross.credited >= cross.required - 1) target = EAST;
    orders.push({ verb: 'MOVE_HERO', pos: target });
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
    sortie = true;
  }

  // ── THE LADDER ─────────────────────────────────────────────────────────────────────────────
  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const costsFor = {};
  for (const b of view.stablePrefix.mechanics.buildables || []) costsFor[b.id] = b.costs || [b.cost];

  const remaining = [];
  for (const [id, idx] of LADDER) {
    if ((byKind[id] || 0) > idx) continue;
    remaining.push([id, idx]);
  }
  let cum = 0;
  let emitted = 0;
  for (const [id, idx] of remaining) {
    if (emitted >= 4) break;
    const price = (costsFor[id] || [])[idx] ?? 9999;
    cum += price;
    const taken = new Set(entries.filter((e) => e.id === id).map((e) => key(e.position || { x: 9e9, z: 9e9 })));
    const pool = (id === 'turret' ? TURRET_SPOTS : BEACON_SPOTS)
      .filter((p) => !blacklist.has(key(p)) && !taken.has(key(p)));
    const spot = pool[0];
    if (!spot) continue;
    orders.push({ verb: 'BUILD', what: id, where: spot, when: { goldGte: cum } });
    emitted += 1;
  }
  const ladderDone = remaining.length === 0;

  // ── THE CAPPED-PURSE SINK ──────────────────────────────────────────────────────────────────
  // Waves and timeAlive are pinned by a wave-20 secure, so gold is the only free ranking axis and
  // a full purse switches panning off. CONTEXT_ACTION does not travel: pair it with MOVE_HERO,
  // 0.7 units in from the work (interactRadius 1.6, arrival radius 0.5).
  if (ladderDone && !sortie && now.gold >= TIER2_COST) {
    const up = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked);
    if (up && up.position) {
      const dx = HOME.x - up.position.x, dz = HOME.z - up.position.z;
      const L = Math.hypot(dx, dz) || 1;
      orders.push({ verb: 'MOVE_HERO', pos: { x: +(up.position.x + dx / L * 0.7).toFixed(2), z: +(up.position.z + dz / L * 0.7).toFixed(2) } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: up.id, index: up.index } });
      orders.push({ verb: 'MOVE_HERO', pos: HOME });
    }
  }

  // ── THE HARVEST TAIL ───────────────────────────────────────────────────────────────────────
  // Inactive seams publish x/z as null; one non-finite number refuses the WHOLE array.
  const live = (now.seams || [])
    .filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, dist: d(s, HOME) }))
    .sort((a, b) => a.dist - b.dist);

  const blocks = [7, 6, 5];
  for (let i = 0; i < blocks.length; i += 1) {
    const seam = live[i % Math.max(1, live.length)];
    if (!seam) break;
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
    for (let k = 0; k < blocks[i]; k += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  orders.push({ verb: 'MOVE_HERO', pos: HOME });

  if (orders.length > 32) {
    const tail = orders.pop();
    orders.length = 31;
    orders.push(tail);
  }
  return orders;
}
