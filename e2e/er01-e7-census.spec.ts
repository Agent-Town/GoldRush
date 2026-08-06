import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import signal from '../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e7-relay-valley': 'e7-relay-valley',
  'e7-echo-canyon': 'the-claim',
  'e7-dead-band': 'the-claim',
  'e7-relay-rush': 'the-claim',
};

const EXPECTED_DEPENDENCY: Record<string, string | undefined> = {
  'e7-relay-valley': undefined,
  'e7-echo-canyon': 'broadcast-mirror-consumer',
  'e7-dead-band': 'signal-suppression-consumer',
  'e7-relay-rush': 'interference-front-consumer',
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

      expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      expect(mechanics).toMatchObject({ interactables: [], rules: [{ id: 'build_zones' }], modes: [] });
      expect(mechanics.buildables).toBeUndefined();
      expect(activeContract().id).toBe(EXPECTED_ACTIVE_CONTRACT[contract.id]);
      if (dependency === undefined) expect(contract.tileParams.engineDependencies).toBeUndefined();
      else expect(contract.tileParams.engineDependencies).toEqual([expect.objectContaining({ dep: dependency, status: 'missing' })]);
      for (const seed of seeds) {
        expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
          new RegExp(`AP-07 supports only .*received ${contract.id}`),
        );
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
