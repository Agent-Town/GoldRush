// e8-low-orbit, heat 13 — post-ADR-005 grammar.
//
// WHAT THE MAP ASKS. `claw-carcass-yard` (x -18..18, z -14..14) is the only pressurised ground and
// it holds the claim at (0,12). The two outboard scaffold decks (|x| 26..48, z -10..10) are vacuum
// and ARE the crossing: no wave secures until the hero has stood in BOTH on air and FOUR entries
// have been credited, at most one per 120 s window. Suit 60 s, refill 4/s in the yard, 5 hp/s empty.
//
// THE ROUTE IS THE WHOLE HEAT. The hero has no pathfinder (`MOVE_HERO` refuses UNREACHABLE_APPROACH
// after four seconds of no progress) and this tile carries a static obstacle across z≈2 between
// x≈-14 and x≈+4: tune-1 walked the hero east, credited, then pinned it at (3.6, 2) for the rest of
// the run trying to come home along that lane. The route probe measured that the two DIAGONALS
// (0,12)<->(-27,2) and (0,12)<->(27,2) are clear in both directions, 28.8 units at 4.8 u/s, and
// that one out-and-back pair banks BOTH zones inside the first thirty seconds. So home stays at the
// claim and every sortie is that same proven diagonal.
//
// Roster is one id with neither `wrecker` nor `thief`, so no work can be attacked and no gold
// stolen: REPAIR_UNDER and palisade chaff are dead weight and the fort is a monotone investment.

const HOME = { x: 0, z: 12 };
const WEST = { x: -27, z: 2 };
const EAST = { x: 27, z: 2 };

// Candidates chosen to stay >=3 units clear of both sortie diagonals, so the fort can never wall
// the hero into its own claim.
const TURRET_SPOTS = [
  { x: 11, z: 12.5 }, { x: -11, z: 12.5 }, { x: 11, z: 4 }, { x: -11, z: 4 },
  { x: 14, z: 13.5 }, { x: -14, z: 13.5 }, { x: 6, z: 4 }, { x: -6, z: 4 },
  { x: 9, z: -2 }, { x: -9, z: -2 }, { x: 14, z: 9 }, { x: -14, z: 9 },
];
const BEACON_SPOTS = [
  { x: 0, z: 5.5 }, { x: 4, z: 6 }, { x: -4, z: 6 }, { x: 8, z: 5 },
  { x: -8, z: 5 }, { x: 0, z: 0 }, { x: 6, z: -6 }, { x: -6, z: -6 },
  { x: 0, z: -6 }, { x: 12, z: -6 }, { x: -12, z: -6 }, { x: 4, z: -10 },
];

const LADDER = [
  ['turret', 0], ['sentry_beacon', 0], ['turret', 1], ['sentry_beacon', 1],
  ['turret', 2], ['sentry_beacon', 2], ['turret', 3], ['sentry_beacon', 3],
  ['sentry_beacon', 4], ['sentry_beacon', 5],
];
const TIER2_COST = 150;

// GROUND refusals poison the coordinate; ECONOMY refusals poison nothing (gen 51).
const GROUND = /out_of_zone|collision|UNREACHABLE|outside buildable|out_of_reach|cap_reached/i;
const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plating|max health|maximum health|max hp|vitality|tough/.test(t)) s += 100;
  if (/dressing|heal|regen|mend|restore/.test(t)) s += 60;
  if (/spark|damage|coil|tap|volley|bolt|power/.test(t)) s += 30;
  if (/rate|fire|reload/.test(t)) s += 22;
  if (/range|reach/.test(t)) s += 12;
  if (/pan|gold|luck|prospect|sluice|seam/.test(t)) s += 4;
  return s;
}

