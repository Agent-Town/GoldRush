// e3-moth-season controller v1 — gen-6..102 skeleton retargeted.
// Contract facts (read from contract JSON + view0):
//   claim/hero (0,12); secureWave 12 -> waves & timeAlive pinned; GOLD is the only free axis.
//   bankCap 200 + 150 per standing stockpile (max 2) => 500.
//   roster: no turret (powerGrid filter), no lantern_post. beacons 25/35/45/55/75/95 (max 6),
//           palisade 10 x48, stockpile 60 x2, decoy_shed 20 x3 (DECLINED: moths only damage decoys),
//           sluice x3 (no water on this map), assay_office 80.
//   connect: one sentry_beacon within 2.5 of pylon (0,-14) powers the gallery; ONE-WAY LATCH.
//   no thieves; fevered_saboteur (wrecker) from wave 4.

const CLAIM = { x: 0, z: 12 };
const SECURE_T = 360.0;
const BASE_CAP = 200;
const HARD_STOP_T = 300;      // no BUILD at all past this, no bypass (gen 85)
const FREE_SPEND_T = 150;     // below this the bank gate is not consulted

// ---- ladder: strategy order. id, list of candidate spots, count wanted ----
const RING = [
  { x: 0, z: 19 }, { x: -5, z: 16 }, { x: 5, z: 16 }, { x: -5, z: 8 }, { x: 5, z: 8 },
  { x: 0, z: 22 }, { x: -3, z: 20 }, { x: 3, z: 20 }, { x: -5, z: 12 }, { x: 5, z: 12 },
  { x: -3, z: 4 }, { x: 3, z: 4 }, { x: 0, z: 2 },
];
const PAL = [
  { x: 4, z: 12 }, { x: 3, z: 15 }, { x: 0, z: 16 }, { x: -3, z: 15 }, { x: -4, z: 12 },
  { x: -3, z: 9 }, { x: 0, z: 9 }, { x: 3, z: 9 },
  { x: 6, z: 14 }, { x: -6, z: 14 }, { x: 6, z: 10 }, { x: -6, z: 10 },
  { x: 2, z: 18 }, { x: -2, z: 18 }, { x: 6, z: 17 }, { x: -6, z: 17 },
  { x: 2, z: 21 }, { x: -2, z: 21 }, { x: 6, z: 7 }, { x: -6, z: 7 },
];
const STOCK = [{ x: -2, z: 12 }, { x: 2, z: 12 }, { x: -1, z: 14 }, { x: 1, z: 10 }, { x: -1, z: 10 }, { x: 1, z: 14 }];

// Core plan is 420 gold (4 beacons 160 + 2 stockpiles 120 + 14 palisades 140) against a 500 cap.
// Everything past it is CONTINGENCY: emergency rungs are reachable only through the pressure latch,
// so a comfortable run banks them and a hard run still has an answer (gen 98).
const E = true;
const LADDER = [
  { id: 'sentry_beacon', spots: [{ x: 0, z: -14 }, { x: 1, z: -14 }, { x: 0, z: -13 }, { x: -1, z: -14 }, { x: 0, z: -15 }], tag: 'objective' },
  { id: 'sentry_beacon', spots: RING },
  { id: 'sentry_beacon', spots: RING },
  { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL },
  { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL },
  { id: 'sentry_beacon', spots: RING },
  { id: 'stockpile', spots: STOCK }, { id: 'stockpile', spots: STOCK },
  { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL },
  { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL },
  { id: 'palisade', spots: PAL }, { id: 'palisade', spots: PAL },
  // --- contingency only past here ---
  { id: 'sentry_beacon', spots: RING, emergency: E },
  { id: 'palisade', spots: PAL, emergency: E }, { id: 'palisade', spots: PAL, emergency: E },
  { id: 'palisade', spots: PAL, emergency: E }, { id: 'palisade', spots: PAL, emergency: E },
  { id: 'sentry_beacon', spots: RING, emergency: E },
  { id: 'palisade', spots: PAL, emergency: E }, { id: 'palisade', spots: PAL, emergency: E },
  { id: 'palisade', spots: PAL, emergency: E }, { id: 'palisade', spots: PAL, emergency: E },
];

const GROUND_RE = /out_of_zone|collision|out_of_reach|cap_reached|UNREACHABLE|outside buildable|terrain/i;
const ECON_RE = /insufficient_gold/i;

const banned = new Set();       // "id@x,z" ground-refused
const retired = new Set();      // ladder indices with no candidates left
const key = (id, p) => `${id}@${p.x},${p.z}`;

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|health|vital|hardy|tough/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 70;
  if (/damage|spark|coil|tap|power|coil|bolt/.test(s)) v += 40;
  if (/rate|speed|fire|quick/.test(s)) v += 25;
  if (/range|reach/.test(s)) v += 15;
  if (/gold|pan|luck|prospector/.test(s)) v += 5;
  return v;
}

