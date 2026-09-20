// e9-dome-basin controller v2 — two-sided bait, ECONOMY FIXED.
//
// v1 measured the bait working (hero flat at 119/175 from t=175 to t=377 under 30-44 live
// threats) and the PURSE frozen: goldPanned 480 in 440 s = 1.09 g/s, with flat stretches of
// 42, 44 and 56 seconds. Cause: two REPAIR_UNDER orders fired in every array from wave 4 on
// (works are wrecked early and stay wrecked), and REPAIR_UNDER travels — so the Prospector
// spent the run walking 19 wu and 67 wu between rim pads to mend instead of panning. Only
// 180 gold of ladder ever landed.
//
// v2 changes exactly one thing in substance: THE PROSPECTOR'S FEET.
//   - REPAIR_UNDER removed outright. Mending is cheap in gold and ruinous in feet here;
//     a fresh work on a fresh candidate costs the same trip and arrives at full HP.
//   - The ladder is EAST-heavy (east pad is 33 wu from the seam cluster, west is 63) and
//     west is bought as one batched trip, so the long commute is paid once.
//   - Palisade bait mass is the surplus sink, bought east where the trip is short.
// Plus a reel-budget fix that is not a strategy change: v1 spent 538 KB of a 576 KB ceiling
// by wave 14 across 151 entries (172 views, one every 2.6 s — order-failure surprises).
// v2 paces submissions against a 140-entry budget and blank-lines the rest.

const CLAIM = { x: 0, z: 12 };

const EAST = [[28,8],[32,8],[28,4],[36,8],[32,4],[40,8],[28,0],[36,4],[40,4],[28,-4],[32,0],[40,0]];
const WEST = [[-28,6],[-32,6],[-28,2],[-36,6],[-32,2],[-40,6],[-28,-2],[-36,2],[-40,2],[-28,-6]];

// East first and often: 33 wu from the money. West is one batched pair, paid once.
const LADDER = [
  { what:'turret',        side:'E', cost:50  },
  { what:'sentry_beacon', side:'E', cost:25  },
  { what:'turret',        side:'E', cost:70  },
  { what:'sentry_beacon', side:'E', cost:35  },
  { what:'turret',        side:'W', cost:95  },
  { what:'sentry_beacon', side:'W', cost:45  },
  { what:'sentry_beacon', side:'W', cost:55  },
  { what:'turret',        side:'E', cost:125 },
  { what:'sentry_beacon', side:'E', cost:75  },
  { what:'sentry_beacon', side:'E', cost:95  },
];
const PAL = [];
for (let i = 0; i < 20; i++) PAL.push({ what:'palisade', side: (i % 3 === 2) ? 'W' : 'E', cost: 10 });

const badSpot = new Set();
let submissions = 0;
let lastSubT = -99;
let lastSig = '';
const ENTRY_BUDGET = 138;      // ~2.5 KB/entry against a 576,176 B ceiling
const RUN_SECONDS = 600;

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = (w, x, z) => `${w}@${x},${z}`;

