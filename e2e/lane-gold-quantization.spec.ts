import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { Economy, initialEconomyState, reduce, summarizeLog, type EconomyEvent } from '../src/game/Economy';
import { normalizeRunSuspendDatum } from '../src/game/RunSuspend';

test('the mint carries actor dust and unlocks an exact 30-cost purchase on the visible tick', () => {
  const split = new Economy();
  for (const event of [
    pan(1, 0.6),
    pan(2, 0.6, 'prospector'),
    pan(3, 0.4),
    pan(4, 0.4, 'prospector'),
  ]) expect(split.apply(event).ok).toBe(true);
  expect(split.gold).toBe(2);
  expect(split.state.goldDust).toBeUndefined();
  expect(summarizeLog(split.log)).toMatchObject({ panned: 2, pannedByProspector: 1 });

  const economy = new Economy();
  for (let index = 1; index <= 21; index += 1) expect(economy.apply(pan(index, 1.4)).ok).toBe(true);
  expect(economy.gold).toBe(29);
  expect(economy.apply(spend(22, 30))).toEqual({ ok: false, reason: 'OUT_OF_RESOURCES' });
  expect(economy.apply(pan(23, 1.4))).toEqual({ ok: true, gold: 30 });
  expect(economy.apply(spend(24, 30))).toEqual({ ok: true, gold: 0 });
  expect(economy.log.reduce(reduce, initialEconomyState)).toEqual(economy.state);
  expect(() => economy.apply(spend(25, 0.5))).toThrow('gold_spent amount must be an integer');
});

test('fractional seam yield keeps the HUD and state on whole coins', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/?debug&contract=e1-dry-gulch&timescale=2&nolevel&nowaves&seed=gold-quantization');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.evaluate(() => window.__GR_TEST__!.setBalance('goldSeam.tickGold', 1));
  await page.evaluate(() => window.__GR_TEST__!.setBalance('goldSeam.tickSeconds', 0.05));
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.find((entry) => entry.active)!);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), node.position);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold)).toBe(30);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('goldSeam.tickGold', 0));

  mkdirSync('artifacts/lane-gold-quantization', { recursive: true });
  await page.screenshot({ path: `artifacts/lane-gold-quantization/after-${testInfo.project.name}.png`, fullPage: false });
  const snapshot = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.gold,
    hud: document.querySelector<HTMLElement>('[data-hud-gold]')?.textContent ?? '',
    log: [...window.__GR_TEST__!.economyLog()],
    suspend: window.__GR_TEST__!.captureSuspend(),
  }));
  expect(Number.isInteger(snapshot.gold)).toBe(true);
  expect(snapshot.hud).toMatch(/^\d+(?:\/\d+)?$/);
  let replay = initialEconomyState;
  for (const event of snapshot.log as EconomyEvent[]) {
    replay = reduce(replay, event);
    expect(Number.isInteger(replay.gold)).toBe(true);
  }
  expect(replay.gold).toBe(snapshot.gold);
  const normalizedSuspend = normalizeRunSuspendDatum(snapshot.suspend);
  expect(normalizedSuspend?.economy.gold).toBe(snapshot.gold);
  expect(normalizedSuspend?.economy.goldDust).toEqual(replay.goldDust);
  expect(snapshot.hud).toBe('30');
  await page.evaluate(() => {
    window.__GR_TEST__!.setBalance('beacon.costBase', 30);
    window.__GR_TEST__!.teleport(0, 8);
    window.__GR_TEST__!.selectBuildable('sentry_beacon');
  });
  expect(await page.evaluate(() => window.__GR_TEST__!.confirmBuild(0, 8))).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold)).toBe(0);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

function pan(index: number, amount: number, actor?: 'prospector'): EconomyEvent {
  return { id: uuid(index), at: index, type: 'gold_panned', nodeId: `seam-${index}`, amount, ...(actor ? { actor } : {}) };
}

function spend(index: number, amount: number): EconomyEvent {
  return { id: uuid(index), at: index, type: 'gold_spent', sink: 'build_sentry_beacon', amount };
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}
