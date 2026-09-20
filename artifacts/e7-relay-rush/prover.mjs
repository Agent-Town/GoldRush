#!/usr/bin/env node

/**
 * THE RELAY RUSH PROVER — the measurement that priced `e7-relay-rush` (2026-08-20, A5) and then,
 * after the owner's stake ruling of 2026-08-21, the proof that ADMITTED it.
 *
 * REWORKED 2026-08-21 FOR THE STAKED START, AND THE REWORK IS THE POINT. The four policies this
 * file measured on 2026-08-20 (objective-first, turret-first, all-turret, hero-only) all assumed
 * the DEFAULT claim at (0,12), twenty-four world units from the nearest legal pad, and all four
 * died at wave 3-4 of 20. The owner ruled F-A5-1 — verbatim, to the five-map fork table, "lets
 * follow your recommendation" — so `tileParams.stakeMarkers` now stands the claim at (-25,41),
 * the CENTRE of `relay-site-r2`. The objective-first arm is now the whole frame: light three
 * relays before the third front, then hold the ridge to wave 20. It does.
 *
 * It plays the map through the PUBLIC GRAMMAR and nothing else: every order below is a verb from
 * `src/agent/StandingOrders.ts` — HARVEST, HOLD, BUILD, BLAST_AT, PICK_UPGRADE, SECURE_CHOICE.
 * No admission escape from the RULES, no private handles, no balance edits.
 *
 * WHY IT DRIVES THE SIM IN-PROCESS INSTEAD OF SPAWNING `scripts/gr-sim.mjs`. Relay Rush did not
 * secure, so it is now listed in `CONTRACT_ADMISSION_EXEMPTIONS` and the ordinary door refuses to
 * construct it — which would make the very evidence for that listing un-re-runnable. The house
 * already has the answer: `boot.admissionProbe` (`HeadlessContractSim.ts:296`), the same seam
 * `artifacts/e9-seed-run/prover.mjs` and `e2e/ap16-8b-capture-loop-probe.mjs` use to keep
 * measuring an exempt contract. The flag lifts the ADMISSION gate only; every rule, cost and cap
 * below is the ordinary game.
 *
 * EXPANSION UNDER DEADLINE, which is the contract's own teaching intent. The ratified objective
 * (`specs/agent-play/door-completion-sheet.md:16`) is "have N relay sites LIT (a powered building
 * standing on the site) before the Nth front arrives", N = 3 of 4, a front every 90s. So this
 * play spends its first gold on the CHEAPEST thing that lights a site — a 25g sentry beacon — at
 * three of the four ridge boxes, and only then buys guns.
 *
 * WHAT IT MEASURES NOW (both seeds, twice each, every repeat byte-identical) — see `summary.json`:
 *   public-verb  SECURED at wave 20 on BOTH seeds, deadline MET on its own terms
 *                (`litAtDeadline: 3` of a `relayTarget` of 3), six fronts crossed per run.
 *   --plain      the same, through the ORDINARY door with no `admissionProbe` at all.
 *   --idle       dies in the low waves having lit nothing. Law 2 holds; see `run-evidence.mjs`.
 *
 * WHAT IT MEASURED BEFORE THE STAKE, kept because a cure that erases its own disease teaches
 * nothing: wave 4 (seed 01, `fnv1a32:49f11d65`) and wave 3 (seed 02, `fnv1a32:7fed3db1`),
 * UNSECURED, with three relays lit by t=131.6s against the same 270s deadline — the objective was
 * never the obstacle. The GROUND was: `HeadlessContractSim` drives slot 0 on IDLE_INTENTS
 * (F-E2PA-4), so the hero is a fixed post, and at (0,12) the nearest legal pad was 24wu away
 * against turret range 16 and beacon range 8 on a `mode: "visual"` heightfield that grants no
 * high-ground reach. The stake did not change one balance number; it moved the post onto ground
 * the guns can share. Both pre-stake hashes still reproduce by reverting the stake alone.
 *
 * Usage: node artifacts/e7-relay-rush/prover.mjs --seed e7-relay-rush-01 [--idle] [--plain] [--quiet]
 * Prints a per-turn trace on stderr and the run's outcome JSON on stdout.
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e7-relay-rush-01';
const contract = valueOf('--contract') ?? 'e7-relay-rush';
const quiet = args.includes('--quiet');
/**
 * THE NULL FLOOR, carried by the same file for the same reason the evidence is: `e7-relay-rush`
 * is admission-exempt, so `scripts/null-floor-anchors.mjs` will not generate a floor for it and
 * `--policy=idle` on `scripts/gr-sim.mjs` cannot construct it either. Law 2 still has to be
 * checkable, so the floor runs here, through the same `admissionProbe` seam, submitting NOTHING.
 */
