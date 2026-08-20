import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import signal from '../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };

/**
 * PER-ID TRUTH. `e7-dead-band` was admitted 2026-08-20 by the A4 signal-suppression consumer
 * (`specs/agent-play/door-completion-sheet.md:14`): its `harvestAnchors` were authored, its
 * bench seeds minted, and a public-verb prover secured both seeds at wave 20 twice each
 * (`artifacts/e7-dead-band/`). Echo Canyon is unchanged and still refused, so every assertion
 * below is keyed per id rather than shared — the E6 census's shape.
 *
 * RELAY RUSH MOVED HALFWAY, 2026-08-20, and its row is the reason this file's per-id shape earns
 * its keep. A5 built the interference front (`src/systems/InterferenceFrontSystem.ts`), authored
 * the map's four `harvestAnchors` and minted its bench seeds — so the BROWSER now resolves it and
 * its manifest grows an `interference_front` rule — but the best measured public-verb play
 * terminates unsecured at wave 4 of 20, so the HEADLESS door refuses it through a cited
 * `CONTRACT_ADMISSION_EXEMPTIONS` row (`reviews/e7-relay-rush.md`). Seeded, resolved, and still
 * refused: three different answers for one contract, which is exactly why nothing here is shared.
 */
const ADMITTED = new Set(['e7-relay-valley', 'e7-dead-band']);

/**
 * A5, AND IT IS THE ONE ROW THAT NEEDED A THIRD CASE. `e7-relay-rush` now carries authored
 * `harvestAnchors` and minted bench seeds — so it left the empty-data filter — but its best
 * measured public-verb play terminates unsecured at wave 4 of 20, so it entered
 * `CONTRACT_ADMISSION_EXEMPTIONS` instead of the door (`reviews/e7-relay-rush.md`). SEEDED and
 * REFUSED at the same time, which no earlier E7 row was: it still throws on construction like
 * Echo Canyon, and it still owns a seed set like the Dead Band.
 */
const EXEMPT_WITH_SEEDS = new Set(['e7-relay-rush']);

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e7-relay-valley': 'e7-relay-valley',
  'e7-echo-canyon': 'the-claim',
  'e7-dead-band': 'e7-dead-band',
  // A5: authored anchors moved this one out of `activeContractSelection`'s
  // `harvestAnchors?.length === 0` -> 'unavailable-contract' branch (`ContractFamilies.ts:1329`),
  // so a `?debug&contract=` boot now resolves the map itself instead of falling back to The Claim.
  // The BROWSER door and the HEADLESS door are separate gates and this proves they are: the same
  // contract resolves here and is refused by `HeadlessContractSim` below.
  'e7-relay-rush': 'e7-relay-rush',
};

/**
 * WHAT EACH CONTRACT STILL DECLARES MISSING — the AP-11 honesty mandate, read as it IS rather
 * than as it ought to be. The Dead Band's row is now STALE PROSE: it names
 * `signal-suppression-consumer` as missing, and that consumer exists. It is not edited here.
 * `twist.signalSuppression` is still listed in `DECLARED_INERT_PATHS`
 * (`ContractFamilies.ts:1586`), which is what OBLIGES this contract to carry a non-empty
 * `engineDependencies` at all (`:1713-1718`) — and its `tileParams.signalNullZones` remains
 * genuinely inert either way, since the ratified design is contract-level and reads no zone.
 * Both files sit outside this slice's firewall, so the staleness is filed as F-E7DB-1 and
 * asserted here as the truth it currently is. Same call the E6 census made for glow-mesa.
 */
const EXPECTED_DEPENDENCY: Record<string, string | undefined> = {
  'e7-relay-valley': undefined,
  'e7-echo-canyon': 'broadcast-mirror-consumer',
  'e7-dead-band': 'signal-suppression-consumer',
  'e7-relay-rush': 'interference-front-consumer',
};

/** The manifest rows each contract derives, in order. Only the Dead Band declares suppression. */
const EXPECTED_RULES: Record<string, string[]> = {
  'e7-relay-valley': ['build_zones'],
  'e7-echo-canyon': ['build_zones'],
  'e7-dead-band': ['build_zones', 'signal_suppression'],
  // A5: sourced FROM `InterferenceFrontSystem`, so the row cannot promise a deadline the run
  // does not enforce. Relay Rush is the only Signal contract that declares the front.
  'e7-relay-rush': ['build_zones', 'interference_front'],
};

