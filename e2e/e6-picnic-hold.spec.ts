import { expect, test } from '@playwright/test';
import { createServer } from 'vite';

test('Picnic stakes require six uncontested seconds and are lost permanently', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { PicnicHoldSystem, PICNIC_HOLD_SECONDS } = await vite.ssrLoadModule('/src/systems/PicnicHoldSystem.ts');
    let losses = 0;
    const hold = new PicnicHoldSystem(true, [
      { id: 'west', x: -6, z: 0, heroStart: true },
      { id: 'center', x: 0, z: 0, heroStart: true },
      { id: 'east', x: 6, z: 0, heroStart: true },
    ], () => { losses += 1; });
    const enemy = (x: number) => ({ position: { x, z: 0 } });

    const hero = { position: { x: -6, z: 0 } };
    hold.update(PICNIC_HOLD_SECONDS - 0.1, 5, [enemy(-6)], [], hero);
    expect(hold.diagnostics[0]).toMatchObject({ held: true, claimed: false, timer: PICNIC_HOLD_SECONDS - 0.1 });
    hold.recordHeroDamage(5);
    hold.update(0.2, 5.2, [enemy(-6)], [], hero);
    expect(hold.diagnostics[0]).toMatchObject({ held: true, contested: true, timer: 0 });

    for (const x of [-6, 0, 6]) hold.update(PICNIC_HOLD_SECONDS, 20, [enemy(x)], [], hero);
    expect(hold.diagnostics.map(({ claimed }: { claimed: boolean }) => claimed)).toEqual([true, true, true]);
    expect(losses).toBe(1);
    hold.update(PICNIC_HOLD_SECONDS, 30, [enemy(0)], [], hero);
    expect(losses).toBe(1);
  } finally {
    await vite.close();
  }
});

test('Picnic hold is absent off-contract', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { PicnicHoldSystem } = await vite.ssrLoadModule('/src/systems/PicnicHoldSystem.ts');
    const hold = new PicnicHoldSystem(false, [{ id: 'stake', x: 0, z: 0, heroStart: true }], () => {
      throw new Error('disabled hold fired');
    });
    hold.update(60, 60, [{ position: { x: 0, z: 0 } }], [], { position: { x: 0, z: 0 } });
    expect(hold.diagnostics).toEqual([]);
  } finally {
    await vite.close();
  }
});

test('one quarter of enemies press the nearest undefended stake', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { PicnicHoldSystem, PICNIC_STAKE_PRESS_WEIGHT } = await vite.ssrLoadModule('/src/systems/PicnicHoldSystem.ts');
    const hold = new PicnicHoldSystem(true, [
      { id: 'west', x: -6, z: 0, heroStart: true },
      { id: 'center', x: 0, z: 0, heroStart: true },
      { id: 'east', x: 6, z: 0, heroStart: true },
    ], () => undefined);
    const enemies = Array.from({ length: 12 }, (_, id) => ({ id, position: { x: id - 6, z: -10 } }));
    const structures = [{ position: { x: -6, z: 0 } }];
    const hero = { position: { x: 20, z: 20 } };

    const targets = enemies.map((enemy) => hold.pressureTarget(enemy, structures, hero, 0));
    expect(PICNIC_STAKE_PRESS_WEIGHT).toBe(0.25);
    expect(targets.filter(Boolean)).toHaveLength(3);
    expect(targets.filter(Boolean)).not.toContainEqual({ x: -6, z: 0 });
    expect(PicnicHoldSystem.isEnabled({ twist: {} })).toBe(false);
  } finally {
    await vite.close();
  }
});
