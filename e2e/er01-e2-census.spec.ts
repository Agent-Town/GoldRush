import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import steamworks from '../assets/contracts/epoch-2-steamworks/contracts.json' with { type: 'json' };

const GRAMMAR_ORDERS = [
  { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 12 }, when: { goldGte: 10 } },
  { verb: 'REPAIR_UNDER', pct: 50 },
  // ADR-005 stage 3: MOVE_TO, HOLD and FALLBACK_IF were retired, so the grammar sample is the
  // grammar that exists. MOVE_HERO is the one body-positioning verb left.
  { verb: 'MOVE_HERO', pos: { x: 1, z: 12 } },
  { verb: 'HARVEST', seam: 'gold-seam-1' },
  { verb: 'HARVEST', sluice: 0 },
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
      // incline. The Hill Mine authored NEITHER; the Pressure Garden still authors neither.
      // RE-POINTED 2026-09-18 (`tasks/open-maps-acceptance-e1-e4.md`, artifacts/open-maps-acceptance-
      // e1-e4/report.md): the Hill Mine now authors the cadence rung too, at 0.75 — the Incline's
      // value, its sibling with the same secure wave and the same three-variant roster. Cause, from
      // the acceptance instrument's own BEFORE row on main: a plain boot dies at WAVE 3, 95.3 s sim,
      // 30 kills, 50 gold and NOTHING BUILT, because the Hill Mine's seams sit on the T2/T3 terraces
      // (z 25-39) while its own hero stake is the boiler-house site on the base terrace (0,12) — a
      // climb up the switchbacks that does not fit inside a 30 s wave. The coal clause is unchanged:
      // the Hill Mine is the map the other two copied their seams FROM and still authors no
      // `coalSeams` of its own.
      const twist = contract.twist as { coalSeams?: Array<{ x: number; z: number }>; waveCadenceMult?: number };
      if (contract.id === 'e2-trestle' || contract.id === 'e2-incline') {
        expect(twist.coalSeams).toHaveLength(3);
        expect(twist.waveCadenceMult).toBe(contract.id === 'e2-trestle' ? 0.7 : 0.75);
      } else {
        expect(twist.coalSeams).toBeUndefined();
        expect(twist.waveCadenceMult).toBe(contract.id === 'e2-hill-mine' ? 0.75 : undefined);
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
              // maps-campaign-land-era6 (attended 2026-09-14, owner A20 "we can just keep going"): Astra's map campaign 7c2744e5a
              // raised Balance.boilerHouse.coalSeconds 12 -> 36 (src/game/Balance.ts) as part of its playability pass; the
              // census pins the value the sim actually advertises. Reversible with one owner word (F-MAPL-1).
              data: { buildable: 'boiler_house', input: 'coal', coalSeconds: 36, tickSeconds: 1, pressurePerTick: 4 },
            },
            {
              id: 'pressure_powers',
              source: 'PressureArsenalSystem',
              data: {
                spends: ['auto_pan', 'boiler_lance', 'pressure_mortar', 'sky_rocket_battery'],
                bandBoosts: ['boiler_battery'],
              },
            },
            // RE-PINNED 2026-09-19 (`tasks/rulings-play-2026-09-19.md`, F-HEAT14-3; owner ruling of
            // the same day, verbatim: "I agree with all your recommendations on the decisions - good
            // work", taking option (a) on the desk register's F-HEAT14-3 row). Cause, measured by the
            // heat-14 rider rather than argued: on the Trestle and the Incline it read the union of
            // `now` keys across its whole run and found NO pressure value, no band, no coal count and
            // no boiler fuel, while `boiler_house` sat on its price list at 70 gold x 3 — so it called
            // 210 gold of boiler "a strictly dominated purchase" and F-MAPL-1's `coalSeconds` 12 -> 36
            // "only triples the duration of a process I cannot observe" (`artifacts/gauntlet-heat14-
            // 6075db90/heat14-note.md` §5). The FOUR rules above were all published the whole time;
            // what was missing was a reading. `pressure_reading` names the gauge that answers, and the
            // assertion below holds the gauge itself to the same numbers the human's HUD draws.
            {
              id: 'pressure_reading',
              source: 'AgentView.now.pressure',
              data: {
                field: 'now.pressure',
                publishes: ['stored', 'cap', 'band', 'safeBand', 'coal', 'coalSeconds', 'boilers', 'vents', 'objective', 'seams'],
                safeBandResearch: 'pressure_assay',
                ventVerb: false,
              },
            },
          ]));
        // THE GAUGE ITSELF, on the same probe. `enabled` is the SAME predicate
        // `Game.activeResourceSnapshots` filters the human's HUD gauge on, so a map that draws the
        // gauge for the human publishes it for the rider and a map that draws neither publishes
        // neither — which is the fairness claim F-HEAT14-3 made, asserted rather than assumed.
        const gauge = probe.currentTurn().view.now.pressure;
        expect(gauge).toMatchObject({
          stored: 0,
          cap: 100,
          band: 'empty',
          // NULL, deliberately: the human's own gauge hides the numeric band until `pressure_assay`
          // is researched (`Game.ts:7422`), and the rider's hides it under the same gate.
          safeBand: null,
          coal: 0,
          coalSeconds: 0,
          boilers: { built: 0, hot: 0, cooling: 0, max: 3 },
          vents: 0,
          objective: { active: false, failed: false, complete: false, hotBoilers: 0, waves: '8-12' },
        });
        // The seam row carries this contract's OWN coal, keyed to `stablePrefix.map.coalSeams`.
        expect(gauge!.seams).toHaveLength(probe.currentTurn().view.stablePrefix.map.coalSeams.length);
        expect(gauge!.seams.map((seam: { id: string }) => seam.id)).toEqual(probe.currentTurn().view.stablePrefix.map.coalSeams.map((seam: { id: string }) => seam.id));
      } else {
        // The other half of contract-scoping, asserted: no boilers, no gauge. This is what keeps
        // `now.pressure` out of the canonical `viewSchema.fields` set (built from `the-claim`).
        expect(probe.currentTurn().view.now.pressure).toBeUndefined();
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
