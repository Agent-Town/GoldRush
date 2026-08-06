import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import atomic from '../assets/contracts/epoch-6-atomic/contracts.json' with { type: 'json' };

const EXPECTED_RULES: Record<string, string[]> = {
  'e6-glow-mesa': ['baron', 'build_zones'],
  'e6-showroom': ['build_zones'],
  'e6-half-life-hollow': ['build_zones'],
  'e6-picnic': ['build_zones'],
};

// Each Atomic contract declares the era socket it is missing (AP-11 engineDependencies mandate).
// The declaration is honesty, not admission: every contract below stays rejected by the support gate.
const EXPECTED_DEPENDENCY: Record<string, string> = {
  'e6-glow-mesa': 'glow-mesa-contract-consumers',
  'e6-showroom': 'atomic-wrangle-consumer',
  'e6-half-life-hollow': 'half-life-hollow-contract-consumers',
  'e6-picnic': 'picnic-contract-consumers',
};

for (const contract of atomic.contracts) {
  test(`${contract.id} census rejects the unsocketed Atomic mechanics`, async () => {
    const seeds = (benchSeeds as Record<string, string[]>)[contract.id]!;
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
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract);

      expect(seeds).toEqual([`${contract.id}-01`, `${contract.id}-02`]);
      expect(contract.tileParams.engineDependencies).toEqual([
        expect.objectContaining({ dep: EXPECTED_DEPENDENCY[contract.id], status: 'missing' }),
      ]);
      expect(contract.tileParams.engineDependencies[0].description.trim()).not.toEqual('');
      expect(contract.twist.enemyRoster.some(({ id }) => id === 'feral_toaster' || id === 'lawn_shepherd')).toBe(true);
      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      for (const seed of seeds) {
        expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
          new RegExp(`AP-07 supports only .*received ${contract.id}`),
        );
      }
      if (contract.id === 'e6-picnic') expect(mechanics.posting.lossStakes).toHaveLength(3);
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
