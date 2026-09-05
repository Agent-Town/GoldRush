import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import deepwater from '../assets/contracts/epoch-5-deepwater/contracts.json' with { type: 'json' };
import regattaMask from '../assets/contracts/epoch-5-deepwater/mask-tables/e5-regatta.json' with { type: 'json' };

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e5-deepwater-claim': 'e5-deepwater-claim',
  'e5-regatta': 'e5-regatta',
  'e5-stillwater': 'e5-stillwater',
  'e5-flotilla': 'e5-flotilla',
};

/**
 * THE ADMITTED SET (2026-08-20, `fix-e5-dredge-queen-headless-socket` attempt 3 + its admission
 * completion). The Dredge-Queen socket landed: `DredgeQueenBossSystem` constructs headless, the
 * storm handoff is wired, and both bench seeds SECURE at wave 12 under public Deepwater verbs
 * (`REANCHOR`/`BOAT_BUILD` + the automatic Spark Rig). So the Claim is now ADMITTED and SEEDED.
 *
 * The Regatta and Flotilla now share that deepwater socket and add their declared consumers.
 * Stillwater remains refused.
 */
const ADMITTED = new Set(['e5-deepwater-claim', 'e5-regatta', 'e5-stillwater', 'e5-flotilla']);

test('E5 storm cargo and schedule facts stay separate, and only crewed fronts emit waves', async () => {
  test.setTimeout(90_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  host.location = new URL('http://gr-sim.local/?debug&contract=e5-stillwater');
  host.window = { location: host.location };
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { DeepwaterSocket } = await vite.ssrLoadModule('/src/sim/DeepwaterSocket.ts');
    const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
    const { deepwaterStormCarriesCorsairs, deepwaterStormDisablesScheduledWaves } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');

    for (const contract of deepwater.contracts) {
      expect(deepwaterStormCarriesCorsairs(contract)).toBe(true);
      expect(deepwaterStormDisablesScheduledWaves(contract)).toBe(contract.id !== 'e5-stillwater');
    }

    const emitted = (corsairWaveSize: number) => {
      const contract = structuredClone(loadContract('e5-deepwater-claim'));
      contract.tileParams.deepwater.corsairWaveSize = corsairWaveSize;
      const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'e5-storm-emission' });
      const events: Array<{ wave: number; at: number }> = [];
      const socket = DeepwaterSocket.create(contract, new EnemyPool(), sim.combat, () => sim.hero.group.position, (wave: number, at: number) => events.push({ wave, at }));
      socket.advance(9);
      return events;
    };
    expect(emitted(0)).toEqual([]);
    expect(emitted(1)).toEqual([{ wave: 1, at: 8 }]);
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});

/**
 * THE `SOCKETED_BUT_REFUSED` STATE IS RETIRED (2026-08-21). It was introduced one day earlier for
 * exactly one contract — `e5-stillwater`, whose noise-hunt consumer was live while the map still
 * would not secure — and it is gone because that contract is now ADMITTED. It is recorded here
 * rather than silently deleted because the state may be needed again: the moment a consumer ships
 * and its map does not secure, `socketRules === []` and a null `DeepwaterSocket.create()` stop
 * being fair proxies for "no consumer" and the third branch has to come back.
 */

/**
 * ADMISSION GATE 1 (F-ER01-E5-1) — every E5 contract must name the headless consumer it lacks.
 * The Deepwater Claim shipped without one: `tileParams.deepwater` is inert for all four contracts,
 * but it is absent from `DECLARED_INERT_PATHS`, so the AP-11 validator never demanded the
 * declaration. Nothing mechanised this; only this table does.
 */
const DECLARED_CONSUMER: Record<string, string> = {
  'e5-deepwater-claim': 'deepwater-claim-consumer',
  'e5-regatta': 'regatta-race-consumer',
  'e5-stillwater': 'noise-hunt-consumer',
  'e5-flotilla': 'distributed-base-consumer',
};

/** Count words a briefing could use, indexed by the number they name. */
const COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

type BeaconRow = { id: string; x: number; z: number; radius: number };

// Vocabulary must come from CONSUMERS, never from raw authored data. A rule sourced to
// `tileParams.deepwater` would be the reject-don't-stretch failure this census exists to catch.
const FORBIDDEN_SOURCE = [
  'tileParams.deepwater',
  'tileParams.raceCourse',
  'tileParams.stillwater',
  'tileParams.flotilla',
  'twist.weather',
];

