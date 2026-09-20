/**
 * THE ECLIPSE RIDER, current grammar — A1 (owner 2026-09-19, verbatim: "I agree with all your
 * recommendations on the decisions - good work", taking (a): the Eclipse gets the Mare Claim's
 * numbers).
 *
 * WHY THIS FILE EXISTS. `artifacts/eclipse-winnable/prover.mjs` (2026-09-06) can no longer ride:
 * its turn arrays carry `MOVE_TO` and `HOLD`, which ADR-005 stage 3 RETIRED, and an array with one
 * unknown verb is refused ENTIRELY (`public/skill.md`: "failing validation on any order refuses the
 * entire array and installs none of it"), so the rider stands still and gr-sim runs to the prover's
 * own 400-turn stall guard. Measured on this tree, 2026-09-19: `ride stalled: 400 turns without
 * terminating`. That is F-RP-2 in the report — a stale instrument, not a regression, and the 2026-
 * 09-06 prover is left byte-untouched because it is the record of what was measured then.
 *
 * THIS IS THE SAME POLICY, ported. Every decision below is the old prover's, with its two retired
 * verbs replaced by the one body-positioning verb the grammar still has:
 *
 *   `MOVE_TO <pos>` + `HOLD <pos>`  ->  `MOVE_HERO <pos>`
 *
 * and that substitution is not a workaround, it is the engine's own shape since 2026-09-07: the
 * HERO breathes (`E8HumanSuit`), `HeadlessContractSim` credits a pan against ACTOR 0's suit — the
 * hero's — and the Prospector drifts to the hero when it has no work. So the hero holds the centre
 * dome, where its suit stays full, and the Prospector is dispatched to grounds by `HARVEST`. The
 * WINDOW is then the whole wall, which is exactly the thing A1 is about.
 *
 * Nothing here mints gold, imports an engine, edits a contract or touches `Balance`. It drives
 * `scripts/gr-sim.mjs` as a separate process over the door's published vocabulary.
 *
 *   node artifacts/rulings-play-2026-09-19/eclipse-rider.mjs [--contract e8-eclipse] [--seed <id>] [--tape <path>]
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const ORDER_CAP = 32;
const PAN_BLOCK = 7;
const PAN_TAIL_RESERVE = 1; // the one MOVE_HERO that ends every turn (was 2: MOVE_TO + HOLD).
const AGENT_SPEED = 4.8;
const AIR_MARGIN = 10;
const MAX_TURNS = 400;
const TURRET_TIER_COSTS = [60, 120, 240, 480, 960];
/** The 2026-09-06 prover's draft list, verbatim. */
const DRAFT = [
  'tinkers_plating', 'beacon_dynamo', 'heavy_spark', 'double_tap_coil', 'split_spark',
  'long_resonator', 'powder_charge', 'wide_ring', 'quick_fuse', 'sharpen', 'field_dressing',
];
/** The hero's post: the centroid of the ten works `dome-cluster-pad-center` can hold, and inside the eclipse RESERVE, so the suit stays full when the shadow takes the rim pads. */
const POST = { x: 0, z: 4 };
const BLAST_AT = { x: 0, z: 14 };
/** The Mare Claim's own ten, verbatim (F-MCAP-6 geometry). */
const DEFENCE = [
  { what: 'turret', where: { x: -3, z: 1 } },
  { what: 'turret', where: { x: 3, z: 1 } },
  { what: 'turret', where: { x: -6, z: 2 } },
  { what: 'turret', where: { x: 6, z: 2 } },
  { what: 'sentry_beacon', where: { x: -1, z: 6 } },
  { what: 'sentry_beacon', where: { x: 1, z: 6 } },
  { what: 'sentry_beacon', where: { x: -3, z: 6 } },
  { what: 'sentry_beacon', where: { x: 3, z: 6 } },
  { what: 'sentry_beacon', where: { x: -5, z: 6 } },
  { what: 'sentry_beacon', where: { x: 5, z: 6 } },
];

