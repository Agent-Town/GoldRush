// gen 125 — e2-trestle. Skeleton (gen 6->124) + the one thing this board does differently.
//
// MAP FACTS (verified from contract JSON + Balance + probe):
//  riverBlocksEnemies:true, ONE ford x in [-3,3] => every north-bank spawn funnels onto the RAIL LINE.
//  five spawn gates: rail_tough (0,-46)&(0,46); steam_wrecker (46,20)&(-46,-20); coal_thief (0,46).
//  => south bank has exactly THREE corridors: the ford mouth (~0,-7), the rail from (0,-46), and due west.
//  A turret cluster at x=+-5, z in [-14,-20] covers ALL THREE and 30.4 units of the boss's rail per pass.
//  boss: railcar route 0 = straight x=0 from z-46..+46, railSpeed 1.9, pursuitRange 0, scale 3.2,
//        buildingDamageScale 7 -> keep works >=4 off x=0.  HP = 25.2*1.115^11*12.5*3.0 ~= 3130.
//        4 turrets * 57.2dps * (30.4/1.9)s = ~3660 per traverse; route reverses, so passes are unlimited.
//  TIMBER IS THE SHIELD: palisade 10g, 60hp +8/wave from w6, cap 5x -> 108hp at w12 = 10.8 hp/gold.
//        turret 50hp cap 3x -> 98hp at w12 for 50-125g.  Timber is 5-13x the hp per gold.

const HOME = { x: 4, z: -16 };      // in the mend sweep (<=10) of all four turret spots; 4 off the rail.
const SECURE_WAVE = 12;

// ---- ladder: strategy order, ONE ordinal per id ----
const T = [[5,-14],[-5,-14],[5,-20],[-5,-20],[6,-11],[-6,-11],[6,-23],[-6,-23],[8,-17],[-8,-17],[5,-26],[-5,-26]];
// bait lines. rot 1 = long axis along x (halfX 1.5) -> steps of 3 are airtight after avoidancePad.
const FORD = [[0,-9,1],[3,-9,1],[-3,-9,1],[6,-9,1],[-6,-9,1],[0,-11,1],[3,-11,1],[-3,-11,1],[9,-9,1],[-9,-9,1],[6,-11,1],[-6,-11,1]];
const WEST = [[-13,-18,0],[-13,-21,0],[-13,-15,0],[-16,-18,0],[-16,-21,0],[-16,-15,0],[-13,-24,0],[-16,-24,0],[-19,-18,0],[-19,-21,0],[-10,-18,0],[-10,-21,0]];
const SOUTH= [[0,-26,1],[3,-26,1],[-3,-26,1],[0,-28,1],[6,-26,1],[-6,-26,1],[9,-26,1],[-9,-26,1]];
const EAST = [[13,-18,0],[13,-21,0],[13,-15,0],[16,-18,0],[16,-21,0],[10,-14,0],[10,-24,0],[16,-15,0]];
const RING = [[2,-13,1],[-2,-13,1],[2,-19,1],[-2,-19,1],[8,-13,1],[-8,-13,1],[8,-19,1],[-8,-19,1]];

// rung = {id, spots}. emitted ONE at a time, priced at its live instance.
const LADDER = [
  { id:'palisade', spots: FORD },   // 1  - the ford mouth is where 11 wreckers land
  { id:'palisade', spots: FORD },   // 2
  { id:'palisade', spots: WEST },   // 3  - the west wrecker gate
  { id:'turret',   spots: T },      // 4
  { id:'palisade', spots: FORD },   // 5
  { id:'palisade', spots: WEST },   // 6
  { id:'turret',   spots: T },      // 7
  { id:'palisade', spots: FORD },   // 8
  { id:'palisade', spots: WEST },   // 9
  { id:'palisade', spots: SOUTH },  // 10
  { id:'turret',   spots: T },      // 11
  { id:'palisade', spots: RING },   // 12
  { id:'palisade', spots: FORD },   // 13
  { id:'palisade', spots: WEST },   // 14
  { id:'turret',   spots: T },      // 15
  ...Array.from({length: 30}, (_, i) => ({ id:'palisade', spots: [SOUTH, RING, EAST, FORD, WEST][i % 5] })),
];

const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach/i;
const banned = new Set();       // "id@x,z"  (GROUND refusals only; never insufficient_gold)
const placed = new Set();       // spots I have successfully occupied
const heroBad = new Set();
let heroIdx = 0;
const HERO_POSTS = [HOME, {x:5,z:-16}, {x:3,z:-17}, {x:6,z:-18}, {x:12,z:-18}];
let seamBlock = 0, seamIdx = 0;

function costOf(view, id, standing) {
  const b = (view.stablePrefix?.mechanics?.buildables || []).find(x => x.id === id);
  if (!b) return id === 'turret' ? 50 : 10;
  const c = b.costs;
  if (!Array.isArray(c) || !c.length) return b.cost ?? 10;
  if (standing < c.length) return c[standing];
  let v = c[c.length - 1];
  for (let i = c.length; i <= standing; i++) v = Math.ceil(v * 1.35 / 5) * 5;
  return v;
}
function maxOf(view, id) {
  const b = (view.stablePrefix?.mechanics?.buildables || []).find(x => x.id === id);
  return b?.maxCount ?? (id === 'turret' ? 4 : 48);
}

