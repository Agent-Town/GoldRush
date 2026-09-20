#!/usr/bin/env node

/**
 * THE RAILCAR PROVER — the run that re-admitted the E2 railcar trio (2026-08-20).
 *
 * WHAT IT PROVES, and what it deliberately does not:
 *   It boots `HeadlessContractSim` under a DECLARED progressed profile — the state a browser player
 *   holds the morning after beating the Baron — and then plays with nothing but the public standing-
 *   order grammar (`src/agent/StandingOrders.ts`: HARVEST, HOLD, BUILD, SECURE_CHOICE). No admission
 *   escape hatch beyond `admissionProbe` while the trio is still exempt, no private handles, no
 *   balance edits, and — the F-1741 rejection reason, stated as a rule — NO minted pressure: every
 *   unit of it is made by a boiler burning coal a body walked to and picked up.
 *
 * THE DECLARATION (§"declare" below), which is the whole point:
 *   The owner's ruling is that a run's progression is DECLARED, not minted. So this harness writes a
 *   profile through the REAL modules — `Medals.awardBaronMedal`, `ResearchTree.takeNode` — and hands
 *   it to the sim as injected storage, exactly as `scripts/gr-sim-campaign.mjs:88` already does. The
 *   sim reads it through the browser's own gates (`Game.ts:1372-1381`). Two facts are declared:
 *     1. the Baron medal (baronBeaten + rocketCartCaptured) — `sky_rocket_battery` is unreachable
 *        without the capture flag, and the sky rocket's own shooter re-checks the medal at fire time;
 *     2. five research nodes, taken one at a time through `availablePicks`/`takeNode` with the
 *        player's own re-roll (`skipResearchPick`) — never written into `taken[]` by hand:
 *          E1  chain_spark_primer -> beacon_cadence -> sky_rocket_battery
 *          E2  boiler_lance -> pressure_mortar
 *   `boiler_battery` is NOT taken (F-1741-2 rejected a candidate that granted it as a side effect),
 *   and neither is any other node. The active-epoch key is set to the E2 registry — the same key the
 *   graduation ceremony writes (`ContractFamilies.ts:1119`); the E1 megaproject is not re-simulated.
 *
 * THE PLAY, in four beats:
 *   1. PAN. Gold first: the Prospector works the nearest live seam, and keeps working seams whenever
 *      it has nothing else to buy. Everything below is paid for out of that.
 *   2. FORTIFY. Four turrets ringed around the hero's stake inside `base-t1`. Turret range is 16 and
 *      the rail route runs at z ~= 0, so a turret at z = 10 covers both the wave lanes AND the rail.
 *   3. STOKE. Three boiler houses, also in `base-t1`. They are the entire pressure economy: 4 coal
 *      each seam, 12 boiler-seconds per coal, 4 pressure per second. Nothing else makes pressure.
 *   4. COAL, LATE. The three coal seams are at fixed world positions and each needs a BODY standing
 *      on it. The Prospector is sent only from `COAL_WAVE` on, because coal is a fixed lifetime
 *      budget: harvested early it is burned into pressure the arsenal spends on trash long before
 *      the railcar is on the spur.
 *
 * Usage:
 *   node artifacts/e2-railcar-arsenal/prover.mjs --contract e2-hill-mine --seed e2-hill-mine-01
 *   flags: [--policy idle] [--cold] [--quiet] [--max-turns N]
 *     --cold   boots with NO declared profile (the null progression control)
 *     --policy idle  submits no orders at all (the Law-2 idle floor)
 * Prints a per-turn trace on stderr and one outcome JSON line on stdout.
 */

import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const contractId = valueOf('--contract') ?? 'e2-hill-mine';
const seed = valueOf('--seed') ?? `${contractId}-01`;
const idle = (valueOf('--policy') ?? '') === 'idle';
const cold = args.includes('--cold');
const quiet = args.includes('--quiet');
const maxTurns = Number(valueOf('--max-turns') ?? 4000);