const away = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const round2 = (v) => (Number.isFinite(v) ? Number(v.toFixed(2)) : null);

function planOrders(view, prices, trace) {
  const now = view.now;
  const air = now.air;
  const gold = now.gold ?? 0;
  const body = now.prospector ?? POST;
  if (!air) return [{ verb: 'MOVE_HERO', pos: POST }];
  const suit = air.suit.seconds;
  const orders = [];

  // 0. THE FREE DAMAGE, unchanged.
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: BLAST_AT });

  // 1. THE CREDIT: a ground never worked, panned while the hero's suit holds air, at most one per
  //    window. `creditedThisWindow > 0` means this window is spent and a fresh ground would only
  //    be held back as a `windowHeldPan`.
  const liveSeams = (now.seams ?? []).filter((seam) => seam.active && seam.x !== null && seam.remaining > 0);
  const worked = new Set(air.regolith.worked);
  const owesCredit = !air.regolith.complete
    && worked.size < air.regolith.required
    && (air.regolith.creditedThisWindow ?? 0) === 0;
  const fresh = liveSeams
    .filter((seam) => seam.anchorIndex !== null && !worked.has(seam.anchorIndex))
    .sort((left, right) => away(body, left) - away(body, right));
  const seam = fresh[0] ?? null;
  const sortieSeconds = seam ? (away(body, seam) + away(seam, POST)) / AGENT_SPEED : Infinity;
  let plan = 'work';
  if (owesCredit && seam !== null && suit >= sortieSeconds + AIR_MARGIN) {
    plan = 'credit';
    orders.push({ verb: 'HARVEST', seam: seam.id });
  }

  // 2. THE GUNS, before the gold (a capped purse is a lost margin).
  const standing = now.works?.byKind ?? {};
  const nextSite = DEFENCE.find((site) => {
    const sites = DEFENCE.filter((entry) => entry.what === site.what);
    const up = standing[site.what] ?? 0;
    return up < sites.length && sites[up] === site;
  });
  const ladder = nextSite ? prices[nextSite.what] ?? [] : [];
  const nextPrice = nextSite ? ladder[Math.min(standing[nextSite.what] ?? 0, ladder.length - 1)] ?? null : null;
  if (nextSite && nextPrice !== null) orders.push({ verb: 'BUILD', what: nextSite.what, where: nextSite.where, when: { goldGte: nextPrice } });

  // 2b. THE SINK: the turret tier. `CONTEXT_ACTION` does not travel, so the walk goes in front —
  //     now as a MOVE_HERO, because the Prospector follows the hero and every site is in the dome.
  const turrets = (now.works?.entries ?? [])
    .filter((entry) => entry.id === 'turret' && !entry.wrecked && entry.tier < TURRET_TIER_COSTS.length)
    .sort((left, right) => left.tier - right.tier || left.index - right.index);
  const upgrade = turrets[0];
  if (upgrade && gold >= TURRET_TIER_COSTS[upgrade.tier]) {
    orders.push({ verb: 'MOVE_HERO', pos: upgrade.position });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: upgrade.index } });
  }

  // 3. THE GOLD. Any live seam pays: the window gates the LATCH, never the purse.
  const byDistance = [...liveSeams].sort((left, right) => away(body, left) - away(body, right));
  const room = Math.max(0, ORDER_CAP - orders.length - PAN_TAIL_RESERVE);
  const pans = byDistance.length === 0 ? 0 : room;
  for (let slot = 0; slot < pans; slot += 1) {
    orders.push({ verb: 'HARVEST', seam: byDistance[Math.floor(slot / PAN_BLOCK) % byDistance.length].id });
  }

  // 4. THE POST, last. The hero holds the centre dome so its suit never empties and every pan the
  //    Prospector makes is a pan on air; an arrived MOVE_HERO completes on the tick and a hero told
  //    nothing stays put, so this is one order rather than a leash.
  orders.push({ verb: 'MOVE_HERO', pos: POST });
  trace?.push({
    wave: now.wave, runSeconds: now.timers?.runSeconds ?? null, gold,
    suit, inDome: air.suit.inDome,
    window: air.regolith.window, windowWaves: air.regolith.windowWaves,
    creditedThisWindow: air.regolith.creditedThisWindow,
    worked: [...air.regolith.worked], required: air.regolith.required,
    grounds: air.regolith.grounds, held: air.regolith.windowHeldPans,
    breathless: air.regolith.breathlessPans, runsOnAir: air.regolith.runsOnAir,
    complete: air.regolith.complete,
    ...(air.eclipse ? { solar: air.eclipse.solar, after: `${air.eclipse.groundsWorkedAfter}/${air.eclipse.requiredAfter}` } : {}),
    works: { ...(now.works?.byKind ?? {}) }, heroHp: now.hero?.hp ?? null,
    heroAt: now.hero ? { x: round2(now.hero.x), z: round2(now.hero.z) } : null,
    threats: now.threats?.alive ?? null,
    plan, target: seam?.id ?? null, sortieSeconds: round2(sortieSeconds), pans,
  });
  return orders.slice(0, ORDER_CAP);
}

