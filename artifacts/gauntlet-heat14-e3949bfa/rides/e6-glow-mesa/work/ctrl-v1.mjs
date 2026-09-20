// generation 117 — e6-glow-mesa controller.
// Contract shape (measured this heat):
//   secure = kill the Homemaker's CORE (HeadlessContractSim:291 wants bossComponentId==='core').
//   VAC(100) dies -> act 2 -> core(160) spawns AT THE ANCHOR (8,4). RACK(90) is optional.
//   Boss anchors (8,4) — NOT (0,-8) as generation 23's notebook says.
//   Ranking: secured > waves DESC > gold DESC > faster time. Ceiling = wave 18.
//   Roster: no wrecker (works unattackable, REPAIR_UNDER dead weight) but glowjack is thief:true,
//   so NO stockpile (gen 106 measured 435 gold lost to exactly that) => bank cap stays 200.
//   Economy is CAPTURE: idle exhausts 295 machines and banks 0 gold. Pen pays 1/machine/15s.

const CLAIM = { x: 0, z: -32 };
const BOSS = { x: 8, z: 4 };
// Posts for the boss trip. dist((6,-2),VAC(5.8,4))=6.0 and to core(8,4)=6.3 — both inside rig range 10.
const POSTS = [{ x: 6, z: -2 }, { x: 4, z: -4 }, { x: 8, z: -6 }, { x: 0, z: -4 }, { x: 10, z: -2 }];
const TARGET_WAVE = 15;      // ride for waves (primary axis); bail early if the run is in danger
const BAIL_HPFRAC = 0.50;

// ONE ladder, ONE ordinal per id (gen 110). No stockpile (thief roster). No repair (no wrecker).
const LADDER = [
  { id: 'turret', spots: [[-5, -28], [5, -28], [-5, -36], [5, -36], [-9, -30], [9, -30], [0, -24]] },
  { id: 'turret', spots: [[5, -28], [-5, -36], [5, -36], [-9, -30], [9, -30], [0, -24]] },
  { id: 'sentry_beacon', spots: [[0, -27], [-4, -30], [4, -30], [0, -37], [-4, -34], [4, -34]] },
  { id: 'turret', spots: [[-5, -36], [5, -36], [-9, -30], [9, -30], [0, -24], [-12, -34]] },
  { id: 'sentry_beacon', spots: [[-4, -30], [4, -30], [0, -37], [-4, -34], [4, -34], [3, -27]] },
  { id: 'turret', spots: [[5, -36], [-9, -30], [9, -30], [0, -24], [-12, -34], [12, -34]] },
  { id: 'sentry_beacon', spots: [[4, -30], [0, -37], [-4, -34], [4, -34], [3, -27], [-3, -27]] },
  { id: 'sentry_beacon', spots: [[0, -37], [-4, -34], [4, -34], [3, -27], [-3, -27], [-2, -38]] },
  { id: 'sentry_beacon', spots: [[-4, -34], [4, -34], [3, -27], [-3, -27], [-2, -38], [2, -38]] },
  { id: 'sentry_beacon', spots: [[4, -34], [3, -27], [-3, -27], [-2, -38], [2, -38], [-6, -32]] },
];
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  LADDER.push({ id: 'palisade', spots: [[Math.round(CLAIM.x + 7 * Math.cos(a)), Math.round(CLAIM.z + 7 * Math.sin(a))]] });
}

const GROUND = ['out_of_zone', 'collision', 'out_of_reach', 'cap_reached'];
const dead = new Set();          // poisoned coordinates (GROUND refusals only)
const retired = new Set();       // ladder rungs with no candidates left
let postIx = 0;
let tripLatched = false;

function score(u) {
  const s = `${u.id} ${u.name || ''} ${u.effectText || ''}`.toLowerCase();
  if (/plating|armor|armour|max hp|maxhp|vitality|toughness/.test(s)) return 100;
  if (/heal|regen|mend|dressing|restore/.test(s)) return 80;
  if (/spark|damage|coil|resonator|charge|fuse|split|heavy/.test(s)) return 50;
  return 10;
}