function scoreUpgrade(o) {
  const s = ((o.id||'') + ' ' + (o.name||'') + ' ' + (o.effectText||'')).toLowerCase();
  let v = 0;
  if (/plating|armou?r|max hp|maxhp|health|vital|tough|hearty/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 90;
  if (/damage|spark|tap|coil|power|volley|pierce/.test(s)) v += 40;
  if (/rate|speed|fire|reload|cool/.test(s)) v += 30;
  if (/gold|luck|pan|seam|prospect/.test(s)) v += 5;
  return v;
}

export function decide(view) {
  const now = view.now;
  if (now.pendingSecure) return null;               // blank line banks it, free, no entry

  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const entries = now.works?.entries ?? [];

  // GROUND refusals only — never poison a coordinate on insufficient_gold (gen 51).
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status !== 'failed' || o.verb !== 'BUILD' || !o.where) continue;
    const why = String(rec.reason || rec.detail || '');
    if (/insufficient_gold/i.test(why)) continue;
    if (/out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i.test(why))
      badSpot.add(key(o.what, o.where.x, o.where.z));
  }

  const taken = new Set();
  for (const e of entries) {
    const p = e.position || e;
    if (p && Number.isFinite(p.x)) taken.add(`${Math.round(p.x)},${Math.round(p.z)}`);
  }
  const built = {};
  for (const e of entries) built[e.id] = (built[e.id] || 0) + 1;

  // --- plan the build batch: next unbuilt rung + following rungs on the SAME side,
  //     cumulatively gated, so one commute lands the whole affordable batch.
  const plan = [...LADDER, ...PAL];
  const want = { turret: 0, sentry_beacon: 0, palisade: 0 };
  let nextIdx = -1;
  for (let i = 0; i < plan.length; i++) {
    want[plan[i].what]++;
    if ((built[plan[i].what] || 0) < want[plan[i].what]) { nextIdx = i; break; }
  }
  const builds = [];
  if (nextIdx >= 0) {
    const side = plan[nextIdx].side;
    const localTaken = new Set(taken);
    let cum = 0, placed = 0;
    for (let i = nextIdx; i < plan.length && placed < 5; i++) {
      if (plan[i].side !== side) continue;
      cum += plan[i].cost;
      if (cum > gold) break;
      const list = side === 'E' ? EAST : WEST;
      let spot = null;
      for (const [x, z] of list) {
        if (localTaken.has(`${x},${z}`)) continue;
        if (badSpot.has(key(plan[i].what, x, z))) continue;
        spot = { x, z }; break;
      }
      if (!spot) break;
      localTaken.add(`${spot.x},${spot.z}`);
      builds.push({ verb:'BUILD', what: plan[i].what, where: spot, when:{ goldGte: cum } });
      placed++;
    }
  }

  // --- reel-budget pacing: hold a floor on the gap between submissions so a 20-wave ride
  //     fits the byte ceiling. Drafts always answer; a newly affordable batch always ships.
  const sig = builds.map(b => `${b.what}${b.where.x},${b.where.z}`).join('|');
  const left = Math.max(1, ENTRY_BUDGET - submissions);
  const minGap = Math.max(4, (RUN_SECONDS - t) / left);
  const mustAnswer = !!now.pendingOffer?.length;
  const planChanged = sig !== '' && sig !== lastSig;
  if (!mustAnswer && !planChanged && (t - lastSubT) < minGap) return null;
  if (!mustAnswer && submissions >= ENTRY_BUDGET) return null;

  const orders = [];
  if (now.pendingOffer?.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb:'BLAST_AT', pos:{ ...CLAIM } });
  for (const b of builds) orders.push(b);

  // capped-purse sink once both ladders are full: turret tier. CONTEXT_ACTION does not travel.
  if ((built.turret||0) >= 4 && (built.sentry_beacon||0) >= 6 && gold >= 150) {
    const tu = entries.find(e => e.id === 'turret' && !e.wrecked && (e.tier == null || e.tier < 2));
    if (tu && tu.position) {
      orders.push({ verb:'MOVE_TO', pos:{ x: tu.position.x, z: tu.position.z } });
      orders.push({ verb:'CONTEXT_ACTION', action:'upgrade', target:{ id:'turret', index: tu.index } });
    }
  }

  // The tail: drain the nearest live seam in a block before walking. Never filtered to
  // empty; the failures are free where the Prospector already stands and they buy views.
  const pro = now.prospector || CLAIM;
  const all = now.seams || [];
  const live = all.filter(s => s.active && Number.isFinite(s.x)).sort((a,b)=>d(pro,a)-d(pro,b));
  const chain = live.length ? live : all;
  const slots = Math.max(0, 22 - orders.length);
  for (let i = 0; i < slots; i++) orders.push({ verb:'HARVEST', seam: chain[Math.floor(i/7) % chain.length].id });
  if (orders.length === 0) orders.push({ verb:'HOLD', pos:{ ...CLAIM } });

  submissions++; lastSubT = t; lastSig = sig;
  return orders.slice(0, 32);
}
