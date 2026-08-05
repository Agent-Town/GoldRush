import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import voltage from '../assets/contracts/epoch-3-voltage/contracts.json' with { type: 'json' };

const SOCKET_GAPS: Record<string, readonly string[]> = {
  'e3-canyon-works': ['dayNightCycle', 'mothSeason', 'powerGrid'],
  'e3-fairground': ['dayNightCycle', 'fairground', 'powerGrid'],
};

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
      const sources = mechanics.rules.map(({ source }: { source: string }) => source);

      expect(seeds).toHaveLength(2);
      if (contract.id === 'e3-blackout-ridge') {
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
              maxCount: 8,
              source: 'twist.mothSeason',
            },
            {
              id: 'decoy_shed',
              operation: 'BUILD',
              meaning: 'Light radius 11 with target weight 2; takes 6 damage per attached swarm each second.',
              cost: 20,
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
                mothsPerLightPerWave: 1,
                minimumMoths: 2,
                minimumDarkness: 0.5,
                count: 'max(2,floor(max(1,lightSources)*mothsPerLightPerWave))',
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
      } else {
        for (const field of SOCKET_GAPS[contract.id]!) {
          expect(Object.hasOwn(contract.twist, field)).toBe(true);
          expect(sources).not.toContain(`twist.${field}`);
        }
        for (const seed of seeds) {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(/AP-07 supports only/);
        }
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
