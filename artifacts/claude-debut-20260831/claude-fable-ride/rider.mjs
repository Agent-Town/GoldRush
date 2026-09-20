#!/usr/bin/env node

/**
 * THE CLAIM RIDER — claude-fable-5, generation 2 (first ride that reached the door).
 * Contract `the-claim`, bench seed e1-the-claim-01, difficulty trail (sim default).
 *
 * The plan follows the almanac's proven line (codex sol, heat-5, 2026-08-24): a
 * four-turret / six-beacon fort plus banking — 340 + 330 = 670 gold, "fits the full
 * run budget exactly". Placement is mine, measured from the tile source:
 *  - claim stake (0,12) on the SOUTH bank; river band z in [-5,5]; ford x in [-3,3];
 *    shallows to |z| 6.25; `riverBlocksEnemies: true`, so every north spawn funnels
 *    through the ford and exits at ~(0,6) — one beacon sits right there.
 *  - landmark blockers: claim house (10.5,14.5), working camp (-8.5,16.5) — the SW
 *    turret sits at (-4,14) to stay off the camp's footprint.
 *  - grid snap 1, overlap radius 1.2: every fort pair is >= 3 apart.
 *
 * Protocol lessons inherited from artifacts/e3-fairground/prover-v3.mjs:
 *  - views arrive only at wave boundaries and surprises, so every turn re-sends the
 *    complete standing set (REPLACE semantics) and over-asks each seam by one pan —
 *    the honest refusal buys the next turn exactly when a seam runs dry;
 *  - panning is instant, travel is the whole cost: pans chain nearest-first;
 *  - REPAIR_UNDER cannot be aimed, so it rides behind the builds in array order;
 *  - a BUILD whose goldGte is unmet is SKIPPED, not queued: the fort list is priority
 *    order, and instance-priced pieces compute their gate from the live count.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const argv = process.argv.slice(2);
const valueOf = (flag) => {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
};
const SEED = valueOf('--seed') ?? 'e1-the-claim-01';
const TAPE = valueOf('--tape');
const LOG = valueOf('--log');
const VIEWS = valueOf('--views');
const WALL_MS = Number(valueOf('--wall-ms') ?? 20 * 60 * 1000);

const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

// Build-priority order: the ford lane first (all north pressure exits there), then
// the flanks, then the south face. Interleaved gun/slow so early waves meet both.
const FORT = [
  { what: 'turret', x: 3, z: 8 },          // ford lane east
  { what: 'sentry_beacon', x: 0, z: 7 },   // the ford exit slow
  { what: 'turret', x: -3, z: 8 },         // ford lane west
  { what: 'sentry_beacon', x: 6, z: 11 },  // east flank
  { what: 'sentry_beacon', x: -6, z: 11 }, // west flank
  { what: 'turret', x: 5, z: 15 },         // southeast (clear of claim house at 10.5,14.5)
  { what: 'sentry_beacon', x: 0, z: 10 },  // center lane, inside every gun's arc
  { what: 'turret', x: -4, z: 14 },        // southwest (clear of working camp at -8.5,16.5)
  { what: 'sentry_beacon', x: 0, z: 18 },  // south face
  { what: 'sentry_beacon', x: 3, z: 18 },  // south face east
];

// prospectors_luck is the only economy mover for an agent (+10 capacity, -5s respawn);
// beacon_dynamo feeds six beacons; plating/heal keep the stationary hero alive; the
// rig upgrades sharpen the claim's own point defense. pan_legend/spring_heels are
// worthless headless and stay off the list.
const PICKS = [
  'prospectors_luck', 'beacon_dynamo', 'tinkers_plating',
  'double_tap_coil', 'heavy_spark', 'split_spark', 'long_resonator',
  'field_dressing', 'assay_bonus', 'sharpen',
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const posOf = (entry) => entry.position ?? { x: entry.x, z: entry.z };

function fortOrders(now) {
  const entries = now.works.entries ?? [];
  const counts = { turret: 0, sentry_beacon: 0 };
  for (const entry of entries) if (entry.id in counts) counts[entry.id] += 1;
  const queuedCounts = { ...counts };
  const orders = [];
  for (const piece of FORT) {
    const standingHere = entries.some((e) => e.id === piece.what && dist(posOf(e), piece) < 2.5);
    if (standingHere) continue;
    const table = piece.what === 'turret' ? TURRET_COSTS : BEACON_COSTS;
    const cost = table[Math.min(queuedCounts[piece.what], table.length - 1)];
    queuedCounts[piece.what] += 1;
    orders.push({ verb: 'BUILD', what: piece.what, where: { x: piece.x, z: piece.z }, when: { goldGte: cost } });
  }
  return orders;
}

function panChain(now, budget) {
  const live = now.seams.filter((s) => s.active && s.remaining > 0 && s.x !== null && s.z !== null);
  const chain = [];
  let at = now.prospector ?? { x: 0, z: 12 };
  const used = new Set();
  let left = Math.max(0, budget);
  while (left > 0) {
    const next = live.filter((s) => !used.has(s.id)).sort((a, b) => dist(a, at) - dist(b, at))[0];
    if (!next) break;
    used.add(next.id);
    const want = Math.min(left, Math.ceil(next.remaining / 5) + 1); // +1 buys the dry-seam surprise turn
    for (let i = 0; i < want; i += 1) chain.push({ verb: 'HARVEST', seam: next.id });
    left -= want;
    at = { x: next.x, z: next.z };
  }
  return chain;
}

function orders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const script = [];
  if (now.pendingOffer) {
    const pick = PICKS.find((id) => now.pendingOffer.some((offer) => offer.id === id)) ?? now.pendingOffer[0].id;
    script.push({ verb: 'PICK_UPGRADE', id: pick });
  }
  script.push(...fortOrders(now));
  const entries = now.works.entries ?? [];
  const hurt = entries.filter((e) => e.wrecked || (e.maxHp > 0 && (e.hp / e.maxHp) * 100 < 60)).length;
  for (let i = 0; i < Math.min(hurt, 3); i += 1) script.push({ verb: 'REPAIR_UNDER', pct: 60 });
  script.push(...panChain(now, 32 - script.length));
  return script.slice(0, 32);
}

// ── DRIVER ──────────────────────────────────────────────────────────────────────

const simArgs = ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', SEED];
if (TAPE) simArgs.push('--tape', TAPE);
const child = spawn(process.execPath, simArgs, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
const wall = setTimeout(() => {
  process.stderr.write('rider: wall clock exceeded, killing sim (DNF)\n');
  child.kill();
  process.exitCode = 1;
}, WALL_MS);

const log = (line) => {
  process.stderr.write(`${line}\n`);
  if (LOG) appendFileSync(LOG, `${line}\n`);
};
if (LOG) writeFileSync(LOG, '');
if (VIEWS) writeFileSync(VIEWS, '');

child.stderr.on('data', (d) => {
  for (const line of d.toString().split('\n')) {
    if (line.includes('rejected orders')) log(`REJECTED ${line}`);
  }
});

let turns = 0;
let outcome = null;
for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (VIEWS) appendFileSync(VIEWS, `${line}\n`);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    process.stdout.write(`${line}\n`);
    continue;
  }
  const now = message.now;
  const script = orders(message);
  log(`t${turns} s${now.timers.runSeconds.toFixed(0)} w${now.wave} gold=${Math.round(now.gold)} hp=${Math.round(now.hero.hp)}`
    + ` works=${now.works.standing}/${now.works.standing + now.works.wrecked} alive=${now.threats.alive}`
    + ` pros=(${now.prospector ? `${now.prospector.x.toFixed(0)},${now.prospector.z.toFixed(0)}` : '-'})`
    + ` orders=${script.length}${now.pendingSecure ? ' SECURE' : ''}${now.pendingOffer ? ' OFFER' : ''}${now.needsRider ? ' NEEDS' : ''}`);
  turns += 1;
  if (!child.stdin.writable || child.stdin.destroyed) continue;
  try {
    child.stdin.write(`${JSON.stringify(script)}\n`);
  } catch {
    // gr-sim closes stdin the moment the run terminates; a lost final line is not an error.
  }
}
child.stdin.end();
clearTimeout(wall);
const code = await new Promise((resolve) => child.on('close', resolve));
log(`rider: ${turns} turns, gr-sim rc=${code}, secured=${outcome?.secured ?? 'none'}`);
if (!outcome?.secured) process.exitCode = 1;
