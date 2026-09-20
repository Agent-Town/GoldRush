// e9-dome-basin controller v1
// Map facts (read from the view + manifest):
//   claim/hero welded at (0,12). NO build zone within 28wu of it -> the hero cannot be
//   defended by structures. Enemies: feral_terraformer (wrecker, hp1.7, slow, targets the
//   NEAREST BUILDING) and claim_jump_prospect_drone (thief, fast, hp0.7).
//   All four gold seams sit INSIDE buildZone seed-rows-footing (x18..44, z-32..-18), 45wu
//   south-east of the claim. So one site is simultaneously: the economy, legal build ground,
//   and -- because wreckers seek the nearest building -- a bait that pulls every wrecker
//   45wu away from a hero that nothing else can protect.

const ZONE = { minX: 18, maxX: 44, minZ: -32, maxZ: -18 };

const TURRETS = [[20, -20], [28, -30], [36, -20], [42, -30], [24, -30], [32, -19], [40, -19], [19, -30]];
const BEACONS = [[24, -24], [32, -25], [40, -25], [20, -30], [28, -19], [36, -31], [43, -20], [22, -19]];
const PALIS = [[19, -19], [23, -19], [27, -19], [31, -19], [35, -19], [39, -19], [43, -19],
               [19, -23], [19, -27], [19, -31], [23, -31], [27, -31], [31, -31], [35, -31],
               [39, -31], [43, -23], [43, -27], [43, -31], [26, -24], [30, -22], [34, -24]];

// price-ordered ladder; the two opening palisades exist only to plant bait early.
const LADDER = [
  { kind: 'palisade', cost: 10 },
  { kind: 'turret', cost: 50 },
  { kind: 'turret', cost: 70 },
  { kind: 'palisade', cost: 10 },
  { kind: 'turret', cost: 95 },
  { kind: 'turret', cost: 125 },
  { kind: 'sentry_beacon', cost: 25 },
  { kind: 'sentry_beacon', cost: 35 },
  { kind: 'sentry_beacon', cost: 45 },
  { kind: 'sentry_beacon', cost: 55 },
  { kind: 'sentry_beacon', cost: 75 },
  { kind: 'sentry_beacon', cost: 95 },
];
for (let i = 0; i < 20; i++) LADDER.push({ kind: 'palisade', cost: 10 });

const CANDS = { turret: TURRETS, sentry_beacon: BEACONS, palisade: PALIS };

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let v = 0;
  if (/plating|health|hp|vitality|tough|armou?r|hardy/.test(s)) v += 100;
  if (/regen|heal|mend|recover/.test(s)) v += 90;
  if (/damage|spark|heavy|power|bolt/.test(s)) v += 40;
  if (/rate|coil|tap|speed|reload|cadence/.test(s)) v += 30;
  if (/range|reach/.test(s)) v += 20;
  if (/gold|pan|seam|coin|purse/.test(s)) v += 5;
  return v;
}

export function decide(view, ctx) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  if (!ctx.cursor) ctx.cursor = { turret: 0, sentry_beacon: 0, palisade: 0 };
  if (!ctx.lastCount) ctx.lastCount = {};

  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const occupied = new Set(entries.map(e => `${Math.round(e.position ? e.position.x : e.x)},${Math.round(e.position ? e.position.z : e.z)}`));

  // Advance a kind's candidate cursor when the previous view's emitted slot did not land.
  for (const k of Object.keys(ctx.cursor)) {
    const c = byKind[k] || 0;
    if (ctx.lastCount[k] !== undefined && ctx.emitted && ctx.emitted[k] && c <= ctx.lastCount[k]) {
      ctx.cursor[k] += 1;
    }
    ctx.lastCount[k] = c;
  }
  ctx.emitted = {};

  const orders = [];

  // 1. The draft owns the tick when it is live, and everything else is resent under it.
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Build ladder: only rungs affordable at PLAN time, cumulative, so one trip buys a batch
  //    and no cheap rung fires early on its own gate (gen-28 correction to suffix gating).
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0, palisade: byKind.palisade || 0 };
  const placed = { turret: 0, sentry_beacon: 0, palisade: 0 };
  let purse = now.gold;
  let cum = 0;
  const emit = [];
  for (const rung of LADDER) {
    const k = rung.kind;
    if (built[k] > 0) { built[k] -= 1; continue; }        // already standing, skip this rung
    if (cum + rung.cost > purse) break;                    // stop at the first unaffordable rung
    const cands = CANDS[k];
    let ci = ctx.cursor[k] + placed[k];
    while (ci < cands.length && occupied.has(`${cands[ci][0]},${cands[ci][1]}`)) ci++;
    if (ci >= cands.length) continue;
    cum += rung.cost;
    emit.push({ verb: 'BUILD', what: k, where: { x: cands[ci][0], z: cands[ci][1] }, when: { goldGte: cum } });
    placed[k] = (ci - ctx.cursor[k]) + 1;
    ctx.emitted[k] = true;
    if (emit.length >= 6) break;
  }
  orders.push(...emit);

  // 3. Everything left is panning. The Prospector is untargetable, lives in the fort pocket,
  //    and a HARVEST record is spent after one tick, so a stacked chain drains across the wave
  //    and its honest failures buy extra decision points.
  const live = (now.seams || []).filter(s => s.active && s.x !== null);
  const px = now.prospector.x, pz = now.prospector.z;
  live.sort((a, b) => ((a.x - px) ** 2 + (a.z - pz) ** 2) - ((b.x - px) ** 2 + (b.z - pz) ** 2));
  const slots = 32 - orders.length;
  for (let i = 0; i < slots && live.length; i++) {
    orders.push({ verb: 'HARVEST', seam: live[Math.floor(i / 6) % live.length].id });
  }
  if (orders.length < 32) orders.push({ verb: 'HOLD', pos: { x: 30, z: -25 } });
  return orders.slice(0, 32);
}
