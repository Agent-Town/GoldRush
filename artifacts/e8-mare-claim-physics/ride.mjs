// Mare Claim ride driver — the evidence producer for `tasks/e8-mare-claim-physics.md`.
//
// It rides the headless sim through the PUBLIC door surface only: standing orders in, the rider
// view out, no hero buffing and no debug grants. So the log is a floor ride a rider could
// reproduce through the same door the board ranks (L2, `specs/epoch-saga/CAPABILITY-LADDER.md:38`).
//
// The policy is deliberately small and readable, because the log has to be believable:
//   · defend — turrets around the claim as gold allows, repair under 70%, take the first upgrade;
//   · the regolith run — send the Prospector to the nearest ACTIVE seam whose ground is not yet
//     worked (the six authored `harvestAnchors`, the briefing's "six regolith harvest grounds");
//   · the air — when the suit runs low, walk the HERO onto the centre dome pad and give the
//     Prospector no work, so it drifts in with the hero and the suit refills;
//   · secure — bank the moment the boundary offers it.
import { writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const CONTRACT = 'e8-mare-claim';
const SEED = process.env.RIDE_SEED ?? 'e8-mare-claim-01';
const OUT = process.env.RIDE_OUT ?? null;
const POLICY = process.env.RIDE_POLICY ?? 'rider';
const MAX_DECISIONS = Number(process.env.RIDE_MAX_DECISIONS ?? 600);
const location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEED}`);
globalThis.location = location;
globalThis.window = { location };
// The tier banner and boot chatter go through console.log; this driver writes with
// process.stdout.write, so silencing them keeps the ride log a ride log (scripts/same-game-audit.mjs:11).
console.log = () => undefined;
console.info = () => undefined;

const lines = [];
const say = (text) => { lines.push(text); process.stdout.write(`${text}\n`); };
const round = (value) => Math.round(value * 100) / 100;

// The centre dome pad the contract authors (`dome-cluster-pad-center`, x -6..6 / z -6..6 in
// `assets/contracts/epoch-8-orbital/contracts.json`) — the closest breathable ground to the claim
// at (0,12), and this ride's air station.
const DOME_AIR_STATION = { x: 0, z: 0 };

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
  if (POLICY === 'harness') {
    // A HARNESS RIDE, NOT A FLOOR RIDE — labelled here and in the log so no reader mistakes it
    // for a door result. The buff is the `scripts/twin-banks-hash-probe.mjs:47-49` idiom: it keeps
    // the body alive so the ERA MECHANIC can be observed for longer than the map's null floor
    // (wave 2, `assets/contracts/null-floors.json`), and it changes nothing about the air rules.
    sim.hero.applyStats(10_000, 1);
    sim.hero.heal(10_000);
    say('HARNESS RIDE: hero buffed (applyStats 10000/heal) to outlive the null floor. NOT a floor ride, NOT a door result.');
  }
  let turn = sim.currentTurn();
  const first = turn.view;
  say(`ride: ${CONTRACT} seed=${SEED} policy=${POLICY} viewVersion=${first.viewVersion} schema=${first.schema}`);
  say(`claim=${JSON.stringify(first.stablePrefix.map.claim)} hero=${JSON.stringify({ x: first.now.hero.x, z: first.now.hero.z, hp: first.now.hero.hp })} prospector=${JSON.stringify(first.now.prospector)}`);
  say(`goals=${JSON.stringify(first.stablePrefix.contract.briefing.goals)}`);
  say(`posting=${JSON.stringify(first.stablePrefix.mechanics.posting)}`);
  say(`now.gravity=${JSON.stringify(first.now.gravity)}`);
  say(`now.air=${JSON.stringify(first.now.air)}`);

  let turrets = 0;
  let blasted = 0;
  let lastWorked = 0;
  let minSuit = Infinity;
  let refills = 0;
  let decisions = 0;
  let lastInDome = null;

  const submit = (orders, label) => {
    const receipt = sim.submitOrders(orders);
    if (!receipt.outcome.ok) say(`  ORDERS REFUSED (${label}): ${receipt.outcome.message}`);
    return receipt.outcome.ok;
  };

  while (!turn.terminal && decisions < MAX_DECISIONS) {
    const now = turn.view.now;
    const air = now.air;
    const orders = [];

    if (now.pendingSecure) {
      say(`wave=${now.wave} t=${round(now.timers.runSeconds)}s PENDING SECURE (worked=${JSON.stringify(air?.regolith.worked)} complete=${air?.regolith.complete}) -> bank`);
      submit([{ verb: 'SECURE_CHOICE', choice: 'bank' }], 'secure');
      turn = sim.advanceToTurn();
      decisions += 1;
      continue;
    }

    if (POLICY !== 'idle') {
      // DEFEND. Turrets ring the claim.
      const ring = [{ x: -5, z: 15 }, { x: 5, z: 15 }, { x: -5, z: 8 }, { x: 5, z: 8 }, { x: 0, z: 18 }];
      for (let index = 0; index < ring.length; index += 1) {
        orders.push({ verb: 'BUILD', what: 'turret', where: ring[index], when: { goldGte: 45 + index * 15 } });
      }
      orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

      // THE REGOLITH RUN, air first. `now.seams` already publishes each active seam's
      // `anchorIndex`, so "which grounds are left" is a read, not a guess.
      const worked = new Set(air?.regolith.worked ?? []);
      const active = (now.seams ?? []).filter((seam) => seam.active && seam.x !== null);
      const unworked = active.filter((seam) => !worked.has(seam.anchorIndex));
      const target = (unworked.length > 0 ? unworked : active)
        .sort((left, right) => Math.hypot(left.x - now.prospector.x, left.z - now.prospector.z)
          - Math.hypot(right.x - now.prospector.x, right.z - now.prospector.z))[0];
      // THE AIR RUN. There is no sluice on this map to send the Prospector to (a sluice works
      // water and the Mare Claim authors none: `waterSources: []`), so the only authored way back
      // to breathable air is the HERO'S BODY: with no work assigned the Prospector drifts to the
      // hero (`src/agent/Embodiment.ts:139` -> `driftNearHero`), so a rider who walks the hero
      // onto a dome pad walks the Prospector into the dome with it. Air first, then the ground.
      const suit = air?.suit.seconds ?? Infinity;
      const breathing = Boolean(air?.suit.inDome);
      const needsAir = air !== undefined && (suit < 20 || (breathing && suit < air.suit.capacity - 1));
      if (needsAir) {
        // No HARVEST order this turn: the Prospector must be workless to follow the hero in.
        orders.push({ verb: 'HOLD', pos: DOME_AIR_STATION });
      } else {
        if (target) orders.push({ verb: 'HARVEST', seam: target.id });
        // The hero walks to the gold the Prospector frees (pickups are collected by a body).
        if (target) orders.push({ verb: 'MOVE_TO', pos: { x: target.x, z: target.z } });
        orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 6 }, pos: { x: 0, z: 12 } });
      }

      // THE GRAVITY-SCALED LOB. The view names the spawn EDGE, not enemy positions, so the rider
      // lobs down that edge at 20m — beyond the 10m reach `Balance.blast.range` allows off gravity
      // (`OUT_OF_RANGE`), inside the 24m this contract's 2.4x arc allows. The accepted event
      // records the reach and the hang it flew with, both scaled by the profile.
      const edgeAim = { east: { x: 20, z: 0 }, west: { x: -20, z: 0 }, north: { x: 0, z: 20 }, south: { x: 0, z: -20 } }[now.threats?.edge ?? ''];
      if (now.blastReadyInMs === 0 && edgeAim && now.threats.alive > 0) {
        orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x + edgeAim.x, z: now.hero.z + edgeAim.z } });
      }
      // Upgrades are taken by the door's own default rule (`now.hero.upgradeChoiceRule`), not by
      // a PICK_UPGRADE order: a pick naming an id that is not on offer refuses the WHOLE batch,
      // which is how the first draft of this ride silently rode with no orders at all.
      submit(orders, `wave ${now.wave}`);
    }

    turn = sim.advanceToTurn();
    decisions += 1;
    const after = turn.view.now;
    const afterAir = after.air;
    if (afterAir) {
      minSuit = Math.min(minSuit, afterAir.suit.seconds);
      if (afterAir.suit.inDome && afterAir.suit.inDome !== lastInDome) refills += 1;
      lastInDome = afterAir.suit.inDome;
      if (afterAir.regolith.worked.length !== lastWorked) {
        lastWorked = afterAir.regolith.worked.length;
        say(`wave=${after.wave} t=${round(after.timers.runSeconds)}s GROUND WORKED -> ${JSON.stringify(afterAir.regolith.worked)} (${lastWorked}/${afterAir.regolith.required}) runsOnAir=${afterAir.regolith.runsOnAir} breathless=${afterAir.regolith.breathlessPans} suit=${round(afterAir.suit.seconds)}s inDome=${afterAir.suit.inDome}`);
      }
    }
    const works = after.works?.entries ?? [];
    turrets = works.filter((work) => work.id === 'turret').length;
    blasted = (sim.replayEvents ?? []).filter((event) => event.type === 'blast_at').length;
    if (decisions % 6 === 0) {
      say(`wave=${after.wave} t=${round(after.timers.runSeconds)}s gold=${after.gold} hero=${after.hero.hp}/${after.hero.maxHp} turrets=${turrets} blasts=${blasted} suit=${round(afterAir?.suit.seconds ?? -1)}s inDome=${afterAir?.suit.inDome} domes=${JSON.stringify(afterAir?.domes.map((dome) => [dome.id.replace('dome-cluster-pad-', ''), dome.air, dome.breached]))} worked=${afterAir?.regolith.worked.length}/${afterAir?.regolith.required}`);
    }
  }

  const outcome = sim.outcome();
  const final = turn.view.now;
  say(`TERMINAL decisions=${decisions} outcome=${JSON.stringify(outcome)}`);
  say(`final now.air=${JSON.stringify(final.air)}`);
  say(`minSuitSeconds=${minSuit === Infinity ? 'n/a' : round(minSuit)} domeRefills=${refills} turrets=${turrets} blasts=${blasted}`);
  const events = sim.replayEvents ?? [];
  const kinds = {};
  for (const event of events) kinds[event.type] = (kinds[event.type] ?? 0) + 1;
  say(`event kinds=${JSON.stringify(kinds)}`);
  for (const event of events.filter((event) => event.type === 'blast_at').slice(0, 6)) say(`event ${JSON.stringify(event)}`);
  for (const event of events.filter((event) => event.type === 'regolith_ground_worked')) say(`event ${JSON.stringify(event)}`);
} finally {
  await vite.close();
  if (OUT) writeFileSync(OUT, `${lines.join('\n')}\n`);
}
