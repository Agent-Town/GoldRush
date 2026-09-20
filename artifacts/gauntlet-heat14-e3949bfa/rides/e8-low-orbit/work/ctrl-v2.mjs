// gen 132 — e8-low-orbit. Free-fall hold + windowed crossing sorties + capped-purse ladder.
const HOME_A = { x: 0, z: 4 }, HOME_B = { x: 0, z: 4 };
const WEST = { x: -32, z: 2 }, EAST = { x: 32, z: 2 };
const SECURE_T = 600, BUILD_FLOOR_T = 380, CAP_BASE = 200, CAP_PER_STOCK = 150;

// ladder: strategy order, one ordinal per id.
const LADDER = [
  ['turret', [{ x: -10, z: 2 }, { x: 10, z: 2 }, { x: -10, z: 8 }, { x: 10, z: 8 }, { x: -14, z: 0 }, { x: 14, z: 0 }, { x: -8, z: -4 }, { x: 8, z: -4 }]],
  ['sentry_beacon', [{ x: -5, z: 2 }, { x: 5, z: 2 }, { x: -5, z: 7 }, { x: 5, z: 7 }, { x: 0, z: 0 }, { x: 0, z: 9 }, { x: -6, z: 4 }, { x: 6, z: 4 }, { x: -3, z: -3 }, { x: 3, z: -3 }]],
  ['stockpile', [{ x: -13, z: 8 }, { x: 13, z: 8 }, { x: -13, z: 0 }, { x: 13, z: 0 }, { x: -16, z: 5 }, { x: 16, z: 5 }]],
];
const RUNGS = [
  ['turret', 1], ['sentry_beacon', 1], ['turret', 2], ['sentry_beacon', 2],
  ['stockpile', 1], ['turret', 3], ['sentry_beacon', 3], ['turret', 4],
  ['sentry_beacon', 4], ['stockpile', 2], ['sentry_beacon', 5], ['sentry_beacon', 6],
];
const PALI = [];
for (const z of [11, 7, 3, -1, -5, -9, -13]) for (const x of [-17, 17, -15, 15]) PALI.push({ x, z });

const badSpot = new Set();           // GROUND refusals only
const retired = new Set();           // rungs with no candidates left
let placed = [];                     // my own placements {id,x,z}
let seamBlock = { id: null, left: 0 };
let shuttle = 0;