export default function controller(view, rows) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;

  for (const rec of now.orders || []) {
    const ord = rec.order || rec;
    if (rec.status === 'failed' && ord && ord.verb === 'BUILD' && ord.where
        && GROUND.test(String(rec.reason || ''))) blacklist.add(key(ord.where));
  }

  const cross = now.air?.crossing || null;
  const suit = now.air?.suit || {};
  rows.push({
    t: +t.toFixed(1), w: now.wave, hp: now.hero.hp, max: now.hero.maxHp,
    hero: [+now.hero.x.toFixed(1), +now.hero.z.toFixed(1)],
    gold: now.gold, pan: now.score?.goldPanned ?? 0, alive: now.threats?.alive,
    works: now.works?.byKind, wrecked: now.works?.wrecked,
    tiers: (now.works?.entries || []).map((e) => e.tier).join(''),
    suit: suit.seconds, dome: suit.inDome,
    cr: cross ? `${cross.credited}/${cross.required} win${cross.window} tw${cross.creditedThisWindow} r=${cross.reached.length} held=${cross.windowHeldEntries} br=${cross.breathlessEntries} done=${cross.complete}` : null,
  });

  if (now.pendingSecure) return null;   // blank line banks it and costs no entry

  const orders = [];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const away = Math.hypot(now.hero.x - HOME.x, now.hero.z - HOME.z);

  // Free damage. Aimed OUTWARD (north, toward the spawn ring): the 4.8x orbital return re-enters at
  // position + (position - origin), i.e. z ≈ 36, out in the empty north debris band.
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 24 } });

  // ── THE CROSSING ERRAND ────────────────────────────────────────────────────────────────────
  // One credit per 120 s window, taken at the window's first view while the wave is youngest.
  // Bank the second zone early: `reached` needs both, `credited` needs four.
  let sortie = false;
  if (cross && !cross.complete && cross.creditedThisWindow === 0) {
    const target = cross.reached.includes('east-scaffold-deck') ? WEST : EAST;
    orders.push({ verb: 'MOVE_HERO', pos: target });
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
    sortie = true;
  }

  // COME HOME FIRST. Under free-fall the hero keeps its momentum, so a knock or a finished sortie
  // leaves it coasting; and BUILD returns {movement} (truthy, owns the tick) while the Prospector
  // travels, so a come-home order placed below the ladder never runs at all.
  if (away > 0.6) orders.push({ verb: "MOVE_HERO", pos: HOME });

  // ── THE LADDER ─────────────────────────────────────────────────────────────────────────────
  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const costsFor = {};
  for (const b of view.stablePrefix.mechanics.buildables || []) costsFor[b.id] = b.costs || [b.cost];

  const remaining = LADDER.filter(([id, idx]) => (byKind[id] || 0) <= idx);
  let cum = 0;
  let emitted = 0;
  for (const [id, idx] of remaining) {
    if (emitted >= 4) break;
    cum += (costsFor[id] || [])[idx] ?? 9999;
    const taken = new Set(entries.filter((e) => e.id === id && e.position).map((e) => key(e.position)));
    const spot = (id === 'turret' ? TURRET_SPOTS : BEACON_SPOTS)
      .find((p) => !blacklist.has(key(p)) && !taken.has(key(p)));
    if (!spot) continue;
    orders.push({ verb: 'BUILD', what: id, where: spot, when: { goldGte: cum } });
    emitted += 1;
  }
  const ladderDone = remaining.length === 0;

  // ── THE CAPPED-PURSE SINK ──────────────────────────────────────────────────────────────────
  // Waves and timeAlive are pinned by a wave-20 secure, so gold is the only free ranking axis, and
  // a purse at the cap refuses credits — a full bucket switches panning off. CONTEXT_ACTION does
  // not travel and reaches 1.6; pair it with MOVE_HERO 0.7 units in from the work, then come home.
  if (ladderDone && !sortie && now.gold >= TIER2_COST) {
    const up = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked && e.position);
    if (up) {
      const dx = HOME.x - up.position.x, dz = HOME.z - up.position.z;
      const L = Math.hypot(dx, dz) || 1;
      orders.push({ verb: 'MOVE_HERO', pos: { x: +(up.position.x + dx / L * 0.7).toFixed(2), z: +(up.position.z + dz / L * 0.7).toFixed(2) } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: up.id, index: up.index } });
      orders.push({ verb: 'MOVE_HERO', pos: HOME });
    }
  }

  // ── THE HARVEST TAIL ───────────────────────────────────────────────────────────────────────
  // An inactive seam publishes x/z/anchorIndex as null; one non-finite number refuses the whole
  // array and installs none of it, silently. Filter for finiteness before sorting.
  const live = (now.seams || [])
    .filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - HOME.x, s.z - HOME.z) }))
    .sort((a, b) => a.d - b.d);

  const blocks = [7, 6, 5];
  for (let i = 0; i < blocks.length && live.length; i += 1) {
    const seam = live[i % live.length];
    orders.push({ verb: 'MOVE_HERO', pos: HOME });   // re-arm: knockback is 1.75x here
    for (let k = 0; k < blocks[i]; k += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  orders.push({ verb: 'MOVE_HERO', pos: HOME });     // terminal anchor, never filtered away

  if (orders.length > 32) {
    const tail = orders.pop();
    orders.length = 31;
    orders.push(tail);
  }
  return orders;
}
