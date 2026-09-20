// e3-moth-season controller v3 — heat 12.
//
// v2's bug, measured: I filtered the seam chain to `distance(claim) <= 24`. This map's six
// authored anchors sit 9.3 / 10.4 / 18.5 / 25.5 / 26.2 / 28.9 wu from the claim and only THREE
// are live at a time, re-anchoring between waves. From t=90 all three live anchors were beyond
// 24, so the chain was empty, the array was empty, and an empty array WIPES ALL ORDERS. The
// Prospector stood at (-1.7,10.6) for 200 seconds and `goldPanned` froze at 60.
// Cure: never emit an empty array, never filter the last seam away, and force a resubmit
// whenever the view shows no pending work.
const CLAIM = { x: 0, z: 12 };

const LADDER = [
  { spots: [{ x: 0, z: -14 }, { x: 1, z: -14 }, { x: 0, z: -13 }, { x: -1, z: -14.5 }] }, // pylon: the objective
  { spots: [{ x: 0, z: 5 }, { x: 1, z: 4 }, { x: -1, z: 4 }, { x: 0, z: 3 }] },
  { spots: [{ x: -5, z: 11 }, { x: -5, z: 13 }, { x: -6, z: 11 }, { x: -4, z: 9 }] },
  { spots: [{ x: 5, z: 11 }, { x: 5, z: 13 }, { x: 6, z: 11 }, { x: 4, z: 9 }] },
  { spots: [{ x: -4, z: 18 }, { x: -5, z: 19 }, { x: -3, z: 19 }, { x: -6, z: 17 }] },
  { spots: [{ x: 4, z: 18 }, { x: 5, z: 19 }, { x: 3, z: 19 }, { x: 6, z: 17 }] },
];
const COSTS = [25, 35, 45, 55, 75, 95];

const blacklist = new Set();
const attempts = new Map();
const key = p => `${p.x},${p.z}`;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
let lastSig = null;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|vitality|tough/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|patch/.test(s)) v += 90;
  if (/spark|coil|tap|volley|damage/.test(s)) v += 45;
  if (/dynamo|beacon|sentry/.test(s)) v += 30;
  if (/blast|powder|charge/.test(s)) v += 25;
  if (/speed|heels/.test(s)) v += 6;
  if (/luck|pan|gold|seam|assay/.test(s)) v += 2;
  return v;
}

export function decide(view, ctx) {
  const now = view.now;
  if (now.pendingSecure) { lastSig = null; return [{ verb: 'SECURE_CHOICE', choice: 'bank' }]; }

  let pendingWork = 0;
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (!o) continue;
    if (rec.status === 'pending' || rec.status === 'active') pendingWork++;
    if (o.verb === 'BUILD' && rec.status === 'failed' && o.where) {
      if (!/insufficient_gold|INSUFFICIENT/i.test(String(rec.reason || rec.detail || ''))) {
        const k = key(o.where);
        attempts.set(k, (attempts.get(k) || 0) + 1);
        if (attempts.get(k) >= 2) blacklist.add(k);
      }
    }
  }

  const entries = (now.works && now.works.entries) || [];
  const beaconAll = entries.filter(e => e.id === 'sentry_beacon').map(e => e.position || e);
  const nBeacon = beaconAll.length;

  const out = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const gold = now.gold || 0;
  let nextSpot = null;
  for (const step of LADDER) {
    if (step.spots.some(sp => beaconAll.some(b => dist(b, sp) < 3))) continue;
    const spot = step.spots.find(sp => !blacklist.has(key(sp)));
    if (!spot) continue;
    nextSpot = spot; break;
  }
  const cost = COSTS[Math.min(nBeacon, COSTS.length - 1)];
  if (nextSpot && gold >= cost) {
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: nextSpot, when: { goldGte: cost } });
  }
  if ((now.blastReadyInMs ?? 1) === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: 14 } });

  // The tail. NEVER filtered to empty: sort every live seam by distance to the claim and
  // stack on the nearest, spilling to the second only when it is a short hop away. A seam
  // holds 30 gold (six pans), so ~10 slots empties the nearest one before the walk repeats.
  const live = (now.seams || [])
    .filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ id: s.id, x: s.x, z: s.z, d: dist(s, CLAIM) }))
    .sort((a, b) => a.d - b.d);
  const use = [];
  if (live.length) {
    use.push(live[0]);
    for (const s of live.slice(1)) {
      if (use.length >= 2) break;
      if (dist(s, use[0]) <= 20) use.push(s);
    }
  }
  const room = Math.min(32 - out.length, 24);
  if (use.length) {
    for (let i = 0; i < room; i++) out.push({ verb: 'HARVEST', seam: use[Math.floor(i / 8) % use.length].id });
  }
  // Anchor: an array that would otherwise be empty stands the Prospector on the claim rather
  // than wiping the order set. `[]` is the one thing this controller must never send.
  if (out.length === 0) out.push({ verb: 'HOLD', pos: CLAIM });

  const arr = out.slice(0, 32);
  const sig = JSON.stringify([nBeacon, nextSpot, use.map(s => s.id), !!now.pendingOffer, blacklist.size]);
  const mustSpeak = !!now.pendingOffer || pendingWork < 6 || sig !== lastSig || ctx.views.length === 1;
  if (!mustSpeak) return 'BLANK';
  lastSig = sig;
  return arr;
}
