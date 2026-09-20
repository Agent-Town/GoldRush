#!/usr/bin/env node

/**
 * THE STILLWATER PROVER — the measurement that priced `e5-stillwater` (2026-08-21, A2).
 *
 * It plays the map through the PUBLIC GRAMMAR and nothing else: every order below is a verb from
 * `src/agent/StandingOrders.ts` — BOAT_BUILD, REANCHOR, HARVEST, HOLD, PICK_UPGRADE,
 * SECURE_CHOICE. No admission escape from the RULES, no private handles, no balance edits.
 *
 * WHY IT DRIVES THE SIM IN-PROCESS INSTEAD OF SPAWNING `scripts/gr-sim.mjs`, copied from the A8
 * Seed Run prover for the same reason: the Stillwater did not secure, so it stays in
 * `CONTRACT_ADMISSION_EXEMPTIONS` and the ordinary door refuses to construct it — which would
 * make the very evidence for that listing un-re-runnable. `boot.admissionProbe` lifts the
 * ADMISSION gate only; every rule, cost and cap below is the ordinary game.
 *
 * THE MAP. There is no land: `place_build` and `placeFree` both refuse on a Deepwater contract,
 * so the ONLY defence a rider can raise is three deck pads on the Claim-Boat — bow, port,
 * starboard — carrying `turret` (which mounts the harpoon ballista) or `sentry_beacon`. The hero
 * never moves: `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so it is a fixed
 * post on the lagoon anchor at (0,30). The Prospector is the only body a rider steers.
 *
 * THE TENSION THE CONTRACT AUTHORS. The boat's two anchors are `lagoon` (0,30) — ON the hero —
 * and `open-water` (-24,12), which lies INSIDE the declared `hand-pan-drift` quiet zone. The
 * machines ride the anchor, so REANCHOR to open water silences every one of them and the
 * leviathan sheds its trail after eight quiet seconds. It also carries the guns twenty world
 * units away from the body they defend. On this geometry noise is either ON the hero or absent,
 * and never anywhere else — so the trail can never be used as a decoy, only paid for or avoided.
 *
 * WHAT IT MEASURED (both bench seeds, six policies each, twice each, every repeat identical):
 *   deck  gun,beacon,gun   harvest=off      wave 4 / wave 4   <- the ceiling, 18 strikes, decks lost
 *   deck  gun,gun,gun      harvest=off      wave 4 / wave 4
 *   deck  three beacons    harvest=off      wave 3 / wave 4   <- total silence: strikes 0, decks 96
 *   deck  gun,beacon,gun   harvest=on       wave 3 / wave 2
 *   quiet run for the quiet water on trail  wave 1 / wave 1
 *   drift stay in the quiet water           wave 0 / wave 1
 *   --idle                                  wave 3 / wave 3, unsecured. Law 2 holds.
 *
 * READ THAT TABLE THE RIGHT WAY. The whole spread is ONE WAVE wide around the idle floor, and
 * `--harvest off` — which keeps the Prospector on the deck, giving up the gold AND the pump — is
 * worth more than any gun choice. The total-silence row is the attribution: no turret and no
 * HARVEST order records strikes 0 with every deck at 96, so every strike in every other row is
 * caused by a machine the rider chose to run.
 *
 * SO THE CONSUMER IS NOT THE GAP. The three machines emit, the trail forms and is shed, the
 * quiet zones silence, the strikes land and cost a deck pad — all of it measured and traced
 * below. What refuses is the secure, and the cause is the map: twelve waves of an ordinary
 * schedule (which this contract's own `lanes.spawnEdges` and `spawnGates` declare) against three
 * deck slots and a hero that cannot walk.
 *
 * Usage: node artifacts/e5-stillwater/prover.mjs --seed e5-stillwater-01
 *          [--policy deck|quiet|drift] [--deck bow,port,starboard] [--idle] [--quiet]
 * Prints a per-turn trace on stderr and the run's outcome JSON on stdout.
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e5-stillwater-01';
const contract = valueOf('--contract') ?? 'e5-stillwater';
const policy = valueOf('--policy') ?? 'deck';
const quiet = args.includes('--quiet');
/**
 * THE NULL FLOOR, carried by this file for the reason A8's is: `e5-stillwater` is
 * admission-exempt, so `scripts/null-floor-anchors.mjs` will not generate a floor for it and
 * `--policy=idle` on `scripts/gr-sim.mjs` cannot construct it either. Law 2 still has to be
 * checkable, so the floor runs here, through the same `admissionProbe` seam, submitting NOTHING.
 */
