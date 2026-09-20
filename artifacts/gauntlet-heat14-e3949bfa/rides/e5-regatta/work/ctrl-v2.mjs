// gen 116 — e5-regatta controller v2.
//
// v1's whole race refused UNREACHABLE_TERRAIN, and the terrain probe named the cause: the beacon
// CENTRES (and the Claim-Boat's own mooring at (-49,0), (-49,-1), (-48,-1)) are landmark
// blockers, while (-47,-1) and the entire z=0 lane walk fine. A gate is a RADIUS, not a point:
// RegattaRaceSystem:43 passes on `hypot(x-gate.x, z-gate.z) <= radius`, and every beacon declares
// radius 3. So aim 2.2 units OFF each beacon — inside the gate, outside the buoy's footprint —
// and carry a second bearing per gate so one refusal yields the tick to the next (gen 72).
//
// No BUILD anywhere: tileParams.waterSources is one spring_pond at (0,0) r64, so Terrain.sample
// returns zone 'shallows' for the whole map, and Terrain.isBuildable:244 demands zone === 'bank'.
// Measured in v1: every BUILD answered "outside buildable terrain". `stockpile` is on the roster
// at 60g x2 with +150 cap each and cannot be placed, so 200 is this contract's arithmetic gold
// CEILING, not a margin I am leaving behind. v1 reached it at t = 59.5 with 3.3 g/s to spare.

const GATES = [
  { id: 'start-beacon', legs: [] },                                   // the boat's own anchor sits in it: free
  { id: 'northwest-checkpoint', legs: [[-28, 35.8], [-30.2, 38], [-25.8, 38], [-28, 40.2]] },
  { id: 'midcourse-checkpoint', legs: [[0, 15.8], [2.2, 18], [-2.2, 18], [0, 20.2]] },
  { id: 'northeast-checkpoint', legs: [[28, 35.8], [30.2, 38], [25.8, 38], [28, 40.2]] },
  { id: 'finish-beacon', legs: [[46.8, 0], [49, 2.2], [49, -2.2], [51.2, 0]] },
];
const HOME = { x: -46, z: 0 };   // (-47,-1) measured walkable; (-48,-1) and (-49,0) are the mooring

let boatDone = false;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  if (/plating|armor|armour|max hp|maxhp|vitality|tough/.test(s)) return 100;
  if (/heal|regen|mend|dressing|recover/.test(s)) return 80;
  if (/damage|spark|coil|tap|power/.test(s)) return 40;
  return 10;
}

export default function controller(view) {
  const now = view.now;
  // Silence at the secure boundary: it takes the configured `bank` default, it cannot be REJECTED
  // (a refused in-window array is invisible to the tape and visible to the sim, which is what
  // desynchronised generation 84's replay), and it costs one call.
  if (now.pendingSecure) return null;

  const orders = [];
  const dw = now.deepwater || {};
  const race = dw.race || {};

  if (now.pendingOffer?.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Free levers first: BOAT_BUILD costs no gold and has no range check, and DeepwaterArsenal
  // reads exactly two ids (turret -> harpoon ballista r14, sentry_beacon -> depth-charge rack).
  if (!boatDone) {
    const occupied = new Set((dw.pads || []).filter((p) => p.occupied).map((p) => p.id));
    if (!occupied.has('bow')) orders.push({ verb: 'BOAT_BUILD', padId: 'bow', buildingId: 'turret' });
    if (!occupied.has('port')) orders.push({ verb: 'BOAT_BUILD', padId: 'port', buildingId: 'sentry_beacon' });
    if (occupied.has('bow') && occupied.has('port')) boatDone = true;
  }

  // THE RACE. Read the remaining course off the view's own nextGate, never off my clock. Each
  // MOVE_HERO blocks the tick while walking, goes `done` on arrival and hands the tick to the
  // next, so one array drives the whole unattended journey; an unwalkable leg fails in a single
  // tick and yields to its alternate bearing.
  const racing = race.finished !== true;
  if (racing) {
    const nextId = race.nextGate?.id ?? 'start-beacon';
    let from = GATES.findIndex((g) => g.id === nextId);
    if (from < 0) from = 1;
    for (const g of GATES.slice(Math.max(from, 1))) {
      for (const [x, z] of g.legs) orders.push({ verb: 'MOVE_HERO', pos: { x, z } });
    }
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  } else if (Math.hypot((now.hero?.x ?? 0) - HOME.x, (now.hero?.z ?? 0) - HOME.z) > 1.5) {
    // Come home ABOVE the tail so it completes and falls through. The unemployed Prospector
    // drifts to the hero, so the hero's post is also the economy's post.
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  }

  // The tail. An inactive seam publishes x/z/anchorIndex as null and one non-finite number
  // refuses the whole array silently, so filter finiteness before any sort. All three live
  // anchors sit within ~6 units of the boat, so chaining across them costs nothing.
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => Math.hypot(a.x - HOME.x, a.z - HOME.z) - Math.hypot(b.x - HOME.x, b.z - HOME.z));
  const room = Math.max(0, 32 - orders.length);
  for (let k = 0; k < room; k += 1) {
    if (live.length) orders.push({ verb: 'HARVEST', seam: live[Math.floor(k / 6) % live.length].id });
    else if (k < 2) orders.push({ verb: 'MOVE_HERO', pos: HOME });   // never let the array empty
    else break;
  }

  return orders.slice(0, 32);
}
