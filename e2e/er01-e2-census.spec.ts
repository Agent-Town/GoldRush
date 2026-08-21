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
      // ADMITTED PER ID, DELIBERATELY. F-1660-1 records that these three were once re-admitted BY
      // OMISSION when ap16-4 turned the door from a list into a derivation, so this census names
      // every E2 contract's side of the door explicitly rather than letting a derivation decide.
      // `e2-hill-mine` joined `e2-pressure-garden` on 2026-08-20 with a lawful secure on both bench
      // seeds (reviews/e2-pressure-arsenal-headless.md); `e2-trestle` and `e2-incline` are still
      // exempt, and the exemption table carries the measured reason.
      // THE OWNER'S 2026-08-21 RULING IS ASSERTED HERE, NOT ASSUMED. "E2's pressure ... - lets do
      // that" gave the Trestle and the Incline the pressure line, so all four E2 contracts now
      // declare `twist.pressureEnabled`. That is a BOARD change, not a door change: both maps were
      // re-proved with the line declared and still terminate unsecured on at least one bench seed
      // (reviews/e2-pressure-line-railcars.md), so they keep their exemption rows and this census
      // keeps naming both sides of the door per id.
      const admitted = ['e2-pressure-garden', 'e2-hill-mine'];
      if (!admitted.includes(contract.id)) {
        expect(contract.id === 'e2-trestle' || contract.id === 'e2-incline').toBe(true);
        expect(contract.twist.pressureEnabled).toBe(true);
        // AND EACH NOW OWNS ITS COAL (owner ruling 2026-08-21 to the F-E2PL-1 lever, verbatim:
        // "sounds like a good idea"). Before it, `PressureSystem` fixed the seams on the Hill Mine's
        // minehead for every map in the game, so these two paid a 55-58wu round trip for fuel; each
        // now authors three seams ~29wu from its own stake, the Hill Mine's measured standard.
        expect((contract.twist as { coalSeams?: Array<{ x: number; z: number }> }).coalSeams).toHaveLength(3);
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
        expect(probe.currentTurn().view.stablePrefix.mechanics.buildables).toEqual(expect.arrayContaining([expect.objectContaining({
            id: 'boiler_house',
            operation: 'BUILD',
            meaning: 'Feeds coal into the Steamworks pressure line.',
            cost: 70,
            maxCount: 3,
            source: 'twist.pressureEnabled',
          })]));
        expect(probe.currentTurn().view.stablePrefix.mechanics.rules).toEqual(expect.arrayContaining([
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
          ]));
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