const idle = args.includes('--idle');
/**
 * `--harvest off` is the decisive premise for WHICH machine is heard. A HARVEST standing order
 * does two things at once here: it hand-pans (silent, by construction — `panAt` restores the
 * channel state it borrowed) AND it walks the Prospector onto the seam, where the CONTINUOUS
 * channel engages and the pump is heard. Turning it off separates the two.
 */
const harvest = (valueOf('--harvest') ?? 'on') !== 'off';
/**
 * THE AIMING POLICIES (owner ruling 2026-08-21, F-A2-3's third anchor). `shelf-watch` (36,30) is
 * the first station where the machines are loud 36wu AWAY from the hero, so noise stops being a
 * cost and becomes a lure:
 *   aim   park the boat on the shelf for the whole run — the guns and the noise both leave the
 *         hero, and whatever the trail brings dies at the boat instead of at the claim.
 *   bait  the trail-shed clock played deliberately: sit on the shelf while a trail is held, and
 *         come home to the lagoon once eight quiet seconds have shaken it.
 *   shed  the same lure, but bought back: lure from the shelf until a deck is actually being
 *         chewed, then hop to `open-water` — which silences every machine, sheds the trail in
 *         eight seconds and stops the strikes — and return to the shelf to re-lure once it is
 *         gone. This is the policy that tests whether the DECLARED geometry alone can hold the
 *         boat together, with no consumer constant touched.
 *   kite  the answer the third anchor really unlocks, and the only one that keeps BOTH halves:
 *         hop between the two LOUD stations, `lagoon` and `shelf-watch`, whenever a deck starts
 *         taking damage. The trail never sheds — both stations are loud, so the lure holds — but
 *         the boat teleports 36wu and every trailing head has to walk the whole way back before
 *         it can strike again. `shed` gives up the lure to save the decks; `kite` gives up
 *         nothing and spends distance instead.
 */
if (!['deck', 'quiet', 'drift', 'aim', 'bait', 'shed', 'kite'].includes(policy)) {
  throw new Error('--policy must be deck, quiet, drift, aim, bait, shed or kite');
}

/**
 * The deck loadout in pad order bow,port,starboard, so the gun line is a measured premise rather
 * than an assumption. Three beacons mount no ballista at all and are the only way to play this
 * map in total silence — which the sweep above shows is WORSE, not better.
 */
const deckArg = (valueOf('--deck') ?? 'turret,sentry_beacon,turret').split(',');
const DECK = { bow: deckArg[0], port: deckArg[1], starboard: deckArg[2] };
/** Survive first. This roster does contact only, so plating and heals rank above reach. */
const UPGRADE_PREFERENCE = [
  'tinkers_plating', 'field_dressing', 'heavy_spark', 'double_tap_coil',
  'split_spark', 'sharpen', 'long_resonator', 'spring_heels',
];

function orders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const deepwater = now.deepwater;
  const out = [];

  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    out.push({ verb: 'PICK_UPGRADE', id: UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0] });
  }
  // ADR-005 stage 3 (2026-09-07): HOLD is retired; the human-shaped plan walks the HERO to the station and the Prospector drifts in.
  if (!deepwater) return [...out, { verb: 'MOVE_HERO', pos: { x: 0, z: 30 } }];

  // 1. PLANT. One order per empty pad; the door rejects an occupied one, so this is idempotent.
  for (const pad of deepwater.pads) {
    if (!pad.occupied) out.push({ verb: 'BOAT_BUILD', padId: pad.id, buildingId: DECK[pad.id] ?? 'turret' });
  }

  // 2. TRIM OR AIM THE NOISE. The trail is published in THE VIEW, so a rider steers on the
  // mechanic itself rather than on a guess about it.
  const trailed = (deepwater.noiseHunt?.trail.target ?? null) !== null;
  // A deck being chewed is the signal `shed` acts on — published integrity, not a guess.
  const chewed = (deepwater.noiseHunt?.decks ?? []).some(({ integrity }) => integrity < 96);
  const wanted = policy === 'drift' ? 'open-water'
    : policy === 'quiet' ? (trailed ? 'open-water' : 'lagoon')
      : policy === 'aim' ? 'shelf-watch'
        : policy === 'bait' ? (trailed ? 'shelf-watch' : 'lagoon')
          : policy === 'shed' ? (chewed && trailed ? 'open-water' : 'shelf-watch')
            // Both stations are LOUD, so hopping keeps the trail and only spends the walk back.
            : policy === 'kite' ? (chewed
              ? (deepwater.anchor.id === 'shelf-watch' ? 'lagoon' : 'shelf-watch')
              : deepwater.anchor.id === 'lagoon' ? 'shelf-watch' : deepwater.anchor.id)
              : 'lagoon';
  if (deepwater.anchor.id !== wanted) out.push({ verb: 'REANCHOR', anchorId: wanted });

  // 3. HOLD THE DECK. The Prospector keeps station on the boat so the guns cover both of them;
  // the hand-pan is the only harvest that makes no pump noise, and the seams sit far north.
  const station = deepwater.anchors.find(({ id }) => id === wanted) ?? deepwater.anchor;
  const seam = harvest ? now.seams.find((entry) => entry.active && entry.remaining > 0) : undefined;
  if (seam) out.push({ verb: 'HARVEST', seam: seam.id });
  out.push({ verb: 'MOVE_HERO', pos: { x: station.x, z: station.z } });
  return out;
}

