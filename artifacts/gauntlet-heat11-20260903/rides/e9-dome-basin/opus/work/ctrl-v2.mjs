// e9-dome-basin controller v2
// v1 measured the map's real shape: the seam pocket (x18..44, z-32..-18) is a perfect ECONOMY
// (540 gold panned by t=160, ~3.4 g/s) and a WORTHLESS fort -- works.wrecked stayed 0 for the
// whole run, because the claim at (0,12) is itself a building and is nearer to every spawn edge
// than anything I can build 45wu away. So the fort has to sit ON the approach lanes instead.
//
// Enemies enter from north, west and east and converge on (0,12).
//   east lane: the segment (64,0)->(0,12) passes x=28 at z~6.5
//   west lane: the segment (-64,0)->(0,12) passes x=-35 at z~5.5
// rim-dome-pad-east (x28..42, z-6..8) and rim-dome-pad-west (x-42..-28, z-8..6) sit exactly on
// those two lanes. A turret there (range 16) covers the lane, AND a building there is nearer
// than the claim to a west/east spawn, so it also baits those wreckers off the hero.
// The north lane has no build ground anywhere; the hero's own rig answers that third.

const EAST = [[28, 6], [28, 0], [28, -5], [33, 7], [33, -5], [38, 6], [38, 0], [42, -5], [42, 7], [35, 1], [38, -5], [42, 1]];
const WEST = [[-28, 4], [-28, -2], [-28, -7], [-33, 5], [-33, -7], [-38, 4], [-38, -2], [-42, -7], [-42, 5], [-35, -1], [-38, -7], [-42, 1]];

// price-ordered, alternating sides so both lanes arm together and neither wrecker stream is
// left with the claim as its nearest building.
const LADDER = [
  { kind: 'turret', cost: 50, side: 'E' },
  { kind: 'turret', cost: 70, side: 'W' },
  { kind: 'palisade', cost: 10, side: 'E' },
  { kind: 'palisade', cost: 10, side: 'W' },
  { kind: 'turret', cost: 95, side: 'E' },
  { kind: 'turret', cost: 125, side: 'W' },
  { kind: 'sentry_beacon', cost: 25, side: 'E' },
  { kind: 'sentry_beacon', cost: 35, side: 'W' },
  { kind: 'sentry_beacon', cost: 45, side: 'E' },
  { kind: 'sentry_beacon', cost: 55, side: 'W' },
  { kind: 'sentry_beacon', cost: 75, side: 'E' },
  { kind: 'sentry_beacon', cost: 95, side: 'W' },
];
for (let i = 0; i < 16; i++) LADDER.push({ kind: 'palisade', cost: 10, side: i % 2 ? 'W' : 'E' });

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let v = 0;
  if (/plating|health|hp|vitality|tough|armou?r|hardy/.test(s)) v += 100;
  if (/regen|heal|mend|recover/.test(s)) v += 90;
  if (/damage|spark|heavy|powder|charge|split|wide|ring/.test(s)) v += 40;
  if (/rate|coil|tap|reload|cadence/.test(s)) v += 35;
  if (/range|reach|resonator|barrel/.test(s)) v += 20;
  if (/gold|pan|seam|coin|purse|luck/.test(s)) v += 2;
  return v;
}

export function decide(view, ctx) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  if (!ctx.cur) ctx.cur = { E: 0, W: 0 };
  if (!ctx.lastTotal) ctx.lastTotal = -1;

  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const total = entries.length;
  const occ = new Set(entries.map(e => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));

  // Slot skipper: if nothing new landed since the last view that emitted builds, the head
  // candidate on each side is refusing silently -- step past it rather than park forever.
  if (ctx.emitted && total <= ctx.lastTotal) { ctx.cur.E += 1; ctx.cur.W += 1; }
  ctx.lastTotal = total;
  ctx.emitted = false;

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Only rungs affordable at PLAN time, cumulative: one dispatch buys a batch, and no cheap
  // rung can fire early on a gate of its own.
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0, palisade: byKind.palisade || 0 };
  const used = { E: 0, W: 0 };
  let cum = 0;
  for (const rung of LADDER) {
    if (built[rung.kind] > 0) { built[rung.kind] -= 1; continue; }
    if (cum + rung.cost > now.gold) break;
    const list = rung.side === 'E' ? EAST : WEST;
    let ci = ctx.cur[rung.side] + used[rung.side];
    while (ci < list.length && occ.has(`${list[ci][0]},${list[ci][1]}`)) ci++;
    if (ci >= list.length) continue;
    cum += rung.cost;
    orders.push({ verb: 'BUILD', what: rung.kind, where: { x: list[ci][0], z: list[ci][1] }, when: { goldGte: cum } });
    used[rung.side] = (ci - ctx.cur[rung.side]) + 1;
    ctx.emitted = true;
    if (orders.length >= 7) break;
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: 50 });

  // Panning fills the rest. The Prospector is untargetable and the four seams share one pocket,
  // so a stacked chain drains across the wave and its honest failures buy decision points.
  const live = (now.seams || []).filter(s => s.active && s.x !== null);
  const px = now.prospector.x, pz = now.prospector.z;
  live.sort((a, b) => ((a.x - px) ** 2 + (a.z - pz) ** 2) - ((b.x - px) ** 2 + (b.z - pz) ** 2));
  const slots = 32 - orders.length;
  for (let i = 0; i < slots && live.length; i++) {
    orders.push({ verb: 'HARVEST', seam: live[Math.floor(i / 5) % live.length].id });
  }
  return orders.slice(0, 32);
}