/**
 * THE BUILD ORDER, as a list of KINDS. Pads are not written down: the hero never leaves the stake
 * it spawned on (it takes `IDLE_INTENTS`), and the three maps put that stake in three different
 * places, so the pads are generated as two rings around wherever the hero actually stands and the
 * first one that isn't taken or already refused is used. A pad that comes back
 * `FAILED (collision)` is struck off for good — that is the map answering, and it answers
 * differently on a mine bench than on a trestle approach.
 *
 * THE BOILER IS THE BEST GOLD ON THE MAP, and that is the E2 design saying so out loud: 70 gold
 * buys ~97 dps of lance+mortar+rocket, where a fourth turret costs 123 for 57. It is bought third,
 * once two turrets have made the claim safe enough to walk to the coal.
 */
const LADDERS = {
  // TWO boilers, bought together: one burns a coal every 12s, and 12 coal is 144 boiler-seconds —
  // longer than the run has left once the third seam is cut, so a single boiler ends the fight with
  // unburned coal in the bunker (measured: 384 of 576 pressure ever reached the guns).
  railcar: ['turret', 'turret', 'boiler_house', 'boiler_house', 'turret', 'turret', 'sentry_beacon',
    'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'],
  // The one that wins: two guns at home to hold the stake, the boiler pair to make the pressure,
  // then TWO GUNS ON THE RAIL — the only way a nearest-first targeter ever sees the railcar.
  battery: ['turret', 'turret', 'boiler_house', 'boiler_house', 'turret@battery', 'turret@battery',
    'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'],
  battery1: ['turret', 'turret', 'boiler_house', 'turret@battery', 'turret@battery',
    'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'],
  // Turrets cap at FOUR for the whole claim, so every gun parked at the stake is a gun the railcar
  // never meets. The stake is therefore held by beacons and by the pressure arsenal the boilers
  // feed, and all four turrets go to the rail.
  rail: ['sentry_beacon', 'sentry_beacon', 'boiler_house', 'sentry_beacon', 'boiler_house',
    'sentry_beacon', 'turret@battery', 'turret@battery', 'sentry_beacon', 'sentry_beacon',
    'turret@battery', 'turret@battery'],
  rail3: ['turret', 'boiler_house', 'boiler_house', 'sentry_beacon', 'sentry_beacon',
    'turret@battery', 'turret@battery', 'sentry_beacon', 'turret@battery', 'sentry_beacon',
    'sentry_beacon', 'sentry_beacon'],
  turrets: ['turret', 'turret', 'turret', 'turret', 'boiler_house', 'sentry_beacon', 'sentry_beacon',
    'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'],
  // THE PRESSURE-LINE OPT-OUT (2026-08-21). Every other ladder here buys a boiler, and until the
  // owner's ruling that was free of consequence on the trestle and the incline because those two
  // contracts declared no pressure line and `plan()` struck the rung out. Now the map SELLS one, so
  // the rung is bought — 70 gold and a pad — on a claim whose coal is 55-60wu from the only stake
  // the hero can hold. This is `turrets` with the boiler struck out by hand: the play a browser
  // player still has after the ruling, and the only way to measure the ruling's COST as well as its
  // gift. It is NOT a balance edit; the railcar is untouched at `hpScale` 30.
  'turrets-dry': ['turret', 'turret', 'turret', 'turret', 'sentry_beacon', 'sentry_beacon',
    'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'],
  beacons: ['sentry_beacon', 'sentry_beacon', 'turret', 'turret', 'boiler_house', 'turret', 'turret',
    'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'],
};
const BUILD_ORDER = LADDERS[valueOf('--ladder') ?? 'turrets'] ?? (() => { throw new Error('unknown ladder'); })();
const COST = { sentry_beacon: [25, 33, 43, 55, 72, 93], turret: [50, 68, 91, 123], boiler_house: [70, 70, 70] };
/**
 * PADS ARE A WIDE, SHALLOW GRID, not a ring, because that is the shape of the ground on offer:
 * `base-t1` on the hill mine is x in [-30,30] but z in [8,16] — sixty units wide and eight tall
 * around a stake at z=12, and the other two maps' approach zones are the same shape. A round ring
 * at the 6wu place radius spends a third of its pads outside the zone and the door answers
 * `FAILED (out_of_zone)`, which is the map talking rather than a bug. Fourteen candidates, every
 * one within 6wu of the stake (the turret place radius) and at least 2.5wu from its neighbours
 * (every buildable here has `overlapRadius` 1.2), shallow rows first.
 */
