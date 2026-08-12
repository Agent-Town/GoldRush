import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

test('SET_WEAPON, SECURE_CHOICE, and CONTEXT_ACTION share the browser rules', async () => {
  test.setTimeout(60_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug&contract=the-claim&seed=ap16-6&nowaves&nolevel');
  let vite: ViteDevServer | undefined;
  host.location = location;
  host.window = { location };

  try {
    vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    const weapons = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-weapons' });
    const target = { x: weapons.hero.group.position.x, z: weapons.hero.group.position.z - 5 };
    expect(weapons.currentTurn().view.now.weapon).toBe('rig');
    expect(weapons.heroShooter.enabled()).toBe(true);
    expect(weapons.submitOrders([{ verb: 'SET_WEAPON', weapon: 'cannon' }]).outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });
    expect(weapons.submitOrders([{ verb: 'SET_WEAPON', weapon: 'blast' }]).outcome.ok).toBe(true);
    weapons.advanceOneTick();
    expect(weapons.currentTurn().view.now.weapon).toBe('blast');

    const sharedCooldown = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-shared-cooldown' });
    const sharedTarget = sharedCooldown.hero.group.position.clone().setZ(sharedCooldown.hero.group.position.z - 5);
    expect(sharedCooldown.enemies.spawn(sharedTarget)).toBeTruthy();
    expect(sharedCooldown.submitOrders([
      { verb: 'SET_WEAPON', weapon: 'blast' },
      { verb: 'BLAST_AT', pos: { x: sharedTarget.x, z: sharedTarget.z } },
    ]).outcome.ok).toBe(true);
    sharedCooldown.advanceOneTick();
    sharedCooldown.advanceOneTick();
    expect(sharedCooldown.combat.blastsAlive).toBe(1);
    expect(sharedCooldown.currentTurn().view.now.blastReadyInMs).toBeGreaterThan(0);
    expect(weapons.heroShooter.enabled()).toBe(false);
    expect(weapons.blastShooter.enabled()).toBe(true);
    expect(weapons.submitOrders([{ verb: 'BLAST_AT', pos: target }]).outcome.ok).toBe(true);
    weapons.advanceOneTick();
    expect(weapons.currentTurn().view.now.orders[0]).toMatchObject({ status: 'done' });
    expect(weapons.submitOrders([{ verb: 'SET_WEAPON', weapon: 'blast' }]).outcome.ok).toBe(true);
    weapons.advanceOneTick();
    expect(weapons.currentTurn().view.now.weapon).toBe('blast');

    const bank = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-bank' });
    expect(bank.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]).outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });
    expect(bank.runManager.secureCurrentRun(0)).toBe(true);
    expect(bank.currentTurn().view.now.pendingSecure).toMatchObject({ defaultChoice: 'bank', expiresInMs: Balance.offers.pickSeconds * 1000 });
    expect(bank.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]).outcome.ok).toBe(true);
    bank.advanceOneTick();
    expect(bank.isTerminal).toBe(true);

    const silent = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-silent' });
    silent.runManager.secureCurrentRun(0);
    for (let tick = 0; tick < Math.ceil(Balance.offers.pickSeconds * 30); tick += 1) silent.advanceOneTick();
    expect(silent.isTerminal).toBe(true);
    expect(silent.outcome().defaultedSecure).toBe(1);

    const modal = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-modal', scienceSteps: 100 });
    modal.economy.apply(modal.economyEvent({ type: 'gold_granted', source: 'debug', amount: 1_000 }));
    modal.submitOrders([{ verb: 'SET_WEAPON', weapon: 'blast' }]);
    modal.advanceOneTick();
    expect(modal.enemies.spawn(modal.hero.group.position.clone().setZ(modal.hero.group.position.z - 5))).toBeTruthy();
    expect(modal.submitOrders([{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 13 }, when: { goldGte: 0 } }]).outcome.ok).toBe(true);
    expect(modal.runManager.secureCurrentRun(0)).toBe(true);
    const frozen = {
      time: modal.timeAlive,
      gold: modal.economy.gold,
      works: modal.build.diagnostics.hp.length,
      blasts: modal.combat.blastsAlive,
      expires: modal.currentTurn().view.now.pendingSecure!.expiresInMs,
    };
    expect(modal.submitOrders([{ verb: 'CONTEXT_ACTION', action: 'fund' }]).outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });
    expect(modal.submitOrders([
      { verb: 'SECURE_CHOICE', choice: 'bank' },
      { verb: 'CONTEXT_ACTION', action: 'fund' },
    ]).outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });
    for (let tick = 0; tick < 10; tick += 1) modal.advanceOneTick();
    expect({
      time: modal.timeAlive,
      gold: modal.economy.gold,
      works: modal.build.diagnostics.hp.length,
      blasts: modal.combat.blastsAlive,
    }).toEqual({ time: frozen.time, gold: frozen.gold, works: frozen.works, blasts: frozen.blasts });
    expect(modal.currentTurn().view.now.pendingSecure!.expiresInMs).toBeLessThan(frozen.expires);

    const lockedProject = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-locked-project' });
    expect(lockedProject.currentTurn().view.now.megaproject).toBeUndefined();
    expect(lockedProject.submitOrders([{ verb: 'CONTEXT_ACTION', action: 'fund' }]).outcome.ok).toBe(true);
    lockedProject.advanceOneTick();
    expect(lockedProject.currentTurn().view.now.orders[0]).toMatchObject({ status: 'failed' });
    expect(lockedProject.currentTurn().view.now.needsRider).toBe(true);

    const explicitRush = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-rush' });
    explicitRush.runManager.secureCurrentRun(0);
    explicitRush.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'rush' }]);
    explicitRush.advanceOneTick();
    expect(explicitRush.currentTurn().view.now.overtime).toBe(true);
    explicitRush.dead = true;
    const explicitRushHash = explicitRush.outcome().eventLogHash;

    const overtimeDefault = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-rush', overtime: true });
    overtimeDefault.runManager.secureCurrentRun(0);
    for (let tick = 0; tick < Math.ceil(Balance.offers.pickSeconds * 30); tick += 1) overtimeDefault.advanceOneTick();
    expect(overtimeDefault.currentTurn().view.now.overtime).toBe(true);
    overtimeDefault.dead = true;
    expect(explicitRushHash).toBe(overtimeDefault.outcome().eventLogHash);

    const context = new HeadlessContractSim({ contractId: 'the-claim', seed: 'ap16-6-context', scienceSteps: 100 });
    context.economy.apply(context.economyEvent({ type: 'gold_granted', source: 'debug', amount: 1_000 }));
    const startGold = context.currentTurn().view.now.gold;
    context.submitOrders([{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 13 }, when: { goldGte: 0 } }]);
    context.advanceOneTick();
    const built = context.currentTurn().view.now.works.entries.find(({ id }: { id: string }) => id === 'turret')!;
    expect(built.tier).toBe(1);
    context.prospector.position.set(built.position.x, 0, built.position.z);
    context.submitOrders([{ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: built.id, index: built.index } }]);
    context.advanceOneTick();
    expect(context.currentTurn().view.now.works.entries.find(({ id }: { id: string }) => id === 'turret')!.tier).toBe(2);
    expect(context.currentTurn().view.now.gold).toBeLessThan(startGold);
    context.prospector.position.set(built.position.x, 0, built.position.z);
    context.submitOrders([{ verb: 'CONTEXT_ACTION', action: 'demolish', target: { id: built.id, index: built.index } }]);
    context.advanceOneTick();
    expect(context.currentTurn().view.now.works.byKind.turret ?? 0).toBe(0);

    const project = context.currentTurn().view.now.megaproject!;
    context.prospector.position.set(project.site.x, 0, project.site.z);
    const beforeFund = context.currentTurn().view.now.gold;
    context.submitOrders([{ verb: 'CONTEXT_ACTION', action: 'fund' }]);
    context.advanceOneTick();
    expect(context.currentTurn().view.now.megaproject!.funded).toBe(true);
    expect(context.currentTurn().view.now.gold).toBe(beforeFund - project.cost);
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
