import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

test('BLAST_AT kills a headless cluster, rejects cooldown, and reports readiness', async () => {
  test.setTimeout(60_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug&contract=the-claim&seed=ap16-3-blast&nowaves&nolevel');
  let vite: ViteDevServer | undefined;

  host.location = location;
  host.window = { location };
  try {
    vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-3-blast' });
    sim.heroShooter.enabled = () => false;
    const target = { x: sim.hero.group.position.x, z: sim.hero.group.position.z - 5 };

    for (const x of [-0.4, 0, 0.4]) {
      const enemy = sim.enemies.spawn(sim.hero.group.position.clone().set(target.x + x, Balance.enemy.groundY, target.z));
      expect(enemy).not.toBeNull();
      enemy!.takeDamage(enemy!.currentHp - 1);
    }

    expect(sim.currentTurn().view.now.blastReadyInMs).toBe(0);
    expect(sim.submitOrders([{ verb: 'BLAST_AT', pos: target }]).outcome.ok).toBe(true);
    sim.advanceOneTick();
    const armed = sim.currentTurn().view;
    expect(armed.now.orders[0]).toMatchObject({ order: { verb: 'BLAST_AT', pos: target }, status: 'done' });
    expect(armed.now.blastReadyInMs).toBeGreaterThan(0);
    expect(armed.now.blastReadyInMs).toBeLessThanOrEqual(Balance.blast.cooldown * 1_000);

    expect(sim.submitOrders([{ verb: 'BLAST_AT', pos: target }]).outcome.ok).toBe(true);
    sim.advanceOneTick();
    const rejected = sim.currentTurn().view;
    expect(rejected.now.orders[0]).toMatchObject({ status: 'failed', reason: expect.stringContaining('COOLDOWN') });
    expect(rejected.now.needsRider).toBe(true);
    expect(rejected.now.blastReadyInMs).toBeLessThan(armed.now.blastReadyInMs);

    for (let tick = 0; tick < Math.ceil(Balance.blast.airTime * 30) + 2; tick += 1) sim.advanceOneTick();
    expect(sim.combat.killsByOwner.hero_blast).toBe(3);
    expect(sim.currentTurn().view.now.threats.alive).toBe(0);

    while (sim.currentTurn().view.now.blastReadyInMs > 0) sim.advanceOneTick();
    expect(sim.submitOrders([{ verb: 'BLAST_AT', pos: { x: target.x, z: target.z - Balance.blast.range } }]).outcome.ok).toBe(true);
    sim.advanceOneTick();
    expect(sim.currentTurn().view.now.orders[0]).toMatchObject({ status: 'failed', reason: expect.stringContaining('OUT_OF_RANGE') });
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