const PAD_GRID = [0, -2.5, 2.5].flatMap((dz) => [-2.7, 2.7, -5.4, 5.4, 0].map((dx) => ({ dx, dz })))
  .filter(({ dx, dz }) => dx !== 0 || dz !== 0);
/**
 * THE RAIL BATTERY — the one thing on these maps that a site plan has to say out loud.
 * `TargetingSystem.findNearest` (`:57`) is pure nearest-first with no boss priority, and the hero
 * cannot move (`IDLE_INTENTS`), so every gun parked around the stake spends the boss wave shooting
 * the ~30 trash enemies standing on top of it while the railcar rolls past untouched — MEASURED at
 * 3451/3451 railcar HP still standing after a full wave-12 pass. A gun placed far from the stake and
 * near the rail has no trash inside its 16wu range, so the railcar IS its nearest target.
 * Pads are inside each contract's own north-bank build zone, on the rail route the boss rides.
 */
const BATTERY = {
  // rail route 0 runs x -46..46 at z ~= -1; `base-t1` is x [-30,30], z [8,16].
  'e2-hill-mine': [{ x: -26, z: 8.5 }, { x: 26, z: 8.5 }, { x: -18, z: 8.5 }, { x: 18, z: 8.5 }],
  // rail route 0 runs the gorge at x = 0; the approaches are z [-30,-7] and z [7,30].
  'e2-trestle': [{ x: 0, z: -26 }, { x: 0, z: -20 }, { x: 0, z: 20 }, { x: 0, z: 26 }],
  // rail route 0 is the lower line at x = -12; the yards are z [-30,-7] and z [7,18].
  'e2-incline': [{ x: -12, z: -26 }, { x: -12, z: -8 }, { x: -12, z: 10 }, { x: -12, z: 16 }],
};
/**
 * The hero cannot dodge — it takes `IDLE_INTENTS` and never leaves its stake — so the only defence
 * it has is killing the pack before the pack arrives. Damage first, plating second.
 */
const UPGRADE_RANKS = {
  damage: ['chain_spark_arc', 'heavy_spark', 'double_tap_coil', 'split_spark', 'tinkers_plating',
    'long_resonator', 'field_dressing', 'sharpen', 'beacon_dynamo', 'prospectors_luck', 'pan_legend'],
  // HP is the clock: contact is capped at one 8-damage hit per 0.5s iframe, so every 25-point
  // plating stack is another ~1.5s the stake holds during the boss wave.
  tank: ['tinkers_plating', 'field_dressing', 'chain_spark_arc', 'heavy_spark', 'double_tap_coil',
    'split_spark', 'long_resonator', 'sharpen', 'beacon_dynamo', 'prospectors_luck', 'pan_legend'],
};
const UPGRADE_RANK = UPGRADE_RANKS[valueOf('--upgrades') ?? 'damage'];
/**
 * `PressureSystem.ts:23` — three fixed world positions, `coalHarvestRange` 1.35, `coalPerSeam` 4,
 * and `harvested` is permanent. That makes coal a ONE-SHOT budget for the whole run: 12 coal x 12
 * boiler-seconds x 4 pressure = 576 pressure, ever. So it is drawn on a schedule rather than all at
 * once — one seam to carry the mid-game, one for the late waves, one held back for the railcar.
 *
 * WHEN a seam is cut is a PLAY DECISION, not a fact about the game, so it is a flag with the
 * original schedule as its default: `--coal-waves 5,8,11` reproduces every hash this prover has
 * already published (verified against `e2-hill-mine-01` -> `fnv1a32:c40556c0` on 2026-08-21).
 * The owner's 2026-08-21 ruling gave the trestle and the incline a pressure line, and on those two
 * maps the seams sit 55-60wu from the only stake the hero can hold, against 29wu on the hill mine —
 * so the walk is a real cost that has to be measured against the arsenal it buys, and
 * `--coal-waves 99,99,99` is the control that never leaves the claim at all.
 *
 * WHERE a seam IS became contract data on 2026-08-21 (owner, to the F-E2PL-1 lever: "sounds like a
 * good idea"), so the site plan is no longer a literal here: it is read from the running sim's own
 * `pressure.diagnostics.seams`, which is `twist.coalSeams` when the contract authors any and the
 * `PressureSystem.DEFAULT_COAL_SEAMS` constant when it does not. A contract that authors nothing
 * therefore walks to exactly the coordinates this file used to hard-code.
 */
