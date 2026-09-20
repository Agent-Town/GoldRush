#!/usr/bin/env node
// Claude Fable 5 — generation 8 — e2-incline (seed e2-incline-01, trail) door controller.
//
// PREMISE (from source + county evidence, worldModel: sim-import):
//   - Cold boot: the E2 arsenal is research-gated (PressureArsenalSystem.ts:116) and the door
//     declares no profile, so boilers/coal are a pure cost. SKIP the pressure line.
//   - Secure latch (HeadlessContractSim.ts:1095): the wave-12 railcar must DIE, then the next
//     wave boundary >= 12 latches run_secured; ceiling is wave 18 (BOSS_GRACE_WAVES 6).
//   - Fort: 4-turret diamond + 6 beacons around the fixed hero stake (-24,-18); the lower rail
//     (x=-12) passes within turret range of the east pads, so the railcar meets guns on every
//     pass. REPAIR_UNDER 70 stands all run (wreckers 2.5x, railcar 7x building damage).
//   - Income: HARVEST the live seam nearest the stake, then HOLD AT THE SEAM (the income law:
//     standing within channelRange pans passively). Sequence builds by INCLUSION with exact
//     goldGte gates read from the view's own cost curves (affordability-first trap).
//   - Secure window accepts ONLY a single-element [SECURE_CHOICE]; a rejected array re-serves
//     the identical view — detect the repeat and degrade.
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const ROOT = '/private/tmp/heat11-5e7a7c0b';
const WS = `${ROOT}/artifacts/heat11/fable/e2-incline`;
const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const TAPE = val('--tape') ?? `${WS}/tune-1-tape.json`;
const SEED = val('--seed') ?? 'e2-incline-01';
const SCORED = args.includes('--scored');
const LOG = TAPE.replace(/\.json$/, '.log');
writeFileSync(LOG, `ride start ${new Date().toISOString()} seed=${SEED} tape=${TAPE}\n`);
const log = (line) => appendFileSync(LOG, `${line}\n`);

const STAKE = { x: -24, z: -18 };
// Site plan: diamond fort in the lower yard (zone x -36..36, z -30..-7), integers for gridSnap,
// >=2.5 spacing, >=6 off the rail line x=-12.
const PADS = {
  turret: [{ x: -18, z: -15 }, { x: -18, z: -21 }, { x: -30, z: -15 }, { x: -30, z: -21 },
    { x: -24, z: -12 }, { x: -24, z: -24 }],
  sentry_beacon: [{ x: -21, z: -12 }, { x: -27, z: -12 }, { x: -21, z: -24 }, { x: -27, z: -24 },
    { x: -15, z: -18 }, { x: -33, z: -18 }, { x: -24, z: -9 }, { x: -24, z: -27 }],
  stockpile: [{ x: -21, z: -27 }, { x: -27, z: -9 }, { x: -33, z: -24 }],
};
const LADDER = ['turret', 'turret', 'turret', 'turret', 'sentry_beacon', 'sentry_beacon',
  'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'stockpile'];
const RANK = ['chain_spark_arc', 'heavy_spark', 'double_tap_coil', 'split_spark', 'tinkers_plating',
  'long_resonator', 'field_dressing', 'sharpen', 'beacon_dynamo', 'prospectors_luck', 'pan_legend'];
const rank = (id) => { const i = RANK.indexOf(id); return i < 0 ? RANK.length : i; };
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

const refused = new Set(); // pads the map refused (collision/out_of_zone) — struck for good
const padKey = (w) => `${w.x}:${w.z}`;
let lastRawView = '';
let rejectStreak = 0;
let views = 0;
let submitted = 0;

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e2-incline', '--seed', SEED,
  '--tape', TAPE], { cwd: ROOT });
let stderrTail = '';
sim.stderr.on('data', (c) => { stderrTail = (stderrTail + c).slice(-4000); });
let buf = '';
sim.stdout.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (line.trim()) onLine(line);
  }
});
sim.on('close', (code) => { log(`sim closed code=${code}`); log(`stderr tail: ${stderrTail}`); });