const key = (p) => `${p.x},${p.z}`;
const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return '\n';                 // silence banks the default, cannot be rejected
  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const hero = { x: now.hero.x, z: now.hero.z };
  const hp = now.hero.hp / Math.max(1, now.hero.maxHp);
  const entries = now.works?.entries ?? [];
  const byKind = now.works?.byKind ?? {};
  const cr = now.air?.crossing ?? {};
  const suit = now.air?.suit ?? {};
  const costsOf = {};
  for (const b of view.stablePrefix.mechanics.buildables ?? []) costsOf[b.id] = b;

  const orders = [];

  // 1. draft — plating, then heal, then damage.
  const offer = now.pendingOffer;
  if (Array.isArray(offer) && offer.length) {
    const score = (o) => {
      const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
      if (/plating|armor|armour|max hp|maxhp|vigor|hardy/.test(s)) return 100;
      if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
      if (/spark|damage|tap|coil|rate|pierce/.test(s)) return 50;
      return 10;
    };
    orders.push({ verb: 'PICK_UPGRADE', id: [...offer].sort((a, b) => score(b) - score(a))[0].id });
  }

  // 2. free supplementary blast, aimed outward so an orbital return re-enters past the fort.
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: hero.x, z: hero.z + 6 } });

  // 3. the era gate: one crossing entry per 120s window, alternating decks so both are `reached`.
  const credited = cr.credited ?? 0, need = cr.required ?? 0;
  const sortieDue = !cr.complete && credited < need && (cr.creditedThisWindow ?? 0) === 0;
  const lowAir = !suit.inDome && (suit.seconds ?? 60) < 22;
  if (sortieDue && !lowAir) {
    orders.push({ verb: 'MOVE_HERO', pos: credited % 2 === 0 ? WEST : EAST });
    orders.push({ verb: 'MOVE_HERO', pos: HOME_A });
  } else if (Math.abs(hero.x) > 15 || Math.abs(hero.z) > 12 || lowAir) {
    orders.push({ verb: 'MOVE_HERO', pos: HOME_A });      // come home / find air
  }

  // 4. one affordable ladder rung, priced at its live instance, gated by the bank plan.
  const stocks = entries.filter((e) => e.id === 'stockpile' && !e.wrecked).length;
  const cap = CAP_BASE + CAP_PER_STOCK * stocks;
  const panned = now.score?.goldPanned ?? 0;
  const rate = t > 40 ? Math.max(0.6, (panned / t) * 0.9) : 2.0;   // biased low = protective
  const urgent = hp < 0.55;
  const coreLeft = RUNGS.some(([id, n]) => (byKind[id] ?? 0) < n && !retired.has(`${id}:${n}`));
  const mayBuild = urgent || t < BUILD_FLOOR_T;

  if (mayBuild) {
    let rung = null;
    for (const [id, n] of RUNGS) {
      if (retired.has(`${id}:${n}`)) continue;
      if ((byKind[id] ?? 0) >= n) continue;
      rung = [id, n]; break;
    }
    let id = null, spots = null;
    if (rung) { id = rung[0]; spots = LADDER.find((l) => l[0] === id)[1]; }
    else if (!coreLeft) { id = 'palisade'; spots = PALI; }

    if (id) {
      const standing = byKind[id] ?? 0;
      const curve = costsOf[id]?.costs ?? [10];
      const cost = curve[Math.min(standing, curve.length - 1)] ?? curve[curve.length - 1];
      const taken = new Set(entries.map((e) => `${Math.round(e.position?.x ?? e.x)},${Math.round(e.position?.z ?? e.z)}`));
      const spot = spots.find((p) => !badSpot.has(key(p)) && !taken.has(`${Math.round(p.x)},${Math.round(p.z)}`)
        && !placed.some((q) => q.x === p.x && q.z === p.z));
      if (!spot && rung) retired.add(`${id}:${rung[1]}`);
      // the bank plan: spend while the core is owed or we are hurt; otherwise only if the purse
      // can still refill to its live cap before the secure tick.
      const affordable = gold >= cost;
      const banksOk = urgent || coreLeft || ((gold - cost) + rate * (SECURE_T - t) >= cap + 10);
      if (spot && affordable && banksOk) {
        orders.push({ verb: 'BUILD', what: id, where: spot, when: { goldGte: cost } });
        placed.push({ id, x: spot.x, z: spot.z });
      }
    }
  }

  // 5. the tail: alternate a short hero leg (free-fall never coasts) with a harvest block.
  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const ranked = live.slice().sort((a, b) => d2(a, hero) - d2(b, hero));
  const near = ranked.filter((s) => d2(s, hero) <= 28);
  const pool = near.length ? near : ranked;
  if (!pool.some((s) => s.id === seamBlock.id) || seamBlock.left <= 0) {
    seamBlock = { id: pool[0]?.id ?? 'gold-seam-2', left: 6 };
  }
  const chain = [];
  if (pool.length) {
    let i = pool.findIndex((s) => s.id === seamBlock.id); if (i < 0) i = 0;
    for (let k = 0; k < 4; k += 1) chain.push(pool[(i + (k < 2 ? 0 : k - 1)) % pool.length].id);
  } else chain.push('gold-seam-2');
  seamBlock.left -= 1;

  const away = d2(hero, HOME_A);
  let c = 0;
  while (orders.length < 32) {
    // A single-target correction only: alternating targets resonate in free fall, and an always
    // active MOVE_HERO owns every tick, which is what starved tune-1's economy.
    if ((c === 0 && away > 1.2) || (c === 6) || (c === 14)) {
      orders.push({ verb: 'MOVE_HERO', pos: HOME_A });
      if (orders.length >= 32) break;
    }
    orders.push({ verb: 'HARVEST', seam: chain[c % chain.length] });
    c += 1;
  }

  // learn from refusals: GROUND poisons a coordinate, ECONOMY poisons nothing.
  for (const rec of now.orders ?? []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order ?? {};
    const r = String(rec.reason ?? '');
    if (o.verb === 'BUILD' && o.where && /out_of_zone|collision|UNREACHABLE|terrain|cap_reached|out_of_reach/i.test(r)) {
      badSpot.add(key(o.where));
      placed = placed.filter((q) => !(q.x === o.where.x && q.z === o.where.z));
    }
  }
  return JSON.stringify(orders.slice(0, 32)) + '\n';
}