const EXPECTED_SOCKET_RULES: Record<string, string[]> = {
  'e5-deepwater-claim': [
    'deepwater_arsenal',
    'deepwater_boss_socket',
    'deepwater_claim_boat',
    'deepwater_levers_unreachable',
    'deepwater_storm_track',
    'deepwater_water_regions',
  ],
  'e5-regatta': [
    'deepwater_arsenal',
    'deepwater_claim_boat',
    'deepwater_levers_unreachable',
    'deepwater_storm_track',
    'deepwater_water_regions',
  ],
  'e5-flotilla': [
    'deepwater_arsenal',
    'deepwater_claim_boat',
    'deepwater_levers_unreachable',
    'deepwater_storm_track',
    'deepwater_water_regions',
  ],
  // A2: the same five the family shares. `noise_hunt` is asserted separately below, exactly as
  // `flotilla_hulls` and `regatta_race` are — this list is the `deepwater_*` prefix only.
  'e5-stillwater': [
    'deepwater_arsenal',
    'deepwater_claim_boat',
    'deepwater_levers_unreachable',
    'deepwater_storm_track',
    'deepwater_water_regions',
  ],
};

for (const contract of deepwater.contracts) {
  test(`${contract.id} census admission is explicit`, async () => {
    test.setTimeout(90_000);
    const seeds = [`${contract.id}-01`, `${contract.id}-02`];
    const admitted = ADMITTED.has(contract.id);
    const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
    const previousLocation = host.location;
    const previousWindow = host.window;
    const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}`);
    const consoleErrors: string[] = [];
    const originalError = console.error;
    const originalWarn = console.warn;
    let vite: ViteDevServer | undefined;

    host.location = location;
    host.window = { location };
    console.error = (...args: unknown[]) => {
      const message = args.map(String).join(' ');
      if (!message.includes('ExperimentalWarning: localStorage is not available because --localstorage-file was not provided')) consoleErrors.push(message);
    };
    console.warn = (...args: unknown[]) => consoleErrors.push(args.map(String).join(' '));
    try {
      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { activeContract, loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const { DeepwaterSocket } = await vite.ssrLoadModule('/src/sim/DeepwaterSocket.ts');
      const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
      const manifest = deriveMechanicsManifest(contract.id);

      // Seeded exactly where admitted; the door must never advertise a run it refuses (F-DOOR-4).
      if (admitted) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
      else expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      expect(manifest.interactables).toEqual([]);
      const sources = manifest.rules.map(({ source }: { source: string }) => source);
      for (const source of FORBIDDEN_SOURCE) expect(sources).not.toContain(source);
      expect(activeContract().id).toBe(EXPECTED_ACTIVE_CONTRACT[contract.id]);

      // ADMISSION GATE 1 — the contract names the consumer it is waiting on, in the AP-11 shape
      // (`exactRecord(entry, ['dep', 'status', 'description'])`). All four now do; the Claim did not.
      expect(contract.tileParams.engineDependencies).toEqual([
        { dep: DECLARED_CONSUMER[contract.id], status: 'missing', description: expect.any(String) },
      ]);

      // ADMISSION GATE 2 (F-ER01-E5-2) — a briefing may not promise a count its own data does not hold.
      // The Regatta advertised SIX beacon gates over a FIVE-beacon course. Derive the expected word
      // from the data so the assert cannot rot the way the prose did.
      const beacons = (contract.tileParams as { raceCourse?: { beacons: BeaconRow[] } }).raceCourse?.beacons;
      if (beacons) {
        const beaconRule = contract.briefing.rules.find((rule) => rule.includes('beacon gates'));
        expect(beaconRule).toBeDefined();
        expect(beaconRule!.toLowerCase()).toContain(`${COUNT_WORDS[beacons.length]} beacon gates`);
        for (const [count, word] of COUNT_WORDS.entries()) {
          if (count !== beacons.length) expect(beaconRule!.toLowerCase()).not.toContain(`${word} beacon`);
        }
        // The mask table is the surface the terrain mesh was built from; it must agree beacon-for-beacon.
        const built = (regattaMask as { maskTruth: { raceCourse: { beacons: BeaconRow[] } } }).maskTruth.raceCourse.beacons;
        expect(built.map(({ id }) => id)).toEqual(beacons.map(({ id }) => id));
      }

      // MERGE NOTE (s1498) — `milk/twin-sockets` asserted here that the Claim carries NO
      // `engineDependencies` (`toBeUndefined()`), and the three variants merely `status: 'missing'`.
      // Both were true at its base and are false now: `milk/deepwater-surgery` landed the Claim's
      // declaration first. ADMISSION GATE 1 above supersedes them and is strictly stronger — it pins
      // the exact `dep` NAME for all four contracts, where the branch pinned only the status for
      // three. Nothing is lost by dropping those two lines; keeping them would have redded.

      const socketRules = manifest.rules
        .map(({ id }: { id: string }) => id)
        .filter((id: string) => id.startsWith('deepwater_'));
      if (admitted) {
        expect(socketRules).toEqual(EXPECTED_SOCKET_RULES[contract.id]);

        // The socket is REAL and DETERMINISTIC. Two independent tiles, identical tick counts,
        // identical snapshots — the property that makes an event-log hash mean anything.
        // The socket needs a real CombatSystem for its arsenal; borrow the one an admitted
        // contract already builds, rather than importing `three` into the spec and tripping the
        // "multiple instances" warning against the zero-console assertion below.
        const drive = (steps: number) => {
          const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'er01-e5-probe' });
          const socket = DeepwaterSocket.create(
            loadContract(contract.id),
            new EnemyPool(),
            sim.combat,
            () => sim.hero.group.position,
            () => undefined,
          );
          expect(socket).not.toBeNull();
          for (let step = 1; step <= steps; step += 1) socket.advance(step / 30);
          return socket;
        };
        const first = drive(30 * 120);
        const second = drive(30 * 120);
        expect(JSON.stringify(second.simulationSnapshot)).toBe(JSON.stringify(first.simulationSnapshot));
        // Every E5 storm track is now crewed. Stillwater alone keeps the generic north/south
        // schedule too, so its one-skiff fronts add pressure without replacing the noise hunt.
        const crews = contract.tileParams.deepwater.corsairWaveSize > 0;
        expect(first.diagnostics.corsairWaves > 0).toBe(crews);
        expect(first.diagnostics.corsairsSpawned > 0).toBe(crews);

        // F-ER01-E5-1: a missing boss handoff is COUNTED, never skipped. `drive()` builds the socket
        // with NO `bossHandoff` (the five-argument form), so every storm wave at or past the
        // Dredge-Queen's wave is still recorded as a refusal. That counter is the socket's honesty
        // mechanism and it must keep working now that a handoff EXISTS — the admitted sim below
        // wires one and therefore refuses nothing.
        if (contract.id === 'e5-deepwater-claim') expect(first.diagnostics.bossHandoffsRefused).toBeGreaterThan(0);
        else expect(first.diagnostics.bossHandoffsRefused).toBe(0);

        // F-ER01-E5-5, closed by AP-16-7: both boat levers keep the consumer's accept/reject
        // law, and the headless door exposes their diagnostics and verbs. The re-probe that this
        // once waited on has since been run and PASSED, which is why the door below is opened
        // without the `admissionProbe` escape hatch.
        const boat = contract.tileParams.deepwater.claimBoat;
        const other = boat.anchors.find(({ id }: { id: string }) => id !== boat.initialAnchorId)!;
        expect(first.reanchor(other.id)).toBe(true);
        expect(first.reanchor(other.id)).toBe(false);
        expect(first.reanchor('no-such-anchor')).toBe(false);
        expect(first.placeBoatBuilding(boat.pads[0].id, 'turret')).toBe(true);
        expect(first.placeBoatBuilding(boat.pads[0].id, 'sentry_beacon')).toBe(false);
        expect(first.placeBoatBuilding('no-such-pad', 'turret')).toBe(false);
        // No `admissionProbe` flag any more: the Claim is through the ordinary door. Constructing
        // it without the escape hatch IS the admission assertion.
        const door = new HeadlessContractSim({ contractId: contract.id, seed: 'ap16-7-e5-census' });
        const doorDeepwater = door.currentTurn().view.now.deepwater;
        expect(doorDeepwater).toMatchObject({
          pads: expect.any(Array),
          anchors: expect.any(Array),
          anchor: expect.any(Object),
        });
        if (contract.id === 'e5-deepwater-claim') {
          expect(doorDeepwater).toMatchObject({ dredgeQueenBoss: expect.objectContaining({ act: expect.any(Number), livePaddles: 2 }) });
        } else if (contract.id === 'e5-regatta') {
          expect(doorDeepwater?.race).toMatchObject({ gatesPassed: expect.any(Array), finished: false });
          // The bundle authors no competing-racer roster or loot zones. Record the remaining
          // authoring honestly; this slice must not stretch one corsair racer into a loot system.
          expect(manifest.rules.find(({ id }: { id: string }) => id === 'regatta_race')?.data.competingRacerLoot).toBe(false);
        } else if (contract.id === 'e5-stillwater') {
          // A2 — the hunt is published on the same surface its siblings use, and at BOOT it is
          // silent: nothing has run yet, so nothing is heard and nothing is trailed.
          expect(doorDeepwater?.noiseHunt).toMatchObject({
            sources: [
              { id: 'air-pump', radius: 18, running: false, level: 0 },
              { id: 'engine', radius: 24, running: false, level: 0 },
              { id: 'harpoon-reload', radius: 14, running: false, level: 0 },
            ],
            trail: { target: null, strikes: 0 },
            fog: { id: 'stillwater-fog' },
          });
          expect(manifest.rules.find(({ id }: { id: string }) => id === 'noise_hunt')?.source)
            .toBe('NoiseHuntSystem.advance+onReanchor');
          // The owner-ruled third anchor is what admitted this map: it is the only station where
          // every machine is LOUD and none of it lands on the hero (F-A2-3, ruled 2026-08-21).
          expect(doorDeepwater?.anchors).toEqual([
            { id: 'lagoon', x: 0, z: 30 },
            { id: 'open-water', x: -24, z: 12 },
            { id: 'shelf-watch', x: 36, z: 30 },
          ]);
          expect(doorDeepwater?.noiseHunt?.quietZones.every(({ boatInside }: { boatInside: boolean }) => !boatInside)).toBe(true);
        } else {
          expect(doorDeepwater?.flotilla).toMatchObject({
            hulls: expect.arrayContaining([expect.objectContaining({ district: 'kitchen', integrity: 96, lost: false })]),
            centroid: { x: 0, z: 23 },
            allLost: false,
          });
          expect(manifest.rules.find(({ id }: { id: string }) => id === 'flotilla_hulls')?.source)
            .toBe('FlotillaHullSystem.advance+reanchor+targetPosition');
        }
        // The wired sim hands every storm wave to a real boss, so nothing is refused.
        expect(doorDeepwater!.bossHandoffsRefused).toBe(0);
        for (const order of [
          { verb: 'BOAT_BUILD', padId: boat.pads[1].id, buildingId: 'turret' },
          { verb: 'REANCHOR', anchorId: other.id },
        ]) expect(door.submitOrders([order]).outcome.ok).toBe(true);
        const levers = manifest.rules.find(({ id }: { id: string }) => id === 'deepwater_levers_unreachable');
        expect(levers.data.consumerLevers).toEqual(['ClaimBoat.placeBuilding', 'ClaimBoat.reanchor']);
        expect(manifest.buildables).toEqual(expect.any(Array));
      } else {
        expect(socketRules).toEqual([]);
        // The remaining variants carry `tileParams.deepwater` too. The socket must refuse them exactly as
        // `createDeepwaterClaimTile` does, or their missing consumers would look socketed.
        const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'er01-e5-probe' });
        const socket = DeepwaterSocket.create(
          loadContract(contract.id),
          new EnemyPool(),
          sim.combat,
          () => sim.hero.group.position,
          () => undefined,
        );
        expect(socket).toBeNull();
      }

      // THE DOOR ITSELF. Admitted contracts boot on their own bench seeds; the remainder are
      // refused BY NAME, which keeps the refusal honest rather than silent.
      for (const seed of seeds) {
        if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        else expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(/AP-07 supports only/);
      }
      expect(consoleErrors).toEqual([]);
    } finally {
      await vite?.close();
      console.error = originalError;
      console.warn = originalWarn;
      if (previousLocation === undefined) delete host.location;
      else host.location = previousLocation;
      if (previousWindow === undefined) delete host.window;
      else host.window = previousWindow;
    }
  });
}