const COAL_WAVES = (valueOf('--coal-waves') ?? '5,8,11').split(',').map(Number);
let COAL = [];
const STAGE_RANGE = 1.4;

const trace = (line) => { if (!quiet) process.stderr.write(`${line}\n`); };

/**
 * THE LOCATION IS PART OF THE BOOT, and getting it wrong is silent: `src/world/Terrain.ts:78` reads
 * `activeContract()` at MODULE LOAD, so a harness that forgets `?contract=` runs the whole contract
 * on the DEFAULT claim's terrain — measured here as a hero clamped to z <= 31.5 on a size-96 map,
 * which puts all three coal seams (z 39-43) permanently out of bounds. Same three parameters as
 * `scripts/gr-sim.mjs:34-38`. `?debug` is that script's own boot flag for contract visibility
 * (`ContractFamilies.ts:1093`); it grants no stats and there is no `__GR_TEST__` in this sim.
 */
globalThis.location = new URL(`http://gr-sim-prover.local/?debug&contract=${contractId}&seed=${seed}`);
const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

try {
  const { FakeStorage } = await vite.ssrLoadModule('/src/sim/FakeStorage.ts');
  const [ContractFamilies, ResearchTree, Medals, { HeadlessContractSim }, { packActiveProfile }, { resetStandingOrders }] =
    await Promise.all([
      vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
      vite.ssrLoadModule('/src/meta/ResearchTree.ts'),
      vite.ssrLoadModule('/src/game/Medals.ts'),
      vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
      vite.ssrLoadModule('/src/game/ProfileTransfer.ts'),
      vite.ssrLoadModule('/src/agent/StandingOrders.ts'),
    ]);
  Object.assign(console, originalConsole);

  // --- declare -------------------------------------------------------------------------------
  const storage = new FakeStorage();
  globalThis.localStorage = storage;
  globalThis.window = { location: globalThis.location, localStorage: storage };
  let declaration = null;
  if (!cold) {
    Medals.awardBaronMedal(storage);
    takeResearch(ResearchTree, Medals, storage, 'epoch-1-frontier', ['chain_spark_primer', 'beacon_cadence', 'sky_rocket_battery']);
    storage.setItem(ContractFamilies.ACTIVE_EPOCH_KEY, 'epoch-2-steamworks');
    takeResearch(ResearchTree, Medals, storage, 'epoch-2-steamworks', ['boiler_lance', 'pressure_mortar']);
    const live = ResearchTree.loadResearchState(storage, storage);
    declaration = {
      activeEpoch: ContractFamilies.activeEpochId(),
      medals: Medals.loadMedals(storage),
      gates: Object.fromEntries(['boiler_lance', 'pressure_mortar', 'sky_rocket_battery', 'boiler_battery', 'coal_survey', 'pressure_assay']
        .map((id) => [id, ResearchTree.hasResearchNode(live, id)])),
      envelope: packActiveProfile(storage).envelope.data,
    };
    trace(`declared ${JSON.stringify({ activeEpoch: declaration.activeEpoch, medals: declaration.medals, gates: declaration.gates })}`);
  }

  // --- play ----------------------------------------------------------------------------------
  resetStandingOrders();
  const sim = new HeadlessContractSim(
    { contractId, seed, admissionProbe: true },
    cold ? {} : { storage },
  );
  // The seams as the ENGINE holds them, not as this file remembers them.
  COAL = sim.pressure.diagnostics.seams.map((seam, index) => ({
    x: seam.x,
    z: seam.z,
    wave: COAL_WAVES[index] ?? Number.POSITIVE_INFINITY,
  }));
  trace(`coal ${sim.pressure.diagnostics.seamSource} ${JSON.stringify(COAL)}`);
  const memo = { coalIndex: 0, dwell: 0, refused: new Set() };
  let turn = sim.currentTurn();
  let turns = 0;
  let pressureGranted = 0;
  const spent = {};
  while (!turn.terminal && turns < maxTurns) {
    const now = turn.view.now;
    const orders = idle ? [] : ordersFor(now, turn.view, memo);
    const receipt = sim.submitOrders(orders);
    if (!receipt.outcome.ok) throw new Error(`orders rejected: ${receipt.outcome.message ?? receipt.outcome.reason}`);
    // The receipt carries the WHOLE economy log each turn, so recompute rather than accumulate.
    pressureGranted = 0;
    for (const key of Object.keys(spent)) delete spent[key];
    for (const event of receipt.outcome.economyLog ?? []) {
      if (event.resource !== 'pressure') continue;
      if (event.type === 'resource_granted') pressureGranted += event.amount;
      if (event.type === 'resource_spent') spent[event.sink] = (spent[event.sink] ?? 0) + event.amount;
    }
    trace(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}/${now.hero.maxHp}`
      + ` lvl=${now.hero.level} up=${JSON.stringify(now.hero.upgradesTaken ?? {})}`
      + ` offer=${(now.pendingOffer ?? []).map((entry) => entry.id).join('|')}`
      + ` pros=(${now.prospector?.x.toFixed(1)},${now.prospector?.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` arsenal=${JSON.stringify(sim.pressureArsenalDiagnostics?.fires ?? null)}`
      + ` psp=${sim.pressureArsenalDiagnostics?.pressureSpent ?? 0}`
      + ` fail=${(now.orders ?? []).filter((entry) => entry.status === 'failed').map((entry) => entry.reason).join(';').slice(0, 120)}`
      + ` boss=${bossLine(sim)}`);
    turn = sim.advanceToTurn();
    turns += 1;
  }
  const outcome = sim.outcome();
  process.stdout.write(`${JSON.stringify({
    schema: 'goldrush.e2railcar.prove.v1',
    contractId,
    seed,
    policy: idle ? 'idle' : 'prover',
    progression: cold ? 'cold' : 'declared',
    turns,
    ...outcome,
    arsenal: sim.pressureArsenalDiagnostics,
    pressure: { granted: pressureGranted, spentBySink: spent },
    ...(declaration ? { declaration } : {}),
  })}\n`);
  if (!idle && !outcome.secured) process.exitCode = 1;
} finally {
  Object.assign(console, originalConsole);
  await vite.close();
}

/**
 * Takes named nodes the way a player does: only ever from `availablePicks`, re-rolling the proposal
 * (`skipResearchPick`) until the wanted node is on offer. Never writes `taken[]` directly.
 */
function takeResearch(ResearchTree, Medals, storage, epochId, wanted) {
  let state = ResearchTree.loadResearchState(storage, storage, { rocketCartCaptured: Medals.hasRocketCartCaptured(storage) }, epochId);
  for (const id of wanted) {
    let guard = 0;
    while (!ResearchTree.hasResearchNode(state, id)) {
      if (guard++ > 500) throw new Error(`${epochId}: ${id} never reached the offer`);
      state = ResearchTree.availablePicks(state).some((node) => node.id === id)
        ? ResearchTree.takeNode(state, id)
        : ResearchTree.skipResearchPick(state);
    }
    state = ResearchTree.saveResearchState(storage, state, storage);
  }
  return state;
}

/** Pure function of THE VIEW plus one memo (pads refused by the map): same seed in, same orders out. */
function ordersFor(now, view, memo) {
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const stake = { x: now.hero.x, z: now.hero.z };
  const pros = now.prospector ?? stake;
  const near = (target) => distance(pros, target) <= STAGE_RANGE;
  // REPAIR STANDS ALL RUN. Steam Wreckers carry `buildingDamageScale: 2.5` and the railcar itself
  // carries 7, so the guns do not merely take chip damage — they are WRECKED, and a wrecked turret
  // is not upgradeable and does not shoot. Measured before this order existed: every one of the
  // four turrets sitting at hp 0 at the wave ceiling while 240 gold went unspent.
  const head = [{ verb: 'REPAIR_UNDER', pct: 70 }];
  const offer = now.pendingOffer ?? [];
  if (offer.length > 0) head.push({ verb: 'PICK_UPGRADE', id: [...offer].sort((a, b) => rank(a.id) - rank(b.id))[0].id });
  strikeRefusedPads(now, memo);

  // COAL OUTRANKS THE PURSE once its wave has come. It is a fixed lifetime budget on a schedule
  // (see COAL), and a claim that keeps shopping instead of walking to the seam arrives at the
  // railcar with a cold boiler — measured: 384 of 576 pressure, third seam never cut.
  // ONLY where the claim actually runs a pressure line. `PressureSystem`'s three seams sit at fixed
  // world coordinates on EVERY map, but `twist.pressureEnabled` is what decides whether a boiler can
  // be built to burn what they yield — and it is absent on the trestle and the incline. Walking a
  // body 57wu to cut coal no boiler will ever see cost those two maps two whole waves of building.
  const hasPressure = view.stablePrefix.mechanics.buildables?.some((entry) => entry.id === 'boiler_house') === true;
  const coal = hasPressure ? COAL[memo.coalIndex] : undefined;
  if (coal && now.wave >= coal.wave) {
    // DWELL, don't touch and go. `coalHarvestSeconds` is 0.8 and `seam.progress` DECAYS the moment
    // the body steps off (`PressureSystem.harvestCoal`), while a turn boundary can arrive in the
    // same tick as the arrival — so leaving on first contact cut zero coal and the boilers stayed
    // cold for a whole measured run. Three turns standing on the seam is cheap and never ambiguous.
    memo.dwell = near(coal) ? memo.dwell + 1 : 0;
    if (memo.dwell < 3) return [...head, { verb: 'HOLD', pos: { x: coal.x, z: coal.z } }];
    memo.coalIndex += 1;
    memo.dwell = 0;
  }

  const pending = plan(now, memo, stake, hasPressure);
  if (pending.length > 0 && now.gold >= pending[0].cost) {
    // Pan until the price is in hand, THEN walk to the stake: staging first would park the
    // Prospector on an empty pad for a whole wave while the hero fights alone. Every pad is inside
    // the 6wu place radius of the hero's own position, so one trip can spend the whole purse —
    // each BUILD carries its own `goldGte` and the ticks fire down the ladder until gold runs out.
    const stage = pending[0].stage;
    if (!near(stage)) return [...head, { verb: 'HOLD', pos: stage }];
    return [
      ...head,
      ...pending.filter((entry) => entry.stage === stage).slice(0, 28)
        .map((entry) => ({ verb: 'BUILD', what: entry.what, where: entry.where, when: { goldGte: entry.cost } })),
      { verb: 'HOLD', pos: stage },
    ];
  }
  // THE LATE-GAME SINK. Turrets cap at four, beacons at six, boilers at three — so a claim that
  // survives long enough runs out of things to buy and sits on a full purse (measured: 260 gold in
  // hand at the wave ceiling). `Balance.tiers.turret` is where that gold goes: 150 for x1.4 damage
  // and x1.18 fire rate, 300 for x1.9/x1.35. The upgrade verb reaches only 1.6wu
  // (`Balance.demolish.interactRadius`), so the Prospector has to stand on the gun.
  const gun = upgradeTarget(now);
  if (gun) {
    if (!near(gun.position)) return [...head, { verb: 'HOLD', pos: gun.position }];
    return [
      ...head,
      { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: gun.id, index: gun.index } },
      { verb: 'HOLD', pos: gun.position },
    ];
  }
  return [...head, ...pan(now, view, stake)];
}

