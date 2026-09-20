// The ride driver for `tasks/e8-remaining-maps.md` — one policy, three maps, no debug grants.
//
// It rides the headless sim through the PUBLIC door surface only: standing orders in, the rider
// view out. So a `rider` log is a FLOOR ride a rider could reproduce through the same door the
// board ranks (L2, `specs/epoch-saga/CAPABILITY-LADDER.md:38`), and the only thing `harness` adds
// is the `scripts/twin-banks-hash-probe.mjs:47-49` hero buff, which lets a ride outlive the map's
// wave-2 null floor so the wave-20 secure boundary can be observed at all. The buff changes no air
// rule; it is labelled in the log and in the report so no reader mistakes it for a door result.
//
// THE POLICY, small enough to be believable:
//   · defend  — turrets around the claim as gold allows, repair under 70%, take the first upgrade;
//   · the air — read `now.air.suit.seconds`; when it runs low, HOLD the Prospector at the nearest
//               shelter the view says is still breathing (`now.air.domes[].air > 0`). On the
//               Eclipse that is the whole mechanic: after the shadow the rim pads read 0 and only
//               the reserve does;
//   · the era — crossing maps walk the authored crossing zones in turn (`now.air.crossing.zones`);
//               the Eclipse works the nearest unworked regolith ground (`now.seams[].anchorIndex`
//               against `now.air.regolith.worked`);
//   · secure  — bank the moment the boundary offers it.
//
// Zone CENTRES come from the contract JSON, which a driver may read: it is the map, not a hidden
// engine fact, and the view publishes the zone IDS a rider steers by.
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const CONTRACT = process.env.RIDE_CONTRACT ?? 'e8-far-side';
const SEED = process.env.RIDE_SEED ?? `${CONTRACT}-01`;
const OUT = process.env.RIDE_OUT ?? null;
const POLICY = process.env.RIDE_POLICY ?? 'rider';
const MAX_DECISIONS = Number(process.env.RIDE_MAX_DECISIONS ?? 600);
const SUIT_FLOOR = Number(process.env.RIDE_SUIT_FLOOR ?? 22);

