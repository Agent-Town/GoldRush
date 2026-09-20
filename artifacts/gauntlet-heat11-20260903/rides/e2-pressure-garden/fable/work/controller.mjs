// e2-pressure-garden deterministic controller v3 — Claude Fable 5, gen 9.
// THE FIXED-HERO LAW (measured in tune-2): the hero never moves from the
// west-boiler-bed heroStart (-12,12); all orders drive the separate Prospector,
// who pans in safety. So the fort rings (-12,12) on the boiler terrace and the
// Prospector chases every active seam on the map. Gold-gated BUILDs at illegal
// dead-band sites serve as alarm clocks (order_failure surprise => mid-wave view).
// Pressure line deliberately unused: arsenal research-gated on a cold boot.
// Usage: node controller.mjs <tapePath> <logPath>
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const WS = `${REPO}/artifacts/heat11/fable/e2-pressure-garden`;
const tapePath = process.argv[2] ?? `${WS}/tune-3-tape.json`;
const logPath = process.argv[3] ?? `${WS}/tune-3-log.ndjson`;
const USE_BLAST = process.argv[4] !== 'noblast';

const FORT = { x: -12, z: 12 }; // hero fixed position; prospector parks here idle

// [what, x, z, fallbacks] — boiler terrace ring (zone z 7..16, x -36..36)
const PLAN = [
  ['turret', -16, 12, [[-17, 10], [-18, 13]]],
  ['turret', -8, 12, [[-7, 10], [-6, 13]]],
  ['sentry_beacon', -14, 14, [[-15, 15], [-16, 15]]],
  ['turret', -12, 8, [[-13, 9], [-10, 8]]],
  ['sentry_beacon', -10, 10, [[-9, 9], [-8, 8]]],
  ['turret', -12, 16, [[-11, 15], [-13, 15]]],
  ['sentry_beacon', -14, 10, [[-15, 9], [-16, 9]]],
  ['sentry_beacon', -10, 14, [[-9, 15], [-8, 15]]],
  ['sentry_beacon', -19, 15, [[-20, 13], [-21, 12]]],
  ['sentry_beacon', -5, 10, [[-4, 12], [-3, 9]]],
];

const PREF = ['tinkers_plating', 'prospectors_luck', 'beacon_dynamo'];
const COMBAT_RE = /double_tap|heavy_spark|quick_fuse|split_spark|powder_charge|wide_ring|long_resonator/;
const BLACKLIST_RE = /zone|collision|reach|unreachable|terrain/i;

const blacklist = new Set();
const capped = new Set();
const key = (what, x, z) => `${what}@${x},${z}`;
// dead bands used for alarm probes: z 17..19 and z 30..35 — never real sites
const isProbeSite = (x, z) => (z > 16.5 && z < 19.5) || (z > 29.5 && z < 35.5);

function pickUpgrade(offer) {
  if (!Array.isArray(offer) || offer.length === 0) return null;
  for (const want of PREF) {
    const hit = offer.find((o) => o.id === want);
    if (hit) return hit.id;
  }
  const combat = offer.find((o) => COMBAT_RE.test(o.id));
  return (combat ?? offer[0]).id;
}

function builtCount(view, kind) {
  const byKind = view.now?.works?.byKind;
  if (byKind && byKind[kind] !== undefined) {
    const v = byKind[kind];
    if (typeof v === 'number') return v;
    if (typeof v === 'object' && v) return (v.standing ?? 0) + (v.wrecked ?? 0) + (v.count ?? 0);
  }
  const entries = view.now?.works?.entries;
  if (Array.isArray(entries)) return entries.filter((e) => (e.id ?? e.kind) === kind).length;
  return 0;
}

function costFor(view, kind, index) {
  const b = (view.stablePrefix?.mechanics?.buildables ?? []).find((x) => x.id === kind);
  const costs = b?.costs ?? [];
  if (index < costs.length) return costs[index];
  return null;
}

function scanFailures(view) {
  const orders = view.now?.orders;
  if (!Array.isArray(orders)) return;
  for (const o of orders) {
    const rec = o.order ?? o;
    if ((o.status ?? rec.status) !== 'failed') continue;
    if (rec.verb !== 'BUILD' || !rec.where) continue;
    if (isProbeSite(rec.where.x, rec.where.z)) continue;
    const reason = String(o.reason ?? o.detail ?? rec.reason ?? rec.detail ?? '');
    if (/insufficient/i.test(reason)) continue;
    if (/cap/i.test(reason)) { capped.add(rec.what); continue; }
    if (reason === '' || BLACKLIST_RE.test(reason)) blacklist.add(key(rec.what, rec.where.x, rec.where.z));
  }
}

function nextBuilds(view) {
  const builtLeft = {};
  const pending = [];
  for (const [what, x, z, fallbacks] of PLAN) {
    if (capped.has(what)) continue;
    if (builtLeft[what] === undefined) builtLeft[what] = builtCount(view, what);
    if (builtLeft[what] > 0) { builtLeft[what] -= 1; continue; }
    const sites = [[x, z], ...(fallbacks ?? [])].filter(([sx, sz]) => !blacklist.has(key(what, sx, sz)));
    if (sites.length === 0) continue;
    pending.push({ what, x: sites[0][0], z: sites[0][1] });
  }
  const out = [];
  const counts = {};
  let lastPrice = 0;
  for (const p of pending) {
    counts[p.what] = counts[p.what] ?? builtCount(view, p.what);
    const price = costFor(view, p.what, counts[p.what]);
    if (price === null) { capped.add(p.what); continue; }
    if (out.length === 0 || price >= lastPrice) {
      out.push({ verb: 'BUILD', what: p.what, where: { x: p.x, z: p.z }, when: { goldGte: price } });
      counts[p.what] += 1;
      lastPrice = price;
      if (out.length >= 3) break;
    } else break;
  }
  return out;
}