for (const contract of signal.contracts) {
  test(`${contract.id} census refuses the unsocketed Signal mechanics`, async () => {
    const seeds = [`${contract.id}-01`, `${contract.id}-02`];
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
      const { activeContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract.id);
      const dependency = EXPECTED_DEPENDENCY[contract.id];
      const admitted = ADMITTED.has(contract.id);

      // A5 splits what used to be one question into two: a seed set is minted by AUTHORING the
      // map's data, while admission is decided by whether it can be WON. Relay Rush has the first
      // and not the second.
      if (admitted || EXEMPT_WITH_SEEDS.has(contract.id)) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
      else expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      expect(mechanics).toMatchObject({ interactables: [], modes: [] });
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      // prep-bench-seeds-flagships: deriveMechanicsManifest now exposes the shared buildables registry.
      expect(activeContract().id).toBe(EXPECTED_ACTIVE_CONTRACT[contract.id]);
      if (dependency === undefined) expect(contract.tileParams.engineDependencies).toBeUndefined();
      else expect(contract.tileParams.engineDependencies).toEqual([expect.objectContaining({ dep: dependency, status: 'missing' })]);
      for (const seed of seeds) {
        if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        else {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
            new RegExp(`AP-07 supports only .*received ${contract.id}`),
          );
        }
      }

      // THE CONSUMER IS REAL, AND ONLY WHERE DECLARED. The Dead Band is the one Signal
      // contract that carries `twist.signalSuppression`, so it is the one whose view grows a
      // `signalSuppression` row — asserted BIDIRECTIONALLY so the field cannot leak onto a
      // contract that never asked for it.
      if (contract.id === 'e7-dead-band') {
        const { SignalSuppression } = await vite.ssrLoadModule('/src/systems/SignalSuppression.ts');
        const consumer = SignalSuppression.create(contract);
        expect(consumer.suppressedSystems).toEqual(['drones', 'playbooks', 'relayChains']);
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'signal_suppression');
        // Sourced FROM the consumer: the manifest row and the gate cannot disagree.
        expect(rule.source).toBe('SignalSuppression.refuse');
        expect(rule.data.off).toEqual(consumer.suppressedSystems);
        const view = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] }).currentTurn().view;
        expect(view.now.signalSuppression).toEqual({
          declared: true,
          drones: true,
          playbooks: true,
          relayChains: true,
          refusals: { drones: 0, playbooks: 0, relayChains: 0 },
        });
      } else if (admitted) {
        const view = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] }).currentTurn().view;
        expect(view.now.signalSuppression).toBeUndefined();
      }

      // A5 — THE INTERFERENCE FRONT, ASSERTED BIDIRECTIONALLY for the same reason A4's row is:
      // Relay Rush is the one Signal contract that carries `twist.interferenceFront`, so it is
      // the one whose manifest grows an `interference_front` rule, and the field must not leak
      // onto a contract that never asked for it. The run itself is measured through the DECLARED
      // `admissionProbe` seam (`artifacts/e7-relay-rush/prover.mjs`), never here — this census
      // asserts the refusal, which is the truth the exemption records.
      if (contract.id === 'e7-relay-rush') {
        const { InterferenceFrontSystem } = await vite.ssrLoadModule('/src/systems/InterferenceFrontSystem.ts');
        const consumer = InterferenceFrontSystem.create(contract);
        expect(consumer.isDeclared).toBe(true);
        // The placeholder `"N"` resolved to the sheet's ratified 3 of 4 (A5 DEFAULTS).
        expect(consumer.relayTarget).toBe(3);
        expect(consumer.deadlineFront).toBe(3);
        expect(consumer.objectiveAllowsSecure).toBe(false);
        expect(consumer.diagnostics.sites.map(({ id }: { id: string }) => id))
          .toEqual(['relay-site-r1', 'relay-site-r2', 'relay-site-r3', 'relay-site-r4']);
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'interference_front');
        // Sourced FROM the consumer: the manifest row and the gate cannot disagree.
        expect(rule.source).toBe('InterferenceFrontSystem.refuse');
        expect(rule.data.relayTarget).toBe(consumer.relayTarget);
        expect(rule.data.cadenceSeconds).toBe(90);
        expect(rule.data.crossingSeconds).toBe(20);
        // The door DATA is authored even though the door itself refuses: four anchors, so the
        // map is playable, and a cited exemption, so the refusal is a measurement not a gap.
        expect(contract.tileParams.harvestAnchors).toHaveLength(4);
        const { CONTRACT_ADMISSION_EXEMPTIONS } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
        expect(CONTRACT_ADMISSION_EXEMPTIONS['e7-relay-rush'].citation).toBe('reviews/e7-relay-rush.md');
      } else {
        expect(mechanics.rules.some(({ id }: { id: string }) => id === 'interference_front')).toBe(false);
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
