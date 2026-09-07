/**
 * AP-16-8b — the e6-showroom CAPTURE-LOOP measurement.
 *
 * `e2e/ap16-8-admission-probe.mjs` fires CAPTURE POSITION-BLIND: "if any machine anywhere is
 * exhausted, submit CAPTURE", with no movement toward it. `WrangleSystem.tryCapture`
 * (src/systems/WrangleSystem.ts:123-147) only ever catches the NEAREST exhausted machine inside
 * `Balance.wrangle.captureRadius` (2.2), measured from `this.prospector.position`
 * (src/sim/HeadlessContractSim.ts:544). So the standing "e6-showroom false green" evidence
 * never tested COMPETENT play — only opportunistic play, where a machine happened to wander
 * into arm's reach of a stationary Prospector.
 *
 * This probe answers the open question with numbers, not opinion:
 *   does a position-AWARE capture policy un-saturate `Balance.waves.aliveCap` (60),
 *   or does exhaustion-generation genuinely outpace ideal one-at-a-time capture?
 *
 * It changes NO production code. It reads the same privileged internals the ap16-8 probe reads
 * (`AtomicSocket.diagnostics.wrangle`), plus the enemy pool and the Prospector's own position —
 * exactly the knowledge a real agent does NOT have today (`src/agent/View.ts` `now.threats` is
 * counts only). That gap is the point: this measures the CEILING an ideal informed policy could
 * reach, so the owner can decide whether the View is worth extending.
 *
 * Policies (all deterministic, all driven at the fixed-step grain):
 *   idle  — no orders at all. Reproduces the ap16-8 `idle` control under this instrumentation.
 *   blind — the ap16-8 scripted policy: CAPTURE whenever anything anywhere is exhausted,
 *           builds + harvests + HOLD. Position-blind. The CONTROL.
 *   hunt  — position-AWARE. Nearest exhausted machine -> MOVE_HERO to its live position ->
 *           CAPTURE once inside `captureRadius`. Nothing else while a machine stands
 *           exhausted; falls back to the blind policy's economy orders when the board is clean.
 *
 * Usage: node e2e/ap16-8b-capture-loop-probe.mjs [--policies=idle,blind,hunt] [--seeds=01,02]
 *                                                [--repeats=2] [--contract=e6-showroom]
 * Emits one JSON line per run on stdout (prefix `RUN `) and one `SERIES ` line carrying the
 * sampled cap-occupancy curve.
 */
import { createServer } from 'vite';

const argv = Object.fromEntries(process.argv.slice(2)
  .filter((arg) => arg.startsWith('--'))
  .map((arg) => { const at = arg.indexOf('='); return at === -1 ? [arg.slice(2), 'true'] : [arg.slice(2, at), arg.slice(at + 1)]; }));

const CONTRACT = argv.contract ?? 'e6-showroom';
const POLICIES = (argv.policies ?? 'idle,blind,hunt,balanced').split(',');
const SUFFIXES = (argv.seeds ?? '01,02').split(',');
const REPEATS = Number(argv.repeats ?? 2);
// Re-plan cadence, in fixed steps. 15 = 2 Hz: far faster than a human, and far faster than the
// 0.2x crawl of an exhausted machine, so the hunt tracks a live target rather than a stale one.
// It is NOT 30 Hz because `StandingOrdersExecutor.submit` reads the sim's FULL diagnostics and
// economy log on every call (src/agent/StandingOrders.ts:136 -> ToolSurface `readLiveState`),
// which costs more than the fixed step it would be deciding for.
const REPLAN_TICKS = Number(argv.replan ?? 15);
const SAMPLE_TICKS = Number(argv.sample ?? 30);  // cap-occupancy sample cadence (1 s), privileged reads only
const VIEW_TICKS = Number(argv.view ?? 150);     // agent-View refresh for the economy tape (5 s)