function walker(view) {
  return view.now?.prospector ?? view.now?.hero ?? FORT;
}

function activeSeams(view) {
  const w = walker(view);
  return (view.now?.seams ?? [])
    .filter((s) => s.active && typeof s.x === 'number' && typeof s.z === 'number')
    .sort((a, b) => Math.hypot(a.x - w.x, a.z - w.z) - Math.hypot(b.x - w.x, b.z - w.z));
}

function alarmProbe(view, holdAt) {
  const gold = view.now?.gold ?? 0;
  const wave = view.now?.wave ?? 0;
  if (wave >= 12) return null;
  const gate = Math.min(Math.floor(gold) + 20, 900);
  const z = holdAt.z >= 24 ? (holdAt.z >= 36 ? 34 : 31) : 18;
  const x = Math.max(-28, Math.min(28, Math.round(holdAt.x)));
  return { verb: 'BUILD', what: 'turret', where: { x, z }, when: { goldGte: gate } };
}

let phase = 'opening';

function ordersFor(view) {
  if (view.now?.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const wave = view.now?.wave ?? 0;
  if (wave >= 1) phase = 'standard';

  if (phase === 'opening') {
    // Drain the near (west) seam first; alarm at 25g swaps us to the crossing.
    phase = 'crossing';
    const w = walker(view);
    const seams = activeSeams(view);
    const near = seams[0];
    const nearPos = near ? { x: near.x, z: near.z } : { x: -30, z: 24 };
    return [
      { verb: 'BUILD', what: 'turret', where: { x: -16, z: 12 }, when: { goldGte: 50 } },
      { verb: 'BUILD', what: 'turret', where: { x: Math.round(nearPos.x), z: 31 }, when: { goldGte: 25 } },
      ...(near ? [{ verb: 'HARVEST', seam: near.id }] : []),
      { verb: 'HOLD', pos: nearPos },
    ];
  }

  if (phase === 'crossing') {
    // 25g alarm: finish near seam (one pan), cross to the far seam, T1 at 50g.
    phase = 'standard';
    const seams = activeSeams(view);
    const near = seams[0];
    const far = seams[seams.length - 1];
    const farPos = far ? { x: far.x, z: far.z } : FORT;
    const out = [{ verb: 'BUILD', what: 'turret', where: { x: -16, z: 12 }, when: { goldGte: 50 } }];
    const probe = alarmProbe(view, farPos);
    if (probe) out.push(probe);
    if (near && near !== far) out.push({ verb: 'HARVEST', seam: near.id });
    if (far) out.push({ verb: 'HARVEST', seam: far.id });
    out.push({ verb: 'HOLD', pos: farPos });
    return out;
  }

  const out = [];
  const pick = pickUpgrade(view.now?.pendingOffer);
  if (pick) out.push({ verb: 'PICK_UPGRADE', id: pick });
  if (USE_BLAST) out.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  out.push({ verb: 'REPAIR_UNDER', pct: 65 });
  out.push(...nextBuilds(view));
  const seams = activeSeams(view);
  for (const s of seams.slice(0, 3)) out.push({ verb: 'HARVEST', seam: s.id });
  const holdAt = seams.length > 0 ? { x: seams[0].x, z: seams[0].z } : FORT;
  const probe = alarmProbe(view, holdAt);
  if (probe) out.push(probe);
  out.push({ verb: 'HOLD', pos: holdAt });
  return out;
}

const child = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e2-pressure-garden',
  '--seed', 'e2-pressure-garden-01',
  '--tape', tapePath,
], { cwd: REPO });

let buf = '';
let stderrBuf = '';
let lastLine = null;
let outcome = null;
writeFileSync(logPath, '');

child.stderr.on('data', (d) => { stderrBuf += d; });
child.stdout.on('data', (d) => {
  buf += d;
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    handleLine(line);
  }
});

function handleLine(line) {
  appendFileSync(logPath, `VIEW ${line}\n`);
  let v;
  try { v = JSON.parse(line); } catch { return; }
  if (v && typeof v.secured === 'boolean' && v.eventLogHash) {
    outcome = v;
    return;
  }
  if (!v || v.schema !== 'goldrush.view.v1') return;
  let arr;
  if (lastLine !== null && line === lastLine) {
    arr = v.now?.pendingSecure
      ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
      : [{ verb: 'HOLD', pos: FORT }];
  } else {
    scanFailures(v);
    arr = ordersFor(v);
  }
  lastLine = line;
  const payload = JSON.stringify(arr);
  appendFileSync(logPath, `SENT ${payload}\n`);
  child.stdin.write(payload + '\n');
}

child.on('close', (code) => {
  appendFileSync(logPath, `STDERR ${JSON.stringify(stderrBuf.slice(-4000))}\n`);
  console.log('exit', code);
  console.log('OUTCOME', JSON.stringify(outcome));
});
