import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import motor from '../assets/contracts/epoch-4-motor/contracts.json' with { type: 'json' };

// The Motor era's four contracts are admitted even though their signature engine dependencies
// are still `missing`. One mechanic is the exception to the *manifest*
// half of that: the Land Yacht's ORBIT road already has a live browser consumer
// (Game.ts constructs LandYachtBossSystem unconditionally and updates it in the sim loop,
// reading tileParams.orbitSpawn), so AP-11 — "declared AND consumed by a booted system" —
// admits it to the manifest even while the headless socket remains blocked.
for (const contract of motor.contracts) {
  test(`${contract.id} is admitted while its signature engine dependency is missing, and declares only consumed vocabulary`, async () => {
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
      expect(contract.tileParams.engineDependencies).toEqual([
        expect.objectContaining({ status: 'missing' }),
      ]);
      expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();

      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const manifest = deriveMechanicsManifest(contract.id);
      expect(manifest.interactables).toEqual([]);
      // Admission does not mint a Motor-specific operation; the shared registry buildables remain.
      expect(manifest.buildables?.every(({ source }: { source: string }) => source === 'buildables.registry')).toBe(true);

      const rules = manifest.rules as { id: string; source: string; data: Record<string, unknown> }[];
      const ruleIds = rules.map(({ id }) => id);
      const twist = contract.twist as { baron?: { variantId?: string; wave?: number } };
      if (twist.baron?.variantId === 'land_yacht') {
        expect(ruleIds).toEqual(expect.arrayContaining([
          'land_yacht_acts', 'land_yacht_crane', 'land_yacht_dread', 'land_yacht_head_loot', 'land_yacht_orbit',
        ]));
        // Every number is the consumer's own: the three orbitSpawn fields LandYachtBossSystem
        // actually reads, and nothing more.
        const orbit = (contract.tileParams as { orbitSpawn: { center: { x: number; z: number }; radius: number; angularSpeed: number } }).orbitSpawn;
        expect(rules.find(({ id }) => id === 'land_yacht_orbit')).toEqual({
          id: 'land_yacht_orbit',
          source: 'LandYachtBossSystem.installOrbitRoute',
          data: {
            centerX: orbit.center.x,
            centerZ: orbit.center.z,
            radius: orbit.radius,
            angularSpeed: orbit.angularSpeed,
            waypoints: 25,
            speed: 'radius*angularSpeed',
            startAngle: 'atan2(component.z-centerZ,component.x-centerX)',
            installedOn: 'first-tick-with-a-live-land_yacht-component',
            ignoresTerrain: true,
          },
        });
        // AP-11 species B: fields no booted system reads must NOT be minted. These are the
        // Dust Flats' declared-but-inert layers; if a future author wires one, this fails and
        // the manifest is meant to grow — deliberately, not by accident.
        const serialized = JSON.stringify(manifest);
        for (const inert of ['lapsBeforePeel', 'peelSpeed', 'peelPoints', 'north-cut', 'telegraphSeconds', 'tarSeams', 'tar-west', 'roadCorridors', 'camp-to-railhead', 'dryWash', 'stormSeconds', 'hazeColor']) {
          expect(serialized).not.toContain(inert);
        }
      } else {
        expect(ruleIds.filter((id) => id.startsWith('land_yacht'))).toEqual([]);
      }

      const admitted = new HeadlessContractSim({ contractId: contract.id, seed: `${contract.id}-census-probe` });
      expect(admitted.currentTurn().view.stablePrefix.mechanics.contractId).toBe(contract.id);
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
