import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createServer } from 'vite';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

test('the Flotilla keeps three losable hulls and secures both bench seeds deterministically', async () => {
  test.setTimeout(90_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e5-flotilla');
  host.location = location;
  host.window = { location };
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

  try {
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { FlotillaHullSystem } = await vite.ssrLoadModule('/src/systems/FlotillaHullSystem.ts');
    const { createDeepwaterClaimTile } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
    const contract = loadContract('e5-flotilla');
    const hulls = FlotillaHullSystem.create(contract)!;
    expect(hulls.diagnostics).toMatchObject({
      hulls: [
        { id: 'kitchen-scow', district: 'kitchen', integrity: 96, lost: false, straggler: true },
        { id: 'turret-raft', district: 'turret', integrity: 96, lost: false },
        { id: 'still-room-barge', district: 'still-room', integrity: 96, lost: false },
      ],
      centroid: { x: 0, z: 23 },
      allLost: false,
    });
    expect(hulls.reanchor('kitchen-scow')).toBe(true);
    expect(hulls.diagnostics.hulls[0].x).toBeCloseTo(-20.018, 2);
    expect(hulls.diagnostics.hulls[0].z).toBeCloseTo(21.46, 2);
    expect(hulls.reanchor('kitchen-scow')).toBe(false);
    hulls.reset();
    expect(hulls.diagnostics.hulls[0]).toMatchObject({ id: 'kitchen-scow', x: -26, z: 21 });
    expect(hulls.diagnostics.reshapeCooldownSeconds).toBe(0);
    const tile = createDeepwaterClaimTile(contract)!;
    expect(tile.placeBoatBuilding('kitchen-scow', 'sentry_beacon')).toBe(true);
    const losableHulls = FlotillaHullSystem.create(contract, (id: string) => tile.loseHull(id))!;
    expect(losableHulls.advance(1, [{
      id: 1,
      isAlive: true,
      position: { x: -26, z: 21 },
      hitRadius: 1,
      contactDamage: 96,
    }])).toBe(false);
    expect(losableHulls.diagnostics.hulls.find(({ id }: { id: string }) => id === 'kitchen-scow')).toMatchObject({ integrity: 0, lost: true });
    expect(tile.snapshot().boat.buildings).toHaveLength(0);
    expect(tile.placeBoatBuilding('kitchen-scow', 'sentry_beacon')).toBe(false);
    expect(deriveMechanicsManifest(contract).rules.find(({ id }: { id: string }) => id === 'flotilla_hulls')).toMatchObject({
      source: 'FlotillaHullSystem.advance+reanchor+targetPosition',
      data: { integrity: 96, reshapeCooldownSeconds: 8, reshapeDistance: 6, minimumHullsAlive: 1 },
    });

    const run = (seed: string) => {
      const sim = new HeadlessContractSim({ contractId: contract.id, seed });
      let turn = sim.currentTurn();
      let firstTurn = true;
      let turns = 0;
      while (!turn.terminal && turns++ < 40) {
        const deepwater = turn.view.now.deepwater!;
        const orders: unknown[] = [];
        if (turn.view.now.pendingSecure) {
          orders.push({ verb: 'SECURE_CHOICE', choice: 'bank' });
        } else {
          if (firstTurn) {
            for (const [index, pad] of deepwater.pads.entries()) {
              orders.push({ verb: 'BOAT_BUILD', padId: pad.id, buildingId: index === 0 ? 'sentry_beacon' : 'turret' });
            }
            firstTurn = false;
          }
          const straggler = deepwater.flotilla!.hulls.find(({ straggler }: { straggler: boolean }) => straggler)!;
          if (deepwater.flotilla!.reshapeCooldownSeconds === 0) orders.push({ verb: 'REANCHOR', anchorId: straggler.id });
          orders.push({ verb: 'MOVE_TO', pos: { x: straggler.x, z: straggler.z } });
          orders.push({ verb: 'HOLD', pos: { x: straggler.x, z: straggler.z } });
        }
        const receipt = sim.submitOrders(orders);
        expect(receipt.outcome.ok, JSON.stringify(receipt.outcome)).toBe(true);
        turn = sim.advanceToTurn();
      }
      expect(turn.terminal).toBe(true);
      expect(turn.view.now.deepwater!.flotilla!.hulls.some(({ lost }: { lost: boolean }) => !lost)).toBe(true);
      return sim.outcome();
    };

    const expected = {
      'e5-flotilla-01': 'fnv1a32:5786662f',
      'e5-flotilla-02': 'fnv1a32:ee9f70c6',
    } as const;
    for (const [seed, eventLogHash] of Object.entries(expected)) {
      const first = run(seed);
      const second = run(seed);
      expect(second).toEqual(first);
      // NAMED-CAUSE PIN (b2-flotilla-hulls, 2026-08-20): three deck builds, repeated
      // straggler-biased defense, and REANCHOR formation pulls through secure wave 12.
      expect(first).toMatchObject({ secured: true, waves: 12, kills: 30, eventLogHash });
    }
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});

test('idle Flotilla runs lose all hulls', () => {
  test.setTimeout(30_000);
  const expected = {
    'e5-flotilla-01': 'fnv1a32:68d87963',
    'e5-flotilla-02': 'fnv1a32:008f54ba',
  } as const;
  for (const [seed, eventLogHash] of Object.entries(expected)) {
    const run = spawnSync(process.execPath, [
      'scripts/gr-sim.mjs', '--contract', 'e5-flotilla', '--seed', seed, '--policy=idle',
    ], { cwd: process.cwd(), encoding: 'utf8', timeout: 20_000 });
    expect(run.status, run.stderr).toBe(0);
    const outcome = JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    // NAMED-CAUSE PIN: no rider follows the straggler, so all three hulls reach zero integrity.
    expect(outcome).toMatchObject({ secured: false, waves: 2, timeMs: 46800, kills: 0, eventLogHash });
  }
});

test('plain boot resolves the Flotilla contract without browser errors', async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e5-flotilla&nowaves&nolevel&nopause');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__!.activeContract().id)).toBe('e5-flotilla');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e5-flotilla');
  expectNoConsoleErrors(watch, 'e5-flotilla plain boot');
});
