import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import deepwater from '../assets/contracts/epoch-5-deepwater/contracts.json' with { type: 'json' };
import regattaMask from '../assets/contracts/epoch-5-deepwater/mask-tables/e5-regatta.json' with { type: 'json' };

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e5-deepwater-claim': 'e5-deepwater-claim',
  'e5-regatta': 'the-claim',
  'e5-stillwater': 'e5-stillwater',
  'e5-flotilla': 'the-claim',
};

/**
 * ADMISSION GATE 1 (F-ER01-E5-1) — every E5 contract must name the headless consumer it lacks.
 * The Deepwater Claim shipped without one: `tileParams.deepwater` is inert for all four contracts,
 * but it is absent from `DECLARED_INERT_PATHS`, so the AP-11 validator never demanded the
 * declaration. Nothing mechanised this; only this table does.
 */
const DECLARED_CONSUMER: Record<string, string> = {
  'e5-deepwater-claim': 'deepwater-claim-consumer',
  'e5-regatta': 'regatta-race-consumer',
  'e5-stillwater': 'noise-hunt-consumer',
  'e5-flotilla': 'distributed-base-consumer',
};

/** Count words a briefing could use, indexed by the number they name. */
const COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

type BeaconRow = { id: string; x: number; z: number; radius: number };

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

      // ADMISSION GATE 1 — the contract names the consumer it is waiting on, in the AP-11 shape
      // (`exactRecord(entry, ['dep', 'status', 'description'])`). All four now do; the Claim did not.
      expect(contract.tileParams.engineDependencies).toEqual([
        { dep: DECLARED_CONSUMER[contract.id], status: 'missing', description: expect.any(String) },
      ]);

      // ADMISSION GATE 2 (F-ER01-E5-2) — a briefing may not promise a count its own data does not hold.
      // The Regatta advertised SIX beacon gates over a FIVE-beacon course. Derive the expected word
      // from the data so the assert cannot rot the way the prose did.
      const beacons = (contract.tileParams as { raceCourse?: { beacons: BeaconRow[] } }).raceCourse?.beacons;
      if (beacons) {
        const beaconRule = contract.briefing.rules.find((rule) => rule.includes('beacon gates'));
        expect(beaconRule).toBeDefined();
        expect(beaconRule!.toLowerCase()).toContain(`${COUNT_WORDS[beacons.length]} beacon gates`);
        for (const [count, word] of COUNT_WORDS.entries()) {
          if (count !== beacons.length) expect(beaconRule!.toLowerCase()).not.toContain(`${word} beacon`);
        }
        // The mask table is the surface the terrain mesh was built from; it must agree beacon-for-beacon.
        const built = (regattaMask as { maskTruth: { raceCourse: { beacons: BeaconRow[] } } }).maskTruth.raceCourse.beacons;
        expect(built.map(({ id }) => id)).toEqual(beacons.map(({ id }) => id));
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
