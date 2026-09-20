// e6-picnic controller v1.
// Contract shape (read from source):
//   PicnicHoldSystem: a stake is CLAIMED after 6s of an enemy inside r3 with no defender.
//   Defender = any standing building (hp>0) within r3, OR hero that dealt damage <5s ago within r3.
//   lossRule = all-stakes-claimed;  secureRule = at least one stake held at secureWave (=20, Balance).
//   => ONE surviving structure inside r3 of ONE stake makes the picnic loss impossible.
// Economy: 2 live seams (5g / 1.5s pan tick, cap 30) + wrangle pen (1g per penned machine / 15s).

const STAKES = [
  { id: 'sandwich-east', x: 16, z: 18 },
  { id: 'sandwich-center', x: 0, z: 26 },
  { id: 'sandwich-west', x: -16, z: 18 },
];
// Candidates per stake, all inside mesa-meadow (x -28..28, z 2..38) and within r3 of the stake.
const STAKE_SPOTS = {
  'sandwich-east': [{ x: 16, z: 18 }, { x: 14, z: 18 }, { x: 16, z: 16 }, { x: 18, z: 19 }],
  'sandwich-center': [{ x: 0, z: 26 }, { x: -2, z: 26 }, { x: 0, z: 24 }, { x: 2, z: 27 }],
  'sandwich-west': [{ x: -16, z: 18 }, { x: -14, z: 18 }, { x: -16, z: 16 }, { x: -18, z: 19 }],
};
// Turrets ring the claim (0,12); (0,18) alone reaches all three stakes at range 16.
const TURRETS = [
  { x: 0, z: 18 }, { x: -10, z: 15 }, { x: 10, z: 15 }, { x: 0, z: 7 },
  { x: -7, z: 20 }, { x: 7, z: 20 }, { x: -12, z: 10 }, { x: 12, z: 10 },
];
const BEACONS = [
  { x: -5, z: 14 }, { x: 5, z: 14 }, { x: 0, z: 22 }, { x: -8, z: 8 }, { x: 8, z: 8 }, { x: 0, z: 4 },
];
const CLAIM = { x: 0, z: 12 };
const POST = { x: 0, z: 13 };   // capture post: exhausted machines settle on the hero they walked at

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const t = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let s = 0;
  if (/plating|max hp|maxhp|health|vitality|armor|armour|tough/.test(t)) s += 100;
  if (/regen|heal|mend/.test(t)) s += 60;
  if (/damage|spark|dps|power|coil|tap|volley/.test(t)) s += 40;
  if (/range|reach/.test(t)) s += 20;
  if (/speed|haste/.test(t)) s += 10;
  return s;
}

export default function controller(view) {
  const now = view.now;
  const orders = [];

  // pendingSecure accepts exactly one order and refuses anything else (gen-9).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  // PICK_UPGRADE first in the array (REPLACE semantics), then resend everything else.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const entries = now.works?.entries ?? [];
  const standing = entries.filter((e) => !e.wrecked && (e.hp === undefined || e.hp > 0));
  const occupied = (p) => entries.some((e) => e.position && d(e.position, p) < 1.5);
  const gold = now.gold ?? 0;

  // --- 1. STAKE GUARDS: the whole contract. One standing work within r3 of a stake defends it.
  const stakeState = now.atomic?.picnicHold ?? [];
  const claimedIds = new Set(stakeState.filter((s) => s.claimed).map((s) => s.id));
  const guardBuilds = [];
  for (const st of STAKES) {
    if (claimedIds.has(st.id)) continue;                       // already lost; do not spend on it
    const guarded = standing.some((e) => e.position && d(e.position, st) <= 3);
    if (guarded) continue;
    const spot = STAKE_SPOTS[st.id].find((p) => !occupied(p));
    if (spot) guardBuilds.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
  }

  // --- 2. LADDER: turrets ring the claim; the hero is a fixed gun and everything walks at it.
  const nT = standing.filter((e) => e.id === 'turret').length;
  const nB = standing.filter((e) => e.id === 'sentry_beacon').length;
  const tCost = [50, 70, 95, 125];
  const bCost = [25, 35, 45, 55, 75, 95];
  const ladder = [];
  if (nT < 4) {
    const spot = TURRETS.find((p) => !occupied(p));
    if (spot) ladder.push({ verb: 'BUILD', what: 'turret', where: spot, when: { goldGte: tCost[nT] } });
  }
  if (nT >= 2 && nB < 6) {
    const spot = BEACONS.find((p) => !occupied(p));
    // gate the cheap rung behind the NEXT turret's price so it can never starve it (gen-6)
    const gate = nT < 4 ? tCost[nT] + bCost[nB] : bCost[nB];
    if (spot) ladder.push({ verb: 'BUILD', what: 'sentry_beacon', where: spot, when: { goldGte: gate } });
  }

  // --- 3. Seam choice: nearest live seam to the post.
  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x));
  live.sort((a, b) => d(a, POST) - d(b, POST));
  const seam = live[0];

  const isOpening = (now.wave ?? 0) === 0;

  if (isOpening) {
    // ONE blind array covers t=0..30 (view 1 only arrives at the wave boundary).
    // Pan the full seam first (HARVEST is unconditional, so it owns every tick until the records
    // drain), then spend the 30 gold straight down the guard list nearest-first.
    for (let i = 0; i < 6; i++) if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });
    const byDist = [...guardBuilds].sort((a, b) => d(a.where, seam ?? POST) - d(b.where, seam ?? POST));
    orders.push(...byDist);
    orders.push({ verb: 'REPAIR_UNDER', pct: 55 });
    for (let i = 0; i < 16; i++) orders.push({ verb: 'CAPTURE' });
    orders.push({ verb: 'HOLD', pos: POST });
    return orders.slice(0, 32);
  }

  // --- steady state ---
  orders.push(...guardBuilds);                     // stake guards outrank everything
  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });  // conditional: falls through free when nothing qualifies
  orders.push(...ladder);
  // Pan only when a build is actually waiting on money, otherwise stay on the capture post.
  const wants = [...guardBuilds, ...ladder].some((o) => gold < o.when.goldGte);
  if (seam && wants) for (let i = 0; i < 6; i++) orders.push({ verb: 'HARVEST', seam: seam.id });
  const room = 31 - orders.length;
  for (let i = 0; i < room; i++) orders.push({ verb: 'CAPTURE' });
  orders.push({ verb: 'HOLD', pos: POST });
  return orders.slice(0, 32);
}
