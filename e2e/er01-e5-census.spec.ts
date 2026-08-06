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

// Vocabulary must come from CONSUMERS, never from raw authored data. A rule sourced to
// `tileParams.deepwater` would be the reject-don't-stretch failure this census exists to catch.
const FORBIDDEN_SOURCE = [
  'tileParams.deepwater',
  'tileParams.raceCourse',
  'tileParams.stillwater',
  'tileParams.flotilla',
  'twist.weather',
];

// Only the flagship has a consumer, so only the flagship gets vocabulary. The three variants
// declare their own consumer `missing` and must stay silent.
const EXPECTED_SOCKET_RULES = [
  'deepwater_arsenal',
  'deepwater_boss_socket_absent',
  'deepwater_claim_boat',
  'deepwater_levers_unreachable',
  'deepwater_storm_track',
  'deepwater_water_regions',
];

for (const contract of deepwater.contracts) {
  test(`${contract.id} census refusal is explicit`, async () => {
    test.setTimeout(90_000);
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
      const { activeContract, loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const { DeepwaterSocket } = await vite.ssrLoadModule('/src/sim/DeepwaterSocket.ts');
      const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
      const manifest = deriveMechanicsManifest(contract.id);

      expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      expect(manifest.interactables).toEqual([]);
      const sources = manifest.rules.map(({ source }: { source: string }) => source);
      for (const source of FORBIDDEN_SOURCE) expect(sources).not.toContain(source);
      expect(activeContract().id).toBe(EXPECTED_ACTIVE_CONTRACT[contract.id]);
      if (contract.id === 'e5-deepwater-claim') expect(contract.tileParams.engineDependencies).toBeUndefined();
      else expect(contract.tileParams.engineDependencies).toEqual([expect.objectContaining({ status: 'missing' })]);

      const socketRules = manifest.rules
        .map(({ id }: { id: string }) => id)
        .filter((id: string) => id.startsWith('deepwater_'));
      if (contract.id === 'e5-deepwater-claim') {
        expect(socketRules).toEqual(EXPECTED_SOCKET_RULES);

        // The socket is REAL and DETERMINISTIC. Two independent tiles, identical tick counts,
        // identical snapshots — the property that makes an event-log hash mean anything.
        // The socket needs a real CombatSystem for its arsenal; borrow the one an admitted
        // contract already builds, rather than importing `three` into the spec and tripping the
        // "multiple instances" warning against the zero-console assertion below.
        const drive = (steps: number) => {
          const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'er01-e5-probe' });
          const socket = DeepwaterSocket.create(
            loadContract('e5-deepwater-claim'),
            new EnemyPool(),
            sim.combat,
            () => sim.hero.group.position,
            () => undefined,
          );
          expect(socket).not.toBeNull();
          for (let step = 1; step <= steps; step += 1) socket.advance(step / 30);
          return socket;
        };
        const first = drive(30 * 120);
        const second = drive(30 * 120);
        expect(JSON.stringify(second.simulationSnapshot)).toBe(JSON.stringify(first.simulationSnapshot));
        expect(first.diagnostics.corsairWaves).toBeGreaterThan(0);
        expect(first.diagnostics.corsairsSpawned).toBeGreaterThan(0);

        // F-ER01-E5-1: the missing step is COUNTED, not skipped. Every storm wave at or past the
        // Dredge-Queen's wave was offered to a boss that cannot be constructed outside a browser.
        expect(first.diagnostics.bossHandoffsRefused).toBeGreaterThan(0);

        // F-ER01-E5-5: both boat levers are real — each accepts a valid move and rejects an
        // invalid one — and neither is reachable from the agent surface.
        const boat = contract.tileParams.deepwater.claimBoat;
        const other = boat.anchors.find(({ id }: { id: string }) => id !== boat.initialAnchorId)!;
        expect(first.reanchor(other.id)).toBe(true);
        expect(first.reanchor(other.id)).toBe(false);
        expect(first.reanchor('no-such-anchor')).toBe(false);
        expect(first.placeBoatBuilding(boat.pads[0].id, 'turret')).toBe(true);
        expect(first.placeBoatBuilding(boat.pads[0].id, 'sentry_beacon')).toBe(false);
        expect(first.placeBoatBuilding('no-such-pad', 'turret')).toBe(false);
        const levers = manifest.rules.find(({ id }: { id: string }) => id === 'deepwater_levers_unreachable');
        expect(levers.data.agentOperations).toEqual([]);
        expect(manifest.buildables).toBeUndefined();
      } else {
        expect(socketRules).toEqual([]);
        // The variants carry `tileParams.deepwater` too. The socket must refuse them exactly as
        // `createDeepwaterClaimTile` does, or their missing consumers would look socketed.
        const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'er01-e5-probe' });
        const socket = DeepwaterSocket.create(
          loadContract(contract.id),
          new EnemyPool(),
          sim.combat,
          () => sim.hero.group.position,
          () => undefined,
        );
        expect(socket).toBeNull();
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