globalThis.location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}`);
globalThis.window = { location: globalThis.location };

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');

const STEP = 1 / 30;
const ALIVE_CAP = Balance.waves.aliveCap;
const CAPTURE_RADIUS = Balance.wrangle.captureRadius;
const MAX_TICKS = Math.ceil(((Balance.run.secureWave + 2) * Balance.waves.waveInterval) / STEP);
// The ap16-8 economy tape, verbatim, so `blind` and `hunt` differ ONLY in position-awareness.
const BEACONS = [{ x: 0, z: 13 }, { x: 3, z: 12 }, { x: -3, z: 12 }];
const GOLD_GATES = [25, 35, 45];
// `fortify` tape: two rings around the hero's start (0, 12) — all inside the
// `model-home-village` build zone (x[-50,50], z[-24,32]). The hero is auto-piloted here
// (`IDLE_INTENTS`, src/sim/HeadlessContractSim.ts:428), so WORKS are the agent's only defence,
// and the appliance pen's gold is the only thing that could pay for a bigger one.
const FORT_SITES = [
  ...BEACONS.map((where) => ({ what: 'sentry_beacon', where })),
  ...[[8, 12], [-8, 12], [0, 20], [0, 4], [5.7, 17.7], [-5.7, 17.7], [5.7, 6.3], [-5.7, 6.3]]
    .map(([x, z]) => ({ what: 'sentry_beacon', where: { x, z } })),
  ...[[14, 12], [-14, 12], [0, 26], [0, -2], [9.9, 21.9], [-9.9, 21.9], [9.9, 2.1], [-9.9, 2.1]]
    .map(([x, z]) => ({ what: 'turret', where: { x, z } })),
];

/** The privileged read: exhausted machines with the positions the agent View does not carry. */
function exhaustedMachines(sim) {
  const active = sim.atomic?.diagnostics.wrangle.active ?? [];
  if (active.length === 0) return [];
  const byId = new Map();
  for (const enemy of sim.enemies.all) if (enemy.isAlive) byId.set(enemy.id, enemy);
  const out = [];
  for (const entry of active) {
    if (entry.state !== 'exhausted') continue;
    const enemy = byId.get(entry.enemyId);
    if (enemy) out.push({ id: entry.enemyId, x: enemy.position.x, z: enemy.position.z });
  }
  // Deterministic tie-break: the pool's own id order, never Map iteration luck.
  return out.sort((left, right) => left.id - right.id);
}

function buildOrders(view) {
  const beaconsUp = view.works.byKind.sentry_beacon ?? 0;
  // BUILD is resolved by `place_building` at `order.where` with NO distance test
  // (src/agent/StandingOrders.ts:262-266), so a builder order costs one fixed step and never
  // competes with movement. That is what lets `balanced` defend and hunt at the same time.
  return BEACONS.slice(beaconsUp).map((where, index) => ({ verb: 'BUILD', what: 'sentry_beacon', where, when: { goldGte: GOLD_GATES[index] } }));
}

/** Only the sites nothing already stands on — a failed BUILD burns the tick it fires in. */
function fortifyOrders(view) {
  const standing = view.works.entries.filter(({ wrecked }) => !wrecked);
  return FORT_SITES
    .filter(({ where }) => !standing.some((work) => Math.hypot(work.position.x - where.x, work.position.z - where.z) < 1.5))
    .map(({ what, where }) => ({ verb: 'BUILD', what, where, when: { goldGte: what === 'turret' ? 60 : 30 } }));
}

function economyOrders(sim, view) {
  return [
    ...buildOrders(view),
    ...view.seams.filter(({ active, remaining }) => active && remaining > 0).map(({ id }) => ({ verb: 'HARVEST', seam: id })),
    { verb: 'MOVE_HERO', pos: { x: 0, z: 12 } },
  ];
}

function plan(policy, sim, view, stats) {
  if (policy === 'idle') return null;
  const offer = sim.progression.offer;
  if (offer?.[0]) return [{ verb: 'PICK_UPGRADE', id: offer[0].id }];

  if (policy === 'blind') {
    const anyExhausted = (sim.atomic?.diagnostics.wrangle.active ?? []).some(({ state }) => state === 'exhausted');
    if (anyExhausted) stats.capturePlans += 1;
    return [...(anyExhausted ? [{ verb: 'CAPTURE' }] : []), ...economyOrders(sim, view)].slice(0, 32);
  }

  // hunt / balanced: nearest exhausted machine to the PROSPECTOR — the position tryCapture
  // measures from (src/sim/HeadlessContractSim.ts:544).
  const machines = exhaustedMachines(sim);
  if (machines.length === 0) {
    return (policy === 'fortify' ? [...fortifyOrders(view), { verb: 'MOVE_HERO', pos: { x: 0, z: 12 } }] : economyOrders(sim, view)).slice(0, 32);
  }
  // `balanced` keeps the 3-beacon tape armed while it hunts; `fortify` keeps the full ring
  // armed and spends the pen's gold on it; `hunt` is the pure capture ceiling.
  const defence = policy === 'balanced' ? buildOrders(view) : policy === 'fortify' ? fortifyOrders(view) : [];
  const from = sim.prospector.position;
  let best = machines[0];
  let bestSq = Infinity;
  for (const machine of machines) {
    const dx = from.x - machine.x;
    const dz = from.z - machine.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < bestSq) { bestSq = distanceSq; best = machine; }
  }
  stats.huntTicks += 1;
  if (bestSq <= CAPTURE_RADIUS * CAPTURE_RADIUS) {
    stats.inRangeTicks += 1;
    stats.capturePlans += 1;
    return [{ verb: 'CAPTURE' }, ...defence, { verb: 'MOVE_HERO', pos: { x: best.x, z: best.z } }].slice(0, 32);
  }
  stats.travelTicks += 1;
  return [...defence, { verb: 'MOVE_HERO', pos: { x: best.x, z: best.z } }].slice(0, 32);
}

function sample(sim) {
  const wrangle = sim.atomic?.diagnostics.wrangle;
  const active = wrangle?.active ?? [];
  let exhausted = 0;
  let windingDown = 0;
  for (const entry of active) { if (entry.state === 'exhausted') exhausted += 1; else windingDown += 1; }
  return {
    t: Math.round(sim.timeAlive * 10) / 10,
    wave: sim.waves.diagnostics.wave,
    alive: sim.enemies.activeCount,
    exhausted,
    windingDown,
    pen: wrangle?.pen.total ?? 0,
    exhaustionEvents: sim.atomic?.diagnostics.exhausted ?? 0,
    kills: sim.kills,
  };
}

function runOnce(policy, seed) {
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed, admissionProbe: true });
  const stats = { capturePlans: 0, huntTicks: 0, travelTicks: 0, inRangeTicks: 0 };
  const series = [sample(sim)];
  let view = sim.currentTurn().view.now;
  let tick = 0;
  let error = null;

  try {
    for (; tick < MAX_TICKS && !sim.isTerminal; tick += 1) {
      // `view` only feeds the economy tape (works counts + seams), which changes on the scale of
      // seconds; refreshing it every replan would dominate the run's cost for no behavioural gain.
      if (tick % VIEW_TICKS === 0 && tick > 0) view = sim.currentTurn().view.now;
      if (tick % REPLAN_TICKS === 0) {
        const orders = plan(policy, sim, view, stats);
        if (orders) sim.submitOrders(orders);
      }
      sim.advanceOneTick();
      if (tick % SAMPLE_TICKS === 0) series.push(sample(sim));
    }
  } catch (cause) {
    error = cause.message;
  }

  const last = sample(sim);
  series.push(last);
  const endView = sim.currentTurn().view.now;
  const outcome = sim.isTerminal && !error ? sim.outcome() : null;
  const secured = outcome?.secured ?? false;
  const saturated = last.alive >= ALIVE_CAP;
  const terminalKind = error ? 'error'
    : !sim.isTerminal ? 'ceiling-exceeded'
      : secured && saturated ? 'wave-20-false-green'
        : secured ? 'real-secure'
          : 'died';

  // The two RATES the owner asked for, over the run's own clock.
  const minutes = Math.max(last.t, STEP) / 60;
  return {
    row: {
      contract: CONTRACT,
      policy,
      seed,
      terminal: sim.isTerminal,
      terminalKind,
      secured,
      lawful: secured && !saturated,
      wave: outcome?.waves ?? last.wave,
      timeSeconds: last.t,
      aliveEnd: last.alive,
      alivePeak: Math.max(...series.map(({ alive }) => alive)),
      exhaustedEnd: last.exhausted,
      exhaustedPeak: Math.max(...series.map((entry) => entry.exhausted)),
      capSaturatedFromSeconds: series.find(({ alive }) => alive >= ALIVE_CAP)?.t ?? null,
      capSaturatedFromWave: series.find(({ alive }) => alive >= ALIVE_CAP)?.wave ?? null,
      capSaturatedSeconds: Math.round(series.filter(({ alive }) => alive >= ALIVE_CAP).length * SAMPLE_TICKS * STEP),
      exhaustionEvents: last.exhaustionEvents,
      captures: last.pen,
      capturePlans: stats.capturePlans,
      // Replan-derived durations: how the hunting Prospector spent the run.
      huntingSeconds: Math.round(stats.huntTicks * REPLAN_TICKS * STEP),
      travellingSeconds: Math.round(stats.travelTicks * REPLAN_TICKS * STEP),
      inRangeSeconds: Math.round(stats.inRangeTicks * REPLAN_TICKS * STEP),
      kills: last.kills,
      worksStanding: endView.works.standing,
      worksWrecked: endView.works.wrecked,
      worksByKind: endView.works.byKind,
      heroHp: endView.hero.hp,
      goldEnd: endView.gold,
      exhaustionsPerMinute: Math.round((last.exhaustionEvents / minutes) * 100) / 100,
      capturesPerMinute: Math.round((last.pen / minutes) * 100) / 100,
      deficitPerMinute: Math.round(((last.exhaustionEvents - last.pen) / minutes) * 100) / 100,
      hash: outcome?.eventLogHash ?? sim.tickHash(Math.round(sim.timeAlive * 30)),
      error,
    },
    series,
  };
}

const results = [];
for (const policy of POLICIES) {
  for (const suffix of SUFFIXES) {
    const seed = `${CONTRACT}-${suffix}`;
    let pinned = null;
    for (let repeat = 1; repeat <= REPEATS; repeat += 1) {
      const { row, series } = runOnce(policy, seed);
      const key = JSON.stringify(row);
      if (pinned === null) {
        pinned = key;
        results.push(row);
        console.log(`RUN ${key}`);
        console.log(`SERIES ${JSON.stringify({ policy, seed, samples: series })}`);
      } else if (pinned !== key) {
        console.log(`NONDETERMINISM ${policy} ${seed} repeat=${repeat}`);
        console.log(`  first  ${pinned}`);
        console.log(`  repeat ${key}`);
        process.exitCode = 1;
      } else {
        console.log(`REPEAT-IDENTICAL ${policy} ${seed} repeat=${repeat}`);
      }
    }
  }
}

console.log(`SUMMARY ${JSON.stringify({ aliveCap: ALIVE_CAP, captureRadius: CAPTURE_RADIUS, moveSpeed: Balance.agent.moveSpeed, windDownSeconds: Balance.wrangle.windDownSeconds, replanHz: 30 / REPLAN_TICKS, rows: results.length })}`);
await vite.close();