/** The cheapest turret tier still on offer, once every rung of the ladder has been bought. */
function upgradeTarget(now) {
  // `View.ts:458` runs tier through `integer()`, which yields NaN when the sim omits the field —
  // and `NaN ?? 1` is NaN, so a `?? 1` default silently filters every gun out. Read it explicitly.
  const tierOf = (entry) => (Number.isFinite(entry.tier) && entry.tier > 0 ? entry.tier : 1);
  const candidates = (now.works.entries ?? [])
    .filter((entry) => entry.id === 'turret' && !entry.wrecked && tierOf(entry) < 3)
    .map((entry) => ({ ...entry, cost: tierOf(entry) <= 1 ? 150 : 300 }))
    .filter((entry) => now.gold >= entry.cost)
    .sort((a, b) => a.cost - b.cost || a.index - b.index);
  return candidates[0] ?? null;
}

function rank(id) {
  const index = UPGRADE_RANK.indexOf(id);
  return index < 0 ? UPGRADE_RANK.length : index;
}

/**
 * MEASUREMENT ONLY — never consulted by `ordersFor`, so the play stays a pure function of the public
 * VIEW. It reads the elite roster the way `e2e/er01-e2-census.spec.ts` reads `sim.hero`/`sim.build`:
 * a run's claim about the railcar has to be checkable against the railcar's actual remaining HP.
 */