function onLine(line) {
  let msg;
  try { msg = JSON.parse(line); } catch { log(`unparseable: ${line.slice(0, 200)}`); return; }
  if (msg.schema === 'goldrush.view.v1') { onView(msg, line); return; }
  if ('secured' in msg) { onOutcome(msg); return; }
  log(`other line: ${line.slice(0, 200)}`);
}

function send(orders) {
  submitted += 1;
  try { sim.stdin.write(`${JSON.stringify(orders)}\n`); } catch { /* closing */ }
}

function onView(view, raw) {
  views += 1;
  const now = view.now;
  const rejected = raw === lastRawView;
  lastRawView = raw;
  rejectStreak = rejected ? rejectStreak + 1 : 0;
  const hero = now.hero ?? {};
  log(`v${views} w${now.wave} t=${(now.timeAliveMs ?? 0)} gold=${now.gold} hp=${Math.round(hero.hp ?? -1)}/${hero.maxHp}`
    + ` alive=${now.threats?.alive} works=${JSON.stringify(now.works?.byKind ?? {})}`
    + ` offer=${(now.pendingOffer ?? []).map((o) => o.id).join('|')}`
    + ` secure=${now.pendingSecure ? 'OPEN' : '-'}${rejected ? ' [REJECT-RESERVE]' : ''}`
    + ` fails=${(now.orders ?? []).filter((o) => o.status === 'failed').map((o) => `${o.order?.verb}:${o.reason ?? o.detail ?? ''}`).join(';').slice(0, 160)}`);

  if (hero.hp !== undefined && hero.hp <= 0) return; // terminal view: no orders expected

  // The secure window takes exactly one order.
  if (now.pendingSecure) { send([{ verb: 'SECURE_CHOICE', choice: 'bank' }]); return; }
  if (rejectStreak >= 2) { send([{ verb: 'HOLD', pos: { ...STAKE } }]); return; }

  strikeRefused(now);
  send(ordersFor(view));
}

function strikeRefused(now) {
  for (const rec of now.orders ?? []) {
    if (rec.status !== 'failed' || rec.order?.verb !== 'BUILD') continue;
    const why = `${rec.reason ?? ''}${rec.detail ?? ''}`;
    if (/insufficient_gold/.test(why)) continue; // affordability is transient, ground is not
    if (rec.order.where) refused.add(padKey(rec.order.where));
  }
}

function costsOf(view, id) {
  const entry = (view.stablePrefix.mechanics?.buildables ?? []).find((b) => b.id === id);
  return entry?.costs ?? { turret: [50, 68, 91, 123], sentry_beacon: [25, 33, 43, 55, 72, 93], stockpile: [60, 60] }[id] ?? [];
}

