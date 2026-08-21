import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import orbital from '../assets/contracts/epoch-8-orbital/contracts.json' with { type: 'json' };

/**
 * THE ORBITAL CENSUS, PER ID.
 *
 * ADMISSION MOVE (2026-08-20, A6 `e8-far-side`): the Far Side left the refused column. It was
 * never in `CONTRACT_ADMISSION_EXEMPTIONS` — it was excluded by empty data
 * (`harvestAnchors: []`, which `ContractFamilies.ts:1328` reads as "not ready for a direct
 * claim"). Authoring its anchors, a hero-start stake and the A6 probe consumer opened the door,
 * and the public-verb prover secured both bench seeds at wave 20 twice
 * (`artifacts/e8-far-side/`). So this file now asserts THREE admitted and ONE refused rather
 * than a blanket rejection, and each id carries the reason it is where it is.
 *
 * `e8-low-orbit` stays refused, deliberately and citably: A7 (`door-completion-sheet.md:20`)
 * is the ratified design for its orbital-return / handhold / debris mechanics and has not been
 * built, and its `harvestAnchors` are still empty.
 */

const EXPECTED_DEPENDENCY: Record<string, string> = {
  'e8-mare-claim': 'atmosphere-wall-consumer',
  'e8-far-side': 'far-side-contract-consumers',
  'e8-low-orbit': 'low-orbit-contract-consumers',
  'e8-eclipse': 'eclipse-contract-consumers',
};

/**
 * PER-ID, one row each, for the same reason `EXPECTED_DEPENDENCY` above is: E8's four contracts
 * are being socketed by different hands at different times, and a single shared literal makes
 * every admission collide with every other. A contract that gains a mechanic edits ITS OWN line
 * and nothing else. Rows are the manifest rule IDs `deriveMechanicsManifest` emits, in order.
 */
const EXPECTED_RULES: Record<string, string[]> = {
  'e8-mare-claim': ['build_zones'],
  // A4's consumer is contract-gated, not epoch-gated, and the Far Side declares
  // `twist.signalSuppression` — so this row was ALREADY true before A7 touched anything.
  // Measured, not assumed: the first draft of this table guessed `['build_zones']` here and the
  // census caught it immediately, which is the whole reason the rows are written out per id.
  // MERGED-TREE CORRECTION (A6+A7 drain, 2026-08-20): A6's ProbeRecovery consumer exists here,
  // so the Far Side speaks three rules — this row was 2 on the A7 branch, which predated A6.
  'e8-far-side': ['build_zones', 'probe_recovery', 'signal_suppression'],
  'e8-low-orbit': ['build_zones', 'zero_gravity'],
  'e8-eclipse': ['build_zones'],
};

for (const contract of orbital.contracts) {
  // Reworded from "rejects the unsocketed Orbital contract" (A7, 2026-08-20): the census now
  // covers admitted contracts too, and a title that says "rejects" for a contract the door
  // accepts is a lie a later reader would trust.
  test(`${contract.id} census pins the Orbital contract's door state`, async () => {
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
      // 🔺 F-E8FS-1 (truth, non-blocking): the Far Side's dependency row still reads `missing`
      // while three of the four consumers it names now exist (suppression, probe recovery,
      // playback). It is NOT edited here — `twist.probePlayback` and
      // `tileParams.probeRecoveryZones` remain in `DECLARED_INERT_PATHS`
      // (`ContractFamilies.ts:1586`), and that listing is exactly what OBLIGES a non-empty
      // `engineDependencies` at all (`:1714`). Dropping the row without dropping the paths
      // would fail descriptor validation. Cure = one pass that edits both, rewording the
      // dependency down to what is still genuinely inert (`suitOnlyZones`, `signalNullZones`,
      // `atmosphere.airIsWall`). Same call the E6 census made for glow-mesa and A4 made for
      // the Dead Band; `ContractFamilies.ts` is outside this slice's firewall.
      // DERIVED, not listed: `HeadlessContractSim` admits exactly the contracts whose
      // `harvestAnchors` are non-empty (`:114`), so the census now asks the same question the
      // door asks. An admission is then a ONE-LINE contract edit and this file needs no change —
      // which is also why two contracts can be socketed concurrently without fighting here.
      const admitted = (contract.tileParams.harvestAnchors?.length ?? 0) > 0;
      expect(contract.tileParams.engineDependencies).toEqual([
        expect.objectContaining({ dep: EXPECTED_DEPENDENCY[contract.id], status: 'missing' }),
      ]);
      const seeds = [`${contract.id}-01`, `${contract.id}-02`];
      if (admitted) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
      else expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();

      // The door judges `harvestAnchors` alone (`ContractFamilies.ts:1328`), so the census
      // states the DATA that decides admission rather than restating the verdict.
      expect(contract.tileParams.harvestAnchors.length > 0).toBe(admitted);

      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { E8PhysicsSystem } = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract.id);
      const physics = new E8PhysicsSystem(contract).diagnostics;

      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      expect(physics).toMatchObject({
        active: true,
        contractId: contract.id,
        source: contract.id === 'e8-low-orbit' ? 'zero-gravity' : 'gravity',
      });
      // Suit-only is the `vacuum` flag and nothing more — A6 declined to invent air mechanics
      // because nothing beyond the flag is declared (reject-don't-stretch).
      expect(physics.vacuum).toBe(true);

      for (const seed of seeds) {
        if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        else {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
            new RegExp(`AP-07 supports only .*received ${contract.id}`),
          );
        }
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
