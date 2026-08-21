import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import deepSky from '../assets/contracts/epoch-10-deepsky/contracts.json' with { type: 'json' };

const EXPECTED_RULES: Record<string, string[]> = {
  'e10-ember-shore': ['build_zones'],
  'e10-archive-world': ['build_zones'],
  'e10-last-claim': ['build_zones'],
  'e10-river': ['river', 'water_crossings'],
};

const EXPECTED_DEPENDENCY: Record<string, string | undefined> = {
  'e10-ember-shore': 'ember-shore-preserve-consumers',
  'e10-archive-world': 'archive-world-consumers',
  'e10-last-claim': 'last-claim-objective-consumer',
  'e10-river': 'credits-river-consumer',
};

const EXPECTED_LOSS_STAKES: Record<string, number> = {
  'e10-ember-shore': 1,
  'e10-archive-world': 0,
  'e10-last-claim': 3,
  'e10-river': 0,
};

for (const contract of deepSky.contracts) {
  test(`${contract.id} census cites the existing Deep Sky debt`, async () => {
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
      expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      const dependency = 'engineDependencies' in contract.tileParams
        ? contract.tileParams.engineDependencies
        : undefined;
      const expectedDependency = EXPECTED_DEPENDENCY[contract.id];
      if (expectedDependency === undefined) expect(dependency).toBeUndefined();
      else expect(dependency).toEqual([expect.objectContaining({ dep: expectedDependency, status: 'missing' })]);

      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract);

      expect(mechanics.buildables).toBeUndefined();
      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      expect(mechanics.posting.lossStakes).toHaveLength(EXPECTED_LOSS_STAKES[contract.id]!);
      for (const seed of [`${contract.id}-01`, `${contract.id}-02`]) {
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