export default function ctrl(view) {
  const now = view.now;
  if (now.pendingSecure) return null;               // blank line: banks the default, cannot be rejected

  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const pan = now.score?.goldPanned ?? 0;
  const entries = now.works?.entries ?? [];
  const bl = view.stablePrefix?.mechanics?.buildables ?? [];
  const costsFor = id => (bl.find(b => b.id === id)?.costs) ?? [10];
  const maxFor = id => (bl.find(b => b.id === id)?.maxCount) ?? 99;

  // --- harvest refusal / ground blacklist from the view's own order records ---
  for (const rec of (now.orders ?? [])) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD') continue;
    const reason = `${rec.status ?? ''} ${rec.reason ?? ''} ${rec.detail ?? ''}`;
    if (rec.status === 'failed' && GROUND_RE.test(reason) && !ECON_RE.test(reason) && o.where) {
      banned.add(key(o.what, o.where));
    }
  }

  // --- live cap from UNWRECKED stockpiles (gen 82: a wrecked cap-raiser is an economy kill switch) ---
  const stockStanding = entries.filter(e => e.id === 'stockpile' && !e.wrecked).length;
  const cap = BASE_CAP + 150 * stockStanding;

  // --- counts of what I have built, per id (only lantern_post is pre-placed here) ---
  const built = {};
  for (const e of entries) { if (e.id !== 'lantern_post') built[e.id] = (built[e.id] ?? 0) + 1; }

  // --- pick the head unsatisfied rung (ordinal accounting) ---
  const seen = {};
  let rung = null, rungIdx = -1;
  for (let i = 0; i < LADDER.length; i++) {
    const r = LADDER[i];
    seen[r.id] = (seen[r.id] ?? 0) + 1;            // this is the seen[r.id]-th rung of that id
    if (retired.has(i)) continue;
    if ((built[r.id] ?? 0) >= seen[r.id]) continue; // already satisfied by a standing instance
    rung = r; rungIdx = i; break;
  }

  const orders = [];

  // 1. draft first, under replace semantics
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free blast (returns {} on success and failure: safe above travellers)
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 6 } });
  }

  // 3. displacement guard for the hero (knockback only; no kiting on a gold-ranked map)
  const hero = { x: now.hero?.x ?? CLAIM.x, z: now.hero?.z ?? CLAIM.z };
  if (dist(hero, CLAIM) > 1.2) orders.push({ verb: 'MOVE_HERO', pos: CLAIM });

  // 4. mend (bounded to the rig radius around the Prospector since ADR-005, so it is cheap in feet).
  //    Gated on affordability (a failed mend is a commute, gen 87) and suppressed when within one
  //    pan-tick of the cap (gen 102: a partial mend strands the purse below a cap it can never reach).
  //    A pct:95 mend on a board carrying 16 wreckers tops up every scratch for 2 gold a time; on a
  //    gold-ranked contract that dribble IS the score. Mend a real hole, not a scratch.
  const nearCap = cap - gold < 6;
  const wrecked = now.works?.wrecked ?? 0;
  const worksFrac = (now.works?.hp ?? 1) / (now.works?.maxHp ?? 1);
  const late = t > SECURE_T - 45;
  const worthMending = wrecked > 0 || (!late && worksFrac < 0.80);
  if (worthMending && gold >= 15 && !nearCap) {
    orders.push({ verb: 'REPAIR_UNDER', pct: wrecked > 0 ? 60 : 80 });
  }

  // 5. one BUILD: plan-time affordable, bank-gated, hard-stopped
  if (rung && t < HARD_STOP_T) {
    const n = entries.filter(e => e.id === rung.id).length;
    if (n < maxFor(rung.id)) {
      const cs = costsFor(rung.id);
      const cost = cs[Math.min(n, cs.length - 1)];
      const spot = rung.spots.find(p => !banned.has(key(rung.id, p)) &&
        !entries.some(e => e.id === rung.id && Math.abs(e.position.x - p.x) < 0.6 && Math.abs(e.position.z - p.z) < 0.6));
      if (!spot) { retired.add(rungIdx); }
      else if (gold >= cost) {
        const rate = t > 12 ? pan / t : 2.2;
        // `works.wrecked > 0` SATURATES on a board carrying 16+ wreckers — as an urgency term it
        // bypassed the bank gate for the whole back half of tune-1 and cost 206 gold. Gate urgency
        // only on the things that can actually end a run (gen 98).
        const urgent = (now.hero?.hp ?? 100) / (now.hero?.maxHp ?? 100) < 0.70
          || (now.works?.standing ?? 0) < 6;
        const affordsCap = (gold - cost) + rate * Math.max(0, SECURE_T - t) >= cap + 5;
        const allowed = rung.emergency
          ? urgent
          : (rung.tag === 'objective' || t < FREE_SPEND_T || urgent || affordsCap);
        if (allowed) {
          orders.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cost } });
        }
      }
    } else { retired.add(rungIdx); }
  }

  // 6. harvest tail: nearest live seams to the claim, drained in blocks of six
  const live = (now.seams ?? []).filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  const chain = [];
  const near = live.filter(s => dist(s, CLAIM) <= 20);
  const pick = near.length ? near : live;                  // never select an empty set (gen 101)
  const slots = 32 - orders.length - 1;
  if (pick.length) {
    let i = 0;
    while (chain.length < slots) {
      const s = pick[i % pick.length];
      for (let k = 0; k < 6 && chain.length < slots; k++) chain.push({ verb: 'HARVEST', seam: s.id });
      i++;
      if (i > 8) break;
    }
  }
  orders.push(...chain);
  if (orders.length === 0) orders.push({ verb: 'HARVEST', seam: (now.seams?.[0]?.id) ?? 'gold-seam-1' });
  return orders.slice(0, 32);
}
