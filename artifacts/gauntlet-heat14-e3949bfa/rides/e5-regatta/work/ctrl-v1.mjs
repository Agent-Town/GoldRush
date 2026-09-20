// gen 116 — e5-regatta controller v1.
//
// THE MAP, verified from source before the first order:
//   RegattaRaceSystem.advance(at, wave, [heroPosition(), boat.anchor]) — TWO racers, and
//   heroPosition() is bound to `this.hero.group.position` (HeadlessContractSim:1327). The hero
//   is the racer now; ADR-005 retired the MOVE_TO that generation 20 used on the Prospector.
//   HeadlessContractSim:1466 ANDs `race.finished === true` into autoSecureWaveForRun, so no wave
//   secures until the course is done, and RegattaRaceSystem:40 FREEZES the course at
//   wave >= secureWave (12, t = 272) — the race is a deadline, not a chore.
//   Gate order: beacons[] then the heroStart stake. The boat anchor never leaves (-49,0), which
//   is gate 0 (r3, passed for free at t<=8, measured on the idle probe) AND the final gate
//   (the stake carries no radius, so DEFAULT_GATE_RADIUS 6). So the hero must physically visit
//   exactly four points and the return leg is free.
//
// THE ECONOMY: waves pinned at 12 and timeAlive pinned at 272.000 by twist.secureWave, so gold
//   is the ONLY free ranking axis. bankCap 200 + 150 per standing stockpile (maxCount 2) = 500.
//   Roster is one id, corsair_racer, with NO thief and NO wrecker flag, so a stockpile is +90 net
//   and cannot be taken (gen 106's thief-roster trap does not apply here). Terrain.sample returns
//   walkable/bank everywhere because tileParams.river is false, so the deck rect IS buildable.

const GATES = [
  { id: 'start-beacon', x: -49, z: 0 },
  { id: 'northwest-checkpoint', x: -28, z: 38 },
  { id: 'midcourse-checkpoint', x: 0, z: 18 },
  { id: 'northeast-checkpoint', x: 28, z: 38 },
  { id: 'finish-beacon', x: 49, z: 0 },
];
const HOME = { x: -49, z: 0 };

const SECURE_T = 272;
const BUILD_STOP_T = 236;      // nothing bought after this can pay itself back; let the purse refill
const SLUICE_STOP_T = 140;     // a sluice is ~0.6 g/s; below ~70s of runway it is a net loss

// ONE ladder, ONE ordinal per id (gen 110). Cap-raisers first: they are the ranked axis.
const LADDER = [
  { id: 'stockpile', spots: [[-53, 2], [-51, 2], [-53, -2], [-51, -2], [-49, 3], [-49, -3], [-52, 2], [-52, -2]] },
  { id: 'stockpile', spots: [[-45, 2], [-47, 2], [-45, -2], [-47, -2], [-46, 2], [-46, -2], [-48, 3], [-48, -3]] },
  { id: 'sluice', spots: [[-53, 0], [-45, 0], [-51, 0], [-47, 0], [-52, 3], [-46, -3], [-50, 4], [-48, -4]] },
  { id: 'sluice', spots: [[-45, 4], [-53, 4], [-45, -4], [-53, -4], [-50, -4], [-48, 4], [-44, 1], [-54, 1]] },
  { id: 'sluice', spots: [[-44, -1], [-54, -1], [-44, 3], [-54, 3], [-44, -3], [-54, -3], [-50, 2], [-48, -2]] },
];

const badSpot = new Set();     // GROUND refusals only
const retired = new Set();     // ladder rungs with no candidates left
let boatDone = false;
let lastPlan = '';

function key(id, s) { return `${id}@${s[0]},${s[1]}`; }

function readRefusals(now) {
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || rec.status !== 'failed') continue;
    const why = String(rec.reason || rec.detail || '').toLowerCase();
    if (why.includes('insufficient_gold')) continue;         // ECONOMY: retry, poison nothing
    if (o.where) badSpot.add(key(o.what, [o.where.x, o.where.z]));
  }
}

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  if (/plating|armor|armour|max hp|maxhp|vitality|tough/.test(s)) return 100;
  if (/heal|regen|mend|dressing|recover/.test(s)) return 80;
  if (/damage|spark|coil|tap|power/.test(s)) return 40;
  return 10;
}

