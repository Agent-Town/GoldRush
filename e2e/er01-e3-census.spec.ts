import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import voltage from '../assets/contracts/epoch-3-voltage/contracts.json' with { type: 'json' };

const SOCKET_GAPS: Record<string, readonly string[]> = {
  'e3-blackout-ridge': ['dayNightCycle', 'powerGrid'],
  'e3-moth-season': ['dayNightCycle', 'mothSeason'],
  'e3-canyon-works': ['dayNightCycle', 'mothSeason', 'powerGrid'],
  'e3-fairground': ['dayNightCycle', 'fairground', 'powerGrid'],
};

for (const contract of voltage.contracts) {
  test(`${contract.id} stays rejected until its Voltage socket exists`, async () => {
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
      const mechanics = deriveMechanicsManifest(contract.id);
      const sources = mechanics.rules.map(({ source }: { source: string }) => source);

      expect(seeds).toHaveLength(2);
      for (const field of SOCKET_GAPS[contract.id]!) {
        expect(Object.hasOwn(contract.twist, field)).toBe(true);
        expect(sources).not.toContain(`twist.${field}`);
      }
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
