import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import voltage from '../assets/contracts/epoch-3-voltage/contracts.json' with { type: 'json' };

// SOCKET_GAPS IS GONE (2026-08-20). It held exactly one row — `e3-fairground: ['dayNightCycle',
// 'fairground', 'powerGrid']` — and asserted the pair that made a gap real: the field is declared,
// and no manifest rule sources it. All three are now consumed here (the day/night cycle IS the
// crowd-flock launch clock and the pavilions' night radius; `twist.fairground` builds the wheel and
// the flocks in both engines; the power grid carries the dynamo's own 24 W), so every Voltage
// contract has an explicit branch below and the fallback exists only to catch a NEW contract that
// arrives without one. Deleting the table rather than emptying it is deliberate: an empty gap table
// reads as "measured, none found", which would be a claim no one made.

for (const contract of voltage.contracts) {
  test(`${contract.id} census support is explicit and deterministic`, async () => {
    test.setTimeout(90_000);
    const seeds = (benchSeeds as Record<string, string[]>)[contract.id]!;
    const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
    const previousLocation = host.location;
    const previousWindow = host.window;
    const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}`);
    const consoleErrors: string[] = [];
    const originalError = console.error;
    const originalWarn = console.warn;
    let vite: ViteDevServer | undefined;
    let restoreRig: (() => void) | undefined;

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
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract.id);
      // Every rule this epoch publishes is sourced to a CONSUMER, never to the declaration it
      // reads — the shape the retired SOCKET_GAPS table used to assert the absence of.
      expect(mechanics.rules.every(({ source }: { source: string }) => !source.startsWith('twist.fairground'))).toBe(true);

      expect(seeds).toHaveLength(2);
      if (contract.id === 'e3-canyon-works') {
        const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
        const rig = { ...Balance.sparkRig };
        restoreRig = () => Object.assign(Balance.sparkRig, rig);
        for (const seed of seeds) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        expect(mechanics.buildables).toBeUndefined();
        expect(mechanics.interactables.flatMap(({ operations }: { operations: string[] }) => operations)).toEqual([]);
        expect(mechanics.rules).toEqual(expect.arrayContaining([
          {
            id: 'connect_objective',
            source: 'Game.syncCanyonConnectObjective',
            data: {
              consumerRole: 'gallery',
              poweredState: 'powered',
              required: 2,
              byWave: 6,
              completionLatch: 'one-way-at-or-before-deadline',
              failureLatch: 'one-way-after-deadline',
              missedDeadline: 'run-unsecurable',
            },
          },
          {
            id: 'darkness_cycle',
            source: 'Game.nightShiftLightingState',
            data: {
              duskWave: 4,
              darkWave: 8,
              nightDepth: 1,
              phases: ['full', 'dusk', 'dark'],
              progression: 'clamp((wave-duskWave)/max(1,darkWave-duskWave),0,1)',
              returnsToFull: false,
            },
          },
        ]));

        Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
        const stepToWave = (sim: any, target: number) => {
          const maxTicks = Math.ceil(((target + 1) * Balance.waves.waveInterval) / (1 / 30));
          for (let tick = 0; sim.waves.diagnostics.wave < target && tick < maxTicks; tick += 1) sim.step();
          expect(sim.waves.diagnostics.wave).toBe(target);
          return structuredClone(sim.dayNightSnapshot);
        };
        const powerGalleries = (sim: any) => {
          expect(contract.tileParams.pylonSites).toHaveLength(6);
          for (const site of contract.tileParams.pylonSites ?? []) {
            expect(sim.build.placeFree('sentry_beacon', site, 0)).toBe(true);
          }
        };
        const runPowered = (seed: string) => {
          const sim = new HeadlessContractSim({ contractId: contract.id, seed, mode: 'escort' });
          sim.hero.applyStats(100_000, 1);
          sim.hero.heal(100_000);
          powerGalleries(sim);
          const darkness = new Map<number, any>([[0, structuredClone(sim.dayNightSnapshot)]]);
          for (const wave of [3, 4, 6, 8, 12]) darkness.set(wave, stepToWave(sim, wave));
          const state = sim.surface.tools.get_state().outcome.state;
          sim.postHeroDeath();
          return { darkness, state, outcome: sim.outcome() };
        };

        const first = runPowered(seeds[0]!);
        const second = runPowered(seeds[0]!);
        expect(second.outcome.eventLogHash).toBe(first.outcome.eventLogHash);
        expect(first.outcome).toMatchObject({ secured: false, waves: 12, calls: 0 });
        expect(first.darkness.get(3)).toMatchObject({ phase: 'full', darkness: 0, phaseProgress: 0, cycleProgress: 0, cycle: 0 });
        expect(first.darkness.get(4)).toMatchObject({ phase: 'dusk', darkness: 0, phaseProgress: 0, cycleProgress: 0, cycle: 0 });
        expect(first.darkness.get(6)).toMatchObject({ phase: 'dusk', darkness: 0.5, phaseProgress: 0.5, cycleProgress: 0.5, cycle: 0 });
        expect(first.darkness.get(8)).toMatchObject({ phase: 'dark', darkness: 1, phaseProgress: 1, cycleProgress: 1, cycle: 0 });
        expect(first.darkness.get(12)).toMatchObject({ phase: 'dark', darkness: 1, phaseProgress: 1, cycleProgress: 1, cycle: 0 });
        expect(first.state.canyonConnect).toEqual({ powered: 2, required: 2, byWave: 6, complete: true, failed: false });

        const failed = new HeadlessContractSim({ contractId: contract.id, seed: seeds[1]!, mode: 'escort' });
        failed.hero.applyStats(100_000, 1);
        failed.hero.heal(100_000);
        stepToWave(failed, 6);
        expect(failed.surface.tools.get_state().outcome.state.canyonConnect).toEqual({ powered: 0, required: 2, byWave: 6, complete: false, failed: false });
        stepToWave(failed, 7);
        expect(failed.surface.tools.get_state().outcome.state.canyonConnect).toEqual({ powered: 0, required: 2, byWave: 6, complete: false, failed: true });
        powerGalleries(failed);
        failed.step();
        expect(failed.surface.tools.get_state().outcome.state.canyonConnect).toEqual({ powered: 2, required: 2, byWave: 6, complete: false, failed: true });

        const runCrawler = (seed: string) => {
          Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
          const sim = new HeadlessContractSim({ contractId: contract.id, seed });
          sim.hero.applyStats(100_000, 1);
          sim.hero.heal(100_000);
          powerGalleries(sim);
          const crawler3dStates = new Set<string>([sim.crawler.diagnostics().crawler3dState]);
          const step = () => {
            sim.step();
            crawler3dStates.add(sim.crawler.diagnostics().crawler3dState);
          };
          const stepCrawlerToWave = (target: number) => {
            const maxTicks = Math.ceil(((target + 1) * Balance.waves.waveInterval) / (1 / 30));
            for (let tick = 0; sim.waves.diagnostics.wave < target && tick < maxTicks; tick += 1) step();
            expect(sim.waves.diagnostics.wave).toBe(target);
          };
          const killComponent = (id: string) => {
            const enemy = sim.enemies.all.find((entry: any) => entry.isAlive && entry.variantId === 'dynamo_crawler' && entry.bossComponentId === id);
            expect(enemy).toBeTruthy();
            sim.combat.killEnemy(enemy, sim.timeAlive, 'hero');
            crawler3dStates.add(sim.crawler.diagnostics().crawler3dState);
            step();
            return structuredClone(sim.surface.tools.get_state().outcome.state.crawler);
          };

          stepCrawlerToWave(13);
          while (sim.waves.diagnostics.wave === 13 && sim.waves.diagnostics.nextWaveInSim > 6) step();
          Object.assign(Balance.sparkRig, { damage: 0, fireRate: 1 });
          stepCrawlerToWave(14);
          const act1 = structuredClone(sim.surface.tools.get_state().outcome.state.crawler);
          const act2 = killComponent('drain_mast');
          for (let tick = 0; tick < Math.ceil((Balance.crawler.burstIntervalSeconds + 0.1) / (1 / 30)); tick += 1) step();
          const burst = structuredClone(sim.surface.tools.get_state().outcome.state.crawler);
          const tracks = killComponent('tracks');
          const act3 = killComponent('capacitor_bank');
          const outcome = sim.outcome();
          sim.crawler.crawler3dState = act3.crawler3dState === 'lite' ? 'off' : 'lite';
          const rendererVariantHash = sim.outcome().eventLogHash;
          return { act1, act2, burst, tracks, act3, outcome, rendererVariantHash, crawler3dStates: [...crawler3dStates] };
        };

        const crawlerFirst = runCrawler(seeds[0]!);
        const crawlerSecond = runCrawler(seeds[0]!);
        expect(crawlerSecond.outcome.eventLogHash).toBe(crawlerFirst.outcome.eventLogHash);
        expect(crawlerFirst.rendererVariantHash).toBe(crawlerFirst.outcome.eventLogHash);
        expect(crawlerFirst.act1).toMatchObject({ act: 1, drainActive: true, drainWatts: 18, drainTarget: expect.any(String), destroyed: [] });
        expect(crawlerFirst.act2).toMatchObject({ act: 2, drainActive: false, destroyed: ['drain_mast'] });
        expect(crawlerFirst.burst.bursts).toBeGreaterThanOrEqual(1);
        expect(crawlerFirst.tracks).toMatchObject({ act: 2, tracksPinned: true, destroyed: ['drain_mast', 'tracks'] });
        expect(crawlerFirst.act3).toMatchObject({
          act: 3,
          tracksPinned: true,
          overchargeRemaining: expect.any(Number),
          destroyed: ['drain_mast', 'tracks', 'capacitor_bank'],
        });
        expect(crawlerFirst.act3.overchargeRemaining).toBeGreaterThan(0);
        expect(crawlerFirst.crawler3dStates).toEqual([crawlerFirst.act1.crawler3dState]);
        expect(crawlerFirst.outcome).toMatchObject({ secured: true, waves: 14, calls: 0 });
      } else if (contract.id === 'e3-blackout-ridge') {
        const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
        const rig = { ...Balance.sparkRig };
        restoreRig = () => Object.assign(Balance.sparkRig, rig);
        expect(mechanics).toMatchObject({
          buildables: [{
            id: 'capacitor_bank',
            operation: 'BUILD',
            meaning: 'Stores 0.05 Wh and returns up to 12 W when the trunk is cut.',
            cost: 75,
            maxCount: 4,
            source: 'twist.powerGrid',
          }],
          interactables: expect.arrayContaining([
            { id: 'lantern_post', count: 2, operations: [], source: 'tileParams.prePlacedBuildables' },
            { id: 'sentry_beacon', count: 3, operations: [], source: 'tileParams.prePlacedBuildables' },
          ]),
          rules: expect.arrayContaining([
            {
              id: 'current_allocation',
              source: 'PowerGraphSystem.step',
              data: {
                producers: ['off-map-current:36W'],
                consumers: ['lamp-ridge:lamp:6W:priority10', 'lamp-yard:lamp:6W:priority10'],
                connectedBy: 'intact-wires-between-online-nodes',
                allocationOrder: 'ascending-priority',
                nodeStates: ['powered', 'browned-out', 'dark'],
              },
            },
            {
              id: 'current_construction',
              source: 'Game.syncContractPowerGrid',
              data: {
                relayBuildable: 'sentry_beacon',
                pylonSites: ['trunk-middle', 'trunk-ridge', 'trunk-west'],
                repairOperation: 'REPAIR_UNDER',
                storageBuildable: 'capacitor_bank',
                capacitorSites: ['breath-bank-east', 'breath-bank-west'],
              },
            },
            {
              id: 'current_storage',
              source: 'PowerGraphSystem.step',
              data: {
                stores: [
                  'capacitor-east:0.05Wh:charge18W:discharge12W',
                  'capacitor-west:0.05Wh:charge18W:discharge12W',
                ],
              },
            },
            {
              id: 'locked_night',
              source: 'DayNightCycle.sample',
              data: {
                periodSeconds: 24,
                duskRampSeconds: 2,
                dawnRampSeconds: 2,
                nightDepth: 0.86,
                minimumDarkness: 0.645,
                phases: ['dusk', 'dark', 'dawn'],
                fullLight: false,
              },
            },
          ]),
        });

        Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
        const run = (seed: string) => {
          const sim = new HeadlessContractSim({ contractId: contract.id, seed });
          sim.hero.applyStats(100_000, 1);
          sim.hero.heal(100_000);
          expect(sim.build.placeFree('capacitor_bank', { x: 6, z: 4 }, 0)).toBe(true);
          expect(sim.build.placeFree('capacitor_bank', { x: 16, z: 4 }, 0)).toBe(true);
          let turn = sim.advanceToTurn();
          const socket = {
            power: sim.powerGraph.snapshot(),
            dayNight: sim.dayNightSnapshot,
          };
          while (!turn.terminal) turn = sim.advanceToTurn();
          return { outcome: sim.outcome(), socket };
        };

        for (const seed of seeds) {
          const first = run(seed);
          const second = run(seed);
          expect(first.outcome).toMatchObject({ secured: true, waves: contract.twist.secureWave, calls: 0 });
          expect(second.outcome.eventLogHash).toBe(first.outcome.eventLogHash);
          expect(first.socket.power).toMatchObject({ totalSupplyWatts: 36, totalDemandWatts: 12 });
          expect(first.socket.power.nodes.filter(({ kind }: { kind: string }) => kind === 'relay').every(({ online }: { online: boolean }) => online)).toBe(true);
          expect(first.socket.dayNight.phase).not.toBe('full');
          expect(first.socket.dayNight.darkness).toBeGreaterThanOrEqual(0.645);
          expect(first.socket.dayNight.darkness).toBeLessThanOrEqual(0.86);
        }
      } else if (contract.id === 'e3-moth-season') {
        const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
        const rig = { ...Balance.sparkRig };
        restoreRig = () => Object.assign(Balance.sparkRig, rig);
        expect(mechanics).toMatchObject({
          buildables: expect.arrayContaining([
            {
              id: 'lantern_post',
              operation: 'BUILD',
              meaning: 'Light radius 7; moth target score is coverage x radius x 1.',
              cost: 15,
              costs: [15, 15, 15, 15, 15, 15],
              maxCount: 8,
              source: 'twist.mothSeason',
            },
            {
              id: 'decoy_shed',
              operation: 'BUILD',
              meaning: 'Light radius 11 with target weight 2; takes 6 damage per attached swarm each second.',
              cost: 20,
              costs: [20, 20, 20],
              maxCount: 3,
              source: 'twist.mothSeason',
            },
          ]),
          rules: expect.arrayContaining([
            {
              id: 'locked_night',
              source: 'DayNightCycle.sample',
              data: {
                periodSeconds: 24,
                duskRampSeconds: 2,
                dawnRampSeconds: 2,
                nightDepth: 1,
                minimumDarkness: 0.75,
                phases: ['dusk', 'dark', 'dawn'],
                fullLight: false,
              },
            },
            {
              id: 'moth_attachment',
              source: 'MothSwarm.update+dimSources',
              data: {
                damageTarget: 'decoy_shed',
                damagePerAttachedPerSecond: 6,
                radiusLossPerAttached: 0.3,
                minimumRadiusMultiplier: 0.35,
              },
            },
            {
              id: 'moth_targeting',
              source: 'MothSwarm.update',
              data: {
                score: 'coverageAt(source.x,source.z) * source.radius * radiusWeight * (source.targetWeight ?? 1)',
                radiusWeight: 1,
                defaultTargetWeight: 1,
                decoyTargetWeight: 2,
                selection: 'highest-score',
                tieBreak: 'ascending-source-id',
              },
            },
            {
              id: 'moth_wave',
              source: 'Game.spawnMothSeasonWave',
              data: {
                lightKinds: ['lantern', 'powered-lamp'],
                mothsBaselinePerWave: 4,
                mothsPerLightPerWave: 1,
                minimumDarkness: 0.5,
                count: 'max(mothsBaselinePerWave,floor(lightSources)*mothsPerLightPerWave)',
              },
            },
          ]),
        });

        Object.assign(Balance.sparkRig, { damage: 0, fireRate: 1, range: 300, boltSpeed: 30, boltLife: 5 });
        const run = (seed: string) => {
          const sim = new HeadlessContractSim({ contractId: contract.id, seed });
          sim.hero.applyStats(100_000, 1);
          sim.hero.heal(100_000);
          expect(sim.build.placeFree('lantern_post', { x: -8, z: 12 }, 0)).toBe(true);
          expect(sim.build.placeFree('decoy_shed', { x: 0, z: 0 }, 0)).toBe(true);
          let turn = sim.advanceToTurn();
          while (!turn.terminal && sim.mothSwarm.diagnostics().alive === 0) turn = sim.advanceToTurn();
          const socket = {
            moths: sim.mothSwarm.diagnostics(),
            light: sim.lightField.diagnostics(),
            dayNight: sim.dayNightSnapshot,
          };
          while (!turn.terminal) turn = sim.advanceToTurn();
          return { outcome: sim.outcome(), socket };
        };

        for (const seed of seeds) {
          const first = run(seed);
          const second = run(seed);
          expect(first.outcome).toMatchObject({ secured: true, waves: contract.twist.secureWave, calls: 0 });
          expect(second.outcome.eventLogHash).toBe(first.outcome.eventLogHash);
          expect(first.socket.light).toMatchObject({ darkness: 1, sources: 2, lanterns: 1, poweredLamps: 1 });
          expect(first.socket.moths).toMatchObject({ enabled: true, sourceId: 'decoy:0' });
          expect(first.socket.moths.alive).toBeGreaterThanOrEqual(2);
          expect(first.socket.moths.attached).toBeGreaterThanOrEqual(1);
          expect(first.socket.moths.attachCounts).toContainEqual({ sourceId: 'lantern:0', count: 0, radius: 7, targetWeight: 1 });
          const decoy = first.socket.moths.attachCounts.find(({ sourceId }: { sourceId: string }) => sourceId === 'decoy:0');
          expect(decoy).toMatchObject({
            radius: 11,
            targetWeight: 2,
            count: expect.any(Number),
          });
          expect(decoy?.count).toBeGreaterThanOrEqual(1);
          expect(first.socket.dayNight.phase).not.toBe('full');
          expect(first.socket.dayNight.darkness).toBeGreaterThanOrEqual(0.75);
          expect(first.socket.dayNight.darkness).toBeLessThanOrEqual(1);
        }
      } else if (contract.id === 'e3-fairground') {
        const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
        const rig = { ...Balance.sparkRig };
        restoreRig = () => Object.assign(Balance.sparkRig, rig);
        // THE VOCABULARY, read off the consumer. `crowd_escort` is sourced to `CrowdFlockSystem`
        // and `crowd_escort_objective` to the latch that reads it — never to `twist.fairground`,
        // because a declaration is not a mechanic (AP-11).
        expect(mechanics.rules).toEqual(expect.arrayContaining([
          {
            id: 'crowd_escort',
            source: 'CrowdFlockSystem.update',
            data: {
              flocks: 3,
              escortRadius: 7,
              speed: 3.6,
              speedRule: 'hero-walk x 0.6',
              launchesOn: 'each dayNightCycle whose dark phase finds the flock home',
              route: 'heroStart stake -> plaza landmark -> back',
              laneSpacing: 14,
              destinations: ['copper-pavilion', 'ferris-wheel', 'silver-pavilion'],
              frightenedBy: 'any live enemy within escortRadius',
              onFright: 'scatter home, crossing fails, retry next night',
              friendliesNeverFrighten: true,
            },
          },
          {
            id: 'crowd_escort_objective',
            source: 'Game.autoSecureWaveForRun',
            data: {
              requires: 'every flock has completed at least one crossing',
              andRequires: 'the fair wheel is still spinning',
              secureWave: 12,
              completionLatch: 'per-flock, one-way',
              wheelRule: 'any damage stops the dynamo for the run',
              unmetAtSecureWave: 'run-unsecurable-until-met',
            },
          },
        ]));
        // A powerGrid contract sells no turret; the fair defends itself with beacons and palisades.
        expect(mechanics.buildables?.map(({ id }: { id: string }) => id)).not.toContain('turret');

        // THE MOVED NORTH GATE — owner ruling 2026-08-20, verbatim: **"move the spawn"**, given to
        // the recommendation that the fairground's north spawn entry shift off the centre line so
        // the night runner stops owning the middle crowd's lane. JSON carries no comments, so the
        // ruling is pinned HERE, as a fact a guard can check, rather than described somewhere a
        // reader has to find.
        //
        // WHAT WAS ON THAT LINE BEFORE, all three of it: the middle crowd's gate lane (derived from
        // its landmark, the Fair Wheel, due north of the gate), the loss stake every outlaw walks
        // at, and the north spawn entry itself — engine-derived at `heroPosition.z +
        // Balance.waves.spawnRingRadius` (26), measured at (0,-4.1). `night_runner` entered there
        // and walked that lane the whole way down. The fix is authored contract data on the
        // established per-variant seam (`ContractEnemyVariant.spawnGates`, consumed by
        // `WaveSystem.applyVariantSpawnGate`), so no shared spawn code moved and no other map can
        // inherit it — F-1471-1 keying, on the variant.
        //
        // WHY -12: the runner's walk line converges on the stake, so its clearance from the lane
        // decays as |x| x (z+30)/26 — at -12 that is 12.0wu at the entry, 9.2 at z=-10 and 7.4 at
        // z=-14, which covers the lane's swept length down to where the fort's own guns reach. It
        // is also the largest offset that still leaves 8wu to the flank crowd's lane at x=-20, so
        // the fix does not simply move the problem onto a different crowd.
        const roster = contract.twist.enemyRoster as ReadonlyArray<{ id: string; spawnGates?: unknown }> | undefined;
        expect(roster?.find(({ id }) => id === 'night_runner')?.spawnGates)
          .toEqual([{ edge: 'north', x: -12, z: -4 }]);

        // ADMISSION MOVE — 2026-08-21, refusal-first becomes ADMITTED, and the first thing this
        // branch asserts is now the ordinary door OPENING. Owner ruling, verbatim: "lets follow
        // your recommendation", to a five-map fork table whose fairground line was AUTHOR THE
        // ANCHOR SET. What had kept this map out was never the escort and never the consumer: the
        // fair had no `harvestAnchors` of its own, inherited `Terrain.DEFAULT_NODE_ANCHORS`, and
        // its nearest live seam sat 38wu out on bench seed 01 and 46wu on seed 02 — so the opening
        // purse arrived after the first saboteur and the Fair Wheel's dynamo, which stops for the
        // whole run on its FIRST hit, was already stopped. With the six anchors authored above at
        // 17-24wu, `artifacts/e3-fairground/prover-v3.mjs` secures BOTH bench seeds twice over
        // through the plain public door: seed 01 `fnv1a32:7a66c50b` and seed 02
        // `fnv1a32:86c9ca37`, both wave 12, wheel spinning, all three crowds across, zero granted.
        for (const seed of seeds) {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        }
        // The measurements below no longer NEED `admissionProbe` — the door would serve them — but
        // they keep it so this branch reads identically to the E3 siblings that still use the seam,
        // and so the numbers below stay comparable to the ones recorded while the hold was on.
        const probe = (seed: string) => new HeadlessContractSim({ contractId: contract.id, seed, admissionProbe: true });

        // THE ESCORT AT REST: three crowds on the gate line, each under its own attraction.
        const atRest = probe(seeds[0]!);
        expect(atRest.crowdFlocks.diagnostics).toMatchObject({
          enabled: true,
          count: 3,
          escortRadius: 7,
          speed: 3.6,
          home: { x: 0, z: -30 },
          night: -1,
          attempts: 0,
          completions: 0,
          allCrossed: false,
        });
        expect(atRest.crowdFlocks.diagnostics.flocks.map(({ id, x, z, destination, phase }: Record<string, unknown>) =>
          ({ id, x, z, destination, phase }))).toEqual([
          { id: 'flock-1', x: -20, z: -30, destination: 'copper-pavilion', phase: 'home' },
          { id: 'flock-2', x: 0, z: -30, destination: 'ferris-wheel', phase: 'home' },
          { id: 'flock-3', x: 20, z: -30, destination: 'silver-pavilion', phase: 'home' },
        ]);
        expect(atRest.ferrisWheel.diagnostics).toMatchObject({ spinning: true, hp: 240, outputWatts: 24, viewRadius: 18 });
        expect(atRest.powerGraph.snapshot()).toMatchObject({ totalSupplyWatts: 24, totalDemandWatts: 12 });

        // FRIGHT, on the declared radius and nothing else. The flock launches on the first dark
        // phase; an enemy parked at 6.9 units scatters it, one parked at 7.1 does not.
        const stepToNight = (sim: any) => {
          for (let tick = 0; tick < 30 * 30 && sim.crowdFlocks.diagnostics.attempts === 0; tick += 1) sim.step();
          expect(sim.crowdFlocks.diagnostics).toMatchObject({ attempts: 3, night: 0 });
        };
        // Counted, not observed as a phase: a crowd frightened in its first stride is already
        // home again on the next tick (it scatters to a gate it never really left), so `scattering`
        // is a state too brief to assert. The fright COUNTER is the durable fact.
        const parkedFright = (offset: number) => {
          const sim = probe(seeds[0]!);
          stepToNight(sim);
          const before = sim.crowdFlocks.diagnostics;
          const flock = before.flocks[1];
          expect(sim.enemies.spawn({ x: flock.x + offset, y: 0.05, z: flock.z }, { hpScale: 1 })).toBeTruthy();
          sim.step();
          const after = sim.crowdFlocks.diagnostics;
          return { frights: after.frights - before.frights, crossings: after.flocks[1].crossings };
        };
        expect(parkedFright(6.9)).toEqual({ frights: 1, crossings: 0 });
        expect(parkedFright(7.1)).toEqual({ frights: 0, crossings: 0 });

        // A CLEAN MIDWAY CROSSES, AND THE ESCORT IS DETERMINISTIC. The rig is buffed so the
        // corridor clears — the same measurement idiom the Ridge and the Canyon use above. NOTE
        // WHAT IS NOT ASSERTED HERE: that the run secures. A secure measured behind a buffed rig
        // through the admission probe is exactly the debug-seam claim this contract's hold exists
        // to refuse; the browser spec proves the latch OPENS, and this branch proves only that the
        // crossings complete, repeat identically, and that the wheel rule still shuts the door.
        Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
        const run = (seed: string, breakWheel: boolean) => {
          const sim = probe(seed);
          sim.hero.applyStats(100_000, 1);
          sim.hero.heal(100_000);
          // One post beside the stake: with no other building standing, the nearest building to a
          // west/east saboteur is the wheel itself, 47 units off and undefended, and it is rubble
          // before the crowds have crossed twice.
          expect(sim.build.placeFree('palisade', { x: 0, z: -33 }, 0)).toBe(true);
          if (breakWheel) expect(sim.ferrisWheel.damage(1).applied).toBe(true);
          const maxTicks = Math.ceil(((contract.twist.secureWave + 2) * Balance.waves.waveInterval) / (1 / 30));
          for (let tick = 0; tick < maxTicks && !sim.isTerminal; tick += 1) sim.step();
          const state = sim.surface.tools.get_state().outcome.state;
          return { flocks: sim.crowdFlocks.diagnostics, wheel: sim.ferrisWheel.diagnostics, state, terminal: sim.isTerminal };
        };
        for (const seed of seeds) {
          const first = run(seed, false);
          const second = run(seed, false);
          expect(first.flocks.allCrossed).toBe(true);
          expect(first.flocks.flocks.every(({ crossings }: { crossings: number }) => crossings > 0)).toBe(true);
          expect(first.wheel.spinning).toBe(true);
          expect(first.state.crowdFlocks.completions).toBe(second.state.crowdFlocks.completions);
          expect(second.state.crowdFlocks.flocks).toEqual(first.state.crowdFlocks.flocks);
        }
        // THE LOSS RULE IS UNCHANGED AND IT OUTRANKS THE ESCORT: one point of damage stops the
        // dynamo for the run, and no number of completed crossings buys the secure back.
        const broken = run(seeds[0]!, true);
        expect(broken.wheel).toMatchObject({ spinning: false, hp: 239 });
        expect(broken.flocks.allCrossed).toBe(true);
        expect(broken.state.run.secured).toBe(false);
      } else {
        throw new Error(`${contract.id} has no census branch. Every Voltage contract is socketed since the crowd flocks landed; a new one needs its own measurement, not a silent pass.`);
      }
      expect(consoleErrors).toEqual([]);
    } finally {
      restoreRig?.();
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