function ordersFor(view) {
  const now = view.now;
  const head = [{ verb: 'REPAIR_UNDER', pct: 70 }];
  const offer = now.pendingOffer ?? [];
  if (offer.length > 0) {
    const pick = [...offer].sort((a, b) => rank(a.id) - rank(b.id))[0];
    head.push({ verb: 'PICK_UPGRADE', id: pick.id });
  }

  // Pending build rungs, strict order, exact-cost gates. Include rung 1 gated at its cost and
  // rung 2 gated at (cost1 + cost2) so a cheap later rung can never outrun a dearer earlier one.
  const entries = now.works?.entries ?? [];
  const byKind = now.works?.byKind ?? {};
  const occupied = (pad) => entries.some((e) => e.position && dist(e.position, pad) < 2.0);
  const seen = {};
  const used = {};
  const pending = [];
  for (const what of LADDER) {
    const idx = seen[what] ?? 0;
    seen[what] = idx + 1;
    if (idx < (byKind[what] ?? 0)) continue;
    const cost = costsOf(view, what)[idx];
    if (cost === undefined) continue;
    const pads = (PADS[what] ?? []).filter((p) => !refused.has(padKey(p)) && !occupied(p));
    const pad = pads[used[what] ?? 0];
    if (!pad) continue;
    used[what] = (used[what] ?? 0) + 1;
    pending.push({ what, where: pad, cost });
  }
  const builds = [];
  if (pending[0]) builds.push({ verb: 'BUILD', what: pending[0].what, where: { ...pending[0].where }, when: { goldGte: pending[0].cost } });
  if (pending[1]) builds.push({ verb: 'BUILD', what: pending[1].what, where: { ...pending[1].where }, when: { goldGte: pending[0].cost + pending[1].cost } });

  // Late-game sink: tier the guns (150 then 300; CONTEXT_ACTION reaches only 1.6wu, so walk first).
  let tierOrders = [];
  if (pending.length === 0) {
    const tierOf = (e) => (Number.isFinite(e.tier) && e.tier > 0 ? e.tier : 1);
    const guns = entries
      .filter((e) => e.id === 'turret' && !e.wrecked && tierOf(e) < 3)
      .map((e) => ({ ...e, cost: tierOf(e) <= 1 ? 150 : 300 }))
      .filter((e) => now.gold >= e.cost)
      .sort((a, b) => a.cost - b.cost || a.index - b.index);
    const gun = guns[0];
    if (gun && gun.position) {
      const pros = now.prospector ?? STAKE;
      if (dist(pros, gun.position) <= 1.4) {
        tierOrders = [{ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: gun.index } },
          { verb: 'HOLD', pos: { x: gun.position.x, z: gun.position.z } }];
      } else {
        tierOrders = [{ verb: 'HOLD', pos: { x: gun.position.x, z: gun.position.z } }];
      }
      return [...head, ...tierOrders];
    }
  }

  // Income: nearest-to-stake live seam; pan it, then HOLD there (passive channel).
  const anchors = new Map((view.stablePrefix.map?.seams ?? []).map((s) => [s.id, s]));
  const live = (now.seams ?? [])
    .filter((s) => s.active && (s.remaining ?? 1) > 0)
    .map((s) => ({ ...s, pos: { x: s.x ?? anchors.get(s.id)?.x, z: s.z ?? anchors.get(s.id)?.z } }))
    .filter((s) => Number.isFinite(s.pos.x))
    .sort((a, b) => dist(STAKE, a.pos) - dist(STAKE, b.pos));
  const seam = live[0];
  const tail = seam
    ? [...Array.from({ length: 12 }, () => ({ verb: 'HARVEST', seam: seam.id })), { verb: 'HOLD', pos: { x: seam.pos.x, z: seam.pos.z } }]
    : [{ verb: 'HOLD', pos: { ...STAKE } }];
  return [...head, ...builds, ...tail];
}

function onOutcome(outcome) {
  log(`OUTCOME ${JSON.stringify(outcome)}`);
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  // Intermediate-results law: (over)write the best-so-far outcome file after EVERY run.
  const path = `${WS}/gauntlet-outcome.json`;
  let prior = null;
  try { prior = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null; } catch { prior = null; }
  const runsSoFar = (prior?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prior?.scoredAttempts ?? 0) + (SCORED ? 1 : 0);
  const better = !prior
    || (outcome.secured && !prior.secured)
    || (outcome.secured === Boolean(prior.secured) && (outcome.waves ?? 0) > (prior.waves ?? 0))
    || (outcome.secured === Boolean(prior.secured) && (outcome.waves ?? 0) === (prior.waves ?? 0) && (outcome.gold ?? 0) > (prior.gold ?? 0));
  const best = better
    ? { ...outcome, tape: TAPE, scored: SCORED }
    : { ...prior, tape: prior.tape, scored: prior.scored };
  writeFileSync(path, `${JSON.stringify({ ...best, runsSoFar, scoredAttempts, worldModel: 'sim-import' }, null, 2)}\n`);
  log(`views=${views} submitted=${submitted}`);
}