function bossLine(sim) {
  const elites = (sim.enemies?.all ?? []).filter((enemy) => enemy.isAlive && enemy.eliteKind);
  if (elites.length === 0) return '-';
  return elites.map((enemy) => `${enemy.bossComponentId ?? enemy.eliteKind}:${Math.round(enemy.currentHp)}`
    + `@${enemy.position.x.toFixed(0)},${enemy.position.z.toFixed(0)}`).join('/');
}

/**
 * A pad the map refuses — `collision`, `out_of_zone`, unbuildable ground — is struck off for good.
 * Three maps, three terrains, one pad generator: this is how the ladder stays honest without a
 * hand-drawn site plan per contract. The contract itself says which ground it will take.
 */
function strikeRefusedPads(now, memo) {
  for (const record of now.orders ?? []) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    memo.refused.add(padKey(record.order.where));
  }
}

function padKey(where) {
  return `${where.x.toFixed(2)}:${where.z.toFixed(2)}`;
}

/**
 * The grid, laid over the stake and then again twelve units either side of it. One grid is fourteen
 * pads, but `gridSnap` rounds a placed work up to half a unit off its pad and that shadows a
 * neighbour, so a single cluster runs dry at about five works — measured: a run that reached the
 * wave ceiling with 200 gold in hand and no boiler, because there was nowhere left to put one. The
 * zones are sixty units wide; the answer is more staging points, not tighter packing.
 */