async function ride(contract, seed, { tape, trace }) {
  const args = ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed];
  if (tape) args.push('--tape', tape);
  const child = spawn(process.execPath, args, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const prices = {};
  let outcome = null;
  let turns = 0;
  let picks = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.now === undefined) { outcome = message; continue; }
    turns += 1;
    if (turns > MAX_TURNS) { child.kill(); throw new Error(`ride stalled: ${MAX_TURNS} turns without terminating (see F-MCAP-1)`); }
    for (const buildable of message.stablePrefix?.mechanics?.buildables ?? []) prices[buildable.id] = buildable.costs;
    // The secure window answers ALONE (F-MCAP-1): any other array is refused while it is open.
    if (message.now.pendingSecure) { child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`); continue; }
    const plan = planOrders(message, prices, trace);
    const offer = message.now.pendingOffer;
    if (Array.isArray(offer) && offer.length > 0) {
      picks += 1;
      const ids = offer.map((entry) => (typeof entry === 'string' ? entry : entry.id));
      const id = DRAFT.find((preferred) => ids.includes(preferred)) ?? ids[0];
      child.stdin.write(`${JSON.stringify([{ verb: 'PICK_UPGRADE', id }, ...plan].slice(0, ORDER_CAP))}\n`);
      continue;
    }
    child.stdin.write(`${JSON.stringify(plan)}\n`);
  }
  child.stdin.end();
  const code = await new Promise((resolve) => child.on('close', resolve));
  const refusals = stderr.join('').match(/rejected orders:[^\n]*/g) ?? [];
  return { seed, exitCode: code, turns, picks, outcome, refusals: [...new Set(refusals)] };
}

const argv = process.argv.slice(2);
const read = (flag, fallback) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : fallback; };
const contract = read('--contract', 'e8-eclipse');
const seed = read('--seed', `${contract}-01`);
const tape = read('--tape', null);
const trace = [];
const result = await ride(contract, seed, { tape, trace });
const latch = trace.find((row) => row.complete) ?? null;
console.log(JSON.stringify({
  contract, seed, ...result,
  gate: { required: trace[0]?.required ?? null, windowWaves: trace[0]?.windowWaves ?? null, grounds: trace[0]?.grounds ?? null },
  latchClosedAt: latch ? { runSeconds: latch.runSeconds, wave: latch.wave, worked: latch.worked, window: latch.window } : null,
  windowsSeen: trace.length ? Math.max(...trace.map((row) => row.window)) : null,
  windowHeldPans: trace.length ? Math.max(...trace.map((row) => row.held)) : null,
  breathlessPans: trace.length ? Math.max(...trace.map((row) => row.breathless)) : null,
  runsOnAir: trace.length ? Math.max(...trace.map((row) => row.runsOnAir)) : null,
  trace,
}, null, 1));
