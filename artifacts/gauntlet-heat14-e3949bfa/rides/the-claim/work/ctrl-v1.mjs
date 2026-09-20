// the-claim, era 6. Ranking: secured -> waves (pinned 10 by twist.secureWave)
// -> GOLD. So gold is the only free axis: spend the minimum that secures, and
// raise the cap early (2 stockpiles, +150 each, 200 -> 500) so the purse can
// never pin and switch panning off (Economy refuses credits at the cap).
const CLAIM = { x: 0, z: 12 };
const MAX_ORDERS = 32;

const SPOTS = {
  turret: [[-5, 14], [5, 14], [0, 16], [-8, 12], [8, 12], [-4, 10], [4, 10], [0, 18], [-10, 15], [10, 15], [-8, 17], [8, 17]],
  stockpile: [[0, 14], [-3, 17], [3, 17], [-6, 16], [6, 16], [0, 20], [-2, 19], [2, 19], [-9, 19], [9, 19]],
  sentry_beacon: [[-3, 11], [3, 11], [0, 9], [-6, 13], [6, 13], [-2, 15], [2, 15], [-7, 15], [7, 15], [0, 13]],
  palisade: [[0, 8], [-4, 8], [4, 8], [-7, 10], [7, 10], [-6, 18], [6, 18], [0, 22], [-10, 12], [10, 12], [-3, 8], [3, 8]],
};

const BASE = ['turret', 'stockpile', 'turret', 'stockpile'];
const EMERG = ['sentry_beacon', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon'];

const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|terrain|buildable/i;

export function makeController() {
  const poison = new Set();      // "kind@x,z" refused by the GROUND
  const strikes = new Map();     // transient refusals per spot
  const retired = new Set();     // rung indices abandoned for want of ground
  let emergencyLatched = false;
  let lastSig = null;

  const spotKey = (kind, s) => `${kind}@${s[0]},${s[1]}`;

  return {
    decide(view) {
      const now = view.now;
      // 1. The secure boundary takes exactly one order, or silence. Silence is
      //    free (records no entry), cannot be rejected, and banks the default.
      if (now.pendingSecure) return '\n';

      const orders = [];
      const gold = now.gold ?? 0;
      const hp = now.hero?.hp ?? 0;
      const maxHp = now.hero?.maxHp ?? 100;
      const entries = now.works?.entries ?? [];
      const byKind = now.works?.byKind ?? {};
      const buildables = view.stablePrefix?.mechanics?.buildables ?? [];
      const t = now.timers?.runSeconds ?? 0;

      // --- refusal bookkeeping straight off the view's own order records
      for (const rec of now.orders ?? []) {
        const o = rec.order ?? rec;
        if (o?.verb !== 'BUILD' || rec.status !== 'failed') continue;
        const key = spotKey(o.what, [o.where.x, o.where.z]);
        const reason = `${rec.reason ?? ''} ${rec.detail ?? ''}`;
        if (GROUND.test(reason)) poison.add(key);
        else if (!/insufficient_gold/i.test(reason)) {
          const n = (strikes.get(key) ?? 0) + 1;
          strikes.set(key, n);
          if (n >= 3) poison.add(key);
        }
      }

      // 2. The draft first, under replace semantics; plating outranks damage.
      if (now.pendingOffer?.length) {
        const score = (o) => {
          const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
          if (/plating|dressing|vitality|hp|health|hardy/.test(s)) return 3;
          if (/spark|damage|coil|volley|rate/.test(s)) return 2;
          return 1;
        };
        const pick = now.pendingOffer.slice().sort((a, b) => score(b) - score(a))[0];
        orders.push({ verb: 'PICK_UPGRADE', id: pick.id });
      }

      // 3. Free damage every ready window; BLAST_AT answers either way so it
      //    never blocks the tail.
      if ((now.blastReadyInMs ?? 1) === 0) {
        orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z - 3 } });
      }

      // 4. Come home only when actually displaced (a walking MOVE_HERO owns the
      //    tick and would starve the Prospector).
      const dh = Math.hypot((now.hero?.x ?? 0) - CLAIM.x, (now.hero?.z ?? 0) - CLAIM.z);
      if (dh > 1.5) orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });

      // 5. Mending is 25% of cost and radius-bounded since ADR-005: ungated,
      //    and it also protects the stockpiles that hold the cap up.
      const hurt = entries.some((e) => e.wrecked || (e.hp != null && e.maxHp != null && e.hp < e.maxHp));
      if (hurt && gold >= 15) orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

      // 6. The ladder. Emergency rungs latch on real pressure only; every gold
      //    not spent is a point on the board.
      if (hp / maxHp < 0.72 || (now.threats?.alive ?? 0) > 28 || (now.works?.wrecked ?? 0) > 0) emergencyLatched = true;
      const plan = emergencyLatched ? [...BASE, ...EMERG] : BASE;
      const noBuildAfter = 285;

      if (t < noBuildAfter) {
        const need = {};
        let budget = gold;
        let emitted = 0;
        for (let i = 0; i < plan.length && emitted < 2; i++) {
          if (retired.has(i)) continue;
          const kind = plan[i];
          need[kind] = (need[kind] ?? 0) + 1;
          const have = byKind[kind] ?? 0;
          if (have >= need[kind]) continue;              // already standing
          const def = buildables.find((b) => b.id === kind);
          if (!def) { retired.add(i); continue; }
          const costs = def.costs ?? [def.cost];
          const price = costs[Math.min(have, costs.length - 1)] ?? def.cost;
          if (budget < price) break;                      // plan-time affordability
          const spot = (SPOTS[kind] ?? []).find((s) => {
            if (poison.has(spotKey(kind, s))) return false;
            return !entries.some((e) => e.position && Math.hypot(e.position.x - s[0], e.position.z - s[1]) < 2.5);
          });
          if (!spot) { retired.add(i); continue; }        // retire the rung, never stall behind it
          orders.push({ verb: 'BUILD', what: kind, where: { x: spot[0], z: spot[1] }, when: { goldGte: price } });
          budget -= price;
          emitted += 1;
        }
      }

      // 7. The tail is the throughput AND the clock: failing HARVESTs cost
      //    nothing (the Prospector already stands there) and buy decision points.
      const live = (now.seams ?? [])
        .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
        .map((s) => ({ ...s, d: Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) }))
        .sort((a, b) => a.d - b.d);
      const chain = live.slice(0, 2);
      if (chain.length) {
        let i = 0;
        while (orders.length < MAX_ORDERS) {
          const seam = chain[Math.floor(i / 6) % chain.length];
          orders.push({ verb: 'HARVEST', seam: seam.id });
          i += 1;
        }
      }

      // 8. Cheap dedupe: if nothing material changed and the worklist still has
      //    depth, answer with silence rather than a fresh reel entry.
      const pend = (now.orders ?? []).filter((r) => {
        const o = r.order ?? r;
        return o?.verb === 'HARVEST' && r.status !== 'done' && r.status !== 'failed';
      }).length;
      const sig = JSON.stringify(orders.map((o) => [o.verb, o.what, o.seam, o.id, o.where?.x, o.where?.z]));
      if (sig === lastSig && pend >= 8) return '\n';
      lastSig = sig;
      if (!orders.length) return '\n';
      return JSON.stringify(orders) + '\n';
    },
  };
}