function pads(stake) {
  return [0, 12, -12].flatMap((offset) => {
    const stage = { x: stake.x + offset, z: stake.z };
    return PAD_GRID.map(({ dx, dz }) => ({
      x: Number((stage.x + dx).toFixed(2)),
      z: Number((stage.z + dz).toFixed(2)),
      stage,
    }));
  });
}

/**
 * Every still-unbuilt rung of the ladder, priced on its own growth curve and given the first pad
 * that is neither already occupied nor struck off. `works.entries` carries the real positions, so
 * occupancy is read from the world rather than remembered.
 */
function plan(now, memo, stake, hasPressure) {
  const built = now.works.byKind ?? {};
  const taken = (now.works.entries ?? []).map((entry) => entry.position);
  const open = (pad) => !memo.refused.has(padKey(pad)) && !taken.some((position) => distance(position, pad) < 2.0);
  const home = pads(stake).filter(open);
  const battery = (BATTERY[contractId] ?? []).filter(open);
  const seen = {};
  const pending = [];
  let homeUsed = 0;
  let batteryUsed = 0;
  for (const rung of BUILD_ORDER) {
    const [what, site] = rung.split('@');
    if (what === 'boiler_house' && !hasPressure) continue;
    const index = seen[what] ?? 0;
    seen[what] = index + 1;
    if (index < (built[what] ?? 0)) continue;
    const cost = COST[what][index];
    // A contract with no rail battery (there is no railcar to meet) keeps its guns at the stake.
    const railPad = site === 'battery' ? battery[batteryUsed] : undefined;
    const where = railPad ?? home[homeUsed];
    if (cost === undefined || !where) continue;
    if (railPad) batteryUsed += 1; else homeUsed += 1;
    pending.push({ what, where: { x: where.x, z: where.z }, cost, stage: where.stage ?? where });
  }
  return pending;
}

/**
 * Work the live seam nearest THE STAKE, not the one nearest the Prospector: the pads are all at the
 * stake, so a seam chosen from wherever the Prospector happens to be standing sends it on ever
 * longer round trips while the hero fights alone. 30 records is two short of the grammar's 32-entry
 * cap, leaving room for a PICK_UPGRADE and a HOLD in the same submission; one record is one pan tick.
 */
function pan(now, view, stake) {
  const anchors = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const live = now.seams
    .filter((entry) => entry.active && entry.remaining > 0 && anchors.has(entry.id))
    .sort((a, b) => distance(stake, anchors.get(a.id)) - distance(stake, anchors.get(b.id)));
  const seam = live[0];
  return seam ? Array.from({ length: 30 }, () => ({ verb: 'HARVEST', seam: seam.id })) : [{ verb: 'HOLD', pos: stake }];
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
