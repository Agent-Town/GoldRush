import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const E2_SLOTS = ['char.e2.rail_tough', 'char.e2.steam_wrecker', 'char.e2.coal_thief'] as const;
const ARTIFACT_DIR = path.resolve('artifacts/wire-e2-enemy-walk4');

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('E2 roster uses advancing walk4 art while E1 keeps the jumper walk8', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=e2-hill-mine&nowaves&nolevel&nopause&nokill&nosteal&nowreck&seed=e2-walk4');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16 && window.__GR_TEST__);
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    const roster = window.__GR_TEST__?.activeContract().twist.enemyRoster ?? [];
    for (const variant of roster) {
      const options = {
        variantId: variant.id, variantLabel: variant.label, hpScale: variant.hpScale,
        speedMult: variant.speedMult, visualScale: variant.visualScale, tint: variant.tint,
        boltDamageMult: variant.boltDamageMult, thief: variant.thief, wrecker: variant.wrecker,
        contactDamageScale: variant.contactDamageScale, buildingDamageScale: variant.buildingDamageScale,
      };
      window.__GR_TEST__?.spawnPack(3, 0.4, options);
    }
    window.__GR_TEST__?.advanceSim(0.4);
  });

  await expect.poll(() => page.evaluate((slots) => {
    window.__GR_TEST__?.advanceSim(0.08);
    return slots.every((slot) => {
      const animation = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[slot];
      return animation?.loaded === true && animation.frameCount === 4 && animation.frameKey.includes('walk4-a');
    });
  }, E2_SLOTS)).toBe(true);
  await expect.poll(() => page.evaluate((slots) => slots.every((slot) => (window.__THREE_GAME_DIAGNOSTICS__?.assetSprites[slot] ?? 0) > 0), E2_SLOTS)).toBe(true);

  const motion = await page.evaluate((slots) => {
    const start = window.__GR_TEST__?.enemyPositions() ?? [];
    const keys = Object.fromEntries(slots.map((slot) => [slot, new Set<string>()]));
    for (let step = 0; step < 8; step += 1) {
      window.__GR_TEST__?.advanceSim(0.08);
      for (const slot of slots) keys[slot]?.add(window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[slot]?.frameKey ?? '');
    }
    const end = window.__GR_TEST__?.enemyPositions() ?? [];
    return {
      moving: start.some((enemy) => {
        const next = end.find((candidate) => candidate.id === enemy.id);
        return next && Math.hypot(next.x - enemy.x, next.z - enemy.z) > 0.05;
      }),
      frameCounts: slots.map((slot) => keys[slot]?.size ?? 0),
      clips: slots.map((slot) => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[slot]?.clip),
    };
  }, E2_SLOTS);
  expect(motion.moving).toBe(true);
  expect(motion.frameCounts.every((count) => count > 1)).toBe(true);
  expect(motion.clips).toEqual(['walk', 'walk', 'walk']);

  for (const [name, dx, dz] of [['south', 0, -4], ['west', -4, 0], ['east', 4, 0], ['north', 0, 4]] as const) {
    await page.evaluate(([offsetX, offsetZ]) => {
      const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
      const x = enemies.reduce((sum, enemy) => sum + enemy.x, 0) / enemies.length;
      const z = enemies.reduce((sum, enemy) => sum + enemy.z, 0) / enemies.length;
      window.__GR_TEST__?.teleport(x + offsetX, z + offsetZ);
      window.__GR_TEST__?.advanceSim(0.45);
    }, [dx, dz] as const);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
  }
  expect(errors).toEqual([]);

  await page.goto('/?debug&contract=the-claim&nowaves&nolevel&nopause&nokill&seed=e1-walk4-control');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16 && window.__GR_TEST__);
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.spawnPack(2, 0.4, { speedScale: 1 });
    window.__GR_TEST__?.advanceSim(0.4);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base']?.loaded === true)).toBe(true);
  const e1 = await page.evaluate((slots) => ({
    jumper: window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base'],
    e2Rendered: slots.map((slot) => window.__THREE_GAME_DIAGNOSTICS__?.assetSprites[slot] ?? 0),
  }), E2_SLOTS);
  expect(e1.jumper?.frameKey).toContain('char-bandit-base-sheet-walk8');
  expect(e1.e2Rendered).toEqual([0, 0, 0]);
  expect(errors).toEqual([]);
});