const location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEED}`);
globalThis.location = location;
globalThis.window = { location };
// The tier banner and boot chatter go through console.log; this driver writes with
// process.stdout.write, so silencing them keeps the ride log a ride log.
console.log = () => undefined;
console.info = () => undefined;

const lines = [];
const say = (text) => { lines.push(text); process.stdout.write(`${text}\n`); };
const round = (value) => Math.round(value * 100) / 100;

const bundle = JSON.parse(readFileSync(new URL('../../assets/contracts/epoch-8-orbital/contracts.json', import.meta.url), 'utf8'));
const manifest = bundle.contracts.find((entry) => entry.id === CONTRACT);
if (!manifest) throw new Error(`no such contract: ${CONTRACT}`);
const centres = new Map();
for (const zone of [
  ...(manifest.tileParams.buildZones ?? []),
  ...(manifest.tileParams.orbitalScaffoldZones ?? []),
  ...(manifest.tileParams.probeRecoveryZones ?? []),
]) centres.set(zone.id, { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 });
const centreOf = (id) => centres.get(id) ?? { x: 0, z: 0 };
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
  if (POLICY === 'harness') {
    sim.hero.applyStats(10_000, 1);
    sim.hero.heal(10_000);
    say('HARNESS RIDE: hero buffed (applyStats 10000/heal) to outlive the null floor. NOT a floor ride, NOT a door result.');
  }
  let turn = sim.currentTurn();
  const first = turn.view;
  say(`ride: ${CONTRACT} seed=${SEED} policy=${POLICY} viewVersion=${first.viewVersion} schema=${first.schema}`);
  say(`claim=${JSON.stringify(first.stablePrefix.map.claim)} hero=${JSON.stringify({ x: first.now.hero.x, z: first.now.hero.z, hp: first.now.hero.hp })} prospector=${JSON.stringify(first.now.prospector)}`);
  say(`goals=${JSON.stringify(first.stablePrefix.contract.briefing.goals)}`);
  say(`now.gravity=${JSON.stringify(first.now.gravity)}`);
  say(`now.air=${JSON.stringify(first.now.air)}`);

  let decisions = 0;
  let minSuit = Infinity;
  let refills = 0;
  let lastShelter = null;
  let lastReached = 0;
  let lastWorked = 0;
  let eclipseLogged = false;
  let firstCrossingAt = null;
  let crossingCompleteAt = null;

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
      say(`wave=${now.wave} t=${round(now.timers.runSeconds)}s PENDING SECURE (crossing=${JSON.stringify(air?.crossing?.reached)} worked=${JSON.stringify(air?.regolith.worked)} complete=${air?.regolith.complete}) -> bank`);
      submit([{ verb: 'SECURE_CHOICE', choice: 'bank' }], 'secure');
      turn = sim.advanceToTurn();
      decisions += 1;
      continue;
    }

    if (POLICY !== 'idle') {
      const claim = turn.view.stablePrefix.map.claim;
      const ring = [
        { x: claim.x - 5, z: claim.z + 3 }, { x: claim.x + 5, z: claim.z + 3 },
        { x: claim.x - 5, z: claim.z - 4 }, { x: claim.x + 5, z: claim.z - 4 },
        { x: claim.x, z: claim.z + 6 },
      ];
      for (let index = 0; index < ring.length; index += 1) {
        orders.push({ verb: 'BUILD', what: 'turret', where: ring[index], when: { goldGte: 45 + index * 15 } });
      }
      orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

      const prospector = now.prospector ?? { x: now.hero.x, z: now.hero.z };
      const breathing = (air?.domes ?? []).filter((shelter) => shelter.air > 0);
      const nearestShelter = breathing
        .map((shelter) => ({ id: shelter.id, ...centreOf(shelter.id) }))
        .sort((left, right) => distance(left, prospector) - distance(right, prospector))[0];
      const suit = air?.suit.seconds ?? Infinity;
      const needsAir = air !== undefined && nearestShelter !== undefined
        && (suit < SUIT_FLOOR || (air.suit.inDome !== null && suit < air.suit.capacity - 1));

      if (needsAir) {
        orders.push({ verb: 'HOLD', pos: { x: nearestShelter.x, z: nearestShelter.z } });
      } else if (air?.crossing) {
        // THE CROSSING. Walk the authored zones the view names, in order, skipping the ones this
        // run has already made on air. Nothing here is a coordinate the rider guessed: the ids
        // come off `now.air.crossing`, and the map supplies their centres.
        const nextZone = air.crossing.zones.find((id) => !air.crossing.reached.includes(id));
        const target = nextZone ?? air.crossing.zones[air.crossing.zones.length - 1];
        // A6's own verb goes FIRST, and that is a fact about the executor rather than a taste:
        // `StandingOrders.tick` returns on the first order that produces a result, and a HOLD
        // produces one every tick forever, so anything queued after a HOLD never runs at all
        // (measured: `recover` sat `pending` for 45 turns behind one). Re-issued every turn until
        // the probe is out, so the refusal counter is the honest record of how many tries it took.
        if (now.probeRecovery && !now.probeRecovery.recovered) {
          orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
        }
        orders.push({ verb: 'HOLD', pos: centreOf(target) });
      } else {
        // THE REGOLITH RUN (the Eclipse). `now.seams` publishes each active seam's `anchorIndex`,
        // so "which grounds are left" is a read, not a guess.
        const worked = new Set(air?.regolith.worked ?? []);
        const active = (now.seams ?? []).filter((seam) => seam.active && seam.x !== null);
        const unworked = active.filter((seam) => !worked.has(seam.anchorIndex));
        const target = (unworked.length > 0 ? unworked : active)
          .sort((left, right) => distance(left, prospector) - distance(right, prospector))[0];
        if (target) {
          orders.push({ verb: 'HARVEST', seam: target.id });
          orders.push({ verb: 'MOVE_TO', pos: { x: target.x, z: target.z } });
        }
        orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 6 }, pos: claim });
      }

      // THE GRAVITY-SCALED LOB. The view names the spawn EDGE, not enemy positions, so the rider
      // lobs down that edge at a reach the era's arc makes legal and the base rig does not.
      const edgeAim = { east: { x: 20, z: 0 }, west: { x: -20, z: 0 }, north: { x: 0, z: 20 }, south: { x: 0, z: -20 } }[now.threats?.edge ?? ''];
      if (now.blastReadyInMs === 0 && edgeAim && now.threats.alive > 0) {
        orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x + edgeAim.x, z: now.hero.z + edgeAim.z } });
      }
      submit(orders, `wave ${now.wave}`);
      const recovery = now.orders?.find((entry) => entry.order?.action === 'recover');
      if (recovery) say(`  recover order: status=${recovery.status} reason=${recovery.reason ?? 'none'} prospector=${JSON.stringify(prospector)}`);
    }

    turn = sim.advanceToTurn();
    decisions += 1;
    const after = turn.view.now;
    const afterAir = after.air;
    if (afterAir) {
      minSuit = Math.min(minSuit, afterAir.suit.seconds);
      if (afterAir.suit.inDome && afterAir.suit.inDome !== lastShelter) refills += 1;
      lastShelter = afterAir.suit.inDome;
      const crossing = afterAir.crossing;
      if (crossing && crossing.reached.length !== lastReached) {
        lastReached = crossing.reached.length;
        if (firstCrossingAt === null) firstCrossingAt = after.timers.runSeconds;
        if (crossing.complete && crossingCompleteAt === null) crossingCompleteAt = after.timers.runSeconds;
        say(`wave=${after.wave} t=${round(after.timers.runSeconds)}s CROSSED ON AIR -> ${JSON.stringify(crossing.reached)} (${lastReached}/${crossing.required}) breathlessEntries=${crossing.breathlessEntries} suit=${round(afterAir.suit.seconds)}s shelter=${afterAir.suit.inDome}`);
      }
      if (afterAir.regolith.worked.length !== lastWorked) {
        lastWorked = afterAir.regolith.worked.length;
        say(`wave=${after.wave} t=${round(after.timers.runSeconds)}s GROUND WORKED -> ${JSON.stringify(afterAir.regolith.worked)} (${lastWorked}/${afterAir.regolith.required}) runsOnAir=${afterAir.regolith.runsOnAir} breathless=${afterAir.regolith.breathlessPans} afterEclipse=${afterAir.eclipse?.groundsWorkedAfter ?? 'n/a'} suit=${round(afterAir.suit.seconds)}s shelter=${afterAir.suit.inDome}`);
      }
      if (afterAir.eclipse?.arrived && !eclipseLogged) {
        eclipseLogged = true;
        say(`wave=${after.wave} t=${round(after.timers.runSeconds)}s ECLIPSE ARRIVED at wave ${afterAir.eclipse.arrivedAtWave}: solar=${afterAir.eclipse.solar} offline=${JSON.stringify(afterAir.eclipse.offline)} reserve=${afterAir.eclipse.reserve} needs ${afterAir.eclipse.requiredAfter} ground(s) on air after this`);
      }
    }
    if (decisions % 6 === 0) {
      say(`wave=${after.wave} t=${round(after.timers.runSeconds)}s gold=${after.gold} hero=${after.hero.hp}/${after.hero.maxHp} prospector=${JSON.stringify(after.prospector)} suit=${round(afterAir?.suit.seconds ?? -1)}s shelter=${afterAir?.suit.inDome} shelters=${JSON.stringify(afterAir?.domes.map((shelter) => [shelter.id, shelter.air]))} crossed=${afterAir?.crossing?.reached.length ?? 'n/a'}/${afterAir?.crossing?.required ?? 'n/a'} worked=${afterAir?.regolith.worked.length}/${afterAir?.regolith.required}`);
    }
  }

  const outcome = sim.outcome();
  const final = turn.view.now;
  say(`TERMINAL decisions=${decisions} outcome=${JSON.stringify(outcome)}`);
  say(`final now.air=${JSON.stringify(final.air)}`);
  say(`final now.probeRecovery=${JSON.stringify(final.probeRecovery ?? null)}`);
  say(`minSuitSeconds=${minSuit === Infinity ? 'n/a' : round(minSuit)} shelterEntries=${refills} firstCrossingAt=${firstCrossingAt === null ? 'n/a' : round(firstCrossingAt)}s crossingCompleteAt=${crossingCompleteAt === null ? 'n/a' : round(crossingCompleteAt)}s`);
  const events = sim.replayEvents ?? [];
  const kinds = {};
  for (const event of events) kinds[event.type] = (kinds[event.type] ?? 0) + 1;
  say(`event kinds=${JSON.stringify(kinds)}`);
  for (const event of events.filter((event) => event.type === 'blast_at').slice(0, 4)) say(`event ${JSON.stringify(event)}`);
  for (const event of events.filter((event) => event.type === 'regolith_ground_worked')) say(`event ${JSON.stringify(event)}`);
  for (const event of events.filter((event) => event.type === 'probe_recovered')) say(`event ${JSON.stringify(event)}`);
} finally {
  await vite.close();
  if (OUT) writeFileSync(OUT, `${lines.join('\n')}\n`);
}