const idle = args.includes('--idle');
/**
 * THE PLAIN DOOR. `--plain` drops `admissionProbe` entirely and constructs through the ordinary
 * gate, which is only possible once the contract is ADMITTED. It exists so the final proof is not
 * taken through the measurement seam that priced the exemption: a run that secures through the
 * same door a rider uses is the only one that certifies the admission. Before the 2026-08-21 stake
 * this flag would have thrown `AP-07 supports only ...`; that it no longer does IS the door.
 */
const plain = args.includes('--plain');

/**
 * THE BUILD LIST, in purchase order, and the order IS the strategy.
 *
 * Rows 1-3 are the OBJECTIVE: the cheapest powered building (`POWERED_RELAY_KINDS` —
 * `sentry_beacon` or `turret`) on three separate relay sites, bought before anything that only
 * helps a fight. 25 + 35 + 45 = 105 gold lights r2, r3 and r4 and closes the latch.
 *
 * Rows 4+ are the DEFENCE: four turrets on the INNERMOST legal corners of r2 and r3 (x = ±20,
 * z = 36 — as close to the claim as any legal placement can be), where their 16wu reach covers
 * the north lane, then beacons to hold what the turrets soften.
 *
 * The cost column is the registry's Nth price for that kind (turret 50/70/95/125, sentry_beacon
 * 25/35/45/55/75/95), so the order below is also the order the gold arrives in.
 */
const PLAN = [
  // THE HOME BOX FIRST, and the first buy does double duty: a 25g beacon three wu north of the
  // stake both LIGHTS r2 (a `POWERED_RELAY_KIND` standing on the site) and starts shooting.
  { what: 'sentry_beacon', where: { x: -25, z: 44 }, costs: 25, site: 'relay-site-r2' },
  { what: 'turret', where: { x: -28, z: 44 }, costs: 50, site: 'relay-site-r2' },
  { what: 'turret', where: { x: -22, z: 44 }, costs: 70, site: 'relay-site-r2' },
  // THE TWO WALKS, taken while the home guns hold the post. 35 + 45 gold buys the other two
  // relays the deadline needs, and spends two of the six beacon slots away from the claim —
  // "expand under deadline and triage at speed", which is the contract's own teaching intent.
  { what: 'sentry_beacon', where: { x: -45, z: 41 }, costs: 35, site: 'relay-site-r1' },
  { what: 'sentry_beacon', where: { x: 25, z: 41 }, costs: 45, site: 'relay-site-r3' },
  // THEN THE REST OF THE GARRISON, all of it inside r2 and inside beacon reach of the stake.
  { what: 'turret', where: { x: -28, z: 38 }, costs: 95, site: 'relay-site-r2' },
  { what: 'turret', where: { x: -22, z: 38 }, costs: 125, site: 'relay-site-r2' },
  { what: 'sentry_beacon', where: { x: -25, z: 38 }, costs: 55, site: 'relay-site-r2' },
  { what: 'sentry_beacon', where: { x: -29, z: 41 }, costs: 75, site: 'relay-site-r2' },
  { what: 'sentry_beacon', where: { x: -21, z: 41 }, costs: 95, site: 'relay-site-r2' },
];

