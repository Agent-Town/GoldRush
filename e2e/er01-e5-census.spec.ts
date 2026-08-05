import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import deepwater from '../assets/contracts/epoch-5-deepwater/contracts.json' with { type: 'json' };

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e5-deepwater-claim': 'e5-deepwater-claim',
  'e5-regatta': 'the-claim',
  'e5-stillwater': 'e5-stillwater',
  'e5-flotilla': 'the-claim',
};

const FORBIDDEN_SOURCE = [
  'tileParams.deepwater',
  'tileParams.raceCourse',
  'tileParams.stillwater',
  'tileParams.flotilla',
  'twist.weather',
];

for (const contract of deepwater.contracts) {
  test(`${contract.id} census refusal is explicit`, async () => {
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
      const manifest = deriveMechanicsManifest(contract.id);

      expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      expect(manifest.interactables).toEqual([]);
      const sources = manifest.rules.map(({ source }: { source: string }) => source);
      for (const source of FORBIDDEN_SOURCE) expect(sources).not.toContain(source);
      expect(activeContract().id).toBe(EXPECTED_ACTIVE_CONTRACT[contract.id]);
      if (contract.id === 'e5-deepwater-claim') expect(contract.tileParams.engineDependencies).toBeUndefined();
      else expect(contract.tileParams.engineDependencies).toEqual([expect.objectContaining({ status: 'missing' })]);
      for (const seed of seeds) {
        expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(/AP-07 supports only/);
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
