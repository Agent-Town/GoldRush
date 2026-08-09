import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import steamworks from '../assets/contracts/epoch-2-steamworks/contracts.json' with { type: 'json' };

const GRAMMAR_ORDERS = [
  { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 12 }, when: { goldGte: 10 } },
  { verb: 'REPAIR_UNDER', pct: 50 },
  { verb: 'MOVE_TO', pos: { x: 1, z: 12 } },
  { verb: 'HOLD', pos: { x: 0, z: 12 } },
  { verb: 'HARVEST', seam: 'gold-seam-1' },
  { verb: 'HARVEST', sluice: 0 },
  { verb: 'FALLBACK_IF', threat: { enemiesGte: 1 }, pos: { x: 0, z: 12 } },
] as const;

for (const contract of steamworks.contracts) {
  test(`${contract.id} census support is explicit and deterministic`, async () => {
    test.setTimeout(60_000);
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
      const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      if (contract.id !== 'e2-pressure-garden') {
        expect(() => new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] })).toThrow(/AP-07 supports only/);
        expect(consoleErrors).toEqual([]);
        return;
      }
      const rig = { ...Balance.sparkRig };
      restoreRig = () => Object.assign(Balance.sparkRig, rig);

      expect(seeds).toHaveLength(2);
      const probe = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] });
      expect(probe.currentTurn().view.stablePrefix.mechanics).toMatchObject({
        contractId: contract.id,
        interactables: [],
      });
      if (contract.twist.pressureEnabled) {
        expect(probe.currentTurn().view.stablePrefix.mechanics).toMatchObject({
          buildables: [{
            id: 'boiler_house',
            operation: 'BUILD',
            meaning: 'Feeds coal into the Steamworks pressure line.',
            cost: 70,
            maxCount: 3,
            source: 'twist.pressureEnabled',
          }],
          rules: expect.arrayContaining([
            {
              id: 'pressure_auto_vent',
              source: 'PressureSystem.vent',
              data: { above: 80, loss: 35, cooldownSeconds: 3 },
            },
            {
              id: 'pressure_bands',
              source: 'PressureSystem.band',
              data: { bands: ['empty:<=0', 'low:>0,<25', 'working:>=25,<=80', 'high:>80'] },
            },
            {
              id: 'pressure_generation',
              source: 'PressureSystem.update',
              data: { buildable: 'boiler_house', input: 'coal', coalSeconds: 12, tickSeconds: 1, pressurePerTick: 4 },
            },
            {
              id: 'pressure_powers',
              source: 'PressureArsenalSystem',
              data: {
                spends: ['auto_pan', 'boiler_lance', 'pressure_mortar', 'sky_rocket_battery'],
                bandBoosts: ['boiler_battery'],
              },
            },
          ]),
        });
      }
      expect(probe.manifest.tileParams.engineDependencies).toEqual([
        expect.objectContaining({ status: 'missing' }),
      ]);
      for (const order of GRAMMAR_ORDERS) expect(probe.submitOrders([order]).outcome.ok).toBe(true);

      Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
      const run = (seed: string) => {
        const sim = new HeadlessContractSim({ contractId: contract.id, seed });
        sim.hero.applyStats(100_000, 1);
        sim.hero.heal(100_000);
        if (contract.twist.pressureEnabled) {
          for (const x of [-4, 4]) expect(sim.build.placeFree('boiler_house', { x, z: 12 }, 0)).toBe(true);
          sim.hero.group.position.set(-12, 0.06, 39);
        }
        let turn = sim.currentTurn();
        while (!turn.terminal) turn = sim.advanceToTurn();
        return { ...sim.outcome(), pressure: sim.pressure.diagnostics };
      };

      for (const seed of seeds) {
        const first = run(seed);
        const second = run(seed);
        expect(first).toMatchObject({ secured: true, calls: 0 });
        // F-1493-1: autoSecureWaveForRun bypasses secureWave until a declared Baron dies.
        if (contract.twist.baron) expect(first.waves).toBeGreaterThanOrEqual(contract.twist.secureWave);
        else expect(first.waves).toBe(contract.twist.secureWave);
        if (contract.twist.pressureEnabled) expect(first.pressure.vents).toBeGreaterThan(0);
        expect(second.eventLogHash).toBe(first.eventLogHash);
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
