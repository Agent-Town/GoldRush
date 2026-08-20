import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

test('E5 and E6 epoch levers reach their existing socket laws', async () => {
  test.setTimeout(60_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e5-deepwater-claim&seed=ap16-7');
  let vite: ViteDevServer | undefined;
  host.location = location;
  host.window = { location };

  try {
    vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    const deepwater = new HeadlessContractSim({
      contractId: 'e5-deepwater-claim', seed: 'ap16-7-e5',
    });
    const firstDeepwater = deepwater.currentTurn().view.now.deepwater!;
    expect(firstDeepwater.pads).toEqual(expect.arrayContaining([expect.objectContaining({ occupied: false })]));
    expect(firstDeepwater.anchors).toHaveLength(2);
    const padId = firstDeepwater.pads[0].id;
    expect(deepwater.submitOrders([{ verb: 'BOAT_BUILD', padId, buildingId: 'turret' }]).outcome.ok).toBe(true);
    deepwater.advanceOneTick();
    expect(deepwater.currentTurn().view.now.deepwater!.pads.find(({ id }: { id: string }) => id === padId)?.occupied).toBe(true);
    deepwater.submitOrders([{ verb: 'BOAT_BUILD', padId, buildingId: 'sentry_beacon' }]);
    deepwater.advanceOneTick();
    expect(deepwater.currentTurn().view.now.orders[0]).toMatchObject({ status: 'failed' });

    const anchorId = firstDeepwater.anchors.find(({ id }: { id: string }) => id !== firstDeepwater.anchor.id)!.id;
    deepwater.submitOrders([{ verb: 'REANCHOR', anchorId }]);
    deepwater.advanceOneTick();
    expect(deepwater.currentTurn().view.now.deepwater!.anchor.id).toBe(anchorId);
    deepwater.submitOrders([{ verb: 'REANCHOR', anchorId }]);
    deepwater.advanceOneTick();
    expect(deepwater.currentTurn().view.now.orders[0]).toMatchObject({ status: 'failed' });

    const atomic = new HeadlessContractSim({ contractId: 'e6-showroom', seed: 'ap16-7-e6', admissionProbe: true });
    expect(atomic.currentTurn().view.now.atomic!.captureLever).toBe('CAPTURE');
    atomic.submitOrders([{ verb: 'CAPTURE' }]);
    atomic.advanceOneTick();
    expect(atomic.currentTurn().view.now.orders[0]).toMatchObject({ status: 'failed' });

    const machine = atomic.enemies.spawn(atomic.prospector.position.clone(), { variantId: 'feral_toaster' })!;
    atomic.atomic!.onEnemyDamaged(machine, 1, false);
    for (let tick = 0; tick <= Math.ceil(Balance.wrangle.windDownSeconds * 30); tick += 1) {
      atomic.atomic!.tickDecay();
      atomic.atomic!.updateWrangle(1 / 30, tick / 30);
    }
    expect(atomic.currentTurn().view.now.atomic!.wrangle.active[0]?.state).toBe('exhausted');
    atomic.submitOrders([{ verb: 'CAPTURE' }]);
    atomic.advanceOneTick();
    expect(atomic.currentTurn().view.now.orders[0]).toMatchObject({ status: 'done' });
    expect(atomic.currentTurn().view.now.atomic!.wrangle.pen).toMatchObject({
      total: 1,
      roster: [{ variantId: 'feral_toaster', count: 1 }],
    });
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
