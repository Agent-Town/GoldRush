import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import signal from '../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };

/**
 * PER-ID TRUTH. `e7-dead-band` was admitted 2026-08-20 by the A4 signal-suppression consumer
 * (`specs/agent-play/door-completion-sheet.md:14`): its `harvestAnchors` were authored, its
 * bench seeds minted, and a public-verb prover secured both seeds at wave 20 twice each
 * (`artifacts/e7-dead-band/`). Echo Canyon and Relay Rush are unchanged and still refused, so
 * every assertion below is keyed per id rather than shared — the E6 census's shape.
 */
const ADMITTED = new Set(['e7-relay-valley', 'e7-dead-band']);

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e7-relay-valley': 'e7-relay-valley',
  'e7-echo-canyon': 'the-claim',
  'e7-dead-band': 'e7-dead-band',
  'e7-relay-rush': 'the-claim',
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
  'e7-relay-rush': ['build_zones'],
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

      if (admitted) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
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
