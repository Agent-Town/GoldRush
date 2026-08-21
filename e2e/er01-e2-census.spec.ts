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
      // ═══ E2 IS FINISHED (owner, 2026-08-22, verbatim: "yes, I want to admit it, E2 should be
      // finished as well"). All four E2 contracts are through the door. The list stays EXPLICIT and
      // per-id rather than becoming `true` for everything, because F-1660-1 is exactly the accident
      // of a derivation quietly re-admitting a map nobody had measured — the whole point of naming
      // every id here is that admission is asserted, never inferred.
      const admitted = ['e2-pressure-garden', 'e2-hill-mine', 'e2-trestle', 'e2-incline'];
      // THE BRANCH IS DELIBERATELY KEPT THOUGH NOTHING TAKES IT TODAY. It is the landing pad for a
      // FUTURE E2 contract: a new id must either be measured through the door or carry an exemption
      // row, and this refuses the third option of arriving unnoticed.
      if (!admitted.includes(contract.id)) {
        expect(() => new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] })).toThrow(/AP-07 supports only/);
        expect(consoleErrors).toEqual([]);
        return;
      }
      // THE TWO RULINGS THAT FINISHED E2, ASSERTED ON THE ADMITTED MAPS RATHER THAN ASSUMED.
      // Coal (owner 2026-08-21, "sounds like a good idea"): `PressureSystem` used to fix the seams
      // on the Hill Mine's minehead for every map in the game, so the railcar pair paid a 55-58wu
      // round trip for fuel; each now authors three seams ~29wu from its own stake, the Hill Mine's
      // own measured standard. Cadence (owner 2026-08-22, "E2 should be finished as well"): laddered
      // per map and shipped one clear rung inside its first all-secure value — 0.7 trestle, 0.75
      // incline. The Hill Mine and the Pressure Garden author NEITHER and are untouched by both.
      const twist = contract.twist as { coalSeams?: Array<{ x: number; z: number }>; waveCadenceMult?: number };
      if (contract.id === 'e2-trestle' || contract.id === 'e2-incline') {
        expect(twist.coalSeams).toHaveLength(3);
        expect(twist.waveCadenceMult).toBe(contract.id === 'e2-trestle' ? 0.7 : 0.75);
      } else {
        expect(twist.coalSeams).toBeUndefined();
        expect(twist.waveCadenceMult).toBeUndefined();
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
          // STAND ON THIS CONTRACT'S OWN COAL, not on a literal. Until the owner's 2026-08-21
          // `coalSeams` ruling every map's seams were the same three module-constant coordinates, so
          // `(-12, 39)` worked everywhere; the trestle and the incline now author their own ~29wu
          // from their own stakes, and a hard-coded teleport lands them in open ground and harvests
          // nothing — which is exactly how this assertion first went red.
          const seam = sim.pressure.diagnostics.seams[0]!;
          sim.hero.group.position.set(seam.x, 0.06, seam.z);
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