/**
 * Stage three wu south of the pad: `Balance.turret.placeRadius` and `Balance.beacon.placeRadius`
 * are both 6, and every pad above sits at z >= 36, so this is always in reach and always on the
 * ridge shelf the seams sit on.
 */
const stageFor = (pad) => ({ x: pad.x, z: pad.z - 3 });

/** Survive first — the hero is alone at the claim and its own hp is the run's whole clock. */
const UPGRADE_PREFERENCE = [
  'tinkers_plating', 'field_dressing', 'heavy_spark', 'double_tap_coil',
  'split_spark', 'sharpen', 'long_resonator', 'spring_heels',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * SEAM IDS ARE NOT PLACES. `HarvestSystem` hands `gold-seam-N` to a SHUFFLED anchor and moves it
 * again on every respawn, and THE VIEW's live seam rows carry no coordinates — so a rider cannot
 * aim at a seam, only at a seam ID. This play pans whichever seam is active and lets the
 * Prospector walk to it; all four authored anchors sit at the foot of the ridge, so any of them
 * is a short shuttle from the next pad.
 */
function panOrders(now) {
  const seam = now.seams.find((entry) => entry.active && entry.remaining > 0);
  return seam ? Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id })) : [];
}

/**
 * The blast, thrown at the lane the wave is converging down. `Balance.blast.range` is 10 from the
 * hero, so this catches the pack as it closes on the claim rather than at the map edge.
 */
function blastOrders(now) {
  if ((now.blastReadyInMs ?? 1) > 0) return [];
  if ((now.threats?.alive ?? 0) < 3) return [];
  // Aimed RELATIVE TO THE HERO, never at fixed coordinates: the owner's stake moved the claim to
  // (-25,41) and a hardcoded aim point would have thrown every round at empty ground.
  const edge = now.threats?.edge;
  const dx = edge === 'east' ? 9 : edge === 'west' ? -9 : 0;
  const dz = edge === 'north' ? 9 : 0;
  return [{ verb: 'BLAST_AT', pos: { x: now.hero.x + dx, z: now.hero.z + dz } }];
}

/** Pure function of THE VIEW (plus one bit of memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const picks = [];
  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    const wanted = UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0];
    picks.push({ verb: 'PICK_UPGRADE', id: wanted });
  }

  const standing = now.works.byKind ?? {};
  const done = { turret: standing.turret ?? 0, sentry_beacon: standing.sentry_beacon ?? 0 };
  const seen = { turret: 0, sentry_beacon: 0 };
  const step = PLAN.find((entry) => {
    seen[entry.what] += 1;
    return seen[entry.what] > done[entry.what];
  });
  const pan = panOrders(now);
  const blast = blastOrders(now);

  if (step) {
    const stage = stageFor(step.where);
    if (now.gold < step.costs) {
      memo.staged = false;
      return [...picks, ...blast, ...(pan.length > 0 ? pan : [{ verb: 'HOLD', pos: stage }])];
    }
    if (!memo.staged || distance(now.prospector, stage) > 1.5) {
      memo.staged = true;
      return [...picks, ...blast, { verb: 'HOLD', pos: stage }];
    }
    memo.staged = false;
    return [
      ...picks,
      ...blast,
      { verb: 'BUILD', what: step.what, where: step.where, when: { goldGte: step.costs } },
      { verb: 'HOLD', pos: stage },
    ];
  }
  // Nothing left to buy: work the seam, and otherwise stand on the ridge shelf beside the post.
  return [...picks, ...blast, ...(pan.length > 0 ? pan : []), { verb: 'HOLD', pos: { x: -25, z: 37 } }];
}

/**
 * THE ACTIVE-CONTRACT HANDSHAKE, AND IT IS LOAD-BEARING RATHER THAN BOILERPLATE. `Terrain` reads
 * `activeContract()` ONCE at module load (`src/world/Terrain.ts:78`), and `Terrain.isBuildable`
 * is what enforces this tile's four relay boxes. Without these two lines the module graph loads
 * against the DEFAULT contract, whose `buildZones` are empty — and an empty zone list means
 * "buildable everywhere", so a prover would place its relays on ground the real game refuses.
 * `scripts/gr-sim.mjs:34-39` does exactly this before it constructs anything; measured here, the
 * omission cost every BUILD an `out_of_zone` rejection and the run three whole waves.
 */
