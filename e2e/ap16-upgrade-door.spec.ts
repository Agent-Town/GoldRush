import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

type DraftSim = {
  progression: { debugGrant: (amount: number) => void };
  dead: boolean;
};

test('the headless door offers, validates, applies, and defaults the shared upgrade draft', async () => {
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug&contract=the-claim&seed=ap16-upgrade-door');
  let vite: ViteDevServer | undefined;
  host.location = location;
  host.window = { location };

  try {
    vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    const { applyDifficultyPreset } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { snapshotStandingOrders } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    applyDifficultyPreset('trail');

    const picked = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-picked' });
    (picked as unknown as DraftSim).progression.debugGrant(12);
    picked.advanceOneTick();
    const offered = picked.currentTurn().view.now.pendingOffer!;
    expect(offered).toHaveLength(3);
    expect(offered[0]).toEqual({ id: expect.any(String), name: expect.any(String), effectText: expect.any(String) });
    expect(picked.currentTurn().view.now.expiresAtSimMs! - Math.round(picked.currentTurn().view.now.timers.runSeconds * 1000)).toBeGreaterThanOrEqual(20_000);
    expect(picked.currentTurn().view.now.expiresAtSimMs! - Math.round(picked.currentTurn().view.now.timers.runSeconds * 1000)).toBeLessThan(20_034);

    const invalid = picked.submitOrders([{ verb: 'PICK_UPGRADE', id: 'not-in-this-offer' }]);
    expect(invalid.outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });
    expect(invalid.outcome.message).toContain('live offered id');
    expect(snapshotStandingOrders().log.at(-1)).toMatchObject({ type: 'orders_rejected', reason: expect.stringContaining('live offered id') });

    const choice = offered[1]!;
    expect(picked.submitOrders([{ verb: 'PICK_UPGRADE', id: choice.id }]).outcome.ok).toBe(true);
    picked.advanceOneTick();
    const afterPick = picked.currentTurn().view;
    expect(afterPick.now.pendingOffer).toBeUndefined();
    expect(afterPick.now.hero.upgradesTaken[choice.id]).toBe(1);
    expect(picked.submitOrders([{ verb: 'PICK_UPGRADE', id: choice.id }]).outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });

    const queued = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-queued' });
    (queued as unknown as DraftSim).progression.debugGrant(12);
    queued.advanceOneTick();
    const firstDeadline = queued.currentTurn().view.now.expiresAtSimMs;
    (queued as unknown as DraftSim).progression.debugGrant(100);
    queued.advanceOneTick();
    expect(queued.currentTurn().view.now.expiresAtSimMs).toBe(firstDeadline);

    const defaulted = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-defaulted' });
    (defaulted as unknown as DraftSim).progression.debugGrant(12);
    defaulted.advanceOneTick();
    const defaultOffer = defaulted.currentTurn().view.now.pendingOffer!;
    const first = defaultOffer[0]!.id;
    for (let ticks = 0; defaulted.currentTurn().view.now.pendingOffer && ticks < 601; ticks += 1) {
      defaulted.advanceOneTick();
    }
    expect(defaulted.currentTurn().view.now.pendingOffer).toBeUndefined();
    expect(defaulted.currentTurn().view.now.hero.upgradesTaken[first]).toBe(1);
    (defaulted as unknown as DraftSim).dead = true;
    expect(defaulted.outcome().defaultedPicks).toBe(1);
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