/**
 * THE PLAIN DOOR (`--plain`), added at the admission 2026-08-21. `e5-stillwater` is now an
 * ADMITTED contract, so the honest proof is the one every rider gets: spawn `scripts/gr-sim.mjs`
 * and answer its printed VIEWs on stdin, with no `admissionProbe` anywhere. The `orders()` policy
 * above is shared byte-for-byte between the two transports, so a difference between them can
 * only be the door and never the play.
 *
 * The in-process path below is KEPT rather than replaced: it is what produced every measurement
 * in the exemption history and in `dial-sweep.mjs`, and a re-admission must not make its own
 * prior evidence un-re-runnable.
 */
if (args.includes('--plain')) {
  const { spawn } = await import('node:child_process');
  const { createInterface } = await import('node:readline');
  const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', quiet ? 'ignore' : 'inherit'],
  });
  let turns = 0;
  let plainOutcome = null;
  for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.schema !== 'goldrush.view.v1') {
      plainOutcome = message;
      process.stdout.write(`${line}\n`);
      continue;
    }
    if (!quiet) trace(turns, message.now);
    turns += 1;
    if (!child.stdin.writable || child.stdin.destroyed) continue;
    try {
      child.stdin.write(`${JSON.stringify(idle ? [] : orders(message))}\n`);
    } catch {
      // gr-sim closes stdin the moment the run terminates; a lost final line is not an error.
    }
  }
  child.stdin.end();
  await new Promise((resolve) => child.on('close', resolve));
  if (!quiet) process.stderr.write(`prover(plain/${policy}): ${turns} turns\n`);
  process.exitCode = (idle ? plainOutcome?.secured : !plainOutcome?.secured) ? 1 : 0;
} else {

// Terrain and the public view select their contract at module load, just as in gr-sim.
// Set the same launch context before importing the engine; boot alone does not select terrain.
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
  const sim = new HeadlessContractSim({ contractId: contract, seed, admissionProbe: true });
  // The same anti-hang bound `scripts/gr-sim.mjs` applies.
  const secureWave = sim.manifest.twist.secureWave ?? Balance.run.secureWave;
  const waveCeiling = secureWave + 2;
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
    if (!idle) sim.submitOrders(orders(turn.view));
    turns += 1;
    turn = sim.advanceToTurn();
  }

  const hunt = turn.view.now.deepwater?.noiseHunt;
  outcome = {
    ...sim.outcome(),
    ...(endReason ? { endReason } : {}),
    seed,
    policy: idle ? 'idle' : `public-verb/${policy}/${deckArg.join('+')}/harvest=${harvest ? 'on' : 'off'}`,
    // The hunt's own terminal state travels WITH the outcome, so a reader never has to trust a
    // sentence about the consumer that the numbers do not carry.
    noiseHunt: hunt
      ? {
          trail: hunt.trail.target,
          strikes: hunt.trail.strikes,
          decks: hunt.decks.map(({ padId, buildingId, integrity }) => `${padId}:${buildingId}:${integrity}`),
          anchor: turn.view.now.deepwater.anchor.id,
          quietZones: hunt.quietZones.map(({ id, boatInside }) => `${id}:${boatInside ? 'boat' : '-'}`),
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

} // end of the in-process (admissionProbe) transport

function trace(turns, now) {
  const hunt = now.deepwater?.noiseHunt;
  const loud = hunt?.sources.filter(({ level }) => level > 0).map(({ id }) => id).join('+') || '-';
  process.stderr.write(`t${turns} w${now.wave} hp=${now.hero.hp.toFixed(0)} gold=${now.gold}`
    + ` pros=(${now.prospector.x.toFixed(0)},${now.prospector.z.toFixed(0)})`
    + ` anchor=${now.deepwater?.anchor.id} deck=${now.deepwater?.boatBuildings.length ?? 0}`
    + ` loud=${loud} trail=${hunt?.trail.target ?? '-'} strikes=${hunt?.trail.strikes ?? 0}`
    + ` alive=${now.threats.alive} kills=${now.threats.defeatedTotal}\n`);
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
