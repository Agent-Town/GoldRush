#!/usr/bin/env node

/**
 * THE CLAIM PROVER — a minimal SECURING rider for E1 `the-claim`, through the plain public door.
 *
 * Written for the assay happy-path end-to-end (2026-08-22). Every order below is a public verb
 * from `public/skill.md` / `src/agent/StandingOrders.ts`, sent on stdin to an ordinary
 * `node scripts/gr-sim.mjs --contract the-claim --seed <seed> --tape <path>` process. No debug
 * seam, no balance edit, no private handle.
 *
 * DETERMINISM IS THE POINT: the rider is a pure function of the view stream. No clock, no random,
 * no environment read. The sim is deterministic, so the same seed yields the same views, the same
 * orders, the same tape bytes and the same eventLogHash on every run.
 *
 * THE PLAN. `the-claim` posts its secure at wave 10 (`mechanics.posting.waves`). The claim sits at
 * (0,12); three of six gold seams are live at any moment. Turrets cost 50/70/95/125 and reach
 * 16wu, palisades cost 10 flat. So: pan the nearest live seam for money, and every time the purse
 * can afford the next piece of the fort, walk to the spot and plant it. A BUILD does not auto-walk
 * (skill.md), which is why each build turn is MOVE_TO-then-BUILD at the same coordinate.
 *
 * Silence is a legal move at the two clocks: an unanswered upgrade draft takes the first offer and
 * an unanswered secure boundary takes the configured default (`bank`), both exactly as the browser
 * clock behaves. This rider answers `SECURE_CHOICE bank` explicitly rather than relying on it.
 *
 * Usage: node artifacts/assay-e2e-20260822/claim-prover.mjs --seed e1-the-claim-01 --tape <path>
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};

const seed = flag('seed', 'e1-the-claim-01');
const contract = flag('contract', 'the-claim');
const tape = flag('tape', undefined);

const CLAIM = { x: 0, z: 12 };

/**
 * THE FORT, in build order. Turret costs 50/70/95/125 and shoots 16wu; the sentry beacon costs
 * 25/35/45 and slows everything inside 8wu; palisade is 10 flat and only soaks. Guns before walls:
 * on `the-claim` the run is lost to damage taken, not to ground given.
 */
const PLAN = [
  { what: 'turret', where: { x: 3, z: 10 }, cost: 50 },
  { what: 'sentry_beacon', where: { x: 0, z: 12 }, cost: 25 },
  { what: 'turret', where: { x: -3, z: 10 }, cost: 70 },
  { what: 'turret', where: { x: 0, z: 15 }, cost: 95 },
  { what: 'sentry_beacon', where: { x: 0, z: 8 }, cost: 35 },
  { what: 'turret', where: { x: 0, z: 9 }, cost: 125 },
  { what: 'palisade', where: { x: 3, z: 14 }, cost: 10 },
  { what: 'palisade', where: { x: -3, z: 14 }, cost: 10 },
  { what: 'palisade', where: { x: 3, z: 6 }, cost: 10 },
  { what: 'palisade', where: { x: -3, z: 6 }, cost: 10 },
];

/**
 * ONE HARVEST ORDER IS ONE PAN. `StandingOrders.execute` marks a successful HARVEST `done`, and a
 * done record is skipped for the rest of that order set (`tick`: `if (record.status === 'done')
 * continue`), so a single standing HARVEST pays exactly `Balance.goldSeam.tickGold` = 5 gold and
 * then falls through to HOLD. A seam holds `capacity` 30, i.e. SIX pans. The battery below asks a
 * seam for one pan more than it can pay: the refusal raises the ordinary order-failure surprise,
 * which buys the rider an extra view — and therefore an extra order set — between wave boundaries.
 */
const PAN_BATTERY = 7;

/** Upgrades, most useful first; anything unlisted falls back to the offer's own order. */
const UPGRADE_PREFERENCE = [
  'tinkers_plating', 'heavy_spark', 'double_tap_coil', 'split_spark', 'prospectors_luck',
  'spring_heels', 'pan_legend',
];

/** Deterministic seam choice: nearest live seam to the claim, ties broken by id. */
function nearestSeam(view) {
  const live = (view.now.seams ?? []).filter((seam) => seam.active && typeof seam.x === 'number' && seam.remaining > 0);
  if (!live.length) return null;
  const distance = (seam) => (seam.x - CLAIM.x) ** 2 + (seam.z - CLAIM.z) ** 2;
  return live.slice().sort((a, b) => distance(a) - distance(b) || a.id.localeCompare(b.id))[0];
}

/** The next unbuilt plan entry, decided from the works census the view already publishes. */
function nextBuild(view) {
  const built = { ...(view.now.works?.byKind ?? {}) };
  for (const entry of PLAN) {
    const have = built[entry.what] ?? 0;
    if (have > 0) { built[entry.what] = have - 1; continue; }
    return entry;
  }
  return null;
}