const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', contract);
location.searchParams.set('seed', seed);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let outcome = null;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const sim = new HeadlessContractSim(plain
    ? { contractId: contract, seed }
    : { contractId: contract, seed, admissionProbe: true });
  // The same anti-hang bound `scripts/gr-sim.mjs` applies: wave scaling should end the run first,
  // and a rider that outlives the ceiling is stopped rather than allowed to spin.
  const secureWave = sim.manifest.twist.secureWave ?? Balance.run.secureWave;
  const waveCeiling = secureWave + 2;
  const memo = {};
  let turn = sim.currentTurn();
  let turns = 0;
  let endReason;

  while (true) {
    if (!turn.terminal && turn.view.now.wave >= waveCeiling) {
      sim.hero.hp = 0;
      sim.dead = true;
      endReason = 'wave-ceiling';
      turn = sim.currentTurn();
    }
    if (!quiet) trace(turns, turn.view.now);
    if (turn.terminal) break;
    if (!idle) sim.submitOrders(orders(turn.view, memo));
    turns += 1;
    turn = sim.advanceToTurn();
  }

  const front = turn.view.now.interferenceFront;
  outcome = {
    ...sim.outcome(),
    ...(endReason ? { endReason } : {}),
    seed,
    policy: idle ? 'idle' : 'public-verb',
    door: plain ? 'plain' : 'admissionProbe',
    // The front's own terminal state travels WITH the outcome, so a reader never has to trust a
    // sentence about the deadline that the numbers do not carry.
    front: front
      ? {
          frontsArrived: front.frontsArrived,
          deadlineFront: front.deadlineFront,
          relayTarget: front.relayTarget,
          litCount: front.litCount,
          litSites: front.sites.filter(({ lit }) => lit).map(({ id }) => id),
          deadlineResolved: front.deadlineResolved,
          litAtDeadline: front.litAtDeadline,
          objectiveMet: front.objectiveMet,
          mutedWorkSteps: front.mutedWorkSteps,
        }
      : null,
  };
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  if (!quiet) process.stderr.write(`prover: ${turns} turns\n`);
} finally {
  await vite.close();
}
// Law 2 inverts the exit code for the floor: an idle run that SECURES is the failure.
if (idle ? outcome?.secured : !outcome?.secured) process.exitCode = 1;

function trace(turns, now) {
  const front = now.interferenceFront;
  process.stderr.write(`t${turns} w${now.wave} t=${(now.timers?.runSeconds ?? 0).toFixed(1)}s`
    + ` gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
    + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
    + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
    + ` lvl=${now.hero.level} kills=${now.threats.defeatedTotal}`
    + ` front=${front
      ? `${front.phase} n${front.frontsArrived}/${front.deadlineFront} lit${front.litCount}/${front.relayTarget}`
        + ` met=${front.objectiveMet} muteSteps=${front.mutedWorkSteps}`
      : '???'}`
    + `${failures(now)}\n`);
}

/**
 * REFUSALS ARE THE ONLY WAY A RIDER LEARNS THE MAP. A BUILD that lands outside a buildZone, on an
 * occupied pad, or out of the Prospector's reach fails SILENTLY as far as `now.works` is
 * concerned — the reason lives only in the standing-order records. This trace prints them.
 */
function failures(now) {
  const failed = (now.orders ?? []).filter((record) => record.status === 'failed');
  return failed.length === 0 ? '' : ` FAIL=${failed.map((record) => record.reason).join('|')}`;
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
