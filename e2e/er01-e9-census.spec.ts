import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import redfields from '../assets/contracts/epoch-9-redfields/contracts.json' with { type: 'json' };

const SIGNATURE_GAPS: Record<string, { dependency?: string; twist?: string }> = {
  'e9-dome-basin': {},
  'e9-seed-run': { dependency: 'persistent-planting-consumer', twist: 'persistentPlanting' },
  'e9-devils-alley': { dependency: 'scheduled-relocation-consumer', twist: 'scheduledRelocation' },
  'e9-old-canal': { dependency: 'persistent-canal-choice-consumer', twist: 'persistentCanalChoices' },
};

for (const contract of redfields.contracts) {
  test(`${contract.id} census rejects the unsocketed Red Fields mechanic`, async () => {
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
      const gap = SIGNATURE_GAPS[contract.id]!;
      expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      if (gap.dependency) {
        expect(contract.tileParams.engineDependencies).toEqual([
          expect.objectContaining({ dep: gap.dependency, status: 'missing' }),
        ]);
        expect(Object.hasOwn(contract.twist, gap.twist!)).toBe(true);
      } else {
        expect('engineDependencies' in contract.tileParams).toBe(false);
        expect(contract.tileParams.stakeMarkers.map(({ id }) => id)).toEqual([
          'canal-stage-c1',
          'canal-stage-c2',
          'canal-stage-c3',
        ]);
      }

      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract.id);

      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(['build_zones']);
      for (const suffix of ['01', '02']) {
        expect(() => new HeadlessContractSim({ contractId: contract.id, seed: `${contract.id}-${suffix}` })).toThrow(
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