function orderFor(view) {
  /**
   * THE SECURE WINDOW, AND WHY THIS RIDER SAYS NOTHING IN IT.
   *
   * Two separate rules meet here, and both were measured on 2026-08-22:
   *
   * 1. `StandingOrders.submit` refuses any array that is not a LONE `SECURE_CHOICE` while
   *    `pendingSecure` is live, and gr-sim answers a refusal by re-emitting the same view — so a
   *    rider that keeps its fort orders attached refuses forever and hangs the ride.
   *
   * 2. F-ASSAY-E2E-2: an accepted `SECURE_CHOICE` at the boundary is recorded at
   *    `t = round(timeAlive * 30)`, which at the terminal equals `durationTicks` exactly — and the
   *    county's own `validTapeEntries` caps an entry at `durationTicks - 1`. Answering out loud
   *    therefore builds a tape the standings endpoint refuses with HTTP 400 `bad_payload`.
   *
   * Silence is the door's documented alternative ("Silence for the difficulty's 30/20/10-second
   * choice clock takes the configured default and increments `defaultedSecure`"), the default is
   * `bank`, and it is the only shape that both secures AND submits. `--secure-verb` restores the
   * explicit order for reproducing finding 2.
   */
  if (view.now.pendingSecure) {
    return argv.includes('--secure-verb') ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }] : null;
  }

  const orders = [{ verb: 'REPAIR_UNDER', pct: 60 }];

  // A live upgrade draft: the ranked pick, else the offer's own first entry (the clock's default).
  const offer = view.now.pendingOffer;
  if (Array.isArray(offer) && offer.length) {
    const ranked = offer.slice().sort((a, b) => {
      const rank = (id) => { const at = UPGRADE_PREFERENCE.indexOf(id); return at < 0 ? UPGRADE_PREFERENCE.length : at; };
      return rank(a.id) - rank(b.id);
    });
    orders.push({ verb: 'PICK_UPGRADE', id: ranked[0].id });
  }

  // A BUILD does not auto-walk, so the walk is ordered before it at the same coordinate.
  const build = nextBuild(view);
  const gold = view.now.gold ?? 0;
  if (build && gold >= build.cost) {
    orders.push({ verb: 'MOVE_TO', pos: build.where });
    orders.push({ verb: 'BUILD', what: build.what, where: build.where, when: { goldGte: build.cost } });
  }

  const seam = nearestSeam(view);
  if (seam) for (let pan = 0; pan < PAN_BATTERY; pan += 1) orders.push({ verb: 'HARVEST', seam: seam.id });

  orders.push({ verb: 'HOLD', pos: CLAIM });
  return orders.slice(0, 32);
}

const simArgs = ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=stdin'];
if (tape) simArgs.push('--tape', tape);
const sim = spawn(process.execPath, simArgs, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });

let outcome = null;
let turns = 0;
let lastKey = null;
const rejections = [];

createInterface({ input: sim.stderr, crlfDelay: Infinity }).on('line', (line) => {
  if (line.includes('rejected orders')) rejections.push(line);
  process.stderr.write(`${line}\n`);
});

createInterface({ input: sim.stdout, crlfDelay: Infinity }).on('line', (line) => {
  let parsed;
  try { parsed = JSON.parse(line); } catch { return; }
  if (parsed.schema !== 'goldrush.view.v1') { outcome = parsed; return; }
  turns += 1;
  const orders = orderFor(parsed);
  // `null` is the stand-down: an empty line lets `readOrders` return without submitting, so the
  // clock takes the configured default and nothing is written into the tape at that tick.
  if (orders === null) {
    lastKey = null;
    try { sim.stdin.write('\n'); } catch { /* the ride is over */ }
    return;
  }
  if (argv.includes('--trace')) {
    const now = parsed.now;
    process.stderr.write(`TRACE wave=${now.wave} t=${Math.round(now.timers.runSeconds)} gold=${now.gold} hero=${now.hero.hp}/${now.hero.maxHp} `
      + `works=${JSON.stringify(now.works.byKind)} standing=${now.works.standing} wrecked=${now.works.wrecked} `
      + `threats=${now.threats.alive}/${now.threats.state} claimHp=${now.works.hp}/${now.works.maxHp} `
      + `offer=${(now.pendingOffer ?? []).map((o) => o.id).join('|')} secure=${now.pendingSecure ? 'YES' : '-'} `
      + `-> ${JSON.stringify(orders.map((o) => o.verb + (o.what ? ':' + o.what : '')))}\n`);
  }
  /**
   * A REFUSAL IS ANSWERED WITH SILENCE, NOT WITH THE SAME ARRAY AGAIN. gr-sim re-emits the current
   * view when it refuses a submission, so a rider that recomputes the identical array from the
   * identical view refuses forever and the ride never advances (measured: it hung this prover for
   * nine minutes on the secure window). An empty line is the door's own stand-down: `readOrders`
   * returns without submitting, the previous order set stays in force, and the sim moves on.
   */
  const key = `${parsed.now.wave}:${parsed.now.timers.runSeconds}:${JSON.stringify(orders)}`;
  const reply = key === lastKey ? '' : JSON.stringify(orders);
  lastKey = key;
  try { sim.stdin.write(`${reply}\n`); } catch { /* the ride is over */ }
});

sim.on('exit', (code) => {
  process.stdout.write(`${JSON.stringify({
    contract, seed, turns, rejections: rejections.length, exit: code, outcome,
  }, null, 2)}\n`);
  process.exitCode = code ?? 1;
});