export default function ctrl(view) {
  const now = view.now || {};
  if (now.pendingSecure) return null;            // silence takes `bank`; a blank line cannot be rejected

  const atomic = now.atomic || {};
  const boss = atomic.homemakerBoss || {};
  const live = boss.liveComponents || [];
  const works = now.works || {};
  const hero = now.hero || {};
  const gold = now.gold || 0;
  const wave = now.wave || 0;
  const hpFrac = hero.maxHp ? hero.hp / hero.maxHp : 1;

  // --- refusal blacklist, fed from the view's own order records -------------
  for (const rec of now.orders || []) {
    const o = rec.order || {};
    if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
      const why = String(rec.reason || rec.detail || '');
      if (GROUND.some((g) => why.includes(g)) || /UNREACHABLE|outside buildable|collision|zone|cap_reached/i.test(why)) {
        dead.add(`${o.what}@${o.where.x},${o.where.z}`);
      }
    }
    if (rec.status === 'failed' && o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(String(rec.reason || ''))) {
      postIx = Math.min(postIx + 1, POSTS.length - 1);
    }
  }
  const orders = [];

  // 1. draft first, under REPLACE semantics
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. BLAST_AT returns {} on success AND failure, so it is safe above the traveller
  const bossUp = live.length > 0;
  const goTrip = tripLatched || (bossUp && (wave >= TARGET_WAVE || hpFrac < BAIL_HPFRAC));
  if (goTrip) tripLatched = true;
  if (now.blastReadyInMs === 0) {
    const t = goTrip ? BOSS : { x: CLAIM.x, z: CLAIM.z + 5 };
    const d = Math.hypot(t.x - (hero.x ?? 0), t.z - (hero.z ?? 0));
    orders.push({ verb: 'BLAST_AT', pos: d <= 9.5 ? t : { x: hero.x ?? 0, z: (hero.z ?? 0) + 4 } });
  }

  // 3. the traveller: one MOVE_HERO, emitted only when actually displaced (gen 68/79/112)
  const want = goTrip ? POSTS[postIx] : CLAIM;
  if (Math.hypot((hero.x ?? 0) - want.x, (hero.z ?? 0) - want.z) > 1.0) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: want.x, z: want.z } });
  }

  // 4. one ladder rung, priced at its live instance; retire a rung with no candidates
  if (!goTrip) {
    const byKind = works.byKind || {};
    const costsOf = {};
    for (const b of (view.stablePrefix?.mechanics?.buildables) || []) costsOf[b.id] = b;
    const seen = {};
    for (let i = 0; i < LADDER.length; i++) {
      if (retired.has(i)) continue;
      const rung = LADDER[i];
      seen[rung.id] = (seen[rung.id] || 0) + 1;
      const standing = byKind[rung.id] || 0;
      if (standing >= seen[rung.id]) continue;                  // this rung already satisfied
      const spec = costsOf[rung.id];
      if (!spec) { retired.add(i); continue; }
      if (spec.maxCount != null && standing >= spec.maxCount) { retired.add(i); continue; }
      const cost = (spec.costs && spec.costs[standing]) ?? (spec.costs || [])[spec.costs.length - 1] ?? 9999;
      const spot = rung.spots.find((s) => !dead.has(`${rung.id}@${s[0]},${s[1]}`));
      if (!spot) { retired.add(i); continue; }                  // RETIRE, never stall the rungs behind
      if (gold >= cost) orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: cost } });
      break;
    }
  }

  // 5. CAPTURE owns exactly one tick then its record is spent, so stacking is correct (gen 23).
  //    This is the map's ENTIRE economy: idle exhausts 295 machines and banks 0.
  const cap = goTrip ? 6 : 16;
  for (let i = 0; i < cap; i++) orders.push({ verb: 'CAPTURE' });

  // 6. harvest tail — Number.isFinite first (an inactive seam publishes x/z/anchorIndex as null,
  //    and one non-finite number refuses the WHOLE array silently)
  const live2 = (now.seams || []).filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z));
  live2.sort((a, b) => Math.hypot(a.x - (hero.x ?? 0), a.z - (hero.z ?? 0)) - Math.hypot(b.x - (hero.x ?? 0), b.z - (hero.z ?? 0)));
  const room = 31 - orders.length;
  if (live2.length && room > 0) {
    const chain = [];
    for (let i = 0; i < room; i++) chain.push({ verb: 'HARVEST', seam: live2[Math.floor(i / 5) % live2.length].id });
    orders.push(...chain);
  }
  return orders.slice(0, 32);
}