export default function controller(view, i) {
  const now = view.now;
  const orders = [];

  // pendingSecure: answer with SILENCE. It takes the configured `bank` default, it cannot be
  // REJECTED (a refused in-window array is invisible to the tape and visible to the sim, which
  // is what desynchronised generation 84's replay), and it costs no call.
  if (now.pendingSecure) return null;

  readRefusals(now);

  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const dw = now.deepwater || {};
  const race = dw.race || {};
  const byKind = now.works?.byKind || {};
  const costs = {};
  for (const b of view.stablePrefix.mechanics?.buildables || []) costs[b.id] = b.costs || [];

  // 1. draft first, under replace semantics
  if (now.pendingOffer?.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. the free levers, once. BOAT_BUILD costs no gold and has no range check; DeepwaterArsenal
  //    reads exactly two ids, and writes deckPositions[buildingId], so a second `turret` MOVES
  //    the ballista rather than adding one (gen 20).
  if (!boatDone) {
    const occupied = new Set((dw.pads || []).filter((p) => p.occupied).map((p) => p.id));
    if (!occupied.has('bow')) orders.push({ verb: 'BOAT_BUILD', padId: 'bow', buildingId: 'turret' });
    if (!occupied.has('port')) orders.push({ verb: 'BOAT_BUILD', padId: 'port', buildingId: 'sentry_beacon' });
    if (occupied.has('bow') && occupied.has('port')) boatDone = true;
  }

  // 3. THE RACE. A MOVE_HERO worklist self-sequences: each record blocks the tick while walking,
  //    goes `done` on arrival and hands the tick to the next, so one array drives the whole course
  //    unattended. Derive the remaining legs from the VIEW's own nextGate, not from my clock.
  const racing = race.finished !== true;
  if (racing) {
    const next = race.nextGate?.id ?? 'start-beacon';
    let from = GATES.findIndex((g) => g.id === next);
    if (from < 0) from = 0;
    // gate 0 is the boat's own anchor and is passed for free; never walk to it.
    for (const g of GATES.slice(Math.max(from, 1))) orders.push({ verb: 'MOVE_HERO', pos: { x: g.x, z: g.z } });
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  } else if (Math.hypot((now.hero?.x ?? 0) - HOME.x, (now.hero?.z ?? 0) - HOME.z) > 1.2) {
    // come home ABOVE the tail so it completes and falls through (gen 65); the unemployed
    // Prospector drifts to the hero, so the hero's post IS the economy's post.
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  }

  // 4. ONE ladder rung, priced at its live instance, emitted only when already affordable.
  const seen = {};
  const liveCap = 200 + 150 * (byKind.stockpile || 0);
  for (let r = 0; r < LADDER.length; r += 1) {
    if (retired.has(r)) continue;
    const rung = LADDER[r];
    seen[rung.id] = (seen[rung.id] || 0) + 1;
    const standing = byKind[rung.id] || 0;
    if (standing >= seen[rung.id]) continue;               // already satisfied by a standing work
    if (!racing || rung.id === 'stockpile') {
      const price = costs[rung.id]?.[standing] ?? 999;
      const spot = rung.spots.find((s) => !badSpot.has(key(rung.id, s)));
      if (!spot) { retired.add(r); continue; }             // gen 81: RETIRE, never stall the rungs behind
      const cutoff = rung.id === 'sluice' ? SLUICE_STOP_T : BUILD_STOP_T;
      if (t < cutoff && gold >= price) {
        orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: price } });
      }
    }
    break;                                                  // one rung in flight at a time
  }

  // 5. the tail. An inactive seam publishes x/z/anchorIndex as null and ONE non-finite number
  //    refuses the whole array silently, so filter finiteness before any sort.
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => Math.hypot(a.x - HOME.x, a.z - HOME.z) - Math.hypot(b.x - HOME.x, b.z - HOME.z));
  const room = 32 - orders.length;
  if (live.length) {
    // seams here sit 3-6 units apart at the boat, so chaining costs nothing; blocks of six drain
    // one before walking to the next, and the whole tail refills every submission.
    for (let k = 0; k < room; k += 1) {
      const s = live[Math.floor(k / 6) % live.length];
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
  } else {
    // A filter that can return empty is a wipe generator: keep the worker parked at the boat.
    for (let k = 0; k < Math.min(room, 4); k += 1) orders.push({ verb: 'MOVE_HERO', pos: HOME });
  }

  // reel hygiene: a draining worklist must be resubmitted, so only blank-line a view whose plan
  // signature is unchanged AND whose tail is not the thing that drained.
  const sig = JSON.stringify(orders.map((o) => o.verb + (o.what || '') + (o.padId || '') + (o.id || '')));
  const quiet = sig === lastPlan && !now.pendingOffer?.length && i > 0 && orders.length < 8;
  lastPlan = sig;
  if (quiet) return null;
  return orders.slice(0, 32);
}