export default function controller(view) {
  const now = view.now || {};
  const orders = [];

  // --- secure boundary: SILENCE. cannot be rejected; takes the bank default. ---
  if (now.pendingSecure) return '';

  // --- draft first, under replace semantics ---
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const score = o => {
      const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
      if (/plating|max hp|maxhp|vitality|tough|armor|armour/.test(s)) return 100;
      if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
      if (/damage|spark|tap|coil|volley|fire rate|firerate/.test(s)) return 60;
      if (/range|blast/.test(s)) return 40;
      return 10;
    };
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // --- learn from refusals: GROUND poisons the coordinate, ECONOMY never does ---
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
      const reason = `${rec.reason || ''} ${rec.detail || ''}`;
      if (GROUND.test(reason)) banned.add(`${o.what}@${o.where.x},${o.where.z}`);
    }
    if (rec.status === 'done' && o.verb === 'BUILD' && o.where) placed.add(`${o.what}@${o.where.x},${o.where.z}`);
    if (rec.status === 'failed' && o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(`${rec.reason || ''}`)) {
      heroBad.add(`${o.pos.x},${o.pos.z}`);
    }
  }

  // --- free blast, ABOVE the traveller (returns {} either way, never owns the tick) ---
  if (now.blastReadyInMs === 0) {
    const hx = now.hero?.x ?? HOME.x, hz = now.hero?.z ?? HOME.z;
    // aim at the ford mouth if in reach, else just north of the hero (toward the crowd)
    let tx = 0, tz = -8;
    if (Math.hypot(tx - hx, tz - hz) > 9.2) { tx = hx; tz = hz + 6; }
    orders.push({ verb: 'BLAST_AT', pos: { x: +tx.toFixed(2), z: +tz.toFixed(2) } });
  }

  // --- hero post: emitted ONCE, dropped when parked, index advances only on a real refusal ---
  while (heroIdx < HERO_POSTS.length - 1 && heroBad.has(`${HERO_POSTS[heroIdx].x},${HERO_POSTS[heroIdx].z}`)) heroIdx++;
  const post = HERO_POSTS[heroIdx];
  const hd = Math.hypot((now.hero?.x ?? 0) - post.x, (now.hero?.z ?? 0) - post.z);
  if (hd > 0.9) orders.push({ verb: 'MOVE_HERO', pos: { x: post.x, z: post.z } });

  // --- mend: ungated. bounded to the rig radius round the Prospector since ADR-005, so it is free
  //     when there is nothing near and it is the ONLY thing that re-arms timber. ---
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // --- ONE ladder rung, priced at its live instance ---
  const byKind = now.works?.byKind || {};
  const seen = {};
  let rung = null, rungCost = 0;
  for (const r of LADDER) {
    seen[r.id] = (seen[r.id] || 0) + 1;
    const standing = byKind[r.id] || 0;
    if (standing >= seen[r.id]) continue;              // this ordinal already satisfied
    if (standing >= maxOf(view, r.id)) continue;       // roster cap
    const spot = r.spots.find(s => !banned.has(`${r.id}@${s[0]},${s[1]}`) && !placed.has(`${r.id}@${s[0]},${s[1]}`));
    if (!spot) continue;                               // RETIRE the rung, never stall behind it
    rungCost = costOf(view, r.id, standing);
    rung = { verb: 'BUILD', what: r.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: rungCost } };
    if (spot[2] !== undefined) rung.rotationSteps = spot[2];
    break;
  }
  // plan-time affordability: only emit what I can pay for right now (no commute for nothing)
  if (rung && (now.gold ?? 0) >= rungCost) orders.push(rung);

  // --- harvest tail: blocks of six on one live seam, Number.isFinite before any sort ---
  const live = (now.seams || []).filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z));
  const hx = now.hero?.x ?? HOME.x, hz = now.hero?.z ?? HOME.z;
  const ranked = live.map(s => ({ s, d: Math.hypot(s.x - hx, s.z - hz) })).sort((a, b) => a.d - b.d);
  const anchors = (view.stablePrefix?.map?.harvestAnchors || []).filter(a => Number.isFinite(a.x));
  if (ranked.length) {
    // alternate between the two nearest live seams in blocks of six
    seamBlock++;
    if (seamBlock > 6) { seamBlock = 1; seamIdx = (seamIdx + 1) % Math.min(2, ranked.length); }
    const primary = ranked[Math.min(seamIdx, ranked.length - 1)].s;
    const other = ranked.length > 1 ? ranked[(seamIdx + 1) % Math.min(2, ranked.length)].s : primary;
    const room = 31 - orders.length;
    for (let i = 0; i < room; i++) orders.push({ verb: 'HARVEST', seam: (i < 7 ? primary : other).id });
  } else if (anchors.length) {
    // no live seam: name the nearest ANCHOR's seam id anyway so the failing order parks the worker
    const any = (now.seams || [])[0];
    if (any) for (let i = orders.length; i < 24; i++) orders.push({ verb: 'HARVEST', seam: any.id });
  }

  return orders.slice(0, 32);
}
